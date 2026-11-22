'use client';

import { useEffect, useRef, useState, HTMLAttributes } from 'react';

export interface TypewriterProps extends HTMLAttributes<HTMLSpanElement> {
	text:             string;
	/** Milliseconds per character. */
	speed?:           number;
	/** Milliseconds before typing starts. */
	delay?:           number;
	cursor?:          boolean;
	/** Keep the cursor after typing ends. */
	cursorPersist?:   boolean;
	onComplete?:      () => void;
	/** Called with the characters revealed so far. */
	onReveal?:        (charsRevealed: number) => void;
}

export const Typewriter = (
	{
		text,
		speed          = 50,
		delay          = 0,
		cursor         = true,
		cursorPersist  = false,
		onComplete,
		onReveal,
		className      = '',
		style,
		...props
	}: TypewriterProps
) => {
	const [displayedChars, setDisplayedChars] = useState(0);
	const onCompleteRef = useRef(onComplete);
	const onRevealRef = useRef(onReveal);
	useEffect(() => { onCompleteRef.current = onComplete; });
	useEffect(() => { onRevealRef.current = onReveal; });

	useEffect(() =>
	{
		if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
		{
			const id = setTimeout(() =>
			{
				setDisplayedChars(text.length);
				onRevealRef.current?.(text.length);
				onCompleteRef.current?.();
			}, 0);
			return () => clearTimeout(id);
		}

		let intervalId: ReturnType<typeof setInterval>;

		const timeoutId = setTimeout(() =>
		{
			let current = 0;
			setDisplayedChars(0);

			intervalId = setInterval(() =>
			{
				current += 1;
				setDisplayedChars(current);
				onRevealRef.current?.(current);

				if(current >= text.length)
				{
					clearInterval(intervalId);
					onCompleteRef.current?.();
				}
			}, speed);
		}, delay);

		return () =>
		{
			clearTimeout(timeoutId);
			clearInterval(intervalId);
		};
	}, [text, speed, delay]);

	const isDone     = displayedChars >= text.length;
	const showCursor = cursor && (!isDone || cursorPersist);

	return (
		<>
			<style>{`
				@keyframes dafink-cursor-blink {
					0%, 100% { opacity: 1; }
					50%       { opacity: 0; }
				}
				.dafink-cursor {
					display: inline-block;
					width: 2px;
					height: 1em;
					background: currentColor;
					margin-left: 1px;
					vertical-align: text-bottom;
					animation: dafink-cursor-blink 1s step-start infinite;
				}
				@media (prefers-reduced-motion: reduce) {
					.dafink-cursor { animation: none; }
				}
			`}</style>
			<span
				aria-label={text}
				className={className}
				style={style}
				{...props}
			>
				<span aria-hidden='true'>
					{text.slice(0, displayedChars)}
					{showCursor && <span className='dafink-cursor' />}
				</span>
			</span>
		</>
	);
};

export default Typewriter;
