'use client';

import { CSSProperties, KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { playTransition, transitionDelay } from './effects';
import { SlideCanvas } from '../SlideCanvas/SlideCanvas';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from './deck';
import { ambientBackdrop } from './Ambient';
import { ElementView } from './ElementView';
import Button from '../Button/Button';
import { Entrance } from './Entrance';
import type { Slide } from './deck';
import { Glyph } from './icons';

interface PresenterProps {
	slides:     Slide[];
	startIndex: number;
	onClose:    () => void;
	stageStyle?: CSSProperties;
}

interface Leaving {
	index:     number;
	direction: 1 | -1;
}

const NEXT_KEYS = ['ArrowRight', 'ArrowDown', 'PageDown', ' '];
const PREV_KEYS = ['ArrowLeft', 'ArrowUp', 'PageUp'];

const SlideLayer = ({ slide, label, baseDelay, stageStyle }: { slide: Slide; label: string; baseDelay: number; stageStyle?: CSSProperties }) => (
	<SlideCanvas
		elements={slide.elements}
		onElementsChange={() => {}}
		renderElement={el => (
			<Entrance element={el} baseDelay={baseDelay}>
				<ElementView element={el} editing={false} onChange={() => {}} />
			</Entrance>
		)}
		width={SLIDE_WIDTH}
		height={SLIDE_HEIGHT}
		background={slide.background || undefined}
		backdrop={ambientBackdrop(slide.ambient)}
		stageStyle={stageStyle}
		aria-label={label}
		readOnly
	/>
);

export const Presenter = ({ slides, startIndex, onClose, stageStyle }: PresenterProps) => {
	const [index, setIndex] = useState(startIndex);
	const [leaving, setLeaving] = useState<Leaving | null>(null);
	// Captured when navigating, so it stays fixed while the entrances play out.
	const [entryDelay, setEntryDelay] = useState(0);
	const dialogRef = useRef<HTMLDivElement>(null);
	const incomingRef = useRef<HTMLDivElement>(null);
	const outgoingRef = useRef<HTMLDivElement>(null);
	const slide = slides[index];

	useEffect(() =>
	{
		const dialog = dialogRef.current;
		dialog?.focus();
		dialog?.requestFullscreen?.().catch(() => {});

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		// Browsers swallow Escape while fullscreen and exit fullscreen instead,
		// so leaving fullscreen is treated as closing the presentation.
		const onFullscreenChange = () => !document.fullscreenElement && onClose();
		document.addEventListener('fullscreenchange', onFullscreenChange);

		return () =>
		{
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('fullscreenchange', onFullscreenChange);
			if(document.fullscreenElement) document.exitFullscreen().catch(() => {});
		};
	}, [onClose]);

	// Runs before paint so the incoming slide never flashes at its final position.
	useLayoutEffect(() =>
	{
		if(!leaving || !incomingRef.current) return;
		const animations = playTransition(incomingRef.current, outgoingRef.current, slide.transition, leaving.direction);
		if(!animations.length)
		{
			setLeaving(null);
			return;
		}

		let cancelled = false;
		Promise.all(animations.map(a => a.finished)).then(() => !cancelled && setLeaving(null), () => {});
		return () =>
		{
			cancelled = true;
			animations.forEach(a => a.cancel());
		};
	}, [leaving, slide.transition]);

	const goTo = (next: number) => {
		const target = Math.min(slides.length - 1, Math.max(0, next));
		if(target === index) return;
		setLeaving({ index, direction: target > index ? 1 : -1 });
		setEntryDelay(transitionDelay(slides[target].transition));
		setIndex(target);
	};

	const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
		if(e.key === 'Tab')
		{
			const focusables = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [])];
			const position = focusables.indexOf(document.activeElement as HTMLElement);
			const next = e.shiftKey ? position - 1 : position + 1;
			e.preventDefault();
			focusables.at(next % focusables.length)?.focus();
			return;
		}

		if(e.target !== e.currentTarget && e.key === ' ') return;

		if(e.key === 'Escape') onClose();
		else if(NEXT_KEYS.includes(e.key)) goTo(index + 1);
		else if(PREV_KEYS.includes(e.key)) goTo(index - 1);
		else if(e.key === 'Home') goTo(0);
		else if(e.key === 'End') goTo(slides.length - 1);
		else return;

		e.preventDefault();
	};

	const label = `Slide ${index + 1} of ${slides.length}`;

	return (
		<div
			ref={dialogRef}
			role='dialog'
			aria-modal='true'
			aria-label='Presentation'
			tabIndex={-1}
			onKeyDown={handleKey}
			className='fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-surface p-4 outline-none motion-safe:animate-[fade-in_var(--duration-base)_ease-out]'
		>
			<div className='relative w-[min(100%,calc((100vh-6rem)*16/9))] overflow-hidden rounded-[var(--radius)]' style={{ aspectRatio: `${SLIDE_WIDTH} / ${SLIDE_HEIGHT}` }}>
				{leaving && (
					<div ref={outgoingRef} aria-hidden='true' className='absolute inset-0'>
						<SlideLayer slide={slides[leaving.index]} label='Previous slide' baseDelay={0} stageStyle={stageStyle} />
					</div>
				)}
				<div ref={incomingRef} key={slide.id} className='absolute inset-0'>
					<SlideLayer slide={slide} label={label} baseDelay={entryDelay} stageStyle={stageStyle} />
				</div>
			</div>

			<div className='flex items-center gap-2'>
				<Button variant='ghost' size='icon' aria-label='Previous slide' onClick={() => goTo(index - 1)} disabled={index === 0}>
					<Glyph name='chevronLeft' />
				</Button>
				<span aria-live='polite' className='min-w-16 text-center text-sm tabular-nums text-text-muted'>
					{index + 1} / {slides.length}
				</span>
				<Button variant='ghost' size='icon' aria-label='Next slide' onClick={() => goTo(index + 1)} disabled={index === slides.length - 1}>
					<Glyph name='chevronRight' />
				</Button>
				<Button variant='ghost' size='icon' aria-label='Exit presentation' onClick={onClose}>
					<Glyph name='close' />
				</Button>
			</div>
		</div>
	);
};
