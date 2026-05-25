'use client';;
import { createContext, useContext, useRef, useEffect, ButtonHTMLAttributes } from 'react';

export type ToggleGroupType = 'single' | 'multiple';
export type ToggleGroupSize = 'sm' | 'md' | 'lg';

interface ToggleGroupContextValue
{
	type: ToggleGroupType;
	value: string | string[];
	onValueChange: (value: string | string[]) => void;
	size: ToggleGroupSize;
	disabled: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

const useToggleGroupContext = () => {
	const ctx = useContext(ToggleGroupContext);
	if(!ctx) throw new Error('ToggleGroupItem must be used inside a ToggleGroup');
	return ctx;
};

export interface ToggleGroupProps
{
	type: ToggleGroupType;
	value: string | string[];
	onValueChange: (value: string | string[]) => void;
	size?: ToggleGroupSize;
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
}

export interface ToggleGroupItemProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	value: string;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
}

const sizeClasses: Record<ToggleGroupSize, string> = {
	sm: 'h-8 px-3 text-xs',
	md: 'h-9 px-4 text-sm',
	lg: 'h-11 px-5 text-base',
};

const ITEM_BASE = 'relative z-10 inline-flex items-center justify-center font-medium tracking-tight transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring disabled:pointer-events-none disabled:opacity-40';

export const ToggleGroupItem = (
    {
        value,
        disabled = false,
        children,
        className = '',
        ...props
    }: ToggleGroupItemProps
) => {
	const ctx = useToggleGroupContext();

	const isActive = ctx.type === 'single'
		? ctx.value === value
		: Array.isArray(ctx.value) && ctx.value.includes(value);

	const isDisabled = disabled || ctx.disabled;

	const handleClick = () =>
	{
		if(isDisabled) return;

		if(ctx.type === 'single')
		{
			ctx.onValueChange(value);
		}
		else
		{
			const current = Array.isArray(ctx.value) ? ctx.value : [];
			const next = current.includes(value)
				? current.filter(v => v !== value)
				: [...current, value];
			ctx.onValueChange(next);
		}
	};

	const stateClasses = ctx.type === 'single'
		? isActive
			? 'text-brand-fg'
			: 'text-text hover:bg-surface-active'
		: isActive
			? 'bg-brand text-brand-fg'
			: 'bg-surface text-text hover:bg-surface-hover border-r border-surface-border last:border-r-0';

	return (
		<button
			type='button'
			aria-pressed={isActive}
			disabled={isDisabled}
			onClick={handleClick}
			className={`${ITEM_BASE} ${sizeClasses[ctx.size]} ${stateClasses} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

export const ToggleGroup = (
    {
        type,
        value,
        onValueChange,
        size = 'md',
        disabled = false,
        className = '',
        children,
    }: ToggleGroupProps
) => {
	const groupRef     = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	const initialized  = useRef(false);

	useEffect(() =>
	{
		if(type !== 'single') return;
		const group     = groupRef.current;
		const indicator = indicatorRef.current;
		if(!group || !indicator) return;

		const active = group.querySelector<HTMLElement>('[aria-pressed="true"]');
		if(!active) return;

		if(!initialized.current)
		{
			indicator.style.transition = 'none';
			indicator.style.left       = `${active.offsetLeft}px`;
			indicator.style.width      = `${active.offsetWidth}px`;
			indicator.getBoundingClientRect();
			indicator.style.transition = '';
			initialized.current = true;
		}
		else
		{
			indicator.style.left  = `${active.offsetLeft}px`;
			indicator.style.width = `${active.offsetWidth}px`;
		}
	}, [value, type]);

	return (
		<ToggleGroupContext.Provider value={{ type, value, onValueChange, size, disabled }}>
			<div
				role='group'
				ref={groupRef}
				className={`relative inline-flex items-center rounded-md border border-surface-border bg-surface overflow-hidden ${className}`}
			>
				{type === 'single' && (
					<div
						ref={indicatorRef}
						aria-hidden='true'
						className='absolute top-0 h-full bg-brand motion-safe:transition-[left,width] motion-safe:duration-200'
					/>
				)}
				{children}
			</div>
		</ToggleGroupContext.Provider>
	);
};

export default ToggleGroup;
