import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TableOfContents from './TableOfContents';

const stubMatchMedia = (matches: boolean) =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
};

beforeEach(() =>
{
	stubMatchMedia(false);
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() =>
{
	vi.unstubAllGlobals();
});

const renderWithHeadings = (containerId = 'toc-content', tocProps = {}) => {
	return render(
		<div>
			<div id={containerId}>
				<h2>Introduction</h2>
				<h3>Getting started</h3>
				<h2>Advanced usage</h2>
				<div data-toc-exclude>
					<h2>Excluded heading</h2>
				</div>
				<div role='tabpanel'>
					<h2>Tab panel heading</h2>
				</div>
			</div>
			<TableOfContents containerId={containerId} {...tocProps} />
		</div>
	);
};

describe('TableOfContents', () =>
{
	it('renders nothing when the container has no headings', () =>
	{
		render(
			<div>
				<div id='empty-content' />
				<TableOfContents containerId='empty-content' />
			</div>
		);
		expect(screen.queryByRole('navigation')).toBeNull();
	});

	it('renders a link for each heading found in the container', () =>
	{
		renderWithHeadings();
		expect(screen.getByRole('link', { name: 'Introduction' })).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Getting started' })).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Advanced usage' })).toBeTruthy();
	});

	it('excludes headings inside [data-toc-exclude] and [role="tabpanel"]', () =>
	{
		renderWithHeadings();
		expect(screen.queryByRole('link', { name: 'Excluded heading' })).toBeNull();
		expect(screen.queryByRole('link', { name: 'Tab panel heading' })).toBeNull();
	});

	it('only scans headings inside the given containerId', () =>
	{
		render(
			<div>
				<div id='other-content'>
					<h2>Outside heading</h2>
				</div>
				<div id='toc-content'>
					<h2>Inside heading</h2>
				</div>
				<TableOfContents containerId='toc-content' />
			</div>
		);
		expect(screen.queryByRole('link', { name: 'Outside heading' })).toBeNull();
		expect(screen.getByRole('link', { name: 'Inside heading' })).toBeTruthy();
	});

	it('defaults containerId to docs-content', () =>
	{
		render(
			<div>
				<div id='docs-content'>
					<h2>Default container heading</h2>
				</div>
				<TableOfContents />
			</div>
		);
		expect(screen.getByRole('link', { name: 'Default container heading' })).toBeTruthy();
	});

	it('auto-generates a slugified id for headings with none', () =>
	{
		renderWithHeadings();
		const link = screen.getByRole('link', { name: 'Getting started' });
		expect(link.getAttribute('href')).toBe('#getting-started');
	});

	it('applies a level-3 indent class to h3 links', () =>
	{
		renderWithHeadings();
		const link = screen.getByRole('link', { name: 'Getting started' });
		expect(link.className).toContain('pl-6');
	});

	it('nav has aria-label="Table of contents"', () =>
	{
		renderWithHeadings();
		const nav = screen.getByRole('navigation');
		expect(nav.getAttribute('aria-label')).toBe('Table of contents');
	});

	it('renders the default label text', () =>
	{
		renderWithHeadings();
		expect(screen.getByText("What's on this page?")).toBeTruthy();
	});

	it('renders a custom label when provided', () =>
	{
		renderWithHeadings('toc-content', { label: 'On this page' });
		expect(screen.getByText('On this page')).toBeTruthy();
		expect(screen.queryByText("What's on this page?")).toBeNull();
	});

	it('marks exactly one heading link as aria-current="location"', () =>
	{
		renderWithHeadings();
		const links = screen.getAllByRole('link');
		const current = links.filter((l) => l.getAttribute('aria-current') === 'location');
		expect(current.length).toBe(1);
	});

	it('updates aria-current and pushes the URL hash when a link is clicked', () =>
	{
		renderWithHeadings();
		const link = screen.getByRole('link', { name: 'Introduction' });

		fireEvent.click(link);

		expect(link.getAttribute('aria-current')).toBe('location');
		expect(window.location.hash).toBe('#introduction');
	});

	it('has focus-visible ring classes', () =>
	{
		renderWithHeadings();
		const link = screen.getByRole('link', { name: 'Introduction' });
		expect(link.className).toContain('focus-visible:ring-2');
		expect(link.className).toContain('focus-visible:ring-brand-ring');
	});

	it('merges additional className onto the nav element', () =>
	{
		renderWithHeadings('toc-content', { className: 'custom-toc' });
		const nav = screen.getByRole('navigation');
		expect(nav.className).toContain('custom-toc');
	});
});
