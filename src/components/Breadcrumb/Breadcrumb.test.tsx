import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Breadcrumb from './Breadcrumb';

const threeItems = [
	{ label: 'Home', href: '/' },
	{ label: 'Products', href: '/products' },
	{ label: 'Keyboards' },
];

describe('Breadcrumb', () =>
{
	it('renders correct number of items', () =>
	{
		render(<Breadcrumb items={threeItems} />);
		const items = screen.getAllByRole('listitem');
		expect(items.length).toBe(3);
	});

	it('renders links for all items except the last', () =>
	{
		render(<Breadcrumb items={threeItems} />);
		const links = screen.getAllByRole('link');
		expect(links.length).toBe(2);
		expect(links[0].textContent).toBe('Home');
		expect(links[1].textContent).toBe('Products');
	});

	it('last item has aria-current="page"', () =>
	{
		render(<Breadcrumb items={threeItems} />);
		const current = screen.getByText('Keyboards');
		expect(current.getAttribute('aria-current')).toBe('page');
	});

	it('last item has no link', () =>
	{
		render(<Breadcrumb items={threeItems} />);
		const links = screen.getAllByRole('link');
		const linkTexts = links.map(l => l.textContent);
		expect(linkTexts).not.toContain('Keyboards');
	});

	it('nav has aria-label="breadcrumb"', () =>
	{
		render(<Breadcrumb items={threeItems} />);
		const nav = screen.getByRole('navigation');
		expect(nav.getAttribute('aria-label')).toBe('breadcrumb');
	});

	it('renders a custom separator', () =>
	{
		render(<Breadcrumb items={threeItems} separator='>' />);
		const separators = screen.getAllByText('>');
		expect(separators.length).toBe(2);
	});

	it('applies custom className to the nav element', () =>
	{
		render(<Breadcrumb items={threeItems} className='custom-class' />);
		const nav = screen.getByRole('navigation');
		expect(nav.className).toContain('custom-class');
	});
});
