import { Sidebar, SidebarSection, SidebarLink, SidebarDivider } from './Sidebar';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

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
		expect(link.className).toContain('bg-surface-active');
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
