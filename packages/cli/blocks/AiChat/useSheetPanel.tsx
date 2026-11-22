'use client';

import type { ArtifactEntry, ChatEntry, ChatMessage, ChatSheet, ChatTextMessage, MessageAttachment, SheetEdit } from './types';
import { resolveSheetEdit, sheetBefore, sheetDocKey, useLiveSheet } from './useLiveSheet';
import type { SheetAskContext } from '../../components/SheetEditor/askcontext';
import type { Sheet } from '../../components/SheetEditor/sheet';
import { sheetReference } from './messageHelpers';
import { SheetPanel } from './SheetPanel';
import { DeckCard } from './MessageRow';
import { useState } from 'react';

export interface UseSheetPanelOptions {
	chats:        ChatEntry[];
	activeChatId: string | null | undefined;
	isMobile:     boolean;
	/** Closes the thread, artifacts and slides panels: only one side panel is open at a time. */
	closeOthers:  () => void;
	/** Gets the reference chip for cells the user pointed at with Ask AI. */
	onReference:  (reference: MessageAttachment) => void;
}

export interface SheetPanelSlots {
	expanded:       boolean;
	onToggleExpand: () => void;
	onClose:        () => void;
}

/** Everything AiChat needs to show a chat's live spreadsheets: the documents, the open panel, the cards in messages. The sheet counterpart of the slides wiring in AiChat.tsx. */
export const useSheetPanel = ({ chats, activeChatId, isMobile, closeOthers, onReference }: UseSheetPanelOptions) => {
	const live = useLiveSheet();
	// `messageId` is the card that opened it, which gets focus back on close.
	const [view, setView] = useState<{ chatId: string; sheetId: string; messageId: number } | null>(null);

	const messagesOf = (chatId: string | null | undefined): ChatMessage[] => chats.find((c) => c.id === chatId)?.messages ?? [];

	// The AI edits from your current version of each sheet in this chat.
	const getSheets = (chatId: string): ChatSheet[] => Object.entries(live.docs)
		.filter(([key]) => key.startsWith(`${chatId}:`))
		.map(([key, sheet]) => ({ sheetId: key.slice(chatId.length + 1), sheet }));

	// A reply that edits a sheet lands live in the sheet panel, opened without moving focus.
	const onReply = (chatId: string, message: ChatTextMessage, previous: ChatMessage[]) => {
		const edit = message.sheetEdit;
		if(!edit) return;
		const docKey = sheetDocKey(chatId, edit.sheetId);
		if(!edit.base && !live.docs[docKey])
		{
			const start = sheetBefore(edit, previous);
			if(!start) return;
			live.open(docKey, start);
		}
		live.apply(docKey, message.id, edit);
		closeOthers();
		setView({ chatId, sheetId: edit.sheetId, messageId: message.id });
	};

	// The chat's latest version of a sheet, rebuilt from its edit history (before anyone has opened it live).
	const latestSheet = (chatId: string, sheetId: string) => {
		try
		{
			return sheetBefore({ sheetId, title: '', steps: [] }, messagesOf(chatId));
		}
		catch
		{
			return null;
		}
	};

	// Every card for a sheet opens the same live document, not a snapshot of that reply.
	const open = (chatId: string, message: ChatTextMessage) => {
		const edit = message.sheetEdit;
		if(!edit) return;
		const docKey = sheetDocKey(chatId, edit.sheetId);
		if(!live.docs[docKey])
		{
			const sheet = latestSheet(chatId, edit.sheetId);
			if(!sheet) return;
			live.open(docKey, sheet);
		}
		closeOthers();
		setView({ chatId, sheetId: edit.sheetId, messageId: message.id });
	};

	const openEntry = (entry: ArtifactEntry) => {
		const message = messagesOf(activeChatId).find((m): m is ChatTextMessage => m.kind === 'message' && m.id === entry.messageId);
		if(activeChatId && message) open(activeChatId, message);
	};

	const docKey = view && view.chatId === activeChatId ? sheetDocKey(view.chatId, view.sheetId) : null;
	const sheet = docKey ? live.docs[docKey] : undefined;
	const isOpen = Boolean(docKey && sheet);
	const activity = live.activity?.docKey === docKey ? live.activity : null;
	const lastReply = messagesOf(activeChatId).findLast((m): m is ChatTextMessage => m.kind === 'message' && m.sheetEdit?.sheetId === view?.sheetId);
	const skippedLast = lastReply ? live.skipped(lastReply.id) : 0;
	const note = skippedLast ? `${skippedLast} change${skippedLast === 1 ? '' : 's'} skipped: you’d already removed what ${skippedLast === 1 ? 'it' : 'they'} would edit.` : '';

	// On desktop the chat sits beside the sheet, so the panel stays open; on mobile the sheet closes to land on the chat.
	const handleAsk = (context: SheetAskContext) => {
		if(!view || !sheet) return;
		onReference(sheetReference(context, { sheetId: view.sheetId, title: sheet.title }));
		if(isMobile) setView(null);
	};

	const renderCard = (chatId: string, message: ChatTextMessage, previous: ChatMessage[]) => {
		const edit: SheetEdit | undefined = message.sheetEdit;
		if(!edit) return null;
		const current = live.docs[sheetDocKey(chatId, edit.sheetId)] ?? resolveSheetEdit(edit, previous)?.final;
		const skipped = live.skipped(message.id);
		const filled = current ? Object.values(current.cells).filter((cell) => cell.value !== '').length : 0;
		const detail = live.activity?.messageId === message.id ? `${live.activity.label}…`
			: !current ? 'Couldn’t apply these edits'
				: `${filled} cell${filled === 1 ? '' : 's'}${skipped ? ` · ${skipped} change${skipped === 1 ? '' : 's'} skipped` : ''}`;

		return <DeckCard kind='sheet' messageId={message.id} title={current?.title || edit.title} detail={detail} onOpen={() => open(chatId, message)} />;
	};

	const renderPanel = ({ expanded, onToggleExpand, onClose }: SheetPanelSlots) => (docKey && sheet ? (
		<SheetPanel
			inDrawer={isMobile}
			key={docKey}
			sheet={sheet}
			activity={activity}
			note={note}
			onChange={(next, coalesceKey) => live.change(docKey, next, coalesceKey)}
			onUndo={() => live.undo(docKey)}
			onRedo={() => live.redo(docKey)}
			canUndo={live.canUndo(docKey)}
			canRedo={live.canRedo(docKey)}
			expanded={expanded}
			onToggleExpand={onToggleExpand}
			onClose={onClose}
			onAsk={handleAsk}
		/>
	) : null);

	// Every sheet the chat has made, at its latest version, for charts to take their data from.
	const sheetsOf = (chatId: string | null | undefined): Map<string, Sheet> => {
		const found = new Map<string, Sheet>();
		if(!chatId) return found;
		for(const message of messagesOf(chatId))
		{
			const sheetId = message.kind === 'message' ? message.sheetEdit?.sheetId : undefined;
			if(!sheetId || found.has(sheetId)) continue;
			const sheet = live.docs[sheetDocKey(chatId, sheetId)] ?? latestSheet(chatId, sheetId);
			if(sheet) found.set(sheetId, sheet);
		}
		return found;
	};

	return {
		getSheets,
		sheetsOf,
		onReply,
		open,
		openEntry,
		renderCard,
		renderPanel,
		isOpen,
		/** Identifies the open sheet for the side-panel expand state. */
		sideKey:   isOpen ? `sheet:${docKey}` : null,
		/** The card that opened the panel, for returning focus on close. */
		messageId: view?.messageId,
		/** Hides the panel without moving focus, because another panel is taking its place. */
		hide:      () => setView(null),
	};
};
