import { MAX_COLS, MAX_ROWS, MIN_COL_WIDTH, addr, parseAddr, type Cell, type CellStyle, type Pos, type Range, type Sheet, type Side } from './sheet';
import { SheetError, shiftFormula, type Value } from './formulas';

const STYLE_KEYS = ['borders', 'bold', 'italic', 'align', 'valign', 'color', 'fill', 'format'] as const;

const isBlank = (cell: Cell) => cell.value === '' && STYLE_KEYS.every(key => cell[key] === undefined);

const withCell = (sheet: Sheet, key: string, cell: Cell): Sheet => {
	const cells = { ...sheet.cells };
	if(isBlank(cell)) delete cells[key];
	else cells[key] = cell;
	return { ...sheet, cells };
};

const eachCell = (range: Range, visit: (r: number, c: number) => void) => {
	for(let r = range.r1; r <= range.r2; r++)
	{
		for(let c = range.c1; c <= range.c2; c++) visit(r, c);
	}
};

export const setValue = (sheet: Sheet, r: number, c: number, value: string): Sheet => {
	const key = addr(r, c);
	return withCell(sheet, key, { ...sheet.cells[key], value });
};

/** Clears contents but keeps formatting, like Delete in a spreadsheet. */
export const clearRange = (sheet: Sheet, range: Range): Sheet => {
	const cells = { ...sheet.cells };
	eachCell(range, (r, c) =>
	{
		const key = addr(r, c);
		if(!cells[key]) return;
		const next = { ...cells[key], value: '' };
		if(isBlank(next)) delete cells[key];
		else cells[key] = next;
	});
	return { ...sheet, cells };
};

export const styleRange = (sheet: Sheet, range: Range, patch: CellStyle): Sheet => {
	const cells = { ...sheet.cells };
	eachCell(range, (r, c) =>
	{
		const key = addr(r, c);
		const next = { ...cells[key], ...patch, value: cells[key]?.value ?? '' };
		(Object.keys(next) as (keyof Cell)[]).forEach(k =>
		{
			if(next[k] === undefined) delete next[k];
		});
		if(isBlank(next)) delete cells[key];
		else cells[key] = next;
	});
	return { ...sheet, cells };
};

export type BorderMode = 'all' | 'outer' | 'top' | 'right' | 'bottom' | 'left' | 'none';

/** Draws borders on a range. `outer` rings the whole range; the single sides add to what's there; `none` removes every border. */
export const borderRange = (sheet: Sheet, range: Range, mode: BorderMode): Sheet => {
	let next = sheet;
	eachCell(range, (r, c) =>
	{
		const existing = next.cells[addr(r, c)]?.borders ?? [];
		const sides: Side[] = [];
		if(mode === 'all') sides.push('top', 'right', 'bottom', 'left');
		else if(mode === 'outer')
		{
			if(r === range.r1) sides.push('top');
			if(c === range.c2) sides.push('right');
			if(r === range.r2) sides.push('bottom');
			if(c === range.c1) sides.push('left');
		}
		else if(mode !== 'none')
		{
			const edge = { top: r === range.r1, right: c === range.c2, bottom: r === range.r2, left: c === range.c1 }[mode];
			if(edge) sides.push(mode);
		}
		const merged = mode === 'none' ? [] : [...new Set([...existing, ...sides])];
		next = styleRange(next, { r1: r, c1: c, r2: r, c2: c }, { borders: merged.length ? merged : undefined });
	});
	return next;
};

/** Writes a block of text starting at `at`, growing the grid if the block runs past its edge. */
export const pasteBlock = (sheet: Sheet, at: Pos, block: string[][]): Sheet => {
	let next: Sheet = {
		...sheet,
		rows: Math.min(MAX_ROWS, Math.max(sheet.rows, at.r + block.length)),
		cols: Math.min(MAX_COLS, Math.max(sheet.cols, at.c + Math.max(0, ...block.map(row => row.length)))),
	};
	block.forEach((row, dr) => row.forEach((value, dc) =>
	{
		if(at.r + dr < next.rows && at.c + dc < next.cols) next = setValue(next, at.r + dr, at.c + dc, value);
	}));
	return next;
};

export const resizeCol = (sheet: Sheet, c: number, width: number): Sheet => ({
	...sheet, colWidths: { ...sheet.colWidths, [c]: Math.max(MIN_COL_WIDTH, Math.round(width)) },
});

/** Inserts (`count > 0`) or deletes (`count < 0`) whole rows or columns at `at`, rewriting every formula that points past it. */
export const shiftLines = (sheet: Sheet, axis: 'row' | 'col', at: number, count: number): Sheet => {
	const size = axis === 'row' ? sheet.rows : sheet.cols;
	const limit = axis === 'row' ? MAX_ROWS : MAX_COLS;
	if(count > 0 && size + count > limit) return sheet;
	if(count < 0 && size + count < 1) return sheet;

	const cells: Record<string, Cell> = {};
	Object.entries(sheet.cells).forEach(([key, cell]) =>
	{
		const pos = parseAddr(key)!;
		const line = axis === 'row' ? pos.r : pos.c;
		const moved = count > 0 ? (line >= at ? line + count : line) : (line >= at - count ? line + count : line < at ? line : null);
		if(moved === null) return;
		const target = axis === 'row' ? addr(moved, pos.c) : addr(pos.r, moved);
		cells[target] = { ...cell, value: shiftFormula(cell.value, { axis, at, delta: count }) };
	});

	const colWidths: Record<number, number> = {};
	if(axis === 'col')
	{
		Object.entries(sheet.colWidths).forEach(([key, width]) =>
		{
			const c = Number(key);
			const moved = count > 0 ? (c >= at ? c + count : c) : (c >= at - count ? c + count : c < at ? c : null);
			if(moved !== null) colWidths[moved] = width;
		});
	}

	return {
		...sheet,
		rows:      axis === 'row' ? sheet.rows + count : sheet.rows,
		cols:      axis === 'col' ? sheet.cols + count : sheet.cols,
		cells,
		colWidths: axis === 'col' ? colWidths : sheet.colWidths,
	};
};

/** Quotes a field only when it has to be. */
const quote = (text: string, separator: string) => (new RegExp(`["\\n\\r${separator}]`).test(text) ? `"${text.replace(/"/g, '""')}"` : text);

export const toDelimited = (rows: string[][], separator: string) => rows.map(row => row.map(cell => quote(cell, separator)).join(separator)).join('\n');

export const parseDelimited = (text: string, separator: string): string[][] => {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;

	const endField = () => {
		row.push(field);
		field = '';
	};
	const endRow = () => {
		endField();
		rows.push(row);
		row = [];
	};

	for(let i = 0; i < text.length; i++)
	{
		const ch = text[i];
		if(quoted)
		{
			if(ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
			else if(ch === '"') quoted = false;
			else field += ch;
		}
		else if(ch === '"' && field === '') quoted = true;
		else if(ch === separator) endField();
		else if(ch === '\n') endRow();
		else if(ch !== '\r') field += ch;
	}
	if(field !== '' || row.length) endRow();
	return rows;
};

const errorOrText = (value: Value): string => {
	if(value instanceof SheetError) return value.code;
	if(value === null) return '';
	return String(value);
};

export { errorOrText };
