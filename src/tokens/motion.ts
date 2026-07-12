/**
 * Motion tokens: mirrors CSS custom properties defined in globals.css @theme.
 * For MCP consumption. Not imported into components.
 */
export const motion = {
	duration: {
		fast:   '150ms',
		base:   '200ms',
		slow:   '300ms',
	},
	easing: {
		standard: 'cubic-bezier(0.2, 0, 0, 1)',
		enter:    'cubic-bezier(0, 0, 0.2, 1)',
		exit:     'cubic-bezier(0.4, 0, 1, 1)',
	},
} as const;
