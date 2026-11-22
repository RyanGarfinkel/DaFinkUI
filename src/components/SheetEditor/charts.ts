import type { ChartDataPoint, ChartSeries } from '../Charts/Charts';
import type { Evaluator } from './formulas';
import type { Range } from './sheet';
import { colName } from './sheet';

export interface ChartModel {
	data:   ChartDataPoint[];
	series: ChartSeries[];
}

const isText = (value: unknown): value is string => typeof value === 'string' && value !== '';

/** A text first row becomes the series names; a text first column becomes the point labels. Everything else is numbers. */
export const chartModel = (evaluator: Evaluator, range: Range): ChartModel => {
	const cell = (r: number, c: number) => evaluator.valueAt(r, c);
	const columns = Array.from({ length: range.c2 - range.c1 + 1 }, (_, i) => range.c1 + i);
	const rows = Array.from({ length: range.r2 - range.r1 + 1 }, (_, i) => range.r1 + i);

	const hasLabels = columns.length > 1 && rows.every(r => typeof cell(r, columns[0]) !== 'number');
	const seriesColumns = hasLabels ? columns.slice(1) : columns;
	const hasHeader = rows.length > 1 && seriesColumns.every(c => isText(cell(rows[0], c)));
	const dataRows = hasHeader ? rows.slice(1) : rows;

	const series = seriesColumns.map(c => ({
		key:   `s${c}`,
		label: hasHeader ? String(cell(rows[0], c)) : `Column ${colName(c)}`,
	}));

	const data = dataRows.map((r, i) =>
	{
		const point: ChartDataPoint = { label: hasLabels ? String(cell(r, columns[0]) ?? '') : String(i + 1) };
		seriesColumns.forEach(c =>
		{
			const value = cell(r, c);
			point[`s${c}`] = typeof value === 'number' ? value : 0;
		});
		return point;
	});

	return { data, series };
};
