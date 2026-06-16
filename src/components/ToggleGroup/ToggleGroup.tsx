'use client';

import { createContext, useContext, useRef, useEffect, useState, ButtonHTMLAttributes } from 'react';

export type ToggleGroupType = 'single' | 'multiple';
export type ToggleGroupSize = 'sm' | 'md' | 'lg';

interface ToggleGroupContextValue
{
	type:           ToggleGroupType;
	value:          string | string[];
	onValueChange:  (value: string | string[]) => void;
	size:           ToggleGroupSize;
	disabled:       boolean;
	rovingValue:    string | null;
	setRovingValue: (v: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

const useToggleGroupContext = () =>
{
	const ctx = useContext(ToggleGroupContext);
	if(!ctx) throw new Error('ToggleGroupItem must be used inside a ToggleGroup');
	return ctx;
};

export interface ToggleGroupProps
{
	type:               ToggleGroupType;
	value:              string | string[];
	onValueChange:      (value: string | string[]) => void;
	size?:              ToggleGroupSize;
	disabled?:          boolean;
	className?:         string;
	children:           React.ReactNode;
	'aria-label'?:      string;
	'aria-labelledby'?: string;
}

export interface ToggleGroupItemProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	value:      string;
	disabled?:  boolean;
	children:   React.ReactNode;
	className?: string;
}

const sizeClasses: Record<ToggleGroupSize, string> = {
	sm: 'h-8 px-3 text-xs',
	md: 'h-9 px-4 text-sm',
	lg: 'h-11 px-5 text-base',
};

const ITEM_BASE = 'group relative z-10 inline-flex items-center justify-center font-medium tracking-tight transition-colors duration-150 focus:outline-none disabled:pointer-events-none disabled:opacity-40';

export const ToggleGroupItem = (
	{
		value,
		disabled  = false,
		children,
		className = '',
		...props
	}: ToggleGroupItemProps
) =>
{
	const ctx = useToggleGroupContext();

	const isActive = ctx.type === 'single'
		? ctx.value === value
		: Array.isArray(ctx.value) && ctx.value.includes(value);

	const isDisabled = disabled || ctx.disabled;

	const handleClick = () =>
	{
		if(isDisabled) return;

		ctx.setRovingValue(value);

		if(ctx.type === 'single')
		{
			ctx.onValueChange(value);
		}
		else
		{
			const current = Array.isArray(ctx.value) ? ctx.value : [];
			const next    = current.includes(value)
				? current.filter(v => v !== value)
				: [...current, value];
			ctx.onValueChange(next);
		}
	};

	const stateClasses = ctx.type === 'single'
		? isActive
			? 'text-brand-fg'
			: 'text-text'
		: isActive
			? 'bg-brand text-brand-fg'
			: 'bg-surface text-text border-r-[length:var(--border-width)] border-surface-border last:border-r-0';

	return (
		<button
			type='button'
			data-value={value}
			aria-pressed={isActive}
			disabled={isDisabled}
			tabIndex={ctx.rovingValue === value ? 0 : -1}
			onClick={handleClick}
			className={`${ITEM_BASE} ${sizeClasses[ctx.size]} ${stateClasses} ${className}`}
			{...props}
		>
			<span
				aria-hidden='true'
				className={[
					'absolute inset-y-[5px] inset-x-1 rounded-[max(0px,calc(var(--radius)_-_0.25rem))] transition-[box-shadow,background-color] duration-150',
					isActive
						? 'group-hover:backdrop-brightness-[0.82] group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-brand-ring group-focus-visible:[--tw-ring-offset-color:var(--color-surface)]'
						: 'group-hover:bg-input-border group-focus-visible:ring-2 group-focus-visible:ring-brand-ring',
				].join(' ')}
			/>
			<span className='relative'>{children}</span>
		</button>
	);
};

export const ToggleGroup = (
	{
		type,
		value,
		onValueChange,
		size      = 'md',
		disabled  = false,
		className = '',
		children,
		'aria-label':      ariaLabel,
		'aria-labelledby': ariaLabelledBy,
	}: ToggleGroupProps
) =>
{
	const groupRef     = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	const initialized  = useRef(false);

	const [rovingValue, setRovingValue] = useState<string | null>(
		type === 'single' && typeof value === 'string' ? value || null : null
	);

	useEffect(() =>
	{
		if(type === 'single' && typeof value === 'string' && value)
		{
			const id = setTimeout(() => setRovingValue(value), 0);
			return () => clearTimeout(id);
		}
	}, [value, type]);

	useEffect(() =>
	{
		if(rovingValue !== null) return;
		const first = groupRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
		if(first?.dataset.value)
		{
			const val = first.dataset.value;
			const id = setTimeout(() => setRovingValue(val), 0);
			return () => clearTimeout(id);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() =>
	{
		if(type !== 'single') return;
		const group     = groupRef.current;
		const indicator = indicatorRef.current;
		if(!group || !indicator) return;

		const active = group.querySelector<HTMLElement>('[aria-pressed="true"]');
		if(!active) return;

		const X = 4;

		if(!initialized.current)
		{
			indicator.style.transition = 'none';
			indicator.style.left       = `${active.offsetLeft + X}px`;
			indicator.style.width      = `${active.offsetWidth - X * 2}px`;
			indicator.getBoundingClientRect();
			indicator.style.transition = '';
			initialized.current        = true;
		}
		else
		{
			indicator.style.left  = `${active.offsetLeft + X}px`;
			indicator.style.width = `${active.offsetWidth - X * 2}px`;
		}
	}, [value, type]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) =>
	{
		const buttons = Array.from(
			groupRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []
		);
		if(buttons.length < 2) return;

		const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
		if(idx === -1) return;

		let next: HTMLButtonElement | undefined;

		if(e.key === 'ArrowRight' || e.key === 'ArrowDown')
		{
			e.preventDefault();
			next = buttons[(idx + 1) % buttons.length];
		}
		else if(e.key === 'ArrowLeft' || e.key === 'ArrowUp')
		{
			e.preventDefault();
			next = buttons[(idx - 1 + buttons.length) % buttons.length];
		}
		else if(e.key === 'Home')
		{
			e.preventDefault();
			next = buttons[0];
		}
		else if(e.key === 'End')
		{
			e.preventDefault();
			next = buttons[buttons.length - 1];
		}

		if(!next) return;

		const nextValue = next.dataset.value;
		if(!nextValue) return;

		setRovingValue(nextValue);
		next.focus();
	};

	return (
		<ToggleGroupContext.Provider value={{ type, value, onValueChange, size, disabled, rovingValue, setRovingValue: (v) => setRovingValue(v) }}>
			<div
				role='group'
				ref={groupRef}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				onKeyDown={handleKeyDown}
				className={`relative inline-flex items-center rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--inner-shadow)] backdrop-blur-[var(--backdrop-blur)] overflow-hidden ${className}`}
			>
				{type === 'single' && (
					<div
						ref={indicatorRef}
						aria-hidden='true'
						className='absolute inset-y-[5px] rounded-[max(0px,calc(var(--radius)_-_0.25rem))] bg-brand shadow-[var(--shadow-sm)] motion-safe:transition-[left,width,box-shadow] motion-safe:duration-200'
					/>
				)}
				{children}
			</div>
		</ToggleGroupContext.Provider>
	);
};

export default ToggleGroup;
