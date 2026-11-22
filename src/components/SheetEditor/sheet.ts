export type Align = 'left' | 'center' | 'right';

export type VAlign = 'top' | 'middle' | 'bottom';

export type NumberFormat = 'general' | 'number' | 'currency' | 'percent';

export type Side = 'top' | 'right' | 'bottom' | 'left';

export type ChartType = 'line' | 'bar' | 'area';

/** A chart over a block of cells. A text first row names the series and a text first column labels the points. */
export interface SheetChart {
	id:    string;
	type:  ChartType;
	range: string;
}

export interface CellStyle {
	borders?: Side[];
	bold?:   boolean;
	italic?: boolean;
	align?:  Align;
	valign?: VAlign;
	color?:  string;
	fill?:   string;
	/** A preset name (`currency`) or a custom pattern like `#,##0.0 "kg"`. */
	format?: NumberFormat | (string & {});
}

/** `value` is what the user typed: plain text, a number, or a formula starting with `=`. */
export interface Cell extends CellStyle {
	value: string;
}

/** Cells are keyed by A1 address ("B3"); empty, unstyled cells are absent. */
export interface Sheet {
	title:     string;
	rows:      number;
	cols:      number;
	cells:     Record<string, Cell>;
	colWidths: Record<number, number>;
	charts?:   SheetChart[];
}

export type { EditHistory } from '../Models/Models';

export interface Pos {
	r: number;
	c: number;
}

export interface Range {
	r1: number;
	c1: number;
	r2: number;
	c2: number;
}

export const DEFAULT_COL_WIDTH = 104;
export const MIN_COL_WIDTH = 40;
export const MAX_ROWS = 10000;
export const MAX_COLS = 702;

export const colName = (index: number): string => {
	let name = '';
	let n = index + 1;
	while(n > 0)
	{
		name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
		n = Math.floor((n - 1) / 26);
	}
	return name;
};

export const colIndex = (name: string): number => name.toUpperCase().split('').reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0) - 1;

export const addr = (r: number, c: number) => `${colName(c)}${r + 1}`;

export const parseAddr = (text: string): Pos | null => {
	const match = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(text);
	if(!match) return null;
	return { r: Number(match[2]) - 1, c: colIndex(match[1]) };
};

export const normalize = (a: Pos, b: Pos): Range => ({
	r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c),
});

export const createSheet = (rows = 100, cols = 26, title = 'Untitled sheet'): Sheet => ({
	title, rows, cols, cells: {}, colWidths: {},
});

export const colWidth = (sheet: Sheet, c: number) => sheet.colWidths[c] ?? DEFAULT_COL_WIDTH;

export const rawAt = (sheet: Sheet, r: number, c: number) => sheet.cells[addr(r, c)]?.value ?? '';
