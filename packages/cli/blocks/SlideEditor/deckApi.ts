import type { Deck } from '../../components/DeckEditor/deck';

// Every request this block makes. They all hit relative /api/slide-editor routes;
// point them at your own backend. The docs site serves them from an in-memory store.

export interface DeckSummary {
	id:         string;
	title:      string;
	slideCount: number;
	updatedAt:  string;
}

export interface StoredDeck {
	id:        string;
	deck:      Deck;
	updatedAt: string;
}

interface ApiIssue {
	path:    string;
	message: string;
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
	const res = await fetch(url, init);
	if(res.ok) return res.json();

	// Surface the server's validation issues, so e.g. a bad import says what's wrong.
	const body = await res.json().catch(() => null) as { error?: string; issues?: ApiIssue[] } | null;
	const detail = body?.issues?.slice(0, 3).map(i => `${i.path || 'deck'}: ${i.message}`).join('; ');
	throw new Error(detail || body?.error || `Request failed (${res.status})`);
};

const json = (method: string, body: unknown): RequestInit => ({
	method,
	headers: { 'Content-Type': 'application/json' },
	body:    JSON.stringify(body),
});

export const fetchDecks = async () => (await request<{ decks: DeckSummary[] }>('/api/slide-editor/decks')).decks;

export const fetchDeck = (id: string) => request<StoredDeck>(`/api/slide-editor/decks/${encodeURIComponent(id)}`);

export const saveDeck = (id: string, deck: Deck) =>
	request<{ updatedAt: string }>(`/api/slide-editor/decks/${encodeURIComponent(id)}`, json('PUT', { deck }));

/** Creates a blank deck, or a copy of `deck` (an imported file or a template). */
export const createDeck = (options: { title?: string; deck?: Deck } = {}) =>
	request<StoredDeck>('/api/slide-editor/decks', json('POST', options));
