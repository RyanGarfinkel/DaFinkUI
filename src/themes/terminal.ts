import type { Theme } from './types';

export const terminalTheme: Theme = {
	name:   'terminal',
	label:  'Terminal',
	accent: '#22c55e',

	light: {
		'--color-brand':        '#15803d',
		'--color-brand-hover':  '#166534',
		'--color-brand-active': '#14532d',
		'--color-brand-ring':   '#15803d',
		'--color-brand-fg':     '#ffffff',

		'--color-danger':        '#dc2626',
		'--color-danger-hover':  '#b91c1c',
		'--color-danger-active': '#991b1b',
		'--color-danger-ring':   '#dc2626',

		'--color-success':        '#15803d',
		'--color-success-bg':     '#f0fdf4',
		'--color-success-border': '#bbf7d0',

		'--color-warning':        '#b45309',
		'--color-warning-bg':     '#fffbeb',
		'--color-warning-border': '#fcd34d',

		'--color-surface':              '#f5f5f5',
		'--color-surface-hover':        '#e5e5e5',
		'--color-surface-active':       '#d4d4d4',
		'--color-surface-border':       '#a3a3a3',
		'--color-surface-border-hover': '#737373',

		'--color-text':          '#0a0a0a',
		'--color-text-muted':    '#404040',
		'--color-text-subtle':   '#737373',
		'--color-text-inverted': '#f5f5f5',

		'--color-input-border':        '#a3a3a3',
		'--color-input-border-hover':  '#15803d',
		'--color-input-ring':          '#15803d',
		'--color-input-placeholder':   '#737373',
		'--color-input-disabled-bg':   '#e5e5e5',
		'--color-input-disabled-text': '#a3a3a3',
		'--color-input-error':         '#dc2626',
		'--color-input-error-ring':    '#dc2626',
	},

	dark: {
		'--color-brand':        '#22c55e',
		'--color-brand-hover':  '#4ade80',
		'--color-brand-active': '#86efac',
		'--color-brand-ring':   '#22c55e',
		'--color-brand-fg':     '#0a0e0a',

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

		'--color-surface':              '#0a0a0a',
		'--color-surface-hover':        '#141414',
		'--color-surface-active':       '#1f1f1f',
		'--color-surface-border':       '#262626',
		'--color-surface-border-hover': '#404040',

		'--color-text':          '#dcfce7',
		'--color-text-muted':    '#4ade80',
		'--color-text-subtle':   '#4ade80',
		'--color-text-inverted': '#0a0a0a',

		'--color-input-border':        '#262626',
		'--color-input-border-hover':  '#22c55e',
		'--color-input-ring':          '#22c55e',
		'--color-input-placeholder':   '#404040',
		'--color-input-disabled-bg':   '#141414',
		'--color-input-disabled-text': '#404040',
		'--color-input-error':         '#f87171',
		'--color-input-error-ring':    '#f87171',
	},
};
