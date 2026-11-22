import type { DeckElement, Slide } from './deck';
import type { Editor } from '@tiptap/react';

/** What the user pointed at when they pressed Ask AI: a slide element, or the text they highlighted inside one. */
export interface DeckAskContext {
	slideId:      string;
	/** 1-based, as shown to the user. */
	slideNumber:  number;
	slideCount:   number;
	elementId:    string;
	elementLabel: string;
	elementType:  DeckElement['type'];
	/** The highlighted text, or the element's own text content (empty for shapes, icons and lines). */
	text:         string;
	/** True when `text` is only what the user highlighted, not the whole element. */
	selectedText: boolean;
}

const htmlToText = (html: string) => new DOMParser().parseFromString(html, 'text/html').body.textContent?.replace(/\s+/g, ' ').trim() ?? '';

/** The readable content of an element, for telling an agent what it is. */
export const elementText = (element: DeckElement): string => {
	switch(element.type)
	{
	case 'text':
		return htmlToText(element.html);
	case 'table':
		return element.rows.map(row => row.join(' | ')).join('\n');
	case 'chart':
		return element.data.map(row => `${row.label}: ${row.value}`).join(', ');
	case 'image':
		return element.alt;
	default:
		return '';
	}
};

export const selectedEditorText = (editor: Editor | null): string => {
	if(!editor) return '';
	const { from, to, empty } = editor.state.selection;
	return empty ? '' : editor.state.doc.textBetween(from, to, ' ').trim();
};

export const askContext = (slide: Slide, slideNumber: number, slideCount: number, element: DeckElement, highlighted = ''): DeckAskContext => ({
	slideId:      slide.id,
	slideNumber,
	slideCount,
	elementId:    element.id,
	elementLabel: element.label,
	elementType:  element.type,
	text:         highlighted || elementText(element),
	selectedText: highlighted !== '',
});
