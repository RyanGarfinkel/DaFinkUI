import { MenuBar, MenuBarBrand, MenuBarActions, MenuBarNav, MenuBarNavItem, MenuBarNavMore } from './MenuBar';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('MenuBar', () =>
{
	it('renders without errors', () =>
	{
		render(<MenuBar><p>content</p></MenuBar>);
		expect(screen.getByRole('banner')).toBeTruthy();
	});

	it('applies default height class', () =>
	{
		render(<MenuBar><p>content</p></MenuBar>);
		expect(screen.getByRole('banner').className).toContain('h-14');
	});

	it('applies custom height class', () =>
	{
		render(<MenuBar height='h-16'><p>content</p></MenuBar>);
		expect(screen.getByRole('banner').className).toContain('h-16');
	});

	it('merges additional className', () =>
	{
		render(<MenuBar className='custom-class'><p>content</p></MenuBar>);
		expect(screen.getByRole('banner').className).toContain('custom-class');
	});

	it('is fixed to the top of the viewport', () =>
	{
		render(<MenuBar><p>content</p></MenuBar>);
		const header = screen.getByRole('banner');
		expect(header.className).toContain('fixed');
		expect(header.className).toContain('top-0');
	});

	it('respects a position override in className instead of forcing fixed', () =>
	{
		render(<MenuBar className='relative'><p>content</p></MenuBar>);
		const header = screen.getByRole('banner');
		expect(header.className).toContain('relative');
		expect(header.className).not.toContain('fixed');
	});

	it('uses token-based surface and border classes', () =>
	{
		render(<MenuBar><p>content</p></MenuBar>);
		const header = screen.getByRole('banner');
		expect(header.className).toContain('bg-surface/95');
		expect(header.className).toContain('border-surface-border');
	});
});

describe('MenuBarBrand', () =>
{
	it('renders children', () =>
	{
		render(<MenuBarBrand><span>Brand</span></MenuBarBrand>);
		expect(screen.getByText('Brand')).toBeTruthy();
	});

	it('merges additional className', () =>
	{
		const { container } = render(<MenuBarBrand className='extra'><span>Brand</span></MenuBarBrand>);
		expect((container.firstChild as HTMLElement).className).toContain('extra');
	});
});

describe('MenuBarActions', () =>
{
	it('renders children', () =>
	{
		render(<MenuBarActions><button>Action</button></MenuBarActions>);
		expect(screen.getByText('Action')).toBeTruthy();
	});

	it('merges additional className', () =>
	{
		const { container } = render(<MenuBarActions className='extra'><button>Action</button></MenuBarActions>);
		expect((container.firstChild as HTMLElement).className).toContain('extra');
	});

	it('pushes itself to the right with ml-auto', () =>
	{
		const { container } = render(<MenuBarActions><button>Action</button></MenuBarActions>);
		expect((container.firstChild as HTMLElement).className).toContain('ml-auto');
	});
});

describe('MenuBarNav', () =>
{
	it('renders a nav landmark with the given aria-label', () =>
	{
		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavItem value='docs'>Docs</MenuBarNavItem>
			</MenuBarNav>
		);

		expect(screen.getByRole('navigation', { name: 'Main' })).toBeDefined();
	});

	it('marks the active item with aria-current="page"', () =>
	{
		render(
			<MenuBarNav value='docs' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavItem value='docs'>Docs</MenuBarNavItem>
			</MenuBarNav>
		);

		expect(screen.getByRole('button', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
		expect(screen.getByRole('button', { name: 'Docs' }).getAttribute('aria-current')).toBe('page');
	});

	it('calls onValueChange with the clicked item value', async () => {
		const handler = vi.fn();

		render(
			<MenuBarNav value='home' onValueChange={handler} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavItem value='docs'>Docs</MenuBarNavItem>
			</MenuBarNav>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Docs' }));
		expect(handler).toHaveBeenCalledWith('docs');
	});

	it('does not call onValueChange when the clicked item is disabled', async () => {
		const handler = vi.fn();

		render(
			<MenuBarNav value='home' onValueChange={handler} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavItem value='docs' disabled>Docs</MenuBarNavItem>
			</MenuBarNav>
		);

		await userEvent.click(screen.getByRole('button', { name: 'Docs' }));
		expect(handler).not.toHaveBeenCalled();
	});

	it('gives the active item tabIndex 0 and inactive items tabIndex -1', async () => {
		render(
			<MenuBarNav value='docs' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavItem value='docs'>Docs</MenuBarNavItem>
			</MenuBarNav>
		);

		await waitFor(() => expect(screen.getByRole('button', { name: 'Docs' }).tabIndex).toBe(0));
		expect(screen.getByRole('button', { name: 'Home' }).tabIndex).toBe(-1);
	});

	it('moves roving focus with ArrowRight and ArrowLeft', async () => {
		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavItem value='docs'>Docs</MenuBarNavItem>
				<MenuBarNavItem value='pricing'>Pricing</MenuBarNavItem>
			</MenuBarNav>
		);

		const home = screen.getByRole('button', { name: 'Home' });
		const docs = screen.getByRole('button', { name: 'Docs' });

		home.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(docs);

		await userEvent.keyboard('{ArrowLeft}');
		expect(document.activeElement).toBe(home);
	});

	it('jumps to the first/last item with Home/End', async () => {
		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavItem value='docs'>Docs</MenuBarNavItem>
				<MenuBarNavItem value='pricing'>Pricing</MenuBarNavItem>
			</MenuBarNav>
		);

		const home    = screen.getByRole('button', { name: 'Home' });
		const pricing = screen.getByRole('button', { name: 'Pricing' });

		home.focus();
		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(pricing);

		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(home);
	});

	it('applies active/inactive text color classes', () =>
	{
		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavItem value='docs'>Docs</MenuBarNavItem>
			</MenuBarNav>
		);

		expect(screen.getByRole('button', { name: 'Home' }).className).toContain('text-brand-fg');
		expect(screen.getByRole('button', { name: 'Docs' }).className).toContain('text-text-muted');
	});

	it('applies focus-visible ring classes to items', () =>
	{
		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
			</MenuBarNav>
		);

		const btn = screen.getByRole('button', { name: 'Home' });
		expect(btn.className).toContain('focus-visible:ring-2');
		expect(btn.className).toContain('focus-visible:ring-brand-ring');
	});

	it('throws when MenuBarNavItem is used outside MenuBarNav', () =>
	{
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

		expect(() => render(<MenuBarNavItem value='home'>Home</MenuBarNavItem>)).toThrow(
			'MenuBarNavItem and MenuBarNavMore must be used inside a MenuBarNav'
		);

		consoleError.mockRestore();
	});
});

describe('MenuBarNavMore', () =>
{
	const items = [
		{ label: 'Blog', value: 'blog' },
		{ label: 'Changelog', value: 'changelog' },
	];

	it('opens the dropdown and lists overflow items', async () => {
		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavMore value='more' items={items}>More</MenuBarNavMore>
			</MenuBarNav>
		);

		await userEvent.click(screen.getByRole('button', { name: /More/ }));
		expect(screen.getByRole('menuitem', { name: 'Blog' })).toBeDefined();
		expect(screen.getByRole('menuitem', { name: 'Changelog' })).toBeDefined();
	});

	it('calls onValueChange with the selected entry value and closes the menu', async () => {
		const handler = vi.fn();

		render(
			<MenuBarNav value='home' onValueChange={handler} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavMore value='more' items={items}>More</MenuBarNavMore>
			</MenuBarNav>
		);

		await userEvent.click(screen.getByRole('button', { name: /More/ }));
		await userEvent.click(screen.getByRole('menuitem', { name: 'Blog' }));

		expect(handler).toHaveBeenCalledWith('blog');
		await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Blog' })).toBeNull());
	});

	it('calls the entry\'s own onSelect alongside onValueChange', async () => {
		const onSelect = vi.fn();

		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavMore value='more' items={[{ label: 'Blog', value: 'blog', onSelect }]}>More</MenuBarNavMore>
			</MenuBarNav>
		);

		await userEvent.click(screen.getByRole('button', { name: /More/ }));
		await userEvent.click(screen.getByRole('menuitem', { name: 'Blog' }));

		expect(onSelect).toHaveBeenCalledTimes(1);
	});

	it('marks the trigger as active when the nav value matches one of its items', () =>
	{
		render(
			<MenuBarNav value='blog' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavMore value='more' items={items}>More</MenuBarNavMore>
			</MenuBarNav>
		);

		expect(screen.getByRole('button', { name: /More/ }).getAttribute('aria-current')).toBe('page');
	});

	it('applies the active text color to the trigger when the nav value matches one of its items', () =>
	{
		// Regression: DropdownMenu's built-in trigger classes include `text-text`, which
		// comes later in the generated Tailwind stylesheet than `text-brand-fg` and silently
		// won the cascade, so the "More" label never visibly changed color when active.
		render(
			<MenuBarNav value='blog' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavMore value='more' items={items}>More</MenuBarNavMore>
			</MenuBarNav>
		);

		const trigger = screen.getByRole('button', { name: /More/ });
		expect(trigger.className).toContain('text-brand-fg');
		expect(trigger.className).not.toContain('text-text-muted');
	});

	it('does not introduce a positioned wrapper between the nav and the trigger button', () =>
	{
		// The sliding pill positions itself via the active item's offsetLeft/offsetWidth,
		// which are computed relative to the nearest positioned ancestor (offsetParent).
		// A `position: relative|absolute|fixed|sticky` element between the trigger button
		// and <nav> would hijack that chain and make the pill land in the wrong place.
		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavMore value='more' items={items}>More</MenuBarNavMore>
			</MenuBarNav>
		);

		const nav    = screen.getByRole('navigation', { name: 'Main' });
		const button = screen.getByRole('button', { name: /More/ });

		let el = button.parentElement;
		while(el && el !== nav)
		{
			expect(el.className).not.toMatch(/\b(relative|absolute|fixed|sticky)\b/);
			el = el.parentElement;
		}
		expect(el).toBe(nav);
	});

	it('does not mark the trigger as active when the nav value matches a sibling item', () =>
	{
		render(
			<MenuBarNav value='home' onValueChange={() => {}} aria-label='Main'>
				<MenuBarNavItem value='home'>Home</MenuBarNavItem>
				<MenuBarNavMore value='more' items={items}>More</MenuBarNavMore>
			</MenuBarNav>
		);

		expect(screen.getByRole('button', { name: /More/ }).getAttribute('aria-current')).toBeNull();
	});

	it('throws when MenuBarNavMore is used outside MenuBarNav', () =>
	{
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

		expect(() => render(<MenuBarNavMore value='more' items={items}>More</MenuBarNavMore>)).toThrow(
			'MenuBarNavItem and MenuBarNavMore must be used inside a MenuBarNav'
		);

		consoleError.mockRestore();
	});
});
