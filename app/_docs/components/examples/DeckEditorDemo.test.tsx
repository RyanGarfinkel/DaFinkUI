import { render, screen } from '@testing-library/react';
import { DeckEditorDemo } from './DeckEditorDemo';
import { describe, it, expect } from 'vitest';

describe('DeckEditorDemo', () =>
{
	it('builds its deck from valid ops and renders every slide', () =>
	{
		render(<DeckEditorDemo />);
		expect(screen.getByRole('region', { name: 'Q3 review editor' })).toBeTruthy();
		expect(screen.getAllByRole('button', { name: /Slide \d/ }).length).toBeGreaterThanOrEqual(3);
		expect(screen.getByRole('button', { name: 'Restyle deck' })).toBeTruthy();
	});
});
