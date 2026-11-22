'use client';

import { addr, normalize, parseAddr, rawAt, type CellStyle, type ChartType, type EditHistory, type Pos, type Range, type Sheet, type SheetChart } from './sheet';
import { borderRange, clearRange, pasteBlock, resizeCol, setValue, shiftLines, styleRange, toDelimited, parseDelimited } from './ops';
import { ClipboardEvent, HTMLAttributes, KeyboardEvent, ReactNode, useId, useRef, useState } from 'react';
import { createEvaluator, SheetError, type Evaluator } from './formulas';
import { sheetAskContext, type SheetAskContext } from './askcontext';
import { Toolbar, TOOLBAR_BUTTON, type Download } from './Toolbar';
import { FunctionHints } from './FunctionHints';
import { suggestFunctions } from './functions';
import { FormulaInput } from './FormulaInput';
import { ChartStrip } from './ChartStrip';
import { parseRange } from './sheetops';
import { formulaRefs } from './refs';
import { Actions } from './Actions';
import { display } from './format';
import { Grid } from './Grid';

export { TOOLBAR_BUTTON as SHEET_TOOLBAR_BUTTON };

export interface SheetEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	sheet:       Sheet;
	/** Every edit, as the whole next sheet. Changes sharing a `coalesceKey` in a row (typing, a column drag) are one undo step. */
	onChange:    (next: Sheet, coalesceKey?: string) => void;
	/** Omit to hide the undo controls (e.g. when the host keeps no history). */
	history?:    EditHistory;
	/** Host actions in the top-right cluster, before Download (e.g. a save status). */
	toolbarEnd?: ReactNode;
	/** A host message for the status line. Shown instead of the editor's own messages while set. */
	status?:     string;
	/** Cells someone else is editing right now, in A1 notation ("B2:C5"): outlined, pulsing, and scrolled into view. */
	highlight?:  string;
	highlightLabel?: string;
	/** Adds an "Ask AI" button to the toolbar. It reports the selected cells so the host can send them to an agent. */
	onAsk?:      (context: SheetAskContext) => void;
}

type Move = 'down' | 'up' | 'left' | 'right' | 'none';

const MOVE_DELTAS: Record<Move, [number, number]> = { down: [1, 0], up: [-1, 0], left: [0, -1], right: [0, 1], none: [0, 0] };

const ARROWS: Record<string, [number, number]> = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

const PAGE_ROWS = 10;
const EDGE = 1_000_000;

const clamp = (n: number, size: number) => Math.max(0, Math.min(size - 1, n));

const isPrintable = (e: KeyboardEvent) => e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey;

const sameCell = (a: Pos, b: Pos) => a.r === b.r && a.c === b.c;

const rangeLabel = (a: Pos, b: Pos) => (sameCell(a, b) ? addr(a.r, a.c) : `${addr(Math.min(a.r, b.r), Math.min(a.c, b.c))}:${addr(Math.max(a.r, b.r), Math.max(a.c, b.c))}`);

const selectionStats = (sheet: Sheet, evaluator: Evaluator, range: Range) => {
	if(range.r1 === range.r2 && range.c1 === range.c2) return null;
	const numbers: number[] = [];
	Object.keys(sheet.cells).forEach(key =>
	{
		const pos = parseAddr(key)!;
		if(pos.r < range.r1 || pos.r > range.r2 || pos.c < range.c1 || pos.c > range.c2) return;
		const value = evaluator.valueAt(pos.r, pos.c);
		if(typeof value === 'number') numbers.push(value);
	});
	if(!numbers.length) return null;
	const sum = numbers.reduce((s, n) => s + n, 0);
	return { sum, average: sum / numbers.length, count: numbers.length };
};

const safeRange = (text: string) => {
	try
	{
		return parseRange(text);
	}
	catch
	{
		return null;
	}
};

const saveFile =(name: string, text: string, type: string) => {
	const url = URL.createObjectURL(new Blob([text], { type }));
	const link = document.createElement('a');
	link.href = url;
	link.download = name;
	link.click();
	URL.revokeObjectURL(url);
};

/** A spreadsheet editor with formulas. The host owns the sheet and its undo history; see spec.md. */
export const SheetEditor = ({
	sheet, onChange, history, toolbarEnd, status: hostStatus, highlight, highlightLabel = 'AI', onAsk, className = '', ...props
}: SheetEditorProps) => {
	const [anchor, setAnchor] = useState<Pos>({ r: 0, c: 0 });
	const [focus, setFocus] = useState<Pos>({ r: 0, c: 0 });
	const [draft, setDraftState] = useState<string | null>(null);
	const [draftFrom, setDraftFrom] = useState<'cell' | 'bar'>('cell');
	const [ownStatus, setOwnStatus] = useState('');
	const [hintIndex, setHintIndex] = useState(0);
	const hintsId = useId();

	const scrollerRef = useRef<HTMLDivElement>(null);
	const draftRef = useRef<string | null>(null);
	const pointRef = useRef<{ start: number; end: number; anchor: Pos; head: Pos } | null>(null);

	const a: Pos = { r: clamp(anchor.r, sheet.rows), c: clamp(anchor.c, sheet.cols) };
	const f: Pos = { r: clamp(focus.r, sheet.rows), c: clamp(focus.c, sheet.cols) };
	const range = normalize(a, f);
	const evaluator = createEvaluator(sheet);
	const activeCell = sheet.cells[addr(a.r, a.c)];
	const raw = rawAt(sheet, a.r, a.c);
	const highlightRange = highlight ? safeRange(highlight) : null;

	const stats = selectionStats(sheet, evaluator, range);

	const setDraft = (value: string | null) => {
		draftRef.current = value;
		if(value === null) pointRef.current = null;
		setHintIndex(0);
		setDraftState(value);
	};

	const hints = draft === null ? null : suggestFunctions(draft);
	const activeHint = hints ? Math.min(hintIndex, hints.matches.length - 1) : 0;

	const acceptHint = (name: string, input?: HTMLInputElement) => {
		const value = draftRef.current;
		if(value === null || !hints) return;
		const next = `${value.slice(0, hints.start)}${name}(`;
		setDraft(next);
		if(input) requestAnimationFrame(() => input.setSelectionRange(next.length, next.length));
	};

	const formulaKey = (e: KeyboardEvent<HTMLInputElement>) => {
		if(hints)
		{
			const step = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
			if(step)
			{
				setHintIndex((activeHint + step + hints.matches.length) % hints.matches.length);
				return true;
			}
			if(e.key === 'Tab' && !e.shiftKey || e.key === 'Enter')
			{
				pointRef.current = null;
				acceptHint(hints.matches[activeHint], e.currentTarget);
				return true;
			}
		}

		const delta = ARROWS[e.key];
		const value = draftRef.current;
		if(!delta)
		{
			if(!['Shift', 'Control', 'Meta', 'Alt'].includes(e.key)) pointRef.current = null;
			return false;
		}
		if(value === null || !value.startsWith('=') || e.metaKey || e.ctrlKey || e.altKey) return false;

		const input = e.currentTarget;
		let point = pointRef.current;
		if(!point)
		{
			const caret = input.selectionStart ?? 0;
			const expectsRef = caret === input.selectionEnd && !e.shiftKey && /[=+\-*/^&(,<>;]$/.test(value.slice(0, caret).trimEnd());
			if(!expectsRef) return false;
			point = { start: caret, end: caret, anchor: a, head: a };
		}

		const head = { r: clamp(point.head.r + delta[0], sheet.rows), c: clamp(point.head.c + delta[1], sheet.cols) };
		const anchorTo = e.shiftKey ? point.anchor : head;
		const text = rangeLabel(anchorTo, head);
		const end = point.start + text.length;

		pointRef.current = { start: point.start, end, anchor: anchorTo, head };
		setDraft(value.slice(0, point.start) + text + value.slice(point.end));
		requestAnimationFrame(() => input.setSelectionRange(end, end));
		return true;
	};

	const select = (anchorTo: Pos, focusTo: Pos = anchorTo) => {
		setAnchor(anchorTo);
		setFocus(focusTo);
	};

	const startEdit = (value: string, from: 'cell' | 'bar' = 'cell') => {
		setDraftFrom(from);
		setDraft(value);
	};

	const commit = (move: Move) => {
		const value = draftRef.current;
		if(value === null) return;
		if(value !== raw) onChange(setValue(sheet, a.r, a.c, value), `edit:${addr(a.r, a.c)}`);
		setDraft(null);
		if(move === 'none') return;
		const [dr, dc] = MOVE_DELTAS[move];
		select({ r: clamp(a.r + dr, sheet.rows), c: clamp(a.c + dc, sheet.cols) });
		scrollerRef.current?.focus();
	};

	const cancel = () => {
		setDraft(null);
		scrollerRef.current?.focus();
	};

	const apply = (next: Sheet, key?: string, message?: string) => {
		onChange(next, key);
		if(message) setOwnStatus(message);
	};

	const copyRange = () => toDelimited(
		Array.from({ length: range.r2 - range.r1 + 1 }, (_, dr) => Array.from({ length: range.c2 - range.c1 + 1 }, (_, dc) => rawAt(sheet, range.r1 + dr, range.c1 + dc))),
		'\t',
	);

	const pasteText = (text: string) => {
		const block = parseDelimited(text, '\t');
		if(!block.length) return;
		const width = Math.max(...block.map(row => row.length));
		apply(pasteBlock(sheet, { r: range.r1, c: range.c1 }, block), undefined, `Pasted ${block.length} × ${width}`);
		select({ r: range.r1, c: range.c1 }, { r: range.r1 + block.length - 1, c: range.c1 + width - 1 });
	};

	const clipboardAction = async (action: 'cut' | 'copy' | 'paste') => {
		try
		{
			if(action === 'paste')
			{
				pasteText(await navigator.clipboard.readText());
				return;
			}
			await navigator.clipboard.writeText(copyRange());
			if(action === 'cut') apply(clearRange(sheet, range), undefined, 'Cut');
			else setOwnStatus('Copied');
		}
		catch
		{
			setOwnStatus('Clipboard access was blocked. Use the keyboard shortcut instead.');
		}
	};

	const addChart = (type: ChartType) => {
		if(range.r1 === range.r2 && range.c1 === range.c2)
		{
			setOwnStatus('Select a block of cells to chart.');
			return;
		}
		const text = rangeLabel({ r: range.r1, c: range.c1 }, { r: range.r2, c: range.c2 });
		const nextId = Math.max(0, ...(sheet.charts ?? []).map(existing => Number(existing.id.replace('chart-', '')) || 0)) + 1;
		const chart: SheetChart = { id: `chart-${nextId}`, type, range: text };
		apply({ ...sheet, charts: [...(sheet.charts ?? []), chart] }, undefined, `Added a ${type} chart of ${text}`);
	};

	const removeChart = (id: string) => apply({ ...sheet, charts: (sheet.charts ?? []).filter(chart => chart.id !== id) }, undefined, 'Removed chart');

	const onClipboard = (e: ClipboardEvent<HTMLDivElement>) => {
		if(e.target instanceof HTMLInputElement) return;
		e.preventDefault();
		if(e.type === 'paste')
		{
			pasteText(e.clipboardData.getData('text/plain'));
			return;
		}
		e.clipboardData.setData('text/plain', copyRange());
		if(e.type === 'cut') apply(clearRange(sheet, range), undefined, 'Cut');
		else setOwnStatus('Copied');
	};

	const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if(e.target !== e.currentTarget) return;
		const mod = e.metaKey || e.ctrlKey;
		const key = e.key.toLowerCase();

		const arrow = ARROWS[e.key];
		if(arrow)
		{
			e.preventDefault();
			const step = mod ? EDGE : 1;
			const base = e.shiftKey ? f : a;
			const next = { r: clamp(base.r + arrow[0] * step, sheet.rows), c: clamp(base.c + arrow[1] * step, sheet.cols) };
			select(e.shiftKey ? a : next, next);
			return;
		}

		if(mod)
		{
			if(key === 'z')
			{
				e.preventDefault();
				if(e.shiftKey) history?.redo();
				else history?.undo();
			}
			else if(key === 'y')
			{
				e.preventDefault();
				history?.redo();
			}
			else if(key === 'a')
			{
				e.preventDefault();
				select({ r: 0, c: 0 }, { r: sheet.rows - 1, c: sheet.cols - 1 });
			}
			else if(key === 'b' || key === 'i')
			{
				e.preventDefault();
				const prop = key === 'b' ? 'bold' : 'italic';
				apply(styleRange(sheet, range, { [prop]: activeCell?.[prop] ? undefined : true }));
			}
			return;
		}

		if(e.key === 'Enter' || e.key === 'F2')
		{
			e.preventDefault();
			startEdit(raw);
		}
		else if(e.key === 'Tab')
		{
			const next = { r: a.r, c: clamp(a.c + (e.shiftKey ? -1 : 1), sheet.cols) };
			if(sameCell(next, a)) return;
			e.preventDefault();
			select(next);
		}
		else if(e.key === 'Delete' || e.key === 'Backspace')
		{
			e.preventDefault();
			apply(clearRange(sheet, range));
		}
		else if(e.key === 'Escape') select(a);
		else if(e.key === 'Home')
		{
			e.preventDefault();
			select({ r: a.r, c: 0 });
		}
		else if(e.key === 'End')
		{
			e.preventDefault();
			select({ r: a.r, c: sheet.cols - 1 });
		}
		else if(e.key === 'PageDown' || e.key === 'PageUp')
		{
			e.preventDefault();
			select({ r: clamp(a.r + (e.key === 'PageDown' ? PAGE_ROWS : -PAGE_ROWS), sheet.rows), c: a.c });
		}
		else if(isPrintable(e))
		{
			e.preventDefault();
			startEdit(e.key);
		}
	};

	const selectHeader = (axis: 'row' | 'col', index: number, extend: boolean) => {
		commit('none');
		const from = extend ? (axis === 'row' ? a.r : a.c) : index;
		const start = axis === 'row' ? { r: from, c: 0 } : { r: 0, c: from };
		const end = axis === 'row' ? { r: index, c: sheet.cols - 1 } : { r: sheet.rows - 1, c: index };
		select(start, end);
	};

	const insert = (axis: 'row' | 'col', after: boolean) => {
		const count = axis === 'row' ? range.r2 - range.r1 + 1 : range.c2 - range.c1 + 1;
		const at = axis === 'row' ? (after ? range.r2 + 1 : range.r1) : (after ? range.c2 + 1 : range.c1);
		apply(shiftLines(sheet, axis, at, count), undefined, `Inserted ${count} ${axis === 'row' ? 'row' : 'column'}${count === 1 ? '' : 's'}`);
	};

	const remove = (axis: 'row' | 'col') => {
		const count = axis === 'row' ? range.r2 - range.r1 + 1 : range.c2 - range.c1 + 1;
		const at = axis === 'row' ? range.r1 : range.c1;
		apply(shiftLines(sheet, axis, at, -count), undefined, `Deleted ${count} ${axis === 'row' ? 'row' : 'column'}${count === 1 ? '' : 's'}`);
	};

	const download = (kind: Download) => {
		const positions = Object.keys(sheet.cells).map(key => parseAddr(key)!);
		const lastRow = Math.max(0, ...positions.map(p => p.r + 1));
		const lastCol = Math.max(0, ...positions.map(p => p.c + 1));
		const rows = Array.from({ length: lastRow }, (_, r) => Array.from({ length: lastCol }, (_, c) =>
		{
			const value = evaluator.valueAt(r, c);
			return display(value, sheet.cells[addr(r, c)]?.format);
		}));
		const separator = kind === 'csv' ? ',' : '\t';
		const name = (sheet.title.trim() || 'sheet').replace(/[^\w.-]+/g, '-');
		saveFile(`${name}.${kind}`, toDelimited(rows, separator), kind === 'csv' ? 'text/csv' : 'text/tab-separated-values');
		setOwnStatus(`Downloaded ${name}.${kind}`);
	};

	const formulaText = draft ?? raw;
	const formula = formulaRefs(formulaText);
	const style: CellStyle = activeCell ?? {};
	const rowCount = range.r2 - range.r1 + 1;
	const colCount = range.c2 - range.c1 + 1;
	const message = hostStatus ?? ownStatus;
	const activeValue = evaluator.valueAt(a.r, a.c);

	return (
		<div
			role='region'
			aria-label={`${sheet.title} editor`}
			{...props}
			onCopy={onClipboard}
			onCut={onClipboard}
			onPaste={onClipboard}
			className={`flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface ${className}`}
		>
			<div className='relative z-40 flex items-center gap-2 border-b-[length:var(--border-width)] border-surface-border px-2 py-1'>
				<span aria-hidden='true' className='select-none font-serif text-sm italic text-text-muted'>fx</span>
				<FormulaInput
					aria-label='Formula bar'
					value={formulaText}
					segments={formula.segments}
					onFocus={() => draftRef.current === null && startEdit(raw, 'bar')}
					onChange={e =>
					{
						if(draftRef.current === null) setDraftFrom('bar');
						setDraft(e.target.value);
					}}
					onBlur={() => draftFrom === 'bar' && commit('none')}
					onKeyDown={e =>
					{
						if(formulaKey(e))
						{
							e.preventDefault();
							return;
						}
						if(e.key === 'Enter')
						{
							e.preventDefault();
							commit('down');
						}
						else if(e.key === 'Escape') cancel();
					}}
				/>
				<Actions
					history={history}
					onDownload={download}
					toolbarEnd={toolbarEnd}
				/>
				{hints && <FunctionHints id={hintsId} matches={hints.matches} active={activeHint} onPick={name => acceptHint(name)} />}
				<span role='status' className='sr-only'>
					{hints ? `${hints.matches.length} function suggestions. ${hints.matches[activeHint]} selected.` : ''}
				</span>
			</div>
			<div className='relative flex min-h-0 flex-1 flex-col'>
			<Grid
				highlight={highlightRange}
				highlightLabel={highlightLabel}
				refs={formula.refs}
				sheet={sheet}
				evaluator={evaluator}
				active={a}
				range={range}
				draft={draftFrom === 'cell' ? draft : null}
				label={`${sheet.title} grid`}
				scrollerRef={scrollerRef}
				onKeyDown={onGridKeyDown}
				onCellDown={(pos, extend) =>
				{
					commit('none');
					if(extend) setFocus(pos);
					else select(pos);
				}}
				onCellEnter={setFocus}
				onCellEdit={pos =>
				{
					select(pos);
					startEdit(rawAt(sheet, pos.r, pos.c));
				}}
				onHeaderDown={selectHeader}
				onSelectAll={() => select({ r: 0, c: 0 }, { r: sheet.rows - 1, c: sheet.cols - 1 })}
				onDraft={setDraft}
				onFormulaKey={formulaKey}
				onCommit={commit}
				onCancel={cancel}
				onResize={(c, width) => onChange(resizeCol(sheet, c, width), `resize:${c}`)}
			/>
			<Toolbar
				style={style}
				sample={typeof activeValue === 'number' ? activeValue : 1234.5}
				rowCount={rowCount}
				colCount={colCount}
				onStyle={patch => apply(styleRange(sheet, range, patch))}
				onInsert={insert}
				onDelete={remove}
				onBorder={mode => apply(borderRange(sheet, range, mode))}
				onChart={addChart}
				onCut={() => clipboardAction('cut')}
				onCopy={() => clipboardAction('copy')}
				onPaste={() => clipboardAction('paste')}
				onClear={() => apply(clearRange(sheet, range))}
				onAsk={onAsk && (() => onAsk(sheetAskContext(sheet, range, a)))}
			/>
			</div>
			{!!sheet.charts?.length && <ChartStrip charts={sheet.charts} evaluator={evaluator} onRemove={removeChart} />}
			<div className='flex items-center justify-between gap-4 border-t-[length:var(--border-width)] border-surface-border px-3 py-1 text-xs text-text-muted'>
				<span role='status' aria-live='polite' className='truncate'>{message}</span>
				<span className='flex shrink-0 items-center gap-3'>
					{stats ? (
						<>
							<span>Sum: {display(stats.sum)}</span>
							<span>Average: {display(stats.average)}</span>
							<span>Count: {stats.count}</span>
						</>
					) : (
						activeValue instanceof SheetError && <span>{activeValue.code}</span>
					)}
				</span>
			</div>
		</div>
	);
};

export default SheetEditor;
