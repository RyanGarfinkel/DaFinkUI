import type { Resolve } from './exportHelpers';
import { toHex } from './exportHelpers';

// Tiptap's HTML as format-neutral paragraphs and styled runs, so the PowerPoint
// and PDF exporters agree on what a text box says and how it's styled.

export interface RichRun {
	text:       string;
	bold?:      boolean;
	italic?:    boolean;
	underline?: boolean;
	strike?:    boolean;
	/** Uppercase hex without `#`. */
	color?:     string;
	href?:      string;
}

export interface RichParagraph {
	align: 'left' | 'center' | 'right';
	list:  'bullet' | 'number' | null;
	runs:  RichRun[];
}

type Marks = Omit<RichRun, 'text'>;

const markFor = (el: HTMLElement, resolve: Resolve): Marks => {
	switch(el.tagName)
	{
	case 'STRONG': case 'B':             return { bold: true };
	case 'EM': case 'I':                 return { italic: true };
	case 'U':                            return { underline: true };
	case 'S': case 'DEL': case 'STRIKE': return { strike: true };
	case 'A':                            return { href: el.getAttribute('href') ?? undefined, underline: true };
	case 'SPAN':                         return el.style.color ? { color: toHex(resolve(el.style.color)) } : {};
	default:                             return {};
	}
};

const collectRuns = (node: Node, marks: Marks, runs: RichRun[], resolve: Resolve) => {
	node.childNodes.forEach(child =>
	{
		if(child.nodeType === Node.TEXT_NODE)
		{
			if(child.textContent) runs.push({ text: child.textContent, ...marks });
			return;
		}
		// Nested lists are their own paragraphs, collected separately.
		if(child instanceof HTMLElement && child.tagName !== 'UL' && child.tagName !== 'OL') collectRuns(child, { ...marks, ...markFor(child, resolve) }, runs, resolve);
	});
};

/** Each `<p>` (including those inside list items) becomes one paragraph. */
export const parseRichText = (html: string, resolve: Resolve): RichParagraph[] =>
	[...new DOMParser().parseFromString(html, 'text/html').body.querySelectorAll('p')].map(p =>
	{
		const runs: RichRun[] = [];
		collectRuns(p, {}, runs, resolve);
		const list = p.closest('li')?.parentElement?.tagName;
		return {
			align: (['center', 'right'].includes(p.style.textAlign) ? p.style.textAlign : 'left') as RichParagraph['align'],
			list:  list === 'OL' ? 'number' : list === 'UL' ? 'bullet' : null,
			runs,
		};
	});
