import { ReactNode, ElementType } from 'react';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'muted' | 'small' | 'code' | 'blockquote';

export interface TypographyProps
{
	variant: TypographyVariant;
	as?: ElementType;
	className?: string;
	children: ReactNode;
}

const defaultElements: Record<TypographyVariant, ElementType> = {
	h1:         'h1',
	h2:         'h2',
	h3:         'h3',
	h4:         'h4',
	p:          'p',
	lead:       'p',
	muted:      'p',
	small:      'p',
	code:       'code',
	blockquote: 'blockquote',
};

const variantClasses: Record<TypographyVariant, string> = {
	h1:         'text-4xl font-bold tracking-tight text-text',
	h2:         'text-3xl font-semibold tracking-tight text-text',
	h3:         'text-2xl font-semibold tracking-tight text-text',
	h4:         'text-xl font-semibold text-text',
	p:          'text-base text-text leading-7',
	lead:       'text-xl text-text-muted leading-7',
	muted:      'text-sm text-text-muted',
	small:      'text-xs text-text-muted',
	code:       'text-sm font-mono bg-surface-active px-1.5 py-0.5 rounded text-text',
	blockquote: 'border-l-2 border-surface-border pl-4 italic text-text-muted',
};

const Typography = (
    {
        variant,
        as,
        className = '',
        children,
    }: TypographyProps
) => {
	const Tag = as ?? defaultElements[variant];

	return (
		<Tag className={`${variantClasses[variant]} ${className}`.trim()}>
			{children}
		</Tag>
	);
};

export default Typography;
