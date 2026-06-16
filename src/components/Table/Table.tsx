'use client';;
import { TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableProps extends TableHTMLAttributes<HTMLTableElement>
{
	striped?: boolean;
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

export const Table = ({ striped = false, className = '', children, ...props }: TableProps) => {
	return (
		<div className='w-full overflow-x-auto rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border'>
			<table
				className={`w-full border-collapse ${striped ? '[&_tbody_tr:nth-child(odd)]:bg-surface [&_tbody_tr:nth-child(even)]:bg-surface-hover' : ''} ${className}`}
				{...props}
			>
				{children}
			</table>
		</div>
	);
};

export const TableHead = ({ className = '', children, ...props }: TableHeadProps) => {
	return (
		<thead className={`border-b-[length:var(--border-width)] border-surface-border bg-surface-active ${className}`} {...props}>
			{children}
		</thead>
	);
};

export const TableBody = ({ className = '', children, ...props }: TableBodyProps) => {
	return (
		<tbody className={`divide-y divide-surface-border ${className}`} {...props}>
			{children}
		</tbody>
	);
};

export const TableRow = ({ header = false, className = '', children, ...props }: TableRowProps) => {
	const hoverClass = header ? '' : 'hover:bg-surface-hover transition-colors duration-150 motion-reduce:transition-none';

	return (
		<tr className={`${hoverClass} ${className}`} {...props}>
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
	const isSortable = onSort !== undefined;
	const labelBase = 'text-xs font-semibold uppercase tracking-wide text-text-muted';

	if(isSortable)
	{
		return (
			<th
				className={`${CELL_BASE} ${labelBase} text-left ${className}`}
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
			className={`${CELL_BASE} ${labelBase} text-left ${className}`}
			{...props}
		>
			{children}
		</th>
	);
};

export const TableCell = ({ className = '', children, ...props }: TableCellProps) => {
	return (
		<td className={`${CELL_BASE} ${className}`} {...props}>
			{children}
		</td>
	);
};

export default Table;
