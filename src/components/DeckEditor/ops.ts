import type { Deck, DeckElement, ElementEffect, ElementType, Slide, SlideTransition } from './deck';
import { AMBIENT_OPTIONS, EFFECT_OPTIONS, TRANSITION_OPTIONS } from './effects';
import { FONTS, THEMES, customFromTheme, resolveTheme } from './themes';
import type { CustomTheme, ThemeColors, ThemeId } from './themes';
import { TEXT_STYLE_IDS, textStyleFields } from './textstyles';
import { LAYOUTS, createSlideFromLayout } from './layouts';
import type { LayoutId } from './layouts';
import { VERTICAL_ALIGNS } from './deck';
import { checkSvg } from './svg';

/** A slide patch. `transition` merges into the slide's current one, so `{ transition: { type: 'fade' } }` keeps its duration. */
export type SlidePatch = Partial<Omit<Slide, 'id' | 'elements' | 'transition'>> & { transition?: Partial<SlideTransition> };

/** An element patch. `effect` merges into the element's current one; `effect: undefined` clears it. */
export type ElementPatch = (DeckElement extends infer E ? (E extends unknown ? Omit<Partial<E>, 'effect'> : never) : never) & { effect?: Partial<ElementEffect> };

/**
 * Every structural change to a deck, as data. Editors, scripted demos, an API,
 * or an agent's tool calls all describe edits this way and apply them with
 * `applyOp`, so there's one validated path for changing a deck.
 */
export type DeckOp =
	| { type: 'addSlide';      slide: Slide; index?: number }
	| { type: 'removeSlide';   slideId: string }
	| { type: 'updateSlide';   slideId: string; patch: SlidePatch }
	/** Apply one patch to several slides at once (every slide when `slideIds` is omitted), e.g. a transition for the whole deck. */
	| { type: 'updateSlides';  slideIds?: string[]; patch: SlidePatch }
	| { type: 'moveSlide';     slideId: string; index: number }
	| { type: 'addElement';    slideId: string; element: DeckElement; index?: number }
	| { type: 'updateElement'; slideId: string; elementId: string; patch: ElementPatch }
	/** Apply one patch to every matching element (all slides, all types, when the filters are omitted), e.g. an entrance for every title. */
	| { type: 'updateElements'; slideIds?: string[]; elementType?: ElementType; patch: ElementPatch }
	| { type: 'removeElement'; slideId: string; elementId: string }
	/** A slide from a layout (title, titleContent, …) using the deck theme's margin. Its elements get ids `<slideId>:title`, `<slideId>:body`, … so later ops can fill them. */
	| { type: 'addSlideFromLayout'; layout: LayoutId; slideId: string; index?: number }
	| { type: 'setTheme';      theme: ThemeId; customTheme?: CustomTheme }
	/** Tweak the current theme: switches the deck to a custom theme seeded from the current one, then merges `patch` (colors merge per slot). */
	| { type: 'updateTheme';   patch: Partial<Omit<CustomTheme, 'colors'>> & { colors?: Partial<ThemeColors> } }
	| { type: 'setTitle';      title: string };

export class DeckOpError extends Error
{
	public constructor(message: string)
	{
		super(message);
		this.name = 'DeckOpError';
	}
}

const findSlide = (deck: Deck, slideId: string) => {
	const index = deck.slides.findIndex(s => s.id === slideId);
	if(index < 0) throw new DeckOpError(`No slide with id "${slideId}".`);
	return index;
};

const findElement = (slide: Slide, elementId: string) => {
	const index = slide.elements.findIndex(el => el.id === elementId);
	if(index < 0) throw new DeckOpError(`No element with id "${elementId}" on slide "${slide.id}".`);
	return index;
};

const oneOf = (label: string, value: unknown, allowed: readonly string[]) => {
	if(!allowed.includes(value as string)) throw new DeckOpError(`Invalid ${label} "${String(value)}". Use one of: ${allowed.join(', ')}.`);
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const COLOR_SLOTS = ['background', 'surface', 'border', 'text', 'muted', 'accent'];

const checkSlidePatch = (patch: SlidePatch) => {
	if(patch.transition?.type !== undefined) oneOf('transition type', patch.transition.type, TRANSITION_OPTIONS.map(o => o.value));
	if(patch.ambient !== undefined) oneOf('ambient', patch.ambient, AMBIENT_OPTIONS.map(o => o.value));
	const duration = patch.transition?.duration;
	if(duration !== undefined && (!Number.isFinite(duration) || duration < 0)) throw new DeckOpError('Transition duration must be a number of milliseconds, 0 or more.');
};

const checkElementPatch = (patch: ElementPatch, type?: ElementType) => {
	if(patch.effect?.type !== undefined)
	{
		oneOf('effect type', patch.effect.type, EFFECT_OPTIONS.filter(o => !o.textOnly || !type || type === 'text').map(o => o.value));
	}
	if(patch.effect?.delay !== undefined && (!Number.isFinite(patch.effect.delay) || patch.effect.delay < 0)) throw new DeckOpError('Effect delay must be a number of milliseconds, 0 or more.');
	if('font' in patch && patch.font !== undefined) oneOf('font', patch.font, Object.keys(FONTS));
	if('style' in patch && patch.style !== undefined) oneOf('text style', patch.style, TEXT_STYLE_IDS);
	if('valign' in patch && patch.valign !== undefined) oneOf('vertical alignment', patch.valign, VERTICAL_ALIGNS);
	if('svg' in patch && patch.svg !== undefined)
	{
		const problem = checkSvg(patch.svg);
		if(problem) throw new DeckOpError(`Invalid svg: ${problem}`);
	}
};

/** Validates a new element, and fills a text style's size, weight, and color wherever the element doesn't set them. */
const prepareNewElement = (element: DeckElement): DeckElement => {
	checkElementPatch(element, element.type);
	return element.type === 'text' && element.style ? { ...textStyleFields(element.style), ...element } : element;
};

const checkTheme = (theme: ThemeId, custom: CustomTheme | undefined) => {
	oneOf('theme', theme, ['custom', ...THEMES.map(t => t.id)]);
	if(!custom) return;
	COLOR_SLOTS.forEach(slot =>
	{
		const value = (custom.colors as unknown as Record<string, string> | undefined)?.[slot];
		if(!HEX.test(value ?? '')) throw new DeckOpError(`customTheme.colors.${slot} must be a #rgb or #rrggbb color, got "${String(value)}". Slots: ${COLOR_SLOTS.join(', ')}.`);
	});
	if(custom.font !== undefined) oneOf('customTheme.font', custom.font, Object.keys(FONTS));
	if(custom.headingFont !== undefined) oneOf('customTheme.headingFont', custom.headingFont, Object.keys(FONTS));
	if(custom.radius !== undefined && !(custom.radius >= 0 && custom.radius <= 200)) throw new DeckOpError('customTheme.radius must be 0 to 200 (px).');
	if(custom.margin !== undefined && !(custom.margin >= 0 && custom.margin <= 300)) throw new DeckOpError('customTheme.margin must be 0 to 300 (px).');
};

const mergeSlide = (slide: Slide, patch: SlidePatch): Slide => {
	checkSlidePatch(patch);
	return { ...slide, ...patch, transition: { ...slide.transition, ...patch.transition } };
};

const mergeElement = (current: DeckElement, patch: ElementPatch): DeckElement => {
	if(patch.type && patch.type !== current.type) throw new DeckOpError(`Can't change element "${current.id}" from ${current.type} to ${patch.type}.`);
	checkElementPatch(patch, current.type);
	const { effect, ...rest } = patch;
	const styled = 'style' in rest && rest.style ? textStyleFields(rest.style) : {};
	const merged = { ...current, ...styled, ...rest, id: current.id } as DeckElement;
	if('effect' in patch) merged.effect = effect && { type: 'none', delay: 0, ...current.effect, ...effect };
	return merged;
};

const targetSlides = (deck: Deck, slideIds: string[] | undefined) => {
	slideIds?.forEach(id => findSlide(deck, id));
	return deck.slides.filter(s => !slideIds || slideIds.includes(s.id)).map(s => s.id);
};

const clampIndex = (index: number | undefined, length: number) =>
	(index === undefined ? length : Math.min(length, Math.max(0, index)));

const withSlide = (deck: Deck, slideId: string, update: (slide: Slide) => Slide): Deck => {
	const index = findSlide(deck, slideId);
	return { ...deck, slides: deck.slides.with(index, update(deck.slides[index])) };
};

/** Returns a new deck with `op` applied; the input is never mutated. Throws `DeckOpError` on unknown ids or duplicates. */
export const applyOp = (deck: Deck, op: DeckOp): Deck => {
	switch(op.type)
	{
	case 'addSlide':
		if(deck.slides.some(s => s.id === op.slide.id)) throw new DeckOpError(`A slide with id "${op.slide.id}" already exists.`);
		return { ...deck, slides: deck.slides.toSpliced(clampIndex(op.index, deck.slides.length), 0, { ...op.slide, elements: op.slide.elements.map(prepareNewElement) }) };

	case 'removeSlide': {
		const index = findSlide(deck, op.slideId);
		if(deck.slides.length === 1) throw new DeckOpError('A deck needs at least one slide.');
		return { ...deck, slides: deck.slides.toSpliced(index, 1) };
	}

	case 'updateSlide':
		return withSlide(deck, op.slideId, slide => mergeSlide(slide, op.patch));

	case 'updateSlides': {
		const ids = targetSlides(deck, op.slideIds);
		return ids.reduce((current, slideId) => withSlide(current, slideId, slide => mergeSlide(slide, op.patch)), deck);
	}

	case 'moveSlide': {
		const from = findSlide(deck, op.slideId);
		const slides = deck.slides.toSpliced(from, 1);
		return { ...deck, slides: slides.toSpliced(clampIndex(op.index, slides.length), 0, deck.slides[from]) };
	}

	case 'addElement':
		return withSlide(deck, op.slideId, slide =>
		{
			if(slide.elements.some(el => el.id === op.element.id)) throw new DeckOpError(`An element with id "${op.element.id}" already exists on slide "${slide.id}".`);
			return { ...slide, elements: slide.elements.toSpliced(clampIndex(op.index, slide.elements.length), 0, prepareNewElement(op.element)) };
		});

	case 'updateElement':
		return withSlide(deck, op.slideId, slide =>
		{
			const index = findElement(slide, op.elementId);
			return { ...slide, elements: slide.elements.with(index, mergeElement(slide.elements[index], op.patch)) };
		});

	case 'updateElements': {
		if(op.elementType) oneOf('elementType', op.elementType, ['text', 'shape', 'image', 'icon', 'svg', 'line', 'table', 'chart']);
		checkElementPatch(op.patch, op.elementType);
		return targetSlides(deck, op.slideIds).reduce((current, slideId) => withSlide(current, slideId, slide => ({
			...slide,
			elements: slide.elements.map(el => (!op.elementType || el.type === op.elementType ? mergeElement(el, op.patch) : el)),
		})), deck);
	}

	case 'removeElement':
		return withSlide(deck, op.slideId, slide => ({ ...slide, elements: slide.elements.toSpliced(findElement(slide, op.elementId), 1) }));

	case 'addSlideFromLayout': {
		oneOf('layout', op.layout, LAYOUTS.map(l => l.id));
		if(deck.slides.some(s => s.id === op.slideId)) throw new DeckOpError(`A slide with id "${op.slideId}" already exists.`);
		const slide = createSlideFromLayout(op.layout, { slideId: op.slideId, margin: resolveTheme(deck.theme, deck.customTheme).margin });
		return { ...deck, slides: deck.slides.toSpliced(clampIndex(op.index, deck.slides.length), 0, slide) };
	}

	case 'updateTheme': {
		const base = deck.theme === 'custom' && deck.customTheme ? deck.customTheme : customFromTheme(resolveTheme(deck.theme));
		const customTheme = { ...base, ...op.patch, colors: { ...base.colors, ...op.patch.colors } };
		checkTheme('custom', customTheme);
		return { ...deck, theme: 'custom', customTheme };
	}

	case 'setTheme':
		checkTheme(op.theme, op.customTheme);
		// Present-but-undefined clears the custom theme; an absent key keeps it.
		return { ...deck, theme: op.theme, ...('customTheme' in op ? { customTheme: op.customTheme } : {}) };

	case 'setTitle':
		return { ...deck, title: op.title };
	}
};

/** Applies ops in order; stops at the first failure and reports which step failed. */
export const applyOps = (deck: Deck, ops: DeckOp[]): Deck => ops.reduce((current, op, i) =>
{
	try
	{
		return applyOp(current, op);
	}
	catch(error)
	{
		throw new DeckOpError(`Step ${i + 1} (${op.type}) failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}, deck);

/**
 * Applies every op that still makes sense and skips the rest (e.g. one that
 * targets an element someone else has since deleted), instead of throwing.
 */
export const applyOpsLenient = (deck: Deck, ops: DeckOp[]): { deck: Deck; skipped: DeckOp[] } =>
	ops.reduce<{ deck: Deck; skipped: DeckOp[] }>((result, op) =>
	{
		try
		{
			return { deck: applyOp(result.deck, op), skipped: result.skipped };
		}
		catch(error)
		{
			if(!(error instanceof DeckOpError)) throw error;
			return { deck: result.deck, skipped: [...result.skipped, op] };
		}
	}, { deck, skipped: [] });

/** Structural equality for plain deck data; a missing key equals an undefined one. */
const same = (a: unknown, b: unknown): boolean => {
	if(a === b) return true;
	if(typeof a !== 'object' || typeof b !== 'object' || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) return false;
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
	return [...keys].every(key => same((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
};

/** The fields of `to` that differ from `from`, ignoring `skip`. */
const changedFields = <T extends object>(from: T, to: T, skip: string[]) => {
	const keys = new Set([...Object.keys(from), ...Object.keys(to)].filter(key => !skip.includes(key)));
	return Object.fromEntries([...keys]
		.filter(key => !same(from[key as keyof T], to[key as keyof T]))
		.map(key => [key, to[key as keyof T]])) as Partial<T>;
};

/**
 * The ops that turn `from` into `to`. Diffing an edit backwards gives its undo,
 * which can then be applied (leniently) on top of other people's later edits.
 */
export const diffDecks = (from: Deck, to: Deck): DeckOp[] => {
	const ops: DeckOp[] = [];
	let working = from;
	const push = (op: DeckOp) => {
		ops.push(op);
		working = applyOp(working, op);
	};
	const slideIn = (id: string) => working.slides.find(s => s.id === id)!;

	if(from.title !== to.title) push({ type: 'setTitle', title: to.title });
	if(from.theme !== to.theme || !same(from.customTheme, to.customTheme)) push({ type: 'setTheme', theme: to.theme, customTheme: to.customTheme });

	// Add before removing (a deck can't drop to zero slides), then fix the order.
	const wanted = new Set(to.slides.map(s => s.id));
	to.slides.filter(s => !working.slides.some(w => w.id === s.id)).forEach(slide => push({ type: 'addSlide', slide }));
	working.slides.filter(s => !wanted.has(s.id)).forEach(s => push({ type: 'removeSlide', slideId: s.id }));
	to.slides.forEach((s, index) =>
	{
		if(working.slides[index].id !== s.id) push({ type: 'moveSlide', slideId: s.id, index });
	});

	for(const target of to.slides)
	{
		const slideId = target.id;
		const patch = changedFields(slideIn(slideId), target, ['id', 'elements']);
		if(Object.keys(patch).length) push({ type: 'updateSlide', slideId, patch });

		// An element whose type changed under the same id is removed and re-added.
		const targets = new Map(target.elements.map(el => [el.id, el]));
		slideIn(slideId).elements
			.filter(el => targets.get(el.id)?.type !== el.type)
			.forEach(el => push({ type: 'removeElement', slideId, elementId: el.id }));

		for(const el of slideIn(slideId).elements)
		{
			const fields = changedFields(el, targets.get(el.id)!, ['id']);
			if(Object.keys(fields).length) push({ type: 'updateElement', slideId, elementId: el.id, patch: fields });
		}

		// Additions and z-order: put each element at its index, moving it if needed.
		target.elements.forEach((element, index) =>
		{
			const current = slideIn(slideId).elements;
			if(current[index]?.id === element.id) return;
			if(current.some(el => el.id === element.id)) push({ type: 'removeElement', slideId, elementId: element.id });
			push({ type: 'addElement', slideId, element, index });
		});
	}

	return ops;
};

/** The ids an op touches, e.g. to highlight what an agent is editing. */
export const opTargets = (op: DeckOp): { slideId?: string; elementId?: string } => {
	switch(op.type)
	{
	case 'addSlide':      return { slideId: op.slide.id };
	case 'addSlideFromLayout': return { slideId: op.slideId };
	case 'addElement':    return { slideId: op.slideId, elementId: op.element.id };
	case 'updateElement':
	case 'removeElement': return { slideId: op.slideId, elementId: op.elementId };
	case 'removeSlide':
	case 'updateSlide':
	case 'moveSlide':     return { slideId: op.slideId };
	default:              return {};
	}
};
