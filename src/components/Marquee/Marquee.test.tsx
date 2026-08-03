'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Marquee from './Marquee';

describe('Marquee', () =>
{
	it('renders children without errors', () =>
	{
		render(<Marquee>Ticker content</Marquee>);
		expect(screen.getAllByText('Ticker content')).toHaveLength(2);
	});

	it('applies the track class to the scrolling row', () =>
	{
		const { container } = render(<Marquee>Content</Marquee>);
		expect(container.querySelector('.dafink-marquee-track')).not.toBeNull();
	});

	it('renders the content twice, marking the duplicate as aria-hidden', () =>
	{
		const { container } = render(<Marquee>Content</Marquee>);
		const copies = container.querySelectorAll('.dafink-marquee-copy');
		expect(copies).toHaveLength(2);
		expect(copies[1].getAttribute('aria-hidden')).toBe('true');
	});

	it('defaults the loop duration to 20 seconds', () =>
	{
		const { container } = render(<Marquee>Content</Marquee>);
		const track = container.querySelector('.dafink-marquee-track') as HTMLElement;
		expect(track.getAttribute('style')).toContain('20s');
	});

	it('accepts a custom duration in seconds', () =>
	{
		const { container } = render(<Marquee duration={45}>Content</Marquee>);
		const track = container.querySelector('.dafink-marquee-track') as HTMLElement;
		expect(track.getAttribute('style')).toContain('45s');
	});

	it('reverses the animation direction when direction is right', () =>
	{
		const { container } = render(<Marquee direction='right'>Content</Marquee>);
		expect(container.querySelector('.dafink-marquee-reverse')).not.toBeNull();
	});

	it('enables pause-on-hover by default', () =>
	{
		const { container } = render(<Marquee>Content</Marquee>);
		expect(container.querySelector('.dafink-marquee-pausable')).not.toBeNull();
	});

	it('omits the pause-on-hover class when disabled', () =>
	{
		const { container } = render(<Marquee pauseOnHover={false}>Content</Marquee>);
		expect(container.querySelector('.dafink-marquee-pausable')).toBeNull();
	});

	it('applies the gap prop as the track gap in pixels', () =>
	{
		const { container } = render(<Marquee gap={32}>Content</Marquee>);
		const track = container.querySelector('.dafink-marquee-track') as HTMLElement;
		expect(track.style.gap).toBe('32px');
	});

	it('disables the loop animation under prefers-reduced-motion and hides the duplicate copy', () =>
	{
		const { container } = render(<Marquee>Content</Marquee>);
		const css = container.querySelector('style')?.textContent ?? '';
		const reducedBlock = css.split('@media (prefers-reduced-motion: reduce)')[1];
		expect(reducedBlock).toBeDefined();
		expect(reducedBlock).toContain('animation: none');
		expect(reducedBlock).toContain('.dafink-marquee-copy--duplicate');
		expect(reducedBlock).toContain('display: none');
	});

	it('forwards className and native HTML attributes', () =>
	{
		const { container } = render(<Marquee className='extra-class' id='ticker'>Content</Marquee>);
		const root = container.querySelector('#ticker') as HTMLElement;
		expect(root).not.toBeNull();
		expect(root.className).toContain('extra-class');
	});
});
