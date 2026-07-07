import { HTMLAttributes, ReactNode } from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';
export type SeparatorLabelPosition = 'start' | 'center' | 'end';

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLElement>, 'children'>
{
	orientation?:   SeparatorOrientation;
	/** Position of the label along the line: start/center/end of the line's own axis (top-to-bottom when vertical). Only applies when children is set. */
	labelPosition?: SeparatorLabelPosition;
	/** Optional text that breaks up the line (e.g. "OR"). Supported in both orientations — stays upright (not rotated) when orientation is 'vertical'. */
	children?:      ReactNode;
}

const LINE_HORIZONTAL = 'border-t-[length:var(--border-width)] border-surface-border';
const LINE_VERTICAL   = 'border-l-[length:var(--border-width)] border-surface-border';

const Separator = ({
	orientation = 'horizontal',
	labelPosition = 'center',
	className = '',
	children,
	...props
}: SeparatorProps) => {
	const isVertical = orientation === 'vertical';

	if(!children)
	{
		return isVertical
			? <div role='separator' aria-orientation='vertical' className={`shrink-0 self-stretch ${LINE_VERTICAL} ${className}`} {...props} />
			: <hr className={`w-full ${LINE_HORIZONTAL} ${className}`} {...props} />;
	}

	const showLeading  = labelPosition === 'center' || labelPosition === 'end';
	const showTrailing = labelPosition === 'center' || labelPosition === 'start';
	const lineClass     = isVertical ? `w-0 flex-1 ${LINE_VERTICAL}` : `h-0 flex-1 ${LINE_HORIZONTAL}`;
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
