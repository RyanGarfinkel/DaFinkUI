'use client';

import { applyOps, applyOpsLenient, diffDecks, opTargets } from '../../components/DeckEditor/ops';
import type { ChatMessage, DeckEdit, DeckEditStep } from './types';
import type { DeckOp } from '../../components/DeckEditor/ops';
import type { Deck } from '../../components/DeckEditor/deck';
import { useEffect, useReducer } from 'react';

// One live document per deck in a chat, edited by you and the AI at the same time.
// The AI's steps queue up and land one at a time on the *current* document, so your
// edits in between survive; a step whose target you've removed is skipped. Your
// edits are recorded as inverse ops, so undo reverts only your own changes.

const STEP_MS = 700;
const TYPE_MS = 35;
const TYPE_CHARS = 3;

/** One change landing on a document. Text steps become several: the text types in, then the real op lands. */
export interface EditFrame {
	op:         DeckOp;
	label:      string;
	slideId?:   string;
	elementId?: string;
	typing:     boolean;
	/** The step's real change (not a typing preview); if it can't apply, the step counts as skipped. */
	final:      boolean;
}

const plainText = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The text an op writes into a plain (non-list) text box, new or replaced. Lists appear in one step. */
const typedText = (step: DeckEditStep) => {
	const { op } = step;
	const html = op.type === 'addElement' && op.element.type === 'text' ? op.element.html
		: op.type === 'updateElement' && 'html' in op.patch && typeof op.patch.html === 'string' ? op.patch.html
			: null;
	if(!html || html.includes('<li')) return null;
	// Keep the paragraph's own tag so alignment doesn't jump when the real text lands.
	return { html, text: plainText(html), open: html.match(/^<p\b[^>]*>/)?.[0] ?? '<p>' };
};

export const editFrames = (steps: DeckEditStep[]): EditFrame[] => steps.flatMap(step =>
{
	const { slideId, elementId } = opTargets(step.op);
	const frame = (op: DeckOp, typing: boolean, final: boolean): EditFrame => ({ op, label: step.label, slideId, elementId, typing, final });
	const typed = typedText(step);
	if(!typed || !slideId || !elementId) return [frame(step.op, false, true)];

	const { op } = step;
	const partial = (n: number) => `${typed.open}${escapeHtml(typed.text.slice(0, n))}</p>`;
	const frames: EditFrame[] = [];
	if(op.type === 'addElement') frames.push(frame({ ...op, element: { ...op.element, html: partial(0) } as typeof op.element }, true, false));
	for(let n = TYPE_CHARS; n < typed.text.length; n += TYPE_CHARS)
	{
		frames.push(frame({ type: 'updateElement', slideId, elementId, patch: { html: partial(n) } }, true, false));
	}
	frames.push(frame(op.type === 'addElement' ? { type: 'updateElement', slideId, elementId, patch: { html: typed.html } } : op, false, true));
	return frames;
});

/** The deck before an edit: its own `base`, or the result of earlier edits to the same deck in `previous`. */
export const deckBefore = (edit: DeckEdit, previous: ChatMessage[]): Deck | null => {
	if(edit.base) return edit.base;
	let deck: Deck | null = null;
	for(const m of previous)
	{
		if(m.kind !== 'message' || m.deckEdit?.deckId !== edit.deckId) continue;
		const start: Deck | null = m.deckEdit.base ?? deck;
		if(!start) continue;
		deck = applyOps(start, m.deckEdit.steps.map(s => s.op));
	}
	return deck;
};

/** The deck before and after an edit, or null when it can't be applied (nothing to continue from, or a step fails). */
export const resolveDeckEdit = (edit: DeckEdit, previous: ChatMessage[]): { base: Deck; final: Deck } | null => {
	try
	{
		const base = deckBefore(edit, previous);
		return base ? { base, final: applyOps(base, edit.steps.map(s => s.op)) } : null;
	}
	catch
	{
		return null;
	}
};

interface Pending extends EditFrame {
	docKey:    string;
	messageId: number;
}

interface HistoryEntry {
	undo: DeckOp[];
	redo: DeckOp[];
	key?: string;
}

export interface LiveDecksState {
	docs:    Record<string, Deck>;
	history: Record<string, { past: HistoryEntry[]; future: HistoryEntry[] }>;
	queue:   Pending[];
	/** Steps that couldn't land, per reply. */
	skipped: Record<number, number>;
}

export type LiveDecksAction =
	/** Starts a document from a deck, unless one is already open. */
	| { type: 'open'; docKey: string; deck: Deck }
	/** Queues an AI reply's steps. A `base` starts the document over (a fresh deck). */
	| { type: 'edit'; docKey: string; messageId: number; base?: Deck; steps: DeckEditStep[]; instant: boolean }
	/** Lands the next queued change. */
	| { type: 'tick' }
	| { type: 'change'; docKey: string; deck: Deck; coalesceKey?: string }
	| { type: 'undo' | 'redo'; docKey: string };

export const EMPTY_LIVE_DECKS: LiveDecksState = { docs: {}, history: {}, queue: [], skipped: {} };

const NO_HISTORY = { past: [], future: [] };

const land = (state: LiveDecksState): LiveDecksState => {
	const [next, ...queue] = state.queue;
	if(!next) return state;
	const current = state.docs[next.docKey];
	const result = current ? applyOpsLenient(current, [next.op]) : { deck: current, skipped: [next.op] };
	const missed = result.skipped.length > 0 && next.final;
	return {
		...state,
		queue,
		docs:    current ? { ...state.docs, [next.docKey]: result.deck } : state.docs,
		skipped: missed ? { ...state.skipped, [next.messageId]: (state.skipped[next.messageId] ?? 0) + 1 } : state.skipped,
	};
};

export const liveDecksReducer = (state: LiveDecksState, action: LiveDecksAction): LiveDecksState => {
	switch(action.type)
	{
	case 'open':
		return state.docs[action.docKey] ? state : { ...state, docs: { ...state.docs, [action.docKey]: action.deck } };

	case 'edit': {
		const frames = editFrames(action.steps).map(f => ({ ...f, docKey: action.docKey, messageId: action.messageId }));
		let next: LiveDecksState = {
			...state,
			docs:    action.base ? { ...state.docs, [action.docKey]: action.base } : state.docs,
			history: action.base ? { ...state.history, [action.docKey]: NO_HISTORY } : state.history,
			queue:   [...state.queue, ...frames],
		};
		if(action.instant) while(next.queue.length) next = land(next);
		return next;
	}

	case 'tick':
		return land(state);

	case 'change': {
		const current = state.docs[action.docKey];
		if(!current) return state;
		const redo = diffDecks(current, action.deck);
		if(!redo.length) return state;
		const undo = diffDecks(action.deck, current);
		const { past } = state.history[action.docKey] ?? NO_HISTORY;
		const last = past.at(-1);
		// A run of changes sharing a key (a drag, typing) is one undo step.
		const coalesce = !!action.coalesceKey && last?.key === action.coalesceKey;
		const entry = coalesce && last
			? { undo: [...undo, ...last.undo], redo: [...last.redo, ...redo], key: action.coalesceKey }
			: { undo, redo, key: action.coalesceKey };
		return {
			...state,
			docs:    { ...state.docs, [action.docKey]: action.deck },
			history: { ...state.history, [action.docKey]: { past: [...(coalesce ? past.slice(0, -1) : past), entry], future: [] } },
		};
	}

	case 'undo':
	case 'redo': {
		const current = state.docs[action.docKey];
		const { past, future } = state.history[action.docKey] ?? NO_HISTORY;
		const entry = action.type === 'undo' ? past.at(-1) : future[0];
		if(!current || !entry) return state;
		const { deck } = applyOpsLenient(current, action.type === 'undo' ? entry.undo : entry.redo);
		return {
			...state,
			docs:    { ...state.docs, [action.docKey]: deck },
			history: {
				...state.history,
				[action.docKey]: action.type === 'undo'
					? { past: past.slice(0, -1), future: [{ ...entry, key: undefined }, ...future] }
					: { past: [...past, { ...entry, key: undefined }], future: future.slice(1) },
			},
		};
	}
	}
};

export const deckDocKey = (chatId: string, deckId: string) => `${chatId}:${deckId}`;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const useLiveDeck = () => {
	const [state, dispatch] = useReducer(liveDecksReducer, EMPTY_LIVE_DECKS);
	const head = state.queue[0];

	useEffect(() =>
	{
		if(!head) return;
		const timer = setTimeout(() => dispatch({ type: 'tick' }), head.typing ? TYPE_MS : STEP_MS);
		return () => clearTimeout(timer);
	}, [head]);

	return {
		docs:     state.docs,
		/** The change landing next, i.e. what the AI is working on right now. */
		activity: head ? { docKey: head.docKey, messageId: head.messageId, label: head.label, slideId: head.slideId, elementId: head.elementId } : null,
		pending:  (messageId: number) => state.queue.some(p => p.messageId === messageId),
		skipped:  (messageId: number) => state.skipped[messageId] ?? 0,
		canUndo:  (docKey: string) => (state.history[docKey]?.past.length ?? 0) > 0,
		canRedo:  (docKey: string) => (state.history[docKey]?.future.length ?? 0) > 0,
		open:     (docKey: string, deck: Deck) => dispatch({ type: 'open', docKey, deck }),
		/** Queues a reply's steps; under reduced motion they all land at once. */
		apply:    (docKey: string, messageId: number, edit: DeckEdit) =>
			dispatch({ type: 'edit', docKey, messageId, base: edit.base, steps: edit.steps, instant: prefersReducedMotion() }),
		change:   (docKey: string, deck: Deck, coalesceKey?: string) => dispatch({ type: 'change', docKey, deck, coalesceKey }),
		undo:     (docKey: string) => dispatch({ type: 'undo', docKey }),
		redo:     (docKey: string) => dispatch({ type: 'redo', docKey }),
	};
};
