import type { SearchHit } from '@/src/blocks/AiChat/AiChat';
import { buildSeedThreadCorpus } from '../data';
import { parseBody } from '../../parseBody';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Docs-only demo route. With no database, the client posts the conversations it holds; unopened threads come from the sample store, only for chats the client still has. A real app searches its own message store instead.

const bodySchema = z.object({
	query:  z.string().trim().min(1, 'query is required').max(200),
	corpus: z.array(z.object({
		chatId:         z.string(),
		chatTitle:      z.string(),
		threadId:       z.string().optional(),
		rootMessageId:  z.number().optional(),
		messages:       z.array(z.object({ id: z.number(), sender: z.enum(['user', 'ai']), text: z.string().max(20000) })).max(1000),
	})).max(500),
});

const MAX_HITS = 20;
const SNIPPET_RADIUS = 40;

const buildSnippet = (text: string, matchIndex: number, queryLength: number) => {
	const start = Math.max(0, matchIndex - SNIPPET_RADIUS);
	const end = Math.min(text.length, matchIndex + queryLength + SNIPPET_RADIUS);
	return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
};

export const POST = async (request: Request) => {
	const parsed = await parseBody(request, bodySchema);
	if(!parsed.ok) return parsed.response;

	const { query, corpus } = parsed.data;
	const needle = query.toLowerCase();

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
