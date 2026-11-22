import type { AiChatHistoryMessage, ArtifactEntry, ChatMessage, ChatTextMessage, MessageAttachment } from './types';
import type { SheetAskContext } from '../../components/SheetEditor/askcontext';
import type { DeckAskContext } from '../../components/DeckEditor/askcontext';

export const DRAFT_TITLE_MAX_LENGTH = 40;

/** Everything the AI made in this chat, oldest first: documents it wrote and slide decks it edited. A later reply that reuses an artifact id or deck id replaces the earlier entry. */
export const collectArtifacts = (messages: ChatMessage[]): ArtifactEntry[] => {
	const entries = new Map<string, ArtifactEntry>();

	messages.forEach((m) =>
	{
		if(m.kind !== 'message') return;

		if(m.deckEdit)
		{
			const key = `deck:${m.deckEdit.deckId}`;
			entries.delete(key);
			entries.set(key, { key, kind: 'slides', title: m.deckEdit.title, messageId: m.id, deckId: m.deckEdit.deckId });
		}

		if(m.sheetEdit)
		{
			const key = `sheet:${m.sheetEdit.sheetId}`;
			entries.delete(key);
			entries.set(key, { key, kind: 'sheet', title: m.sheetEdit.title, messageId: m.id, sheetId: m.sheetEdit.sheetId });
		}

		m.artifacts?.forEach((artifact) =>
		{
			entries.delete(artifact.id);
			entries.set(artifact.id, { key: artifact.id, kind: artifact.kind, title: artifact.title, messageId: m.id, artifact });
		});
	});

	return [...entries.values()];
};

// The API rejects an empty message, and an attachment-only send is legitimate (the bubble
// shows just the chips), so the model is told which files were attached instead.
export const describeAttachments = (attachments?: MessageAttachment[]) => {
	const files = attachments?.filter((a) => !a.detail) ?? [];
	return files.length > 0 ? `Attached: ${files.map((a) => a.name).join(', ')}` : '';
};

// An attachment with a `detail` is a reference (e.g. to a slide), not a file: the model gets
// its detail, which says exactly what is being pointed at, along with the typed message.
export const describeReferences = (attachments?: MessageAttachment[]) =>
	(attachments ?? []).filter((a) => a.detail).map((a) => `Referring to ${a.name}: ${a.detail}`).join('\n');

/** What the model is sent for a user message: the typed text (or the attached file names when there is none), then any references. */
export const buildPrompt = (text: string, attachments?: MessageAttachment[]) =>
	[text || describeAttachments(attachments), describeReferences(attachments)].filter(Boolean).join('\n\n');

export const promptText = (m: ChatTextMessage) => buildPrompt(m.text, m.attachments);

const REFERENCE_NAME_QUOTE_LENGTH = 24;
const REFERENCE_TEXT_MAX_LENGTH = 600;

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max).trimEnd()}…` : text);

/** A chip for something the user pointed at in a slide deck. `name` is for people; `detail` is for the model and carries the deck, slide and element ids it can edit by. */
export const slideReference = (context: DeckAskContext, deck: { deckId: string; title: string }): MessageAttachment => {
	const what = context.selectedText ? `“${truncate(context.text, REFERENCE_NAME_QUOTE_LENGTH)}”` : context.elementLabel || context.elementType;
	const content = context.text ? `, ${context.selectedText ? 'highlighted text' : 'content'}: "${truncate(context.text, REFERENCE_TEXT_MAX_LENGTH)}"` : '';

	return {
		name:   `Slide ${context.slideNumber} · ${what}`,
		detail: `deck ${deck.deckId} "${deck.title}", slide ${context.slideNumber} of ${context.slideCount} (id ${context.slideId}), element ${context.elementId} (${context.elementType}, "${context.elementLabel}")${content}`,
	};
};

/** A chip for the cells the user pointed at in a sheet. `name` is for people; `detail` is for the model and carries the sheet id and range it can edit by. */
export const sheetReference = (context: SheetAskContext, sheet: { sheetId: string; title: string }): MessageAttachment => {
	const content = context.text ? `, contents (tab-separated typed values${context.truncated ? ', cut off' : ''}): "${context.text}"` : '';

	return {
		name:   `${sheet.title} · ${context.range}`,
		detail: `sheet ${sheet.sheetId} "${sheet.title}", range ${context.range} (${context.rows} × ${context.cols}, active cell ${context.activeCell})${content}`,
	};
};

export const buildHistory =(messages: ChatMessage[]): AiChatHistoryMessage[] =>
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
