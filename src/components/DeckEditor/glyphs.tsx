import type { ReactNode, SVGAttributes } from 'react';

/** Paths for the glyphs slide content can show: icon elements, plus the empty-image placeholder. */
export const ELEMENT_GLYPH_PATHS = {
	rocket:      <><path d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z' /><path d='m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z' /><path d='M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0' /><path d='M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5' /></>,
	star:        <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />,
	heart:       <path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z' />,
	check:       <><circle cx='12' cy='12' r='10' /><path d='m9 12 2 2 4-4' /></>,
	lightbulb:   <><path d='M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5' /><path d='M9 18h6' /><path d='M10 22h4' /></>,
	target:      <><circle cx='12' cy='12' r='10' /><circle cx='12' cy='12' r='6' /><circle cx='12' cy='12' r='2' /></>,
	trending:    <><path d='m22 7-8.5 8.5-5-5L2 17' /><path d='M16 7h6v6' /></>,
	users:       <><path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' /><circle cx='9' cy='7' r='4' /><path d='M22 21v-2a4 4 0 0 0-3-3.87' /><path d='M16 3.13a4 4 0 0 1 0 7.75' /></>,
	zap:         <path d='M13 2 3 14h9l-1 8 10-12h-9l1-8z' />,
	globe:       <><circle cx='12' cy='12' r='10' /><path d='M2 12h20' /><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' /></>,
	flag:        <><path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' /><path d='M4 22v-7' /></>,
	clock:       <><circle cx='12' cy='12' r='10' /><path d='M12 6v6l4 2' /></>,
	image:       <><rect x='3' y='3' width='18' height='18' rx='2' /><circle cx='9' cy='9' r='2' /><path d='m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21' /></>,
} satisfies Record<string, ReactNode>;

export const ICON_ELEMENT_NAMES = ['rocket', 'star', 'heart', 'check', 'lightbulb', 'target', 'trending', 'users', 'zap', 'globe', 'flag', 'clock'] as const;

export type IconName = typeof ICON_ELEMENT_NAMES[number];

interface ElementGlyphProps extends SVGAttributes<SVGSVGElement> {
	name:  keyof typeof ELEMENT_GLYPH_PATHS;
	size?: number | string;
}

export const ElementGlyph = ({ name, size = 16, ...props }: ElementGlyphProps) => (
	<svg
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
		{...props}
	>
		{ELEMENT_GLYPH_PATHS[name]}
	</svg>
);
