import { askContext, elementText, selectedEditorText } from './askcontext';
import { describe, it, expect } from 'vitest';
import type { Editor } from '@tiptap/react';
import type { DeckElement } from './deck';
import { createSlide } from './deck';

const base = { id: 'e1', label: 'Thing', x: 0, y: 0, width: 100, height: 50 };

const text: DeckElement = { ...base, type: 'text', html: '<p>Growth, <strong>retention</strong>\nand more</p>', fontSize: 32, color: '' };
const table: DeckElement = { ...base, type: 'table', rows: [['Month', 'Signups'], ['July', '1,240']], header: true, fontSize: 20 };
const chart: DeckElement = { ...base, type: 'chart', chart: 'bar', seriesLabel: 'Signups', data: [{ label: 'Jul', value: 1 }, { label: 'Aug', value: 2 }] };
const image: DeckElement = { ...base, type: 'image', src: 'x.png', alt: 'A team photo', fit: 'cover' };
const shape: DeckElement = { ...base, type: 'shape', shape: 'rect', fill: '' };

describe('elementText', () =>
{
	it('reads text as plain, single-spaced text', () => expect(elementText(text)).toBe('Growth, retention and more'));
	it('lists table rows', () => expect(elementText(table)).toBe('Month | Signups\nJuly | 1,240'));
	it('lists chart data', () => expect(elementText(chart)).toBe('Jul: 1, Aug: 2'));
	it('uses an image alt text', () => expect(elementText(image)).toBe('A team photo'));
	it('is empty for elements with no readable content', () => expect(elementText(shape)).toBe(''));
});

describe('askContext', () =>
{
	const slide = { ...createSlide([text]), id: 's2' };

	it('describes the element and uses its own text', () =>
	{
		expect(askContext(slide, 2, 5, text)).toEqual({
			slideId: 's2', slideNumber: 2, slideCount: 5,
			elementId: 'e1', elementLabel: 'Thing', elementType: 'text',
			text: 'Growth, retention and more', selectedText: false,
		});
	});

	it('prefers highlighted text and says so', () =>
	{
		expect(askContext(slide, 2, 5, text, 'retention')).toMatchObject({ text: 'retention', selectedText: true });
	});
});

describe('selectedEditorText', () =>
{
	const editorWith = (from: number, to: number, content: string) => ({
		state: { selection: { from, to, empty: from === to }, doc: { textBetween: () => content } },
	}) as unknown as Editor;

	it('is empty with no editor or an empty selection', () =>
	{
		expect(selectedEditorText(null)).toBe('');
		expect(selectedEditorText(editorWith(3, 3, ''))).toBe('');
	});

	it('returns the trimmed highlighted text', () => expect(selectedEditorText(editorWith(1, 9, '  hello  '))).toBe('hello'));
});
