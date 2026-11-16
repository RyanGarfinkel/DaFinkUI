'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table/Table';
import { AreaChart, BarChart, LineChart } from '../Charts/Charts';
import { TextElement } from './TextElement';
import { LineElement } from './LineElement';
import type { Editor } from '@tiptap/react';
import type { DeckElement } from './deck';
import { ElementGlyph } from './glyphs';
import { FONTS } from './themes';

interface ElementViewProps {
	element:         DeckElement;
	selected?:       boolean;
	editing:         boolean;
	onChange:        (patch: Partial<DeckElement>) => void;
	onEditorChange?: (editor: Editor, editing: boolean) => void;
	/** Show empty text boxes' placeholders (editors only; never in presenting, previews, or exports). */
	showPlaceholders?: boolean;
}

const CHARTS = { bar: BarChart, line: LineChart, area: AreaChart };

// Table cells ship with fixed app-UI sizes (text-sm/text-xs). On a slide they
// follow the element's fontSize instead: cells use 1em, headers 0.8em, and
// padding scales with the text.
const TABLE_SCALE = '[&_td]:text-[1em] [&_th]:text-[0.8em] [&_td]:px-[0.8em] [&_th]:px-[1em] [&_td]:py-[0.6em] [&_th]:py-[0.75em]';
const CHART_SCALE = '[&_.recharts-cartesian-axis-tick-value]:text-lg [&_.recharts-legend-item-text]:text-base';

const CELL_INPUT = 'w-full bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-brand-ring rounded-[var(--radius-sm)]';

export const ElementView = ({ element, selected = false, editing, onChange, onEditorChange, showPlaceholders = false }: ElementViewProps) => {
	switch(element.type)
	{
	case 'text':
		return (
			<TextElement
				html={element.html}
				fontSize={element.fontSize}
				font={element.font && FONTS[element.font].stack}
				color={element.color}
				bold={element.bold}
				placeholder={showPlaceholders ? element.placeholder : undefined}
				selected={selected}
				editing={editing}
				onChange={(html, height) => onChange(height > element.height ? { html, height } : { html })}
				onEditorChange={(editor, active) => onEditorChange?.(editor, active)}
			/>
		);

	case 'shape':
		return (
			<div
				className='h-full w-full'
				style={{
					background:   element.fill || 'var(--color-brand)',
					borderRadius: element.shape === 'ellipse' ? '50%' : element.radius,
				}}
			/>
		);

	case 'image':
		if(!element.src)
		{
			return (
				<div className='flex h-full w-full flex-col items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-dashed border-input-border text-xl text-text-muted'>
					<ElementGlyph name='image' size={48} />
					Add an image in the inspector
				</div>
			);
		}

		return (
			// eslint-disable-next-line @next/next/no-img-element -- slide images are user-supplied URLs or data URIs, not optimizable static assets
			<img src={element.src} alt={element.alt} draggable={false} className='h-full w-full' style={{ objectFit: element.fit }} />
		);

	case 'icon':
		return <ElementGlyph name={element.icon} size='100%' style={{ color: element.color || 'var(--color-brand)' }} />;

	case 'line':
		return <LineElement element={element} />;

	case 'table': {
		const head = element.header ? element.rows[0] : null;
		const body = element.header ? element.rows.slice(1) : element.rows;
		const offset = element.header ? 1 : 0;
		const setCell = (row: number, col: number, value: string) =>
			onChange({ rows: element.rows.map((r, ri) => (ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r)) });
		const cell = (value: string, row: number, col: number) => (editing
			? <input aria-label={`Row ${row + 1}, column ${col + 1}`} value={value} onChange={e => setCell(row, col, e.target.value)} className={CELL_INPUT} />
			: value);

		return (
			<div className={`h-full w-full overflow-hidden bg-surface ${TABLE_SCALE}`} style={{ fontSize: element.fontSize, fontFamily: element.font && FONTS[element.font].stack }}>
				<Table>
					{head && (
						<TableHead>
							<TableRow header>
								{head.map((value, col) => <TableHeader key={col}>{cell(value, 0, col)}</TableHeader>)}
							</TableRow>
						</TableHead>
					)}
					<TableBody>
						{body.map((row, ri) => (
							<TableRow key={ri}>
								{row.map((value, col) => <TableCell key={col}>{cell(value, ri + offset, col)}</TableCell>)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	case 'chart': {
		const Chart = CHARTS[element.chart];
		return (
			<div className={`h-full w-full ${CHART_SCALE}`}>
				<Chart
					data={element.data.map(row => ({ label: row.label, value: row.value }))}
					xKey='label'
					series={[{ key: 'value', label: element.seriesLabel }]}
					height={element.height}
				/>
			</div>
		);
	}
	}
};
