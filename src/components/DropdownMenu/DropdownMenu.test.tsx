import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DropdownMenu, type DropdownMenuEntry } from './DropdownMenu';

const ITEMS: DropdownMenuEntry[] = [
	{ label: 'Edit'      },
	{ label: 'Duplicate' },
	{ separator: true    },
	{ label: 'Archive', disabled: true },
	{ label: 'Delete'    },
];

const openMenu = () => {
	fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
	act(() => { vi.advanceTimersByTime(32); });
};

const activeId = () => screen.getByRole('menu').getAttribute('aria-activedescendant');
const itemId   = (name: string) => screen.getByRole('menuitem', { name }).id;

describe('DropdownMenu', () =>
{
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('renders the trigger with correct aria attributes when closed', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		const trigger = screen.getByRole('button', { name: 'Actions' });
		expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('opens on click with role menu and menuitem children', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();

		expect(screen.getByRole('menu')).toBeInTheDocument();
		expect(screen.getAllByRole('menuitem')).toHaveLength(4);
		expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-expanded', 'true');
	});

	it('renders separators with role separator', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		expect(screen.getByRole('separator')).toBeInTheDocument();
	});

	it('moves focus to the menu on open with the first item active', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		expect(document.activeElement).toBe(screen.getByRole('menu'));
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('ArrowDown moves to the next item and wraps, skipping disabled items', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'ArrowDown' });
		expect(activeId()).toBe(itemId('Duplicate'));

		fireEvent.keyDown(menu, { key: 'ArrowDown' }); // skips disabled Archive
		expect(activeId()).toBe(itemId('Delete'));

		fireEvent.keyDown(menu, { key: 'ArrowDown' }); // wraps to first
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('ArrowUp moves to the previous item and wraps, skipping disabled items', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'ArrowUp' }); // wraps to last enabled (Delete)
		expect(activeId()).toBe(itemId('Delete'));

		fireEvent.keyDown(menu, { key: 'ArrowUp' }); // skips disabled Archive
		expect(activeId()).toBe(itemId('Duplicate'));
	});

	it('Home and End jump to the first and last enabled item', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'End' });
		expect(activeId()).toBe(itemId('Delete'));

		fireEvent.keyDown(menu, { key: 'Home' });
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('typeahead jumps to the next matching item', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'd' });
		expect(activeId()).toBe(itemId('Duplicate'));

		act(() => { vi.advanceTimersByTime(500); }); // reset typeahead buffer
		fireEvent.keyDown(menu, { key: 'd' });
		expect(activeId()).toBe(itemId('Delete'));
	});

	it('typeahead accumulates characters within the timeout window', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'd' });
		fireEvent.keyDown(menu, { key: 'e' });
		expect(activeId()).toBe(itemId('Delete'));
	});

	it('typeahead does not land on disabled items', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'a' }); // Archive is disabled — no match
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('Enter activates the active item and closes, returning focus to the trigger', () =>
	{
		const onSelect = vi.fn();
		render(<DropdownMenu trigger='Actions' items={[{ label: 'Edit', onSelect }, { label: 'Delete' }]} />);
		openMenu();

		fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
		expect(onSelect).toHaveBeenCalledOnce();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Actions' }));

		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('Space activates the active item', () =>
	{
		const onSelect = vi.fn();
		render(<DropdownMenu trigger='Actions' items={[{ label: 'Edit', onSelect }]} />);
		openMenu();

		fireEvent.keyDown(screen.getByRole('menu'), { key: ' ' });
		expect(onSelect).toHaveBeenCalledOnce();
	});

	it('calls the root onSelect callback with the activated item', () =>
	{
		const onSelect = vi.fn();
		render(<DropdownMenu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
		openMenu();

		fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Edit' }));
	});

	it('Escape closes and returns focus to the trigger', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();

		fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Actions' }));

		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('Tab closes the menu without preventing default focus movement', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();

		const event = fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' });
		expect(event).toBe(true); // default not prevented — focus moves on

		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('closes on outside pointer down', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();

		fireEvent.pointerDown(document.body);
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('marks disabled items with aria-disabled, not just color', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute('aria-disabled', 'true');
		expect(screen.getByRole('menuitem', { name: 'Edit' })).not.toHaveAttribute('aria-disabled');
	});

	it('clicking a disabled item does not activate or close', () =>
	{
		const onSelect = vi.fn();
		render(<DropdownMenu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
		openMenu();

		fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Archive' }));
		expect(onSelect).not.toHaveBeenCalled();
		expect(screen.getByRole('menu')).toBeInTheDocument();
	});

	it('clicking an enabled item activates it and closes', () =>
	{
		const onSelect = vi.fn();
		render(<DropdownMenu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
		openMenu();

		fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Delete' }));
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Delete' }));

		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('ArrowDown on the trigger opens with the first item active', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowDown' });
		act(() => { vi.advanceTimersByTime(32); });
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('ArrowUp on the trigger opens with the last enabled item active', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowUp' });
		act(() => { vi.advanceTimersByTime(32); });
		expect(activeId()).toBe(itemId('Delete'));
	});

	it('does not open when the trigger is disabled', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} disabled />);
		openMenu();
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('menu is labelled by the trigger', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		openMenu();
		const trigger = screen.getByRole('button', { name: 'Actions' });
		expect(screen.getByRole('menu')).toHaveAttribute('aria-labelledby', trigger.id);
	});

	it('trigger has a visible focus-visible ring class', () =>
	{
		render(<DropdownMenu trigger='Actions' items={ITEMS} />);
		expect(screen.getByRole('button', { name: 'Actions' }).className).toContain('focus-visible:ring-2');
	});
});
