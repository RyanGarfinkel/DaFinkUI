'use client';

import { Color, TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import type { Editor } from '@tiptap/react';
import { useEffect, useRef } from 'react';

interface TextElementProps {
	html:           string;
	fontSize:       number;
	/** CSS font stack overriding the theme's font. */
	font?:          string;
	color:          string;
	/** Base weight for the whole box; bold marks still apply on top. */
	bold?:          boolean;
	/** Shown over the box while it has no text. */
	placeholder?:   string;
	selected:       boolean;
	editing:        boolean;
	/** `height` is the content's natural height in slide px, so the box can grow to fit. */
	onChange:       (html: string, height: number) => void;
	/** Reports the editor while the element is selected or being edited, so a toolbar can format it. */
	onEditorChange: (editor: Editor, active: boolean) => void;
}

const PROSE = [
	'h-full w-full outline-none leading-tight',
	'[&_p]:m-0 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-[1.2em] [&_ol]:pl-[1.2em] [&_li]:my-[0.2em]',
	'[&_a]:underline [&_a]:underline-offset-[0.15em]',
].join(' ');

// String checks rather than DOMParser, so this also works during server rendering.
const isBlank = (html: string) => !html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

const alignmentOf = (html: string) => (/text-align:\s*(center|right)/.exec(html)?.[1] ?? 'left') as 'left' | 'center' | 'right';

export const TextElement = ({ html, fontSize, font, color, bold, placeholder, selected, editing, onChange, onEditorChange }: TextElementProps) => {
	// useEditor captures its options once; refs keep the callbacks current.
	const onChangeRef = useRef(onChange);
	const onEditorChangeRef = useRef(onEditorChange);

	useEffect(() =>
	{
		onChangeRef.current = onChange;
		onEditorChangeRef.current = onEditorChange;
	});

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading:        false,
				code:           false,
				codeBlock:      false,
				blockquote:     false,
				horizontalRule: false,
				link:           { openOnClick: false, autolink: true, defaultProtocol: 'https' },
			}),
			TextStyle,
			Color,
			TextAlign.configure({ types: ['paragraph'] }),
		],
		content:           html,
		editable:          editing,
		immediatelyRender: false,
		editorProps:       { attributes: { class: PROSE } },
		onUpdate:          ({ editor: e }) => onChangeRef.current(e.getHTML(), Math.ceil(e.view.dom.scrollHeight)),
	});

	useEffect(() =>
	{
		if(!editor) return;
		// No update event: toggling editability isn't a content change and would push an empty undo step.
		editor.setEditable(editing, false);
		if(editing) editor.commands.focus('end');
	}, [editor, editing]);

	useEffect(() =>
	{
		if(editor) onEditorChangeRef.current(editor, selected || editing);
	}, [editor, selected, editing]);

	useEffect(() =>
	{
		if(editor && html !== editor.getHTML()) editor.commands.setContent(html, { emitUpdate: false });
	}, [editor, html]);

	const empty = !!placeholder && isBlank(html);

	return (
		<div
			className={`relative h-full w-full ${color ? '' : 'text-text'}`}
			style={{ fontSize, fontFamily: font, fontWeight: bold ? 700 : undefined, color: color || undefined }}
		>
			<EditorContent editor={editor} className='h-full' />
			{empty && (
				<span
					aria-hidden='true'
					// List boxes indent their text past the bullet; the placeholder follows suit.
					className={`pointer-events-none absolute inset-x-0 top-0 leading-tight text-text-subtle ${/^<(ul|ol)/.test(html) ? 'pl-[1.2em]' : ''}`}
					style={{ textAlign: alignmentOf(html) }}
				>
					{placeholder}
				</span>
			)}
		</div>
	);
};
