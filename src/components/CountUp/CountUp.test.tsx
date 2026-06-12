'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import CountUp from './CountUp';

class MockIntersectionObserver
{
	static instances: MockIntersectionObserver[] = [];

	callback:   IntersectionObserverCallback;
	elements:   Element[] = [];
	unobserve   = vi.fn();
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

/** rAF stub that completes the animation in a single synchronous frame. */
const stubInstantAnimationFrame = () =>
{
	vi.spyOn(performance, 'now').mockReturnValue(0);
	vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) =>
	{
		cb(1_000_000);
		return 1;
	}));
	vi.stubGlobal('cancelAnimationFrame', vi.fn());
};

const visibleText = (element: HTMLElement) =>
	element.querySelector('[aria-hidden="true"]')!.textContent;

beforeEach(() =>
{
	MockIntersectionObserver.instances = [];
	vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
	stubMatchMedia(false);
});

afterEach(() =>
{
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('CountUp', () =>
{
	it('renders without errors', () =>
	{
		render(<CountUp value={42} data-testid='count' />);
		expect(screen.getByTestId('count')).toBeDefined();
	});

	it('always renders the real final value for assistive tech', () =>
	{
		render(<CountUp value={42} data-testid='count' />);
		const srOnly = screen.getByTestId('count').querySelector('.sr-only');
		expect(srOnly?.textContent).toBe('42');
	});

	it('marks the animated counter as aria-hidden', () =>
	{
		render(<CountUp value={42} data-testid='count' />);
		expect(screen.getByTestId('count').querySelector('[aria-hidden="true"]')).not.toBeNull();
	});

	it('shows the start value while waiting to enter the viewport', () =>
	{
		render(<CountUp value={42} data-testid='count' />);
		expect(visibleText(screen.getByTestId('count'))).toBe('0');
	});

	it('respects a custom start value', () =>
	{
		render(<CountUp value={42} start={10} data-testid='count' />);
		expect(visibleText(screen.getByTestId('count'))).toBe('10');
	});

	it('animates to the final value when it enters the viewport', () =>
	{
		stubInstantAnimationFrame();
		render(<CountUp value={42} data-testid='count' />);
		MockIntersectionObserver.instances[0].trigger(true);
		expect(visibleText(screen.getByTestId('count'))).toBe('42');
	});

	it('stops observing after the animation starts', () =>
	{
		stubInstantAnimationFrame();
		render(<CountUp value={42} data-testid='count' />);
		const observer = MockIntersectionObserver.instances[0];
		observer.trigger(true);
		expect(observer.unobserve).toHaveBeenCalled();
	});

	it('renders the final value immediately under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		render(<CountUp value={42} data-testid='count' />);
		expect(visibleText(screen.getByTestId('count'))).toBe('42');
		expect(MockIntersectionObserver.instances).toHaveLength(0);
	});

	it('renders the final value when IntersectionObserver is unavailable', () =>
	{
		vi.stubGlobal('IntersectionObserver', undefined);
		render(<CountUp value={42} data-testid='count' />);
		expect(visibleText(screen.getByTestId('count'))).toBe('42');
	});

	it('formats with decimals, separator, prefix, and suffix', () =>
	{
		stubMatchMedia(true);
		render(
			<CountUp
				value={1234567.891}
				decimals={2}
				separator=','
				prefix='$'
				suffix=' USD'
				data-testid='count'
			/>
		);
		expect(visibleText(screen.getByTestId('count'))).toBe('$1,234,567.89 USD');
	});

	it('formats negative values with the sign before the prefix digits', () =>
	{
		stubMatchMedia(true);
		render(<CountUp value={-1234} separator=',' data-testid='count' />);
		expect(visibleText(screen.getByTestId('count'))).toBe('-1,234');
	});

	it('keeps the screen reader value in sync with formatting props', () =>
	{
		render(<CountUp value={99.5} decimals={1} suffix='%' data-testid='count' />);
		const srOnly = screen.getByTestId('count').querySelector('.sr-only');
		expect(srOnly?.textContent).toBe('99.5%');
	});

	it('forwards className and native HTML attributes', () =>
	{
		render(<CountUp value={1} className='extra-class' id='stat' data-testid='count' />);
		const root = screen.getByTestId('count');
		expect(root.className).toContain('extra-class');
		expect(root.className).toContain('tabular-nums');
		expect(root.id).toBe('stat');
	});
});
