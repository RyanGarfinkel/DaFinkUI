'use client';

import { FormEvent, KeyboardEvent, ReactNode, useState } from 'react';
import { TEXT_STYLE_OPTIONS, textStyleFields } from './textstyles';
import type { ChainedCommands, Editor } from '@tiptap/react';
import { FONT_OPTIONS, THEME_COLOR_REFS } from './themes';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import type { TextStyleId } from './textstyles';
import { useEditorState } from '@tiptap/react';
import { Popover } from '../Popover/Popover';
import type { DeckElement } from './deck';
import type { GlyphName } from './icons';
import { NumberField } from './fields';
import type { FontId } from './themes';
import Button from '../Button/Button';
import Select from '../Select/Select';
import { Menu } from '../Menu/Menu';
import Input from '../Input/Input';
import { Glyph } from './icons';

type Patch = (patch: Partial<DeckElement>, coalesceKey?: string) => void;

export const SWATCHES = ['#18181b', '#ffffff', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#ec4899'];

const ICON_BUTTON = [
	'inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-[var(--radius-sm)] px-1.5 text-sm text-text',
	'hover:bg-surface-hover motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
].join(' ');

// Keeps the text selection: a mousedown would otherwise blur the editor first.
const keepSelection = { onMouseDown: (e: { preventDefault: () => void }) => e.preventDefault() };

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

interface ShellProps {
	label:    string;
	/** Opens the settings panel on this element. */
	onMore:   () => void;
	/** Adds the lasso button that sends the selection to an agent. */
	onAsk?:   () => void;
	children: ReactNode;
}

const Shell = ({ label, onMore, onAsk, children }: ShellProps) => (
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
		{onAsk && (
			<button type='button' aria-label='Ask AI' title='Ask AI about this' {...keepSelection} onClick={onAsk} className={ICON_BUTTON}>
				<Glyph name='lasso' />
			</button>
		)}
		<button type='button' aria-label='More options' title='More options: open settings' {...keepSelection} onClick={onMore} className={ICON_BUTTON}>
			<Glyph name='more' />
		</button>
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
		{...keepSelection}
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
	/** A full-width, field-like button (for settings rows) instead of a toolbar icon button. */
	field?:    boolean;
	children:  ReactNode;
}

const FIELD_BUTTON = [
	'inline-flex h-8 w-full items-center justify-start gap-2 rounded-[var(--radius)] bg-surface-hover px-2 text-text',
	'hover:bg-surface-active motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
	'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
].join(' ');

export const ColorButton = ({ label, value, onChange, onReset, field = false, children }: ColorButtonProps) => (
	<Popover
		label={label}
		side='bottom'
		align='start'
		unstyledTrigger
		triggerClassName={field ? FIELD_BUTTON : ICON_BUTTON}
		triggerProps={{ 'aria-label': label, title: label, ...keepSelection }}
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

/** A filled square of a color, for color buttons; empty falls back to `fallback`. */
const Swatch = ({ color, fallback }: { color: string; fallback: string }) => (
	<span aria-hidden='true' className='h-5 w-5 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-input-border' style={{ background: color || fallback }} />
);

/** Overrides the theme's font for one element; "Theme font" clears the override. */
export const FontSelect = ({ value, onChange, inline = false }: { value: FontId | undefined; onChange: (font: FontId | undefined) => void; inline?: boolean }) => (
	<Select
		label={inline ? undefined : 'Font'}
		aria-label={inline ? 'Font' : undefined}
		size='sm'
		options={FONT_OPTIONS}
		value={value ?? 'theme'}
		onChange={next => onChange(next === 'theme' ? undefined : next as FontId)}
	/>
);

/** Sets a text box from a preset (Title, Heading, Body, Footer, …): its size, weight, and color, and the theme font it uses. */
export const StyleSelect = ({ value, onChange, inline = false }: { value: TextStyleId | undefined; onChange: (patch: Partial<DeckElement>) => void; inline?: boolean }) => (
	<Select
		label={inline ? undefined : 'Text style'}
		aria-label={inline ? 'Text style' : undefined}
		size='sm'
		options={TEXT_STYLE_OPTIONS}
		value={value ?? 'none'}
		onChange={next => onChange(next === 'none' ? { style: undefined } : { style: next as TextStyleId, ...textStyleFields(next as TextStyleId) })}
	/>
);

const MARKS = [
	{ name: 'bold',      label: 'Bold',      glyph: 'bold',      toggle: (c: ChainedCommands) => c.toggleBold() },
	{ name: 'italic',    label: 'Italic',    glyph: 'italic',    toggle: (c: ChainedCommands) => c.toggleItalic() },
	{ name: 'underline', label: 'Underline', glyph: 'underline', toggle: (c: ChainedCommands) => c.toggleUnderline() },
] as const;

const BLOCKS = [
	{ name: 'bulletList',  label: 'Bulleted list', toggle: (c: ChainedCommands) => c.toggleBulletList() },
	{ name: 'orderedList', label: 'Numbered list', toggle: (c: ChainedCommands) => c.toggleOrderedList() },
] as const;

const ALIGNS = [
	{ value: 'left',   label: 'Align left',   glyph: 'alignLeft' },
	{ value: 'center', label: 'Align center', glyph: 'alignCenter' },
	{ value: 'right',  label: 'Align right',  glyph: 'alignRight' },
] as const;

const VALIGNS = [
	{ value: 'top',    label: 'Align top',    glyph: 'alignTop' },
	{ value: 'middle', label: 'Align middle', glyph: 'alignMiddle' },
	{ value: 'bottom', label: 'Align bottom', glyph: 'alignBottom' },
] as const;

const Divider = () => <span aria-hidden='true' className='mx-0.5 h-5 w-px bg-surface-border' />;

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
			triggerProps={{ 'aria-label': href ? 'Edit link' : 'Add link', title: 'Link', ...keepSelection }}
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

/** "Font · size" opening the typography controls: style, font, and size. */
const TypographyButton = ({ element, onPatch }: { element: Extract<DeckElement, { type: 'text' }>; onPatch: Patch }) => {
	const fontLabel = FONT_OPTIONS.find(option => option.value === (element.font ?? 'theme'))?.label ?? 'Theme font';

	return (
		<Popover
			label='Text'
			side='bottom'
			align='start'
			unstyledTrigger
			triggerClassName={`${ICON_BUTTON} max-w-48`}
			triggerProps={{ 'aria-label': `Text: ${fontLabel}, ${element.fontSize}`, title: 'Font and size', ...keepSelection }}
			trigger={(
				<>
					<Glyph name='text' />
					<span className='truncate'>{fontLabel} · {element.fontSize}</span>
					<Glyph name='chevronDown' size={12} className='text-text-muted' />
				</>
			)}
			className='w-60'
		>
			<div className='flex flex-col gap-3'>
				<StyleSelect value={element.style} onChange={patch => onPatch(patch)} />
				<FontSelect value={element.font} onChange={font => onPatch({ font })} />
				<NumberField label='Size' value={element.fontSize} min={8} max={240} onChange={fontSize => onPatch({ fontSize }, 'fontSize')} />
			</div>
		</Popover>
	);
};

interface TextToolbarProps {
	element: Extract<DeckElement, { type: 'text' }>;
	editor:  Editor;
	onPatch: Patch;
	onMore:  () => void;
	onAsk?:  () => void;
}

const TextToolbar = ({ element, editor, onPatch, onMore, onAsk }: TextToolbarProps) => {
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
	const alignGlyph = ALIGNS.find(a => a.value === state.align)?.glyph ?? 'alignLeft';
	const listActive = BLOCKS.some(block => state.marks.includes(block.name));

	return (
		<Shell label='Text formatting' onMore={onMore} onAsk={onAsk}>
			<TypographyButton element={element} onPatch={onPatch} />
			<ColorButton
				label='Text color'
				value={textColor}
				onChange={hex => run(editor, c => c.setColor(hex))}
				onReset={() => run(editor, c => c.unsetColor())}
			>
				<Swatch color={textColor} fallback='var(--color-text)' />
			</ColorButton>
			{MARKS.map(mark => (
				<ToggleButton key={mark.name} label={mark.label} glyph={mark.glyph} active={state.marks.includes(mark.name)} onPress={() => run(editor, mark.toggle)} />
			))}
			<LinkButton editor={editor} href={state.href} />
			<Menu
				unstyledTrigger
				triggerClassName={`${ICON_BUTTON} ${listActive ? 'bg-surface-active' : ''}`}
				triggerProps={{ 'aria-label': 'List', title: 'List', ...keepSelection }}
				trigger={<Glyph name='list' />}
				items={BLOCKS.map(block => ({ label: block.label, selected: state.marks.includes(block.name), onSelect: () => run(editor, block.toggle) }))}
			/>
			<Popover
				label='Alignment'
				side='bottom'
				align='start'
				unstyledTrigger
				triggerClassName={ICON_BUTTON}
				triggerProps={{ 'aria-label': 'Alignment', title: 'Alignment', ...keepSelection }}
				trigger={<Glyph name={alignGlyph} />}
				className='min-w-0 p-1'
			>
				{close => (
					<div className='flex items-center gap-0.5'>
						<div role='group' aria-label='Horizontal alignment' className='flex gap-0.5'>
							{ALIGNS.map(align => (
								<ToggleButton
									key={align.value}
									label={align.label}
									glyph={align.glyph}
									active={state.align === align.value}
									onPress={() => { run(editor, c => c.setTextAlign(align.value)); close(); }}
								/>
							))}
						</div>
						<Divider />
						<div role='group' aria-label='Vertical alignment' className='flex gap-0.5'>
							{VALIGNS.map(valign => (
								<ToggleButton
									key={valign.value}
									label={valign.label}
									glyph={valign.glyph}
									active={(element.valign ?? 'top') === valign.value}
									onPress={() => { onPatch({ valign: valign.value }); close(); }}
								/>
							))}
						</div>
					</div>
				)}
			</Popover>
		</Shell>
	);
};

interface FormatToolbarProps {
	element: DeckElement;
	editor:  Editor | null;
	onPatch: Patch;
	/** Opens the settings panel on the selected element. */
	onMore:  () => void;
	/** When set, the bar gets a lasso button that calls it. */
	onAsk?:  () => void;
}

// Only the quick, in-place controls live here; everything else is in the settings panel, one "…" away.
export const FormatToolbar = ({ element, editor, onPatch, onMore, onAsk }: FormatToolbarProps) => {
	switch(element.type)
	{
	case 'text':
		return editor ? <TextToolbar element={element} editor={editor} onPatch={onPatch} onMore={onMore} onAsk={onAsk} /> : null;

	case 'table': {
		const columns = element.rows[0]?.length ?? 0;
		return (
			<Shell label='Table formatting' onMore={onMore} onAsk={onAsk}>
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
			<Shell label='Shape formatting' onMore={onMore} onAsk={onAsk}>
				<ColorButton label='Fill' value={element.fill} onChange={fill => onPatch({ fill }, 'fill')} onReset={() => onPatch({ fill: '' })}>
					<Swatch color={element.fill} fallback='var(--color-brand)' />
				</ColorButton>
			</Shell>
		);

	case 'icon':
		return (
			<Shell label='Icon formatting' onMore={onMore} onAsk={onAsk}>
				<ColorButton label='Icon color' value={element.color} onChange={color => onPatch({ color }, 'color')} onReset={() => onPatch({ color: '' })}>
					<Swatch color={element.color} fallback='var(--color-brand)' />
				</ColorButton>
			</Shell>
		);

	case 'svg':
		return (
			<Shell label='SVG formatting' onMore={onMore} onAsk={onAsk}>
				<ColorButton label='SVG color' value={element.color} onChange={color => onPatch({ color }, 'color')} onReset={() => onPatch({ color: '' })}>
					<Swatch color={element.color} fallback='var(--color-text)' />
				</ColorButton>
			</Shell>
		);

	case 'line':
		return (
			<Shell label='Line formatting' onMore={onMore} onAsk={onAsk}>
				<ColorButton label='Line color' value={element.stroke} onChange={stroke => onPatch({ stroke }, 'stroke')} onReset={() => onPatch({ stroke: '' })}>
					<Swatch color={element.stroke} fallback='var(--color-text)' />
				</ColorButton>
				<ToggleButton label='Arrowhead' glyph='arrow' active={element.arrow} onPress={() => onPatch({ arrow: !element.arrow })} />
			</Shell>
		);

	case 'chart':
		return <Shell label='Chart formatting' onMore={onMore} onAsk={onAsk}>{null}</Shell>;

	case 'image':
		return <Shell label='Image formatting' onMore={onMore} onAsk={onAsk}>{null}</Shell>;
	}
};
