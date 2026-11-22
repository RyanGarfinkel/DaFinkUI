export type TextStyleId = 'title' | 'heading' | 'subheading' | 'body' | 'caption' | 'header' | 'footer';

interface TextStyle {
	label:    string;
	fontSize: number;
	bold:     boolean;
	/** Theme color reference, or empty for the theme's text color. */
	color:    string;
	/** Uses the theme's heading font. */
	heading:  boolean;
}

const MUTED = 'var(--color-text-muted)';

/**
 * Presets for text boxes, like paragraph styles. Choosing one sets the box's
 * size, weight, and color (all still editable afterwards), and the font follows
 * the theme: headings use its heading font, everything else its body font.
 */
export const TEXT_STYLES: Record<TextStyleId, TextStyle> = {
	title:      { label: 'Title',      fontSize: 72, bold: true,  color: '',    heading: true },
	heading:    { label: 'Heading',    fontSize: 48, bold: true,  color: '',    heading: true },
	subheading: { label: 'Subheading', fontSize: 32, bold: true,  color: '',    heading: true },
	body:       { label: 'Body',       fontSize: 28, bold: false, color: '',    heading: false },
	caption:    { label: 'Caption',    fontSize: 20, bold: false, color: MUTED, heading: false },
	header:     { label: 'Header',     fontSize: 18, bold: false, color: MUTED, heading: false },
	footer:     { label: 'Footer',     fontSize: 18, bold: false, color: MUTED, heading: false },
};

export const TEXT_STYLE_IDS = Object.keys(TEXT_STYLES) as TextStyleId[];

/** Select options: "No style" first (a plain box keeps whatever size and color it has), then every style. */
export const TEXT_STYLE_OPTIONS = [
	{ value: 'none', label: 'No style' },
	...TEXT_STYLE_IDS.map(id => ({ value: id, label: TEXT_STYLES[id].label })),
];

/** Whether a style's text uses the theme's heading font. */
export const usesHeadingFont = (style: TextStyleId | undefined) => !!style && TEXT_STYLES[style].heading;

/** The box fields a style sets. Spread under an element's own fields so explicit ones win. */
export const textStyleFields = (style: TextStyleId) => {
	const { fontSize, bold, color } = TEXT_STYLES[style];
	return { fontSize, bold, color };
};
