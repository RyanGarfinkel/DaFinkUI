import { TopNav, TopNavBrand, TopNavActions } from './TopNav';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('TopNav', () =>
{
	it('renders without errors', () =>
	{
		render(<TopNav><p>content</p></TopNav>);
		expect(screen.getByRole('banner')).toBeTruthy();
	});

	it('applies default height class', () =>
	{
		render(<TopNav><p>content</p></TopNav>);
		expect(screen.getByRole('banner').className).toContain('h-14');
	});

	it('applies custom height class', () =>
	{
		render(<TopNav height='h-16'><p>content</p></TopNav>);
		expect(screen.getByRole('banner').className).toContain('h-16');
	});

	it('merges additional className', () =>
	{
		render(<TopNav className='custom-class'><p>content</p></TopNav>);
		expect(screen.getByRole('banner').className).toContain('custom-class');
	});

	it('is fixed to the top of the viewport', () =>
	{
		render(<TopNav><p>content</p></TopNav>);
		const header = screen.getByRole('banner');
		expect(header.className).toContain('fixed');
		expect(header.className).toContain('top-0');
	});

	it('respects a position override in className instead of forcing fixed', () =>
	{
		render(<TopNav className='relative'><p>content</p></TopNav>);
		const header = screen.getByRole('banner');
		expect(header.className).toContain('relative');
		expect(header.className).not.toContain('fixed');
	});

	it('uses token-based surface and border classes', () =>
	{
		render(<TopNav><p>content</p></TopNav>);
		const header = screen.getByRole('banner');
		expect(header.className).toContain('bg-surface/95');
		expect(header.className).toContain('border-surface-border');
	});
});

describe('TopNavBrand', () =>
{
	it('renders children', () =>
	{
		render(<TopNavBrand><span>Brand</span></TopNavBrand>);
		expect(screen.getByText('Brand')).toBeTruthy();
	});

	it('merges additional className', () =>
	{
		const { container } = render(<TopNavBrand className='extra'><span>Brand</span></TopNavBrand>);
		expect((container.firstChild as HTMLElement).className).toContain('extra');
	});
});

describe('TopNavActions', () =>
{
	it('renders children', () =>
	{
		render(<TopNavActions><button>Action</button></TopNavActions>);
		expect(screen.getByText('Action')).toBeTruthy();
	});

	it('merges additional className', () =>
	{
		const { container } = render(<TopNavActions className='extra'><button>Action</button></TopNavActions>);
		expect((container.firstChild as HTMLElement).className).toContain('extra');
	});

	it('pushes itself to the right with ml-auto', () =>
	{
		const { container } = render(<TopNavActions><button>Action</button></TopNavActions>);
		expect((container.firstChild as HTMLElement).className).toContain('ml-auto');
	});
});
