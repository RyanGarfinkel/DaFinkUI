import type { AiChatHistoryMessage, ChatMessage, ChatTextMessage, MessageAttachment } from './types';

export const DRAFT_TITLE_MAX_LENGTH = 40;

// The API rejects an empty message, and an attachment-only send is legitimate (the bubble
// shows just the chips), so the model is told which files were attached instead.
export const describeAttachments = (attachments?: MessageAttachment[]) =>
	attachments && attachments.length > 0 ? `Attached: ${attachments.map((a) => a.name).join(', ')}` : '';

export const promptText = (m: ChatTextMessage) => m.text || describeAttachments(m.attachments);

export const buildHistory = (messages: ChatMessage[]): AiChatHistoryMessage[] =>
	messages
		.filter((m): m is ChatTextMessage => m.kind === 'message')
		.map((m) => ({ role: m.sender === 'user' ? 'user' as const : 'assistant' as const, text: promptText(m) }));

export const findLastUserMessageId = (messages: ChatMessage[]): number | null => {
	for(let i = messages.length - 1; i >= 0; i--)
	{
		const m = messages[i];
		if(m.kind === 'message' && m.sender === 'user') return m.id;
	}
	return null;
};

export const hasPrecedingUserMessage = (messages: ChatMessage[], index: number): boolean =>
	messages.slice(0, index).some((m) => m.kind === 'message' && m.sender === 'user');

export const findPrecedingUserIndex = (messages: ChatMessage[], index: number): number => {
	for(let i = index - 1; i >= 0; i--)
	{
		const m = messages[i];
		if(m.kind === 'message' && m.sender === 'user') return i;
	}
	return -1;
};

// Appends `nextText` as a new version and points the message at it — used by both edit-and-resend
// (user messages) and regenerate (ai messages), so version history behaves identically either way.
export const withVersion = (m: ChatTextMessage, nextText: string): ChatTextMessage => {
	const versions = [...(m.versions ?? [m.text]), nextText];
	return { ...m, text: nextText, versions, versionIndex: versions.length - 1 };
};
