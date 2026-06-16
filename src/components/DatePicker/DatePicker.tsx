'use client';;
import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DatePickerProps
{
	value?:       Date | null;
	onChange?:    (date: Date) => void;
	placeholder?: string;
	min?:         Date;
	max?:         Date;
	disabled?:    boolean;
	label?:       string;
	hint?:        string;
	error?:       string;
	className?:   string;
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

export const DatePicker = (
    {
        value,
        onChange,
        placeholder = 'Pick a date',
        min,
        max,
        disabled    = false,
        label,
        hint,
        error,
        className   = '',
    }: DatePickerProps
) => {
    const [mounted,       setMounted]       = useState(false);
    const [visible,       setVisible]       = useState(false);
    const [viewYear,      setViewYear]      = useState(() => (value ?? new Date()).getFullYear());
    const [viewMonth,     setViewMonth]     = useState(() => (value ?? new Date()).getMonth());
    const [focusedDay,    setFocusedDay]    = useState<number | null>(null);

    const triggerRef  = useRef<HTMLButtonElement>(null);
    const popupRef    = useRef<HTMLDivElement>(null);
    const gridRef     = useRef<HTMLDivElement>(null);
    const buttonRefs  = useRef<Map<string, HTMLButtonElement>>(new Map());

    const id       = useId();
    const popupId  = `${id}-popup`;
    const gridId   = `${id}-grid`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openPopup = () => {
		if(disabled) return;

		const base = value ?? today;
		setViewYear(base.getFullYear());
		setViewMonth(base.getMonth());
		setFocusedDay(base.getDate());
		setMounted(true);
	};

    useEffect(() =>
	{
		if(!mounted) return;
		requestAnimationFrame(() => setVisible(true));
	}, [mounted]);

    useEffect(() =>
	{
		if(focusedDay === null || !mounted) return;
		const frame = requestAnimationFrame(() =>
		{
			const key = `${viewYear}-${viewMonth}-${focusedDay}`;
			buttonRefs.current.get(key)?.focus();
		});
		return () => cancelAnimationFrame(frame);
	}, [focusedDay, viewYear, viewMonth, mounted]);

    const closePopup = (returnFocus = true) => {
		setVisible(false);
		setTimeout(() => setMounted(false), 150);
		if(returnFocus) triggerRef.current?.focus();
	};

    useEffect(() =>
	{
        if(!mounted) return;

        const onPointerDown = (e: PointerEvent) => {
			if(
				!triggerRef.current?.contains(e.target as Node) &&
				!popupRef.current?.contains(e.target as Node)
			)
				closePopup(false);
		};

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [mounted]);

    const selectDate = (day: number) => {
		const selected = new Date(viewYear, viewMonth, day);
		onChange?.(selected);
		closePopup();
	};

    const isDisabledDate = (year: number, month: number, day: number) => {
		const d = new Date(year, month, day);
		if(min)
		{
			const minClean = new Date(min);
			minClean.setHours(0, 0, 0, 0);
			if(d < minClean) return true;
		}
		if(max)
		{
			const maxClean = new Date(max);
			maxClean.setHours(0, 0, 0, 0);
			if(d > maxClean) return true;
		}
		return false;
	};

    const moveFocus = (delta: number) => {
		if(focusedDay === null) return;

		const current  = new Date(viewYear, viewMonth, focusedDay);
		const next     = new Date(current.getTime() + delta * 86400000);

		setViewYear(next.getFullYear());
		setViewMonth(next.getMonth());
		setFocusedDay(next.getDate());
	};

    const handleGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		switch(e.key)
		{
			case 'ArrowLeft':
				e.preventDefault();
				moveFocus(-1);
				break;

			case 'ArrowRight':
				e.preventDefault();
				moveFocus(1);
				break;

			case 'ArrowUp':
				e.preventDefault();
				moveFocus(-7);
				break;

			case 'ArrowDown':
				e.preventDefault();
				moveFocus(7);
				break;

			case 'Home':
				e.preventDefault();
				if(focusedDay !== null)
				{
					const d = new Date(viewYear, viewMonth, focusedDay);
					moveFocus(-(d.getDay()));
				}
				break;

			case 'End':
				e.preventDefault();
				if(focusedDay !== null)
				{
					const d = new Date(viewYear, viewMonth, focusedDay);
					moveFocus(6 - d.getDay());
				}
				break;

			case 'PageUp':
				e.preventDefault();
				setViewMonth((m) =>
				{
					const next = m - 1;
					if(next < 0)
					{
						setViewYear((y) => y - 1);
						return 11;
					}
					return next;
				});
				break;

			case 'PageDown':
				e.preventDefault();
				setViewMonth((m) =>
				{
					const next = m + 1;
					if(next > 11)
					{
						setViewYear((y) => y + 1);
						return 0;
					}
					return next;
				});
				break;

			case 'Enter':
			case ' ':
				e.preventDefault();
				if(focusedDay !== null && !isDisabledDate(viewYear, viewMonth, focusedDay))
					selectDate(focusedDay);
				break;

			case 'Escape':
				e.preventDefault();
				closePopup();
				break;

			case 'Tab':
				closePopup(false);
				break;
		}
	};

    const prevMonth = () => {
		setViewMonth((m) =>
		{
			if(m === 0)
			{
				setViewYear((y) => y - 1);
				return 11;
			}
			return m - 1;
		});
	};

    const nextMonth = () => {
		setViewMonth((m) =>
		{
			if(m === 11)
			{
				setViewYear((y) => y + 1);
				return 0;
			}
			return m + 1;
		});
	};

    const formattedValue = value ? formatDate(value) : null;
    const monthLabel     = `${MONTHS[viewMonth]} ${viewYear}`;
    const gridCells      = buildCalendarGrid(viewYear, viewMonth);

    return (
		<div className={['flex flex-col gap-1.5 w-full', className].join(' ')}>
			{label && (
				<label htmlFor={`${id}-trigger`} className='text-sm font-medium text-text'>
					{label}
				</label>
			)}

			<div className='relative'>
				<button
					ref={triggerRef}
					id={`${id}-trigger`}
					type='button'
					disabled={disabled}
					aria-haspopup='dialog'
					aria-expanded={mounted}
					aria-controls={popupId}
					onClick={openPopup}
					className={[
						'w-full flex items-center justify-between rounded-[var(--radius)] border-[length:var(--border-width)] px-3 py-2 text-sm',
						'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
						'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
						error
							? 'border-danger bg-surface text-text'
							: 'border-input-border bg-surface text-text hover:border-brand',
						disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
					].join(' ')}
				>
					<span className={formattedValue ? 'text-text' : 'text-text-subtle'}>
						{formattedValue ?? placeholder}
					</span>
					<CalendarIcon />
				</button>

				{mounted && (
					<div
						ref={popupRef}
						id={popupId}
						role='dialog'
						aria-label='Date picker'
						className={[
							'absolute z-50 top-full mt-1 left-0 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
							'p-3 w-72 outline-none',
							'motion-safe:transition-[opacity,transform] motion-safe:duration-[var(--duration-fast)] origin-top',
							visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
						].join(' ')}
					>
						{/* Month / year header */}
						<div className='flex items-center justify-between mb-3'>
							<button
								type='button'
								onClick={prevMonth}
								aria-label='Previous month'
								className={[
									'flex items-center justify-center w-7 h-7 rounded-[var(--radius)] text-text-muted',
									'hover:bg-surface-hover hover:text-text',
									'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring',
									'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
								].join(' ')}
							>
								<ChevronLeft />
							</button>

							<span className='text-sm font-medium text-text select-none'>
								{monthLabel}
							</span>

							<button
								type='button'
								onClick={nextMonth}
								aria-label='Next month'
								className={[
									'flex items-center justify-center w-7 h-7 rounded-[var(--radius)] text-text-muted',
									'hover:bg-surface-hover hover:text-text',
									'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring',
									'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
								].join(' ')}
							>
								<ChevronRight />
							</button>
						</div>

						{/* Day-of-week column headers */}
						<div
							role='grid'
							id={gridId}
							aria-label={monthLabel}
							ref={gridRef}
							tabIndex={-1}
							onKeyDown={handleGridKeyDown}
							className='outline-none'
						>
							<div className='grid grid-cols-7 mb-1' role='row'>
								{DAY_LABELS.map((d) => (
									<div
										key={d.abbr}
										role='columnheader'
										aria-label={d.full}
										className='flex items-center justify-center h-8 text-xs font-medium text-text-muted select-none'
									>
										<abbr title={d.full} className='no-underline'>
											{d.abbr}
										</abbr>
									</div>
								))}
							</div>

							{/* Day grid rows */}
							{chunkWeeks(gridCells).map((week, wi) => (
								<div key={wi} role='row' className='grid grid-cols-7'>
									{week.map((cell) =>
									{
										const { day, month, year, isCurrentMonth } = cell;
										const cellDate    = new Date(year, month, day);
										const isToday     = isSameDay(cellDate, today);
										const isSelected  = value ? isSameDay(cellDate, value) : false;
										const isFocused   = focusedDay === day && month === viewMonth && year === viewYear;
										const isDisabled  = isDisabledDate(year, month, day);
										const dateLabel   = `${day} ${MONTHS[month]} ${year}`;

										return (
											<div
												key={`${year}-${month}-${day}`}
												role='gridcell'
												aria-selected={isSelected}
												aria-disabled={isDisabled}
											>
												<button
													type='button'
													ref={(el) =>
													{
														const key = `${year}-${month}-${day}`;
														if(el) buttonRefs.current.set(key, el);
														else   buttonRefs.current.delete(key);
													}}
													tabIndex={isFocused ? 0 : -1}
													disabled={isDisabled}
													aria-label={dateLabel}
													aria-current={isToday ? 'date' : undefined}
													onClick={() => !isDisabled && selectDate(day)}
													className={[
														'flex items-center justify-center w-full h-8 rounded-[var(--radius)] text-sm',
														'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
														'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring',
														isDisabled
															? 'opacity-30 cursor-not-allowed pointer-events-none'
															: 'cursor-pointer',
														!isCurrentMonth && !isDisabled
															? 'opacity-30'
															: '',
														isSelected
															? 'bg-brand text-brand-fg font-medium'
															: isToday && !isDisabled
																? 'ring-2 ring-brand-ring ring-offset-1 text-text hover:bg-surface-hover'
																: !isDisabled
																	? 'text-text hover:bg-surface-hover'
																	: 'text-text',
													].join(' ')}
												>
													{day}
												</button>
											</div>
										);
									})}
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{error ? (
				<p className='text-xs text-danger'>{error}</p>
			) : hint ? (
				<p className='text-xs text-text-muted'>{hint}</p>
			) : null}
		</div>
	);
};

export default DatePicker;

const CalendarIcon = () => {
	return (
		<svg
			width='15'
			height='15'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
			className='text-text-muted shrink-0'
		>
			<rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
			<line x1='16' y1='2' x2='16' y2='6' />
			<line x1='8' y1='2' x2='8' y2='6' />
			<line x1='3' y1='10' x2='21' y2='10' />
		</svg>
	);
};

const ChevronLeft = () => {
	return (
		<svg
			width='14'
			height='14'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			<path d='m15 18-6-6 6-6' />
		</svg>
	);
};

const ChevronRight = () => {
	return (
		<svg
			width='14'
			height='14'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			<path d='m9 18 6-6-6-6' />
		</svg>
	);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = [
	{ abbr: 'Su', full: 'Sunday' },
	{ abbr: 'Mo', full: 'Monday' },
	{ abbr: 'Tu', full: 'Tuesday' },
	{ abbr: 'We', full: 'Wednesday' },
	{ abbr: 'Th', full: 'Thursday' },
	{ abbr: 'Fr', full: 'Friday' },
	{ abbr: 'Sa', full: 'Saturday' },
];

interface CalendarCell
{
	day:            number;
	month:          number;
	year:           number;
	isCurrentMonth: boolean;
}

const buildCalendarGrid = (year: number, month: number) => {
	const firstDay    = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const prevMonth   = month === 0  ? 11 : month - 1;
	const prevYear    = month === 0  ? year - 1 : year;
	const daysInPrev  = new Date(prevYear, prevMonth + 1, 0).getDate();

	const nextMonth   = month === 11 ? 0  : month + 1;
	const nextYear    = month === 11 ? year + 1 : year;

	const cells: CalendarCell[] = [];

	for(let i = firstDay - 1; i >= 0; i--)
		cells.push({ day: daysInPrev - i, month: prevMonth, year: prevYear, isCurrentMonth: false });

	for(let d = 1; d <= daysInMonth; d++)
		cells.push({ day: d, month, year, isCurrentMonth: true });

	const remaining = (7 - (cells.length % 7)) % 7;
	for(let d = 1; d <= remaining; d++)
		cells.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });

	return cells;
};

const chunkWeeks = (cells: CalendarCell[]) => {
	const weeks: CalendarCell[][] = [];
	for(let i = 0; i < cells.length; i += 7)
		weeks.push(cells.slice(i, i + 7));
	return weeks;
};

const isSameDay = (a: Date, b: Date) => {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth()    === b.getMonth()    &&
		a.getDate()     === b.getDate()
	);
};

const formatDate = (date: Date) => {
	const month = MONTHS[date.getMonth()].slice(0, 3);
	const day   = date.getDate();
	const year  = date.getFullYear();
	return `${month} ${day}, ${year}`;
};
