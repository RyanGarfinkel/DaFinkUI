'use client';;
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
	KeyboardEvent,
	ReactNode,
} from 'react';

// ─── Item registry entry ──────────────────────────────────────────────────────

interface ItemEntry
{
	id:       string;
	groupId:  string;
	value:    string;
	disabled: boolean;
	onSelect: () => void;
}

// ─── Palette context ──────────────────────────────────────────────────────────

interface PaletteCtx
{
	query:        string;
	activeId:     string | null;
	setActiveId:  (id: string | null) => void;
	registerItem: (entry: ItemEntry) => void;
	removeItem:   (id: string) => void;
	onClose:      () => void;
	listId:       string;
	getGroupVisible: (groupId: string) => boolean;
}

const PaletteContext = createContext<PaletteCtx | null>(null);

const usePaletteContext = () => {
	const ctx = useContext(PaletteContext);
	if(!ctx) throw new Error('CommandItem must be used inside CommandPalette');
	return ctx;
};

// ─── Group context ────────────────────────────────────────────────────────────

const GroupContext = createContext<string>('');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommandPaletteProps
{
	open:         boolean;
	onClose:      () => void;
	placeholder?: string;
	children:     ReactNode;
}

export interface CommandGroupProps
{
	label?:   string;
	children: ReactNode;
}

export interface CommandItemProps
{
	onSelect:  () => void;
	value:     string;
	disabled?: boolean;
	icon?:     ReactNode;
	shortcut?: string;
	children:  ReactNode;
}

// ─── Focus trap selector ──────────────────────────────────────────────────────

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(', ');

const highlightMatch = (text: string, query: string) => {
	if(!query) return text;

	const idx = text.toLowerCase().indexOf(query.toLowerCase());
	if(idx === -1) return text;

	return (
		<>
			{text.slice(0, idx)}
			<mark className='bg-transparent text-brand font-semibold not-italic'>
				{text.slice(idx, idx + query.length)}
			</mark>
			{text.slice(idx + query.length)}
		</>
	);
};

// ─── CommandPalette ───────────────────────────────────────────────────────────

export const CommandPalette = (
    {
        open,
        onClose,
        placeholder = 'Search commands…',
        children,
    }: CommandPaletteProps
) => {
    const [mounted,      setMounted]      = useState(false);
    const [visible,      setVisible]      = useState(false);
    const [query,        setQuery]        = useState('');
    const [activeId,     setActiveId]     = useState<string | null>(null);
    const [_itemStamp,   setItemStamp]    = useState(0);
    const [visibleCount, setVisibleCount] = useState(0);

    const itemsRef  = useRef<ItemEntry[]>([]);
    const dialogRef = useRef<HTMLDivElement>(null);
    const inputRef  = useRef<HTMLInputElement>(null);

    const id     = useId();
    const listId = `${id}-list`;

    const registerItem = useCallback((entry: ItemEntry) =>
	{
		const existing = itemsRef.current.findIndex((e) => e.id === entry.id);
		if(existing >= 0)
			itemsRef.current[existing] = entry;
		else
			itemsRef.current.push(entry);
		setItemStamp((n) => n + 1);
	}, []);

    const removeItem = useCallback((itemId: string) =>
	{
		itemsRef.current = itemsRef.current.filter((e) => e.id !== itemId);
		setItemStamp((n) => n + 1);
	}, []);

    const getVisibleEnabled = () => {
		return itemsRef.current.filter(
			(item) => !item.disabled && item.value.toLowerCase().includes(query.toLowerCase())
		);
	};

    const getGroupVisible = (groupId: string) => {
		if(itemsRef.current.length === 0) return true;
		return itemsRef.current.some(
			(item) =>
				item.groupId === groupId &&
				item.value.toLowerCase().includes(query.toLowerCase())
		);
	};

    useEffect(() =>
	{
		if(open)
		{
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setQuery('');
			setActiveId(null);
			setMounted(true);
		}
		else
		{
			setVisible(false);
			setTimeout(() =>
			{
				setMounted(false);
				setQuery('');
				setActiveId(null);
			}, 150);
		}
	}, [open]);

    useEffect(() =>
	{
		if(!mounted) return;
		requestAnimationFrame(() =>
		{
			setVisible(true);
			inputRef.current?.focus();
		});
	}, [mounted]);

    useEffect(() =>
	{
		if(!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => { document.body.style.overflow = prev; };
	}, [open]);

    useEffect(() =>
	{
		const q       = query.toLowerCase();
		const enabled = itemsRef.current.filter(
			(item) => !item.disabled && item.value.toLowerCase().includes(q)
		);
		if(activeId && !enabled.find((i) => i.id === activeId))
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setActiveId(enabled[0]?.id ?? null);
	}, [query, activeId, _itemStamp]);

    useEffect(() =>
	{
		const q     = query.toLowerCase();
		const count = mounted ? itemsRef.current.filter(
			(item) => item.value.toLowerCase().includes(q)
		).length : 0;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setVisibleCount(count);
	}, [mounted, query, _itemStamp]);

    useEffect(() =>
	{
		if(!activeId) return;
		const el = document.getElementById(activeId);
		el?.scrollIntoView?.({ block: 'nearest' });
	}, [activeId]);

    const handleBackdropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		if(e.target === e.currentTarget) onClose();
	};

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		switch(e.key)
		{
			case 'Escape':
				e.stopPropagation();
				onClose();
				break;

			case 'Tab':
			{
				const focusable = Array.from(
					dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
				);
				if(focusable.length === 0)
				{
					e.preventDefault();
					break;
				}
				const first = focusable[0];
				const last  = focusable[focusable.length - 1];

				if(e.shiftKey)
				{
					if(document.activeElement === first)
					{
						e.preventDefault();
						last.focus();
					}
				}
				else
				{
					if(document.activeElement === last)
					{
						e.preventDefault();
						first.focus();
					}
				}
				break;
			}

			case 'ArrowDown':
			{
				e.preventDefault();
				const enabled = getVisibleEnabled();
				if(enabled.length === 0) break;
				const idx = activeId ? enabled.findIndex((i) => i.id === activeId) : -1;
				setActiveId(enabled[(idx + 1) % enabled.length].id);
				break;
			}

			case 'ArrowUp':
			{
				e.preventDefault();
				const enabled = getVisibleEnabled();
				if(enabled.length === 0) break;
				const idx = activeId ? enabled.findIndex((i) => i.id === activeId) : 0;
				setActiveId(enabled[(idx - 1 + enabled.length) % enabled.length].id);
				break;
			}

			case 'Home':
			{
				e.preventDefault();
				const enabled = getVisibleEnabled();
				if(enabled.length > 0) setActiveId(enabled[0].id);
				break;
			}

			case 'End':
			{
				e.preventDefault();
				const enabled = getVisibleEnabled();
				if(enabled.length > 0) setActiveId(enabled[enabled.length - 1].id);
				break;
			}

			case 'Enter':
			{
				if(!activeId) break;
				const item = itemsRef.current.find((i) => i.id === activeId);
				if(!item || item.disabled) break;
				e.preventDefault();
				item.onSelect();
				setQuery('');
				setActiveId(null);
				onClose();
				break;
			}
		}
	};

    const showEmpty = query.length > 0 && visibleCount === 0;

    if(!mounted) return null;

    return (
		<PaletteContext.Provider
			value={{
				query,
				activeId,
				setActiveId,
				registerItem,
				removeItem,
				onClose,
				listId,
				getGroupVisible,
			}}
		>
			<div
				role='dialog'
				aria-modal='true'
				aria-label='Command palette'
				className={[
					'fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4',
					'motion-safe:transition-opacity motion-safe:duration-[var(--duration-base)]',
					visible ? 'opacity-100' : 'opacity-0',
				].join(' ')}
				onPointerDown={handleBackdropPointerDown}
				onKeyDown={handleKeyDown}
			>
				<div
					ref={dialogRef}
					className={[
						'relative z-10 w-full max-w-lg rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
						'flex flex-col overflow-hidden',
						'motion-safe:transition-[opacity,transform] motion-safe:duration-[var(--duration-base)]',
						visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
					].join(' ')}
					onPointerDown={(e) => e.stopPropagation()}
				>
					<div className='flex items-center gap-3 border-b-[length:var(--border-width)] border-surface-border px-4 py-3'>
						<svg
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='text-text-muted shrink-0'
							aria-hidden='true'
						>
							<circle cx='11' cy='11' r='8' />
							<path d='m21 21-4.35-4.35' />
						</svg>

						<input
							ref={inputRef}
							type='text'
							role='combobox'
							aria-autocomplete='list'
							aria-expanded='true'
							aria-controls={listId}
							aria-activedescendant={activeId ?? undefined}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={placeholder}
							className={[
								'flex-1 bg-transparent text-sm text-text placeholder:text-text-subtle',
								'focus:outline-none',
							].join(' ')}
						/>

						<kbd className='hidden sm:flex items-center rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border px-1.5 py-0.5 text-[11px] font-medium text-text-muted select-none'>
							Esc
						</kbd>
					</div>

					<div
						id={listId}
						role='listbox'
						aria-label='Commands'
						className='max-h-[60vh] overflow-y-auto py-1.5'
					>
						{children}

						{showEmpty && (
							<div className='py-8 text-center text-sm text-text-muted'>
								No results for{' '}
								<span className='font-medium text-text'>&ldquo;{query}&rdquo;</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</PaletteContext.Provider>
	);
};

// ─── CommandGroup ─────────────────────────────────────────────────────────────

export const CommandGroup = ({ label, children }: CommandGroupProps) => {
	const ctx     = useContext(PaletteContext);
	const groupId = useId();

	const isVisible = ctx ? ctx.getGroupVisible(groupId) : true;

	return (
		<GroupContext.Provider value={groupId}>
			<div
				role='group'
				aria-label={label}
				className='mb-1 last:mb-0'
				style={isVisible ? undefined : { display: 'none' }}
			>
				{label && isVisible && (
					<div className='px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-subtle select-none'>
						{label}
					</div>
				)}
				{children}
			</div>
		</GroupContext.Provider>
	);
};

// ─── CommandItem ──────────────────────────────────────────────────────────────

export const CommandItem = (
    {
        onSelect,
        value,
        disabled = false,
        icon,
        shortcut,
        children,
    }: CommandItemProps
) => {
    const ctx                     = usePaletteContext();
    const { registerItem, removeItem } = ctx;
    const groupId  = useContext(GroupContext);
    const id       = useId();
    const isActive = ctx.activeId === id;

    const isVisible = value.toLowerCase().includes(ctx.query.toLowerCase());

    useEffect(() =>
	{
		registerItem({ id, groupId, value, disabled, onSelect });
		return () => removeItem(id);
	}, [id, groupId, value, disabled, onSelect, registerItem, removeItem]);

    const handlePointerEnter = () => {
		if(!disabled) ctx.setActiveId(id);
	};

    const handlePointerDown = (e: React.PointerEvent) => {
		if(disabled) return;
		e.preventDefault();
		onSelect();
		ctx.onClose();
	};

    if(!isVisible) return null;

    return (
		<div
			id={id}
			role='option'
			aria-selected={isActive}
			aria-disabled={disabled || undefined}
			onPointerDown={handlePointerDown}
			onPointerEnter={handlePointerEnter}
			className={[
				'flex items-center gap-3 mx-1.5 px-2.5 py-2 rounded-[var(--radius-lg)] text-sm select-none',
				'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
				disabled
					? 'opacity-40 cursor-not-allowed text-text-muted'
					: 'cursor-pointer ' + (
						isActive
							? 'bg-surface-active text-text'
							: 'text-text-muted hover:bg-surface-hover hover:text-text'
					),
			].join(' ')}
		>
			{icon && (
				<span className='shrink-0 text-text-muted' aria-hidden='true'>
					{icon}
				</span>
			)}

			<span className='flex-1 truncate'>
				{typeof children === 'string'
					? highlightMatch(children, ctx.query)
					: children}
			</span>

			{shortcut && (
				<kbd className='ml-auto shrink-0 flex items-center rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border px-1.5 py-0.5 text-[11px] font-medium text-text-muted select-none'>
					{shortcut}
				</kbd>
			)}
		</div>
	);
};

export default CommandPalette;
