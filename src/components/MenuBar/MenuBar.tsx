import { HTMLAttributes } from 'react';

// ─── MenuBar ──────────────────────────────────────────────────────────────────

export interface MenuBarProps extends HTMLAttributes<HTMLElement>
{
	height?: string;
}

export const MenuBar = ({ height = 'h-14', className = '', children, ...props }: MenuBarProps) => {
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

// ─── MenuBarBrand ─────────────────────────────────────────────────────────────

export type MenuBarBrandProps = HTMLAttributes<HTMLDivElement>;

export const MenuBarBrand = ({ className = '', children, ...props }: MenuBarBrandProps) => {
	return (
		<div {...props} className={['flex shrink-0 items-center gap-2', className].join(' ')}>
			{children}
		</div>
	);
};

// ─── MenuBarActions ───────────────────────────────────────────────────────────

export type MenuBarActionsProps = HTMLAttributes<HTMLDivElement>;

export const MenuBarActions = ({ className = '', children, ...props }: MenuBarActionsProps) => {
	return (
		<div {...props} className={['ml-auto flex items-center gap-1.5', className].join(' ')}>
			{children}
		</div>
	);
};

export default MenuBar;
