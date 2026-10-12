'use client';

import { KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type MenuSide  = 'top' | 'right' | 'bottom' | 'left';
export type MenuAlign = 'start' | 'center' | 'end';

export interface MenuLeaf {
	label:     string;
	onSelect?: () => void;
	disabled?: boolean;
	selected?: boolean;
	detail?:   string;
}

export interface MenuSeparator {
	separator: true;
}

export type MenuLeafEntry = MenuLeaf | MenuSeparator;

export interface MenuItem extends MenuLeaf {
	submenu?: MenuLeafEntry[];
}

export type MenuEntry = MenuItem | MenuSeparator;

export interface MenuProps {
	items:             MenuEntry[];
	trigger:           ReactNode;
	side?:             MenuSide;
	align?:            MenuAlign;
	onSelect?:         (item: MenuItem) => void;
	disabled?:         boolean;
	className?:        string;
	triggerClassName?: string;
	triggerProps?:     ButtonHTMLAttributes<HTMLButtonElement>;
	unstyledTrigger?:  boolean;
}

const isSeparator = (entry: MenuEntry): entry is MenuSeparator =>
	'separator' in entry;

const navigableIndexes = (entries: MenuEntry[]) => entries
	.map((entry, i) => ({ entry, i }))
	.filter(({ entry }) => !isSeparator(entry) && !entry.disabled)
	.map(({ i }) => i);

const CheckIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M20 6 9 17l-5-5' />
	</svg>
);

const ChevronIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='m9 18 6-6-6-6' />
	</svg>
);

interface MenuEntriesProps {
	entries:    MenuEntry[];
	idPrefix:   string;
	activeAt:   number | null;
	expandedAt: number | null;
	onEnter:    (index: number) => void;
	onPress:    (index: number) => void;
}

const MenuEntries = ({ entries, idPrefix, activeAt, expandedAt, onEnter, onPress }: MenuEntriesProps) => (
	<>
		{entries.map((entry, i) =>
		{
			if(isSeparator(entry))
				return <li key={`sep-${i}`} role='separator' aria-orientation='horizontal' className='my-1 h-px bg-surface-border' />;

			const isActive   = i === activeAt;
			const isDisabled = Boolean(entry.disabled);
			const hasSub     = Boolean(entry.submenu);
			const isChecked  = entry.selected !== undefined;

			return (
				<li
					key={`${entry.label}-${i}`}
					id={`${idPrefix}-${i}`}
					role={isChecked ? 'menuitemradio' : 'menuitem'}
					aria-checked={isChecked ? entry.selected : undefined}
					aria-haspopup={hasSub ? 'menu' : undefined}
					aria-expanded={hasSub ? expandedAt === i : undefined}
					aria-disabled={isDisabled || undefined}
					onPointerDown={(e) => { e.preventDefault(); if(!isDisabled) onPress(i); }}
					onPointerEnter={() => { if(!isDisabled) onEnter(i); }}
					className={[
						'flex items-center gap-3 mx-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm select-none whitespace-nowrap',
						'transition-colors duration-[var(--duration-fast)]',
						isDisabled
							? 'opacity-50 cursor-not-allowed text-text-muted'
							: isActive
								? 'bg-surface-active text-text cursor-pointer'
								: 'text-text-muted hover:bg-surface-hover hover:text-text cursor-pointer',
					].join(' ')}
				>
					{isChecked && <span className={`-ml-1 flex w-3.5 shrink-0 ${entry.selected ? 'opacity-100' : 'opacity-0'}`}><CheckIcon /></span>}
					<span className='flex-1'>{entry.label}</span>
					{entry.detail && <span className='text-xs text-text-muted'>{entry.detail}</span>}
					{hasSub && <ChevronIcon />}
				</li>
			);
		})}
	</>
);

export const Menu = (
    {
        items,
        trigger,
        side             = 'bottom',
        align            = 'start',
        onSelect,
        disabled         = false,
        className        = '',
        triggerClassName = '',
        triggerProps,
        unstyledTrigger  = false,
    }: MenuProps
) => {
    const [mounted,     setMounted]     = useState(false);
    const [visible,     setVisible]     = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [typeahead,   setTypeahead]   = useState('');
    const [position,    setPosition]    = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [subOpen,     setSubOpen]     = useState<number | null>(null);
    const [subActive,   setSubActive]   = useState<number | null>(null);
    const [subVisible,  setSubVisible]  = useState(false);
    const [subPosition, setSubPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const triggerRef     = useRef<HTMLButtonElement>(null);
    const menuRef        = useRef<HTMLUListElement>(null);
    const subRef         = useRef<HTMLUListElement>(null);
    const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const id     = useId();
    const menuId = `${id}-menu`;

    const navigable = navigableIndexes(items);

    const parentEntry = subOpen === null ? undefined : items[subOpen];
    const subItems    = parentEntry && !isSeparator(parentEntry) ? parentEntry.submenu ?? [] : [];
    const subNavigable = navigableIndexes(subItems);

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

    const calcSubPosition = useCallback(() =>
	{
		if(subOpen === null || !subRef.current) return;
		const parent = document.getElementById(`${id}-item-${subOpen}`);
		if(!parent) return;

		const t   = parent.getBoundingClientRect();
		const p   = subRef.current.getBoundingClientRect();
		const GAP = 4;

		let left = t.right + GAP;
		if(left + p.width > window.innerWidth - 8) left = t.left - p.width - GAP;

		const top = Math.max(8, Math.min(t.top - 8, window.innerHeight - p.height - 8));
		setSubPosition({ top, left: Math.max(8, left) });
	}, [subOpen, id]);

    const closeSubmenu = () => {
		setSubOpen(null);
		setSubActive(null);
		setSubVisible(false);
	};

    const enterSubmenu = (index: number) => {
		const entry = items[index];
		if(!entry || isSeparator(entry) || !entry.submenu) return;

		const first = navigableIndexes(entry.submenu)[0];
		if(first === undefined) return;

		setActiveIndex(index);
		setSubOpen(index);
		setSubActive(first);
	};

    const setActiveRoot = (index: number) => {
		setActiveIndex(index);
		if(subOpen !== null && subOpen !== index) closeSubmenu();
	};

    const closeMenu = useCallback((returnFocus = true) => {
		setVisible(false);
		setSubOpen(null);
		setSubActive(null);
		setSubVisible(false);
		if(typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
		setTypeahead('');
		setTimeout(() => setMounted(false), 150);
		if(returnFocus) triggerRef.current?.focus();
	}, []);

    const activateEntry = useCallback((entry: MenuEntry | undefined) => {
		if(!entry || isSeparator(entry) || entry.disabled) return;
		entry.onSelect?.();
		onSelect?.(entry);
		closeMenu();
	}, [onSelect, closeMenu]);

    const activateRoot = (index: number) => {
		const entry = items[index];
		if(entry && !isSeparator(entry) && entry.submenu)
		{
			if(!entry.disabled) enterSubmenu(index);
			return;
		}
		activateEntry(entry);
	};

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
		if(subOpen === null) return;
		const frame = requestAnimationFrame(() =>
		{
			calcSubPosition();
			setSubVisible(true);
		});
		return () => cancelAnimationFrame(frame);
	}, [subOpen, calcSubPosition]);

    useEffect(() =>
	{
		if(!mounted) return;
		const reposition = () => {
			calcPosition();
			calcSubPosition();
		};
		window.addEventListener('resize', reposition);
		window.addEventListener('scroll', reposition, true);
		return () =>
		{
			window.removeEventListener('resize', reposition);
			window.removeEventListener('scroll', reposition, true);
		};
	}, [mounted, calcPosition, calcSubPosition]);

    useEffect(() =>
	{
		if(!mounted) return;
		const target = subActive !== null ? `${id}-sub-${subActive}` : `${id}-item-${activeIndex}`;
		document.getElementById(target)?.scrollIntoView?.({ block: 'nearest' });
	}, [activeIndex, subActive, mounted, id]);

    useEffect(() =>
	{
        if(!mounted) return;

        const onPointerDown = (e: PointerEvent) => {
			if(
				!triggerRef.current?.contains(e.target as Node) &&
				!menuRef.current?.contains(e.target as Node) &&
				!subRef.current?.contains(e.target as Node)
			)
				closeMenu(false);
		};

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [mounted, closeMenu]);

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
		const inSub   = subActive !== null;
		const entries = inSub ? subItems : items;
		const nav     = inSub ? subNavigable : navigable;
		const current = inSub ? subActive : activeIndex;
		const setCurrent = inSub ? setSubActive : setActiveRoot;
		const pos     = nav.indexOf(current);

		switch(e.key)
		{
			case 'ArrowDown':
				e.preventDefault();
				setCurrent(nav[(pos + 1) % nav.length]);
				break;

			case 'ArrowUp':
				e.preventDefault();
				setCurrent(nav[(pos - 1 + nav.length) % nav.length]);
				break;

			case 'Home':
				e.preventDefault();
				setCurrent(nav[0]);
				break;

			case 'End':
				e.preventDefault();
				setCurrent(nav[nav.length - 1]);
				break;

			case 'ArrowRight':
				if(inSub) break;
				e.preventDefault();
				enterSubmenu(activeIndex);
				break;

			case 'ArrowLeft':
				if(!inSub) break;
				e.preventDefault();
				closeSubmenu();
				break;

			case 'Enter':
			case ' ':
				e.preventDefault();
				if(inSub) activateEntry(subItems[subActive]);
				else activateRoot(activeIndex);
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

				for(let step = 1; step <= nav.length; step++)
				{
					const idx   = nav[(pos + step) % nav.length];
					const entry = entries[idx] as MenuItem;
					if(entry.label.toLowerCase().startsWith(next))
					{
						setCurrent(idx);
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
				className={unstyledTrigger ? triggerClassName : [
					'inline-flex items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-input-border bg-surface px-3 py-2 text-sm text-text',
					'transition-colors duration-[var(--duration-fast)]',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
					disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:border-brand',
					triggerClassName,
				].join(' ')}
				{...triggerProps}
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
					aria-activedescendant={subActive !== null ? `${id}-sub-${subActive}` : `${id}-item-${activeIndex}`}
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
					<MenuEntries
						entries={items}
						idPrefix={`${id}-item`}
						activeAt={activeIndex}
						expandedAt={subOpen}
						onEnter={(i) =>
						{
							setActiveIndex(i);
							const entry = items[i];
							if(!isSeparator(entry) && entry.submenu && !entry.disabled) setSubOpen(i);
							else closeSubmenu();
						}}
						onPress={activateRoot}
					/>
				</ul>,
				document.body
			)}

			{mounted && subOpen !== null && createPortal(
				<ul
					ref={subRef}
					role='menu'
					aria-label={parentEntry && !isSeparator(parentEntry) ? parentEntry.label : undefined}
					style={{ position: 'fixed', top: subPosition.top, left: subPosition.left, zIndex: 51 }}
					className={[
						'min-w-40 max-h-72 overflow-y-auto rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel py-2 shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)] outline-none',
						'transition-[opacity,transform]',
						subVisible
							? 'opacity-100 scale-100 duration-[var(--duration-base)] ease-[var(--ease-enter)]'
							: 'opacity-0 scale-95 duration-[var(--duration-fast)] ease-[var(--ease-exit)]',
					].join(' ')}
				>
					<MenuEntries
						entries={subItems}
						idPrefix={`${id}-sub`}
						activeAt={subActive}
						expandedAt={null}
						onEnter={setSubActive}
						onPress={(i) => activateEntry(subItems[i])}
					/>
				</ul>,
				document.body
			)}
		</span>
	);
};

export default Menu;
