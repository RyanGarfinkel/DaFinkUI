'use client';

import { HTMLAttributes, KeyboardEvent, ReactNode, useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChartSource, Deck, DeckElement, ResolvedChart, SheetChoice, Slide } from './deck';
import { SLIDE_HEIGHT, SLIDE_WIDTH, duplicateSlide, linkChartSources, newId } from './deck';
import { EDITABLE_TYPES, GRID_SIZE, TOOL_LABELS, createFromDraw } from './elements';
import { askContext, selectedEditorText, type DeckAskContext } from './askcontext';
import { resolveTheme, themeStageStyle } from './themes';
import { SlideCanvas } from '../SlideCanvas/SlideCanvas';
import { createSlideFromLayout } from './layouts';
import { FormatToolbar } from './FormatToolbar';
import type { SlideActions } from './SlideRail';
import { ambientBackdrop } from './Ambient';
import { ElementView } from './ElementView';
import { InsertTools } from './InsertTools';
import { ThemePicker } from './ThemePicker';
import type { Editor } from '@tiptap/react';
import type { DrawTool } from './elements';
import { playTransition } from './effects';
import { ExportMenu } from './ExportMenu';
import { Highlight } from './Highlight';
import { SlideRail } from './SlideRail';
import { Presenter } from './Presenter';
import { AskButton } from './AskButton';
import { Inspector } from './Inspector';
import { Entrance } from './Entrance';
import { Menu } from '../Menu/Menu';
import { Glyph } from './icons';

export interface DeckEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	deck:                 Deck;
	/** Every edit, as the whole next deck. Changes sharing a `coalesceKey` in a row (a drag, typing) are one undo step. */
	onChange:             (next: Deck, coalesceKey?: string) => void;
	/** Omit `onUndo`/`onRedo` to hide the undo controls (e.g. when the host keeps no history). */
	onUndo?:              () => void;
	onRedo?:              () => void;
	canUndo?:             boolean;
	canRedo?:             boolean;
	/** Host actions in the top-right cluster, before Present (e.g. a save status and a file menu). */
	toolbarEnd?:          ReactNode;
	/** Elements someone else is editing right now: each gets a pulsing outline and a tag. */
	highlightIds?:        string[];
	highlightLabel?:      string;
	/** Controlled active slide, e.g. to follow another editor. Omit to manage it internally. */
	activeSlideId?:       string;
	onActiveSlideChange?: (slideId: string) => void;
	/** A host message for the status line (e.g. an export's progress). */
	status?:              string;
	/** Adds an "Ask AI" button beside the format toolbar. It reports the selected element, or the text highlighted inside one, so the host can send it to an agent. */
	onAsk?:               (context: DeckAskContext) => void;
	/** Spreadsheets a chart can take its data from. Give this with `resolveChartSource` to add a "Sheet" data option to the chart settings. */
	sheets?:              SheetChoice[];
	/** Reads a sourced chart's rows. Called on every render, so keep it cheap. Return null when the sheet or range can't be read. */
	resolveChartSource?:  (source: ChartSource) => ResolvedChart | null;
}

type Zoom = 'fit' | number;

const ZOOM_PRESETS = [0.5, 1, 2];
const ZOOM_STEP = 1.25;
const ZOOM_MIN = 0.25;
// Fit may go smaller than manual zoom: a phone-width editor needs about 21%.
const FIT_MIN = 0.1;
const ZOOM_MAX = 3;
// Fit mode's margins around the slide. The top margin is the floating toolbars'
// measured height plus a gap, since they wrap to two rows in narrow editors.
const FIT_PADDING = { x: 16, bottom: 16, belowToolbar: 8 };
const DEFAULT_TOOLBAR_HEIGHT = 56;
// Below this editor width (not window width), settings open in a drawer.
// From this editor width up, settings get their own column beside the slide (288px, leaving the slide at least ~230px).
// Below it there isn't room for both, so settings slide over the slide's right edge instead.
const WIDE_MIN = 520;
// Below this editor width the insert tools and the actions no longer fit on one row, so they share one bar instead of two.
const COMPACT_MAX = 560;

const BAR_CHROME = 'rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface p-1';

/** The toolbar's button style, for host actions passed in `toolbarEnd` to match. */
export const TOOLBAR_BUTTON = [
	'inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-[var(--radius-sm)] px-2 text-sm text-text',
	'hover:bg-surface-hover motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
	'disabled:opacity-40 disabled:pointer-events-none',
].join(' ');

const isTextInput = (target: EventTarget) =>
	target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const isEmptyText = (html: string) => !new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim();

/** A full slide deck editor. The host owns the deck and its undo history; see spec.md. */
export const DeckEditor = ({
	deck: authoredDeck, onChange, onUndo, onRedo, canUndo = false, canRedo = false, toolbarEnd, highlightIds = [], highlightLabel = 'AI',
	activeSlideId: controlledSlideId, onActiveSlideChange, status: hostStatus, onAsk, sheets, resolveChartSource, className = '', ...props
}: DeckEditorProps) => {
	const deck = useMemo(() => linkChartSources(authoredDeck, resolveChartSource), [authoredDeck, resolveChartSource]);
	const [internalSlideId, setInternalSlideId] = useState(deck.slides[0].id);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
	const [presenting, setPresenting] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [zoom, setZoom] = useState<Zoom>('fit');
	const [fitScale, setFitScale] = useState(0.5);
	const [ownStatus, setOwnStatus] = useState('');
	const [tool, setTool] = useState<DrawTool | null>(null);
	// Remounting an element's Entrance (new key) replays its effect in the editor.
	const [preview, setPreview] = useState<{ id: string; run: number } | null>(null);
	const [toolbarHeight, setToolbarHeight] = useState(DEFAULT_TOOLBAR_HEIGHT);
	const [wide, setWide] = useState(true);
	const [compact, setCompact] = useState(false);

	const rootRef = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<HTMLElement>(null);
	const toolbarRef = useRef<HTMLDivElement>(null);
	const presenterTriggerRef = useRef<HTMLElement | null>(null);
	const sidebarId = useId();

	const slide = deck.slides.find(s => s.id === (controlledSlideId ?? internalSlideId)) ?? deck.slides[0];
	const selected = slide.elements.find(el => el.id === selectedId) ?? null;
	const scale = zoom === 'fit' ? fitScale : zoom;
	const theme = resolveTheme(deck.theme, deck.customTheme);
	const stageStyle = themeStageStyle(theme);
	const topPadding = toolbarHeight + FIT_PADDING.belowToolbar;
	const highlights = new Set(highlightIds);
	const busySlides = deck.slides.filter(s => s.elements.some(el => highlights.has(el.id))).map(s => s.id);
	const status = hostStatus || ownStatus;

	useLayoutEffect(() =>
	{
		const root = rootRef.current;
		const viewport = viewportRef.current;
		const toolbar = toolbarRef.current;
		if(!root || !viewport || !toolbar) return;

		const measure = () => {
			const top = toolbar.offsetHeight + FIT_PADDING.belowToolbar;
			setWide(root.clientWidth >= WIDE_MIN);
			setCompact(root.clientWidth < COMPACT_MAX);
			setToolbarHeight(toolbar.offsetHeight);
			setFitScale(Math.max(FIT_MIN, Math.min(
				(viewport.clientWidth - FIT_PADDING.x * 2) / SLIDE_WIDTH,
				(viewport.clientHeight - top - FIT_PADDING.bottom) / SLIDE_HEIGHT,
			)));
		};
		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(root);
		observer.observe(viewport);
		observer.observe(toolbar);
		return () => observer.disconnect();
	}, []);

	const changeSlide = (update: (s: Slide) => Slide, coalesceKey?: string) =>
		onChange({ ...deck, slides: deck.slides.map(s => (s.id === slide.id ? update(s) : s)) }, coalesceKey && `${slide.id}:${coalesceKey}`);

	const setElements = (elements: DeckElement[], coalesceKey?: string) => changeSlide(s => ({ ...s, elements }), coalesceKey);

	const patchElement = (id: string, patch: Partial<DeckElement>, coalesceKey?: string) =>
		setElements(slide.elements.map(el => (el.id === id ? { ...el, ...patch } as DeckElement : el)), coalesceKey && `${id}:${coalesceKey}`);

	const goToSlide = (id: string) => {
		setInternalSlideId(id);
		onActiveSlideChange?.(id);
		setSelectedId(null);
		setEditingId(null);
	};

	const insertElement = (element: DeckElement) => {
		setElements([...slide.elements, element]);
		setSelectedId(element.id);
		setEditingId(element.type === 'text' ? element.id : null);
		setTool(null);
	};

	// A text box left empty when editing ends is removed, so a stray click with the
	// text tool doesn't leave an invisible box behind. Layout boxes (with a
	// placeholder) stay put even when empty, like slide-app placeholders.
	const changeEditing = (id: string | null) => {
		const previous = slide.elements.find(el => el.id === editingId);
		if(previous?.type === 'text' && !previous.placeholder && previous.id !== id && isEmptyText(previous.html))
		{
			setElements(slide.elements.filter(el => el.id !== previous.id));
			if(selectedId === previous.id) setSelectedId(null);
		}
		setEditingId(id);
	};

	const duplicateSelected = () => {
		if(!selected) return;
		const elements = [...slide.elements];
		const copy = { ...selected, id: newId(), x: selected.x + GRID_SIZE * 3, y: selected.y + GRID_SIZE * 3 };
		elements.splice(elements.indexOf(selected) + 1, 0, copy);
		setSelectedId(copy.id);
		setElements(elements);
	};

	const insertSlideAt = (index: number, next: Slide) => {
		onChange({ ...deck, slides: deck.slides.toSpliced(index, 0, next) });
		goToSlide(next.id);
	};

	const slideActions: SlideActions = {
		select:    goToSlide,
		reorder:   slides => onChange({ ...deck, slides }),
		addAt:     (index, layout = 'titleContent') => insertSlideAt(index, createSlideFromLayout(layout, { margin: theme.margin })),
		duplicate: id =>
		{
			const index = deck.slides.findIndex(s => s.id === id);
			insertSlideAt(index + 1, duplicateSlide(deck.slides[index]));
		},
		toggleSkip: id => onChange({ ...deck, slides: deck.slides.map(s => (s.id === id ? { ...s, skipped: !s.skipped } : s)) }),
		remove:    id =>
		{
			if(deck.slides.length <= 1) return;
			const index = deck.slides.findIndex(s => s.id === id);
			const slides = deck.slides.filter(s => s.id !== id);
			onChange({ ...deck, slides });
			if(id === slide.id) goToSlide(slides[Math.min(index, slides.length - 1)].id);
		},
	};

	// Skipped slides stay in the deck but are left out of the presentation.
	const presentedSlides = deck.slides.filter(s => !s.skipped);

	const stepZoom = (direction: 1 | -1) => {
		const next = direction > 0 ? scale * ZOOM_STEP : scale / ZOOM_STEP;
		setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(next * 100) / 100)));
	};

	const handleEditorChange = useCallback((editor: Editor, active: boolean) =>
		setActiveEditor(prev => (active ? editor : prev === editor ? null : prev)), []);

	const closePresenter = useCallback(() =>
	{
		setPresenting(false);
		requestAnimationFrame(() => presenterTriggerRef.current?.focus());
	}, []);

	const handleShortcut = (e: KeyboardEvent<HTMLDivElement>) => {
		if(tool && e.key === 'Escape')
		{
			setTool(null);
			return;
		}
		if(!(e.metaKey || e.ctrlKey) || isTextInput(e.target)) return;
		const key = e.key.toLowerCase();

		if(key === 'z' && onUndo && onRedo) (e.shiftKey ? onRedo : onUndo)();
		else if(key === 'y' && onRedo) onRedo();
		else if(key === 'd' && selected) duplicateSelected();
		else return;

		e.preventDefault();
	};

	// Rendered in the sidebar column when wide, or in a drawer in narrow editors.
	const inspector = (
		<Inspector
			slide={slide}
			themeRadius={theme.radius}
			sheets={resolveChartSource ? sheets : undefined}
			resolveChartSource={resolveChartSource}
			element={selected}
			onPatch={(patch, key) => selected && patchElement(selected.id, patch, key)}
			onSlide={(patch, key) => changeSlide(s => ({ ...s, ...patch }), key)}
			onPreviewTransition={() =>
			{
				// The frame, not the stage: the stage's own transform is its zoom scale.
				const viewport = viewportRef.current;
				const frame = viewport?.querySelector<HTMLElement>('[aria-roledescription="slide"]');
				if(!viewport || !frame) return;
				// Clipped while it plays, so a push doesn't flash scrollbars (which would re-fit the zoom).
				viewport.style.overflow = 'hidden';
				Promise.allSettled(playTransition(frame, null, slide.transition, 1).map(a => a.finished))
					.then(() => { viewport.style.overflow = ''; });
			}}
			onPreviewEntrance={() => selected && setPreview(p => ({ id: selected.id, run: (p?.run ?? 0) + 1 }))}
		/>
	);

	return (
		<div
			ref={rootRef}
			role='region'
			aria-label={`${deck.title} editor`}
			{...props}
			onKeyDown={handleShortcut}
			className={`flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel ${className}`}
		>
			<div
				className={[
					'grid min-h-0 flex-1',
					'relative motion-safe:transition-[grid-template-columns] motion-safe:duration-[var(--duration-base)] motion-safe:ease-[var(--ease-standard)]',
					// Wide editors give the settings their own column; narrow ones slide them over the slide area's right edge.
					!wide ? 'grid-cols-[minmax(0,1fr)]' : sidebarOpen ? 'grid-cols-[minmax(0,1fr)_288px]' : 'grid-cols-[minmax(0,1fr)_0px]',
				].join(' ')}
			>
				<div className='flex min-h-0 min-w-0 flex-col'>
					<div className='relative flex min-h-0 flex-1 flex-col'>
						<div ref={toolbarRef} className='pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start gap-2 p-2 sm:p-3 [&>*]:pointer-events-auto'>
							<div className={compact ? `flex w-fit max-w-full flex-wrap items-center gap-0.5 ${BAR_CHROME}` : 'contents'}>
							<InsertTools
								tool={tool}
								onToolChange={setTool}
								onInsert={insertElement}
								onError={setOwnStatus}
								buttonClass={TOOLBAR_BUTTON}
								bare={compact}
							/>

							<div className={compact ? 'contents' : `ml-auto flex max-w-full items-center gap-0.5 overflow-x-auto ${BAR_CHROME}`}>
								{onUndo && onRedo && (
									<>
										<button type='button' aria-label='Undo' title='Undo (⌘Z)' disabled={!canUndo} onClick={onUndo} className={TOOLBAR_BUTTON}>
											<Glyph name='undo' />
										</button>
										<button type='button' aria-label='Redo' title='Redo (⇧⌘Z)' disabled={!canRedo} onClick={onRedo} className={TOOLBAR_BUTTON}>
											<Glyph name='redo' />
										</button>
										<span aria-hidden='true' className='mx-1 h-5 w-px bg-surface-border' />
									</>
								)}
								{toolbarEnd}
								<ExportMenu deck={deck} onStatus={setOwnStatus} buttonClass={TOOLBAR_BUTTON} />
								<button
									type='button'
									aria-label='Present'
									title={presentedSlides.length ? 'Present' : 'Every slide is skipped'}
									disabled={!presentedSlides.length}
									onClick={e =>
									{
										presenterTriggerRef.current = e.currentTarget;
										setPresenting(true);
									}}
									className={TOOLBAR_BUTTON}
								>
									<Glyph name='play' />
								</button>
								<ThemePicker
									value={deck.theme}
									customTheme={deck.customTheme}
									onChange={(theme, customTheme, key) => onChange({ ...deck, theme, ...(customTheme ? { customTheme } : {}) }, key)}
									buttonClass={TOOLBAR_BUTTON}
								/>
								<button
									type='button'
									aria-label='Settings sidebar'
									title='Settings'
									aria-expanded={sidebarOpen}
									aria-controls={sidebarId}
									onClick={() => setSidebarOpen(open => !open)}
									className={`${TOOLBAR_BUTTON} ${sidebarOpen ? 'bg-surface-active' : ''}`}
								>
									<Glyph name='sliders' />
								</button>
								<span aria-hidden='true' className='mx-1 h-5 w-px bg-surface-border' />
								<Menu
									align='end'
									unstyledTrigger
									triggerClassName={`${TOOLBAR_BUTTON} tabular-nums`}
									triggerProps={{ 'aria-label': `Zoom, ${Math.round(scale * 100)}%` }}
									trigger={<>{Math.round(scale * 100)}%<Glyph name='chevronDown' className='text-text-muted' /></>}
									items={[
										{ label: 'Zoom in', disabled: scale >= ZOOM_MAX, onSelect: () => stepZoom(1) },
										{ label: 'Zoom out', disabled: scale <= ZOOM_MIN, onSelect: () => stepZoom(-1) },
										{ separator: true },
										{ label: 'Fit to window', selected: zoom === 'fit', onSelect: () => setZoom('fit') },
										...ZOOM_PRESETS.map(preset => ({ label: `${preset * 100}%`, selected: zoom === preset, onSelect: () => setZoom(preset) })),
									]}
								/>
							</div>
							</div>

							<p role='status' aria-live='polite' className='!pointer-events-none basis-full text-xs text-text-muted empty:hidden'>
								{tool ? `Drag on the slide to draw a ${TOOL_LABELS[tool].toLowerCase()}. Esc cancels.` : status}
							</p>
						</div>

						<section ref={viewportRef} aria-label='Slide canvas' className='min-h-0 flex-1 overflow-auto bg-surface-active'>
							<div className='flex min-h-full w-max min-w-full items-center justify-center' style={{ padding: `${topPadding}px ${FIT_PADDING.x}px ${FIT_PADDING.bottom}px` }}>
								<SlideCanvas
									key={slide.id}
									elements={slide.elements}
									onElementsChange={elements => setElements(elements, 'elements')}
									renderElement={(el, state) =>
									{
										let view = (
											<ElementView
												element={el}
												selected={state.selected}
												editing={state.editing}
												onChange={patch => patchElement(el.id, patch, 'content')}
												onEditorChange={handleEditorChange}
												showPlaceholders
											/>
										);
										if(preview?.id === el.id && !state.editing)
										{
											view = <Entrance key={preview.run} element={{ ...el, effect: el.effect && { ...el.effect, delay: 0 } }} baseDelay={0}>{view}</Entrance>;
										}
										return highlights.has(el.id) ? <Highlight label={highlightLabel}>{view}</Highlight> : view;
									}}
									renderToolbar={(el, state) =>
									{
										const ask = onAsk && (() => onAsk(askContext(slide, deck.slides.indexOf(slide) + 1, deck.slides.length, el, state.editing && el.type === 'text' ? selectedEditorText(activeEditor) : '')));
										// While the settings panel is open the format bar is hidden, so Ask AI stays on its own.
										if(sidebarOpen) return ask ? <AskButton onAsk={ask} /> : null;
										return (
											<FormatToolbar
												element={el}
												editor={el.type === 'text' ? activeEditor : null}
												onPatch={(patch, key) => patchElement(el.id, patch, key)}
												onMore={() => setSidebarOpen(true)}
												onAsk={ask}
											/>
										);
									}}
									width={SLIDE_WIDTH}
									height={SLIDE_HEIGHT}
									scale={scale}
									background={slide.background || undefined}
									backdrop={ambientBackdrop(slide.ambient)}
									stageStyle={stageStyle}
									gridSize={GRID_SIZE}
									selectedId={selectedId}
									onSelectedIdChange={setSelectedId}
									canEdit={el => EDITABLE_TYPES.includes(el.type)}
									editingId={editingId}
									onEditingIdChange={changeEditing}
									drawing={tool !== null}
									onDraw={(from, to) => tool && insertElement(createFromDraw(tool, from, to))}
									aria-label={`Slide ${deck.slides.indexOf(slide) + 1} of ${deck.slides.length}`}
								/>
							</div>
						</section>
					</div>

					<SlideRail slides={deck.slides} activeId={slide.id} actions={slideActions} stageStyle={stageStyle} busyIds={busySlides} />
				</div>

				<aside
					id={sidebarId}
					aria-label='Settings'
					inert={!sidebarOpen}
					className={[
						'min-h-0 min-w-0 overflow-hidden border-l border-surface-border',
						wide ? '' : [
							'absolute inset-y-0 right-0 z-20 w-72 max-w-[85%] bg-surface-panel shadow-[var(--shadow-lg)]',
							'motion-safe:transition-transform motion-safe:duration-[var(--duration-base)] motion-safe:ease-[var(--ease-standard)]',
							sidebarOpen ? 'translate-x-0' : 'translate-x-full',
						].join(' '),
					].join(' ')}
				>
					<div className={`h-full overflow-y-auto ${wide ? 'w-72' : 'w-full'}`}>{inspector}</div>
				</aside>
			</div>

			{presenting && <Presenter slides={presentedSlides} startIndex={0} stageStyle={stageStyle} onClose={closePresenter} />}
		</div>
	);
};

export default DeckEditor;
