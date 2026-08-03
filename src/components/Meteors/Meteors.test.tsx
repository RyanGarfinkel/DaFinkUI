'use client';

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Meteors from './Meteors';

describe('Meteors', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<Meteors />);
		expect(container.querySelector('.dafink-meteors-layer')).not.toBeNull();
	});

	it('renders exactly 10 meteor streaks by default', () =>
	{
		const { container } = render(<Meteors />);
		expect(container.querySelectorAll('.dafink-meteor').length).toBe(10);
	});

	it('renders count meteor streaks when count is provided', () =>
	{
		const { container } = render(<Meteors count={4} />);
		expect(container.querySelectorAll('.dafink-meteor').length).toBe(4);
	});

	it('marks the meteors layer as aria-hidden since it is purely decorative', () =>
	{
		const { container } = render(<Meteors />);
		const layer = container.querySelector('.dafink-meteors-layer');
		expect(layer?.getAttribute('aria-hidden')).toBe('true');
	});

	it('produces identical positions and timings across renders for the same count (deterministic seeding)', () =>
	{
		const first  = render(<Meteors count={6} />);
		const second = render(<Meteors count={6} />);

		const firstStyles  = Array.from(first.container.querySelectorAll('.dafink-meteor')).map((el) => (el as HTMLElement).getAttribute('style'));
		const secondStyles = Array.from(second.container.querySelectorAll('.dafink-meteor')).map((el) => (el as HTMLElement).getAttribute('style'));

		expect(firstStyles).toEqual(secondStyles);
	});

	it('renders children above the meteors layer in a stacked, relatively positioned wrapper', () =>
	{
		const { getByText, container } = render(<Meteors><span>Hello</span></Meteors>);
		const childWrapper = getByText('Hello').parentElement;
		expect(childWrapper?.className).toContain('relative');
		expect(childWrapper?.className).toContain('z-10');
		expect(container.querySelector('.dafink-meteors-layer')).not.toBeNull();
	});

	it('renders no child wrapper when children is omitted', () =>
	{
		const { container } = render(<Meteors />);
		expect(container.querySelector('.z-10')).toBeNull();
	});

	it('defines the shared keyframes and reduced-motion override in the scoped style tag', () =>
	{
		const { container } = render(<Meteors />);
		const css = container.querySelector('style')?.textContent ?? '';
		expect(css).toContain('@keyframes dafink-meteor');
		expect(css).toContain('var(--color-text-subtle)');

		const reducedBlock = css.split('@media (prefers-reduced-motion: reduce)')[1];
		expect(reducedBlock).toBeDefined();
		expect(reducedBlock).toContain('.dafink-meteors-layer');
		expect(reducedBlock).toContain('display: none');
	});

	it('forwards className and native HTML attributes to the container', () =>
	{
		const { container } = render(<Meteors className='extra-class' id='ambient' />);
		const root = container.querySelector('#ambient') as HTMLElement;
		expect(root).not.toBeNull();
		expect(root.className).toContain('extra-class');
	});
});
