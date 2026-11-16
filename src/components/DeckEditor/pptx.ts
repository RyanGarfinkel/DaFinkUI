import { rasterize, readTheme, svgToPng, themeResolver, toHex } from './exportHelpers';
import { downloadBlob, fileName, findStage } from './exporters';
import type { ExportTheme, Resolve } from './exportHelpers';
import type { Deck, DeckElement } from './deck';
import type { RichParagraph } from './richText';
import { parseRichText } from './richText';
import { addMotion } from './pptxMotion';
import type PptxGenJS from 'pptxgenjs';
import { SLIDE_WIDTH } from './deck';
import { FONTS } from './themes';

// LAYOUT_WIDE is 13.333in x 7.5in, i.e. a 1280x720 slide at 96px per inch.
const PX_PER_INCH = SLIDE_WIDTH / 13.333;
const PT_PER_PX = 0.75;

const inches = (px: number) => px / PX_PER_INCH;

const toTextProps = (paragraphs: RichParagraph[]): PptxGenJS.TextProps[] => paragraphs.flatMap((p, i) =>
{
	const runs: PptxGenJS.TextProps[] = (p.runs.length ? p.runs : [{ text: '' }]).map(run => ({
		text:    run.text,
		options: {
			bold:      run.bold,
			italic:    run.italic,
			underline: run.underline ? { style: 'sng' } : undefined,
			strike:    run.strike ? 'sngStrike' : undefined,
			color:     run.color,
			hyperlink: run.href ? { url: run.href } : undefined,
			align:     p.align,
			bullet:    p.list === 'number' ? { type: 'number' } : p.list === 'bullet' ? true : undefined,
		},
	}));
	runs[runs.length - 1].options!.breakLine = i < paragraphs.length - 1;
	return runs;
});

const addElement = async (pptx: PptxGenJS, slide: PptxGenJS.Slide, el: DeckElement, stage: HTMLElement, theme: ExportTheme, resolve: Resolve) => {
	// Named by element id so pptxMotion can find each shape to animate it.
	const box = { x: inches(el.x), y: inches(el.y), w: inches(el.width), h: inches(el.height), objectName: el.id };

	switch(el.type)
	{
	case 'text':
		slide.addText(toTextProps(parseRichText(el.html, resolve)), {
			...box, margin: 0, valign: 'top', fit: 'none',
			fontSize: el.fontSize * PT_PER_PX,
			fontFace: el.font ? FONTS[el.font].face : theme.font,
			color:    toHex(resolve(el.color)) ?? theme.text,
			bold:     el.bold,
		});
		return;

	case 'shape':
		slide.addShape(el.shape === 'ellipse' ? pptx.ShapeType.ellipse : pptx.ShapeType.roundRect, {
			...box,
			fill:       { color: toHex(resolve(el.fill)) ?? theme.accent },
			line:       { type: 'none' },
			rectRadius: el.shape === 'rect' ? Math.min(1, el.radius / (Math.min(el.width, el.height) / 2)) : undefined,
		});
		return;

	case 'image': {
		if(!el.src) return;
		const sizing = { type: el.fit, w: box.w, h: box.h } as const;
		const data = el.src.startsWith('data:image/svg') ? await rasterize(el.src, el.width, el.height) : el.src;
		slide.addImage({ ...box, ...(data.startsWith('data:') ? { data } : { path: data }), sizing, altText: el.alt });
		return;
	}

	case 'icon': {
		const svg = stage.querySelector<SVGSVGElement>(`[data-slide-element="${CSS.escape(el.id)}"] svg`);
		if(!svg) return;
		const data = await svgToPng(svg, el.color ? resolve(el.color) : `#${theme.accent}`, el);
		slide.addImage({ ...box, data, altText: el.label });
		return;
	}

	case 'table': {
		const rows = el.rows.map((row, ri) => row.map(text => ({
			text,
			options: el.header && ri === 0 ? { bold: true, color: theme.muted, fill: { color: theme.surface } } : {},
		})));
		slide.addTable(rows, {
			...box, autoPage: false,
			fontSize: el.fontSize * PT_PER_PX,
			fontFace: el.font ? FONTS[el.font].face : theme.font,
			color:    theme.text,
			border:   { type: 'solid', pt: 0.75, color: theme.border },
			margin:   el.fontSize * 0.6 * PT_PER_PX,
			colW:     Array(el.rows[0]?.length ?? 1).fill(box.w / (el.rows[0]?.length ?? 1)),
		});
		return;
	}

	case 'line': {
		const [x1, y1, x2, y2] = [el.x + el.x1 * el.width, el.y + el.y1 * el.height, el.x + el.x2 * el.width, el.y + el.y2 * el.height];
		slide.addShape(pptx.ShapeType.line, {
			objectName: el.id,
			x:          inches(Math.min(x1, x2)),
			y:          inches(Math.min(y1, y2)),
			w:          inches(Math.abs(x2 - x1)),
			h:          inches(Math.abs(y2 - y1)),
			flipH:      x2 < x1,
			flipV:      y2 < y1,
			line:       { color: toHex(resolve(el.stroke)) ?? theme.text, width: el.strokeWidth * PT_PER_PX, endArrowType: el.arrow ? 'triangle' : undefined },
		});
		return;
	}

	case 'chart':
		slide.addChart(el.chart, [{ name: el.seriesLabel, labels: el.data.map(d => d.label), values: el.data.map(d => d.value) }], {
			...box,
			chartColors:       [theme.accent],
			showLegend:        true,
			legendPos:         'b',
			catAxisLabelColor: theme.muted,
			valAxisLabelColor: theme.muted,
		});
		return;
	}
};

export const exportPptx = async (deck: Deck) => {
	const { default: PptxGenJSClass } = await import('pptxgenjs');
	const pptx = new PptxGenJSClass();
	pptx.layout = 'LAYOUT_WIDE';
	pptx.title = deck.title;

	for(const source of deck.slides)
	{
		const stage = findStage(source.id);
		const theme = readTheme(stage);
		const resolve = themeResolver(getComputedStyle(stage));

		const slide = pptx.addSlide();
		slide.hidden = source.skipped;
		slide.background = { color: toHex(resolve(source.background)) ?? theme.background };
		if(source.notes) slide.addNotes(source.notes);

		for(const el of source.elements) await addElement(pptx, slide, el, stage, theme, resolve);
	}

	const built = await pptx.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
	downloadBlob(await addMotion(built, deck), fileName(deck, 'pptx'));
};
