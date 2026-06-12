'use client';

import { Children, cloneElement, isValidElement, HTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimelineVariant   = 'brand' | 'muted';
export type TimelineDirection = 'vertical' | 'horizontal';
export type TimelineAnimate   = 'stagger' | 'none';

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
	variant?:   TimelineVariant;
	direction?: TimelineDirection;
	/**
	 * Controls mount animation when items are already present at render time.
	 * - `"stagger"` (default) — each item fades + slides in with a cascading delay.
	 *   The container size is fixed from the start; only opacity/transform animate.
	 * - `"none"` — items appear instantly. Use this when you're adding items
	 *   dynamically over time and handling animation yourself via className.
	 */
	animate?:   TimelineAnimate;
	children:   React.ReactNode;
	className?: string;
}

export interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
	title:        string;
	indicator?:   React.ReactNode;
	children?:    React.ReactNode;
	className?:   string;
	/** Injected by <Timeline> — do not set manually. */
	_index?:      number;
	/** Injected by <Timeline> — do not set manually. */
	_isLast?:     boolean;
	/** Injected by <Timeline> — do not set manually. */
	_variant?:    TimelineVariant;
	/** Injected by <Timeline> — do not set manually. */
	_direction?:  TimelineDirection;
	/** Injected by <Timeline> — do not set manually. */
	_animate?:    TimelineAnimate;
}

// ─── TimelineItem ─────────────────────────────────────────────────────────────

export const TimelineItem = (
    {
        title,
        indicator,
        children,
        className  = '',
        _index     = 0,
        _isLast    = false,
        _variant   = 'brand',
        _direction = 'vertical',
        _animate   = 'stagger',
        style,
        ...props
    }: TimelineItemProps
) => {
	const indicatorNode = indicator ?? (
		<span className='text-xs font-semibold leading-none select-none'>
			{_index + 1}
		</span>
	);

	const dotColor = _variant === 'brand'
		? 'bg-brand text-brand-fg'
		: 'bg-surface-active text-text-muted border border-surface-border';

	const staggerStyle: React.CSSProperties = _animate === 'stagger'
		? { animation: `tl-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${_index * 90}ms both` }
		: {};

	const mergedStyle = { ...staggerStyle, ...style };

	if (_direction === 'horizontal') {
		return (
			<div
				{...props}
				style={mergedStyle}
				className={['flex flex-col flex-1 min-w-0', className].join(' ')}
			>
				{/* Top rail: dot + connector */}
				<div className='flex items-center w-full'>
					<div
						aria-hidden='true'
						className={[
							'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
							dotColor,
						].join(' ')}
					>
						{indicatorNode}
					</div>
					{!_isLast && (
						<div
							aria-hidden='true'
							className='ml-2 h-px flex-1 bg-surface-border'
						/>
					)}
				</div>

				{/* Content */}
				<div className='pt-3 pr-4 min-w-0'>
					<p className='text-sm font-semibold text-text mb-1'>{title}</p>
					{children && (
						<div className='text-sm text-text-muted'>{children}</div>
					)}
				</div>
			</div>
		);
	}

	// ── vertical (default) ────────────────────────────────────────────────────

	return (
		<div
			{...props}
			style={mergedStyle}
			className={['flex gap-4', className].join(' ')}
		>
			{/* Left rail */}
			<div className='flex flex-col items-center'>
				<div
					aria-hidden='true'
					className={[
						'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
						dotColor,
					].join(' ')}
				>
					{indicatorNode}
				</div>
				{!_isLast && (
					<div
						aria-hidden='true'
						className='mt-2 w-px flex-1 bg-surface-border'
					/>
				)}
			</div>

			{/* Content */}
			<div className={['flex-1 min-w-0', _isLast ? 'pb-0' : 'pb-8'].join(' ')}>
				<p className='text-sm font-semibold text-text leading-7 mb-2'>{title}</p>
				{children && (
					<div className='text-sm text-text-muted'>{children}</div>
				)}
			</div>
		</div>
	);
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const Timeline = (
    {
        variant   = 'brand',
        direction = 'vertical',
        animate   = 'stagger',
        children,
        className = '',
        ...props
    }: TimelineProps
) => {
	const items = Children.toArray(children).filter(isValidElement);
	const total = items.length;

	const injected = items.map((child, index) =>
		cloneElement(child as React.ReactElement<TimelineItemProps>, {
			_index:     index,
			_isLast:    index === total - 1,
			_variant:   variant,
			_direction: direction,
			_animate:   animate,
		})
	);

	return (
		<>
			{animate === 'stagger' && (
				<style>{`
					@keyframes tl-in {
						from { opacity: 0; transform: translateY(6px); }
						to   { opacity: 1; transform: translateY(0);   }
					}
				`}</style>
			)}
			<div
				{...props}
				className={[
					direction === 'horizontal' ? 'flex flex-row items-start' : 'flex flex-col',
					className,
				].join(' ')}
			>
				{injected}
			</div>
		</>
	);
};

export default Timeline;
