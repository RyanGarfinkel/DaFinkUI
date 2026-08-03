'use client';

import { useEffect, useRef, useState, HTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextScrambleProps extends HTMLAttributes<HTMLSpanElement>
{
	/** The final text to resolve to. */
	text:        string;
	/** Total duration of the scramble-to-resolve animation in milliseconds. */
	duration?:   number;
	/** Charset used for scrambling filler characters. */
	characters?: string;
	className?:  string;
}

// ─── Internals ────────────────────────────────────────────────────────────────

const DEFAULT_CHARACTERS = '!<>-_\\/[]{}—=+*^?#';

const randomCharacter = (characters: string): string =>
	characters[Math.floor(Math.random() * characters.length)];

const buildScrambled = (
	text:          string,
	revealedCount: number,
	characters:    string
): string =>
	text
		.split('')
		.map((character, index) => {
			if(character === ' ') return ' ';
			if(index < revealedCount) return character;
			return randomCharacter(characters);
		})
		.join('');

// ─── TextScramble ─────────────────────────────────────────────────────────────

/**
 * Reveals text left-to-right by cycling through random filler characters
 * before each position resolves to its real character — a "decrypt"
 * reveal effect. Screen readers always receive the real, final `text` via
 * `aria-label`; the animated glyphs live in an `aria-hidden` span so
 * assistive tech never announces scramble noise. Under
 * prefers-reduced-motion the scramble loop never starts and `text` renders
 * immediately.
 */
export const TextScramble = (
	{
		text,
		duration   = 800,
		characters = DEFAULT_CHARACTERS,
		className  = '',
		style,
		...props
	}: TextScrambleProps
) => {
	const [display, setDisplay] = useState(text);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const reducedMotion =
			typeof window !== 'undefined' &&
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if(reducedMotion)
		{
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setDisplay(text);
			return;
		}

		const startTime = performance.now();

		const tick = (now: number) => {
			const progress      = Math.min((now - startTime) / duration, 1);
			const revealedCount = Math.floor(progress * text.length);

			setDisplay(progress >= 1 ? text : buildScrambled(text, revealedCount, characters));

			if(progress < 1) rafRef.current = requestAnimationFrame(tick);
		};

		rafRef.current = requestAnimationFrame(tick);

		return () => {
			if(rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [text, duration, characters]);

	return (
		<span
			{...props}
			aria-label={text}
			className={className}
			style={style}
		>
			<span aria-hidden='true'>{display}</span>
		</span>
	);
};

export default TextScramble;
