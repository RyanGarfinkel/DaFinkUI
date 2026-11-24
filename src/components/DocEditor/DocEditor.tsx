'use client';

import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, DownloadIcon, ItalicIcon, ListIcon, OrderedListIcon, QuoteIcon, RedoIcon, StrikeIcon, UnderlineIcon, UndoIcon } from '../Icons/Icons';
import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import { Select } from '../Select/Select';
import { downloadDocx } from './docx';
import Button from '../Button/Button';

export interface DocEditorProps {
	value:         string;
	onChange?:     (html: string) => void;
	title?:        string;
	filename?:     string;
	readOnly?:     boolean;
	downloadable?: boolean;
	height?:       number | string;
	className?:    string;
	'aria-label'?: string;
}

const BLOCK_OPTIONS = [
	{ value: 'paragraph', label: 'Paragraph' },
	{ value: 'h1', label: 'Heading 1' },
	{ value: 'h2', label: 'Heading 2' },
	{ value: 'h3', label: 'Heading 3' },
];

const PAGE_TEXT = [
	'min-h-[20rem] text-sm leading-relaxed text-text outline-none',
	'[&_p]:my-2 [&_li_p]:my-1',
	'[&_h1]:mb-2 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold',
	'[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold',
	'[&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold',
	'[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
	'[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-muted',
	'[&_a]:underline [&_a]:underline-offset-2',
	'[&_hr]:my-6 [&_hr]:border-border',
	'[&_code]:rounded [&_code]:bg-surface-hover [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]',
	'[&_pre]:my-3 [&_pre]:overflow-auto [&_pre]:rounded-[var(--radius)] [&_pre]:bg-surface-hover [&_pre]:p-3',
].join(' ');

// Keeps the text selection: a mousedown would otherwise blur the editor first.
const keepSelection = { onMouseDown: (event: { preventDefault: () => void }) => event.preventDefault() };

// Arrow keys move between toolbar controls; Tab still reaches every one.
const handleToolbarKeys = (event: KeyboardEvent<HTMLDivElement>) => {
	if(event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

	const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])')];
	const index = controls.indexOf(event.target as HTMLElement);
	if(index < 0) return;

	event.preventDefault();
	controls[(index + (event.key === 'ArrowRight' ? 1 : -1) + controls.length) % controls.length]?.focus();
};

interface ToolProps {
	label:     string;
	active?:   boolean;
	disabled?: boolean;
	onRun:     () => void;
	children:  ReactNode;
}

const Tool = ({ label, active, disabled, onRun, children }: ToolProps) => (
	<Button
		variant={active ? 'secondary' : 'ghost'}
		size='icon-sm'
		aria-label={label}
		aria-pressed={active}
		disabled={disabled}
		{...keepSelection}
		onClick={onRun}
	>
		{children}
	</Button>
);

const Divider = () => <span aria-hidden='true' className='mx-0.5 h-5 w-px bg-border' />;

export const DocEditor = ({ value, onChange, title, filename, readOnly = false, downloadable = true, height = '40rem', className = '', 'aria-label': ariaLabel = 'Document' }: DocEditorProps) => {
	const onChangeRef = useRef(onChange);
	const [exporting, setExporting] = useState(false);

	useEffect(() =>
	{
		onChangeRef.current = onChange;
	});

	const editor = useEditor({
		extensions: [
			StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, autolink: true, defaultProtocol: 'https' } }),
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
		],
		content:           value,
		editable:          !readOnly,
		immediatelyRender: false,
		editorProps:       { attributes: { class: PAGE_TEXT, role: 'textbox', 'aria-multiline': 'true', 'aria-label': ariaLabel } },
		onUpdate:          ({ editor: current }) => onChangeRef.current?.(current.getHTML()),
	});

	const state = useEditorState({
		editor,
		selector: ({ editor: current }) =>
		{
			if(!current) return null;

			const heading = [1, 2, 3].find((level) => current.isActive('heading', { level }));

			return {
				block:     heading ? `h${heading}` : 'paragraph',
				bold:      current.isActive('bold'),
				italic:    current.isActive('italic'),
				underline: current.isActive('underline'),
				strike:    current.isActive('strike'),
				bullet:    current.isActive('bulletList'),
				ordered:   current.isActive('orderedList'),
				quote:     current.isActive('blockquote'),
				center:    current.isActive({ textAlign: 'center' }),
				right:     current.isActive({ textAlign: 'right' }),
				canUndo:   current.can().undo(),
				canRedo:   current.can().redo(),
			};
		},
	});

	useEffect(() =>
	{
		if(editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
	}, [editor, value]);

	useEffect(() =>
	{
		editor?.setEditable(!readOnly, false);
	}, [editor, readOnly]);

	const chain = () => editor!.chain().focus();

	const setBlock = (block: string) => {
		if(block === 'paragraph') chain().setParagraph().run();
		else chain().setHeading({ level: Number(block.slice(1)) as 1 | 2 | 3 }).run();
	};

	const download = async () => {
		if(!editor) return;

		setExporting(true);
		await downloadDocx(editor.getHTML(), filename ?? title ?? 'document');
		setExporting(false);
	};

	const align = state?.center ? 'center' : state?.right ? 'right' : 'left';
	const showToolbar = !readOnly || downloadable;

	return (
		<div className={`flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface-sunken ${className}`} style={{ height }}>
			{showToolbar && (
				<div role='toolbar' aria-label='Formatting' onKeyDown={handleToolbarKeys} className='flex shrink-0 flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5'>
					{!readOnly && (
						<>
							<Tool label='Undo' disabled={!state?.canUndo} onRun={() => chain().undo().run()}><UndoIcon /></Tool>
							<Tool label='Redo' disabled={!state?.canRedo} onRun={() => chain().redo().run()}><RedoIcon /></Tool>
							<Divider />
							<div className='w-28 shrink-0'>
								<Select size='sm' aria-label='Text style' options={BLOCK_OPTIONS} value={state?.block ?? 'paragraph'} onChange={setBlock} disabled={!editor} />
							</div>
							<Divider />
							<Tool label='Bold' active={Boolean(state?.bold)} onRun={() => chain().toggleBold().run()}><BoldIcon /></Tool>
							<Tool label='Italic' active={Boolean(state?.italic)} onRun={() => chain().toggleItalic().run()}><ItalicIcon /></Tool>
							<Tool label='Underline' active={Boolean(state?.underline)} onRun={() => chain().toggleUnderline().run()}><UnderlineIcon /></Tool>
							<Tool label='Strikethrough' active={Boolean(state?.strike)} onRun={() => chain().toggleStrike().run()}><StrikeIcon /></Tool>
							<Divider />
							<Tool label='Bulleted list' active={Boolean(state?.bullet)} onRun={() => chain().toggleBulletList().run()}><ListIcon /></Tool>
							<Tool label='Numbered list' active={Boolean(state?.ordered)} onRun={() => chain().toggleOrderedList().run()}><OrderedListIcon /></Tool>
							<Tool label='Quote' active={Boolean(state?.quote)} onRun={() => chain().toggleBlockquote().run()}><QuoteIcon /></Tool>
							<Divider />
							<Tool label='Align left' active={align === 'left'} onRun={() => chain().setTextAlign('left').run()}><AlignLeftIcon /></Tool>
							<Tool label='Align center' active={align === 'center'} onRun={() => chain().setTextAlign('center').run()}><AlignCenterIcon /></Tool>
							<Tool label='Align right' active={align === 'right'} onRun={() => chain().setTextAlign('right').run()}><AlignRightIcon /></Tool>
						</>
					)}
					{downloadable && (
						<Button variant='ghost' size='sm' className='ml-auto gap-1.5' loading={exporting} disabled={!editor} onClick={() => void download()}>
							<DownloadIcon />
							Download .docx
						</Button>
					)}
				</div>
			)}

			<div className='min-h-0 flex-1 overflow-auto p-3 sm:p-8'>
				<div className='mx-auto min-h-full w-full max-w-[816px] rounded-[var(--radius)] bg-surface px-5 py-6 shadow-sm ring-1 ring-border sm:px-14 sm:py-12'>
					<EditorContent editor={editor} />
				</div>
			</div>
		</div>
	);
};

export default DocEditor;
export { downloadDocx, exportDocx } from './docx';
