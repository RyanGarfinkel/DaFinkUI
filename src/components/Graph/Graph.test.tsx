import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Graph from './Graph';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('Graph', () =>
{
	it('renders without errors with empty nodes and edges', () =>
	{
		render(<Graph nodes={[]} edges={[]} />);
		expect(screen.getByRole('application')).toBeTruthy();
	});

	it('renders the correct number of node list items', () =>
	{
		const nodes = [
			{ id: 'a', label: 'Alpha' },
			{ id: 'b', label: 'Beta'  },
			{ id: 'c', label: 'Gamma' },
		];
		render(<Graph nodes={nodes} edges={[]} />);

		act(() => { vi.runAllTimers(); });

		expect(screen.getAllByRole('listitem')).toHaveLength(3);
	});

	it('has role="application" and aria-label="Graph" on the SVG', () =>
	{
		render(<Graph nodes={[]} edges={[]} />);
		const svg = screen.getByRole('application');
		expect(svg.getAttribute('aria-label')).toBe('Graph');
	});

	it('gives each node an aria-label matching its label prop', () =>
	{
		const nodes = [
			{ id: '1', label: 'React'      },
			{ id: '2', label: 'TypeScript' },
		];
		render(<Graph nodes={nodes} edges={[]} />);

		act(() => { vi.runAllTimers(); });

		expect(screen.getByLabelText('React')).toBeTruthy();
		expect(screen.getByLabelText('TypeScript')).toBeTruthy();
	});
});
