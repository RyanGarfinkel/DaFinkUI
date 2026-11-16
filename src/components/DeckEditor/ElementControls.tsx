'use client';

import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup';
import { ColorField, NumberField, Section } from './fields';
import { ICON_ELEMENT_NAMES } from './glyphs';
import { FontSelect } from './FormatToolbar';
import type { DeckElement } from './deck';
import type { ChangeEvent } from 'react';
import Button from '../Button/Button';
import Switch from '../Switch/Switch';
import Input from '../Input/Input';
import { Glyph } from './icons';

type Patch = (patch: Partial<DeckElement>, coalesceKey?: string) => void;
type Of<T extends DeckElement['type']> = Extract<DeckElement, { type: T }>;

const ShapeControls = ({ element, onPatch }: { element: Of<'shape'>; onPatch: Patch }) => (
	<Section title='Shape'>
		<ToggleGroup type='single' size='sm' aria-label='Shape' value={element.shape} onValueChange={v => onPatch({ shape: v as Of<'shape'>['shape'] })}>
			<ToggleGroupItem value='rect'>Rectangle</ToggleGroupItem>
			<ToggleGroupItem value='ellipse'>Ellipse</ToggleGroupItem>
		</ToggleGroup>
		<ColorField label='Fill' value={element.fill} emptyText='Theme' onChange={fill => onPatch({ fill }, 'fill')} onReset={() => onPatch({ fill: '' })} />
		{element.shape === 'rect' && <NumberField label='Corner radius' value={element.radius} min={0} onChange={radius => onPatch({ radius }, 'radius')} />}
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
		<Section title='Image'>
			<Input label='Image URL' value={element.src.startsWith('data:') ? '' : element.src} placeholder='https://…' onChange={e => onPatch({ src: e.target.value }, 'src')} className='px-2 py-1.5' />
			<label className='flex cursor-pointer items-center justify-center rounded-[var(--radius)] border-[length:var(--border-width)] border-dashed border-input-border px-3 py-2 text-sm text-text-muted hover:border-input-border-hover hover:text-text focus-within:ring-2 focus-within:ring-brand-ring'>
				Upload from device
				<input type='file' accept='image/*' onChange={upload} className='sr-only' />
			</label>
			<Input label='Alt text' value={element.alt} onChange={e => onPatch({ alt: e.target.value }, 'alt')} className='px-2 py-1.5' />
			<ToggleGroup type='single' size='sm' aria-label='Fit' value={element.fit} onValueChange={v => onPatch({ fit: v as Of<'image'>['fit'] })}>
				<ToggleGroupItem value='cover'>Fill</ToggleGroupItem>
				<ToggleGroupItem value='contain'>Fit</ToggleGroupItem>
			</ToggleGroup>
		</Section>
	);
};

const IconControls = ({ element, onPatch }: { element: Of<'icon'>; onPatch: Patch }) => (
	<Section title='Icon'>
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

const TableControls = ({ element, onPatch }: { element: Of<'table'>; onPatch: Patch }) => {
	const { rows } = element;
	const columns = rows[0]?.length ?? 0;

	return (
		<Section title='Table'>
			<FontSelect value={element.font} onChange={font => onPatch({ font })} />
			<Switch label='Header row' checked={element.header} onCheckedChange={header => onPatch({ header })} />
			<div className='grid grid-cols-2 gap-2'>
				<Button variant='outlined' size='sm' onClick={() => onPatch({ rows: [...rows, Array(columns).fill('')] })}>Add row</Button>
				<Button variant='outlined' size='sm' disabled={rows.length <= 1} onClick={() => onPatch({ rows: rows.slice(0, -1) })}>Remove row</Button>
				<Button variant='outlined' size='sm' onClick={() => onPatch({ rows: rows.map(r => [...r, '']) })}>Add column</Button>
				<Button variant='outlined' size='sm' disabled={columns <= 1} onClick={() => onPatch({ rows: rows.map(r => r.slice(0, -1)) })}>Remove column</Button>
			</div>
			<p className='text-sm text-text-muted'>Double-click the table or press Enter to edit cells.</p>
		</Section>
	);
};

const ChartControls = ({ element, onPatch }: { element: Of<'chart'>; onPatch: Patch }) => {
	const setRow = (index: number, patch: Partial<Of<'chart'>['data'][number]>) =>
		onPatch({ data: element.data.map((row, i) => (i === index ? { ...row, ...patch } : row)) }, `data-${index}`);

	return (
		<Section title='Chart'>
			<ToggleGroup type='single' size='sm' aria-label='Chart type' value={element.chart} onValueChange={v => onPatch({ chart: v as Of<'chart'>['chart'] })}>
				<ToggleGroupItem value='bar'>Bar</ToggleGroupItem>
				<ToggleGroupItem value='line'>Line</ToggleGroupItem>
				<ToggleGroupItem value='area'>Area</ToggleGroupItem>
			</ToggleGroup>
			<Input label='Series name' value={element.seriesLabel} onChange={e => onPatch({ seriesLabel: e.target.value }, 'seriesLabel')} className='px-2 py-1.5' />
			<div className='flex flex-col gap-2'>
				{element.data.map((row, i) => (
					<div key={i} className='flex items-center gap-2'>
						<Input aria-label={`Label ${i + 1}`} value={row.label} onChange={e => setRow(i, { label: e.target.value })} className='px-2 py-1.5' />
						<Input aria-label={`Value ${i + 1}`} type='number' value={row.value} onChange={e => setRow(i, { value: Number(e.target.value) })} className='px-2 py-1.5 tabular-nums' />
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
		</Section>
	);
};

export const ElementControls = ({ element, onPatch }: { element: DeckElement; onPatch: Patch }) => {
	switch(element.type)
	{
	case 'text':
		return (
			<Section title='Text'>
				<FontSelect value={element.font} onChange={font => onPatch({ font })} />
				<p className='text-sm text-text-muted'>Format text from the toolbar above the text box. Double-click or press Enter to edit it, and Alt+F10 to reach the toolbar from the keyboard.</p>
			</Section>
		);
	case 'shape': return <ShapeControls element={element} onPatch={onPatch} />;
	case 'image': return <ImageControls element={element} onPatch={onPatch} />;
	case 'icon':  return <IconControls element={element} onPatch={onPatch} />;
	case 'table': return <TableControls element={element} onPatch={onPatch} />;
	case 'chart': return <ChartControls element={element} onPatch={onPatch} />;
	case 'line':
		return (
			<Section title='Line'>
				<ColorField label='Color' value={element.stroke} emptyText='Theme' onChange={stroke => onPatch({ stroke }, 'stroke')} onReset={() => onPatch({ stroke: '' })} />
				<NumberField label='Width' value={element.strokeWidth} min={1} max={40} onChange={strokeWidth => onPatch({ strokeWidth }, 'strokeWidth')} />
				<Switch label='Arrowhead' checked={element.arrow} onCheckedChange={arrow => onPatch({ arrow })} />
			</Section>
		);
	}
};
