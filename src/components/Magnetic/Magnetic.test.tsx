'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Magnetic from './Magnetic';

const FIXED_RECT = {
	left:   0,
	top:    0,
	width:  200,
	height: 200,
	right:  200,
	bottom: 200,
	x:      0,
	y:      0,
	toJSON: () => {},
} as DOMRect;

const getInner = (root: HTMLElement) => root.firstElementChild as HTMLElement;

const stubMatchMedia = (matches: boolean) =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
};

describe('Magnetic', () =>
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
		render(<Magnetic><button>Click me</button></Magnetic>);
		expect(screen.getByText('Click me')).toBeDefined();
	});

	it('forwards className and native HTML attributes to the wrapper', () =>
	{
		render(<Magnetic className='extra-class' id='magnet' data-testid='wrapper'><button>Go</button></Magnetic>);
		const wrapper = screen.getByTestId('wrapper');
		expect(wrapper.className).toContain('extra-class');
		expect(wrapper.id).toBe('magnet');
	});

	it('translates the inner wrapper toward the cursor within range', () =>
	{
		render(<Magnetic data-testid='wrapper'><button>Go</button></Magnetic>);
		const wrapper = screen.getByTestId('wrapper');
		const inner   = getInner(wrapper);

		fireEvent.pointerMove(wrapper, { clientX: 110, clientY: 100 });

		expect(inner.style.transform).not.toBe('translate(0px, 0px)');
		expect(inner.style.transform).toContain('translate(');
	});

	it('resets the inner wrapper to rest on pointer leave', () =>
	{
		render(<Magnetic data-testid='wrapper'><button>Go</button></Magnetic>);
		const wrapper = screen.getByTestId('wrapper');
		const inner   = getInner(wrapper);

		fireEvent.pointerMove(wrapper, { clientX: 110, clientY: 100 });
		fireEvent.pointerLeave(wrapper);

		expect(inner.style.transform).toBe('translate(0px, 0px)');
	});

	it('does not apply any offset when the pointer is beyond range', () =>
	{
		render(<Magnetic range={80} data-testid='wrapper'><button>Go</button></Magnetic>);
		const wrapper = screen.getByTestId('wrapper');
		const inner   = getInner(wrapper);

		fireEvent.pointerMove(wrapper, { clientX: 300, clientY: 300 });

		expect(inner.style.transform).toBe('translate(0px, 0px)');
	});

	it('never translates under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		render(<Magnetic data-testid='wrapper'><button>Go</button></Magnetic>);
		const wrapper = screen.getByTestId('wrapper');
		const inner   = getInner(wrapper);

		fireEvent.pointerMove(wrapper, { clientX: 110, clientY: 100 });

		expect(inner.style.transform).toBe('translate(0px, 0px)');
	});
});
