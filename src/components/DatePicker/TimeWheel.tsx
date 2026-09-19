'use client';

import { KeyboardEvent, useLayoutEffect, useRef } from 'react';

type ColumnKey = 'hour' | 'minute' | 'second' | 'meridiem';

export interface TimeWheelProps
{
	hour:      number;
	minute:    number;
	second:    number;
	onChange:  (next: { hour: number; minute: number; second: number }) => void;
	onClose:   (returnFocus?: boolean) => void;
	id?:       string;
	className?: string;
}

const COLUMNS: ColumnKey[] = ['hour', 'minute', 'second', 'meridiem'];

// Hour/minute/second scroll as an endless loop (above 00 is 59); AM/PM is only two values, so
// it stays a plain finite list rather than looping.
const WRAPPING_COLUMNS = new Set<ColumnKey>(['hour', 'minute', 'second']);

const COLUMN_LABEL: Record<ColumnKey, string> = {
	hour:     'Hours',
	minute:   'Minutes',
	second:   'Seconds',
	meridiem: 'AM or PM',
};

const ROW_HEIGHT       = 32;
const VISIBLE_ROWS     = 5;
const PAD_ROWS         = (VISIBLE_ROWS - 1) / 2;
const SCROLL_SETTLE_MS = 120;

const pad2 = (n: number) => String(n).padStart(2, '0');

const HOUR_OPTIONS     = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTE_OPTIONS   = Array.from({ length: 60 }, (_, i) => i);
const MERIDIEM_OPTIONS = ['AM', 'PM'] as const;

const optionsFor = (col: ColumnKey) => (col === 'hour' ? HOUR_OPTIONS : col === 'meridiem' ? MERIDIEM_OPTIONS : MINUTE_OPTIONS);

const labelFor = (col: ColumnKey, value: number | string) => (col === 'meridiem' ? String(value) : pad2(Number(value)));

const wrapMod = (n: number, len: number) => ((n % len) + len) % len;

const prefersReducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TimeWheel = (
	{
		hour,
		minute,
		second,
		onChange,
		onClose,
		id,
		className = '',
	}: TimeWheelProps
) => {
	const hour12   = hour % 12 === 0 ? 12 : hour % 12;
	const meridiem = hour < 12 ? 'AM' : 'PM';

	const indices: Record<ColumnKey, number> = {
		hour:     hour12 - 1,
		minute,
		second,
		meridiem: meridiem === 'AM' ? 0 : 1,
	};

	const colRefs      = useRef<Record<ColumnKey, HTMLDivElement | null>>({ hour: null, minute: null, second: null, meridiem: null });
	const settleTimers = useRef<Record<ColumnKey, ReturnType<typeof setTimeout> | null>>({ hour: null, minute: null, second: null, meridiem: null });

	// Instantly (no animation) align every column with the current value on first mount — wrapping
	// columns start in the middle repeat of the tripled list so they have room to loop either way —
	// then focus Hours.
	useLayoutEffect(() =>
	{
		COLUMNS.forEach((col) =>
		{
			const el = colRefs.current[col];
			if(!el) return;
			const len = optionsFor(col).length;
			const raw = WRAPPING_COLUMNS.has(col) ? len + indices[col] : indices[col];
			el.scrollTop = raw * ROW_HEIGHT;
		});
		colRefs.current.hour?.focus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useLayoutEffect(() =>
	{
		const timers = settleTimers.current;
		return () => COLUMNS.forEach((col) =>
		{
			if(timers[col]) clearTimeout(timers[col]!);
		});
	}, []);

	const commitIndex = (col: ColumnKey, index: number) => {
		if(col === 'hour')
		{
			const h12       = index + 1;
			const normalized = h12 % 12;
			onChange({ hour: meridiem === 'PM' ? normalized + 12 : normalized, minute, second });
			return;
		}

		if(col === 'minute')
		{
			onChange({ hour, minute: index, second });
			return;
		}

		if(col === 'second')
		{
			onChange({ hour, minute, second: index });
			return;
		}

		const wantPM = index === 1;
		const isPM   = hour >= 12;
		if(wantPM === isPM) return;
		onChange({ hour: wantPM ? hour + 12 : hour - 12, minute, second });
	};

	const rawIndexFromScroll = (col: ColumnKey) => {
		const el = colRefs.current[col];
		return el ? Math.round(el.scrollTop / ROW_HEIGHT) : 0;
	};

	const scrollToRaw = (col: ColumnKey, raw: number, animate: boolean) => {
		const el = colRefs.current[col];
		if(!el) return;

		if(!animate || typeof el.scrollTo !== 'function')
		{
			el.scrollTop = raw * ROW_HEIGHT;
			return;
		}

		el.scrollTo({ top: raw * ROW_HEIGHT, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
	};

	// Selecting a value by its exact rendered (raw) position keeps the scroll animation short —
	// it moves to whichever repeat of the list is already nearest, not always back to a canonical copy.
	const selectRaw = (col: ColumnKey, raw: number) => {
		const len = optionsFor(col).length;
		commitIndex(col, wrapMod(raw, len));
		scrollToRaw(col, raw, true);
	};

	// Native CSS scroll-snap already settles the column on the nearest row after a drag/wheel
	// gesture; this just waits for scroll events to go quiet, then commits whatever row ended up
	// centered, and — for wrapping columns — silently re-centers the scroll position back into the
	// middle repeat of the list so the loop never runs out of room in either direction.
	const handleScroll = (col: ColumnKey) => () => {
		if(settleTimers.current[col]) clearTimeout(settleTimers.current[col]!);
		settleTimers.current[col] = setTimeout(() =>
		{
			const el  = colRefs.current[col];
			const len = optionsFor(col).length;
			if(!el) return;

			if(!WRAPPING_COLUMNS.has(col))
			{
				const index = Math.min(len - 1, Math.max(0, Math.round(el.scrollTop / ROW_HEIGHT)));
				commitIndex(col, index);
				return;
			}

			const raw = Math.round(el.scrollTop / ROW_HEIGHT);
			commitIndex(col, wrapMod(raw, len));

			if(raw < len || raw >= len * 2) el.scrollTop = (wrapMod(raw, len) + len) * ROW_HEIGHT;
		}, SCROLL_SETTLE_MS);
	};

	const moveFocus = (fromIndex: number, delta: 1 | -1) => {
		const nextIndex = fromIndex + delta;
		if(nextIndex < 0 || nextIndex >= COLUMNS.length) return;
		colRefs.current[COLUMNS[nextIndex]]?.focus();
	};

	const handleColumnKeyDown = (colIndex: number, col: ColumnKey) => (e: KeyboardEvent<HTMLDivElement>) => {
		const len     = optionsFor(col).length;
		const wraps   = WRAPPING_COLUMNS.has(col);
		const current = indices[col];

		switch(e.key)
		{
			case 'ArrowUp':
				e.preventDefault();
				if(wraps) selectRaw(col, rawIndexFromScroll(col) - 1);
				else selectRaw(col, current === 0 ? len - 1 : current - 1);
				break;

			case 'ArrowDown':
				e.preventDefault();
				if(wraps) selectRaw(col, rawIndexFromScroll(col) + 1);
				else selectRaw(col, current === len - 1 ? 0 : current + 1);
				break;

			case 'Home':
				e.preventDefault();
				selectRaw(col, wraps ? Math.floor(rawIndexFromScroll(col) / len) * len : 0);
				break;

			case 'End':
				e.preventDefault();
				selectRaw(col, wraps ? Math.floor(rawIndexFromScroll(col) / len) * len + (len - 1) : len - 1);
				break;

			case 'ArrowLeft':
				e.preventDefault();
				moveFocus(colIndex, -1);
				break;

			case 'ArrowRight':
				e.preventDefault();
				moveFocus(colIndex, 1);
				break;

			case 'Enter':
			case 'Escape':
				e.preventDefault();
				onClose(true);
				break;

			case 'Tab':
				if(colIndex === COLUMNS.length - 1 && !e.shiftKey) onClose(false);
				break;
		}
	};

	return (
		<div
			id={id}
			role='dialog'
			aria-label='Select time'
			className={[
				'relative flex items-stretch gap-0.5 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)] p-2',
				className,
			].join(' ')}
		>
			{/* Center-row highlight spanning all columns */}
			<div
				aria-hidden='true'
				className='absolute left-2 right-2 rounded-[var(--radius-sm)] bg-surface-hover pointer-events-none'
				style={{ top: 8 + PAD_ROWS * ROW_HEIGHT, height: ROW_HEIGHT }}
			/>

			{COLUMNS.map((col, colIndex) =>
			{
				const options    = optionsFor(col);
				const wraps      = WRAPPING_COLUMNS.has(col);
				const rendered   = wraps ? [...options, ...options, ...options] : options;
				const activeRaw  = wraps ? options.length + indices[col] : indices[col];

				return (
					<div key={col} className='flex items-center'>
						{(col === 'minute' || col === 'second') && (
							<span aria-hidden='true' className='text-text-muted relative z-10 mx-0.5' style={{ marginTop: PAD_ROWS * ROW_HEIGHT }}>:</span>
						)}

						<div
							ref={(el) => { colRefs.current[col] = el; }}
							role='listbox'
							tabIndex={0}
							aria-label={COLUMN_LABEL[col]}
							aria-activedescendant={`${id}-${col}-${activeRaw}`}
							onKeyDown={handleColumnKeyDown(colIndex, col)}
							onScroll={handleScroll(col)}
							className='relative z-10 overflow-y-auto snap-y snap-mandatory scrollbar-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ring rounded-[var(--radius-sm)]'
							style={{
								height:         ROW_HEIGHT * VISIBLE_ROWS,
								width:          col === 'meridiem' ? 40 : 32,
								maskImage:      'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
								WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
							}}
						>
							<div style={{ height: PAD_ROWS * ROW_HEIGHT }} />

							{rendered.map((opt, i) =>
							{
								const isSelected = wrapMod(i, options.length) === indices[col];

								return (
									<div
										key={i}
										id={`${id}-${col}-${i}`}
										role='option'
										aria-selected={isSelected}
										onClick={() => selectRaw(col, i)}
										className={[
											'flex items-center justify-center text-sm select-none cursor-pointer snap-center',
											isSelected ? 'text-text font-semibold' : 'text-text-muted',
										].join(' ')}
										style={{ height: ROW_HEIGHT, scrollSnapAlign: 'center' }}
									>
										{labelFor(col, opt)}
									</div>
								);
							})}

							<div style={{ height: PAD_ROWS * ROW_HEIGHT }} />
						</div>
					</div>
				);
			})}
		</div>
	);
};

TimeWheel.displayName = 'TimeWheel';

export default TimeWheel;
