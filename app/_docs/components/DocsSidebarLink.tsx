'use client';

import { SidebarLink } from '@/src/components/Sidebar/Sidebar';
import { usePathname } from 'next/navigation';

interface DocsSidebarLinkProps
{
	href:       string;
	icon?:      React.ReactNode;
	className?: string;
	children:   React.ReactNode;
}

export const DocsSidebarLink = ({ href, icon, className, children }: DocsSidebarLinkProps) => {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<SidebarLink href={href} isActive={isActive} icon={icon} className={className}>
			{children}
		</SidebarLink>
	);
};
