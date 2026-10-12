'use client';

import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useId, useRef, useState } from 'react';
import TimeWheel from './TimeWheel';

type SegmentKey = 'hour' | 'minute' | 'second' | 'meridiem';
type DigitSegment = 'hour' | 'minute' | 'second';

interface TimeFieldProps {
	hour:            number;
	minute:          number;
	second:          number;
	onChange:        (next: { hour: number; minute: number; second: number }) => void;
	onClose:         () => void;
	onTabOutOfLast:  () => void;
	autoFocusFirst?: boolean;
	disabled?:       boolean;
	ariaLabel?:      string;
	className?:      string;
	icon?:           ReactNode;
}

const SEGMENTS: SegmentKey[] = ['hour', 'minute', 'second', 'meridiem'];

const SEGMENT_LABEL: Record<SegmentKey, string> = {
	hour:     'Hours',
	minute:   'Minutes',
	second:   'Seconds',
	meridiem: 'AM or PM',
};

const SEGMENT_RANGE: Record<DigitSegment, { min: number; max: number }> = {
	hour:   { min: 1, max: 12 },
	minute: { min: 0, max: 59 },
	second: { min: 0, max: 59 },
};

const DIGIT_BUFFER_TIMEOUT_MS = 550;

const pad2 = (n: number) => String(n).padStart(2, '0');

const TimeField = (
	{
		hour,
		minute,
		second,
		onChange,
		onClose,
		onTabOutOfLast,
		autoFocusFirst = false,
		disabled = false,
		ariaLabel = 'Time',
		className = '',
		icon,
	}: TimeFieldProps
) => {
	const refs         = useRef<(HTMLDivElement | null)[]>([]);
	const bufferRef    = useRef<{ segment: DigitSegment; digits: string } | null>(null);
	const timeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
	const wheelBtnRef  = useRef<HTMLButtonElement>(null);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const wheelPopRef  = useRef<HTMLDivElement>(null);

	const [wheelMounted, setWheelMounted] = useState(false);
	const [wheelVisible, setWheelVisible] = useState(false);

	const id       = useId();
	const wheelId  = `${id}-wheel`;

	const hour12   = hour % 12 === 0 ? 12 : hour % 12;
	const meridiem = hour < 12 ? 'AM' : 'PM';

	useEffect(() =>
	{
		return () =>
		{
			if(timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	useEffect(() =>
	{
		if(!autoFocusFirst) return;
		const frame = requestAnimationFrame(() => refs.current[0]?.focus());
		return () => cancelAnimationFrame(frame);
	}, [autoFocusFirst]);

	useEffect(() => () => clearTimeout(closeTimerRef.current), []);

	const openWheel = () => {
		if(disabled) return;
		clearTimeout(closeTimerRef.current);
		setWheelMounted(true);
	};

	const closeWheel = (returnFocus = true) => {
		setWheelVisible(false);
		clearTimeout(closeTimerRef.current);
		closeTimerRef.current = setTimeout(() => setWheelMounted(false), 150);
		if(returnFocus) wheelBtnRef.current?.focus();
	};

	useEffect(() =>
	{
		if(!wheelMounted) return;
		requestAnimationFrame(() => setWheelVisible(true));
	}, [wheelMounted]);

	useEffect(() =>
	{
		if(!wheelMounted) return;

		const onPointerDown = (e: PointerEvent) => {
			if(
				!wheelBtnRef.current?.contains(e.target as Node) &&
				!wheelPopRef.current?.contains(e.target as Node)
			)
				closeWheel(false);
		};

		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	}, [wheelMounted]);

	const clearBuffer = () => {
		bufferRef.current = null;
		if(timeoutRef.current)
		{
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	};

	const commit = (segment: SegmentKey, value: number) => {
		if(segment === 'hour')
		{
			const normalized = value % 12;
			onChange({ hour: meridiem === 'PM' ? normalized + 12 : normalized, minute, second });
			return;
		}

		if(segment === 'minute')
		{
			onChange({ hour, minute: value, second });
			return;
		}

		if(segment === 'second')
		{
			onChange({ hour, minute, second: value });
			return;
		}

		onChange({ hour: value, minute, second });
	};

	const step = (segment: SegmentKey, direction: 1 | -1) => {
		if(segment === 'hour')
		{
			const next = hour12 + direction;
			commit('hour', next > 12 ? 1 : next < 1 ? 12 : next);
			return;
		}

		if(segment === 'minute')
		{
			const next = minute + direction;
			commit('minute', next > 59 ? 0 : next < 0 ? 59 : next);
			return;
		}

		if(segment === 'second')
		{
			const next = second + direction;
			commit('second', next > 59 ? 0 : next < 0 ? 59 : next);
			return;
		}

		commit('meridiem', hour < 12 ? hour + 12 : hour - 12);
	};

	// A lone leading '0' for the hour segment isn't a committable value on its own (hour range
	// is 1-12), so it's the one digit that only ever buffers, never commits immediately.
	const handleFirstDigit = (index: number, segment: DigitSegment, digit: string) => {
		const standalone = segment === 'hour' ? digit !== '0' : true;
		const extendable  = segment === 'hour' ? (digit === '0' || digit === '1') : Number(digit) <= 5;

		if(standalone) commit(segment, parseInt(digit, 10));

		if(extendable)
		{
			bufferRef.current = { segment, digits: digit };
			timeoutRef.current = setTimeout(() =>
			{
				bufferRef.current = null;
			}, DIGIT_BUFFER_TIMEOUT_MS);
			return;
		}

		refs.current[index + 1]?.focus();
	};

	// A second digit that would overflow the field (e.g. hour "1" then "9" -> 19) leaves the
	// first digit's already-committed value alone and rolls the new digit into the next segment,
	// matching how a native <input type="time"> handles the same keystroke sequence.
	const handleDigit = (index: number, segment: DigitSegment, digit: string) => {
		if(bufferRef.current && bufferRef.current.segment === segment)
		{
			const digits = bufferRef.current.digits + digit;
			clearBuffer();

			const { min, max } = SEGMENT_RANGE[segment];
			const n = parseInt(digits, 10);

			refs.current[index + 1]?.focus();

			if(n >= min && n <= max) commit(segment, n);
			else if(index + 1 < 3) handleDigit(index + 1, SEGMENTS[index + 1] as DigitSegment, digit);

			return;
		}

		handleFirstDigit(index, segment, digit);
	};

	const handleSegmentKeyDown = (index: number, segment: SegmentKey) => (e: KeyboardEvent<HTMLDivElement>) => {
		if(segment !== 'meridiem' && /^[0-9]$/.test(e.key))
		{
			e.preventDefault();
			handleDigit(index, segment, e.key);
			return;
		}

		switch(e.key)
		{
			case 'ArrowUp':
				e.preventDefault();
				clearBuffer();
				step(segment, 1);
				break;

			case 'ArrowDown':
				e.preventDefault();
				clearBuffer();
				step(segment, -1);
				break;

			case 'ArrowLeft':
				if(index > 0)
				{
					e.preventDefault();
					refs.current[index - 1]?.focus();
				}
				break;

			case 'ArrowRight':
				if(index < SEGMENTS.length - 1)
				{
					e.preventDefault();
					refs.current[index + 1]?.focus();
				}
				break;

			case 'a':
			case 'A':
				if(segment === 'meridiem')
				{
					e.preventDefault();
					commit('meridiem', hour >= 12 ? hour - 12 : hour);
				}
				break;

			case 'p':
			case 'P':
				if(segment === 'meridiem')
				{
					e.preventDefault();
					commit('meridiem', hour < 12 ? hour + 12 : hour);
				}
				break;

			case 'Enter':
			case 'Escape':
				e.preventDefault();
				clearBuffer();
				onClose();
				break;

			case 'Tab':
				if(segment === 'meridiem' && !e.shiftKey) onTabOutOfLast();
				break;
		}
	};

	const groupClass = [
		'relative inline-flex items-center gap-0.5 rounded-[var(--radius)] border-[length:var(--border-width)] border-input-border bg-surface px-2 py-1.5',
		'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
		'hover:border-input-border-hover',
		disabled ? 'opacity-50 cursor-not-allowed' : '',
	].join(' ');

	const cellClass = [
		'flex items-center justify-center rounded-[var(--radius-sm)] text-text text-sm font-medium select-none cursor-default',
		'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
		'hover:bg-surface-hover',
		'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring',
	].join(' ');

	// Clicking blank space inside the field (not a segment or the icon button) focuses Hours,
	// matching how clicking the padding of a native text input focuses it.
	const handleGroupClick = (e: MouseEvent<HTMLDivElement>) => {
		if(e.target === e.currentTarget) refs.current[0]?.focus();
	};

	return (
		<div role='group' aria-label={ariaLabel} className={[groupClass, className].join(' ')} onClick={disabled ? undefined : handleGroupClick}>
			{icon && (
				<button
					ref={wheelBtnRef}
					type='button'
					disabled={disabled}
					aria-haspopup='dialog'
					aria-expanded={wheelMounted}
					aria-controls={wheelId}
					aria-label='Open time picker'
					onClick={openWheel}
					className={[
						'flex items-center justify-center rounded-[var(--radius-sm)] text-text-muted mr-1 -ml-0.5 p-0.5',
						'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
						'hover:bg-surface-hover hover:text-text',
						'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring',
						disabled ? 'pointer-events-none' : 'cursor-pointer',
					].join(' ')}
				>
					{icon}
				</button>
			)}

			{wheelMounted && (
				<div
					ref={wheelPopRef}
					className={[
						'absolute z-50 top-full mt-1 left-0',
						'motion-safe:transition-[opacity,transform] motion-safe:duration-[var(--duration-fast)] origin-top',
						wheelVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
					].join(' ')}
				>
					<TimeWheel
						id={wheelId}
						hour={hour}
						minute={minute}
						second={second}
						onChange={onChange}
						onClose={closeWheel}
					/>
				</div>
			)}

			{SEGMENTS.map((segment, index) =>
			{
				const valueNow  = segment === 'hour' ? hour12 : segment === 'minute' ? minute : segment === 'second' ? second : meridiem === 'AM' ? 1 : 2;
				const valueMin  = segment === 'meridiem' ? 1 : SEGMENT_RANGE[segment].min;
				const valueMax  = segment === 'meridiem' ? 2 : SEGMENT_RANGE[segment].max;
				const valueText = segment === 'hour' ? pad2(hour12) : segment === 'minute' ? pad2(minute) : segment === 'second' ? pad2(second) : meridiem;

				return (
					<div key={segment} className='flex items-center'>
						{(segment === 'minute' || segment === 'second') && (
							<span aria-hidden='true' className='text-text-muted'>:</span>
						)}

						<div
							ref={el => { refs.current[index] = el; }}
							role='spinbutton'
							tabIndex={disabled ? -1 : 0}
							aria-label={SEGMENT_LABEL[segment]}
							aria-valuenow={valueNow}
							aria-valuemin={valueMin}
							aria-valuemax={valueMax}
							aria-valuetext={valueText}
							aria-disabled={disabled || undefined}
							onKeyDown={disabled ? undefined : handleSegmentKeyDown(index, segment)}
							onFocus={() =>
							{
								if(bufferRef.current && bufferRef.current.segment !== segment) clearBuffer();
							}}
							className={[cellClass, segment === 'meridiem' ? 'w-9 h-7' : 'w-6 h-7', disabled ? 'pointer-events-none' : ''].join(' ')}
						>
							{valueText}
						</div>
					</div>
				);
			})}
		</div>
	);
};

TimeField.displayName = 'TimeField';

export default TimeField;
