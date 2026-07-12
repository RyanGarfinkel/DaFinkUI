import { Sidebar, SidebarHeader, SidebarFooter, SidebarSection, SidebarLink, SidebarDivider } from './Sidebar';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('Sidebar', () =>
{
	it('renders without errors', () =>
	{
		render(<Sidebar><p>content</p></Sidebar>);
		expect(screen.getByRole('complementary')).toBeTruthy();
	});

	it('applies default width class', () =>
	{
		render(<Sidebar><p>content</p></Sidebar>);
		const aside = screen.getByRole('complementary');
		expect(aside.className).toContain('w-56');
	});

	it('applies custom width class', () =>
	{
		render(<Sidebar width='w-64'><p>content</p></Sidebar>);
		const aside = screen.getByRole('complementary');
		expect(aside.className).toContain('w-64');
	});

	it('merges additional className', () =>
	{
		render(<Sidebar className='custom-class'><p>content</p></Sidebar>);
		const aside = screen.getByRole('complementary');
		expect(aside.className).toContain('custom-class');
	});

	it('uses token-based surface and border classes', () =>
	{
		render(<Sidebar><p>content</p></Sidebar>);
		const aside = screen.getByRole('complementary');
		expect(aside.className).toContain('bg-surface');
		expect(aside.className).toContain('border-surface-border');
	});

	it('does not render a collapse toggle by default', () =>
	{
		render(<Sidebar><p>content</p></Sidebar>);
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('renders a collapse toggle when collapsible', () =>
	{
		render(<Sidebar collapsible><p>content</p></Sidebar>);
		expect(screen.getByRole('button', { name: 'Collapse navigation' })).toBeTruthy();
	});

	it('applies collapsedWidth and toggles the label when clicked', async () =>
	{
		const user = userEvent.setup();
		render(<Sidebar collapsible collapsedWidth='w-14'><p>content</p></Sidebar>);
		const aside  = screen.getByRole('complementary');
		const toggle = screen.getByRole('button', { name: 'Collapse navigation' });

		expect(aside.className).toContain('w-56');

		await user.click(toggle);

		expect(aside.className).toContain('w-14');
		expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeTruthy();
	});

	it('respects a controlled collapsed prop and calls onCollapsedChange', async () =>
	{
		const user             = userEvent.setup();
		const onCollapsedChange = vi.fn();
		render(<Sidebar collapsible collapsed={false} onCollapsedChange={onCollapsedChange}><p>content</p></Sidebar>);

		await user.click(screen.getByRole('button', { name: 'Collapse navigation' }));

		expect(onCollapsedChange).toHaveBeenCalledWith(true);
		expect(screen.getByRole('button', { name: 'Collapse navigation' })).toBeTruthy();
	});

	it('defaults the toggle position to middle', () =>
	{
		render(<Sidebar collapsible><p>content</p></Sidebar>);
		const toggle = screen.getByRole('button', { name: 'Collapse navigation' });
		expect(toggle.className).toContain('top-1/2');
		expect(toggle.className).toContain('-translate-y-1/2');
	});

	it('positions the toggle at the top when togglePosition="top"', () =>
	{
		render(<Sidebar collapsible togglePosition='top'><p>content</p></Sidebar>);
		const toggle = screen.getByRole('button', { name: 'Collapse navigation' });
		expect(toggle.className).toContain('top-11');
		expect(toggle.className).not.toContain('top-1/2');
	});

	it('positions the toggle at the bottom when togglePosition="bottom"', () =>
	{
		render(<Sidebar collapsible togglePosition='bottom'><p>content</p></Sidebar>);
		const toggle = screen.getByRole('button', { name: 'Collapse navigation' });
		expect(toggle.className).toContain('bottom-6');
	});
});

describe('SidebarHeader', () =>
{
	it('renders children', () =>
	{
		render(<SidebarHeader><span>Brand</span></SidebarHeader>);
		expect(screen.getByText('Brand')).toBeTruthy();
	});

	it('merges additional className', () =>
	{
		const { container } = render(<SidebarHeader className='extra'><span>Brand</span></SidebarHeader>);
		expect((container.firstChild as HTMLElement).className).toContain('extra');
	});
});

describe('SidebarFooter', () =>
{
	it('renders children', () =>
	{
		render(<SidebarFooter><span>Logout</span></SidebarFooter>);
		expect(screen.getByText('Logout')).toBeTruthy();
	});

	it('merges additional className', () =>
	{
		const { container } = render(<SidebarFooter className='extra'><span>Logout</span></SidebarFooter>);
		expect((container.firstChild as HTMLElement).className).toContain('extra');
	});
});

describe('Sidebar layout regions', () =>
{
	it('keeps the header outside the scrollable region', () =>
	{
		const { container } = render(
			<Sidebar>
				<SidebarHeader><span>Brand</span></SidebarHeader>
				<p>content</p>
			</Sidebar>
		);
		const scrollRegion = container.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
		expect(scrollRegion.textContent).not.toContain('Brand');
		expect(screen.getByText('Brand')).toBeTruthy();
	});

	it('keeps the footer outside the scrollable region', () =>
	{
		const { container } = render(
			<Sidebar>
				<p>content</p>
				<SidebarFooter><span>Logout</span></SidebarFooter>
			</Sidebar>
		);
		const scrollRegion = container.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
		expect(scrollRegion.textContent).not.toContain('Logout');
		expect(screen.getByText('Logout')).toBeTruthy();
	});

	it('puts everything in the scrollable region when there is no header or footer', () =>
	{
		const { container } = render(
			<Sidebar>
				<p>content</p>
			</Sidebar>
		);
		const scrollRegion = container.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
		expect(scrollRegion.textContent).toContain('content');
	});

	it('prevents direct children of the scrollable region from flex-shrinking', () =>
	{
		const { container } = render(
			<Sidebar>
				<p>content</p>
			</Sidebar>
		);
		const scrollRegion = container.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
		expect(scrollRegion.className).toContain('[&>*]:shrink-0');
	});

	it('hides the active indicator when no link is active', () =>
	{
		const { container } = render(
			<Sidebar>
				<SidebarLink href='/home'>Home</SidebarLink>
			</Sidebar>
		);
		const indicator = container.querySelector('.bg-surface-active') as HTMLElement;
		expect(indicator.style.opacity).toBe('0');
	});

	it('shows the active indicator when a link is active', () =>
	{
		const { container } = render(
			<Sidebar>
				<SidebarLink href='/home' isActive>Home</SidebarLink>
			</Sidebar>
		);
		const indicator = container.querySelector('.bg-surface-active') as HTMLElement;
		expect(indicator.style.opacity).toBe('1');
	});
});

describe('SidebarSection', () =>
{
	it('renders children without a label', () =>
	{
		render(<SidebarSection><span>Item</span></SidebarSection>);
		expect(screen.getByText('Item')).toBeTruthy();
		expect(screen.queryByRole('none')).toBeNull();
	});

	it('renders label when provided', () =>
	{
		render(<SidebarSection label='Navigation'><span>Item</span></SidebarSection>);
		expect(screen.getByText('Navigation')).toBeTruthy();
	});

	it('merges additional className', () =>
	{
		const { container } = render(<SidebarSection className='extra'><span>x</span></SidebarSection>);
		expect(container.firstChild as HTMLElement).toBeTruthy();
		expect((container.firstChild as HTMLElement).className).toContain('extra');
	});

	it('hides the label as sr-only when the parent Sidebar is collapsed', () =>
	{
		render(
			<Sidebar collapsed>
				<SidebarSection label='Navigation'><span>Item</span></SidebarSection>
			</Sidebar>
		);
		expect(screen.getByText('Navigation').className).toContain('sr-only');
	});
});

describe('SidebarLink', () =>
{
	it('renders a link with the correct href', () =>
	{
		render(<SidebarLink href='/home'>Home</SidebarLink>);
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link.getAttribute('href')).toBe('/home');
	});

	it('applies inactive styles by default', () =>
	{
		render(<SidebarLink href='/home'>Home</SidebarLink>);
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link.className).toContain('text-text-muted');
		expect(link.className).toContain('hover:bg-surface-hover');
	});

	it('applies active styles when isActive is true', () =>
	{
		render(<SidebarLink href='/home' isActive>Home</SidebarLink>);
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link.className).toContain('text-text');
		expect(link.className).toContain('font-medium');
	});

	it('sets aria-current="page" when active', () =>
	{
		render(<SidebarLink href='/home' isActive>Home</SidebarLink>);
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link.getAttribute('aria-current')).toBe('page');
	});

	it('does not set aria-current when inactive', () =>
	{
		render(<SidebarLink href='/home'>Home</SidebarLink>);
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link.getAttribute('aria-current')).toBeNull();
	});

	it('has focus-visible ring classes', () =>
	{
		render(<SidebarLink href='/home'>Home</SidebarLink>);
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link.className).toContain('focus-visible:ring-2');
		expect(link.className).toContain('focus-visible:ring-brand-ring');
	});

	it('merges additional className', () =>
	{
		render(<SidebarLink href='/home' className='extra-class'>Home</SidebarLink>);
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link.className).toContain('extra-class');
	});

	it('renders the icon', () =>
	{
		render(<SidebarLink href='/home' icon={<svg data-testid='icon' />}>Home</SidebarLink>);
		expect(screen.getByTestId('icon')).toBeTruthy();
	});

	it('hides the label as sr-only but keeps the icon when the parent Sidebar is collapsed', () =>
	{
		render(
			<Sidebar collapsed>
				<SidebarLink href='/home' icon={<svg data-testid='icon' />}>Home</SidebarLink>
			</Sidebar>
		);
		expect(screen.getByTestId('icon')).toBeTruthy();
		expect(screen.getByText('Home').className).toContain('sr-only');
	});

	it('shows a tooltip with the label on focus when collapsed with an icon', async () =>
	{
		const user = userEvent.setup();
		render(
			<Sidebar collapsed>
				<SidebarLink href='/home' icon={<svg data-testid='icon' />}>Home</SidebarLink>
			</Sidebar>
		);

		expect(screen.queryByRole('tooltip')).toBeNull();

		await user.tab();

		expect(screen.getByRole('link')).toHaveFocus();
		expect(screen.getByRole('tooltip')).toHaveTextContent('Home');
	});

	it('does not render at all when collapsed and no icon is provided', () =>
	{
		render(
			<Sidebar collapsed>
				<SidebarLink href='/home'>Home</SidebarLink>
			</Sidebar>
		);
		expect(screen.queryByText('Home')).toBeNull();
		expect(screen.queryByRole('link')).toBeNull();
	});

	it('renders normally without an icon when not collapsed', () =>
	{
		render(
			<Sidebar collapsed={false}>
				<SidebarLink href='/home'>Home</SidebarLink>
			</Sidebar>
		);
		expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
	});

	it('renders the action as a sibling of the link, never a descendant', () =>
	{
		render(
			<SidebarLink href='/home' action={<button aria-label='Favorite'>star</button>}>
				Home
			</SidebarLink>
		);
		const link   = screen.getByRole('link', { name: 'Home' });
		const action = screen.getByRole('button', { name: 'Favorite' });

		expect(link.contains(action)).toBe(false);
		expect(action.closest('a')).toBeNull();
	});

	it('does not navigate the link when the action is clicked', async () =>
	{
		const user       = userEvent.setup();
		const onAction    = vi.fn();
		const onLinkClick = vi.fn();
		render(
			<SidebarLink href='/home' onClick={onLinkClick} action={<button onClick={onAction}>star</button>}>
				Home
			</SidebarLink>
		);

		await user.click(screen.getByRole('button', { name: 'star' }));

		expect(onAction).toHaveBeenCalledTimes(1);
		expect(onLinkClick).not.toHaveBeenCalled();
	});

	it('does not render the action when the parent Sidebar is collapsed', () =>
	{
		render(
			<Sidebar collapsed>
				<SidebarLink href='/home' icon={<svg data-testid='icon' />} action={<button>star</button>}>
					Home
				</SidebarLink>
			</Sidebar>
		);
		expect(screen.queryByRole('button', { name: 'star' })).toBeNull();
	});
});

describe('SidebarDivider', () =>
{
	it('renders an hr element', () =>
	{
		render(<SidebarDivider />);
		expect(screen.getByRole('separator')).toBeTruthy();
	});

	it('applies border token class', () =>
	{
		render(<SidebarDivider />);
		const hr = screen.getByRole('separator');
		expect(hr.className).toContain('border-surface-border');
	});

	it('merges additional className', () =>
	{
		render(<SidebarDivider className='my-4' />);
		const hr = screen.getByRole('separator');
		expect(hr.className).toContain('my-4');
	});
});
