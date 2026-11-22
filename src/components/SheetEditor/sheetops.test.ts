import { applySheetOp, applySheetOps, applySheetOpsLenient, diffSheets, opRange, SheetOpError, type SheetOp } from './sheetops';
import { createSheet, type Sheet } from './sheet';
import { describe, it, expect } from 'vitest';
import { createEvaluator } from './formulas';

const BASE: Sheet = createSheet(10, 5, 'Budget');

describe('applySheetOp', () =>
{
	it('sets values, keeping existing formatting', () =>
	{
		const bold = applySheetOp(BASE, { type: 'styleCells', range: 'A1', style: { bold: true } });
		const next = applySheetOp(bold, { type: 'setCells', cells: { A1: 'Total', B1: '=1+2' } });
		expect(next.cells.A1).toEqual({ value: 'Total', bold: true });
		expect(createEvaluator(next).valueAt(0, 1)).toBe(3);
	});

	it('clears a value and drops the cell when nothing is left', () =>
	{
		const withValue = applySheetOp(BASE, { type: 'setCells', cells: { A1: 'x' } });
		expect(applySheetOp(withValue, { type: 'setCells', cells: { A1: '' } }).cells.A1).toBeUndefined();
	});

	it('grows the sheet when a cell is written past the edge', () =>
	{
		const next = applySheetOp(BASE, { type: 'setCells', cells: { H14: '1' } });
		expect(next.rows).toBe(14);
		expect(next.cols).toBe(8);
	});

	it('styles a range and removes a property with null', () =>
	{
		const styled = applySheetOp(BASE, { type: 'styleCells', range: 'A1:B2', style: { bold: true, fill: '#fee2e2' } });
		expect(styled.cells.B2).toEqual({ value: '', bold: true, fill: '#fee2e2' });
		const cleared = applySheetOp(styled, { type: 'styleCells', range: 'A1:B2', style: { bold: null, fill: null } });
		expect(cleared.cells).toEqual({});
	});

	it('inserts and deletes lines, re-pointing formulas', () =>
	{
		const sheet = applySheetOps(BASE, [{ type: 'setCells', cells: { A1: '1', A2: '=A1*2' } }, { type: 'insertLines', axis: 'row', at: 0, count: 1 }]);
		expect(sheet.cells.A3.value).toBe('=A2*2');
		expect(() => applySheetOp(sheet, { type: 'deleteLines', axis: 'row', at: 9, count: 5 })).toThrow(SheetOpError);
	});

	it('rejects bad addresses and ranges outside the sheet', () =>
	{
		expect(() => applySheetOp(BASE, { type: 'setCells', cells: { '1A': 'x' } })).toThrow(SheetOpError);
		expect(() => applySheetOp(BASE, { type: 'styleCells', range: 'A1:Z99', style: { bold: true } })).toThrow(SheetOpError);
	});

	it('resizes columns and renames', () =>
	{
		const next = applySheetOps(BASE, [{ type: 'resizeCol', col: 1, width: 200 }, { type: 'rename', title: 'Q4' }]);
		expect(next.colWidths[1]).toBe(200);
		expect(next.title).toBe('Q4');
	});
});

describe('applySheetOpsLenient', () =>
{
	it('skips ops that no longer fit and applies the rest', () =>
	{
		const ops: SheetOp[] = [
			{ type: 'styleCells', range: 'Z50:Z60', style: { bold: true } },
			{ type: 'setCells', cells: { A1: 'ok' } },
		];
		const { sheet, skipped } = applySheetOpsLenient(BASE, ops);
		expect(skipped).toHaveLength(1);
		expect(sheet.cells.A1.value).toBe('ok');
	});
});

describe('diffSheets', () =>
{
	it('produces ops that turn one sheet into the other, in both directions', () =>
	{
		const to = applySheetOps(BASE, [
			{ type: 'setCells', cells: { A1: 'a', B2: '=A1' } },
			{ type: 'styleCells', range: 'A1', style: { bold: true } },
			{ type: 'resizeCol', col: 0, width: 160 },
			{ type: 'insertLines', axis: 'col', at: 4, count: 2 },
		]);
		expect(applySheetOps(BASE, diffSheets(BASE, to))).toEqual(to);
		expect(applySheetOps(to, diffSheets(to, BASE)).cells).toEqual(BASE.cells);
	});

	it('is empty when nothing changed', () =>
	{
		expect(diffSheets(BASE, { ...BASE })).toEqual([]);
	});
});

describe('opRange', () =>
{
	it('reports the range an op touches', () =>
	{
		expect(opRange({ type: 'setCells', cells: { B2: '1', C4: '2' } })).toBe('B2:C4');
		expect(opRange({ type: 'setCells', cells: { B2: '1' } })).toBe('B2');
		expect(opRange({ type: 'styleCells', range: 'A1:A3', style: {} })).toBe('A1:A3');
		expect(opRange({ type: 'rename', title: 'x' })).toBeUndefined();
	});
});
