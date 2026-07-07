'use client';

import { HomeIcon, InstallationIcon, ThemeIcon, TypographyIcon, ComponentsIcon, BlocksIcon, PlaygroundIcon, McpIcon, SkillIcon, ReliabilityIcon, ChangelogIcon, GithubIcon, PackageIcon } from '@/app/_docs/components/NavIcons';
import { Sidebar, SidebarHeader, SidebarFooter, SidebarDivider, useSidebarCollapsed } from '@/src/components/Sidebar/Sidebar';
import { DocsSidebarLink } from '@/app/_docs/components/DocsSidebarLink';
import { blocks } from '@/app/_docs/registry/blocks';
import { registry } from '@/app/_docs/registry';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface DocsSidebarProps
{
	collapsed:         boolean;
	onCollapsedChange: (collapsed: boolean) => void;
}

const BrandLink = () => {
	const collapsed = useSidebarCollapsed();

	return (
		<Link
			href='/'
			className={[
				'flex w-full items-center gap-2 rounded-sm px-3 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
				collapsed ? 'justify-center' : '',
			].join(' ')}
		>
			<svg width='16' height='16' viewBox='0 0 22 22' fill='currentColor' aria-hidden='true' className='shrink-0'>
				<path
					fillRule='evenodd'
					clipRule='evenodd'
					d='M5.5 0h11A5.5 5.5 0 0 1 22 5.5v11A5.5 5.5 0 0 1 16.5 22h-11A5.5 5.5 0 0 1 0 16.5v-11A5.5 5.5 0 0 1 5.5 0zm5.5 5.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 1 0 0-11z'
				/>
			</svg>
			<span className={['text-sm font-semibold tracking-tight', collapsed ? 'sr-only' : ''].join(' ')}>DaFink UI</span>
		</Link>
	);
};

interface ExternalFooterLinkProps
{
	href:     string;
	icon:     React.ReactNode;
	children: React.ReactNode;
}

const ExternalFooterLink = ({ href, icon, children }: ExternalFooterLinkProps) => {
	const collapsed = useSidebarCollapsed();

	return (
		<a
			href={href}
			target='_blank'
			rel='noopener noreferrer'
			className={[
				'flex w-full items-center gap-2 rounded-[var(--radius)] px-3 py-1.5 text-sm text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
				collapsed ? 'justify-center' : '',
			].join(' ')}
		>
			<span aria-hidden='true' className='shrink-0'>{icon}</span>
			<span className={collapsed ? 'sr-only' : ''}>{children}</span>
		</a>
	);
};

interface FooterLinkProps
{
	href:     string;
	icon:     React.ReactNode;
	children: React.ReactNode;
}

const FooterLink = ({ href, icon, children }: FooterLinkProps) => {
	const collapsed = useSidebarCollapsed();
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<Link
			href={href}
			aria-current={isActive ? 'page' : undefined}
			className={[
				'flex w-full items-center gap-2 rounded-[var(--radius)] px-3 py-1.5 text-sm motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
				isActive ? 'text-text' : 'text-text-muted hover:text-text',
				collapsed ? 'justify-center' : '',
			].join(' ')}
		>
			<span aria-hidden='true' className='shrink-0'>{icon}</span>
			<span className={collapsed ? 'sr-only' : ''}>{children}</span>
		</Link>
	);
};

export const DocsSidebar = ({ collapsed, onCollapsedChange }: DocsSidebarProps) => {
	const pathname = usePathname();

	const showComponents = pathname === '/components' || pathname.startsWith('/components/');
	const showBlocks = pathname === '/blocks' || pathname.startsWith('/blocks/');

	const sortedComponents = [...registry].sort((a, b) => a.name.localeCompare(b.name));

	return (
		<Sidebar
			width='w-56'
			height='h-screen'
			className='hidden md:block fixed left-0 top-0 z-30'
			collapsible
			togglePosition='top'
			collapsed={collapsed}
			onCollapsedChange={onCollapsedChange}
		>
			<SidebarHeader>
				<BrandLink />
			</SidebarHeader>

			<nav className='flex flex-col gap-1'>
				<DocsSidebarLink href='/' icon={<HomeIcon />}>Home</DocsSidebarLink>
				<DocsSidebarLink href='/installation' icon={<InstallationIcon />}>Installation</DocsSidebarLink>
				<DocsSidebarLink href='/theme' icon={<ThemeIcon />}>Theme</DocsSidebarLink>
				<DocsSidebarLink href='/typography' icon={<TypographyIcon />}>Typography</DocsSidebarLink>
				<DocsSidebarLink href='/mcp' icon={<McpIcon />}>MCP Server</DocsSidebarLink>
				<DocsSidebarLink href='/skill' icon={<SkillIcon />}>Design Skill</DocsSidebarLink>
				<DocsSidebarLink href='/reliability' icon={<ReliabilityIcon />}>Reliability</DocsSidebarLink>
				<DocsSidebarLink href='/playground' icon={<PlaygroundIcon />}>Playground</DocsSidebarLink>
			</nav>

			<SidebarDivider />

			<nav className='flex flex-col gap-1'>
				<DocsSidebarLink href='/components' icon={<ComponentsIcon />}>All Components</DocsSidebarLink>
				<DocsSidebarLink href='/blocks' icon={<BlocksIcon />}>All Blocks</DocsSidebarLink>

				{showComponents && sortedComponents.map((entry) => (
					<DocsSidebarLink
						key={entry.slug}
						href={`/components/${entry.slug}`}
					>
						{entry.name}
					</DocsSidebarLink>
				))}

				{showBlocks && blocks.map((entry) => (
					<DocsSidebarLink
						key={entry.slug}
						href={`/blocks/${entry.slug}`}
					>
						{entry.name}
					</DocsSidebarLink>
				))}
			</nav>

			<SidebarFooter>
				<div className='flex w-full flex-col gap-1'>
					<FooterLink href='/changelog' icon={<ChangelogIcon />}>Changelog</FooterLink>
					<ExternalFooterLink href='https://github.com/RyanGarfinkel/DaFinkUI' icon={<GithubIcon />}>GitHub</ExternalFooterLink>
					<ExternalFooterLink href='https://www.npmjs.com/package/dafink-ui' icon={<PackageIcon />}>npm</ExternalFooterLink>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
};
