import { AnchorHTMLAttributes } from 'react';
import NextLink from 'next/link';

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
	href: string;
}

const BASE = 'rounded-sm font-medium text-text underline decoration-text-subtle underline-offset-4 transition-colors duration-150 hover:decoration-text active:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2';

export const Link = ({ className = '', children, href, ...props }: LinkProps) => {
	return (
		<NextLink href={href} className={`${BASE} ${className}`} {...props}>
			{children}
		</NextLink>
	);
};

export default Link;
