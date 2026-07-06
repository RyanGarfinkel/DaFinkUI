import { HTMLAttributes } from 'react';

// ─── TopNav ───────────────────────────────────────────────────────────────────

export interface TopNavProps extends HTMLAttributes<HTMLElement>
{
	height?: string;
}

export const TopNav = ({ height = 'h-14', className = '', children, ...props }: TopNavProps) => {
	const hasPositionOverride = /\b(static|fixed|absolute|sticky|relative)\b/.test(className);

	return (
		<header
			{...props}
			className={[
				hasPositionOverride ? '' : 'fixed top-0 left-0 right-0',
				'z-50 flex items-center gap-2 px-3 sm:gap-3 sm:px-6',
				'border-b-[length:var(--border-width)] border-surface-border bg-surface/95 backdrop-blur-md',
				height, className,
			].filter(Boolean).join(' ')}
		>
			{children}
		</header>
	);
};

// ─── TopNavBrand ──────────────────────────────────────────────────────────────

export type TopNavBrandProps = HTMLAttributes<HTMLDivElement>;

export const TopNavBrand = ({ className = '', children, ...props }: TopNavBrandProps) => {
	return (
		<div {...props} className={['flex shrink-0 items-center gap-2', className].join(' ')}>
			{children}
		</div>
	);
};

// ─── TopNavActions ────────────────────────────────────────────────────────────

export type TopNavActionsProps = HTMLAttributes<HTMLDivElement>;

export const TopNavActions = ({ className = '', children, ...props }: TopNavActionsProps) => {
	return (
		<div {...props} className={['ml-auto flex items-center gap-1.5', className].join(' ')}>
			{children}
		</div>
	);
};

export default TopNav;
