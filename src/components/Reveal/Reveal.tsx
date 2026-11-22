'use client';

import { Children, isValidElement, cloneElement, useEffect, useRef, useState, HTMLAttributes } from 'react';

export type RevealEffect = 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale';

export interface RevealProps extends HTMLAttributes<HTMLDivElement> {
	effect?:    RevealEffect;
	/** Milliseconds before the entrance starts. */
	delay?:     number;
	/** Reveal only the first time it scrolls into view. */
	once?:      boolean;
	children?:  React.ReactNode;
}

export interface RevealGroupProps extends HTMLAttributes<HTMLDivElement> {
	/** Milliseconds added to each successive child's delay. */
	stagger?:   number;
	/** Milliseconds before the first child. */
	delay?:     number;
	/** Defaults for children that don't set their own `effect` and `once`. */
	effect?:    RevealEffect;
	once?:      boolean;
	children:   React.ReactNode;
	className?: string;
}

const HIDDEN_CLASSES: Record<RevealEffect, string> = {
	'fade':        'opacity-0',
	'slide-up':    'opacity-0 translate-y-4',
	'slide-left':  'opacity-0 translate-x-4',
	'slide-right': 'opacity-0 -translate-x-4',
	'scale':       'opacity-0 scale-95',
};

const SHOWN_CLASSES = 'opacity-100 translate-x-0 translate-y-0 scale-100';

type RevealStatus = 'idle' | 'hidden' | 'shown';

/**
 * Scroll-triggered entrance animation. Progressive enhancement: content is
 * rendered fully visible (`idle`) on the server, without JS, when
 * IntersectionObserver is unavailable, and under prefers-reduced-motion; it
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
			// Hiding snaps instantly: a delayed hide would leave content that's
			// already in view on mount visible until the reveal, so it never animated.
			style={{
				transitionDuration:       status === 'hidden' ? '0ms' : 'var(--duration-slow)',
				transitionTimingFunction: 'var(--ease-enter)',
				transitionDelay:          status === 'hidden' ? '0ms' : `${delay}ms`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

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
