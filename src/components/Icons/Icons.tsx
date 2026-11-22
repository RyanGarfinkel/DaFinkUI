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

export const SearchIcon = (props: IconProps) => <Svg {...props}><circle cx='11' cy='11' r='8' /><path d='m21 21-4.35-4.35' /></Svg>;

export const ChevronDownIcon = (props: IconProps) => <Svg {...props}><path d='m6 9 6 6 6-6' /></Svg>;

export const ChevronLeftIcon = (props: IconProps) => <Svg {...props}><path d='m15 18-6-6 6-6' /></Svg>;

export const ChevronRightIcon = (props: IconProps) => <Svg {...props}><path d='m9 18 6-6-6-6' /></Svg>;
