'use client';
import { HomeIcon, InstallationIcon, ThemeIcon, TypographyIcon, ComponentsIcon, BlocksIcon, PlaygroundIcon, McpIcon, SkillIcon, AuditIcon } from '@/app/_docs/components/NavIcons';
import Drawer, { DrawerHeader, DrawerTitle, DrawerContent, DrawerClose } from '@/src/components/Drawer/Drawer';
import { SidebarSection, SidebarDivider } from '@/src/components/Sidebar/Sidebar';
import { DocsSidebarLink } from '@/app/_docs/components/DocsSidebarLink';
import { CATEGORIES } from '@/app/_docs/registry/categories';
import { blocks } from '@/app/_docs/registry/blocks';
import { registry } from '@/app/_docs/registry';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export const MobileNav = () =>
{
	const [open, setOpen] = useState(false);

	const pathname = usePathname();

	// Close the drawer after any navigation
	useEffect(() =>
	{
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setOpen(false);
	}, [pathname]);

	const showComponents = pathname === '/components' || pathname.startsWith('/components/');
	const showBlocks = pathname === '/blocks' || pathname.startsWith('/blocks/');

	const byCategory = CATEGORIES.reduce<Record<string, typeof registry>>((acc, cat) =>
	{
		const entries = registry.filter((c) => c.category === cat);
		if(entries.length > 0) acc[cat] = entries;
		return acc;
	}, {});

	return (
		<div className='md:hidden'>
			<button
				type='button'
				onClick={() => setOpen(true)}
				aria-label='Open navigation'
				aria-expanded={open}
				className='flex h-11 w-11 items-center justify-center rounded-md text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
			>
				<svg
					width='18'
					height='18'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					aria-hidden='true'
				>
					<path d='M4 6h16M4 12h16M4 18h16' />
				</svg>
			</button>

			<Drawer open={open} onOpenChange={setOpen} side='left'>
				<DrawerHeader className='px-4'>
					<DrawerTitle>Navigation</DrawerTitle>
				</DrawerHeader>
				<DrawerClose />
				<DrawerContent className='px-3'>
					<div className='flex flex-col gap-4 pb-6'>
						<nav className='flex flex-col gap-1'>
							<DocsSidebarLink href='/' icon={<HomeIcon />} className='py-3'>Home</DocsSidebarLink>
							<DocsSidebarLink href='/installation' icon={<InstallationIcon />} className='py-3'>Installation</DocsSidebarLink>
							<DocsSidebarLink href='/theme' icon={<ThemeIcon />} className='py-3'>Theme</DocsSidebarLink>
							<DocsSidebarLink href='/typography' icon={<TypographyIcon />} className='py-3'>Typography</DocsSidebarLink>
							<DocsSidebarLink href='/mcp' icon={<McpIcon />} className='py-3'>MCP Server</DocsSidebarLink>
							<DocsSidebarLink href='/skill' icon={<SkillIcon />} className='py-3'>Design Skill</DocsSidebarLink>
							<DocsSidebarLink href='/audit' icon={<AuditIcon />} className='py-3'>Audit</DocsSidebarLink>
							<DocsSidebarLink href='/playground' icon={<PlaygroundIcon />} className='py-3'>Playground</DocsSidebarLink>
						</nav>

						<SidebarDivider />

						<nav className='flex flex-col gap-1'>
							<DocsSidebarLink href='/components' icon={<ComponentsIcon />} className='py-3'>All Components</DocsSidebarLink>
							<DocsSidebarLink href='/blocks' icon={<BlocksIcon />} className='py-3'>All Blocks</DocsSidebarLink>
						</nav>

						{showComponents && CATEGORIES.filter((cat) => byCategory[cat]).map((category) => (
							<SidebarSection key={category} label={category}>
								{byCategory[category].map((entry) => (
									<DocsSidebarLink
										key={entry.slug}
										href={`/components/${entry.slug}`}
										className='py-3'
									>
										{entry.name}
									</DocsSidebarLink>
								))}
							</SidebarSection>
						))}

						{showBlocks && (
							<nav className='flex flex-col gap-1'>
								{blocks.map((entry) => (
									<DocsSidebarLink
										key={entry.slug}
										href={`/blocks/${entry.slug}`}
										className='py-3'
									>
										{entry.name}
									</DocsSidebarLink>
								))}
							</nav>
						)}
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	);
};
