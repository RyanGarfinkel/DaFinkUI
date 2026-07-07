'use client';

import { useId, useState } from 'react';

export type SliderSize = 'default' | 'sm';
export type SliderTone = 'brand' | 'current';

export interface SliderProps
{
	value: number;
	onValueChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	label?: string;
	hint?: string;
	showValue?: boolean;
	size?: SliderSize;
	/** 'current' derives the track/fill/thumb color from currentColor instead of the brand token — use when the slider sits on an arbitrary colored surface (e.g. inside a colored chat bubble) rather than the page background. */
	tone?: SliderTone;
	ariaLabel?: string;
	ariaValueText?: string;
	className?: string;
}

const SIZE_CLASSES: Record<SliderSize, { row: string; track: string }> = {
	default: { row: 'h-5', track: 'h-1.5' },
	sm:      { row: 'h-4', track: 'h-1' },
};

const TONE_CLASSES: Record<SliderTone, { track: string; fill: string; ring: string; accent: string }> = {
	brand:   { track: 'bg-surface-active', fill: 'bg-brand',       ring: 'focus-visible:ring-offset-2 focus-visible:ring-brand-ring', accent: 'var(--color-brand)' },
	current: { track: 'bg-current/20',     fill: 'bg-current',     ring: 'focus-visible:ring-current',                                accent: 'currentColor' },
};

const Slider = ({
	value,
	onValueChange,
	min = 0,
	max = 100,
	step = 1,
	disabled,
	label,
	hint,
	showValue,
	size = 'default',
	tone = 'brand',
	ariaLabel,
	ariaValueText,
	className = '',
}: SliderProps) =>
{
	const uid = useId();
	const inputId = label ? `slider-${uid}` : undefined;
	const hintId  = hint  ? `slider-hint-${uid}` : undefined;

	const [isDragging, setIsDragging] = useState(false);

	const pct = ((value - min) / (max - min)) * 100;
	const { row, track: trackHeight } = SIZE_CLASSES[size];
	const { track: trackColor, fill: fillColor, ring, accent } = TONE_CLASSES[tone];

	const startDragging = () => setIsDragging(true);
	const stopDragging  = () => setIsDragging(false);

	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			{(label || showValue) && (
				<div className='flex items-center justify-between'>
					{label && (
						<label
							htmlFor={inputId}
							className='text-sm font-medium text-text select-none'
						>
							{label}
						</label>
					)}
					{showValue && (
						<span className='text-sm text-text-muted tabular-nums' aria-hidden='true'>
							{value}
						</span>
					)}
				</div>
			)}

			<div className={`relative flex items-center ${row}`}>
				<div className={`absolute inset-x-0 ${trackHeight} rounded-full ${trackColor} overflow-hidden`}>
					<div
						className={[
							'h-full rounded-full',
							fillColor,
							isDragging ? '' : 'motion-safe:transition-all motion-safe:duration-[var(--duration-fast)] motion-safe:ease-out',
						].join(' ')}
						style={{ width: `${pct}%` }}
					/>
				</div>

				<input
					type='range'
					id={inputId}
					min={min}
					max={max}
					step={step}
					value={value}
					disabled={disabled}
					aria-label={ariaLabel}
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={value}
					aria-valuetext={ariaValueText}
					aria-describedby={hintId}
					onChange={e => onValueChange(Number(e.target.value))}
					onPointerDown={startDragging}
					onPointerUp={stopDragging}
					onPointerCancel={stopDragging}
					onBlur={stopDragging}
					className={[
						`relative w-full ${row} appearance-none bg-transparent cursor-pointer`,
						'focus:outline-none',
						'focus-visible:ring-2',
						ring,
						'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
					].join(' ')}
					style={{ accentColor: accent }}
				/>
			</div>

			{hint && (
				<p id={hintId} className='text-sm text-text-muted'>
					{hint}
				</p>
			)}
		</div>
	);
};

export default Slider;
