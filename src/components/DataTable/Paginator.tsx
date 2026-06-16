'use client';

export type PaginatorVariant = 'default' | 'numbered' | 'minimal' | 'compact';

export interface PaginatorProps
{
	page:         number;
	totalPages:   number;
	onPageChange: (page: number) => void;
	rangeStart?:  number;
	rangeEnd?:    number;
	totalRows?:   number;
	variant?:     PaginatorVariant;
	className?:   string;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const BTN_BASE = [
	'inline-flex items-center justify-center rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border',
	'text-sm text-text-muted',
	'transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none',
	'hover:bg-surface-hover hover:border-surface-border-hover hover:text-text',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
	'disabled:opacity-40 disabled:cursor-not-allowed',
	'disabled:hover:bg-transparent disabled:hover:border-surface-border disabled:hover:text-text-muted',
].join(' ');

const BTN_TEXT  = 'px-3 py-1.5';
const BTN_ICON  = 'w-8 h-8';
const BTN_CURRENT = 'bg-brand text-brand-fg border-brand hover:bg-brand-hover hover:border-brand-hover hover:text-brand-fg';

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChevronLeft = () => (
	<svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden='true'>
		<path d='M10 12L6 8l4-4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
	</svg>
);

const ChevronRight = () => (
	<svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden='true'>
		<path d='M6 4l4 4-4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
	</svg>
);

// ─── Page number generation ───────────────────────────────────────────────────

const getPageNumbers = (page: number, totalPages: number): (number | '...')[] =>
{
	if(totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);

	const items: (number | '...')[] = [0];

	const lo = Math.max(1, page - 1);
	const hi = Math.min(totalPages - 2, page + 1);

	if(lo > 1) items.push('...');
	for(let i = lo; i <= hi; i++) items.push(i);
	if(hi < totalPages - 2) items.push('...');

	items.push(totalPages - 1);
	return items;
};

// ─── Paginator ────────────────────────────────────────────────────────────────

export const Paginator = (
	{
		page,
		totalPages,
		onPageChange,
		rangeStart,
		rangeEnd,
		totalRows,
		variant   = 'default',
		className = '',
	}: PaginatorProps
) =>
{
	const hasPrev = page > 0;
	const hasNext = page < totalPages - 1;

	if(variant === 'minimal')
	{
		return (
			<nav aria-label='Pagination' className={`flex items-center gap-1 ${className}`}>
				<button
					type='button'
					onClick={() => onPageChange(page - 1)}
					disabled={!hasPrev}
					aria-label='Go to previous page'
					className={`${BTN_BASE} ${BTN_ICON}`}
				>
					<ChevronLeft />
				</button>
				<button
					type='button'
					onClick={() => onPageChange(page + 1)}
					disabled={!hasNext}
					aria-label='Go to next page'
					className={`${BTN_BASE} ${BTN_ICON}`}
				>
					<ChevronRight />
				</button>
			</nav>
		);
	}

	if(variant === 'compact')
	{
		return (
			<nav
				aria-label='Pagination'
				className={`flex items-center gap-2 text-sm text-text-muted ${className}`}
			>
				<button
					type='button'
					onClick={() => onPageChange(page - 1)}
					disabled={!hasPrev}
					aria-label='Go to previous page'
					className={`${BTN_BASE} ${BTN_ICON}`}
				>
					<ChevronLeft />
				</button>
				<span className='select-none px-1'>
					Page{' '}
					<span className='font-medium text-text'>{page + 1}</span>
					{' '}of{' '}
					<span className='font-medium text-text'>{totalPages}</span>
				</span>
				<button
					type='button'
					onClick={() => onPageChange(page + 1)}
					disabled={!hasNext}
					aria-label='Go to next page'
					className={`${BTN_BASE} ${BTN_ICON}`}
				>
					<ChevronRight />
				</button>
			</nav>
		);
	}

	if(variant === 'numbered')
	{
		const pages = getPageNumbers(page, totalPages);
		return (
			<nav aria-label='Pagination' className={`flex items-center gap-1 ${className}`}>
				<button
					type='button'
					onClick={() => onPageChange(page - 1)}
					disabled={!hasPrev}
					aria-label='Go to previous page'
					className={`${BTN_BASE} ${BTN_ICON}`}
				>
					<ChevronLeft />
				</button>

				{pages.map((p, i) =>
					p === '...'
						? (
							<span
								key={`ellipsis-${i}`}
								className='w-8 h-8 inline-flex items-center justify-center text-sm text-text-subtle select-none'
							>
								…
							</span>
						)
						: (
							<button
								key={p}
								type='button'
								onClick={() => onPageChange(p)}
								aria-label={`Page ${p + 1}`}
								aria-current={p === page ? 'page' : undefined}
								className={[
									BTN_BASE,
									BTN_ICON,
									p === page ? BTN_CURRENT : '',
								].join(' ')}
							>
								{p + 1}
							</button>
						)
				)}

				<button
					type='button'
					onClick={() => onPageChange(page + 1)}
					disabled={!hasNext}
					aria-label='Go to next page'
					className={`${BTN_BASE} ${BTN_ICON}`}
				>
					<ChevronRight />
				</button>
			</nav>
		);
	}

	// default: prev | optional range text | next
	return (
		<nav aria-label='Pagination' className={`flex items-center gap-3 ${className}`}>
			<button
				type='button'
				onClick={() => onPageChange(page - 1)}
				disabled={!hasPrev}
				aria-label='Go to previous page'
				className={`${BTN_BASE} ${BTN_TEXT}`}
			>
				Prev
			</button>

			{rangeStart != null && rangeEnd != null && totalRows != null && (
				<span className='text-sm text-text-muted select-none'>
					{rangeStart}{'–'}{rangeEnd} of {totalRows}
				</span>
			)}

			<button
				type='button'
				onClick={() => onPageChange(page + 1)}
				disabled={!hasNext}
				aria-label='Go to next page'
				className={`${BTN_BASE} ${BTN_TEXT}`}
			>
				Next
			</button>
		</nav>
	);
};

export default Paginator;
