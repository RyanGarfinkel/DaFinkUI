import { HTMLAttributes } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
	size?: SpinnerSize;
	label?: string;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
	sm: 'w-4 h-4 border-2',
	md: 'w-6 h-6 border-2',
	lg: 'w-8 h-8 border-[3px]',
};

export const Spinner = (
    { size = 'md', label = 'Loading…', className = '', ...props }: SpinnerProps
) => {
	return (
		<span
			role='status'
			aria-label={label}
			{...props}
			className={['inline-flex items-center justify-center', className].join(' ')}
		>
			<span
				aria-hidden='true'
				className={[
					'rounded-full border-surface-active border-t-brand animate-spin',
					SIZE_CLASSES[size],
				].join(' ')}
			/>
			<span className='sr-only'>{label}</span>
		</span>
	);
};

export default Spinner;
