'use client';

import { createContext, useContext, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from 'react';

export type SortDirection = 'asc' | 'desc' | null;
export type TableVariant = 'default' | 'minimal';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement>
{
	striped?: boolean;
	variant?: TableVariant;
	className?: string;
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement>
{
	className?: string;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement>
{
	className?: string;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement>
{
	header?: boolean;
	className?: string;
}

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement>
{
	sortDirection?: SortDirection;
	onSort?: () => void;
	className?: string;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement>
{
	className?: string;
}

const CELL_BASE = 'px-4 py-3 text-sm text-text';

const TableVariantContext = createContext<TableVariant>('default');

const useTableVariant = () => useContext(TableVariantContext);

export const Table = ({ striped = false, variant = 'default', className = '', children, ...props }: TableProps) => {
	const isMinimal = variant === 'minimal';
	const wrapperClass = isMinimal
		? 'w-full overflow-x-auto'
		: 'w-full overflow-x-auto rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border';
	const stripedClass = !isMinimal && striped ? '[&_tbody_tr:nth-child(odd)]:bg-surface [&_tbody_tr:nth-child(even)]:bg-surface-hover' : '';

	return (
		<TableVariantContext.Provider value={variant}>
			<div className={wrapperClass}>
				<table
					className={`w-full border-collapse ${stripedClass} ${className}`}
					{...props}
				>
					{children}
				</table>
			</div>
		</TableVariantContext.Provider>
	);
};

export const TableHead = ({ className = '', children, ...props }: TableHeadProps) => {
	const variant = useTableVariant();
	const baseClass = variant === 'minimal' ? '' : 'border-b-[length:var(--border-width)] border-surface-border bg-surface-active';

	return (
		<thead className={`${baseClass} ${className}`} {...props}>
			{children}
		</thead>
	);
};

export const TableBody = ({ className = '', children, ...props }: TableBodyProps) => {
	const variant = useTableVariant();
	const baseClass = variant === 'minimal' ? '' : 'divide-y divide-surface-border';

	return (
		<tbody className={`${baseClass} ${className}`} {...props}>
			{children}
		</tbody>
	);
};

export const TableRow = ({ header = false, className = '', children, ...props }: TableRowProps) => {
	const variant = useTableVariant();
	const hoverClass = header ? '' : 'hover:bg-surface-hover transition-colors duration-150 motion-reduce:transition-none';
	const borderClass = variant === 'minimal' && !header ? 'border-b border-surface-border' : '';

	return (
		<tr className={`${hoverClass} ${borderClass} ${className}`} {...props}>
			{children}
		</tr>
	);
};

const SortIcon = ({ direction }: { direction: SortDirection }) => {
	if(direction === 'asc')
	{
		return <span aria-hidden='true' className='ml-1.5 inline-block text-text-muted'>▲</span>;
	}

	if(direction === 'desc')
	{
		return <span aria-hidden='true' className='ml-1.5 inline-block text-text-muted'>▼</span>;
	}

	return <span aria-hidden='true' className='ml-1.5 inline-block text-text-subtle'>⇅</span>;
};

export const TableHeader = (
    {
        sortDirection,
        onSort,
        className = '',
        children,
        ...props
    }: TableHeaderProps
) => {
	const variant = useTableVariant();
	const isSortable = onSort !== undefined;
	const labelClass = variant === 'minimal'
		? 'pb-2 text-xs font-medium text-text-muted uppercase tracking-wide border-b border-surface-border text-left'
		: `${CELL_BASE} text-xs font-semibold uppercase tracking-wide text-text-muted text-left`;

	if(isSortable)
	{
		return (
			<th
				className={`${labelClass} ${className}`}
				aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none'}
				{...props}
			>
				<button
					type='button'
					onClick={onSort}
					className='inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring rounded-[var(--radius-sm)] hover:text-text transition-colors duration-150 motion-reduce:transition-none'
				>
					{children}
					<SortIcon direction={sortDirection ?? null} />
				</button>
			</th>
		);
	}

	return (
		<th
			className={`${labelClass} ${className}`}
			{...props}
		>
			{children}
		</th>
	);
};

export const TableCell = ({ className = '', children, ...props }: TableCellProps) => {
	const variant = useTableVariant();
	const cellClass = variant === 'minimal' ? 'py-3 align-top text-sm text-text' : CELL_BASE;

	return (
		<td className={`${cellClass} ${className}`} {...props}>
			{children}
		</td>
	);
};

export default Table;
