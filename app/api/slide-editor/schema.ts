import { SVG_MAX_LENGTH, checkSvg } from '@/src/components/DeckEditor/svg';
import type { FontId, ThemeId } from '@/src/components/DeckEditor/themes';
import { TEXT_STYLE_IDS } from '@/src/components/DeckEditor/textstyles';
import { ICON_ELEMENT_NAMES } from '@/src/components/DeckEditor/glyphs';
import { FONTS, THEMES } from '@/src/components/DeckEditor/themes';
import { VERTICAL_ALIGNS } from '@/src/components/DeckEditor/deck';
import { z } from 'zod';

// Docs-site-only: validates decks at the API boundary so a malformed save or
// import is rejected with a 400 instead of being stored and breaking the editor
// on the next load. In a real app, run the same schema in your backend.

const themeIds: [ThemeId, ...ThemeId[]] = ['custom', ...THEMES.map(t => t.id)];
const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'must be a #rrggbb color');
const fontIds = Object.keys(FONTS) as [FontId, ...FontId[]];

const id = z.string().min(1).max(64);
const color = z.string().max(64);
const coordinate = z.number().finite().min(-10000).max(10000);
const size = z.number().finite().min(1).max(10000);

const base = {
	id,
	label:  z.string().max(200),
	x:      coordinate,
	y:      coordinate,
	width:  size,
	height: size,
	effect: z.object({
		type:  z.enum(['none', 'fade', 'slide-up', 'slide-left', 'slide-right', 'scale', 'typewriter', 'scramble']),
		delay: z.number().min(0).max(60000),
	}).optional(),
};

const fraction = z.number().min(0).max(1);

const element = z.discriminatedUnion('type', [
	z.object({ ...base, type: z.literal('text'), html: z.string().max(50000), fontSize: z.number().min(4).max(400), color, font: z.enum(fontIds).optional(), style: z.enum(TEXT_STYLE_IDS).optional(),bold: z.boolean().optional(), placeholder: z.string().max(200).optional(), valign: z.enum(VERTICAL_ALIGNS).optional() }),
	z.object({ ...base, type: z.literal('shape'), shape: z.enum(['rect', 'ellipse']), fill: color, radius: z.number().min(0).max(5000).optional() }),
	// Uploaded images are stored as data URIs, so this allows several megabytes.
	z.object({ ...base, type: z.literal('image'), src: z.string().max(12_000_000), alt: z.string().max(500), fit: z.enum(['cover', 'contain']) }),
	z.object({ ...base, type: z.literal('icon'), icon: z.enum(ICON_ELEMENT_NAMES), color }),
	z.object({ ...base, type: z.literal('svg'), svg: z.string().max(SVG_MAX_LENGTH).superRefine((value, ctx) =>
	{
		const problem = checkSvg(value);
		if(problem) ctx.addIssue({ code: 'custom', message: problem });
	}), color }),
	z.object({ ...base, type: z.literal('line'), x1: fraction, y1: fraction, x2: fraction, y2: fraction, stroke: color, strokeWidth: z.number().min(0.5).max(100), arrow: z.boolean() }),
	z.object({ ...base, type: z.literal('table'), rows: z.array(z.array(z.string().max(2000)).min(1).max(20)).min(1).max(50), header: z.boolean(), fontSize: z.number().min(4).max(200), font: z.enum(fontIds).optional() }),
	z.object({ ...base, type: z.literal('chart'), chart: z.enum(['bar', 'line', 'area']), seriesLabel: z.string().max(100), data: z.array(z.object({ label: z.string().max(100), value: z.number().finite() })).min(1).max(100), source: z.object({ sheetId: z.string().max(64), range: z.string().max(40) }).optional() }),
]);

const slide = z.object({
	id,
	background: color,
	notes:      z.string().max(20000),
	transition: z.object({ type: z.enum(['none', 'fade', 'push', 'zoom', 'wipe']), duration: z.number().min(0).max(10000) }),
	ambient:    z.enum(['none', 'particles', 'meteors']),
	skipped:    z.boolean(),
	elements:   z.array(element).max(300),
});

export const deckSchema = z.object({
	title:  z.string().trim().min(1).max(200),
	theme:  z.enum(themeIds),
	customTheme: z.object({
		colors: z.object({ background: hex, surface: hex, border: hex, text: hex, muted: hex, accent: hex }),
		font:   z.enum(fontIds).optional(),
		headingFont: z.enum(fontIds).optional(),
		radius: z.number().min(0).max(200).optional(),
		margin: z.number().min(0).max(300).optional(),
	}).optional(),
	slides: z.array(slide).min(1).max(300),
});
