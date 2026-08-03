'use client';

import { useEffect, useRef, type HTMLAttributes, type PointerEvent, type ReactElement } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MagneticProps extends HTMLAttributes<HTMLDivElement>
{
	/** Single interactive child (e.g. a <Button>) that follows the cursor. */
	children:   ReactElement;
	/** Multiplier applied to the cursor offset, 0–1. Defaults to 0.3. */
	strength?:  number;
	/** Activation radius in px around the wrapper. Defaults to 80. */
	range?:     number;
	className?: string;
}

// ─── Magnetic ─────────────────────────────────────────────────────────────────

/**
 * Wraps a single interactive child and subtly translates it toward the
 * cursor when the pointer is within `range` of the wrapper's center,
 * snapping back to rest on pointer leave. Movement is applied by mutating
 * the inner div's style directly (no setState per pointer move) to avoid
 * re-rendering on every mousemove. Under prefers-reduced-motion the
 * pointer-follow logic is never attached; the child renders at rest.
 */
export const Magnetic = (
	{
		children,
		strength  = 0.3,
		range     = 80,
		className = '',
		...props
	}: MagneticProps
) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const innerRef   = useRef<HTMLDivElement>(null);

	const reducedMotionRef = useRef(false);

	useEffect(() => {
		reducedMotionRef.current =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}, []);

	const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if(reducedMotionRef.current) return;

		const wrapper = wrapperRef.current;
		const inner   = innerRef.current;
		if(!wrapper || !inner) return;

		const rect     = wrapper.getBoundingClientRect();
		const centerX  = rect.left + rect.width / 2;
		const centerY  = rect.top + rect.height / 2;
		const offsetX  = e.clientX - centerX;
		const offsetY  = e.clientY - centerY;
		const distance = Math.hypot(offsetX, offsetY);

		if(distance > range)
		{
			inner.style.transitionDuration = 'var(--duration-base)';
			inner.style.transform          = 'translate(0px, 0px)';
			return;
		}

		inner.style.transitionDuration = '0ms';
		inner.style.transform          = `translate(${offsetX * strength}px, ${offsetY * strength}px)`;
	};

	const handlePointerLeave = () => {
		if(reducedMotionRef.current) return;

		const inner = innerRef.current;
		if(!inner) return;

		inner.style.transitionDuration = 'var(--duration-base)';
		inner.style.transform          = 'translate(0px, 0px)';
	};

	return (
		<div
			{...props}
			ref={wrapperRef}
			onPointerMove={handlePointerMove}
			onPointerLeave={handlePointerLeave}
			className={['inline-block relative', className].filter(Boolean).join(' ')}
		>
			<div
				ref={innerRef}
				className='transition-transform ease-[var(--ease-standard)]'
				style={{ transform: 'translate(0px, 0px)' }}
			>
				{children}
			</div>
		</div>
	);
};

export default Magnetic;
