import { snippet, snippetCompletion, type Completion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';
import { CORE_COMMANDS, ENVIRONMENTS, PACKAGE_COMMANDS, PACKAGES, type Entry } from './latexCommands';
import type { EditorView } from '@uiw/react-codemirror';

const UNLOADED_BOOST = -30;
const USED_BOOST = -10;
const DEFINED_BOOST = 5;

const unique = (values: string[]) => [...new Set(values)];

const matches = (text: string, pattern: RegExp) => unique([...text.matchAll(pattern)].map(([, name]) => name));

const nameOf = (template: string) => /^\\[a-zA-Z]+\*?/.exec(template)![0];

const entryOption = ([template, detail]: Entry, extra: Partial<Completion> = {}): Completion => {
	const option = { label: nameOf(template), detail, type: 'keyword', ...extra };

	return template.includes('${') ? snippetCompletion(template, { ...option, type: 'function' }) : option;
};

const loadedPackages = (text: string) =>
	new Set(matches(text, /\\usepackage(?:\[[^\]]*\])?\{([^}]*)\}/g).flatMap((names) => names.split(',').map((name) => name.trim())));

const packageLine = (text: string, name: string) => {
	const end = text.indexOf('\\begin{document}');
	const preamble = end < 0 ? text : text.slice(0, end);
	const last = [...preamble.matchAll(/^[^%\n]*\\(?:usepackage|documentclass)[^\n]*$/gm)].at(-1);
	if(!last) return { from: 0, insert: `\\usepackage{${name}}\n` };

	return { from: last.index + last[0].length, insert: `\n\\usepackage{${name}}` };
};

const needsPackage = ([template, detail]: Entry, name: string): Completion => {
	const insert = snippet(template);

	return {
		label: nameOf(template),
		detail: `${detail} · needs ${name}`,
		type: template.includes('${') ? 'function' : 'keyword',
		boost: UNLOADED_BOOST,
		apply: (view, completion, from, to) => {
			const changes = view.state.changes(packageLine(view.state.doc.toString(), name));
			view.dispatch({ changes });
			insert(view, completion, changes.mapPos(from, 1), changes.mapPos(to, 1));
		},
	};
};

const withArguments = (name: string, count: number) => name + '{${}}'.repeat(count);

const definedCommands = (text: string): Entry[] => [
	...[...text.matchAll(/\\(?:newcommand|renewcommand|providecommand|DeclareRobustCommand)\*?\s*\{?(\\[a-zA-Z@]+)\}?\s*(?:\[(\d)\])?/g)]
		.map(([, name, count]): Entry => [withArguments(name, Number(count ?? 0)), 'defined in this document']),
	...[...text.matchAll(/\\def(\\[a-zA-Z@]+)((?:#\d)*)/g)]
		.map(([, name, params]): Entry => [withArguments(name, params.length / 2), 'defined in this document']),
	...matches(text, /\\DeclareMathOperator\*?\s*\{?(\\[a-zA-Z]+)\}?/g)
		.map((name): Entry => [name, 'math operator defined in this document']),
];

const commandOptions = (text: string): Completion[] => {
	const loaded = loadedPackages(text);
	const options = new Map<string, Completion>();

	for(const entry of CORE_COMMANDS) options.set(nameOf(entry[0]), entryOption(entry));

	for(const [name, entries] of Object.entries(PACKAGE_COMMANDS))
	{
		for(const entry of entries) options.set(nameOf(entry[0]), loaded.has(name) ? entryOption(entry) : needsPackage(entry, name));
	}

	for(const entry of definedCommands(text)) options.set(nameOf(entry[0]), entryOption(entry, { boost: DEFINED_BOOST }));

	for(const name of matches(text, /(\\[a-zA-Z@]{2,})/g))
	{
		if(!options.has(name)) options.set(name, { label: name, detail: 'used in this document', type: 'text', boost: USED_BOOST });
	}

	return [...options.values()];
};

// A typed "{" is auto-closed, so the "}" already after the cursor is replaced, not doubled.
const fill = (insert: string, cursor = insert.length) => (view: EditorView, _completion: Completion, from: number, to: number) => {
	const end = view.state.sliceDoc(to, to + 1) === '}' ? to + 1 : to;
	view.dispatch({ changes: { from, to: end, insert }, selection: { anchor: from + cursor }, userEvent: 'input.complete' });
};

const unclosed = (text: string) => {
	const stack: string[] = [];

	for(const [, kind, name] of text.matchAll(/\\(begin|end)\{([a-zA-Z*]+)\}/g))
	{
		if(kind === 'begin') stack.push(name);
		else if(stack.at(-1) === name) stack.pop();
	}

	return stack.reverse();
};

const afterBrace = (match: { from: number; text: string }) => match.from + match.text.lastIndexOf('{') + 1;

export const latexComplete = (context: CompletionContext): CompletionResult | null => {
	const environment = context.matchBefore(/\\(begin|end)\{[a-zA-Z*]*/);
	if(environment)
	{
		const closing = environment.text.startsWith('\\end');
		const defined = matches(context.state.doc.toString(), /\\(?:newenvironment|renewenvironment|newtheorem)\*?\{([a-zA-Z*]+)\}/g);
		const names = closing ? unclosed(context.state.sliceDoc(0, environment.from)) : unique([...defined, ...ENVIRONMENTS]);
		const options = names.map((name): Completion => ({
			label: name,
			type:  'class',
			apply: closing ? fill(`${name}}`) : fill(`${name}}\n\t\n\\end{${name}}`, name.length + 3),
		}));

		return { from: afterBrace(environment), options, validFor: /^[a-zA-Z*]*$/ };
	}

	const packages = context.matchBefore(/\\usepackage(\[[^\]]*\])?\{[a-zA-Z0-9,-]*/);
	if(packages)
	{
		const options = PACKAGES.map((name): Completion => ({ label: name, type: 'namespace', apply: fill(`${name}}`) }));

		return { from: packages.from + Math.max(packages.text.lastIndexOf('{'), packages.text.lastIndexOf(',')) + 1, options, validFor: /^[a-zA-Z0-9-]*$/ };
	}

	const reference = context.matchBefore(/\\(ref|eqref|pageref|autoref|cref)\{[^}]*/);
	if(reference)
	{
		const options = matches(context.state.doc.toString(), /\\label\{([^}]*)\}/g).map((key): Completion => ({ label: key, type: 'variable', apply: fill(`${key}}`) }));

		return { from: afterBrace(reference), options, validFor: /^[^}]*$/ };
	}

	const command = context.matchBefore(/\\[a-zA-Z]*/);
	if(!command) return null;

	const others = context.state.sliceDoc(0, command.from) + context.state.sliceDoc(command.to);

	return { from: command.from, options: commandOptions(others), validFor: /^\\[a-zA-Z]*$/ };
};
