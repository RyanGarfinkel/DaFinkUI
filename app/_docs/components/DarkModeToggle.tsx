'use client';

import { useEffect, useState } from 'react';

interface DarkModeToggleProps
{
	className?: string;
}

export const DarkModeToggle = ({ className }: DarkModeToggleProps) =>
{
	const [isDark, setIsDark] = useState(false);

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

	const toggleDark = () =>
	{
		const root  = document.documentElement;
		const going = root.classList.contains('dark') ? 'light' : 'dark';
		root.classList.toggle('dark', going === 'dark');
		localStorage.setItem('theme', going);
		document.cookie = `theme=${going}; path=/; max-age=31536000; SameSite=Lax`;
		setIsDark(going === 'dark');
	};

	return (
		<button
			type='button'
			onClick={toggleDark}
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			className={[
				'flex h-9 w-9 md:h-8 md:w-8 items-center justify-center rounded-md text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
				className ?? '',
			].join(' ').trim()}
		>
			{isDark
				? (
					<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
						<circle cx='12' cy='12' r='4' />
						<path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
					</svg>
				)
				: (
					<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
						<path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
					</svg>
				)
			}
		</button>
	);
};
