export type { Theme } from './types';
export { defaultTheme } from './default';
export { terminalTheme } from './terminal';
export { violetTheme } from './violet';
export { roseTheme } from './rose';

import { terminalTheme } from './terminal';
import { defaultTheme } from './default';
import { violetTheme } from './violet';
import type { Theme } from './types';
import { roseTheme } from './rose';

export const themes: Theme[] = [defaultTheme, violetTheme, roseTheme, terminalTheme];

export const getThemeByName = (name: string) =>
{
	return themes.find(t => t.name === name) ?? defaultTheme;
};
