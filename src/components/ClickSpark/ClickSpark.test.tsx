'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ClickSpark from './ClickSpark';

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

describe('ClickSpark', () =>
{
	it('renders children without errors', () =>
	{
		render(<ClickSpark><button>Click me</button></ClickSpark>);
		expect(screen.getByText('Click me')).toBeDefined();
	});

	it('forwards className and native HTML attributes to the wrapper', () =>
	{
		render(<ClickSpark className='extra-class' id='wrapper' data-testid='wrapper'>Go</ClickSpark>);
		const wrapper = screen.getByTestId('wrapper');
		expect(wrapper.className).toContain('extra-class');
		expect(wrapper.id).toBe('wrapper');
	});

	it('spawns sparkCount spark lines on click', () =>
	{
		render(<ClickSpark data-testid='wrapper'>Go</ClickSpark>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(document.querySelectorAll('.dafink-click-spark-line')).toHaveLength(8);
	});

	it('respects a custom sparkCount', () =>
	{
		render(<ClickSpark sparkCount={4} data-testid='wrapper'>Go</ClickSpark>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(document.querySelectorAll('.dafink-click-spark-line')).toHaveLength(4);
	});

	it('removes the burst after duration elapses', () =>
	{
		render(<ClickSpark duration={400} data-testid='wrapper'>Go</ClickSpark>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(document.querySelectorAll('.dafink-click-spark-line')).toHaveLength(8);

		act(() => { vi.advanceTimersByTime(400); });

		expect(document.querySelectorAll('.dafink-click-spark-line')).toHaveLength(0);
	});

	it('stacks two independent, overlapping bursts on rapid clicks', () =>
	{
		render(<ClickSpark data-testid='wrapper'>Go</ClickSpark>);
		const wrapper = screen.getByTestId('wrapper');

		fireEvent.click(wrapper, { clientX: 10, clientY: 10 });
		fireEvent.click(wrapper, { clientX: 40, clientY: 40 });

		expect(document.querySelectorAll('.dafink-click-spark-burst')).toHaveLength(2);
		expect(document.querySelectorAll('.dafink-click-spark-line')).toHaveLength(16);
	});

	it('spawns zero spark lines under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		render(<ClickSpark data-testid='wrapper'>Go</ClickSpark>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(document.querySelectorAll('.dafink-click-spark-line')).toHaveLength(0);
	});

	it('still calls a passed-in onClick under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		const onClick = vi.fn();
		render(<ClickSpark onClick={onClick} data-testid='wrapper'>Go</ClickSpark>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('calls a passed-in onClick when the wrapper is clicked', () =>
	{
		const onClick = vi.fn();
		render(<ClickSpark onClick={onClick} data-testid='wrapper'>Go</ClickSpark>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('marks each burst as aria-hidden since it is purely decorative', () =>
	{
		render(<ClickSpark data-testid='wrapper'>Go</ClickSpark>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		const burst = document.querySelector('.dafink-click-spark-burst');
		expect(burst?.getAttribute('aria-hidden')).toBe('true');
	});

	it('clears pending timeouts on unmount without leaking state updates', () =>
	{
		const { unmount } = render(<ClickSpark data-testid='wrapper'>Go</ClickSpark>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		unmount();
		expect(() => act(() => { vi.advanceTimersByTime(400); })).not.toThrow();
	});
});
