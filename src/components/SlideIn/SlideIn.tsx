'use client';

import { useEffect, useRef, useState, HTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SlideInDirection = 'left' | 'right' | 'bottom';

export interface SlideInProps extends HTMLAttributes<HTMLDivElement> {
	/** Which edge the element jumps in from when scrolled into view. Defaults to 'bottom'. */
	direction?: SlideInDirection;
	/** Pixel distance of the jump. Defaults to 24 (small, not a big travel). */
	distance?:  number;
	/** Reveal only the first time the element enters the viewport. Defaults to true. */
	once?:      boolean;
	children?:  React.ReactNode;
	className?: string;
}

// ─── Internals ────────────────────────────────────────────────────────────────

const hiddenTransform = (direction: SlideInDirection, distance: number): string => {
	if(direction === 'left')  return `translateX(-${distance}px)`;
	if(direction === 'right') return `translateX(${distance}px)`;
	return `translateY(${distance}px)`;
};

type SlideInStatus = 'idle' | 'hidden' | 'shown';

// ─── SlideIn ──────────────────────────────────────────────────────────────────

/**
 * A small, fixed-distance jump-and-fade entrance triggered by
 * IntersectionObserver, from the left, right, or bottom edge. Progressive
 * enhancement: content renders fully visible (`idle`) on the server, without
 * JS, when IntersectionObserver is unavailable, and under
 * prefers-reduced-motion; it is only hidden once the observer is confirmed
 * running, so it can never get stuck invisible.
 */
export const SlideIn = (
	{
		direction = 'bottom',
		distance  = 24,
		once      = true,
		children,
		className = '',
		style,
		...props
	}: SlideInProps
) => {
	const [status, setStatus] = useState<SlideInStatus>('idle');
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const node = ref.current;
		if(!node || typeof IntersectionObserver === 'undefined') return;

		const reducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if(reducedMotion) return;

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setStatus('hidden');

		const observer = new IntersectionObserver(
			(entries) => {
				for(const entry of entries)
				{
					if(entry.isIntersecting)
					{
						setStatus('shown');
						if(once) observer.unobserve(entry.target);
					}
					else if(!once)
					{
						setStatus('hidden');
					}
				}
			},
			{ threshold: 0.15 }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [once]);

	return (
		<div
			{...props}
			ref={ref}
			className={['transition-all', className].filter(Boolean).join(' ')}
			style={{
				opacity:                  status === 'hidden' ? 0 : 1,
				transform:                status === 'hidden' ? hiddenTransform(direction, distance) : 'translate(0, 0)',
				transitionDuration:       'var(--duration-slow)',
				transitionTimingFunction: 'var(--ease-enter)',
				...style,
			}}
		>
			{children}
		</div>
	);
};

export default SlideIn;
