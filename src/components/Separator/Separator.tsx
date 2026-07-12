import { HTMLAttributes, ReactNode } from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';
export type SeparatorLabelPosition = 'start' | 'center' | 'end';
export type SeparatorVariant = 'solid' | 'dashed' | 'dotted';

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLElement>, 'children'>
{
	orientation?:   SeparatorOrientation;
	/** Position of the label along the line: start/center/end of the line's own axis (top-to-bottom when vertical). Only applies when children is set. */
	labelPosition?: SeparatorLabelPosition;
	/** Line style: 'solid' (default), 'dashed', or 'dotted'. */
	variant?:       SeparatorVariant;
	/** Optional text that breaks up the line (e.g. "OR"). Supported in both orientations: stays upright (not rotated) when orientation is 'vertical'. */
	children?:      ReactNode;
}

const VARIANT_STYLE_CLASSES: Record<SeparatorVariant, string> = {
	solid:  'border-solid',
	dashed: 'border-dashed',
	dotted: 'border-dotted',
};

const lineClasses = (variant: SeparatorVariant, isVertical: boolean) => {
	const axisClass = isVertical ? 'border-l-[length:var(--border-width)]' : 'border-t-[length:var(--border-width)]';
	return `${axisClass} ${VARIANT_STYLE_CLASSES[variant]} border-surface-border`;
};

const Separator = ({
	orientation = 'horizontal',
	labelPosition = 'center',
	variant = 'solid',
	className = '',
	children,
	...props
}: SeparatorProps) => {
	const isVertical = orientation === 'vertical';
	const lineBase   = lineClasses(variant, isVertical);

	if(!children)
	{
		return isVertical
			? <div role='separator' aria-orientation='vertical' className={`shrink-0 self-stretch ${lineBase} ${className}`} {...props} />
			: <hr className={`w-full ${lineBase} ${className}`} {...props} />;
	}

	const showLeading  = labelPosition === 'center' || labelPosition === 'end';
	const showTrailing = labelPosition === 'center' || labelPosition === 'start';
	const lineClass     = isVertical ? `w-0 flex-1 ${lineBase}` : `h-0 flex-1 ${lineBase}`;
	const rootClass     = isVertical ? 'flex flex-col items-center gap-3 self-stretch shrink-0' : 'flex items-center gap-3';

	return (
		<div
			role='separator'
			aria-orientation={orientation}
			className={`${rootClass} ${className}`}
			{...props}
		>
			{showLeading && <span aria-hidden='true' className={lineClass} />}
			<span className='shrink-0 text-xs font-medium text-text-subtle uppercase tracking-wide'>
				{children}
			</span>
			{showTrailing && <span aria-hidden='true' className={lineClass} />}
		</div>
	);
};

export default Separator;
