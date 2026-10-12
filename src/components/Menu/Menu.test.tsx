import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Menu, type MenuEntry } from './Menu';

const ITEMS: MenuEntry[] = [
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

describe('Menu', () =>
{
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('cancels the pending open frame when unmounted mid-open', () =>
	{
		const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
		const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

		const { unmount } = render(<Menu trigger='Actions' items={ITEMS} />);
		fireEvent.click(screen.getByRole('button', { name: 'Actions' }));

		const frameId = rafSpy.mock.results[rafSpy.mock.results.length - 1].value;
		cancelSpy.mockClear();
		unmount();

		expect(cancelSpy).toHaveBeenCalledWith(frameId);
		vi.restoreAllMocks();
	});

	it('clears the typeahead timer when unmounted', () =>
	{
		const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
		const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

		const { unmount } = render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		fireEvent.keyDown(screen.getByRole('menu'), { key: 'd' });

		const callIndex = setTimeoutSpy.mock.calls.findIndex(([, ms]) => ms === 500);
		const timerId = setTimeoutSpy.mock.results[callIndex].value;
		clearTimeoutSpy.mockClear();
		unmount();

		expect(clearTimeoutSpy).toHaveBeenCalledWith(timerId);
		vi.restoreAllMocks();
	});

	it('renders the trigger with correct aria attributes when closed', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		const trigger = screen.getByRole('button', { name: 'Actions' });
		expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('opens on click with role menu and menuitem children', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();

		expect(screen.getByRole('menu')).toBeInTheDocument();
		expect(screen.getAllByRole('menuitem')).toHaveLength(4);
		expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('aria-expanded', 'true');
	});

	it('renders separators with role separator', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		expect(screen.getByRole('separator')).toBeInTheDocument();
	});

	it('moves focus to the menu on open with the first item active', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		expect(document.activeElement).toBe(screen.getByRole('menu'));
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('ArrowDown moves to the next item and wraps, skipping disabled items', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
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
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'ArrowUp' }); // wraps to last enabled (Delete)
		expect(activeId()).toBe(itemId('Delete'));

		fireEvent.keyDown(menu, { key: 'ArrowUp' }); // skips disabled Archive
		expect(activeId()).toBe(itemId('Duplicate'));
	});

	it('Home and End jump to the first and last enabled item', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'End' });
		expect(activeId()).toBe(itemId('Delete'));

		fireEvent.keyDown(menu, { key: 'Home' });
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('typeahead jumps to the next matching item', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
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
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'd' });
		fireEvent.keyDown(menu, { key: 'e' });
		expect(activeId()).toBe(itemId('Delete'));
	});

	it('typeahead does not land on disabled items', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		const menu = screen.getByRole('menu');

		fireEvent.keyDown(menu, { key: 'a' }); // Archive is disabled: no match
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('Enter activates the active item and closes, returning focus to the trigger', () =>
	{
		const onSelect = vi.fn();
		render(<Menu trigger='Actions' items={[{ label: 'Edit', onSelect }, { label: 'Delete' }]} />);
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
		render(<Menu trigger='Actions' items={[{ label: 'Edit', onSelect }]} />);
		openMenu();

		fireEvent.keyDown(screen.getByRole('menu'), { key: ' ' });
		expect(onSelect).toHaveBeenCalledOnce();
	});

	it('calls the root onSelect callback with the activated item', () =>
	{
		const onSelect = vi.fn();
		render(<Menu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
		openMenu();

		fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Edit' }));
	});

	it('Escape closes and returns focus to the trigger', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();

		fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Actions' }));

		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('Tab closes the menu without preventing default focus movement', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();

		const event = fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' });
		expect(event).toBe(true); // default not prevented: focus moves on

		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('closes on outside pointer down', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();

		fireEvent.pointerDown(document.body);
		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('marks disabled items with aria-disabled, not just color', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute('aria-disabled', 'true');
		expect(screen.getByRole('menuitem', { name: 'Edit' })).not.toHaveAttribute('aria-disabled');
	});

	it('clicking a disabled item does not activate or close', () =>
	{
		const onSelect = vi.fn();
		render(<Menu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
		openMenu();

		fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Archive' }));
		expect(onSelect).not.toHaveBeenCalled();
		expect(screen.getByRole('menu')).toBeInTheDocument();
	});

	it('clicking an enabled item activates it and closes', () =>
	{
		const onSelect = vi.fn();
		render(<Menu trigger='Actions' items={ITEMS} onSelect={onSelect} />);
		openMenu();

		fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Delete' }));
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Delete' }));

		act(() => { vi.advanceTimersByTime(150); });
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('ArrowDown on the trigger opens with the first item active', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowDown' });
		act(() => { vi.advanceTimersByTime(32); });
		expect(activeId()).toBe(itemId('Edit'));
	});

	it('ArrowUp on the trigger opens with the last enabled item active', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowUp' });
		act(() => { vi.advanceTimersByTime(32); });
		expect(activeId()).toBe(itemId('Delete'));
	});

	it('does not open when the trigger is disabled', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} disabled />);
		openMenu();
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('menu is labelled by the trigger', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		openMenu();
		const trigger = screen.getByRole('button', { name: 'Actions' });
		expect(screen.getByRole('menu')).toHaveAttribute('aria-labelledby', trigger.id);
	});

	it('trigger has a visible focus-visible ring class', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} />);
		expect(screen.getByRole('button', { name: 'Actions' }).className).toContain('focus-visible:ring-2');
	});

	it('appends triggerClassName after the built-in trigger classes by default', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} triggerClassName='text-brand-fg' />);
		const trigger = screen.getByRole('button', { name: 'Actions' });
		expect(trigger.className).toContain('bg-surface');
		expect(trigger.className).toContain('text-brand-fg');
	});

	it('replaces the built-in trigger classes entirely when unstyledTrigger is set', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} triggerClassName='text-brand-fg' unstyledTrigger />);
		const trigger = screen.getByRole('button', { name: 'Actions' });
		expect(trigger.className).toBe('text-brand-fg');
	});

	it('spreads triggerProps onto the trigger button', () =>
	{
		render(<Menu trigger='Actions' items={ITEMS} triggerProps={{ 'data-testid': 'more-trigger', tabIndex: -1 } as Record<string, unknown>} />);
		const trigger = screen.getByRole('button', { name: 'Actions' });
		expect(trigger.getAttribute('data-testid')).toBe('more-trigger');
		expect(trigger.tabIndex).toBe(-1);
	});

	describe('submenus', () =>
	{
		const pickModel = vi.fn();
		const SUBMENU_ITEMS: MenuEntry[] = [
			{ label: 'Model',  detail: 'Standard', submenu: [{ label: 'Fast', onSelect: pickModel }, { label: 'Standard', selected: true }, { label: 'Advanced' }] },
			{ label: 'Effort', detail: 'Medium',   submenu: [{ label: 'Low' }, { label: 'High' }] },
		];

		const openSubmenuMenu = () => {
			render(<Menu trigger='Actions' items={SUBMENU_ITEMS} />);
			openMenu();
		};

		const activeId = () => screen.getAllByRole('menu')[0].getAttribute('aria-activedescendant');

		const press = (key: string) => act(() => { fireEvent.keyDown(screen.getAllByRole('menu')[0], { key }); vi.advanceTimersByTime(32); });

		beforeEach(() => pickModel.mockClear());

		it('marks parent items with aria-haspopup and aria-expanded', () =>
		{
			openSubmenuMenu();
			const parent = screen.getByRole('menuitem', { name: /Model/ });
			expect(parent).toHaveAttribute('aria-haspopup', 'menu');
			expect(parent).toHaveAttribute('aria-expanded', 'false');
		});

		it('opens the submenu on ArrowRight and moves the active descendant into it', () =>
		{
			openSubmenuMenu();
			press('ArrowRight');

			expect(screen.getAllByRole('menu')).toHaveLength(2);
			expect(screen.getByRole('menuitem', { name: /Model/ })).toHaveAttribute('aria-expanded', 'true');
			expect(activeId()).toBe(screen.getByRole('menuitem', { name: 'Fast' }).id);
		});

		it('navigates within the submenu and closes just the submenu on ArrowLeft', () =>
		{
			openSubmenuMenu();
			press('ArrowRight');
			press('ArrowDown');
			expect(activeId()).toBe(screen.getByRole('menuitemradio', { name: 'Standard' }).id);

			press('ArrowLeft');
			expect(screen.getAllByRole('menu')).toHaveLength(1);
			expect(activeId()).toBe(screen.getByRole('menuitem', { name: /Model/ }).id);
		});

		it('activates a submenu item with Enter, calls its onSelect, and closes everything', () =>
		{
			openSubmenuMenu();
			press('ArrowRight');
			press('Enter');
			act(() => { vi.advanceTimersByTime(200); });

			expect(pickModel).toHaveBeenCalledTimes(1);
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('closes the submenu when the active parent changes', () =>
		{
			openSubmenuMenu();
			press('ArrowRight');
			press('ArrowLeft');
			press('ArrowDown');
			press('ArrowRight');

			expect(screen.getByRole('menuitem', { name: 'Low' })).toBeInTheDocument();
			expect(screen.queryByRole('menuitem', { name: 'Fast' })).not.toBeInTheDocument();
		});

		it('exposes selected submenu items as menuitemradio with aria-checked', () =>
		{
			openSubmenuMenu();
			press('ArrowRight');

			expect(screen.getByRole('menuitemradio', { name: 'Standard' })).toHaveAttribute('aria-checked', 'true');
		});

		it('closes the whole menu on Escape from inside a submenu', () =>
		{
			openSubmenuMenu();
			press('ArrowRight');
			press('Escape');
			act(() => { vi.advanceTimersByTime(200); });

			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});
	});
});
