export type { Theme } from './types';
export { defaultTheme } from './default';
export { oceanTheme } from './ocean';
export { emberTheme } from './ember';
export { forestTheme } from './forest';
export { noirTheme } from './noir';
export { plumTheme } from './plum';

import { defaultTheme } from './default';
import { forestTheme } from './forest';
import { oceanTheme } from './ocean';
import { emberTheme } from './ember';
import type { Theme } from './types';
import { noirTheme } from './noir';
import { plumTheme } from './plum';

export const themes: Theme[] = [defaultTheme, oceanTheme, emberTheme, forestTheme, noirTheme, plumTheme];

export const getThemeByName = (name: string) =>
{
	return themes.find(t => t.name === name) ?? defaultTheme;
};
