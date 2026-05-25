/**
 * Design tokens — source of truth for the MCP server.
 * These mirror the CSS custom properties defined in globals.css @theme.
 * Components use Tailwind utilities derived from those variables (e.g. bg-brand),
 * not these values directly.
 */
export const colors = {
	brand: {
		default: '#18181b',
		hover:   '#3f3f46',
		active:  '#52525b',
		ring:    '#18181b',
		fg:      '#ffffff',
		dark: {
			default: '#fafafa',
			hover:   '#f4f4f5',
			active:  '#e4e4e7',
			ring:    '#fafafa',
			fg:      '#18181b',
		},
	},
	danger: {
		default: '#dc2626',
		hover:   '#b91c1c',
		active:  '#991b1b',
		ring:    '#dc2626',
		dark: {
			default: '#ef4444',
			hover:   '#f87171',
			active:  '#fca5a5',
		},
	},
	success: {
		default: '#16a34a',
		bg:      '#f0fdf4',
		border:  '#bbf7d0',
		dark: {
			default: '#4ade80',
			bg:      '#052e16',
			border:  '#166534',
		},
	},
	warning: {
		default: '#d97706',
		bg:      '#fffbeb',
		border:  '#fde68a',
		dark: {
			default: '#fbbf24',
			bg:      '#1c1200',
			border:  '#92400e',
		},
	},
	surface: {
		default:      '#ffffff',
		hover:        '#f9fafb',
		active:       '#f4f4f5',
		border:       '#e4e4e7',
		borderHover:  '#d4d4d8',
		dark: {
			default:     '#27272a',
			hover:       '#3f3f46',
			active:      '#52525b',
			border:      '#3f3f46',
			borderHover: '#52525b',
		},
	},
	text: {
		default:  '#18181b',
		muted:    '#71717a',
		subtle:   '#a1a1aa',
		inverted: '#ffffff',
		dark: {
			default: '#f4f4f5',
			muted:   '#a1a1aa',
			subtle:  '#71717a',
		},
	},
	input: {
		border:           '#d4d4d8',
		borderHover:      '#a1a1aa',
		ring:             '#18181b',
		placeholder:      '#a1a1aa',
		disabledBg:       '#f4f4f5',
		disabledText:     '#a1a1aa',
		error:            '#dc2626',
		errorRing:        '#dc2626',
		dark: {
			border:      '#3f3f46',
			borderHover: '#52525b',
			disabledBg:  '#27272a',
		},
	},
} as const;
