export const SVG_MAX_LENGTH = 100_000;

/** Drawing elements only: no scripts, styles, filters, images, or foreign content. */
export const SVG_TAGS = [
	'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan',
	'defs', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'symbol', 'marker', 'use', 'title', 'desc',
];

const TAG = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const attributeProblem = (name: string, value: string) => {
	const lower = name.toLowerCase();
	if(lower.startsWith('on')) return `The "${name}" event attribute isn't allowed.`;
	if(lower === 'href' || lower === 'xlink:href') return value.trim().startsWith('#') ? null : 'Links must point to an id in the same SVG (href="#id"); external references aren\'t allowed.';
	if(lower === 'style' && /url\(|@import|expression\(|javascript:/i.test(value)) return 'style attributes can\'t use url(), @import, or scripts.';
	if(/javascript:|data:/i.test(value)) return `The "${name}" attribute can't contain javascript: or data: URLs.`;
	return null;
};

/**
 * Why `markup` can't be used as a slide's SVG, or null if it can. Strict on
 * purpose: markup that fails is rejected, never rewritten, so what an agent
 * wrote is what renders. Pure string checks, so it also runs on a server.
 */
export const checkSvg = (markup: string): string | null => {
	const text = markup.trim();
	if(!text) return 'SVG is empty. Provide a complete <svg viewBox="…">…</svg>.';
	if(text.length > SVG_MAX_LENGTH) return `SVG is longer than ${SVG_MAX_LENGTH} characters.`;
	if(!/^<svg[\s>]/i.test(text) || !/<\/svg\s*>$/i.test(text)) return 'SVG must be one <svg>…</svg> element with nothing before or after it.';
	if(/<\s*svg[^>]*\sviewBox\s*=/i.exec(text) === null) return 'The <svg> needs a viewBox (e.g. viewBox="0 0 24 24") so it scales to the element\'s box.';
	if(text.replace(TAG, '').includes('<')) return 'SVG contains markup that isn\'t a plain element (comments, CDATA, or a malformed tag).';

	for(const [, , rawName, attributes] of text.matchAll(TAG))
	{
		const name = rawName.toLowerCase();
		if(!SVG_TAGS.includes(name)) return `<${rawName}> isn't allowed. Use only: ${SVG_TAGS.join(', ')}.`;
		if(attributes.includes('<')) return 'Attribute values can\'t contain "<" (write &lt; instead).';
		for(const [, attribute, a, b, c] of attributes.matchAll(ATTRIBUTE))
		{
			const problem = attributeProblem(attribute, a ?? b ?? c ?? '');
			if(problem) return problem;
		}
	}

	return null;
};
