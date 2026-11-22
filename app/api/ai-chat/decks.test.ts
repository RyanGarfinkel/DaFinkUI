import { applySheetOps } from '@/src/components/SheetEditor/sheetops';
import { resolveSheetChart } from '@/src/blocks/AiChat/chartSource';
import { CREATE_REPLY as SHEET_REPLY } from './sheets';
import { CREATE_REPLY, linkChartReply } from './decks';
import { describe, it, expect } from 'vitest';

const sheet = applySheetOps(SHEET_REPLY.sheetEdit!.base!, SHEET_REPLY.sheetEdit!.steps.map(s => s.op));
const afterDeck = [{ role: 'assistant', text: CREATE_REPLY.text }];

describe('scripted linked chart', () =>
{
	it('needs the budget sheet and a deck in the chat', () =>
	{
		expect(linkChartReply('chart the budget', afterDeck, [])).toBeNull();
		expect(linkChartReply('chart the budget', [], ['q3-budget'])).toBeNull();
		expect(linkChartReply('hello', afterDeck, ['q3-budget'])).toBeNull();
	});

	it('links a chart to the budget sheet once, and its fallback data matches the sheet', () =>
	{
		const reply = linkChartReply('chart the budget sheet', afterDeck, ['q3-budget'])!;
		expect(reply.deckEdit?.steps.length).toBeGreaterThan(0);

		const add = reply.deckEdit!.steps.map(s => s.op).find(op => op.type === 'addElement' && op.element.type === 'chart');
		const chart = add && add.type === 'addElement' && add.element.type === 'chart' ? add.element : null;
		expect(chart?.source).toEqual({ sheetId: 'q3-budget', range: 'A1:B5' });
		expect(resolveSheetChart(new Map([['q3-budget', sheet]]), chart!.source!)).toEqual({ seriesLabel: chart!.seriesLabel, data: chart!.data });

		expect(linkChartReply('chart the budget sheet', [{ role: 'assistant', text: reply.text }], ['q3-budget'])).toBeNull();
	});
});
