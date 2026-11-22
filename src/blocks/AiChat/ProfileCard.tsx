'use client';

import Avatar from '../../components/Avatar/Avatar';
import { ChevronRightIcon } from './icons';

export interface ProfileCardProps {
	name:       string;
	modelLabel: string;
	collapsed:  boolean;
	onOpen:     () => void;
}

export const ProfileCard = ({ name, modelLabel, collapsed, onOpen }: ProfileCardProps) => (
	<button
		type='button'
		aria-haspopup='dialog'
		aria-label={collapsed ? `${name}, settings` : undefined}
		onClick={onOpen}
		className={[
			`flex w-full items-center rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface-panel text-left shadow-[var(--shadow-sm)] ${collapsed ? 'justify-center p-1' : 'gap-2.5 p-2'}`,
			'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
			'hover:border-surface-border-hover hover:bg-surface-hover',
			'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
		].join(' ')}
	>
		<Avatar name={name} shape='square' size='md' />
		{!collapsed && (
			<>
				<span className='flex min-w-0 flex-1 flex-col items-start'>
					<span className='w-full truncate text-sm font-medium text-text'>{name}</span>
					<span className='w-full truncate text-xs text-text-muted'>{modelLabel} model</span>
				</span>
				<ChevronRightIcon className='shrink-0 text-text-muted' />
			</>
		)}
	</button>
);

export default ProfileCard;
