import { MenuBar, MenuBarBrand, MenuBarActions } from './MenuBar';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

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
