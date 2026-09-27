import type { ExtraSection } from './extraSections';

export type { ExtraSection };

// Data-driven variant/interactive sections for effect detail pages, keyed by
// effect slug. Mirrors app/_docs/registry/extraSections.tsx exactly; see
// rules/docs-site.md -> "Extra Section Guidelines" for the authoring rules.
export const effectExtraSections: Record<string, ExtraSection[]> = {
	'scroll-fade': [
		{
			heading: 'Accessibility',
			description: (
				<p>Both edge overlays are <code>aria-hidden</code> and <code>pointer-events-none</code>, purely decorative fade indicators. Their cross-fade is a CSS-only <code>motion-safe:transition-opacity</code> transition, so prefers-reduced-motion is handled via Tailwind&apos;s <code>motion-safe</code> variant tied to the global reduced-motion rule rather than a separate JS check — there is no JS-driven animation loop here. ScrollFade adds no ARIA roles, tabindex, or focus handling of its own to the scrollable region or its children.</p>
			),
		},
	],
	reveal: [
		{
			heading: 'Accessibility',
			description: (
				<p>Reveal explicitly checks <code>window.matchMedia(&apos;(prefers-reduced-motion: reduce)&apos;)</code> in a <code>useEffect</code> before ever hiding content, skipping the IntersectionObserver entirely and leaving children rendered fully visible when the user prefers reduced motion. The wrapper is a plain, non-decorative <code>&lt;div&gt;</code> — its children are real content, not aria-hidden — and it adds no role, tabindex, or focus handling, so it never changes the keyboard behavior of whatever it wraps.</p>
			),
		},
	],
	'slide-in': [
		{
			heading: 'Accessibility',
			description: (
				<p>SlideIn explicitly checks <code>window.matchMedia(&apos;(prefers-reduced-motion: reduce)&apos;)</code> in a <code>useEffect</code> before ever hiding content, skipping the IntersectionObserver and leaving children rendered fully visible when the user prefers reduced motion. The wrapper is a plain, non-decorative <code>&lt;div&gt;</code> — its children are real content, not aria-hidden — and it adds no role, tabindex, or focus handling, so it never changes the keyboard behavior of whatever it wraps.</p>
			),
		},
	],
	'count-up': [
		{
			heading: 'Accessibility',
			description: (
				<p>CountUp checks <code>window.matchMedia(&apos;(prefers-reduced-motion: reduce)&apos;)</code> in JS (a CSS rule can&apos;t stop a <code>requestAnimationFrame</code> loop) and, when it matches, skips the tween and renders the final value immediately. The animated digits are <code>aria-hidden</code> with the real final value duplicated in a visually-hidden (<code>sr-only</code>) span for assistive tech, and CountUp is a non-interactive <code>&lt;span&gt;</code> with no keyboard behavior to alter.</p>
			),
		},
	],
	'text-shimmer': [
		{
			heading: 'Accessibility',
			description: (
				<p>TextShimmer&apos;s sweep is a pure CSS <code>@keyframes</code> animation, explicitly disabled by its own <code>@media (prefers-reduced-motion: reduce)</code> block (beyond the global rule) that also removes the gradient and restores static <code>--color-text</code>. The shimmering text is real, readable DOM content — not aria-hidden, since it is the actual content rather than a decorative overlay — and TextShimmer adds no keyboard or focus behavior of its own.</p>
			),
		},
	],
	typewriter: [
		{
			heading: 'Accessibility',
			description: (
				<p>Typewriter explicitly checks <code>window.matchMedia(&apos;(prefers-reduced-motion: reduce)&apos;)</code> on mount and, when it matches, immediately reveals the full text with no interval-driven animation; the cursor&apos;s blink keyframe is separately disabled via its own <code>@media (prefers-reduced-motion: reduce)</code> rule. The animated character-by-character span is <code>aria-hidden</code>, with the complete string exposed via <code>aria-label</code> on the outer span for assistive tech, and Typewriter adds no keyboard or focus behavior of its own.</p>
			),
		},
	],
	marquee: [
		{
			heading: 'Accessibility',
			description: (
				<p>Marquee&apos;s scroll is a pure CSS <code>@keyframes</code> animation, disabled by its own <code>@media (prefers-reduced-motion: reduce)</code> block, which also hides the duplicate copy so reduced-motion users see one static row instead of a frozen mid-scroll frame. The duplicate copy is <code>aria-hidden</code> in every motion state to avoid double-announcing repeated content; the first copy is real content and is not aria-hidden. Marquee wraps children without adding any keyboard or focus behavior of its own — any interactive children keep their native tab order.</p>
			),
		},
	],
	ripple: [
		{
			heading: 'Accessibility',
			description: (
				<p>Ripple&apos;s rings are a pure CSS <code>@keyframes</code> animation, entirely hidden via its own <code>@media (prefers-reduced-motion: reduce)</code> block rather than frozen mid-frame, since a paused mid-expand ring wouldn&apos;t read as an intentional state. The rings container is <code>aria-hidden</code> at all times since it is purely decorative; any <code>children</code> passed in render normally, and Ripple adds no keyboard or focus behavior of its own.</p>
			),
		},
	],
	particles: [
		{
			heading: 'Accessibility',
			description: (
				<p>Particles renders its dot layer inside a single aria-hidden wrapper, so it&apos;s invisible to assistive technology and never intercepts focus or clicks; any optional children render above it and stay fully interactive. Reduced motion is handled by a dedicated CSS media query that sets each dot&apos;s animation to none and a static opacity of 0.5, so the field goes still rather than disappearing. It has no keyboard interaction of its own.</p>
			),
		},
	],
	spotlight: [
		{
			heading: 'Accessibility',
			description: (
				<p>Spotlight&apos;s glow overlay is aria-hidden and pointer-events-none, so it&apos;s invisible to assistive technology and never blocks interaction with the wrapped children. It has no dedicated prefers-reduced-motion check of its own — the pointer-follow position is a direct, one-shot response to cursor movement rather than a looping or automatic animation, so there&apos;s nothing to suppress; only the fade transition is affected, and that&apos;s already clamped to near-instant by the global reduced-motion rule in globals.css. It adds no keyboard behavior and doesn&apos;t alter the children it wraps.</p>
			),
		},
	],
	meteors: [
		{
			heading: 'Accessibility',
			description: (
				<p>Meteors&apos; streak layer is aria-hidden, so it&apos;s invisible to assistive technology and never intercepts focus or clicks; any optional children render above it and stay fully interactive. Reduced motion is handled with a dedicated CSS media query that sets the entire meteors layer to display: none (rather than just freezing it mid-flight), since a frozen streak doesn&apos;t read as an intentional static design. It has no keyboard interaction of its own.</p>
			),
		},
	],
	magnetic: [
		{
			heading: 'Accessibility',
			description: (
				<p>Magnetic checks prefers-reduced-motion once on mount via window.matchMedia into a ref; when it matches, the pointer-follow handlers short-circuit immediately and the wrapped child renders at rest with no transform applied. The inner wrapper is a plain, non-semantic div, so it adds no ARIA role and doesn&apos;t alter the keyboard, focus, or tab behavior of the single interactive child it wraps.</p>
			),
		},
	],
	'cursor-trail': [
		{
			heading: 'Accessibility',
			description: (
				<p>CursorTrail checks prefers-reduced-motion once on mount via window.matchMedia into a ref, mirroring Magnetic&apos;s pattern; when it matches, the pointermove handler&apos;s positioning logic short-circuits immediately and the trail dots stay at their initial opacity: 0 rest state for the component&apos;s lifetime. All trail dots are aria-hidden and pointer-events-none, so they&apos;re invisible to assistive technology and never block interaction with the wrapped children, whose own keyboard and focus behavior is untouched.</p>
			),
		},
	],
	'click-spark': [
		{
			heading: 'Accessibility',
			description: (
				<p>ClickSpark checks prefers-reduced-motion inside the click handler itself (not cached on mount); when it matches, burst spawning is skipped entirely — no spark lines are ever created or animated, though a passed-in onClick handler still fires. Every burst container is aria-hidden, so the spark feedback is invisible to assistive technology. It adds no keyboard behavior of its own and doesn&apos;t alter the wrapped children&apos;s existing keyboard or focus behavior.</p>
			),
		},
	],
	confetti: [
		{
			heading: 'Accessibility',
			description: (
				<p>Confetti checks prefers-reduced-motion inside the click handler itself (not cached on mount), the same pattern as ClickSpark; when it matches, burst spawning is skipped entirely — no confetti pieces are ever created or animated, though a passed-in onClick handler still fires. Every burst container is aria-hidden, so the celebratory feedback is invisible to assistive technology. It adds no keyboard behavior of its own and doesn&apos;t alter the wrapped children&apos;s existing keyboard or focus behavior.</p>
			),
		},
	],
	'text-scramble': [
		{
			heading: 'Accessibility',
			description: (
				<p>TextScramble checks prefers-reduced-motion on mount inside a useEffect; when it matches, the requestAnimationFrame scramble loop never starts and the final text renders immediately and statically. The outer span&apos;s aria-label is always the correct final text from the first render onward, while the inner span holding the animated scrambling glyphs is aria-hidden, so screen readers never hear scramble noise regardless of animation state. It renders plain text with no interactive children, so there&apos;s no keyboard behavior to preserve or alter.</p>
			),
		},
	],
};
