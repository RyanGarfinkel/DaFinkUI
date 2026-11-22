import type { ChartSource, ResolvedChart } from '../../components/DeckEditor/deck';
import { createEvaluator } from '../../components/SheetEditor/formulas';
import { parseRange } from '../../components/SheetEditor/sheetops';
import { chartModel } from '../../components/SheetEditor/charts';
import type { Sheet } from '../../components/SheetEditor/sheet';

/** A deck chart is one series: the first value column of the range. */
export const resolveSheetChart = (sheets: Map<string, Sheet>, source: ChartSource): ResolvedChart | null => {
	const sheet = sheets.get(source.sheetId);
	if(!sheet) return null;
	try
	{
		const { data, series } = chartModel(createEvaluator(sheet), parseRange(source.range));
		const [first] = series;
		if(!first) return { data: [] };
		return {
			seriesLabel: first.label,
			data:        data.map(point => ({ label: String(point.label), value: Number(point[first.key]) || 0 })),
		};
	}
	catch
	{
		return null;
	}
};
