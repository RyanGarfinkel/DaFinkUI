import { describe, it, expect } from 'vitest';
import { formulaRefs } from './refs';

describe('formulaRefs', () =>
{
	it('finds cells and ranges and gives each distinct reference its own color', () =>
	{
		const { refs, segments } = formulaRefs('=SUM(B2:B5)+C1');
		expect(refs).toHaveLength(2);
		expect(refs[0].range).toEqual({ r1: 1, c1: 1, r2: 4, c2: 1 });
		expect(refs[0].color).not.toBe(refs[1].color);
		expect(segments.map(s => s.text).join('')).toBe('=SUM(B2:B5)+C1');
	});

	it('reuses a color for a repeated reference, ignoring $ and case', () =>
	{
		const { refs } = formulaRefs('=A1+$a$1');
		expect(refs[0].color).toBe(refs[1].color);
	});

	it('ignores function names that look like cells, and text in quotes', () =>
	{
		expect(formulaRefs('=LOG10(A1)&"B2"').refs).toHaveLength(1);
	});

	it('finds nothing in plain values', () =>
	{
		expect(formulaRefs('A1').refs).toEqual([]);
	});
});
