'use client';

import { DEFAULT_MARGIN, DEFAULT_RADIUS, FONT_OPTIONS } from './themes';
import type { CustomTheme, FontId, ThemeColors } from './themes';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { contrastRatio } from '../ColorPicker/color';
import { FontSelect } from './FormatToolbar';
import { NumberField } from './fields';
import Select from '../Select/Select';
import { useState } from 'react';
import { Glyph } from './icons';

type Slot = keyof ThemeColors;

const SLOTS: { slot: Slot; label: string }[] = [
	{ slot: 'background', label: 'Background' },
	{ slot: 'surface',    label: 'Surface' },
	{ slot: 'border',     label: 'Border' },
	{ slot: 'text',       label: 'Text' },
	{ slot: 'muted',      label: 'Muted text' },
	{ slot: 'accent',     label: 'Accent' },
];

// WCAG AA: 4.5:1 for text, 3:1 for non-text UI like the accent's charts and shapes.
const CHECKS: { slot: Slot; label: string; minimum: number }[] = [
	{ slot: 'text',   label: 'Text',       minimum: 4.5 },
	{ slot: 'muted',  label: 'Muted text', minimum: 4.5 },
	{ slot: 'accent', label: 'Accent',     minimum: 3 },
];

interface CustomThemeEditorProps {
	value:    CustomTheme;
	onChange: (theme: CustomTheme, coalesceKey?: string) => void;
}

/** One inline picker edits whichever color slot is chosen. Nested popovers would close the theme popover on the first click. */
export const CustomThemeEditor = ({ value, onChange }: CustomThemeEditorProps) => {
	const [slot, setSlot] = useState<Slot>('accent');

	const setColor = (hex: string) => onChange({ ...value, colors: { ...value.colors, [slot]: hex } }, `custom-${slot}`);

	const failures = CHECKS
		.map(check => ({ ...check, ratio: contrastRatio(value.colors[check.slot], value.colors.background) ?? 0 }))
		.filter(check => check.ratio < check.minimum);

	return (
		<div className='flex flex-col gap-3'>
			<div role='group' aria-label='Theme colors' className='grid grid-cols-2 gap-1.5'>
				{SLOTS.map(({ slot: id, label }) => (
					<button
						key={id}
						type='button'
						aria-pressed={slot === id}
						onClick={() => setSlot(id)}
						className={[
							'flex items-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-1 text-left text-xs text-text',
							slot === id ? 'bg-surface-active ring-1 ring-brand' : 'hover:bg-surface-hover',
							'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
						].join(' ')}
					>
						<span aria-hidden='true' className='h-4 w-4 shrink-0 rounded-full border-[length:var(--border-width)] border-input-border' style={{ background: value.colors[id] }} />
						<span className='truncate'>{label}</span>
					</button>
				))}
			</div>

			<ColorPicker
				label={SLOTS.find(s => s.slot === slot)?.label}
				value={value.colors[slot]}
				onValueChange={setColor}
				className='w-full'
			/>

			<FontSelect value={value.font} onChange={font => onChange({ ...value, font })} />
			<Select
				label='Heading font'
				size='sm'
				options={[{ value: 'body', label: 'Same as body' }, ...FONT_OPTIONS.filter(o => o.value !== 'theme')]}
				value={value.headingFont ?? 'body'}
				onChange={next => onChange({ ...value, headingFont: next === 'body' ? undefined : next as FontId })}
			/>
			<div className='grid grid-cols-2 gap-2'>
				<NumberField label='Corner radius' value={value.radius ?? DEFAULT_RADIUS} min={0} max={200} onChange={radius => onChange({ ...value, radius: Math.min(200, Math.max(0, radius)) }, 'custom-radius')} />
				<NumberField label='Margin' value={value.margin ?? DEFAULT_MARGIN} min={0} max={300} onChange={margin => onChange({ ...value, margin: Math.min(300, Math.max(0, margin)) }, 'custom-margin')} />
			</div>

			<div role='status' aria-live='polite'>
				{failures.length > 0 && (
					<ul className='flex flex-col gap-1 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-warning-border bg-warning-bg p-2 text-xs text-warning'>
						{failures.map(f => (
							<li key={f.slot} className='flex items-start gap-1.5'>
								<Glyph name='alert' size={14} className='mt-px shrink-0' />
								<span>
									{f.label} is {f.ratio.toFixed(1)}:1 against the background; aim for at least {f.minimum}:1.
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};
