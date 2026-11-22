export interface FunctionDoc {
	signature:   string;
	description: string;
	keywords?:   string[];
}

export const FUNCTION_DOCS: Record<string, FunctionDoc> = {
	ABS:         { signature: 'ABS(number)', description: 'The number without its sign.', keywords: ['absolute', 'positive'] },
	AND:         { signature: 'AND(a, b, …)', description: 'TRUE when every argument is true.', keywords: ['all', 'both'] },
	AVERAGE:     { signature: 'AVERAGE(range, …)', description: 'The mean of the numbers.', keywords: ['mean', 'avg'] },
	CONCAT:      { signature: 'CONCAT(a, b, …)', description: 'Joins text end to end.', keywords: ['join', 'merge', 'append'] },
	CONCATENATE: { signature: 'CONCATENATE(a, b, …)', description: 'Joins text end to end.', keywords: ['join', 'merge', 'append'] },
	COUNT:       { signature: 'COUNT(range, …)', description: 'How many cells hold a number.', keywords: ['how many', 'number of'] },
	COUNTA:      { signature: 'COUNTA(range, …)', description: 'How many cells are not empty.', keywords: ['how many', 'non-empty', 'filled'] },
	IF:          { signature: 'IF(test, then, else)', description: 'One value if the test is true, another if not.', keywords: ['condition', 'when', 'else'] },
	IFERROR:     { signature: 'IFERROR(value, fallback)', description: 'The fallback when the value is an error.', keywords: ['catch', 'error', 'fallback'] },
	INT:         { signature: 'INT(number)', description: 'Rounds down to a whole number.', keywords: ['floor', 'integer', 'truncate'] },
	LEFT:        { signature: 'LEFT(text, count)', description: 'The first characters of the text.', keywords: ['start', 'substring'] },
	LEN:         { signature: 'LEN(text)', description: 'How many characters the text has.', keywords: ['length', 'size'] },
	LOWER:       { signature: 'LOWER(text)', description: 'The text in lowercase.', keywords: ['case', 'small'] },
	MAX:         { signature: 'MAX(range, …)', description: 'The largest number.', keywords: ['largest', 'biggest', 'highest', 'top'] },
	MEDIAN:      { signature: 'MEDIAN(range, …)', description: 'The middle number when sorted.', keywords: ['middle'] },
	MIN:         { signature: 'MIN(range, …)', description: 'The smallest number.', keywords: ['smallest', 'lowest', 'least'] },
	MOD:         { signature: 'MOD(number, divisor)', description: 'The remainder after dividing.', keywords: ['remainder', 'modulo'] },
	NOT:         { signature: 'NOT(value)', description: 'Flips true to false and back.', keywords: ['negate', 'invert'] },
	OR:          { signature: 'OR(a, b, …)', description: 'TRUE when any argument is true.', keywords: ['any', 'either'] },
	POWER:       { signature: 'POWER(base, exponent)', description: 'The base raised to the exponent.', keywords: ['exponent', 'square', 'raise'] },
	PRODUCT:     { signature: 'PRODUCT(range, …)', description: 'Multiplies the numbers together.', keywords: ['multiply', 'times'] },
	RIGHT:       { signature: 'RIGHT(text, count)', description: 'The last characters of the text.', keywords: ['end', 'substring'] },
	ROUND:       { signature: 'ROUND(number, digits)', description: 'Rounds to a number of decimal places.', keywords: ['decimal', 'nearest'] },
	SQRT:        { signature: 'SQRT(number)', description: 'The square root.', keywords: ['root'] },
	SUM:         { signature: 'SUM(range, …)', description: 'Adds the numbers together.', keywords: ['total', 'add', 'plus'] },
	TRIM:        { signature: 'TRIM(text)', description: 'Removes extra spaces.', keywords: ['spaces', 'whitespace', 'clean'] },
	UPPER:       { signature: 'UPPER(text)', description: 'The text in uppercase.', keywords: ['case', 'capital'] },
};

export interface FunctionSuggestions {
	start:   number;
	matches: string[];
}

const MAX_SUGGESTIONS = 6;

const TRAILING_WORD = /(^=|[=+\-*/^&(,<>;\s])([A-Za-z]+)$/;

/** Functions matching the word at the end of a formula: by name first, then anywhere in the name, then by keyword ("mean" finds AVERAGE). */
export const suggestFunctions = (formula: string): FunctionSuggestions | null => {
	if(!formula.startsWith('=')) return null;
	const found = TRAILING_WORD.exec(formula);
	if(!found) return null;

	const word = found[2].toUpperCase();
	const lower = word.toLowerCase();
	const ranked = Object.entries(FUNCTION_DOCS)
		.map(([name, doc]) =>
		{
			if(name.startsWith(word)) return { name, rank: 0 };
			if(name.includes(word)) return { name, rank: 1 };
			if(doc.keywords?.some(keyword => keyword.includes(lower))) return { name, rank: 2 };
			return null;
		})
		.filter((entry): entry is { name: string; rank: number } => entry !== null)
		.sort((x, y) => x.rank - y.rank || x.name.length - y.name.length || x.name.localeCompare(y.name));

	if(!ranked.length || (ranked.length === 1 && ranked[0].name === word)) return null;
	return { start: formula.length - word.length, matches: ranked.slice(0, MAX_SUGGESTIONS).map(entry => entry.name) };
};
