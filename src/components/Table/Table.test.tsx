import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from './Table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const BasicTable = ({ striped = false }: { striped?: boolean }) => {
	return (
		<Table striped={striped}>
			<TableHead>
				<TableRow header>
					<TableHeader>Name</TableHeader>
					<TableHeader>Role</TableHeader>
				</TableRow>
			</TableHead>
			<TableBody>
				<TableRow>
					<TableCell>Alice</TableCell>
					<TableCell>Engineer</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Ben</TableCell>
					<TableCell>Designer</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
};

describe('Table', () =>
{
	it('renders without errors', () =>
	{
		render(<BasicTable />);
		expect(screen.getByRole('table')).toBeDefined();
	});

	it('renders a table element', () =>
	{
		render(<BasicTable />);
		const table = screen.getByRole('table');
		expect(table.tagName.toLowerCase()).toBe('table');
	});

	it('applies border-collapse class', () =>
	{
		render(<BasicTable />);
		expect(screen.getByRole('table').className).toContain('border-collapse');
	});

	it('applies striped classes when striped prop is true', () =>
	{
		render(<BasicTable striped />);
		expect(screen.getByRole('table').className).toContain('nth-child(odd)');
	});

	it('does not apply striped classes when striped is false', () =>
	{
		render(<BasicTable />);
		expect(screen.getByRole('table').className).not.toContain('nth-child(odd)');
	});

	it('forwards className to the table element', () =>
	{
		render(<Table className='custom-table'><tbody /></Table>);
		expect(screen.getByRole('table').className).toContain('custom-table');
	});

	it('forwards native table attributes', () =>
	{
		render(<Table aria-label='users table'><tbody /></Table>);
		expect(screen.getByRole('table').getAttribute('aria-label')).toBe('users table');
	});

	it('applies default variant wrapper classes when variant is not set', () =>
	{
		render(<BasicTable />);
		const wrapper = screen.getByRole('table').parentElement!;
		expect(wrapper.className).toContain('border-surface-border');
		expect(wrapper.className).toContain('rounded-[var(--radius)]');
	});
});

describe('Table variant="minimal"', () =>
{
	const MinimalTable = () => {
		return (
			<Table variant='minimal'>
				<TableHead>
					<TableRow header>
						<TableHeader>Name</TableHeader>
						<TableHeader>Role</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					<TableRow>
						<TableCell>Alice</TableCell>
						<TableCell>Engineer</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		);
	};

	it('does not apply the outer border wrapper', () =>
	{
		render(<MinimalTable />);
		const wrapper = screen.getByRole('table').parentElement!;
		expect(wrapper.className).not.toContain('border-surface-border');
		expect(wrapper.className).not.toContain('rounded-[var(--radius)]');
	});

	it('does not apply header background fill', () =>
	{
		render(<MinimalTable />);
		expect(document.querySelector('thead')!.className).not.toContain('bg-surface-active');
	});

	it('does not apply tbody divide classes', () =>
	{
		render(<MinimalTable />);
		expect(document.querySelector('tbody')!.className).not.toContain('divide-y');
	});

	it('applies border-b to body rows', () =>
	{
		render(<MinimalTable />);
		const cell = screen.getByText('Alice');
		const row = cell.closest('tr')!;
		expect(row.className).toContain('border-b');
		expect(row.className).toContain('border-surface-border');
	});

	it('applies border-b to header cells', () =>
	{
		render(<MinimalTable />);
		const th = screen.getByText('Name');
		expect(th.className).toContain('border-b');
		expect(th.className).toContain('border-surface-border');
	});

	it('applies minimal header cell text classes', () =>
	{
		render(<MinimalTable />);
		const th = screen.getByText('Name');
		expect(th.className).toContain('text-xs');
		expect(th.className).toContain('font-medium');
		expect(th.className).toContain('text-text-muted');
		expect(th.className).toContain('uppercase');
		expect(th.className).toContain('tracking-wide');
	});

	it('applies minimal body cell classes', () =>
	{
		render(<MinimalTable />);
		const td = screen.getByText('Alice');
		expect(td.className).toContain('py-3');
		expect(td.className).toContain('align-top');
		expect(td.className).not.toContain('px-4');
	});

	it('ignores striped when variant is minimal', () =>
	{
		render(<Table variant='minimal' striped><tbody /></Table>);
		expect(screen.getByRole('table').className).not.toContain('nth-child(odd)');
	});
});

describe('TableHead', () =>
{
	it('renders a thead element', () =>
	{
		render(
			<table>
				<TableHead><tr><th>H</th></tr></TableHead>
			</table>
		);
		expect(document.querySelector('thead')).toBeDefined();
	});

	it('applies header background token class', () =>
	{
		render(
			<table>
				<TableHead><tr><th>H</th></tr></TableHead>
			</table>
		);
		expect(document.querySelector('thead')!.className).toContain('bg-surface-active');
	});
});

describe('TableBody', () =>
{
	it('renders a tbody element', () =>
	{
		render(
			<table>
				<TableBody><tr><td>cell</td></tr></TableBody>
			</table>
		);
		expect(document.querySelector('tbody')).toBeDefined();
	});

	it('applies divide classes for row separators', () =>
	{
		render(
			<table>
				<TableBody><tr><td>cell</td></tr></TableBody>
			</table>
		);
		expect(document.querySelector('tbody')!.className).toContain('divide-y');
	});
});

describe('TableRow', () =>
{
	it('renders a tr element', () =>
	{
		render(
			<table><tbody>
				<TableRow><td>cell</td></TableRow>
			</tbody></table>
		);
		expect(screen.getByRole('row')).toBeDefined();
	});

	it('applies hover class on body rows', () =>
	{
		render(
			<table><tbody>
				<TableRow><td>cell</td></TableRow>
			</tbody></table>
		);
		expect(screen.getByRole('row').className).toContain('hover:bg-surface-hover');
	});

	it('does not apply hover class when header prop is true', () =>
	{
		render(
			<table><thead>
				<TableRow header><th>header</th></TableRow>
			</thead></table>
		);
		expect(screen.getByRole('row').className).not.toContain('hover:bg-surface-hover');
	});

	it('forwards className', () =>
	{
		render(
			<table><tbody>
				<TableRow className='my-row'><td>cell</td></TableRow>
			</tbody></table>
		);
		expect(screen.getByRole('row').className).toContain('my-row');
	});
});

describe('TableHeader', () =>
{
	it('renders a th element', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader>Name</TableHeader>
			</tr></thead></table>
		);
		expect(screen.getByRole('columnheader')).toBeDefined();
	});

	it('applies uppercase small caps classes', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader>Name</TableHeader>
			</tr></thead></table>
		);
		const th = screen.getByRole('columnheader');
		expect(th.className).toContain('uppercase');
		expect(th.className).toContain('text-xs');
	});

	it('renders sort button when onSort is provided', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader sortDirection={null} onSort={() => {}}>Name</TableHeader>
			</tr></thead></table>
		);
		expect(screen.getByRole('button')).toBeDefined();
	});

	it('does not render sort button when onSort is not provided', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader>Name</TableHeader>
			</tr></thead></table>
		);
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('fires onSort callback when sort button is clicked', async () =>
	{
		const onSort = vi.fn();
		render(
			<table><thead><tr>
				<TableHeader sortDirection={null} onSort={onSort}>Name</TableHeader>
			</tr></thead></table>
		);
		await userEvent.click(screen.getByRole('button'));
		expect(onSort).toHaveBeenCalledTimes(1);
	});

	it('sets aria-sort="ascending" when sortDirection is asc', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader sortDirection='asc' onSort={() => {}}>Name</TableHeader>
			</tr></thead></table>
		);
		expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('ascending');
	});

	it('sets aria-sort="descending" when sortDirection is desc', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader sortDirection='desc' onSort={() => {}}>Name</TableHeader>
			</tr></thead></table>
		);
		expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('descending');
	});

	it('sets aria-sort="none" when sortDirection is null', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader sortDirection={null} onSort={() => {}}>Name</TableHeader>
			</tr></thead></table>
		);
		expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('none');
	});

	it('applies focus-visible ring classes to sort button', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader sortDirection={null} onSort={() => {}}>Name</TableHeader>
			</tr></thead></table>
		);
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('focus-visible:ring-2');
		expect(btn.className).toContain('focus-visible:ring-offset-2');
		expect(btn.className).toContain('focus-visible:ring-brand-ring');
	});

	it('forwards className to th element', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader className='custom-th'>Name</TableHeader>
			</tr></thead></table>
		);
		expect(screen.getByRole('columnheader').className).toContain('custom-th');
	});

	it('forwards native th attributes', () =>
	{
		render(
			<table><thead><tr>
				<TableHeader scope='col'>Name</TableHeader>
			</tr></thead></table>
		);
		expect(screen.getByRole('columnheader').getAttribute('scope')).toBe('col');
	});
});

describe('TableCell', () =>
{
	it('renders a td element', () =>
	{
		render(
			<table><tbody><tr>
				<TableCell>Alice</TableCell>
			</tr></tbody></table>
		);
		expect(screen.getByRole('cell')).toBeDefined();
	});

	it('applies padding and text-size classes', () =>
	{
		render(
			<table><tbody><tr>
				<TableCell>Alice</TableCell>
			</tr></tbody></table>
		);
		const td = screen.getByRole('cell');
		expect(td.className).toContain('px-4');
		expect(td.className).toContain('py-3');
		expect(td.className).toContain('text-sm');
	});

	it('applies text token class', () =>
	{
		render(
			<table><tbody><tr>
				<TableCell>Alice</TableCell>
			</tr></tbody></table>
		);
		expect(screen.getByRole('cell').className).toContain('text-text');
	});

	it('forwards className', () =>
	{
		render(
			<table><tbody><tr>
				<TableCell className='custom-td'>Alice</TableCell>
			</tr></tbody></table>
		);
		expect(screen.getByRole('cell').className).toContain('custom-td');
	});

	it('forwards native td attributes', () =>
	{
		render(
			<table><tbody><tr>
				<TableCell colSpan={2}>Alice</TableCell>
			</tr></tbody></table>
		);
		expect(screen.getByRole('cell').getAttribute('colspan')).toBe('2');
	});
});
