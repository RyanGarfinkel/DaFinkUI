import type { Deck } from '@/src/components/DeckEditor/deck';
import { SAMPLE_DECK } from '@/src/blocks/SlideEditor/deck';

// Docs-site-only sample store backing the /blocks/slide-editor live preview. Never
// listed in the block's registry `files`; in a real app this is your database. It
// lives on globalThis so every route handler shares one copy (dev mode can bundle
// each route separately) and resets whenever the server restarts.

export interface StoredDeck {
	id:        string;
	deck:      Deck;
	updatedAt: string;
}

const globalStore = globalThis as typeof globalThis & { __slideDecks?: StoredDeck[] };

export const getStore = (): StoredDeck[] =>
	globalStore.__slideDecks ??= [{ id: 'quarterly-review', deck: structuredClone(SAMPLE_DECK), updatedAt: new Date().toISOString() }];

export const LATENCY_MS = 250;

export const delay = () => new Promise(resolve => setTimeout(resolve, LATENCY_MS));

export const summarize = ({ id, deck, updatedAt }: StoredDeck) => ({ id, title: deck.title, slideCount: deck.slides.length, updatedAt });
