import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Formula from './Formula';

describe('Formula', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<Formula expression='x' />);
		expect(container.querySelector('.katex')).not.toBeNull();
	});

	it('renders the raw LaTeX source into the accessible MathML annotation', () =>
	{
		const expr = 'x^2 + y^2 = r^2';
		const { container } = render(<Formula expression={expr} />);
		expect(container.querySelector('annotation')?.textContent).toBe(expr);
	});

	it('renders a superscript', () =>
	{
		const { container } = render(<Formula expression='x^2' />);
		expect(container.querySelector('.katex')?.textContent).toContain('2');
	});

	it('renders a fraction', () =>
	{
		const expr = '\\frac{a}{b}';
		const { container } = render(<Formula expression={expr} />);
		expect(container.querySelector('.mfrac')).not.toBeNull();
		expect(container.querySelector('annotation')?.textContent).toBe(expr);
	});

	it('renders greek letters and operators', () =>
	{
		const expr = '\\pi \\times \\infty';
		const { container } = render(<Formula expression={expr} />);
		expect(container.querySelector('annotation')?.textContent).toBe(expr);
	});

	it('degrades gracefully instead of throwing on invalid LaTeX', () =>
	{
		const expr = '\\frac{a';
		expect(() => render(<Formula expression={expr} />)).not.toThrow();
	});

	it('renders malformed LaTeX with a katex-error span', () =>
	{
		const expr = '\\frac{a';
		const { container } = render(<Formula expression={expr} />);
		expect(container.querySelector('.katex-error')).not.toBeNull();
	});

	it('renders an unrecognized command as literal error-colored text', () =>
	{
		const expr = '\\notarealcommand';
		const { container } = render(<Formula expression={expr} />);
		expect(container.querySelector('.katex')?.textContent).toContain('\\notarealcommand');
	});

	it('renders inline mode as a span by default', () =>
	{
		const { container } = render(<Formula expression='x' />);
		expect(container.querySelector(':scope > span')).not.toBeNull();
	});

	it('renders block mode as a div with the katex-display class', () =>
	{
		const { container } = render(<Formula expression='x' display='block' />);
		expect(container.querySelector(':scope > div')).not.toBeNull();
		expect(container.querySelector('.katex-display')).not.toBeNull();
	});

	it('applies the default md size class', () =>
	{
		const { container } = render(<Formula expression='x' />);
		expect(container.firstElementChild?.className).toContain('text-base');
	});

	it('applies the sm size class', () =>
	{
		const { container } = render(<Formula expression='x' size='sm' />);
		expect(container.firstElementChild?.className).toContain('text-sm');
	});

	it('applies the lg size class', () =>
	{
		const { container } = render(<Formula expression='x' size='lg' />);
		expect(container.firstElementChild?.className).toContain('text-lg');
	});

	it('forwards className prop', () =>
	{
		const { container } = render(<Formula expression='x' className='extra-class' />);
		expect(container.firstElementChild?.className).toContain('extra-class');
	});

	it('forwards additional HTML attributes', () =>
	{
		render(<Formula expression='x' data-testid='my-formula' />);
		expect(screen.getByTestId('my-formula')).toBeDefined();
	});
});
