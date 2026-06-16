'use client';;
import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComboboxOption
{
	value:     string;
	label:     string;
	disabled?: boolean;
}

export type ComboboxSize = 'sm' | 'md';

export interface ComboboxSingleProps
{
	options:      ComboboxOption[];
	value?:       string;
	onChange?:    (value: string) => void;
	multiple?:    false;
	placeholder?: string;
	label?:       string;
	hint?:        string;
	error?:       string;
	size?:        ComboboxSize;
	disabled?:    boolean;
	className?:   string;
}

export interface ComboboxMultiProps
{
	options:      ComboboxOption[];
	value?:       string[];
	onChange?:    (value: string[]) => void;
	multiple:     true;
	placeholder?: string;
	label?:       string;
	hint?:        string;
	error?:       string;
	size?:        ComboboxSize;
	disabled?:    boolean;
	className?:   string;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultiProps;

// ─── Size maps ────────────────────────────────────────────────────────────────

const INPUT_SIZE: Record<ComboboxSize, string> = {
	sm: 'px-2.5 py-1 text-xs',
	md: 'px-3 py-2 text-sm',
};

const OPTION_SIZE: Record<ComboboxSize, string> = {
	sm: 'px-2.5 py-1 text-xs',
	md: 'px-3 py-2 text-sm',
};

const getFilteredOptions = (options: ComboboxOption[], query: string) => {
	if(!query) return options;
	const q = query.toLowerCase();
	return options.filter((o) => o.label.toLowerCase().includes(q));
};

const highlightMatch = (label: string, query: string) => {
	if(!query) return <span>{label}</span>;

	const lower   = label.toLowerCase();
	const qLower  = query.toLowerCase();
	const matchAt = lower.indexOf(qLower);

	if(matchAt === -1) return <span>{label}</span>;

	const before = label.slice(0, matchAt);
	const match  = label.slice(matchAt, matchAt + query.length);
	const after  = label.slice(matchAt + query.length);

	return (
		<span>
			{before}
			<span className='text-brand font-semibold'>{match}</span>
			{after}
		</span>
	);
};

// ─── Combobox ─────────────────────────────────────────────────────────────────

export const Combobox = (props: ComboboxProps) => {
    const {
		options,
		placeholder = 'Search…',
		label,
		hint,
		error,
		size      = 'md',
		disabled  = false,
		className = '',
	} = props;

    const isMulti = props.multiple === true;

    const [inputValue,  setInputValue]  = useState('');
    const [mounted,     setMounted]     = useState(false);
    const [visible,     setVisible]     = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const inputRef    = useRef<HTMLInputElement>(null);
    const listRef     = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const id      = useId();
    const listId  = `${id}-listbox`;

    const selectedValues: string[] = isMulti
		? (props.value ?? [])
		: props.value
			? [props.value]
			: [];

    const filtered = getFilteredOptions(options, inputValue);

    const openList = () => {
		if(disabled) return;
		setMounted(true);
	};

    useEffect(() =>
	{
		if(!mounted) return;
		requestAnimationFrame(() => setVisible(true));
	}, [mounted]);

    const closeList = (returnFocus = true) => {
		setVisible(false);
		setActiveIndex(-1);
		setTimeout(() => setMounted(false), 150);
		if(returnFocus) inputRef.current?.focus();
	};

    useEffect(() =>
	{
        if(!mounted) return;

        const onPointerDown = (e: PointerEvent) => {
			if(!containerRef.current?.contains(e.target as Node))
				closeList(false);
		};

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [mounted]);

    useEffect(() =>
	{
		if(!mounted || !listRef.current || activeIndex < 0) return;
		const opt = listRef.current.children[activeIndex] as HTMLElement | undefined;
		opt?.scrollIntoView?.({ block: 'nearest' });
	}, [activeIndex, mounted]);

    const selectOption = (option: ComboboxOption) => {
		if(option.disabled) return;

		if(isMulti)
		{
			const current = props.value ?? [];
			const already = current.includes(option.value);
			const next    = already
				? current.filter((v) => v !== option.value)
				: [...current, option.value];
			props.onChange?.(next);
			setInputValue('');
			setActiveIndex(-1);
			inputRef.current?.focus();
		}
		else
		{
			props.onChange?.(option.value);
			setInputValue(option.label);
			closeList();
		}
	};

    const removePill = (value: string) => {
		if(!isMulti) return;
		const current = props.value ?? [];
		props.onChange?.(current.filter((v) => v !== value));
	};

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setActiveIndex(-1);
		if(!mounted) setMounted(true);
	};

    const handleInputFocus = () => {
		if(!mounted) openList();
	};

    const nextEnabledIndex = (from: number, direction: 1 | -1) => {
		const len = filtered.length;
		let i = from;

		for(let step = 0; step < len; step++)
		{
			i = (i + direction + len) % len;
			if(!filtered[i].disabled) return i;
		}

		return -1;
	};

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		switch(e.key)
		{
			case 'ArrowDown':
				e.preventDefault();
				if(!mounted)
				{
					openList();
					return;
				}
				setActiveIndex((i) => nextEnabledIndex(i, 1));
				break;

			case 'ArrowUp':
				e.preventDefault();
				if(!mounted)
				{
					openList();
					return;
				}
				setActiveIndex((i) => nextEnabledIndex(i === -1 ? 0 : i, -1));
				break;

			case 'Home':
				e.preventDefault();
				setActiveIndex(nextEnabledIndex(-1, 1));
				break;

			case 'End':
				e.preventDefault();
				setActiveIndex(nextEnabledIndex(filtered.length, -1));
				break;

			case 'Enter':
				e.preventDefault();
				if(activeIndex >= 0 && filtered[activeIndex])
					selectOption(filtered[activeIndex]);
				break;

			case 'Escape':
				e.preventDefault();
				if(mounted)
					closeList();
				else
					setInputValue('');
				break;

			case 'Tab':
				if(mounted) closeList(false);
				break;

			case 'Backspace':
				if(isMulti && inputValue === '')
				{
					const current = props.value ?? [];
					if(current.length > 0)
						props.onChange?.(current.slice(0, -1));
				}
				break;
		}
	};

    const activeDescendant = activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined;

    const inputSizeClasses  = INPUT_SIZE[size];
    const optionSizeClasses = OPTION_SIZE[size];

    const pills = isMulti
		? (props.value ?? []).map((v) => options.find((o) => o.value === v)).filter(Boolean) as ComboboxOption[]
		: [];

    return (
		<div className={['flex flex-col gap-1.5 w-full', className].join(' ')}>
			{label && (
				<label
					htmlFor={`${id}-input`}
					className='text-sm font-medium text-text'
				>
					{label}
				</label>
			)}

			<div ref={containerRef} className='relative'>

				{isMulti && pills.length > 0 && (
					<div
						aria-label='Selected options'
						className='flex flex-wrap gap-1 mb-1.5'
					>
						{pills.map((pill) => (
							<span
								key={pill.value}
								className='inline-flex items-center gap-1 rounded-[var(--radius)] bg-surface-active text-text px-2 py-0.5 text-xs font-medium'
							>
								{pill.label}
								<button
									type='button'
									aria-label={`Remove ${pill.label}`}
									disabled={disabled}
									onClick={() => removePill(pill.value)}
									className='ml-0.5 rounded-sm text-text-muted hover:text-text focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-ring disabled:pointer-events-none motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]'
								>
									<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
										<path d='M18 6 6 18M6 6l12 12' />
									</svg>
								</button>
							</span>
						))}
					</div>
				)}

				<div className='relative flex items-center'>
					<input
						ref={inputRef}
						id={`${id}-input`}
						type='text'
						role='combobox'
						aria-expanded={mounted}
						aria-autocomplete='list'
						aria-controls={listId}
						aria-activedescendant={activeDescendant}
						aria-invalid={!!error}
						autoComplete='off'
						disabled={disabled}
						value={inputValue}
						placeholder={placeholder}
						onChange={handleInputChange}
						onFocus={handleInputFocus}
						onKeyDown={handleInputKeyDown}
						className={[
							'w-full rounded-[var(--radius)] border-[length:var(--border-width)] bg-surface text-text outline-none',
							'placeholder:text-text-subtle',
							'motion-safe:transition-[border-color,box-shadow] motion-safe:duration-[var(--duration-fast)]',
							'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
							inputSizeClasses,
							error
								? 'border-danger'
								: 'border-input-border hover:border-input-border-hover',
							disabled ? 'opacity-50 cursor-not-allowed pointer-events-none bg-input-disabled-bg text-input-disabled-text' : '',
						].join(' ')}
					/>
					<div
						aria-hidden='true'
						className={[
							'pointer-events-none absolute right-2.5 text-text-muted shrink-0',
							'motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)]',
							mounted ? 'rotate-180' : '',
						].join(' ')}
					>
						<svg
							width={size === 'sm' ? 12 : 14}
							height={size === 'sm' ? 12 : 14}
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='m6 9 6 6 6-6' />
						</svg>
					</div>
				</div>

				{mounted && (
					<ul
						ref={listRef}
						id={listId}
						role='listbox'
						aria-label='Options'
						aria-multiselectable={isMulti || undefined}
						tabIndex={-1}
						className={[
							'absolute z-50 top-full mt-1 left-0 right-0 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
							'overflow-y-auto max-h-60 py-2 outline-none',
							'motion-safe:transition-all motion-safe:duration-[var(--duration-fast)] origin-top',
							visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
						].join(' ')}
					>
						{filtered.length === 0 ? (
							<li
								role='option'
								aria-selected={false}
								aria-disabled='true'
								className={['px-3 py-2 text-sm text-text-muted select-none', optionSizeClasses].join(' ')}
							>
								No options
							</li>
						) : (
							filtered.map((opt, i) =>
							{
								const isActive   = i === activeIndex;
								const isSelected = selectedValues.includes(opt.value);

								return (
									<li
										key={opt.value}
										id={`${id}-opt-${i}`}
										role='option'
										aria-selected={isSelected}
										aria-disabled={opt.disabled}
										onPointerDown={(e) => { e.preventDefault(); selectOption(opt); }}
										onPointerEnter={() => { if(!opt.disabled) setActiveIndex(i); }}
										className={[
											'flex items-center justify-between mx-1 rounded-[var(--radius-sm)] select-none',
											'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
											optionSizeClasses,
											opt.disabled
												? 'opacity-50 cursor-not-allowed text-text-muted'
												: isActive
													? 'bg-surface-active text-text cursor-pointer'
													: 'text-text-muted hover:bg-surface-hover hover:text-text cursor-pointer',
										].join(' ')}
									>
										<span className={isSelected && !opt.disabled ? 'font-medium text-text' : ''}>
											{highlightMatch(opt.label, inputValue)}
										</span>
										{isSelected && !opt.disabled && (
											<svg
												width='13'
												height='13'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2.5'
												strokeLinecap='round'
												strokeLinejoin='round'
												aria-hidden='true'
												className='text-brand shrink-0 ml-2'
											>
												<path d='M20 6 9 17l-5-5' />
											</svg>
										)}
									</li>
								);
							})
						)}
					</ul>
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

export default Combobox;
