import { SLIDE_HEIGHT, SLIDE_WIDTH, createSlide, newId } from './deck';
import type { DeckElement, Slide } from './deck';
import type { TextStyleId } from './textstyles';
import { DEFAULT_MARGIN } from './themes';

// Layouts produce elements with theme-default colors only (empty `color`/`fill`),
// so a slide made from any layout follows whatever theme the deck uses.

export type LayoutId = 'title' | 'titleContent' | 'twoColumns' | 'section' | 'imageText' | 'chart' | 'comparison' | 'blank';

const GUTTER = 48;

type Box = Pick<DeckElement, 'x' | 'y' | 'width' | 'height'>;

interface LayoutOptions {
	/** Slide margin in px (the theme's). Defaults to 96. */
	margin?:  number;
	/** Makes element ids predictable: `<slideId>:title`, `<slideId>:body`, … Without it they're random. */
	slideId?: string;
}

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const build = (layout: LayoutId, { margin = DEFAULT_MARGIN, slideId }: LayoutOptions): DeckElement[] => {
	const contentWidth = SLIDE_WIDTH - margin * 2;
	const columnWidth = (contentWidth - GUTTER) / 2;
	const rightColumn = margin + columnWidth + GUTTER;
	const idFor = (label: string) => (slideId ? `${slideId}:${slug(label)}` : newId());

	const text = (label: string, placeholder: string, box: Box, fontSize: number, options: { bold?: boolean; style?: TextStyleId; center?: boolean; list?: boolean } = {}): DeckElement => ({
		id:   idFor(label),
		label,
		type: 'text',
		placeholder,
		fontSize,
		color: '',
		bold: options.bold,
		style: options.style,
		html: options.list ? '<ul><li><p></p></li></ul>' : options.center ? '<p style="text-align: center"></p>' : '<p></p>',
		...box,
	});

	const heading = (placeholder = 'Click to add title') =>
		text('Title', placeholder, { x: margin, y: 64, width: contentWidth, height: 88 }, 48, { bold: true, style: 'heading' });

	const body = (label: string, box: Box) => text(label, 'Add your points', box, 28, { list: true, style: 'body' });

	switch(layout)
	{
	case 'title':
		return [
			text('Title', 'Click to add title', { x: margin, y: 248, width: contentWidth, height: 120 }, 72, { bold: true, style: 'title', center: true }),
			text('Subtitle', 'Add a subtitle', { x: margin, y: 384, width: contentWidth, height: 56 }, 32, { center: true }),
		];
	case 'titleContent':
		return [heading(), body('Body', { x: margin, y: 184, width: contentWidth, height: 440 })];
	case 'twoColumns':
		return [
			heading(),
			body('Left column', { x: margin, y: 184, width: columnWidth, height: 440 }),
			body('Right column', { x: rightColumn, y: 184, width: columnWidth, height: 440 }),
		];
	case 'section':
		return [
			{ id: idFor('Accent bar'), label: 'Accent bar', type: 'shape', shape: 'rect', fill: '', x: margin, y: 280, width: 160, height: 16 },
			text('Section title', 'Section title', { x: margin, y: 312, width: contentWidth, height: 104 }, 64, { bold: true, style: 'title' }),
		];
	case 'imageText':
		return [
			heading(),
			{ id: idFor('Image'), label: 'Image', type: 'image', src: '', alt: '', fit: 'cover', x: margin, y: 184, width: columnWidth, height: 440 },
			body('Body', { x: rightColumn, y: 184, width: columnWidth, height: 440 }),
		];
	case 'chart':
		return [
			heading(),
			{
				id: idFor('Chart'), label: 'Chart', type: 'chart', chart: 'bar', seriesLabel: 'Value', x: margin, y: 184, width: contentWidth, height: SLIDE_HEIGHT - 184 - 64,
				data: [{ label: 'A', value: 40 }, { label: 'B', value: 65 }, { label: 'C', value: 52 }],
			},
		];
	case 'comparison':
		return [
			heading(),
			text('Left heading', 'Option A', { x: margin, y: 184, width: columnWidth, height: 56 }, 32, { bold: true, style: 'subheading' }),
			body('Left points', { x: margin, y: 256, width: columnWidth, height: 368 }),
			text('Right heading', 'Option B', { x: rightColumn, y: 184, width: columnWidth, height: 56 }, 32, { bold: true, style: 'subheading' }),
			body('Right points', { x: rightColumn, y: 256, width: columnWidth, height: 368 }),
		];
	case 'blank':
		return [];
	}
};

export const LAYOUTS: { id: LayoutId; label: string }[] = [
	{ id: 'title',        label: 'Title' },
	{ id: 'titleContent', label: 'Title and content' },
	{ id: 'twoColumns',   label: 'Two columns' },
	{ id: 'section',      label: 'Section header' },
	{ id: 'imageText',    label: 'Image and text' },
	{ id: 'chart',        label: 'Chart' },
	{ id: 'comparison',   label: 'Comparison' },
	{ id: 'blank',        label: 'Blank' },
];

/**
 * A new slide laid out by `layout`. Pass the theme's `margin` so the layout
 * matches it, and a `slideId` to get predictable element ids.
 */
export const createSlideFromLayout = (layout: LayoutId, options: LayoutOptions = {}): Slide => ({
	...createSlide(build(layout, options)),
	...(options.slideId && { id: options.slideId }),
});
