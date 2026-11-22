import { parseDelimited, shiftLines, toDelimited } from './ops';
import { createEvaluator, shiftFormula } from './formulas';
import { createSheet, type Sheet } from './sheet';
import { describe, it, expect } from 'vitest';
import { display } from './format';

const sheetOf = (cells: Record<string, string>): Sheet => ({
	...createSheet(20, 10),
	cells: Object.fromEntries(Object.entries(cells).map(([key, value]) => [key, { value }])),
});

const shown = (cells: Record<string, string>, key: string) => {
	const sheet = sheetOf(cells);
	const match = /^([A-Z]+)(\d+)$/.exec(key)!;
	const c = match[1].charCodeAt(0) - 65;
	return display(createEvaluator(sheet).valueAt(Number(match[2]) - 1, c));
};

describe('formulas', () =>
{
	it('does arithmetic with precedence and cell references', () =>
	{
		expect(shown({ A1: '2', B1: '3', C1: '=A1+B1*4' }, 'C1')).toBe('14');
		expect(shown({ A1: '=-2^2' }, 'A1')).toBe('4');
		expect(shown({ A1: '50%', B1: '=A1*200' }, 'B1')).toBe('100');
	});

	it('aggregates ranges and skips text and blanks', () =>
	{
		const cells = { A1: '1', A2: '2', A3: 'x', A5: '6', B1: '=SUM(A1:A5)', B2: '=AVERAGE(A1:A5)', B3: '=COUNT(A1:A5)', B4: '=COUNTA(A1:A5)', B5: '=MAX(A1:A5)' };
		expect(shown(cells, 'B1')).toBe('9');
		expect(shown(cells, 'B2')).toBe('3');
		expect(shown(cells, 'B3')).toBe('3');
		expect(shown(cells, 'B4')).toBe('4');
		expect(shown(cells, 'B5')).toBe('6');
	});

	it('supports IF, comparisons, text, and IFERROR', () =>
	{
		expect(shown({ A1: '5', B1: '=IF(A1>3,"big","small")' }, 'B1')).toBe('big');
		expect(shown({ A1: '="a"&"b"&1' }, 'A1')).toBe('ab1');
		expect(shown({ A1: '=IFERROR(1/0,"n/a")' }, 'A1')).toBe('n/a');
		expect(shown({ A1: '=UPPER("hi")' }, 'A1')).toBe('HI');
		expect(shown({ A1: '=ROUND(2.567,1)' }, 'A1')).toBe('2.6');
	});

	it('reports errors', () =>
	{
		expect(shown({ A1: '=1/0' }, 'A1')).toBe('#DIV/0!');
		expect(shown({ A1: '=NOPE(1)' }, 'A1')).toBe('#NAME?');
		expect(shown({ A1: '=1+' }, 'A1')).toBe('#ERROR!');
		expect(shown({ A1: '="a"+1' }, 'A1')).toBe('#VALUE!');
		expect(shown({ A1: '=B1', B1: '=A1' }, 'A1')).toBe('#CYCLE!');
		expect(shown({ A1: '=1/0', B1: '=A1+1' }, 'B1')).toBe('#DIV/0!');
	});

	it('shifts references when lines are inserted or deleted', () =>
	{
		expect(shiftFormula('=A1+B3', { axis: 'row', at: 1, delta: 1 })).toBe('=A1+B4');
		expect(shiftFormula('=SUM(A1:A5)', { axis: 'row', at: 2, delta: 1 })).toBe('=SUM(A1:A6)');
		expect(shiftFormula('=SUM(A1:A5)', { axis: 'row', at: 1, delta: -2 })).toBe('=SUM(A1:A3)');
		expect(shiftFormula('=A2', { axis: 'row', at: 1, delta: -1 })).toBe('=#REF!');
		expect(shiftFormula('=$B$2+C1', { axis: 'col', at: 0, delta: 1 })).toBe('=$C$2+D1');
		expect(shiftFormula('="A1"&A1', { axis: 'row', at: 0, delta: 1 })).toBe('="A1"&A2');
	});

	it('moves cells and rewrites formulas on insert and delete', () =>
	{
		const sheet = sheetOf({ A1: '1', A2: '=A1+1' });
		const inserted = shiftLines(sheet, 'row', 0, 1);
		expect(inserted.cells.A2.value).toBe('1');
		expect(inserted.cells.A3.value).toBe('=A2+1');
		expect(inserted.rows).toBe(21);
		const deleted = shiftLines(sheet, 'row', 0, -1);
		expect(deleted.cells.A1.value).toBe('=#REF!+1');
	});

	it('round-trips delimited text with quotes', () =>
	{
		const rows = [['a', 'b,c'], ['say "hi"', 'x\ny']];
		expect(parseDelimited(toDelimited(rows, ','), ',')).toEqual(rows);
		expect(parseDelimited('1\t2\n3\t4\n', '\t')).toEqual([['1', '2'], ['3', '4']]);
	});
});
