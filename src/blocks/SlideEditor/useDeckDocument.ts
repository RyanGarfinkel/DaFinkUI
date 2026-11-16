'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { createDeck, fetchDeck, fetchDecks, saveDeck } from './deckApi';
import { createSlide } from '../../components/DeckEditor/deck';
import type { Deck } from '../../components/DeckEditor/deck';
import { createHistory, historyReducer } from './deck';
import type { DeckSummary } from './deckApi';

export type LoadState = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ready' };
export type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

// Saves once edits pause for this long, so a drag or a typing burst is one request.
const AUTOSAVE_MS = 800;

// Shown (behind a loading state) until the real deck arrives.
const PLACEHOLDER: Deck = { title: '', theme: 'app', slides: [createSlide()] };

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong.');

/** The open deck: loading it, its undo history, autosave, and switching or creating decks. */
export const useDeckDocument = () => {
	const [load, setLoad] = useState<LoadState>({ kind: 'loading' });
	const [deckId, setDeckId] = useState<string | null>(null);
	const [decks, setDecks] = useState<DeckSummary[]>([]);
	const [history, dispatch] = useReducer(historyReducer, PLACEHOLDER, createHistory);
	// The last deck the server confirmed; anything else in `history.present` is unsaved.
	const [savedDeck, setSavedDeck] = useState<Deck>(PLACEHOLDER);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState(false);
	const [attempt, setAttempt] = useState(0);

	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const pendingRef = useRef<(() => Promise<void>) | null>(null);

	const deck = history.present;
	const dirty = load.kind === 'ready' && deck !== savedDeck;
	const saveState: SaveState = saveError ? 'error' : saving ? 'saving' : dirty ? 'unsaved' : 'saved';

	const refreshList = useCallback(() => fetchDecks().then(setDecks).catch(() => {}), []);

	const persist = useCallback(async (id: string, next: Deck) =>
	{
		setSaving(true);
		try
		{
			await saveDeck(id, next);
			setSavedDeck(next);
			setSaveError(false);
			refreshList();
		}
		catch
		{
			setSaveError(true);
		}
		finally
		{
			setSaving(false);
		}
	}, [refreshList]);

	const flush = useCallback(async () =>
	{
		clearTimeout(timerRef.current);
		const pending = pendingRef.current;
		pendingRef.current = null;
		await pending?.();
	}, []);

	const open = useCallback(async (id: string) =>
	{
		await flush();
		setLoad({ kind: 'loading' });
		try
		{
			const stored = await fetchDeck(id);
			dispatch({ type: 'load', deck: stored.deck });
			setSavedDeck(stored.deck);
			setSaveError(false);
			setDeckId(id);
			setLoad({ kind: 'ready' });
		}
		catch(error)
		{
			setLoad({ kind: 'error', message: errorMessage(error) });
		}
	}, [flush]);

	const create = useCallback(async (options: Parameters<typeof createDeck>[0] = {}) =>
	{
		const stored = await createDeck(options);
		await refreshList();
		await open(stored.id);
	}, [open, refreshList]);

	// Opens the most recent deck, creating one if there are none. Bumping
	// `attempt` (Retry) runs it again.
	useEffect(() =>
	{
		let cancelled = false;

		fetchDecks()
			.then(list =>
			{
				if(cancelled) return;
				setDecks(list);
				return list.length ? open(list[0].id) : create();
			})
			.catch(error =>
			{
				if(!cancelled) setLoad({ kind: 'error', message: errorMessage(error) });
			});

		return () =>
		{
			cancelled = true;
		};
	}, [open, create, attempt]);

	const retry = () => {
		setLoad({ kind: 'loading' });
		setAttempt(a => a + 1);
	};

	// Debounced autosave of whatever is newer than the last confirmed save.
	useEffect(() =>
	{
		if(!dirty || !deckId) return;
		const save = () => persist(deckId, deck);
		pendingRef.current = save;
		timerRef.current = setTimeout(() =>
		{
			pendingRef.current = null;
			save();
		}, AUTOSAVE_MS);
		return () => clearTimeout(timerRef.current);
	}, [deck, deckId, dirty, persist]);

	// Warn before leaving with edits the server hasn't confirmed.
	useEffect(() =>
	{
		if(saveState === 'saved') return;
		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [saveState]);

	/** Imports a deck from a .json file; the server validates it and reports what's wrong. */
	const importFile = async (file: File) => {
		let parsed: unknown;
		try
		{
			parsed = JSON.parse(await file.text());
		}
		catch
		{
			throw new Error(`${file.name} isn't valid JSON.`);
		}
		await create({ deck: parsed as Deck });
	};

	return {
		load,
		deckId,
		decks,
		history,
		dispatch,
		saveState,
		open,
		create,
		importFile,
		retry,
		retrySave: () => deckId && persist(deckId, deck),
	};
};

export type DeckDocument = ReturnType<typeof useDeckDocument>;
