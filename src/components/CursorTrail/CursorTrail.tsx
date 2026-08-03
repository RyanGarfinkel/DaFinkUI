'use client';

import { HTMLAttributes, useEffect, useRef, type PointerEvent } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CursorTrailProps extends HTMLAttributes<HTMLDivElement> {
	/** Number of dots in the trail. Defaults to 6. */
	trailLength?: number;
	/** Diameter in px of the leading (largest) dot. Defaults to 12. */
	size?:        number;
	children:     React.ReactNode;
	className?:   string;
}

interface Position {
	x: number;
	y: number;
}

// ─── CursorTrail ──────────────────────────────────────────────────────────────

/**
 * Wraps content in a container; as the pointer moves within it, a short
 * trail of glowing dots follows the cursor with a slight lag, each dot
 * progressively smaller and fainter toward the tail. Positions are kept in
 * a ring-buffer ref and written directly onto each dot's style on every
 * pointermove (never via setState), matching Spotlight's performance
 * pattern so the effect never triggers a re-render. Under
 * prefers-reduced-motion the pointer-tracking logic is never attached, so
 * the dots simply stay at their initial, invisible rest state.
 */
export const CursorTrail = (
	{
		trailLength = 6,
		size        = 12,
		children,
		className   = '',
		style,
		...props
	}: CursorTrailProps
) => {
	const dotsRef         = useRef<(HTMLSpanElement | null)[]>([]);
	const positionsRef    = useRef<Position[]>([]);
	const reducedMotionRef = useRef(false);
	const hasMovedRef      = useRef(false);

	useEffect(() => {
		reducedMotionRef.current =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}, []);

	const dotSizes     = Array.from({ length: trailLength }, (_, index) => size * (1 - index / trailLength));
	const dotOpacities = Array.from({ length: trailLength }, (_, index) => 1 - index / trailLength);

	const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if(reducedMotionRef.current) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const x    = e.clientX - rect.left;
		const y    = e.clientY - rect.top;

		if(positionsRef.current.length !== trailLength)
		{
			positionsRef.current = Array.from(
				{ length: trailLength },
				(_, index) => positionsRef.current[index] ?? { x, y }
			);
		}

		positionsRef.current.unshift({ x, y });
		positionsRef.current.length = trailLength;

		positionsRef.current.forEach((position, index) => {
			const dot = dotsRef.current[index];
			if(!dot) return;

			dot.style.left = `${position.x - dotSizes[index] / 2}px`;
			dot.style.top  = `${position.y - dotSizes[index] / 2}px`;

			if(!hasMovedRef.current) dot.style.opacity = String(dotOpacities[index]);
		});

		hasMovedRef.current = true;
	};

	return (
		<div
			{...props}
			onPointerMove={handlePointerMove}
			className={['relative overflow-hidden', className].filter(Boolean).join(' ')}
			style={style}
		>
			{children}
			{Array.from({ length: trailLength }, (_, index) => (
				<span
					key={index}
					ref={(el) => { dotsRef.current[index] = el; }}
					aria-hidden='true'
					className='dafink-cursor-trail-dot pointer-events-none absolute rounded-full transition-[left,top] duration-[var(--duration-fast)] ease-[var(--ease-standard)]'
					style={{
						left:       '0px',
						top:        '0px',
						width:      `${dotSizes[index]}px`,
						height:     `${dotSizes[index]}px`,
						opacity:    0,
						background: 'var(--color-brand)',
						boxShadow:  `0 0 ${dotSizes[index]}px var(--color-brand)`,
					}}
				/>
			))}
		</div>
	);
};

export default CursorTrail;
