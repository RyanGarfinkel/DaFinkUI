'use client';

import { HTMLAttributes, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MeteorsProps extends HTMLAttributes<HTMLDivElement> {
	/** Number of meteor streaks rendered. Defaults to 10. */
	count?:     number;
	children?:  React.ReactNode;
	className?: string;
}

interface Meteor {
	left:     number;
	width:    number;
	height:   number;
	duration: number;
	delay:    number;
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

const SEED = 7;

const buildMeteors = (count: number): Meteor[] => {
	const random = mulberry32(SEED);

	return Array.from({ length: count }, () => ({
		left:     random() * 100,
		width:    1 + random() * 1.5,
		height:   50 + random() * 30,
		duration: 3 + random() * 4,
		delay:    random() * 8,
	}));
};

// ─── Meteors ──────────────────────────────────────────────────────────────────

/**
 * Purely decorative ambient background of diagonal "shooting star" streaks
 * that repeatedly fall across the container, staggered so several are
 * visible mid-flight at once. Positions/timings are derived from a seeded
 * PRNG (not Math.random) so the server-rendered and first client render
 * produce an identical sequence, avoiding a hydration mismatch.
 */
export const Meteors = (
	{
		count     = 10,
		children,
		className = '',
		style,
		...props
	}: MeteorsProps
) => {
	const meteors = useMemo(() => buildMeteors(count), [count]);

	return (
		<>
			<style>{`
				@keyframes dafink-meteor {
					0%   { translate: 0 0; opacity: 1; }
					70%  { opacity: 1; }
					100% { translate: -500px 500px; opacity: 0; }
				}
				.dafink-meteor {
					position: absolute;
					top: -10%;
					border-radius: 9999px;
					background: linear-gradient(var(--color-text-subtle), transparent);
					rotate: 215deg;
					animation: dafink-meteor linear infinite;
				}
				@media (prefers-reduced-motion: reduce) {
					.dafink-meteors-layer {
						display: none;
					}
				}
			`}</style>
			<div {...props} className={['relative overflow-hidden', className].join(' ')} style={style}>
				<div aria-hidden='true' className='dafink-meteors-layer pointer-events-none absolute inset-0'>
					{meteors.map((meteor, index) => (
						<span
							key={index}
							className='dafink-meteor'
							style={{
								left:              `${meteor.left}%`,
								width:             `${meteor.width}px`,
								height:            `${meteor.height}px`,
								animationDuration: `${meteor.duration}s`,
								animationDelay:    `${meteor.delay}s`,
							}}
						/>
					))}
				</div>
				{children ? <div className='relative z-10'>{children}</div> : null}
			</div>
		</>
	);
};

export default Meteors;
