'use client';

import { ColorButton } from './FormatToolbar';
import { themeColorLabel } from './themes';
import { useId, useState } from 'react';
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

interface RowProps {
	label:    string;
	children: ReactNode;
}

/** A setting laid out as a muted label on the left and its control on the right. */
export const Row = ({ label, children }: RowProps) => (
	<div className='grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-3'>
		<span className='truncate text-xs text-text-muted'>{label}</span>
		<div className='min-w-0'>{children}</div>
	</div>
);

export const ColorField = ({ label, value, onChange, onReset, emptyText = 'Default' }: ColorFieldProps) => (
	<Row label={label}>
		{/* Popover wraps its trigger in an inline span; this stretches it to the row. */}
		<div className='[&>span]:flex [&>span]:w-full'>
			<ColorButton field label={label} value={value} onChange={onChange} onReset={value ? onReset : undefined}>
				<span
					aria-hidden='true'
					className={`h-4 w-4 shrink-0 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-input-border ${value ? '' : 'bg-surface'}`}
					style={value ? { background: value } : undefined}
				/>
				<span className={`truncate text-xs ${themeColorLabel(value) ? '' : 'font-mono uppercase'}`}>{themeColorLabel(value) ?? (value || emptyText)}</span>
			</ColorButton>
		</div>
	</Row>
);

interface NumberInputProps {
	/** Accessible name; there is no visible label. */
	label:    string;
	value:    number;
	onChange: (value: number) => void;
	min?:     number;
	max?:     number;
	/** A short unit or axis shown at the right edge of the field, e.g. "px". */
	suffix?:  string;
	/** A short axis letter shown at the left edge of the field, e.g. "X". */
	prefix?:  string;
}

/** A compact numeric field for rows: no label above it, an optional unit or axis letter inside it. */
export const NumberInput = ({ label, value, onChange, min, max, suffix, prefix }: NumberInputProps) => (
	<div className='relative [&>div]:gap-0'>
		<Input
			aria-label={label}
			type='number'
			value={Math.round(value)}
			min={min}
			max={max}
			onChange={e => e.target.value !== '' && onChange(Number(e.target.value))}
			className={`h-8 py-0 tabular-nums ${prefix ? 'pl-6' : 'pl-2'} ${suffix ? 'pr-8' : 'pr-2'}`}
		/>
		{prefix && <span aria-hidden='true' className='pointer-events-none absolute left-2 top-0 flex h-8 items-center text-xs text-text-muted'>{prefix}</span>}
		{suffix && <span aria-hidden='true' className='pointer-events-none absolute right-2 top-0 flex h-8 items-center text-xs text-text-muted'>{suffix}</span>}
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

interface SectionProps {
	title:        string;
	children:     ReactNode;
	/** Adds a header that shows and hides the section. */
	collapsible?: boolean;
	/** For collapsible sections: start open. */
	defaultOpen?: boolean;
}

const SECTION_BODY = 'flex flex-col gap-2.5 px-4 pb-4 text-text';

/** A flat block of settings divided from its neighbours by a hairline. Collapsible ones show a chevron at the right of the title. */
export const Section = ({ title, children, collapsible = false, defaultOpen = false }: SectionProps) => {
	const [open, setOpen] = useState(defaultOpen);
	// Clipped only while collapsed or animating: a settled section must let dropdowns inside it (Select, Popover) overflow.
	const [clip, setClip] = useState(!defaultOpen);
	const bodyId = useId();

	const toggle = () => {
		setOpen(!open);
		if(open) setClip(true);
		else if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setClip(false);
	};

	if(!collapsible)
	{
		return (
			<section className='border-b-[length:var(--border-width)] border-surface-border last:border-b-0'>
				<h3 className='px-4 py-3 text-sm font-medium text-text'>{title}</h3>
				<div className={SECTION_BODY}>{children}</div>
			</section>
		);
	}

	return (
		<section className='border-b-[length:var(--border-width)] border-surface-border last:border-b-0'>
			<h3>
				<button
					type='button'
					aria-expanded={open}
					aria-controls={bodyId}
					onClick={toggle}
					className='flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-text hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ring motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]'
				>
					{title}
					<svg aria-hidden='true' viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={`text-text-muted motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] ${open ? 'rotate-180' : ''}`}>
						<path d='m6 9 6 6 6-6' />
					</svg>
				</button>
			</h3>
			<div id={bodyId} onTransitionEnd={e => e.target === e.currentTarget && open && setClip(false)} className={`grid motion-safe:transition-[grid-template-rows] motion-safe:duration-[var(--duration-base)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
				<div inert={!open} className={`min-h-0 ${clip ? 'overflow-hidden' : ''}`}>
					<div className={SECTION_BODY}>{children}</div>
				</div>
			</div>
		</section>
	);
};
