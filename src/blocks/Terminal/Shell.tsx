'use client';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Button from '../../components/Button/Button';
import type { ShellEntry } from './types';
import { CloseIcon } from './icons';

interface ShellProps {
	entries: ShellEntry[];
	running: boolean;
	onRun:   (command: string) => void;
	onClear: () => void;
	onClose: () => void;
}

export const Shell = ({ entries, running, onRun, onClear, onClose }: ShellProps) => {
	const [draft, setDraft] = useState('');
	const [historyIndex, setHistoryIndex] = useState<number | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() =>
	{
		const el = scrollRef.current;
		if(el) el.scrollTop = el.scrollHeight;
	}, [entries, running]);

	useEffect(() =>
	{
		if(!running) inputRef.current?.focus({ preventScroll: true });
	}, [running]);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		const command = draft.trim();
		if(!command || running) return;

		setDraft('');
		setHistoryIndex(null);

		if(command === 'clear') onClear();
		else onRun(command);
	};

	const recallHistory = (e: KeyboardEvent<HTMLInputElement>) => {
		if((e.key !== 'ArrowUp' && e.key !== 'ArrowDown') || entries.length === 0) return;
		e.preventDefault();

		const last = entries.length - 1;
		const next = e.key === 'ArrowUp'
			? Math.max(0, (historyIndex ?? entries.length) - 1)
			: historyIndex === null || historyIndex >= last ? null : historyIndex + 1;

		setHistoryIndex(next);
		setDraft(next === null ? '' : entries[next].command);
	};

	return (
		<div className='flex h-full flex-col bg-surface'>
			<div className='flex h-8 shrink-0 items-center justify-between border-b-[length:var(--border-width)] border-surface-border pl-3 pr-1'>
				<span className='text-xs font-semibold uppercase tracking-wide text-text-muted'>Terminal</span>

				<Button variant='ghost' size='icon-sm' aria-label='Close terminal' onClick={onClose}>
					<CloseIcon />
				</Button>
			</div>

			<div
				ref={scrollRef}
				onClick={() => inputRef.current?.focus()}
				className='min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-xs text-text'
			>
				{entries.length === 0 && <p className='text-text-muted'>Type &quot;help&quot; to see available commands.</p>}

				{entries.map((entry) => (
					<div key={entry.id} className='mb-2'>
						<p><span className='text-text-muted'>$</span> {entry.command}</p>
						{entry.output && (
							<pre className={`whitespace-pre-wrap break-words ${entry.error ? 'text-danger' : 'text-text-muted'}`}>{entry.output}</pre>
						)}
					</div>
				))}

				<form onSubmit={submit} className='flex items-center gap-2'>
					<span className='text-text-muted' aria-hidden='true'>$</span>
					<input
						ref={inputRef}
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={recallHistory}
						disabled={running}
						aria-label='Terminal command'
						autoComplete='off'
						spellCheck={false}
						className='min-w-0 flex-1 bg-transparent text-text outline-none focus-visible:outline-none disabled:opacity-60'
					/>
				</form>
			</div>
		</div>
	);
};

export default Shell;
