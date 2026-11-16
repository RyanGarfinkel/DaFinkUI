import type { Deck, DeckElement, Slide } from './deck';
import type { CustomTheme, ThemeId } from './themes';

/**
 * Every structural change to a deck, as data. Editors, scripted demos, an API,
 * or an agent's tool calls all describe edits this way and apply them with
 * `applyOp`, so there's one validated path for changing a deck.
 */
export type DeckOp =
	| { type: 'addSlide';      slide: Slide; index?: number }
	| { type: 'removeSlide';   slideId: string }
	| { type: 'updateSlide';   slideId: string; patch: Partial<Omit<Slide, 'id' | 'elements'>> }
	| { type: 'moveSlide';     slideId: string; index: number }
	| { type: 'addElement';    slideId: string; element: DeckElement; index?: number }
	| { type: 'updateElement'; slideId: string; elementId: string; patch: Partial<DeckElement> }
	| { type: 'removeElement'; slideId: string; elementId: string }
	| { type: 'setTheme';      theme: ThemeId; customTheme?: CustomTheme }
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
		return { ...deck, slides: deck.slides.toSpliced(clampIndex(op.index, deck.slides.length), 0, op.slide) };

	case 'removeSlide': {
		const index = findSlide(deck, op.slideId);
		if(deck.slides.length === 1) throw new DeckOpError('A deck needs at least one slide.');
		return { ...deck, slides: deck.slides.toSpliced(index, 1) };
	}

	case 'updateSlide':
		return withSlide(deck, op.slideId, slide => ({ ...slide, ...op.patch }));

	case 'moveSlide': {
		const from = findSlide(deck, op.slideId);
		const slides = deck.slides.toSpliced(from, 1);
		return { ...deck, slides: slides.toSpliced(clampIndex(op.index, slides.length), 0, deck.slides[from]) };
	}

	case 'addElement':
		return withSlide(deck, op.slideId, slide =>
		{
			if(slide.elements.some(el => el.id === op.element.id)) throw new DeckOpError(`An element with id "${op.element.id}" already exists on slide "${slide.id}".`);
			return { ...slide, elements: slide.elements.toSpliced(clampIndex(op.index, slide.elements.length), 0, op.element) };
		});

	case 'updateElement':
		return withSlide(deck, op.slideId, slide =>
		{
			const index = findElement(slide, op.elementId);
			const current = slide.elements[index];
			if(op.patch.type && op.patch.type !== current.type) throw new DeckOpError(`Can't change element "${current.id}" from ${current.type} to ${op.patch.type}.`);
			return { ...slide, elements: slide.elements.with(index, { ...current, ...op.patch, id: current.id } as DeckElement) };
		});

	case 'removeElement':
		return withSlide(deck, op.slideId, slide => ({ ...slide, elements: slide.elements.toSpliced(findElement(slide, op.elementId), 1) }));

	case 'setTheme':
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
	case 'addElement':    return { slideId: op.slideId, elementId: op.element.id };
	case 'updateElement':
	case 'removeElement': return { slideId: op.slideId, elementId: op.elementId };
	case 'removeSlide':
	case 'updateSlide':
	case 'moveSlide':     return { slideId: op.slideId };
	default:              return {};
	}
};
