'use client';;
import { createContext, useContext, useRef, useState, useCallback, useEffect, useId, ReactNode, KeyboardEvent } from 'react';

interface TreeContextValue
{
	focusedId: string | null;
	setFocusedId: (id: string | null) => void;
	registerItem: (id: string, el: HTMLElement) => void;
	unregisterItem: (id: string) => void;
	getVisibleIds: () => string[];
	focusItem: (id: string) => void;
	terminalIcon?: ReactNode;
	nonTerminalIcon?: ReactNode;
}

const TreeContext = createContext<TreeContextValue | null>(null);

const useTreeContext = () =>
{
	const ctx = useContext(TreeContext);
	if(!ctx) throw new Error('TreeItem must be used inside <Tree>');
	return ctx;
};

export interface TreeProps
{
	children: ReactNode;
	className?: string;
	terminalIcon?: ReactNode;
	nonTerminalIcon?: ReactNode;
	/** Allows text selection/copy inside the tree. Off by default since a normal
	 *  interactive tree treats click as select/toggle, not text selection. Turn
	 *  this on for read-only, fully non-collapsible trees (e.g. a diagram). */
	selectable?: boolean;
}

const Tree = ({ children, className = '', terminalIcon, nonTerminalIcon, selectable = false }: TreeProps) => {
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const itemsRef = useRef<Map<string, HTMLElement>>(new Map());

    const registerItem = useCallback((id: string, el: HTMLElement) =>
	{
		itemsRef.current.set(id, el);
	}, []);

    const unregisterItem = useCallback((id: string) =>
	{
		itemsRef.current.delete(id);
	}, []);

    const getVisibleIds = useCallback(() =>
	{
		const map = itemsRef.current;

		const visible = (el: HTMLElement) =>
		{
			let node: HTMLElement | null = el.parentElement;
			while(node)
			{
				if(node.style.gridTemplateRows === '0fr') return false;
				node = node.parentElement;
			}
			return true;
		};

		const entries = Array.from(map.entries()).filter(([, el]) => visible(el));

		entries.sort(([, a], [, b]) =>
		{
			const order = a.compareDocumentPosition(b);
			return order & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
		});

		return entries.map(([id]) => id);
	}, []);

    const focusItem = useCallback((id: string) =>
	{
		setFocusedId(id);
		itemsRef.current.get(id)?.focus();
	}, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const visibleIds = getVisibleIds();
		if(visibleIds.length === 0) return;

		// Read the actual focused DOM node rather than the focusedId state — state set by
		// a prior onFocus may not have committed yet when this fires (e.g. a raw .focus()
		// call immediately followed by a keydown), so this matches the more robust
		// e.currentTarget-based pattern already used in Radio.tsx.
		let currentIndex = -1;
		for(const [id, el] of itemsRef.current)
			if(el === e.target) { currentIndex = visibleIds.indexOf(id); break; }

		if(e.key === 'ArrowDown')
		{
			e.preventDefault();
			const nextIndex = currentIndex < visibleIds.length - 1 ? currentIndex + 1 : 0;
			focusItem(visibleIds[nextIndex]);
		}
		else if(e.key === 'ArrowUp')
		{
			e.preventDefault();
			const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleIds.length - 1;
			focusItem(visibleIds[prevIndex]);
		}
		else if(e.key === 'Home')
		{
			e.preventDefault();
			focusItem(visibleIds[0]);
		}
		else if(e.key === 'End')
		{
			e.preventDefault();
			focusItem(visibleIds[visibleIds.length - 1]);
		}
	};

    return (
		<TreeContext.Provider value={{ focusedId, setFocusedId, registerItem, unregisterItem, getVisibleIds, focusItem, terminalIcon, nonTerminalIcon }}>
			<div
				role='tree'
				className={`text-sm ${selectable ? 'select-text' : 'select-none'} ${className}`}
				onKeyDown={handleKeyDown}
			>
				{children}
			</div>
		</TreeContext.Provider>
	);
};

export default Tree;

interface TreeItemContextValue
{
	depth: number;
	isOpen: boolean;
	setOpen: (open: boolean) => void;
	itemId: string;
}

const TreeItemContext = createContext<TreeItemContextValue | null>(null);

const useTreeItemContext = () => useContext(TreeItemContext);

export interface TreeItemProps
{
	label: ReactNode;
	children?: ReactNode;
	defaultOpen?: boolean;
	collapsible?: boolean;
	icon?: ReactNode;
	disabled?: boolean;
	className?: string;
}

export const TreeItem = (
    { label, children, defaultOpen = false, collapsible = true, icon, disabled = false, className = '' }: TreeItemProps
) => {
    const tree = useTreeContext();
    const parent = useTreeItemContext();
    const depth = parent ? parent.depth + 1 : 0;
    const isBranch = Boolean(children);
    const [isOpen, setOpen] = useState(defaultOpen);
    const open = collapsible ? isOpen : true;
    const interactive = collapsible && !disabled;
    const itemId = useId();
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() =>
	{
		if(!collapsible) return;
		const el = itemRef.current;
		if(!el) return;
		tree.registerItem(itemId, el);
		return () => tree.unregisterItem(itemId);
	}, [itemId, tree, collapsible]);

    const handleClick = () => {
		if(disabled) return;
		if(isBranch && collapsible) setOpen(prev => !prev);
		tree.setFocusedId(itemId);
	};

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if(disabled) return;

		if(e.key === 'Enter' || e.key === ' ')
		{
			e.preventDefault();
			e.stopPropagation();
			if(isBranch && collapsible) setOpen(prev => !prev);
		}
		else if(e.key === 'ArrowRight')
		{
			e.preventDefault();
			e.stopPropagation();
			if(isBranch && !open)
			{
				setOpen(true);
			}
			else if(isBranch && open)
			{
				const visibleIds = tree.getVisibleIds();
				const currentIndex = visibleIds.indexOf(itemId);
				if(currentIndex < visibleIds.length - 1)
					tree.focusItem(visibleIds[currentIndex + 1]);
			}
		}
		else if(e.key === 'ArrowLeft')
		{
			e.preventDefault();
			e.stopPropagation();
			if(isBranch && open)
			{
				if(collapsible) setOpen(false);
			}
			else if(parent)
			{
				tree.focusItem(parent.itemId);
			}
		}
	};

    const paddingLeft = depth === 0 ? 0 : depth * 16;

    return (
		<TreeItemContext.Provider value={{ depth, isOpen: open, setOpen, itemId }}>
			<div role='treeitem' aria-expanded={isBranch ? open : undefined} aria-disabled={disabled || undefined} aria-selected={tree.focusedId === itemId}>
				<div
					ref={itemRef}
					tabIndex={disabled || !collapsible ? -1 : 0}
					onClick={collapsible ? handleClick : undefined}
					onKeyDown={collapsible ? handleKeyDown : undefined}
					onFocus={collapsible ? () => !disabled && tree.setFocusedId(itemId) : undefined}
					className={[
						'flex items-center gap-1.5 rounded-[var(--radius)] py-1 pr-2',
						'text-text transition-colors duration-[var(--duration-fast)]',
						disabled
							? 'opacity-40 cursor-not-allowed pointer-events-none'
							: interactive
								? 'cursor-pointer hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring active:bg-surface-active'
								: 'cursor-default',
						className,
					].filter(Boolean).join(' ')}
					style={{ paddingLeft: `${paddingLeft + 4}px` }}
				>
					<span className='flex items-center justify-center w-4 h-4 shrink-0' aria-hidden='true'>
						{icon ?? (
							isBranch
								? (
									collapsible
										? (
											<svg
												width='12'
												height='12'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2.5'
												strokeLinecap='round'
												strokeLinejoin='round'
												className={[
													'text-text-muted motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)]',
													open ? 'rotate-90' : '',
												].join(' ')}
											>
												<path d='m9 18 6-6-6-6' />
											</svg>
										)
										: (tree.nonTerminalIcon ?? null)
								)
								: (tree.terminalIcon ?? null)
						)}
					</span>
					<span className='truncate leading-none py-0.5'>{label}</span>
				</div>

				{isBranch && (
					<div
						className='motion-safe:transition-[grid-template-rows] motion-safe:duration-[var(--duration-fast)]'
						style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr' }}
					>
						<div style={{ overflow: 'hidden' }} role='group'>
							{children}
						</div>
					</div>
				)}
			</div>
		</TreeItemContext.Provider>
	);
};
