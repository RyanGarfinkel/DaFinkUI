import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Alert from './Alert';

describe('Alert', () =>
{
	it('renders without errors', () =>
	{
		render(<Alert />);
		expect(screen.getByRole('alert')).toBeDefined();
	});

	it('renders title when provided', () =>
	{
		render(<Alert title='Heads up' />);
		expect(screen.getByText('Heads up')).toBeDefined();
	});

	it('renders children when provided', () =>
	{
		render(<Alert>Something went wrong.</Alert>);
		expect(screen.getByText('Something went wrong.')).toBeDefined();
	});

	it('applies default variant classes', () =>
	{
		render(<Alert />);
		expect(screen.getByRole('alert').className).toContain('bg-surface-hover');
	});

	it('applies success variant classes', () =>
	{
		render(<Alert variant='success' />);
		expect(screen.getByRole('alert').className).toContain('bg-success-bg');
	});

	it('applies warning variant classes', () =>
	{
		render(<Alert variant='warning' />);
		expect(screen.getByRole('alert').className).toContain('bg-warning-bg');
	});

	it('applies danger variant classes', () =>
	{
		render(<Alert variant='danger' />);
		expect(screen.getByRole('alert').className).toContain('bg-danger/10');
	});

	it('sets role="alert" for accessibility', () =>
	{
		render(<Alert />);
		expect(screen.getByRole('alert')).toBeDefined();
	});

	it('icon has aria-hidden="true"', () =>
	{
		const { container } = render(<Alert />);
		const icon = container.querySelector('svg');
		expect(icon?.getAttribute('aria-hidden')).toBe('true');
	});

	it('forwards className prop', () =>
	{
		render(<Alert className='custom-class' />);
		expect(screen.getByRole('alert').className).toContain('custom-class');
	});

	it('forwards additional HTML attributes', () =>
	{
		render(<Alert data-testid='my-alert' />);
		expect(screen.getByTestId('my-alert')).toBeDefined();
	});
});
