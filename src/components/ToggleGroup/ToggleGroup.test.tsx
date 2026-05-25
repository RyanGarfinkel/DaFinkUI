import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('ToggleGroup', () =>
{
	it('renders without errors', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b'>B</ToggleGroupItem>
			</ToggleGroup>
		);

		expect(screen.getByRole('group')).toBeDefined();
		expect(screen.getAllByRole('button')).toHaveLength(2);
	});

	it('sets aria-pressed true on the active item in single mode', () =>
	{
		render(
			<ToggleGroup type='single' value='b' onValueChange={() => {}}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b'>B</ToggleGroupItem>
			</ToggleGroup>
		);

		const buttons = screen.getAllByRole('button');
		expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
		expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
	});

	it('sets aria-pressed true on all active items in multiple mode', () =>
	{
		render(
			<ToggleGroup type='multiple' value={['a', 'c']} onValueChange={() => {}}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b'>B</ToggleGroupItem>
				<ToggleGroupItem value='c'>C</ToggleGroupItem>
			</ToggleGroup>
		);

		const buttons = screen.getAllByRole('button');
		expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
		expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
		expect(buttons[2].getAttribute('aria-pressed')).toBe('true');
	});

	it('calls onValueChange with the clicked value in single mode', async () =>
	{
		const handler = vi.fn();

		render(
			<ToggleGroup type='single' value='a' onValueChange={handler}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b'>B</ToggleGroupItem>
			</ToggleGroup>
		);

		await userEvent.click(screen.getByRole('button', { name: 'B' }));
		expect(handler).toHaveBeenCalledWith('b');
	});

	it('adds value to array when inactive item clicked in multiple mode', async () =>
	{
		const handler = vi.fn();

		render(
			<ToggleGroup type='multiple' value={['a']} onValueChange={handler}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b'>B</ToggleGroupItem>
			</ToggleGroup>
		);

		await userEvent.click(screen.getByRole('button', { name: 'B' }));
		expect(handler).toHaveBeenCalledWith(['a', 'b']);
	});

	it('removes value from array when active item clicked in multiple mode', async () =>
	{
		const handler = vi.fn();

		render(
			<ToggleGroup type='multiple' value={['a', 'b']} onValueChange={handler}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b'>B</ToggleGroupItem>
			</ToggleGroup>
		);

		await userEvent.click(screen.getByRole('button', { name: 'A' }));
		expect(handler).toHaveBeenCalledWith(['b']);
	});

	it('does not call onValueChange when group is disabled', async () =>
	{
		const handler = vi.fn();

		render(
			<ToggleGroup type='single' value='a' onValueChange={handler} disabled>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b'>B</ToggleGroupItem>
			</ToggleGroup>
		);

		await userEvent.click(screen.getByRole('button', { name: 'B' }));
		expect(handler).not.toHaveBeenCalled();
	});

	it('does not call onValueChange when a specific item is disabled', async () =>
	{
		const handler = vi.fn();

		render(
			<ToggleGroup type='single' value='a' onValueChange={handler}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b' disabled>B</ToggleGroupItem>
			</ToggleGroup>
		);

		await userEvent.click(screen.getByRole('button', { name: 'B' }));
		expect(handler).not.toHaveBeenCalled();
	});

	it('applies active classes to the selected item', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
				<ToggleGroupItem value='b'>B</ToggleGroupItem>
			</ToggleGroup>
		);

		const [active, inactive] = screen.getAllByRole('button');
		expect(active.className).toContain('text-brand-fg');
		expect(inactive.className).toContain('text-text');
	});

	it('applies disabled classes when group is disabled', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}} disabled>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
			</ToggleGroup>
		);

		const btn = screen.getByRole('button');
		expect(btn.className).toContain('disabled:opacity-40');
		expect(btn.className).toContain('disabled:pointer-events-none');
		expect(btn).toHaveProperty('disabled', true);
	});

	it('applies disabled classes when item is disabled', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}}>
				<ToggleGroupItem value='b' disabled>B</ToggleGroupItem>
			</ToggleGroup>
		);

		const btn = screen.getByRole('button');
		expect(btn.className).toContain('disabled:opacity-40');
		expect(btn).toHaveProperty('disabled', true);
	});

	it('applies focus-visible ring classes', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
			</ToggleGroup>
		);

		const btn = screen.getByRole('button');
		expect(btn.className).toContain('focus-visible:ring-2');
		expect(btn.className).toContain('focus-visible:ring-offset-2');
		expect(btn.className).toContain('focus-visible:ring-brand-ring');
	});

	it('applies correct size classes', () =>
	{
		const cases = [
			{ size: 'sm' as const, contains: 'h-8' },
			{ size: 'md' as const, contains: 'h-9' },
			{ size: 'lg' as const, contains: 'h-11' },
		];

		for(const { size, contains } of cases)
		{
			const { unmount } = render(
				<ToggleGroup type='single' size={size} value='a' onValueChange={() => {}}>
					<ToggleGroupItem value='a'>A</ToggleGroupItem>
				</ToggleGroup>
			);
			expect(screen.getByRole('button').className).toContain(contains);
			unmount();
		}
	});

	it('defaults to md size', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}}>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
			</ToggleGroup>
		);

		expect(screen.getByRole('button').className).toContain('h-9');
	});

	it('forwards native button props to ToggleGroupItem', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}}>
				<ToggleGroupItem value='a' aria-label='option a' data-testid='item-a'>A</ToggleGroupItem>
			</ToggleGroup>
		);

		const btn = screen.getByRole('button', { name: 'option a' });
		expect(btn.getAttribute('aria-label')).toBe('option a');
		expect(btn.getAttribute('data-testid')).toBe('item-a');
	});

	it('merges custom className on ToggleGroup', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}} className='custom-group'>
				<ToggleGroupItem value='a'>A</ToggleGroupItem>
			</ToggleGroup>
		);

		expect(screen.getByRole('group').className).toContain('custom-group');
	});

	it('merges custom className on ToggleGroupItem', () =>
	{
		render(
			<ToggleGroup type='single' value='a' onValueChange={() => {}}>
				<ToggleGroupItem value='a' className='custom-item'>A</ToggleGroupItem>
			</ToggleGroup>
		);

		expect(screen.getByRole('button').className).toContain('custom-item');
	});

	it('throws when ToggleGroupItem is used outside ToggleGroup', () =>
	{
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

		expect(() => render(<ToggleGroupItem value='a'>A</ToggleGroupItem>)).toThrow(
			'ToggleGroupItem must be used inside a ToggleGroup'
		);

		consoleError.mockRestore();
	});
});
