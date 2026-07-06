import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from './Tooltip';

describe('Tooltip', () =>
{
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('renders the trigger without showing the tooltip', () =>
	{
		render(
			<Tooltip content='Helpful hint'>
				<button>Trigger</button>
			</Tooltip>
		);
		expect(screen.getByRole('button')).toBeInTheDocument();
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});

	it('shows on focus immediately (keyboard users)', () =>
	{
		render(
			<Tooltip content='Helpful hint'>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.focus(screen.getByRole('button'));
		expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful hint');
	});

	it('shows on hover only after the open delay', () =>
	{
		render(
			<Tooltip content='Helpful hint' delay={300}>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.mouseEnter(screen.getByRole('button'));
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

		act(() => { vi.advanceTimersByTime(300); });
		expect(screen.getByRole('tooltip')).toBeInTheDocument();
	});

	it('respects a custom open delay', () =>
	{
		render(
			<Tooltip content='Helpful hint' delay={1000}>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.mouseEnter(screen.getByRole('button'));

		act(() => { vi.advanceTimersByTime(500); });
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

		act(() => { vi.advanceTimersByTime(500); });
		expect(screen.getByRole('tooltip')).toBeInTheDocument();
	});

	it('cancels a pending hover open on mouse leave', () =>
	{
		render(
			<Tooltip content='Helpful hint' delay={300}>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.mouseEnter(screen.getByRole('button'));
		fireEvent.mouseLeave(screen.getByRole('button'));

		act(() => { vi.advanceTimersByTime(1000); });
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});

	it('hides on blur', () =>
	{
		render(
			<Tooltip content='Helpful hint'>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.focus(screen.getByRole('button'));
		expect(screen.getByRole('tooltip')).toBeInTheDocument();

		fireEvent.blur(screen.getByRole('button'));
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});

	it('hides on mouse leave', () =>
	{
		render(
			<Tooltip content='Helpful hint' delay={0}>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.mouseEnter(screen.getByRole('button'));
		expect(screen.getByRole('tooltip')).toBeInTheDocument();

		fireEvent.mouseLeave(screen.getByRole('button'));
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});

	it('hides on Escape', () =>
	{
		render(
			<Tooltip content='Helpful hint'>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.focus(screen.getByRole('button'));
		expect(screen.getByRole('tooltip')).toBeInTheDocument();

		fireEvent.keyDown(document, { key: 'Escape' });
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});

	it('links the trigger to the tooltip via aria-describedby', () =>
	{
		render(
			<Tooltip content='Helpful hint'>
				<button>Trigger</button>
			</Tooltip>
		);
		const button = screen.getByRole('button');
		expect(button).not.toHaveAttribute('aria-describedby');

		fireEvent.focus(button);
		const tooltip = screen.getByRole('tooltip');
		expect(button).toHaveAttribute('aria-describedby', tooltip.id);
	});

	it('renders the tooltip on focus when side is configured', () =>
	{
		render(
			<Tooltip content='Helpful hint' side='right'>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.focus(screen.getByRole('button'));
		expect(screen.getByRole('tooltip')).toBeInTheDocument();
	});

	it('tooltip is not interactive (pointer events disabled)', () =>
	{
		render(
			<Tooltip content='Helpful hint'>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.focus(screen.getByRole('button'));
		expect(screen.getByRole('tooltip').className).toContain('pointer-events-none');
	});

	it('preserves the child element own event handlers', () =>
	{
		const onFocus = vi.fn();
		render(
			<Tooltip content='Helpful hint'>
				<button onFocus={onFocus}>Trigger</button>
			</Tooltip>
		);
		fireEvent.focus(screen.getByRole('button'));
		expect(onFocus).toHaveBeenCalled();
		expect(screen.getByRole('tooltip')).toBeInTheDocument();
	});

	it('does not transition top/left, only opacity/transform, so the initial {0,0} position never visibly animates in', () =>
	{
		render(
			<Tooltip content='Helpful hint'>
				<button>Trigger</button>
			</Tooltip>
		);
		fireEvent.focus(screen.getByRole('button'));
		const tooltip = screen.getByRole('tooltip');
		expect(tooltip.className).not.toContain('transition-all');
		expect(tooltip.className).toContain('transition-[opacity,transform]');
	});
});
