'use client';

import { AreaChart, BarChart, LineChart } from '../Charts/Charts';
import type { Evaluator } from './formulas';
import type { SheetChart } from './sheet';
import { parseRange } from './sheetops';
import { chartModel } from './charts';

const VIEWS = { line: LineChart, bar: BarChart, area: AreaChart } as const;

export interface ChartStripProps {
	charts:    SheetChart[];
	evaluator: Evaluator;
	onRemove:  (id: string) => void;
}

const safeModel = (evaluator: Evaluator, text: string) => {
	try
	{
		return chartModel(evaluator, parseRange(text));
	}
	catch
	{
		return null;
	}
};

export const ChartStrip = ({ charts, evaluator, onRemove }: ChartStripProps) => (
	<div role='region' aria-label='Charts' className='flex shrink-0 gap-3 overflow-x-auto border-t-[length:var(--border-width)] border-surface-border p-3'>
		{charts.map(chart =>
		{
			const model = safeModel(evaluator, chart.range);
			const View = VIEWS[chart.type];
			return (
				<figure key={chart.id} className='m-0 w-80 shrink-0 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border p-2'>
					<figcaption className='mb-1 flex items-center justify-between text-xs text-text-muted'>
						<span>{chart.range}</span>
						<button
							type='button'
							aria-label={`Remove chart ${chart.range}`}
							className='rounded-[var(--radius-sm)] px-1.5 text-sm text-text hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring'
							onClick={() => onRemove(chart.id)}
						>
							×
						</button>
					</figcaption>
					{model && model.data.length ? (
						<View data={model.data} xKey='label' series={model.series} height={180} />
					) : (
						<p className='py-8 text-center text-sm text-text-muted'>No data in {chart.range}</p>
					)}
				</figure>
			);
		})}
	</div>
);
