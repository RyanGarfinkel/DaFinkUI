'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PdfViewer from './PdfViewer';

const { getDocument, destroy } = vi.hoisted(() => ({ getDocument: vi.fn(), destroy: vi.fn() }));

vi.mock('pdfjs-dist', () => ({
	getDocument,
	GlobalWorkerOptions: {},
	TextLayer: class
	{
		public render = () => Promise.resolve();
		public cancel = () => {};
	},
}));

const makePage = () => ({
	getViewport:       ({ scale }: { scale: number }) => ({ width: 612 * scale, height: 792 * scale }),
	render:            () => ({ promise: Promise.resolve(), cancel: () => {} }),
	streamTextContent: () => ({}),
});

const open = (pages = 3) => {
	getDocument.mockReturnValue({
		promise: Promise.resolve({ numPages: pages, getPage: () => Promise.resolve(makePage()) }),
		destroy,
	});
};

describe('PdfViewer', () =>
{
	beforeEach(() =>
	{
		getDocument.mockReset();
		destroy.mockReset();
	});

	it('shows a loading state before the document is ready', () =>
	{
		getDocument.mockReturnValue({ promise: new Promise(() => {}), destroy });
		render(<PdfViewer src='/a.pdf' />);

		expect(screen.getByRole('status', { name: 'Loading PDF…' })).toBeDefined();
		expect(screen.getByRole('textbox', { name: 'Page number' })).toBeDisabled();
	});

	it('renders one labelled page per page of the document', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' title='Report' />);

		expect(await screen.findByRole('img', { name: 'Page 1 of 3' })).toBeDefined();
		expect(screen.getByRole('img', { name: 'Page 3 of 3' })).toBeDefined();
		expect(screen.getByRole('region', { name: 'Report' })).toBeDefined();
		expect(screen.getByText('of 3')).toBeDefined();
	});

	it('loads from a url or from bytes', async () =>
	{
		open();
		const { rerender } = render(<PdfViewer src='/a.pdf' />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });
		expect(getDocument).toHaveBeenLastCalledWith({ url: '/a.pdf' });

		const bytes = new Uint8Array([1, 2, 3]);
		rerender(<PdfViewer src={bytes} />);
		await waitFor(() => expect(getDocument).toHaveBeenLastCalledWith({ data: bytes }));
	});

	it('reports the page count and any load error', async () =>
	{
		open(5);
		const onLoad = vi.fn();
		render(<PdfViewer src='/a.pdf' onLoad={onLoad} />);
		await waitFor(() => expect(onLoad).toHaveBeenCalledWith(5));
	});

	it('shows an alert and calls onError when the file cannot be loaded', async () =>
	{
		const onError = vi.fn();
		getDocument.mockReturnValue({ promise: Promise.reject(new Error('bad file')), destroy });
		render(<PdfViewer src='/missing.pdf' onError={onError} />);

		expect(await screen.findByRole('alert')).toHaveTextContent('This PDF could not be loaded.');
		expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'bad file' }));
	});

	it('jumps to a typed page and reports the change', async () =>
	{
		open();
		const onPageChange = vi.fn();
		render(<PdfViewer src='/a.pdf' onPageChange={onPageChange} />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		const input = screen.getByRole('textbox', { name: 'Page number' });
		fireEvent.change(input, { target: { value: '2' } });
		fireEvent.keyDown(input, { key: 'Enter' });

		expect(onPageChange).toHaveBeenCalledWith(2);
		expect(input).toHaveValue('2');
	});

	it('reports a double click as a page and a position in PDF points', async () =>
	{
		open();
		const onPageDoubleClick = vi.fn();
		render(<PdfViewer src='/a.pdf' onPageDoubleClick={onPageDoubleClick} />);
		const page = await screen.findByRole('img', { name: 'Page 2 of 3' });
		page.getBoundingClientRect = () => ({ left: 10, top: 20 }) as DOMRect;

		fireEvent.doubleClick(page, { clientX: 70, clientY: 140 });

		const [{ page: number, x, y }] = onPageDoubleClick.mock.calls[0];
		expect(number).toBe(2);
		expect(x).toBeGreaterThan(0);
		expect(y).toBeGreaterThan(x);
	});

	it('shows no heading without a title and still names the region', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		expect(screen.getByRole('region', { name: 'PDF document' })).toBeDefined();
		expect(screen.getByRole('toolbar', { name: 'PDF document controls' })).toBeDefined();
		expect(screen.queryByText('PDF document')).toBeNull();
	});

	it('portals the controls into a toolbarTarget without its own title row', async () =>
	{
		open();
		const target = document.createElement('div');
		document.body.appendChild(target);
		render(<PdfViewer src='/a.pdf' title='Report' toolbarTarget={target} />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		expect(target.querySelector('[role=toolbar]')).not.toBeNull();
		expect(target.querySelector('input[aria-label="Page number"]')).not.toBeNull();
		expect(screen.queryByText('Report')).toBeNull();
		target.remove();
	});

	it('hides the controls when toolbarTarget is null', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' toolbarTarget={null} />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		expect(screen.queryByRole('toolbar')).toBeNull();
	});

	it('has no previous or next buttons', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		expect(screen.queryByRole('button', { name: /previous page|next page/i })).toBeNull();
	});

	it('jumps to a typed page number and clamps it to the document', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		const input = screen.getByRole('textbox', { name: 'Page number' });
		fireEvent.change(input, { target: { value: '99' } });
		fireEvent.keyDown(input, { key: 'Enter' });

		expect(input).toHaveValue('3');
	});

	it('zooms in steps and returns to fit through the dropdown', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		const level = screen.getByRole('button', { name: 'Zoom level' });
		expect(level).toHaveTextContent('Fit · 100%');

		fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
		fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
		expect(level).toHaveTextContent('150%');

		fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
		expect(level).toHaveTextContent('125%');

		fireEvent.click(level);
		fireEvent.pointerDown(await screen.findByRole('option', { name: 'Fit · 100%' }));
		expect(level).toHaveTextContent('Fit · 100%');
	});

	it('picks a preset zoom from the dropdown', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		fireEvent.click(screen.getByRole('button', { name: 'Zoom level' }));
		fireEvent.pointerDown(await screen.findByRole('option', { name: '200%' }));

		expect(screen.getByRole('button', { name: 'Zoom level' })).toHaveTextContent('200%');
	});

	it('stops zooming at the limits', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		for(let index = 0; index < 20; index++) fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
		expect(screen.getByRole('button', { name: 'Zoom level' })).toHaveTextContent('25%');
		expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
	});

	it('releases the document when it unmounts', async () =>
	{
		open();
		const { unmount } = render(<PdfViewer src='/a.pdf' />);
		await screen.findByRole('img', { name: 'Page 1 of 3' });

		unmount();
		expect(destroy).toHaveBeenCalled();
	});

	it('merges a custom className and forwards native props', async () =>
	{
		open();
		render(<PdfViewer src='/a.pdf' className='custom-class' data-testid='root' />);

		expect(screen.getByTestId('root').className).toContain('custom-class');
		await screen.findByRole('img', { name: 'Page 1 of 3' });
	});
});
