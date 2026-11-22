'use client';

import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Heatmap from './Heatmap';

const DATA = [
	[1, 5, 9],
	[3, null, 7],
];
const ROWS = ['Mon', 'Tue'];
const COLUMNS = ['Morning', 'Noon', 'Night'];

const fillOf = (cell: HTMLElement) => Number(/color-mix\(in srgb, var\(--color-brand\) ([\d.]+)%/.exec(cell.getAttribute('style') ?? '')?.[1]);

describe('Heatmap', () =>
{
	it('renders a table named by label, with row and column headers', () =>
	{
		render(<Heatmap data={DATA} rowLabels={ROWS} columnLabels={COLUMNS} label='Activity by time of day' />);
		const table = screen.getByRole('table', { name: 'Activity by time of day' });
		expect(within(table).getAllByRole('columnheader').map(h => h.textContent)).toEqual(COLUMNS);
		expect(within(table).getAllByRole('rowheader').map(h => h.textContent)).toEqual(ROWS);
	});

	it('defaults the accessible name to Heatmap', () =>
	{
		render(<Heatmap data={DATA} />);
		expect(screen.getByRole('table', { name: 'Heatmap' })).toBeDefined();
	});

	it('gives every value to assistive tech even when the cells show only color', () =>
	{
		render(<Heatmap data={DATA} rowLabels={ROWS} columnLabels={COLUMNS} />);
		const cells = screen.getAllByRole('cell').slice(1);
		expect(cells.map(c => c.textContent)).toEqual(['1', '5', '9', '3', 'No data', '7']);
		expect(cells[0].querySelector('.sr-only')).not.toBeNull();
	});

	it('describes each cell with its row, column and value in a tooltip', () =>
	{
		render(<Heatmap data={DATA} rowLabels={ROWS} columnLabels={COLUMNS} />);
		const cells = screen.getAllByRole('cell').slice(1);
		expect(cells[1].getAttribute('title')).toBe('Mon, Noon: 5');
		expect(cells[4].getAttribute('title')).toBe('Tue, Noon: no data');
	});

	it('prints values in the cells with showValues, and formats them', () =>
	{
		render(<Heatmap data={[[0.5, 0.25]]} showValues showLegend={false} formatValue={v => `${v * 100}%`} />);
		const cells = screen.getAllByRole('cell');
		expect(cells.map(c => c.textContent)).toEqual(['50%', '25%']);
		expect(cells[0].querySelector('.sr-only')).toBeNull();
	});

	it('shades larger values darker, from the data range by default', () =>
	{
		render(<Heatmap data={[[1, 5, 9]]} />);
		const [low, mid, high] = screen.getAllByRole('cell').map(fillOf);
		expect(low).toBeLessThan(mid);
		expect(mid).toBeLessThan(high);
	});

	it('uses min and max as the shading domain, clamping values outside it', () =>
	{
		render(<Heatmap data={[[0, 50, 200]]} min={0} max={100} />);
		const [low, mid, high] = screen.getAllByRole('cell').map(fillOf);
		expect(low).toBeLessThan(mid);
		expect(high).toBe(fillOf(screen.getAllByRole('cell')[2]));
		expect(high).toBeGreaterThan(mid);
		render(<Heatmap data={[[100]]} min={0} max={100} />);
		expect(fillOf(screen.getAllByRole('cell').at(-1)!)).toBe(high);
	});

	it('shows a legend with the low and high values, hidden from assistive tech', () =>
	{
		const { container } = render(<Heatmap data={DATA} />);
		const legend = container.querySelector('[aria-hidden="true"]')!;
		expect(legend.textContent).toBe('19');
	});

	it('hides the legend with showLegend={false}, or when there is no data', () =>
	{
		const { container, rerender } = render(<Heatmap data={DATA} showLegend={false} />);
		expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
		rerender(<Heatmap data={[[null]]} />);
		expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
	});

	it('shades a single repeated value mid-scale instead of dividing by zero', () =>
	{
		render(<Heatmap data={[[4, 4]]} />);
		const [a, b] = screen.getAllByRole('cell').map(fillOf);
		expect(a).toBe(b);
		expect(Number.isFinite(a)).toBe(true);
	});

	it('merges a custom className and forwards native props', () =>
	{
		render(<Heatmap data={DATA} className='custom-class' data-testid='root' />);
		const root = screen.getByTestId('root');
		expect(root.className).toContain('custom-class');
		expect(root.className).toContain('w-full');
	});
});
