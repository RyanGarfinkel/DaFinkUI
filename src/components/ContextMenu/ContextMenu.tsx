'use client';

import { KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { MenuEntries, menuPanelClasses, navigableIndexes } from '../Menu/Menu';
import type { MenuLeaf, MenuLeafEntry } from '../Menu/Menu';
import { createPortal } from 'react-dom';

export interface ContextMenuProps {
	/** Menu entries. Submenus aren't supported; use separators to group. */
	items:         MenuLeafEntry[];
	/** The region that opens the menu on right-click (or Shift+F10 / the Menu key when focus is inside it). */
	children:      ReactNode;
	/** Accessible name for the menu. */
	label?:        string;
	disabled?:     boolean;
	onOpenChange?: (open: boolean) => void;
	/** Additional classes on the menu panel. */
	className?:    string;
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
const VIEWPORT_MARGIN = 8;
const EXIT_MS = 150;
// Touch long-press: hold this long without moving more than LONG_PRESS_SLOP px.
const LONG_PRESS_MS = 500;
const LONG_PRESS_SLOP = 10;

export const ContextMenu = ({ items, children, label = 'Context menu', disabled = false, onOpenChange, className = '' }: ContextMenuProps) => {
	const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
	const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
	const [visible, setVisible] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [typeahead, setTypeahead] = useState('');

	const menuRef = useRef<HTMLUListElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const pressRef = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);

	const id = useId();
	const navigable = navigableIndexes(items);
	const mounted = point !== null;

	const openAt = (x: number, y: number, target: EventTarget) => {
		if(disabled || !navigable.length) return;
		clearTimeout(closeTimerRef.current);
		returnFocusRef.current = (target as HTMLElement).closest?.<HTMLElement>(FOCUSABLE) ?? (document.activeElement as HTMLElement | null);
		setActiveIndex(navigable[0]);
		setVisible(false);
		setPoint({ x, y });
		onOpenChange?.(true);
	};

	const close = useCallback((returnFocus: boolean) =>
	{
		setVisible(false);
		clearTimeout(closeTimerRef.current);
		closeTimerRef.current = setTimeout(() => setPoint(null), EXIT_MS);
		onOpenChange?.(false);
		if(returnFocus) returnFocusRef.current?.focus();
	}, [onOpenChange]);

	const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
		if(disabled) return;
		e.preventDefault();
		// A keyboard-initiated contextmenu event can report (0, 0); anchor to the target instead.
		if(e.clientX === 0 && e.clientY === 0)
		{
			const rect = (e.target as HTMLElement).getBoundingClientRect();
			openAt(rect.left, rect.bottom, e.target);
			return;
		}
		openAt(e.clientX, e.clientY, e.target);
	};

	// iOS Safari never fires contextmenu for a long-press, so touch gets its own
	// timer (Android fires both; opening twice at the same point is harmless).
	const cancelPress = () => {
		if(pressRef.current) clearTimeout(pressRef.current.timer);
		pressRef.current = null;
	};

	const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
		if(disabled || e.pointerType !== 'touch') return;
		cancelPress();
		const { clientX: x, clientY: y, target } = e;
		pressRef.current = { x, y, timer: setTimeout(() =>
		{
			pressRef.current = null;
			openAt(x, y, target);
		}, LONG_PRESS_MS) };
	};

	const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
		const press = pressRef.current;
		if(press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > LONG_PRESS_SLOP) cancelPress();
	};

	const handleRegionKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if(!((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu')) return;
		e.preventDefault();
		const rect = (e.target as HTMLElement).getBoundingClientRect();
		openAt(rect.left, rect.bottom, e.target);
	};

	useLayoutEffect(() =>
	{
		if(!point || !menuRef.current) return;
		// offset* sizes ignore the 0.95 entry scale, which getBoundingClientRect would include.
		const { offsetWidth: width, offsetHeight: height } = menuRef.current;
		setPosition({
			left: Math.max(VIEWPORT_MARGIN, Math.min(point.x, window.innerWidth - width - VIEWPORT_MARGIN)),
			top:  Math.max(VIEWPORT_MARGIN, Math.min(point.y, window.innerHeight - height - VIEWPORT_MARGIN)),
		});
		menuRef.current.focus({ preventScroll: true });
		const frame = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(frame);
	}, [point]);

	useEffect(() =>
	{
		if(!mounted) return;
		const onPointerDown = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && close(false);
		const onDismiss = () => close(false);
		document.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('resize', onDismiss);
		window.addEventListener('scroll', onDismiss, true);
		return () =>
		{
			document.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('resize', onDismiss);
			window.removeEventListener('scroll', onDismiss, true);
		};
	}, [mounted, close]);

	useEffect(() => () =>
	{
		clearTimeout(closeTimerRef.current);
		clearTimeout(typeaheadTimerRef.current);
		if(pressRef.current) clearTimeout(pressRef.current.timer);
	}, []);

	const activate = (index: number) => {
		const entry = items[index] as MenuLeaf;
		if(entry.disabled) return;
		close(true);
		entry.onSelect?.();
	};

	const handleMenuKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
		const pos = navigable.indexOf(activeIndex);

		switch(e.key)
		{
		case 'ArrowDown':
			e.preventDefault();
			setActiveIndex(navigable[(pos + 1) % navigable.length]);
			break;
		case 'ArrowUp':
			e.preventDefault();
			setActiveIndex(navigable[(pos - 1 + navigable.length) % navigable.length]);
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
			activate(activeIndex);
			break;
		case 'Escape':
		case 'Tab':
			e.preventDefault();
			close(true);
			break;
		default: {
			if(e.key.length !== 1) break;
			const next = typeahead + e.key.toLowerCase();
			setTypeahead(next);
			clearTimeout(typeaheadTimerRef.current);
			typeaheadTimerRef.current = setTimeout(() => setTypeahead(''), 500);
			for(let step = 1; step <= navigable.length; step++)
			{
				const index = navigable[(pos + step) % navigable.length];
				if((items[index] as MenuLeaf).label.toLowerCase().startsWith(next))
				{
					setActiveIndex(index);
					break;
				}
			}
		}
		}
	};

	return (
		<>
			<div
				className='contents'
				onContextMenu={handleContextMenu}
				onKeyDown={handleRegionKeyDown}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={cancelPress}
				onPointerCancel={cancelPress}
			>
				{children}
			</div>

			{mounted && createPortal(
				<ul
					ref={menuRef}
					id={`${id}-menu`}
					role='menu'
					tabIndex={-1}
					aria-label={label}
					aria-activedescendant={`${id}-item-${activeIndex}`}
					onKeyDown={handleMenuKeyDown}
					onContextMenu={e => e.preventDefault()}
					// Context menus size to their content (clamped to the viewport) rather than Menu's scrolling max height.
					style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 50, maxHeight: `calc(100vh - ${VIEWPORT_MARGIN * 2}px)` }}
					className={`min-w-48 origin-top-left ${menuPanelClasses(visible)} ${className}`}
				>
					<MenuEntries
						entries={items}
						idPrefix={`${id}-item`}
						activeAt={activeIndex}
						expandedAt={null}
						onEnter={setActiveIndex}
						onPress={activate}
					/>
				</ul>,
				document.body,
			)}
		</>
	);
};

export default ContextMenu;
