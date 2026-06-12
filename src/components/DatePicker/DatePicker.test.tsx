import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DatePicker from './DatePicker';

const MAY_15 = new Date(2025, 4, 15);
const MAY_1  = new Date(2025, 4, 1);

const renderPicker = (props: Partial<React.ComponentProps<typeof DatePicker>> = {}) => {
	return render(<DatePicker {...props} />);
};

describe('DatePicker', () =>
{
	it('renders trigger with placeholder when no value is set', () =>
	{
		renderPicker();
		expect(screen.getByRole('button', { name: /pick a date/i })).toBeDefined();
	});

	it('renders formatted date when a value is set', () =>
	{
		renderPicker({ value: MAY_15 });
		expect(screen.getByRole('button', { name: /may 15, 2025/i })).toBeDefined();
	});

	it('opens calendar popup on trigger click', async () =>
	{
		renderPicker({ value: MAY_15 });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));
		expect(screen.getByRole('dialog', { name: /date picker/i })).toBeDefined();
	});

	it('aria-expanded on trigger reflects open state', async () =>
	{
		renderPicker({ value: MAY_15 });
		const trigger = screen.getByRole('button', { name: /may 15, 2025/i });
		expect(trigger.getAttribute('aria-expanded')).toBe('false');

		await userEvent.click(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('role="grid" is present when popup is open', async () =>
	{
		renderPicker({ value: MAY_15 });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));
		expect(screen.getByRole('grid')).toBeDefined();
	});

	it('closes on Escape and returns focus to trigger', async () =>
	{
		renderPicker({ value: MAY_15 });
		const trigger = screen.getByRole('button', { name: /may 15, 2025/i });

		await userEvent.click(trigger);

		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

		const dayBtn = screen.getByRole('button', { name: /15 May 2025/i });
		dayBtn.focus();

		await userEvent.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
		expect(document.activeElement).toBe(trigger);
	});

	it('prev month navigation updates the month/year header', async () =>
	{
		renderPicker({ value: MAY_15 });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));

		expect(screen.getByText('May 2025')).toBeDefined();

		await userEvent.click(screen.getByRole('button', { name: /previous month/i }));
		expect(screen.getByText('April 2025')).toBeDefined();
	});

	it('next month navigation updates the month/year header', async () =>
	{
		renderPicker({ value: MAY_15 });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));

		await userEvent.click(screen.getByRole('button', { name: /next month/i }));
		expect(screen.getByText('June 2025')).toBeDefined();
	});

	it('clicking a day calls onChange with the correct Date and closes the popup', async () =>
	{
		const onChange = vi.fn();
		renderPicker({ value: MAY_15, onChange });

		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));

		const grid    = screen.getByRole('grid');
		const dayBtn  = within(grid).getByRole('button', { name: /^10 May 2025$/i });
		await userEvent.click(dayBtn);

		expect(onChange).toHaveBeenCalledOnce();
		const called: Date = onChange.mock.calls[0][0];
		expect(called.getFullYear()).toBe(2025);
		expect(called.getMonth()).toBe(4);
		expect(called.getDate()).toBe(10);

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
	});

	it('disabled dates are not clickable and do not call onChange', async () =>
	{
		const onChange = vi.fn();
		const min      = new Date(2025, 4, 10);
		renderPicker({ value: MAY_15, onChange, min });

		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));

		const grid   = screen.getByRole('grid');
		const dayBtn = within(grid).getByRole('button', { name: /^5 May 2025$/i });
		expect(dayBtn).toHaveProperty('disabled', true);

		await userEvent.click(dayBtn);
		expect(onChange).not.toHaveBeenCalled();
	});

	it('renders label when label prop is provided', () =>
	{
		renderPicker({ label: 'Appointment date' });
		expect(screen.getByText('Appointment date')).toBeDefined();
	});

	it('renders error message when error prop is provided', () =>
	{
		renderPicker({ error: 'Date is required' });
		expect(screen.getByText('Date is required')).toBeDefined();
	});

	it('renders hint when hint prop is provided and no error', () =>
	{
		renderPicker({ hint: 'Choose a future date' });
		expect(screen.getByText('Choose a future date')).toBeDefined();
	});

	it('error takes precedence over hint', () =>
	{
		renderPicker({ hint: 'Some hint', error: 'Some error' });
		expect(screen.getByText('Some error')).toBeDefined();
		expect(screen.queryByText('Some hint')).toBeNull();
	});

	it('trigger has aria-haspopup="dialog"', () =>
	{
		renderPicker();
		const trigger = screen.getByRole('button', { name: /pick a date/i });
		expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
	});

	it('trigger is disabled when disabled prop is true', () =>
	{
		renderPicker({ disabled: true });
		const trigger = screen.getByRole('button', { name: /pick a date/i });
		expect(trigger).toHaveProperty('disabled', true);
	});

	it('disabled trigger does not open the popup on click', async () =>
	{
		renderPicker({ disabled: true });
		await userEvent.click(screen.getByRole('button', { name: /pick a date/i }));
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('prev month navigation wraps December to January across year boundary', async () =>
	{
		renderPicker({ value: MAY_1 });
		await userEvent.click(screen.getByRole('button', { name: /may 1, 2025/i }));

		for(let i = 0; i < 5; i++)
			await userEvent.click(screen.getByRole('button', { name: /previous month/i }));

		expect(screen.getByText('December 2024')).toBeDefined();
	});
});
