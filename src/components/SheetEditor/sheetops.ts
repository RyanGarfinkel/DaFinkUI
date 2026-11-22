import { MAX_COLS, MAX_ROWS, addr, parseAddr, type Cell, type CellStyle, type Range, type Sheet } from './sheet';
import { shiftLines, styleRange } from './ops';

/** A style change. `null` removes that property from the cells. */
export type StylePatch = { [K in keyof CellStyle]?: CellStyle[K] | null };

/**
 * One validated change to a sheet. Agents edit a sheet by emitting these; the editor and the chat
 * both apply them with `applySheetOp`. Addresses are A1 ("B3"), ranges "A1:C5" or a single cell.
 */
export type SheetOp =
	/** Sets typed values (numbers, text, or formulas like "=SUM(B2:B9)"), keeping each cell's formatting. An empty string clears the value. */
	| { type: 'setCells'; cells: Record<string, string> }
	| { type: 'styleCells'; range: string; style: StylePatch }
	/** Inserts (`count` > 0 at `at`) or deletes whole rows or columns. `at` is 0-based. Formulas are re-pointed. */
	| { type: 'insertLines'; axis: 'row' | 'col'; at: number; count: number }
	| { type: 'deleteLines'; axis: 'row' | 'col'; at: number; count: number }
	| { type: 'resizeCol'; col: number; width: number }
	| { type: 'setSize'; rows?: number; cols?: number }
	| { type: 'rename'; title: string }
	/** Replaces whole cells (value and formatting); `null` removes one. This is what undo is made of. */
	| { type: 'replaceCells'; cells: Record<string, Cell | null> };

export class SheetOpError extends Error {
	constructor(message: string)
	{
		super(message);
		this.name = 'SheetOpError';
	}
}

export const parseRange = (text: string): Range => {
	const [from, to = from] = text.trim().split(':');
	const a = parseAddr(from);
	const b = parseAddr(to);
	if(!a || !b) throw new SheetOpError(`"${text}" is not a cell or range like "B3" or "A1:C5".`);
	return { r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) };
};

const inBounds = (sheet: Sheet, r: number, c: number) => r >= 0 && c >= 0 && r < sheet.rows && c < sheet.cols;

const withValue = (sheet: Sheet, key: string, value: string): Sheet => {
	const cell = sheet.cells[key];
	const cells = { ...sheet.cells };
	if(value === '' && (!cell || Object.keys(cell).length === 1)) delete cells[key];
	else cells[key] = { ...cell, value };
	return { ...sheet, cells };
};

const toStyle = (patch: StylePatch): CellStyle => {
	const style: Record<string, unknown> = {};
	Object.entries(patch).forEach(([key, value]) =>
	{
		style[key] = value === null ? undefined : value;
	});
	return style as CellStyle;
};

const growTo = (sheet: Sheet, r: number, c: number): Sheet => {
	if(r >= MAX_ROWS || c >= MAX_COLS) throw new SheetOpError(`The sheet can't be larger than ${MAX_ROWS} rows by ${MAX_COLS} columns.`);
	return { ...sheet, rows: Math.max(sheet.rows, r + 1), cols: Math.max(sheet.cols, c + 1) };
};

export const applySheetOp = (sheet: Sheet, op: SheetOp): Sheet => {
	switch(op.type)
	{
	case 'setCells':
		return Object.entries(op.cells).reduce((next, [key, value]) =>
		{
			const pos = parseAddr(key);
			if(!pos) throw new SheetOpError(`"${key}" is not a cell address like "B3".`);
			return withValue(growTo(next, pos.r, pos.c), key, value);
		}, sheet);

	case 'styleCells': {
		const range = parseRange(op.range);
		if(!inBounds(sheet, range.r2, range.c2)) throw new SheetOpError(`${op.range} is outside the sheet (${sheet.rows} rows, ${sheet.cols} columns).`);
		return styleRange(sheet, range, toStyle(op.style));
	}

	case 'insertLines':
	case 'deleteLines': {
		const size = op.axis === 'row' ? sheet.rows : sheet.cols;
		if(op.at < 0 || op.at > size || op.count < 1) throw new SheetOpError(`${op.type} needs 0 <= at <= ${size} and count >= 1.`);
		if(op.type === 'deleteLines' && op.at + op.count > size) throw new SheetOpError(`Can't delete past the last ${op.axis}.`);
		const next = shiftLines(sheet, op.axis, op.at, op.type === 'insertLines' ? op.count : -op.count);
		if(next === sheet) throw new SheetOpError(`${op.type} would leave the sheet too large or empty.`);
		return next;
	}

	case 'resizeCol':
		if(op.col < 0 || op.col >= sheet.cols) throw new SheetOpError(`Column ${op.col} doesn't exist.`);
		return { ...sheet, colWidths: { ...sheet.colWidths, [op.col]: Math.max(40, Math.round(op.width)) } };

	case 'setSize': {
		const rows = op.rows ?? sheet.rows;
		const cols = op.cols ?? sheet.cols;
		if(rows < 1 || cols < 1 || rows > MAX_ROWS || cols > MAX_COLS) throw new SheetOpError(`Size must be 1-${MAX_ROWS} rows by 1-${MAX_COLS} columns.`);
		const cells = Object.fromEntries(Object.entries(sheet.cells).filter(([key]) =>
		{
			const pos = parseAddr(key)!;
			return pos.r < rows && pos.c < cols;
		}));
		return { ...sheet, rows, cols, cells };
	}

	case 'rename':
		return { ...sheet, title: op.title };

	case 'replaceCells': {
		const cells = { ...sheet.cells };
		Object.entries(op.cells).forEach(([key, cell]) =>
		{
			if(cell === null) delete cells[key];
			else cells[key] = cell;
		});
		return { ...sheet, cells };
	}
	}
};

export const applySheetOps = (sheet: Sheet, ops: SheetOp[]): Sheet => ops.reduce(applySheetOp, sheet);

/** Applies what it can: an op that no longer fits (a range you've since deleted, a bad address) is skipped and returned. */
export const applySheetOpsLenient = (sheet: Sheet, ops: SheetOp[]): { sheet: Sheet; skipped: SheetOp[] } => {
	const skipped: SheetOp[] = [];
	const next = ops.reduce((current, op) =>
	{
		try
		{
			return applySheetOp(current, op);
		}
		catch
		{
			skipped.push(op);
			return current;
		}
	}, sheet);
	return { sheet: next, skipped };
};

const sameCell = (a: Cell | undefined, b: Cell | undefined) => JSON.stringify(a) === JSON.stringify(b);

/** The ops that turn `from` into `to`: what the editor records so undo can reverse only your own changes. */
export const diffSheets = (from: Sheet, to: Sheet): SheetOp[] => {
	const ops: SheetOp[] = [];
	const keys = new Set([...Object.keys(from.cells), ...Object.keys(to.cells)]);
	const changed: Record<string, Cell | null> = {};
	keys.forEach(key =>
	{
		if(!sameCell(from.cells[key], to.cells[key])) changed[key] = to.cells[key] ?? null;
	});

	if(from.rows !== to.rows || from.cols !== to.cols) ops.push({ type: 'setSize', rows: to.rows, cols: to.cols });
	if(Object.keys(changed).length) ops.push({ type: 'replaceCells', cells: changed });
	new Set([...Object.keys(from.colWidths), ...Object.keys(to.colWidths)]).forEach(key =>
	{
		const col = Number(key);
		if(from.colWidths[col] !== to.colWidths[col]) ops.push({ type: 'resizeCol', col, width: to.colWidths[col] ?? 104 });
	});
	if(from.title !== to.title) ops.push({ type: 'rename', title: to.title });
	return ops;
};

/** The range an op touches, for showing where an agent is working. */
export const opRange = (op: SheetOp): string | undefined => {
	if(op.type === 'styleCells') return op.range;
	if(op.type === 'setCells' || op.type === 'replaceCells')
	{
		const keys = Object.keys(op.type === 'setCells' ? op.cells : op.cells);
		const positions = keys.map(parseAddr).filter((p): p is NonNullable<typeof p> => p !== null);
		if(!positions.length) return undefined;
		const first = addr(Math.min(...positions.map(p => p.r)), Math.min(...positions.map(p => p.c)));
		const last = addr(Math.max(...positions.map(p => p.r)), Math.max(...positions.map(p => p.c)));
		return first === last ? first : `${first}:${last}`;
	}
	return undefined;
};
