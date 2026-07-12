'use client';

import { useEffect, useRef, useState, HTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CountUpProps extends HTMLAttributes<HTMLSpanElement> {
	/** Final value to count up to. */
	value:      number;
	/** Value the animation starts from. */
	start?:     number;
	/** Animation duration in milliseconds. */
	duration?:  number;
	/** Number of decimal places to render. */
	decimals?:  number;
	/** String prepended to the number (e.g. "$"). */
	prefix?:    string;
	/** String appended to the number (e.g. "%"). */
	suffix?:    string;
	/** Thousands separator (e.g. ","). */
	separator?: string;
	className?: string;
}

// ─── Internals ────────────────────────────────────────────────────────────────

/**
 * Cubic-bezier evaluator for the --ease-standard token curve:
 * cubic-bezier(0.2, 0, 0, 1). Mirrors `src/tokens/motion.ts`.
 */
const easeStandard = (t: number): number => {
	if (t <= 0) return 0;
	if (t >= 1) return 1;

	const x1 = 0.2, y1 = 0, x2 = 0, y2 = 1;
	const sampleX = (u: number) => 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u;
	const sampleY = (u: number) => 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u;

	// Solve for the bezier parameter u where x(u) = t, via bisection.
	let lo = 0, hi = 1, u = t;
	for (let i = 0; i < 24; i++) {
		const x = sampleX(u);
		if (Math.abs(x - t) < 1e-5) break;
		if (x < t) lo = u;
		else hi = u;
		u = (lo + hi) / 2;
	}
	return sampleY(u);
};

const formatValue = (
	value:     number,
	decimals:  number,
	prefix:    string,
	suffix:    string,
	separator: string
): string => {
	const fixed   = value.toFixed(decimals);
	const negative = fixed.startsWith('-');
	const [whole, fraction] = (negative ? fixed.slice(1) : fixed).split('.');
	const grouped = separator
		? whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
		: whole;
	const sign = negative ? '-' : '';
	return `${prefix}${sign}${grouped}${fraction ? `.${fraction}` : ''}${suffix}`;
};

// ─── CountUp ──────────────────────────────────────────────────────────────────

/**
 * Animates a number from `start` to `value` when scrolled into view.
 * The real final value is always present in the DOM for assistive tech
 * (visually hidden); the animated counter is purely visual (aria-hidden).
 * Renders the final value immediately under prefers-reduced-motion, without
 * JS, or when IntersectionObserver is unavailable.
 */
export const CountUp = (
	{
		value,
		start     = 0,
		duration  = 1000,
		decimals  = 0,
		prefix    = '',
		suffix    = '',
		separator = '',
		className = '',
		...props
	}: CountUpProps
) => {
	// Initial render (SSR / no JS) shows the real final value.
	const [display, setDisplay] = useState(value);
	const rootRef = useRef<HTMLSpanElement>(null);
	const rafRef  = useRef<number | null>(null);

	useEffect(() => {
		if (typeof IntersectionObserver === 'undefined') {
			// No observer available: skip the animation and show the real value.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setDisplay(value);
			return;
		}

		const reducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) {
			setDisplay(value);
			return;
		}

		const node = rootRef.current;
		if (!node) return;

		// Animation is available: rewind to the start value until visible.
		setDisplay(start);

		const animate = () => {
			const startTime = performance.now();
			const tick = (now: number) => {
				const progress = Math.min((now - startTime) / duration, 1);
				const eased    = easeStandard(progress);
				setDisplay(start + (value - start) * eased);
				if (progress < 1) {
					rafRef.current = requestAnimationFrame(tick);
				}
			};
			rafRef.current = requestAnimationFrame(tick);
		};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						animate();
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.5 }
		);

		observer.observe(node);

		return () => {
			observer.disconnect();
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [value, start, duration]);

	return (
		<span {...props} ref={rootRef} className={['tabular-nums', className].join(' ')}>
			<span aria-hidden='true'>
				{formatValue(display, decimals, prefix, suffix, separator)}
			</span>
			<span className='sr-only'>
				{formatValue(value, decimals, prefix, suffix, separator)}
			</span>
		</span>
	);
};

export default CountUp;
