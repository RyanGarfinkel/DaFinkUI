'use client';

import { Sidebar, SidebarHeader, SidebarFooter, SidebarSection, SidebarLink, SidebarDivider } from '@/src/components/Sidebar/Sidebar';
import Button from '@/src/components/Button/Button';
import { useState } from 'react';

const NavIcon = ({ d }: { d: string }) => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d={d} />
	</svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill={filled ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z' />
	</svg>
);

const FavoriteButton = ({ name, favorited, onToggle }: { name: string; favorited: boolean; onToggle: () => void }) => (
	<Button
		variant='ghost'
		size='icon-sm'
		aria-label={favorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
		aria-pressed={favorited}
		onClick={onToggle}
	>
		<StarIcon filled={favorited} />
	</Button>
);

export const SidebarPreview = () => {
	const [favorites, setFavorites] = useState<Record<string, boolean>>({});
	const toggleFavorite = (name: string) => setFavorites(prev => ({ ...prev, [name]: !prev[name] }));

	return (
		<div className='h-96 w-56 border border-surface-border rounded-lg overflow-hidden'>
			<Sidebar width='w-full' collapsible>
				<SidebarHeader>
					<span className='font-semibold text-text'>Acme</span>
				</SidebarHeader>
				<SidebarSection>
					<SidebarLink href='#' isActive icon={<NavIcon d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />}>Home</SidebarLink>
					<SidebarLink href='#' icon={<NavIcon d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z' />}>Documentation</SidebarLink>
					<SidebarLink href='#' icon={<NavIcon d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z' />}>Examples</SidebarLink>
				</SidebarSection>
				<SidebarDivider />
				<SidebarSection label='Components'>
					<SidebarLink
						href='#'
						icon={<NavIcon d='M9 9h6v6H9zM4 4h16v16H4z' />}
						action={<FavoriteButton name='Button' favorited={Boolean(favorites.Button)} onToggle={() => toggleFavorite('Button')} />}
					>
						Button
					</SidebarLink>
					<SidebarLink
						href='#'
						icon={<NavIcon d='M4 7V5a2 2 0 0 1 2-2h2M4 17v2a2 2 0 0 0 2 2h2M20 7V5a2 2 0 0 0-2-2h-2M20 17v2a2 2 0 0 1-2 2h-2' />}
						action={<FavoriteButton name='Input' favorited={Boolean(favorites.Input)} onToggle={() => toggleFavorite('Input')} />}
					>
						Input
					</SidebarLink>
				</SidebarSection>
				<SidebarFooter>
					<SidebarLink href='#' icon={<NavIcon d='M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z' />}>Settings</SidebarLink>
				</SidebarFooter>
			</Sidebar>
		</div>
	);
};
