'use client';

import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { CSSProperties, KeyboardEvent, useId, useState } from 'react';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { SlideCanvas } from '../SlideCanvas/SlideCanvas';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from './deck';
import type { MenuLeafEntry } from '../Menu/Menu';
import type { DragEndEvent } from '@dnd-kit/core';
import { LayoutPicker } from './LayoutPicker';
import { ElementView } from './ElementView';
import { ambientBackdrop } from './Ambient';
import type { LayoutId } from './layouts';
import { CSS } from '@dnd-kit/utilities';
import type { Slide } from './deck';
import { Glyph } from './icons';

export interface SlideActions {
	select:    (id: string) => void;
	reorder:   (slides: Slide[]) => void;
	addAt:     (index: number, layout?: LayoutId) => void;
	duplicate: (id: string) => void;
	toggleSkip: (id: string) => void;
	remove:    (id: string) => void;
}

interface SlideRailProps {
	slides:      Slide[];
	activeId:    string;
	actions:     SlideActions;
	stageStyle?: CSSProperties;
	/** Slides someone else is changing right now; each gets a pulsing dot. */
	busyIds?:    string[];
}

interface ThumbnailProps {
	hintId:    string;
	slide:     Slide;
	index:     number;
	active:    boolean;
	busy:      boolean;
	menu:      MenuLeafEntry[];
	onSelect:  () => void;
	onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
	stageStyle?: CSSProperties;
}

const ICON_BUTTON = [
	'inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-muted',
	'hover:bg-surface-hover hover:text-text motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
].join(' ');

const Thumbnail = ({ hintId, slide, index, active, busy, menu, onSelect, onKeyDown, stageStyle }: ThumbnailProps) => {
	// Pointer-only sortable: keyboard reordering is Alt+Arrow on the button
	// itself, so Enter and Space keep their normal "select this slide" meaning.
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });

	return (
		<li
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={`shrink-0 ${isDragging ? 'z-10 opacity-80' : ''}`}
		>
			<ContextMenu label={`Slide ${index + 1} actions`} items={menu} onOpenChange={open => open && onSelect()}>
				<button
					type='button'
					{...attributes}
					{...listeners}
					aria-roledescription={undefined}
					aria-describedby={hintId}
					aria-current={active ? 'true' : undefined}
					aria-label={`Slide ${index + 1}${slide.skipped ? ', skipped' : ''}${busy ? ', being edited' : ''}`}
					onClick={onSelect}
					onKeyDown={onKeyDown}
					className={[
						'relative block w-24 sm:w-36 rounded-[var(--radius)] cursor-pointer',
						'motion-safe:transition-[box-shadow,opacity] motion-safe:duration-[var(--duration-fast)]',
						active ? 'ring-2 ring-brand' : 'hover:ring-1 hover:ring-input-border-hover',
						'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
					].join(' ')}
				>
					<div aria-hidden='true' inert className={`pointer-events-none ${slide.skipped ? 'opacity-40' : ''}`}>
						<SlideCanvas
							elements={slide.elements}
							onElementsChange={() => {}}
							renderElement={el => <ElementView element={el} editing={false} onChange={() => {}} />}
							width={SLIDE_WIDTH}
							height={SLIDE_HEIGHT}
							background={slide.background || undefined}
							backdrop={ambientBackdrop(slide.ambient)}
							stageStyle={stageStyle}
							data-slide-id={slide.id}
							readOnly
							className='shadow-none'
						/>
					</div>
					<span
						aria-hidden='true'
						className={[
							'absolute bottom-1 left-1 flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5',
							'bg-surface/85 text-[11px] leading-none tabular-nums shadow-[var(--shadow-sm)] backdrop-blur-[var(--backdrop-blur)]',
							active ? 'font-semibold text-text' : 'text-text-muted',
						].join(' ')}
					>
						{index + 1}
						{slide.skipped && <Glyph name='eyeOff' size={11} />}
					</span>
					{busy && <span aria-hidden='true' className='absolute right-1 top-1 h-2 w-2 rounded-full bg-brand motion-safe:animate-pulse' />}
				</button>
			</ContextMenu>
		</li>
	);
};

export const SlideRail = ({ slides, activeId, actions, stageStyle, busyIds = [] }: SlideRailProps) => {
	const [announcement, setAnnouncement] = useState('');
	const [collapsed, setCollapsed] = useState(false);
	const dndContextId = useId();
	const hintId = `${dndContextId}-hint`;
	const listId = `${dndContextId}-list`;
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
	const activeIndex = Math.max(0, slides.findIndex(s => s.id === activeId));

	const move = (from: number, to: number) => {
		if(to < 0 || to >= slides.length) return;
		actions.reorder(arrayMove(slides, from, to));
		setAnnouncement(`Slide moved to position ${to + 1} of ${slides.length}`);
	};

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if(!over || active.id === over.id) return;
		move(slides.findIndex(s => s.id === active.id), slides.findIndex(s => s.id === over.id));
	};

	const focusSlide = (list: Element | null, index: number) =>
		requestAnimationFrame(() => list?.querySelectorAll<HTMLElement>(':scope > li button')[index]?.focus());

	const handleKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
		const delta = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 0;
		if(!delta) return;
		e.preventDefault();
		const list = e.currentTarget.closest('ol');

		if(e.altKey)
		{
			move(index, index + delta);
			focusSlide(list, index + delta);
			return;
		}

		const next = Math.min(slides.length - 1, Math.max(0, index + delta));
		actions.select(slides[next].id);
		focusSlide(list, next);
	};

	const menuFor = (slide: Slide, index: number): MenuLeafEntry[] => [
		{ label: 'Add slide before', onSelect: () => actions.addAt(index) },
		{ label: 'Add slide after', onSelect: () => actions.addAt(index + 1) },
		{ separator: true },
		{ label: 'Duplicate', onSelect: () => actions.duplicate(slide.id) },
		{ label: slide.skipped ? 'Unskip slide' : 'Skip slide', onSelect: () => actions.toggleSkip(slide.id) },
		{ separator: true },
		{ label: 'Move left', disabled: index === 0, onSelect: () => move(index, index - 1) },
		{ label: 'Move right', disabled: index === slides.length - 1, onSelect: () => move(index, index + 1) },
		{ separator: true },
		{ label: 'Delete slide', disabled: slides.length <= 1, onSelect: () => actions.remove(slide.id) },
	];

	return (
		<nav aria-label='Slides' className='border-t border-surface-border bg-surface-panel'>
			<div className='flex items-center justify-between px-3 pt-2'>
				<div className='flex items-center'>
					<button type='button' aria-label='Add slide' title='Add slide' onClick={() => actions.addAt(activeIndex + 1)} className={ICON_BUTTON}>
						<Glyph name='plus' />
					</button>
					<LayoutPicker onPick={layout => actions.addAt(activeIndex + 1, layout)} stageStyle={stageStyle} buttonClass={`${ICON_BUTTON} w-5`} />
				</div>
				<button
					type='button'
					aria-label={collapsed ? 'Show slides' : 'Hide slides'}
					title={collapsed ? 'Show slides' : 'Hide slides'}
					aria-expanded={!collapsed}
					aria-controls={listId}
					onClick={() => setCollapsed(c => !c)}
					className={ICON_BUTTON}
				>
					<Glyph name='chevronDown' className={`motion-safe:transition-transform motion-safe:duration-[var(--duration-base)] ${collapsed ? 'rotate-180' : ''}`} />
				</button>
			</div>

			<div
				id={listId}
				inert={collapsed}
				className={`grid motion-safe:transition-[grid-template-rows] motion-safe:duration-[var(--duration-base)] motion-safe:ease-[var(--ease-standard)] ${collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
			>
				<div className='min-h-0 overflow-hidden'>
					<DndContext id={dndContextId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
						<SortableContext items={slides.map(s => s.id)} strategy={horizontalListSortingStrategy}>
							<ol className='flex gap-3 overflow-x-auto px-4 pb-3 pt-1'>
								{slides.map((slide, i) => (
									<Thumbnail
										key={slide.id}
										hintId={hintId}
										slide={slide}
										index={i}
										active={slide.id === activeId}
										busy={busyIds.includes(slide.id)}
										menu={menuFor(slide, i)}
										onSelect={() => actions.select(slide.id)}
										onKeyDown={e => handleKey(e, i)}
										stageStyle={stageStyle}									/>
								))}
							</ol>
						</SortableContext>
					</DndContext>
				</div>
			</div>

			<span id={hintId} className='sr-only'>Arrow keys move between slides. Alt plus arrow keys reorders. Shift plus F10 opens slide actions.</span>
			<span role='status' aria-live='polite' className='sr-only'>{announcement}</span>
		</nav>
	);
};
