import type { Deck } from '@/src/components/DeckEditor/deck';
import { SAMPLE_DECK } from '@/src/blocks/SlideEditor/deck';

// Docs-only sample store (your database in a real app). It lives on globalThis because dev mode can bundle each route separately.

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
