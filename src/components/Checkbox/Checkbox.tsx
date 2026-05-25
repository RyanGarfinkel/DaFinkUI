'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((
	{ label, className = '', id, ...props },
	ref
) =>
{
	return (
		<label
			htmlFor={id}
			className={['flex items-center gap-2.5 cursor-pointer select-none', className].join(' ')}
		>
			<input
				ref={ref}
				type='checkbox'
				id={id}
				{...props}
				className={[
					'w-4 h-4 rounded border border-input-border bg-surface text-brand',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
					'disabled:opacity-50 disabled:cursor-not-allowed',
					'accent-[var(--color-brand)]',
				].join(' ')}
			/>
			{label && (
				<span className='text-sm text-text leading-none peer-disabled:opacity-50'>
					{label}
				</span>
			)}
		</label>
	);
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
