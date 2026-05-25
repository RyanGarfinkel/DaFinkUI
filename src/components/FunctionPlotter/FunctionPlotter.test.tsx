import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FunctionPlotter from './FunctionPlotter';

// jsdom does not implement canvas — stub the context
beforeEach(() =>
{
	HTMLCanvasElement.prototype.getContext = () => null;
});

describe('FunctionPlotter', () =>
{
	it('renders a canvas with role="img" and aria-label="Function plot"', () =>
	{
		render(<FunctionPlotter />);
		const canvas = screen.getByRole('img', { name: 'Function plot' });
		expect(canvas).toBeDefined();
		expect(canvas.tagName.toLowerCase()).toBe('canvas');
	});

	it('renders inputs with initial equation values', () =>
	{
		render(<FunctionPlotter initialEquations={['x^2', '2*x + 1']} />);
		const input1 = screen.getByRole('textbox', { name: 'Equation 1' });
		const input2 = screen.getByRole('textbox', { name: 'Equation 2' });
		expect((input1 as HTMLInputElement).value).toBe('x^2');
		expect((input2 as HTMLInputElement).value).toBe('2*x + 1');
	});

	it('adds an equation when the Add button is clicked', async () =>
	{
		render(<FunctionPlotter initialEquations={['x^2']} />);
		expect(screen.getAllByRole('textbox').length).toBe(1);
		await userEvent.click(screen.getByRole('button', { name: 'Add equation' }));
		expect(screen.getAllByRole('textbox').length).toBe(2);
	});

	it('removes an equation when the × button is clicked', async () =>
	{
		render(<FunctionPlotter initialEquations={['x^2', '2*x']} />);
		expect(screen.getAllByRole('textbox').length).toBe(2);
		await userEvent.click(screen.getByRole('button', { name: 'Remove equation 2' }));
		expect(screen.getAllByRole('textbox').length).toBe(1);
	});

	it('disables the remove button when only one equation remains', () =>
	{
		render(<FunctionPlotter initialEquations={['x^2']} />);
		const removeBtn = screen.getByRole('button', { name: 'Remove equation 1' });
		expect(removeBtn).toHaveProperty('disabled', true);
	});

	it('sets aria-invalid="true" on input for an invalid expression', async () =>
	{
		render(<FunctionPlotter initialEquations={['x^2']} />);
		const input = screen.getByRole('textbox', { name: 'Equation 1' });
		await userEvent.clear(input);
		await userEvent.type(input, '((((bad');
		expect(input.getAttribute('aria-invalid')).toBe('true');
	});

	it('does not set aria-invalid on a valid expression', async () =>
	{
		render(<FunctionPlotter initialEquations={['x']} />);
		const input = screen.getByRole('textbox', { name: 'Equation 1' });
		await userEvent.clear(input);
		await userEvent.type(input, 'x + 1');
		expect(input.getAttribute('aria-invalid')).toBe('false');
	});

	it('disables the Add button when 6 equations are present', async () =>
	{
		render(<FunctionPlotter initialEquations={['x', 'x^2', 'x^3', 'x^4', 'x^5', 'x^6']} />);
		const addBtn = screen.getByRole('button', { name: 'Add equation' });
		expect(addBtn).toHaveProperty('disabled', true);
	});

	it('renders zoom in button with correct aria-label', () =>
	{
		render(<FunctionPlotter />);
		expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDefined();
	});

	it('renders zoom out button with correct aria-label', () =>
	{
		render(<FunctionPlotter />);
		expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDefined();
	});

	it('renders reset view button with correct aria-label', () =>
	{
		render(<FunctionPlotter />);
		expect(screen.getByRole('button', { name: 'Reset view' })).toBeDefined();
	});

	it('does not remove an equation below the minimum of 1', async () =>
	{
		render(<FunctionPlotter initialEquations={['x^2']} />);
		const removeBtn = screen.getByRole('button', { name: 'Remove equation 1' });
		await userEvent.click(removeBtn);
		expect(screen.getAllByRole('textbox').length).toBe(1);
	});
});
