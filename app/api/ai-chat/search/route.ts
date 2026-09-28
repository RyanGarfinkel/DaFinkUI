import type { SearchCorpusEntry, SearchHit } from '@/src/blocks/AiChat/AiChat';
import { buildSeedThreadCorpus } from '../data';
import { NextResponse } from 'next/server';

// Docs-site-only infrastructure backing the /blocks/ai-chat live preview. Never listed in
// the ai-chat block's registry `files`. The demo has no database, so the client posts the
// conversations it holds and this route scans them. Threads the client hasn't opened yet
// aren't in that corpus, so they're filled in from the sample store, but only for chats the
// client still has (a deleted chat must not keep matching). In a real app, drop `corpus` from
// the request and run this same query against your message store instead.

const MAX_HITS = 20;
const SNIPPET_RADIUS = 40;

const buildSnippet = (text: string, matchIndex: number, queryLength: number) => {
	const start = Math.max(0, matchIndex - SNIPPET_RADIUS);
	const end = Math.min(text.length, matchIndex + queryLength + SNIPPET_RADIUS);
	return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
};

export const POST = async (request: Request) => {
	const { query, corpus } = (await request.json()) as { query?: string; corpus?: SearchCorpusEntry[] };
	const needle = query?.trim().toLowerCase();

	if(!needle || !Array.isArray(corpus)) return NextResponse.json({ error: 'query and corpus are required' }, { status: 400 });

	const hits: SearchHit[] = [];
	const heldChatIds = new Set(corpus.map((entry) => entry.chatId));
	const heldThreadIds = new Set(corpus.map((entry) => entry.threadId));
	const unopenedThreads = buildSeedThreadCorpus().filter((entry) => heldChatIds.has(entry.chatId) && !heldThreadIds.has(entry.threadId));

	for(const entry of [...corpus, ...unopenedThreads])
	{
		for(const message of entry.messages)
		{
			const flattened = message.text.replace(/\s+/g, ' ');
			const matchIndex = flattened.toLowerCase().indexOf(needle);
			if(matchIndex === -1) continue;

			hits.push({
				chatId:        entry.chatId,
				chatTitle:     entry.chatTitle,
				threadId:      entry.threadId,
				rootMessageId: entry.rootMessageId,
				messageId:     message.id,
				sender:        message.sender,
				snippet:       buildSnippet(flattened, matchIndex, needle.length),
			});
			if(hits.length === MAX_HITS) return NextResponse.json({ hits });
		}
	}

	return NextResponse.json({ hits });
};
