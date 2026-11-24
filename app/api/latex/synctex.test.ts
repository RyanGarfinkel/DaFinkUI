import { lineAt } from '@/src/blocks/LatexEditor/sync';
import { describe, it, expect } from 'vitest';
import { parseSynctex } from './synctex';
import { gzipSync } from 'node:zlib';

const SP_PER_POINT = 65536;
const BP = 72 / 72.27;

const build = (rows: string[]) => gzipSync([
	'SyncTeX Version:1',
	'Input:1:/work/./main.tex',
	'Input:2:/usr/share/article.cls',
	'Magnification:1000',
	'Unit:1',
	'Content:',
	'{1',
	...rows,
	'}1',
	'Postamble:',
].join('\n'));

describe('parseSynctex', () =>
{
	it('turns a box and its glue into points on the box line band', () =>
	{
		const points = parseSynctex(build([
			`(1,12:${100 * SP_PER_POINT},${200 * SP_PER_POINT}:${300 * SP_PER_POINT},${10 * SP_PER_POINT},${2 * SP_PER_POINT}`,
			`g1,12:${150 * SP_PER_POINT},${200 * SP_PER_POINT}`,
			')',
		]));

		expect(points).toHaveLength(2);
		const [page, x, top, bottom, line] = points[1];
		expect(page).toBe(1);
		expect(line).toBe(12);
		expect(x).toBeCloseTo(150 * BP, 0);
		expect(top).toBeCloseTo(190 * BP, 0);
		expect(bottom).toBeCloseTo(202 * BP, 0);
	});

	it('ignores records that belong to other files', () =>
	{
		const points = parseSynctex(build([
			`(2,40:${SP_PER_POINT},${SP_PER_POINT}:${SP_PER_POINT},${SP_PER_POINT},0`,
			`g2,40:${SP_PER_POINT},${SP_PER_POINT}`,
			')',
		]));

		expect(points).toEqual([]);
	});

	it('does not repeat identical points', () =>
	{
		const row = `g1,3:${SP_PER_POINT},${SP_PER_POINT}`;
		const points = parseSynctex(build([`(1,3:0,${SP_PER_POINT}:${SP_PER_POINT},${SP_PER_POINT},0`, row, row, ')']));

		expect(points).toHaveLength(2);
	});

	it('returns nothing for a file without content', () =>
	{
		expect(parseSynctex(gzipSync('SyncTeX Version:1'))).toEqual([]);
	});
});

describe('lineAt', () =>
{
	const points: Parameters<typeof lineAt>[0] = [[1, 100, 90, 102, 4], [1, 300, 90, 102, 5], [1, 100, 120, 132, 9], [2, 100, 90, 102, 77]];

	it('picks the stop closest sideways on the clicked text line', () =>
	{
		expect(lineAt(points, 1, 120, 96)).toBe(4);
		expect(lineAt(points, 1, 280, 96)).toBe(5);
	});

	it('picks the line the click is on, not a nearer stop on another line', () =>
	{
		expect(lineAt(points, 1, 100, 126)).toBe(9);
	});

	it('only looks at the clicked page', () =>
	{
		expect(lineAt(points, 2, 100, 96)).toBe(77);
	});

	it('finds nothing when the click is far from any text', () =>
	{
		expect(lineAt(points, 1, 100, 400)).toBeNull();
		expect(lineAt([], 1, 0, 0)).toBeNull();
	});
});
