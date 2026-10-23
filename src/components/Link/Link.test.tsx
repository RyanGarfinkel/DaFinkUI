import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Link from './Link';

describe('Link', () =>
{
	it('renders an anchor with the given href', () =>
	{
		render(<Link href='/docs'>Docs</Link>);
		const link = screen.getByRole('link', { name: 'Docs' });
		expect(link.getAttribute('href')).toBe('/docs');
	});

	it('is inline with no padding or fixed height', () =>
	{
		render(<Link href='/docs'>Docs</Link>);
		const classes = screen.getByRole('link').className;
		expect(classes).toContain('underline');
		expect(classes).not.toMatch(/(^|\s)(p[xy]?-|h-|inline-flex)/);
	});

	it('has hover and focus-visible styles', () =>
	{
		render(<Link href='/docs'>Docs</Link>);
		const classes = screen.getByRole('link').className;
		expect(classes).toContain('hover:decoration-text');
		expect(classes).toContain('focus-visible:ring-2');
	});

	it('merges a custom className', () =>
	{
		render(<Link href='/docs' className='custom-class'>Docs</Link>);
		expect(screen.getByRole('link').className).toContain('custom-class');
	});

	it('forwards native props', () =>
	{
		render(<Link href='https://example.com' target='_blank' rel='noopener noreferrer' aria-label='Example'>Docs</Link>);
		const link = screen.getByRole('link');
		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.getAttribute('aria-label')).toBe('Example');
	});
});
