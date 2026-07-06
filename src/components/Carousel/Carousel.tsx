'use client';

import { useState, useCallback, useEffect, useRef, createContext, useContext, Children, HTMLAttributes, ButtonHTMLAttributes } from 'react';

interface CarouselContextValue
{
	currentIndex:  number;
	count:         number;
	canScrollPrev: boolean;
	canScrollNext: boolean;
	registerCount: (n: number) => void;
	scrollPrev:    () => void;
	scrollNext:    () => void;
	scrollTo:      (index: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarouselContext = () =>
{
	const ctx = useContext(CarouselContext);
	if(!ctx) throw new Error('Carousel subcomponents must be used inside <Carousel>');
	return ctx;
};

export interface CarouselProps extends HTMLAttributes<HTMLDivElement>
{
	loop?:     boolean;
	autoPlay?: boolean;
	interval?: number;
}

export const Carousel = (
	{
		loop     = false,
		autoPlay = false,
		interval = 4000,
		className = '',
		children,
		...props
	}: CarouselProps
) =>
{
	const [currentIndex, setCurrentIndex] = useState(0);
	const [count, setCount]               = useState(0);
	const intervalRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

	const scrollTo = useCallback((index: number) =>
	{
		setCurrentIndex(i =>
		{
			if(count === 0) return i;
			if(loop) return ((index % count) + count) % count;
			return Math.max(0, Math.min(count - 1, index));
		});
	}, [loop, count]);

	const scrollPrev = useCallback(() =>
	{
		setCurrentIndex(i =>
		{
			if(i === 0) return loop ? count - 1 : 0;
			return i - 1;
		});
	}, [loop, count]);

	const scrollNext = useCallback(() =>
	{
		setCurrentIndex(i =>
		{
			if(i === count - 1) return loop ? 0 : count - 1;
			return i + 1;
		});
	}, [loop, count]);

	useEffect(() =>
	{
		if(!autoPlay || count === 0) return;
		intervalRef.current = setInterval(scrollNext, interval);
		return () => { if(intervalRef.current) clearInterval(intervalRef.current); };
	}, [autoPlay, interval, scrollNext, count]);

	const canScrollPrev = loop || currentIndex > 0;
	const canScrollNext = loop || currentIndex < count - 1;

	return (
		<CarouselContext.Provider
			value={{
				currentIndex,
				count,
				registerCount: setCount,
				scrollPrev,
				scrollNext,
				scrollTo,
				canScrollPrev,
				canScrollNext,
			}}
		>
			<div
				role='region'
				aria-roledescription='carousel'
				aria-label='Carousel'
				className={`relative ${className}`}
				onKeyDown={e =>
				{
					if(e.key === 'ArrowLeft')  { e.preventDefault(); scrollPrev(); }
					if(e.key === 'ArrowRight') { e.preventDefault(); scrollNext(); }
				}}
				{...props}
			>
				{children}
				<div
					role='status'
					aria-live='polite'
					aria-atomic='true'
					className='sr-only'
				>
					{`Slide ${currentIndex + 1} of ${count}`}
				</div>
			</div>
		</CarouselContext.Provider>
	);
};

const DRAG_ACTIVATION_PX = 5;
const DRAG_SNAP_RATIO    = 0.2;
const DRAG_FALLBACK_PX   = 50;

interface DragState
{
	pointerId: number;
	startX:    number;
	delta:     number;
	dragging:  boolean;
}

export interface CarouselContentProps extends HTMLAttributes<HTMLDivElement>
{
	children: React.ReactNode;
}

export const CarouselContent = ({ children, className = '', ...props }: CarouselContentProps) =>
{
	const { currentIndex, registerCount, scrollPrev, scrollNext } = useCarouselContext();
	const slideCount   = Children.count(children);
	const trackRef     = useRef<HTMLDivElement>(null);
	const dragRef      = useRef<DragState | null>(null);
	const draggedRef   = useRef(false);
	const [dragOffset, setDragOffset] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() =>
	{
		registerCount(slideCount);
	}, [slideCount, registerCount]);

	const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) =>
	{
		if(dragRef.current) return;
		if(e.pointerType === 'mouse' && e.button !== 0) return;
		dragRef.current = { pointerId: e.pointerId, startX: e.clientX, delta: 0, dragging: false };
	};

	const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) =>
	{
		const drag = dragRef.current;
		if(!drag || drag.pointerId !== e.pointerId) return;

		drag.delta = e.clientX - drag.startX;

		if(!drag.dragging)
		{
			if(Math.abs(drag.delta) < DRAG_ACTIVATION_PX) return;
			drag.dragging = true;
			draggedRef.current = true;
			setIsDragging(true);
			if(typeof trackRef.current?.setPointerCapture === 'function')
				trackRef.current.setPointerCapture(e.pointerId);
		}

		e.preventDefault();
		setDragOffset(drag.delta);
	};

	const endDrag = (e: React.PointerEvent<HTMLDivElement>) =>
	{
		const drag = dragRef.current;
		if(!drag || drag.pointerId !== e.pointerId) return;

		if(drag.dragging)
		{
			const width     = trackRef.current?.offsetWidth ?? 0;
			const threshold = width > 0 ? width * DRAG_SNAP_RATIO : DRAG_FALLBACK_PX;

			if(drag.delta <= -threshold) scrollNext();
			else if(drag.delta >= threshold) scrollPrev();
		}

		dragRef.current = null;
		setIsDragging(false);
		setDragOffset(0);
	};

	const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) =>
	{
		if(!draggedRef.current) return;
		e.preventDefault();
		e.stopPropagation();
		draggedRef.current = false;
	};

	return (
		<div className={`overflow-hidden ${className}`} {...props}>
			<div
				ref={trackRef}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				onClickCapture={onClickCapture}
				className={`flex touch-pan-y cursor-grab active:cursor-grabbing ${
					isDragging ? 'select-none' : 'motion-safe:transition-transform motion-safe:duration-300'
				}`}
				style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` }}
			>
				{children}
			</div>
		</div>
	);
};

export interface CarouselItemProps extends HTMLAttributes<HTMLDivElement>
{
	children: React.ReactNode;
}

export const CarouselItem = ({ children, className = '', ...props }: CarouselItemProps) => (
	<div
		role='group'
		aria-roledescription='slide'
		className={`min-w-full shrink-0 ${className}`}
		{...props}
	>
		{children}
	</div>
);

const NAV_BASE = 'absolute top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface border-[length:var(--border-width)] border-surface-border shadow-[var(--shadow-sm)] text-text hover:bg-surface-hover active:bg-surface-active transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring disabled:pointer-events-none disabled:opacity-40';

export type CarouselPreviousProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const CarouselPrevious = ({ className = '', ...props }: CarouselPreviousProps) =>
{
	const { scrollPrev, canScrollPrev } = useCarouselContext();

	return (
		<button
			aria-label='Previous slide'
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			className={`left-2 ${NAV_BASE} ${className}`}
			{...props}
		>
			<svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden='true'>
				<path d='M10 12L6 8l4-4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
			</svg>
		</button>
	);
};

export type CarouselNextProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const CarouselNext = ({ className = '', ...props }: CarouselNextProps) =>
{
	const { scrollNext, canScrollNext } = useCarouselContext();

	return (
		<button
			aria-label='Next slide'
			disabled={!canScrollNext}
			onClick={scrollNext}
			className={`right-2 ${NAV_BASE} ${className}`}
			{...props}
		>
			<svg width='16' height='16' viewBox='0 0 16 16' fill='none' aria-hidden='true'>
				<path d='M6 4l4 4-4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
			</svg>
		</button>
	);
};

export type CarouselDotsProps = HTMLAttributes<HTMLDivElement>;

export const CarouselDots = ({ className = '', ...props }: CarouselDotsProps) =>
{
	const { currentIndex, count, scrollTo } = useCarouselContext();

	if(count <= 1) return null;

	return (
		<div
			role='tablist'
			aria-label='Slides'
			className={`flex items-center justify-center gap-1.5 ${className}`}
			{...props}
		>
			{Array.from({ length: count }, (_, i) => (
				<button
					key={i}
					role='tab'
					aria-label={`Go to slide ${i + 1}`}
					aria-selected={i === currentIndex}
					onClick={() => scrollTo(i)}
					className={`h-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2 ${
						i === currentIndex
							? 'w-4 bg-brand'
							: 'w-1.5 bg-surface-border hover:bg-surface-border-hover'
					}`}
				/>
			))}
		</div>
	);
};
