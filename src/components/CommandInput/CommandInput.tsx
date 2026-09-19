'use client';

import { ChangeEvent, InputHTMLAttributes, KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommandOption
{
	name:         string;
	description?: string;
	icon?:        ReactNode;
}

export type CommandInputMenuSide = 'top' | 'bottom';

export interface CommandInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onKeyDown'>
{
	value:      string;
	onChange:   (value: string) => void;
	commands:   CommandOption[];
	onCommand:  (command: CommandOption) => void;
	trigger?:   string;
	menuSide?:  CommandInputMenuSide;
	className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const highlightPrefix = (name: string, query: string) => {
	if(!query) return <span>{name}</span>;

	const match = name.slice(0, query.length);
	const rest  = name.slice(query.length);

	return (
		<span>
			<span className='text-brand font-semibold'>{match}</span>
			{rest}
		</span>
	);
};

// ─── CommandInput ─────────────────────────────────────────────────────────────

export const CommandInput = (
	{
		value,
		onChange,
		commands,
		onCommand,
		trigger = '/',
		menuSide = 'top',
		placeholder,
		className = '',
		disabled,
		...rest
	}: CommandInputProps
) => {
	const [mounted,        setMounted]        = useState(false);
	const [visible,        setVisible]        = useState(false);
	const [rawActiveIndex, setRawActiveIndex] = useState(0);

	const inputRef     = useRef<HTMLInputElement>(null);
	const listRef      = useRef<HTMLUListElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const id     = useId();
	const listId = `${id}-listbox`;

	const isCommandValue = value.startsWith(trigger);
	const query           = isCommandValue ? value.slice(trigger.length) : '';
	const filtered         = isCommandValue
		? commands.filter((c) => c.name.toLowerCase().startsWith(query.toLowerCase()))
		: [];
	const activeIndex = filtered.length === 0 ? -1 : Math.min(rawActiveIndex, filtered.length - 1);

	const openMenu = () => setMounted(true);

	const closeMenu = (returnFocus: boolean) => {
		setVisible(false);
		setTimeout(() => setMounted(false), 150);
		if(returnFocus) inputRef.current?.focus();
	};

	useEffect(() =>
	{
		if(!mounted) return;
		const raf = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(raf);
	}, [mounted]);

	useEffect(() =>
	{
		if(!mounted) return;

		const onPointerDown = (e: PointerEvent) => {
			if(!containerRef.current?.contains(e.target as Node)) closeMenu(false);
		};

		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	}, [mounted]);

	useEffect(() =>
	{
		if(!mounted || !listRef.current || activeIndex < 0) return;
		const opt = listRef.current.children[activeIndex] as HTMLElement | undefined;
		opt?.scrollIntoView?.({ block: 'nearest' });
	}, [activeIndex, mounted]);

	const selectCommand = (command: CommandOption) => {
		onChange('');
		setRawActiveIndex(0);
		closeMenu(true);
		onCommand(command);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value;
		onChange(next);
		setRawActiveIndex(0);
		if(next.startsWith(trigger)) openMenu();
		else if(mounted) closeMenu(false);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		switch(e.key)
		{
			case 'ArrowDown':
				if(!mounted || filtered.length === 0) break;
				e.preventDefault();
				setRawActiveIndex((activeIndex + 1) % filtered.length);
				break;

			case 'ArrowUp':
				if(!mounted || filtered.length === 0) break;
				e.preventDefault();
				setRawActiveIndex((activeIndex - 1 + filtered.length) % filtered.length);
				break;

			case 'Home':
				if(!mounted || filtered.length === 0) break;
				e.preventDefault();
				setRawActiveIndex(0);
				break;

			case 'End':
				if(!mounted || filtered.length === 0) break;
				e.preventDefault();
				setRawActiveIndex(filtered.length - 1);
				break;

			case 'Tab':
				if(!mounted) break;
				if(activeIndex >= 0 && filtered[activeIndex])
				{
					e.preventDefault();
					onChange(trigger + filtered[activeIndex].name);
					setRawActiveIndex(0);
				}
				else closeMenu(false);
				break;

			case 'Enter':
				if(!mounted) break;
				if(activeIndex >= 0 && filtered[activeIndex])
				{
					e.preventDefault();
					selectCommand(filtered[activeIndex]);
				}
				else closeMenu(false);
				break;

			case 'Escape':
				if(!mounted) break;
				e.preventDefault();
				closeMenu(true);
				break;
		}
	};

	const activeDescendant = mounted && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined;

	return (
		<div ref={containerRef} className={['relative', className].join(' ')}>
			<input
				{...rest}
				ref={inputRef}
				id={id}
				type='text'
				role='combobox'
				aria-expanded={mounted}
				aria-autocomplete='list'
				aria-controls={listId}
				aria-activedescendant={activeDescendant}
				autoComplete='off'
				disabled={disabled}
				value={value}
				placeholder={placeholder}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				className={[
					'w-full rounded-[var(--radius)] border-[length:var(--border-width)] bg-surface text-text text-sm outline-none',
					'placeholder:text-text-subtle',
					'motion-safe:transition-[border-color,box-shadow] motion-safe:duration-[var(--duration-fast)]',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
					'border-input-border hover:border-input-border-hover px-3 py-2',
					disabled ? 'opacity-50 cursor-not-allowed pointer-events-none bg-input-disabled-bg text-input-disabled-text' : '',
				].join(' ')}
			/>

			{mounted && (
				<ul
					ref={listRef}
					id={listId}
					role='listbox'
					aria-label='Commands'
					tabIndex={-1}
					className={[
						'absolute z-50 left-0 right-0 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
						menuSide === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
						'overflow-hidden outline-none',
						'motion-safe:transition-all motion-safe:duration-[var(--duration-fast)]',
						menuSide === 'top' ? 'origin-bottom' : 'origin-top',
						visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
					].join(' ')}
				>
					<div className='max-h-60 overflow-y-auto py-2'>
						{filtered.length === 0 ? (
							<div className='px-3 py-2 text-sm text-text-muted select-none'>
								No matching commands
							</div>
						) : (
							filtered.map((command, i) => (
								<li
									key={command.name}
									id={`${id}-opt-${i}`}
									role='option'
									aria-selected={i === activeIndex}
									onPointerDown={(e) => { e.preventDefault(); selectCommand(command); }}
									onPointerEnter={() => setRawActiveIndex(i)}
									className={[
										'flex items-center gap-2.5 mx-1 px-2.5 py-1.5 rounded-[var(--radius-sm)] select-none cursor-pointer',
										'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
										i === activeIndex ? 'bg-surface-active text-text' : 'text-text-muted hover:bg-surface-hover hover:text-text',
									].join(' ')}
								>
									{command.icon && (
										<span className='shrink-0 text-text-muted' aria-hidden='true'>{command.icon}</span>
									)}
									<span className='flex flex-1 flex-col min-w-0'>
										<span className='text-sm font-medium text-text'>
											{trigger}{highlightPrefix(command.name, query)}
										</span>
										{command.description && (
											<span className='truncate text-xs text-text-muted'>{command.description}</span>
										)}
									</span>
								</li>
							))
						)}
					</div>

					<div className='flex items-center gap-3 border-t-[length:var(--border-width)] border-surface-border px-3 py-1.5'>
						<span className='flex items-center gap-1 text-[11px] text-text-subtle'>
							<kbd className='rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border px-1 py-0.5 font-medium'>↑↓</kbd>
							Navigate
						</span>
						<span className='flex items-center gap-1 text-[11px] text-text-subtle'>
							<kbd className='rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border px-1 py-0.5 font-medium'>Tab</kbd>
							Complete
						</span>
						<span className='flex items-center gap-1 text-[11px] text-text-subtle'>
							<kbd className='rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-surface-border px-1 py-0.5 font-medium'>Enter</kbd>
							Run
						</span>
					</div>
				</ul>
			)}
		</div>
	);
};

export default CommandInput;
