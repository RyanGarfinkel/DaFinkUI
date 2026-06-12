import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Popover } from './Popover';

const openPopover = () => {
	fireEvent.click(screen.getByRole('button', { name: 'Open' }));
	act(() => { vi.advanceTimersByTime(32); });
};

describe('Popover', () =>
{
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('renders the trigger with correct aria attributes when closed', () =>
	{
		render(<Popover trigger='Open'>Content</Popover>);
		const trigger = screen.getByRole('button', { name: 'Open' });
		expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('opens on click with role dialog and no aria-modal', () =>
	{
		render(<Popover trigger='Open' label='Details'>Content</Popover>);
		openPopover();

		const panel = screen.getByRole('dialog');
		expect(panel).toBeInTheDocument();
		expect(panel).not.toHaveAttribute('aria-modal');
		expect(panel).toHaveAttribute('aria-label', 'Details');
		expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'true');
	});

	it('sets aria-controls on the trigger while open', () =>
	{
		render(<Popover trigger='Open'>Content</Popover>);
		openPopover();
		const trigger = screen.getByRole('button', { name: 'Open' });
		expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('dialog').id);
	});

	it('moves focus to the first focusable element on open', () =>
	{
		render(
			<Popover trigger='Open'>
				<button>Inside</button>
			</Popover>
		);
		openPopover();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Inside' }));
	});

	it('moves focus to the panel itself when it has no focusable children', () =>
	{
		render(<Popover trigger='Open'>Plain text</Popover>);
		openPopover();
		expect(document.activeElement).toBe(screen.getByRole('dialog'));
	});

	it('does not trap focus (no Tab interception on the panel)', () =>
	{
		render(
			<Popover trigger='Open'>
				<button>Inside</button>
			</Popover>
		);
		openPopover();
		const event = fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });
		expect(event).toBe(true); // default not prevented — Tab moves on naturally
	});

	it('closes and returns focus to the trigger on Escape', () =>
	{
		render(<Popover trigger='Open'>Content</Popover>);
		openPopover();

		fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open' }));

		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('closes on outside pointer down without stealing focus', () =>
	{
		render(
			<>
				<Popover trigger='Open'>Content</Popover>
				<button>Elsewhere</button>
			</>
		);
		openPopover();

		fireEvent.pointerDown(document.body);
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('closes when focus moves past the end of the panel', () =>
	{
		render(
			<>
				<Popover trigger='Open'>
					<button>Inside</button>
				</Popover>
				<button>After</button>
			</>
		);
		openPopover();

		fireEvent.blur(screen.getByRole('dialog'), { relatedTarget: screen.getByRole('button', { name: 'After' }) });
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('stays open when focus moves within the panel', () =>
	{
		render(
			<Popover trigger='Open'>
				<button>First</button>
				<button>Second</button>
			</Popover>
		);
		openPopover();

		fireEvent.blur(screen.getByRole('button', { name: 'First' }), { relatedTarget: screen.getByRole('button', { name: 'Second' }) });
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('toggles closed when the trigger is clicked again', () =>
	{
		render(<Popover trigger='Open'>Content</Popover>);
		openPopover();

		fireEvent.click(screen.getByRole('button', { name: 'Open' }));
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('does not open when disabled', () =>
	{
		render(<Popover trigger='Open' disabled>Content</Popover>);
		openPopover();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('renders the panel with the configured side and align props', () =>
	{
		render(<Popover trigger='Open' side='top' align='start'>Content</Popover>);
		openPopover();
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('calls onOpenChange on open and close', () =>
	{
		const onOpenChange = vi.fn();
		render(<Popover trigger='Open' onOpenChange={onOpenChange}>Content</Popover>);
		openPopover();
		expect(onOpenChange).toHaveBeenLastCalledWith(true);

		fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
		expect(onOpenChange).toHaveBeenLastCalledWith(false);
	});

	it('trigger has a visible focus-visible ring class', () =>
	{
		render(<Popover trigger='Open'>Content</Popover>);
		expect(screen.getByRole('button', { name: 'Open' }).className).toContain('focus-visible:ring-2');
	});
});
