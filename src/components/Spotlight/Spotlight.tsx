'use client';

import { HTMLAttributes, useRef, useState, type PointerEvent } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpotlightProps extends HTMLAttributes<HTMLDivElement> {
	/** Diameter of the glow in pixels. Defaults to 400. */
	size?:      number;
	children:   React.ReactNode;
	className?: string;
}

// ─── Spotlight ────────────────────────────────────────────────────────────────

/**
 * Wraps content in a container with a soft radial glow that follows the
 * cursor, revealing a "spotlight" highlight as the pointer moves over it.
 * The overlay's position is mutated directly via a CSS custom property on
 * every pointer move (bypassing React state) so the effect stays smooth
 * without triggering a re-render per mousemove event.
 */
export const Spotlight = (
	{
		size      = 400,
		children,
		className = '',
		style,
		...props
	}: SpotlightProps
) => {
	const overlayRef = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState(false);

	const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		const overlay = overlayRef.current;
		if(!overlay) return;

		const rect = e.currentTarget.getBoundingClientRect();
		overlay.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
		overlay.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
	};

	return (
		<div
			{...props}
			onPointerMove={handlePointerMove}
			onPointerEnter={() => setActive(true)}
			onPointerLeave={() => setActive(false)}
			className={['relative overflow-hidden', className].join(' ')}
			style={style}
		>
			{children}
			<div
				ref={overlayRef}
				aria-hidden='true'
				className={[
					'dafink-spotlight pointer-events-none absolute inset-0 transition-opacity duration-[var(--duration-base)]',
					active ? 'opacity-100' : 'opacity-0',
				].join(' ')}
				style={{
					['--spot-x' as string]: '50%',
					['--spot-y' as string]: '50%',
					background: `radial-gradient(circle at var(--spot-x) var(--spot-y), color-mix(in srgb, var(--color-brand) 15%, transparent) 0%, transparent ${size / 2}px)`,
				} as React.CSSProperties}
			/>
		</div>
	);
};

export default Spotlight;
