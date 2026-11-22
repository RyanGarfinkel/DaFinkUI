import { FUNCTION_DOCS, suggestFunctions } from './functions';
import { describe, it, expect } from 'vitest';
import { FUNCTION_NAMES } from './formulas';

describe('suggestFunctions', () =>
{
	it('documents every function the engine supports', () =>
	{
		expect(Object.keys(FUNCTION_DOCS).sort()).toEqual(FUNCTION_NAMES);
	});

	it('matches by name prefix, case-insensitively', () =>
	{
		expect(suggestFunctions('=ave')?.matches[0]).toBe('AVERAGE');
	});

	it('finds a function by what it is called elsewhere', () =>
	{
		expect(suggestFunctions('=mean')?.matches).toEqual(['AVERAGE']);
		expect(suggestFunctions('=total')?.matches).toContain('SUM');
	});

	it('suggests after an operator or an open parenthesis', () =>
	{
		const found = suggestFunctions('=1+SU');
		expect(found?.matches[0]).toBe('SUM');
		expect(found?.start).toBe(3);
		expect(suggestFunctions('=IF(MA')?.matches[0]).toBe('MAX');
	});

	it('stays quiet for plain text, cell references, and a finished name', () =>
	{
		expect(suggestFunctions('sum')).toBeNull();
		expect(suggestFunctions('=A1')).toBeNull();
		expect(suggestFunctions('=SUM')).toBeNull();
		expect(suggestFunctions('=SUM(')).toBeNull();
	});
});
