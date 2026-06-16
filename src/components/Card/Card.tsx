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

// Shape, depth, and translucency come from surface (style) tokens so the Card
// re-skins automatically when the active Style changes. Color stays on palette tokens.
const variantClasses: Record<CardVariant, string> = {
	default:  'bg-surface-panel border-[length:var(--border-width)] border-surface-border rounded-[var(--radius)] shadow-[var(--shadow-sm)] backdrop-blur-[var(--backdrop-blur)]',
	elevated: 'bg-surface-panel rounded-[var(--radius)] shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
	outline:  'bg-transparent border-[length:var(--border-width)] border-surface-border rounded-[var(--radius)]',
};

const interactiveClasses = 'motion-safe:transition-[box-shadow,transform] motion-safe:duration-[var(--duration-fast)] cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring';

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
			className={`@container ${variantClasses[variant]} ${interactive ? interactiveClasses : ''} ${className}`}
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
			className={`px-4 pt-4 pb-3 @sm:px-6 @sm:pt-6 @sm:pb-4 ${className}`}
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
			className={`px-4 py-3 @sm:px-6 @sm:py-4 ${className}`}
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
			className={`px-4 pt-3 pb-4 flex flex-col gap-2 @sm:px-6 @sm:pt-4 @sm:pb-6 @sm:flex-row @sm:justify-end @sm:gap-3 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};
