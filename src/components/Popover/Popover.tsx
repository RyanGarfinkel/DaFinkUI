'use client';

import { KeyboardEvent, FocusEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
    const [mounted,  setMounted]  = useState(false);
    const [visible,  setVisible]  = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef   = useRef<HTMLDivElement>(null);

    const id      = useId();
    const panelId = `${id}-panel`;

    const calcPosition = useCallback(() =>
    {
        if(!triggerRef.current) return;
        const t = triggerRef.current.getBoundingClientRect();
        const p = panelRef.current?.getBoundingClientRect() ?? { width: 0, height: 0 };
        const GAP = 8;
        let top = 0, left = 0;

        if(side === 'bottom')      top = t.bottom + GAP;
        else if(side === 'top')    top = t.top - p.height - GAP;
        else if(side === 'left')   top = t.top;
        else                       top = t.top;

        if(side === 'bottom' || side === 'top')
        {
            if(align === 'start')        left = t.left;
            else if(align === 'center')  left = t.left + (t.width - p.width) / 2;
            else                         left = t.right - p.width;
        }
        else if(side === 'left')  left = t.left - p.width - GAP;
        else                      left = t.right + GAP;

        if(side === 'left' || side === 'right')
        {
            if(align === 'center')   top = t.top + (t.height - p.height) / 2;
            else if(align === 'end') top = t.bottom - p.height;
        }

        const vw = window.innerWidth, vh = window.innerHeight;
        top  = Math.max(8, Math.min(top,  vh - (p.height || 0) - 8));
        left = Math.max(8, Math.min(left, vw - (p.width  || 0) - 8));

        setPosition({ top, left });
    }, [side, align]);

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
			calcPosition();
			setVisible(true);
			const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
			(first ?? panelRef.current)?.focus();
		});
	}, [mounted, calcPosition]);

    useEffect(() =>
	{
		if(!mounted) return;
		window.addEventListener('resize', calcPosition);
		window.addEventListener('scroll', calcPosition, true);
		return () =>
		{
			window.removeEventListener('resize', calcPosition);
			window.removeEventListener('scroll', calcPosition, true);
		};
	}, [mounted, calcPosition]);

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
		<span className='inline-flex'>
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
					'inline-flex items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-input-border bg-input px-3 py-2 text-sm text-text',
					'transition-colors duration-[var(--duration-fast)]',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
					disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:border-brand',
					triggerClassName,
				].join(' ')}
			>
				{trigger}
			</button>

			{mounted && createPortal(
				<div
					ref={panelRef}
					id={panelId}
					role='dialog'
					tabIndex={-1}
					aria-label={label}
					onKeyDown={handlePanelKeyDown}
					onBlur={handlePanelBlur}
					style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50 }}
					className={[
						'min-w-56 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-4 shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)] outline-none',
						'transition-[opacity,transform]',
						visible
							? 'opacity-100 scale-100 duration-[var(--duration-base)] ease-[var(--ease-enter)]'
							: 'opacity-0 scale-95 duration-[var(--duration-fast)] ease-[var(--ease-exit)]',
						className,
					].join(' ')}
				>
					{children}
				</div>,
				document.body
			)}
		</span>
	);
};

export default Popover;
