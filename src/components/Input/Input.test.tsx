import { render, screen, fireEvent } from '@testing-library/react';
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

	it('shows error over hint when both are present', () =>
	{
		render(<Input label='Email' hint='A hint.' error='An error.' />);
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
		expect(input.className).toContain('focus:border-input-error-ring');
	});

	it('applies focus-visible outline classes', () =>
	{
		render(<Input />);
		const input = screen.getByRole('textbox');
		expect(input.className).toContain('focus-visible:shadow-[var(--input-focus-shadow)]');
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

	describe('floating variant', () =>
	{
		it('renders with floating variant', () =>
		{
			render(<Input label='Email' variant='floating' />);
			expect(screen.getByRole('textbox')).toBeDefined();
			expect(screen.getByText('Email')).toBeDefined();
		});

		it('applies extra top padding for floating label space', () =>
		{
			render(<Input variant='floating' />);
			expect(screen.getByRole('textbox').className).toContain('pt-5');
		});

		it('renders label as absolute element in floating variant', () =>
		{
			render(<Input label='Name' variant='floating' />);
			const label = screen.getByText('Name');
			expect(label.className).toContain('absolute');
		});

		it('floats label on focus', () =>
		{
			render(<Input label='Name' variant='floating' />);
			const input = screen.getByRole('textbox');
			const label = screen.getByText('Name');
			expect(label.className).toContain('-translate-y-1/2');
			fireEvent.focus(input);
			expect(label.className).toContain('top-1.5');
			expect(label.className).toContain('text-xs');
		});

		it('returns label to resting state on blur with no value', () =>
		{
			render(<Input label='Name' variant='floating' />);
			const input = screen.getByRole('textbox');
			const label = screen.getByText('Name');
			fireEvent.focus(input);
			fireEvent.blur(input);
			expect(label.className).toContain('-translate-y-1/2');
		});

		it('keeps label floated after typing', () =>
		{
			render(<Input label='Name' variant='floating' />);
			const input = screen.getByRole('textbox');
			const label = screen.getByText('Name');
			fireEvent.change(input, { target: { value: 'Ryan' } });
			fireEvent.blur(input);
			expect(label.className).toContain('top-1.5');
		});

		it('always floats label in error state', () =>
		{
			render(<Input label='Email' variant='floating' error='Required.' />);
			const label = screen.getByText('Email');
			expect(label.className).toContain('top-1.5');
			expect(label.className).toContain('text-input-error');
		});
	});

	describe('password type', () =>
	{
		it('renders as password type by default when type="password"', () =>
		{
			const { container } = render(<Input type='password' />);
			expect(container.querySelector('input')?.getAttribute('type')).toBe('password');
		});

		it('renders eye toggle button when type="password"', () =>
		{
			render(<Input type='password' label='Password' />);
			expect(screen.getByRole('button', { name: /show password/i })).toBeDefined();
		});

		it('toggles input type between password and text', () =>
		{
			const { container } = render(<Input type='password' label='Password' />);
			const input = container.querySelector('input')!;
			const button = screen.getByRole('button');
			expect(input.getAttribute('type')).toBe('password');
			fireEvent.click(button);
			expect(input.getAttribute('type')).toBe('text');
			fireEvent.click(button);
			expect(input.getAttribute('type')).toBe('password');
		});

		it('updates toggle aria-label with state', () =>
		{
			render(<Input type='password' label='Password' />);
			const button = screen.getByRole('button');
			expect(button.getAttribute('aria-label')).toBe('Show password');
			fireEvent.click(button);
			expect(button.getAttribute('aria-label')).toBe('Hide password');
		});

		it('does not render eye button when type is not password', () =>
		{
			render(<Input label='Email' />);
			expect(screen.queryByRole('button')).toBeNull();
		});

		it('disables toggle button when input is disabled', () =>
		{
			render(<Input type='password' disabled />);
			expect(screen.getByRole('button')).toHaveProperty('disabled', true);
		});
	});

	describe('animated feedback', () =>
	{
		it('renders grid container for animated feedback', () =>
		{
			const { container } = render(<Input error='Bad input.' />);
			const grid = container.querySelector('.grid');
			expect(grid).toBeTruthy();
			expect(grid?.className).toContain('grid-rows-[1fr]');
		});

		it('collapses feedback grid when no error or hint', () =>
		{
			const { container } = render(<Input />);
			const grid = container.querySelector('.grid');
			expect(grid?.className).toContain('grid-rows-[0fr]');
		});
	});
});
