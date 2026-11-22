'use client';

import { KeyboardEvent, PointerEvent, RefObject, UIEvent, memo, useId, useLayoutEffect, useRef, useState } from 'react';
import { addr, colName, colWidth, type Cell, type Pos, type Range, type Sheet } from './sheet';
import { SheetError, type Evaluator } from './formulas';
import { display, naturalAlign } from './format';
import type { FormulaRef } from './refs';

export const ROW_HEIGHT = 28;
export const HEADER_HEIGHT = 28;
export const ROW_HEADER_WIDTH = 48;
const OVERSCAN = 6;
const FALLBACK_VIEWPORT = 600;

const BORDER_OFFSETS = { top: '0 1px 0 0', right: '-1px 0 0 0', bottom: '0 -1px 0 0', left: '1px 0 0 0' } as const;

const REF_OFFSETS = { top: '0 2px 0 0', right: '-2px 0 0 0', bottom: '0 -2px 0 0', left: '2px 0 0 0' } as const;

const ITEMS = { top: 'items-start', middle: 'items-center', bottom: 'items-end' } as const;

const JUSTIFY ={ left: 'justify-start', center: 'justify-center', right: 'justify-end' } as const;

export interface GridProps {
	/** Cells someone else is editing right now: outlined and pulsing, with a tag on the first cell. */
	highlight?:   Range | null;
	highlightLabel?: string;
	/** Cell references in the formula being viewed or edited: each range is tinted and outlined in its color, and its row and column headers are tinted. */
	refs?:        FormulaRef[];
	sheet:        Sheet;
	evaluator:    Evaluator;
	active:       Pos;
	range:        Range;
	draft:        string | null;
	label:        string;
	scrollerRef:  RefObject<HTMLDivElement | null>;
	onKeyDown:    (e: KeyboardEvent<HTMLDivElement>) => void;
	onCellDown:   (pos: Pos, extend: boolean) => void;
	onCellEnter:  (pos: Pos) => void;
	onCellEdit:   (pos: Pos) => void;
	onHeaderDown: (axis: 'row' | 'col', index: number, extend: boolean) => void;
	onSelectAll:  () => void;
	onDraft:      (value: string) => void;
	onCommit:     (move: 'down' | 'up' | 'left' | 'right' | 'none') => void;
	onCancel:     () => void;
	onFormulaKey: (e: KeyboardEvent<HTMLInputElement>) => boolean;
	onResize:     (c: number, width: number) => void;
}

interface CellViewProps {
	r:        number;
	c:        number;
	width:    number;
	cell?:    Cell;
	shown:    string;
	align:    keyof typeof JUSTIFY;
	isError:  boolean;
	inRange:  boolean;
	isActive: boolean;
	highlighted: boolean;
	id:       string;
	refColor?: string;
	refSides?: string;
}

const tint = (color: string, percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;

const CellView = memo(({ r, c, width, cell, shown, align, isError, inRange, isActive, highlighted, id, refColor, refSides = '' }: CellViewProps) => {
	const fill = cell?.fill;
	const edges = [
		...(cell?.borders ?? []).map(side => `inset ${BORDER_OFFSETS[side]} var(--color-text)`),
		...refSides.split(',').filter(Boolean).map(side => `inset ${REF_OFFSETS[side as keyof typeof REF_OFFSETS]} ${refColor}`),
	];
	return (
		<div
			id={id}
			role='gridcell'
			aria-colindex={c + 2}
			aria-selected={inRange}
			data-r={r}
			data-c={c}
			className={[
				'relative flex shrink-0 select-none overflow-hidden whitespace-nowrap px-2 py-0.5 text-sm text-text',
				ITEMS[cell?.valign ?? 'middle'],
				'border-b-[length:var(--border-width)] border-r-[length:var(--border-width)] border-surface-border',
				JUSTIFY[align],
				cell?.bold ? 'font-bold' : '',
				cell?.italic ? 'italic' : '',
				isError ? 'text-danger' : '',
				inRange && !isActive ? 'bg-brand/10' : '',
				highlighted && !isActive ? 'z-[1] ring-2 ring-inset ring-brand motion-safe:animate-pulse' : '',
				isActive ? 'z-[1] ring-2 ring-inset ring-brand-ring' : '',
			].join(' ')}
			style={{
				width,
				height:     ROW_HEIGHT,
				backgroundColor: fill && !inRange ? fill : undefined,
				color:      cell?.color ?? (fill ? '#18181b' : undefined),
				backgroundImage: refColor && !isActive ? `linear-gradient(${tint(refColor, 16)}, ${tint(refColor, 16)})` : undefined,
			}}
		>
			<span className='truncate'>{shown}</span>
			{edges.length > 0 && <span aria-hidden='true' className='pointer-events-none absolute inset-0' style={{ boxShadow: edges.join(', ') }} />}
		</div>
	);
});

CellView.displayName = 'CellView';

interface HeaderCellProps {
	label:     string;
	width?:    number;
	selected:  boolean;
	onDown:    (e: PointerEvent<HTMLDivElement>) => void;
	children?: React.ReactNode;
	col?:      number;
	refColor?: string;
}

const HeaderCell = ({ label, width, selected, onDown, children, col, refColor }: HeaderCellProps) => (
	<div
		role={col === undefined ? 'rowheader' : 'columnheader'}
		aria-colindex={col === undefined ? undefined : col + 2}
		onPointerDown={onDown}
		className={[
			'relative flex shrink-0 select-none items-center justify-center text-xs font-medium',
			'border-b-[length:var(--border-width)] border-r-[length:var(--border-width)] border-surface-border',
			selected ? 'bg-surface-active text-text' : 'bg-surface text-text-muted',
		].join(' ')}
		style={{
			width:           width ?? ROW_HEADER_WIDTH,
			height:          width === undefined ? ROW_HEIGHT : HEADER_HEIGHT,
			backgroundImage: refColor ? `linear-gradient(${tint(refColor, 22)}, ${tint(refColor, 22)})` : undefined,
			color:           refColor,
		}}
	>
		{label}
		{children}
	</div>
);

interface ResizeHandleProps {
	c:        number;
	width:    number;
	onResize: (c: number, width: number) => void;
}

const ResizeHandle = ({ c, width, onResize }: ResizeHandleProps) => {
	const drag = useRef<{ x: number; width: number } | null>(null);
	return (
		<div
			aria-hidden='true'
			className='absolute -right-1 top-0 z-10 h-full w-2 cursor-col-resize touch-none hover:bg-brand/30'
			onPointerDown={e =>
			{
				e.stopPropagation();
				e.currentTarget.setPointerCapture(e.pointerId);
				drag.current = { x: e.clientX, width };
			}}
			onPointerMove={e =>
			{
				if(drag.current) onResize(c, drag.current.width + e.clientX - drag.current.x);
			}}
			onPointerUp={() =>
			{
				drag.current = null;
			}}
		/>
	);
};

interface EditorProps {
	width:    number;
	value:    string;
	onDraft: (value: string) => void;
	onCommit: GridProps['onCommit'];
	onCancel: () => void;
	onFormulaKey: GridProps['onFormulaKey'];
}

const MOVES = { Enter: 'down', Tab: 'right' } as const;

const CellEditor = ({ width, value, onDraft, onCommit, onCancel, onFormulaKey }: EditorProps) => {
	const ref = useRef<HTMLInputElement>(null);

	useLayoutEffect(() =>
	{
		ref.current?.focus();
		ref.current?.setSelectionRange(value.length, value.length);
		// Focus and caret are placed once, when the editor opens.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- value changes on every keystroke
	}, []);

	return (
		<input
			ref={ref}
			value={value}
			aria-label='Cell contents'
			spellCheck={false}
			autoComplete='off'
			className='absolute left-0 top-0 z-[2] bg-surface px-2 text-sm text-text ring-2 ring-inset ring-brand-ring focus:outline-none'
			style={{ width: Math.max(width, 120), height: ROW_HEIGHT }}
			onChange={e => onDraft(e.target.value)}
			onBlur={() => onCommit('none')}
			onKeyDown={e =>
			{
				e.stopPropagation();
				if(onFormulaKey(e))
				{
					e.preventDefault();
					return;
				}
				if(e.key === 'Escape')
				{
					e.preventDefault();
					onCancel();
					return;
				}
				if(e.key !== 'Enter' && e.key !== 'Tab') return;
				e.preventDefault();
				if(e.key === 'Enter') onCommit(e.shiftKey ? 'up' : 'down');
				else onCommit(e.shiftKey ? 'left' : MOVES.Tab);
			}}
		/>
	);
};

export const Grid = ({
	sheet, evaluator, active, range, draft, label, scrollerRef, onKeyDown, onCellDown, onCellEnter, onCellEdit,
	onHeaderDown, onSelectAll, onDraft, onCommit, onCancel, onFormulaKey, onResize, highlight, highlightLabel, refs = [],
}: GridProps) => {
	const idBase = useId();
	const [scrollTop, setScrollTop] = useState(0);
	const [viewport, setViewport] = useState(FALLBACK_VIEWPORT);

	useLayoutEffect(() =>
	{
		const el = scrollerRef.current;
		if(!el) return;
		const measure = () => setViewport(el.clientHeight || FALLBACK_VIEWPORT);
		measure();
		if(typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [scrollerRef]);

	const reveal = (r: number, c: number) => {
		const el = scrollerRef.current;
		if(!el) return;
		const top = r * ROW_HEIGHT;
		const visible = el.clientHeight - HEADER_HEIGHT;
		if(top < el.scrollTop) el.scrollTop = top;
		else if(top + ROW_HEIGHT > el.scrollTop + visible) el.scrollTop = top + ROW_HEIGHT - visible;

		let left = 0;
		for(let i = 0; i < c; i++) left += colWidth(sheet, i);
		const width = colWidth(sheet, c);
		const visibleWidth = el.clientWidth - ROW_HEADER_WIDTH;
		if(left < el.scrollLeft) el.scrollLeft = left;
		else if(left + width > el.scrollLeft + visibleWidth) el.scrollLeft = left + width - visibleWidth;
	};

	useLayoutEffect(() =>
	{
		reveal(active.r, active.c);
		// Follows the active cell only; `sheet` is read for column widths.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reveal is recreated every render
	}, [active.r, active.c]);

	useLayoutEffect(() =>
	{
		if(highlight) reveal(highlight.r1, highlight.c1);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reveal is recreated every render
	}, [highlight?.r1, highlight?.c1]);

	const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
	const last = Math.min(sheet.rows - 1, Math.ceil((scrollTop + viewport) / ROW_HEIGHT) + OVERSCAN);
	const rows = Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => first + i);
	const widths = Array.from({ length: sheet.cols }, (_, c) => colWidth(sheet, c));
	const totalWidth = ROW_HEADER_WIDTH + widths.reduce((sum, w) => sum + w, 0);

	const colSelected = (c: number) => range.c1 <= c && c <= range.c2 && range.r1 === 0 && range.r2 === sheet.rows - 1;
	const rowSelected = (r: number) => range.r1 <= r && r <= range.r2 && range.c1 === 0 && range.c2 === sheet.cols - 1;

	const refAt = (r: number, c: number) => refs.findLast(ref => r >= ref.range.r1 && r <= ref.range.r2 && c >= ref.range.c1 && c <= ref.range.c2);
	const colRef = (c: number) => refs.findLast(ref => c >= ref.range.c1 && c <= ref.range.c2);
	const rowRef = (r: number) => refs.findLast(ref => r >= ref.range.r1 && r <= ref.range.r2);

	const cellAt = (e: PointerEvent<HTMLDivElement>): Pos | null => {
		const target = (e.target as HTMLElement).closest<HTMLElement>('[role="gridcell"]');
		return target ? { r: Number(target.dataset.r), c: Number(target.dataset.c) } : null;
	};

	return (
		<div
			ref={scrollerRef}
			role='grid'
			aria-label={label}
			aria-rowcount={sheet.rows + 1}
			aria-colcount={sheet.cols + 1}
			aria-multiselectable='true'
			aria-activedescendant={draft === null ? `${idBase}-${active.r}-${active.c}` : undefined}
			tabIndex={0}
			onKeyDown={onKeyDown}
			onScroll={(e: UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop)}
			onPointerDown={e =>
			{
				const pos = cellAt(e);
				if(pos) onCellDown(pos, e.shiftKey);
			}}
			onPointerOver={e =>
			{
				if(e.buttons !== 1) return;
				const pos = cellAt(e);
				if(pos) onCellEnter(pos);
			}}
			onDoubleClick={e =>
			{
				const target = (e.target as HTMLElement).closest<HTMLElement>('[role="gridcell"]');
				if(target) onCellEdit({ r: Number(target.dataset.r), c: Number(target.dataset.c) });
			}}
			className='relative min-h-0 flex-1 overflow-auto bg-surface focus:outline-none'
		>
			<div role='presentation' className='relative' style={{ width: totalWidth, height: HEADER_HEIGHT + sheet.rows * ROW_HEIGHT }}>
				<div role='row' aria-rowindex={1} className='sticky top-0 z-20 flex' style={{ width: totalWidth, height: HEADER_HEIGHT }}>
					<div
						role='columnheader'
						aria-label='Select all'
						onPointerDown={onSelectAll}
						className='sticky left-0 z-30 shrink-0 border-b-[length:var(--border-width)] border-r-[length:var(--border-width)] border-surface-border bg-surface'
						style={{ width: ROW_HEADER_WIDTH, height: HEADER_HEIGHT }}
					/>
					{widths.map((width, c) => (
						<HeaderCell key={c} col={c} refColor={colRef(c)?.color}label={colName(c)} width={width} selected={colSelected(c) || (range.c1 <= c && c <= range.c2)} onDown={e => onHeaderDown('col', c, e.shiftKey)}>
							<ResizeHandle c={c} width={width} onResize={onResize} />
						</HeaderCell>
					))}
				</div>
				{rows.map(r => (
					<div key={r} role='row' aria-rowindex={r + 2} className='absolute left-0 flex' style={{ top: HEADER_HEIGHT + r * ROW_HEIGHT, width: totalWidth, height: ROW_HEIGHT }}>
						<div className='sticky left-0 z-10 shrink-0'>
							<HeaderCell label={String(r + 1)} refColor={rowRef(r)?.color}selected={rowSelected(r) || (range.r1 <= r && r <= range.r2)} onDown={e => onHeaderDown('row', r, e.shiftKey)} />
						</div>
						{widths.map((width, c) =>
						{
							const key = addr(r, c);
							const cell = sheet.cells[key];
							const value = cell ? evaluator.valueAt(r, c) : null;
							const isActive = active.r === r && active.c === c;
							const inRange = range.r1 <= r && r <= range.r2 && range.c1 <= c && c <= range.c2;
							const cellId = `${idBase}-${r}-${c}`;
							const ref = refAt(r, c);
							const refSides = ref
								? [r === ref.range.r1 && 'top', c === ref.range.c2 && 'right', r === ref.range.r2 && 'bottom', c === ref.range.c1 && 'left'].filter(Boolean).join(',')
								: undefined;
							return (
								<div key={c} className='relative shrink-0' style={{ width }}>
									<CellView
										id={cellId}
										refColor={ref?.color}
										refSides={refSides}
										r={r}
										c={c}
										width={width}
										cell={cell}
										shown={display(value, cell?.format)}
										align={cell?.align ?? naturalAlign(value)}
										isError={value instanceof SheetError}
										inRange={inRange}
										isActive={isActive}
										highlighted={!!highlight && r >= highlight.r1 && r <= highlight.r2 && c >= highlight.c1 && c <= highlight.c2}
									/>
									{highlight && r === highlight.r1 && c === highlight.c1 && highlightLabel && (
										<span className='pointer-events-none absolute -top-2 left-0 z-[3] rounded-[var(--radius-sm)] bg-brand px-1 text-[10px] font-medium leading-4 text-brand-fg'>{highlightLabel}</span>
									)}
									{isActive && draft !== null && (
										<CellEditor width={width} value={draft} onDraft={onDraft} onCommit={onCommit} onCancel={onCancel} onFormulaKey={onFormulaKey} />
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};
