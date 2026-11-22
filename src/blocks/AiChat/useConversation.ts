'use client';

import type { AiChatHistoryMessage, ChatDeck, ChatMessage, ChatSheet, ChatTextMessage, MessageAttachment } from './types';
import { buildHistory, buildPrompt, findPrecedingUserIndex, promptText, withVersion } from './messageHelpers';
import { useEffect, useRef, useState } from 'react';
import { sendMessage } from './chatApi';

const ERROR_REPLY_TEXT = 'Something went wrong — try sending that again.';

export interface UseConversationOptions {
	getMessages:    (id: string) => ChatMessage[];
	updateMessages: (id: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => void;
	nextMessageIdRef:  { current: number };
	/** Thread replies need the root message's history prepended; the main chat has none. */
	historyPrefix?: (id: string) => AiChatHistoryMessage[];
	/** Fires when a reply (or a regenerated version) lands, with the messages before it. */
	onReply?:       (id: string, message: ChatTextMessage, previous: ChatMessage[]) => void;
	/** Slide decks to send with each request, as the user has left them. */
	getDecks?:      (id: string) => ChatDeck[];
	/** Spreadsheets to send with each request, as the user has left them. */
	getSheets?:     (id: string) => ChatSheet[];
}

export const useConversation = ({ getMessages, updateMessages, nextMessageIdRef, historyPrefix, onReply, getDecks, getSheets }: UseConversationOptions) => {
	const [typingId, setTypingId] = useState<string | null>(null);
	const [streamingId, setStreamingId] = useState<string | null>(null);
	const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
	const [regeneratingMessageId, setRegeneratingMessageId] = useState<number | null>(null);
	const pendingReplyRef = useRef(0);

	// Any reply still in flight becomes a no-op on unmount.
	useEffect(() => () => { pendingReplyRef.current++; }, []);

	const queueReply = (id: string, promptMessage: string, history: AiChatHistoryMessage[]) => {
		setTypingId(id);
		const requestId = ++pendingReplyRef.current;

		sendMessage(promptMessage, history, getDecks?.(id), getSheets?.(id))
			.then((reply) => {
				if(pendingReplyRef.current !== requestId) return;
				setTypingId((prev) => (prev === id ? null : prev));
				const aiMessage: ChatTextMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'ai', text: reply.text, animate: true, toolCalls: reply.toolCalls, deckEdit: reply.deckEdit, sheetEdit: reply.sheetEdit, artifacts: reply.artifacts };
				updateMessages(id, (messages) => [...messages, aiMessage]);
				setStreamingId(id);
				setStreamingMessageId(aiMessage.id);
				onReply?.(id, aiMessage, getMessages(id));
			})
			.catch(() => {
				if(pendingReplyRef.current !== requestId) return;
				setTypingId((prev) => (prev === id ? null : prev));
				const errorMessage: ChatMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'ai', text: ERROR_REPLY_TEXT };
				updateMessages(id, (messages) => [...messages, errorMessage]);
			});
	};

	// A brand-new draft has no message list yet, so AiChat's handleSubmit creates it with its first message instead of calling this.
	const submit = (id: string, text: string, attachments: MessageAttachment[]) => {
		const history = [...(historyPrefix?.(id) ?? []), ...buildHistory(getMessages(id))];
		const userMessage: ChatMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'user', text, attachments };
		updateMessages(id, (messages) => [...messages, userMessage]);
		queueReply(id, buildPrompt(text, attachments), history);
	};

	const stop = (id: string) => {
		if(typingId === id)
		{
			pendingReplyRef.current++;
			setTypingId(null);
			return;
		}
		if(streamingId === id && streamingMessageId !== null)
		{
			const messageId = streamingMessageId;
			updateMessages(id, (messages) => messages.map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, animate: false } : m)));
			setStreamingId(null);
			setStreamingMessageId(null);
		}
	};

	const streamComplete = (id: string, messageId: number) => {
		if(messageId !== streamingMessageId) return;
		updateMessages(id, (messages) => messages.map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, animate: false } : m)));
		setStreamingId(null);
		setStreamingMessageId(null);
	};

	const setVersionIndex = (id: string, messageId: number, index: number) => {
		updateMessages(id, (messages) => messages.map((m) => (m.kind === 'message' && m.id === messageId && m.versions
			? { ...m, text: m.versions[index], versionIndex: index }
			: m
		)));
	};

	// Adds a version to one AI message. Serves both refresh and an edited message's resend; the prompt is the nearest user message above it.
	const regenerate = (id: string, messageId: number, promptOverride?: string) => {
		const messages = getMessages(id);
		const index = messages.findIndex((m) => m.id === messageId);
		if(index === -1) return;
		const userIndex = findPrecedingUserIndex(messages, index);
		if(userIndex === -1) return;

		const prompt  = promptOverride ?? promptText(messages[userIndex] as ChatTextMessage);
		const history = [...(historyPrefix?.(id) ?? []), ...buildHistory(messages.slice(0, userIndex))];

		setRegeneratingMessageId(messageId);
		sendMessage(prompt, history, getDecks?.(id), getSheets?.(id))
			.then((reply) => {
				setRegeneratingMessageId((prev) => (prev === messageId ? null : prev));
				const nextVersion = (m: ChatTextMessage): ChatTextMessage => ({ ...withVersion(m, reply.text), toolCalls: reply.toolCalls, deckEdit: reply.deckEdit, sheetEdit: reply.sheetEdit, artifacts: reply.artifacts, animate: true });
				const updated = nextVersion(messages[index] as ChatTextMessage);
				updateMessages(id, (msgs) => msgs.map((m) => (m.kind === 'message' && m.id === messageId ? nextVersion(m) : m)));
				setStreamingId(id);
				setStreamingMessageId(messageId);
				onReply?.(id, updated, messages.slice(0, index));
			})
			.catch(() => {
				setRegeneratingMessageId((prev) => (prev === messageId ? null : prev));
			});
	};

	// Resending an edit only ever targets the latest user message (the only one the pencil
	// button is shown on), so the message right after it — if any — is always "the latest ai
	// response" the user is expecting to regenerate.
	const resendEdit = (id: string, messageId: number, newText: string) => {
		const messages = getMessages(id);
		const index = messages.findIndex((m) => m.id === messageId);
		if(index === -1) return;

		updateMessages(id, (msgs) => msgs.map((m) => (m.kind === 'message' && m.id === messageId ? withVersion(m, newText) : m)));

		const next = messages[index + 1];
		if(next && next.kind === 'message' && next.sender === 'ai') regenerate(id, next.id, newText);
	};

	const questionnaireAnswer = (id: string, messageId: number, value: string) => {
		if(!value.trim()) return;
		const history = [...(historyPrefix?.(id) ?? []), ...buildHistory(getMessages(id))];
		const userMessage: ChatMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'user', text: value };
		updateMessages(id, (messages) => {
			const updated = messages.map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, questionnaireAnswer: value } : m));
			return [...updated, userMessage];
		});
		queueReply(id, value, history);
	};

	return {
		typingId, streamingId, streamingMessageId, regeneratingMessageId,
		submit, queueReply, stop, streamComplete, regenerate, resendEdit, questionnaireAnswer, setVersionIndex,
	};
};
