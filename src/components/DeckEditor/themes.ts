import type { CSSProperties } from 'react';

/** `'custom'` resolves to the deck's own `customTheme`. */
export type ThemeId = 'app' | 'paper' | 'midnight' | 'ocean' | 'sunset' | 'forest' | 'custom';

export interface ThemeColors {
	background: string;
	/** Table headers and other raised areas. */
	surface:    string;
	border:     string;
	text:       string;
	/** Secondary text. At least 4.5:1 against `background`. */
	muted:      string;
	/** Charts, default shape fills, icons, and the selection outline. */
	accent:     string;
}

export interface SlideTheme {
	id:     ThemeId;
	label:  string;
	/** Null follows the app's own light/dark tokens. */
	colors: ThemeColors | null;
	font:   string | null;
}

export type FontId = 'sans' | 'serif' | 'mono' | 'rounded' | 'arial' | 'helvetica' | 'times' | 'courier' | 'verdana';

interface FontOption {
	label: string;
	/** CSS font stack. System and web-safe fonts only, so nothing is downloaded. */
	stack: string;
	/** Name PowerPoint should use. */
	face:  string;
}

export const FONTS: Record<FontId, FontOption> = {
	sans:      { label: 'Sans',      stack: 'ui-sans-serif, system-ui, sans-serif',                   face: 'Calibri' },
	serif:     { label: 'Serif',     stack: 'Georgia, "Times New Roman", serif',                      face: 'Georgia' },
	mono:      { label: 'Mono',      stack: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',    face: 'Consolas' },
	rounded:   { label: 'Rounded',   stack: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',    face: 'Arial Rounded MT Bold' },
	arial:     { label: 'Arial',     stack: 'Arial, Helvetica, sans-serif',                           face: 'Arial' },
	helvetica: { label: 'Helvetica', stack: '"Helvetica Neue", Helvetica, Arial, sans-serif',         face: 'Helvetica' },
	times:     { label: 'Times',     stack: '"Times New Roman", Times, serif',                        face: 'Times New Roman' },
	courier:   { label: 'Courier',   stack: '"Courier New", Courier, monospace',                      face: 'Courier New' },
	verdana:   { label: 'Verdana',   stack: 'Verdana, Geneva, sans-serif',                            face: 'Verdana' },
};

/** Select options: the theme's font first, then every override. */
export const FONT_OPTIONS = [
	{ value: 'theme', label: 'Theme font' },
	...Object.entries(FONTS).map(([value, font]) => ({ value, label: font.label })),
];

const SANS = FONTS.sans.stack;
const SERIF = FONTS.serif.stack;

export const THEMES: SlideTheme[] = [
	{ id: 'app', label: 'Match app', colors: null, font: null },
	{
		id: 'paper', label: 'Paper', font: SERIF,
		colors: { background: '#fbf8f3', surface: '#f1ebe1', border: '#e2d9cb', text: '#2b2622', muted: '#6b6157', accent: '#b4532a' },
	},
	{
		id: 'midnight', label: 'Midnight', font: SANS,
		colors: { background: '#0f1220', surface: '#1a1f35', border: '#2a3150', text: '#f1f3f9', muted: '#9aa3bf', accent: '#7c9cff' },
	},
	{
		id: 'ocean', label: 'Ocean', font: SANS,
		colors: { background: '#f0f7fb', surface: '#dcecf5', border: '#c3dceb', text: '#0c2a3a', muted: '#3f6577', accent: '#0e7c9e' },
	},
	{
		id: 'sunset', label: 'Sunset', font: SANS,
		colors: { background: '#fff6ef', surface: '#ffe7d6', border: '#f8cdb0', text: '#3b1d12', muted: '#8a4b33', accent: '#e8590c' },
	},
	{
		id: 'forest', label: 'Forest', font: SERIF,
		colors: { background: '#f3f7f2', surface: '#e1ecdf', border: '#c9dbc6', text: '#1d2b1c', muted: '#4f6a4c', accent: '#2f7d32' },
	},
];

export const getTheme = (id: ThemeId) => THEMES.find(t => t.id === id) ?? THEMES[0];

/**
 * Theme references usable anywhere a slide takes a color. They resolve against
 * the slide's theme, so a "muted" subtitle stays muted when the theme changes.
 */
export const THEME_COLOR_REFS = [
	{ value: 'var(--color-text)',       label: 'Theme text' },
	{ value: 'var(--color-text-muted)', label: 'Theme muted' },
	{ value: 'var(--color-brand)',      label: 'Theme accent' },
] as const;

export const themeColorLabel = (color: string) => THEME_COLOR_REFS.find(r => r.value === color)?.label;

export interface CustomTheme {
	colors: ThemeColors;
	font?:  FontId;
}

/** Starting colors for a custom theme when the current one (Match app) has none of its own. */
export const DEFAULT_CUSTOM_COLORS: ThemeColors = {
	background: '#ffffff', surface: '#f4f4f5', border: '#e4e4e7', text: '#18181b', muted: '#52525b', accent: '#4f46e5',
};

/** The theme a deck renders with: a preset, or its custom theme (falling back to Match app if it has none). */
export const resolveTheme = (theme: ThemeId, custom?: CustomTheme): SlideTheme =>
	(theme === 'custom' && custom
		? { id: 'custom', label: 'Custom', colors: custom.colors, font: custom.font ? FONTS[custom.font].stack : null }
		: getTheme(theme));

// Themes re-point the design tokens that slide content already uses, scoped to
// the stage, so every default-colored element follows the theme without
// knowing about it.
export const themeStageStyle = (theme: SlideTheme): CSSProperties | undefined => {
	if(!theme.colors) return undefined;
	const { background, surface, border, text, muted, accent } = theme.colors;

	return {
		['--color-surface' as string]:        background,
		['--color-surface-active' as string]: surface,
		['--color-surface-hover' as string]:  surface,
		['--color-surface-border' as string]: border,
		['--color-input-border' as string]:   border,
		['--color-text' as string]:           text,
		['--color-text-muted' as string]:     muted,
		['--color-text-subtle' as string]:    muted,
		['--color-brand' as string]:          accent,
		['--color-brand-ring' as string]:     accent,
		color:                                text,
		fontFamily:                           theme.font ?? undefined,
	};
};
