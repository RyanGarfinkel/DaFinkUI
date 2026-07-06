'use client';

import { useId, useState } from 'react';

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
	className?: string;
}

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
	className = '',
}: SliderProps) =>
{
	const uid = useId();
	const inputId = label ? `slider-${uid}` : undefined;
	const hintId  = hint  ? `slider-hint-${uid}` : undefined;

	const [isDragging, setIsDragging] = useState(false);

	const pct = ((value - min) / (max - min)) * 100;

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

			<div className='relative flex items-center h-5'>
				<div className='absolute inset-x-0 h-1.5 rounded-full bg-surface-active overflow-hidden'>
					<div
						className={[
							'h-full rounded-full bg-brand',
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
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={value}
					aria-describedby={hintId}
					onChange={e => onValueChange(Number(e.target.value))}
					onPointerDown={startDragging}
					onPointerUp={stopDragging}
					onPointerCancel={stopDragging}
					onBlur={stopDragging}
					className={[
						'relative w-full h-5 appearance-none bg-transparent cursor-pointer',
						'focus:outline-none',
						'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
						'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
					].join(' ')}
					style={{ accentColor: 'var(--color-brand)' }}
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
