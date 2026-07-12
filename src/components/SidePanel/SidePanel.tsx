'use client';

import { registerInStack, unregisterFromStack, reportStackEntrySize, subscribeToStack, getStackSnapshot, computeStackOffset, isBlockedInStack } from './sidePanelStack';
import { createContext, useContext, useEffect, useRef, useState, useId, useSyncExternalStore, HTMLAttributes, ButtonHTMLAttributes, KeyboardEvent } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../Card/Card';
import { createPortal } from 'react-dom';

// ─── Focusable-element selector ───────────────────────────────────────────────
// SidePanel is non-modal (see below), so this is only used to focus the first
// element on open; there is no Tab-trap, unlike Drawer/Modal.

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(', ');

// ─── Exit animation duration (matches --duration-fast) ───────────────────────

const EXIT_DURATION_MS = 150;

// ─── Side variants ────────────────────────────────────────────────────────────

export type SidePanelSide = 'left' | 'right' | 'top' | 'bottom';

const SIDE_PANEL_CLASSES: Record<SidePanelSide, string> = {
	right:  'inset-y-4 right-4 w-96 max-w-[calc(85vw_-_2rem)]',
	left:   'inset-y-4 left-4 w-96 max-w-[calc(85vw_-_2rem)]',
	top:    'inset-x-4 top-4 h-96 max-h-[calc(85vh_-_2rem)]',
	bottom: 'inset-x-4 bottom-4 h-96 max-h-[calc(85vh_-_2rem)]',
};

const SIDE_HIDDEN_CLASSES: Record<SidePanelSide, string> = {
	right:  'translate-x-full',
	left:   '-translate-x-full',
	top:    '-translate-y-full',
	bottom: 'translate-y-full',
};

// Tailwind v4's translate-x-full/etc. above compile to the standalone CSS
// `translate` property, not `transform`, so this stack-offset transform
// layers on top of them independently, without fighting for the same property.
const STACK_OFFSET_TRANSFORM: Record<SidePanelSide, (px: number) => string> = {
	right:  (px) => `translateX(-${px}px)`,
	left:   (px) => `translateX(${px}px)`,
	top:    (px) => `translateY(${px}px)`,
	bottom: (px) => `translateY(-${px}px)`,
};

// ─── SidePanel context ────────────────────────────────────────────────────────

interface SidePanelContextValue
{
	titleId:      string;
	requestClose: () => void;
	isBlocked:    boolean;
}

const SidePanelContext = createContext<SidePanelContextValue | null>(null);

const useSidePanelContext = () =>
{
	const ctx = useContext(SidePanelContext);
	if(!ctx) throw new Error('SidePanel subcomponents must be used inside <SidePanel>');
	return ctx;
};

/** Whether this panel currently has another panel open in front of it on the
 * same side; if so, it can't be closed until that one closes first. Use this
 * to disable any custom close controls you build outside of `SidePanelClose`. */
export const useSidePanelBlocked = (): boolean => useSidePanelContext().isBlocked;

// ─── SidePanel ────────────────────────────────────────────────────────────────
// Deliberately non-modal: unlike Modal/Dialog/Drawer, SidePanel never inerts the
// rest of the page (no native <dialog>.showModal(), no focus trap, no backdrop).
// It behaves like a docked panel: it stays open until Escape or an explicit
// close action, so multiple independent SidePanels can be open at once, each
// with its own trigger elsewhere on the page.

export interface SidePanelProps extends HTMLAttributes<HTMLDivElement>
{
	open:         boolean;
	onOpenChange: (open: boolean) => void;
	side?:        SidePanelSide;
	className?:   string;
}

const SidePanel = (
    {
        open,
        onOpenChange,
        side = 'right',
        className = '',
        style,
        children,
        ...props
    }: SidePanelProps
) => {
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(false);

	const panelRef   = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const openRef    = useRef(open);

	useEffect(() =>
	{
		openRef.current = open;
	}, [open]);

	const titleId = useId();
	const panelId = useId();

	const stack = useSyncExternalStore(
		(listener) => subscribeToStack(side, listener),
		() => getStackSnapshot(side)
	);
	const stackOffset = computeStackOffset(stack, panelId);
	const isBlocked    = isBlockedInStack(stack, panelId);

	const requestClose = () =>
	{
		if(isBlocked) return;
		onOpenChange(false);
	};

	useEffect(() =>
	{
		if(open)
		{
			triggerRef.current = document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setMounted(true);
		}
		else
		{
			setVisible(false);

			// Return focus to the trigger: always, regardless of how the panel closed
			triggerRef.current?.focus();
			triggerRef.current = null;

			const timer = setTimeout(() => setMounted(false), EXIT_DURATION_MS);
			return () => clearTimeout(timer);
		}
	}, [open]);

	// Return focus if the panel unmounts entirely while still open
	useEffect(() =>
	{
		return () => { triggerRef.current?.focus(); };
	}, []);

	// Enter animation + focus first focusable element inside the panel
	useEffect(() =>
	{
		if(!mounted) return;
		const frame = requestAnimationFrame(() =>
		{
			// The panel may have been closed again before this frame ran
			if(!openRef.current) return;

			setVisible(true);
			const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
			if(focusable && focusable.length > 0)
				focusable[0].focus();
			else
				panelRef.current?.focus();
		});
		return () => cancelAnimationFrame(frame);
	}, [mounted]);

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) =>
	{
		if(e.key !== 'Escape') return;
		e.stopPropagation();
		requestClose();
	};

	// Join the cross-instance stack for this side while open, so a panel opened
	// after this one automatically pushes this one toward the center.
	useEffect(() =>
	{
		if(!open) return;
		registerInStack(side, panelId);
		return () => unregisterFromStack(side, panelId);
	}, [open, side, panelId]);

	// Report this panel's own rendered size so panels behind it can offset by it.
	useEffect(() =>
	{
		if(!mounted || !panelRef.current) return;
		const el = panelRef.current;

		const measure = () =>
		{
			const rect = el.getBoundingClientRect();
			const size = side === 'left' || side === 'right' ? rect.width : rect.height;
			reportStackEntrySize(side, panelId, size);
		};

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [mounted, side, panelId]);

	if(!mounted) return null;

	return (
		<SidePanelContext.Provider value={{ titleId, requestClose, isBlocked }}>
			{createPortal(
				<div
					ref={panelRef}
					id={panelId}
					role='dialog'
					aria-labelledby={titleId}
					tabIndex={-1}
					data-state={visible ? 'open' : 'closed'}
					data-side={side}
					onKeyDown={handleKeyDown}
					style={{
						...style,
						transform: stackOffset > 0 ? STACK_OFFSET_TRANSFORM[side](stackOffset) : undefined,
					}}
					className={[
						'fixed z-50',
						SIDE_PANEL_CLASSES[side],
						'focus:outline-none',
						'motion-safe:transition-transform',
						visible
							? 'translate-x-0 translate-y-0 motion-safe:duration-[var(--duration-base)] motion-safe:ease-[var(--ease-enter)]'
							: `${SIDE_HIDDEN_CLASSES[side]} motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-exit)]`,
					].join(' ')}
					{...props}
				>
					<Card variant='elevated' className={`flex h-full w-full flex-col overflow-hidden ${className}`}>
						{children}
					</Card>
				</div>,
				document.body
			)}
		</SidePanelContext.Provider>
	);
};

export default SidePanel;

// ─── SidePanelHeader ──────────────────────────────────────────────────────────

export interface SidePanelHeaderProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const SidePanelHeader = ({ className = '', children, ...props }: SidePanelHeaderProps) => {
	return (
		<CardHeader className={`flex flex-col gap-1 ${className}`} {...props}>
			{children}
		</CardHeader>
	);
};

// ─── SidePanelTitle ───────────────────────────────────────────────────────────

export interface SidePanelTitleProps extends HTMLAttributes<HTMLHeadingElement>
{
	className?: string;
}

export const SidePanelTitle = ({ className = '', children, ...props }: SidePanelTitleProps) => {
	const { titleId } = useSidePanelContext();

	return (
		<h2 id={titleId} className={`text-lg font-semibold tracking-tight text-text ${className}`} {...props}>
			{children}
		</h2>
	);
};

// ─── SidePanelContent ─────────────────────────────────────────────────────────

export interface SidePanelContentProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const SidePanelContent = ({ className = '', children, ...props }: SidePanelContentProps) => {
	return (
		<CardContent className={`flex-1 overflow-y-auto text-sm text-text-muted leading-relaxed ${className}`} {...props}>
			{children}
		</CardContent>
	);
};

// ─── SidePanelFooter ──────────────────────────────────────────────────────────

export interface SidePanelFooterProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const SidePanelFooter = ({ className = '', children, ...props }: SidePanelFooterProps) => {
	return (
		<CardFooter className={className} {...props}>
			{children}
		</CardFooter>
	);
};

// ─── SidePanelClose ───────────────────────────────────────────────────────────

export interface SidePanelCloseProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	className?: string;
}

export const SidePanelClose = (
    {
        className = '',
        'aria-label': ariaLabel = 'Close',
        onClick,
        ...props
    }: SidePanelCloseProps
) => {
	const { requestClose, isBlocked } = useSidePanelContext();

	return (
		<button
			type='button'
			aria-label={ariaLabel}
			disabled={isBlocked}
			onClick={(e) =>
			{
				onClick?.(e);
				requestClose();
			}}
			className={`absolute top-4 right-4 rounded-[var(--radius)] p-1 text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring disabled:pointer-events-none disabled:opacity-40 ${className}`}
			{...props}
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
				<path d='M18 6 6 18' />
				<path d='m6 6 12 12' />
			</svg>
		</button>
	);
};
