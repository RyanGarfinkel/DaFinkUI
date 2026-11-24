'use client';

import { describeAttachments, buildHistory, buildPrompt, collectArtifacts, findLastUserMessageId, hasPrecedingUserMessage, slideReference, DRAFT_TITLE_MAX_LENGTH } from './messageHelpers';
import type { ChatTextMessage, ChatMessage, ThreadRef, ChatEntry, ChatSettings, SearchHit, MessageAttachment } from './types';
import { MessageActionsRow, ChatMessageRow, buildVersionNav, Divider, DeckCard, ArtifactCard } from './MessageRow';
import { APP_NAME, COMMANDS, MODEL_OPTIONS, EFFORT_OPTIONS, SLIDES_PROMPT } from './constants';
import { Sidebar, SidebarFooter, SidebarHeader } from '../../components/Sidebar/Sidebar';
import { deckBefore, deckDocKey, resolveDeckEdit, useLiveDeck } from './useLiveDeck';
import { Resizable, ResizablePanel } from '../../components/Resizable/Resizable';
import { type CommandOption } from '../../components/CommandInput/CommandInput';
import type { DeckAskContext } from '../../components/DeckEditor/askcontext';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import { Greeting, TypingPhrase, USER_NAME } from './Phrases';
import { DesktopPanel, MobilePanel } from './PanelSlot';
import Spinner from '../../components/Spinner/Spinner';
import { useStickToBottom } from './useStickToBottom';
import Drawer from '../../components/Drawer/Drawer';
import { DeleteChatModal } from './DeleteChatModal';
import { fetchChats, fetchThread } from './chatApi';
import { useConversation } from './useConversation';
import Button from '../../components/Button/Button';
import { resolveSheetChart } from './chartSource';
import { SettingsModal } from './SettingsModal';
import { useSheetPanel } from './useSheetPanel';
import { SidebarTools } from './SidebarTools';
import ArtifactsPanel from './ArtifactsPanel';
import { MenuIcon, FileIcon } from './icons';
import type { ArtifactEntry } from './types';
import { ProfileCard } from './ProfileCard';
import { useIsMobile } from './useIsMobile';
import { ChatSearch } from './ChatSearch';
import ThreadPanel from './ThreadPanel';
import { ChatList } from './ChatList';
import DeckPanel from './DeckPanel';
import Composer from './Composer';

export type { ChatTextMessage, ChatMessage, ThreadRef, ChatEntry, AiChatHistoryMessage, AiChatReply, SearchCorpusEntry, SearchHit, MessageAttachment, ChatDeck, DeckEdit, DeckEditStep, ChatSheet, SheetEdit, SheetEditStep, ChatArtifact, ArtifactKind } from './types';


const MAIN_COMPOSER_ID = 'main-composer';

const THREAD_SIZE = { initial: 320, min: 240, max: 480 };

const DECK_SIZE = { initial: 560, min: 360, max: 900 };

const SHEET_SIZE = { initial: 620, min: 360, max: 900 };

const ARTIFACTS_SIZE = { initial: 480, min: 320, max: 900 };

const DRAWER_EXIT_MS = 250;

const COPY_NOTICE_MS = 2000;

interface SidebarSlotProps {
	mobile:       boolean;
	open:         boolean;
	onOpenChange: (open: boolean) => void;
	children:     ReactNode;
}

const SidebarSlot = ({ mobile, open, onOpenChange, children }: SidebarSlotProps) => {
	if(!mobile) return <>{children}</>;
	return <Drawer open={open} onOpenChange={onOpenChange} side='left' aria-label='Chats'>{children}</Drawer>;
};

export const AiChat = () => {
	const [chats, setChats] = useState<ChatEntry[]>([]);
	const [chatsStatus, setChatsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
	const [activeId, setActiveId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draft, setDraft] = useState('');
	const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
	// Slide elements the user pointed at with Ask AI, sent with the next message like attachments.
	const [slideRefs, setSlideRefs] = useState<MessageAttachment[]>([]);
	const [threadAttachedFiles, setThreadAttachedFiles] = useState<File[]>([]);
	const [chatPendingDeletion, setChatPendingDeletion] = useState<ChatEntry | null>(null);
	const [threadMessages, setThreadMessages] = useState<Record<string, ChatMessage[]>>({});
	const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
	const [activeThread, setActiveThread] = useState<{ chatId: string; threadId: string; rootMessageId: number } | null>(null);
	const [threadDraft, setThreadDraft] = useState('');
	const [copyNoticeVisible, setCopyNoticeVisible] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [settings, setSettings] = useState<ChatSettings>({
		displayName:       USER_NAME,
		model:             MODEL_OPTIONS[1].value,
		effort:            EFFORT_OPTIONS[1].value,
		enabledConnectors: [],
		autoTitleEnabled:  true,
	});
	const { displayName, model, effort, autoTitleEnabled } = settings;
	const [searchOpen, setSearchOpen] = useState(false);
	const [pendingScrollMessageId, setPendingScrollMessageId] = useState<number | null>(null);
	const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
	const [editDraft, setEditDraft] = useState('');
	// The slides panel shares the thread panel's column; opening one closes the other.
	// `messageId` is the card that opened it, which gets focus back on close.
	const [deckView, setDeckView] = useState<{ chatId: string; deckId: string; messageId: number } | null>(null);
	// The artifacts panel shares the same column too. `key` is the open artifact (null shows the list);
	// `triggerId` is the element that opened it, which gets focus back on close.
	const [artifactView, setArtifactView] = useState<{ chatId: string; key: string | null; triggerId: string } | null>(null);
	// Which side panel (if any) has taken the full width, hiding the chat column.
	const [expandedKey, setExpandedKey] = useState<string | null>(null);
	const isMobile = useIsMobile();
	const railCollapsed = !isMobile && sidebarCollapsed;
	const liveDeck = useLiveDeck();
	const sheetPanel = useSheetPanel({
		chats,
		activeChatId: activeId,
		isMobile,
		closeOthers:  () =>
		{
			setActiveThread(null);
			setArtifactView(null);
			setDeckView(null);
		},
		onReference:  (reference) =>
		{
			setSlideRefs((prev) => (prev.some((r) => r.detail === reference.detail) ? prev : [...prev, reference]));
			window.setTimeout(() => document.getElementById(MAIN_COMPOSER_ID)?.querySelector('input')?.focus(), isMobile ? DRAWER_EXIT_MS : 0);
		},
	});
	const { containerRef, contentRef, follow, scrollIfFollowing } = useStickToBottom();
	const searchTriggerRef = useRef<HTMLButtonElement>(null);
	const copyNoticeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const mountedRef = useRef(true);
	const nextChatId = useRef(1);
	const nextThreadId = useRef(1);
	const nextMessageIdRef = useRef(1);

	const getThreadRootHistory = (chatId: string, rootMessageId: number): ChatMessage[] => {
		const chat = chats.find((c) => c.id === chatId);
		if(!chat) return [];
		const rootIndex = chat.messages.findIndex((m) => m.id === rootMessageId);
		return rootIndex === -1 ? chat.messages : chat.messages.slice(0, rootIndex + 1);
	};

	const mainConversation = useConversation({
		getMessages:    (chatId) => chats.find((c) => c.id === chatId)?.messages ?? [],
		updateMessages: (chatId, updater) => setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: updater(c.messages) } : c))),
		nextMessageIdRef,
		// The AI edits from your current version of each deck in this chat.
		getDecks: (chatId) => Object.entries(liveDeck.docs)
			.filter(([key]) => key.startsWith(`${chatId}:`))
			.map(([key, deck]) => ({ deckId: key.slice(chatId.length + 1), deck })),
		getSheets: sheetPanel.getSheets,
		// A reply that edits slides lands live in the slides panel, opened without moving focus.
		onReply: (chatId, message, previous) => {
			sheetPanel.onReply(chatId, message, previous);
			const edit = message.deckEdit;
			if(!edit) return;
			const docKey = deckDocKey(chatId, edit.deckId);
			if(!edit.base && !liveDeck.docs[docKey])
			{
				const start = deckBefore(edit, previous);
				if(!start) return;
				liveDeck.open(docKey, start);
			}
			liveDeck.apply(docKey, message.id, edit);
			setActiveThread(null);
			setArtifactView(null);
			sheetPanel.hide();
			setDeckView({ chatId, deckId: edit.deckId, messageId: message.id });
		},
	});

	const threadConversation = useConversation({
		getMessages:    (threadId) => threadMessages[threadId] ?? [],
		updateMessages: (threadId, updater) => setThreadMessages((prev) => ({ ...prev, [threadId]: updater(prev[threadId] ?? []) })),
		nextMessageIdRef,
		// A thread's root context isn't known from its own id alone — look it up from
		// whichever chat's threadRefs claims it, not from `activeThread` (which may have
		// already moved on to a different thread by the time an in-flight reply resolves).
		historyPrefix: (threadId) => {
			for(const chat of chats)
			{
				const ref = chat.threadRefs.find((r) => r.id === threadId);
				if(ref) return buildHistory(getThreadRootHistory(chat.id, ref.rootMessageId));
			}
			return [];
		},
	});

	const activeChat = chats.find((c) => c.id === activeId) ?? null;
	const modelLabel = MODEL_OPTIONS.find((o) => o.value === model)?.label ?? MODEL_OPTIONS[0].label;
	const modelPicker = {
		model,
		effort,
		onModelChange:  (next: string) => setSettings((prev) => ({ ...prev, model: next })),
		onEffortChange: (next: string) => setSettings((prev) => ({ ...prev, effort: next })),
	};
	const isTyping = activeId !== null && mainConversation.typingId === activeId;
	const isGenerating = isTyping || (activeId !== null && mainConversation.streamingId === activeId);
	const isThreadTyping = activeThread !== null && threadConversation.typingId === activeThread.threadId;
	const isThreadGenerating = activeThread !== null && (threadConversation.typingId === activeThread.threadId || threadConversation.streamingId === activeThread.threadId);
	const lastUserMessageId = activeChat ? findLastUserMessageId(activeChat.messages) : null;

	useEffect(() => {
		let cancelled = false;

		fetchChats()
			.then((loaded) => {
				if(cancelled) return;
				nextChatId.current = loaded.length + 1;
				nextMessageIdRef.current = Math.max(0, ...loaded.flatMap((c) => c.messages.map((m) => m.id))) + 1;
				setChats(loaded);
				// Land on a fresh, unsaved chat rather than the most recent one — it only
				// joins `chats` (and the sidebar) once its first message is sent.
				setActiveId(null);
				setChatsStatus('ready');
			})
			.catch(() => {
				if(!cancelled) setChatsStatus('error');
			});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		scrollIfFollowing();
	}, [scrollIfFollowing, chats, isTyping, activeId]);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			clearTimeout(copyNoticeTimerRef.current);
		};
	}, []);

	useEffect(() => {
		if(pendingScrollMessageId === null) return;
		const target = document.querySelector(`[data-message-id="${pendingScrollMessageId}"]`);
		if(!target) return;
		target.scrollIntoView({ block: 'center', behavior: 'smooth' });
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPendingScrollMessageId(null);
	}, [pendingScrollMessageId, activeId, activeThread, threadMessages]);

	const handleSelectHit = (hit: SearchHit) => {
		follow(false);
		setPendingScrollMessageId(hit.messageId);
		if(hit.threadId !== undefined && hit.rootMessageId !== undefined)
		{
			handleOpenThread(hit.chatId, hit.threadId, hit.rootMessageId);
			return;
		}
		if(activeThread?.chatId !== hit.chatId) setActiveThread(null);
		setActiveId(hit.chatId);
		setSidebarOpen(false);
	};

	// Doesn't touch `chats` — the draft only becomes a real, sidebar-visible chat once its
	// first message is sent (see handleSubmit).
	const handleNewChat = () => {
		follow(true);
		setActiveId(null);
		setDraft('');
		setAttachedFiles([]);
		setSlideRefs([]);
		setSidebarOpen(false);
	};

	const handleSelectChat = (id: string) => {
		follow(true);
		setActiveId(id);
		setDraft('');
		setAttachedFiles([]);
		setSlideRefs([]);
		setSidebarOpen(false);
	};

	const handleRename = (id: string, title: string) => setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));

	const handleArtifactChange = (chatId: string, artifactId: string, content: string) => setChats((prev) => prev.map((c) => (c.id !== chatId ? c : {
		...c,
		messages: c.messages.map((m) => (m.kind === 'message' && m.artifacts?.some((a) => a.id === artifactId)
			? { ...m, artifacts: m.artifacts.map((a) => (a.id === artifactId ? { ...a, content } : a)) }
			: m)),
	})));

	const handleDelete = (id: string) => {
		setChats((prev) => {
			const next = prev.filter((c) => c.id !== id);
			if(activeId === id) setActiveId(next[0]?.id ?? null);
			return next;
		});
		if(editingId === id) setEditingId(null);
	};

	const handleConfirmDelete = (chat: ChatEntry) => {
		handleDelete(chat.id);
		setChatPendingDeletion(null);
	};

	const handleStop = () => {
		if(activeChat) mainConversation.stop(activeChat.id);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		sendText(draft.trim(), [...slideRefs, ...attachedFiles.map((file) => ({ name: file.name }))]);
	};

	const sendText = (text: string, attachments: MessageAttachment[]) => {
		if(chatsStatus !== 'ready' || isGenerating) return;
		if(!text && attachments.length === 0) return;

		if(activeChat)
		{
			mainConversation.submit(activeChat.id, text, attachments);
		}
		else
		{
			// A draft has no `chats` entry to append to, so its first message creates the chat.
			const chatId = String(nextChatId.current++);
			const userMessage: ChatMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'user', text, attachments };
			const rawTitle = text || describeAttachments(attachments);
			const title = autoTitleEnabled && rawTitle
				? rawTitle.length > DRAFT_TITLE_MAX_LENGTH ? `${rawTitle.slice(0, DRAFT_TITLE_MAX_LENGTH).trimEnd()}…` : rawTitle
				: 'New chat';
			setChats((prev) => [{ id: chatId, title, messages: [userMessage], threadRefs: [] }, ...prev]);
			setActiveId(chatId);
			mainConversation.queueReply(chatId, buildPrompt(text, attachments), []);
		}

		follow(true);
		setDraft('');
		setAttachedFiles([]);
		setSlideRefs([]);
	};

	const handleQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeChat) return;
		follow(true);
		mainConversation.questionnaireAnswer(activeChat.id, messageId, value);
	};

	const handleMainStreamComplete = (messageId: number) => {
		if(activeChat) mainConversation.streamComplete(activeChat.id, messageId);
	};

	const setMessageVersionIndex = (chatId: string, messageId: number, index: number) => mainConversation.setVersionIndex(chatId, messageId, index);

	const regenerateMessage = (chatId: string, messageId: number) => mainConversation.regenerate(chatId, messageId);

	const handleStartEditMessage = (m: ChatTextMessage) => {
		setEditingMessageId(m.id);
		setEditDraft(m.text);
	};

	const handleCancelEditMessage = () => {
		setEditingMessageId(null);
		setEditDraft('');
	};

	const handleResendEdit = (chatId: string, messageId: number) => {
		const text = editDraft.trim();
		if(!text) return;
		mainConversation.resendEdit(chatId, messageId, text);
		setEditingMessageId(null);
		setEditDraft('');
	};

	// Display-only: the thread panel shows just the message the thread branched from, not
	// the whole conversation up to that point. Reply generation still needs the full history
	// (getThreadRootHistory above) so the assistant keeps that context.
	const getThreadRootMessage = (chatId: string, rootMessageId: number): ChatMessage[] => {
		const chat = chats.find((c) => c.id === chatId);
		const rootMessage = chat?.messages.find((m) => m.id === rootMessageId);
		return rootMessage ? [rootMessage] : [];
	};

	// The chat's latest version of a deck, rebuilt from its edit history (before anyone has opened it live).
	const latestDeck = (chatId: string, deckId: string) => {
		const messages = chats.find((c) => c.id === chatId)?.messages ?? [];
		try
		{
			return deckBefore({ deckId, title: '', steps: [] }, messages);
		}
		catch
		{
			return null;
		}
	};

	// Every card for a deck opens the same live document, not a snapshot of that reply.
	const handleOpenDeck = (chatId: string, message: ChatTextMessage) => {
		const edit = message.deckEdit;
		if(!edit) return;
		const docKey = deckDocKey(chatId, edit.deckId);
		if(!liveDeck.docs[docKey])
		{
			const deck = latestDeck(chatId, edit.deckId);
			if(!deck) return;
			liveDeck.open(docKey, deck);
		}
		setActiveThread(null);
		setArtifactView(null);
		sheetPanel.hide();
		setDeckView({ chatId, deckId: edit.deckId, messageId: message.id });
	};

	const openDocKey = deckView && deckView.chatId === activeChat?.id ? deckDocKey(deckView.chatId, deckView.deckId) : null;
	const openDeck = openDocKey ? liveDeck.docs[openDocKey] : undefined;
	const deckActivity = liveDeck.activity?.docKey === openDocKey ? liveDeck.activity : null;
	const lastDeckReply = activeChat?.messages.findLast((m): m is ChatTextMessage => m.kind === 'message' && m.deckEdit?.deckId === deckView?.deckId);
	const skippedLast = lastDeckReply ? liveDeck.skipped(lastDeckReply.id) : 0;
	const deckNote = skippedLast ? `${skippedLast} change${skippedLast === 1 ? '' : 's'} skipped: you’d already removed what ${skippedLast === 1 ? 'it' : 'they'} would edit.` : '';

	const artifactEntries = collectArtifacts(activeChat?.messages ?? []);
	const openArtifacts = artifactView && artifactView.chatId === activeChat?.id ? artifactView : null;

	const sideKey = activeThread && activeChat ? `thread:${activeThread.threadId}`
		: openDocKey && openDeck ? `deck:${openDocKey}`
			: sheetPanel.sideKey ?? (openArtifacts ? `artifacts:${openArtifacts.chatId}` : null);
	const expanded = !isMobile && sideKey !== null && expandedKey === sideKey;

	const handleToggleExpand = () => setExpandedKey(expanded ? null : sideKey);

	const handleSnapExpand = () => {
		setExpandedKey(sideKey);
		requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-expand-toggle]')?.focus());
	};

	// The chat column is display:none while expanded, so a trigger inside it can only take focus after the re-render.
	const focusAfterClose = (id: string) => {
		setExpandedKey(null);
		if(expanded) requestAnimationFrame(() => document.getElementById(id)?.focus());
		else document.getElementById(id)?.focus();
	};

	const handleCloseDeck = () => {
		const messageId = deckView?.messageId;
		setDeckView(null);
		if(messageId !== undefined) focusAfterClose(`deck-open-${messageId}`);
	};

	// On desktop the chat sits beside the slides, so the panel stays open; on mobile the sheet closes to land on the chat.
	const handleAskAboutSlide = (context: DeckAskContext) => {
		if(!deckView || !openDeck) return;
		const reference = slideReference(context, { deckId: deckView.deckId, title: openDeck.title });
		setSlideRefs((prev) => (prev.some((r) => r.detail === reference.detail) ? prev : [...prev, reference]));
		if(isMobile) setDeckView(null);
		window.setTimeout(() => document.getElementById(MAIN_COMPOSER_ID)?.querySelector('input')?.focus(), isMobile ? DRAWER_EXIT_MS : 0);
	};

	const handleOpenArtifacts = (chatId: string, key: string | null, triggerId: string) => {
		setActiveThread(null);
		setDeckView(null);
		sheetPanel.hide();
		setArtifactView({ chatId, key, triggerId });
	};

	const handleCloseArtifacts = () => {
		const triggerId = artifactView?.triggerId;
		setArtifactView(null);
		if(triggerId) focusAfterClose(triggerId);
	};

	const handleCloseSheet = () => {
		const messageId = sheetPanel.messageId;
		sheetPanel.hide();
		if(messageId !== undefined) focusAfterClose(`sheet-open-${messageId}`);
	};

	const handleOpenDocumentEntry = (entry: ArtifactEntry) => {
		if(entry.kind === 'sheet')
		{
			sheetPanel.openEntry(entry);
			return;
		}
		const message = activeChat?.messages.find((m): m is ChatTextMessage => m.kind === 'message' && m.id === entry.messageId);
		if(activeChat && message) handleOpenDeck(activeChat.id, message);
	};

	const renderDeckCard = (chatId: string, message: ChatTextMessage, previous: ChatMessage[]) => {
		const edit = message.deckEdit;
		if(!edit) return null;
		const deck = liveDeck.docs[deckDocKey(chatId, edit.deckId)] ?? resolveDeckEdit(edit, previous)?.final;
		const slides = deck?.slides.length ?? 0;
		const skipped = liveDeck.skipped(message.id);
		const detail = liveDeck.activity?.messageId === message.id ? `${liveDeck.activity.label}…`
			: !deck ? 'Couldn’t apply these edits'
				: `${slides} slide${slides === 1 ? '' : 's'}${skipped ? ` · ${skipped} change${skipped === 1 ? '' : 's'} skipped` : ''}`;

		return (
			<DeckCard
				messageId={message.id}
				title={deck?.title || edit.title}
				detail={detail}
				onOpen={() => handleOpenDeck(chatId, message)}
			/>
		);
	};

	const handleOpenThread = (chatId: string, threadId: string, rootMessageId: number) => {
		setDeckView(null);
		sheetPanel.hide();
		setArtifactView(null);
		setActiveThread({ chatId, threadId, rootMessageId });
		if(activeId !== chatId) setActiveId(chatId);
		setThreadDraft('');
		setThreadAttachedFiles([]);
		if(threadMessages[threadId]) return;
		setLoadingThreadId(threadId);
		fetchThread(threadId)
			.then((messages) =>
			{
				if(mountedRef.current) setThreadMessages((prev) => ({ ...prev, [threadId]: messages }));
			})
			.catch(() => undefined)
			.finally(() =>
			{
				if(mountedRef.current) setLoadingThreadId((prev) => (prev === threadId ? null : prev));
			});
	};

	const handleStartThread = (chatId: string, rootMessageId: number) => {
		const chat = chats.find((c) => c.id === chatId);
		const rootMessage = chat?.messages.find((m) => m.id === rootMessageId);
		const snippet = rootMessage && rootMessage.kind === 'message' ? rootMessage.text.replace(/\s+/g, ' ').trim().slice(0, 60) : 'New thread';
		const threadId = `thread-new-${nextThreadId.current++}`;
		const threadRef: ThreadRef = { id: threadId, rootMessageId, snippet, createdAt: 'Just now', replyCount: 0 };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, threadRefs: [...c.threadRefs, threadRef] } : c)));
		setThreadMessages((prev) => ({ ...prev, [threadId]: [] }));
		setDeckView(null);
		sheetPanel.hide();
		setArtifactView(null);
		setActiveThread({ chatId, threadId, rootMessageId });
		setThreadDraft('');
		setThreadAttachedFiles([]);
	};

	const handleCloseThread = () => {
		const rootMessageId = activeThread?.rootMessageId;
		setActiveThread(null);
		if(rootMessageId !== undefined) focusAfterClose(`thread-trigger-${rootMessageId}`);
	};

	const handleThreadStop = () => {
		if(activeThread) threadConversation.stop(activeThread.threadId);
	};

	const handleThreadSubmit = (e: FormEvent) => {
		e.preventDefault();
		if(!activeThread || isThreadGenerating) return;
		const text = threadDraft.trim();
		if(!text && threadAttachedFiles.length === 0) return;

		const attachments: MessageAttachment[] = threadAttachedFiles.map((file) => ({ name: file.name }));
		threadConversation.submit(activeThread.threadId, text, attachments);

		setThreadDraft('');
		setThreadAttachedFiles([]);
	};

	const handleThreadStreamComplete = (messageId: number) => {
		if(activeThread) threadConversation.streamComplete(activeThread.threadId, messageId);
	};

	const handleThreadQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeThread) return;
		threadConversation.questionnaireAnswer(activeThread.threadId, messageId, value);
	};

	const setThreadVersionIndex = (threadId: string, messageId: number, index: number) => threadConversation.setVersionIndex(threadId, messageId, index);

	const regenerateThreadMessage = (messageId: number, promptOverride?: string) => {
		if(activeThread) threadConversation.regenerate(activeThread.threadId, messageId, promptOverride);
	};

	const handleResendThreadEdit = (messageId: number) => {
		const text = editDraft.trim();
		if(!text || !activeThread) return;
		threadConversation.resendEdit(activeThread.threadId, messageId, text);
		setEditingMessageId(null);
		setEditDraft('');
	};

	const handleCopyReply = async (text: string) => {
		try
		{
			await navigator.clipboard.writeText(text);
		}
		catch
		{
			return;
		}
		if(!mountedRef.current) return;
		setCopyNoticeVisible(true);
		clearTimeout(copyNoticeTimerRef.current);
		copyNoticeTimerRef.current = setTimeout(() => setCopyNoticeVisible(false), COPY_NOTICE_MS);
	};

	const handleCommand = (command: CommandOption) => {
		if(command.name === 'new')
		{
			handleNewChat();
			return;
		}

		if(command.name === 'slides')
		{
			setDraft('');
			sendText(SLIDES_PROMPT, []);
			return;
		}

		if(!activeChat) return;
		const chatId = activeChat.id;

		if(command.name === 'rename')
		{
			setEditingId(activeChat.id);
			return;
		}

		if(command.name === 'delete')
		{
			setChatPendingDeletion(activeChat);
			return;
		}

		if(command.name === 'edit')
		{
			const latestUserMessage = activeChat.messages.find((m): m is ChatTextMessage => m.kind === 'message' && m.id === lastUserMessageId);
			if(latestUserMessage) handleStartEditMessage(latestUserMessage);
			return;
		}

		if(command.name === 'copy' || command.name === 'retry')
		{
			const latestReply = [...activeChat.messages].reverse().find((m): m is ChatTextMessage => m.kind === 'message' && m.sender === 'ai');
			if(!latestReply) return;

			if(command.name === 'copy')
			{
				handleCopyReply(latestReply.text);
				return;
			}

			const hasThread = activeChat.threadRefs.some((t) => t.rootMessageId === latestReply.id);
			const canRegenerate = !hasThread && hasPrecedingUserMessage(activeChat.messages, activeChat.messages.indexOf(latestReply));
			if(canRegenerate) regenerateMessage(chatId, latestReply.id);
			return;
		}

		if(command.name === 'thread')
		{
			const latest = [...activeChat.messages].reverse().find((m) => m.kind === 'message');
			if(!latest) return;
			const threadRef = activeChat.threadRefs.find((t) => t.rootMessageId === latest.id);
			if(threadRef) handleOpenThread(chatId, threadRef.id, latest.id);
			else handleStartThread(chatId, latest.id);
			return;
		}

		const commandMessage: ChatMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'user', text: `/${command.name}` };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, commandMessage] } : c)));

		if(command.name === 'compact')
		{
			const count = activeChat.messages.length;
			if(count === 0) return;
			const checkpoint: ChatMessage = {
				id:    nextMessageIdRef.current++,
				kind:  'checkpoint',
				label: `Compacted · ${count} message${count === 1 ? '' : 's'} summarized`,
			};
			setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, checkpoint] } : c)));
			return;
		}

		if(command.name === 'clear') setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [] } : c)));
	};

	const renderThreadTrailing = (msg: ChatTextMessage, index: number) => {
		if(!activeThread) return null;
		const { threadId } = activeThread;
		const messages = threadMessages[threadId] ?? [];
		const isAi = msg.sender === 'ai';

		return (
			<MessageActionsRow
				align={msg.sender === 'user' ? 'end' : 'start'}
				messageId={msg.id}
				text={msg.text}
				showReplyTrigger={false}
				onReply={() => {}}
				showEdit={msg.sender === 'user' && msg.id === findLastUserMessageId(messages) && !isThreadGenerating}
				onEdit={() => handleStartEditMessage(msg)}
				showRefresh={isAi && !isThreadGenerating && hasPrecedingUserMessage(messages, index)}
				regenerating={threadConversation.regeneratingMessageId === msg.id}
				onRefresh={() => regenerateThreadMessage(msg.id)}
				versionNav={buildVersionNav(msg, (i) => setThreadVersionIndex(threadId, msg.id, i))}
			/>
		);
	};

	const renderRootMessage = (m: ChatMessage) => (
		<ChatMessageRow
			key={m.id}
			message={m}
			onStreamComplete={handleMainStreamComplete}
			onQuestionnaireAnswer={handleQuestionnaireAnswer}
			renderTrailing={(msg) => (
				<MessageActionsRow
					align={msg.sender === 'user' ? 'end' : 'start'}
					messageId={msg.id}
					text={msg.text}
					showReplyTrigger={false}
					onReply={() => {}}
					showEdit={false}
					onEdit={() => {}}
					showRefresh={false}
					regenerating={false}
					onRefresh={() => {}}
				/>
			)}
		/>
	);

	const renderReplyMessage = (m: ChatMessage, index: number) => (
		<ChatMessageRow
			key={m.id}
			message={m}
			onStreamComplete={handleThreadStreamComplete}
			onQuestionnaireAnswer={handleThreadQuestionnaireAnswer}
			editing={editingMessageId === m.id}
			editDraft={editDraft}
			onEditDraftChange={setEditDraft}
			onCancelEdit={handleCancelEditMessage}
			onSubmitEdit={() => handleResendThreadEdit(m.id)}
			renderTrailing={(msg) => renderThreadTrailing(msg, index)}
		/>
	);

	const threadPanel = activeThread && activeChat ? (
		<ThreadPanel
			inDrawer={isMobile}
			title={activeChat.title}
			rootMessages={getThreadRootMessage(activeThread.chatId, activeThread.rootMessageId)}
			threadMessages={threadMessages[activeThread.threadId] ?? []}
			loading={loadingThreadId === activeThread.threadId}
			isTyping={isThreadTyping}
			composer={{
				draft:         threadDraft,
				onDraftChange: setThreadDraft,
				onSubmit:      handleThreadSubmit,
				isGenerating:  isThreadGenerating,
				onStop:        handleThreadStop,
				attachedFiles: threadAttachedFiles,
				onAttach:      setThreadAttachedFiles,
				commands:      [],
				onCommand:     () => {},
				placeholder:   'Reply in thread…',
				inputLabel:    'Thread reply',
				sendLabel:     'Send reply',
				modelPicker,
			}}
			renderRoot={renderRootMessage}
			renderReply={renderReplyMessage}
			expanded={expanded}
			onToggleExpand={handleToggleExpand}
			onClose={handleCloseThread}
		/>
	) : null;

	const chatSheets = openDocKey && openDeck ? sheetPanel.sheetsOf(activeChat?.id) : null;

	const deckPanel = chatSheets && openDocKey && openDeck ? (
		<DeckPanel
			inDrawer={isMobile}
			key={openDocKey}
			deck={openDeck}
			activity={deckActivity}
			note={deckNote}
			onChange={(next, coalesceKey) => liveDeck.change(openDocKey, next, coalesceKey)}
			history={{ undo: () => liveDeck.undo(openDocKey), redo: () => liveDeck.redo(openDocKey), canUndo: liveDeck.canUndo(openDocKey), canRedo: liveDeck.canRedo(openDocKey) }}
			expanded={expanded}
			onToggleExpand={handleToggleExpand}
			onClose={handleCloseDeck}
			onAsk={handleAskAboutSlide}
			chartData={{
				sheets:  Array.from(chatSheets, ([id, sheet]) => ({ id, title: sheet.title })),
				resolve: source => resolveSheetChart(chatSheets, source),
			}}
		/>
	) : null;

	const sheetPanelNode = sheetPanel.renderPanel({ expanded, onToggleExpand: handleToggleExpand, onClose: handleCloseSheet });

	const artifactsPanel = openArtifacts ? (
		<ArtifactsPanel
			inDrawer={isMobile}
			entries={artifactEntries}
			openKey={openArtifacts.key}
			onSelect={(key) => setArtifactView({ ...openArtifacts, key })}
			onOpenDocument={handleOpenDocumentEntry}
			onArtifactChange={(artifactId, content) => handleArtifactChange(openArtifacts.chatId, artifactId, content)}
			expanded={expanded}
			onToggleExpand={handleToggleExpand}
			onClose={handleCloseArtifacts}
		/>
	) : null;

	return (
		<div className='w-full'>
			<div className='flex h-[32rem] w-full max-w-6xl overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border'>
				<SidebarSlot mobile={isMobile} open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<Sidebar
					width={isMobile ? 'w-full' : 'w-64'}
					height='h-full'
					headerHeight='h-16'
					collapsible={!isMobile}
					collapsed={railCollapsed}
					onCollapsedChange={setSidebarCollapsed}
				>
					<SidebarHeader>
						<span className='truncate px-1 text-sm font-semibold text-text'>{APP_NAME}</span>
					</SidebarHeader>
					<SidebarTools collapsed={railCollapsed} searchRef={searchTriggerRef} onSearch={() => setSearchOpen(true)} onNewChat={handleNewChat} />
					<ChatList chats={chats} status={chatsStatus} activeId={activeId} editingId={editingId} onEditingChange={setEditingId} onSelect={handleSelectChat} onRename={handleRename} onDelete={setChatPendingDeletion} />
					<SidebarFooter>
						<ProfileCard name={displayName} modelLabel={modelLabel} collapsed={railCollapsed} onOpen={() => setSettingsOpen(true)} />
					</SidebarFooter>
				</Sidebar>
				</SidebarSlot>

				<Resizable direction='horizontal' className='flex-1 min-w-0'>
					<ResizablePanel minSize={280} className={expanded ? 'hidden' : 'flex'}>
						<div className='flex min-w-0 flex-1 flex-col'>
							{chatsStatus === 'ready' ? (
								<>
									<div className='flex h-16 items-center gap-2 border-b-[length:var(--border-width)] border-surface-border px-4'>
										{isMobile && (
											<Button variant='ghost' size='icon-sm' aria-label='Open chats' aria-haspopup='dialog' onClick={() => setSidebarOpen(true)}>
												<MenuIcon />
											</Button>
										)}
										<div className='min-w-0'>
											<h3 className='truncate text-base font-semibold text-text'>{activeChat?.title ?? 'New chat'}</h3>
											<p className='text-xs text-text-muted'>{modelLabel} model</p>
										</div>
										{activeChat && artifactEntries.length > 0 && (
											<Button
												id='artifacts-trigger'
												variant='ghost'
												size='sm'
												className='ml-auto shrink-0 gap-1.5'
												aria-haspopup='dialog'
												aria-label={`Artifacts, ${artifactEntries.length}`}
												onClick={() => handleOpenArtifacts(activeChat.id, null, 'artifacts-trigger')}
											>
												<FileIcon />
												<span aria-hidden='true'>{artifactEntries.length}</span>
											</Button>
										)}
									</div>
									<div className='relative flex min-h-0 flex-1 flex-col'>
										<ScrollFade ref={containerRef} direction='vertical' className='h-full' wrapperClassName='min-h-0 flex-1'>
											<div ref={contentRef} role='log' aria-label='Conversation' aria-busy={isGenerating} className='flex min-h-full shrink-0 flex-col gap-4 p-5 pb-28'>
												{!activeChat || activeChat.messages.length === 0 ? (
													<div className='flex flex-1 flex-col items-center justify-center gap-1.5 text-center'>
														<Greeting />
														<p className='text-sm text-text-muted'>Send a message to start the conversation.</p>
													</div>
												) : (
													<>
														<Divider label='Conversation starts here' />
														{activeChat.messages.map((m, index) => (
															<ChatMessageRow
																key={m.id}
																message={m}
																onStreamComplete={handleMainStreamComplete}
																onQuestionnaireAnswer={handleQuestionnaireAnswer}
																editing={editingMessageId === m.id}
																editDraft={editDraft}
																onEditDraftChange={setEditDraft}
																onCancelEdit={handleCancelEditMessage}
																onSubmitEdit={() => handleResendEdit(activeChat.id, m.id)}
																renderArtifact={(msg) => (
																<>
																	{renderDeckCard(activeChat.id, msg, activeChat.messages.slice(0, index))}
																	{sheetPanel.renderCard(activeChat.id, msg, activeChat.messages.slice(0, index))}
																	{msg.artifacts?.map((artifact) => (
																		<ArtifactCard
																			key={artifact.id}
																			artifact={artifact}
																			onOpen={() => handleOpenArtifacts(activeChat.id, artifact.id, `artifact-open-${artifact.id}`)}
																		/>
																	))}
																</>
															)}
																renderTrailing={(msg) => {
																	const threadRef    = activeChat.threadRefs.find((t) => t.rootMessageId === msg.id);
																	const replyCount    = threadRef ? (threadMessages[threadRef.id]?.length ?? threadRef.replyCount) : 0;
																	const threadLoading = threadRef ? loadingThreadId === threadRef.id : false;
																	const hasThreadPill = !!threadRef && (threadLoading || replyCount > 0);
																	const isAi          = msg.sender === 'ai';
																	const isLatestUser  = msg.sender === 'user' && msg.id === lastUserMessageId;
																	const versionNav    = buildVersionNav(msg, (i) => setMessageVersionIndex(activeChat.id, msg.id, i));
																	const onReply = () => (threadRef
																		? handleOpenThread(activeChat.id, threadRef.id, msg.id)
																		: handleStartThread(activeChat.id, msg.id)
																	);

																	return (
																		<MessageActionsRow
																			align={msg.sender === 'user' ? 'end' : 'start'}
																			messageId={msg.id}
																			text={msg.text}
																			showReplyTrigger={isAi && !hasThreadPill}
																			onReply={onReply}
																			showEdit={isLatestUser && !isGenerating}
																			onEdit={() => handleStartEditMessage(msg)}
																			showRefresh={isAi && !isGenerating && !threadRef && hasPrecedingUserMessage(activeChat.messages, index)}
																			regenerating={mainConversation.regeneratingMessageId === msg.id}
																			onRefresh={() => regenerateMessage(activeChat.id, msg.id)}
																			versionNav={versionNav}
																			threadPill={hasThreadPill ? { replyCount, loading: threadLoading } : undefined}
																		/>
																	);
																}}
															/>
														))}
													</>
												)}
												{isTyping && <TypingPhrase />}
											</div>
										</ScrollFade>
										<div className='absolute inset-x-0 bottom-0 p-4'>
											<div role='status' className='empty:hidden'>
												{copyNoticeVisible && <p className='pb-1.5 text-center text-xs text-text-muted'>Copied latest reply</p>}
											</div>
											<Composer
												draft={draft}
												onDraftChange={setDraft}
												onSubmit={handleSubmit}
												isGenerating={isGenerating}
												onStop={handleStop}
												attachedFiles={attachedFiles}
												onAttach={setAttachedFiles}
												commands={COMMANDS}
												onCommand={handleCommand}
												placeholder='Message… (try /compact)'
												inputLabel='Message'
												sendLabel='Send message'
											references={slideRefs}
											onRemoveReference={(index) => setSlideRefs((prev) => prev.filter((_, i) => i !== index))}
											id={MAIN_COMPOSER_ID}
												modelPicker={modelPicker}
											/>
										</div>
									</div>
								</>
							) : (
								<div className='flex flex-1 items-center justify-center p-6 text-center'>
									{chatsStatus === 'loading' ? (
										<Spinner size='sm' />
									) : (
										<p className='text-sm text-text-muted'>Couldn’t load chats. Refresh to try again.</p>
									)}
								</div>
							)}
						</div>
					</ResizablePanel>

				{!isMobile && activeThread && activeChat && (
					<DesktopPanel label='Thread' size={THREAD_SIZE} expanded={expanded} onSnap={handleSnapExpand}>{threadPanel}</DesktopPanel>
				)}

				{!isMobile && openDocKey && openDeck && (
					<DesktopPanel label='Slides' size={DECK_SIZE} expanded={expanded} onSnap={handleSnapExpand}>{deckPanel}</DesktopPanel>
				)}

				{!isMobile && sheetPanel.isOpen && (
					<DesktopPanel label='Sheet' size={SHEET_SIZE} expanded={expanded} onSnap={handleSnapExpand}>{sheetPanelNode}</DesktopPanel>
				)}

				{!isMobile && openArtifacts && (
					<DesktopPanel label='Artifacts' size={ARTIFACTS_SIZE} expanded={expanded} onSnap={handleSnapExpand}>{artifactsPanel}</DesktopPanel>
				)}
				</Resizable>
			</div>

			{isMobile && (
				<>
					<MobilePanel label='Thread' side='right' open={Boolean(activeThread && activeChat)} onClose={handleCloseThread}>{threadPanel}</MobilePanel>
					<MobilePanel label='Slides' open={Boolean(openDocKey && openDeck)} onClose={handleCloseDeck}>{deckPanel}</MobilePanel>
					<MobilePanel label='Sheet' open={sheetPanel.isOpen} onClose={handleCloseSheet}>{sheetPanelNode}</MobilePanel>
					<MobilePanel label='Artifacts' open={Boolean(openArtifacts)} onClose={handleCloseArtifacts}>{artifactsPanel}</MobilePanel>
				</>
			)}

			<DeleteChatModal chat={chatPendingDeletion} onCancel={() => setChatPendingDeletion(null)} onConfirm={handleConfirmDelete} />

			<SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onChange={setSettings} />

			<ChatSearch
				open={searchOpen}
				onOpenChange={setSearchOpen}
				chats={chats}
				threadMessages={threadMessages}
				onSelectHit={handleSelectHit}
				returnFocusRef={searchTriggerRef}
			/>
		</div>
	);
};

export default AiChat;
