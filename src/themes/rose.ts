import type { Theme } from './types';

// Rose — crisp rose brand, barely-tinted white surfaces in light mode.
// Dark mode is near-black with a deep crimson undertone. Brand sits in the
// rose-600/400 range across modes; surfaces stay neutral enough to not compete.
export const roseTheme: Theme = {
	name:   'rose',
	label:  'Rose',
	accent: '#fb7185',

	light: {
		'--color-brand':        '#e11d48',
		'--color-brand-hover':  '#be123c',
		'--color-brand-active': '#9f1239',
		'--color-brand-ring':   '#e11d48',
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

		'--color-surface':              '#fffafb',
		'--color-surface-hover':        '#fff0f2',
		'--color-surface-active':       '#ffe4e6',
		'--color-surface-border':       '#fecdd3',
		'--color-surface-border-hover': '#fda4af',

		'--color-text':          '#3f0614',
		'--color-text-muted':    '#881337',
		'--color-text-subtle':   '#fda4af',
		'--color-text-inverted': '#ffffff',

		'--color-input-border':        '#fecdd3',
		'--color-input-border-hover':  '#fb7185',
		'--color-input-ring':          '#e11d48',
		'--color-input-placeholder':   '#fda4af',
		'--color-input-disabled-bg':   '#fff0f2',
		'--color-input-disabled-text': '#fda4af',
		'--color-input-error':         '#dc2626',
		'--color-input-error-ring':    '#dc2626',
	},

	// Near-black with a deep crimson undertone. Surface hierarchy (light → dark):
	//   active #2d0f19 → border #3d1527 → hover #200810 → base #160408
	dark: {
		'--color-brand':        '#fb7185',
		'--color-brand-hover':  '#fda4af',
		'--color-brand-active': '#fecdd3',
		'--color-brand-ring':   '#fb7185',
		'--color-brand-fg':     '#3f0614',

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

		'--color-surface':              '#160408',
		'--color-surface-hover':        '#200810',
		'--color-surface-active':       '#2d0f19',
		'--color-surface-border':       '#3d1527',
		'--color-surface-border-hover': '#561e38',

		'--color-text':          '#ffe4e6',
		'--color-text-muted':    '#fb7185',
		'--color-text-subtle':   '#3d1527',
		'--color-text-inverted': '#160408',

		'--color-input-border':        '#3d1527',
		'--color-input-border-hover':  '#561e38',
		'--color-input-ring':          '#fb7185',
		'--color-input-placeholder':   '#3d1527',
		'--color-input-disabled-bg':   '#200810',
		'--color-input-disabled-text': '#3d1527',
		'--color-input-error':         '#f87171',
		'--color-input-error-ring':    '#f87171',
	},
};
