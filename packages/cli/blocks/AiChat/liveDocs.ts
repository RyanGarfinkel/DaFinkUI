'use client';

import { useEffect, useReducer, type Reducer } from 'react';

// One live document per deck or sheet in a chat, edited by you and the AI together. AI steps queue and land one at a time on the current document, so your edits survive and steps aimed at removed targets are skipped. Your edits are stored as inverse ops, so undo reverts only yours. Per-type behavior lives in a `LiveAdapter` (useLiveDeck.ts, useLiveSheet.ts).

const STEP_MS = 700;
const TYPE_MS = 35;

/** One change landing on a document. `Focus` says where it lands (a slide and element, a cell range) so the panel can follow it. */
export type Frame<Op, Focus extends object = object> = {
	op:      Op;
	label:   string;
	/** A typing preview: it paces faster, and doesn't count as the step landing. */
	typing:  boolean;
	/** The step's real change; if it can't apply, the step counts as skipped. */
	final:   boolean;
} & Focus;

export interface LiveAdapter<Doc, Op, Step, F extends Frame<Op>> {
	frames: (steps: Step[]) => F[];
	/** Applies what it can and returns the ops that no longer fit. */
	apply:  (doc: Doc, ops: Op[]) => { doc: Doc; skipped: Op[] };
	diff:   (from: Doc, to: Doc) => Op[];
}

export type Pending<F> = F & { docKey: string; messageId: number };

interface HistoryEntry<Op> {
	undo: Op[];
	redo: Op[];
	key?: string;
}

export interface LiveState<Doc, Op, F> {
	docs:    Record<string, Doc>;
	history: Record<string, { past: HistoryEntry<Op>[]; future: HistoryEntry<Op>[] }>;
	queue:   Pending<F>[];
	/** Steps that couldn't land, per reply. */
	skipped: Record<number, number>;
}

export type LiveAction<Doc, Step> =
	/** Starts a document, unless one is already open. */
	| { type: 'open'; docKey: string; doc: Doc }
	/** Queues an AI reply's steps. A `base` starts the document over (a fresh one). */
	| { type: 'edit'; docKey: string; messageId: number; base?: Doc; steps: Step[]; instant: boolean }
	/** Lands the next queued change. */
	| { type: 'tick' }
	| { type: 'change'; docKey: string; doc: Doc; coalesceKey?: string }
	| { type: 'undo' | 'redo'; docKey: string };

export const emptyLive = <Doc, Op, F>(): LiveState<Doc, Op, F> => ({ docs: {}, history: {}, queue: [], skipped: {} });

const NO_HISTORY = { past: [], future: [] };

export const createLiveReducer = <Doc, Op, Step, F extends Frame<Op>>(adapter: LiveAdapter<Doc, Op, Step, F>) => {
	type State = LiveState<Doc, Op, F>;

	const land = (state: State): State => {
		const [next, ...queue] = state.queue;
		if(!next) return state;
		const current = state.docs[next.docKey];
		const result = current === undefined ? { doc: current, skipped: [next.op] } : adapter.apply(current, [next.op]);
		const missed = result.skipped.length > 0 && next.final;
		return {
			...state,
			queue,
			docs:    current === undefined ? state.docs : { ...state.docs, [next.docKey]: result.doc },
			skipped: missed ? { ...state.skipped, [next.messageId]: (state.skipped[next.messageId] ?? 0) + 1 } : state.skipped,
		};
	};

	const reducer = (state: State, action: LiveAction<Doc, Step>): State => {
		switch(action.type)
		{
		case 'open':
			return state.docs[action.docKey] ? state : { ...state, docs: { ...state.docs, [action.docKey]: action.doc } };

		case 'edit': {
			const frames = adapter.frames(action.steps).map(f => ({ ...f, docKey: action.docKey, messageId: action.messageId }));
			let next: State = {
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
			if(current === undefined) return state;
			const redo = adapter.diff(current, action.doc);
			if(!redo.length) return state;
			const undo = adapter.diff(action.doc, current);
			const { past } = state.history[action.docKey] ?? NO_HISTORY;
			const last = past.at(-1);
			// A run of changes sharing a key (a drag, typing) is one undo step.
			const coalesce = !!action.coalesceKey && last?.key === action.coalesceKey;
			const entry = coalesce && last
				? { undo: [...undo, ...last.undo], redo: [...last.redo, ...redo], key: action.coalesceKey }
				: { undo, redo, key: action.coalesceKey };
			return {
				...state,
				docs:    { ...state.docs, [action.docKey]: action.doc },
				history: { ...state.history, [action.docKey]: { past: [...(coalesce ? past.slice(0, -1) : past), entry], future: [] } },
			};
		}

		case 'undo':
		case 'redo': {
			const current = state.docs[action.docKey];
			const { past, future } = state.history[action.docKey] ?? NO_HISTORY;
			const entry = action.type === 'undo' ? past.at(-1) : future[0];
			if(current === undefined || !entry) return state;
			const { doc } = adapter.apply(current, action.type === 'undo' ? entry.undo : entry.redo);
			return {
				...state,
				docs:    { ...state.docs, [action.docKey]: doc },
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

	return reducer;
};

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The hook over a live-document reducer: paces the queue and exposes the documents, history and what the AI is doing. */
export const useLiveDocs = <Doc, Op, Step extends object, F extends Frame<Op>>(reducer: Reducer<LiveState<Doc, Op, F>, LiveAction<Doc, Step>>) => {
	const [state, dispatch] = useReducer(reducer, undefined, emptyLive<Doc, Op, F>);
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
		activity: head ?? null,
		pending:  (messageId: number) => state.queue.some(p => p.messageId === messageId),
		skipped:  (messageId: number) => state.skipped[messageId] ?? 0,
		canUndo:  (docKey: string) => (state.history[docKey]?.past.length ?? 0) > 0,
		canRedo:  (docKey: string) => (state.history[docKey]?.future.length ?? 0) > 0,
		open:     (docKey: string, doc: Doc) => dispatch({ type: 'open', docKey, doc }),
		/** Queues a reply's steps; under reduced motion they all land at once. */
		apply:    (docKey: string, messageId: number, edit: { base?: Doc; steps: Step[] }) =>
			dispatch({ type: 'edit', docKey, messageId, base: edit.base, steps: edit.steps, instant: prefersReducedMotion() }),
		change:   (docKey: string, doc: Doc, coalesceKey?: string) => dispatch({ type: 'change', docKey, doc, coalesceKey }),
		undo:     (docKey: string) => dispatch({ type: 'undo', docKey }),
		redo:     (docKey: string) => dispatch({ type: 'redo', docKey }),
	};
};
