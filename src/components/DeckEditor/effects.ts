import type { AmbientType, EffectType, SlideTransition, TransitionType } from './deck';

export const TRANSITION_OPTIONS: { value: TransitionType; label: string }[] = [
	{ value: 'none', label: 'None' },
	{ value: 'fade', label: 'Fade' },
	{ value: 'push', label: 'Push' },
	{ value: 'zoom', label: 'Zoom' },
	{ value: 'wipe', label: 'Wipe' },
];

export const EFFECT_OPTIONS: { value: EffectType; label: string; textOnly?: boolean }[] = [
	{ value: 'none',        label: 'None' },
	{ value: 'fade',        label: 'Fade in' },
	{ value: 'slide-up',    label: 'Rise' },
	{ value: 'slide-left',  label: 'Slide from right' },
	{ value: 'slide-right', label: 'Slide from left' },
	{ value: 'scale',       label: 'Zoom in' },
	{ value: 'typewriter',  label: 'Typewriter', textOnly: true },
	{ value: 'scramble',    label: 'Scramble', textOnly: true },
];

export const AMBIENT_OPTIONS: { value: AmbientType; label: string }[] = [
	{ value: 'none',      label: 'None' },
	{ value: 'particles', label: 'Particles' },
	{ value: 'meteors',   label: 'Meteors' },
];

const EASE_OUT = 'cubic-bezier(0.2, 0, 0, 1)';

// Transitions are driven from JS (Web Animations API), so the global CSS
// reduced-motion rule doesn't reach them; check the preference directly.
export const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Direction = 1 | -1;

const transitionFrames = (type: Exclude<TransitionType, 'none'>, direction: Direction): { incoming: Keyframe[]; outgoing?: Keyframe[] } => {
	switch(type)
	{
	case 'fade':
		return { incoming: [{ opacity: 0 }, { opacity: 1 }] };
	case 'zoom':
		return {
			incoming: [{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'none' }],
			outgoing: [{ opacity: 1 }, { opacity: 0 }],
		};
	case 'push':
		return {
			incoming: [{ transform: `translateX(${direction * 100}%)` }, { transform: 'none' }],
			outgoing: [{ transform: 'none' }, { transform: `translateX(${-direction * 100}%)` }],
		};
	case 'wipe':
		return {
			incoming: [
				{ clipPath: direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
				{ clipPath: 'inset(0 0 0 0)' },
			],
		};
	}
};

/** Animates `incoming` (and `outgoing`, when the transition moves it). Await `.finished` on the result to know when it's done. */
export const playTransition = (incoming: HTMLElement, outgoing: HTMLElement | null, transition: SlideTransition, direction: Direction): Animation[] => {
	if(transition.type === 'none' || prefersReducedMotion()) return [];
	const frames = transitionFrames(transition.type, direction);
	const timing = { duration: transition.duration, easing: EASE_OUT };

	// The incoming slide must not keep its final keyframe once done (a lingering
	// `transform: none` would override the element's own transform); the outgoing
	// one holds its end state until its layer is removed.
	return [
		incoming.animate(frames.incoming, { ...timing, fill: 'backwards' }),
		...(outgoing && frames.outgoing ? [outgoing.animate(frames.outgoing, { ...timing, fill: 'forwards' })] : []),
	];
};

/** How long a slide's entrance takes before its element effects should begin. */
export const transitionDelay = (transition: SlideTransition) =>
	(transition.type === 'none' || prefersReducedMotion() ? 0 : transition.duration);
