'use client';

import { createContext, useContext, useEffect, useRef, useState, useId, HTMLAttributes, ButtonHTMLAttributes, KeyboardEvent, PointerEvent, DialogHTMLAttributes } from 'react';

// ─── Focus trap selector ──────────────────────────────────────────────────────

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

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

const SIDE_PANEL_CLASSES: Record<DrawerSide, string> = {
	right:  'inset-y-0 right-0 h-full w-80 max-w-[85vw] border-l',
	left:   'inset-y-0 left-0 h-full w-80 max-w-[85vw] border-r',
	top:    'inset-x-0 top-0 w-full max-h-[85vh] border-b',
	bottom: 'inset-x-0 bottom-0 w-full max-h-[85vh] border-t',
};

const SIDE_HIDDEN_CLASSES: Record<DrawerSide, string> = {
	right:  'translate-x-full',
	left:   '-translate-x-full',
	top:    '-translate-y-full',
	bottom: 'translate-y-full',
};

// ─── Drawer context ───────────────────────────────────────────────────────────

interface DrawerContextValue
{
	titleId:      string;
	requestClose: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

const useDrawerContext = () =>
{
	const ctx = useContext(DrawerContext);
	if(!ctx) throw new Error('Drawer subcomponents must be used inside <Drawer>');
	return ctx;
};

// ─── Drawer ───────────────────────────────────────────────────────────────────

export interface DrawerProps extends DialogHTMLAttributes<HTMLDialogElement>
{
	open:         boolean;
	onOpenChange: (open: boolean) => void;
	side?:        DrawerSide;
	className?:   string;
}

const Drawer = (
    {
        open,
        onOpenChange,
        side = 'right',
        className = '',
        children,
        ...props
    }: DrawerProps
) => {
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(false);

	const dialogRef  = useRef<HTMLDialogElement>(null);
	const panelRef   = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const openRef    = useRef(open);

	useEffect(() =>
	{
		openRef.current = open;
	}, [open]);

	const titleId = useId();

	const requestClose = () => onOpenChange(false);

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

			// Return focus to the trigger — always, regardless of how the drawer closed
			triggerRef.current?.focus();
			triggerRef.current = null;

			const timer = setTimeout(() =>
			{
				dialogRef.current?.close();
				setMounted(false);
			}, EXIT_DURATION_MS);
			return () => clearTimeout(timer);
		}
	}, [open]);

	// Return focus if the drawer unmounts entirely while still open
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
			// The drawer may have been closed again before this frame ran
			if(!openRef.current) return;

			dialogRef.current?.showModal();
			setVisible(true);
			const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
			if(focusable && focusable.length > 0)
				focusable[0].focus();
			else
				panelRef.current?.focus();
		});
		return () => cancelAnimationFrame(frame);
	}, [mounted]);

	useEffect(() =>
	{
		const dialog = dialogRef.current;
		if(!dialog) return;
		const onCancel = (e: Event) =>
		{
			e.preventDefault();
			requestClose();
		};
		dialog.addEventListener('cancel', onCancel);
		return () => dialog.removeEventListener('cancel', onCancel);
	});

	const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) =>
	{
		if(e.key === 'Escape')
		{
			e.stopPropagation();
			requestClose();
			return;
		}

		if(e.key !== 'Tab') return;

		const focusable = Array.from(
			panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
		);

		if(focusable.length === 0)
		{
			e.preventDefault();
			return;
		}

		const first = focusable[0];
		const last  = focusable[focusable.length - 1];

		if(e.shiftKey)
		{
			if(document.activeElement === first || document.activeElement === panelRef.current)
			{
				e.preventDefault();
				last.focus();
			}
		}
		else if(document.activeElement === last)
		{
			e.preventDefault();
			first.focus();
		}
	};

	const handleBackdropPointerDown = (e: PointerEvent<HTMLDialogElement>) =>
	{
		if(e.target === e.currentTarget) requestClose();
	};

	if(!mounted) return null;

	return (
		<DrawerContext.Provider value={{ titleId, requestClose }}>
			<dialog
				ref={dialogRef}
				role='dialog'
				aria-modal='true'
				aria-labelledby={titleId}
				style={{ width: '100vw', height: '100dvh', maxWidth: '100%', maxHeight: '100%', margin: 0 }}
				className='fixed inset-0 p-0 border-0 bg-transparent overflow-visible'
				onPointerDown={handleBackdropPointerDown}
				onKeyDown={handleKeyDown}
				{...props}
			>
				<div
					aria-hidden='true'
					className={[
						'absolute inset-0 bg-text/40 pointer-events-none',
						'motion-safe:transition-opacity',
						visible
							? 'opacity-100 motion-safe:duration-[var(--duration-base)] motion-safe:ease-[var(--ease-enter)]'
							: 'opacity-0 motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-exit)]',
					].join(' ')}
				/>

				<div
					ref={panelRef}
					aria-labelledby={titleId}
					tabIndex={-1}
					data-state={visible ? 'open' : 'closed'}
					data-side={side}
					onPointerDown={(e) => e.stopPropagation()}
					className={[
						'absolute z-10 flex flex-col bg-surface border-surface-border shadow-xl',
						SIDE_PANEL_CLASSES[side],
						'focus:outline-none',
						'motion-safe:transition-transform',
						visible
							? 'translate-x-0 translate-y-0 motion-safe:duration-[var(--duration-base)] motion-safe:ease-[var(--ease-enter)]'
							: `${SIDE_HIDDEN_CLASSES[side]} motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-exit)]`,
						className,
					].join(' ')}
				>
					{children}
				</div>
			</dialog>
		</DrawerContext.Provider>
	);
};

export default Drawer;

// ─── DrawerHeader ─────────────────────────────────────────────────────────────

export interface DrawerHeaderProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const DrawerHeader = ({ className = '', children, ...props }: DrawerHeaderProps) => {
	return (
		<div className={`flex flex-col gap-1 px-6 pt-6 pb-2 ${className}`} {...props}>
			{children}
		</div>
	);
};

// ─── DrawerTitle ──────────────────────────────────────────────────────────────

export interface DrawerTitleProps extends HTMLAttributes<HTMLHeadingElement>
{
	className?: string;
}

export const DrawerTitle = ({ className = '', children, ...props }: DrawerTitleProps) => {
	const { titleId } = useDrawerContext();

	return (
		<h2 id={titleId} className={`text-lg font-semibold tracking-tight text-text ${className}`} {...props}>
			{children}
		</h2>
	);
};

// ─── DrawerContent ────────────────────────────────────────────────────────────

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const DrawerContent = ({ className = '', children, ...props }: DrawerContentProps) => {
	return (
		<div className={`flex-1 overflow-y-auto px-6 py-2 text-sm text-text-muted leading-relaxed ${className}`} {...props}>
			{children}
		</div>
	);
};

// ─── DrawerFooter ─────────────────────────────────────────────────────────────

export interface DrawerFooterProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const DrawerFooter = ({ className = '', children, ...props }: DrawerFooterProps) => {
	return (
		<div className={`flex items-center justify-end gap-2 px-6 pt-4 pb-6 ${className}`} {...props}>
			{children}
		</div>
	);
};

// ─── DrawerClose ──────────────────────────────────────────────────────────────

export interface DrawerCloseProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	className?: string;
}

export const DrawerClose = (
    {
        className = '',
        'aria-label': ariaLabel = 'Close',
        onClick,
        ...props
    }: DrawerCloseProps
) => {
	const { requestClose } = useDrawerContext();

	return (
		<button
			type='button'
			aria-label={ariaLabel}
			onClick={(e) =>
			{
				onClick?.(e);
				requestClose();
			}}
			className={`absolute top-4 right-4 rounded-md p-1 text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring ${className}`}
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
