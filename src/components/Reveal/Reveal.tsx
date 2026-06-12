'use client';

import { Children, isValidElement, cloneElement, useEffect, useRef, useState, HTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RevealEffect = 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale';

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
	/** Entrance effect applied when the element scrolls into view. */
	effect?:    RevealEffect;
	/** Delay in milliseconds before the entrance transition starts. */
	delay?:     number;
	/** Reveal only the first time the element enters the viewport. */
	once?:      boolean;
	children?:  React.ReactNode;
	className?: string;
}

export interface RevealGroupProps extends HTMLAttributes<HTMLDivElement> {
	/** Milliseconds added to each successive child Reveal's delay. */
	stagger?:   number;
	/** Base delay in milliseconds applied to the first child. */
	delay?:     number;
	/** Default effect for child Reveal items that don't set their own. */
	effect?:    RevealEffect;
	/** Default `once` for child Reveal items that don't set their own. */
	once?:      boolean;
	children:   React.ReactNode;
	className?: string;
}

// ─── Internals ────────────────────────────────────────────────────────────────

const HIDDEN_CLASSES: Record<RevealEffect, string> = {
	'fade':        'opacity-0',
	'slide-up':    'opacity-0 translate-y-4',
	'slide-left':  'opacity-0 translate-x-4',
	'slide-right': 'opacity-0 -translate-x-4',
	'scale':       'opacity-0 scale-95',
};

const SHOWN_CLASSES = 'opacity-100 translate-x-0 translate-y-0 scale-100';

type RevealStatus = 'idle' | 'hidden' | 'shown';

// ─── Reveal ───────────────────────────────────────────────────────────────────

/**
 * Scroll-triggered entrance animation. Progressive enhancement: content is
 * rendered fully visible (`idle`) on the server, without JS, when
 * IntersectionObserver is unavailable, and under prefers-reduced-motion — it
 * is only hidden once the observer is confirmed to be running.
 */
export const Reveal = (
	{
		effect    = 'fade',
		delay     = 0,
		once      = true,
		children,
		className = '',
		style,
		...props
	}: RevealProps
) => {
	const [status, setStatus] = useState<RevealStatus>('idle');
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const node = ref.current;
		if (!node || typeof IntersectionObserver === 'undefined') return;

		const reducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) return;

		// Only hide content once the observer is confirmed running, so it can
		// never be stuck invisible (SSR / no-JS / reduced motion render visible).
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setStatus('hidden');

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setStatus('shown');
						if (once) observer.unobserve(entry.target);
					}
					else if (!once) {
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
			className={[
				'transition-all',
				status === 'hidden' ? HIDDEN_CLASSES[effect] : '',
				status === 'shown'  ? SHOWN_CLASSES : '',
				className,
			].filter(Boolean).join(' ')}
			style={{
				transitionDuration:       'var(--duration-slow)',
				transitionTimingFunction: 'var(--ease-enter)',
				transitionDelay:          `${delay}ms`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

// ─── RevealGroup ──────────────────────────────────────────────────────────────

/**
 * Cascades staggered delays onto child <Reveal> items. Children that set
 * their own `delay`, `effect`, or `once` keep their explicit values.
 */
export const RevealGroup = (
	{
		stagger   = 100,
		delay     = 0,
		effect,
		once,
		children,
		className = '',
		...props
	}: RevealGroupProps
) => {
	const items = Children.toArray(children).filter(isValidElement);

	return (
		<div {...props} className={className}>
			{items.map((child, index) => {
				if (child.type !== Reveal) return child;
				const element = child as React.ReactElement<RevealProps>;
				return cloneElement(element, {
					key:    element.key ?? index,
					delay:  element.props.delay  ?? delay + index * stagger,
					effect: element.props.effect ?? effect,
					once:   element.props.once   ?? once,
				});
			})}
		</div>
	);
};

export default Reveal;
