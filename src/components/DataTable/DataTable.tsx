'use client';

import { useState, useCallback, useMemo, useId, useRef, useEffect, type KeyboardEvent as ReactKeyboardEvent, type FocusEvent as ReactFocusEvent } from 'react';
import { Paginator, type PaginatorVariant } from './Paginator';
import { Checkbox } from '../Checkbox/Checkbox';

export type { PaginatorVariant };

export interface ColumnDef<T> {
	key:       keyof T & string;
	header:    string;
	sortable?: boolean;
	width?:    string;
	render?:   (value: T[keyof T], row: T) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DataTableProps<T extends Record<string, any>> {
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
type ActiveCell = { row: number; col: number };

// Only cells holding a focusable element (checkbox, sort button, render() widgets) are Tab/arrow stops, and focus lands on that element, never the <td>. If nothing is focusable the grid has no Tab stop.
const FOCUSABLE_SELECTOR = 'button, a[href], input, select, textarea';

// The grid must not steal arrow keys from these (cursor movement, option changes).
const NATIVE_ARROW_KEY_SELECTOR = 'textarea, select, input:not([type="checkbox"]):not([type="radio"])';

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

const SortIcon = ({ direction }: { direction: SortDir }) => {
	if(direction === 'asc')  return <SortAscIcon />;
	if(direction === 'desc') return <SortDescIcon />;
	return <SortNeutralIcon />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sortRows = <T extends Record<string, any>>(data: T[], key: keyof T, dir: SortDir) => {
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
) => {
	const uid      = useId();
	const tableRef = useRef<HTMLTableElement>(null);

	const [sortKey, setSortKey]     = useState<(keyof T & string) | null>(null);
	const [sortDir, setSortDir]     = useState<SortDir>(null);
	const [selected, setSelected]   = useState<Set<string>>(new Set());
	const [page, setPage]           = useState(0);
	// null: nothing focusable found yet, so no cell has a tabIndex. Resolved by the effect below.
	const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);

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

	// Grid keyboard navigation: row 0 is the header, rows 1..maxRow are body rows
	// (or the single empty-state row when there's no data).
	const maxRow    = paginated.length === 0 ? 1 : paginated.length;
	const maxCol    = colCount - 1;
	const activeRow = activeCell?.row ?? -1;
	const activeCol = activeCell?.col ?? -1;

	// Roving tabindex: one Tab stop in the grid. Known content (checkbox, sort button) sets tabIndex declaratively, so SSR is correct; render() cells (`data-dynamic`) are resolved after rendering.
	const isActiveCell = (row: number, col: number) => activeRow === row && activeCol === col;

	// Keeps `activeCell` on the first focusable cell as data, columns or selectable change; null (nothing focusable) is valid.
	useEffect(() =>
	{
		const table = tableRef.current;
		if(!table) return;

		const navigable = Array.from(table.querySelectorAll<HTMLElement>('[data-row][data-col]'))
			.filter(cell => cell.querySelector(FOCUSABLE_SELECTOR) != null)
			.map(cell => ({ row: Number(cell.dataset.row), col: Number(cell.dataset.col) }))
			.sort((a, b) => a.row - b.row || a.col - b.col);

		setActiveCell(prev =>
		{
			if(prev && navigable.some(c => c.row === prev.row && c.col === prev.col)) return prev;
			return navigable[0] ?? null;
		});
	}, [paginated, columns, selectable]);

	useEffect(() =>
	{
		const table = tableRef.current;
		if(!table) return;

		table.querySelectorAll<HTMLElement>('[data-dynamic]').forEach(cell =>
		{
			const isActive   = Number(cell.dataset.row) === activeRow && Number(cell.dataset.col) === activeCol;
			const focusables = cell.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

			if(focusables.length === 0)
			{
				cell.removeAttribute('tabindex'); // nothing to skip to here — not a stop
				return;
			}

			// A composite widget (e.g. ToggleGroup) already marks its own entry point with tabIndex 0; use that instead of the first element so we don't fight its roving tabindex.
			const primary = Array.from(focusables).find(el => el.tabIndex === 0) ?? focusables[0];
			focusables.forEach(el => el.setAttribute('tabindex', el === primary && isActive ? '0' : '-1'));
		});
	}, [paginated, columns, selectable, activeRow, activeCol]);

	const isNavigableCell = useCallback((row: number, col: number) =>
	{
		const cell = tableRef.current?.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`);
		return !!cell && cell.querySelector(FOCUSABLE_SELECTOR) != null;
	}, []);

	const focusCell = useCallback((row: number, col: number) =>
	{
		const cell = tableRef.current?.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`);
		if(!cell) return;

		// Same as above: land on the widget's own entry point, not the first element.
		const focusables = Array.from(cell.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
		const target      = focusables.find(el => el.tabIndex === 0) ?? focusables[0];
		if(!target) return;

		setActiveCell({ row, col });
		target.focus();
	}, []);

	// Wraps at the ends, like the other roving-tabindex composites.
	const moveFocus = useCallback((deltaRow: number, deltaCol: number) =>
	{
		let row = activeRow;
		let col = activeCol;
		do
		{
			row = deltaRow === 0 ? row : (row + deltaRow + maxRow + 1) % (maxRow + 1);
			col = deltaCol === 0 ? col : (col + deltaCol + maxCol + 1) % (maxCol + 1);

			if(isNavigableCell(row, col))
			{
				focusCell(row, col);
				return;
			}
		}
		while(row !== activeRow || col !== activeCol);
	}, [activeRow, activeCol, maxRow, maxCol, isNavigableCell, focusCell]);

	// Up/Down belong to the grid. Widgets in cells (ToggleGroup, RadioGroup) also claim them and always preventDefault, so intercept in the capture phase before they see the key.
	const handleGridKeyDownCapture = useCallback((e: ReactKeyboardEvent<HTMLTableElement>) =>
	{
		if(activeCell === null) return;
		if(e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		if((e.target as HTMLElement).matches(NATIVE_ARROW_KEY_SELECTOR)) return;

		e.preventDefault();
		e.stopPropagation();
		moveFocus(e.key === 'ArrowDown' ? 1 : -1, 0);
	}, [activeCell, moveFocus]);

	// Left/Right run in the bubble phase, so a widget that handled the key (preventDefault) wins before the grid moves columns.
	const handleGridKeyDown = useCallback((e: ReactKeyboardEvent<HTMLTableElement>) =>
	{
		if(activeCell === null) return;
		if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		if((e.target as HTMLElement).matches(NATIVE_ARROW_KEY_SELECTOR)) return;
		if(e.defaultPrevented) return;

		e.preventDefault();
		moveFocus(0, e.key === 'ArrowRight' ? 1 : -1);
	}, [activeCell, moveFocus]);

	const handleGridFocus = useCallback((e: ReactFocusEvent<HTMLTableElement>) =>
	{
		const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-row][data-col]');
		if(!cell) return;

		const row = Number(cell.dataset.row);
		const col = Number(cell.dataset.col);
		if(row === activeRow && col === activeCol) return;

		setActiveCell({ row, col });
	}, [activeRow, activeCol]);

	return (
		<div className={`@container w-full overflow-x-auto rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border ${className}`}>
			<table
				ref={tableRef}
				className='w-full border-collapse'
				role='grid'
				onKeyDownCapture={handleGridKeyDownCapture}
				onKeyDown={handleGridKeyDown}
				onFocus={handleGridFocus}
			>
				<thead className='border-b-[length:var(--border-width)] border-surface-border bg-surface-active'>
					<tr>
						{selectable && (
							<th
								className='px-4 py-3 text-left w-10'
								aria-label='Select all rows'
								data-row={0}
								data-col={0}
							>
								<Checkbox
									id={`${uid}-select-all`}
									checked={allSelected}
									ref={el => { if(el) el.indeterminate = someSelected; }}
									onChange={handleHeaderCheckbox}
									aria-label='Select all rows'
									tabIndex={isActiveCell(0, 0) ? 0 : -1}
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

							const gridCol = (selectable ? 1 : 0) + colIndex;

							return (
								<th
									key={`${col.key}-${colIndex}`}
									className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted'
									style={col.width ? { width: col.width } : undefined}
									aria-sort={ariaSort}
									data-row={0}
									data-col={gridCol}
								>
									{col.sortable
										? (
											<button
												type='button'
												onClick={() => handleSort(col.key)}
												tabIndex={isActiveCell(0, gridCol) ? 0 : -1}
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
									data-row={1}
									data-col={0}
								>
									{emptyMessage}
								</td>
							</tr>
						)
						: paginated.map((row, rowIndex) =>
						{
							const rowKey    = String(row[keyField]);
							const isChecked = selected.has(rowKey);
							const gridRow   = rowIndex + 1;

							return (
								<tr
									key={rowKey}
									className={[
										'transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none',
										isChecked ? 'bg-surface-active' : 'hover:bg-surface-hover',
									].join(' ')}
								>
									{selectable && (
										<td
											className='px-4 py-3 w-10'
											data-row={gridRow}
											data-col={0}
										>
											<Checkbox
												id={`${uid}-row-${rowKey}`}
												checked={isChecked}
												onChange={() => handleRowCheckbox(row)}
												aria-label={`Select row ${rowKey}`}
												tabIndex={isActiveCell(gridRow, 0) ? 0 : -1}
											/>
										</td>
									)}

									{columns.map((col, colIndex) =>
									{
										const value   = row[col.key];
										const gridCol = (selectable ? 1 : 0) + colIndex;
										return (
											<td
												key={`${col.key}-${colIndex}`}
												className='px-4 py-3 text-sm text-text'
												data-row={gridRow}
												data-col={gridCol}
												data-dynamic={col.render ? true : undefined}
											>
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
