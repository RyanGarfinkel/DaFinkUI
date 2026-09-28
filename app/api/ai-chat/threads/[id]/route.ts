import { THREAD_MESSAGES } from '../../data';
import { NextResponse } from 'next/server';

// Docs-site-only infrastructure backing the /blocks/ai-chat live preview. Never listed in
// the ai-chat block's registry `files`. Loads one thread's replies on demand; in a real app
// this is a query against your message store. The delay stands in for network latency.

const LATENCY_MS = 600;

export const GET = async (_request: Request, context: { params: Promise<{ id: string }> }) => {
	const { id } = await context.params;
	const messages = THREAD_MESSAGES[id];
	if(!messages) return NextResponse.json({ error: 'thread not found' }, { status: 404 });

	await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
	return NextResponse.json({ messages });
};
