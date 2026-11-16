import type { SlidePoint } from '../SlideCanvas/SlideCanvas';
import { MIN_ELEMENT_SIZE } from '../SlideCanvas/geometry';
import { SLIDE_HEIGHT, SLIDE_WIDTH, newId } from './deck';
import type { DeckElement, ElementType } from './deck';
import type { Rect } from '../SlideCanvas/geometry';
import type { GlyphName } from './icons';

/** Moves, resizes, and drawing snap to this grid, in slide px. */
export const GRID_SIZE = 8;

export type DrawTool = 'text' | 'rect' | 'roundRect' | 'ellipse' | 'line' | 'arrow';

export const SHAPE_TOOLS: { tool: DrawTool; label: string; glyph: GlyphName }[] = [
	{ tool: 'rect',      label: 'Rectangle',         glyph: 'square' },
	{ tool: 'roundRect', label: 'Rounded rectangle', glyph: 'roundSquare' },
	{ tool: 'ellipse',   label: 'Ellipse',           glyph: 'circle' },
	{ tool: 'line',      label: 'Line',              glyph: 'line' },
	{ tool: 'arrow',     label: 'Arrow',             glyph: 'arrow' },
];

export const TOOL_LABELS: Record<DrawTool, string> = {
	text: 'Text box', ...Object.fromEntries(SHAPE_TOOLS.map(t => [t.tool, t.label])) as Record<Exclude<DrawTool, 'text'>, string>,
};

export const EDITABLE_TYPES: ElementType[] = ['text', 'table'];

const DEFAULT_SIZE: Record<DrawTool, { width: number; height: number }> = {
	text:      { width: 480, height: 80 },
	rect:      { width: 240, height: 160 },
	roundRect: { width: 240, height: 160 },
	ellipse:   { width: 200, height: 200 },
	line:      { width: 320, height: MIN_ELEMENT_SIZE },
	arrow:     { width: 320, height: MIN_ELEMENT_SIZE },
};

// A press without a meaningful drag drops a default-size element at the point.
const CLICK_TOLERANCE = GRID_SIZE;

const snapToGrid = (n: number) => Math.round(n / GRID_SIZE) * GRID_SIZE;

const centered = ({ width, height }: { width: number; height: number }): Rect => ({
	width,
	height,
	x: snapToGrid((SLIDE_WIDTH - width) / 2),
	y: snapToGrid((SLIDE_HEIGHT - height) / 2),
});

const clampToSlide = (rect: Rect): Rect => ({
	...rect,
	x: Math.min(Math.max(0, rect.x), SLIDE_WIDTH - rect.width),
	y: Math.min(Math.max(0, rect.y), SLIDE_HEIGHT - rect.height),
});

// Pads a thin dimension up to the minimum around its center, so a horizontal
// line still has a grabbable box and its endpoints land at 50% on that axis.
const padAxis = (start: number, size: number) => (size >= MIN_ELEMENT_SIZE ? [start, size] : [start - (MIN_ELEMENT_SIZE - size) / 2, MIN_ELEMENT_SIZE]);

const build = (tool: DrawTool, rect: Rect, ends?: { from: SlidePoint; to: SlidePoint }): DeckElement => {
	const base = { id: newId(), label: TOOL_LABELS[tool], ...rect };

	switch(tool)
	{
	case 'text':
		return { ...base, type: 'text', html: '<p></p>', fontSize: 32, color: '' };
	case 'rect':
	case 'roundRect':
		return { ...base, type: 'shape', shape: 'rect', fill: '', radius: tool === 'roundRect' ? 24 : 0 };
	case 'ellipse':
		return { ...base, type: 'shape', shape: 'ellipse', fill: '', radius: 0 };
	case 'line':
	case 'arrow': {
		const fraction = (p: SlidePoint) => ({ x: (p.x - rect.x) / rect.width, y: (p.y - rect.y) / rect.height });
		const [a, b] = ends ? [fraction(ends.from), fraction(ends.to)] : [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
		return { ...base, type: 'line', x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: '', strokeWidth: 4, arrow: tool === 'arrow' };
	}
	}
};

export const createDefault = (tool: DrawTool): DeckElement => build(tool, centered(DEFAULT_SIZE[tool]));

export const createFromDraw = (tool: DrawTool, from: SlidePoint, to: SlidePoint): DeckElement => {
	const dragged = Math.abs(to.x - from.x) > CLICK_TOLERANCE || Math.abs(to.y - from.y) > CLICK_TOLERANCE;
	if(!dragged) return build(tool, clampToSlide({ ...DEFAULT_SIZE[tool], x: from.x, y: from.y }));

	const [x, width] = padAxis(Math.min(from.x, to.x), Math.abs(to.x - from.x));
	const [y, height] = padAxis(Math.min(from.y, to.y), Math.abs(to.y - from.y));
	const rect = clampToSlide({ x, y, width, height });
	return build(tool, rect, tool === 'line' || tool === 'arrow' ? { from, to } : undefined);
};

const IMAGE_MAX = { width: 640, height: 480 };

export const createImage = (src: string, alt: string, natural: { width: number; height: number }): DeckElement => {
	const fit = Math.min(1, IMAGE_MAX.width / natural.width, IMAGE_MAX.height / natural.height);
	const size = { width: Math.round(natural.width * fit), height: Math.round(natural.height * fit) };
	return { id: newId(), label: alt || 'Image', type: 'image', src, alt, fit: 'cover', ...centered(size) };
};

export const createTable = (): DeckElement => ({
	id: newId(), label: 'Table', type: 'table', header: true, fontSize: 20, ...centered({ width: 720, height: 216 }),
	rows: [['Column 1', 'Column 2', 'Column 3'], ['', '', ''], ['', '', '']],
});

export const createChart = (): DeckElement => ({
	id: newId(), label: 'Chart', type: 'chart', chart: 'bar', seriesLabel: 'Value', ...centered({ width: 640, height: 400 }),
	data: [{ label: 'A', value: 40 }, { label: 'B', value: 65 }, { label: 'C', value: 52 }],
});
