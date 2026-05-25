import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Input from './Input';

describe('Input', () =>
{
	it('renders without errors', () =>
	{
		render(<Input />);
		expect(screen.getByRole('textbox')).toBeDefined();
	});

	it('renders a label when provided', () =>
	{
		render(<Input label='Email' />);
		expect(screen.getByLabelText('Email')).toBeDefined();
	});

	it('links label to input via htmlFor and id', () =>
	{
		render(<Input label='Email' />);
		const input = screen.getByRole('textbox');
		expect(input.getAttribute('id')).toBe('email');
		expect(screen.getByText('Email').getAttribute('for')).toBe('email');
	});

	it('renders hint text', () =>
	{
		render(<Input label='Username' hint='Letters and numbers only.' />);
		expect(screen.getByText('Letters and numbers only.')).toBeDefined();
	});

	it('renders error message and sets aria-invalid', () =>
	{
		render(<Input label='Email' error='Invalid email address.' />);
		expect(screen.getByText('Invalid email address.')).toBeDefined();
		expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
	});

	it('does not render hint when error is present', () =>
	{
		render(<Input label='Email' hint='A hint.' error='An error.' />);
		expect(screen.queryByText('A hint.')).toBeNull();
		expect(screen.getByText('An error.')).toBeDefined();
	});

	it('sets aria-describedby to error id when error is present', () =>
	{
		render(<Input label='Email' error='Invalid email.' />);
		const input = screen.getByRole('textbox');
		expect(input.getAttribute('aria-describedby')).toBe('email-error');
	});

	it('sets aria-describedby to hint id when hint is present', () =>
	{
		render(<Input label='Email' hint='Some hint.' />);
		const input = screen.getByRole('textbox');
		expect(input.getAttribute('aria-describedby')).toBe('email-hint');
	});

	it('applies token-based border class', () =>
	{
		render(<Input />);
		expect(screen.getByRole('textbox').className).toContain('border-input-border');
	});

	it('applies error border and outline token classes when in error state', () =>
	{
		render(<Input error='Something went wrong.' />);
		const input = screen.getByRole('textbox');
		expect(input.className).toContain('border-input-error');
		expect(input.className).toContain('focus-visible:outline-input-error-ring');
	});

	it('applies focus-visible outline classes', () =>
	{
		render(<Input />);
		const input = screen.getByRole('textbox');
		expect(input.className).toContain('focus-visible:outline');
		expect(input.className).toContain('focus-visible:outline-[3px]');
		expect(input.className).toContain('focus-visible:outline-input-ring');
		expect(input.className).toContain('focus-visible:outline-offset-0');
	});

	it('suppresses default outline', () =>
	{
		render(<Input />);
		expect(screen.getByRole('textbox').className).toContain('outline-none');
	});

	it('applies disabled classes when disabled', () =>
	{
		render(<Input disabled />);
		const input = screen.getByRole('textbox');
		expect(input.className).toContain('disabled:cursor-not-allowed');
		expect(input).toHaveProperty('disabled', true);
	});

	it('forwards native input props', () =>
	{
		render(<Input type='email' placeholder='you@example.com' />);
		const input = screen.getByRole('textbox');
		expect(input.getAttribute('type')).toBe('email');
		expect(input.getAttribute('placeholder')).toBe('you@example.com');
	});
});
