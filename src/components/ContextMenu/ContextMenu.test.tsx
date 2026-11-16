import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { MenuLeafEntry } from '../Menu/Menu';
import ContextMenu from './ContextMenu';

const setup = (overrides: Partial<Record<'duplicate' | 'delete', () => void>> = {}) => {
	const items: MenuLeafEntry[] = [
		{ label: 'Duplicate', onSelect: overrides.duplicate },
		{ label: 'Skip', disabled: true },
		{ separator: true },
		{ label: 'Delete', onSelect: overrides.delete },
	];
	render(
		<ContextMenu items={items} label='Slide actions'>
			<button type='button'>Slide 1</button>
		</ContextMenu>
	);
	return screen.getByRole('button', { name: 'Slide 1' });
};

const activeLabel = () => {
	const menu = screen.getByRole('menu');
	return document.getElementById(menu.getAttribute('aria-activedescendant') ?? '')?.textContent;
};

describe('ContextMenu', () =>
{
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('renders its children and no menu until opened', () =>
	{
		setup();
		expect(screen.getByRole('button', { name: 'Slide 1' })).toBeDefined();
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('opens at the cursor on right-click, prevents the native menu, and focuses the menu', () =>
	{
		const target = setup();
		const event = fireEvent.contextMenu(target, { clientX: 120, clientY: 80 });
		expect(event).toBe(false);

		const menu = screen.getByRole('menu', { name: 'Slide actions' });
		expect(menu.style.left).toBe('120px');
		expect(menu.style.top).toBe('80px');
		expect(document.activeElement).toBe(menu);
		expect(menu.hasAttribute('aria-modal')).toBe(false);
		expect(menu.style.maxHeight).toBe('calc(100vh - 16px)');
	});

	it('opens from the keyboard with Shift+F10 and the Menu key', () =>
	{
		const target = setup();
		fireEvent.keyDown(target, { key: 'F10', shiftKey: true });
		expect(screen.getByRole('menu')).toBeDefined();

		fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
		act(() => { vi.advanceTimersByTime(200); });
		fireEvent.keyDown(target, { key: 'ContextMenu' });
		expect(screen.getByRole('menu')).toBeDefined();
	});

	it('arrow keys skip disabled items and separators, wrapping at the ends', () =>
	{
		fireEvent.contextMenu(setup(), { clientX: 10, clientY: 10 });
		const menu = screen.getByRole('menu');
		expect(activeLabel()).toBe('Duplicate');
		fireEvent.keyDown(menu, { key: 'ArrowDown' });
		expect(activeLabel()).toBe('Delete');
		fireEvent.keyDown(menu, { key: 'ArrowDown' });
		expect(activeLabel()).toBe('Duplicate');
		fireEvent.keyDown(menu, { key: 'End' });
		expect(activeLabel()).toBe('Delete');
		fireEvent.keyDown(menu, { key: 'Home' });
		expect(activeLabel()).toBe('Duplicate');
	});

	it('typeahead jumps to the next matching item', () =>
	{
		fireEvent.contextMenu(setup(), { clientX: 10, clientY: 10 });
		fireEvent.keyDown(screen.getByRole('menu'), { key: 'd' });
		expect(activeLabel()).toBe('Delete');
	});

	it('Enter activates the item, closes, and returns focus to the target', () =>
	{
		const duplicate = vi.fn();
		const target = setup({ duplicate });
		target.focus();
		fireEvent.contextMenu(target, { clientX: 10, clientY: 10 });
		fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' });

		expect(duplicate).toHaveBeenCalledOnce();
		expect(document.activeElement).toBe(target);
		act(() => { vi.advanceTimersByTime(200); });
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('pointer press activates an item; disabled items do nothing', () =>
	{
		const del = vi.fn();
		fireEvent.contextMenu(setup({ delete: del }), { clientX: 10, clientY: 10 });
		fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Skip' }));
		expect(screen.getByRole('menuitem', { name: 'Skip' }).getAttribute('aria-disabled')).toBe('true');
		fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Delete' }));
		expect(del).toHaveBeenCalledOnce();
	});

	it('Escape closes and returns focus; a pointer press outside closes without moving focus', () =>
	{
		const target = setup();
		fireEvent.contextMenu(target, { clientX: 10, clientY: 10 });
		fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
		expect(document.activeElement).toBe(target);
		act(() => { vi.advanceTimersByTime(200); });

		fireEvent.contextMenu(target, { clientX: 10, clientY: 10 });
		fireEvent.pointerDown(document.body);
		act(() => { vi.advanceTimersByTime(200); });
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('animates with the shared menu panel classes', () =>
	{
		fireEvent.contextMenu(setup(), { clientX: 10, clientY: 10 });
		expect(screen.getByRole('menu').className).toContain('opacity-0 scale-95');
		act(() => { vi.advanceTimersByTime(32); });
		expect(screen.getByRole('menu').className).toContain('opacity-100 scale-100');
	});

	it('disabled never opens and leaves the native menu alone', () =>
	{
		render(<ContextMenu items={[{ label: 'Copy' }]} disabled><span>Region</span></ContextMenu>);
		expect(fireEvent.contextMenu(screen.getByText('Region'))).toBe(true);
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('opens on a touch long-press at the touch point, and movement cancels it', () =>
	{
		const target = setup();
		fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 40, clientY: 50 });
		act(() => { vi.advanceTimersByTime(499); });
		expect(screen.queryByRole('menu')).toBeNull();
		act(() => { vi.advanceTimersByTime(1); });
		const menu = screen.getByRole('menu');
		expect(menu.style.left).toBe('40px');
		expect(menu.style.top).toBe('50px');

		fireEvent.keyDown(menu, { key: 'Escape' });
		act(() => { vi.advanceTimersByTime(200); });
		fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 40, clientY: 50 });
		fireEvent.pointerMove(target, { pointerType: 'touch', clientX: 70, clientY: 50 });
		act(() => { vi.advanceTimersByTime(600); });
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('mouse presses never start a long-press', () =>
	{
		const target = setup();
		fireEvent.pointerDown(target, { pointerType: 'mouse', clientX: 40, clientY: 50 });
		act(() => { vi.advanceTimersByTime(600); });
		expect(screen.queryByRole('menu')).toBeNull();
	});
});
