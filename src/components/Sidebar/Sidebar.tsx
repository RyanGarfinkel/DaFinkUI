'use client';

import { Children, HTMLAttributes, KeyboardEvent, ReactNode, createContext, isValidElement, useContext, useEffect, useRef, useState } from 'react';
import ScrollFade from '../ScrollFade/ScrollFade';
import { usePathname } from 'next/navigation';
import Link, { LinkProps } from 'next/link';
import Tooltip from '../Tooltip/Tooltip';

const SidebarCollapsedContext = createContext(false);

export const useSidebarCollapsed = () => useContext(SidebarCollapsedContext);

// ─── Sidebar ────────────────────────────────────────────────────────────────

export type SidebarTogglePosition = 'top' | 'middle' | 'bottom';

const TOGGLE_POSITION_CLASSES: Record<SidebarTogglePosition, string> = {
	// Centers the (h-6) toggle on the bottom edge of a standard h-14 (56px) MenuBar,
	// so it sits right at the intersection of the sidebar's and top bar's borders.
	top:    'top-11',
	middle: 'top-1/2 -translate-y-1/2',
	bottom: 'bottom-6',
};

export interface SidebarProps extends HTMLAttributes<HTMLElement>
{
	width?:             string;
	height?:            string;
	collapsedWidth?:    string;
	collapsible?:       boolean;
	collapsed?:         boolean;
	defaultCollapsed?:  boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	togglePosition?:    SidebarTogglePosition;
}

export const Sidebar = (
    {
        width = 'w-56', height = 'h-full', collapsedWidth = 'w-16', collapsible = false,
        collapsed, defaultCollapsed = false, onCollapsedChange, togglePosition = 'middle',
        className = '', children, onKeyDown, ...props
    }: SidebarProps
) => {
    const sidebarRef   = useRef<HTMLElement>(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const initialized  = useRef(false);
    const pathname     = usePathname();

    const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
    const isControlled = collapsed !== undefined;
    const isCollapsed  = isControlled ? collapsed : uncontrolledCollapsed;

    const toggleCollapsed = () =>
    {
        const next = !isCollapsed;
        if(!isControlled) setUncontrolledCollapsed(next);
        onCollapsedChange?.(next);
    };

    const childList   = Children.toArray(children);
    const headerChild = childList.find(child => isValidElement(child) && child.type === SidebarHeader);
    const footerChild = childList.find(child => isValidElement(child) && child.type === SidebarFooter);
    const bodyChildren = childList.filter(child => child !== headerChild && child !== footerChild);

    useEffect(() =>
    {
        if(!sidebarRef.current) return;
        const links = Array.from(
            sidebarRef.current.querySelectorAll<HTMLAnchorElement>('a[href]')
        );
        // When more than one link shares aria-current (e.g. a parent "All X" link
        // plus the specific active child), prefer the most specific: last in DOM order.
        const current = links.filter(l => l.getAttribute('aria-current') === 'page');
        const rover   = current[current.length - 1] ?? links[0];
        links.forEach(l => { l.tabIndex = l === rover ? 0 : -1; });
    }, [isCollapsed]);

    useEffect(() =>
    {
        const sidebar   = sidebarRef.current;
        const indicator = indicatorRef.current;
        if(!sidebar || !indicator) return;

        // If more than one element ever shares aria-current, prefer the last in DOM
        // order (the most specific / most deeply nested match).
        const matches = sidebar.querySelectorAll<HTMLElement>('[aria-current="page"]');
        const active  = matches[matches.length - 1];

        if(!active)
        {
            // Nothing currently active (or the active link is hidden, e.g. an
            // icon-less SidebarLink is unmounted while collapsed). Hide the
            // indicator instead of leaving it at a stale position.
            indicator.style.opacity = '0';
            return;
        }

        indicator.style.opacity = '1';

        // Measured via getBoundingClientRect rather than offsetTop: a SidebarLink
        // with a trailing `action` wraps its <a> in an extra positioned container,
        // which would otherwise become the anchor's offsetParent and throw off
        // offsetTop. Rect math stays correct regardless of intermediate wrappers.
        const containerRect = (indicator.offsetParent as HTMLElement ?? sidebar).getBoundingClientRect();
        const activeRect     = active.getBoundingClientRect();
        const top            = activeRect.top - containerRect.top;
        const height         = activeRect.height;

        if(!initialized.current)
        {
            indicator.style.transition = 'none';
            indicator.style.top        = `${top}px`;
            indicator.style.height     = `${height}px`;
            indicator.getBoundingClientRect();
            indicator.style.transition = '';
            initialized.current        = true;
        }
        else
        {
            indicator.style.top    = `${top}px`;
            indicator.style.height = `${height}px`;
        }
    }, [pathname, isCollapsed]);

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

    const hasPositionOverride = /\b(static|fixed|absolute|sticky|relative)\b/.test(className);

    return (
        <SidebarCollapsedContext.Provider value={isCollapsed}>
        <aside
            {...props}
            ref={sidebarRef}
            onKeyDown={handleKeyDown}
            className={[
                hasPositionOverride ? '' : 'relative',
                'border-r-[length:var(--border-width)] border-surface-border bg-surface',
                'motion-safe:transition-[width] motion-safe:duration-200 motion-safe:ease-[var(--ease-standard)]',
                height, isCollapsed ? collapsedWidth : width, className,
            ].filter(Boolean).join(' ')}
        >
            {collapsible && (
                <button
                    type='button'
                    onClick={toggleCollapsed}
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
                    className={[
                        // z-[60]: higher than a typical fixed MenuBar (z-50), so the button
                        // stays visible even when togglePosition="top" straddles that border too.
                        'absolute -right-3 z-[60] flex h-6 w-6 items-center justify-center rounded-full border-[length:var(--border-width)] border-surface-border bg-surface text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
                        TOGGLE_POSITION_CLASSES[togglePosition],
                    ].join(' ')}
                >
                    <svg
                        width='14'
                        height='14'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        aria-hidden='true'
                        className={['motion-safe:transition-transform motion-safe:duration-200', isCollapsed ? 'rotate-180' : ''].join(' ')}
                    >
                        <path d='m15 18-6-6 6-6' />
                    </svg>
                </button>
            )}

            <div className='flex h-full flex-col overflow-hidden'>
                {headerChild && (
                    // pt-5 + pb-4 + a ~20px content row lands the border at ~56px,
                    // matching a standard h-14 MenuBar so the two border lines align.
                    <div className='shrink-0 border-b-[length:var(--border-width)] border-surface-border px-3 pt-5 pb-4'>
                        {headerChild}
                    </div>
                )}

                <ScrollFade
                    wrapperClassName='flex-1 min-h-0'
                    className={[
                        // h-full: the outer wrapper (wrapperClassName) is the actual flex item
                        // that gets constrained to the available space; this inner scrollable
                        // element is just a plain block child of it, so it needs h-full explicitly
                        // to fill that constrained height rather than growing to its content size.
                        //
                        // [&>*]:shrink-0: without this, direct children with a small min-content
                        // size (e.g. a single bare SidebarLink placed directly under a
                        // SidebarDivider, not wrapped in a SidebarSection) get disproportionately
                        // squeezed once total content overflows and larger siblings (nav,
                        // SidebarSection) hit their own min-content floor first. Overflow should
                        // scroll, never squish content.
                        'relative h-full overflow-x-hidden scrollbar-hover flex flex-col gap-4 px-3 [&>*]:shrink-0',
                        headerChild ? 'pt-4' : 'pt-6',
                        footerChild ? 'pb-4' : 'pb-6',
                    ].join(' ')}
                >
                    <div
                        ref={indicatorRef}
                        aria-hidden='true'
                        // Starts hidden via the (static, never React-toggled) opacity-0 class.
                        // The position effect below sets el.style.opacity imperatively:
                        // it must never appear in this JSX style/className as conditional
                        // state, or React's reconciliation would fight the imperative value.
                        className='absolute inset-x-3 rounded-[var(--radius)] bg-surface-active opacity-0 pointer-events-none motion-safe:transition-[top,height,opacity] motion-safe:duration-200 motion-safe:ease-[var(--ease-standard)]'
                    >
                        <span className='absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-brand' />
                    </div>
                    {bodyChildren}
                </ScrollFade>

                {footerChild && (
                    <div className='shrink-0 border-t-[length:var(--border-width)] border-surface-border px-3 pt-4 pb-6'>
                        {footerChild}
                    </div>
                )}
            </div>
        </aside>
        </SidebarCollapsedContext.Provider>
    );
};

// ─── SidebarHeader ────────────────────────────────────────────────────────────

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>;

export const SidebarHeader = ({ className = '', children, ...props }: SidebarHeaderProps) => {
	return (
		<div {...props} className={['flex items-center gap-2 overflow-hidden whitespace-nowrap', className].join(' ')}>
			{children}
		</div>
	);
};

// ─── SidebarFooter ────────────────────────────────────────────────────────────

export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>;

export const SidebarFooter = ({ className = '', children, ...props }: SidebarFooterProps) => {
	return (
		<div {...props} className={['flex items-center gap-2 overflow-hidden whitespace-nowrap', className].join(' ')}>
			{children}
		</div>
	);
};

// ─── SidebarSection ───────────────────────────────────────────────────────────

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement>
{
	label?: string;
}

export const SidebarSection = ({ label, className = '', children, ...props }: SidebarSectionProps) => {
	const collapsed = useSidebarCollapsed();

	return (
		<div {...props} className={['flex flex-col gap-1', className].join(' ')}>
			{label && (
				<span className={[
					'px-3 text-xs font-medium text-text-subtle uppercase tracking-wide mb-1 overflow-hidden whitespace-nowrap',
					collapsed ? 'sr-only' : '',
				].join(' ')}>
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
	icon?:      ReactNode;
	action?:    ReactNode;
	className?: string;
	children?:  ReactNode;
}

export const SidebarLink = ({ isActive = false, icon, action, className = '', children, ...props }: SidebarLinkProps) => {
	const collapsed  = useSidebarCollapsed();
	const hideLabel  = collapsed && Boolean(icon);
	const showAction = Boolean(action) && !hideLabel;

	if(collapsed && !icon) return null;

	const link = (
		<Link
			{...props}
			aria-current={isActive ? 'page' : undefined}
			className={[
				'relative z-10 flex w-full items-center gap-2 overflow-hidden whitespace-nowrap rounded-[var(--radius)] px-3 py-1.5 text-sm',
				'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
				hideLabel ? 'justify-center' : '',
				showAction ? 'pr-9' : '',
				isActive
					? 'text-text font-medium'
					: 'text-text-muted hover:bg-surface-hover hover:text-text',
				className,
			].join(' ')}
		>
			{icon && <span aria-hidden='true' className='shrink-0 [&>svg]:h-4 [&>svg]:w-4'>{icon}</span>}
			<span className={hideLabel ? 'sr-only' : 'truncate'}>{children}</span>
		</Link>
	);

	if(hideLabel) return <Tooltip content={children} side='right' className='w-full'>{link}</Tooltip>;

	// `action` renders as a sibling of the <a>, never a descendant: nesting a
	// button inside an anchor is invalid HTML and breaks keyboard/screen-reader
	// behavior. It's overlaid on top of the link via absolute positioning instead,
	// so visually it still reads as one pill while staying two separate,
	// independently-focusable controls — clicking it can't trigger navigation.
	if(!showAction) return link;

	return (
		<div className='relative flex w-full items-center'>
			{link}
			<span className='absolute right-1.5 top-1/2 z-20 -translate-y-1/2 opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] group-hover:opacity-100 focus-within:opacity-100 has-[:focus-visible]:opacity-100 [div:hover>&]:opacity-100'>
				{action}
			</span>
		</div>
	);
};

// ─── SidebarDivider ───────────────────────────────────────────────────────────

export const SidebarDivider = ({ className = '', ...props }: HTMLAttributes<HTMLHRElement>) => {
	return (
		<hr
			{...props}
			className={['border-t-[length:var(--border-width)] border-surface-border', className].join(' ')}
		/>
	);
};

export default Sidebar;
