import Collapsible, { CollapsibleTrigger, CollapsibleContent } from './Collapsible';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const Base = ({ open, defaultOpen, onOpenChange, disabled }: {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (v: boolean) => void;
	disabled?: boolean;
}) => (
	<Collapsible open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} disabled={disabled}>
		<CollapsibleTrigger>Toggle</CollapsibleTrigger>
		<CollapsibleContent>Hidden content</CollapsibleContent>
	</Collapsible>
);

describe('Collapsible', () =>
{
	it('renders without errors', () =>
	{
		render(<Base />);
		expect(screen.getByRole('button', { name: 'Toggle' })).toBeDefined();
	});

	it('is closed by default', () =>
	{
		render(<Base />);
		const trigger = screen.getByRole('button', { name: 'Toggle' });
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('opens on trigger click', () =>
	{
		render(<Base />);
		const trigger = screen.getByRole('button', { name: 'Toggle' });
		fireEvent.click(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('closes on second click', () =>
	{
		render(<Base />);
		const trigger = screen.getByRole('button', { name: 'Toggle' });
		fireEvent.click(trigger);
		fireEvent.click(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('respects defaultOpen', () =>
	{
		render(<Base defaultOpen />);
		const trigger = screen.getByRole('button', { name: 'Toggle' });
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('respects controlled open prop', () =>
	{
		render(<Base open={true} />);
		const trigger = screen.getByRole('button', { name: 'Toggle' });
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
	});

	it('calls onOpenChange with next value', () =>
	{
		const handler = vi.fn();
		render(<Base onOpenChange={handler} />);
		fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
		expect(handler).toHaveBeenCalledWith(true);
	});

	it('does not toggle when disabled', () =>
	{
		render(<Base disabled />);
		const trigger = screen.getByRole('button', { name: 'Toggle' });
		expect(trigger).toBeDisabled();
		fireEvent.click(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('sets aria-hidden on content when closed', () =>
	{
		render(<Base />);
		const region = screen.getByRole('region', { hidden: true });
		expect(region.getAttribute('aria-hidden')).toBe('true');
	});

	it('removes aria-hidden from content when open', () =>
	{
		render(<Base defaultOpen />);
		const region = screen.getByRole('region');
		expect(region.getAttribute('aria-hidden')).toBe('false');
	});

	it('passes data-state to root element', () =>
	{
		const { container } = render(<Base />);
		const root = container.firstChild as HTMLElement;
		expect(root.getAttribute('data-state')).toBe('closed');
	});

	it('sets data-state to open when expanded', () =>
	{
		const { container } = render(<Base defaultOpen />);
		const root = container.firstChild as HTMLElement;
		expect(root.getAttribute('data-state')).toBe('open');
	});

	it('forwards className to root', () =>
	{
		const { container } = render(
			<Collapsible className='custom-class'>
				<CollapsibleTrigger>T</CollapsibleTrigger>
				<CollapsibleContent>C</CollapsibleContent>
			</Collapsible>
		);
		expect((container.firstChild as HTMLElement).classList.contains('custom-class')).toBe(true);
	});

	it('has focus-visible ring class on trigger', () =>
	{
		render(<Base />);
		const trigger = screen.getByRole('button', { name: 'Toggle' });
		expect(trigger.className).toContain('focus-visible:ring-1');
	});
});
