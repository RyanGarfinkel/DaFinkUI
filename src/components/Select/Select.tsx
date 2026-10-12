'use client';

import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

export interface SelectOption {
	value: string;
	label: string;
}

export type SelectSize = 'sm' | 'md';

export interface SelectProps {
	options:      SelectOption[];
	value?:       string;
	onChange?:    (value: string) => void;
	placeholder?: string;
	label?:       string;
	hint?:        string;
	error?:       string;
	size?:        SelectSize;
	disabled?:    boolean;
	className?:   string;
	/** Extra classes on the trigger button itself, for a consumer restyling the control (e.g. a borderless-until-hover look inline in a table cell). `className` only reaches the outer wrapper. */
	triggerClassName?: string;
	/** Accessible name for the trigger when there's no visible `label` (e.g. a compact inline use like a table cell). */
	'aria-label'?: string;
}

const SIZE: Record<SelectSize, string> = {
	sm: 'px-2.5 py-1 text-xs gap-1.5',
	md: 'px-3 py-2 text-sm gap-2',
};

export const Select = (
    {
        options,
        value,
        onChange,
        placeholder = 'Select…',
        label,
        hint,
        error,
        size        = 'md',
        disabled    = false,
        className   = '',
        triggerClassName = '',
        'aria-label': ariaLabel,
    }: SelectProps
) => {
    const [mounted,     setMounted]     = useState(false);
    const [visible,     setVisible]     = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [typeahead,   setTypeahead]   = useState('');

    const triggerRef      = useRef<HTMLButtonElement>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const listRef         = useRef<HTMLUListElement>(null);
    const typeaheadTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

    const id        = useId();
    const listboxId = `${id}-listbox`;

    const selectedIdx   = options.findIndex((o) => o.value === value);
    const selectedLabel = selectedIdx >= 0 ? options[selectedIdx].label : null;

    useEffect(() => () => clearTimeout(closeTimerRef.current), []);

    const openList = () => {
		if(disabled) return;
		clearTimeout(closeTimerRef.current);
		setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
		setMounted(true);
	};

    useEffect(() =>
	{
		if(!mounted) return;
		requestAnimationFrame(() =>
		{
			setVisible(true);
			listRef.current?.focus();
		});
	}, [mounted]);

    useEffect(() =>
	{
		if(!mounted || !listRef.current) return;
		const opt = listRef.current.children[activeIndex] as HTMLElement | undefined;
		opt?.scrollIntoView?.({ block: 'nearest' });
	}, [activeIndex, mounted]);

    const closeList = (returnFocus = true) => {
		setVisible(false);
		if(typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
		setTypeahead('');
		clearTimeout(closeTimerRef.current);
		closeTimerRef.current = setTimeout(() => setMounted(false), 150);
		if(returnFocus) triggerRef.current?.focus();
	};

    const selectOption = (index: number) => {
		const opt = options[index];
		if(!opt) return;
		onChange?.(opt.value);
		closeList();
	};

    useEffect(() =>
	{
        if(!mounted) return;

        const onPointerDown = (e: PointerEvent) => {
			if(
				!triggerRef.current?.contains(e.target as Node) &&
				!listRef.current?.contains(e.target as Node)
			)
				closeList(false);
		};

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [mounted]);

    const handleListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
		switch(e.key)
		{
			case 'ArrowDown':
				e.preventDefault();
				setActiveIndex((i) => (i + 1) % options.length);
				break;

			case 'ArrowUp':
				e.preventDefault();
				setActiveIndex((i) => (i - 1 + options.length) % options.length);
				break;

			case 'Home':
				e.preventDefault();
				setActiveIndex(0);
				break;

			case 'End':
				e.preventDefault();
				setActiveIndex(options.length - 1);
				break;

			case 'Enter':
			case ' ':
				e.preventDefault();
				selectOption(activeIndex);
				break;

			case 'Escape':
				e.preventDefault();
				closeList();
				break;

			case 'Tab':
				closeList(false);
				break;

			default:
				if(e.key.length !== 1) break;

				const next = typeahead + e.key.toLowerCase();
				setTypeahead(next);

				if(typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
				typeaheadTimer.current = setTimeout(() => setTypeahead(''), 500);

				for(let i = 1; i <= options.length; i++)
				{
					const idx = (activeIndex + i) % options.length;
					if(options[idx].label.toLowerCase().startsWith(next))
					{
						setActiveIndex(idx);
						break;
					}
				}
		}
	};

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
					aria-haspopup='listbox'
					aria-expanded={mounted}
					aria-controls={listboxId}
					aria-label={ariaLabel}
					onClick={openList}
					className={[
						'w-full flex items-center justify-between rounded-[var(--radius)] border-[length:var(--border-width)]',
						'motion-safe:transition-shadow motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
						'focus:outline-none shadow-[var(--inner-shadow)] focus-visible:shadow-[var(--input-focus-shadow)]',
						SIZE[size],
						error
							? 'border-danger bg-surface text-text'
							: 'border-input-border bg-surface text-text hover:border-input-border-hover',
						disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
						triggerClassName,
					].join(' ')}
				>
					<span className={selectedLabel ? 'text-text' : 'text-text-subtle'}>
						{selectedLabel ?? placeholder}
					</span>
					<svg
						width={size === 'sm' ? 12 : 14}
						height={size === 'sm' ? 12 : 14}
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						aria-hidden='true'
						className={[
							'text-text-muted shrink-0 transition-transform duration-[var(--duration-fast)]',
							mounted ? 'rotate-180' : '',
						].join(' ')}
					>
						<path d='m6 9 6 6 6-6' />
					</svg>
				</button>

				{mounted && (
					<ul
						ref={listRef}
						id={listboxId}
						role='listbox'
						tabIndex={-1}
						aria-label={ariaLabel ?? label ?? placeholder}
						aria-activedescendant={`${id}-opt-${activeIndex}`}
						onKeyDown={handleListKeyDown}
						className={[
							'absolute z-50 top-full mt-1 left-0 min-w-full rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
							'overflow-x-hidden overflow-y-auto max-h-60 py-2 outline-none',
							'transition-all duration-[var(--duration-fast)] origin-top',
							visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
						].join(' ')}
					>
						{options.map((opt, i) =>
						{
							const isActive   = i === activeIndex;
							const isSelected = opt.value === value;

							return (
								<li
									key={opt.value}
									id={`${id}-opt-${i}`}
									role='option'
									aria-selected={isSelected}
									onPointerDown={(e) => { e.preventDefault(); selectOption(i); }}
									onPointerEnter={() => setActiveIndex(i)}
									className={[
										'flex items-center justify-between mx-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm cursor-pointer select-none',
										'transition-colors duration-[var(--duration-fast)]',
										isActive
											? 'bg-surface-active text-text'
											: 'text-text-muted hover:bg-surface-hover hover:text-text',
									].join(' ')}
								>
									<span className={isSelected ? 'font-medium text-text' : ''}>
										{opt.label}
									</span>
									{isSelected && (
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
											className='text-brand shrink-0'
										>
											<path d='M20 6 9 17l-5-5' />
										</svg>
									)}
								</li>
							);
						})}
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

export default Select;
