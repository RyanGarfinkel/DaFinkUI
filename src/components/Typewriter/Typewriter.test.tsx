'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Typewriter from './Typewriter';

const stubMatchMedia = (matches: boolean) =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
};

beforeEach(() =>
{
	stubMatchMedia(false);
	vi.useFakeTimers();
});

afterEach(() =>
{
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe('Typewriter', () =>
{
	it('renders no visible characters before any interval fires', () =>
	{
		render(<Typewriter text='Hello' data-testid='tw' />);
		const visible = screen.getByTestId('tw').querySelector('[aria-hidden="true"]');
		expect(visible?.textContent?.replace(/​/g, '').trim()).toBe('');
	});

	it('reveals the full text after all intervals fire', () =>
	{
		render(<Typewriter text='Hello' speed={50} data-testid='tw' />);

		act(() =>
		{
			vi.advanceTimersByTime(50 * 5);
		});

		const visible = screen.getByTestId('tw').querySelector('[aria-hidden="true"]');
		expect(visible?.textContent).toContain('Hello');
	});

	it('sets aria-label to the full text immediately', () =>
	{
		render(<Typewriter text='Hello world' data-testid='tw' />);
		expect(screen.getByTestId('tw').getAttribute('aria-label')).toBe('Hello world');
	});

	it('calls onComplete when typing finishes', () =>
	{
		const onComplete = vi.fn();
		render(<Typewriter text='Hi' speed={50} onComplete={onComplete} />);

		act(() =>
		{
			vi.advanceTimersByTime(50 * 2);
		});

		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it('reveals the full text immediately under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		render(<Typewriter text='Hello' data-testid='tw' />);

		act(() => { vi.runAllTimers(); });

		const visible = screen.getByTestId('tw').querySelector('[aria-hidden="true"]');
		expect(visible?.textContent).toContain('Hello');
	});

	it('respects delay before starting to type', () =>
	{
		render(<Typewriter text='Hi' speed={50} delay={200} data-testid='tw' />);

		act(() =>
		{
			vi.advanceTimersByTime(100);
		});

		const visible = screen.getByTestId('tw').querySelector('[aria-hidden="true"]');
		expect(visible?.textContent?.replace(/​/g, '').trim()).toBe('');

		act(() =>
		{
			vi.advanceTimersByTime(200 + 50 * 2);
		});

		expect(visible?.textContent).toContain('Hi');
	});

	it('injects cursor CSS into the document', () =>
	{
		const { container } = render(<Typewriter text='Hello' />);
		const css = container.querySelector('style')?.textContent ?? '';
		expect(css).toContain('obi-cursor-blink');
		expect(css).toContain('obi-cursor');
	});

	it('forwards className and native HTML attributes', () =>
	{
		render(<Typewriter text='Hello' className='extra-class' id='tw-id' data-testid='tw' />);
		const root = screen.getByTestId('tw');
		expect(root.className).toContain('extra-class');
		expect(root.id).toBe('tw-id');
	});
});
