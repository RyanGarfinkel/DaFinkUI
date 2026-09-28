import { NextResponse } from 'next/server';
import { CHATS } from '../data';

// Docs-site-only infrastructure backing the /blocks/ai-chat live preview. Never listed in
// the ai-chat block's registry `files`. Lists the signed-in user's conversations; in a real
// app this is a query against your chat store. The delay stands in for network latency.

const LATENCY_MS = 500;

export const GET = async () => {
	await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
	return NextResponse.json({ chats: CHATS });
};
