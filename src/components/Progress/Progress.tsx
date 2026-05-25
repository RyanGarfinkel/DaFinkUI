import { HTMLAttributes } from 'react';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
	value: number;
	max?: number;
	showLabel?: boolean;
	size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = { sm: 'h-1', md: 'h-2', lg: 'h-3' } as const;

export const Progress = (
    {
        value,
        max       = 100,
        showLabel = false,
        size      = 'md',
        className = '',
        ...props
    }: ProgressProps
) => {
	const pct = Math.min(100, Math.max(0, (value / max) * 100));

	return (
		<div {...props} className={['flex flex-col gap-1.5 w-full', className].join(' ')}>
			{showLabel && (
				<div className='flex justify-between text-xs text-text-muted'>
					<span>Progress</span>
					<span>{Math.round(pct)}%</span>
				</div>
			)}
			<div
				role='progressbar'
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={max}
				className={['w-full rounded-full bg-surface-active overflow-hidden', SIZE_CLASSES[size]].join(' ')}
			>
				<div
					className='h-full rounded-full bg-brand transition-all duration-[var(--duration-normal,300ms)] ease-out'
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
};

export default Progress;
