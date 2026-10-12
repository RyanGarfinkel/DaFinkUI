'use client';

import { describeAttachments, buildHistory, findLastUserMessageId, hasPrecedingUserMessage, DRAFT_TITLE_MAX_LENGTH } from './messageHelpers';
import { Sidebar, SidebarButton, SidebarFooter, SidebarHeader, SidebarSection, SidebarSkeleton } from '../../components/Sidebar/Sidebar';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import type { ChatTextMessage, ChatMessage, ThreadRef, ChatEntry, SearchHit, MessageAttachment } from './types';
import CommandPalette, { CommandGroup, CommandItem } from '../../components/CommandPalette/CommandPalette';
import { PlusIcon, PencilIcon, TrashIcon, ReplyIcon, SearchIcon, ChevronRightIcon } from './icons';
import { Resizable, ResizablePanel, ResizableHandle } from '../../components/Resizable/Resizable';
import { MessageActionsRow, ChatMessageRow, buildVersionNav, Divider } from './MessageRow';
import { fetchChats, fetchThread, searchMessages, buildSearchCorpus } from './chatApi';
import { COMMANDS, MODEL_OPTIONS, EFFORT_OPTIONS, CONNECTORS } from './constants';
import { type CommandOption } from '../../components/CommandInput/CommandInput';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import { Greeting, TypingPhrase, USER_NAME } from './Phrases';
import Spinner from '../../components/Spinner/Spinner';
import { useConversation } from './useConversation';
import Button from '../../components/Button/Button';
import Avatar from '../../components/Avatar/Avatar';
import Switch from '../../components/Switch/Switch';
import Select from '../../components/Select/Select';
import Input from '../../components/Input/Input';
import ThreadPanel from './ThreadPanel';
import Composer from './Composer';

export type { ChatTextMessage, ChatMessage, ThreadRef, ChatEntry, AiChatHistoryMessage, AiChatReply, SearchCorpusEntry, SearchHit, MessageAttachment } from './types';

const SEARCH_DEBOUNCE_MS = 200;

const SKELETON_CHAT_ROWS = 7;

const COPY_NOTICE_MS = 2000;

const NEAR_BOTTOM_THRESHOLD_PX = 80;

export const AiChat = () => {
	const [chats, setChats] = useState<ChatEntry[]>([]);
	const [chatsStatus, setChatsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
	const [activeId, setActiveId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draftTitle, setDraftTitle] = useState('');
	const [draft, setDraft] = useState('');
	const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
	const [threadAttachedFiles, setThreadAttachedFiles] = useState<File[]>([]);
	const [chatPendingDeletion, setChatPendingDeletion] = useState<ChatEntry | null>(null);
	const [threadMessages, setThreadMessages] = useState<Record<string, ChatMessage[]>>({});
	const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
	const [activeThread, setActiveThread] = useState<{ chatId: string; threadId: string; rootMessageId: number } | null>(null);
	const [threadDraft, setThreadDraft] = useState('');
	const [copyNoticeVisible, setCopyNoticeVisible] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [displayName, setDisplayName] = useState(USER_NAME);
	const [model, setModel] = useState(MODEL_OPTIONS[1].value);
	const [effort, setEffort] = useState(EFFORT_OPTIONS[1].value);
	const [enabledConnectors, setEnabledConnectors] = useState<string[]>([]);
	const [autoTitleEnabled, setAutoTitleEnabled] = useState(true);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [pendingScrollMessageId, setPendingScrollMessageId] = useState<number | null>(null);
	const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
	const [editDraft, setEditDraft] = useState('');
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const searchTriggerRef = useRef<HTMLButtonElement>(null);
	const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const searchAbortRef = useRef<AbortController | null>(null);
	const copyNoticeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const mountedRef = useRef(true);
	const nextChatId = useRef(1);
	const nextThreadId = useRef(1);
	const nextMessageIdRef = useRef(1);
	// True as long as the user hasn't scrolled away from the bottom. Auto-scroll (below)
	// only acts while this is true, so reading back through history — including while a
	// reply is still streaming in — never gets yanked back down. Reset to true whenever
	// the user does something that should re-anchor the view (send a message, switch chats).
	const shouldAutoScrollRef = useRef(true);

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
	const modelPicker = { model, effort, onModelChange: setModel, onEffortChange: setEffort };
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
		const container = containerRef.current;
		const content   = contentRef.current;
		if(!container || !content) return;

		const handleScroll = () => {
			const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
			shouldAutoScrollRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
		};
		container.addEventListener('scroll', handleScroll, { passive: true });

		const scrollToBottom = () => {
			if(shouldAutoScrollRef.current) container.scrollTop = container.scrollHeight;
		};
		scrollToBottom();

		// Content keeps growing for as long as a reply streams in (typewriter reveal, table
		// rows appending, favicon images loading), so this stays observing for the effect's
		// whole lifetime rather than a fixed window — safe to leave running indefinitely
		// since scrollToBottom above already no-ops once the user has scrolled away.
		const observer = new ResizeObserver(scrollToBottom);
		observer.observe(content);

		return () => {
			container.removeEventListener('scroll', handleScroll);
			observer.disconnect();
		};
	}, [chats, isTyping, activeId]);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			clearTimeout(copyNoticeTimerRef.current);
			clearTimeout(searchTimerRef.current);
			searchAbortRef.current?.abort();
		};
	}, []);

	useEffect(() => {
		const handleShortcut = (e: globalThis.KeyboardEvent) => {
			if(!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return;
			e.preventDefault();
			setSearchOpen(true);
		};
		window.addEventListener('keydown', handleShortcut);
		return () => window.removeEventListener('keydown', handleShortcut);
	}, []);

	useEffect(() => {
		if(pendingScrollMessageId === null) return;
		const target = document.querySelector(`[data-message-id="${pendingScrollMessageId}"]`);
		if(!target) return;
		target.scrollIntoView({ block: 'center', behavior: 'smooth' });
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPendingScrollMessageId(null);
	}, [pendingScrollMessageId, activeId, activeThread, threadMessages]);

	const handleSearchQueryChange = (query: string) => {
		clearTimeout(searchTimerRef.current);
		searchAbortRef.current?.abort();

		const trimmed = query.trim();
		if(!trimmed)
		{
			setSearchHits([]);
			setSearchLoading(false);
			return;
		}

		setSearchLoading(true);
		searchTimerRef.current = setTimeout(() => {
			const controller = new AbortController();
			searchAbortRef.current = controller;
			searchMessages(trimmed, buildSearchCorpus(chats, threadMessages), controller.signal)
				.then((hits) => {
					setSearchHits(hits);
					setSearchLoading(false);
				})
				.catch((err) => {
					if(err.name === 'AbortError') return;
					setSearchHits([]);
					setSearchLoading(false);
				});
		}, SEARCH_DEBOUNCE_MS);
	};

	const handleCloseSearch = () => {
		setSearchOpen(false);
		searchTriggerRef.current?.focus();
	};

	const handleSelectHit = (hit: SearchHit) => {
		shouldAutoScrollRef.current = false;
		setPendingScrollMessageId(hit.messageId);
		if(hit.threadId !== undefined && hit.rootMessageId !== undefined)
		{
			handleOpenThread(hit.chatId, hit.threadId, hit.rootMessageId);
			return;
		}
		if(activeThread?.chatId !== hit.chatId) setActiveThread(null);
		setActiveId(hit.chatId);
	};

	// Doesn't touch `chats` — the draft only becomes a real, sidebar-visible chat once its
	// first message is sent (see handleSubmit).
	const handleNewChat = () => {
		shouldAutoScrollRef.current = true;
		setActiveId(null);
		setDraft('');
		setAttachedFiles([]);
	};

	const handleSelectChat = (id: string) => {
		shouldAutoScrollRef.current = true;
		setActiveId(id);
		setDraft('');
		setAttachedFiles([]);
	};

	const handleStartEdit = (chat: ChatEntry) => {
		setEditingId(chat.id);
		setDraftTitle(chat.title);
	};

	const handleCommitEdit = () => {
		const title = draftTitle.trim();
		if(title) setChats((prev) => prev.map((c) => (c.id === editingId ? { ...c, title } : c)));
		setEditingId(null);
	};

	const handleCancelEdit = () => setEditingId(null);

	const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if(e.key === 'Enter') { e.preventDefault(); handleCommitEdit(); }
		if(e.key === 'Escape') { e.preventDefault(); handleCancelEdit(); }
	};

	const handleDelete = (id: string) => {
		setChats((prev) => {
			const next = prev.filter((c) => c.id !== id);
			if(activeId === id) setActiveId(next[0]?.id ?? null);
			return next;
		});
		if(editingId === id) setEditingId(null);
	};

	const handleDeleteOpenChange = (open: boolean) => {
		if(!open) setChatPendingDeletion(null);
	};

	const handleConfirmDelete = () => {
		if(!chatPendingDeletion) return;
		handleDelete(chatPendingDeletion.id);
		setChatPendingDeletion(null);
	};

	const handleStop = () => {
		if(activeChat) mainConversation.stop(activeChat.id);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if(chatsStatus !== 'ready' || isGenerating) return;
		const text = draft.trim();
		if(!text && attachedFiles.length === 0) return;

		const attachments: MessageAttachment[] = attachedFiles.map((file) => ({ name: file.name }));

		if(activeChat)
		{
			mainConversation.submit(activeChat.id, text, attachments);
		}
		else
		{
			// The active "chat" was only a draft — this first message is what earns it a real
			// id and a row in the sidebar. There's no existing `chats` entry yet for
			// mainConversation.submit() to append into, so this one chat is built directly,
			// message included, in a single setChats call instead.
			const chatId = String(nextChatId.current++);
			const userMessage: ChatMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'user', text, attachments };
			const rawTitle = text || describeAttachments(attachments);
			const title = autoTitleEnabled && rawTitle
				? rawTitle.length > DRAFT_TITLE_MAX_LENGTH ? `${rawTitle.slice(0, DRAFT_TITLE_MAX_LENGTH).trimEnd()}…` : rawTitle
				: 'New chat';
			setChats((prev) => [{ id: chatId, title, messages: [userMessage], threadRefs: [] }, ...prev]);
			setActiveId(chatId);
			mainConversation.queueReply(chatId, text || describeAttachments(attachments), []);
		}

		shouldAutoScrollRef.current = true;
		setDraft('');
		setAttachedFiles([]);
	};

	const handleQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeChat) return;
		shouldAutoScrollRef.current = true;
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

	const handleOpenThread = (chatId: string, threadId: string, rootMessageId: number) => {
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
		setActiveThread({ chatId, threadId, rootMessageId });
		setThreadDraft('');
		setThreadAttachedFiles([]);
	};

	const handleCloseThread = () => {
		const rootMessageId = activeThread?.rootMessageId;
		setActiveThread(null);
		if(rootMessageId !== undefined) document.getElementById(`thread-trigger-${rootMessageId}`)?.focus();
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

		if(!activeChat) return;
		const chatId = activeChat.id;

		if(command.name === 'rename')
		{
			handleStartEdit(activeChat);
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

	return (
		<div className='w-full'>
			<div className='flex h-[32rem] w-full max-w-6xl overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border'>
				<Sidebar width='w-64' height='h-full' headerHeight='h-16'>
					<SidebarHeader>
						<div className='flex w-full items-center gap-1.5'>
							<button
								ref={searchTriggerRef}
								type='button'
								aria-label='Search all messages'
								aria-keyshortcuts='Meta+K Control+K'
								onClick={() => setSearchOpen(true)}
								className={[
									'flex h-8 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border px-2.5 text-sm text-text-subtle',
									'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
									'hover:bg-surface-hover hover:text-text-muted',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
								].join(' ')}
							>
								<SearchIcon />
								<span className='min-w-0 flex-1 truncate text-left'>Search messages…</span>
								<kbd className='shrink-0 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border px-1.5 py-0.5 text-[11px] font-medium text-text-muted select-none'>⌘K</kbd>
							</button>
							<Button variant='primary' size='icon-sm' aria-label='Start a new chat' onClick={handleNewChat}>
								<PlusIcon />
							</Button>
						</div>
					</SidebarHeader>
					<SidebarSection label='Chats'>
						{chats.map((chat) => (
							editingId === chat.id ? (
								<Input
									key={chat.id}
									autoFocus
									value={draftTitle}
									onChange={(e) => setDraftTitle(e.target.value)}
									onBlur={handleCommitEdit}
									onKeyDown={handleEditKeyDown}
									aria-label='Chat title'
								/>
							) : (
								<SidebarButton
									key={chat.id}
									isActive={activeId === chat.id}
									onClick={() => handleSelectChat(chat.id)}
									actionGutter='pr-16'
									action={
										<div className='flex items-center gap-0.5'>
											<button
												type='button'
												aria-label={`Rename ${chat.title}`}
												onClick={() => handleStartEdit(chat)}
												className='flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
											>
												<PencilIcon />
											</button>
											<button
												type='button'
												aria-label={`Delete ${chat.title}`}
												onClick={() => setChatPendingDeletion(chat)}
												className='flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
											>
												<TrashIcon />
											</button>
										</div>
									}
								>
									{chat.title}
								</SidebarButton>
							)
						))}
						{chatsStatus === 'loading' && <SidebarSkeleton count={SKELETON_CHAT_ROWS} aria-label='Loading chats' />}
						{chatsStatus === 'error' && (
							<p className='px-3 py-2 text-xs text-text-muted'>Couldn’t load chats. Refresh to try again.</p>
						)}
						{chatsStatus === 'ready' && chats.length === 0 && (
							<p className='px-3 py-2 text-xs text-text-muted'>No chats yet.</p>
						)}
					</SidebarSection>
					<SidebarFooter>
						<button
							type='button'
							aria-haspopup='dialog'
							onClick={() => setSettingsOpen(true)}
							className={[
								'flex w-full items-center gap-2.5 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-2 text-left shadow-[var(--shadow-sm)]',
								'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
								'hover:border-surface-border-hover hover:bg-surface-hover',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
							].join(' ')}
						>
							<Avatar name={displayName} shape='square' size='md' />
							<span className='flex min-w-0 flex-1 flex-col items-start'>
								<span className='w-full truncate text-sm font-medium text-text'>{displayName}</span>
								<span className='w-full truncate text-xs text-text-muted'>{modelLabel} model</span>
							</span>
							<ChevronRightIcon className='shrink-0 text-text-muted' />
						</button>
					</SidebarFooter>
				</Sidebar>

				<Resizable direction='horizontal' className='flex-1 min-w-0'>
					<ResizablePanel minSize={280} className='flex'>
						<div className='flex min-w-0 flex-1 flex-col'>
							{chatsStatus === 'ready' ? (
								<>
									<div className='flex h-16 flex-col justify-center border-b-[length:var(--border-width)] border-surface-border px-4'>
										<h3 className='text-base font-semibold text-text'>{activeChat?.title ?? 'New chat'}</h3>
										<p className='text-xs text-text-muted'>{modelLabel} model</p>
									</div>
									<div className='relative flex min-h-0 flex-1 flex-col'>
										<ScrollFade ref={containerRef} direction='vertical' className='h-full' wrapperClassName='min-h-0 flex-1'>
											<div ref={contentRef} className='flex min-h-full shrink-0 flex-col gap-4 p-5 pb-28'>
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

				{activeThread && activeChat && (
					<>
						<ResizableHandle aria-label='Resize thread panel' />
						<ResizablePanel defaultSize={320} minSize={240} maxSize={480} className='flex'>
							<ThreadPanel
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
								onClose={handleCloseThread}
							/>
						</ResizablePanel>
					</>
				)}
				</Resizable>
			</div>

			<Modal open={chatPendingDeletion !== null} onOpenChange={handleDeleteOpenChange}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>Delete chat</ModalTitle>
				</ModalHeader>
				<ModalContent>
					{`Delete "${chatPendingDeletion?.title}"? This can't be undone.`}
				</ModalContent>
				<ModalFooter>
					<Button variant='secondary' onClick={() => setChatPendingDeletion(null)}>Cancel</Button>
					<Button variant='destructive' onClick={handleConfirmDelete}>Delete</Button>
				</ModalFooter>
			</Modal>

			<Modal size='lg' open={settingsOpen} onOpenChange={setSettingsOpen}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>AI chat settings</ModalTitle>
				</ModalHeader>
				<ModalContent>
					<div className='grid grid-cols-2 gap-x-8 gap-y-5'>
						<Input
							label='Display name'
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
						/>
						<Select
							label='Model'
							options={MODEL_OPTIONS}
							value={model}
							onChange={setModel}
						/>
						<div className='col-span-2 flex flex-col gap-3'>
							<p className='text-sm font-medium text-text'>Connectors</p>
							{CONNECTORS.map((connector) => (
								<Switch
									key={connector.id}
									checked={enabledConnectors.includes(connector.id)}
									onCheckedChange={(checked) => setEnabledConnectors((prev) => (checked ? [...prev, connector.id] : prev.filter((id) => id !== connector.id)))}
									label={connector.label}
									hint={connector.description}
								/>
							))}
						</div>
						<div className='col-span-2'>
							<Switch
								checked={autoTitleEnabled}
								onCheckedChange={setAutoTitleEnabled}
								label='Auto-title new chats'
								hint='Names a new chat after its first message instead of leaving it as "New chat".'
							/>
						</div>
					</div>
				</ModalContent>
				<ModalFooter>
					<Button onClick={() => setSettingsOpen(false)}>Done</Button>
				</ModalFooter>
			</Modal>

			<CommandPalette
				open={searchOpen}
				onClose={handleCloseSearch}
				placeholder='Search every chat and thread…'
				onQueryChange={handleSearchQueryChange}
				filter={false}
				loading={searchLoading}
			>
				{chats.filter((c) => searchHits.some((h) => h.chatId === c.id)).map((chat) => (
					<CommandGroup key={chat.id} label={chat.title}>
						{searchHits.filter((h) => h.chatId === chat.id).map((hit) => (
							<CommandItem
								key={`${hit.threadId ?? 'main'}-${hit.messageId}`}
								value={hit.snippet}
								icon={hit.threadId ? <ReplyIcon /> : undefined}
								onSelect={() => handleSelectHit(hit)}
							>
								{hit.snippet}
							</CommandItem>
						))}
					</CommandGroup>
				))}
			</CommandPalette>
		</div>
	);
};

export default AiChat;
