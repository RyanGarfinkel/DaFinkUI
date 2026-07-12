'use client';
import { Paginator, type PaginatorVariant } from './Paginator';
import { useState, useCallback, useMemo, useId } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type { PaginatorVariant };

export interface ColumnDef<T>
{
	key:       keyof T & string;
	header:    string;
	sortable?: boolean;
	width?:    string;
	render?:   (value: T[keyof T], row: T) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableProps<T extends Record<string, any>>
{
	data:               T[];
	columns:            ColumnDef<T>[];
	keyField:           keyof T & string;
	selectable?:        boolean;
	onSelectionChange?: (selected: T[]) => void;
	pageSize?:          number;
	className?:         string;
	emptyMessage?:      string;
	// Server-side / lazy pagination
	totalRows?:         number;
	onPageChange?:      (page: number, pageSize: number) => void;
	paginatorVariant?:  PaginatorVariant;
}

type SortDir = 'asc' | 'desc' | null;

// ─── Sort icons ───────────────────────────────────────────────────────────────

const SortAscIcon = () => (
	<svg aria-hidden='true' width='12' height='12' viewBox='0 0 12 12' fill='none'>
		<path d='M6 2L10 8H2L6 2Z' fill='currentColor' />
	</svg>
);

const SortDescIcon = () => (
	<svg aria-hidden='true' width='12' height='12' viewBox='0 0 12 12' fill='none'>
		<path d='M6 10L2 4H10L6 10Z' fill='currentColor' />
	</svg>
);

const SortNeutralIcon = () => (
	<svg aria-hidden='true' width='12' height='12' viewBox='0 0 12 12' fill='none'>
		<path d='M6 1L9 5H3L6 1Z' fill='currentColor' opacity='0.4' />
		<path d='M6 11L3 7H9L6 11Z' fill='currentColor' opacity='0.4' />
	</svg>
);

const SortIcon = ({ direction }: { direction: SortDir }) =>
{
	if(direction === 'asc')  return <SortAscIcon />;
	if(direction === 'desc') return <SortDescIcon />;
	return <SortNeutralIcon />;
};

// ─── Sort helper ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sortRows = <T extends Record<string, any>>(data: T[], key: keyof T, dir: SortDir) =>
{
	if(!dir) return data;
	return [...data].sort((a, b) =>
	{
		const av = a[key];
		const bv = b[key];
		if(av === bv) return 0;
		const less = av == null || av < bv;
		return dir === 'asc' ? (less ? -1 : 1) : (less ? 1 : -1);
	});
};

// ─── DataTable ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataTable = <T extends Record<string, any>>(
	{
		data,
		columns,
		keyField,
		selectable        = false,
		onSelectionChange,
		pageSize          = 10,
		className         = '',
		emptyMessage      = 'No data',
		totalRows,
		onPageChange,
		paginatorVariant  = 'default',
	}: DataTableProps<T>
) =>
{
	const uid = useId();

	const [sortKey, setSortKey]   = useState<(keyof T & string) | null>(null);
	const [sortDir, setSortDir]   = useState<SortDir>(null);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [page, setPage]         = useState(0);

	// In server-side mode data is already the current page: skip client sorting/slicing
	const isServerSide = totalRows != null;

	const sorted = useMemo(
		() => isServerSide || !sortKey ? data : sortRows(data, sortKey, sortDir),
		[data, sortKey, sortDir, isServerSide]
	);

	const totalRowCount = isServerSide ? totalRows! : sorted.length;
	const totalPages    = pageSize > 0 ? Math.ceil(totalRowCount / pageSize) : 1;
	const rangeStart    = pageSize > 0 ? page * pageSize + 1 : 1;
	const rangeEnd      = pageSize > 0 ? Math.min((page + 1) * pageSize, totalRowCount) : totalRowCount;

	const paginated = useMemo(() =>
	{
		if(isServerSide || pageSize === 0) return sorted;
		const start = page * pageSize;
		return sorted.slice(start, start + pageSize);
	}, [sorted, page, pageSize, isServerSide]);

	const handlePageChange = useCallback((next: number) =>
	{
		setPage(next);
		onPageChange?.(next, pageSize);
	}, [onPageChange, pageSize]);

	const handleSort = useCallback((key: keyof T & string) =>
	{
		setPage(0);
		setSortKey(prev =>
		{
			if(prev !== key)
			{
				setSortDir('asc');
				return key;
			}
			setSortDir(prevDir =>
			{
				if(prevDir === 'asc')  return 'desc';
				if(prevDir === 'desc') return null;
				return 'asc';
			});
			return prev;
		});
	}, []);

	const handleHeaderCheckbox = useCallback(() =>
	{
		const allKeys    = data.map(r => String(r[keyField]));
		const allChecked = allKeys.every(k => selected.has(k));
		const next       = new Set(allChecked ? [] : allKeys);
		setSelected(next);
		onSelectionChange?.(allChecked ? [] : data);
	}, [data, keyField, selected, onSelectionChange]);

	const handleRowCheckbox = useCallback((row: T) =>
	{
		const key  = String(row[keyField]);
		const next = new Set(selected);
		if(next.has(key)) next.delete(key);
		else next.add(key);
		setSelected(next);
		onSelectionChange?.(data.filter(r => next.has(String(r[keyField]))));
	}, [data, keyField, selected, onSelectionChange]);

	const allKeys     = data.map(r => String(r[keyField]));
	const allSelected = allKeys.length > 0 && allKeys.every(k => selected.has(k));
	const someSelected = !allSelected && allKeys.some(k => selected.has(k));
	const colCount    = columns.length + (selectable ? 1 : 0);

	const showPaginator = pageSize > 0 && totalRowCount > 0 && totalPages > 1;

	return (
		<div className={`@container w-full overflow-x-auto rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border ${className}`}>
			<table className='w-full border-collapse'>
				<thead className='border-b-[length:var(--border-width)] border-surface-border bg-surface-active'>
					<tr>
						{selectable && (
							<th className='px-4 py-3 text-left w-10' aria-label='Select all rows'>
								<input
									type='checkbox'
									id={`${uid}-select-all`}
									checked={allSelected}
									ref={el => { if(el) el.indeterminate = someSelected; }}
									onChange={handleHeaderCheckbox}
									aria-label='Select all rows'
									className={[
										'w-4 h-4 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-input-border bg-surface cursor-pointer',
										'accent-[var(--color-brand)]',
										'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
									].join(' ')}
								/>
							</th>
						)}

						{columns.map((col, colIndex) =>
						{
							const isSorted = sortKey === col.key;
							const ariaSort = !col.sortable
								? undefined
								: isSorted && sortDir === 'asc'  ? 'ascending'
								: isSorted && sortDir === 'desc' ? 'descending'
								: 'none';

							return (
								<th
									key={`${col.key}-${colIndex}`}
									className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted'
									style={col.width ? { width: col.width } : undefined}
									aria-sort={ariaSort}
								>
									{col.sortable
										? (
											<button
												type='button'
												onClick={() => handleSort(col.key)}
												className={[
													'inline-flex items-center gap-1.5',
													'transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none',
													'hover:text-text rounded-[var(--radius-sm)]',
													'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
												].join(' ')}
											>
												{col.header}
												<span className={isSorted ? 'text-text' : 'text-text-subtle'}>
													<SortIcon direction={isSorted ? sortDir : null} />
												</span>
											</button>
										)
										: col.header
									}
								</th>
							);
						})}
					</tr>
				</thead>

				<tbody className='divide-y divide-surface-border'>
					{paginated.length === 0
						? (
							<tr>
								<td
									colSpan={colCount}
									className='px-4 py-10 text-center text-sm text-text-muted'
								>
									{emptyMessage}
								</td>
							</tr>
						)
						: paginated.map(row =>
						{
							const rowKey    = String(row[keyField]);
							const isChecked = selected.has(rowKey);

							return (
								<tr
									key={rowKey}
									className={[
										'transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none',
										isChecked ? 'bg-surface-active' : 'hover:bg-surface-hover',
									].join(' ')}
								>
									{selectable && (
										<td className='px-4 py-3 w-10'>
											<input
												type='checkbox'
												id={`${uid}-row-${rowKey}`}
												checked={isChecked}
												onChange={() => handleRowCheckbox(row)}
												aria-label={`Select row ${rowKey}`}
												className={[
													'w-4 h-4 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-input-border bg-surface cursor-pointer',
													'accent-[var(--color-brand)]',
													'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
												].join(' ')}
											/>
										</td>
									)}

									{columns.map((col, colIndex) =>
									{
										const value = row[col.key];
										return (
											<td key={`${col.key}-${colIndex}`} className='px-4 py-3 text-sm text-text'>
												{col.render ? col.render(value, row) : String(value ?? '')}
											</td>
										);
									})}
								</tr>
							);
						})
					}
				</tbody>
			</table>

			{showPaginator && (
				<div className='border-t border-surface-border px-4 py-2 flex flex-col gap-2 @sm:flex-row @sm:items-center @sm:justify-between'>
					<span className='text-sm text-text-muted select-none'>
						Showing {rangeStart}{'–'}{rangeEnd} of {totalRowCount}
					</span>
					<Paginator
						page={page}
						totalPages={totalPages}
						onPageChange={handlePageChange}
						variant={paginatorVariant}
					/>
				</div>
			)}
		</div>
	);
};

export default DataTable;
