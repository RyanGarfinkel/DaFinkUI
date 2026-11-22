'use client';

import { createLiveReducer, useLiveDocs, type Frame, type LiveAction, type LiveState } from './liveDocs';
import { applyOps, applyOpsLenient, diffDecks, opTargets } from '../../components/DeckEditor/ops';
import type { ChatMessage, DeckEdit, DeckEditStep } from './types';
import type { DeckOp } from '../../components/DeckEditor/ops';
import type { Deck } from '../../components/DeckEditor/deck';

// One live document per deck in a chat; the shared machinery is in liveDocs.ts. Text steps
// become several frames: the text types in a few characters at a time, then the real op lands.

const TYPE_CHARS = 3;

export type EditFrame = Frame<DeckOp, { slideId?: string; elementId?: string }>;

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

export type LiveDecksState = LiveState<Deck, DeckOp, EditFrame>;

export type LiveDecksAction = LiveAction<Deck, DeckEditStep>;

export const EMPTY_LIVE_DECKS: LiveDecksState = { docs: {}, history: {}, queue: [], skipped: {} };

export const liveDecksReducer = createLiveReducer<Deck, DeckOp, DeckEditStep, EditFrame>({
	frames: editFrames,
	apply:  (deck, ops) => {
		const result = applyOpsLenient(deck, ops);
		return { doc: result.deck, skipped: result.skipped };
	},
	diff: diffDecks,
});

export const deckDocKey = (chatId: string, deckId: string) => `${chatId}:${deckId}`;

export const useLiveDeck = () => useLiveDocs(liveDecksReducer);
