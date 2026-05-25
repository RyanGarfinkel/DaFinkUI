import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Textarea from './Textarea';

describe('Textarea', () =>
{
	it('renders without errors', () =>
	{
		render(<Textarea />);
		expect(screen.getByRole('textbox')).toBeDefined();
	});

	it('renders a label when provided', () =>
	{
		render(<Textarea label='Message' />);
		expect(screen.getByLabelText('Message')).toBeDefined();
	});

	it('links label to textarea via htmlFor and id', () =>
	{
		render(<Textarea label='Message' />);
		const textarea = screen.getByRole('textbox');
		expect(textarea.getAttribute('id')).toBe('message');
		expect(screen.getByText('Message').getAttribute('for')).toBe('message');
	});

	it('renders hint text', () =>
	{
		render(<Textarea label='Bio' hint='Maximum 500 characters.' />);
		expect(screen.getByText('Maximum 500 characters.')).toBeDefined();
	});

	it('renders error message and sets aria-invalid', () =>
	{
		render(<Textarea label='Message' error='This field is required.' />);
		expect(screen.getByText('This field is required.')).toBeDefined();
		expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
	});

	it('does not render hint when error is present', () =>
	{
		render(<Textarea label='Message' hint='A hint.' error='An error.' />);
		expect(screen.queryByText('A hint.')).toBeNull();
		expect(screen.getByText('An error.')).toBeDefined();
	});

	it('sets aria-describedby to error id when error is present', () =>
	{
		render(<Textarea label='Message' error='Invalid input.' />);
		const textarea = screen.getByRole('textbox');
		expect(textarea.getAttribute('aria-describedby')).toBe('message-error');
	});

	it('sets aria-describedby to hint id when hint is present', () =>
	{
		render(<Textarea label='Message' hint='Some hint.' />);
		const textarea = screen.getByRole('textbox');
		expect(textarea.getAttribute('aria-describedby')).toBe('message-hint');
	});

	it('applies token-based border class', () =>
	{
		render(<Textarea />);
		expect(screen.getByRole('textbox').className).toContain('border-input-border');
	});

	it('applies error border and outline token classes when in error state', () =>
	{
		render(<Textarea error='Something went wrong.' />);
		const textarea = screen.getByRole('textbox');
		expect(textarea.className).toContain('border-input-error');
		expect(textarea.className).toContain('focus-visible:outline-input-error-ring');
	});

	it('applies focus-visible outline classes', () =>
	{
		render(<Textarea />);
		const textarea = screen.getByRole('textbox');
		expect(textarea.className).toContain('focus-visible:outline');
		expect(textarea.className).toContain('focus-visible:outline-[3px]');
		expect(textarea.className).toContain('focus-visible:outline-input-ring');
		expect(textarea.className).toContain('focus-visible:outline-offset-0');
	});

	it('suppresses default outline', () =>
	{
		render(<Textarea />);
		expect(screen.getByRole('textbox').className).toContain('outline-none');
	});

	it('applies disabled classes when disabled', () =>
	{
		render(<Textarea disabled />);
		const textarea = screen.getByRole('textbox');
		expect(textarea.className).toContain('disabled:cursor-not-allowed');
		expect(textarea).toHaveProperty('disabled', true);
	});

	it('forwards native textarea props', () =>
	{
		render(<Textarea placeholder='Type here…' rows={6} />);
		const textarea = screen.getByRole('textbox');
		expect(textarea.getAttribute('placeholder')).toBe('Type here…');
		expect(textarea.getAttribute('rows')).toBe('6');
	});
});
