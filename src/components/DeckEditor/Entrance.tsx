'use client';

import TextScramble from '../TextScramble/TextScramble';
import { ReactNode, useEffect, useState } from 'react';
import Typewriter from '../Typewriter/Typewriter';
import { prefersReducedMotion } from './effects';
import type { DeckElement } from './deck';
import { Reveal } from '../Reveal/Reveal';
import { textFontFamily } from './themes';

const SCRAMBLE_MS = 900;
const TYPE_SPEED_MS = 35;

interface EntranceProps {
	element:   DeckElement;
	/** Added to the element's own delay, e.g. the slide transition's duration. */
	baseDelay: number;
	children:  ReactNode;
}

type Phase = 'waiting' | 'playing' | 'done';

// Typewriter and TextScramble animate plain strings, so a text box plays its
// entrance as plain text in its own size and color, then swaps to the real
// rich text (bold, links, lists) once the effect finishes.
const TextEntrance = ({ element, kind, delay, children }: { element: Extract<DeckElement, { type: 'text' }>; kind: 'typewriter' | 'scramble'; delay: number; children: ReactNode }) => {
	const [phase, setPhase] = useState<Phase>(delay > 0 ? 'waiting' : 'playing');
	const text = [...new DOMParser().parseFromString(element.html, 'text/html').body.querySelectorAll('p')].map(p => p.textContent).join('\n');

	useEffect(() =>
	{
		if(phase === 'waiting')
		{
			const timer = setTimeout(() => setPhase('playing'), delay);
			return () => clearTimeout(timer);
		}
		if(phase === 'playing' && kind === 'scramble')
		{
			const timer = setTimeout(() => setPhase('done'), SCRAMBLE_MS);
			return () => clearTimeout(timer);
		}
	}, [phase, delay, kind]);

	if(phase === 'done') return children;

	return (
		<div
			className={`h-full w-full whitespace-pre-line leading-tight ${element.color ? '' : 'text-text'}`}
			style={{ fontSize: element.fontSize, fontFamily: textFontFamily(element), fontWeight: element.bold ? 700 : undefined, color: element.color || undefined }}
		>
			{phase === 'playing' && kind === 'typewriter' && <Typewriter text={text} speed={TYPE_SPEED_MS} onComplete={() => setPhase('done')} />}
			{phase === 'playing' && kind === 'scramble' && <TextScramble text={text} duration={SCRAMBLE_MS} />}
		</div>
	);
};

export const Entrance = ({ element, baseDelay, children }: EntranceProps) => {
	const effect = element.effect;
	if(!effect || effect.type === 'none' || prefersReducedMotion()) return children;

	const delay = baseDelay + effect.delay;

	if(effect.type === 'typewriter' || effect.type === 'scramble')
	{
		if(element.type !== 'text') return children;
		return <TextEntrance element={element} kind={effect.type} delay={delay}>{children}</TextEntrance>;
	}

	return <Reveal effect={effect.type} delay={delay} className='h-full w-full'>{children}</Reveal>;
};
