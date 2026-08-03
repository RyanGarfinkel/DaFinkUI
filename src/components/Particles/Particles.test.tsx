'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Particles from './Particles';

describe('Particles', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<Particles />);
		expect(container.querySelector('.dafink-particles-dot')).not.toBeNull();
	});

	it('renders the default quantity of 30 dots', () =>
	{
		const { container } = render(<Particles />);
		const dots = container.querySelectorAll('.dafink-particles-dot');
		expect(dots.length).toBe(30);
	});

	it('renders a custom quantity of dots', () =>
	{
		const { container } = render(<Particles quantity={10} />);
		const dots = container.querySelectorAll('.dafink-particles-dot');
		expect(dots.length).toBe(10);
	});

	it('marks the dot layer as aria-hidden', () =>
	{
		const { container } = render(<Particles />);
		const layer = container.querySelector('.dafink-particles-dot')?.parentElement;
		expect(layer?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders children above the dot layer', () =>
	{
		render(<Particles><p>Hero content</p></Particles>);
		expect(screen.getByText('Hero content')).toBeDefined();
	});

	it('gives each dot a position and animation timing via inline style', () =>
	{
		const { container } = render(<Particles quantity={1} />);
		const dot = container.querySelector('.dafink-particles-dot');
		const style = dot?.getAttribute('style') ?? '';
		expect(style).toContain('left:');
		expect(style).toContain('top:');
		expect(style).toContain('--particle-duration');
		expect(style).toContain('--particle-delay');
	});

	it('uses the text-subtle color token for dots', () =>
	{
		const { container } = render(<Particles />);
		const css = container.querySelector('style')?.textContent ?? '';
		expect(css).toContain('var(--color-text-subtle)');
	});

	it('disables dot animation under prefers-reduced-motion but keeps dots visible', () =>
	{
		const { container } = render(<Particles />);
		const css = container.querySelector('style')?.textContent ?? '';
		const reducedBlock = css.split('@media (prefers-reduced-motion: reduce)')[1];
		expect(reducedBlock).toBeDefined();
		expect(reducedBlock).toContain('animation: none');
		expect(reducedBlock).toContain('opacity: 0.5');
	});

	it('forwards className and native HTML attributes to the container', () =>
	{
		const { container } = render(<Particles className='extra-class' id='particles-wrapper' />);
		const wrapper = container.firstChild?.nextSibling as HTMLElement;
		expect(wrapper.className).toContain('extra-class');
		expect(wrapper.id).toBe('particles-wrapper');
	});

	it('produces the exact same set of dot positions across separate renders with the same quantity', () =>
	{
		const first = render(<Particles quantity={12} />);
		const firstPositions = Array.from(first.container.querySelectorAll('.dafink-particles-dot'))
			.map((dot) => dot.getAttribute('style'));
		first.unmount();

		const second = render(<Particles quantity={12} />);
		const secondPositions = Array.from(second.container.querySelectorAll('.dafink-particles-dot'))
			.map((dot) => dot.getAttribute('style'));

		expect(firstPositions).toEqual(secondPositions);
	});
});
