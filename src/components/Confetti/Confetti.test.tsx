'use client';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Confetti from './Confetti';

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

describe('Confetti', () =>
{
	it('renders children without errors', () =>
	{
		render(<Confetti><button>Celebrate</button></Confetti>);
		expect(screen.getByText('Celebrate')).toBeDefined();
	});

	it('forwards className and native HTML attributes to the wrapper', () =>
	{
		render(<Confetti className='extra-class' id='wrapper' data-testid='wrapper'>Go</Confetti>);
		const wrapper = screen.getByTestId('wrapper');
		expect(wrapper.className).toContain('extra-class');
		expect(wrapper.id).toBe('wrapper');
	});

	it('spawns particleCount confetti pieces on click', () =>
	{
		render(<Confetti data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(document.querySelectorAll('.dafink-confetti-piece')).toHaveLength(60);
	});

	it('respects a custom particleCount', () =>
	{
		render(<Confetti particleCount={12} data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(document.querySelectorAll('.dafink-confetti-piece')).toHaveLength(12);
	});

	it('removes the burst after duration elapses', () =>
	{
		render(<Confetti duration={1500} data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(document.querySelectorAll('.dafink-confetti-piece')).toHaveLength(60);

		act(() => { vi.advanceTimersByTime(1500); });

		expect(document.querySelectorAll('.dafink-confetti-piece')).toHaveLength(0);
	});

	it('stacks two independent, overlapping bursts on rapid clicks', () =>
	{
		render(<Confetti particleCount={10} data-testid='wrapper'>Go</Confetti>);
		const wrapper = screen.getByTestId('wrapper');

		fireEvent.click(wrapper, { clientX: 10, clientY: 10 });
		fireEvent.click(wrapper, { clientX: 40, clientY: 40 });

		expect(document.querySelectorAll('.dafink-confetti-burst')).toHaveLength(2);
		expect(document.querySelectorAll('.dafink-confetti-piece')).toHaveLength(20);
	});

	it('spawns zero confetti pieces under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		render(<Confetti data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(document.querySelectorAll('.dafink-confetti-piece')).toHaveLength(0);
	});

	it('still calls a passed-in onClick under prefers-reduced-motion', () =>
	{
		stubMatchMedia(true);
		const onClick = vi.fn();
		render(<Confetti onClick={onClick} data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('calls a passed-in onClick when the wrapper is clicked', () =>
	{
		const onClick = vi.fn();
		render(<Confetti onClick={onClick} data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('marks each burst as aria-hidden since it is purely decorative', () =>
	{
		render(<Confetti data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		const burst = document.querySelector('.dafink-confetti-burst');
		expect(burst?.getAttribute('aria-hidden')).toBe('true');
	});

	it('assigns each piece a color from the colors prop', () =>
	{
		render(<Confetti colors={['#123456']} particleCount={3} data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		const pieces = document.querySelectorAll('.dafink-confetti-piece');
		pieces.forEach((piece) => {
			expect((piece as HTMLElement).style.backgroundColor).toBe('rgb(18, 52, 86)');
		});
	});

	it('clears pending timeouts on unmount without leaking state updates', () =>
	{
		const { unmount } = render(<Confetti data-testid='wrapper'>Go</Confetti>);
		fireEvent.click(screen.getByTestId('wrapper'), { clientX: 20, clientY: 30 });
		unmount();
		expect(() => act(() => { vi.advanceTimersByTime(1500); })).not.toThrow();
	});
});
