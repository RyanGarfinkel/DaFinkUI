'use client';

import { createContext, useContext, useRef, useEffect, useState, HTMLAttributes, ButtonHTMLAttributes } from 'react';

interface TabsContextValue {
	value: string;
	onValueChange: (v: string) => void;
	rovingValue: string;
	setRovingValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
	const ctx = useContext(TabsContext);
	if(!ctx) throw new Error('Tabs subcomponents must be used inside <Tabs>');
	return ctx;
};

export interface TabsProps {
	value: string;
	onValueChange: (v: string) => void;
	children: React.ReactNode;
	className?: string;
}

export const Tabs = ({ value, onValueChange, children, className = '' }: TabsProps) => {
	const [rovingValue, setRovingValue] = useState(value);

	useEffect(() =>
	{
		setRovingValue(value);
	}, [value]);

	return (
		<TabsContext.Provider value={{ value, onValueChange, rovingValue, setRovingValue }}>
			<div className={className}>
				{children}
			</div>
		</TabsContext.Provider>
	);
};

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
}

export const TabsList = ({ children, className = '', ...props }: TabsListProps) => {
	const { value, setRovingValue } = useTabsContext();
	const listRef      = useRef<HTMLDivElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	const initialized  = useRef(false);

	useEffect(() =>
	{
		const list      = listRef.current;
		const indicator = indicatorRef.current;
		if(!list || !indicator) return;

		const active = list.querySelector<HTMLElement>('[aria-selected="true"]');
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
	}, [value]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const triggers = Array.from(
			listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []
		);
		if(triggers.length < 2) return;

		const idx = triggers.indexOf(document.activeElement as HTMLButtonElement);
		if(idx === -1) return;

		let next: HTMLButtonElement | undefined;

		if(e.key === 'ArrowRight')
		{
			e.preventDefault();
			next = triggers[(idx + 1) % triggers.length];
		}
		else if(e.key === 'ArrowLeft')
		{
			e.preventDefault();
			next = triggers[(idx - 1 + triggers.length) % triggers.length];
		}
		else if(e.key === 'Home')
		{
			e.preventDefault();
			next = triggers[0];
		}
		else if(e.key === 'End')
		{
			e.preventDefault();
			next = triggers[triggers.length - 1];
		}

		if(!next) return;

		const nextValue = next.dataset.value;
		if(!nextValue) return;

		setRovingValue(nextValue);
		next.focus();
	};

	return (
		<div
			role='tablist'
			ref={listRef}
			onKeyDown={handleKeyDown}
			className={`relative border-b-[length:var(--border-width)] border-surface-border flex gap-1 ${className}`}
			{...props}
		>
			{children}
			<div
				ref={indicatorRef}
				aria-hidden='true'
				className='absolute bottom-0 h-0.5 bg-brand motion-safe:transition-[left,width] motion-safe:duration-200'
			/>
		</div>
	);
};

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	value: string;
	children: React.ReactNode;
	className?: string;
}

export const TabsTrigger = ({ value, children, className = '', disabled, ...props }: TabsTriggerProps) => {
	const { value: activeValue, onValueChange, rovingValue } = useTabsContext();
	const isActive = activeValue === value;

	const baseClasses   = 'relative px-4 py-2 text-sm rounded-t-[var(--radius)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring disabled:pointer-events-none disabled:opacity-40';
	const stateClasses  = isActive
		? 'text-text font-medium'
		: 'text-text-muted hover:text-text';

	return (
		<button
			role='tab'
			aria-selected={isActive}
			aria-controls={`panel-${value}`}
			id={`trigger-${value}`}
			data-value={value}
			disabled={disabled}
			tabIndex={rovingValue === value ? 0 : -1}
			className={`${baseClasses} ${stateClasses} ${className}`}
			onClick={() => onValueChange(value)}
			{...props}
		>
			{children}
		</button>
	);
};

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
	value: string;
	children: React.ReactNode;
	className?: string;
}

export const TabsContent = ({ value, children, className = '', ...props }: TabsContentProps) => {
	const { value: activeValue } = useTabsContext();

	if(activeValue !== value) return null;

	return (
		<div
			role='tabpanel'
			id={`panel-${value}`}
			aria-labelledby={`trigger-${value}`}
			className={`pt-4 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};
