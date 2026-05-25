import { render, screen } from '@testing-library/react';
import DataTable, { type ColumnDef } from './DataTable';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

interface Person
{
	id:     number;
	name:   string;
	role:   string;
	status: string;
}

const COLUMNS: ColumnDef<Person>[] = [
	{ key: 'name',   header: 'Name',   sortable: true },
	{ key: 'role',   header: 'Role',   sortable: true },
	{ key: 'status', header: 'Status', sortable: false },
];

const DATA: Person[] = [
	{ id: 1, name: 'Alice Chen',  role: 'Engineer', status: 'Active' },
	{ id: 2, name: 'Bob Ruiz',    role: 'Designer', status: 'Away'   },
	{ id: 3, name: 'Carol Smith', role: 'Manager',  status: 'Active' },
	{ id: 4, name: 'Dave Park',   role: 'Engineer', status: 'Active' },
	{ id: 5, name: 'Eve Torres',  role: 'Designer', status: 'Away'   },
	{ id: 6, name: 'Frank Lee',   role: 'Manager',  status: 'Active' },
];

const renderTable = (overrides: Partial<Parameters<typeof DataTable<Person>>[0]> = {}) => {
	return render(
		<DataTable<Person>
			data={DATA}
			columns={COLUMNS}
			keyField='id'
			pageSize={0}
			{...overrides}
		/>
	);
};

describe('DataTable', () =>
{
	it('renders all rows', () =>
	{
		renderTable();
		expect(screen.getByText('Alice Chen')).toBeDefined();
		expect(screen.getByText('Bob Ruiz')).toBeDefined();
		expect(screen.getByText('Carol Smith')).toBeDefined();
		expect(screen.getByText('Dave Park')).toBeDefined();
		expect(screen.getByText('Eve Torres')).toBeDefined();
		expect(screen.getByText('Frank Lee')).toBeDefined();
	});

	it('renders all column headers', () =>
	{
		renderTable();
		expect(screen.getByRole('columnheader', { name: /name/i })).toBeDefined();
		expect(screen.getByRole('columnheader', { name: /role/i })).toBeDefined();
		expect(screen.getByRole('columnheader', { name: /status/i })).toBeDefined();
	});

	it('uses a custom render function for cell content', () =>
	{
		const customColumns: ColumnDef<Person>[] = [
			...COLUMNS,
			{
				key:    'status',
				header: 'Status',
				render: (_val, row) => <span data-testid='custom-cell'>{row.status.toUpperCase()}</span>,
			},
		];
		renderTable({ columns: customColumns });
		const cells = screen.getAllByTestId('custom-cell');
		expect(cells.length).toBeGreaterThan(0);
		expect(cells[0].textContent).toBe('ACTIVE');
	});

	it('shows empty message when data is empty', () =>
	{
		renderTable({ data: [] });
		expect(screen.getByText('No data')).toBeDefined();
	});

	it('shows custom emptyMessage when provided', () =>
	{
		renderTable({ data: [], emptyMessage: 'Nothing here yet' });
		expect(screen.getByText('Nothing here yet')).toBeDefined();
	});

	describe('sorting', () =>
	{
		it('sorts ascending on first click of a sortable header', async () =>
		{
			renderTable();
			const nameBtn = screen.getByRole('button', { name: /name/i });
			await userEvent.click(nameBtn);

			const rows = screen.getAllByRole('row').slice(1);
			expect(rows[0].textContent).toContain('Alice Chen');
		});

		it('sorts descending on second click', async () =>
		{
			renderTable();
			const nameBtn = screen.getByRole('button', { name: /name/i });
			await userEvent.click(nameBtn);
			await userEvent.click(nameBtn);

			const rows = screen.getAllByRole('row').slice(1);
			expect(rows[0].textContent).toContain('Frank Lee');
		});

		it('clears sort on third click', async () =>
		{
			renderTable();
			const nameBtn = screen.getByRole('button', { name: /name/i });
			await userEvent.click(nameBtn);
			await userEvent.click(nameBtn);
			await userEvent.click(nameBtn);

			const rows = screen.getAllByRole('row').slice(1);
			expect(rows[0].textContent).toContain('Alice Chen');
		});

		it('sets aria-sort=ascending on first click', async () =>
		{
			renderTable();
			const nameBtn = screen.getByRole('button', { name: /name/i });
			await userEvent.click(nameBtn);

			const nameHeader = screen.getByRole('columnheader', { name: /name/i });
			expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
		});

		it('sets aria-sort=descending on second click', async () =>
		{
			renderTable();
			const nameBtn = screen.getByRole('button', { name: /name/i });
			await userEvent.click(nameBtn);
			await userEvent.click(nameBtn);

			const nameHeader = screen.getByRole('columnheader', { name: /name/i });
			expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
		});

		it('resets aria-sort to none on third click', async () =>
		{
			renderTable();
			const nameBtn = screen.getByRole('button', { name: /name/i });
			await userEvent.click(nameBtn);
			await userEvent.click(nameBtn);
			await userEvent.click(nameBtn);

			const nameHeader = screen.getByRole('columnheader', { name: /name/i });
			expect(nameHeader.getAttribute('aria-sort')).toBe('none');
		});

		it('non-sortable header has no aria-sort attribute', () =>
		{
			renderTable();
			const statusHeader = screen.getByRole('columnheader', { name: /status/i });
			expect(statusHeader.getAttribute('aria-sort')).toBeNull();
		});

		it('only one column is sorted at a time', async () =>
		{
			renderTable();
			const nameBtn = screen.getByRole('button', { name: /name/i });
			const roleBtn = screen.getByRole('button', { name: /role/i });
			await userEvent.click(nameBtn);
			await userEvent.click(roleBtn);

			const nameHeader = screen.getByRole('columnheader', { name: /name/i });
			const roleHeader = screen.getByRole('columnheader', { name: /role/i });
			expect(nameHeader.getAttribute('aria-sort')).toBe('none');
			expect(roleHeader.getAttribute('aria-sort')).toBe('ascending');
		});
	});

	describe('row selection', () =>
	{
		it('renders checkbox column when selectable=true', () =>
		{
			renderTable({ selectable: true });
			const checkboxes = screen.getAllByRole('checkbox');
			expect(checkboxes.length).toBe(DATA.length + 1);
		});

		it('does not render checkbox column when selectable=false', () =>
		{
			renderTable({ selectable: false });
			expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
		});

		it('toggles a row checkbox on click', async () =>
		{
			const onSelectionChange = vi.fn();
			renderTable({ selectable: true, onSelectionChange });

			const checkboxes = screen.getAllByRole('checkbox');
			await userEvent.click(checkboxes[1]);

			expect(onSelectionChange).toHaveBeenCalledTimes(1);
			const [calledWith] = onSelectionChange.mock.calls[0];
			expect(calledWith).toHaveLength(1);
			expect(calledWith[0].id).toBe(1);
		});

		it('header checkbox selects all rows', async () =>
		{
			const onSelectionChange = vi.fn();
			renderTable({ selectable: true, onSelectionChange });

			const headerCheckbox = screen.getAllByRole('checkbox')[0];
			await userEvent.click(headerCheckbox);

			const [calledWith] = onSelectionChange.mock.calls[0];
			expect(calledWith).toHaveLength(DATA.length);
		});

		it('header checkbox deselects all rows when all are selected', async () =>
		{
			const onSelectionChange = vi.fn();
			renderTable({ selectable: true, onSelectionChange });

			const headerCheckbox = screen.getAllByRole('checkbox')[0];
			await userEvent.click(headerCheckbox);
			await userEvent.click(headerCheckbox);

			const lastCall = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1];
			expect(lastCall[0]).toHaveLength(0);
		});

		it('header checkbox is indeterminate when some rows are selected', async () =>
		{
			renderTable({ selectable: true });
			const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
			await userEvent.click(checkboxes[1]);

			expect(checkboxes[0].indeterminate).toBe(true);
			expect(checkboxes[0].checked).toBe(false);
		});

		it('calls onSelectionChange with correct rows when selection changes', async () =>
		{
			const onSelectionChange = vi.fn();
			renderTable({ selectable: true, onSelectionChange });

			const checkboxes = screen.getAllByRole('checkbox');
			await userEvent.click(checkboxes[2]);

			const [calledWith] = onSelectionChange.mock.calls[0];
			expect(calledWith[0].id).toBe(2);
		});

		it('selected row has bg-surface-active class', async () =>
		{
			renderTable({ selectable: true });
			const checkboxes = screen.getAllByRole('checkbox');
			await userEvent.click(checkboxes[1]);

			const rows = screen.getAllByRole('row');
			expect(rows[1].className).toContain('bg-surface-active');
		});
	});

	describe('pagination', () =>
	{
		it('shows first page of rows when pageSize > 0', () =>
		{
			renderTable({ pageSize: 3 });
			expect(screen.getByText('Alice Chen')).toBeDefined();
			expect(screen.queryByText('Dave Park')).toBeNull();
		});

		it('shows "Showing X–Y of N" range text', () =>
		{
			renderTable({ pageSize: 3 });
			expect(screen.getByText('Showing 1–3 of 6')).toBeDefined();
		});

		it('Prev button is disabled on the first page', () =>
		{
			renderTable({ pageSize: 3 });
			const prev = screen.getByRole('button', { name: /go to previous page/i });
			expect(prev).toHaveProperty('disabled', true);
		});

		it('Next button is enabled on the first page', () =>
		{
			renderTable({ pageSize: 3 });
			const next = screen.getByRole('button', { name: /go to next page/i });
			expect(next).toHaveProperty('disabled', false);
		});

		it('navigates to next page on Next click', async () =>
		{
			renderTable({ pageSize: 3 });
			const next = screen.getByRole('button', { name: /go to next page/i });
			await userEvent.click(next);

			expect(screen.queryByText('Alice Chen')).toBeNull();
			expect(screen.getByText('Dave Park')).toBeDefined();
		});

		it('navigates back to previous page on Prev click', async () =>
		{
			renderTable({ pageSize: 3 });
			const next = screen.getByRole('button', { name: /go to next page/i });
			await userEvent.click(next);

			const prev = screen.getByRole('button', { name: /go to previous page/i });
			await userEvent.click(prev);

			expect(screen.getByText('Alice Chen')).toBeDefined();
		});

		it('Next button is disabled on the last page', async () =>
		{
			renderTable({ pageSize: 3 });
			const next = screen.getByRole('button', { name: /go to next page/i });
			await userEvent.click(next);
			expect(next).toHaveProperty('disabled', true);
		});

		it('pagination resets to page 1 after sorting', async () =>
		{
			renderTable({ pageSize: 3 });
			const next = screen.getByRole('button', { name: /go to next page/i });
			await userEvent.click(next);

			expect(screen.getByText('Dave Park')).toBeDefined();

			const nameBtn = screen.getByRole('button', { name: /name/i });
			await userEvent.click(nameBtn);

			expect(screen.getByText('Alice Chen')).toBeDefined();
			expect(screen.queryByText('Dave Park')).toBeNull();
		});

		it('does not render pagination footer when pageSize=0', () =>
		{
			renderTable({ pageSize: 0 });
			expect(screen.queryByRole('button', { name: /go to next page/i })).toBeNull();
		});
	});

	describe('accessibility', () =>
	{
		it('sort button has focus-visible ring classes', () =>
		{
			renderTable();
			const nameBtn = screen.getByRole('button', { name: /name/i });
			expect(nameBtn.className).toContain('focus-visible:ring-2');
			expect(nameBtn.className).toContain('focus-visible:ring-offset-2');
			expect(nameBtn.className).toContain('focus-visible:ring-brand-ring');
		});

		it('pagination buttons have focus-visible ring classes', () =>
		{
			renderTable({ pageSize: 3 });
			const prev = screen.getByRole('button', { name: /go to previous page/i });
			const next = screen.getByRole('button', { name: /go to next page/i });
			expect(prev.className).toContain('focus-visible:ring-2');
			expect(next.className).toContain('focus-visible:ring-2');
		});

		it('pagination buttons have descriptive aria-label attributes', () =>
		{
			renderTable({ pageSize: 3 });
			expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDefined();
			expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDefined();
		});

		it('table renders as a table element', () =>
		{
			renderTable();
			expect(screen.getByRole('table')).toBeDefined();
		});

		it('renders thead with column headers', () =>
		{
			renderTable();
			const headers = screen.getAllByRole('columnheader');
			expect(headers.length).toBe(COLUMNS.length);
		});
	});
});
