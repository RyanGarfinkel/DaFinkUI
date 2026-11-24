import { CompletionContext, type Completion, type CompletionResult } from '@codemirror/autocomplete';
import { EditorState, EditorView } from '@uiw/react-codemirror';
import { latexComplete } from './latexComplete';
import { describe, it, expect } from 'vitest';

const complete = (doc: string) => {
	const pos = doc.indexOf('|');
	const text = doc.replace('|', '');
	const state = EditorState.create({ doc: text });

	return { result: latexComplete(new CompletionContext(state, pos, true)) as CompletionResult, state, pos };
};

const labels = (result: CompletionResult | null) => result?.options.map((option) => option.label);

const apply = (doc: string, label: string) => {
	const { result, state, pos } = complete(doc);
	const view = new EditorView({ state });
	const option = result.options.find((candidate) => candidate.label === label) as Completion;

	(option.apply as (view: EditorView, completion: Completion, from: number, to: number) => void)(view, option, result.from, pos);

	return { text: view.state.doc.toString(), cursor: view.state.selection.main.head };
};

describe('latexComplete', () =>
{
	it('suggests commands after a backslash', () =>
	{
		const { result } = complete('\\sec|');

		expect(result.from).toBe(0);
		expect(labels(result)).toContain('\\section');
		expect(labels(result)).toContain('\\textbf');
	});

	it('suggests nothing in plain text', () =>
	{
		expect(complete('hello wor|').result).toBeNull();
	});

	it('suggests environments inside \\begin{', () =>
	{
		const { result } = complete('\\begin{eq|');

		expect(result.from).toBe(7);
		expect(labels(result)).toContain('equation');
		expect(labels(result)).toContain('itemize');
	});

	it('closes the environment it opens and leaves the cursor inside', () =>
	{
		expect(apply('\\begin{item|}', 'itemize')).toEqual({ text: '\\begin{itemize}\n\t\n\\end{itemize}', cursor: 17 });
	});

	it('only offers environments that are still open after \\end{', () =>
	{
		const { result } = complete('\\begin{document}\n\\begin{center}\nx\n\\end{center}\n\\begin{itemize}\n\\end{|');

		expect(labels(result)).toEqual(['itemize', 'document']);
	});

	it('fills the name for \\end{ without doubling the closing brace', () =>
	{
		expect(apply('\\begin{itemize}\n\\end{|}', 'itemize').text).toBe('\\begin{itemize}\n\\end{itemize}');
	});

	it('suggests packages in \\usepackage{ and after a comma', () =>
	{
		expect(labels(complete('\\usepackage{ams|').result)).toContain('amsmath');

		const { result } = complete('\\usepackage{amsmath,gra|');
		expect(result.from).toBe(20);
		expect(labels(result)).toContain('graphicx');
	});

	it('suggests the labels defined in the document inside \\ref{', () =>
	{
		const { result } = complete('\\label{eq:growth} \\label{sec:intro} \\label{eq:growth}\n\\ref{|');

		expect(labels(result)).toEqual(['eq:growth', 'sec:intro']);
	});
});

describe('latexComplete from the document', () =>
{
	const find = (doc: string, label: string) => complete(doc).result.options.find((option) => option.label === label);

	it('marks a package command that is not loaded and ranks it lower', () =>
	{
		const option = find('\\documentclass{article}\n\\includegr|', '\\includegraphics');

		expect(option?.detail).toContain('needs graphicx');
		expect(option?.boost).toBeLessThan(0);
	});

	it('shows a package command normally once the package is loaded', () =>
	{
		const option = find('\\usepackage{graphicx}\n\\includegr|', '\\includegraphics');

		expect(option?.detail).toBe('insert an image');
		expect(option?.boost).toBeUndefined();
	});

	it('adds the missing \\usepackage line below the last package when one is picked', () =>
	{
		const { text } = apply('\\documentclass{article}\n\\usepackage{amsmath}\n\\begin{document}\n\\includegr|\n\\end{document}', '\\includegraphics');

		expect(text.split('\n').slice(0, 3)).toEqual(['\\documentclass{article}', '\\usepackage{amsmath}', '\\usepackage{graphicx}']);
		expect(text).toContain('\\includegraphics[width=0.8\\linewidth]{file}');
	});

	it('puts the line first when there is no preamble', () =>
	{
		expect(apply('\\toprul|', '\\toprule').text).toBe('\\usepackage{booktabs}\n\\toprule');
	});

	it('suggests commands defined with \\newcommand, with their argument count', () =>
	{
		const option = find('\\newcommand{\\vect}[2]{#1 #2}\n\\ve|', '\\vect');

		expect(option?.detail).toBe('defined in this document');
		expect(option?.boost).toBeGreaterThan(0);
		expect(apply('\\newcommand{\\vect}[2]{#1 #2}\n\\ve|', '\\vect').text).toContain('\\vect{}{}');
	});

	it('suggests commands defined with \\def and \\DeclareMathOperator', () =>
	{
		const { result } = complete('\\def\\pair#1#2{}\n\\DeclareMathOperator{\\argmax}{arg\\,max}\n\\|');

		expect(labels(result)).toContain('\\pair');
		expect(labels(result)).toContain('\\argmax');
		expect(apply('\\def\\pair#1#2{}\n\\pa|', '\\pair').text).toContain('\\pair{}{}');
	});

	it('suggests commands already used in the document, but never the one being typed', () =>
	{
		const { result } = complete('\\sidewaysfigure x \\sidewaysfig|');

		expect(result.options.filter((option) => option.label === '\\sidewaysfigure')).toHaveLength(1);
		expect(labels(result)).not.toContain('\\sidewaysfig');
	});

	it('lets a redefined command replace the built-in one', () =>
	{
		const matching = complete('\\renewcommand{\\section}[1]{#1}\n\\sect|').result.options.filter((option) => option.label === '\\section');

		expect(matching).toHaveLength(1);
		expect(matching[0].detail).toBe('defined in this document');
	});

	it('lists environments the document defines inside \\begin{', () =>
	{
		const { result } = complete('\\newenvironment{callout}{}{}\n\\newtheorem{claim}{Claim}\n\\begin{|');

		expect(labels(result)).toContain('callout');
		expect(labels(result)).toContain('claim');
		expect(labels(result)).toContain('itemize');
	});
});
