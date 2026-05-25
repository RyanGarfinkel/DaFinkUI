import { ReactNode } from 'react';
import Link from 'next/link';

export interface BreadcrumbItem
{
	label: string;
	href?: string;
}

export interface BreadcrumbProps
{
	items:      BreadcrumbItem[];
	separator?: ReactNode;
	className?: string;
}

const Breadcrumb = (
    {
        items,
        separator = '/',
        className = '',
    }: BreadcrumbProps
) => {
	return (
		<nav aria-label='breadcrumb' className={className}>
			<ol className='flex flex-wrap items-center'>
				{items.map((item, index) =>
				{
					const isLast = index === items.length - 1;

					return (
						<li key={index} className='flex items-center'>
							{index > 0 && (
								<span className='text-sm text-text-subtle mx-2' aria-hidden='true'>
									{separator}
								</span>
							)}

							{isLast ? (
								<span
									aria-current='page'
									className='text-sm text-text font-medium'
								>
									{item.label}
								</span>
							) : (
								<Link
									href={item.href ?? '#'}
									className='text-sm text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:text-text hover:underline focus:outline-none focus-visible:underline'
								>
									{item.label}
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

export default Breadcrumb;
