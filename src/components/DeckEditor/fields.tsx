'use client';

import { ColorButton } from './FormatToolbar';
import { themeColorLabel } from './themes';
import type { ReactNode } from 'react';
import Input from '../Input/Input';

interface ColorFieldProps {
	label:      string;
	value:      string;
	onChange:   (hex: string) => void;
	onReset?:   () => void;
	/** Shown when value is empty, meaning "use the theme default". */
	emptyText?: string;
}

export const ColorField = ({ label, value, onChange, onReset, emptyText = 'Default' }: ColorFieldProps) => (
	<div className='flex items-center justify-between gap-2'>
		<span className='text-sm text-text-muted'>{label}</span>
		<ColorButton label={label} value={value} onChange={onChange} onReset={value ? onReset : undefined}>
			<span
				aria-hidden='true'
				className={`h-4 w-4 rounded-full border-[length:var(--border-width)] border-input-border ${value ? '' : 'bg-surface'}`}
				style={value ? { background: value } : undefined}
			/>
			<span className={`text-xs ${themeColorLabel(value) ? '' : 'font-mono uppercase'}`}>{themeColorLabel(value) ?? (value || emptyText)}</span>
		</ColorButton>
	</div>
);

interface NumberFieldProps {
	label:    string;
	value:    number;
	onChange: (value: number) => void;
	min?:     number;
	max?:     number;
}

export const NumberField = ({ label, value, onChange, min, max }: NumberFieldProps) => (
	<Input
		label={label}
		type='number'
		value={Math.round(value)}
		min={min}
		max={max}
		onChange={e => e.target.value !== '' && onChange(Number(e.target.value))}
		className='px-2 py-1.5 tabular-nums'
	/>
);

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className='flex flex-col gap-3 border-b border-surface-border p-4 last:border-b-0'>
		<h3 className='text-xs font-semibold uppercase tracking-wide text-text-muted'>{title}</h3>
		{children}
	</section>
);
