import { createContext, useContext, useRef, useEffect, useState, HTMLAttributes, ButtonHTMLAttributes } from 'react';
import { DropdownMenu, DropdownMenuItem } from '../DropdownMenu/DropdownMenu';

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

// ─── MenuBarNav ───────────────────────────────────────────────────────────────

interface MenuBarNavContextValue
{
	value:          string;
	onValueChange:  (value: string) => void;
	rovingValue:    string | null;
	setRovingValue: (v: string) => void;
}

const MenuBarNavContext = createContext<MenuBarNavContextValue | null>(null);

const useMenuBarNavContext = () =>
{
	const ctx = useContext(MenuBarNavContext);
	if(!ctx) throw new Error('MenuBarNavItem and MenuBarNavMore must be used inside a MenuBarNav');
	return ctx;
};

export interface MenuBarNavProps
{
	value:              string;
	onValueChange:      (value: string) => void;
	className?:         string;
	children:           React.ReactNode;
	'aria-label'?:      string;
}

const NAV_ITEM_BASE = 'relative z-10 inline-flex h-8 items-center justify-center gap-1.5 rounded-[max(0px,calc(var(--radius)_-_0.25rem))] px-3 text-sm font-medium tracking-tight transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring disabled:pointer-events-none disabled:opacity-40';

export const MenuBarNav = ({ value, onValueChange, className = '', children, 'aria-label': ariaLabel }: MenuBarNavProps) => {
	const navRef       = useRef<HTMLElement>(null);
	const indicatorRef = useRef<HTMLDivElement>(null);
	const initialized  = useRef(false);

	const [rovingValue, setRovingValue] = useState<string | null>(null);

	useEffect(() => {
		const nav      = navRef.current;
		const active   = nav?.querySelector<HTMLElement>('[data-menubar-nav-item][aria-current="page"]');
		const fallback = active ?? nav?.querySelector<HTMLElement>('[data-menubar-nav-item]:not(:disabled)');

		if(!fallback?.dataset.value) return;

		const val = fallback.dataset.value;
		const id  = setTimeout(() => setRovingValue(val), 0);
		return () => clearTimeout(id);
	}, [value]);

	useEffect(() => {
		const nav       = navRef.current;
		const indicator = indicatorRef.current;
		if(!nav || !indicator) return;

		const active = nav.querySelector<HTMLElement>('[data-menubar-nav-item][aria-current="page"]');

		if(!active) {
			indicator.style.opacity = '0';
			return;
		}

		indicator.style.opacity = '1';

		if(!initialized.current) {
			indicator.style.transition = 'none';
			indicator.style.left       = `${active.offsetLeft}px`;
			indicator.style.width      = `${active.offsetWidth}px`;
			indicator.getBoundingClientRect();
			indicator.style.transition = '';
			initialized.current        = true;
		} else {
			indicator.style.left  = `${active.offsetLeft}px`;
			indicator.style.width = `${active.offsetWidth}px`;
		}
	}, [value]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		const items = Array.from(
			navRef.current?.querySelectorAll<HTMLButtonElement>('[data-menubar-nav-item]:not(:disabled)') ?? []
		);
		if(items.length < 2) return;

		const idx = items.indexOf(document.activeElement as HTMLButtonElement);
		if(idx === -1) return;

		let next: HTMLButtonElement | undefined;

		if(e.key === 'ArrowRight') {
			e.preventDefault();
			next = items[(idx + 1) % items.length];
		} else if(e.key === 'ArrowLeft') {
			e.preventDefault();
			next = items[(idx - 1 + items.length) % items.length];
		} else if(e.key === 'Home') {
			e.preventDefault();
			next = items[0];
		} else if(e.key === 'End') {
			e.preventDefault();
			next = items[items.length - 1];
		}

		if(!next) return;

		if(next.dataset.value) setRovingValue(next.dataset.value);
		next.focus();
	};

	return (
		<MenuBarNavContext.Provider value={{ value, onValueChange, rovingValue, setRovingValue: (v) => setRovingValue(v) }}>
			<nav
				ref={navRef}
				aria-label={ariaLabel}
				onKeyDown={handleKeyDown}
				className={['relative isolate inline-flex items-center gap-1', className].join(' ')}
			>
				<div
					ref={indicatorRef}
					aria-hidden='true'
					className='absolute inset-y-1 left-0 z-0 rounded-[max(0px,calc(var(--radius)_-_0.25rem))] bg-brand opacity-0 shadow-[var(--shadow-sm)] motion-safe:transition-[left,width,opacity] motion-safe:duration-200'
				/>
				{children}
			</nav>
		</MenuBarNavContext.Provider>
	);
};

// ─── MenuBarNavItem ───────────────────────────────────────────────────────────

export interface MenuBarNavItemProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	value:      string;
	children:   React.ReactNode;
	className?: string;
}

export const MenuBarNavItem = ({ value, disabled = false, children, className = '', ...props }: MenuBarNavItemProps) => {
	const ctx      = useMenuBarNavContext();
	const isActive = ctx.value === value;

	const handleClick = () => {
		if(disabled) return;
		ctx.setRovingValue(value);
		ctx.onValueChange(value);
	};

	return (
		<button
			type='button'
			data-menubar-nav-item
			data-value={value}
			aria-current={isActive ? 'page' : undefined}
			disabled={disabled}
			tabIndex={ctx.rovingValue === value ? 0 : -1}
			onClick={handleClick}
			className={[
				NAV_ITEM_BASE,
				isActive ? 'text-brand-fg' : 'text-text-muted hover:text-text hover:bg-surface-hover',
				className,
			].join(' ')}
			{...props}
		>
			{children}
		</button>
	);
};

// ─── MenuBarNavMore ───────────────────────────────────────────────────────────

export interface MenuBarNavMoreItem extends Omit<DropdownMenuItem, 'onSelect'>
{
	value:     string;
	onSelect?: () => void;
}

export interface MenuBarNavMoreProps
{
	value:      string;
	items:      MenuBarNavMoreItem[];
	children:   React.ReactNode;
	className?: string;
}

const ChevronDownIcon = () => (
	<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
		<path d='m6 9 6 6 6-6' />
	</svg>
);

export const MenuBarNavMore = ({ value, items, children, className = '' }: MenuBarNavMoreProps) => {
	const ctx      = useMenuBarNavContext();
	const isActive = items.some(item => item.value === ctx.value);

	const menuItems = items.map(item => ({
		label:    item.label,
		disabled: item.disabled,
		onSelect: () => {
			ctx.onValueChange(item.value);
			item.onSelect?.();
		},
	}));

	const triggerProps: ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown> = {
		'data-menubar-nav-item': true,
		'data-value':            value,
		'aria-current':          isActive ? 'page' : undefined,
		tabIndex:                ctx.rovingValue === value ? 0 : -1,
		onFocus:                 () => ctx.setRovingValue(value),
	};

	return (
		<DropdownMenu
			items={menuItems}
			trigger={
				<>
					<span>{children}</span>
					<ChevronDownIcon />
				</>
			}
			triggerClassName={[
				NAV_ITEM_BASE,
				isActive ? 'text-brand-fg' : 'text-text-muted hover:text-text hover:bg-surface-hover',
				className,
			].join(' ')}
			triggerProps={triggerProps}
			unstyledTrigger
		/>
	);
};

export default MenuBar;
