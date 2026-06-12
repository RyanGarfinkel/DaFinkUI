'use client';;
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant  = 'default' | 'success' | 'warning' | 'danger';
export type ToastPosition =
	| 'top-left'    | 'top-center'    | 'top-right'
	| 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions
{
	title?:       string;
	description?: string;
	variant?:     ToastVariant;
	duration?:    number;
	action?:      { label: string; onClick: () => void };
}

interface ToastItem extends Required<Omit<ToastOptions, 'title' | 'action'>>
{
	id:      string;
	title?:  string;
	action?: ToastOptions['action'];
}

interface ToastContextValue
{
	toast: (opts: ToastOptions) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
	const ctx = useContext(ToastContext);
	if(!ctx) throw new Error('useToast must be used within <ToastProvider>');
	return ctx;
};

// ─── Position ─────────────────────────────────────────────────────────────────

const POSITION_CLASSES: Record<ToastPosition, string> = {
	'top-left':      'top-4 left-4 items-start',
	'top-center':    'top-4 left-1/2 -translate-x-1/2 items-center',
	'top-right':     'top-4 right-4 items-end',
	'bottom-left':   'bottom-4 left-4 items-start',
	'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
	'bottom-right':  'bottom-4 right-4 items-end',
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, { wrapper: string; icon: string; path: string }> = {
	default: {
		wrapper: 'bg-surface border-surface-border',
		icon:    'text-text-muted',
		path:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
	},
	success: {
		wrapper: 'bg-success-bg border-success-border',
		icon:    'text-success',
		path:    'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
	},
	warning: {
		wrapper: 'bg-warning-bg border-warning-border',
		icon:    'text-warning',
		path:    'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
	},
	danger: {
		wrapper: 'bg-danger-bg border-danger-border',
		icon:    'text-danger',
		path:    'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
	},
};

const ToastCard = (
    {
        item,
        isTop,
        onDismiss,
    }: {
        item:      ToastItem;
        isTop:     boolean;
        onDismiss: (id: string) => void;
    }
) => {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dismiss = () => {
		setVisible(false);
		setTimeout(() => onDismiss(item.id), 200);
	};

    useEffect(() =>
	{
		requestAnimationFrame(() => setVisible(true));
		timerRef.current = setTimeout(() => dismiss(), item.duration);
		return () => { if(timerRef.current) clearTimeout(timerRef.current); };
	}, []);

    const s = VARIANT_STYLES[item.variant];

    return (
		<div
			role={item.variant === 'danger' ? 'alert' : 'status'}
			aria-live={item.variant === 'danger' ? 'assertive' : 'polite'}
			aria-atomic='true'
			style={{
				transition: 'opacity 200ms ease, transform 200ms ease',
				opacity:    visible ? 1 : 0,
				transform:  visible ? 'translateY(0)' : `translateY(${isTop ? '-8px' : '8px'})`,
			}}
			className={[
				'flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 w-full max-w-sm',
				s.wrapper,
			].join(' ')}
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
				className={['mt-0.5 shrink-0', s.icon].join(' ')}
			>
				<path d={s.path} />
			</svg>

			<div className='flex-1 min-w-0'>
				{item.title && (
					<p className='text-sm font-semibold text-text leading-snug'>{item.title}</p>
				)}
				{item.description && (
					<p className='text-sm text-text-muted leading-relaxed mt-0.5'>{item.description}</p>
				)}
				{item.action && (
					<button
						type='button'
						onClick={() => { item.action!.onClick(); dismiss(); }}
						className='mt-2 text-xs font-medium text-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring rounded'
					>
						{item.action.label}
					</button>
				)}
			</div>

			<button
				type='button'
				onClick={dismiss}
				aria-label='Dismiss'
				className='shrink-0 rounded-md p-0.5 text-text-muted hover:text-text hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring'
			>
				<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
					<path d='M18 6 6 18M6 6l12 12' />
				</svg>
			</button>
		</div>
	);
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ToastProviderProps
{
	children:  React.ReactNode;
	position?: ToastPosition;
}

export const ToastProvider = ({ children, position = 'bottom-right' }: ToastProviderProps) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const toast = useCallback((opts: ToastOptions) =>
	{
		const item: ToastItem = {
			id:          Math.random().toString(36).slice(2),
			title:       opts.title,
			description: opts.description ?? '',
			variant:     opts.variant  ?? 'default',
			duration:    opts.duration ?? 4000,
			action:      opts.action,
		};
		setToasts((prev) => [...prev, item]);
	}, []);

    const dismiss = (id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	};

    const isTop       = position.startsWith('top');
    const posClasses  = POSITION_CLASSES[position];
    const flexDir     = isTop ? 'flex-col-reverse' : 'flex-col';

    return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div
				aria-label='Notifications'
				className={[
					'fixed z-50 flex gap-2 pointer-events-none',
					flexDir,
					posClasses,
				].join(' ')}
			>
				{toasts.map((item) => (
					<div key={item.id} className='pointer-events-auto w-full max-w-sm'>
						<ToastCard item={item} isTop={isTop} onDismiss={dismiss} />
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
};

export default ToastProvider;
