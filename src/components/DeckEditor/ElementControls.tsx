'use client';

import type { ChartData, ChartSource, DeckElement, ResolvedChart, SheetChoice, VerticalAlign } from './deck';
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup';
import { ColorField, NumberInput, Row, Section } from './fields';
import { FontSelect, StyleSelect } from './FormatToolbar';
import { ICON_ELEMENT_NAMES } from './glyphs';
import Textarea from '../Textarea/Textarea';
import type { ChangeEvent } from 'react';
import Select from '../Select/Select';
import Button from '../Button/Button';
import Switch from '../Switch/Switch';
import Input from '../Input/Input';
import { checkSvg } from './svg';
import { Glyph } from './icons';

type Patch = (patch: Partial<DeckElement>, coalesceKey?: string) => void;
type Of<T extends DeckElement['type']> = Extract<DeckElement, { type: T }>;

const FIELD = 'h-8 px-2 py-0';

const ShapeControls = ({ element, onPatch, themeRadius }: { element: Of<'shape'>; onPatch: Patch; themeRadius: number }) => (
	<Section title='Shape' collapsible defaultOpen>
		<Row label='Shape'>
			<ToggleGroup type='single' size='sm' aria-label='Shape' value={element.shape} onValueChange={v => onPatch({ shape: v as Of<'shape'>['shape'] })} className='w-full [&>*]:flex-1'>
				<ToggleGroupItem value='rect'>Rectangle</ToggleGroupItem>
				<ToggleGroupItem value='ellipse'>Ellipse</ToggleGroupItem>
			</ToggleGroup>
		</Row>
		<ColorField label='Fill' value={element.fill} emptyText='Theme' onChange={fill => onPatch({ fill }, 'fill')} onReset={() => onPatch({ fill: '' })} />
		{element.shape === 'rect' && (
			<Row label='Radius' action={element.radius !== undefined && <Button variant='outlined' size='sm' onClick={() => onPatch({ radius: undefined })}>Use theme</Button>}>
				<NumberInput label='Corner radius' suffix='px' value={element.radius ?? themeRadius} min={0} onChange={radius => onPatch({ radius }, 'radius')} />
			</Row>
		)}
	</Section>
);

const ImageControls = ({ element, onPatch }: { element: Of<'image'>; onPatch: Patch }) => {
	const upload = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if(!file) return;
		const reader = new FileReader();
		reader.onload = () => onPatch({ src: reader.result as string, alt: element.alt || file.name });
		reader.readAsDataURL(file);
	};

	return (
		<Section title='Image' collapsible defaultOpen>
			<Row label='Source'>
				<Input aria-label='Image URL' value={element.src.startsWith('data:') ? '' : element.src} placeholder='https://…' onChange={e => onPatch({ src: e.target.value }, 'src')} className={FIELD} />
			</Row>
			<Row label='Upload'>
				<label className='flex h-8 cursor-pointer items-center justify-center rounded-[var(--radius)] border-[length:var(--border-width)] border-dashed border-input-border px-3 text-xs text-text-muted hover:border-input-border-hover hover:text-text focus-within:ring-2 focus-within:ring-brand-ring'>
					Upload from device
					<input type='file' accept='image/*' onChange={upload} className='sr-only' />
				</label>
			</Row>
			<Row label='Alt text'>
				<Input aria-label='Alt text' value={element.alt} onChange={e => onPatch({ alt: e.target.value }, 'alt')} className={FIELD} />
			</Row>
			<Row label='Fit'>
				<ToggleGroup type='single' size='sm' aria-label='Fit' value={element.fit} onValueChange={v => onPatch({ fit: v as Of<'image'>['fit'] })} className='w-full [&>*]:flex-1'>
					<ToggleGroupItem value='cover'>Fill</ToggleGroupItem>
					<ToggleGroupItem value='contain'>Fit</ToggleGroupItem>
				</ToggleGroup>
			</Row>
		</Section>
	);
};

const SvgControls = ({ element, onPatch }: { element: Of<'svg'>; onPatch: Patch }) => (
	<Section title='SVG' collapsible defaultOpen>
		<Textarea
			label='SVG code'
			value={element.svg}
			rows={8}
			spellCheck={false}
			error={checkSvg(element.svg) ?? undefined}
			onChange={e => onPatch({ svg: e.target.value }, 'svg')}
			className='resize-y font-mono text-xs'
		/>
		<ColorField label='Color' value={element.color} emptyText='Theme' onChange={color => onPatch({ color }, 'color')} onReset={() => onPatch({ color: '' })} />
	</Section>
);

const IconControls = ({ element, onPatch }: { element: Of<'icon'>; onPatch: Patch }) => (
	<Section title='Icon' collapsible defaultOpen>
		<ToggleGroup type='single' size='sm' aria-label='Icon' value={element.icon} onValueChange={v => onPatch({ icon: v as Of<'icon'>['icon'] })} className='flex-wrap'>
			{ICON_ELEMENT_NAMES.map(name => (
				<ToggleGroupItem key={name} value={name} aria-label={name}>
					<Glyph name={name} />
				</ToggleGroupItem>
			))}
		</ToggleGroup>
		<ColorField label='Color' value={element.color} emptyText='Theme' onChange={color => onPatch({ color }, 'color')} onReset={() => onPatch({ color: '' })} />
	</Section>
);

const MAX_TABLE_ROWS = 50;
const MAX_TABLE_COLUMNS = 20;

const TableControls = ({ element, onPatch }: { element: Of<'table'>; onPatch: Patch }) => {
	const { rows } = element;
	const columns = rows[0]?.length ?? 0;

	const resize = (rowCount: number, columnCount: number) =>
		onPatch({ rows: Array.from({ length: rowCount }, (_, r) => Array.from({ length: columnCount }, (_, c) => rows[r]?.[c] ?? '')) }, 'table-size');

	return (
		<Section title='Table' collapsible defaultOpen>
			<Row label='Font'><FontSelect inline value={element.font} onChange={font => onPatch({ font })} /></Row>
			<Row label='Header row'>
				<Switch aria-label='Header row' checked={element.header} onCheckedChange={header => onPatch({ header })} />
			</Row>
			<Row label='Rows'>
				<NumberInput label='Rows' value={rows.length} min={1} max={MAX_TABLE_ROWS} onChange={count => resize(Math.min(MAX_TABLE_ROWS, Math.max(1, count)), columns)} />
			</Row>
			<Row label='Columns'>
				<NumberInput label='Columns' value={columns} min={1} max={MAX_TABLE_COLUMNS} onChange={count => resize(rows.length, Math.min(MAX_TABLE_COLUMNS, Math.max(1, count)))} />
			</Row>
		</Section>
	);
};

const DEFAULT_SOURCE_RANGE = 'A1:B5';

interface ChartControlsProps {
	element:             Of<'chart'>;
	onPatch:             Patch;
	chartData?:          ChartData;
}

const TYPED_IN = '';

interface SheetRangeProps {
	source:   ChartSource;
	sheet:    SheetChoice | undefined;
	resolved: ResolvedChart | null | undefined;
	onChange: (source: ChartSource) => void;
}

const SheetRange = ({ source, sheet, resolved, onChange }: SheetRangeProps) => {
	const problem = !sheet ? 'This sheet is no longer in the chat.' : !resolved ? 'Can’t read that range.' : !resolved.data.length ? 'No data in that range.' : '';
	const points = resolved?.data.length;

	return (
		<Row label='Range'>
			<Input
				aria-label='Range'
				value={source.range}
				onChange={e => onChange({ ...source, range: e.target.value.toUpperCase() })}
				error={problem || undefined}
				hint={problem ? undefined : `${points} data point${points === 1 ? '' : 's'}`}
				className={`${FIELD} font-mono`}
			/>
		</Row>
	);
};

const ChartControls = ({ element, onPatch, chartData }: ChartControlsProps) => {
	const sheets = chartData?.sheets;
	const { source } = element;
	const sheet = source && sheets?.find(s => s.id === source.sheetId);
	const resolved = source && sheet ? chartData?.resolve(source) : null;
	const setRow = (index: number, patch: Partial<Of<'chart'>['data'][number]>) =>
		onPatch({ data: element.data.map((row, i) => (i === index ? { ...row, ...patch } : row)) }, `data-${index}`);

	return (
		<Section title='Chart' collapsible defaultOpen>
			<Row label='Type'>
				<ToggleGroup type='single' size='sm' aria-label='Chart type' value={element.chart} onValueChange={v => onPatch({ chart: v as Of<'chart'>['chart'] })} className='w-full [&>*]:flex-1'>
					<ToggleGroupItem value='bar'>Bar</ToggleGroupItem>
					<ToggleGroupItem value='line'>Line</ToggleGroupItem>
					<ToggleGroupItem value='area'>Area</ToggleGroupItem>
				</ToggleGroup>
			</Row>
			{sheets && (
				<Row label='Data'>
					<Select
						size='sm'
						aria-label='Data'
						placeholder='Choose a sheet'
						hint={sheets.length ? undefined : 'Ask the AI for a spreadsheet to chart its data.'}
						options={[{ value: TYPED_IN, label: 'Typed in' }, ...sheets.map(s => ({ value: s.id, label: s.title }))]}
						value={!source ? TYPED_IN : sheet?.id}
						onChange={value => onPatch({ source: value === TYPED_IN ? undefined : { sheetId: value, range: source?.range ?? DEFAULT_SOURCE_RANGE } })}
					/>
				</Row>
			)}
			{source && sheets && <SheetRange source={source} sheet={sheet} resolved={resolved} onChange={next => onPatch({ source: next }, 'source')} />}
			{!source && (
				<Row label='Series'>
					<Input aria-label='Series name' value={element.seriesLabel} onChange={e => onPatch({ seriesLabel: e.target.value }, 'seriesLabel')} className={FIELD} />
				</Row>
			)}
			{!source && (
				<div className='flex flex-col gap-2'>
					{element.data.map((row, i) => (
						<div key={i} className='flex items-center gap-2'>
							<Input aria-label={`Label ${i + 1}`} value={row.label} onChange={e => setRow(i, { label: e.target.value })} className={FIELD} />
							<Input aria-label={`Value ${i + 1}`} type='number' value={row.value} onChange={e => setRow(i, { value: Number(e.target.value) })} className={`${FIELD} tabular-nums`} />
							<Button
								variant='ghost'
								size='icon-sm'
								aria-label={`Remove ${row.label || `row ${i + 1}`}`}
								disabled={element.data.length <= 1}
								onClick={() => onPatch({ data: element.data.filter((_, j) => j !== i) })}
							>
								<Glyph name='close' />
							</Button>
						</div>
					))}
					<Button variant='outlined' size='sm' onClick={() => onPatch({ data: [...element.data, { label: '', value: 0 }] })}>Add data point</Button>
				</div>
			)}
		</Section>
	);
};

export const ElementControls = ({ element, onPatch, themeRadius, chartData }: { element: DeckElement; onPatch: Patch; themeRadius: number; chartData?: ChartData }) => {
	switch(element.type)
	{
	case 'text':
		return (
			<Section title='Text' collapsible defaultOpen>
				<Row label='Text style'><StyleSelect inline value={element.style} onChange={patch => onPatch(patch)} /></Row>
				<Row label='Font'><FontSelect inline value={element.font} onChange={font => onPatch({ font })} /></Row>
				<Row label='Size'>
					<NumberInput label='Font size' suffix='px' value={element.fontSize} min={8} max={240} onChange={fontSize => onPatch({ fontSize }, 'fontSize')} />
				</Row>
				<ColorField label='Color' value={element.color} emptyText='Theme' onChange={color => onPatch({ color }, 'color')} onReset={() => onPatch({ color: '' })} />
				<Row label='Align'>
					<ToggleGroup type='single' size='sm' aria-label='Vertical alignment' value={element.valign ?? 'top'} onValueChange={v => v && onPatch({ valign: v as VerticalAlign })} className='w-full [&>*]:flex-1'>
						<ToggleGroupItem value='top' aria-label='Align top'><Glyph name='alignTop' /></ToggleGroupItem>
						<ToggleGroupItem value='middle' aria-label='Align middle'><Glyph name='alignMiddle' /></ToggleGroupItem>
						<ToggleGroupItem value='bottom' aria-label='Align bottom'><Glyph name='alignBottom' /></ToggleGroupItem>
					</ToggleGroup>
				</Row>
			</Section>
		);
	case 'shape': return <ShapeControls element={element} onPatch={onPatch} themeRadius={themeRadius} />;
	case 'image': return <ImageControls element={element} onPatch={onPatch} />;
	case 'icon':  return <IconControls element={element} onPatch={onPatch} />;
	case 'svg':   return <SvgControls element={element} onPatch={onPatch} />;
	case 'table': return <TableControls element={element} onPatch={onPatch} />;
	case 'chart': return <ChartControls element={element} onPatch={onPatch} chartData={chartData} />;
	case 'line':
		return (
			<Section title='Line' collapsible defaultOpen>
				<ColorField label='Color' value={element.stroke} emptyText='Theme' onChange={stroke => onPatch({ stroke }, 'stroke')} onReset={() => onPatch({ stroke: '' })} />
				<Row label='Width'>
					<NumberInput label='Line width' suffix='px' value={element.strokeWidth} min={1} max={40} onChange={strokeWidth => onPatch({ strokeWidth }, 'strokeWidth')} />
				</Row>
				<Row label='Arrowhead'>
					<Switch aria-label='Arrowhead' checked={element.arrow} onCheckedChange={arrow => onPatch({ arrow })} />
				</Row>
			</Section>
		);
	}
};
