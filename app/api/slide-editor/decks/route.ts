import { createSlide, newId } from '@/src/components/DeckEditor/deck';
import { delay, getStore, summarize } from '../data';
import { parseBody } from '../../parseBody';
import { NextResponse } from 'next/server';
import { deckSchema } from '../schema';
import { z } from 'zod';

// Docs-site-only. GET lists decks (most recently updated first); POST creates one,
// either from an imported deck (validated) or blank.

export const GET = async () => {
	await delay();
	const decks = [...getStore()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(summarize);
	return NextResponse.json({ decks });
};

const createSchema = z.object({
	title: z.string().trim().min(1).max(200).optional(),
	deck:  deckSchema.optional(),
});

export const POST = async (request: Request) => {
	const parsed = await parseBody(request, createSchema);
	if(!parsed.ok) return parsed.response;

	await delay();
	const deck = parsed.data.deck ?? { title: parsed.data.title ?? 'Untitled deck', theme: 'app' as const, slides: [createSlide()] };
	const stored = { id: newId(), deck, updatedAt: new Date().toISOString() };
	getStore().push(stored);
	return NextResponse.json(stored, { status: 201 });
};
