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

// ─── Modal context ────────────────────────────────────────────────────────────

interface ModalContextValue
{
	titleId:      string;
	requestClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

const useModalContext = () =>
{
	const ctx = useContext(ModalContext);
	if(!ctx) throw new Error('Modal subcomponents must be used inside <Modal>');
	return ctx;
};

// ─── Modal ────────────────────────────────────────────────────────────────────

export interface ModalProps extends DialogHTMLAttributes<HTMLDialogElement>
{
	open:         boolean;
	onOpenChange: (open: boolean) => void;
	className?:   string;
}

const Modal = (
    {
        open,
        onOpenChange,
        className = '',
        children,
        ...props
    }: ModalProps
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

			// Return focus to the trigger — always, regardless of how the modal closed
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

	// Return focus if the modal unmounts entirely while still open
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
			// The modal may have been closed again before this frame ran
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
		<ModalContext.Provider value={{ titleId, requestClose }}>
			<dialog
				ref={dialogRef}
				role='dialog'
				aria-modal='true'
				aria-labelledby={titleId}
				style={{ width: '100vw', height: '100dvh', maxWidth: '100%', maxHeight: '100%', margin: 0 }}
				className='fixed inset-0 flex items-center justify-center px-4 p-0 border-0 bg-transparent overflow-visible'
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
					onPointerDown={(e) => e.stopPropagation()}
					className={[
						'relative z-10 w-full max-w-md rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
						'focus:outline-none',
						'motion-safe:transition-[opacity,transform]',
						visible
							? 'opacity-100 scale-100 motion-safe:duration-[var(--duration-base)] motion-safe:ease-[var(--ease-enter)]'
							: 'opacity-0 scale-95 motion-safe:duration-[var(--duration-fast)] motion-safe:ease-[var(--ease-exit)]',
						className,
					].join(' ')}
				>
					{children}
				</div>
			</dialog>
		</ModalContext.Provider>
	);
};

export default Modal;

// ─── ModalHeader ──────────────────────────────────────────────────────────────

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const ModalHeader = ({ className = '', children, ...props }: ModalHeaderProps) => {
	return (
		<div className={`flex flex-col gap-1 px-6 pt-6 pb-2 ${className}`} {...props}>
			{children}
		</div>
	);
};

// ─── ModalTitle ───────────────────────────────────────────────────────────────

export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement>
{
	className?: string;
}

export const ModalTitle = ({ className = '', children, ...props }: ModalTitleProps) => {
	const { titleId } = useModalContext();

	return (
		<h2 id={titleId} className={`text-lg font-semibold tracking-tight text-text ${className}`} {...props}>
			{children}
		</h2>
	);
};

// ─── ModalContent ─────────────────────────────────────────────────────────────

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const ModalContent = ({ className = '', children, ...props }: ModalContentProps) => {
	return (
		<div className={`px-6 py-2 text-sm text-text-muted leading-relaxed ${className}`} {...props}>
			{children}
		</div>
	);
};

// ─── ModalFooter ──────────────────────────────────────────────────────────────

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

export const ModalFooter = ({ className = '', children, ...props }: ModalFooterProps) => {
	return (
		<div className={`flex items-center justify-end gap-2 px-6 pt-4 pb-6 ${className}`} {...props}>
			{children}
		</div>
	);
};

// ─── ModalClose ───────────────────────────────────────────────────────────────

export interface ModalCloseProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	className?: string;
}

export const ModalClose = (
    {
        className = '',
        'aria-label': ariaLabel = 'Close',
        onClick,
        ...props
    }: ModalCloseProps
) => {
	const { requestClose } = useModalContext();

	return (
		<button
			type='button'
			aria-label={ariaLabel}
			onClick={(e) =>
			{
				onClick?.(e);
				requestClose();
			}}
			className={`absolute top-4 right-4 rounded-[var(--radius)] p-1 text-text-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring ${className}`}
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
