'use client';

import CodeMirror, { EditorView, keymap, Prec, type Extension, type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { acceptCompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';

export interface CodeEditorHandle {
	/** Selects the 1-based line, scrolls it to the middle of the editor and focuses the editor. */
	revealLine: (line: number) => void;
}

export interface CodeEditorProps {
	ref?: Ref<CodeEditorHandle>;
	value: string;
	onChange: (value: string) => void;
	/** Extra CodeMirror extensions layered on top of the built-ins, e.g. a project-specific `autocompletion({ override: [...] })` call. */
	extensions?: Extension[];
	/** Accessible name for the editor region. */
	'aria-label'?: string;
	className?: string;
	/** Language support extension. Defaults to JSX/JavaScript; pass `latex` (exported alongside) or any CodeMirror language. */
	language?: Extension;
	/** Wrap long lines instead of scrolling horizontally. */
	wrap?: boolean;
	/** CSS height for the editor surface (e.g. `'100%'` to fill a sized parent). Defaults to the content height. */
	height?: string;
	/** CSS min-height for the editor surface (e.g. `'200px'`). Keeps the editor from collapsing to a single line on short content. */
	minHeight?: string;
}

/** Escape blurs the editor: the accessible way out now that Tab is used for indentation
 * (the same "Escape returns focus" convention this repo already uses for overlays). */
const escapeBlurKeymap = keymap.of([
	{
		key: 'Escape',
		run: (view) => {
			view.contentDOM.blur();
			return true;
		},
	},
]);

/** Tab accepts the selected autocomplete suggestion when the popup is open. `acceptCompletion`
 * returns false when no completion is active, so Tab falls through to normal indentation. */
const tabAcceptCompletionKeymap = Prec.highest(keymap.of([
	{ key: 'Tab', run: acceptCompletion },
]));

const JSX_LANGUAGE = javascript({ jsx: true });

const BASE_EXTENSIONS = [escapeBlurKeymap, tabAcceptCompletionKeymap];

const useIsDarkMode = (): boolean => {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsDark(root.classList.contains('dark'));

		const observer = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
		observer.observe(root, { attributes: true, attributeFilter: ['class'] });

		return () => observer.disconnect();
	}, []);

	return isDark;
};

const CodeEditor = ({ ref, value, onChange, extensions = [], language = JSX_LANGUAGE, wrap = false, className = '', 'aria-label': ariaLabel, height, minHeight }: CodeEditorProps) => {
	const isDark = useIsDarkMode();
	const editorRef = useRef<ReactCodeMirrorRef>(null);

	useImperativeHandle(ref, () => ({
		revealLine: (number) => {
			const view = editorRef.current?.view;
			if(!view) return;

			const line = view.state.doc.line(Math.min(Math.max(number, 1), view.state.doc.lines));
			view.dispatch({ selection: { anchor: line.from, head: line.to }, effects: EditorView.scrollIntoView(line.from, { y: 'center' }) });
			view.focus();
		},
	}));

	return (
		<div className={`rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border overflow-hidden text-sm ${height ? '[&>div]:h-full' : ''} ${className}`}>
			<CodeMirror
				ref={editorRef}
				value={value}
				onChange={onChange}
				extensions={[language, ...(wrap ? [EditorView.lineWrapping] : []), ...BASE_EXTENSIONS, ...extensions]}
				height={height}
				theme={isDark ? 'dark' : 'light'}
				basicSetup={{ foldGutter: false }}
				aria-label={ariaLabel}
				minHeight={minHeight}
			/>
		</div>
	);
};

export default CodeEditor;
