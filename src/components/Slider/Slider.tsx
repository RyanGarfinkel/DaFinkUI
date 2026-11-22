'use client';

import { useId, useState } from 'react';

export type SliderSize = 'default' | 'sm';
export type SliderTone = 'brand' | 'current';

export interface SliderProps {
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
	/** 'current' derives the track/fill/thumb color from currentColor instead of the brand token: use when the slider sits on an arbitrary colored surface (e.g. inside a colored chat bubble) rather than the page background. */
	tone?: SliderTone;
	ariaLabel?: string;
	ariaValueText?: string;
	className?: string;
}

// Matches the thumb's CSS size. Browsers inset the thumb by half its width at each end, and the fill must use the same inset to meet it.
const THUMB_SIZE = 16;

const SIZE_CLASSES: Record<SliderSize, { row: string; track: string }> = {
	default: { row: 'h-5', track: 'h-1.5' },
	sm:      { row: 'h-4', track: 'h-1' },
};

// The focus ring is an outline, not a box-shadow: a shadow's offset gap is painted, and would cover the fill where it meets the thumb.
const TONE_CLASSES: Record<SliderTone, { track: string; fill: string; thumbColor: string; ring: string }> = {
	brand:   { track: 'bg-surface-active', fill: 'bg-brand',   thumbColor: 'var(--color-brand)', ring: 'var(--color-brand-ring)' },
	current: { track: 'bg-current/20',     fill: 'bg-current', thumbColor: 'currentColor',       ring: 'currentColor' },
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
}: SliderProps) => {
	const uid = useId();
	const inputId = label ? `slider-${uid}` : undefined;
	const hintId  = hint  ? `slider-hint-${uid}` : undefined;

	const [isDragging, setIsDragging] = useState(false);
	// Keys move the thumb instantly with no pointerdown/up pair, so focus also keeps the fill snapped to it.
	const [isFocused,  setIsFocused]  = useState(false);

	const pct       = ((value - min) / (max - min)) * 100;
	const fillWidth = `calc(${THUMB_SIZE / 2}px + (100% - ${THUMB_SIZE}px) * ${pct / 100})`;
	const { row, track: trackHeight } = SIZE_CLASSES[size];
	const { track: trackColor, fill: fillColor, thumbColor, ring } = TONE_CLASSES[tone];

	const isLive = isDragging || isFocused;

	const startDragging = () => setIsDragging(true);
	const stopDragging  = () => setIsDragging(false);

	return (
		<>
			<style>{`
				/* WebKit/Blink ignore box-shadow (and most other cosmetic properties) on
				   ::-webkit-slider-thumb unless -webkit-appearance is also reset on the
				   thumb itself -- which then requires redefining the thumb's own shape,
				   since resetting appearance strips the native circle along with it. */
				.dafink-slider-thumb::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: ${THUMB_SIZE}px;
					height: ${THUMB_SIZE}px;
					border-radius: 9999px;
					background-color: var(--slider-thumb-color);
					transform: none;
					outline: 2px solid transparent;
					outline-offset: 0px;
					transition: outline-color 150ms ease, outline-offset 150ms ease;
				}
				.dafink-slider-thumb::-moz-range-thumb {
					width: ${THUMB_SIZE}px;
					height: ${THUMB_SIZE}px;
					border: none;
					border-radius: 9999px;
					background-color: var(--slider-thumb-color);
					transform: none;
					outline: 2px solid transparent;
					outline-offset: 0px;
					transition: outline-color 150ms ease, outline-offset 150ms ease;
				}
				.dafink-slider-thumb:focus-visible::-webkit-slider-thumb {
					outline-color: var(--slider-ring);
					outline-offset: 2px;
				}
				.dafink-slider-thumb:focus-visible::-moz-range-thumb {
					outline-color: var(--slider-ring);
					outline-offset: 2px;
				}
				@media (prefers-reduced-motion: reduce) {
					.dafink-slider-thumb::-webkit-slider-thumb,
					.dafink-slider-thumb::-moz-range-thumb {
						transition: none;
					}
				}
			`}</style>
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
								isLive ? '' : 'motion-safe:transition-all motion-safe:duration-[var(--duration-fast)] motion-safe:ease-out',
							].join(' ')}
							style={{ width: fillWidth }}
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
						onFocus={() => setIsFocused(true)}
						onBlur={() => { setIsFocused(false); stopDragging(); }}
						className={[
							`dafink-slider-thumb relative w-full ${row} appearance-none bg-transparent cursor-pointer`,
							'focus:outline-none',
							'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
						].join(' ')}
						style={{
							['--slider-thumb-color' as string]: thumbColor,
							['--slider-ring' as string]:        ring,
						} as React.CSSProperties}
					/>
				</div>

				{hint && (
					<p id={hintId} className='text-sm text-text-muted'>
						{hint}
					</p>
				)}
			</div>
		</>
	);
};

export default Slider;
