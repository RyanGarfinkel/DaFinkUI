'use client';

import { useEffect, useRef, useState, type HTMLAttributes, type MouseEventHandler } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConfettiProps extends HTMLAttributes<HTMLDivElement>
{
	/** Content to wrap, typically a button. Clicking it triggers the burst. */
	children:       React.ReactNode;
	/** Number of confetti pieces rendered per burst. Defaults to 60. */
	particleCount?: number;
	/** Hex colors randomly assigned to pieces. Defaults to a vivid, varied palette. */
	colors?:        string[];
	/** Milliseconds for one burst's full fall-and-fade animation. Defaults to 1500. */
	duration?:      number;
	className?:     string;
}

interface Piece
{
	id:     number;
	color:  string;
	width:  number;
	height: number;
	rotate: number;
	spin:   number;
	dx:     number;
	dy:     number;
}

interface Burst
{
	id:     number;
	x:      number;
	y:      number;
	pieces: Piece[];
}

// ─── Internals ────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa'];

const buildPieces = (particleCount: number, colors: string[]): Piece[] =>
	Array.from({ length: particleCount }, (_, i) => ({
		id:     i,
		color:  colors[Math.floor(Math.random() * colors.length)],
		width:  2 + Math.random() * 2,
		height: 6 + Math.random() * 4,
		rotate: Math.random() * 360,
		spin:   Math.random() * 720 - 360,
		dx:     (Math.random() - 0.5) * 200,
		dy:     100 + Math.random() * 150,
	}));

// ─── ConfettiBurst ────────────────────────────────────────────────────────────

const ConfettiBurst = (
	{ x, y, pieces, duration }: { x: number; y: number; pieces: Piece[]; duration: number }
) => {
	const [settled, setSettled] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setSettled(true));
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<span
			aria-hidden='true'
			className='dafink-confetti-burst'
			style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}
		>
			{pieces.map((piece) => (
				<span
					key={piece.id}
					className='dafink-confetti-piece'
					style={{
						position:        'absolute',
						top:             0,
						left:            0,
						width:           `${piece.width}px`,
						height:          `${piece.height}px`,
						backgroundColor: piece.color,
						transition:      `transform ${duration}ms cubic-bezier(0.2, 0, 0, 1), opacity ${duration}ms ease-out`,
						transform:       settled
							? `translate(${piece.dx}px, ${piece.dy}px) rotate(${piece.rotate + piece.spin}deg)`
							: `translate(0px, 0px) rotate(${piece.rotate}deg)`,
						opacity:         settled ? 0 : 1,
					}}
				/>
			))}
		</span>
	);
};

// ─── Confetti ─────────────────────────────────────────────────────────────────

/**
 * Wraps content, typically a button, and bursts colorful confetti pieces
 * outward from the click point on every click — falling, spinning, and
 * fading via a CSS transition to a randomized end transform computed once
 * per piece at spawn time. Rapid clicks stack independent, overlapping
 * bursts. Under prefers-reduced-motion spawning is skipped entirely rather
 * than sped up.
 */
export const Confetti = (
	{
		children,
		particleCount = 60,
		colors        = DEFAULT_COLORS,
		duration      = 1500,
		className     = '',
		onClick,
		...props
	}: ConfettiProps
) => {
	const [bursts, setBursts] = useState<Burst[]>([]);
	const nextIdRef = useRef(0);
	const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

		setBursts((prev) => [
			...prev,
			{ id, x: e.clientX - rect.left, y: e.clientY - rect.top, pieces: buildPieces(particleCount, colors) },
		]);

		const timer = setTimeout(() => {
			setBursts((prev) => prev.filter((burst) => burst.id !== id));
		}, duration);
		timersRef.current.push(timer);
	};

	return (
		<div
			{...props}
			onClick={handleClick}
			className={['relative', className].filter(Boolean).join(' ')}
		>
			{children}
			{bursts.map((burst) => (
				<ConfettiBurst key={burst.id} x={burst.x} y={burst.y} pieces={burst.pieces} duration={duration} />
			))}
		</div>
	);
};

export default Confetti;
