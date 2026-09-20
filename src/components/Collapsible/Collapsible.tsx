'use client';

import { createContext, useContext, useState, HTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

interface CollapsibleContextValue {
	isOpen:   boolean;
	toggle:   () => void;
	disabled: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

const useCollapsibleContext = () => {
	const ctx = useContext(CollapsibleContext);
	if(!ctx) throw new Error('CollapsibleTrigger and CollapsibleContent must be used inside <Collapsible>');
	return ctx;
};

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
	open?:           boolean;
	defaultOpen?:    boolean;
	onOpenChange?:   (open: boolean) => void;
	disabled?:       boolean;
	className?:      string;
	children:        ReactNode;
}

const Collapsible = (
    {
        open,
        defaultOpen = false,
        onOpenChange,
        disabled = false,
        className = '',
        children,
        ...props
    }: CollapsibleProps
) => {
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open! : internalOpen;

	const toggle = () => {
		if(disabled) return;
		const next = !isOpen;
		if(!isControlled) setInternalOpen(next);
		onOpenChange?.(next);
	};

	return (
		<CollapsibleContext.Provider value={{ isOpen, toggle, disabled }}>
			<div
				data-state={isOpen ? 'open' : 'closed'}
				className={className}
				{...props}
			>
				{children}
			</div>
		</CollapsibleContext.Provider>
	);
};

export default Collapsible;

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	className?: string;
	children:   ReactNode;
}

export const CollapsibleTrigger = (
    { className = '', children, ...props }: CollapsibleTriggerProps
) => {
	const { isOpen, toggle, disabled } = useCollapsibleContext();

	return (
		<button
			type='button'
			aria-expanded={isOpen}
			disabled={disabled}
			onClick={toggle}
			className={`flex w-full items-center justify-between -mx-3 rounded-[var(--radius)] px-3 py-3 text-sm font-medium text-text transition-colors duration-150 hover:text-text-muted focus:outline-none focus-visible:bg-surface-hover focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brand-ring/40 disabled:pointer-events-none disabled:opacity-40 ${className}`}
			{...props}
		>
			{children}
			<svg
				width='16'
				height='16'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
				aria-hidden='true'
				className={`shrink-0 text-text-muted motion-safe:transition-transform motion-safe:duration-200 ${isOpen ? 'rotate-180' : ''}`}
			>
				<path d='m6 9 6 6 6-6' />
			</svg>
		</button>
	);
};

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
}

export const CollapsibleContent = (
    { className = '', children, ...props }: CollapsibleContentProps
) => {
	const { isOpen } = useCollapsibleContext();

	return (
		<div
			role='region'
			aria-hidden={!isOpen}
			className='motion-safe:grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200'
			style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
			{...props}
		>
			<div className={`overflow-hidden ${isOpen ? 'pb-3' : ''} ${className}`}>
				<div className='text-sm text-text-muted leading-relaxed'>
					{children}
				</div>
			</div>
		</div>
	);
};
