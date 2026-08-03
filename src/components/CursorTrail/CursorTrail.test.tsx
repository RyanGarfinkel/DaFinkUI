'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CursorTrail from './CursorTrail';

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

const stubMatchMedia = (matches: boolean) =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
};

describe('CursorTrail', () =>
{
	beforeEach(() =>
	{
		Element.prototype.getBoundingClientRect = () => FIXED_RECT;
		stubMatchMedia(false);
	});

	afterEach(() =>
	{
		vi.unstubAllGlobals();
	});

	it('renders children without errors', () =>
	{
		render(<CursorTrail>Hero content</CursorTrail>);
		expect(screen.getByText('Hero content')).toBeDefined();
	});

	it('forwards className and native HTML attributes to the wrapper', () =>
	{
		const { container } = render(<CursorTrail className='extra-class' id='panel'>Content</CursorTrail>);
		const root = container.firstChild as HTMLElement;
		expect(root.className).toContain('extra-class');
		expect(root.id).toBe('panel');
	});

	it('renders exactly trailLength dot elements by default', () =>
	{
		const { container } = render(<CursorTrail>Content</CursorTrail>);
		expect(container.querySelectorAll('.dafink-cursor-trail-dot').length).toBe(6);
	});

	it('renders the correct number of dots when trailLength changes', () =>
	{
		const { container, rerender } = render(<CursorTrail trailLength={3}>Content</CursorTrail>);
		expect(container.querySelectorAll('.dafink-cursor-trail-dot').length).toBe(3);

		rerender(<CursorTrail trailLength={9}>Content</CursorTrail>);
		expect(container.querySelectorAll('.dafink-cursor-trail-dot').length).toBe(9);
	});

	it('renders dots invisible and unpositioned before any pointer movement', () =>
	{
		const { container } = render(<CursorTrail>Content</CursorTrail>);
		const dot = container.querySelector('.dafink-cursor-trail-dot') as HTMLElement;
		expect(dot.style.opacity).toBe('0');
		expect(dot.style.left).toBe('0px');
		expect(dot.style.top).toBe('0px');
	});

	it('updates the leading dot position and opacity on pointer move', () =>
	{
		const { container } = render(<CursorTrail>Content</CursorTrail>);
		const root = container.firstChild as HTMLElement;
		const dot  = container.querySelector('.dafink-cursor-trail-dot') as HTMLElement;

		fireEvent.pointerMove(root, { clientX: 60, clientY: 90 });

		expect(dot.style.opacity).not.toBe('0');
		expect(dot.style.left).not.toBe('0px');
		expect(dot.style.top).not.toBe('0px');
	});

	it('sizes the leading dot using the size prop', () =>
	{
		const { container } = render(<CursorTrail size={24}>Content</CursorTrail>);
		const dot = container.querySelector('.dafink-cursor-trail-dot') as HTMLElement;
		expect(dot.style.width).toBe('24px');
		expect(dot.style.height).toBe('24px');
	});

	it('uses the brand color token for the dot glow', () =>
	{
		const { container } = render(<CursorTrail>Content</CursorTrail>);
		const dot = container.querySelector('.dafink-cursor-trail-dot') as HTMLElement;
		const inlineStyle = dot.getAttribute('style') ?? '';
		expect(inlineStyle).toContain('var(--color-brand)');
	});

	it('never positions or reveals dots under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		const { container } = render(<CursorTrail>Content</CursorTrail>);
		const root = container.firstChild as HTMLElement;
		const dot  = container.querySelector('.dafink-cursor-trail-dot') as HTMLElement;

		fireEvent.pointerMove(root, { clientX: 60, clientY: 90 });

		expect(dot.style.opacity).toBe('0');
		expect(dot.style.left).toBe('0px');
		expect(dot.style.top).toBe('0px');
	});
});
