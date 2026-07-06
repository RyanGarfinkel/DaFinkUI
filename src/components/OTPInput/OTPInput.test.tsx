import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OTPInput from './OTPInput';

describe('OTPInput', () =>
{
	it('renders the correct number of cells', () =>
	{
		render(<OTPInput length={6} value='' />);
		const inputs = screen.getAllByRole('textbox');
		expect(inputs).toHaveLength(6);
	});

	it('renders default length of 6 when length is not provided', () =>
	{
		render(<OTPInput value='' />);
		expect(screen.getAllByRole('textbox')).toHaveLength(6);
	});

	it('renders a custom length', () =>
	{
		render(<OTPInput length={4} value='' />);
		expect(screen.getAllByRole('textbox')).toHaveLength(4);
	});

	it('distributes value across cells', () =>
	{
		render(<OTPInput length={4} value='1234' />);
		const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
		expect(inputs[0].value).toBe('1');
		expect(inputs[1].value).toBe('2');
		expect(inputs[2].value).toBe('3');
		expect(inputs[3].value).toBe('4');
	});

	it('shows empty cells for missing value characters', () =>
	{
		render(<OTPInput length={4} value='12' />);
		const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
		expect(inputs[2].value).toBe('');
		expect(inputs[3].value).toBe('');
	});

	it('calls onChange with updated value on digit input', () =>
	{
		const onChange = vi.fn();
		render(<OTPInput length={4} value='' onChange={onChange} />);
		const inputs = screen.getAllByRole('textbox');
		fireEvent.change(inputs[0], { target: { value: '5' } });
		expect(onChange).toHaveBeenCalledWith('5');
	});

	it('calls onChange on backspace when cell has value', () =>
	{
		const onChange = vi.fn();
		render(<OTPInput length={4} value='12' onChange={onChange} />);
		const inputs = screen.getAllByRole('textbox');
		fireEvent.keyDown(inputs[1], { key: 'Backspace' });
		expect(onChange).toHaveBeenCalled();
	});

	it('renders a label when provided', () =>
	{
		render(<OTPInput label='Verification code' value='' />);
		expect(screen.getByText('Verification code')).toBeDefined();
	});

	it('renders error message', () =>
	{
		render(<OTPInput error='Invalid code.' value='' />);
		expect(screen.getByText('Invalid code.')).toBeDefined();
	});

	it('applies error border to all cells when error is set', () =>
	{
		render(<OTPInput length={4} error='Invalid.' value='' />);
		const inputs = screen.getAllByRole('textbox');
		inputs.forEach(input =>
		{
			expect(input.className).toContain('border-input-error');
		});
	});

	it('renders hint text', () =>
	{
		render(<OTPInput hint='Check your email.' value='' />);
		expect(screen.getByText('Check your email.')).toBeDefined();
	});

	it('disables all cells when disabled', () =>
	{
		render(<OTPInput length={4} disabled value='' />);
		const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
		inputs.forEach(input => expect(input.disabled).toBe(true));
	});

	it('each cell has an accessible aria-label', () =>
	{
		render(<OTPInput length={3} value='' />);
		expect(screen.getByLabelText('Character 1 of 3')).toBeDefined();
		expect(screen.getByLabelText('Character 2 of 3')).toBeDefined();
		expect(screen.getByLabelText('Character 3 of 3')).toBeDefined();
	});

	it('cells have caret-transparent class', () =>
	{
		render(<OTPInput length={2} value='' />);
		const inputs = screen.getAllByRole('textbox');
		inputs.forEach(input => expect(input.className).toContain('caret-transparent'));
	});

	it('does not render a blinking cursor before any cell is focused', () =>
	{
		const { container } = render(<OTPInput length={4} value='' />);
		expect(container.querySelector('.dafink-otp-cursor')).toBeNull();
	});

	it('renders a blinking cursor only inside the focused cell', () =>
	{
		const { container } = render(<OTPInput length={4} value='' />);
		const inputs = screen.getAllByRole('textbox');
		fireEvent.focus(inputs[2]);
		expect(container.querySelectorAll('.dafink-otp-cursor')).toHaveLength(1);
		expect(inputs[2].parentElement?.querySelector('.dafink-otp-cursor')).not.toBeNull();
	});

	it('removes the blinking cursor when the cell loses focus', () =>
	{
		const { container } = render(<OTPInput length={4} value='' />);
		const inputs = screen.getAllByRole('textbox');
		fireEvent.focus(inputs[0]);
		expect(container.querySelector('.dafink-otp-cursor')).not.toBeNull();
		fireEvent.blur(inputs[0]);
		expect(container.querySelector('.dafink-otp-cursor')).toBeNull();
	});

	it('injects the same blinking-cursor animation technique used by Typewriter', () =>
	{
		const { container } = render(<OTPInput length={4} value='' />);
		const css = container.querySelector('style')?.textContent ?? '';
		expect(css).toContain('dafink-cursor-blink');
		expect(css).toContain('dafink-otp-cursor');
		expect(css).toContain('prefers-reduced-motion');
	});
});
