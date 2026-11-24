import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocEditor from './DocEditor';

const HTML = '<h1>Q3 review</h1><p>Signups grew <strong>18%</strong>.</p>';

describe('DocEditor', () =>
{
	beforeEach(() =>
	{
		URL.createObjectURL = vi.fn(() => 'blob:doc');
		URL.revokeObjectURL = vi.fn();
	});

	it('shows the document it is given', async () =>
	{
		render(<DocEditor value={HTML} />);

		expect(await screen.findByRole('heading', { name: 'Q3 review' })).toBeDefined();
		expect(screen.getByText('18%').tagName).toBe('STRONG');
	});

	it('is an editable textbox with an accessible name', async () =>
	{
		render(<DocEditor value={HTML} aria-label='Quarterly review' />);

		const box = await screen.findByRole('textbox', { name: 'Quarterly review' });
		expect(box.getAttribute('contenteditable')).toBe('true');
		expect(box.getAttribute('aria-multiline')).toBe('true');
	});

	it('offers every formatting control by name', async () =>
	{
		render(<DocEditor value={HTML} />);
		await screen.findByRole('heading', { name: 'Q3 review' });

		for(const name of ['Undo', 'Redo', 'Bold', 'Italic', 'Underline', 'Strikethrough', 'Bulleted list', 'Numbered list', 'Quote', 'Align left', 'Align center', 'Align right', 'Text style'])
		{
			expect(screen.getByRole('button', { name }), name).toBeDefined();
		}

		expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeDefined();
	});

	it('reflects the style at the cursor and toggles it', async () =>
	{
		render(<DocEditor value={HTML} />);
		await screen.findByRole('heading', { name: 'Q3 review' });

		const bold = screen.getByRole('button', { name: 'Bold' });
		expect(bold.getAttribute('aria-pressed')).toBe('false');

		fireEvent.click(bold);
		await waitFor(() => expect(bold.getAttribute('aria-pressed')).toBe('true'));

		fireEvent.click(bold);
		await waitFor(() => expect(bold.getAttribute('aria-pressed')).toBe('false'));
	});

	it('follows a new value from the parent', async () =>
	{
		const { rerender } = render(<DocEditor value={HTML} />);
		await screen.findByRole('heading', { name: 'Q3 review' });

		rerender(<DocEditor value='<p>Replaced</p>' />);
		expect(await screen.findByText('Replaced')).toBeDefined();
		expect(screen.queryByText('Q3 review')).toBeNull();
	});

	it('hides editing controls when read-only but keeps the download', async () =>
	{
		render(<DocEditor value={HTML} readOnly />);

		const box = await screen.findByRole('textbox');
		expect(box.getAttribute('contenteditable')).toBe('false');
		expect(screen.queryByRole('button', { name: 'Bold' })).toBeNull();
		expect(screen.getByRole('button', { name: /download/i })).toBeDefined();
	});

	it('has no toolbar when read-only and not downloadable', async () =>
	{
		render(<DocEditor value={HTML} readOnly downloadable={false} />);
		await screen.findByRole('textbox');

		expect(screen.queryByRole('toolbar')).toBeNull();
	});

	it('downloads the document as a named .docx', async () =>
	{
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		render(<DocEditor value={HTML} filename='q3-review' />);
		await screen.findByRole('heading', { name: 'Q3 review' });

		fireEvent.click(screen.getByRole('button', { name: /download \.docx/i }));

		await waitFor(() => expect(click).toHaveBeenCalled());
		expect(URL.createObjectURL).toHaveBeenCalled();
		click.mockRestore();
	});

	it('merges a custom className and sizes to the height prop', async () =>
	{
		const { container } = render(<DocEditor value={HTML} className='custom-class' height={320} />);
		await screen.findByRole('textbox');

		expect((container.firstChild as HTMLElement).className).toContain('custom-class');
		expect((container.firstChild as HTMLElement).style.height).toBe('320px');
	});
});
