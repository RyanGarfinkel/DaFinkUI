'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from './Badge';

describe('Badge', () =>
{
	it('renders without errors', () =>
	{
		render(<Badge>New</Badge>);
		expect(screen.getByText('New')).toBeDefined();
	});

	it('renders children', () =>
	{
		render(<Badge>Beta</Badge>);
		expect(screen.getByText('Beta')).toBeDefined();
	});

	it('applies default variant classes', () =>
	{
		render(<Badge>Default</Badge>);
		expect(screen.getByText('Default').className).toContain('bg-surface-active');
	});

	it('applies success variant classes', () =>
	{
		render(<Badge variant='success'>OK</Badge>);
		expect(screen.getByText('OK').className).toContain('bg-success-bg');
	});

	it('applies warning variant classes', () =>
	{
		render(<Badge variant='warning'>Warn</Badge>);
		expect(screen.getByText('Warn').className).toContain('bg-warning-bg');
	});

	it('applies danger variant classes', () =>
	{
		render(<Badge variant='danger'>Error</Badge>);
		expect(screen.getByText('Error').className).toContain('bg-danger/10');
	});

	it('applies outline variant classes', () =>
	{
		render(<Badge variant='outline'>Draft</Badge>);
		expect(screen.getByText('Draft').className).toContain('border-surface-border');
	});

	it('renders as a span element', () =>
	{
		const { container } = render(<Badge>Label</Badge>);
		expect(container.querySelector('span')).toBeDefined();
	});

	it('forwards className prop', () =>
	{
		render(<Badge className='extra-class'>Tag</Badge>);
		expect(screen.getByText('Tag').className).toContain('extra-class');
	});

	it('forwards additional HTML attributes', () =>
	{
		render(<Badge data-testid='my-badge'>Item</Badge>);
		expect(screen.getByTestId('my-badge')).toBeDefined();
	});
});
