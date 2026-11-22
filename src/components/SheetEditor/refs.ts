import { parseAddr, type Range } from './sheet';

export interface FormulaRef {
	range: Range;
	color: string;
}

export interface FormulaSegment {
	text:   string;
	color?: string;
}

const REF_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#d97706', '#0891b2'];

const TOKEN = /"[^"]*"|(?<![A-Za-z0-9_.$])(\$?[A-Za-z]{1,3}\$?\d+)(?::(\$?[A-Za-z]{1,3}\$?\d+))?(?![A-Za-z0-9_(])/g;

/** Splits a formula into plain and cell-reference segments. Repeats of the same reference share a color. */
export const formulaRefs = (formula: string): { segments: FormulaSegment[]; refs: FormulaRef[] } => {
	if(!formula.startsWith('=')) return { segments: [{ text: formula }], refs: [] };

	const segments: FormulaSegment[] = [];
	const refs: FormulaRef[] = [];
	const colors = new Map<string, string>();
	let cursor = 0;

	for(const match of formula.matchAll(TOKEN))
	{
		const start = match.index;
		const from = match[1] && parseAddr(match[1]);
		const to = match[2] ? parseAddr(match[2]) : from;
		if(!from || !to) continue;

		const key = match[0].replace(/\$/g, '').toUpperCase();
		if(!colors.has(key)) colors.set(key, REF_COLORS[colors.size % REF_COLORS.length]);
		const color = colors.get(key)!;

		if(start > cursor) segments.push({ text: formula.slice(cursor, start) });
		segments.push({ text: match[0], color });
		cursor = start + match[0].length;
		refs.push({
			color,
			range: { r1: Math.min(from.r, to.r), c1: Math.min(from.c, to.c), r2: Math.max(from.r, to.r), c2: Math.max(from.c, to.c) },
		});
	}

	if(cursor < formula.length) segments.push({ text: formula.slice(cursor) });
	return { segments, refs };
};
