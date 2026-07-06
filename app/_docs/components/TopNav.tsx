'use client';
import { CommandPalette, CommandGroup, CommandItem } from '@/src/components/CommandPalette/CommandPalette';
import { DarkModeToggle } from '@/app/_docs/components/DarkModeToggle';
import { themes, getThemeByName, type Theme } from '@/src/themes';
import { styles, getStyleByName, type Style } from '@/src/styles';
import { ArrowRightIcon } from '@/app/_docs/components/NavIcons';
import { TOP_NAV_PAGES } from '@/app/_docs/registry/pageOrder';
import { MobileNav } from '@/app/_docs/components/MobileNav';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Select } from '@/src/components/Select/Select';
import { blocks } from '@/app/_docs/registry/blocks';
import { registry } from '@/app/_docs/registry';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TopNavProps
{
	collapsed?: boolean;
}

export const TopNav = ({ collapsed = false }: TopNavProps) =>
{
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [activeTheme, setActiveTheme] = useState<Theme>(themes[0]);
	const [activeStyle, setActiveStyle] = useState<Style>(styles[0]);

	const router = useRouter();

	const sortedComponents = useMemo(() => [...registry].sort((a, b) => a.name.localeCompare(b.name)), []);

	const applyTheme = (theme: Theme) =>
	{
		let styleEl = document.getElementById('theme-override') as HTMLStyleElement | null;

		if(theme.name === 'default')
		{
			styleEl?.remove();
			return;
		}

		if(!styleEl)
		{
			styleEl = document.createElement('style');
			styleEl.id = 'theme-override';
			document.head.appendChild(styleEl);
		}

		const lightVars = Object.entries(theme.light).map(([k, v]) => `  ${k}: ${v};`).join('\n');
		const darkVars  = Object.entries(theme.dark).map(([k, v]) => `  ${k}: ${v};`).join('\n');
		styleEl.textContent = `:root {\n${lightVars}\n}\n.dark {\n${darkVars}\n}`;
	};

	useEffect(() =>
	{
		const saved = localStorage.getItem('design-system');
		if(saved)
		{
			const theme = getThemeByName(saved);
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setActiveTheme(theme);
			applyTheme(theme);
		}
	}, []);

	const handleThemeChange = (theme: Theme) =>
	{
		setActiveTheme(theme);
		localStorage.setItem('design-system', theme.name);
		applyTheme(theme);
	};

	// ─── Surface style (orthogonal to the color palette) ──────────────────────
	const applyStyle = (style: Style) =>
	{
		let styleEl = document.getElementById('style-override') as HTMLStyleElement | null;

		if(style.name === 'minimal')
		{
			styleEl?.remove();
			return;
		}

		if(!styleEl)
		{
			styleEl = document.createElement('style');
			styleEl.id = 'style-override';
			document.head.appendChild(styleEl);
		}

		const lightVars = Object.entries(style.light).map(([k, v]) => `  ${k}: ${v};`).join('\n');
		const darkVars  = Object.entries(style.dark).map(([k, v]) => `  ${k}: ${v};`).join('\n');
		styleEl.textContent = `:root {\n${lightVars}\n}\n.dark {\n${darkVars}\n}`;
	};

	useEffect(() =>
	{
		const saved = localStorage.getItem('design-style');
		if(saved)
		{
			const style = getStyleByName(saved);
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setActiveStyle(style);
			applyStyle(style);
		}
	}, []);

	const handleStyleChange = (style: Style) =>
	{
		setActiveStyle(style);
		localStorage.setItem('design-style', style.name);
		applyStyle(style);
	};

	const goTo = (href: string) =>
	{
		router.push(href);
		setPaletteOpen(false);
	};

	const goToExternal = (href: string) =>
	{
		window.open(href, '_blank', 'noopener,noreferrer');
		setPaletteOpen(false);
	};

	return (
		<>
			<header
				className={[
					'fixed top-0 left-0 right-0 z-50 h-14 border-b border-surface-border bg-surface/95 backdrop-blur-md flex items-center px-3 gap-2 sm:px-6 sm:gap-3',
					'motion-safe:transition-[margin-left] motion-safe:duration-200 motion-safe:ease-[var(--ease-standard)]',
					collapsed ? 'md:ml-16' : 'md:ml-56',
				].join(' ')}
			>
				{/* Mobile nav drawer trigger */}
				<MobileNav />

				{/* Brand — hidden at md: and up, where the sidebar header shows it instead */}
				<Link
					href='/'
					className='hidden sm:flex md:hidden items-center gap-2 shrink-0 text-text rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
				>
					<svg width='20' height='20' viewBox='0 0 22 22' fill='currentColor' aria-hidden='true'>
						<path
							fillRule='evenodd'
							clipRule='evenodd'
							d='M5.5 0h11A5.5 5.5 0 0 1 22 5.5v11A5.5 5.5 0 0 1 16.5 22h-11A5.5 5.5 0 0 1 0 16.5v-11A5.5 5.5 0 0 1 5.5 0zm5.5 5.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 1 0 0-11z'
						/>
					</svg>
					<span className='text-sm font-semibold tracking-tight'>DaFink UI</span>
				</Link>

				{/* Search trigger */}
				<button
					type='button'
					onClick={() => setPaletteOpen(true)}
					aria-label='Search components'
					aria-keyshortcuts='/ Meta+k'
					className={[
						'relative flex-1 max-w-sm mx-auto flex items-center gap-2',
						'rounded-lg border border-surface-border bg-surface-hover/40 px-3 py-2 md:py-1.5',
						'text-sm text-text-subtle text-left',
						'transition-colors duration-[var(--duration-fast)]',
						'hover:border-surface-border-hover hover:bg-surface-hover',
						'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
					].join(' ')}
				>
					<svg
						width='14'
						height='14'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='shrink-0 text-text-subtle'
						aria-hidden='true'
					>
						<circle cx='11' cy='11' r='8' />
						<path d='m21 21-4.35-4.35' />
					</svg>

					<span className='flex-1'>Search components…</span>

					<kbd className='hidden sm:inline-flex items-center gap-0.5 rounded border border-surface-border px-1.5 py-0.5 text-[10px] font-mono text-text-subtle'>
						/
					</kbd>
				</button>

				{/* Right controls */}
				<div className='flex items-center gap-1.5'>
					{/* Surface style — orthogonal to the color palette */}
					<div className='hidden sm:block'>
						<Select
							options={styles.map((s) => ({ value: s.name, label: s.label }))}
							value={activeStyle.name}
							onChange={(name) => handleStyleChange(getStyleByName(name))}
							size='sm'
							className='w-32'
						/>
					</div>

					{/* Color palette */}
					<div className='hidden sm:block'>
						<Select
							options={themes.map((t) => ({ value: t.name, label: t.label }))}
							value={activeTheme.name}
							onChange={(name) => handleThemeChange(getThemeByName(name))}
							size='sm'
							className='w-32'
						/>
					</div>

					<div className='hidden sm:block h-4 w-px bg-surface-border mx-0.5' aria-hidden='true' />

					<DarkModeToggle />
				</div>
			</header>

			{/* Command palette */}
			<CommandPalette
				open={paletteOpen}
				onClose={() => setPaletteOpen(false)}
				placeholder='Search components…'
			>
				<CommandGroup label='Pages'>
					{TOP_NAV_PAGES.map(page => (
						<CommandItem
							key={page.href}
							value={page.label}
							icon={<ArrowRightIcon />}
							onSelect={() => goTo(page.href)}
						>
							{page.label}
						</CommandItem>
					))}
				</CommandGroup>

				<CommandGroup label='Components'>
					{sortedComponents.map(entry => (
						<CommandItem
							key={entry.slug}
							value={entry.name}
							onSelect={() => goTo(`/components/${entry.slug}`)}
						>
							{entry.name}
						</CommandItem>
					))}
				</CommandGroup>

				<CommandGroup label='Blocks'>
					{blocks.map(entry => (
						<CommandItem
							key={entry.slug}
							value={entry.name}
							onSelect={() => goTo(`/blocks/${entry.slug}`)}
						>
							{entry.name}
						</CommandItem>
					))}
				</CommandGroup>

				<CommandGroup label='Misc'>
					<CommandItem value='Changelog' onSelect={() => goTo('/changelog')}>
						Changelog
					</CommandItem>
					<CommandItem value='GitHub' onSelect={() => goToExternal('https://github.com/RyanGarfinkel/DaFinkUI')}>
						GitHub
					</CommandItem>
					<CommandItem value='npm' onSelect={() => goToExternal('https://www.npmjs.com/package/dafink-ui')}>
						npm
					</CommandItem>
				</CommandGroup>
			</CommandPalette>

			<GlobalShortcuts onOpen={() => setPaletteOpen(true)} />
		</>
	);
};

// ─── Global keyboard shortcuts ────────────────────────────────────────────────

const GlobalShortcuts = ({ onOpen }: { onOpen: () => void }) =>
{
	const ref = useRef(onOpen);

	useEffect(() =>
	{
		ref.current = onOpen;
	}, [onOpen]);

	useEffect(() =>
	{
		const handler = (e: KeyboardEvent) =>
		{
			const active = document.activeElement;
			const inInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || (active instanceof HTMLElement && active.isContentEditable);

			// Slash opens palette when not in a text field
			if(e.key === '/' && !inInput)
			{
				e.preventDefault();
				ref.current();
				return;
			}

			// Cmd+K / Ctrl+K always opens
			if(e.key === 'k' && (e.metaKey || e.ctrlKey))
			{
				e.preventDefault();
				ref.current();
			}
		};

		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, []);

	return null;
};
