'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SlideIn from './SlideIn';

class MockIntersectionObserver
{
	static instances: MockIntersectionObserver[] = [];

	callback:   IntersectionObserverCallback;
	elements:   Element[] = [];
	unobserve   = vi.fn((element: Element) =>
	{
		this.elements = this.elements.filter((el) => el !== element);
	});
	disconnect  = vi.fn();

	constructor(callback: IntersectionObserverCallback)
	{
		this.callback = callback;
		MockIntersectionObserver.instances.push(this);
	}

	observe(element: Element)
	{
		this.elements.push(element);
	}

	trigger(isIntersecting: boolean)
	{
		const entries = this.elements.map((element) => ({
			isIntersecting,
			target: element,
		})) as IntersectionObserverEntry[];
		act(() =>
		{
			this.callback(entries, this as unknown as IntersectionObserver);
		});
	}
}

const stubMatchMedia = (matches: boolean) =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
		matches,
		addEventListener:    vi.fn(),
		removeEventListener: vi.fn(),
	}));
};

beforeEach(() =>
{
	MockIntersectionObserver.instances = [];
	vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
	stubMatchMedia(false);
});

afterEach(() =>
{
	vi.unstubAllGlobals();
});

describe('SlideIn', () =>
{
	it('renders children without errors', () =>
	{
		render(<SlideIn>Hello</SlideIn>);
		expect(screen.getByText('Hello')).toBeDefined();
	});

	it('stays visible when IntersectionObserver is unavailable', () =>
	{
		vi.stubGlobal('IntersectionObserver', undefined);
		render(<SlideIn data-testid='slide-in'>Content</SlideIn>);
		expect(screen.getByTestId('slide-in').style.opacity).toBe('1');
	});

	it('stays visible and never observes under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		render(<SlideIn data-testid='slide-in'>Content</SlideIn>);
		expect(screen.getByTestId('slide-in').style.opacity).toBe('1');
		expect(MockIntersectionObserver.instances).toHaveLength(0);
	});

	it('hides content once the observer is confirmed running', () =>
	{
		render(<SlideIn data-testid='slide-in'>Content</SlideIn>);
		expect(screen.getByTestId('slide-in').style.opacity).toBe('0');
	});

	it('reveals content when it intersects the viewport', () =>
	{
		render(<SlideIn data-testid='slide-in'>Content</SlideIn>);
		MockIntersectionObserver.instances[0].trigger(true);
		const style = screen.getByTestId('slide-in').style;
		expect(style.opacity).toBe('1');
		expect(style.transform).toBe('translate(0, 0)');
	});

	it('unobserves after revealing when once is true (default)', () =>
	{
		render(<SlideIn data-testid='slide-in'>Content</SlideIn>);
		const observer = MockIntersectionObserver.instances[0];
		observer.trigger(true);
		expect(observer.unobserve).toHaveBeenCalled();
	});

	it('re-hides when leaving the viewport if once is false', () =>
	{
		render(<SlideIn once={false} data-testid='slide-in'>Content</SlideIn>);
		const observer = MockIntersectionObserver.instances[0];
		observer.trigger(true);
		expect(screen.getByTestId('slide-in').style.opacity).toBe('1');
		observer.trigger(false);
		expect(screen.getByTestId('slide-in').style.opacity).toBe('0');
		expect(observer.unobserve).not.toHaveBeenCalled();
	});

	it('applies the hidden transform for each direction', () =>
	{
		const cases = [
			{ direction: 'left',   expected: 'translateX(-24px)' },
			{ direction: 'right',  expected: 'translateX(24px)'  },
			{ direction: 'bottom', expected: 'translateY(24px)'  },
		] as const;

		for(const { direction, expected } of cases)
		{
			const { unmount } = render(<SlideIn direction={direction} data-testid={`slide-in-${direction}`}>X</SlideIn>);
			expect(screen.getByTestId(`slide-in-${direction}`).style.transform).toBe(expected);
			unmount();
		}
	});

	it('scales the jump distance with the distance prop', () =>
	{
		render(<SlideIn direction='right' distance={64} data-testid='slide-in'>Content</SlideIn>);
		expect(screen.getByTestId('slide-in').style.transform).toBe('translateX(64px)');
	});

	it('uses motion tokens for duration and easing', () =>
	{
		render(<SlideIn data-testid='slide-in'>Content</SlideIn>);
		const style = screen.getByTestId('slide-in').style;
		expect(style.transitionDuration).toBe('var(--duration-slow)');
		expect(style.transitionTimingFunction).toBe('var(--ease-enter)');
	});

	it('forwards className and native HTML attributes', () =>
	{
		render(<SlideIn className='extra-class' id='my-slide-in' data-testid='slide-in'>Content</SlideIn>);
		const root = screen.getByTestId('slide-in');
		expect(root.className).toContain('extra-class');
		expect(root.id).toBe('my-slide-in');
	});
});
