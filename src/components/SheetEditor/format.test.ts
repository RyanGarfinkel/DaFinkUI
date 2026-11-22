import { display, isValidFormat } from './format';
import { describe, it, expect } from 'vitest';

describe('custom number formats', () =>
{
	it('pads, groups and rounds like a spreadsheet', () =>
	{
		expect(display(5, '000')).toBe('005');
		expect(display(1234567.891, '#,##0.00')).toBe('1,234,567.89');
		expect(display(1234.5, '#,##0')).toBe('1,235');
	});

	it('keeps required decimals and drops optional ones', () =>
	{
		expect(display(2, '0.0#')).toBe('2.0');
		expect(display(2.25, '0.0#')).toBe('2.25');
		expect(display(0.5, '#.00')).toBe('.50');
	});

	it('scales percentages and keeps literals', () =>
	{
		expect(display(0.256, '0.0%')).toBe('25.6%');
		expect(display(1200, '$#,##0')).toBe('$1,200');
		expect(display(12.5, '0.0 "kg"')).toBe('12.5 kg');
		expect(display(3, '0\\x')).toBe('3x');
	});

	it('puts the minus sign first, and none on a rounded zero', () =>
	{
		expect(display(-1200, '$#,##0')).toBe('-$1,200');
		expect(display(-0.001, '0.0')).toBe('0.0');
	});

	it('shows the plain number for a pattern with no digits, and leaves presets alone', () =>
	{
		expect(isValidFormat('abc')).toBe(false);
		expect(display(1234.5, 'abc')).toBe('1234.5');
		expect(display(1234.5, 'currency')).toBe('$1,234.50');
	});
});
