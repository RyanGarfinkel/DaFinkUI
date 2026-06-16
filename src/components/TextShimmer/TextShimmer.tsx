'use client';

import { HTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextShimmerProps extends HTMLAttributes<HTMLSpanElement> {
	/** Duration of one shimmer sweep in milliseconds. Defaults to 8× --duration-slow (2400ms). */
	duration?:  number;
	children:   React.ReactNode;
	className?: string;
}

// ─── TextShimmer ──────────────────────────────────────────────────────────────

/**
 * Text with a looping gradient shimmer (background-clip: text). The gradient
 * base is --color-text and the sweeping highlight is --color-text-muted, so
 * the text never drops below AA contrast. Under prefers-reduced-motion the
 * shimmer is removed entirely and the text renders as static --color-text.
 */
export const TextShimmer = (
	{
		duration,
		children,
		className = '',
		style,
		...props
	}: TextShimmerProps
) => {
	const durationValue = duration !== undefined
		? `${duration}ms`
		: 'calc(var(--duration-slow) * 8)';

	return (
		<>
			<style>{`
				@keyframes dafink-text-shimmer {
					from { background-position: 200% center; }
					to   { background-position: -200% center; }
				}
				.dafink-text-shimmer {
					background-image: linear-gradient(
						110deg,
						var(--color-text) 35%,
						var(--color-text-muted) 50%,
						var(--color-text) 65%
					);
					background-size: 200% auto;
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					color: var(--color-text);
					animation: dafink-text-shimmer var(--shimmer-duration) var(--ease-standard) infinite;
				}
				@media (prefers-reduced-motion: reduce) {
					.dafink-text-shimmer {
						animation: none;
						background-image: none;
						-webkit-text-fill-color: currentColor;
					}
				}
			`}</style>
			<span
				{...props}
				className={['dafink-text-shimmer inline-block', className].join(' ')}
				style={{ ['--shimmer-duration' as string]: durationValue, ...style } as React.CSSProperties}
			>
				{children}
			</span>
		</>
	);
};

export default TextShimmer;
