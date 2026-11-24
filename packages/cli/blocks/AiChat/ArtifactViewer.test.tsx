import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArtifactViewer } from './ArtifactViewer';
import type { ChatArtifact } from './types';

const document_: ChatArtifact = { id: 'doc', kind: 'document', title: 'Q3 review', filename: 'q3-review.docx', content: '<h1>Q3 review</h1><p>Signups grew.</p>' };

describe('ArtifactViewer', () =>
{
	beforeEach(() =>
	{
		URL.createObjectURL = vi.fn(() => 'blob:doc');
		URL.revokeObjectURL = vi.fn();
	});

	it('opens a document in the editor, named after the artifact', async () =>
	{
		render(<ArtifactViewer artifact={document_} />);

		expect(await screen.findByRole('textbox', { name: 'Q3 review' })).toBeDefined();
		expect(screen.getByRole('heading', { name: 'Q3 review' })).toBeDefined();
		expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeDefined();
	});

	it('has one Word download, in the header', async () =>
	{
		render(<ArtifactViewer artifact={document_} />);
		await screen.findByRole('textbox');

		expect(screen.getAllByRole('button', { name: /download/i })).toHaveLength(1);
		expect(screen.getByRole('button', { name: 'Download .docx' })).toBeDefined();
	});

	it('downloads the edited document as a .docx file', async () =>
	{
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		render(<ArtifactViewer artifact={document_} />);
		await screen.findByRole('textbox');

		fireEvent.click(screen.getByRole('button', { name: 'Download .docx' }));

		await waitFor(() => expect(click).toHaveBeenCalled());
		const link = click.mock.contexts[0] as HTMLAnchorElement;
		expect(link.download).toBe('q3-review.docx');
		click.mockRestore();
	});

	it('still shows markdown without an editor', () =>
	{
		render(<ArtifactViewer artifact={{ id: 'md', kind: 'markdown', title: 'Notes', filename: 'notes.md', content: '# Notes' }} />);

		expect(screen.queryByRole('textbox')).toBeNull();
		expect(screen.getByRole('button', { name: 'Download' })).toBeDefined();
	});
});
