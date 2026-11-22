'use client';

import { SidebarButton, SidebarSection, SidebarSkeleton } from '../../components/Sidebar/Sidebar';
import Input from '../../components/Input/Input';
import { KeyboardEvent, useState } from 'react';
import { PencilIcon, TrashIcon } from './icons';
import type { ChatEntry } from './types';

export interface ChatListProps {
	chats:           ChatEntry[];
	status:          'loading' | 'ready' | 'error';
	activeId:        string | null;
	editingId:       string | null;
	onEditingChange: (id: string | null) => void;
	onSelect:        (id: string) => void;
	onRename:        (id: string, title: string) => void;
	onDelete:        (chat: ChatEntry) => void;
}

const SKELETON_ROWS = 7;

const ACTION = 'flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring';

interface RenameFieldProps {
	title:    string;
	onCommit: (title: string) => void;
	onCancel: () => void;
}

const RenameField = ({ title, onCommit, onCancel }: RenameFieldProps) => {
	const [draft, setDraft] = useState(title);

	const commit = () => {
		const trimmed = draft.trim();
		if(trimmed) onCommit(trimmed);
		else onCancel();
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if(e.key === 'Enter') { e.preventDefault(); commit(); }
		if(e.key === 'Escape') { e.preventDefault(); onCancel(); }
	};

	return <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={handleKeyDown} aria-label='Chat title' />;
};

export const ChatList = ({ chats, status, activeId, editingId, onEditingChange, onSelect, onRename, onDelete }: ChatListProps) => (
	<SidebarSection label='Chats'>
		{chats.map((chat) => (
			editingId === chat.id ? (
				<RenameField
					key={chat.id}
					title={chat.title}
					onCommit={(title) => { onRename(chat.id, title); onEditingChange(null); }}
					onCancel={() => onEditingChange(null)}
				/>
			) : (
				<SidebarButton
					key={chat.id}
					isActive={activeId === chat.id}
					onClick={() => onSelect(chat.id)}
					actionGutter='pr-16'
					action={
						<div className='flex items-center gap-0.5'>
							<button type='button' aria-label={`Rename ${chat.title}`} onClick={() => onEditingChange(chat.id)} className={`${ACTION} hover:bg-surface-hover hover:text-text`}>
								<PencilIcon />
							</button>
							<button type='button' aria-label={`Delete ${chat.title}`} onClick={() => onDelete(chat)} className={`${ACTION} hover:bg-danger/10 hover:text-danger`}>
								<TrashIcon />
							</button>
						</div>
					}
				>
					{chat.title}
				</SidebarButton>
			)
		))}
		{status === 'loading' && <SidebarSkeleton count={SKELETON_ROWS} aria-label='Loading chats' />}
		{status === 'error' && <p className='px-3 py-2 text-xs text-text-muted'>Couldn’t load chats. Refresh to try again.</p>}
		{status === 'ready' && chats.length === 0 && <p className='px-3 py-2 text-xs text-text-muted'>No chats yet.</p>}
	</SidebarSection>
);
