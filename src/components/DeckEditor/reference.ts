import { AMBIENT_OPTIONS, EFFECT_OPTIONS, TRANSITION_OPTIONS } from './effects';
import { SLIDE_HEIGHT, SLIDE_WIDTH, VERTICAL_ALIGNS } from './deck';
import { FONTS, THEMES, THEME_COLOR_REFS } from './themes';
import { TEXT_STYLES, TEXT_STYLE_IDS } from './textstyles';
import { LAYOUTS } from './layouts';
import { SVG_TAGS } from './svg';

const FONT_IDS = Object.keys(FONTS) as (keyof typeof FONTS)[];

const values =(options: { value: string }[]) => options.map(o => o.value).join(' | ');

/**
 * Everything an agent needs to edit a deck's look and motion, built from the
 * same lists the editor uses, so it can't drift. Put it in a system prompt or
 * return it from a "describe deck settings" tool.
 */
export const DECK_REFERENCE = `Deck settings (all edits are DeckOps; invalid values throw a DeckOpError that lists the valid ones).

Slide canvas: ${SLIDE_WIDTH}x${SLIDE_HEIGHT}px, origin top-left.

THEME  { type: 'setTheme', theme, customTheme? }  |  { type: 'updateTheme', patch }
  theme: ${['custom', ...THEMES.map(t => t.id)].join(' | ')}
  Presets (radius px / margin px / heading font): ${THEMES.map(t => `${t.id} ${t.radius}/${t.margin}/${FONT_IDS.find(id => FONTS[id].stack === t.headingFont) ?? 'body'}`).join(', ')}
  'custom' needs customTheme: { colors: { background, surface, border, text, muted, accent } (#rrggbb each), font?, headingFont?: ${Object.keys(FONTS).join(' | ')}, radius?: 0-200, margin?: 0-300 }
  Prefer updateTheme to tweak the current theme: it switches to custom, seeded from the current theme, and merges the patch (colors per slot). Example: { type: 'updateTheme', patch: { colors: { accent: '#e11d48' }, headingFont: 'serif', radius: 24 } }
  font = body text; headingFont = text with a heading style (title, heading, subheading); radius = corners of shapes (when the shape sets no radius), images, tables, charts; margin = inset layouts use.
  Color slots in any color field: ${THEME_COLOR_REFS.map(r => `"${r.value}" (${r.label})`).join(', ')}, or a hex. An empty string means the theme default.

SLIDE  { type: 'updateSlide', slideId, patch }  |  { type: 'updateSlides', slideIds?, patch } (omit slideIds for every slide)
  patch: { background, notes, skipped, ambient: ${values(AMBIENT_OPTIONS)}, transition: { type: ${values(TRANSITION_OPTIONS)}, duration (ms) } }
  transition merges, so { transition: { type: 'fade' } } keeps the duration.

ELEMENT  { type: 'updateElement', slideId, elementId, patch }  |  { type: 'updateElements', slideIds?, elementType?, patch }
  Every element: x, y, width, height, label, effect: { type: ${values(EFFECT_OPTIONS)}, delay (ms after the slide transition) }
  effect merges; typewriter and scramble are text-only. An element's type can't change.
  Example, fade in every text box on every slide: { type: 'updateElements', elementType: 'text', patch: { effect: { type: 'fade', delay: 200 } } }

TEXT  { type: 'text', html, fontSize, color, font?, style?, bold?, valign? }: valign is where the text sits in a box taller than it (${VERTICAL_ALIGNS.join(' | ')}, default top). html uses <p>, <ul><li><p>, <strong>, <em>; leave color '' to follow the theme.
  style is a preset that sets fontSize, bold and color for you (explicit values you send win) and picks the theme font: ${TEXT_STYLE_IDS.map(id => `${id} (${TEXT_STYLES[id].fontSize}px${TEXT_STYLES[id].bold ? ' bold' : ''}${TEXT_STYLES[id].color ? ', muted' : ''}${TEXT_STYLES[id].heading ? ', heading font' : ''})`).join(', ')}.
  Header and footer are just styles: a small muted text box you place at the top or bottom edge of each slide where you want it (e.g. y 24 for a header, y 664 for a footer), so there is no shared header/footer to set up.
  Example footer: { type: 'addElement', slideId: 's1', element: { id: 's1:footer', label: 'Footer', type: 'text', style: 'footer', html: '<p>Acme · Q3 review</p>', x: 96, y: 664, width: 600, height: 32 } }
  SHAPE radius: omit it to follow the theme's radius.

SVG  { type: 'svg', label, x, y, width, height, svg, color }  for icons, logos, diagrams and illustrations.
  svg is ONE complete <svg viewBox="0 0 W H">…</svg>; it scales to the element's box, so pick a viewBox with the same aspect ratio as width/height.
  Use currentColor for the main color (it takes the element's color, or the theme text color), or hex fills; CSS variables don't work inside the svg.
  Allowed tags: ${SVG_TAGS.join(', ')}. Not allowed: script, style, filter, image, foreignObject, on* attributes, external links (href only to "#id"), comments.
  Invalid markup is rejected with the reason. Example: { type: 'addElement', slideId: 's1', element: { id: 's1:logo', label: 'Logo', type: 'svg', x: 96, y: 96, width: 96, height: 96, color: '', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>' } }

CHART  { type: 'chart', chart: bar | line | area, seriesLabel, data: [{ label, value }], source? }
  source: { sheetId, range } (A1 notation, e.g. "A1:B6") makes the chart read its rows from that spreadsheet in this chat, so it follows the sheet as it changes. A text first column labels the points; the first value column is the series, named by a text header. Give data as the current rows anyway; it is the fallback if the sheet can't be read. Set source to undefined in an updateElement patch to go back to typed-in data.

LAYOUTS: { type: 'addSlideFromLayout', layout, slideId, index? } with layout = ${LAYOUTS.map(l => l.id).join(' | ')}.
  Elements get ids "<slideId>:<name>", e.g. slideId "s2" with titleContent gives "s2:title" and "s2:body"; fill them with updateElement { patch: { html: '<p>Hello</p>' } }. Layouts use the theme margin, and their text boxes already have styles (title, heading, subheading, body).
  Content area under a layout title is y 184 to 624, x from margin to ${SLIDE_WIDTH} minus margin.`;
