'use client';

import { HTMLAttributes, ReactNode, UIEvent, forwardRef, useCallback, useEffect, useRef, useState } from 'react';

export type ScrollFadeDirection = 'vertical' | 'horizontal';

export interface ScrollFadeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>
{
	direction?:        ScrollFadeDirection;
	fadeSize?:         string;
	fadeFrom?:         string;
	wrapperClassName?: string;
	children:          ReactNode;
}

export const ScrollFade = forwardRef<HTMLDivElement, ScrollFadeProps>(
	({ direction = 'vertical', fadeSize, fadeFrom = 'from-surface', wrapperClassName = '', className = '', children, onScroll, ...props }, forwardedRef) => {
		const scrollRef       = useRef<HTMLDivElement>(null);
		const [showStart, setShowStart] = useState(false);
		const [showEnd,   setShowEnd]   = useState(false);

		const updateFades = useCallback(() => {
			const el = scrollRef.current;
			if(!el) return;

			if(direction === 'vertical')
			{
				setShowStart(el.scrollTop > 0);
				setShowEnd(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
			}
			else
			{
				setShowStart(el.scrollLeft > 0);
				setShowEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
			}
		}, [direction]);

		useEffect(() =>
		{
			const el = scrollRef.current;
			if(!el) return;

			updateFades();
			const observer = new ResizeObserver(updateFades);
			observer.observe(el);
			return () => observer.disconnect();
		}, [updateFades]);

		const setRefs = (node: HTMLDivElement | null) =>
		{
			scrollRef.current = node;
			if(typeof forwardedRef === 'function') forwardedRef(node);
			else if(forwardedRef) (forwardedRef as { current: HTMLDivElement | null }).current = node;
		};

		const handleScroll = (e: UIEvent<HTMLDivElement>) =>
		{
			updateFades();
			onScroll?.(e);
		};

		const size = fadeSize ?? (direction === 'vertical' ? 'h-10' : 'w-10');

		return (
			<div className={['relative', wrapperClassName].join(' ')}>
				<div
					aria-hidden='true'
					className={[
						'pointer-events-none absolute z-20 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)]',
						direction === 'vertical' ? `inset-x-0 top-0 ${size} bg-gradient-to-b` : `inset-y-0 left-0 ${size} bg-gradient-to-r`,
						fadeFrom, 'to-transparent',
						showStart ? 'opacity-100' : 'opacity-0',
					].join(' ')}
				/>
				<div
					aria-hidden='true'
					className={[
						'pointer-events-none absolute z-20 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)]',
						direction === 'vertical' ? `inset-x-0 bottom-0 ${size} bg-gradient-to-t` : `inset-y-0 right-0 ${size} bg-gradient-to-l`,
						fadeFrom, 'to-transparent',
						showEnd ? 'opacity-100' : 'opacity-0',
					].join(' ')}
				/>
				<div
					{...props}
					ref={setRefs}
					onScroll={handleScroll}
					className={[direction === 'vertical' ? 'overflow-y-auto' : 'overflow-x-auto', className].join(' ')}
				>
					{children}
				</div>
			</div>
		);
	}
);

ScrollFade.displayName = 'ScrollFade';

export default ScrollFade;
