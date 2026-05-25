'use client';;
import { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'link' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	variant?: ButtonVariant;
	size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary:     'bg-brand text-brand-fg shadow-sm hover:bg-brand-hover active:bg-brand-active focus-visible:ring-brand-ring',
	secondary:   'bg-surface text-text border border-surface-border shadow-sm hover:bg-surface-hover hover:border-surface-border-hover active:bg-surface-active focus-visible:ring-surface-border',
	outlined:    'border-2 border-brand text-brand hover:bg-brand/10 active:bg-brand/20 focus-visible:ring-brand-ring',
	ghost:       'text-text hover:bg-surface-hover active:bg-surface-active focus-visible:ring-surface-border',
	link:        'text-text underline-offset-4 hover:underline active:text-text-muted focus-visible:ring-surface-border',
	destructive: 'bg-danger text-text-inverted shadow-sm hover:bg-danger-hover active:bg-danger-active focus-visible:ring-danger-ring',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'h-8 px-3 text-xs',
	md: 'h-9 px-4 text-sm',
	lg: 'h-11 px-6 text-base',
};

const BASE = 'inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40';

const Button = (
    {
        variant = 'primary',
        size = 'md',
        className = '',
        children,
        ...props
    }: ButtonProps
) => {
	return (
		<button
			className={`${BASE} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
};

export default Button;
