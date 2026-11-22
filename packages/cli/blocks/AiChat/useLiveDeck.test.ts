import { EMPTY_LIVE_DECKS, deckBefore, editFrames, liveDecksReducer } from './useLiveDeck';
import type { Deck, DeckElement } from '../../components/DeckEditor/deck';
import type { LiveDecksAction, LiveDecksState } from './useLiveDeck';
import { createSlide } from '../../components/DeckEditor/deck';
import { applyOps } from '../../components/DeckEditor/ops';
import type { ChatMessage, DeckEditStep } from './types';
import { describe, it, expect } from 'vitest';

const text = (id: string, html: string): DeckElement => ({ id, label: id, type: 'text', html, fontSize: 48, color: '', x: 0, y: 0, width: 100, height: 50 });
const shape = (id: string): DeckElement => ({ id, label: id, type: 'shape', shape: 'rect', fill: '', radius: 0, x: 0, y: 0, width: 10, height: 10 });

const BASE: Deck = { title: 'Deck', theme: 'app', slides: [{ ...createSlide([shape('box')]), id: 's1' }] };

const STEPS: DeckEditStep[] = [
	{ label: 'Writing the title', op: { type: 'addElement', slideId: 's1', element: text('t', '<p>Hello there</p>') } },
	{ label: 'Switching theme', op: { type: 'setTheme', theme: 'ocean' } },
];

const run = (state: LiveDecksState, ...actions: LiveDecksAction[]) => actions.reduce(liveDecksReducer, state);
const drain = (state: LiveDecksState) => {
	let next = state;
	while(next.queue.length) next = liveDecksReducer(next, { type: 'tick' });
	return next;
};

describe('editFrames', () =>
{
	it('lands exactly the steps\' result when applied in order', () =>
	{
		expect(applyOps(BASE, editFrames(STEPS).map(f => f.op))).toEqual(applyOps(BASE, STEPS.map(s => s.op)));
	});

	it('types text in progressively, then marks the real change as final', () =>
	{
		const frames = editFrames(STEPS).filter(f => f.label === 'Writing the title');
		expect(frames.length).toBeGreaterThan(2);
		expect(frames.slice(0, -1).every(f => f.typing && !f.final && f.elementId === 't')).toBe(true);
		expect(frames.at(-1)).toMatchObject({ typing: false, final: true });
	});

	it('keeps the paragraph\'s alignment while typing', () =>
	{
		const centered: DeckEditStep = { label: 'Title', op: { type: 'updateElement', slideId: 's1', elementId: 't', patch: { html: '<p style="text-align: center">Hi there</p>' } } };
		const typing = editFrames([centered]).filter(f => f.typing);
		expect(typing.every(f => f.op.type === 'updateElement' && String((f.op.patch as { html?: string }).html).startsWith('<p style="text-align: center">'))).toBe(true);
	});

	it('gives non-text steps a single final frame', () =>
	{
		expect(editFrames([STEPS[1]])).toEqual([expect.objectContaining({ final: true, typing: false })]);
	});
});

describe('liveDecksReducer', () =>
{
	const opened = run(EMPTY_LIVE_DECKS, { type: 'open', docKey: 'd', doc: BASE });

	it('queues AI steps and lands them one change at a time', () =>
	{
		const queued = run(opened, { type: 'edit', docKey: 'd', messageId: 1, steps: STEPS, instant: false });
		expect(queued.docs.d).toBe(BASE);
		expect(drain(queued).docs.d).toEqual(applyOps(BASE, STEPS.map(s => s.op)));
	});

	it('lands everything at once when instant', () =>
	{
		const done = run(opened, { type: 'edit', docKey: 'd', messageId: 1, steps: STEPS, instant: true });
		expect(done.queue).toHaveLength(0);
		expect(done.docs.d.theme).toBe('ocean');
	});

	it('keeps your edits made while the AI is working, and skips AI steps whose target you removed', () =>
	{
		let state = run(opened, { type: 'edit', docKey: 'd', messageId: 7, steps: [
			{ label: 'Theme', op: { type: 'setTheme', theme: 'paper' } },
			{ label: 'Move the box', op: { type: 'updateElement', slideId: 's1', elementId: 'box', patch: { x: 500 } } },
		], instant: false });
		state = liveDecksReducer(state, { type: 'tick' });

		const withoutBox = { ...state.docs.d, title: 'Mine', slides: [{ ...state.docs.d.slides[0], elements: [] }] };
		state = drain(liveDecksReducer(state, { type: 'change', docKey: 'd', doc: withoutBox }));

		expect(state.docs.d).toMatchObject({ title: 'Mine', theme: 'paper' });
		expect(state.docs.d.slides[0].elements).toHaveLength(0);
		expect(state.skipped[7]).toBe(1);
	});

	it('undoes only your own change, leaving the AI\'s later ones', () =>
	{
		const mine = { ...BASE, title: 'Mine' };
		let state = run(opened, { type: 'change', docKey: 'd', doc: mine });
		state = run(state, { type: 'edit', docKey: 'd', messageId: 2, steps: [STEPS[1]], instant: true });
		state = run(state, { type: 'undo', docKey: 'd' });

		expect(state.docs.d).toMatchObject({ title: 'Deck', theme: 'ocean' });
		expect(run(state, { type: 'redo', docKey: 'd' }).docs.d).toMatchObject({ title: 'Mine', theme: 'ocean' });
	});

	it('coalesces a run of changes sharing a key into one undo step', () =>
	{
		const move = (x: number): LiveDecksAction => ({ type: 'change', docKey: 'd', doc: { ...BASE, slides: [{ ...BASE.slides[0], elements: [{ ...shape('box'), x }] }] }, coalesceKey: 'drag' });
		let state = run(opened, move(10), move(20), move(30));
		expect(state.history.d.past).toHaveLength(1);
		state = run(state, { type: 'undo', docKey: 'd' });
		expect(state.docs.d.slides[0].elements[0].x).toBe(0);
	});

	it('a fresh deck (with a base) starts the document and its history over', () =>
	{
		const edited = run(opened, { type: 'change', docKey: 'd', doc: { ...BASE, title: 'Mine' } });
		const fresh = run(edited, { type: 'edit', docKey: 'd', messageId: 3, base: { ...BASE, title: 'New' }, steps: [], instant: true });
		expect(fresh.docs.d.title).toBe('New');
		expect(fresh.history.d.past).toHaveLength(0);
	});

	it('ignores no-op changes', () =>
	{
		expect(run(opened, { type: 'change', docKey: 'd', doc: BASE })).toBe(opened);
	});
});

describe('deckBefore', () =>
{
	const create: ChatMessage = { id: 1, kind: 'message', sender: 'ai', text: '', deckEdit: { deckId: 'd', title: 'Deck', base: BASE, steps: STEPS } };

	it('continues from earlier edits of the same deck', () =>
	{
		const deck = deckBefore({ deckId: 'd', title: 'Deck', steps: [] }, [create]);
		expect(deck?.theme).toBe('ocean');
		expect(deck?.slides[0].elements).toHaveLength(2);
	});

	it('returns null when there is nothing to continue from', () =>
	{
		expect(deckBefore({ deckId: 'other', title: 'Deck', steps: [] }, [create])).toBeNull();
	});
});
