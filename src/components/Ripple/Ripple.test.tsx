'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Ripple from './Ripple';

describe('Ripple', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<Ripple />);
		expect(container.firstChild).not.toBeNull();
	});

	it('renders optional children centered above the rings', () =>
	{
		render(<Ripple><span>Logo</span></Ripple>);
		expect(screen.getByText('Logo')).toBeDefined();
	});

	it('defaults to rendering 4 rings', () =>
	{
		const { container } = render(<Ripple />);
		expect(container.querySelectorAll('.dafink-ripple-ring')).toHaveLength(4);
	});

	it('renders a custom number of rings', () =>
	{
		const { container } = render(<Ripple count={6} />);
		expect(container.querySelectorAll('.dafink-ripple-ring')).toHaveLength(6);
	});

	it('defaults the cycle duration to 3000ms on each ring', () =>
	{
		const { container } = render(<Ripple />);
		const ring = container.querySelector('.dafink-ripple-ring') as HTMLElement;
		expect(ring.getAttribute('style')).toContain('3000ms');
	});

	it('accepts a custom duration in milliseconds', () =>
	{
		const { container } = render(<Ripple duration={1200} />);
		const ring = container.querySelector('.dafink-ripple-ring') as HTMLElement;
		expect(ring.getAttribute('style')).toContain('1200ms');
	});

	it('staggers each ring by duration divided by count', () =>
	{
		const { container } = render(<Ripple count={4} duration={2000} />);
		const rings = container.querySelectorAll('.dafink-ripple-ring');
		expect((rings[0] as HTMLElement).style.animationDelay).toBe('0ms');
		expect((rings[1] as HTMLElement).style.animationDelay).toBe('500ms');
		expect((rings[2] as HTMLElement).style.animationDelay).toBe('1000ms');
		expect((rings[3] as HTMLElement).style.animationDelay).toBe('1500ms');
	});

	it('marks the rings container as aria-hidden', () =>
	{
		const { container } = render(<Ripple />);
		expect(container.querySelector('.dafink-ripple-rings')?.getAttribute('aria-hidden')).toBe('true');
	});

	it('uses the brand color token for the ring border', () =>
	{
		const { container } = render(<Ripple />);
		const css = container.querySelector('style')?.textContent ?? '';
		expect(css).toContain('var(--color-brand)');
		expect(css).toContain('var(--ease-standard)');
	});

	it('hides the rings container entirely under prefers-reduced-motion', () =>
	{
		const { container } = render(<Ripple />);
		const css = container.querySelector('style')?.textContent ?? '';
		const reducedBlock = css.split('@media (prefers-reduced-motion: reduce)')[1];
		expect(reducedBlock).toBeDefined();
		expect(reducedBlock).toContain('.dafink-ripple-rings');
		expect(reducedBlock).toContain('display: none');
	});

	it('forwards className and native HTML attributes', () =>
	{
		const { container } = render(<Ripple className='extra-class' id='ripple' />);
		const root = container.querySelector('#ripple') as HTMLElement;
		expect(root).not.toBeNull();
		expect(root.className).toContain('extra-class');
	});
});
