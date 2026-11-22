'use client';

import type { Align, CellStyle, ChartType, NumberFormat, VAlign } from './sheet';
import { FORMAT_OPTIONS, isPresetFormat } from './format';
import { KeyboardEvent, useState } from 'react';
import { FormatDialog } from './FormatDialog';
import { Popover } from '../Popover/Popover';
import { CustomColor } from './CustomColor';
import type { GlyphName } from './icons';
import type { BorderMode } from './ops';
import Select from '../Select/Select';
import { Menu } from '../Menu/Menu';
import { Glyph } from './icons';

/** The toolbar's button style, for host actions passed in `toolbarEnd` to match. */
export const TOOLBAR_BUTTON = [
	'inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-[var(--radius-sm)] px-2 text-sm text-text',
	'hover:bg-surface-hover motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
	'disabled:opacity-40 disabled:pointer-events-none',
].join(' ');

const TEXT_SWATCHES = ['#18181b', '#71717a', '#dc2626', '#d97706', '#16a34a', '#0891b2', '#4f46e5', '#db2777'];
const FILL_SWATCHES = ['#ffffff', '#f4f4f5', '#fee2e2', '#fef3c7', '#dcfce7', '#cffafe', '#e0e7ff', '#fce7f3'];

const ALIGNS: { value: Align; icon: GlyphName; label: string }[] = [
	{ value: 'left', icon: 'alignLeft', label: 'Align left' },
	{ value: 'center', icon: 'alignCenter', label: 'Align center' },
	{ value: 'right', icon: 'alignRight', label: 'Align right' },
];

const VALIGNS: { value: VAlign; icon: GlyphName; label: string }[] = [
	{ value: 'top', icon: 'alignTop', label: 'Align top' },
	{ value: 'middle', icon: 'alignMiddle', label: 'Align middle' },
	{ value: 'bottom', icon: 'alignBottom', label: 'Align bottom' },
];

export type Download = 'csv' | 'tsv';

export interface ToolbarProps {
	style:        CellStyle;
	sample:       number;
	rowCount:    number;
	colCount:     number;
	onStyle:      (patch: CellStyle) => void;
	onInsert:    (axis: 'row' | 'col', after: boolean) => void;
	onDelete:     (axis: 'row' | 'col') => void;
	onBorder:     (mode: BorderMode) => void;
	onChart:      (type: ChartType) => void;
	onCut:        () => void;
	onCopy:       () => void;
	onPaste:      () => void;
	onClear:      () => void;
	onAsk?:       () => void;
}

const Divider = () => <span aria-hidden='true' className='mx-1 h-5 w-px bg-surface-border' />;

export const handleToolbarKeys = (e: KeyboardEvent<HTMLDivElement>) => {
	if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
	if(e.target instanceof HTMLInputElement) return;
	const controls = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])')];
	const index = controls.indexOf(e.target as HTMLElement);
	if(index < 0) return;
	e.preventDefault();
	controls[(index + (e.key === 'ArrowRight' ? 1 : -1) + controls.length) % controls.length]?.focus();
};

interface ToggleProps {
	icon:    GlyphName;
	label:   string;
	pressed: boolean;
	onPress: () => void;
}

const Toggle = ({ icon, label, pressed, onPress }: ToggleProps) => (
	<button
		type='button'
		aria-label={label}
		title={label}
		aria-pressed={pressed}
		className={`${TOOLBAR_BUTTON} ${pressed ? 'bg-surface-active' : ''}`}
		onClick={onPress}
	>
		<Glyph name={icon} />
	</button>
);

interface ColorMenuProps {
	icon:      GlyphName;
	label:     string;
	value?:    string;
	swatches:  string[];
	onChange:  (color: string | undefined) => void;
}

const ColorMenu = ({ icon, label, value, swatches, onChange }: ColorMenuProps) => (
	<Popover
		label={label}
		side='top'
		align='start'
		unstyledTrigger
		triggerClassName={TOOLBAR_BUTTON}
		triggerProps={{ 'aria-label': label, title: label }}
		trigger={
			<span className='flex flex-col items-center gap-0.5'>
				<Glyph name={icon} size={14} />
				<span aria-hidden='true' className='h-0.5 w-4 rounded-full border-[length:var(--border-width)] border-input-border' style={{ background: value ?? 'transparent' }} />
			</span>
		}
		className='min-w-0 p-2'
	>
		{close => (
			<div className='flex flex-col gap-2'>
				<div role='group' aria-label={label} className='grid grid-cols-4 gap-1.5'>
					{swatches.map(color => (
						<button
							key={color}
							type='button'
							aria-label={color}
							aria-pressed={value === color}
							className='h-6 w-6 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-input-border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring aria-pressed:ring-2 aria-pressed:ring-brand-ring'
							style={{ background: color }}
							onClick={() =>
							{
								onChange(color);
								close();
							}}
						/>
					))}
				</div>
				<CustomColor
					value={value}
					onApply={color =>
					{
						onChange(color);
						close();
					}}
				/>
				<button
					type='button'
					className='rounded-[var(--radius-sm)] px-2 py-1 text-left text-sm text-text hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring'
					onClick={() =>
					{
						onChange(undefined);
						close();
					}}
				>
					Reset
				</button>
			</div>
		)}
	</Popover>
);

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const BORDER_ITEMS: { mode: BorderMode; label: string }[] = [
	{ mode: 'all', label: 'All borders' },
	{ mode: 'outer', label: 'Outer borders' },
	{ mode: 'top', label: 'Top border' },
	{ mode: 'bottom', label: 'Bottom border' },
	{ mode: 'left', label: 'Left border' },
	{ mode: 'right', label: 'Right border' },
];

const CHART_ITEMS: { type: ChartType; label: string }[] = [
	{ type: 'line', label: 'Line chart' },
	{ type: 'bar', label: 'Bar chart' },
	{ type: 'area', label: 'Area chart' },
];

export const Toolbar = ({
	style, sample, rowCount, colCount, onStyle, onInsert, onDelete, onBorder, onChart, onCut, onCopy, onPaste, onClear, onAsk,
}: ToolbarProps) => {
	const [formatOpen, setFormatOpen] = useState(false);
	const customPattern = style.format && !isPresetFormat(style.format) ? style.format : '';

	return (
	<>
	<div
		role='toolbar'
		aria-label='Sheet formatting'
		onKeyDown={handleToolbarKeys}
		className='absolute bottom-3 left-1/2 z-40 flex w-max max-w-[calc(100%-1.5rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-0.5 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-1 shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]'
	>
		<Toggle icon='bold' label='Bold' pressed={!!style.bold} onPress={() => onStyle({ bold: style.bold ? undefined : true })} />
		<Toggle icon='italic' label='Italic' pressed={!!style.italic} onPress={() => onStyle({ italic: style.italic ? undefined : true })} />
		<ColorMenu icon='textColor' label='Text color' value={style.color} swatches={TEXT_SWATCHES} onChange={color => onStyle({ color })} />
		<ColorMenu icon='fill' label='Fill color' value={style.fill} swatches={FILL_SWATCHES} onChange={fill => onStyle({ fill })} />
		<Divider />
		{ALIGNS.map(({ value, icon, label }) => (
			<Toggle key={value} icon={icon} label={label} pressed={style.align === value} onPress={() => onStyle({ align: style.align === value ? undefined : value })} />
		))}
		<Divider />
		{VALIGNS.map(({ value, icon, label }) => (
			<Toggle key={value} icon={icon} label={label} pressed={style.valign === value} onPress={() => onStyle({ valign: style.valign === value ? undefined : value })} />
		))}
		<Divider />
		<div className='w-32 shrink-0'>
			<Select
				size='sm'
				side='top'
				aria-label='Number format'
				options={[...FORMAT_OPTIONS, { value: 'custom', label: 'Custom…' }]}
				value={customPattern ? 'custom' : (style.format ?? 'general')}
				onChange={value =>
				{
					if(value === 'custom') setFormatOpen(true);
					else onStyle({ format: value === 'general' ? undefined : (value as NumberFormat) });
				}}
			/>
		</div>
		<Menu
			side='top'
			align='start'
			unstyledTrigger
			triggerClassName={TOOLBAR_BUTTON}
			triggerProps={{ 'aria-label': 'Borders', title: 'Borders' }}
			trigger={<Glyph name='borders' />}
			items={[
				...BORDER_ITEMS.map(({ mode, label }) => ({ label, onSelect: () => onBorder(mode) })),
				{ separator: true },
				{ label: 'Clear borders', onSelect: () => onBorder('none') },
			]}
		/>
		<Menu
			side='top'
			align='start'
			unstyledTrigger
			triggerClassName={TOOLBAR_BUTTON}
			triggerProps={{ 'aria-label': 'Insert chart', title: 'Insert chart from the selection' }}
			trigger={<Glyph name='chart' />}
			items={CHART_ITEMS.map(({ type, label }) => ({ label, onSelect: () => onChart(type) }))}
		/>
		{onAsk && (
			<button type='button' aria-label='Ask AI' title='Ask AI about the selection' className={TOOLBAR_BUTTON} onClick={onAsk}>
				<Glyph name='lasso' />
			</button>
		)}
		<Menu
				side='top'
				align='end'
				unstyledTrigger
				triggerClassName={TOOLBAR_BUTTON}
				triggerProps={{ 'aria-label': 'More actions', title: 'More actions' }}
				trigger={<Glyph name='more' />}
				items={[
					{ label: 'Cut', detail: '⌘X', onSelect: onCut },
					{ label: 'Copy', detail: '⌘C', onSelect: onCopy },
					{ label: 'Paste', detail: '⌘V', onSelect: onPaste },
					{ label: 'Clear contents', detail: '⌫', onSelect: onClear },
					{ separator: true },
					{ label: `Insert ${plural(rowCount, 'row')} above`, onSelect: () => onInsert('row', false) },
					{ label: `Insert ${plural(rowCount, 'row')} below`, onSelect: () => onInsert('row', true) },
					{ label: `Insert ${plural(colCount, 'column')} left`, onSelect: () => onInsert('col', false) },
					{ label: `Insert ${plural(colCount, 'column')} right`, onSelect: () => onInsert('col', true) },
					{ separator: true },
					{ label: `Delete ${plural(rowCount, 'row')}`, onSelect: () => onDelete('row') },
					{ label: `Delete ${plural(colCount, 'column')}`, onSelect: () => onDelete('col') },
				]}
			/>
	</div>
	<FormatDialog
		open={formatOpen}
		onOpenChange={setFormatOpen}
		initial={customPattern}
		sample={sample}
		onApply={format => onStyle({ format })}
	/>
	</>
	);
};
