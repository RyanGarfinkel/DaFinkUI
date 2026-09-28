import type { AiChatHistoryMessage, AiChatReply, ChatEntry, ChatMessage, ChatTextMessage, SearchCorpusEntry, SearchHit } from './types';

// Everything in this file talks to the docs-site API routes under app/api/ai-chat/. Point
// these at your own backend and the rest of the block (typing indicator, streaming reveal,
// tool-call trace, table/chart rendering) keeps working unchanged, as long as each function
// keeps returning the same shape.

export const fetchChats = async (): Promise<ChatEntry[]> => {
	const res = await fetch('/api/ai-chat/chats');
	if(!res.ok) throw new Error('Failed to fetch chats');
	const { chats } = await res.json();
	return chats;
};

export const fetchThread = async (threadId: string): Promise<ChatMessage[]> => {
	const res = await fetch(`/api/ai-chat/threads/${threadId}`);
	if(!res.ok) throw new Error('Failed to fetch thread');
	const { messages } = await res.json();
	return messages;
};

export const sendMessage = async (message: string, history: AiChatHistoryMessage[]): Promise<AiChatReply> => {
	const res = await fetch('/api/ai-chat', {
		method:  'POST',
		headers: { 'Content-Type': 'application/json' },
		body:    JSON.stringify({ message, history }),
	});
	if(!res.ok) throw new Error('Failed to fetch AI reply');
	return res.json();
};

const toSearchMessages = (messages: ChatMessage[]): SearchCorpusEntry['messages'] =>
	messages
		.filter((m): m is ChatTextMessage => m.kind === 'message')
		.map((m) => ({ id: m.id, sender: m.sender, text: m.text }));

// The demo has no database, so the conversations this block holds are posted along with the
// query. Threads that haven't been opened yet aren't held, so the server fills those in. With
// a real backend, send only `query` and search your message store server-side.
export const buildSearchCorpus = (chats: ChatEntry[], threadMessages: Record<string, ChatMessage[]>): SearchCorpusEntry[] =>
	chats.flatMap((chat) => [
		{ chatId: chat.id, chatTitle: chat.title, messages: toSearchMessages(chat.messages) },
		...chat.threadRefs.filter((ref) => threadMessages[ref.id]).map((ref) => ({
			chatId:        chat.id,
			chatTitle:     chat.title,
			threadId:      ref.id,
			rootMessageId: ref.rootMessageId,
			messages:      toSearchMessages(threadMessages[ref.id]),
		})),
	]);

export const searchMessages = async (query: string, corpus: SearchCorpusEntry[], signal: AbortSignal): Promise<SearchHit[]> => {
	const res = await fetch('/api/ai-chat/search', {
		method:  'POST',
		headers: { 'Content-Type': 'application/json' },
		body:    JSON.stringify({ query, corpus }),
		signal,
	});
	if(!res.ok) throw new Error('Search failed');
	const { hits } = await res.json();
	return hits;
};
