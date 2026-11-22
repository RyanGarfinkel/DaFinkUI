'use client';

import { ButtonHTMLAttributes, Children, HTMLAttributes, KeyboardEvent, ReactElement, ReactNode, createContext, isValidElement, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ScrollFade from '../ScrollFade/ScrollFade';
import { Skeleton } from '../Skeleton/Skeleton';
import { usePathname } from 'next/navigation';
import Link, { LinkProps } from 'next/link';
import Tooltip from '../Tooltip/Tooltip';

const ACTION_FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(', ');

const SidebarCollapsedContext = createContext(false);

export const useSidebarCollapsed = () => useContext(SidebarCollapsedContext);

const SidebarActiveLinkContext = createContext<{ activeHref: string | null }>({ activeHref: null });

// Runs during render, not in an effect, so the first render (including SSR) already knows the active link. Wrapped SidebarLinks aren't seen and must pass isActive themselves.
const collectAutoMatchHrefs = (node: ReactNode, hrefs: string[]): void => {
	Children.forEach(node, child =>
	{
		if(!isValidElement(child)) return;

		if(child.type === SidebarLink)
		{
			const { href, isActive } = child.props as SidebarLinkProps;
			if(isActive === undefined && typeof href === 'string') hrefs.push(href);
			return;
		}

		const childProps = child.props as { children?: ReactNode };
		if(childProps?.children) collectAutoMatchHrefs(childProps.children, hrefs);
	});
};

/** Exact match wins; otherwise the longest ancestor href. "/" only matches "/". Pure, so a demo can run it against a simulated path. */
export const resolveSidebarActiveHref = (hrefs: string[], pathname: string | null): string | null => {
	if(pathname === null) return null;

	let best: string | null = null;
	for(const href of hrefs)
	{
		const matches = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
		if(!matches) continue;
		if(best === null || href.length > best.length) best = href;
	}
	return best;
};

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
	width?:             string;
	height?:            string;
	collapsedWidth?:    string;
	/** Tailwind height class of the header bar. The default `'h-14'` matches MenuBar; give both bars the same explicit height if you change it. */
	headerHeight?:      string;
	collapsible?:       boolean;
	collapsed?:         boolean;
	defaultCollapsed?:  boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
}

export const Sidebar = (
    {
        width = 'w-56', height = 'h-full', collapsedWidth = 'w-16', headerHeight = 'h-14', collapsible = false,
        collapsed, defaultCollapsed = false, onCollapsedChange,
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

    const toggleCollapsed = () => {
        const next = !isCollapsed;
        if(!isControlled) setUncontrolledCollapsed(next);
        onCollapsedChange?.(next);
    };

    const activeHref = useMemo(() =>
    {
        const hrefs: string[] = [];
        collectAutoMatchHrefs(children, hrefs);
        return resolveSidebarActiveHref(hrefs, pathname);
    }, [children, pathname]);

    const activeLinkContextValue = useMemo(() => ({ activeHref }), [activeHref]);

    const childList   = Children.toArray(children);
    const headerChild = childList.find(child => isValidElement(child) && child.type === SidebarHeader);
    const footerChild = childList.find(child => isValidElement(child) && child.type === SidebarFooter);
    const bodyChildren = childList.filter(child => child !== headerChild && child !== footerChild);

    useEffect(() =>
    {
        if(!sidebarRef.current) return;
        // [data-sidebar-item] covers both SidebarLink's <a> and SidebarButton's
        // <button>, so URL navigation and event-triggering items share one
        // roving-tabindex/arrow-key sequence.
        const links = Array.from(
            sidebarRef.current.querySelectorAll<HTMLElement>('[data-sidebar-item]')
        );
        // When more than one link shares aria-current (e.g. a parent "All X" link
        // plus the specific active child), prefer the most specific: last in DOM order.
        const current = links.filter(l => l.getAttribute('aria-current') === 'page');
        const rover   = current[current.length - 1] ?? links[0];
        links.forEach(l => { l.tabIndex = l === rover ? 0 : -1; });
    }, [isCollapsed]);

    useEffect(() =>
    {
        if(!sidebarRef.current) return;
        // Row actions are reached with ArrowRight, not Tab. Re-runs on every `children` change so new rows are excluded too.
        const actions = sidebarRef.current.querySelectorAll<HTMLElement>(
            `[data-sidebar-item-actions] :is(${ACTION_FOCUSABLE_SELECTOR})`
        );
        actions.forEach(a => { a.tabIndex = -1; });
    }, [children]);

    useEffect(() =>
    {
        const sidebar   = sidebarRef.current;
        const indicator = indicatorRef.current;
        if(!sidebar || !indicator) return;

        // Several aria-current elements: the last in DOM order is the most specific.
        const matches = sidebar.querySelectorAll<HTMLElement>('[aria-current="page"]');
        const active  = matches[matches.length - 1];

        if(!active)
        {
            // No visible active link (e.g. icon-less links unmount while collapsed): hide the indicator rather than strand it.
            indicator.style.opacity = '0';
            return;
        }

        indicator.style.opacity = '1';

        // Rects, not offsetTop: an `action` wrapper becomes the <a>'s offsetParent and skews offsetTop.
        const container      = (indicator.offsetParent as HTMLElement) ?? sidebar;
        const containerRect  = container.getBoundingClientRect();
        const activeRect     = active.getBoundingClientRect();
        // The rect difference ignores scroll; the indicator is positioned from the unscrolled content box, so add scrollTop back.
        const top            = activeRect.top - containerRect.top + container.scrollTop;
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
    // Keyed on `children`, not pathname: a SidebarButton's isActive is consumer state and never changes the URL.
    }, [pathname, isCollapsed, children]);

    // Roving tabindex: whichever row holds focus, even via one of its action buttons, becomes the tabIndex 0 row.
    const focusRow = (rows: HTMLElement[], target: HTMLElement) => {
        rows.forEach(r => { r.tabIndex = -1; });
        target.tabIndex = 0;
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        const active = document.activeElement as HTMLElement | null;
        const actionGroup = active?.closest<HTMLElement>('[data-sidebar-item-actions]');

        // In an action group: Right/Left cycle, Left from the first (or Escape) returns to the row, Up/Down keep the same action slot on the adjacent row.
        if(actionGroup && e.currentTarget.contains(actionGroup))
        {
            const actions = Array.from(actionGroup.querySelectorAll<HTMLElement>(ACTION_FOCUSABLE_SELECTOR));
            const actionIndex = actions.findIndex(a => a === active);
            const row = actionGroup.previousElementSibling as HTMLElement | null;
            if(actionIndex === -1) return;

            if(e.key === 'ArrowRight')
            {
                e.preventDefault();
                if(actionIndex === actions.length - 1) row?.focus();
                else actions[actionIndex + 1].focus();
            }
            else if(e.key === 'ArrowLeft')
            {
                e.preventDefault();
                if(actionIndex === 0) row?.focus();
                else actions[actionIndex - 1].focus();
            }
            else if(e.key === 'Escape')
            {
                e.preventDefault();
                row?.focus();
            }
            else if(e.key === 'ArrowDown' || e.key === 'ArrowUp')
            {
                const rows = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-sidebar-item]'));
                const rowIndex = rows.findIndex(r => r === row);
                if(rowIndex === -1) return;

                e.preventDefault();
                const targetRow = rows[e.key === 'ArrowDown' ? (rowIndex + 1) % rows.length : (rowIndex - 1 + rows.length) % rows.length];
                focusRow(rows, targetRow);

                const targetGroup = targetRow.nextElementSibling;
                const targetActions = targetGroup?.matches('[data-sidebar-item-actions]')
                    ? Array.from(targetGroup.querySelectorAll<HTMLElement>(ACTION_FOCUSABLE_SELECTOR))
                    : [];
                if(targetActions.length > 0) targetActions[Math.min(actionIndex, targetActions.length - 1)].focus();
                else targetRow.focus();
            }

            return;
        }

        // On a row: Right enters its action group at the first action, Left at the last.
        if((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && active?.hasAttribute('data-sidebar-item'))
        {
            const group = active.nextElementSibling;
            const actions = group?.matches('[data-sidebar-item-actions]')
                ? Array.from(group.querySelectorAll<HTMLElement>(ACTION_FOCUSABLE_SELECTOR))
                : [];
            if(actions.length > 0)
            {
                e.preventDefault();
                actions[e.key === 'ArrowRight' ? 0 : actions.length - 1].focus();
            }
            return;
        }

        if(!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;

        const links = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>('[data-sidebar-item]')
        );
        if(!links.length) return;

        const index = links.findIndex(l => l === active);
        e.preventDefault();

        let next: HTMLElement;
        if(e.key === 'ArrowDown')      next = links[(index + 1) % links.length];
        else if(e.key === 'ArrowUp')   next = links[(index - 1 + links.length) % links.length];
        else if(e.key === 'Home')      next = links[0];
        else                            next = links[links.length - 1];

        focusRow(links, next);
        next.focus();

        onKeyDown?.(e);
    };

    const hasPositionOverride = /\b(static|fixed|absolute|sticky|relative)\b/.test(className);
    const hasHeader = Boolean(headerChild) || collapsible;

    const toggleButton = collapsible && (
        <button
            type='button'
            onClick={toggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius)] text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
        >
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
            >
                <rect width='18' height='18' x='3' y='3' rx='2' />
                <path d='M9 3v18' />
                <path d={isCollapsed ? 'm14 9 3 3-3 3' : 'm16 15-3-3 3-3'} />
            </svg>
        </button>
    );

    return (
        <SidebarCollapsedContext.Provider value={isCollapsed}>
        <SidebarActiveLinkContext.Provider value={activeLinkContextValue}>
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
            <div className='flex h-full flex-col overflow-hidden'>
                {hasHeader && (
                    // Explicit height, not padding: content-driven height drifts out of line with an adjacent title bar. [&>*]:w-full restores the width the flex wrapper stopped giving headerChild. Collapsed, only the toggle fits, so headerChild isn't rendered.
                    <div className={['shrink-0 flex items-center gap-1 border-b-[length:var(--border-width)] border-surface-border px-3', isCollapsed ? 'justify-center' : '', headerHeight].join(' ')}>
                        {!isCollapsed && <div className='min-w-0 flex-1 [&>*]:w-full'>{headerChild}</div>}
                        {toggleButton}
                    </div>
                )}

                <ScrollFade
                    wrapperClassName='flex-1 min-h-0'
                    className={[
                        // h-full: the outer wrapper is the constrained flex item, so this scroller must fill it. [&>*]:shrink-0: overflow should scroll, not squeeze small direct children.
                        'relative h-full overflow-x-hidden scrollbar-hover flex flex-col gap-4 px-3 [&>*]:shrink-0',
                        hasHeader ? 'pt-4' : 'pt-6',
                        footerChild ? 'pb-4' : 'pb-6',
                    ].join(' ')}
                >
                    <div
                        ref={indicatorRef}
                        aria-hidden='true'
                        // Opacity is set imperatively by the position effect, so keep it out of conditional JSX state or React will fight it.
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
        </SidebarActiveLinkContext.Provider>
        </SidebarCollapsedContext.Provider>
    );
};

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>;

export const SidebarHeader = ({ className = '', children, ...props }: SidebarHeaderProps) => {
	// No overflow-hidden here: the ancestor Sidebar wrapper already clips to width during the
	// collapse transition, so this only needs whitespace-nowrap. An extra overflow-hidden this
	// close to a focused child clips its focus-visible ring before it can bleed into the
	// padded wrapper around headerChild.
	return (
		<div {...props} className={['flex items-center gap-2 whitespace-nowrap', className].join(' ')}>
			{children}
		</div>
	);
};

export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>;

export const SidebarFooter = ({ className = '', children, ...props }: SidebarFooterProps) => {
	// Same reasoning as SidebarHeader: no local overflow-hidden, so a focused child's ring
	// isn't clipped before it can bleed into the padded wrapper around footerChild.
	return (
		<div {...props} className={['flex items-center gap-2 whitespace-nowrap', className].join(' ')}>
			{children}
		</div>
	);
};

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
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

//
// The pill shared by SidebarLink and SidebarButton.

interface SidebarItemClassNameOptions {
	hideLabel:    boolean;
	showAction:   boolean;
	isActive:     boolean;
	// `action` is overlaid, so its width can't be measured: callers reserve it ('pr-9' fits one icon).
	actionGutter: string;
	className:    string;
}

const sidebarItemClassName = ({ hideLabel, showAction, isActive, actionGutter, className }: SidebarItemClassNameOptions) => [
	// min-w-0: as a flex item its min-width:auto would grow to the full label and stop truncate from triggering.
	'relative z-10 flex w-full min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap rounded-[var(--radius)] px-3 py-1.5 text-left text-sm',
	'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
	hideLabel ? 'justify-center' : '',
	showAction ? actionGutter : '',
	isActive
		? 'text-text font-medium'
		: 'text-text-muted hover:bg-surface-hover hover:text-text',
	className,
].join(' ');

interface SidebarItemLabelProps {
	icon?:      ReactNode;
	hideLabel:  boolean;
	children?:  ReactNode;
}

const SidebarItemLabel = ({ icon, hideLabel, children }: SidebarItemLabelProps) => (
	<>
		{icon && <span aria-hidden='true' className='shrink-0 [&>svg]:h-4 [&>svg]:w-4'>{icon}</span>}
		{/* min-w-0 is required for truncate to take effect on a flex child: without it,
		    a flex item's default min-width:auto keeps it at its full text width instead
		    of shrinking, so the ellipsis never applies and the label just overflows. */}
		<span className={hideLabel ? 'sr-only' : 'min-w-0 flex-1 truncate'}>{children}</span>
	</>
);

interface WrapSidebarItemOptions {
	hideLabel:  boolean;
	showAction: boolean;
	children?:  ReactNode;
	action?:    ReactNode;
}

const wrapSidebarItem = (item: ReactElement<HTMLAttributes<HTMLElement>>, { hideLabel, showAction, children, action }: WrapSidebarItemOptions) => {
	if(hideLabel) return <Tooltip content={children} side='right' className='w-full'>{item}</Tooltip>;

	// `action` is a sibling overlaid on the item, not a child: a button inside an anchor is invalid HTML and would trigger navigation.
	if(!showAction) return item;

	return (
		<div className='relative flex w-full items-center'>
			{item}
			{/* data-sidebar-item-actions: a direct sibling of `item`, so handleKeyDown can walk
			    between the two with next/previousElementSibling — this is what lets ArrowRight
			    dive from the row into its actions and ArrowLeft/Escape climb back out. */}
			<span data-sidebar-item-actions='' className='absolute right-1.5 top-1/2 z-20 -translate-y-1/2 opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] group-hover:opacity-100 focus-within:opacity-100 has-[:focus-visible]:opacity-100 [div:hover>&]:opacity-100'>
				{action}
			</span>
		</div>
	);
};

export interface SidebarLinkProps extends LinkProps {
	isActive?:      boolean;
	icon?:          ReactNode;
	action?:        ReactNode;
	/** Trailing space reserved for `action`, as a Tailwind `pr-*` class. Default `'pr-9'` fits one icon-sized control; widen it (e.g. `'pr-16'`) when `action` renders more than one. */
	actionGutter?:  string;
	className?:     string;
	children?:      ReactNode;
}

export const SidebarLink = ({ isActive, icon, action, actionGutter = 'pr-9', className = '', children, href, ...props }: SidebarLinkProps) => {
	const collapsed = useSidebarCollapsed();
	const { activeHref } = useContext(SidebarActiveLinkContext);

	// Only string hrefs auto-match; a UrlObject opts out like an explicit isActive.
	const hrefString = typeof href === 'string' ? href : undefined;
	const active     = isActive !== undefined ? isActive : hrefString !== undefined && hrefString === activeHref;
	const hideLabel  = collapsed && Boolean(icon);
	const showAction = Boolean(action) && !hideLabel;

	if(collapsed && !icon) return null;

	const link = (
		<Link
			{...props}
			href={href}
			data-sidebar-item=''
			aria-current={active ? 'page' : undefined}
			className={sidebarItemClassName({ hideLabel, showAction, isActive: active, actionGutter, className })}
		>
			<SidebarItemLabel icon={icon} hideLabel={hideLabel}>{children}</SidebarItemLabel>
		</Link>
	);

	return wrapSidebarItem(link, { hideLabel, showAction, children, action });
};

//
// For items that swap content without changing the URL. `isActive` is controlled by the consumer and defaults to false.

export interface SidebarButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
	isActive?:      boolean;
	indicator?:     boolean;
	icon?:          ReactNode;
	action?:        ReactNode;
	/** Trailing space reserved for `action`, as a Tailwind `pr-*` class. Default `'pr-9'` fits one icon-sized control; widen it (e.g. `'pr-16'`) when `action` renders more than one. */
	actionGutter?:  string;
	className?:     string;
	children?:      ReactNode;
}

export const SidebarButton = ({ isActive = false, indicator = true, icon, action, actionGutter = 'pr-9', className = '', children, ...props }: SidebarButtonProps) => {
	const collapsed  = useSidebarCollapsed();
	const hideLabel  = collapsed && Boolean(icon);
	const showAction = Boolean(action) && !hideLabel;

	if(collapsed && !icon) return null;

	// `indicator={false}` styles an active button but skips aria-current, so a one-off action can't pull the sliding indicator.
	const button = (
		<button
			type='button'
			{...props}
			data-sidebar-item=''
			aria-current={isActive && indicator ? 'page' : undefined}
			className={sidebarItemClassName({ hideLabel, showAction, isActive, actionGutter, className })}
		>
			<SidebarItemLabel icon={icon} hideLabel={hideLabel}>{children}</SidebarItemLabel>
		</button>
	);

	return wrapSidebarItem(button, { hideLabel, showAction, children, action });
};

export const SidebarDivider = ({ className = '', ...props }: HTMLAttributes<HTMLHRElement>) => {
	return (
		<hr
			{...props}
			className={['border-t-[length:var(--border-width)] border-surface-border', className].join(' ')}
		/>
	);
};

const SKELETON_LABEL_WIDTHS = ['w-3/4', 'w-full', 'w-2/3', 'w-5/6'];

export interface SidebarSkeletonProps extends HTMLAttributes<HTMLDivElement> {
	count?: number;
	icon?:  boolean;
}

// Loading placeholder sized like a real item so the list doesn't shift; hidden in the collapsed rail.
export const SidebarSkeleton = ({ count = 3, icon = false, className = '', ...props }: SidebarSkeletonProps) => {
	const collapsed = useSidebarCollapsed();

	if(collapsed) return null;

	return (
		<div role='status' aria-busy='true' aria-label='Loading' {...props} className={['flex flex-col gap-1', className].join(' ')}>
			{Array.from({ length: count }, (_, i) => (
				<div key={i} className='flex h-8 items-center gap-2 px-3'>
					{icon && <Skeleton className='h-4 w-4 shrink-0' />}
					<Skeleton className={['h-3 rounded-full', SKELETON_LABEL_WIDTHS[i % SKELETON_LABEL_WIDTHS.length]].join(' ')} />
				</div>
			))}
		</div>
	);
};

export default Sidebar;
