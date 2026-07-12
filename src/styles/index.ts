export { SURFACE_TOKENS } from './types';
export type { Style } from './types';
export { brutalistStyle } from './brutalist';
export { neumorphStyle } from './neumorph';
export { minimalStyle } from './minimal';

import { brutalistStyle } from './brutalist';
import { neumorphStyle } from './neumorph';
import { minimalStyle } from './minimal';
import type { Style } from './types';

// `minimal` is the default (its values mirror the base tokens in globals.css),
// so selecting it removes the override entirely.
export const styles: Style[] = [minimalStyle, neumorphStyle, brutalistStyle];

export const getStyleByName = (name: string) => {
	return styles.find(s => s.name === name) ?? minimalStyle;
};
