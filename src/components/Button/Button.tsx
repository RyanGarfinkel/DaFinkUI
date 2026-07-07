'use client';

import { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'link' | 'destructive' | 'arrowleft' | 'arrowright' | 'on-color';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
export type ButtonShape = 'default' | 'circle';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	variant?: ButtonVariant;
	size?: ButtonSize;
	shape?: ButtonShape;
	loading?: boolean;
	href?: string;
}

// ─── Arrow icons ───────────────────────────────────────────────────────────────
// Exported so they can be used standalone; internally consumed by arrowleft/arrowright variants.
// group/btn is set on the button element by those variants, driving the translate on hover/focus.

export const ArrowLeft = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 15 15'
		fill='none'
		aria-hidden='true'
		className='shrink-0 motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] group-hover/btn:-translate-x-1 group-focus-visible/btn:-translate-x-1'
	>
		<path
			d='M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z'
			fill='currentColor'
			fillRule='evenodd'
			clipRule='evenodd'
		/>
	</svg>
);

export const ArrowRight = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 15 15'
		fill='none'
		aria-hidden='true'
		className='shrink-0 motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] group-hover/btn:translate-x-1 group-focus-visible/btn:translate-x-1'
	>
		<path
			d='M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z'
			fill='currentColor'
			fillRule='evenodd'
			clipRule='evenodd'
		/>
	</svg>
);

// ─── Styles ────────────────────────────────────────────────────────────────────

const ARROW_BASE = 'group/btn bg-surface text-text border-[length:var(--border-width)] border-surface-border shadow-[var(--shadow-sm)] hover:bg-surface-hover hover:border-surface-border-hover active:bg-surface-active focus-visible:border-transparent focus-visible:ring-brand-ring';

const variantClasses: Record<ButtonVariant, string> = {
	primary:     'bg-brand text-brand-fg [--shadow-color:var(--color-brand-active)] shadow-[var(--shadow-sm)] hover:bg-brand-hover hover:shadow-[var(--shadow)] active:bg-brand-active active:shadow-[var(--shadow-sm)] focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
	secondary:   'bg-surface text-text border-[length:var(--border-width)] border-surface-border shadow-[var(--shadow-sm)] hover:bg-surface-hover hover:border-surface-border-hover active:bg-surface-active focus-visible:border-transparent focus-visible:ring-brand-ring',
	outlined:    'border-2 border-brand text-brand hover:bg-brand/10 active:bg-brand/20 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
	ghost:       'text-text hover:bg-surface-hover active:bg-surface-active focus-visible:ring-brand-ring',
	link:        'text-text underline-offset-4 hover:underline active:text-text-muted focus-visible:ring-brand-ring',
	destructive: 'bg-danger text-text-inverted [--shadow-color:var(--color-danger-active)] shadow-[var(--shadow-sm)] hover:bg-danger-hover active:bg-danger-active focus-visible:ring-offset-2 focus-visible:ring-danger-ring',
	arrowleft:   ARROW_BASE,
	arrowright:  ARROW_BASE,
	'on-color':  'bg-current/15 text-current hover:bg-current/25 active:bg-current/30 focus-visible:ring-current',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm:        'h-8 px-3 text-xs',
	md:        'h-9 px-4 text-sm',
	lg:        'h-11 px-6 text-base',
	icon:      'h-9 w-9',
	'icon-sm': 'h-7 w-7',
};

const shapeClasses: Record<ButtonShape, string> = {
	default: 'rounded-[var(--radius)]',
	circle:  'rounded-full',
};

const BASE = 'inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40';

// ─── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
	<svg
		className='animate-spin'
		width='14'
		height='14'
		viewBox='0 0 24 24'
		fill='none'
		aria-hidden='true'
	>
		<circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-25' />
		<path d='M12 2a10 10 0 0 1 10 10' stroke='currentColor' strokeWidth='3' strokeLinecap='round' className='opacity-75' />
	</svg>
);

// ─── Button ────────────────────────────────────────────────────────────────────

const Button = (
	{
		variant = 'primary',
		size = 'md',
		shape = 'default',
		loading = false,
		className = '',
		children,
		disabled,
		href,
		...props
	}: ButtonProps
) => {
	const classes = `${BASE} ${shapeClasses[shape]} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

	const content = loading        ? <Spinner />
		: variant === 'arrowleft'  ? <><ArrowLeft />{children}</>
		: variant === 'arrowright' ? <>{children}<ArrowRight /></>
		: children;

	if(href)
	{
		return (
			<Link href={href} className={classes}>
				{content}
			</Link>
		);
	}

	return (
		<button
			aria-busy={loading || undefined}
			disabled={disabled || loading}
			className={classes}
			{...props}
		>
			{content}
		</button>
	);
};

export default Button;
