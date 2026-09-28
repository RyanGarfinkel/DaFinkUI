'use client';

import { ButtonHTMLAttributes, Children, HTMLAttributes, KeyboardEvent, ReactElement, ReactNode, createContext, isValidElement, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ScrollFade from '../ScrollFade/ScrollFade';
import { Skeleton } from '../Skeleton/Skeleton';
import { usePathname } from 'next/navigation';
import Link, { LinkProps } from 'next/link';
import Tooltip from '../Tooltip/Tooltip';

// Same list as Modal's own FOCUSABLE_SELECTOR — kept local rather than shared, matching how
// every other overlay/composite component here defines its own copy.
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

// Backs automatic hierarchy-aware active matching for SidebarLink: Sidebar
// resolves the single longest href (among descendant SidebarLinks with no
// explicit isActive) that matches the current pathname — exact beats prefix
// beats no match — so a specific route wins over a general ancestor, but a
// general link still lights up when no more specific sibling exists.
const SidebarActiveLinkContext = createContext<{ activeHref: string | null }>({ activeHref: null });

// Walks the children tree synchronously (during Sidebar's own render, not an
// effect) so the very first render — including SSR — already has the right
// answer. An effect-based registration scheme would leave every auto-matched
// link inactive until the first post-hydration re-render, a visible flash.
// Only plain SidebarLink elements with no explicit isActive contribute; a
// consumer that wraps SidebarLink in its own component (as this repo's docs
// site does) is expected to compute isActive itself, exactly like the
// explicit-override path already requires.
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

// The matching rule itself, factored out as a pure function (no React, no
// router) so it can be reused verbatim anywhere the real algorithm needs to
// run against a path that isn't necessarily the live browser URL — e.g. a
// docs demo simulating navigation without actually leaving the page.
// Exact match always wins; otherwise the longest href that's an ancestor of
// pathname wins, so a general link (e.g. "/projects") still lights up when no
// more specific sibling (e.g. "/projects/overview") is present. "/" is never
// treated as an ancestor of every route — it only matches pathname === "/".
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

export type SidebarTogglePosition = 'top' | 'middle' | 'bottom';

const TOGGLE_POSITION_CLASSES: Record<SidebarTogglePosition, string> = {
	// Centers the (h-6) toggle on the bottom edge of a standard h-14 (56px) MenuBar,
	// so it sits right at the intersection of the sidebar's and top bar's borders.
	top:    'top-11',
	middle: 'top-1/2 -translate-y-1/2',
	bottom: 'bottom-6',
};

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
	width?:             string;
	height?:            string;
	collapsedWidth?:    string;
	/** Tailwind height class for the SidebarHeader slot's wrapping bar. Default `'h-14'` matches MenuBar, so an adjacent title bar of that same default height gets a border that aligns with this one. Override when that title bar is taller (e.g. it has a subtitle) — give both the same explicit height, since neither's content height predicts the other's. */
	headerHeight?:      string;
	collapsible?:       boolean;
	collapsed?:         boolean;
	defaultCollapsed?:  boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	togglePosition?:    SidebarTogglePosition;
}

export const Sidebar = (
    {
        width = 'w-56', height = 'h-full', collapsedWidth = 'w-16', headerHeight = 'h-14', collapsible = false,
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
        // A row's action buttons are reachable via ArrowRight (see handleKeyDown), not Tab —
        // Tab/Shift+Tab should skip straight from one row to the next, not stop at every
        // hidden-until-focused rename/delete pair along the way. Re-runs on every `children`
        // change (not just mount) so a freshly-added row's actions are excluded too.
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
        const container      = (indicator.offsetParent as HTMLElement) ?? sidebar;
        const containerRect  = container.getBoundingClientRect();
        const activeRect     = active.getBoundingClientRect();
        // activeRect/containerRect are both viewport-relative, so their difference is
        // only the offset within the container's *currently visible* scroll window —
        // it silently loses however far the container has already scrolled. `top` is
        // then used as `style.top` on an absolutely-positioned child, which is measured
        // from the container's content box (unscrolled origin), so the container's own
        // scrollTop has to be added back in or the indicator lands exactly that far off
        // from the active link every time the list isn't scrolled to the very top.
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
    // `children` (not just pathname) drives this: a SidebarButton's isActive is
    // consumer state, not the URL, so a button click never touches pathname —
    // re-measuring on every children change is what lets the indicator follow
    // event-driven selection, not just route changes.
    }, [pathname, isCollapsed, children]);

    // A row's own tabIndex is the single source of truth for where Tab lands (the roving-
    // tabindex contract), so any time focus moves to a different row — even indirectly, by
    // landing on one of *its* action buttons — that row must become the one with tabIndex 0.
    const focusRow = (rows: HTMLElement[], target: HTMLElement) => {
        rows.forEach(r => { r.tabIndex = -1; });
        target.tabIndex = 0;
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        const active = document.activeElement as HTMLElement | null;
        const actionGroup = active?.closest<HTMLElement>('[data-sidebar-item-actions]');

        // Inside a row's action group (e.g. the rename/delete buttons on a chat row):
        // Right/Left cycle within it, Left from the first action (or Escape) climbs back out
        // to the row, and Up/Down jump to the same action slot on the adjacent row — so the
        // reader never loses their place in the row/action "column" they were in.
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

        // Row-level Right/Left: dive into this row's action group, if it has one. Right
        // enters at the first action (rename), Left enters at the last (delete) — each
        // arrow's entry point mirrors the direction you'd exit the group back the same way.
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
                    // Explicit height (headerHeight, default h-14) rather than padding around
                    // the content's own height: the latter drifts the moment headerChild's
                    // content changes, which is exactly what broke this border's alignment
                    // with an adjacent title bar the first time around.
                    //
                    // [&>*]:w-full: `headerChild` (SidebarHeader's own div) was previously a
                    // plain block-level child of a non-flex wrapper, so it filled the width
                    // for free. Making this wrapper `flex` to center it vertically means it
                    // no longer does that on its own — this restores it without needing
                    // SidebarHeader itself to declare a width it can't know it needs.
                    <div className={['shrink-0 flex items-center border-b-[length:var(--border-width)] border-surface-border px-3 [&>*]:w-full', headerHeight].join(' ')}>
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
// Both a URL-driven SidebarLink and an event-driven SidebarButton render as
// the same pill, so the class list, the icon/label markup, and the
// action-sibling/tooltip wrapping live here once instead of drifting between
// two copies.

interface SidebarItemClassNameOptions {
	hideLabel:    boolean;
	showAction:   boolean;
	isActive:     boolean;
	// How much trailing space to reserve for `action`. `action` is an arbitrary
	// ReactNode absolutely-positioned over the pill's trailing edge (see
	// wrapSidebarItem below), so its real width can't be measured from here — this
	// is a caller-supplied guess. Default 'pr-9' fits one icon-sized control; pass a
	// wider class (e.g. 'pr-16') when `action` renders more than one, or the label
	// truncates too late and ends up under the action instead of before it.
	actionGutter: string;
	className:    string;
}

const sidebarItemClassName = ({ hideLabel, showAction, isActive, actionGutter, className }: SidebarItemClassNameOptions) => [
	// min-w-0: this element is itself a flex item (of wrapSidebarItem's wrapping row when
	// an action is present). Without it, its own min-width:auto — driven by its nowrap text
	// content — overrides w-full and lets it grow to fit the full label, which is what let
	// the label's own truncate never actually trigger.
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

	// `action` renders as a sibling of the link/button, never a descendant: nesting
	// a button inside an anchor is invalid HTML and breaks keyboard/screen-reader
	// behavior. It's overlaid on top of the item via absolute positioning instead,
	// so visually it still reads as one pill while staying two separate,
	// independently-focusable controls — clicking it can't trigger navigation.
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

	// Only a plain string href can be matched against the current pathname; a
	// UrlObject href opts out of auto-matching the same way an explicit isActive does.
	// Sidebar computes activeHref by reading this same href straight off this
	// element's props (see collectAutoMatchHrefs), so no registration step is
	// needed here — just compare against the answer it already resolved.
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
// Same pill as SidebarLink, but for sidebar items that swap content without
// changing the URL (e.g. an inbox/drafts/sent switcher). `isActive` is fully
// controlled by the consumer — there's no pathname to derive it from — so it
// always defaults to false rather than auto-matching anything.

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

	// `indicator` opts a button out of the sliding active-pill: still styles as
	// active (bold text) when isActive, but never sets aria-current, so a button
	// that isn't part of an exclusive "current view" group (e.g. a one-off
	// "Compose" action) can't drag the shared indicator over to itself.
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

// A stand-in for nav items that are still loading. Rows match the height and horizontal
// padding of a real SidebarLink/SidebarButton, so the list doesn't shift when the items
// arrive. Like an icon-less item, it renders nothing in the collapsed rail.
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
