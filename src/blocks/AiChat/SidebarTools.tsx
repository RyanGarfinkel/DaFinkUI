'use client';

import Button from '../../components/Button/Button';
import { PlusIcon, SearchIcon } from './icons';
import type { Ref } from 'react';

export interface SidebarToolsProps {
	collapsed:  boolean;
	searchRef:  Ref<HTMLButtonElement>;
	onSearch:   () => void;
	onNewChat:  () => void;
}

const SEARCH_BUTTON = [
	'flex h-8 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border px-2.5 text-sm text-text-subtle',
	'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
	'hover:bg-surface-hover hover:text-text-muted',
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
].join(' ');

const NEW_CHAT_BUTTON = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring';

const RAIL_SEARCH_BUTTON = 'flex h-8 w-8 items-center justify-center rounded-[var(--radius)] text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring';

export const SidebarTools = ({ collapsed, searchRef, onSearch, onNewChat }: SidebarToolsProps) => {
	if(collapsed)
	{
		return (
			<div className='flex flex-col items-center gap-2'>
				<Button variant='ghost' size='icon-sm' aria-label='Start a new chat' onClick={onNewChat}>
					<PlusIcon />
				</Button>
				<button ref={searchRef} type='button' aria-label='Search all messages' aria-keyshortcuts='Meta+K Control+K' onClick={onSearch} className={RAIL_SEARCH_BUTTON}>
					<SearchIcon />
				</button>
			</div>
		);
	}

	return (
		<div className='flex items-center gap-1.5'>
			<button ref={searchRef} type='button' aria-label='Search all messages' aria-keyshortcuts='Meta+K Control+K' onClick={onSearch} className={SEARCH_BUTTON}>
				<SearchIcon />
				<span className='min-w-0 flex-1 truncate text-left'>Search…</span>
				<kbd className='shrink-0 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border px-1.5 py-0.5 text-[11px] font-medium text-text-muted select-none'>⌘K</kbd>
			</button>
			<button type='button' aria-label='Start a new chat' onClick={onNewChat} className={NEW_CHAT_BUTTON}>
				<PlusIcon />
			</button>
		</div>
	);
};

export default SidebarTools;
