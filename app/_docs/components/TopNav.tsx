'use client';
import { CommandPalette, CommandGroup, CommandItem } from '@/src/components/CommandPalette/CommandPalette';
import { themes, getThemeByName, type Theme } from '@/src/themes';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Select } from '@/src/components/Select/Select';
import { registry } from '@/app/_docs/registry';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const TopNav = () =>
{
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [isDark,      setIsDark]      = useState(false);
	const [activeTheme, setActiveTheme] = useState<Theme>(themes[0]);

	const router = useRouter();

	const grouped = useMemo(() =>
	{
		const map: Record<string, typeof registry> = {};
		for(const entry of registry)
		{
			if(!map[entry.category]) map[entry.category] = [];
			map[entry.category].push(entry);
		}
		return map;
	}, []);

	const categories = useMemo(() => Object.keys(grouped).sort(), [grouped]);

	useEffect(() =>
	{
		const stored     = localStorage.getItem('theme');
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const dark       = stored === 'dark' || (!stored && systemDark);

		if(dark) document.documentElement.classList.add('dark');
		else document.documentElement.classList.remove('dark');

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsDark(dark);
		document.cookie = `theme=${dark ? 'dark' : 'light'}; path=/; max-age=31536000; SameSite=Lax`;
	}, []);

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

	const toggleDark = () =>
	{
		const root  = document.documentElement;
		const going = root.classList.contains('dark') ? 'light' : 'dark';
		root.classList.toggle('dark', going === 'dark');
		localStorage.setItem('theme', going);
		document.cookie = `theme=${going}; path=/; max-age=31536000; SameSite=Lax`;
		setIsDark(going === 'dark');
	};

	const navigate = (slug: string) =>
	{
		router.push(`/components/${slug}`);
		setPaletteOpen(false);
	};

	return (
		<>
			<header className='fixed top-0 left-0 right-0 z-50 h-14 border-b border-surface-border bg-surface/90 backdrop-blur-sm flex items-center px-4 gap-4'>
				{/* Brand */}
				<Link
					href='/'
					className='hidden lg:flex items-center gap-2.5 min-w-[9rem] text-text rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
				>
					<svg width='22' height='22' viewBox='0 0 22 22' fill='currentColor' aria-hidden='true'>
						<path
							fillRule='evenodd'
							clipRule='evenodd'
							d='M5.5 0h11A5.5 5.5 0 0 1 22 5.5v11A5.5 5.5 0 0 1 16.5 22h-11A5.5 5.5 0 0 1 0 16.5v-11A5.5 5.5 0 0 1 5.5 0zm5.5 5.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 1 0 0-11z'
						/>
					</svg>
					<span className='text-sm font-semibold'>Obi UI</span>
				</Link>

				{/* Search trigger */}
				<button
					type='button'
					onClick={() => setPaletteOpen(true)}
					aria-label='Search components'
					aria-keyshortcuts='/ Meta+k'
					className={[
						'relative flex-1 max-w-sm mx-auto flex items-center gap-2',
						'rounded-md border border-surface-border bg-surface px-3 py-1.5',
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
				<div className='flex items-center gap-2'>
					<Select
						options={themes.map((t) => ({ value: t.name, label: t.label }))}
						value={activeTheme.name}
						onChange={(name) => handleThemeChange(getThemeByName(name))}
						size='sm'
						className='w-28'
					/>

					<button
						type='button'
						onClick={toggleDark}
						aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
						className='flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
					>
						{isDark
							? (
								<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
									<circle cx='12' cy='12' r='4' />
									<path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
								</svg>
							)
							: (
								<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
									<path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
								</svg>
							)
						}
					</button>
				</div>
			</header>

			{/* Command palette */}
			<CommandPalette
				open={paletteOpen}
				onClose={() => setPaletteOpen(false)}
				placeholder='Search components…'
			>
				{categories.map(cat => (
					<CommandGroup key={cat} label={cat}>
						{grouped[cat].map(entry => (
							<CommandItem
								key={entry.slug}
								value={`${entry.name} ${entry.description} ${entry.category}`}
								onSelect={() => navigate(entry.slug)}
							>
								{entry.name}
							</CommandItem>
						))}
					</CommandGroup>
				))}
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
			const inInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;

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
