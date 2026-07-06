'use client';

import { cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps
{
	content:    ReactNode;
	children:   ReactElement<HTMLAttributes<HTMLElement>>;
	side?:      TooltipSide;
	delay?:     number;
	className?: string;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

export const Tooltip = (
    {
        content,
        children,
        side      = 'top',
        delay     = 300,
        className = '',
    }: TooltipProps
) => {
    const [mounted,  setMounted]  = useState(false);
    const [visible,  setVisible]  = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const triggerRef  = useRef<HTMLElement>(null);
    const panelRef    = useRef<HTMLSpanElement>(null);
    const openTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

    const id        = useId();
    const tooltipId = `${id}-tooltip`;

    const calcPosition = useCallback(() =>
    {
        if(!triggerRef.current) return;
        const t = triggerRef.current.getBoundingClientRect();
        const p = panelRef.current?.getBoundingClientRect() ?? { width: 0, height: 0 };
        const GAP = 6;
        let top = 0, left = t.left + (t.width - p.width) / 2;

        if(side === 'top')         top = t.top - p.height - GAP;
        else if(side === 'bottom') top = t.bottom + GAP;
        else if(side === 'left')   { left = t.left - p.width - GAP; top = t.top + (t.height - p.height) / 2; }
        else                       { left = t.right + GAP;          top = t.top + (t.height - p.height) / 2; }

        const vw = window.innerWidth, vh = window.innerHeight;
        top  = Math.max(8, Math.min(top,  vh - (p.height || 0) - 8));
        left = Math.max(8, Math.min(left, vw - (p.width  || 0) - 8));

        setPosition({ top, left });
    }, [side]);

    const show = (withDelay: boolean) => {
		if(hideTimer.current) clearTimeout(hideTimer.current);
		if(openTimer.current) clearTimeout(openTimer.current);

		if(withDelay && delay > 0)
			openTimer.current = setTimeout(() => setMounted(true), delay);
		else
			setMounted(true);
	};

    const hide = () => {
		if(openTimer.current) clearTimeout(openTimer.current);
		setVisible(false);
		if(hideTimer.current) clearTimeout(hideTimer.current);
		hideTimer.current = setTimeout(() => setMounted(false), 150);
	};

    useEffect(() =>
	{
		if(!mounted) return;
		requestAnimationFrame(() =>
		{
			calcPosition();
			setVisible(true);
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

        const onKeyDown = (e: globalThis.KeyboardEvent) => {
			if(e.key === 'Escape') hide();
		};

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [mounted]);

    useEffect(() =>
	{
		return () =>
		{
			if(openTimer.current) clearTimeout(openTimer.current);
			if(hideTimer.current) clearTimeout(hideTimer.current);
		};
	}, []);

    const trigger = isValidElement(children)
		? cloneElement(children as ReactElement<HTMLAttributes<HTMLElement>>, {
			'aria-describedby': mounted ? tooltipId : undefined,
		})
		: children;

    return (
		<span
			ref={triggerRef}
			className={['inline-flex', className].join(' ')}
			onMouseEnter={() => show(true)}
			onMouseLeave={() => hide()}
			onFocus={() => show(false)}
			onBlur={() => hide()}
		>
			{trigger}

			{mounted && createPortal(
				<span
					ref={panelRef}
					id={tooltipId}
					role='tooltip'
					style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50 }}
					className={[
						'pointer-events-none select-none whitespace-nowrap',
						'rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface-panel px-2.5 py-1 text-xs text-text shadow-[var(--shadow)] backdrop-blur-[var(--backdrop-blur)]',
						// Only animate opacity/transform — top/left are set from a post-mount
						// getBoundingClientRect() measurement, and must snap instantly or the
						// panel visibly slides in from its unmeasured {0,0} starting position.
						'transition-[opacity,transform]',
						visible
							? 'opacity-100 scale-100 duration-[var(--duration-base)] ease-[var(--ease-enter)]'
							: 'opacity-0 scale-95 duration-[var(--duration-fast)] ease-[var(--ease-exit)]',
					].join(' ')}
				>
					{content}
				</span>,
				document.body
			)}
		</span>
	);
};

export default Tooltip;
