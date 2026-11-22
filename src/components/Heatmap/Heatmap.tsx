'use client';

import { HTMLAttributes } from 'react';

export interface HeatmapProps extends HTMLAttributes<HTMLDivElement> {
	/** One array per row. `null` marks a cell with no data. */
	data:          (number | null)[][];
	rowLabels?:    string[];
	columnLabels?: string[];
	/** Value shaded as the lightest cell. Defaults to the smallest value in `data`. */
	min?:          number;
	/** Value shaded as the darkest cell. Defaults to the largest value in `data`. */
	max?:          number;
	/** Prints each value inside its cell. */
	showValues?:   boolean;
	formatValue?:  (value: number) => string;
	showLegend?:   boolean;
	/** Accessible name of the table. */
	label?:        string;
}

const MIN_FILL = 8;
const MAX_FILL = 85;

const fillFor = (intensity: number) => `color-mix(in srgb, var(--color-brand) ${MIN_FILL + intensity * (MAX_FILL - MIN_FILL)}%, var(--color-surface))`;

const defaultFormat = (value: number) => String(Math.round(value * 100) / 100);

export const Heatmap = ({
	data,
	rowLabels,
	columnLabels,
	min,
	max,
	showValues = false,
	formatValue = defaultFormat,
	showLegend = true,
	label = 'Heatmap',
	className = '',
	...props
}: HeatmapProps) => {
	const values = data.flat().filter((v): v is number => v !== null);
	const low = min ?? Math.min(...values);
	const high = max ?? Math.max(...values);
	const span = high - low;
	const intensityOf = (value: number) => (span > 0 ? Math.min(1, Math.max(0, (value - low) / span)) : 0.5);
	const hasData = values.length > 0;

	return (
		<div {...props} className={`flex w-full flex-col gap-3 ${className}`}>
			<div className='overflow-x-auto'>
				<table aria-label={label} className='mx-auto border-separate border-spacing-1 text-xs text-text-muted'>
					{columnLabels && (
						<thead>
							<tr>
								{rowLabels && <td />}
								{columnLabels.map((column) => (
									<th key={column} scope='col' className='px-1 pb-1 text-center font-normal'>{column}</th>
								))}
							</tr>
						</thead>
					)}
					<tbody>
						{data.map((row, r) => (
							<tr key={rowLabels?.[r] ?? r}>
								{rowLabels && <th scope='row' className='whitespace-nowrap pr-2 text-right font-normal'>{rowLabels[r]}</th>}
								{row.map((value, c) =>
								{
									const name = [rowLabels?.[r], columnLabels?.[c]].filter(Boolean).join(', ');
									return value === null ? (
										<td key={c} title={name && `${name}: no data`} className='h-8 min-w-8 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-dashed border-surface-border text-center'>
											<span className='sr-only'>No data</span>
										</td>
									) : (
										<td
											key={c}
											title={name && `${name}: ${formatValue(value)}`}
											style={{ background: fillFor(intensityOf(value)) }}
											className='h-8 min-w-8 rounded-[var(--radius-sm)] text-center'
										>
											{showValues ? (
												<span className='rounded-[var(--radius-sm)] bg-surface px-1 text-text tabular-nums'>{formatValue(value)}</span>
											) : (
												<span className='sr-only'>{formatValue(value)}</span>
											)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{showLegend && hasData && (
				<div className='flex items-center justify-center gap-2 text-xs text-text-muted' aria-hidden='true'>
					<span className='tabular-nums'>{formatValue(low)}</span>
					<span className='h-2 w-32 rounded-full' style={{ background: `linear-gradient(to right, ${fillFor(0)}, ${fillFor(1)})` }} />
					<span className='tabular-nums'>{formatValue(high)}</span>
				</div>
			)}
		</div>
	);
};

export default Heatmap;
