import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
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

	it('defaults to opening the panel below the trigger', async () =>
	{
		renderPicker({ value: MAY_15 });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));
		expect(screen.getByRole('dialog').className).toContain('top-full');
	});

	it('opens the panel above the trigger when panelSide="top"', async () =>
	{
		renderPicker({ value: MAY_15, panelSide: 'top' });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));
		const dialog = screen.getByRole('dialog');
		expect(dialog.className).toContain('bottom-full');
		expect(dialog.className).not.toContain('top-full');
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
	}, 15000);
});

describe('DatePicker granularity', () =>
{
	it('renders trigger with date & time placeholder when granularity is "datetime"', () =>
	{
		renderPicker({ granularity: 'datetime' });
		expect(screen.getByRole('button', { name: /pick a date & time/i })).toBeDefined();
	});

	it('dialog aria-label is "Date and time picker" for granularity="datetime"', async () =>
	{
		renderPicker({ granularity: 'datetime' });
		await userEvent.click(screen.getByRole('button', { name: /pick a date & time/i }));
		expect(screen.getByRole('dialog', { name: 'Date and time picker' })).toBeDefined();
	});

	it('granularity="time" renders the time segments directly, with no calendar trigger button or popup', () =>
	{
		renderPicker({ granularity: 'time' });
		expect(screen.queryByRole('button', { name: /pick a time/i })).toBeNull();
		expect(screen.queryByRole('dialog')).toBeNull();
		expect(screen.getByRole('spinbutton', { name: 'Hours' })).toBeDefined();
	});

	it('granularity="time" renders a clock icon button that opens the time wheel popup', async () =>
	{
		renderPicker({ granularity: 'time' });

		const wheelButton = screen.getByRole('button', { name: /open time picker/i });
		expect(wheelButton.getAttribute('aria-expanded')).toBe('false');

		await userEvent.click(wheelButton);

		expect(wheelButton.getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByRole('dialog', { name: /select time/i })).toBeDefined();
		expect(screen.getByRole('listbox', { name: 'Hours' })).toBeDefined();
		expect(document.activeElement).toBe(screen.getByRole('listbox', { name: 'Hours' }));
	});

	it('time wheel closes on Escape and returns focus to the clock icon button', async () =>
	{
		renderPicker({ granularity: 'time' });

		const wheelButton = screen.getByRole('button', { name: /open time picker/i });
		await userEvent.click(wheelButton);

		const hourList = screen.getByRole('listbox', { name: 'Hours' });
		await userEvent.keyboard('{Escape}');

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
		expect(document.activeElement).toBe(wheelButton);
		expect(hourList).not.toBeInTheDocument();
	});

	it('clicking an option in the time wheel commits the value', async () =>
	{
		const onChange = vi.fn();
		const withTime = new Date(2025, 4, 15, 9, 0, 0);
		renderPicker({ granularity: 'time', value: withTime, onChange });

		await userEvent.click(screen.getByRole('button', { name: /open time picker/i }));

		const hourList = screen.getByRole('listbox', { name: 'Hours' });
		await userEvent.click(within(hourList).getAllByRole('option', { name: '05' })[0]);

		const called: Date = onChange.mock.calls.at(-1)![0];
		expect(called.getHours()).toBe(5);
	});

	it('granularity="time" renders no calendar grid', () =>
	{
		renderPicker({ granularity: 'time' });
		expect(screen.queryByRole('grid')).toBeNull();
	});

	it('granularity="time" segment group has aria-label "Time" by default', () =>
	{
		renderPicker({ granularity: 'time' });
		expect(screen.getByRole('group', { name: 'Time' })).toBeDefined();
	});

	it('granularity="time" segment group aria-label reflects the label prop when provided', () =>
	{
		renderPicker({ granularity: 'time', label: 'Reminder time' });
		expect(screen.getByRole('group', { name: 'Reminder time' })).toBeDefined();
	});

	it('granularity="time" does not auto-focus a segment on mount', () =>
	{
		renderPicker({ granularity: 'time' });
		expect(document.activeElement).toBe(document.body);
	});

	it('granularity="datetime" renders both the grid and all four time segments', async () =>
	{
		renderPicker({ granularity: 'datetime', value: MAY_15 });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025, 12:00:00 am/i }));

		expect(screen.getByRole('grid')).toBeDefined();
		expect(screen.getByRole('spinbutton', { name: 'Hours' })).toBeDefined();
		expect(screen.getByRole('spinbutton', { name: 'Minutes' })).toBeDefined();
		expect(screen.getByRole('spinbutton', { name: 'Seconds' })).toBeDefined();
		expect(screen.getByRole('spinbutton', { name: 'AM or PM' })).toBeDefined();
	});

	it('clicking a day when granularity="datetime" calls onChange but does not close the popup', async () =>
	{
		const onChange = vi.fn();
		renderPicker({ granularity: 'datetime', value: MAY_15, onChange });

		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025, 12:00:00 am/i }));

		const grid   = screen.getByRole('grid');
		const dayBtn = within(grid).getByRole('button', { name: /^10 May 2025$/i });
		await userEvent.click(dayBtn);

		expect(onChange).toHaveBeenCalledOnce();
		expect(screen.getByRole('dialog')).toBeDefined();
	});

	it('opening with a Date value populates the segments with its hour/minute/second, converted to 12-hour + AM/PM', async () =>
	{
		const withTime = new Date(2025, 4, 15, 14, 30, 45);
		renderPicker({ granularity: 'datetime', value: withTime });

		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025, 02:30:45 pm/i }));

		expect(screen.getByRole('spinbutton', { name: 'Hours' }).getAttribute('aria-valuetext')).toBe('02');
		expect(screen.getByRole('spinbutton', { name: 'Minutes' }).getAttribute('aria-valuetext')).toBe('30');
		expect(screen.getByRole('spinbutton', { name: 'Seconds' }).getAttribute('aria-valuetext')).toBe('45');
		expect(screen.getByRole('spinbutton', { name: 'AM or PM' }).getAttribute('aria-valuetext')).toBe('PM');
	});

	it('a null value shows midnight (12:00:00 AM) in the segments', () =>
	{
		renderPicker({ granularity: 'time' });

		expect(screen.getByRole('spinbutton', { name: 'Hours' }).getAttribute('aria-valuetext')).toBe('12');
		expect(screen.getByRole('spinbutton', { name: 'Minutes' }).getAttribute('aria-valuetext')).toBe('00');
		expect(screen.getByRole('spinbutton', { name: 'Seconds' }).getAttribute('aria-valuetext')).toBe('00');
		expect(screen.getByRole('spinbutton', { name: 'AM or PM' }).getAttribute('aria-valuetext')).toBe('AM');
	});

	it('typing "9" into Hours commits immediately and calls onChange with hour 9', async () =>
	{
		const onChange = vi.fn();
		renderPicker({ granularity: 'time', onChange });

		const hours = screen.getByRole('spinbutton', { name: 'Hours' });
		hours.focus();
		await userEvent.keyboard('9');

		expect(hours.getAttribute('aria-valuetext')).toBe('09');
		expect(onChange).toHaveBeenCalled();
		const called: Date = onChange.mock.calls.at(-1)![0];
		expect(called.getHours()).toBe(9);
	});

	it('typing "0" then "5" into Hours commits hour 5 and advances focus to Minutes', async () =>
	{
		renderPicker({ granularity: 'time' });

		const hours = screen.getByRole('spinbutton', { name: 'Hours' });
		hours.focus();
		await userEvent.keyboard('05');

		expect(hours.getAttribute('aria-valuetext')).toBe('05');
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Minutes');
	});

	it('typing "1" then "9" into Hours rolls the overflow digit into Minutes', async () =>
	{
		renderPicker({ granularity: 'time' });

		const hours = screen.getByRole('spinbutton', { name: 'Hours' });
		hours.focus();
		await userEvent.keyboard('19');

		expect(hours.getAttribute('aria-valuetext')).toBe('01');
		expect(screen.getByRole('spinbutton', { name: 'Minutes' }).getAttribute('aria-valuetext')).toBe('09');
	});

	it('digit buffer times out and commits the tentative value if no second digit follows', () =>
	{
		// userEvent's own internal delays deadlock against vi.useFakeTimers() in this
		// environment, so this test drives events with fireEvent instead, which has no
		// timer dependency of its own and leaves only our component's setTimeout to fake.
		renderPicker({ granularity: 'time' });

		const hours = screen.getByRole('spinbutton', { name: 'Hours' });
		hours.focus();

		vi.useFakeTimers();
		try
		{
			fireEvent.keyDown(hours, { key: '1' });
			expect(hours.getAttribute('aria-valuetext')).toBe('01');

			vi.advanceTimersByTime(600);

			expect(document.activeElement?.getAttribute('aria-label')).toBe('Hours');
			expect(hours.getAttribute('aria-valuetext')).toBe('01');
		}
		finally
		{
			vi.useRealTimers();
		}
	});

	it('ArrowUp on Minutes wraps 59 to 0', async () =>
	{
		const withTime = new Date(2025, 4, 15, 10, 59, 0);
		renderPicker({ granularity: 'time', value: withTime });

		const minutesField = screen.getByRole('spinbutton', { name: 'Minutes' });
		minutesField.focus();
		await userEvent.keyboard('{ArrowUp}');

		expect(minutesField.getAttribute('aria-valuetext')).toBe('00');
	});

	it('ArrowDown on Hours wraps 1 to 12', async () =>
	{
		const withTime = new Date(2025, 4, 15, 1, 0, 0);
		renderPicker({ granularity: 'time', value: withTime });

		const hours = screen.getByRole('spinbutton', { name: 'Hours' });
		hours.focus();
		await userEvent.keyboard('{ArrowDown}');

		expect(hours.getAttribute('aria-valuetext')).toBe('12');
	});

	it('ArrowLeft/ArrowRight move focus between segments', async () =>
	{
		renderPicker({ granularity: 'time' });

		const hours = screen.getByRole('spinbutton', { name: 'Hours' });
		hours.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Minutes');

		await userEvent.keyboard('{ArrowLeft}');
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Hours');
	});

	it('typing "p" on the AM/PM segment sets PM and shifts hour by 12', async () =>
	{
		const onChange = vi.fn();
		const withTime = new Date(2025, 4, 15, 9, 0, 0);
		renderPicker({ granularity: 'time', value: withTime, onChange });

		const meridiem = screen.getByRole('spinbutton', { name: 'AM or PM' });
		meridiem.focus();
		await userEvent.keyboard('p');

		expect(meridiem.getAttribute('aria-valuetext')).toBe('PM');
		const called: Date = onChange.mock.calls.at(-1)![0];
		expect(called.getHours()).toBe(21);
	});

	it('typing "a" on the AM/PM segment sets AM', async () =>
	{
		const withTime = new Date(2025, 4, 15, 21, 0, 0);
		renderPicker({ granularity: 'time', value: withTime });

		const meridiem = screen.getByRole('spinbutton', { name: 'AM or PM' });
		meridiem.focus();
		await userEvent.keyboard('a');

		expect(meridiem.getAttribute('aria-valuetext')).toBe('AM');
	});

	it('Enter on a time segment has no popup to close and leaves the field mounted', async () =>
	{
		renderPicker({ granularity: 'time' });

		const hours = screen.getByRole('spinbutton', { name: 'Hours' });
		hours.focus();
		await userEvent.keyboard('{Enter}');

		expect(screen.getByRole('spinbutton', { name: 'Hours' })).toBeDefined();
	});

	it('Escape on a time segment has no popup to close and leaves the field mounted', async () =>
	{
		renderPicker({ granularity: 'time' });

		const hours = screen.getByRole('spinbutton', { name: 'Hours' });
		hours.focus();
		await userEvent.keyboard('{Escape}');

		expect(screen.getByRole('spinbutton', { name: 'Hours' })).toBeDefined();
	});

	it('Tab on the AM/PM segment has no popup to close and leaves the field mounted', async () =>
	{
		renderPicker({ granularity: 'time' });

		const meridiem = screen.getByRole('spinbutton', { name: 'AM or PM' });
		meridiem.focus();
		await userEvent.keyboard('{Tab}');

		expect(screen.getByRole('spinbutton', { name: 'AM or PM' })).toBeDefined();
	});

	it('Tab out of the grid does not close the popup when granularity="datetime"', async () =>
	{
		renderPicker({ granularity: 'datetime', value: MAY_15 });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025, 12:00:00 am/i }));

		const grid = screen.getByRole('grid');
		grid.focus();
		await userEvent.keyboard('{Tab}');

		expect(screen.getByRole('dialog')).toBeDefined();
	});

	it('granularity="date" (default) Tab out of the grid still closes the popup', async () =>
	{
		renderPicker({ value: MAY_15 });
		await userEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));

		const grid = screen.getByRole('grid');
		grid.focus();
		await userEvent.keyboard('{Tab}');

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
	});

	it('cancels the pending open frame when unmounted right after opening', () =>
	{
		vi.useFakeTimers();

		try
		{
			const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
			const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

			const { unmount } = renderPicker({ value: MAY_15 });
			fireEvent.click(screen.getByRole('button', { name: /may 15, 2025/i }));

			const frameIds = rafSpy.mock.results.map((result) => result.value);
			expect(frameIds.length).toBeGreaterThan(0);
			cancelSpy.mockClear();
			unmount();

			frameIds.forEach((id) => expect(cancelSpy).toHaveBeenCalledWith(id));
		}
		finally
		{
			vi.restoreAllMocks();
			vi.useRealTimers();
		}
	});

	it('cancels the pending wheel open frame when unmounted right after opening', () =>
	{
		vi.useFakeTimers();

		try
		{
			const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
			const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

			const { unmount } = renderPicker({ granularity: 'time' });
			fireEvent.click(screen.getByRole('button', { name: /open time picker/i }));

			const frameIds = rafSpy.mock.results.map((result) => result.value);
			expect(frameIds.length).toBeGreaterThan(0);
			cancelSpy.mockClear();
			unmount();

			frameIds.forEach((id) => expect(cancelSpy).toHaveBeenCalledWith(id));
		}
		finally
		{
			vi.restoreAllMocks();
			vi.useRealTimers();
		}
	});
});
