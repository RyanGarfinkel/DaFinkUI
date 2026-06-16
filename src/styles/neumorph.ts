// Hand-authored surface style. See minimal.ts for the contract.
// NOTE: Neumorph controls only shape and shadow — it does not override any color
// tokens. The dual-shadow effect is most visible on mid-tone surfaces; on pure
// white the white highlight is faint, but the dark shadow still provides depth.
import type { Style } from './types';

export const neumorphStyle: Style =
{
	name:        'neumorph',
	label:       'Neumorph',
	description: 'Extruded elements emerge from the surface — depth from dual dark/light shadows, no border.',
	light:
	{
		'--radius-sm':     '0.875rem',
		'--radius':        '1.25rem',
		'--radius-lg':     '1.5rem',
		'--border-width':  '0px',
		'--shadow-sm':     '5px 5px 12px rgb(0 0 0 / 0.14), -5px -5px 12px rgb(255 255 255 / 0.80)',
		'--shadow':        '8px 8px 18px rgb(0 0 0 / 0.18), -8px -8px 18px rgb(255 255 255 / 0.85)',
		'--shadow-lg':     '12px 12px 24px rgb(0 0 0 / 0.20), -12px -12px 24px rgb(255 255 255 / 0.88)',
		'--backdrop-blur': '0px',
		'--surface-alpha': '1',
		'--inner-shadow':  'inset 5px 5px 12px rgb(0 0 0 / 0.14), inset -5px -5px 12px rgb(255 255 255 / 0.80)',
		'--input-focus-shadow': '0 0 0 2px var(--color-input-ring), inset 5px 5px 12px rgb(0 0 0 / 0.14), inset -5px -5px 12px rgb(255 255 255 / 0.80)',
	},
	dark:
	{
		'--radius-sm':     '0.875rem',
		'--radius':        '1.25rem',
		'--radius-lg':     '1.5rem',
		'--border-width':  '0px',
		'--shadow-sm':     '5px 5px 12px rgb(0 0 0 / 0.55), -5px -5px 12px rgb(255 255 255 / 0.06)',
		'--shadow':        '8px 8px 18px rgb(0 0 0 / 0.60), -8px -8px 18px rgb(255 255 255 / 0.07)',
		'--shadow-lg':     '12px 12px 24px rgb(0 0 0 / 0.65), -12px -12px 24px rgb(255 255 255 / 0.08)',
		'--backdrop-blur': '0px',
		'--surface-alpha': '1',
		'--inner-shadow':  'inset 5px 5px 12px rgb(0 0 0 / 0.55), inset -5px -5px 12px rgb(255 255 255 / 0.06)',
		'--input-focus-shadow': '0 0 0 2px var(--color-input-ring), inset 5px 5px 12px rgb(0 0 0 / 0.55), inset -5px -5px 12px rgb(255 255 255 / 0.06)',
	},
};
