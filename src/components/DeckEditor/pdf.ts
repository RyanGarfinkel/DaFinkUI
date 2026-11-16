import { chartParts, rasterize, readTheme, standaloneSvg, themeResolver, toHex } from './exportHelpers';
import { downloadBlob, fileName, findStage } from './exporters';
import type { ExportTheme, Resolve } from './exportHelpers';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from './deck';
import type { Deck, DeckElement } from './deck';
import { parseRichText } from './richText';
import type { jsPDF } from 'jspdf';
import { FONTS } from './themes';

// A 1280×720 slide becomes a 960×540pt page (1px = 0.75pt). Everything is
// vector except photos: text is real, selectable text; charts and icons go
// through svg2pdf. jsPDF only has Helvetica, Times, and Courier built in, so
// each font maps to the closest of those.

const PT = 0.75;
const PAGE: [number, number] = [SLIDE_WIDTH * PT, SLIDE_HEIGHT * PT];
const LINE_HEIGHT = 1.25;

type BaseFont = 'helvetica' | 'times' | 'courier';

const baseFont = (stack: string): BaseFont => {
	const s = stack.toLowerCase();
	if(/mono|courier|consolas|menlo/.test(s)) return 'courier';
	if(/serif/.test(s.replace(/sans-serif/g, '')) || /georgia|times/.test(s)) return 'times';
	return 'helvetica';
};

const fontStyle = (bold?: boolean, italic?: boolean) => (bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal');

const hex = (color: string) => `#${color}`;

const drawText = (doc: jsPDF, el: Extract<DeckElement, { type: 'text' }>, theme: ExportTheme, resolve: Resolve) => {
	const family = baseFont(el.font ? FONTS[el.font].stack : theme.fontStack);
	const size = el.fontSize * PT;
	const lineHeight = size * LINE_HEIGHT;
	const boxX = el.x * PT;
	const boxWidth = el.width * PT;
	const baseColor = toHex(resolve(el.color)) ?? theme.text;
	let y = el.y * PT;
	let number = 0;

	doc.setFontSize(size);

	for(const paragraph of parseRichText(el.html, resolve))
	{
		number = paragraph.list === 'number' ? number + 1 : 0;
		const indent = paragraph.list ? size * 1.2 : 0;
		const width = boxWidth - indent;

		// Break runs into styled words, then fill lines up to the box width.
		const words = paragraph.runs.flatMap(run => run.text.split(/(\s+)/).filter(Boolean).map(text => ({ ...run, text, bold: run.bold ?? el.bold })));
		const measure = (w: typeof words[number]) => {
			doc.setFont(family, fontStyle(w.bold, w.italic));
			return doc.getTextWidth(w.text);
		};
		const lines: (typeof words)[] = [[]];
		let lineWidth = 0;
		for(const word of words)
		{
			const w = measure(word);
			const isSpace = !word.text.trim();
			if(lineWidth + w > width && lines.at(-1)!.length && !isSpace)
			{
				lines.push([]);
				lineWidth = 0;
			}
			if(isSpace && !lines.at(-1)!.length) continue;
			lines.at(-1)!.push(word);
			lineWidth += w;
		}

		lines.forEach((line, li) =>
		{
			const total = line.reduce((sum, w) => sum + measure(w), 0);
			let x = boxX + indent + (paragraph.align === 'center' ? (width - total) / 2 : paragraph.align === 'right' ? width - total : 0);

			if(li === 0 && paragraph.list)
			{
				doc.setFont(family, fontStyle(el.bold));
				doc.setTextColor(hex(baseColor));
				doc.text(paragraph.list === 'number' ? `${number}.` : '•', boxX, y, { baseline: 'top' });
			}

			for(const word of line)
			{
				const w = measure(word);
				const color = hex(word.color ?? baseColor);
				doc.setTextColor(color);
				doc.text(word.text, x, y, { baseline: 'top' });
				doc.setDrawColor(color);
				doc.setLineWidth(size * 0.06);
				if(word.underline) doc.line(x, y + size * 1.02, x + w, y + size * 1.02);
				if(word.strike) doc.line(x, y + size * 0.55, x + w, y + size * 0.55);
				if(word.href) doc.link(x, y, w, size, { url: word.href });
				x += w;
			}
			y += lineHeight;
		});
	}
};

const loadSize = (src: string) => new Promise<{ width: number; height: number }>((resolve, reject) =>
{
	const image = new Image();
	image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
	image.onerror = () => reject(new Error(`Couldn't load image ${src.slice(0, 60)}`));
	image.src = src;
});

const toDataUrl = async (src: string, el: DeckElement) => {
	if(src.startsWith('data:image/svg')) return rasterize(src, el.width, el.height);
	if(src.startsWith('data:')) return src;
	const blob = await (await fetch(src)).blob();
	return new Promise<string>(resolve =>
	{
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.readAsDataURL(blob);
	});
};

const drawImage = async (doc: jsPDF, el: Extract<DeckElement, { type: 'image' }>) => {
	if(!el.src) return;
	const data = await toDataUrl(el.src, el);
	const natural = await loadSize(data);
	const [bx, by, bw, bh] = [el.x * PT, el.y * PT, el.width * PT, el.height * PT];
	const scale = (el.fit === 'cover' ? Math.max : Math.min)(bw / natural.width, bh / natural.height);
	const [w, h] = [natural.width * scale, natural.height * scale];

	// Cover overflows the box, so clip to it.
	doc.saveGraphicsState();
	doc.rect(bx, by, bw, bh, null);
	doc.clip();
	doc.discardPath();
	doc.addImage(data, bx + (bw - w) / 2, by + (bh - h) / 2, w, h, undefined, 'FAST');
	doc.restoreGraphicsState();
};

// svg2pdf can't resolve CSS variables or stylesheet rules, so copy each node's
// computed paint and type onto its clone as plain attributes.
const inlineComputedStyles = (original: SVGElement, clone: SVGElement) => {
	const sources = [original, ...original.querySelectorAll('*')] as SVGElement[];
	const targets = [clone, ...clone.querySelectorAll('*')] as SVGElement[];
	sources.forEach((source, i) =>
	{
		const css = getComputedStyle(source);
		for(const prop of ['fill', 'stroke', 'stroke-width', 'opacity', 'font-size', 'font-family', 'font-weight'])
		{
			const value = css.getPropertyValue(prop);
			if(value && value !== 'none' && !value.startsWith('var(')) targets[i]?.setAttribute(prop, value);
		}
	});
};

interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

// Thumbnails are laid out at full slide size and CSS-transformed down, so
// on-screen rects need unscaling but computed lengths (font-size, padding) don't.
/** Where a rendered node sits on the slide, in slide pixels. */
const stageBox = (node: Element, stage: HTMLElement): Box => {
	const stageRect = stage.getBoundingClientRect();
	const scale = stageRect.width / SLIDE_WIDTH;
	const r = node.getBoundingClientRect();
	return { x: (r.left - stageRect.left) / scale, y: (r.top - stageRect.top) / scale, width: r.width / scale, height: r.height / scale };
};

const drawSvg = async (doc: jsPDF, svg: SVGSVGElement, box: Box, stroke?: string) => {
	const { svg2pdf } = await import('svg2pdf.js');
	const clone = standaloneSvg(svg, stroke ?? 'currentColor', { width: box.width, height: box.height });
	if(!stroke) inlineComputedStyles(svg, clone);
	if(!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
	await svg2pdf(clone, doc, { x: box.x * PT, y: box.y * PT, width: box.width * PT, height: box.height * PT });
};

const drawChart = async (doc: jsPDF, node: Element, stage: HTMLElement, theme: ExportTheme) => {
	const { surface, legend } = chartParts(node);
	if(surface) await drawSvg(doc, surface, stageBox(surface, stage));

	for(const item of legend)
	{
		const marker = item.querySelector('svg');
		const label = item.querySelector('span') ?? item;
		if(marker) await drawSvg(doc, marker, stageBox(marker, stage));

		const box = stageBox(label, stage);
		const css = getComputedStyle(label);
		const size = parseFloat(css.fontSize) * PT;
		doc.setFont(baseFont(css.fontFamily), 'normal');
		doc.setFontSize(size);
		doc.setTextColor(hex(toHex(css.color) ?? theme.text));
		doc.text(label.textContent ?? '', box.x * PT, (box.y + box.height / 2) * PT, { baseline: 'middle' });
	}
};

const drawTable = (doc: jsPDF, el: Extract<DeckElement, { type: 'table' }>, stage: HTMLElement, theme: ExportTheme) => {
	const family = baseFont(el.font ? FONTS[el.font].stack : theme.fontStack);
	const cells = stage.querySelectorAll<HTMLTableCellElement>(`[data-slide-element="${CSS.escape(el.id)}"] th, [data-slide-element="${CSS.escape(el.id)}"] td`);

	doc.setLineWidth(0.75);
	doc.setDrawColor(hex(theme.border));
	cells.forEach(cell =>
	{
		// Positions come from the rendered table, so wrapping and row heights match the slide.
		const box = stageBox(cell, stage);
		const [x, y, w, h] = [box.x * PT, box.y * PT, box.width * PT, box.height * PT];
		const header = cell.tagName === 'TH';
		const size = parseFloat(getComputedStyle(cell).fontSize) * PT;
		const pad = parseFloat(getComputedStyle(cell).paddingLeft) * PT;

		if(header)
		{
			doc.setFillColor(hex(theme.surface));
			doc.rect(x, y, w, h, 'F');
		}
		doc.rect(x, y, w, h, 'S');
		doc.setFont(family, header ? 'bold' : 'normal');
		doc.setFontSize(size);
		doc.setTextColor(hex(header ? theme.muted : theme.text));
		const text = cell.querySelector('input')?.value ?? cell.textContent ?? '';
		doc.text(doc.splitTextToSize(header ? text.toUpperCase() : text, w - pad * 2), x + pad, y + (h - size) / 2, { baseline: 'top' });
	});
};

const drawElement = async (doc: jsPDF, el: DeckElement, stage: HTMLElement, theme: ExportTheme, resolve: Resolve) => {
	const [x, y, w, h] = [el.x * PT, el.y * PT, el.width * PT, el.height * PT];
	const node = stage.querySelector(`[data-slide-element="${CSS.escape(el.id)}"]`);

	switch(el.type)
	{
	case 'text':
		drawText(doc, el, theme, resolve);
		return;

	case 'shape':
		doc.setFillColor(hex(toHex(resolve(el.fill)) ?? theme.accent));
		if(el.shape === 'ellipse') doc.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 'F');
		else doc.roundedRect(x, y, w, h, el.radius * PT, el.radius * PT, 'F');
		return;

	case 'line': {
		const [x1, y1, x2, y2] = [x + el.x1 * w, y + el.y1 * h, x + el.x2 * w, y + el.y2 * h];
		const color = hex(toHex(resolve(el.stroke)) ?? theme.text);
		const width = el.strokeWidth * PT;
		doc.setDrawColor(color);
		doc.setLineWidth(width);
		doc.setLineCap('round');
		doc.line(x1, y1, x2, y2);
		if(el.arrow)
		{
			// Matches the editor's marker: about 4 stroke-widths long.
			const angle = Math.atan2(y2 - y1, x2 - x1);
			const length = width * 4;
			const spread = Math.PI / 6;
			doc.setFillColor(color);
			doc.triangle(
				x2, y2,
				x2 - length * Math.cos(angle - spread), y2 - length * Math.sin(angle - spread),
				x2 - length * Math.cos(angle + spread), y2 - length * Math.sin(angle + spread),
				'F',
			);
		}
		return;
	}

	case 'image':
		await drawImage(doc, el);
		return;

	case 'icon': {
		const svg = node?.querySelector('svg');
		if(svg) await drawSvg(doc, svg, el, el.color ? resolve(el.color) : hex(theme.accent));
		return;
	}

	case 'chart':
		if(node) await drawChart(doc, node, stage, theme);
		return;

	case 'table':
		drawTable(doc, el, stage, theme);
		return;
	}
};

export const exportPdf = async (deck: Deck) => {
	const { jsPDF: JsPDF } = await import('jspdf');
	const doc = new JsPDF({ unit: 'pt', format: PAGE, orientation: 'landscape', compress: true });
	doc.setProperties({ title: deck.title });

	const slides = deck.slides.filter(s => !s.skipped);
	if(!slides.length) throw new Error('Every slide is skipped, so there\'s nothing to export.');

	for(const [i, slide] of slides.entries())
	{
		if(i > 0) doc.addPage(PAGE, 'landscape');
		const stage = findStage(slide.id);
		const theme = readTheme(stage);
		const resolve = themeResolver(getComputedStyle(stage));

		doc.setFillColor(hex(toHex(resolve(slide.background)) ?? theme.background));
		doc.rect(0, 0, PAGE[0], PAGE[1], 'F');
		for(const el of slide.elements) await drawElement(doc, el, stage, theme, resolve);
	}

	downloadBlob(doc.output('blob'), fileName(deck, 'pdf'));
};
