'use client';

import { useEffect, useRef, useState, type HTMLAttributes, type MouseEventHandler } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClickSparkProps extends HTMLAttributes<HTMLDivElement>
{
	/** Content to wrap. Clicks anywhere within trigger a burst at the click point. */
	children:     React.ReactNode;
	/** Number of spark lines rendered per burst. Defaults to 8. */
	sparkCount?:  number;
	/** Length of each spark line in pixels. Defaults to 12. */
	sparkSize?:   number;
	/** Milliseconds for one burst's full shoot-and-fade animation. Defaults to 400. */
	duration?:    number;
	className?:   string;
}

interface Burst
{
	id: number;
	x:  number;
	y:  number;
}

// ─── ClickSpark ───────────────────────────────────────────────────────────────

/**
 * Wraps content and spawns a brief burst of thin spark lines radiating
 * outward from the click point on every click inside it. Each burst is
 * removed from state once its animation finishes, and rapid clicks stack
 * multiple independent, overlapping bursts. Under prefers-reduced-motion
 * spawning is skipped entirely rather than sped up.
 */
export const ClickSpark = (
	{
		children,
		sparkCount = 8,
		sparkSize  = 12,
		duration   = 400,
		className  = '',
		onClick,
		...props
	}: ClickSparkProps
) => {
	const [bursts, setBursts] = useState<Burst[]>([]);
	const nextIdRef  = useRef(0);
	const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);

	useEffect(() => {
		return () => {
			// timersRef is a persistent mutable accumulator pushed to by every
			// click, not a per-render snapshot — reading .current here at unmount
			// time (not mount time) is exactly what clears every timer that's
			// accrued since, which is the intended behavior.
			// eslint-disable-next-line react-hooks/exhaustive-deps
			timersRef.current.forEach(clearTimeout);
		};
	}, []);

	const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
		onClick?.(e);

		const reducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if(reducedMotion) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const id   = nextIdRef.current++;

		setBursts((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);

		const timer = setTimeout(() => {
			setBursts((prev) => prev.filter((burst) => burst.id !== id));
		}, duration);
		timersRef.current.push(timer);
	};

	return (
		<>
			<style>{`
				@keyframes dafink-click-spark {
					0%   { transform: rotate(var(--spark-angle)) translateX(0); opacity: 1; }
					100% { transform: rotate(var(--spark-angle)) translateX(var(--spark-travel)); opacity: 0; }
				}
				.dafink-click-spark-line {
					position:          absolute;
					top:               0;
					left:              0;
					height:            2px;
					border-radius:     9999px;
					background:        var(--color-text-muted);
					transform-origin:  0 50%;
					animation:         dafink-click-spark linear forwards;
					animation-duration: var(--spark-duration);
				}
			`}</style>
			<div
				{...props}
				onClick={handleClick}
				className={['relative', className].filter(Boolean).join(' ')}
			>
				{children}
				{bursts.map((burst) => (
					<span
						key={burst.id}
						aria-hidden='true'
						className='dafink-click-spark-burst'
						style={{ position: 'absolute', left: burst.x, top: burst.y, pointerEvents: 'none' }}
					>
						{Array.from({ length: sparkCount }, (_, i) => (
							<span
								key={i}
								className='dafink-click-spark-line'
								style={{
									width:                        `${sparkSize}px`,
									['--spark-angle' as string]:  `${(360 / sparkCount) * i}deg`,
									['--spark-travel' as string]: `${sparkSize * 2.5}px`,
									['--spark-duration' as string]: `${duration}ms`,
								} as React.CSSProperties}
							/>
						))}
					</span>
				))}
			</div>
		</>
	);
};

export default ClickSpark;
