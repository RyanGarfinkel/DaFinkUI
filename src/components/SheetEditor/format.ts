import { SheetError, type Value } from './formulas';
import type { Align, NumberFormat } from './sheet';

const FORMATTERS: Record<NumberFormat, (n: number) => string> = {
	general:  n => String(Number(n.toPrecision(12))),
	number:   n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
	currency: n => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
	percent:  n => `${(n * 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
};

export const FORMAT_OPTIONS: { value: NumberFormat; label: string }[] = [
	{ value: 'general', label: 'Automatic' },
	{ value: 'number', label: 'Number' },
	{ value: 'currency', label: 'Currency' },
	{ value: 'percent', label: 'Percent' },
];

interface Pattern {
	prefix:      string;
	suffix:      string;
	percent:     boolean;
	decimals:    number;
	minDecimals: number;
	minInt:      number;
	thousands:   boolean;
}

const MAX_DECIMALS = 15;

/** Reads an Excel-style pattern: `0` and `#` digits, `,` thousands, `.` decimals, `%` scales by 100, anything else (or "quoted" / \escaped) is literal. */
const parsePattern = (pattern: string): Pattern | null => {
	let prefix = '';
	let suffix = '';
	let core = '';
	let percent = false;
	let state: 'before' | 'in' | 'after' = 'before';

	for(let i = 0; i < pattern.length; i++)
	{
		const ch = pattern[i];
		let literal: string;
		if(ch === '"')
		{
			const end = pattern.indexOf('"', i + 1);
			if(end < 0) return null;
			literal = pattern.slice(i + 1, end);
			i = end;
		}
		else if(ch === '\\')
		{
			literal = pattern[i + 1] ?? '';
			i++;
		}
		else if('0#.,'.includes(ch))
		{
			if(state === 'after') return null;
			state = 'in';
			core += ch;
			continue;
		}
		else
		{
			if(ch === '%') percent = true;
			literal = ch;
		}
		if(state === 'in') state = 'after';
		if(state === 'before') prefix += literal;
		else suffix += literal;
	}

	const [whole, decimal = '', extra] = core.split('.');
	if(extra !== undefined || !/[0#]/.test(core)) return null;
	const decimalDigits = decimal.replace(/,/g, '');
	return {
		prefix,
		suffix,
		percent,
		decimals:    Math.min(decimalDigits.length, MAX_DECIMALS),
		minDecimals: decimalDigits.split('0').length - 1,
		minInt:      whole.split('0').length - 1,
		thousands:   whole.includes(','),
	};
};

export const isValidFormat = (pattern: string) => parsePattern(pattern) !== null;

export const isPresetFormat = (format: string): format is NumberFormat => Object.hasOwn(FORMATTERS, format);

const formatCustom = (n: number, pattern: string): string | null => {
	const parsed = parsePattern(pattern);
	if(!parsed) return null;

	const scaled = parsed.percent ? n * 100 : n;
	const fixed = Math.abs(scaled).toFixed(parsed.decimals);
	let [whole, decimal = ''] = fixed.split('.');
	while(decimal.length > parsed.minDecimals && decimal.endsWith('0')) decimal = decimal.slice(0, -1);
	whole = whole.padStart(parsed.minInt, '0');
	if(parsed.minInt === 0 && /^0+$/.test(whole)) whole = '';
	if(parsed.thousands) whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	const sign = scaled < 0 && Number(fixed) !== 0 ? '-' : '';
	return `${sign}${parsed.prefix}${decimal ? `${whole}.${decimal}` : whole}${parsed.suffix}`;
};

/** `format` is a preset name (`currency`) or a custom pattern (`#,##0.0 "kg"`). An invalid pattern shows the plain number. */
export const display = (value: Value, format: string = 'general'): string => {
	if(value === null) return '';
	if(value instanceof SheetError) return value.code;
	if(typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
	if(typeof value !== 'number') return value;
	if(isPresetFormat(format)) return FORMATTERS[format](value);
	return formatCustom(value, format) ?? FORMATTERS.general(value);
};

/** Numbers sit right, errors and booleans center, text left, unless the cell sets its own. */
export const naturalAlign = (value: Value): Align => {
	if(typeof value === 'number') return 'right';
	if(value instanceof SheetError || typeof value === 'boolean') return 'center';
	return 'left';
};
