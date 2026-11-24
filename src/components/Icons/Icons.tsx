import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
	size?:        number;
	strokeWidth?: number;
}

interface SvgProps extends IconProps {
	children: ReactNode;
}

const Svg = ({ size = 16, strokeWidth = 2, children, ...props }: SvgProps) => (
	<svg
		width={size}
		height={size}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth={strokeWidth}
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
		{...props}
	>
		{children}
	</svg>
);

export const CheckIcon = (props: IconProps) => <Svg {...props}><path d='M20 6 9 17l-5-5' /></Svg>;

export const CloseIcon = (props: IconProps) => <Svg {...props}><path d='M18 6 6 18' /><path d='m6 6 12 12' /></Svg>;

export const PlusIcon = (props: IconProps) => <Svg {...props}><path d='M12 5v14M5 12h14' /></Svg>;

export const UndoIcon = (props: IconProps) => <Svg {...props}><path d='M3 7v6h6' /><path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' /></Svg>;

export const RedoIcon = (props: IconProps) => <Svg {...props}><path d='M21 7v6h-6' /><path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7' /></Svg>;

export const BoldIcon = (props: IconProps) => <Svg {...props}><path d='M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z' /></Svg>;

export const ItalicIcon = (props: IconProps) => <Svg {...props}><path d='M19 4h-9' /><path d='M14 20H5' /><path d='M15 4 9 20' /></Svg>;

export const UnderlineIcon = (props: IconProps) => <Svg {...props}><path d='M6 4v6a6 6 0 0 0 12 0V4' /><path d='M4 20h16' /></Svg>;

export const StrikeIcon = (props: IconProps) => <Svg {...props}><path d='M16 4H9a3 3 0 0 0-2.83 4' /><path d='M14 12a4 4 0 0 1 0 8H6' /><path d='M4 12h16' /></Svg>;

export const ListIcon = (props: IconProps) => <Svg {...props}><path d='M8 6h13' /><path d='M8 12h13' /><path d='M8 18h13' /><path d='M3 6h.01' /><path d='M3 12h.01' /><path d='M3 18h.01' /></Svg>;

export const OrderedListIcon = (props: IconProps) => <Svg {...props}><path d='M10 6h11' /><path d='M10 12h11' /><path d='M10 18h11' /><path d='M4 6h1v4' /><path d='M4 10h2' /><path d='M6 18H4c0-1 2-2 2-3s-1-1.5-2-1' /></Svg>;

export const AlignLeftIcon = (props: IconProps) => <Svg {...props}><path d='M21 6H3' /><path d='M15 12H3' /><path d='M17 18H3' /></Svg>;

export const AlignCenterIcon = (props: IconProps) => <Svg {...props}><path d='M21 6H3' /><path d='M17 12H7' /><path d='M19 18H5' /></Svg>;

export const AlignRightIcon = (props: IconProps) => <Svg {...props}><path d='M21 6H3' /><path d='M21 12H9' /><path d='M21 18H7' /></Svg>;

export const QuoteIcon = (props: IconProps) => <Svg {...props}><path d='M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h4' /><path d='M15 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h4' /></Svg>;

export const DownloadIcon = (props: IconProps) => <Svg {...props}><path d='M12 3v12' /><path d='m7 10 5 5 5-5' /><path d='M5 21h14' /></Svg>;

export const MinusIcon = (props: IconProps) => <Svg {...props}><path d='M5 12h14' /></Svg>;

export const SearchIcon = (props: IconProps) => <Svg {...props}><circle cx='11' cy='11' r='8' /><path d='m21 21-4.35-4.35' /></Svg>;

export const ChevronDownIcon = (props: IconProps) => <Svg {...props}><path d='m6 9 6 6 6-6' /></Svg>;

export const ChevronLeftIcon = (props: IconProps) => <Svg {...props}><path d='m15 18-6-6 6-6' /></Svg>;

export const ChevronRightIcon = (props: IconProps) => <Svg {...props}><path d='m9 18 6-6-6-6' /></Svg>;
