'use client';

import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup';
import { useState, useEffect, useRef } from 'react';

export type CodeBlockVariant = 'code' | 'example';

export interface CodeBlockProps
{
	/** The raw source code string shown in the code panel. */
	code:             string;
	/** Preview content for variant="example". */
	children?:        React.ReactNode;
	/** variant="code" renders a syntax block; variant="example" adds a Preview/Code switcher. */
	variant?:         CodeBlockVariant;
	/** Accessible label for the tab group (example variant only). Defaults to "example". */
	label?:           string;
	/** Minimum height of the preview pane (example variant only). Defaults to "200px". */
	minHeight?:       string;
	/** Alignment of preview content (example variant only). Defaults to "center". */
	align?:           'center' | 'start';
	/** Additional classes on the root wrapper. */
	className?:       string;
	/** When true, renders an editable textarea instead of a read-only pre block. */
	editable?:        boolean;
	/** Fires with the updated value whenever the user edits the code. */
	onCodeChange?:    (code: string) => void;
}

const CopyIcon = () => (
	<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
		<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
	</svg>
);

const CheckIcon = () => (
	<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

const CodePanel = ({ code, editable, onCodeChange }: { code: string; editable?: boolean; onCodeChange?: (code: string) => void }) =>
{
	const [copied, setCopied] = useState(false);
	const [isOverflowing, setIsOverflowing] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const preRef = useRef<HTMLPreElement>(null);

	useEffect(() =>
	{
		const el = preRef.current;
		if(!el) return;

		const observer = new ResizeObserver(() =>
		{
			setIsOverflowing(el.scrollWidth > el.clientWidth);
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const currentCode = () => editable && textareaRef.current ? textareaRef.current.value : code;

	const handleCopy = async () =>
	{
		try
		{
			await navigator.clipboard.writeText(currentCode());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
		catch
		{
			// clipboard unavailable — silently ignore
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) =>
	{
		if(e.key !== 'Tab') return;

		e.preventDefault();

		const el = e.currentTarget;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const next = el.value.slice(0, start) + '  ' + el.value.slice(end);

		el.value = next;
		el.selectionStart = start + 2;
		el.selectionEnd = start + 2;

		onCodeChange?.(next);
	};

	const lineCount = code.split('\n').length;

	return (
		<div className='relative w-full'>
			{editable ? (
				<textarea
					ref={textareaRef}
					defaultValue={code}
					rows={lineCount}
					spellCheck={false}
					autoCapitalize='off'
					autoCorrect='off'
					onChange={(e) => onCodeChange?.(e.target.value)}
					onKeyDown={handleKeyDown}
					className='bg-surface-active text-text font-mono text-sm p-4 rounded-[var(--radius-lg)] w-full resize-none outline-none'
				/>
			) : (
				<pre
					ref={preRef}
					tabIndex={isOverflowing ? 0 : -1}
					role={isOverflowing ? 'region' : undefined}
					aria-label={isOverflowing ? 'Code sample' : undefined}
					className={[
						'bg-surface-active text-text font-mono text-sm p-4 rounded-[var(--radius-lg)] overflow-x-auto w-full',
						isOverflowing ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring' : '',
					].join(' ').trim()}
				>
					<code>{code}</code>
				</pre>
			)}
			<button
				type='button'
				onClick={handleCopy}
				aria-label={copied ? 'Copied' : 'Copy to clipboard'}
				className='
					absolute right-3 top-3
					inline-flex items-center gap-1.5 rounded-[var(--radius)] px-2 py-1.5
					text-xs text-text-muted
					bg-surface border-[length:var(--border-width)] border-surface-border
					transition-colors duration-[var(--duration-fast)]
					hover:bg-surface-hover hover:text-text
					focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring
				'
			>
				{copied ? <><CheckIcon /><span>Copied</span></> : <CopyIcon />}
			</button>
		</div>
	);
};

export const CodeBlock = (
	{
		code,
		children,
		variant   = 'code',
		label     = 'example',
		minHeight = '200px',
		align     = 'center',
		className = '',
		editable,
		onCodeChange,
	}: CodeBlockProps
) =>
{
	const [tab, setTab] = useState<string>('preview');
	const [liveCode, setLiveCode] = useState(code);
	const [previewOverflowing, setPreviewOverflowing] = useState(false);

	const previewRef = useRef<HTMLDivElement>(null);

	useEffect(() =>
	{
		const el = previewRef.current;
		if(!el) return;

		const observer = new ResizeObserver(() =>
		{
			setPreviewOverflowing(el.scrollWidth > el.clientWidth);
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, [tab]);

	const handleCodeChange = (value: string) =>
	{
		setLiveCode(value);
		onCodeChange?.(value);
	};

	if(variant === 'code')
	{
		return (
			<div className={className}>
				<CodePanel code={editable ? liveCode : code} editable={editable} onCodeChange={handleCodeChange} />
			</div>
		);
	}

	return (
		<div className={`flex flex-col gap-0 ${className}`}>
			<div className='flex items-center gap-2 mb-3'>
				<ToggleGroup
					type='single'
					value={tab}
					onValueChange={(v) => { if(v) setTab(v as string); }}
					size='sm'
					aria-label={label}
				>
					<ToggleGroupItem value='preview'>Preview</ToggleGroupItem>
					<ToggleGroupItem value='code'>Code</ToggleGroupItem>
				</ToggleGroup>
			</div>

			{tab === 'preview' ? (
				<div
					ref={previewRef}
					role='tabpanel'
					aria-label='Preview'
					tabIndex={previewOverflowing ? 0 : undefined}
					style={{ minHeight }}
					className={[
						'rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-hover/30 p-4 sm:p-8 w-full',
						'flex flex-wrap overflow-x-auto',
						align === 'center' ? 'items-center justify-center' : 'items-start justify-start',
						previewOverflowing ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring' : '',
					].join(' ').trim()}
				>
					{children}
				</div>
			) : (
				<div role='tabpanel' aria-label='Code'>
					<CodePanel code={editable ? liveCode : code} editable={editable} onCodeChange={handleCodeChange} />
				</div>
			)}
		</div>
	);
};

export default CodeBlock;
