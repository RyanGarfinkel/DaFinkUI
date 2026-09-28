'use client';

import { KeyboardEvent, ReactNode, useEffect, useRef } from 'react';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import Composer, { type ComposerProps } from './Composer';
import Button from '../../components/Button/Button';
import type { ChatMessage } from './AiChat';
import { TypingPhrase } from './Phrases';

export interface ThreadPanelProps {
	title:          string;
	rootMessages:   ChatMessage[];
	threadMessages: ChatMessage[];
	loading:        boolean;
	composer:       ComposerProps;
	isTyping:       boolean;
	renderRoot:     (message: ChatMessage) => ReactNode;
	renderReply:    (message: ChatMessage, index: number) => ReactNode;
	onClose:        () => void;
}

const NEAR_BOTTOM_THRESHOLD_PX = 80;

const CloseIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M18 6 6 18M6 6l12 12' />
	</svg>
);

const Divider = ({ label }: { label: string }) => (
	<div className='flex items-center gap-3'>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
		<span className='shrink-0 text-xs font-medium text-text-muted'>{label}</span>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
	</div>
);

// A persistent third flex column, structurally parallel to the left Sidebar — never a
// Modal/Drawer overlay. No focus trap: Escape is a nicety, not the strict overlay
// contract in src/patterns/accessibility.md, since this never blocks the page behind it.
export const ThreadPanel = (
	{
		title, rootMessages, threadMessages, loading, composer, isTyping, renderRoot, renderReply, onClose,
	}: ThreadPanelProps
) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	// Same scroll-anchoring contract as the main pane: stays true until the reader scrolls
	// away from the bottom, so auto-scroll never yanks the view back down mid-read.
	const shouldAutoScrollRef = useRef(true);

	useEffect(() => {
		const container = containerRef.current;
		const content   = contentRef.current;
		if(!container || !content) return;

		const handleScroll = () => {
			const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
			shouldAutoScrollRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
		};
		container.addEventListener('scroll', handleScroll, { passive: true });

		const scrollToBottom = () => {
			if(shouldAutoScrollRef.current) container.scrollTop = container.scrollHeight;
		};
		scrollToBottom();

		// Content keeps growing for as long as a reply streams in (typewriter reveal, table
		// rows appending, favicon images loading), so this stays observing for the effect's
		// whole lifetime rather than a fixed window — safe to leave running indefinitely
		// since scrollToBottom above already no-ops once the reader has scrolled away.
		const observer = new ResizeObserver(scrollToBottom);
		observer.observe(content);

		return () => {
			container.removeEventListener('scroll', handleScroll);
			observer.disconnect();
		};
	}, [rootMessages, threadMessages, loading, isTyping]);

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if(e.key === 'Escape')
		{
			e.preventDefault();
			onClose();
		}
	};

	return (
		<div onKeyDown={handleKeyDown} className='flex min-w-0 flex-1 flex-col border-l-[length:var(--border-width)] border-surface-border'>
			<div className='flex items-center justify-between gap-2 border-b-[length:var(--border-width)] border-surface-border px-4 py-3'>
				<div className='min-w-0'>
					<p className='text-[11px] font-medium uppercase tracking-wide text-text-subtle'>Thread</p>
					<h3 className='truncate text-base font-semibold text-text'>{title}</h3>
				</div>
				<Button variant='ghost' size='icon-sm' aria-label='Close thread' onClick={onClose}>
					<CloseIcon />
				</Button>
			</div>

			<div className='relative flex min-h-0 flex-1 flex-col'>
				<ScrollFade ref={containerRef} direction='vertical' className='h-full' wrapperClassName='min-h-0 flex-1'>
					<div ref={contentRef} className='flex min-h-full shrink-0 flex-col gap-4 p-5 pb-28'>
						{loading ? (
							<div className='flex flex-col gap-4'>
								<SkeletonCard lines={2} />
								<SkeletonCard lines={1} />
							</div>
						) : (
							<>
								{rootMessages.map((m) => renderRoot(m))}
								<Divider label='Thread replies' />
								{threadMessages.length === 0 ? (
									<p className='text-center text-sm text-text-muted'>No replies yet — start the thread below.</p>
								) : (
									threadMessages.map((m, index) => renderReply(m, index))
								)}
								{isTyping && <TypingPhrase />}
							</>
						)}
					</div>
				</ScrollFade>

				<div className='absolute inset-x-0 bottom-0 p-4'>
					<Composer {...composer} />
				</div>
			</div>
		</div>
	);
};

export default ThreadPanel;
