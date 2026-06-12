'use client';

import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

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

// ─── Placement map ────────────────────────────────────────────────────────────

const SIDE: Record<TooltipSide, string> = {
	top:    'bottom-full left-1/2 -translate-x-1/2 mb-1.5 origin-bottom',
	bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5 origin-top',
	left:   'right-full top-1/2 -translate-y-1/2 mr-1.5 origin-right',
	right:  'left-full top-1/2 -translate-y-1/2 ml-1.5 origin-left',
};

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
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const id        = useId();
    const tooltipId = `${id}-tooltip`;

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
		requestAnimationFrame(() => setVisible(true));
	}, [mounted]);

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
		// Merging the child's own handlers/aria props is required for the
		// cloneElement wrapper pattern — no refs are read here.
		// eslint-disable-next-line react-hooks/refs
		? cloneElement(children, {
			'aria-describedby': mounted ? tooltipId : children.props['aria-describedby'],
			onMouseEnter: (e) => { children.props.onMouseEnter?.(e); show(true);  },
			onMouseLeave: (e) => { children.props.onMouseLeave?.(e); hide();      },
			onFocus:      (e) => { children.props.onFocus?.(e);      show(false); },
			onBlur:       (e) => { children.props.onBlur?.(e);       hide();      },
		} satisfies HTMLAttributes<HTMLElement>)
		: children;

    return (
		<span className={['relative inline-flex', className].join(' ')}>
			{trigger}

			{mounted && (
				<span
					id={tooltipId}
					role='tooltip'
					className={[
						'absolute z-50 pointer-events-none select-none whitespace-nowrap',
						'rounded-md border border-surface-border bg-surface px-2.5 py-1 text-xs text-text shadow-md',
						'transition-all',
						SIDE[side],
						visible
							? 'opacity-100 scale-100 duration-[var(--duration-base)] ease-[var(--ease-enter)]'
							: 'opacity-0 scale-95 duration-[var(--duration-fast)] ease-[var(--ease-exit)]',
					].join(' ')}
				>
					{content}
				</span>
			)}
		</span>
	);
};

export default Tooltip;
