import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Spinner from './Spinner';

describe('Spinner', () =>
{
	it('renders without errors', () =>
	{
		render(<Spinner />);
		expect(screen.getByRole('status')).toBeDefined();
	});

	it('sets role="status" for accessibility', () =>
	{
		render(<Spinner />);
		expect(screen.getByRole('status')).toBeDefined();
	});

	it('uses default label "Loading…"', () =>
	{
		render(<Spinner />);
		expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Loading…');
	});

	it('uses custom label when provided', () =>
	{
		render(<Spinner label='Please wait' />);
		expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Please wait');
	});

	it('renders sr-only text matching the label', () =>
	{
		render(<Spinner label='Saving…' />);
		expect(screen.getByText('Saving…')).toBeDefined();
	});

	it('inner spinner span has aria-hidden="true"', () =>
	{
		const { container } = render(<Spinner />);
		const inner = container.querySelector('[aria-hidden="true"]');
		expect(inner).toBeDefined();
	});

	it('applies sm size class', () =>
	{
		const { container } = render(<Spinner size='sm' />);
		const inner = container.querySelector('[aria-hidden="true"]');
		expect(inner?.className).toContain('w-4');
		expect(inner?.className).toContain('h-4');
	});

	it('applies md size class by default', () =>
	{
		const { container } = render(<Spinner />);
		const inner = container.querySelector('[aria-hidden="true"]');
		expect(inner?.className).toContain('w-6');
		expect(inner?.className).toContain('h-6');
	});

	it('applies lg size class', () =>
	{
		const { container } = render(<Spinner size='lg' />);
		const inner = container.querySelector('[aria-hidden="true"]');
		expect(inner?.className).toContain('w-8');
		expect(inner?.className).toContain('h-8');
	});

	it('applies animate-spin to the inner element', () =>
	{
		const { container } = render(<Spinner />);
		const inner = container.querySelector('[aria-hidden="true"]');
		expect(inner?.className).toContain('animate-spin');
	});

	it('forwards className prop', () =>
	{
		render(<Spinner className='extra-class' />);
		expect(screen.getByRole('status').className).toContain('extra-class');
	});
});
