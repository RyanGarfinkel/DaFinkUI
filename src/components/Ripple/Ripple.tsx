'use client';

import { HTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RippleProps extends HTMLAttributes<HTMLDivElement> {
	/** Number of concentric rings. Defaults to 4. */
	count?:     number;
	/** Milliseconds for one ring's full expand-and-fade cycle. Defaults to 3000. */
	duration?:  number;
	children?:  React.ReactNode;
	className?: string;
}

// ─── Ripple ───────────────────────────────────────────────────────────────────

/**
 * Decorative concentric rings expanding outward and fading out, staggered so
 * multiple rings are visible at different stages at once. Typically wraps a
 * logo or icon passed as `children`. Purely presentational: the rings
 * container is aria-hidden, and under prefers-reduced-motion the rings are
 * hidden entirely rather than frozen mid-animation.
 */
export const Ripple = (
	{
		count     = 4,
		duration  = 3000,
		children,
		className = '',
		style,
		...props
	}: RippleProps
) => {
	const durationValue = `${duration}ms`;
	const rings = Array.from({ length: count });

	return (
		<>
			<style>{`
				@keyframes dafink-ripple-expand {
					from {
						transform: translate(-50%, -50%) scale(0.25);
						opacity: 0.6;
					}
					to {
						transform: translate(-50%, -50%) scale(1.5);
						opacity: 0;
					}
				}
				.dafink-ripple-ring {
					position: absolute;
					top: 50%;
					left: 50%;
					width: 100%;
					height: 100%;
					border-radius: 50%;
					border: 1px solid var(--color-brand);
					animation: dafink-ripple-expand var(--ripple-duration) var(--ease-standard) infinite;
				}
				@media (prefers-reduced-motion: reduce) {
					.dafink-ripple-rings {
						display: none;
					}
				}
			`}</style>
			<div
				{...props}
				className={['relative isolate inline-flex items-center justify-center', className].join(' ')}
				style={{ ...style }}
			>
				<div className='dafink-ripple-rings pointer-events-none absolute inset-0' aria-hidden='true'>
					{rings.map((_, index) => (
						<span
							key={index}
							className='dafink-ripple-ring'
							style={{
								['--ripple-duration' as string]: durationValue,
								animationDelay: `${(duration / count) * index}ms`,
							} as React.CSSProperties}
						/>
					))}
				</div>
				{children ? <span className='relative z-10'>{children}</span> : null}
			</div>
		</>
	);
};

export default Ripple;
