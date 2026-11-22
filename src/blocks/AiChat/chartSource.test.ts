import { createSheet } from '../../components/SheetEditor/sheet';
import { resolveSheetChart } from './chartSource';
import { describe, expect, it } from 'vitest';

const sheet = createSheet(10, 5, 'Sales');
sheet.cells = {
	A1: { value: 'Month' }, B1: { value: 'Revenue' }, C1: { value: 'Cost' },
	A2: { value: 'Jan' },   B2: { value: '10' },      C2: { value: '4' },
	A3: { value: 'Feb' },   B3: { value: '=B2*2' },   C3: { value: '5' },
};
const sheets = new Map([['s1', sheet]]);

describe('resolveSheetChart', () =>
{
	it('reads labels, the series name and the first value column', () =>
	{
		expect(resolveSheetChart(sheets, { sheetId: 's1', range: 'A1:C3' })).toEqual({
			seriesLabel: 'Revenue',
			data:        [{ label: 'Jan', value: 10 }, { label: 'Feb', value: 20 }],
		});
	});

	it('is null for a missing sheet or an unreadable range', () =>
	{
		expect(resolveSheetChart(sheets, { sheetId: 'gone', range: 'A1:B2' })).toBeNull();
		expect(resolveSheetChart(sheets, { sheetId: 's1', range: 'nonsense' })).toBeNull();
	});
});
