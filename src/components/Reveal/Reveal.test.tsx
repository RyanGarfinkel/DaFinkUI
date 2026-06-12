'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Reveal, { RevealGroup } from './Reveal';

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

describe('Reveal', () =>
{
	it('renders children without errors', () =>
	{
		render(<Reveal>Hello</Reveal>);
		expect(screen.getByText('Hello')).toBeDefined();
	});

	it('stays visible when IntersectionObserver is unavailable', () =>
	{
		vi.stubGlobal('IntersectionObserver', undefined);
		render(<Reveal data-testid='reveal'>Content</Reveal>);
		expect(screen.getByTestId('reveal').className).not.toContain('opacity-0');
	});

	it('stays visible and never observes under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		render(<Reveal data-testid='reveal'>Content</Reveal>);
		expect(screen.getByTestId('reveal').className).not.toContain('opacity-0');
		expect(MockIntersectionObserver.instances).toHaveLength(0);
	});

	it('hides content once the observer is confirmed running', () =>
	{
		render(<Reveal data-testid='reveal'>Content</Reveal>);
		expect(screen.getByTestId('reveal').className).toContain('opacity-0');
	});

	it('reveals content when it intersects the viewport', () =>
	{
		render(<Reveal data-testid='reveal'>Content</Reveal>);
		MockIntersectionObserver.instances[0].trigger(true);
		const className = screen.getByTestId('reveal').className;
		expect(className).toContain('opacity-100');
		expect(className).not.toContain('opacity-0');
	});

	it('unobserves after revealing when once is true (default)', () =>
	{
		render(<Reveal data-testid='reveal'>Content</Reveal>);
		const observer = MockIntersectionObserver.instances[0];
		observer.trigger(true);
		expect(observer.unobserve).toHaveBeenCalled();
	});

	it('re-hides when leaving the viewport if once is false', () =>
	{
		render(<Reveal once={false} data-testid='reveal'>Content</Reveal>);
		const observer = MockIntersectionObserver.instances[0];
		observer.trigger(true);
		expect(screen.getByTestId('reveal').className).toContain('opacity-100');
		observer.trigger(false);
		expect(screen.getByTestId('reveal').className).toContain('opacity-0');
		expect(observer.unobserve).not.toHaveBeenCalled();
	});

	it('applies the hidden classes for each effect', () =>
	{
		const cases = [
			{ effect: 'fade',        expected: 'opacity-0'    },
			{ effect: 'slide-up',    expected: 'translate-y-4'  },
			{ effect: 'slide-left',  expected: 'translate-x-4'  },
			{ effect: 'slide-right', expected: '-translate-x-4' },
			{ effect: 'scale',       expected: 'scale-95'       },
		] as const;

		for (const { effect, expected } of cases)
		{
			const { unmount } = render(<Reveal effect={effect} data-testid={`reveal-${effect}`}>X</Reveal>);
			expect(screen.getByTestId(`reveal-${effect}`).className).toContain(expected);
			unmount();
		}
	});

	it('uses motion tokens for duration and easing', () =>
	{
		render(<Reveal data-testid='reveal'>Content</Reveal>);
		const style = screen.getByTestId('reveal').style;
		expect(style.transitionDuration).toBe('var(--duration-slow)');
		expect(style.transitionTimingFunction).toBe('var(--ease-enter)');
	});

	it('applies the delay prop as a transition delay', () =>
	{
		render(<Reveal delay={250} data-testid='reveal'>Content</Reveal>);
		expect(screen.getByTestId('reveal').style.transitionDelay).toBe('250ms');
	});

	it('forwards className and native HTML attributes', () =>
	{
		render(<Reveal className='extra-class' id='my-reveal' data-testid='reveal'>Content</Reveal>);
		const root = screen.getByTestId('reveal');
		expect(root.className).toContain('extra-class');
		expect(root.id).toBe('my-reveal');
	});
});

describe('RevealGroup', () =>
{
	it('cascades staggered delays onto child Reveal items', () =>
	{
		render(
			<RevealGroup stagger={100}>
				<Reveal data-testid='item-0'>One</Reveal>
				<Reveal data-testid='item-1'>Two</Reveal>
				<Reveal data-testid='item-2'>Three</Reveal>
			</RevealGroup>
		);
		expect(screen.getByTestId('item-0').style.transitionDelay).toBe('0ms');
		expect(screen.getByTestId('item-1').style.transitionDelay).toBe('100ms');
		expect(screen.getByTestId('item-2').style.transitionDelay).toBe('200ms');
	});

	it('adds the base delay to the stagger cascade', () =>
	{
		render(
			<RevealGroup stagger={50} delay={200}>
				<Reveal data-testid='item-0'>One</Reveal>
				<Reveal data-testid='item-1'>Two</Reveal>
			</RevealGroup>
		);
		expect(screen.getByTestId('item-0').style.transitionDelay).toBe('200ms');
		expect(screen.getByTestId('item-1').style.transitionDelay).toBe('250ms');
	});

	it('respects an explicit delay set on a child', () =>
	{
		render(
			<RevealGroup stagger={100}>
				<Reveal data-testid='item-0'>One</Reveal>
				<Reveal delay={999} data-testid='item-1'>Two</Reveal>
			</RevealGroup>
		);
		expect(screen.getByTestId('item-1').style.transitionDelay).toBe('999ms');
	});

	it('passes a group-level effect to children without their own', () =>
	{
		render(
			<RevealGroup effect='slide-up'>
				<Reveal data-testid='item-0'>One</Reveal>
			</RevealGroup>
		);
		expect(screen.getByTestId('item-0').className).toContain('translate-y-4');
	});

	it('forwards className and HTML attributes on the wrapper', () =>
	{
		render(
			<RevealGroup className='extra-class' data-testid='group'>
				<Reveal>One</Reveal>
			</RevealGroup>
		);
		expect(screen.getByTestId('group').className).toContain('extra-class');
	});
});
