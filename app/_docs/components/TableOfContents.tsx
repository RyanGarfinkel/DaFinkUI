'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface TocHeading
{
	id:    string;
	text:  string;
	level: 2 | 3;
}

const slugify = (text: string) => {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
};

export const TableOfContents = () => {
	const pathname = usePathname();
	const [headings, setHeadings] = useState<TocHeading[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() =>
	{
		const container = document.getElementById('docs-content');

		const candidates = container
			? Array.from(container.querySelectorAll<HTMLHeadingElement>('h2, h3'))
				.filter((el) => !el.closest('[data-toc-exclude], [role="tabpanel"]'))
			: [];

		const seen = new Map<string, number>();

		const found = candidates.map((el) =>
		{
			if(!el.id)
			{
				const base = slugify(el.textContent ?? '');
				const count = seen.get(base) ?? 0;
				seen.set(base, count + 1);
				el.id = count === 0 ? base : `${base}-${count + 1}`;
			}
			el.classList.add('scroll-mt-20');

			return {
				id:    el.id,
				text:  el.textContent ?? '',
				level: (el.tagName === 'H3' ? 3 : 2) as 2 | 3,
			};
		});

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHeadings(found);
	}, [pathname]);

	// Tracks scroll position, not the URL — bolds the last heading whose top has
	// scrolled past the trigger line just below the sticky TopNav. Geometry-based
	// rather than an IntersectionObserver band, since a band fails to ever trigger
	// for a trailing heading that's too close to the bottom of a short page.
	useEffect(() =>
	{
		if(headings.length === 0) return;

		const elements = headings
			.map((h) => document.getElementById(h.id))
			.filter((el): el is HTMLElement => el !== null);

		if(elements.length === 0) return;

		const TRIGGER_OFFSET = 96;
		let ticking = false;

		const updateActive = () =>
		{
			// If the last section's content is shorter than the viewport, its heading
			// can never physically reach TRIGGER_OFFSET even at max scroll — treat
			// "scrolled to the bottom of the page" as "on the last section".
			const atBottom = window.innerHeight + Math.ceil(window.scrollY) >= document.documentElement.scrollHeight - 1;

			let current = elements[0].id;
			if(atBottom)
			{
				current = elements[elements.length - 1].id;
			}
			else
			{
				for(const el of elements)
					if(el.getBoundingClientRect().top <= TRIGGER_OFFSET) current = el.id;
			}

			setActiveId(current);
			ticking = false;
		};

		const onScroll = () =>
		{
			if(ticking) return;
			ticking = true;
			requestAnimationFrame(updateActive);
		};

		updateActive();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		return () =>
		{
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, [headings]);

	const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
		const target = document.getElementById(id);
		if(!target) return;

		event.preventDefault();

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
		window.history.pushState(null, '', `#${id}`);
		setActiveId(id);
	};

	if(headings.length === 0) return null;

	return (
		<nav
			aria-label='Table of contents'
			className='hidden xl:flex w-56 shrink-0 flex-col gap-3 sticky top-20 self-start max-h-[calc(100vh-7rem)] overflow-y-auto'
		>
			<span className='px-3 text-xs font-medium text-text-subtle uppercase tracking-wide'>
				What&apos;s on this page?
			</span>
			<ul className='flex flex-col gap-1'>
				{headings.map((heading) => (
					<li key={heading.id}>
						<a
							href={`#${heading.id}`}
							onClick={(event) => handleClick(event, heading.id)}
							aria-current={heading.id === activeId ? 'location' : undefined}
							className={[
								'block rounded-[var(--radius)] px-3 py-1 text-sm',
								'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
								heading.id === activeId ? 'font-semibold text-text' : 'text-text-muted hover:text-text',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
								heading.level === 3 ? 'pl-6' : '',
							].join(' ')}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
};
