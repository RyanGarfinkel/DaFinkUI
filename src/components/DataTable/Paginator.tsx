'use client';

export type PaginatorVariant = 'default' | 'numbered' | 'minimal' | 'compact';

export interface PaginatorProps {
	page:         number;
	totalPages:   number;
	onPageChange: (page: number) => void;
	rangeStart?:  number;
	rangeEnd?:    number;
	totalRows?:   number;
	variant?:     PaginatorVariant;
	className?:   string;
}

// Layout/behavior only — no color classes here. A color utility that's present alongside
// a conflicting one (e.g. text-text-muted next to text-brand-fg) has cascade-order-dependent
// precedence in the compiled CSS, not "last one in the class string wins": each button gets
// exactly one of BTN_DEFAULT or BTN_CURRENT below, never both, so there's nothing to conflict.
const BTN_BASE = [
	'inline-flex items-center justify-center rounded-[var(--radius)] border-[length:var(--border-width)]',
	'text-sm',
	'transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
	'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

const BTN_DEFAULT = [
	'border-surface-border text-text-muted',
	'hover:bg-surface-hover hover:border-surface-border-hover hover:text-text',
	'disabled:hover:bg-transparent disabled:hover:border-surface-border disabled:hover:text-text-muted',
].join(' ');

const BTN_CURRENT = 'bg-brand text-brand-fg border-brand hover:bg-brand-hover hover:border-brand-hover hover:text-brand-fg';

const BTN_TEXT  = 'px-3 py-1.5';
const BTN_ICON  = 'w-8 h-8';

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

const getPageNumbers = (page: number, totalPages: number): (number | '...')[] => {
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
) => {
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
					className={`${BTN_BASE} ${BTN_ICON} ${BTN_DEFAULT}`}
				>
					<ChevronLeft />
				</button>
				<button
					type='button'
					onClick={() => onPageChange(page + 1)}
					disabled={!hasNext}
					aria-label='Go to next page'
					className={`${BTN_BASE} ${BTN_ICON} ${BTN_DEFAULT}`}
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
					className={`${BTN_BASE} ${BTN_ICON} ${BTN_DEFAULT}`}
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
					className={`${BTN_BASE} ${BTN_ICON} ${BTN_DEFAULT}`}
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
					className={`${BTN_BASE} ${BTN_ICON} ${BTN_DEFAULT}`}
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
									p === page ? BTN_CURRENT : BTN_DEFAULT,
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
					className={`${BTN_BASE} ${BTN_ICON} ${BTN_DEFAULT}`}
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
				className={`${BTN_BASE} ${BTN_TEXT} ${BTN_DEFAULT}`}
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
				className={`${BTN_BASE} ${BTN_TEXT} ${BTN_DEFAULT}`}
			>
				Next
			</button>
		</nav>
	);
};

export default Paginator;
