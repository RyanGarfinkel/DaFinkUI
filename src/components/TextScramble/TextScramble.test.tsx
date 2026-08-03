'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import TextScramble from './TextScramble';

let rafCallbacks: FrameRequestCallback[] = [];

const stubRaf = () =>
{
	rafCallbacks = [];
	vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) =>
	{
		rafCallbacks.push(callback);
		return rafCallbacks.length;
	}));
	vi.stubGlobal('cancelAnimationFrame', vi.fn());
};

const flushFrame = (now: number) =>
{
	const callbacks = rafCallbacks;
	rafCallbacks = [];
	act(() =>
	{
		callbacks.forEach((callback) => callback(now));
	});
};

const stubMatchMedia = (matches: boolean) =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
};

const visibleText = (element: HTMLElement) =>
	element.querySelector('[aria-hidden="true"]')!.textContent;

beforeEach(() =>
{
	stubMatchMedia(false);
	stubRaf();
	vi.spyOn(performance, 'now').mockReturnValue(0);
});

afterEach(() =>
{
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('TextScramble', () =>
{
	it('renders without errors', () =>
	{
		render(<TextScramble text='Hello' data-testid='scramble' />);
		expect(screen.getByTestId('scramble')).toBeDefined();
	});

	it('forwards className and native HTML attributes', () =>
	{
		render(<TextScramble text='Hello' className='extra-class' id='hero' data-testid='scramble' />);
		const root = screen.getByTestId('scramble');
		expect(root.className).toContain('extra-class');
		expect(root.id).toBe('hero');
	});

	it('sets aria-label to the final text before animation starts', () =>
	{
		render(<TextScramble text='Hello world' data-testid='scramble' />);
		expect(screen.getByTestId('scramble').getAttribute('aria-label')).toBe('Hello world');
	});

	it('keeps aria-label equal to the final text mid-animation', () =>
	{
		render(<TextScramble text='Hello world' duration={100} data-testid='scramble' />);
		flushFrame(50);
		expect(screen.getByTestId('scramble').getAttribute('aria-label')).toBe('Hello world');
	});

	it('settles to exactly the final text once the full duration elapses', () =>
	{
		render(<TextScramble text='Hello' duration={100} data-testid='scramble' />);
		flushFrame(50);
		flushFrame(100);
		expect(visibleText(screen.getByTestId('scramble'))).toBe('Hello');
	});

	it('never replaces a space character with a scramble character', () =>
	{
		render(<TextScramble text='Hi There' duration={1000} data-testid='scramble' />);
		flushFrame(100);
		const displayed = visibleText(screen.getByTestId('scramble'));
		expect(displayed?.[2]).toBe(' ');
	});

	it('renders the final text immediately under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		render(<TextScramble text='Hello' data-testid='scramble' />);
		expect(visibleText(screen.getByTestId('scramble'))).toBe('Hello');
		expect(rafCallbacks).toHaveLength(0);
	});

	it('marks the animated glyphs as aria-hidden', () =>
	{
		render(<TextScramble text='Hello' data-testid='scramble' />);
		expect(screen.getByTestId('scramble').querySelector('[aria-hidden="true"]')).not.toBeNull();
	});
});
