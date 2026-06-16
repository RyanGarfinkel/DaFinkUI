export interface Style
{
	name:  string;
	label: string;
	/** One-line description of the surface treatment, shown in docs */
	description: string;
	/** Surface tokens applied in light mode */
	light: Record<string, string>;
	/** Surface tokens applied in dark mode */
	dark: Record<string, string>;
}

/**
 * The surface-token contract every Style sets. These are orthogonal to the
 * color tokens owned by a Theme (palette) — a Style controls shape, depth,
 * and translucency; a Theme controls hue. Components consume them via
 * arbitrary-value utilities, e.g. `rounded-[var(--radius)]`.
 */
export const SURFACE_TOKENS = [
	'--radius-sm',
	'--radius',
	'--radius-lg',
	'--border-width',
	'--shadow-sm',
	'--shadow',
	'--shadow-lg',
	'--backdrop-blur',
	'--surface-alpha',
	'--inner-shadow',
	// Color of hard offset shadows (Brutalist). Defined in globals.css with a
	// default of var(--color-text); override per palette or per element to tint.
	'--shadow-color',
] as const;
