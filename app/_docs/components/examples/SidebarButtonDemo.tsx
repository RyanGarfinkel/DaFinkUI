'use client';

import { Sidebar, SidebarSection, SidebarButton } from '@/src/components/Sidebar/Sidebar';
import { useState } from 'react';

const NavIcon = ({ d }: { d: string }) => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d={d} />
	</svg>
);

const VIEWS = [
	{
		id:      'inbox',
		label:   'Inbox',
		icon:    'M3 4h18v6l-2 10H5L3 10V4Z M3 10h5l1 2h6l1-2h5',
		content: 'Inbox — 12 unread messages.',
	},
	{
		id:      'drafts',
		label:   'Drafts',
		icon:    'M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
		content: 'Drafts — 3 unsent messages.',
	},
	{
		id:      'sent',
		label:   'Sent',
		icon:    'M22 2 11 13 M22 2 15 22l-4-9-9-4Z',
		content: 'Sent — everything you’ve sent.',
	},
];

export const SidebarButtonDemo = () => {
	const [view, setView] = useState('inbox');
	const active = VIEWS.find(v => v.id === view) ?? VIEWS[0];

	return (
		<div className='flex h-64 w-full max-w-md overflow-hidden rounded-lg border border-surface-border'>
			<Sidebar width='w-36' height='h-full'>
				<SidebarSection>
					{VIEWS.map(v => (
						<SidebarButton
							key={v.id}
							icon={<NavIcon d={v.icon} />}
							isActive={view === v.id}
							onClick={() => setView(v.id)}
						>
							{v.label}
						</SidebarButton>
					))}
				</SidebarSection>
			</Sidebar>
			<div className='flex flex-1 items-center justify-center p-4 text-center text-sm text-text-muted'>
				{active.content}
			</div>
		</div>
	);
};
