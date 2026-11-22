'use client';

import CommandPalette, { CommandGroup, CommandItem } from '../../components/CommandPalette/CommandPalette';
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { ChatEntry, ChatMessage, SearchHit } from './types';
import { searchMessages, buildSearchCorpus } from './chatApi';
import { ReplyIcon } from './icons';

const SEARCH_DEBOUNCE_MS = 200;

export interface ChatSearchProps {
	open:           boolean;
	onOpenChange:   (open: boolean) => void;
	chats:          ChatEntry[];
	threadMessages: Record<string, ChatMessage[]>;
	onSelectHit:    (hit: SearchHit) => void;
	/** Focus returns here when the palette closes. */
	returnFocusRef: RefObject<HTMLElement | null>;
}

/** The ⌘K palette over every chat and thread. Registers the shortcut itself. */
export const ChatSearch = ({ open, onOpenChange, chats, threadMessages, onSelectHit, returnFocusRef }: ChatSearchProps) => {
	const [hits, setHits] = useState<SearchHit[]>([]);
	const [loading, setLoading] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		const handleShortcut = (e: KeyboardEvent) => {
			if(!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return;
			e.preventDefault();
			onOpenChange(true);
		};
		window.addEventListener('keydown', handleShortcut);
		return () => window.removeEventListener('keydown', handleShortcut);
	}, [onOpenChange]);

	useEffect(() => () =>
	{
		clearTimeout(timerRef.current);
		abortRef.current?.abort();
	}, []);

	const handleQueryChange = (query: string) => {
		clearTimeout(timerRef.current);
		abortRef.current?.abort();

		const trimmed = query.trim();
		if(!trimmed)
		{
			setHits([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		timerRef.current = setTimeout(() => {
			const controller = new AbortController();
			abortRef.current = controller;
			searchMessages(trimmed, buildSearchCorpus(chats, threadMessages), controller.signal)
				.then((found) => {
					setHits(found);
					setLoading(false);
				})
				.catch((err) => {
					if(err.name === 'AbortError') return;
					setHits([]);
					setLoading(false);
				});
		}, SEARCH_DEBOUNCE_MS);
	};

	const handleClose = () => {
		onOpenChange(false);
		returnFocusRef.current?.focus();
	};

	return (
		<CommandPalette
			open={open}
			onClose={handleClose}
			placeholder='Search every chat and thread…'
			onQueryChange={handleQueryChange}
			filter={false}
			loading={loading}
		>
			{chats.filter((c) => hits.some((h) => h.chatId === c.id)).map((chat) => (
				<CommandGroup key={chat.id} label={chat.title}>
					{hits.filter((h) => h.chatId === chat.id).map((hit) => (
						<CommandItem
							key={`${hit.threadId ?? 'main'}-${hit.messageId}`}
							value={hit.snippet}
							icon={hit.threadId ? <ReplyIcon /> : undefined}
							onSelect={() => onSelectHit(hit)}
						>
							{hit.snippet}
						</CommandItem>
					))}
				</CommandGroup>
			))}
		</CommandPalette>
	);
};

export default ChatSearch;
