import { addr, colName, parseAddr, type Sheet } from './sheet';

export type ErrorCode = '#DIV/0!' | '#REF!' | '#NAME?' | '#VALUE!' | '#CYCLE!' | '#ERROR!' | '#NUM!';

export class SheetError {
	public readonly code: ErrorCode;

	constructor(code: ErrorCode)
	{
		this.code = code;
	}
}

export type Value = number | string | boolean | null | SheetError;

type Node =
	| { k: 'num'; v: number }
	| { k: 'str'; v: string }
	| { k: 'ref'; r: number; c: number }
	| { k: 'range'; r1: number; c1: number; r2: number; c2: number }
	| { k: 'name'; v: string }
	| { k: 'neg'; a: Node }
	| { k: 'pct'; a: Node }
	| { k: 'bin'; op: string; a: Node; b: Node }
	| { k: 'call'; fn: string; args: Node[] };

interface Token {
	t: 'num' | 'str' | 'ref' | 'name' | 'op';
	v: string;
}

const TOKEN = /\s*(?:(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|"((?:[^"]|"")*)"|(\$?[A-Za-z]{1,3}\$?\d+)(?![\w(])|([A-Za-z_][\w.]*)|(<>|<=|>=|[-+*/^&=<>(),:%]))/iy;

const tokenize = (src: string): Token[] => {
	const tokens: Token[] = [];
	TOKEN.lastIndex = 0;
	while(TOKEN.lastIndex < src.length)
	{
		if(/^\s*$/.test(src.slice(TOKEN.lastIndex))) break;
		const m = TOKEN.exec(src);
		if(!m) throw new SheetError('#ERROR!');
		if(m[1] !== undefined) tokens.push({ t: 'num', v: m[1] });
		else if(m[2] !== undefined) tokens.push({ t: 'str', v: m[2].replace(/""/g, '"') });
		else if(m[3] !== undefined) tokens.push({ t: 'ref', v: m[3] });
		else if(m[4] !== undefined) tokens.push({ t: 'name', v: m[4].toUpperCase() });
		else tokens.push({ t: 'op', v: m[5] });
	}
	return tokens;
};

const COMPARE = ['=', '<>', '<', '>', '<=', '>='];

const parse = (src: string): Node => {
	const tokens = tokenize(src);
	let i = 0;

	const peek = () => tokens[i];
	const isOp = (...ops: string[]) => peek()?.t === 'op' && ops.includes(peek().v);
	const expect = (op: string) => {
		if(!isOp(op)) throw new SheetError('#ERROR!');
		i++;
	};

	const binary = (next: () => Node, ops: string[]): Node => {
		let left = next();
		while(isOp(...ops))
		{
			const op = tokens[i++].v;
			left = { k: 'bin', op, a: left, b: next() };
		}
		return left;
	};

	const refNode = (token: Token): Node & { k: 'ref' } => {
		const pos = parseAddr(token.v);
		if(!pos) throw new SheetError('#REF!');
		return { k: 'ref', r: pos.r, c: pos.c };
	};

	const primary = (): Node => {
		const token = tokens[i++];
		if(!token) throw new SheetError('#ERROR!');
		if(token.t === 'num') return { k: 'num', v: Number(token.v) };
		if(token.t === 'str') return { k: 'str', v: token.v };
		if(token.t === 'ref')
		{
			const from = refNode(token);
			if(!isOp(':')) return from;
			i++;
			const next = tokens[i++];
			if(next?.t !== 'ref') throw new SheetError('#ERROR!');
			const to = refNode(next);
			return {
				k: 'range', r1: Math.min(from.r, to.r), c1: Math.min(from.c, to.c), r2: Math.max(from.r, to.r), c2: Math.max(from.c, to.c),
			};
		}
		if(token.t === 'name')
		{
			if(!isOp('(')) return { k: 'name', v: token.v };
			i++;
			const args: Node[] = [];
			if(!isOp(')'))
			{
				args.push(comparison());
				while(isOp(',')) { i++; args.push(comparison()); }
			}
			expect(')');
			return { k: 'call', fn: token.v, args };
		}
		if(token.v === '(')
		{
			const inner = comparison();
			expect(')');
			return inner;
		}
		throw new SheetError('#ERROR!');
	};

	const postfix = (): Node => {
		let node = primary();
		while(isOp('%')) { i++; node = { k: 'pct', a: node }; }
		return node;
	};

	const unary = (): Node => {
		if(isOp('-')) { i++; return { k: 'neg', a: unary() }; }
		if(isOp('+')) { i++; return unary(); }
		return postfix();
	};

	const power = () => binary(unary, ['^']);
	const product = () => binary(power, ['*', '/']);
	const sum = () => binary(product, ['+', '-']);
	const concat = () => binary(sum, ['&']);
	const comparison = () => binary(concat, COMPARE);

	const root = comparison();
	if(i < tokens.length) throw new SheetError('#ERROR!');
	return root;
};

const parsed = new Map<string, Node | SheetError>();

const parseCached = (src: string): Node | SheetError => {
	const hit = parsed.get(src);
	if(hit) return hit;
	let result: Node | SheetError;
	try
	{
		result = parse(src);
	}
	catch(error)
	{
		result = error instanceof SheetError ? error : new SheetError('#ERROR!');
	}
	parsed.set(src, result);
	return result;
};

const NUMERIC = /^[-+]?\$?[\d,]*\.?\d+(e[+-]?\d+)?%?$/i;

/** How a typed value is read: a number (with `$`, commas and `%` understood) or text. */
export const parseTyped = (raw: string): number | string => {
	const text = raw.trim();
	if(!NUMERIC.test(text)) return raw;
	const percent = text.endsWith('%');
	const n = Number(text.replace(/[$,%]/g, ''));
	if(Number.isNaN(n)) return raw;
	return percent ? n / 100 : n;
};

const toNumber = (v: Value): number | SheetError => {
	if(v instanceof SheetError) return v;
	if(v === null || v === '') return 0;
	if(typeof v === 'number') return v;
	if(typeof v === 'boolean') return v ? 1 : 0;
	const n = parseTyped(v);
	return typeof n === 'number' ? n : new SheetError('#VALUE!');
};

const toText = (v: Value): string => {
	if(v === null) return '';
	if(v instanceof SheetError) return v.code;
	if(typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
	return String(v);
};

const truthy = (v: Value): boolean | SheetError => {
	if(v instanceof SheetError) return v;
	if(typeof v === 'string') return v.toUpperCase() === 'TRUE' ? true : new SheetError('#VALUE!');
	return Boolean(v);
};

const firstError = (values: Value[]) => values.find((v): v is SheetError => v instanceof SheetError);

const compare = (op: string, a: Value, b: Value): boolean => {
	const numeric = typeof a !== 'string' && typeof b !== 'string';
	const [x, y] = numeric ? [Number(a ?? 0), Number(b ?? 0)] : [toText(a).toLowerCase(), toText(b).toLowerCase()];
	if(op === '=') return x === y;
	if(op === '<>') return x !== y;
	if(op === '<') return x < y;
	if(op === '>') return x > y;
	if(op === '<=') return x <= y;
	return x >= y;
};

type Operand = Value | Value[][];

const flatten = (operands: Operand[]): { values: Value[]; direct: Value[] } => {
	const values: Value[] = [];
	const direct: Value[] = [];
	operands.forEach(operand =>
	{
		if(Array.isArray(operand)) operand.forEach(row => values.push(...row));
		else
		{
			values.push(operand);
			direct.push(operand);
		}
	});
	return { values, direct };
};

/** Numbers an aggregate sees: range text and blanks are skipped, direct arguments are converted. */
const numbersIn = (operands: Operand[]): number[] | SheetError => {
	const { values, direct } = flatten(operands);
	const error = firstError(values);
	if(error) return error;
	const out: number[] = [];
	for(const v of values)
	{
		if(typeof v === 'number') out.push(v);
		else if(typeof v === 'boolean' && direct.includes(v)) out.push(v ? 1 : 0);
		else if(typeof v === 'string' && direct.includes(v))
		{
			const n = toNumber(v);
			if(n instanceof SheetError) return n;
			out.push(n);
		}
	}
	return out;
};

const aggregate = (reduce: (nums: number[]) => number) => (operands: Operand[]): Value =>
{
	const nums = numbersIn(operands);
	return nums instanceof SheetError ? nums : reduce(nums);
};

const unary1 = (fn: (n: number) => number) => ([a]: Operand[]): Value =>
{
	const n = toNumber(a as Value);
	if(n instanceof SheetError) return n;
	const result = fn(n);
	return Number.isFinite(result) ? result : new SheetError('#NUM!');
};

const text1 = (fn: (s: string) => Value) => ([a]: Operand[]): Value => (a instanceof SheetError ? a : fn(toText(a as Value)));

const median = (nums: number[]) => {
	if(!nums.length) return new SheetError('#NUM!');
	const sorted = [...nums].sort((x, y) => x - y);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const roundTo = ([a, digits]: Operand[]): Value => {
	const n = toNumber(a as Value);
	const d = digits === undefined ? 0 : toNumber(digits as Value);
	if(n instanceof SheetError) return n;
	if(d instanceof SheetError) return d;
	const factor = 10 ** Math.trunc(d);
	return Math.round((n + Number.EPSILON * Math.sign(n)) * factor) / factor;
};

const slice = (pick: (s: string, n: number) => string) => ([a, count]: Operand[]): Value =>
{
	const n = count === undefined ? 1 : toNumber(count as Value);
	if(n instanceof SheetError) return n;
	if(a instanceof SheetError) return a;
	return pick(toText(a as Value), Math.max(0, Math.trunc(n)));
};

const FUNCTIONS: Record<string, (operands: Operand[]) => Value> = {
	SUM:         aggregate(nums => nums.reduce((s, n) => s + n, 0)),
	PRODUCT:     aggregate(nums => nums.reduce((s, n) => s * n, 1)),
	AVERAGE:     operands =>
	{
		const nums = numbersIn(operands);
		if(nums instanceof SheetError) return nums;
		return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : new SheetError('#DIV/0!');
	},
	MIN:         aggregate(nums => (nums.length ? Math.min(...nums) : 0)),
	MAX:         aggregate(nums => (nums.length ? Math.max(...nums) : 0)),
	MEDIAN:      operands =>
	{
		const nums = numbersIn(operands);
		return nums instanceof SheetError ? nums : median(nums);
	},
	COUNT:       operands => flatten(operands).values.filter(v => typeof v === 'number').length,
	COUNTA:      operands => flatten(operands).values.filter(v => v !== null && v !== '').length,
	ABS:         unary1(Math.abs),
	SQRT:        unary1(Math.sqrt),
	INT:         unary1(Math.floor),
	ROUND:       roundTo,
	MOD:         ([a, b]) =>
	{
		const x = toNumber(a as Value);
		const y = toNumber(b as Value);
		if(x instanceof SheetError) return x;
		if(y instanceof SheetError) return y;
		return y === 0 ? new SheetError('#DIV/0!') : x - y * Math.floor(x / y);
	},
	POWER:       ([a, b]) =>
	{
		const x = toNumber(a as Value);
		const y = toNumber(b as Value);
		if(x instanceof SheetError) return x;
		if(y instanceof SheetError) return y;
		return x ** y;
	},
	AND:         operands =>
	{
		const results = flatten(operands).values.map(truthy);
		return firstError(results as Value[]) ?? results.every(Boolean);
	},
	OR:          operands =>
	{
		const results = flatten(operands).values.map(truthy);
		return firstError(results as Value[]) ?? results.some(Boolean);
	},
	NOT:         ([a]) =>
	{
		const t = truthy(a as Value);
		return t instanceof SheetError ? t : !t;
	},
	CONCAT:      operands => flatten(operands).values.map(toText).join(''),
	CONCATENATE: operands => flatten(operands).values.map(toText).join(''),
	LEN:         text1(s => s.length),
	UPPER:       text1(s => s.toUpperCase()),
	LOWER:       text1(s => s.toLowerCase()),
	TRIM:        text1(s => s.trim().replace(/\s+/g, ' ')),
	LEFT:        slice((s, n) => s.slice(0, n)),
	RIGHT:       slice((s, n) => (n ? s.slice(-n) : '')),
};

export const FUNCTION_NAMES = [...Object.keys(FUNCTIONS), 'IF', 'IFERROR'].sort();

export interface Evaluator {
	valueAt: (r: number, c: number) => Value;
}

/** Evaluates a sheet's cells on demand. Results are cached per evaluator, so build a new one after every edit. */
export const createEvaluator = (sheet: Sheet): Evaluator => {
	const memo = new Map<string, Value>();
	const visiting = new Set<string>();

	const inBounds = (r: number, c: number) => r >= 0 && c >= 0 && r < sheet.rows && c < sheet.cols;

	const valueAt = (r: number, c: number): Value => {
		if(!inBounds(r, c)) return new SheetError('#REF!');
		const key = addr(r, c);
		const cached = memo.get(key);
		if(cached !== undefined) return cached;
		const raw = sheet.cells[key]?.value ?? '';
		if(raw === '') return null;

		if(visiting.has(key)) return new SheetError('#CYCLE!');
		visiting.add(key);
		const value = raw.startsWith('=') ? evaluate(raw.slice(1)) : parseTyped(raw);
		visiting.delete(key);
		memo.set(key, value);
		return value;
	};

	const run = (node: Node): Operand => {
		switch(node.k)
		{
			case 'num':
			case 'str':
				return node.v;
			case 'ref':
				return valueAt(node.r, node.c);
			case 'range':
				return Array.from({ length: node.r2 - node.r1 + 1 }, (_, dr) => Array.from({ length: node.c2 - node.c1 + 1 }, (_, dc) => valueAt(node.r1 + dr, node.c1 + dc)));
			case 'name':
				if(node.v === 'TRUE') return true;
				if(node.v === 'FALSE') return false;
				return new SheetError('#NAME?');
			case 'neg':
			case 'pct':
			{
				const n = toNumber(scalar(run(node.a)));
				if(n instanceof SheetError) return n;
				return node.k === 'neg' ? -n : n / 100;
			}
			case 'bin':
				return binary(node.op, scalar(run(node.a)), scalar(run(node.b)));
			case 'call':
				return call(node.fn, node.args);
		}
	};

	const scalar = (operand: Operand): Value => (Array.isArray(operand) ? new SheetError('#VALUE!') : operand);

	const binary = (op: string, a: Value, b: Value): Value => {
		const error = firstError([a, b]);
		if(error) return error;
		if(COMPARE.includes(op)) return compare(op, a, b);
		if(op === '&') return toText(a) + toText(b);
		const x = toNumber(a);
		const y = toNumber(b);
		if(x instanceof SheetError) return x;
		if(y instanceof SheetError) return y;
		if(op === '+') return x + y;
		if(op === '-') return x - y;
		if(op === '*') return x * y;
		if(op === '/') return y === 0 ? new SheetError('#DIV/0!') : x / y;
		const result = x ** y;
		return Number.isFinite(result) ? result : new SheetError('#NUM!');
	};

	const call = (fn: string, args: Node[]): Value => {
		if(fn === 'IF')
		{
			if(args.length < 2) return new SheetError('#ERROR!');
			const test = truthy(scalar(run(args[0])));
			if(test instanceof SheetError) return test;
			if(test) return scalar(run(args[1]));
			return args[2] ? scalar(run(args[2])) : false;
		}
		if(fn === 'IFERROR')
		{
			if(args.length < 2) return new SheetError('#ERROR!');
			const first = scalar(run(args[0]));
			return first instanceof SheetError ? scalar(run(args[1])) : first;
		}
		const impl = FUNCTIONS[fn];
		if(!impl) return new SheetError('#NAME?');
		return impl(args.map(run));
	};

	const evaluate = (src: string): Value => {
		const ast = parseCached(src);
		if(ast instanceof SheetError) return ast;
		const result = run(ast);
		return Array.isArray(result) ? new SheetError('#VALUE!') : result;
	};

	return { valueAt };
};

const REF = /(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?::(\$?)([A-Za-z]{1,3})(\$?)(\d+))?(?![\w(])/g;

type Axis = 'row' | 'col';

interface Shift {
	axis:  Axis;
	at:    number;
	/** Positive inserts that many lines at `at`; negative deletes that many starting at `at`. */
	delta: number;
}

const shiftIndex = (index: number, { at, delta }: Shift, edge: 'single' | 'start' | 'end'): number | null => {
	if(delta > 0) return index >= at ? index + delta : index;
	const count = -delta;
	if(index < at) return index;
	if(index >= at + count) return index - count;
	if(edge === 'single') return null;
	return edge === 'start' ? at : at - 1;
};

/** Rewrites the cell references in a formula after rows or columns are inserted or deleted. References to deleted cells become #REF!. */
export const shiftFormula = (formula: string, shift: Shift): string => {
	if(!formula.startsWith('=')) return formula;
	return formula.split(/("(?:[^"]|"")*")/).map((part, i) =>
	{
		if(i % 2) return part;
		return part.replace(REF, (_, d1, c1, d2, r1, d3, c2, d4, r2) =>
		{
			const colA = c1.length ? parseAddr(`${c1}1`)!.c : 0;
			const rowA = Number(r1) - 1;
			const isRange = c2 !== undefined;
			const rowB = isRange ? Number(r2) - 1 : rowA;
			const colB = isRange ? parseAddr(`${c2}1`)!.c : colA;
			const edgeOf = (which: 'start' | 'end') => (isRange ? which : 'single');

			const move = (line: number, which: 'start' | 'end') => shiftIndex(line, shift, edgeOf(which));
			const [nRowA, nRowB, nColA, nColB] = shift.axis === 'row'
				? [move(rowA, 'start'), move(rowB, 'end'), colA, colB]
				: [rowA, rowB, move(colA, 'start'), move(colB, 'end')];

			if([nRowA, nRowB, nColA, nColB].includes(null) || nRowA! > nRowB! || nColA! > nColB!) return '#REF!';
			const first = `${d1}${colName(nColA!)}${d2}${nRowA! + 1}`;
			if(!isRange) return first;
			return `${first}:${d3}${colName(nColB!)}${d4}${nRowB! + 1}`;
		});
	}).join('');
};
