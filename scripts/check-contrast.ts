import { readdirSync, readFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = join(__dirname, '..', 'tokens');

type TokenEntry = { $value: string; $type: string };
type TokenFile = Record<string, unknown>;

const hexToLinear = (hex: string): number =>
{
	const c = parseInt(hex.slice(1), 16);
	const r = (c >> 16) & 0xff;
	const g = (c >> 8) & 0xff;
	const b = c & 0xff;

	const toLinear = (v: number): number =>
	{
		const s = v / 255;
		return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	};

	return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

const contrastRatio = (a: string, b: string): number =>
{
	const l1 = hexToLinear(a);
	const l2 = hexToLinear(b);
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
};

const getToken = (obj: TokenFile, path: string): string | null =>
{
	const parts = path.split('.');
	let cur: unknown = obj;
	for(const part of parts)
	{
		if(cur == null || typeof cur !== 'object') return null;
		cur = (cur as Record<string, unknown>)[part];
	}
	if(cur == null || typeof cur !== 'object') return null;
	const entry = cur as TokenEntry;
	return typeof entry.$value === 'string' ? entry.$value : null;
};

const CONTRAST_PAIRS: Array<{ fg: string; bg: string; min: number }> = [
	{ fg: 'text.subtle',       bg: 'surface.default', min: 4.5 },
	{ fg: 'input.placeholder', bg: 'surface.default', min: 4.5 },
	{ fg: 'input.border',      bg: 'surface.default', min: 3.0 },
	{ fg: 'surface.border',    bg: 'surface.default', min: 3.0 },
	{ fg: 'surface.active',    bg: 'surface.default', min: 3.0 },
	{ fg: 'danger.default',    bg: 'surface.default', min: 3.0 },
];

const REQUIRED_TOKENS = [
	'danger.bg',
	'danger.border',
	'success.bg',
	'success.border',
	'warning.bg',
	'warning.border',
];

interface Result
{
	theme: string;
	pair: string;
	actual: string;
	required: string;
	pass: boolean;
}

const pad = (s: string, n: number): string => s.padEnd(n);

const run = () =>
{
	const files = readdirSync(TOKENS_DIR)
		.filter(f => f.endsWith('.json') && f !== 'motion.json')
		.sort();

	const results: Result[] = [];
	let anyFail = false;

	for(const file of files)
	{
		const theme = basename(file, '.json');
		const raw = readFileSync(join(TOKENS_DIR, file), 'utf8');
		const data = JSON.parse(raw) as TokenFile;
		const color = (data['color'] ?? {}) as TokenFile;

		for(const token of REQUIRED_TOKENS)
		{
			const val = getToken(color, token);
			const pass = val !== null;
			if(!pass) anyFail = true;
			results.push({
				theme,
				pair: `${token} exists`,
				actual: val ?? 'MISSING',
				required: 'present',
				pass,
			});
		}

		for(const { fg, bg, min } of CONTRAST_PAIRS)
		{
			const fgVal = getToken(color, fg);
			const bgVal = getToken(color, bg);

			if(!fgVal || !bgVal)
			{
				anyFail = true;
				results.push({
					theme,
					pair: `${fg} / ${bg}`,
					actual: 'N/A',
					required: `${min.toFixed(1)}:1`,
					pass: false,
				});
				continue;
			}

			const ratio = contrastRatio(fgVal, bgVal);
			const pass = ratio >= min;
			if(!pass) anyFail = true;
			results.push({
				theme,
				pair: `${fg} / ${bg}`,
				actual: `${ratio.toFixed(2)}:1`,
				required: `${min.toFixed(1)}:1`,
				pass,
			});
		}
	}

	const col1 = Math.max(5, ...results.map(r => r.theme.length)) + 2;
	const col2 = Math.max(4, ...results.map(r => r.pair.length)) + 2;
	const col3 = Math.max(6, ...results.map(r => r.actual.length)) + 2;
	const col4 = Math.max(8, ...results.map(r => r.required.length)) + 2;

	const header = pad('THEME', col1) + pad('PAIR', col2) + pad('ACTUAL', col3) + pad('REQUIRED', col4) + 'RESULT';
	const divider = '-'.repeat(header.length);

	console.log(divider);
	console.log(header);
	console.log(divider);

	for(const r of results)
	{
		const line = pad(r.theme, col1) + pad(r.pair, col2) + pad(r.actual, col3) + pad(r.required, col4) + (r.pass ? 'PASS' : 'FAIL');
		console.log(line);
	}

	console.log(divider);

	const total = results.length;
	const passed = results.filter(r => r.pass).length;
	console.log(`\n${passed}/${total} checks passed`);

	if(anyFail) process.exit(1);
};

run();
