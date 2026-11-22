import { createEvaluator, type Evaluator } from '../../components/SheetEditor/formulas';
import type { ChartSource, ResolvedChart } from '../../components/DeckEditor/deck';
import { parseRange } from '../../components/SheetEditor/sheetops';
import { chartModel } from '../../components/SheetEditor/charts';
import type { Sheet } from '../../components/SheetEditor/sheet';

// A sheet never changes in place, so its evaluator (and the values it has already worked out) is reused until the sheet is replaced.
const evaluators = new WeakMap<Sheet, Evaluator>();

const evaluatorFor = (sheet: Sheet) => {
	let evaluator = evaluators.get(sheet);
	if(!evaluator)
	{
		evaluator = createEvaluator(sheet);
		evaluators.set(sheet, evaluator);
	}
	return evaluator;
};

/** A deck chart is one series: the first value column of the range. */
export const resolveSheetChart = (sheets: Map<string, Sheet>, source: ChartSource): ResolvedChart | null => {
	const sheet = sheets.get(source.sheetId);
	if(!sheet) return null;
	try
	{
		const { data, series } = chartModel(evaluatorFor(sheet), parseRange(source.range));
		const [first] = series;
		if(!first) return { data: [] };
		return {
			seriesLabel: first.label,
			data:        data.map(point => ({ label: String(point.label), value: Number(point[first.key]) })),
		};
	}
	catch
	{
		return null;
	}
};
