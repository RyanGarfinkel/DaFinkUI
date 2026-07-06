'use client';

import { KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DropdownMenuSide  = 'top' | 'right' | 'bottom' | 'left';
export type DropdownMenuAlign = 'start' | 'center' | 'end';

export interface DropdownMenuItem
{
	label:     string;
	onSelect?: () => void;
	disabled?: boolean;
}

export interface DropdownMenuSeparator
{
	separator: true;
}

export type DropdownMenuEntry = DropdownMenuItem | DropdownMenuSeparator;

export interface DropdownMenuProps
{
	items:             DropdownMenuEntry[];
	trigger:           ReactNode;
	side?:             DropdownMenuSide;
	align?:            DropdownMenuAlign;
	onSelect?:         (item: DropdownMenuItem) => void;
	disabled?:         boolean;
	className?:        string;
	triggerClassName?: string;
}

const isSeparator = (entry: DropdownMenuEntry): entry is DropdownMenuSeparator =>
	'separator' in entry;

// ─── DropdownMenu ─────────────────────────────────────────────────────────────

export const DropdownMenu = (
    {
        items,
        trigger,
        side             = 'bottom',
        align            = 'start',
        onSelect,
        disabled         = false,
        className        = '',
        triggerClassName = '',
    }: DropdownMenuProps
) => {
    const [mounted,     setMounted]     = useState(false);
    const [visible,     setVisible]     = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [typeahead,   setTypeahead]   = useState('');
    const [position,    setPosition]    = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const triggerRef     = useRef<HTMLButtonElement>(null);
    const menuRef        = useRef<HTMLUListElement>(null);
    const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const id     = useId();
    const menuId = `${id}-menu`;

    const navigable = items
		.map((entry, i) => ({ entry, i }))
		.filter(({ entry }) => !isSeparator(entry) && !entry.disabled)
		.map(({ i }) => i);

    const calcPosition = useCallback(() =>
    {
        if(!triggerRef.current) return;
        const t = triggerRef.current.getBoundingClientRect();
        const p = menuRef.current?.getBoundingClientRect() ?? { width: 0, height: 0 };
        const GAP = 8;
        let top = 0, left = 0;

        if(side === 'bottom')      top = t.bottom + GAP;
        else if(side === 'top')    top = t.top - p.height - GAP;
        else if(side === 'left')   top = t.top;
        else                       top = t.top;

        if(side === 'bottom' || side === 'top')
        {
            if(align === 'start')        left = t.left;
            else if(align === 'center')  left = t.left + (t.width - p.width) / 2;
            else                         left = t.right - p.width;
        }
        else if(side === 'left')  left = t.left - p.width - GAP;
        else                      left = t.right + GAP;

        if(side === 'left' || side === 'right')
        {
            if(align === 'center')   top = t.top + (t.height - p.height) / 2;
            else if(align === 'end') top = t.bottom - p.height;
        }

        const vw = window.innerWidth, vh = window.innerHeight;
        top  = Math.max(8, Math.min(top,  vh - (p.height || 0) - 8));
        left = Math.max(8, Math.min(left, vw - (p.width  || 0) - 8));

        setPosition({ top, left });
    }, [side, align]);

    const openMenu = (initial: 'first' | 'last') => {
		if(disabled || navigable.length === 0) return;
		setActiveIndex(initial === 'first' ? navigable[0] : navigable[navigable.length - 1]);
		setMounted(true);
	};

    const closeMenu = useCallback((returnFocus = true) => {
		setVisible(false);
		if(typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
		setTypeahead('');
		setTimeout(() => setMounted(false), 150);
		if(returnFocus) triggerRef.current?.focus();
	}, []);

    const activateItem = useCallback((index: number) => {
		const entry = items[index];
		if(!entry || isSeparator(entry) || entry.disabled) return;
		entry.onSelect?.();
		onSelect?.(entry);
		closeMenu();
	}, [items, onSelect, closeMenu]);

    useEffect(() =>
	{
		if(!mounted) return;
		requestAnimationFrame(() =>
		{
			calcPosition();
			setVisible(true);
			menuRef.current?.focus();
		});
	}, [mounted, calcPosition]);

    useEffect(() =>
	{
		if(!mounted) return;
		window.addEventListener('resize', calcPosition);
		window.addEventListener('scroll', calcPosition, true);
		return () =>
		{
			window.removeEventListener('resize', calcPosition);
			window.removeEventListener('scroll', calcPosition, true);
		};
	}, [mounted, calcPosition]);

    useEffect(() =>
	{
		if(!mounted) return;
		const item = document.getElementById(`${id}-item-${activeIndex}`);
		item?.scrollIntoView?.({ block: 'nearest' });
	}, [activeIndex, mounted, id]);

    useEffect(() =>
	{
        if(!mounted) return;

        const onPointerDown = (e: PointerEvent) => {
			if(
				!triggerRef.current?.contains(e.target as Node) &&
				!menuRef.current?.contains(e.target as Node)
			)
				closeMenu(false);
		};

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [mounted, closeMenu]);

    const moveActive = (offset: 1 | -1) => {
		const pos  = navigable.indexOf(activeIndex);
		const next = navigable[(pos + offset + navigable.length) % navigable.length];
		setActiveIndex(next);
	};

    const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
		if(mounted) return;

		if(e.key === 'ArrowDown')
		{
			e.preventDefault();
			openMenu('first');
		}
		else if(e.key === 'ArrowUp')
		{
			e.preventDefault();
			openMenu('last');
		}
	};

    const handleMenuKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
		switch(e.key)
		{
			case 'ArrowDown':
				e.preventDefault();
				moveActive(1);
				break;

			case 'ArrowUp':
				e.preventDefault();
				moveActive(-1);
				break;

			case 'Home':
				e.preventDefault();
				setActiveIndex(navigable[0]);
				break;

			case 'End':
				e.preventDefault();
				setActiveIndex(navigable[navigable.length - 1]);
				break;

			case 'Enter':
			case ' ':
				e.preventDefault();
				activateItem(activeIndex);
				break;

			case 'Escape':
				e.preventDefault();
				closeMenu();
				break;

			case 'Tab':
				closeMenu(false);
				break;

			default:
				if(e.key.length !== 1) break;

				const next = typeahead + e.key.toLowerCase();
				setTypeahead(next);

				if(typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
				typeaheadTimer.current = setTimeout(() => setTypeahead(''), 500);

				const pos = navigable.indexOf(activeIndex);
				for(let step = 1; step <= navigable.length; step++)
				{
					const idx   = navigable[(pos + step) % navigable.length];
					const entry = items[idx] as DropdownMenuItem;
					if(entry.label.toLowerCase().startsWith(next))
					{
						setActiveIndex(idx);
						break;
					}
				}
		}
	};

    return (
		<span className='inline-flex'>
			<button
				ref={triggerRef}
				id={`${id}-trigger`}
				type='button'
				disabled={disabled}
				aria-haspopup='menu'
				aria-expanded={mounted}
				aria-controls={mounted ? menuId : undefined}
				onClick={() => (mounted ? closeMenu() : openMenu('first'))}
				onKeyDown={handleTriggerKeyDown}
				className={[
					'inline-flex items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-input-border bg-input px-3 py-2 text-sm text-text',
					'transition-colors duration-[var(--duration-fast)]',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
					disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:border-brand',
					triggerClassName,
				].join(' ')}
			>
				{trigger}
			</button>

			{mounted && createPortal(
				<ul
					ref={menuRef}
					id={menuId}
					role='menu'
					tabIndex={-1}
					aria-labelledby={`${id}-trigger`}
					aria-activedescendant={`${id}-item-${activeIndex}`}
					onKeyDown={handleMenuKeyDown}
					style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50 }}
					className={[
						'min-w-48 max-h-72 overflow-y-auto rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel py-2 shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)] outline-none',
						'transition-[opacity,transform]',
						visible
							? 'opacity-100 scale-100 duration-[var(--duration-base)] ease-[var(--ease-enter)]'
							: 'opacity-0 scale-95 duration-[var(--duration-fast)] ease-[var(--ease-exit)]',
						className,
					].join(' ')}
				>
					{items.map((entry, i) =>
					{
						if(isSeparator(entry))
							return <li key={`sep-${i}`} role='separator' aria-orientation='horizontal' className='my-1 h-px bg-surface-border' />;

						const isActive   = i === activeIndex;
						const isDisabled = Boolean(entry.disabled);

						return (
							<li
								key={`${entry.label}-${i}`}
								id={`${id}-item-${i}`}
								role='menuitem'
								aria-disabled={isDisabled || undefined}
								onPointerDown={(e) => { e.preventDefault(); if(!isDisabled) activateItem(i); }}
								onPointerEnter={() => { if(!isDisabled) setActiveIndex(i); }}
								className={[
									'flex items-center mx-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm select-none whitespace-nowrap',
									'transition-colors duration-[var(--duration-fast)]',
									isDisabled
										? 'opacity-50 cursor-not-allowed text-text-muted'
										: isActive
											? 'bg-surface-active text-text cursor-pointer'
											: 'text-text-muted hover:bg-surface-hover hover:text-text cursor-pointer',
								].join(' ')}
							>
								{entry.label}
							</li>
						);
					})}
				</ul>,
				document.body
			)}
		</span>
	);
};

export default DropdownMenu;
