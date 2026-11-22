import type { TextStyleId } from './textstyles';
import { usesHeadingFont } from './textstyles';
import type { FontId } from './themes';
import { FONTS } from './themes';
// Shared by the PowerPoint and PDF exporters: color resolution, the slide's
// computed theme, and rasterizing SVG for formats that need bitmaps.

export type Resolve = (color: string) => string;

/** Slide colors can be theme references (var(--color-…)); resolve them against a slide's computed style. */
export const themeResolver = (css: CSSStyleDeclaration): Resolve => color =>
	(color.startsWith('var(') ? css.getPropertyValue(color.slice(4, -1).trim()).trim() : color);

/** `#rgb`, `#rrggbb`, or `rgb(...)` → uppercase `RRGGBB` (no `#`), or undefined for anything else. */
export const toHex = (color: string): string | undefined => {
	const value = color.trim();
	if(!value) return undefined;
	if(value.startsWith('#'))
	{
		const digits = value.slice(1);
		return (digits.length === 3 ? digits.split('').map(c => c + c).join('') : digits.slice(0, 6)).toUpperCase();
	}
	const rgb = value.match(/\d+(\.\d+)?/g);
	if(!rgb || rgb.length < 3) return undefined;
	return rgb.slice(0, 3).map(n => Math.round(Number(n)).toString(16).padStart(2, '0')).join('').toUpperCase();
};

export interface ExportTheme {
	background: string;
	text:       string;
	surface:    string;
	border:     string;
	muted:      string;
	accent:     string;
	/** First family in the font stack, e.g. Georgia. */
	font:       string;
	/** The full CSS stack, for picking a PDF base font. */
	fontStack:  string;
	/** Same two, for text marked `heading` (the body font when the theme has no heading font). */
	headingFont:      string;
	headingFontStack: string;
	/** Theme corner radius in px. */
	radius:     number;
}

const firstFamily = (stack: string) => stack.split(',')[0].replace(/["']/g, '').trim();

/** The font stack for one text element: its own font, else the theme's heading or body font. */
export const elementFontStack = (el: { font?: FontId; style?: TextStyleId }, theme: ExportTheme) =>
	(el.font ? FONTS[el.font].stack : usesHeadingFont(el.style) ? theme.headingFontStack : theme.fontStack);

/** The PowerPoint font name for one text element. */
export const elementFontFace = (el: { font?: FontId; style?: TextStyleId }, theme: ExportTheme) =>
	(el.font ? FONTS[el.font].face : usesHeadingFont(el.style) ? theme.headingFont : theme.font);

/** A slide's theme as hex colors, read from its rendered stage (so custom themes and overrides are included). */
export const readTheme = (stage: HTMLElement): ExportTheme => {
	const css = getComputedStyle(stage);
	const token = (name: string, fallback: string) => toHex(css.getPropertyValue(name)) ?? fallback;
	const heading = css.getPropertyValue('--deck-heading-font').trim();
	return {
		background: token('--color-surface', 'FFFFFF'),
		text:       token('--color-text', '18181B'),
		surface:    token('--color-surface-active', 'F4F4F5'),
		border:     token('--color-surface-border', 'E4E4E7'),
		muted:      token('--color-text-muted', '52525B'),
		accent:     token('--color-brand', '18181B'),
		font:       firstFamily(css.fontFamily),
		fontStack:  css.fontFamily,
		headingFont:      firstFamily(heading || css.fontFamily),
		headingFontStack: heading || css.fontFamily,
		radius:     parseFloat(css.getPropertyValue('--deck-radius')) || 0,
	};
};

export const rasterize = (src: string, width: number, height: number) => new Promise<string>((resolve, reject) =>
{
	const image = new Image();
	image.crossOrigin = 'anonymous';
	image.onload = () =>
	{
		const canvas = Object.assign(document.createElement('canvas'), { width: width * 2, height: height * 2 });
		canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
		try
		{
			resolve(canvas.toDataURL('image/png'));
		}
		catch(error)
		{
			reject(error);
		}
	};
	image.onerror = () => reject(new Error(`Couldn't load image ${src.slice(0, 60)}`));
	image.src = src;
});

/** A standalone copy of an inline SVG: namespaced (required outside HTML), sized, and with an explicit stroke color. */
export const standaloneSvg = (svg: SVGSVGElement, color: string, size: { width: number; height: number }, apply: 'stroke' | 'color' = 'stroke') => {
	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	// Icons are stroke-drawn, so the root stroke colors them. A free-form drawing sets only
	// `color`, which is what `currentColor` inside it resolves to; a root stroke would outline its fills.
	clone.setAttribute(apply, color);
	clone.setAttribute('width', String(size.width));
	clone.setAttribute('height', String(size.height));
	return clone;
};

/** A rendered chart's plot SVG and legend items. Legend markers are also `svg.recharts-surface`, and can come first in the DOM. */
export const chartParts = (node: Element) => ({
	surface: node.querySelector<SVGSVGElement>('.recharts-wrapper > svg.recharts-surface'),
	legend: [...node.querySelectorAll<HTMLElement>('.recharts-legend-item')],
});

export const svgToPng = (svg: SVGSVGElement, color: string, size: { width: number; height: number }, apply: 'stroke' | 'color' = 'stroke') =>
	rasterize(`data:image/svg+xml,${encodeURIComponent(standaloneSvg(svg, color, size, apply).outerHTML)}`, size.width, size.height);
