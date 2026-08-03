'use client';

import { HTMLAttributes, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParticlesProps extends HTMLAttributes<HTMLDivElement> {
	/** Number of floating dots to render. Defaults to 30. */
	quantity?:  number;
	children?:  React.ReactNode;
	className?: string;
}

interface Dot {
	x:        number;
	y:        number;
	size:     number;
	delay:    number;
	duration: number;
}

// ─── Internals ────────────────────────────────────────────────────────────────

const mulberry32 = (seed: number) => {
	return () => {
		seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const SEED = 42;

const createDots = (quantity: number): Dot[] => {
	const random = mulberry32(SEED);

	return Array.from({ length: quantity }, () => ({
		x:        random() * 100,
		y:        random() * 100,
		size:     2 + random() * 3,
		delay:    random() * 4000,
		duration: 4000 + random() * 4000,
	}));
};

// ─── Particles ────────────────────────────────────────────────────────────────

/**
 * A purely decorative ambient background of small floating dots, gently
 * drifting and pulsing opacity, meant to sit behind real content. Dot
 * positions are derived from a deterministic seeded PRNG (mulberry32) rather
 * than Math.random(), so server and client render the identical dot field
 * and never hydration-mismatch.
 */
export const Particles = (
	{
		quantity = 30,
		children,
		className = '',
		style,
		...props
	}: ParticlesProps
) => {
	const dots = useMemo(() => createDots(quantity), [quantity]);

	return (
		<>
			<style>{`
				@keyframes dafink-particles-drift {
					0%   { transform: translateY(0); opacity: 0.2; }
					50%  { transform: translateY(-8px); opacity: 0.8; }
					100% { transform: translateY(0); opacity: 0.2; }
				}
				.dafink-particles-dot {
					position: absolute;
					border-radius: 50%;
					background: var(--color-text-subtle);
					animation: dafink-particles-drift var(--particle-duration) var(--ease-standard) infinite;
					animation-delay: var(--particle-delay);
				}
				@media (prefers-reduced-motion: reduce) {
					.dafink-particles-dot {
						animation: none;
						opacity: 0.5;
					}
				}
			`}</style>
			<div
				{...props}
				className={['relative overflow-hidden', className].join(' ')}
				style={style}
			>
				<div aria-hidden='true' className='absolute inset-0'>
					{dots.map((dot, index) => (
						<span
							key={index}
							className='dafink-particles-dot'
							style={{
								left:                          `${dot.x}%`,
								top:                           `${dot.y}%`,
								width:                         `${dot.size}px`,
								height:                        `${dot.size}px`,
								['--particle-duration' as string]: `${dot.duration}ms`,
								['--particle-delay' as string]:    `${dot.delay}ms`,
							} as React.CSSProperties}
						/>
					))}
				</div>
				{children && (
					<div className='relative z-[1]'>
						{children}
					</div>
				)}
			</div>
		</>
	);
};

export default Particles;
