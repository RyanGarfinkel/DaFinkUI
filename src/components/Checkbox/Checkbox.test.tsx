'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Checkbox from './Checkbox';

describe('Checkbox', () =>
{
	it('renders as a checkbox', () =>
	{
		render(<Checkbox />);
		expect(screen.getByRole('checkbox')).toBeDefined();
	});

	it('is unchecked by default', () =>
	{
		render(<Checkbox />);
		expect(screen.getByRole('checkbox')).toHaveProperty('checked', false);
	});

	it('toggles checked state on click', async () =>
	{
		render(<Checkbox />);
		const checkbox = screen.getByRole('checkbox');
		await userEvent.click(checkbox);
		expect(checkbox).toHaveProperty('checked', true);
		await userEvent.click(checkbox);
		expect(checkbox).toHaveProperty('checked', false);
	});

	it('clicking the label toggles the checkbox', async () =>
	{
		render(<Checkbox label='Accept terms' id='terms' />);
		await userEvent.click(screen.getByText('Accept terms'));
		expect(screen.getByRole('checkbox')).toHaveProperty('checked', true);
	});

	it('calls onChange when toggled', async () =>
	{
		const onChange = vi.fn();
		render(<Checkbox onChange={onChange} />);
		await userEvent.click(screen.getByRole('checkbox'));
		expect(onChange).toHaveBeenCalledOnce();
	});

	it('does not toggle when disabled', async () =>
	{
		render(<Checkbox disabled />);
		const checkbox = screen.getByRole('checkbox');
		await userEvent.click(checkbox);
		expect(checkbox).toHaveProperty('checked', false);
	});

	it('is disabled when disabled prop is set', () =>
	{
		render(<Checkbox disabled />);
		expect(screen.getByRole('checkbox')).toHaveProperty('disabled', true);
	});

	it('renders a label when provided', () =>
	{
		render(<Checkbox label='Accept terms' id='terms' />);
		expect(screen.getByLabelText('Accept terms')).toBeDefined();
	});

	it('associates label with input via htmlFor and id', () =>
	{
		render(<Checkbox label='Accept terms' id='terms' />);
		expect(screen.getByRole('checkbox').getAttribute('id')).toBe('terms');
	});

	it('has a visible focus ring for keyboard users', () =>
	{
		render(<Checkbox />);
		expect(screen.getByRole('checkbox').className).toContain('focus-visible:ring-2');
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
