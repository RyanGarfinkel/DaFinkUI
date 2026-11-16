'use client';

import { HTMLAttributes, KeyboardEvent, PointerEvent, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { moveRect, resizeRect, snap, snapToGuides } from './geometry';
import type { Corner, Guides, Rect } from './geometry';

export interface SlidePoint {
	x: number;
	y: number;
}

export interface SlideElement extends Rect {
	id:    string;
	/** Accessible name announced for the element, e.g. "Title". */
	label: string;
}

export interface SlideElementState {
	selected: boolean;
	editing:  boolean;
}

export interface SlideCanvasProps<T extends SlideElement> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	elements:            T[];
	onElementsChange:    (elements: T[]) => void;
	renderElement:       (element: T, state: SlideElementState) => ReactNode;
	/** Floating toolbar shown above the selected element, at normal (unscaled) size. Return null for none. */
	renderToolbar?:      (element: T, state: SlideElementState) => ReactNode;
	/** Logical slide width in px. Element coordinates use this space. */
	width?:              number;
	/** Logical slide height in px. */
	height?:             number;
	/** Fixed zoom (1 = 100%). Omit to fit the container width. */
	scale?:              number;
	/** Reports the effective scale, e.g. to show a zoom percentage in fit mode. */
	onScaleChange?:      (scale: number) => void;
	/** Any CSS background for the slide stage. Defaults to the surface token. */
	background?:         string;
	/** Extra styles on the stage only (not the floating toolbar), e.g. CSS variables that theme the slide's content. */
	stageStyle?:         React.CSSProperties;
	/** Decorative layer rendered behind the elements, filling the stage (e.g. an ambient effect). Never interactive. */
	backdrop?:           ReactNode;
	/** Snap moves and resizes to this grid, in logical px. */
	gridSize?:           number;
	/** Snap pointer drags to the edges and centers of other elements and the slide. Hold Alt to bypass. */
	snapToElements?:     boolean;
	/** Controlled selection. Omit to let the canvas manage it. */
	selectedId?:         string | null;
	onSelectedIdChange?: (id: string | null) => void;
	/** Which elements can enter editing mode (double-click or Enter). Omit to disable editing. */
	canEdit?:            (element: T) => boolean;
	/** Controlled editing. Omit to let the canvas manage it. */
	editingId?:          string | null;
	onEditingIdChange?:  (id: string | null) => void;
	/** Draw mode: pointer drags anywhere on the slide draw a new region instead of moving elements. */
	drawing?:            boolean;
	/** Called when a draw-mode drag ends, with its start and end points in slide px (grid-snapped). */
	onDraw?:             (from: SlidePoint, to: SlidePoint) => void;
	readOnly?:           boolean;
}

interface DragState {
	id:      string;
	mode:    'move' | Corner;
	start:   Rect;
	current: Rect;
	clientX: number;
	clientY: number;
}

const CORNERS: Corner[] = ['nw', 'ne', 'sw', 'se'];

const CORNER_CLASSES: Record<Corner, string> = {
	nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
	ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
	sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
	se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
};

const ARROWS: Record<string, [number, number]> = {
	ArrowLeft:  [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp:    [0, -1],
	ArrowDown:  [0, 1],
};

const NO_GUIDES: Guides = { x: [], y: [] };

// Screen px, divided by the scale so snapping feels the same at every zoom.
const SNAP_THRESHOLD = 6;
const TOOLBAR_GAP = 8;
// Below this much room (screen px) above the element, the toolbar flips underneath it.
const TOOLBAR_FLIP = 52;

export const SlideCanvas = <T extends SlideElement>({
	elements,
	onElementsChange,
	renderElement,
	renderToolbar,
	width = 1280,
	height = 720,
	scale: fixedScale,
	onScaleChange,
	background,
	stageStyle,
	backdrop,
	gridSize,
	snapToElements = true,
	selectedId: controlledSelectedId,
	onSelectedIdChange,
	canEdit,
	editingId: controlledEditingId,
	onEditingIdChange,
	drawing = false,
	onDraw,
	readOnly = false,
	className = '',
	style,
	...props
}: SlideCanvasProps<T>) => {
	const [fitScale, setFitScale] = useState(1);
	const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
	const [internalEditingId, setInternalEditingId] = useState<string | null>(null);
	const [guides, setGuides] = useState<Guides>(NO_GUIDES);
	const [draft, setDraft] = useState<{ from: SlidePoint; to: SlidePoint } | null>(null);
	const [announcement, setAnnouncement] = useState('');

	const rootRef = useRef<HTMLDivElement>(null);
	const toolbarRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<DragState | null>(null);
	// Mirrors `draft`: pointerup can fire before the last pointermove's render lands.
	const draftRef = useRef<{ from: SlidePoint; to: SlidePoint } | null>(null);

	const scale = fixedScale ?? fitScale;
	const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
	const editingId = controlledEditingId !== undefined ? controlledEditingId : internalEditingId;
	const bounds = { width, height };

	useLayoutEffect(() =>
	{
		const root = rootRef.current;
		if(!root || fixedScale !== undefined) return;

		const measure = () => setFitScale(root.clientWidth / width || 1);
		measure();

		if(typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		return () => observer.disconnect();
	}, [width, fixedScale]);

	useEffect(() =>
	{
		onScaleChange?.(scale);
	}, [scale, onScaleChange]);

	const setEditing = (id: string | null) => {
		if(id === editingId) return;
		setInternalEditingId(id);
		onEditingIdChange?.(id);
	};

	const select = (id: string | null) => {
		if(id !== editingId) setEditing(null);
		if(id === selectedId) return;
		setInternalSelectedId(id);
		onSelectedIdChange?.(id);
	};

	const startEditing = (el: T) => {
		if(readOnly || !canEdit?.(el)) return;
		select(el.id);
		setEditing(el.id);
	};

	const focusElement = (id: string) => {
		rootRef.current?.querySelector<HTMLElement>(`[data-slide-element="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
	};

	const updateElement = (id: string, rect: Rect) => {
		onElementsChange(elements.map(el => (el.id === id ? { ...el, ...rect } : el)));
	};

	const announcePosition = (el: T, rect: Rect) => {
		setAnnouncement(`${el.label}: x ${Math.round(rect.x)}, y ${Math.round(rect.y)}, ${Math.round(rect.width)} by ${Math.round(rect.height)}`);
	};

	const toSlidePoint = (e: PointerEvent<HTMLElement>, stage: HTMLElement): SlidePoint => {
		const rect = stage.getBoundingClientRect();
		const point = (client: number, origin: number, max: number) => Math.min(max, Math.max(0, snap((client - origin) / scale, gridSize)));
		return { x: point(e.clientX, rect.left, width), y: point(e.clientY, rect.top, height) };
	};

	const handleStagePointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if(!drawing)
		{
			if(e.target === e.currentTarget) select(null);
			return;
		}
		if(readOnly || e.button !== 0) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		const point = toSlidePoint(e, e.currentTarget);
		draftRef.current = { from: point, to: point };
		setDraft(draftRef.current);
	};

	const handleStagePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		const current = draftRef.current;
		if(!current || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
		draftRef.current = { from: current.from, to: toSlidePoint(e, e.currentTarget) };
		setDraft(draftRef.current);
	};

	const handleStagePointerUp = () => {
		const finished = draftRef.current;
		if(!finished) return;
		draftRef.current = null;
		setDraft(null);
		onDraw?.(finished.from, finished.to);
	};

	const startDrag = (e: PointerEvent<HTMLElement>, el: T, mode: DragState['mode']) => {
		if(readOnly || drawing || e.button !== 0) return;
		if(mode === 'move' && el.id === editingId) return;
		e.preventDefault();
		e.stopPropagation();
		e.currentTarget.setPointerCapture(e.pointerId);
		focusElement(el.id);
		select(el.id);
		const start = { x: el.x, y: el.y, width: el.width, height: el.height };
		dragRef.current = { id: el.id, mode, start, current: start, clientX: e.clientX, clientY: e.clientY };
	};

	const handleDragMove = (e: PointerEvent<HTMLElement>) => {
		const drag = dragRef.current;
		if(!drag || !e.currentTarget.hasPointerCapture(e.pointerId)) return;

		const dx = (e.clientX - drag.clientX) / scale;
		const dy = (e.clientY - drag.clientY) / scale;
		let rect = drag.mode === 'move'
			? moveRect(drag.start, dx, dy, bounds, gridSize)
			: resizeRect(drag.start, drag.mode, dx, dy, bounds, gridSize);

		if(snapToElements && !e.altKey)
		{
			const others = elements.filter(el => el.id !== drag.id);
			const snapped = snapToGuides(rect, drag.mode, others, bounds, SNAP_THRESHOLD / scale);
			rect = drag.mode === 'move' ? moveRect(snapped.rect, 0, 0, bounds) : snapped.rect;
			setGuides(snapped.guides);
		}
		else setGuides(NO_GUIDES);

		drag.current = rect;
		updateElement(drag.id, rect);
	};

	// Reads the rect from the ref: the last pointermove's re-render may not have
	// landed yet, so `el` from this render's closure can still be pre-drag.
	const endDrag = (el: T) => {
		const drag = dragRef.current;
		if(!drag) return;
		dragRef.current = null;
		setGuides(NO_GUIDES);
		announcePosition(el, drag.current);
	};

	const handleElementKey = (e: KeyboardEvent<HTMLDivElement>, el: T) => {
		if(readOnly) return;

		if(e.altKey && e.key === 'F10')
		{
			const first = toolbarRef.current?.querySelector<HTMLElement>('button, input, [tabindex]:not([tabindex="-1"])');
			if(!first) return;
			e.preventDefault();
			first.focus();
			return;
		}

		if(el.id === editingId)
		{
			if(e.key !== 'Escape') return;
			setEditing(null);
			e.currentTarget.focus({ preventScroll: true });
			return;
		}

		if(e.target !== e.currentTarget) return;

		if(e.key === 'Escape')
		{
			select(null);
			return;
		}

		if(e.key === 'Enter' && canEdit?.(el))
		{
			e.preventDefault();
			startEditing(el);
			return;
		}

		if(e.key === 'Delete' || e.key === 'Backspace')
		{
			e.preventDefault();
			onElementsChange(elements.filter(item => item.id !== el.id));
			select(null);
			setAnnouncement(`${el.label} deleted`);
			return;
		}

		const direction = ARROWS[e.key];
		if(!direction) return;
		e.preventDefault();

		const step = gridSize ?? (e.shiftKey ? 10 : 1);
		const [dx, dy] = [direction[0] * step, direction[1] * step];
		const rect = e.altKey
			? resizeRect(el, 'se', dx, dy, bounds, gridSize)
			: moveRect(el, dx, dy, bounds, gridSize);

		updateElement(el.id, rect);
		announcePosition(el, rect);
	};

	const selectedElement = readOnly ? undefined : elements.find(el => el.id === selectedId);
	const toolbar = selectedElement && renderToolbar?.(selectedElement, { selected: true, editing: selectedElement.id === editingId });

	const toolbarStyle = (el: T): React.CSSProperties => {
		const above = el.y * scale >= TOOLBAR_FLIP;
		const inRightHalf = el.x + el.width / 2 > width / 2;
		return {
			top:       above ? el.y * scale - TOOLBAR_GAP : (el.y + el.height) * scale + TOOLBAR_GAP,
			transform: above ? 'translateY(-100%)' : undefined,
			...(inRightHalf ? { right: (width - el.x - el.width) * scale } : { left: el.x * scale }),
		};
	};

	return (
		<div
			ref={rootRef}
			role='group'
			aria-roledescription='slide'
			aria-label='Slide'
			{...props}
			className={`relative ${fixedScale === undefined ? 'w-full' : 'shrink-0'} ${className}`}
			style={{ aspectRatio: `${width} / ${height}`, width: fixedScale === undefined ? undefined : width * fixedScale, ...style }}
		>
			<div className='absolute inset-0 overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border shadow-[var(--shadow)]'>
				<div
					data-slide-stage
					onPointerDown={handleStagePointerDown}
					onPointerMove={handleStagePointerMove}
					onPointerUp={handleStagePointerUp}
					onPointerCancel={() =>
					{
						draftRef.current = null;
						setDraft(null);
					}}
					className={`absolute left-0 top-0 origin-top-left bg-surface ${drawing ? 'cursor-crosshair touch-none [&_*]:!cursor-crosshair' : ''}`}
					style={{
						...stageStyle,
						width,
						height,
						background,
						transform:                    `scale(${scale})`,
						['--slide-scale' as string]: scale,
					} as React.CSSProperties}
				>
					{backdrop && (
						<div data-slide-backdrop aria-hidden='true' className='pointer-events-none absolute inset-0'>
							{backdrop}
						</div>
					)}

					{elements.map(el => {
						const selected = el.id === selectedId;
						const editing = el.id === editingId;
						return (
							<div
								key={el.id}
								data-slide-element={el.id}
								role={editing ? 'group' : 'button'}
								aria-roledescription='slide element'
								aria-label={el.label}
								aria-pressed={editing ? undefined : selected}
								tabIndex={readOnly ? -1 : 0}
								onFocus={() => select(el.id)}
								onKeyDown={e => handleElementKey(e, el)}
								onDoubleClick={() => startEditing(el)}
								onPointerDown={e => startDrag(e, el, 'move')}
								onPointerMove={handleDragMove}
								onPointerUp={() => endDrag(el)}
								onPointerCancel={() => endDrag(el)}
								className={[
									'absolute rounded-[var(--radius-sm)] outline-offset-2',
									editing ? 'cursor-auto' : 'touch-none',
									readOnly || editing ? '' : 'cursor-move',
									selected
										? 'outline outline-2 outline-brand'
										: readOnly ? '' : 'hover:outline hover:outline-1 hover:outline-input-border-hover',
									'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
								].join(' ')}
								style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
							>
								<div className={`h-full w-full ${editing ? '' : 'pointer-events-none select-none'}`}>
									{renderElement(el, { selected, editing })}
								</div>

								{selected && !editing && !readOnly && CORNERS.map(corner => (
									<span
										key={corner}
										aria-hidden='true'
										data-corner={corner}
										onPointerDown={e => startDrag(e, el, corner)}
										onPointerMove={handleDragMove}
										onPointerUp={() => endDrag(el)}
										onPointerCancel={() => endDrag(el)}
										// Fingers need a bigger target than a mouse: 44px hit areas (and larger dots) on coarse pointers.
										className={[
											'absolute flex touch-none items-center justify-center',
											'[--handle-dot:10px] [--handle-hit:24px] [@media(pointer:coarse)]:[--handle-dot:14px] [@media(pointer:coarse)]:[--handle-hit:44px]',
											CORNER_CLASSES[corner],
										].join(' ')}
										style={{ width: 'calc(var(--handle-hit) / var(--slide-scale))', height: 'calc(var(--handle-hit) / var(--slide-scale))' }}
									>
										<span
											className='rounded-[2px] border-[length:var(--border-width)] border-brand bg-surface'
											style={{ width: 'calc(var(--handle-dot) / var(--slide-scale))', height: 'calc(var(--handle-dot) / var(--slide-scale))' }}
										/>
									</span>
								))}
							</div>
						);
					})}

					{/* Guides use the danger color: vivid in every theme, like slide apps' red alignment guides. */}
					{draft && (
						<span
							data-draft
							aria-hidden='true'
							className='pointer-events-none absolute rounded-[2px] border-dashed border-brand bg-brand/5'
							style={{
								left:        Math.min(draft.from.x, draft.to.x),
								top:         Math.min(draft.from.y, draft.to.y),
								width:       Math.abs(draft.to.x - draft.from.x),
								height:      Math.abs(draft.to.y - draft.from.y),
								borderWidth: 'calc(1px / var(--slide-scale))',
							}}
						/>
					)}

					{guides.x.map(x => (
						<span key={`x${x}`} data-guide='x' aria-hidden='true' className='pointer-events-none absolute top-0 h-full bg-danger' style={{ left: x, width: 'calc(1px / var(--slide-scale))' }} />
					))}
					{guides.y.map(y => (
						<span key={`y${y}`} data-guide='y' aria-hidden='true' className='pointer-events-none absolute left-0 w-full bg-danger' style={{ top: y, height: 'calc(1px / var(--slide-scale))' }} />
					))}
				</div>
			</div>

			{toolbar && selectedElement && (
				<div
					ref={toolbarRef}
					onKeyDown={e =>
					{
						if(e.key !== 'Escape') return;
						e.stopPropagation();
						focusElement(selectedElement.id);
					}}
					className='absolute z-20'
					style={toolbarStyle(selectedElement)}
				>
					{toolbar}
				</div>
			)}

			<span role='status' aria-live='polite' className='sr-only'>{announcement}</span>
		</div>
	);
};

export default SlideCanvas;
