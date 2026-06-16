import { HTMLAttributes } from 'react';

export type AlertVariant = 'default' | 'success' | 'warning' | 'danger';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
	variant?: AlertVariant;
	title?: string;
}

const STYLES: Record<AlertVariant, { wrapper: string; icon: string; iconPath: string }> = {
	default: {
		wrapper:  'bg-surface-hover border-surface-border text-text',
		icon:     'text-text-muted',
		iconPath: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
	},
	success: {
		wrapper:  'bg-success-bg border-success-border text-success',
		icon:     'text-success',
		iconPath: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
	},
	warning: {
		wrapper:  'bg-warning-bg border-warning-border text-warning',
		icon:     'text-warning',
		iconPath: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
	},
	danger: {
		wrapper:  'bg-danger/10 border-danger/20 text-danger',
		icon:     'text-danger',
		iconPath: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
	},
};

export const Alert = (
    { variant = 'default', title, children, className = '', ...props }: AlertProps
) => {
	const s = STYLES[variant];

	return (
		<div
			role='alert'
			{...props}
			className={[
				'flex gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] p-4',
				s.wrapper,
				className,
			].join(' ')}
		>
			<svg
				width='16'
				height='16'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
				aria-hidden='true'
				className={['mt-0.5 shrink-0', s.icon].join(' ')}
			>
				<path d={s.iconPath} />
			</svg>
			<div className='flex flex-col gap-0.5 min-w-0'>
				{title && <p className='text-sm font-semibold leading-snug'>{title}</p>}
				{children && <p className='text-sm leading-relaxed opacity-90'>{children}</p>}
			</div>
		</div>
	);
};

export default Alert;
