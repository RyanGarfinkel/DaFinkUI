import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Tilt from './Tilt';

const FIXED_RECT = {
	left: 0,
	top: 0,
	width: 200,
	height: 200,
	right: 200,
	bottom: 200,
	x: 0,
	y: 0,
	toJSON: () => {},
} as DOMRect;

describe('Tilt', () =>
{
	beforeEach(() =>
	{
		Element.prototype.getBoundingClientRect = () => FIXED_RECT;
	});

	it('renders children', () =>
	{
		render(<Tilt><span>hello</span></Tilt>);
		expect(screen.getByText('hello')).toBeDefined();
	});

	it('renders a single div wrapper', () =>
	{
		const { container } = render(<Tilt><span>content</span></Tilt>);
		expect(container.firstChild?.nodeName).toBe('DIV');
		expect(container.children.length).toBe(1);
	});

	it('applies className to the wrapper div', () =>
	{
		const { container } = render(<Tilt className='my-class'>content</Tilt>);
		const el = container.firstChild as HTMLElement;
		expect(el.className).toContain('my-class');
	});

	it('applies transform on mousemove', () =>
	{
		const { container } = render(<Tilt>content</Tilt>);
		const el = container.firstChild as HTMLElement;

		fireEvent.mouseMove(el, { clientX: 150, clientY: 50 });

		expect(el.style.transform).toContain('perspective(');
		expect(el.style.transform).toContain('rotateX(');
		expect(el.style.transform).toContain('rotateY(');
		expect(el.style.transform).toContain('scale3d(');
	});

	it('resets transform on mouseleave', () =>
	{
		const { container } = render(<Tilt>content</Tilt>);
		const el = container.firstChild as HTMLElement;

		fireEvent.mouseMove(el, { clientX: 150, clientY: 50 });
		fireEvent.mouseLeave(el);

		expect(el.style.transform).toContain('rotateX(0deg)');
		expect(el.style.transform).toContain('rotateY(0deg)');
		expect(el.style.transform).toContain('scale3d(1, 1, 1)');
	});
});
