'use client';

import CodeMirror, { keymap, Prec, type Extension } from '@uiw/react-codemirror';
import { acceptCompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { useEffect, useState } from 'react';

export interface CodeEditorProps {
	/** The current code string. */
	value: string;
	/** Fires with the updated value on every edit. */
	onChange: (value: string) => void;
	/** Extra CodeMirror extensions layered on top of the built-ins, e.g. a project-specific `autocompletion({ override: [...] })` call. */
	extensions?: Extension[];
	/** Accessible name for the editor region. */
	'aria-label'?: string;
	/** Additional classes on the root wrapper. */
	className?: string;
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

const BASE_EXTENSIONS = [javascript({ jsx: true }), escapeBlurKeymap, tabAcceptCompletionKeymap];

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

const CodeEditor = ({ value, onChange, extensions = [], className = '', 'aria-label': ariaLabel, minHeight }: CodeEditorProps) => {
	const isDark = useIsDarkMode();

	return (
		<div className={`rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border overflow-hidden text-sm ${className}`}>
			<CodeMirror
				value={value}
				onChange={onChange}
				extensions={[...BASE_EXTENSIONS, ...extensions]}
				theme={isDark ? 'dark' : 'light'}
				basicSetup={{ foldGutter: false }}
				aria-label={ariaLabel}
				minHeight={minHeight}
			/>
		</div>
	);
};

export default CodeEditor;
