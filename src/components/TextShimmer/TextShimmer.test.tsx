'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TextShimmer from './TextShimmer';

describe('TextShimmer', () =>
{
	it('renders children without errors', () =>
	{
		render(<TextShimmer>Loading magic</TextShimmer>);
		expect(screen.getByText('Loading magic')).toBeDefined();
	});

	it('applies the shimmer class to the text element', () =>
	{
		render(<TextShimmer>Shiny</TextShimmer>);
		expect(screen.getByText('Shiny').className).toContain('obi-text-shimmer');
	});

	it('defaults the sweep duration to a token-derived value', () =>
	{
		render(<TextShimmer>Shiny</TextShimmer>);
		const style = screen.getByText('Shiny').getAttribute('style') ?? '';
		expect(style).toContain('--shimmer-duration');
		expect(style).toContain('calc(var(--duration-slow) * 8)');
	});

	it('accepts a custom duration in milliseconds', () =>
	{
		render(<TextShimmer duration={1500}>Shiny</TextShimmer>);
		const style = screen.getByText('Shiny').getAttribute('style') ?? '';
		expect(style).toContain('1500ms');
	});

	it('uses color tokens for the gradient and base text color', () =>
	{
		const { container } = render(<TextShimmer>Shiny</TextShimmer>);
		const css = container.querySelector('style')?.textContent ?? '';
		expect(css).toContain('var(--color-text)');
		expect(css).toContain('var(--color-text-muted)');
		expect(css).toContain('var(--ease-standard)');
	});

	it('disables the shimmer under prefers-reduced-motion', () =>
	{
		const { container } = render(<TextShimmer>Shiny</TextShimmer>);
		const css = container.querySelector('style')?.textContent ?? '';
		const reducedBlock = css.split('@media (prefers-reduced-motion: reduce)')[1];
		expect(reducedBlock).toBeDefined();
		expect(reducedBlock).toContain('animation: none');
		expect(reducedBlock).toContain('background-image: none');
		expect(reducedBlock).toContain('-webkit-text-fill-color: currentColor');
	});

	it('forwards className and native HTML attributes', () =>
	{
		render(<TextShimmer className='extra-class' id='shimmer'>Shiny</TextShimmer>);
		const element = screen.getByText('Shiny');
		expect(element.className).toContain('extra-class');
		expect(element.id).toBe('shimmer');
	});
});
