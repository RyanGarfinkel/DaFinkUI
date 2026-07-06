'use client';

import { getPageOrder } from '@/app/_docs/registry/pageOrder';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Radix UI Icons — ArrowLeftIcon / ArrowRightIcon (@radix-ui/react-icons, MIT).
const PrevIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 15 15'
		fill='none'
		aria-hidden='true'
		className='shrink-0 motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] group-hover:-translate-x-1 group-focus-visible:-translate-x-1'
	>
		<path
			d='M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z'
			fill='currentColor'
			fillRule='evenodd'
			clipRule='evenodd'
		/>
	</svg>
);

const NextIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 15 15'
		fill='none'
		aria-hidden='true'
		className='shrink-0 motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] group-hover:translate-x-1 group-focus-visible:translate-x-1'
	>
		<path
			d='M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z'
			fill='currentColor'
			fillRule='evenodd'
			clipRule='evenodd'
		/>
	</svg>
);

export const PageNav = () =>
{
	const pathname = usePathname();
	const pageOrder = getPageOrder();
	const currentIndex = pageOrder.findIndex((page) => page.href === pathname);

	if(currentIndex === -1) return null;

	const previous = currentIndex > 0 ? pageOrder[currentIndex - 1] : undefined;
	const next = currentIndex < pageOrder.length - 1 ? pageOrder[currentIndex + 1] : undefined;

	if(!previous && !next) return null;

	return (
		<nav aria-label='Page navigation' className='mt-12 flex items-stretch justify-between gap-4 border-t border-surface-border pt-6'>
			{previous
				? (
					<Link
						href={previous.href}
						className='group flex max-w-[48%] min-w-0 items-center gap-2 rounded-[var(--radius)] border border-surface-border px-3 py-2 text-sm font-medium text-text motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:border-surface-border-hover hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
					>
						<PrevIcon />
						<span className='truncate'>{previous.label}</span>
					</Link>
				)
				: <span aria-hidden='true' />}

			{next
				? (
					<Link
						href={next.href}
						className='group flex max-w-[48%] min-w-0 items-center justify-end gap-2 rounded-[var(--radius)] border border-surface-border px-3 py-2 text-right text-sm font-medium text-text motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:border-surface-border-hover hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
					>
						<span className='truncate'>{next.label}</span>
						<NextIcon />
					</Link>
				)
				: <span aria-hidden='true' />}
		</nav>
	);
};
