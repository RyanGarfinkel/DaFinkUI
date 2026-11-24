'use client';

import { ResizablePanel, ResizableHandle, Resizable } from '../../components/Resizable/Resizable';
import CodeEditor, { CodeEditorHandle } from '../../components/CodeEditor/CodeEditor';
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { PdfViewer, PagePoint } from '../../components/PdfViewer/PdfViewer';
import { ChevronDownIcon } from '../../components/Icons/Icons';
import { latex } from '../../components/CodeEditor/latex';
import { Alert } from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import Menu from '../../components/Menu/Menu';
import { SyncPoint, lineAt } from './sync';
import { SAMPLE_SOURCE } from './sample';
import { compileLatex } from './compile';

type View = 'source' | 'split' | 'pdf';
type Status = 'compiling' | 'ready' | 'error';

const SPLIT_SIZE = { initial: 480, min: 240 };
const SPLIT_MIN_WIDTH = SPLIT_SIZE.min * 2 + 16;
const AUTO_COMPILE_DELAY_MS = 800;
const LAYOUTS: { value: View; label: string }[] = [
	{ value: 'source', label: 'Source only' },
	{ value: 'split', label: 'Split' },
	{ value: 'pdf', label: 'PDF only' },
];
const FULL_WIDTH = { width: 'auto', flexGrow: 1, flexShrink: 1 } as const;
const STATUS_LABEL: Partial<Record<Status, string>> = {
	compiling: 'Compiling…',
	error:     'Compile failed',
};

export const LatexEditor = () => {
	const [view, setView] = useState<View>('split');
	const [source, setSource] = useState(SAMPLE_SOURCE);
	const [status, setStatus] = useState<Status>('compiling');
	const [pdf, setPdf] = useState<Uint8Array | null>(null);
	const [sync, setSync] = useState<SyncPoint[]>([]);
	const [error, setError] = useState('');
	const [auto, setAuto] = useState(false);
	const [width, setWidth] = useState(0);
	const [controls, setControls] = useState<HTMLDivElement | null>(null);
	const bodyRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<CodeEditorHandle>(null);
	const runs = useRef(0);

	const compile = useCallback(async () => {
		const run = ++runs.current;
		setStatus('compiling');

		try
		{
			const compiled = await compileLatex(source);
			if(run !== runs.current) return;

			setPdf(compiled.pdf);
			setSync(compiled.sync);
			setError('');
			setStatus('ready');
		}
		catch(reason)
		{
			if(run !== runs.current) return;

			setError(reason instanceof Error ? reason.message : 'The document could not be compiled.');
			setStatus('error');
		}
	}, [source]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void compile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if(!auto) return;

		const timer = setTimeout(() => void compile(), AUTO_COMPILE_DELAY_MS);
		return () => clearTimeout(timer);
	}, [auto, compile]);

	useEffect(() => {
		const body = bodyRef.current;
		if(!body) return;

		const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
		observer.observe(body);

		return () => observer.disconnect();
	}, []);

	const compact = width > 0 && width < SPLIT_MIN_WIDTH;
	const layout = compact && view === 'split' ? 'source' : view;
	const layouts = compact ? LAYOUTS.filter(({ value }) => value !== 'split') : LAYOUTS;

	const handleDoubleClick = ({ page, x, y }: PagePoint) => {
		const line = lineAt(sync, page, x, y);
		if(line === null) return;

		if(layout === 'pdf') setView(compact ? 'source' : 'split');
		requestAnimationFrame(() => editorRef.current?.revealLine(line));
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if(event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;

		event.preventDefault();
		void compile();
	};

	return (
		<section
			aria-label='LaTeX editor'
			onKeyDown={handleKeyDown}
			className='flex h-[40rem] w-full flex-col overflow-hidden rounded-lg border border-border bg-surface'
		>
			<div className='flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2'>
				<Menu
					trigger={<span className='inline-flex items-center gap-1.5'>Layout <ChevronDownIcon /></span>}
					items={layouts.map(({ value, label }) => ({ label, selected: layout === value, onSelect: () => setView(value) }))}
				/>

				<div className='flex flex-wrap items-center justify-end gap-3'>
					<div ref={setControls} className='contents' />
					<span role='status' className='text-xs text-text-muted'>{STATUS_LABEL[status]}</span>
					<div className='inline-flex'>
						<Button size='sm' loading={status === 'compiling'} aria-keyshortcuts='Control+Enter Meta+Enter' className='!rounded-r-none' onClick={() => void compile()}>
							Compile
						</Button>
						<Menu
							align='end'
							unstyledTrigger
							trigger={<ChevronDownIcon />}
							triggerProps={{ 'aria-label': 'Compile options' }}
							triggerClassName='inline-flex h-8 w-8 items-center justify-center rounded-r-[var(--radius)] border-l border-brand-fg/30 bg-brand text-brand-fg hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2'
							items={[
								{ label: 'Compile now', detail: 'Ctrl+Enter', onSelect: () => void compile() },
								{ separator: true },
								{ label: 'Auto-compile', selected: auto, onSelect: () => setAuto(!auto) },
							]}
						/>
					</div>
				</div>
			</div>

			{error && (
				<Alert variant='danger' title='Could not compile' className='m-3 shrink-0'>
					{error}
				</Alert>
			)}

			<div ref={bodyRef} className='flex min-h-0 flex-1'>
			<Resizable direction='horizontal' className='min-w-0 flex-1'>
				<ResizablePanel
					defaultSize={SPLIT_SIZE.initial}
					minSize={SPLIT_SIZE.min}
					maxSize={width ? width - SPLIT_SIZE.min : undefined}
					onSnap={() => setView('source')}
					onCollapse={() => setView('pdf')}
					style={layout === 'split' ? undefined : FULL_WIDTH}
					className={layout === 'pdf' ? 'hidden' : 'flex'}
				>
					<CodeEditor
						ref={editorRef}
						language={latex}
						value={source}
						onChange={setSource}
						wrap
						height='100%'
						aria-label='LaTeX source'
						className='h-full min-w-0 flex-1 rounded-none border-0'
					/>
				</ResizablePanel>

				{layout === 'split' && <ResizableHandle aria-label='Resize source and PDF' />}

				<ResizablePanel minSize={SPLIT_SIZE.min} className={layout === 'source' ? 'hidden' : 'flex'}>
					{pdf ? (
						<PdfViewer src={pdf} height='100%' toolbarTarget={layout === 'source' ? null : controls} onPageDoubleClick={handleDoubleClick} className='rounded-none border-0' />
					) : (
						<div className='flex flex-1 items-center justify-center text-sm text-text-muted'>
							{status === 'compiling' ? 'Compiling…' : 'No PDF yet.'}
						</div>
					)}
				</ResizablePanel>
			</Resizable>
			</div>
		</section>
	);
};

export default LatexEditor;
