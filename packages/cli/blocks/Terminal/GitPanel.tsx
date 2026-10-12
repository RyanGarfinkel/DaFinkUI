'use client';

import Badge, { type BadgeVariant } from '../../components/Badge/Badge';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import type { GitStatus } from './types';

interface GitPanelProps {
	git:     GitStatus | null;
	status:  'loading' | 'ready' | 'error';
	onOpen:  (path: string) => void;
}

const STATUS_LABELS = { M: 'Modified', A: 'Added', U: 'Untracked' } as const;
const STATUS_VARIANTS: Record<keyof typeof STATUS_LABELS, BadgeVariant> = { M: 'warning', A: 'success', U: 'default' };

export const GitPanel = ({ git, status, onOpen }: GitPanelProps) => {
	if(status === 'loading')
	{
		return (
			<div className='flex flex-col gap-2 p-3'>
				<Skeleton height='16px' width='40%' />
				<Skeleton height='16px' width='80%' />
				<Skeleton height='16px' width='65%' />
			</div>
		);
	}

	if(status === 'error' || !git) return <p role='alert' className='p-3 text-sm text-danger'>Couldn’t load source control.</p>;

	return (
		<div className='flex flex-col gap-3 p-3'>
			<p className='text-sm text-text'>
				On branch <span className='font-mono font-medium'>{git.branch}</span>
			</p>

			{git.changes.length === 0 ? (
				<p className='text-sm text-text-muted'>No changes. Working tree clean.</p>
			) : (
				<ul className='flex flex-col gap-1'>
					{git.changes.map((change) => (
						<li key={change.path}>
							<button
								type='button'
								onClick={() => onOpen(change.path)}
								className='flex w-full items-center justify-between gap-2 rounded-[var(--radius)] px-2 py-1 text-left text-sm text-text transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring active:bg-surface-active'
							>
								<span className='truncate'>{change.path}</span>
								<Badge variant={STATUS_VARIANTS[change.status]}>{STATUS_LABELS[change.status]}</Badge>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default GitPanel;
