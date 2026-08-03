'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Spotlight from './Spotlight';

const FIXED_RECT = {
	left:   10,
	top:    20,
	width:  200,
	height: 200,
	right:  210,
	bottom: 220,
	x:      10,
	y:      20,
	toJSON: () => {},
} as DOMRect;

describe('Spotlight', () =>
{
	beforeEach(() =>
	{
		Element.prototype.getBoundingClientRect = () => FIXED_RECT;
	});

	it('renders children without errors', () =>
	{
		render(<Spotlight>Card content</Spotlight>);
		expect(screen.getByText('Card content')).toBeDefined();
	});

	it('renders an aria-hidden overlay with the spotlight class', () =>
	{
		const { container } = render(<Spotlight>Content</Spotlight>);
		const overlay = container.querySelector('.dafink-spotlight');
		expect(overlay).not.toBeNull();
		expect(overlay?.getAttribute('aria-hidden')).toBe('true');
	});

	it('sets sane initial --spot-x/--spot-y values before any pointer movement', () =>
	{
		const { container } = render(<Spotlight>Content</Spotlight>);
		const overlay = container.querySelector('.dafink-spotlight') as HTMLElement;
		expect(overlay.style.getPropertyValue('--spot-x')).toBe('50%');
		expect(overlay.style.getPropertyValue('--spot-y')).toBe('50%');
	});

	it('updates --spot-x/--spot-y on the overlay when the pointer moves, relative to the container', () =>
	{
		const { container } = render(<Spotlight>Content</Spotlight>);
		const root = container.firstChild as HTMLElement;
		const overlay = container.querySelector('.dafink-spotlight') as HTMLElement;

		fireEvent.pointerMove(root, { clientX: 60, clientY: 90 });

		expect(overlay.style.getPropertyValue('--spot-x')).toBe('50px');
		expect(overlay.style.getPropertyValue('--spot-y')).toBe('70px');
	});

	it('does not re-render the overlay element on pointer move', () =>
	{
		const { container } = render(<Spotlight>Content</Spotlight>);
		const root = container.firstChild as HTMLElement;
		const overlayBefore = container.querySelector('.dafink-spotlight');

		fireEvent.pointerMove(root, { clientX: 60, clientY: 90 });

		const overlayAfter = container.querySelector('.dafink-spotlight');
		expect(overlayAfter).toBe(overlayBefore);
	});

	it('fades the overlay in on pointer enter and out on pointer leave', () =>
	{
		const { container } = render(<Spotlight>Content</Spotlight>);
		const root = container.firstChild as HTMLElement;
		const overlay = container.querySelector('.dafink-spotlight') as HTMLElement;

		expect(overlay.className).toContain('opacity-0');

		fireEvent.pointerEnter(root);
		expect(overlay.className).toContain('opacity-100');

		fireEvent.pointerLeave(root);
		expect(overlay.className).toContain('opacity-0');
	});

	it('uses the size prop to size the radial gradient falloff', () =>
	{
		const { container } = render(<Spotlight size={200}>Content</Spotlight>);
		const overlay = container.querySelector('.dafink-spotlight') as HTMLElement;
		expect(overlay.getAttribute('style')).toContain('100px');
	});

	it('uses the brand color token for the glow tint', () =>
	{
		const { container } = render(<Spotlight>Content</Spotlight>);
		const overlay = container.querySelector('.dafink-spotlight') as HTMLElement;
		const style = overlay.getAttribute('style') ?? '';
		expect(style).toContain('var(--color-brand)');
		expect(style).toContain('color-mix(in srgb');
	});

	it('forwards className and native HTML attributes to the container', () =>
	{
		const { container } = render(<Spotlight className='extra-class' id='panel'>Content</Spotlight>);
		const root = container.firstChild as HTMLElement;
		expect(root.className).toContain('extra-class');
		expect(root.id).toBe('panel');
	});
});
