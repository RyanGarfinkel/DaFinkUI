import { addr, rawAt, type Pos, type Range, type Sheet } from './sheet';

const TEXT_MAX_LENGTH = 600;

/** What the user pointed at when they pressed Ask AI: the selected cells and what's typed in them. */
export interface SheetAskContext {
	/** The selection in A1 notation: "B3" or "A1:C5". */
	range:      string;
	/** The cell with the cursor. */
	activeCell: string;
	/** The selection's size in cells. */
	rows:       number;
	cols:       number;
	/** The typed values (formulas included) as tab-separated rows, cut off at 600 characters. */
	text:       string;
	truncated:  boolean;
}

export const rangeLabel = (range: Range) => {
	const first = addr(range.r1, range.c1);
	const last = addr(range.r2, range.c2);
	return first === last ? first : `${first}:${last}`;
};

export const sheetAskContext = (sheet: Sheet, range: Range, active: Pos): SheetAskContext => {
	const lines: string[] = [];
	for(let r = range.r1; r <= range.r2; r++)
	{
		const values: string[] = [];
		for(let c = range.c1; c <= range.c2; c++) values.push(rawAt(sheet, r, c));
		lines.push(values.join('\t'));
	}
	const text = lines.join('\n');
	const truncated = text.length > TEXT_MAX_LENGTH;
	return {
		range:      rangeLabel(range),
		activeCell: addr(active.r, active.c),
		rows:       range.r2 - range.r1 + 1,
		cols:       range.c2 - range.c1 + 1,
		text:       truncated ? text.slice(0, TEXT_MAX_LENGTH).trimEnd() : text,
		truncated,
	};
};
