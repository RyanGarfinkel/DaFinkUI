import type { ReactNode, SVGAttributes } from 'react';
import { ELEMENT_GLYPH_PATHS } from './glyphs';

const EDITOR_PATHS = {
	text:        <><path d='M4 7V4h16v3' /><path d='M9 20h6' /><path d='M12 4v16' /></>,
	square:      <rect x='3' y='3' width='18' height='18' rx='2' />,
	smile:       <><circle cx='12' cy='12' r='10' /><path d='M8 14s1.5 2 4 2 4-2 4-2' /><path d='M9 9h.01' /><path d='M15 9h.01' /></>,
	table:       <><rect x='3' y='3' width='18' height='18' rx='2' /><path d='M3 9h18' /><path d='M3 15h18' /><path d='M12 3v18' /></>,
	chart:       <><path d='M3 3v18h18' /><path d='M7 16v-4' /><path d='M12 16V8' /><path d='M17 16v-7' /></>,
	undo:        <><path d='M3 7v6h6' /><path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' /></>,
	redo:        <><path d='M21 7v6h-6' /><path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7' /></>,
	play:        <path d='m6 3 14 9-14 9V3z' />,
	plus:        <><path d='M12 5v14' /><path d='M5 12h14' /></>,
	copy:        <><rect x='9' y='9' width='13' height='13' rx='2' /><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' /></>,
	trash:       <><path d='M3 6h18' /><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' /><path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' /></>,
	forward:     <><path d='m17 11-5-5-5 5' /><path d='m17 18-5-5-5 5' /></>,
	backward:    <><path d='m7 6 5 5 5-5' /><path d='m7 13 5 5 5-5' /></>,
	bold:        <path d='M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z' />,
	italic:      <><path d='M19 4h-9' /><path d='M14 20H5' /><path d='M15 4 9 20' /></>,
	underline:   <><path d='M6 4v6a6 6 0 0 0 12 0V4' /><path d='M4 20h16' /></>,
	list:        <><path d='M8 6h13' /><path d='M8 12h13' /><path d='M8 18h13' /><path d='M3 6h.01' /><path d='M3 12h.01' /><path d='M3 18h.01' /></>,
	alignLeft:   <><path d='M21 6H3' /><path d='M15 12H3' /><path d='M17 18H3' /></>,
	alignCenter: <><path d='M21 6H3' /><path d='M17 12H7' /><path d='M19 18H5' /></>,
	alignRight:  <><path d='M21 6H3' /><path d='M21 12H9' /><path d='M21 18H7' /></>,
	close:       <><path d='M18 6 6 18' /><path d='m6 6 12 12' /></>,
	strike:      <><path d='M16 4H9a3 3 0 0 0-2.83 4' /><path d='M14 12a4 4 0 0 1 0 8H6' /><path d='M4 12h16' /></>,
	orderedList: <><path d='M10 6h11' /><path d='M10 12h11' /><path d='M10 18h11' /><path d='M4 6h1v4' /><path d='M4 10h2' /><path d='M6 18H4c0-1 2-2 2-3s-1-1.5-2-1' /></>,
	link:        <><path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' /><path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' /></>,
	download:    <><path d='M12 3v12' /><path d='m7 10 5 5 5-5' /><path d='M5 21h14' /></>,
	sliders:     <><path d='M4 6h10' /><path d='M18 6h2' /><circle cx='16' cy='6' r='2' /><path d='M4 12h2' /><path d='M10 12h10' /><circle cx='8' cy='12' r='2' /><path d='M4 18h12' /><path d='M20 18h0' /><circle cx='18' cy='18' r='2' /></>,
	chevronDown: <path d='m6 9 6 6 6-6' />,
	alert:       <><path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' /><path d='M12 9v4' /><path d='M12 17h.01' /></>,
	folder:      <path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z' />,
	cloudCheck:  <><path d='M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z' /><path d='m9 14 2 2 4-4' /></>,
	cloudOff:    <><path d='m2 2 20 20' /><path d='M5.78 5.78A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.31-.2' /><path d='M21.53 16.11A4.5 4.5 0 0 0 17.5 10h-1.79A7 7 0 0 0 9.5 5.02' /></>,
	palette:     <><circle cx='13.5' cy='6.5' r='1' /><circle cx='17.5' cy='10.5' r='1' /><circle cx='8.5' cy='7.5' r='1' /><circle cx='6.5' cy='12.5' r='1' /><path d='M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z' /></>,
	eyeOff:      <><path d='M9.88 9.88a3 3 0 1 0 4.24 4.24' /><path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' /><path d='M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' /><path d='M2 2l20 20' /></>,
	roundSquare: <rect x='3' y='3' width='18' height='18' rx='6' />,
	circle:      <circle cx='12' cy='12' r='9' />,
	line:        <path d='M5 19 19 5' />,
	arrow:       <><path d='M5 19 19 5' /><path d='M10 5h9v9' /></>,
	shapes:      <><path d='M8.3 10a.7.7 0 0 1-.63-1.06l3.7-6.2a.7.7 0 0 1 1.22 0l3.69 6.2A.7.7 0 0 1 15.7 10z' /><rect x='3' y='14' width='7' height='7' rx='1' /><circle cx='17.5' cy='17.5' r='3.5' /></>,
	chevronLeft: <path d='m15 18-6-6 6-6' />,
	chevronRight: <path d='m9 18 6-6-6-6' />,
} satisfies Record<string, ReactNode>;

const PATHS = { ...ELEMENT_GLYPH_PATHS, ...EDITOR_PATHS };

export type GlyphName = keyof typeof PATHS;



interface GlyphProps extends SVGAttributes<SVGSVGElement> {
	name:  GlyphName;
	size?: number | string;
}

export const Glyph = ({ name, size = 16, ...props }: GlyphProps) => (
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
		{PATHS[name]}
	</svg>
);
