// Hand-authored surface style. See minimal.ts for the contract.
import type { Style } from './types';

const lightVars = {
	'--radius-sm':     '0px',
	'--radius':        '0px',
	'--radius-lg':     '0px',
	'--border-width':  '2px',
	'--shadow-sm':     '5px 5px 0 0 var(--shadow-color)',
	'--shadow':        '7px 7px 0 0 var(--shadow-color)',
	'--shadow-lg':     '9px 9px 0 0 var(--shadow-color)',
	'--shadow-geo-sm': '5px 5px 0 0',
	'--shadow-geo':    '7px 7px 0 0',
	'--shadow-geo-lg': '9px 9px 0 0',
	'--backdrop-blur': '0px',
	'--surface-alpha': '1',
	'--inner-shadow':  'none',
};

const darkVars = { ...lightVars, '--shadow-color': '#3c3c46' };

export const brutalistStyle: Style =
{
	name:        'brutalist',
	label:       'Brutalist',
	description: 'Raw and bold — square corners, thick borders, hard offset shadow, high contrast.',
	light:       lightVars,
	dark:        darkVars,
};
