'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import { Attachment, AttachmentGroup } from './Attachment';
import { describe, it, expect, vi } from 'vitest';

describe('Attachment', () =>
{
	it('renders without errors', () =>
	{
		render(<Attachment name='invoice.pdf' />);
		expect(screen.getByText('invoice.pdf')).toBeTruthy();
	});

	it('renders as a real anchor when href is given', () =>
	{
		render(<Attachment name='invoice.pdf' href='/files/invoice.pdf' />);
		const link = screen.getByRole('link');
		expect(link.getAttribute('href')).toBe('/files/invoice.pdf');
	});

	it('renders as a button when no href is given', () =>
	{
		render(<Attachment name='invoice.pdf' onClick={() => {}} />);
		expect(screen.queryByRole('link')).toBeNull();
		expect(screen.getByRole('button', { name: /invoice\.pdf/i })).toBeTruthy();
	});

	it('sets the title attribute to the full filename for truncation overflow', () =>
	{
		render(<Attachment name='a-very-long-filename-that-should-truncate.pdf' href='/f' />);
		const link = screen.getByRole('link');
		expect(link.getAttribute('title')).toBe('a-very-long-filename-that-should-truncate.pdf');
	});

	it('allows overriding the title attribute', () =>
	{
		render(<Attachment name='invoice.pdf' href='/f' title='Custom title' />);
		expect(screen.getByRole('link').getAttribute('title')).toBe('Custom title');
	});

	it('renders size and type as secondary muted text', () =>
	{
		render(<Attachment name='invoice.pdf' href='/f' size='2.4 MB' type='PDF' />);
		expect(screen.getByText('PDF · 2.4 MB')).toBeTruthy();
	});

	it('omits the secondary text line when neither size nor type is given', () =>
	{
		const { container } = render(<Attachment name='invoice.pdf' href='/f' />);
		expect(container.querySelector('.text-text-muted.text-xs')).toBeNull();
	});

	it('fires the primary onClick when the link is activated', () =>
	{
		const onClick = vi.fn();
		render(<Attachment name='invoice.pdf' href='/f' onClick={onClick} />);

		fireEvent.click(screen.getByRole('link'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('applies focus-visible ring classes to the primary link', () =>
	{
		render(<Attachment name='invoice.pdf' href='/f' />);
		expect(screen.getByRole('link').className).toContain('focus-visible:ring-2');
		expect(screen.getByRole('link').className).toContain('focus-visible:ring-offset-2');
		expect(screen.getByRole('link').className).toContain('focus-visible:ring-brand-ring');
	});

	it('forwards native anchor props such as data-testid', () =>
	{
		render(<Attachment name='invoice.pdf' href='/f' data-testid='my-attachment' />);
		expect(screen.getByTestId('my-attachment')).toBeTruthy();
	});

	it('forwards className onto the root wrapper', () =>
	{
		const { container } = render(<Attachment name='invoice.pdf' href='/f' className='custom-class' />);
		expect((container.firstElementChild as HTMLElement).className).toContain('custom-class');
	});

	it('infers the image icon (glyph) from a common image extension when there is nothing to preview', () =>
	{
		const { container } = render(<Attachment name='photo.png' onClick={() => {}} />);
		expect(container.querySelector('circle[cx="9"][cy="9"]')).toBeTruthy();
	});

	it('shows a real thumbnail automatically for an image attachment, using href as the image source', () =>
	{
		const { container } = render(<Attachment name='photo.png' href='/photo.png' />);
		const img = container.querySelector('img');
		expect(img).toBeTruthy();
		expect(img?.getAttribute('src')).toBe('/photo.png');
		expect(img?.getAttribute('alt')).toBe('');
		expect(container.querySelector('circle[cx="9"][cy="9"]')).toBeNull();
	});

	it('does not auto-thumbnail non-image attachments even when href is present', () =>
	{
		const { container } = render(<Attachment name='report.pdf' href='/report.pdf' />);
		expect(container.querySelector('img')).toBeNull();
	});

	it('renders an explicit thumbnail for a non-image attachment (e.g. a PDF cover preview)', () =>
	{
		const { container } = render(<Attachment name='report.pdf' href='/report.pdf' thumbnail='/report-cover.png' />);
		const img = container.querySelector('img');
		expect(img).toBeTruthy();
		expect(img?.getAttribute('src')).toBe('/report-cover.png');
	});

	it('lets an explicit thumbnail override the automatic image href fallback', () =>
	{
		const { container } = render(<Attachment name='photo.png' href='/full-res.png' thumbnail='/thumb.png' />);
		expect(container.querySelector('img')?.getAttribute('src')).toBe('/thumb.png');
	});

	it('lets an explicit icon prop override extension inference', () =>
	{
		const { container } = render(<Attachment name='photo.png' href='/f' icon='code' />);
		expect(container.querySelector('polyline')).toBeTruthy();
	});
});

describe('AttachmentGroup', () =>
{
	it('renders without errors', () =>
	{
		render(
			<AttachmentGroup>
				<Attachment name='a.pdf' href='/a' />
			</AttachmentGroup>
		);
		expect(screen.getByText('a.pdf')).toBeTruthy();
	});

	it('renders as a list element with a list item per attachment', () =>
	{
		render(
			<AttachmentGroup>
				<Attachment name='a.pdf' href='/a' />
				<Attachment name='b.pdf' href='/b' />
			</AttachmentGroup>
		);
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
	});

	it('applies a wrapped flex-row layout by default', () =>
	{
		const { container } = render(
			<AttachmentGroup>
				<Attachment name='a.pdf' href='/a' />
			</AttachmentGroup>
		);
		const list = container.querySelector('ul');
		expect(list?.className).toContain('flex-wrap');
	});

	it('forwards className onto the list element', () =>
	{
		const { container } = render(
			<AttachmentGroup className='custom-group'>
				<Attachment name='a.pdf' href='/a' />
			</AttachmentGroup>
		);
		expect(container.querySelector('ul')?.className).toContain('custom-group');
	});

	it('forwards additional HTML attributes', () =>
	{
		render(
			<AttachmentGroup data-testid='attachment-group'>
				<Attachment name='a.pdf' href='/a' />
			</AttachmentGroup>
		);
		expect(screen.getByTestId('attachment-group')).toBeTruthy();
	});
});
