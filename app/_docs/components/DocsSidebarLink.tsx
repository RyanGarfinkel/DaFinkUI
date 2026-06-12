'use client';

import { SidebarLink } from '@/src/components/Sidebar/Sidebar';
import { usePathname } from 'next/navigation';

interface DocsSidebarLinkProps
{
	href:     string;
	children: React.ReactNode;
}

export const DocsSidebarLink = ({ href, children }: DocsSidebarLinkProps) => {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<SidebarLink href={href} isActive={isActive}>
			{children}
		</SidebarLink>
	);
};
