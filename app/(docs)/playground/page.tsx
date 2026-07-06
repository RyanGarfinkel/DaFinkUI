'use client';

import { autocompletion, type Completion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';
import { PlaygroundErrorBoundary } from '@/app/_docs/components/PlaygroundErrorBoundary';
import { PLAYGROUND_SCOPE, deriveImports } from '@/app/_docs/registry/playgroundScope';
import { evaluateBody, ensureReturn } from '@/app/_docs/registry/playgroundRuntime';
import { ComponentPreview } from '@/app/_docs/components/ComponentPreview';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import CodeEditor from '@/src/components/CodeEditor/CodeEditor';
import { Popover } from '@/src/components/Popover/Popover';
import { Alert } from '@/src/components/Alert/Alert';
import Button from '@/src/components/Button/Button';
import type { EditorView } from '@codemirror/view';
import { registry } from '@/app/_docs/registry';
import { useState } from 'react';
import * as React from 'react';

const DEFAULT_CODE = '<Button variant="primary">Click me</Button>';

/** Suggests registry component names — triggers after `<` (tag position) or on any identifier,
 * so typing `<Bu` or just `Bu` both offer `Button` with its description as a hint. */
const componentCompletionSource = (context: CompletionContext): CompletionResult | null => {
	const word = context.matchBefore(/<?[A-Za-z]*/);
	if (!word) return null;
	if (word.from === word.to && !context.explicit) return null;

	const isTag = word.text.startsWith('<');
	const query = (isTag ? word.text.slice(1) : word.text).toLowerCase();
	const from = isTag ? word.from + 1 : word.from;

	const options = registry
		.filter((entry) => entry.name.toLowerCase().startsWith(query))
		.map((entry) => ({ label: entry.name, type: 'class', info: entry.description }));

	if (options.length === 0) return null;

	return { from, options, validFor: /^[A-Za-z]*$/ };
};

/** Suggests prop names for the nearest unclosed JSX tag before the cursor — e.g. inside
 * `<Button ` it offers `variant`, `size`, etc. from that component's registry entry. */
const propCompletionSource = (context: CompletionContext): CompletionResult | null => {
	const textBefore = context.state.sliceDoc(0, context.pos);
	const lastOpen = textBefore.lastIndexOf('<');
	const lastClose = textBefore.lastIndexOf('>');
	if (lastOpen === -1 || lastOpen < lastClose) return null;

	const tagMatch = /^<([A-Za-z][A-Za-z0-9]*)/.exec(textBefore.slice(lastOpen));
	if (!tagMatch) return null;

	const word = context.matchBefore(/[A-Za-z]*/);
	if (!word) return null;
	if (word.from === lastOpen + 1) return null;
	if (word.from === word.to && !context.explicit) return null;

	const entry = registry.find((candidate) => candidate.name === tagMatch[1]);
	if (!entry) return null;

	const query = word.text.toLowerCase();
	const options = entry.props
		.filter((prop) => prop.name !== 'children' && prop.name.toLowerCase().startsWith(query))
		.map((prop) => ({
			label:  prop.name,
			type:   'property',
			info:   `${prop.type} — ${prop.description}`,
			apply:  prop.type === 'boolean'
				? prop.name
				: (view: EditorView, _completion: Completion, from: number, to: number) => {
					const insert = `${prop.name}=""`;
					view.dispatch({
						changes:   { from, to, insert },
						selection: { anchor: from + prop.name.length + 2 },
					});
				},
		}));

	if (options.length === 0) return null;

	return { from: word.from, options, validFor: /^[A-Za-z]*$/ };
};

const PLAYGROUND_EXTENSIONS = [
	autocompletion({ override: [componentCompletionSource, propCompletionSource] }),
];

const PlaygroundPage = () => {
	const [code, setCode] = useState(DEFAULT_CODE);
	const [copied, setCopied] = useState(false);

	let preview: React.ReactNode = null;
	let previewError: string | null = null;

	try {
		preview = evaluateBody(ensureReturn(code), PLAYGROUND_SCOPE);
	}
	catch (err) {
		previewError = err instanceof Error ? err.message : 'Could not render this code.';
	}

	const importLines = deriveImports(code, registry);
	const fullCode = `${importLines.join('\n')}\n\nexport default function Example() {\n${ensureReturn(code)}\n}`;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(fullCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
		catch {
			// clipboard unavailable — silently ignore
		}
	};

	return (
		<div className='flex flex-col gap-10'>
			<div className='flex flex-col gap-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-text'>Playground</h1>
				<p className='text-base text-text-muted leading-relaxed'>
					Write JSX in the editor — browse components on the side for usage examples. Imports are derived automatically when you copy.
				</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8'>
				<section className='flex flex-col gap-6 min-w-0'>
					<div className='flex flex-col gap-3'>
						<h2 className='text-sm font-semibold text-text uppercase tracking-wide'>Preview</h2>
						<ComponentPreview>
							{previewError ? (
								<Alert variant='danger' title="Couldn't render this code">
									{previewError}
								</Alert>
							) : (
								<PlaygroundErrorBoundary resetKey={code}>
									<div className='flex flex-col items-center gap-6'>{preview}</div>
								</PlaygroundErrorBoundary>
							)}
						</ComponentPreview>
					</div>

					<div className='flex flex-col gap-3'>
						<div className='flex items-center justify-between'>
							<h2 className='text-sm font-semibold text-text uppercase tracking-wide'>Editor</h2>
							<Button variant='outlined' size='sm' onClick={handleCopy}>
								{copied ? 'Copied' : 'Copy'}
							</Button>
						</div>
						<p className='text-sm text-text-muted'>Write JSX directly — no imports and no return statement needed. Tab indents or accepts a suggestion; Escape moves focus out of the editor.</p>
						<CodeEditor
							value={code}
							onChange={setCode}
							extensions={PLAYGROUND_EXTENSIONS}
							aria-label='JSX code editor'
							minHeight='240px'
						/>
					</div>
				</section>

				<section className='flex flex-col gap-3 min-w-0'>
					<h2 className='text-sm font-semibold text-text uppercase tracking-wide'>Components</h2>
					<p className='text-sm text-text-muted'>Click a name to see how it&apos;s used.</p>
					<div className='flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1'>
						{registry.map((entry) => (
							<Popover
								key={entry.slug}
								trigger={entry.name}
								label={`${entry.name} usage`}
								side='left'
								align='start'
								triggerClassName='!justify-start !border-0 !bg-transparent !px-2 !py-1.5 !text-sm hover:!bg-surface-hover'
							>
								<div className='flex flex-col gap-2 max-w-sm max-h-80 overflow-y-auto'>
									<div className='flex flex-col gap-0.5'>
										<p className='text-sm font-semibold text-text'>{entry.name}</p>
										<p className='text-xs text-text-muted'>{entry.description}</p>
									</div>
									<CodeBlock code={entry.usage} />
								</div>
							</Popover>
						))}
					</div>
				</section>
			</div>
		</div>
	);
};

export default PlaygroundPage;
