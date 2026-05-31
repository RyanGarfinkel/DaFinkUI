'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Checkbox from './Checkbox';

describe('Checkbox', () =>
{
	it('renders without errors', () =>
	{
		render(<Checkbox />);
		expect(screen.getByRole('checkbox')).toBeDefined();
	});

	it('renders a label when provided', () =>
	{
		render(<Checkbox label='Accept terms' id='terms' />);
		expect(screen.getByLabelText('Accept terms')).toBeDefined();
	});

	it('associates label with input via htmlFor and id', () =>
	{
		render(<Checkbox label='Accept terms' id='terms' />);
		const checkbox = screen.getByRole('checkbox');
		expect(checkbox.getAttribute('id')).toBe('terms');
	});

	it('renders as type="checkbox"', () =>
	{
		render(<Checkbox />);
		expect(screen.getByRole('checkbox').getAttribute('type')).toBe('checkbox');
	});

	it('applies focus-visible ring classes', () =>
	{
		render(<Checkbox />);
		expect(screen.getByRole('checkbox').className).toContain('focus-visible:ring-2');
	});

	it('applies disabled classes when disabled', () =>
	{
		render(<Checkbox disabled />);
		const checkbox = screen.getByRole('checkbox');
		expect(checkbox.className).toContain('disabled:opacity-50');
		expect(checkbox).toHaveProperty('disabled', true);
	});

	it('forwards className to the wrapper label', () =>
	{
		const { container } = render(<Checkbox className='extra-class' />);
		expect(container.querySelector('label')?.className).toContain('extra-class');
	});

	it('forwards native input props', () =>
	{
		render(<Checkbox defaultChecked />);
		expect(screen.getByRole('checkbox')).toHaveProperty('defaultChecked', true);
	});

	it('forwards data attributes', () =>
	{
		render(<Checkbox data-testid='my-checkbox' />);
		expect(screen.getByTestId('my-checkbox')).toBeDefined();
	});
});
