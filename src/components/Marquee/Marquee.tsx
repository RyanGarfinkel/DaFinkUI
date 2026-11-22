'use client';

import { HTMLAttributes } from 'react';

export type MarqueeDirection = 'left' | 'right';

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
	direction?:    MarqueeDirection;
	/** Seconds per loop. */
	duration?:     number;
	pauseOnHover?: boolean;
	/** Gap in px between repeated copies. */
	gap?:          number;
	children:      React.ReactNode;
}

/**
 * Infinite horizontal scrolling strip of content. Renders the children twice
 * inside a flex track that translates by exactly -50% (its own half-width),
 * so the loop is seamless. Under prefers-reduced-motion the animation is
 * removed and the duplicate copy is hidden, leaving one static row.
 */
export const Marquee = (
	{
		direction    = 'left',
		duration     = 20,
		pauseOnHover = true,
		gap          = 16,
		children,
		className    = '',
		style,
		...props
	}: MarqueeProps
) => {
	const durationValue = `${duration}s`;
	const trackClassName = [
		'dafink-marquee-track',
		direction === 'right' ? 'dafink-marquee-reverse' : '',
	].filter(Boolean).join(' ');

	return (
		<>
			<style>{`
				@keyframes dafink-marquee-left {
					from { transform: translateX(0); }
					to   { transform: translateX(-50%); }
				}
				@keyframes dafink-marquee-right {
					from { transform: translateX(-50%); }
					to   { transform: translateX(0); }
				}
				.dafink-marquee-track {
					animation: dafink-marquee-left var(--marquee-duration) linear infinite;
				}
				.dafink-marquee-track.dafink-marquee-reverse {
					animation-name: dafink-marquee-right;
				}
				.dafink-marquee-pausable:hover .dafink-marquee-track {
					animation-play-state: paused;
				}
				@media (prefers-reduced-motion: reduce) {
					.dafink-marquee-track {
						animation: none;
						transform: translateX(0);
					}
					.dafink-marquee-copy--duplicate {
						display: none;
					}
				}
			`}</style>
			<div
				{...props}
				className={[
					'overflow-hidden',
					pauseOnHover ? 'dafink-marquee-pausable' : '',
					className,
				].filter(Boolean).join(' ')}
				style={{ ...style }}
			>
				<div
					className={trackClassName}
					style={{
						['--marquee-duration' as string]: durationValue,
						display:  'flex',
						width:    'max-content',
						gap:      `${gap}px`,
					} as React.CSSProperties}
				>
					<div className='dafink-marquee-copy flex shrink-0'>
						{children}
					</div>
					<div className='dafink-marquee-copy dafink-marquee-copy--duplicate flex shrink-0' aria-hidden='true'>
						{children}
					</div>
				</div>
			</div>
		</>
	);
};

export default Marquee;
