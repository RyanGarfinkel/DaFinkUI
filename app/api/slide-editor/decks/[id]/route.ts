import { parseBody } from '../../../parseBody';
import { delay, getStore } from '../../data';
import { NextResponse } from 'next/server';
import { deckSchema } from '../../schema';
import { z } from 'zod';

// Docs-site-only. GET loads one deck; PUT replaces it after validation (the
// editor autosaves the whole deck, debounced, rather than sending patches).

type RouteContext = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: 'deck not found' }, { status: 404 });

export const GET = async (_request: Request, context: RouteContext) => {
	const { id } = await context.params;
	await delay();
	const stored = getStore().find(d => d.id === id);
	return stored ? NextResponse.json(stored) : notFound();
};

const putSchema = z.object({ deck: deckSchema });

export const PUT = async (request: Request, context: RouteContext) => {
	const { id } = await context.params;
	const parsed = await parseBody(request, putSchema);
	if(!parsed.ok) return parsed.response;

	await delay();
	const stored = getStore().find(d => d.id === id);
	if(!stored) return notFound();

	stored.deck = parsed.data.deck;
	stored.updatedAt = new Date().toISOString();
	return NextResponse.json({ updatedAt: stored.updatedAt });
};
