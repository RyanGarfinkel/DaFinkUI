'use client';

import { HTMLAttributes, KeyboardEvent, PointerEvent, createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

export type ResizableDirection = 'horizontal' | 'vertical';

const DEFAULT_MIN_SIZE_PX = 120;
const STEP_PX = 16;
const LARGE_STEP_PX = 64;

interface ResizablePanelEntry {
	minSize:    number;
	maxSize?:   number;
	sized:      boolean;
	getSize:    () => number;
	commitSize: (size: number) => void;
}

interface ResizableContextValue {
	direction:       ResizableDirection;
	registerPanel:   (id: string, entry: ResizablePanelEntry) => void;
	unregisterPanel: (id: string) => void;
	getPanel:        (id: string) => ResizablePanelEntry | undefined;
}

const ResizableContext = createContext<ResizableContextValue | null>(null);

const useResizableContext = () => {
	const ctx = useContext(ResizableContext);
	if(!ctx) throw new Error('ResizablePanel and ResizableHandle must be used inside Resizable');
	return ctx;
};

export interface ResizableProps extends HTMLAttributes<HTMLDivElement> {
	direction: ResizableDirection;
}

export const Resizable = ({ direction, className = '', children, ...props }: ResizableProps) => {
	const panelsRef = useRef<Map<string, ResizablePanelEntry>>(new Map());

	const registerPanel = useCallback((id: string, entry: ResizablePanelEntry) => {
		panelsRef.current.set(id, entry);
	}, []);

	const unregisterPanel = useCallback((id: string) => {
		panelsRef.current.delete(id);
	}, []);

	const getPanel = useCallback((id: string) => panelsRef.current.get(id), []);

	return (
		<ResizableContext.Provider value={{ direction, registerPanel, unregisterPanel, getPanel }}>
			<div
				{...props}
				className={[
					'flex',
					direction === 'horizontal' ? 'flex-row' : 'flex-col',
					className,
				].filter(Boolean).join(' ')}
			>
				{children}
			</div>
		</ResizableContext.Provider>
	);
};

export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
	defaultSize?: number;
	minSize?:     number;
	maxSize?:     number;
}

// A group is expected to have at most one flexible (no defaultSize) panel in practice — a
// handle only ever resizes the sized panel on one of its two sides, and the flexible panel
// just absorbs whatever space is left — but nothing here enforces a single flexible panel.
export const ResizablePanel = (
	{
		defaultSize, minSize = DEFAULT_MIN_SIZE_PX, maxSize,
		className = '', children, style, ...props
	}: ResizablePanelProps
) => {
	const { direction, registerPanel, unregisterPanel } = useResizableContext();
	const id       = useId();
	const sized    = defaultSize !== undefined;
	const [size, setSize] = useState(defaultSize ?? 0);
	const sizeRef  = useRef(size);

	useEffect(() => {
		sizeRef.current = size;
	}, [size]);

	const getSize    = useCallback(() => sizeRef.current, []);
	const commitSize = useCallback((next: number) => setSize(next), []);

	// A layout effect (not a passive one) so every panel is registered before ResizableHandle's
	// own mount effect (a passive effect) runs — otherwise a handle whose target is a *later*
	// sibling panel (declared after it in JSX) could read an unregistered panel on first mount.
	useLayoutEffect(() => {
		registerPanel(id, { minSize, maxSize, sized, getSize, commitSize });
		return () => unregisterPanel(id);
	}, [id, minSize, maxSize, sized, getSize, commitSize, registerPanel, unregisterPanel]);

	const sizeStyle = sized
		? direction === 'horizontal'
			? { width: `${size}px`, flexGrow: 0, flexShrink: 0 }
			: { height: `${size}px`, flexGrow: 0, flexShrink: 0 }
		: undefined;

	return (
		<div
			{...props}
			data-resizable-panel-id={id}
			data-sized={sized || undefined}
			style={{ ...sizeStyle, ...style }}
			className={[
				'overflow-hidden',
				sized ? '' : direction === 'horizontal' ? 'min-w-0 flex-1' : 'min-h-0 flex-1',
				className,
			].filter(Boolean).join(' ')}
		>
			{children}
		</div>
	);
};

export interface ResizableHandleProps extends HTMLAttributes<HTMLDivElement> {
	'aria-label'?: string;
}

interface DragTarget {
	id:      string;
	entry:   ResizablePanelEntry;
	element: HTMLElement;
	// +1 when the sized panel is the handle's previous sibling (dragging away from it grows
	// it); -1 when it's the next sibling (dragging toward it grows it, since it sits on the
	// far side of the handle).
	sign:    1 | -1;
}

interface DragState {
	pointerId: number;
	startX:    number;
	startY:    number;
	startSize: number;
	target:    DragTarget;
}

export const ResizableHandle = ({ className = '', 'aria-label': ariaLabel = 'Resize panel', ...props }: ResizableHandleProps) => {
	const { direction, getPanel } = useResizableContext();
	const handleRef = useRef<HTMLDivElement>(null);
	const dragRef   = useRef<DragState | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [displaySize, setDisplaySize] = useState<number | null>(null);
	const [bounds, setBounds] = useState<{ min: number; max?: number } | null>(null);

	const findTarget = useCallback((): DragTarget | null => {
		const handle = handleRef.current;
		if(!handle) return null;

		const prev      = handle.previousElementSibling as HTMLElement | null;
		const prevId    = prev?.dataset.resizablePanelId;
		const prevEntry = prevId ? getPanel(prevId) : undefined;
		if(prev && prevId && prevEntry?.sized) return { id: prevId, entry: prevEntry, element: prev, sign: 1 };

		const next      = handle.nextElementSibling as HTMLElement | null;
		const nextId    = next?.dataset.resizablePanelId;
		const nextEntry = nextId ? getPanel(nextId) : undefined;
		if(next && nextId && nextEntry?.sized) return { id: nextId, entry: nextEntry, element: next, sign: -1 };

		return null;
	}, [getPanel]);

	useEffect(() => {
		const target = findTarget();
		if(target)
		{
			// Reads the target panel's initial size/bounds from the shared registry (an external
			// system relative to this component) once its DOM siblings exist to inspect.
			// eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the sibling panel registry on mount, not a reactive loop
			setDisplaySize(target.entry.getSize());
			setBounds({ min: target.entry.minSize, max: target.entry.maxSize });
		}
	}, [findTarget]);

	const applySize = (target: DragTarget, next: number) => {
		const max     = target.entry.maxSize ?? Infinity;
		const clamped = Math.min(Math.max(next, target.entry.minSize), max);
		if(direction === 'horizontal') target.element.style.width  = `${clamped}px`;
		else                            target.element.style.height = `${clamped}px`;
		return clamped;
	};

	const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
		const target = findTarget();
		if(!target) return;

		dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startSize: target.entry.getSize(), target };
		setIsDragging(true);
		handleRef.current?.setPointerCapture(e.pointerId);
		document.body.style.cursor     = direction === 'horizontal' ? 'col-resize' : 'row-resize';
		document.body.style.userSelect = 'none';
	};

	const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		if(!drag || drag.pointerId !== e.pointerId) return;

		const delta       = direction === 'horizontal' ? e.clientX - drag.startX : e.clientY - drag.startY;
		const signedDelta = drag.target.sign * delta;
		applySize(drag.target, drag.startSize + signedDelta);
	};

	const endDrag = (e: PointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		if(!drag || drag.pointerId !== e.pointerId) return;

		const delta       = direction === 'horizontal' ? e.clientX - drag.startX : e.clientY - drag.startY;
		const signedDelta = drag.target.sign * delta;
		const clamped     = applySize(drag.target, drag.startSize + signedDelta);

		drag.target.entry.commitSize(clamped);
		setDisplaySize(clamped);
		setBounds({ min: drag.target.entry.minSize, max: drag.target.entry.maxSize });
		dragRef.current = null;
		setIsDragging(false);
		handleRef.current?.releasePointerCapture(e.pointerId);
		document.body.style.cursor     = '';
		document.body.style.userSelect = '';
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const target = findTarget();
		if(!target) return;

		const increaseKey = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
		const decreaseKey = direction === 'horizontal' ? 'ArrowLeft'  : 'ArrowUp';
		const step        = e.shiftKey ? LARGE_STEP_PX : STEP_PX;
		const current     = target.entry.getSize();

		let next: number | null = null;
		if(e.key === increaseKey)                                      next = current + target.sign * step;
		else if(e.key === decreaseKey)                                 next = current - target.sign * step;
		else if(e.key === 'Home')                                      next = target.entry.minSize;
		else if(e.key === 'End' && target.entry.maxSize !== undefined) next = target.entry.maxSize;
		else return;

		e.preventDefault();
		const clamped = applySize(target, next);
		target.entry.commitSize(clamped);
		setDisplaySize(clamped);
		setBounds({ min: target.entry.minSize, max: target.entry.maxSize });
	};

	// Plain hover only ever changes the cursor (col/row-resize below) — the line and knob
	// change color for the two states that actually matter: focused (group-focus-within,
	// covers Tab and a plain click on the knob alike) and actively dragging (isDragging).
	return (
		<div
			ref={handleRef}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={endDrag}
			onPointerCancel={endDrag}
			className={[
				'group relative shrink-0',
				direction === 'horizontal' ? 'w-4 cursor-col-resize' : 'h-4 cursor-row-resize',
			].join(' ')}
		>
			<span
				aria-hidden='true'
				className={[
					'absolute rounded-full motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
					isDragging ? 'bg-brand' : 'bg-surface-border group-focus-within:bg-brand',
					direction === 'horizontal'
						? 'left-1/2 top-0 h-full w-px -translate-x-1/2 cursor-col-resize'
						: 'top-1/2 left-0 h-px w-full -translate-y-1/2 cursor-row-resize',
				].join(' ')}
			/>
			<div
				{...props}
				role='separator'
				aria-orientation={direction}
				aria-label={ariaLabel}
				aria-valuenow={displaySize ?? undefined}
				aria-valuemin={bounds?.min}
				aria-valuemax={bounds?.max}
				tabIndex={0}
				onKeyDown={handleKeyDown}
				className={[
					'absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring focus-visible:[--tw-ring-offset-color:var(--color-surface)]',
					'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
					isDragging ? 'bg-brand' : 'bg-surface-border group-focus-within:bg-brand',
					direction === 'horizontal' ? 'h-6 w-1 cursor-col-resize' : 'h-1 w-6 cursor-row-resize',
					className,
				].join(' ')}
			/>
		</div>
	);
};

export default Resizable;
