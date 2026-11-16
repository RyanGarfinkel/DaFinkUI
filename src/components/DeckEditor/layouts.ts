import { SLIDE_HEIGHT, SLIDE_WIDTH, createSlide, newId } from './deck';
import type { DeckElement, Slide } from './deck';

// Layouts produce elements with theme-default colors only (empty `color`/`fill`),
// so a slide made from any layout follows whatever theme the deck uses.

export type LayoutId = 'title' | 'titleContent' | 'twoColumns' | 'section' | 'imageText' | 'chart' | 'comparison' | 'blank';

const MARGIN = 96;
const GUTTER = 48;
const CONTENT_WIDTH = SLIDE_WIDTH - MARGIN * 2;
const COLUMN_WIDTH = (CONTENT_WIDTH - GUTTER) / 2;

type Box = Pick<DeckElement, 'x' | 'y' | 'width' | 'height'>;

const text = (label: string, placeholder: string, box: Box, fontSize: number, options: { bold?: boolean; center?: boolean; list?: boolean } = {}): DeckElement => ({
	id:   newId(),
	label,
	type: 'text',
	placeholder,
	fontSize,
	color: '',
	bold: options.bold,
	html: options.list ? '<ul><li><p></p></li></ul>' : options.center ? '<p style="text-align: center"></p>' : '<p></p>',
	...box,
});

const heading = (placeholder = 'Click to add title') =>
	text('Title', placeholder, { x: MARGIN, y: 64, width: CONTENT_WIDTH, height: 88 }, 48, { bold: true });

const body = (label: string, box: Box) => text(label, 'Add your points', box, 28, { list: true });

const BUILDERS: Record<LayoutId, () => DeckElement[]> = {
	title: () => [
		text('Title', 'Click to add title', { x: MARGIN, y: 248, width: CONTENT_WIDTH, height: 120 }, 72, { bold: true, center: true }),
		text('Subtitle', 'Add a subtitle', { x: MARGIN, y: 384, width: CONTENT_WIDTH, height: 56 }, 32, { center: true }),
	],
	titleContent: () => [
		heading(),
		body('Body', { x: MARGIN, y: 184, width: CONTENT_WIDTH, height: 440 }),
	],
	twoColumns: () => [
		heading(),
		body('Left column', { x: MARGIN, y: 184, width: COLUMN_WIDTH, height: 440 }),
		body('Right column', { x: MARGIN + COLUMN_WIDTH + GUTTER, y: 184, width: COLUMN_WIDTH, height: 440 }),
	],
	section: () => [
		{ id: newId(), label: 'Accent bar', type: 'shape', shape: 'rect', fill: '', radius: 8, x: MARGIN, y: 280, width: 160, height: 16 },
		text('Section title', 'Section title', { x: MARGIN, y: 312, width: CONTENT_WIDTH, height: 104 }, 64, { bold: true }),
	],
	imageText: () => [
		heading(),
		{ id: newId(), label: 'Image', type: 'image', src: '', alt: '', fit: 'cover', x: MARGIN, y: 184, width: COLUMN_WIDTH, height: 440 },
		body('Body', { x: MARGIN + COLUMN_WIDTH + GUTTER, y: 184, width: COLUMN_WIDTH, height: 440 }),
	],
	chart: () => [
		heading(),
		{
			id: newId(), label: 'Chart', type: 'chart', chart: 'bar', seriesLabel: 'Value', x: MARGIN, y: 184, width: CONTENT_WIDTH, height: SLIDE_HEIGHT - 184 - 64,
			data: [{ label: 'A', value: 40 }, { label: 'B', value: 65 }, { label: 'C', value: 52 }],
		},
	],
	comparison: () => [
		heading(),
		text('Left heading', 'Option A', { x: MARGIN, y: 184, width: COLUMN_WIDTH, height: 56 }, 32, { bold: true }),
		body('Left points', { x: MARGIN, y: 256, width: COLUMN_WIDTH, height: 368 }),
		text('Right heading', 'Option B', { x: MARGIN + COLUMN_WIDTH + GUTTER, y: 184, width: COLUMN_WIDTH, height: 56 }, 32, { bold: true }),
		body('Right points', { x: MARGIN + COLUMN_WIDTH + GUTTER, y: 256, width: COLUMN_WIDTH, height: 368 }),
	],
	blank: () => [],
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

/** A new slide with fresh ids, laid out by `layout`. */
export const createSlideFromLayout = (layout: LayoutId): Slide => createSlide(BUILDERS[layout]());
