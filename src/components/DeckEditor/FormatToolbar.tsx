'use client';

import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup';
import { FormEvent, KeyboardEvent, ReactNode, useState } from 'react';
import type { ChainedCommands, Editor } from '@tiptap/react';
import { FONT_OPTIONS, THEME_COLOR_REFS } from './themes';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { useEditorState } from '@tiptap/react';
import { Popover } from '../Popover/Popover';
import type { DeckElement } from './deck';
import type { GlyphName } from './icons';
import type { FontId } from './themes';
import Button from '../Button/Button';
import Select from '../Select/Select';
import Input from '../Input/Input';
import { Glyph } from './icons';

type Patch = (patch: Partial<DeckElement>, coalesceKey?: string) => void;
type Of<T extends DeckElement['type']> = Extract<DeckElement, { type: T }>;

export const SWATCHES = ['#18181b', '#ffffff', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#ec4899'];

const ICON_BUTTON = [
	'inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-[var(--radius-sm)] px-1.5 text-sm text-text',
	'hover:bg-surface-hover motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
].join(' ');

const Divider = () => <span aria-hidden='true' className='mx-0.5 h-5 w-px bg-surface-border' />;

// Arrow keys move between controls, the standard toolbar pattern. Tab still
// reaches every control so popovers and the size field stay one keystroke away.
const handleToolbarKeys = (e: KeyboardEvent<HTMLDivElement>) => {
	if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
	if(e.target instanceof HTMLInputElement) return;
	const controls = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input')];
	const index = controls.indexOf(e.target as HTMLElement);
	if(index < 0) return;
	e.preventDefault();
	controls[(index + (e.key === 'ArrowRight' ? 1 : -1) + controls.length) % controls.length]?.focus();
};

const Shell = ({ label, children }: { label: string; children: ReactNode }) => (
	<div
		role='toolbar'
		aria-label={label}
		onKeyDown={handleToolbarKeys}
		onPointerDown={e => e.stopPropagation()}
		className={[
			'flex items-center gap-0.5 whitespace-nowrap rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border',
			'bg-surface-panel p-1 shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
			// Wider than a phone screen when every control shows, so it wraps. Not a scroll
			// container: that would clip the font dropdown, which opens below the toolbar.
			'max-w-[calc(100vw-2rem)] flex-wrap',
			'motion-safe:animate-[fade-in_var(--duration-fast)_ease-out]',
		].join(' ')}
	>
		{children}
	</div>
);

interface ToggleButtonProps {
	label:   string;
	glyph:   GlyphName;
	active?: boolean;
	onPress: () => void;
}

const ToggleButton = ({ label, glyph, active, onPress }: ToggleButtonProps) => (
	<button
		type='button'
		aria-label={label}
		title={label}
		aria-pressed={active}
		// Keeps the text selection: a mousedown would otherwise blur the editor first.
		onMouseDown={e => e.preventDefault()}
		onClick={onPress}
		className={`${ICON_BUTTON} ${active ? 'bg-surface-active' : ''}`}
	>
		<Glyph name={glyph} />
	</button>
);

interface ColorButtonProps {
	label:     string;
	value:     string;
	onChange:  (hex: string) => void;
	onReset?:  () => void;
	children:  ReactNode;
}

export const ColorButton = ({ label, value, onChange, onReset, children }: ColorButtonProps) => (
	<Popover
		label={label}
		side='bottom'
		align='start'
		unstyledTrigger
		triggerClassName={ICON_BUTTON}
		triggerProps={{ 'aria-label': label, title: label, onMouseDown: e => e.preventDefault() }}
		trigger={children}
		className='min-w-0 p-2'
	>
		{close => (
			<div className='flex flex-col gap-1.5'>
				<div role='group' aria-label='Theme colors' className='flex gap-1'>
					{THEME_COLOR_REFS.map(ref => (
						<button
							key={ref.value}
							type='button'
							aria-pressed={value === ref.value}
							onClick={() =>
							{
								onChange(ref.value);
								close();
							}}
							className={[
								'flex flex-1 items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-1 text-[11px] text-text',
								value === ref.value ? 'bg-surface-active ring-1 ring-brand' : 'hover:bg-surface-hover',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
							].join(' ')}
						>
							<span aria-hidden='true' className='h-3 w-3 shrink-0 rounded-full border-[length:var(--border-width)] border-input-border' style={{ background: ref.value }} />
							{ref.label.replace('Theme ', '')}
						</button>
					))}
				</div>
				{/* Theme references aren't hex, so the picker starts from black for them. */}
				<ColorPicker value={value.startsWith('#') ? value : '#18181b'} onValueChange={onChange} swatches={SWATCHES} />
				{onReset && (
					<Button variant='ghost' size='sm' className='h-7' onClick={() => { onReset(); close(); }}>
						Use theme color
					</Button>
				)}
			</div>
		)}
	</Popover>
);

/** Overrides the theme's font for one element; "Theme font" clears the override. */
export const FontSelect = ({ value, onChange, compact = false }: { value: FontId | undefined; onChange: (font: FontId | undefined) => void; compact?: boolean }) => {
	const select = (
		<Select
			aria-label={compact ? 'Font' : undefined}
			label={compact ? undefined : 'Font'}
			size='sm'
			options={FONT_OPTIONS}
			value={value ?? 'theme'}
			onChange={next => onChange(next === 'theme' ? undefined : next as FontId)}
			triggerClassName={compact ? 'h-7' : ''}
		/>
	);
	// Select fills its container (w-full), so the toolbar gives it a fixed, non-shrinking slot.
	return compact ? <div className='w-32 shrink-0'>{select}</div> : select;
};

// Input always renders a collapsed hint row under the field; its column gap would
// still push the field up off the toolbar's center line, hence `[&>div]:gap-0`.
const SizeField = ({ value, onChange }: { value: number; onChange: (size: number) => void }) => (
	<div className='w-16 shrink-0 [&>div]:gap-0'>
		<Input
			aria-label='Font size'
			type='number'
			min={8}
			max={240}
			value={value}
			onChange={e => e.target.value !== '' && onChange(Math.min(240, Math.max(8, Number(e.target.value))))}
			className='h-7 px-2 py-0 text-xs tabular-nums'
		/>
	</div>
);

const MARKS = [
	{ name: 'bold',      label: 'Bold',          glyph: 'bold',      toggle: (c: ChainedCommands) => c.toggleBold() },
	{ name: 'italic',    label: 'Italic',        glyph: 'italic',    toggle: (c: ChainedCommands) => c.toggleItalic() },
	{ name: 'underline', label: 'Underline',     glyph: 'underline', toggle: (c: ChainedCommands) => c.toggleUnderline() },
	{ name: 'strike',    label: 'Strikethrough', glyph: 'strike',    toggle: (c: ChainedCommands) => c.toggleStrike() },
] as const;

const BLOCKS = [
	{ name: 'bulletList',  label: 'Bulleted list', glyph: 'list',        toggle: (c: ChainedCommands) => c.toggleBulletList() },
	{ name: 'orderedList', label: 'Numbered list', glyph: 'orderedList', toggle: (c: ChainedCommands) => c.toggleOrderedList() },
] as const;

const ALIGNS = [
	{ value: 'left',   label: 'Align left',   glyph: 'alignLeft' },
	{ value: 'center', label: 'Align center', glyph: 'alignCenter' },
	{ value: 'right',  label: 'Align right',  glyph: 'alignRight' },
] as const;

const normalizeUrl = (input: string) => {
	const url = input.trim();
	if(!url) return null;
	return /^(https?:|mailto:|tel:|#|\/)/i.test(url) ? url : `https://${url}`;
};

// While editing, commands apply to the selection. A selected-but-not-editing
// text box applies them to all of its text, like slide apps do.
const run = (editor: Editor, command: (c: ChainedCommands) => ChainedCommands) =>
	command(editor.isEditable ? editor.chain().focus() : editor.chain().selectAll()).run();

const LinkButton = ({ editor, href }: { editor: Editor; href: string | undefined }) => {
	const [draft, setDraft] = useState('');

	return (
		<Popover
			label='Link'
			side='bottom'
			align='start'
			unstyledTrigger
			triggerClassName={`${ICON_BUTTON} ${href ? 'bg-surface-active' : ''}`}
			triggerProps={{ 'aria-label': href ? 'Edit link' : 'Add link', title: 'Link', onMouseDown: e => e.preventDefault() }}
			trigger={<Glyph name='link' />}
			onOpenChange={open => open && setDraft(href ?? '')}
			className='w-72'
		>
			{close => {
				const apply = (e: FormEvent) => {
					e.preventDefault();
					const url = normalizeUrl(draft);
					run(editor, c => (url ? c.extendMarkRange('link').setLink({ href: url }) : c.extendMarkRange('link').unsetLink()));
					close();
				};

				return (
					<form onSubmit={apply} className='flex flex-col gap-2'>
						<Input label='Link URL' value={draft} placeholder='example.com' onChange={e => setDraft(e.target.value)} className='px-2 py-1.5' />
						<div className='flex justify-end gap-2'>
							{href && (
								<Button type='button' variant='ghost' size='sm' onClick={() => { run(editor, c => c.extendMarkRange('link').unsetLink()); close(); }}>
									Remove
								</Button>
							)}
							<Button type='submit' size='sm'>Apply</Button>
						</div>
					</form>
				);
			}}
		</Popover>
	);
};

const TextToolbar = ({ element, editor, onPatch }: { element: Of<'text'>; editor: Editor; onPatch: Patch }) => {
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			marks:  [...MARKS, ...BLOCKS].filter(m => e.isActive(m.name)).map(m => m.name as string),
			align:  ALIGNS.find(a => e.isActive({ textAlign: a.value }))?.value ?? 'left',
			color:  e.getAttributes('textStyle').color as string | undefined,
			href:   e.getAttributes('link').href as string | undefined,
		}),
	});

	const textColor = state.color ?? element.color;

	return (
		<Shell label='Text formatting'>
			<FontSelect compact value={element.font} onChange={font => onPatch({ font })} />
			<SizeField value={element.fontSize} onChange={fontSize => onPatch({ fontSize }, 'fontSize')} />
			<ColorButton
				label='Text color'
				value={textColor}
				onChange={hex => run(editor, c => c.setColor(hex))}
				onReset={() => run(editor, c => c.unsetColor())}
			>
				<span className='flex flex-col items-center leading-none'>
					<span className='text-sm font-semibold'>A</span>
					<span className={`mt-0.5 h-1 w-4 rounded-full ${textColor ? '' : 'bg-text'}`} style={textColor ? { background: textColor } : undefined} />
				</span>
			</ColorButton>
			<Divider />
			{MARKS.map(mark => (
				<ToggleButton key={mark.name} label={mark.label} glyph={mark.glyph} active={state.marks.includes(mark.name)} onPress={() => run(editor, mark.toggle)} />
			))}
			<LinkButton editor={editor} href={state.href} />
			<Divider />
			{BLOCKS.map(block => (
				<ToggleButton key={block.name} label={block.label} glyph={block.glyph} active={state.marks.includes(block.name)} onPress={() => run(editor, block.toggle)} />
			))}
			<Divider />
			{ALIGNS.map(align => (
				<ToggleButton key={align.value} label={align.label} glyph={align.glyph} active={state.align === align.value} onPress={() => run(editor, c => c.setTextAlign(align.value))} />
			))}
		</Shell>
	);
};

interface FormatToolbarProps {
	element: DeckElement;
	editor:  Editor | null;
	onPatch: Patch;
}

export const FormatToolbar = ({ element, editor, onPatch }: FormatToolbarProps) => {
	switch(element.type)
	{
	case 'text':
		return editor ? <TextToolbar element={element} editor={editor} onPatch={onPatch} /> : null;

	case 'table': {
		const columns = element.rows[0]?.length ?? 0;
		return (
			<Shell label='Table formatting'>
				<FontSelect compact value={element.font} onChange={font => onPatch({ font })} />
				<SizeField value={element.fontSize} onChange={fontSize => onPatch({ fontSize }, 'fontSize')} />
				<Divider />
				<button type='button' className={ICON_BUTTON} onClick={() => onPatch({ rows: [...element.rows, Array(columns).fill('')] })}>
					<Glyph name='plus' /> Row
				</button>
				<button type='button' className={ICON_BUTTON} onClick={() => onPatch({ rows: element.rows.map(r => [...r, '']) })}>
					<Glyph name='plus' /> Column
				</button>
			</Shell>
		);
	}

	case 'shape':
		return (
			<Shell label='Shape formatting'>
				<ColorButton label='Fill' value={element.fill} onChange={fill => onPatch({ fill }, 'fill')} onReset={() => onPatch({ fill: '' })}>
					<span className='h-4 w-4 rounded-full border-[length:var(--border-width)] border-input-border' style={{ background: element.fill || 'var(--color-brand)' }} />
				</ColorButton>
			</Shell>
		);

	case 'icon':
		return (
			<Shell label='Icon formatting'>
				<ColorButton label='Icon color' value={element.color} onChange={color => onPatch({ color }, 'color')} onReset={() => onPatch({ color: '' })}>
					<span className='h-4 w-4 rounded-full border-[length:var(--border-width)] border-input-border' style={{ background: element.color || 'var(--color-brand)' }} />
				</ColorButton>
			</Shell>
		);

	case 'line':
		return (
			<Shell label='Line formatting'>
				<ColorButton label='Line color' value={element.stroke} onChange={stroke => onPatch({ stroke }, 'stroke')} onReset={() => onPatch({ stroke: '' })}>
					<span className='h-1 w-5 rounded-full' style={{ background: element.stroke || 'var(--color-text)' }} />
				</ColorButton>
				<div className='w-16 shrink-0 [&>div]:gap-0'>
					<Input
						aria-label='Line width'
						type='number'
						min={1}
						max={40}
						value={element.strokeWidth}
						onChange={e => e.target.value !== '' && onPatch({ strokeWidth: Math.min(40, Math.max(1, Number(e.target.value))) }, 'strokeWidth')}
						className='h-7 px-2 py-0 text-xs tabular-nums'
					/>
				</div>
				<ToggleButton label='Arrowhead' glyph='arrow' active={element.arrow} onPress={() => onPatch({ arrow: !element.arrow })} />
			</Shell>
		);

	case 'chart':
		return (
			<Shell label='Chart formatting'>
				<ToggleGroup type='single' size='sm' aria-label='Chart type' value={element.chart} onValueChange={v => onPatch({ chart: v as Of<'chart'>['chart'] })}>
					<ToggleGroupItem value='bar'>Bar</ToggleGroupItem>
					<ToggleGroupItem value='line'>Line</ToggleGroupItem>
					<ToggleGroupItem value='area'>Area</ToggleGroupItem>
				</ToggleGroup>
			</Shell>
		);

	case 'image':
		return (
			<Shell label='Image formatting'>
				<ToggleGroup type='single' size='sm' aria-label='Image fit' value={element.fit} onValueChange={v => onPatch({ fit: v as Of<'image'>['fit'] })}>
					<ToggleGroupItem value='cover'>Fill</ToggleGroupItem>
					<ToggleGroupItem value='contain'>Fit</ToggleGroupItem>
				</ToggleGroup>
			</Shell>
		);
	}
};
