'use client';

import { getPageOrder } from '@/app/_docs/registry/pageOrder';
import Button from '@/src/components/Button/Button';
import { usePathname } from 'next/navigation';

export const PageNav = () =>
{
	const pathname  = usePathname();
	const pageOrder = getPageOrder();
	const currentIndex = pageOrder.findIndex((page) => page.href === pathname);

	if(currentIndex === -1) return null;

	const previous = currentIndex > 0 ? pageOrder[currentIndex - 1] : undefined;
	const next     = currentIndex < pageOrder.length - 1 ? pageOrder[currentIndex + 1] : undefined;

	if(!previous && !next) return null;

	return (
		<nav aria-label='Page navigation' className='mt-12 flex items-stretch justify-between gap-4 pt-6'>
			{previous
				? (
					<Button
						variant='arrowleft'
						href={previous.href}
						className='max-w-[48%] min-w-0 focus-visible:ring-offset-2'
					>
						<span className='truncate'>{previous.label}</span>
					</Button>
				)
				: <span aria-hidden='true' />}

			{next
				? (
					<Button
						variant='arrowright'
						href={next.href}
						className='max-w-[48%] min-w-0 focus-visible:ring-offset-2'
					>
						<span className='truncate'>{next.label}</span>
					</Button>
				)
				: <span aria-hidden='true' />}
		</nav>
	);
};
