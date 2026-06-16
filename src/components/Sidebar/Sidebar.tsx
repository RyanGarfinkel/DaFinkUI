'use client';

import { HTMLAttributes, KeyboardEvent, ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link, { LinkProps } from 'next/link';

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export interface SidebarProps extends HTMLAttributes<HTMLElement>
{
	width?:  string;
	height?: string;
}

export const Sidebar = (
    { width = 'w-56', height = 'h-full', className = '', children, onKeyDown, ...props }: SidebarProps
) => {
    const sidebarRef   = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const initialized  = useRef(false);
    const pathname     = usePathname();

    useEffect(() =>
    {
        if(!sidebarRef.current) return;
        const links = Array.from(
            sidebarRef.current.querySelectorAll<HTMLAnchorElement>('a[href]')
        );
        const rover = links.find(l => l.getAttribute('aria-current') === 'page') ?? links[0];
        links.forEach(l => { l.tabIndex = l === rover ? 0 : -1; });
    }, []);

    useEffect(() =>
    {
        const sidebar   = sidebarRef.current;
        const indicator = indicatorRef.current;
        if(!sidebar || !indicator) return;

        const active = sidebar.querySelector<HTMLElement>('[aria-current="page"]');
        if(!active) return;

        if(!initialized.current)
        {
            indicator.style.transition = 'none';
            indicator.style.top        = `${active.offsetTop}px`;
            indicator.style.height     = `${active.offsetHeight}px`;
            indicator.getBoundingClientRect();
            indicator.style.transition = '';
            initialized.current        = true;
        }
        else
        {
            indicator.style.top    = `${active.offsetTop}px`;
            indicator.style.height = `${active.offsetHeight}px`;
        }
    }, [pathname]);

    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) =>
    {
        if(!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;

        const links = Array.from(
            e.currentTarget.querySelectorAll<HTMLAnchorElement>('a[href]')
        );
        if(!links.length) return;

        const index = links.findIndex(l => l === document.activeElement);
        e.preventDefault();

        let next: HTMLAnchorElement;
        if(e.key === 'ArrowDown')      next = links[(index + 1) % links.length];
        else if(e.key === 'ArrowUp')   next = links[(index - 1 + links.length) % links.length];
        else if(e.key === 'Home')      next = links[0];
        else                            next = links[links.length - 1];

        links.forEach(l => { l.tabIndex = -1; });
        next.tabIndex = 0;
        next.focus();

        onKeyDown?.(e);
    };

    return (
        <aside
            {...props}
            ref={sidebarRef}
            onKeyDown={handleKeyDown}
            className={['overflow-y-auto scrollbar-hover border-r-[length:var(--border-width)] border-surface-border bg-surface', height, width, className].join(' ')}
        >
            <div className='relative px-3 py-6 flex flex-col gap-6'>
                <div
                    ref={indicatorRef}
                    aria-hidden='true'
                    className='absolute inset-x-3 rounded-[var(--radius)] bg-surface-active pointer-events-none motion-safe:transition-[top,height] motion-safe:duration-200 motion-safe:ease-[var(--ease-standard)]'
                >
                    <span className='absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-brand' />
                </div>
                {children}
            </div>
        </aside>
    );
};

// ─── SidebarSection ───────────────────────────────────────────────────────────

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement>
{
	label?: string;
}

export const SidebarSection = ({ label, className = '', children, ...props }: SidebarSectionProps) => {
	return (
		<div {...props} className={['flex flex-col gap-1', className].join(' ')}>
			{label && (
				<span className='px-3 text-xs font-medium text-text-subtle uppercase tracking-wide mb-1'>
					{label}
				</span>
			)}
			{children}
		</div>
	);
};

// ─── SidebarLink ─────────────────────────────────────────────────────────────

export interface SidebarLinkProps extends LinkProps
{
	isActive?:  boolean;
	className?: string;
	children?:  ReactNode;
}

export const SidebarLink = ({ isActive = false, className = '', children, ...props }: SidebarLinkProps) => {
	return (
		<Link
			{...props}
			aria-current={isActive ? 'page' : undefined}
			className={[
				'relative z-10 flex items-center rounded-[var(--radius)] px-3 py-1.5 text-sm',
				'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
				isActive
					? 'text-text font-medium'
					: 'text-text-muted hover:bg-surface-hover hover:text-text',
				className,
			].join(' ')}
		>
			{children}
		</Link>
	);
};

// ─── SidebarDivider ───────────────────────────────────────────────────────────

export const SidebarDivider = ({ className = '', ...props }: HTMLAttributes<HTMLHRElement>) => {
	return (
		<hr
			{...props}
			className={['border-t-[length:var(--border-width)] border-surface-border my-1', className].join(' ')}
		/>
	);
};

export default Sidebar;
