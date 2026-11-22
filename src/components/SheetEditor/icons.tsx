import type { ReactNode, SVGAttributes } from 'react';

const PATHS = {
	undo:        <><path d='M3 7v6h6' /><path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' /></>,
	redo:        <><path d='M21 7v6h-6' /><path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7' /></>,
	bold:        <path d='M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z' />,
	italic:      <><path d='M19 4h-9' /><path d='M14 20H5' /><path d='M15 4 9 20' /></>,
	alignLeft:   <><path d='M21 6H3' /><path d='M15 12H3' /><path d='M17 18H3' /></>,
	alignCenter: <><path d='M21 6H3' /><path d='M17 12H7' /><path d='M19 18H5' /></>,
	alignRight:  <><path d='M21 6H3' /><path d='M21 12H9' /><path d='M21 18H7' /></>,
	alignTop:    <><path d='M4 4h16' /><rect x='7' y='8' width='4' height='11' rx='1' /><rect x='13' y='8' width='4' height='6' rx='1' /></>,
	alignMiddle: <><path d='M4 12h16' /><rect x='7' y='6' width='4' height='12' rx='1' /><rect x='13' y='9' width='4' height='6' rx='1' /></>,
	alignBottom: <><path d='M4 20h16' /><rect x='7' y='5' width='4' height='11' rx='1' /><rect x='13' y='10' width='4' height='6' rx='1' /></>,
	textColor:  <><path d='M4 20h16' /><path d='m6 16 6-12 6 12' /><path d='M8 12h8' /></>,
	fill:        <><path d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z' /><path d='m5 2 5 5' /><path d='M2 13h15' /><path d='M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z' /></>,
	lasso:       <><path d='M3.7 14.5A10 8 0 0 1 2 10a10 8 0 0 1 20 0 10 8 0 0 1-10 8 10 8 0 0 1-5.2-1.2' /><path d='M7 22a5 5 0 0 1-2-4' /><circle cx='5' cy='16' r='2' /></>,
	more:        <><circle cx='12' cy='5' r='1' /><circle cx='12' cy='12' r='1' /><circle cx='12' cy='19' r='1' /></>,
	borders:     <><rect x='3' y='3' width='18' height='18' rx='2' /><path d='M12 3v18' /><path d='M3 12h18' /></>,
	chart:       <><path d='M3 3v18h18' /><path d='M7 15v3' /><path d='M12 9v9' /><path d='M17 12v6' /></>,
	download:   <><path d='M12 3v12' /><path d='m7 10 5 5 5-5' /><path d='M5 21h14' /></>,
} satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof PATHS;

interface GlyphProps extends SVGAttributes<SVGSVGElement> {
	name:  GlyphName;
	size?: number;
}

export const Glyph = ({ name, size = 16, ...props }: GlyphProps) => (
	<svg
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth={2}
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
		{...props}
	>
		{PATHS[name]}
	</svg>
);
