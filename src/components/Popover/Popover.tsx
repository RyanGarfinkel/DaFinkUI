'use client';

import { KeyboardEvent, FocusEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopoverSide  = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps
{
	trigger:           ReactNode;
	children:          ReactNode;
	side?:             PopoverSide;
	align?:            PopoverAlign;
	label?:            string;
	onOpenChange?:     (open: boolean) => void;
	disabled?:         boolean;
	className?:        string;
	triggerClassName?: string;
}

// ─── Placement maps ───────────────────────────────────────────────────────────

const SIDE: Record<PopoverSide, string> = {
	top:    'bottom-full mb-2 origin-bottom',
	bottom: 'top-full mt-2 origin-top',
	left:   'right-full mr-2 origin-right',
	right:  'left-full ml-2 origin-left',
};

const ALIGN: Record<PopoverSide, Record<PopoverAlign, string>> = {
	top:    { start: 'left-0', center: 'left-1/2 -translate-x-1/2', end: 'right-0'  },
	bottom: { start: 'left-0', center: 'left-1/2 -translate-x-1/2', end: 'right-0'  },
	left:   { start: 'top-0',  center: 'top-1/2 -translate-y-1/2',  end: 'bottom-0' },
	right:  { start: 'top-0',  center: 'top-1/2 -translate-y-1/2',  end: 'bottom-0' },
};

const FOCUSABLE = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(', ');

// ─── Popover ──────────────────────────────────────────────────────────────────

export const Popover = (
    {
        trigger,
        children,
        side             = 'bottom',
        align            = 'center',
        label,
        onOpenChange,
        disabled         = false,
        className        = '',
        triggerClassName = '',
    }: PopoverProps
) => {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef   = useRef<HTMLDivElement>(null);

    const id      = useId();
    const panelId = `${id}-panel`;

    const openPopover = () => {
		if(disabled) return;
		setMounted(true);
		onOpenChange?.(true);
	};

    const closePopover = useCallback((returnFocus = true) => {
		setVisible(false);
		setTimeout(() => setMounted(false), 150);
		onOpenChange?.(false);
		if(returnFocus) triggerRef.current?.focus();
	}, [onOpenChange]);

    useEffect(() =>
	{
		if(!mounted) return;
		requestAnimationFrame(() =>
		{
			setVisible(true);
			const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
			(first ?? panelRef.current)?.focus();
		});
	}, [mounted]);

    useEffect(() =>
	{
        if(!mounted) return;

        const onPointerDown = (e: PointerEvent) => {
			if(
				!triggerRef.current?.contains(e.target as Node) &&
				!panelRef.current?.contains(e.target as Node)
			)
				closePopover(false);
		};

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [mounted, closePopover]);

    const handlePanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if(e.key !== 'Escape') return;
		e.preventDefault();
		e.stopPropagation();
		closePopover();
	};

    const handlePanelBlur = (e: FocusEvent<HTMLDivElement>) => {
		const next = e.relatedTarget as Node | null;
		if(!next) return;
		if(panelRef.current?.contains(next) || triggerRef.current?.contains(next)) return;
		closePopover(false);
	};

    return (
		<span className='relative inline-flex'>
			<button
				ref={triggerRef}
				id={`${id}-trigger`}
				type='button'
				disabled={disabled}
				aria-haspopup='dialog'
				aria-expanded={mounted}
				aria-controls={mounted ? panelId : undefined}
				onClick={() => (mounted ? closePopover() : openPopover())}
				className={[
					'inline-flex items-center gap-2 rounded-md border border-input-border bg-input px-3 py-2 text-sm text-text',
					'transition-colors duration-[var(--duration-fast)]',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
					disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:border-brand',
					triggerClassName,
				].join(' ')}
			>
				{trigger}
			</button>

			{mounted && (
				<div
					ref={panelRef}
					id={panelId}
					role='dialog'
					tabIndex={-1}
					aria-label={label}
					onKeyDown={handlePanelKeyDown}
					onBlur={handlePanelBlur}
					className={[
						'absolute z-50 min-w-56 rounded-lg border border-surface-border bg-surface p-4 shadow-lg outline-none',
						'transition-all',
						SIDE[side],
						ALIGN[side][align],
						visible
							? 'opacity-100 scale-100 duration-[var(--duration-base)] ease-[var(--ease-enter)]'
							: 'opacity-0 scale-95 duration-[var(--duration-fast)] ease-[var(--ease-exit)]',
						className,
					].join(' ')}
				>
					{children}
				</div>
			)}
		</span>
	);
};

export default Popover;
