import { applyOp, applyOps, applyOpsLenient, DeckOpError, diffDecks, opTargets } from './ops';
import { LAYOUTS, createSlideFromLayout } from './layouts';
import { createSlide, duplicateSlide } from './deck';
import type { Deck, DeckElement } from './deck';
import { describe, it, expect } from 'vitest';

const shape = (id: string): DeckElement => ({ id, label: `Shape ${id}`, type: 'shape', shape: 'rect', fill: '#123456', radius: 0, x: 0, y: 0, width: 100, height: 100 });

const fixture = (): Deck => ({
	title:  'Fixture',
	theme:  'app',
	slides: [
		{ ...createSlide([shape('a'), shape('b')]), id: 's1' },
		{ ...createSlide([shape('c')]), id: 's2' },
	],
});

describe('applyOp', () =>
{
	it('adds a slide at an index, clamped to the deck', () =>
	{
		const deck = applyOp(fixture(), { type: 'addSlide', slide: { ...createSlide(), id: 's3' }, index: 1 });
		expect(deck.slides.map(s => s.id)).toEqual(['s1', 's3', 's2']);
		expect(applyOp(fixture(), { type: 'addSlide', slide: { ...createSlide(), id: 's9' }, index: 99 }).slides.at(-1)?.id).toBe('s9');
	});

	it('removes, updates, and moves slides', () =>
	{
		expect(applyOp(fixture(), { type: 'removeSlide', slideId: 's1' }).slides.map(s => s.id)).toEqual(['s2']);
		expect(applyOp(fixture(), { type: 'updateSlide', slideId: 's2', patch: { notes: 'hi', skipped: true } }).slides[1]).toMatchObject({ notes: 'hi', skipped: true });
		expect(applyOp(fixture(), { type: 'moveSlide', slideId: 's2', index: 0 }).slides.map(s => s.id)).toEqual(['s2', 's1']);
	});

	it('adds, updates, and removes elements', () =>
	{
		const added = applyOp(fixture(), { type: 'addElement', slideId: 's2', element: shape('d'), index: 0 });
		expect(added.slides[1].elements.map(e => e.id)).toEqual(['d', 'c']);

		const updated = applyOp(fixture(), { type: 'updateElement', slideId: 's1', elementId: 'b', patch: { x: 40, fill: '#ff0000' } });
		expect(updated.slides[0].elements[1]).toMatchObject({ id: 'b', x: 40, fill: '#ff0000' });

		expect(applyOp(fixture(), { type: 'removeElement', slideId: 's1', elementId: 'a' }).slides[0].elements.map(e => e.id)).toEqual(['b']);
	});

	it('sets the theme and title', () =>
	{
		expect(applyOp(fixture(), { type: 'setTheme', theme: 'midnight' }).theme).toBe('midnight');
		expect(applyOp(fixture(), { type: 'setTitle', title: 'Renamed' }).title).toBe('Renamed');
	});

	it('never mutates the input deck', () =>
	{
		const deck = fixture();
		const snapshot = structuredClone(deck);
		applyOp(deck, { type: 'updateElement', slideId: 's1', elementId: 'a', patch: { x: 999 } });
		applyOp(deck, { type: 'removeSlide', slideId: 's2' });
		applyOp(deck, { type: 'addElement', slideId: 's1', element: shape('z') });
		expect(deck).toEqual(snapshot);
	});

	it('fails fast on unknown ids, duplicates, type changes, and removing the last slide', () =>
	{
		expect(() => applyOp(fixture(), { type: 'removeSlide', slideId: 'nope' })).toThrow(DeckOpError);
		expect(() => applyOp(fixture(), { type: 'updateElement', slideId: 's1', elementId: 'nope', patch: {} })).toThrow(/No element with id "nope"/);
		expect(() => applyOp(fixture(), { type: 'addSlide', slide: { ...createSlide(), id: 's1' } })).toThrow(/already exists/);
		expect(() => applyOp(fixture(), { type: 'addElement', slideId: 's1', element: shape('a') })).toThrow(/already exists/);
		expect(() => applyOp(fixture(), { type: 'updateElement', slideId: 's1', elementId: 'a', patch: { type: 'text' } as Partial<DeckElement> })).toThrow(/from shape to text/);
		const single = applyOp(fixture(), { type: 'removeSlide', slideId: 's2' });
		expect(() => applyOp(single, { type: 'removeSlide', slideId: 's1' })).toThrow(/at least one slide/);
	});

	it('applyOps reports which step failed', () =>
	{
		expect(() => applyOps(fixture(), [
			{ type: 'setTitle', title: 'ok' },
			{ type: 'removeSlide', slideId: 'missing' },
		])).toThrow(/Step 2 \(removeSlide\) failed/);
	});

	it('opTargets names the slide and element an op touches', () =>
	{
		expect(opTargets({ type: 'updateElement', slideId: 's1', elementId: 'a', patch: {} })).toEqual({ slideId: 's1', elementId: 'a' });
		expect(opTargets({ type: 'setTheme', theme: 'paper' })).toEqual({});
	});

	it('duplicateSlide gives the slide and every element fresh ids', () =>
	{
		const original = fixture().slides[0];
		const copy = duplicateSlide(original);
		expect(copy.id).not.toBe(original.id);
		expect(copy.elements.map(e => e.id)).not.toEqual(original.elements.map(e => e.id));
		expect(copy.elements).toHaveLength(2);
	});
});

describe('diffDecks', () =>
{
	const text = (id: string, html: string): DeckElement => ({ id, label: id, type: 'text', html, fontSize: 24, color: '', x: 0, y: 0, width: 100, height: 40 });

	const edits: [string, (deck: Deck) => Deck][] = [
		['nothing', d => d],
		['title and theme', d => ({ ...d, title: 'New', theme: 'custom', customTheme: { colors: { background: '#000', surface: '#111', border: '#222', text: '#fff', muted: '#aaa', accent: '#f00' } } })],
		['slide fields', d => ({ ...d, slides: d.slides.map((s, i) => (i ? { ...s, notes: 'n', skipped: true, transition: { type: 'fade', duration: 300 } } : s)) })],
		['added slides, anywhere', d => ({ ...d, slides: [{ ...createSlide([shape('x')]), id: 'n1' }, ...d.slides, { ...createSlide(), id: 'n2' }] })],
		['removed slide', d => ({ ...d, slides: d.slides.slice(1) })],
		['reordered slides', d => ({ ...d, slides: [...d.slides].reverse() })],
		['element moved and restyled', d => ({ ...d, slides: d.slides.map(s => ({ ...s, elements: s.elements.map(el => (el.id === 'a' ? { ...el, x: 50, fill: '#00ff00' } as DeckElement : el)) })) })],
		['element added mid-list and removed', d => ({ ...d, slides: d.slides.map(s => (s.id === 's1' ? { ...s, elements: [s.elements[0], text('t', '<p>hi</p>')] } : s)) })],
		['elements reordered (z-order)', d => ({ ...d, slides: d.slides.map(s => ({ ...s, elements: [...s.elements].reverse() })) })],
		['element replaced by a different type under the same id', d => ({ ...d, slides: d.slides.map(s => (s.id === 's2' ? { ...s, elements: [text('c', '<p>was a shape</p>')] } : s)) })],
		['a field cleared', d => ({ ...d, slides: d.slides.map(s => ({ ...s, elements: s.elements.map(el => ({ ...el, effect: undefined })) })) })],
		['everything at once', d => ({ ...d, title: 'All', slides: [{ ...d.slides[1], notes: 'x', elements: [text('t', '<p>a</p>'), ...d.slides[1].elements] }, { ...createSlide(), id: 'n3' }] })],
	];

	it.each(edits)('round-trips: %s', (_, edit) =>
	{
		const before = { ...fixture(), slides: fixture().slides.map(s => ({ ...s, elements: s.elements.map(el => ({ ...el, effect: { type: 'fade' as const, delay: 0 } })) })) };
		const after = edit(before);
		expect(applyOps(before, diffDecks(before, after))).toEqual(after);
		expect(applyOps(after, diffDecks(after, before))).toEqual(before);
	});

	it('returns no ops for equal decks', () =>
	{
		expect(diffDecks(fixture(), fixture())).toEqual([]);
	});

	it('undoes one change on top of someone else\'s later changes, leaving theirs in place', () =>
	{
		const before = fixture();
		const mine = applyOp(before, { type: 'updateElement', slideId: 's1', elementId: 'a', patch: { x: 300 } });
		const undo = diffDecks(mine, before);

		const theirs = applyOps(mine, [
			{ type: 'updateElement', slideId: 's1', elementId: 'b', patch: { fill: '#abcdef' } },
			{ type: 'addSlide', slide: { ...createSlide(), id: 's3' } },
		]);
		const { deck, skipped } = applyOpsLenient(theirs, undo);

		expect(skipped).toEqual([]);
		expect(deck.slides[0].elements[0]).toMatchObject({ id: 'a', x: 0 });
		expect(deck.slides[0].elements[1]).toMatchObject({ id: 'b', fill: '#abcdef' });
		expect(deck.slides.map(s => s.id)).toEqual(['s1', 's2', 's3']);
	});
});

describe('applyOpsLenient', () =>
{
	it('applies what it can and reports the ops it skipped', () =>
	{
		const missing = { type: 'updateElement', slideId: 's1', elementId: 'gone', patch: { x: 1 } } as const;
		const { deck, skipped } = applyOpsLenient(fixture(), [
			{ type: 'setTitle', title: 'Kept' },
			missing,
			{ type: 'removeSlide', slideId: 'nope' },
			{ type: 'updateElement', slideId: 's2', elementId: 'c', patch: { x: 7 } },
		]);
		expect(deck.title).toBe('Kept');
		expect(deck.slides[1].elements[0].x).toBe(7);
		expect(skipped).toEqual([missing, { type: 'removeSlide', slideId: 'nope' }]);
	});
});

describe('layouts', () =>
{
	it('every layout builds a slide with fresh ids that fits the slide and follows the theme', () =>
	{
		for(const { id } of LAYOUTS)
		{
			const a = createSlideFromLayout(id);
			const b = createSlideFromLayout(id);
			expect(a.id).not.toBe(b.id);
			expect(new Set(a.elements.map(e => e.id)).size).toBe(a.elements.length);
			for(const el of a.elements)
			{
				expect(el.x).toBeGreaterThanOrEqual(0);
				expect(el.x + el.width).toBeLessThanOrEqual(1280);
				expect(el.y + el.height).toBeLessThanOrEqual(720);
				if(el.type === 'text') expect(el.color).toBe('');
				if(el.type === 'shape') expect(el.fill).toBe('');
			}
		}
	});

	it('layout text boxes start empty with a placeholder', () =>
	{
		const title = createSlideFromLayout('title').elements[0];
		expect(title).toMatchObject({ type: 'text', placeholder: 'Click to add title', bold: true });
		expect(createSlideFromLayout('blank').elements).toEqual([]);
	});

	it('layout slides can be added to a deck', () =>
	{
		const deck = applyOp(fixture(), { type: 'addSlide', slide: createSlideFromLayout('comparison') });
		expect(deck.slides).toHaveLength(3);
	});
});
