import { createSheet, type Sheet } from './sheet';
import { describe, it, expect } from 'vitest';
import { createEvaluator } from './formulas';
import { chartModel } from './charts';
import { borderRange } from './ops';

const BLOCK = { r1: 0, c1: 0, r2: 1, c2: 1 };

describe('borderRange', () =>
{
	it('rings only the outside of the range', () =>
	{
		const next = borderRange(createSheet(5, 5), BLOCK, 'outer');
		expect(next.cells.A1.borders).toEqual(['top', 'left']);
		expect(next.cells.B2.borders).toEqual(['right', 'bottom']);
	});

	it('draws every side with all', () =>
	{
		expect(borderRange(createSheet(5, 5), BLOCK, 'all').cells.A1.borders).toHaveLength(4);
	});

	it('removes the cell entirely when clearing borders from an otherwise empty cell', () =>
	{
		const bordered = borderRange(createSheet(5, 5), BLOCK, 'all');
		expect(borderRange(bordered, BLOCK, 'none').cells).toEqual({});
	});
});

describe('chartModel', () =>
{
	const sheet: Sheet = {
		...createSheet(5, 5),
		cells: {
			A1: { value: '' }, B1: { value: 'Sales' }, C1: { value: 'Cost' },
			A2: { value: 'Jan' }, B2: { value: '10' }, C2: { value: '4' },
			A3: { value: 'Feb' }, B3: { value: '20' }, C3: { value: '6' },
		},
	};

	it('uses a text header row for series and a text first column for labels', () =>
	{
		const { data, series } = chartModel(createEvaluator(sheet), { r1: 0, c1: 0, r2: 2, c2: 2 });
		expect(series.map(s => s.label)).toEqual(['Sales', 'Cost']);
		expect(data.map(d => d.label)).toEqual(['Jan', 'Feb']);
		expect(data[1].s1).toBe(20);
	});
});
