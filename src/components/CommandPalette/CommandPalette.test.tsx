import CommandPalette, { CommandGroup, CommandItem } from './CommandPalette';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

interface RenderOptions {
	open?:      boolean;
	onClose?:   () => void;
	onSelectA?: () => void;
	onSelectB?: () => void;
	onSelectC?: () => void;
	onSelectD?: () => void;
}

const renderPalette = (
    {
        open      = true,
        onClose   = vi.fn(),
        onSelectA = vi.fn(),
        onSelectB = vi.fn(),
        onSelectC = vi.fn(),
        onSelectD = vi.fn(),
    }: RenderOptions = {}
) => {
	return render(
		<CommandPalette open={open} onClose={onClose} placeholder='Search…'>
			<CommandGroup label='Navigation'>
				<CommandItem value='Go to Dashboard' onSelect={onSelectA}>
					Go to Dashboard
				</CommandItem>
				<CommandItem value='Go to Settings' onSelect={onSelectB} shortcut='⌘,'>
					Go to Settings
				</CommandItem>
			</CommandGroup>
			<CommandGroup label='Actions'>
				<CommandItem value='Create new project' onSelect={onSelectC} shortcut='⌘N'>
					Create new project
				</CommandItem>
				<CommandItem value='Delete account' onSelect={onSelectD} disabled>
					Delete account
				</CommandItem>
			</CommandGroup>
		</CommandPalette>
	);
};

describe('CommandPalette', () =>
{
	beforeEach(() =>
	{
		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	it('does not render when open=false', () =>
	{
		renderPalette({ open: false });
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('renders the dialog when open=true', async () =>
	{
		renderPalette({ open: true });
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
	});

	it('has aria-modal="true" and role="dialog"', async () =>
	{
		renderPalette();
		await waitFor(() =>
		{
			const dialog = screen.getByRole('dialog');
			expect(dialog.getAttribute('aria-modal')).toBe('true');
		});
	});

	it('renders the search input with combobox role', async () =>
	{
		renderPalette();
		await waitFor(() =>
		{
			const input = screen.getByRole('combobox');
			expect(input).toBeDefined();
			expect(input.getAttribute('aria-autocomplete')).toBe('list');
			expect(input.getAttribute('aria-expanded')).toBe('true');
		});
	});

	it('renders all items when query is empty', async () =>
	{
		renderPalette();
		await waitFor(() =>
		{
			expect(screen.getByText('Go to Dashboard')).toBeDefined();
			expect(screen.getByText('Go to Settings')).toBeDefined();
			expect(screen.getByText('Create new project')).toBeDefined();
			expect(screen.getByText('Delete account')).toBeDefined();
		});
	});

	it('filters items by value (case-insensitive substring match)', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');

		await userEvent.type(input, 'dashboard');

		await waitFor(() =>
		{
			expect(screen.getByRole('option', { name: /Go to Dashboard/i })).toBeDefined();
			expect(screen.queryByRole('option', { name: /Go to Settings/i })).toBeNull();
			expect(screen.queryByRole('option', { name: /Create new project/i })).toBeNull();
		});
	});

	it('filters items case-insensitively', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');

		await userEvent.type(input, 'SETTINGS');

		await waitFor(() =>
		{
			expect(screen.getByRole('option', { name: /Go to Settings/i })).toBeDefined();
			expect(screen.queryByRole('option', { name: /Go to Dashboard/i })).toBeNull();
		});
	});

	it('hides groups that have no matching items', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');

		await userEvent.type(input, 'dashboard');

		await waitFor(() =>
		{
			expect(screen.queryByText('Actions')).toBeNull();
			expect(screen.getByText('Navigation')).toBeDefined();
		});
	});

	it('shows empty state when no items match', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');

		await userEvent.type(input, 'zzznomatch');

		await waitFor(() =>
		{
			expect(screen.getByText(/No results for/i)).toBeDefined();
		});
	});

	it('does not show empty state when query is empty', async () =>
	{
		renderPalette();
		await waitFor(() =>
		{
			expect(screen.queryByText(/No results for/i)).toBeNull();
		});
	});

	it('calls onClose when Escape is pressed', async () =>
	{
		const onClose = vi.fn();
		renderPalette({ onClose });
		const input = await screen.findByRole('combobox');
		input.focus();

		await userEvent.keyboard('{Escape}');
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when backdrop is clicked', async () =>
	{
		const onClose = vi.fn();
		renderPalette({ onClose });
		await screen.findByRole('dialog');

		const dialog = screen.getByRole('dialog');
		await userEvent.pointer({ keys: '[MouseLeft]', target: dialog });
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('navigates items with ArrowDown', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');
		input.focus();

		await userEvent.keyboard('{ArrowDown}');

		await waitFor(() =>
		{
			const selected = screen.getByRole('option', { name: /Go to Dashboard/i });
			expect(selected.getAttribute('aria-selected')).toBe('true');
		});
	});

	it('navigates items with ArrowUp and wraps', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');
		input.focus();

		await userEvent.keyboard('{ArrowUp}');

		await waitFor(() =>
		{
			const options = screen.getAllByRole('option');
			const enabled = options.filter(
				(o) => o.getAttribute('aria-disabled') !== 'true'
			);
			const last = enabled[enabled.length - 1];
			expect(last.getAttribute('aria-selected')).toBe('true');
		});
	});

	it('skips disabled items during keyboard navigation', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');
		input.focus();

		// 4 presses cycles through all 3 enabled items and wraps; disabled item never receives focus
		await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');

		await waitFor(() =>
		{
			const deletedItem = screen.getByRole('option', { name: /Delete account/i });
			expect(deletedItem.getAttribute('aria-selected')).not.toBe('true');
		});
	});

	it('calls onSelect and onClose when Enter is pressed on active item', async () =>
	{
		const onClose   = vi.fn();
		const onSelectA = vi.fn();
		renderPalette({ onClose, onSelectA });

		const input = await screen.findByRole('combobox');
		input.focus();

		await userEvent.keyboard('{ArrowDown}{Enter}');

		expect(onSelectA).toHaveBeenCalledTimes(1);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onSelect and onClose when a non-disabled item is clicked', async () =>
	{
		const onClose   = vi.fn();
		const onSelectA = vi.fn();
		renderPalette({ onClose, onSelectA });

		const item = await screen.findByRole('option', { name: /Go to Dashboard/i });
		await userEvent.pointer({ keys: '[MouseLeft]', target: item });

		expect(onSelectA).toHaveBeenCalledTimes(1);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('does not call onSelect when a disabled item is clicked', async () =>
	{
		const onClose   = vi.fn();
		const onSelectD = vi.fn();
		renderPalette({ onClose, onSelectD });

		const item = await screen.findByRole('option', { name: /Delete account/i });
		await userEvent.pointer({ keys: '[MouseLeft]', target: item });

		expect(onSelectD).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();
	});

	it('aria-disabled is set on disabled items', async () =>
	{
		renderPalette();
		const item = await screen.findByRole('option', { name: /Delete account/i });
		expect(item.getAttribute('aria-disabled')).toBe('true');
	});

	it('disabled items do not receive aria-disabled on enabled items', async () =>
	{
		renderPalette();
		const item = await screen.findByRole('option', { name: /Go to Dashboard/i });
		expect(item.getAttribute('aria-disabled')).toBeNull();
	});

	it('renders group labels', async () =>
	{
		renderPalette();
		await waitFor(() =>
		{
			expect(screen.getByText('Navigation')).toBeDefined();
			expect(screen.getByText('Actions')).toBeDefined();
		});
	});

	it('renders shortcut hints', async () =>
	{
		renderPalette();
		await waitFor(() =>
		{
			expect(screen.getByText('⌘,')).toBeDefined();
			expect(screen.getByText('⌘N')).toBeDefined();
		});
	});

	it('group has role="group" with aria-label', async () =>
	{
		renderPalette();
		await waitFor(() =>
		{
			const groups = screen.getAllByRole('group');
			const navGroup = groups.find((g) => g.getAttribute('aria-label') === 'Navigation');
			expect(navGroup).toBeDefined();
		});
	});

	it('listbox has role="listbox" with aria-label', async () =>
	{
		renderPalette();
		await waitFor(() =>
		{
			const listbox = screen.getByRole('listbox');
			expect(listbox.getAttribute('aria-label')).toBe('Commands');
		});
	});

	it('aria-activedescendant updates when navigating', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');
		input.focus();

		await userEvent.keyboard('{ArrowDown}');

		await waitFor(() =>
		{
			const activedesc = input.getAttribute('aria-activedescendant');
			expect(activedesc).toBeTruthy();

			const activeEl = document.getElementById(activedesc!);
			expect(activeEl).toBeDefined();
			expect(activeEl?.getAttribute('aria-selected')).toBe('true');
		});
	});

	it('Home jumps to first visible item', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');
		input.focus();

		await userEvent.keyboard('{ArrowDown}{ArrowDown}{Home}');

		await waitFor(() =>
		{
			const options = screen.getAllByRole('option');
			const enabled = options.filter((o) => o.getAttribute('aria-disabled') !== 'true');
			expect(enabled[0].getAttribute('aria-selected')).toBe('true');
		});
	});

	it('End jumps to last visible enabled item', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');
		input.focus();

		await userEvent.keyboard('{End}');

		await waitFor(() =>
		{
			const options = screen.getAllByRole('option');
			const enabled = options.filter((o) => o.getAttribute('aria-disabled') !== 'true');
			expect(enabled[enabled.length - 1].getAttribute('aria-selected')).toBe('true');
		});
	});

	it('ArrowDown wraps from last item back to first', async () =>
	{
		renderPalette();
		const input = await screen.findByRole('combobox');
		input.focus();

		await userEvent.keyboard('{End}{ArrowDown}');

		await waitFor(() =>
		{
			const options = screen.getAllByRole('option');
			const enabled = options.filter((o) => o.getAttribute('aria-disabled') !== 'true');
			expect(enabled[0].getAttribute('aria-selected')).toBe('true');
		});
	});

	it('locks page scroll on the html element when open', async () =>
	{
		document.documentElement.style.overflow = '';

		const { unmount } = renderPalette({ open: true });
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

		expect(document.documentElement.style.overflow).toBe('hidden');

		unmount();
		document.documentElement.style.overflow = '';
	});

	it('restores the original html overflow when it closes', async () =>
	{
		document.documentElement.style.overflow = '';

		const { unmount } = renderPalette({ open: true });
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
		expect(document.documentElement.style.overflow).toBe('hidden');

		unmount();

		expect(document.documentElement.style.overflow).toBe('');
	});

	describe('server-driven results', () =>
	{
		it('calls onQueryChange as the user types', async () =>
		{
			const onQueryChange = vi.fn();
			render(
				<CommandPalette open onClose={vi.fn()} onQueryChange={onQueryChange} filter={false}>
					<CommandItem value='Result' onSelect={vi.fn()}>Result</CommandItem>
				</CommandPalette>
			);
			await waitFor(() => expect(screen.getByRole('combobox')).toBeDefined());

			await userEvent.type(screen.getByRole('combobox'), 'ab');

			expect(onQueryChange).toHaveBeenLastCalledWith('ab');
		});

		it('keeps items that do not contain the query when filter=false', async () =>
		{
			render(
				<CommandPalette open onClose={vi.fn()} filter={false}>
					<CommandItem value='Alpha' onSelect={vi.fn()}>Alpha</CommandItem>
				</CommandPalette>
			);
			await waitFor(() => expect(screen.getByRole('combobox')).toBeDefined());

			await userEvent.type(screen.getByRole('combobox'), 'zzz');

			expect(screen.getByRole('option', { name: 'Alpha' })).toBeDefined();
		});

		it('shows a searching state instead of the empty state while loading', async () =>
		{
			render(
				<CommandPalette open onClose={vi.fn()} filter={false} loading>
					<div />
				</CommandPalette>
			);
			await waitFor(() => expect(screen.getByRole('combobox')).toBeDefined());

			await userEvent.type(screen.getByRole('combobox'), 'zzz');

			expect(screen.getByText('Searching…')).toBeDefined();
			expect(screen.queryByText(/No results for/)).toBeNull();
		});
	});

	describe('close timer', () =>
	{
		const palette = (open: boolean) => (
			<CommandPalette open={open} onClose={vi.fn()} placeholder='Search…'>
				<CommandGroup label='Navigation'>
					<CommandItem value='Go to Dashboard' onSelect={vi.fn()}>Go to Dashboard</CommandItem>
				</CommandGroup>
			</CommandPalette>
		);

		it('keeps the palette mounted when reopened within the close delay', () =>
		{
			vi.useFakeTimers();

			try
			{
				const { rerender } = render(palette(true));
				rerender(palette(false));
				act(() => { vi.advanceTimersByTime(50); });
				rerender(palette(true));
				act(() => { vi.advanceTimersByTime(300); });

				expect(screen.getByRole('dialog')).toBeDefined();
			}
			finally
			{
				vi.useRealTimers();
			}
		});

		it('clears the pending close timer when unmounted mid-close', () =>
		{
			vi.useFakeTimers();

			try
			{
				const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
				const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

				const { rerender, unmount } = render(palette(true));
				rerender(palette(false));

				const closeCallIndex = setTimeoutSpy.mock.calls.findIndex(([, ms]) => ms === 150);
				const closeTimerId = setTimeoutSpy.mock.results[closeCallIndex].value;
				clearTimeoutSpy.mockClear();
				unmount();

				expect(clearTimeoutSpy).toHaveBeenCalledWith(closeTimerId);
			}
			finally
			{
				vi.restoreAllMocks();
				vi.useRealTimers();
			}
		});
	});
});
