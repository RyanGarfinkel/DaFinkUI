import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Switch from './Switch';

describe('Switch', () =>
{
	it('renders with correct aria-checked when off', () =>
	{
		render(<Switch checked={false} onCheckedChange={() => {}} />);
		const btn = screen.getByRole('switch');
		expect(btn.getAttribute('aria-checked')).toBe('false');
	});

	it('renders with correct aria-checked when on', () =>
	{
		render(<Switch checked={true} onCheckedChange={() => {}} />);
		const btn = screen.getByRole('switch');
		expect(btn.getAttribute('aria-checked')).toBe('true');
	});

	it('calls onCheckedChange with toggled value on click', () =>
	{
		const handler = vi.fn();
		render(<Switch checked={false} onCheckedChange={handler} />);
		fireEvent.click(screen.getByRole('switch'));
		expect(handler).toHaveBeenCalledOnce();
		expect(handler).toHaveBeenCalledWith(true);
	});

	it('calls onCheckedChange with false when currently on', () =>
	{
		const handler = vi.fn();
		render(<Switch checked={true} onCheckedChange={handler} />);
		fireEvent.click(screen.getByRole('switch'));
		expect(handler).toHaveBeenCalledWith(false);
	});

	it('thumb has translate-x-1 when unchecked', () =>
	{
		render(<Switch checked={false} onCheckedChange={() => {}} />);
		const thumb = screen.getByRole('switch').querySelector('span');
		expect(thumb?.className).toContain('translate-x-1');
		expect(thumb?.className).not.toContain('translate-x-5');
	});

	it('thumb has translate-x-5 when checked', () =>
	{
		render(<Switch checked={true} onCheckedChange={() => {}} />);
		const thumb = screen.getByRole('switch').querySelector('span');
		expect(thumb?.className).toContain('translate-x-5');
		expect(thumb?.className).not.toContain('translate-x-1');
	});

	it('track has bg-surface-active when unchecked', () =>
	{
		render(<Switch checked={false} onCheckedChange={() => {}} />);
		expect(screen.getByRole('switch').className).toContain('bg-input-border');
		expect(screen.getByRole('switch').className).not.toContain('bg-brand');
	});

	it('track has bg-brand when checked', () =>
	{
		render(<Switch checked={true} onCheckedChange={() => {}} />);
		expect(screen.getByRole('switch').className).toContain('bg-brand');
		expect(screen.getByRole('switch').className).not.toContain('bg-input-border');
	});

	it('does not call onCheckedChange when disabled', () =>
	{
		const handler = vi.fn();
		render(<Switch checked={false} onCheckedChange={handler} disabled />);
		fireEvent.click(screen.getByRole('switch'));
		expect(handler).not.toHaveBeenCalled();
	});

	it('disabled switch has disabled:pointer-events-none and disabled:opacity-40 classes', () =>
	{
		render(<Switch checked={false} onCheckedChange={() => {}} disabled />);
		const btn = screen.getByRole('switch');
		expect(btn.className).toContain('disabled:pointer-events-none');
		expect(btn.className).toContain('disabled:opacity-40');
		expect(btn).toHaveProperty('disabled', true);
	});

	it('has focus-visible ring classes', () =>
	{
		render(<Switch checked={false} onCheckedChange={() => {}} />);
		const btn = screen.getByRole('switch');
		expect(btn.className).toContain('focus-visible:ring-2');
		expect(btn.className).toContain('focus-visible:ring-offset-2');
		expect(btn.className).toContain('focus-visible:ring-brand-ring');
	});

	it('renders label when provided', () =>
	{
		render(<Switch checked={false} onCheckedChange={() => {}} label='Dark mode' />);
		expect(screen.getByText('Dark mode')).toBeDefined();
	});

	it('renders hint when provided', () =>
	{
		render(<Switch checked={false} onCheckedChange={() => {}} label='Feature' hint='Some hint text.' />);
		expect(screen.getByText('Some hint text.')).toBeDefined();
	});

	it('does not render label or hint elements when neither is provided', () =>
	{
		render(<Switch checked={false} onCheckedChange={() => {}} />);
		expect(screen.queryByRole('label')).toBeNull();
	});
});
