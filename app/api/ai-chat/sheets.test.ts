import { createEvaluator, SheetError } from '@/src/components/SheetEditor/formulas';
import { applySheetOps } from '@/src/components/SheetEditor/sheetops';
import { CREATE_REPLY, sheetReply } from './sheets';
import { describe, it, expect } from 'vitest';
import { sheetSchema } from './sheetSchema';

const created = () => applySheetOps(CREATE_REPLY.sheetEdit!.base!, CREATE_REPLY.sheetEdit!.steps.map(s => s.op));

describe('scripted sheet replies', () =>
{
	it('builds a sheet whose formulas all evaluate without errors', () =>
	{
		const sheet = created();
		const evaluator = createEvaluator(sheet);
		Object.keys(sheet.cells).forEach(key =>
		{
			const match = /^([A-Z]+)(\d+)$/.exec(key)!;
			expect(evaluator.valueAt(Number(match[2]) - 1, match[1].charCodeAt(0) - 65)).not.toBeInstanceOf(SheetError);
		});
		expect(evaluator.valueAt(5, 4)).toBe(181600);
		expect(evaluator.valueAt(8, 1)).toBe('Yes');
	});

	it('produces a sheet the API schema accepts', () =>
	{
		expect(sheetSchema.safeParse(created()).success).toBe(true);
	});

	it('creates on a request, revises the fresh sheet on an edit request, then starts over', () =>
	{
		const create = sheetReply('make me a budget spreadsheet', []);
		expect(create).toBe(CREATE_REPLY);
		const revise = sheetReply('add a share column', [{ role: 'assistant', text: CREATE_REPLY.text }]);
		expect(revise?.sheetEdit?.base).toBeUndefined();
		expect(sheetReply('another spreadsheet please', [{ role: 'assistant', text: revise!.text }])).toBe(CREATE_REPLY);
		expect(sheetReply('hello', [])).toBeNull();
	});

	it('applies the revision on top of the created sheet', () =>
	{
		const revise = sheetReply('add a share column', [{ role: 'assistant', text: CREATE_REPLY.text }])!;
		const next = applySheetOps(created(), revise.sheetEdit!.steps.map(s => s.op));
		const evaluator = createEvaluator(next);
		expect(evaluator.valueAt(5, 5)).toBeCloseTo(1);
	});
});
