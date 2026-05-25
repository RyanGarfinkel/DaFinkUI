import type { Theme } from './types';

// Violet — rich purple brand, nearly-white surface with a faint violet cast.
// Light surfaces are barely tinted; dark surfaces are near-black with a deep
// indigo undertone. Brand sits in the violet-600/400 range across modes.
export const violetTheme: Theme = {
	name:   'violet',
	label:  'Violet',
	accent: '#8b5cf6',

	light: {
		'--color-brand':        '#7c3aed',
		'--color-brand-hover':  '#6d28d9',
		'--color-brand-active': '#5b21b6',
		'--color-brand-ring':   '#7c3aed',
		'--color-brand-fg':     '#ffffff',

		'--color-danger':        '#dc2626',
		'--color-danger-hover':  '#b91c1c',
		'--color-danger-active': '#991b1b',
		'--color-danger-ring':   '#dc2626',

		'--color-success':        '#15803d',
		'--color-success-bg':     '#f0fdf4',
		'--color-success-border': '#bbf7d0',

		'--color-warning':        '#92400e',
		'--color-warning-bg':     '#fffbeb',
		'--color-warning-border': '#fcd34d',

		'--color-surface':              '#fdfcff',
		'--color-surface-hover':        '#f7f3ff',
		'--color-surface-active':       '#f0eaff',
		'--color-surface-border':       '#e4d9ff',
		'--color-surface-border-hover': '#cdb9fc',

		'--color-text':          '#1e1b4b',
		'--color-text-muted':    '#4c1d95',
		'--color-text-subtle':   '#c4b5fd',
		'--color-text-inverted': '#ffffff',

		'--color-input-border':        '#ddd6fe',
		'--color-input-border-hover':  '#a78bfa',
		'--color-input-ring':          '#7c3aed',
		'--color-input-placeholder':   '#c4b5fd',
		'--color-input-disabled-bg':   '#f7f3ff',
		'--color-input-disabled-text': '#c4b5fd',
		'--color-input-error':         '#dc2626',
		'--color-input-error-ring':    '#dc2626',
	},

	// Near-black with an indigo undertone. Surface hierarchy (light → dark):
	//   active #1e1933 → border #2c2545 → hover #151224 → base #0c0b14
	dark: {
		'--color-brand':        '#a78bfa',
		'--color-brand-hover':  '#c4b5fd',
		'--color-brand-active': '#ddd6fe',
		'--color-brand-ring':   '#a78bfa',
		'--color-brand-fg':     '#1e1b4b',

		'--color-danger':        '#f87171',
		'--color-danger-hover':  '#fca5a5',
		'--color-danger-active': '#fecaca',
		'--color-danger-ring':   '#f87171',

		'--color-success':        '#4ade80',
		'--color-success-bg':     '#052e16',
		'--color-success-border': '#166534',

		'--color-warning':        '#fbbf24',
		'--color-warning-bg':     '#1c1000',
		'--color-warning-border': '#854d0e',

		'--color-surface':              '#0c0b14',
		'--color-surface-hover':        '#151224',
		'--color-surface-active':       '#1e1933',
		'--color-surface-border':       '#2c2545',
		'--color-surface-border-hover': '#3d3460',

		'--color-text':          '#ede9fe',
		'--color-text-muted':    '#a78bfa',
		'--color-text-subtle':   '#3d3460',
		'--color-text-inverted': '#0c0b14',

		'--color-input-border':        '#2c2545',
		'--color-input-border-hover':  '#3d3460',
		'--color-input-ring':          '#a78bfa',
		'--color-input-placeholder':   '#3d3460',
		'--color-input-disabled-bg':   '#151224',
		'--color-input-disabled-text': '#2c2545',
		'--color-input-error':         '#f87171',
		'--color-input-error-ring':    '#f87171',
	},
};
