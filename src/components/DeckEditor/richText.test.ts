import { describe, it, expect } from 'vitest';
import { parseRichText } from './richText';

const identity = (color: string) => color;

describe('parseRichText', () =>
{
	it('splits paragraphs and keeps alignment', () =>
	{
		const paragraphs = parseRichText('<p>One</p><p style="text-align: center">Two</p>', identity);
		expect(paragraphs.map(p => p.align)).toEqual(['left', 'center']);
		expect(paragraphs.map(p => p.runs.map(r => r.text).join(''))).toEqual(['One', 'Two']);
	});

	it('carries nested marks onto runs', () =>
	{
		const [p] = parseRichText('<p>a <strong>b <em>c</em></strong> <u>d</u> <s>e</s></p>', identity);
		expect(p.runs.find(r => r.text === 'c')).toMatchObject({ bold: true, italic: true });
		expect(p.runs.find(r => r.text === 'd')).toMatchObject({ underline: true });
		expect(p.runs.find(r => r.text === 'e')).toMatchObject({ strike: true });
		expect(p.runs.find(r => r.text === 'a ')?.bold).toBeUndefined();
	});

	it('resolves span colors, including theme references, to hex', () =>
	{
		const resolve = (c: string) => (c === 'var(--color-brand)' ? '#ff0000' : c);
		const [p] = parseRichText('<p><span style="color: var(--color-brand)">x</span><span style="color: rgb(0, 128, 255)">y</span></p>', resolve);
		expect(p.runs.map(r => r.color)).toEqual(['FF0000', '0080FF']);
	});

	it('marks links as underlined with their href', () =>
	{
		const [p] = parseRichText('<p><a href="https://example.com">site</a></p>', identity);
		expect(p.runs[0]).toMatchObject({ href: 'https://example.com', underline: true });
	});

	it('turns list items into bullet and numbered paragraphs', () =>
	{
		const paragraphs = parseRichText('<ul><li><p>a</p></li><li><p>b</p></li></ul><ol><li><p>c</p></li></ol>', identity);
		expect(paragraphs.map(p => p.list)).toEqual(['bullet', 'bullet', 'number']);
	});
});
