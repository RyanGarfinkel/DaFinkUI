'use client';

import { HTMLAttributes } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
	default: 'bg-surface-active text-text border-transparent',
	success: 'bg-success-bg text-success border-success-border',
	warning: 'bg-warning-bg text-warning border-warning-border',
	danger:  'bg-danger/10 text-danger border-danger/20',
	outline: 'bg-transparent text-text border-surface-border',
};

export const Badge = ({ variant = 'default', className = '', children, ...props }: BadgeProps) => {
	return (
		<span
			{...props}
			className={[
				'inline-flex items-center rounded-full border-[length:var(--border-width)] px-2 py-0.5 text-xs font-medium leading-none',
				VARIANT_CLASSES[variant],
				className,
			].join(' ')}
		>
			{children}
		</span>
	);
};

export default Badge;
