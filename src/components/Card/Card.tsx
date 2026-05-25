import { HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outline';

export interface CardProps extends HTMLAttributes<HTMLDivElement>
{
	variant?: CardVariant;
	interactive?: boolean;
	className?: string;
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement>
{
	className?: string;
}

const variantClasses: Record<CardVariant, string> = {
	default:  'bg-surface border border-surface-border rounded-lg',
	elevated: 'bg-surface shadow-md rounded-lg',
	outline:  'bg-transparent border-2 border-surface-border rounded-lg',
};

const interactiveClasses = 'motion-safe:transition-[box-shadow,transform] motion-safe:duration-[var(--duration-fast)] cursor-pointer hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring';

export const Card = (
    {
        variant = 'default',
        interactive = false,
        className = '',
        children,
        ...props
    }: CardProps
) => {
	return (
		<div
			className={`${variantClasses[variant]} ${interactive ? interactiveClasses : ''} ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

export const CardHeader = (
    {
        className = '',
        children,
        ...props
    }: CardSectionProps
) => {
	return (
		<div
			className={`px-6 pt-6 pb-4 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

export const CardContent = (
    {
        className = '',
        children,
        ...props
    }: CardSectionProps
) => {
	return (
		<div
			className={`px-6 py-4 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

export const CardFooter = (
    {
        className = '',
        children,
        ...props
    }: CardSectionProps
) => {
	return (
		<div
			className={`px-6 pt-4 pb-6 flex justify-end gap-3 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};
