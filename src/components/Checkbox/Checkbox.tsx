'use client';

import { InputHTMLAttributes, KeyboardEvent, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((
	{ label, className = '', id, onKeyDown, ...props },
	ref
) =>
{
	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		onKeyDown?.(e);
		// Native checkboxes only toggle on Space, never Enter, in every browser — correct on
		// the open web, but a jarring inconsistency next to every other control (a button, a
		// sort header) that responds to both. Make Enter toggle too, matching Space.
		if(!e.defaultPrevented && e.key === 'Enter')
		{
			e.preventDefault();
			e.currentTarget.click();
		}
	};

	return (
		<label
			htmlFor={id}
			className={['flex items-center gap-2.5 cursor-pointer select-none', className].join(' ')}
		>
			<input
				ref={ref}
				type='checkbox'
				id={id}
				onKeyDown={handleKeyDown}
				{...props}
				className={[
					'w-4 h-4 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-input-border bg-surface text-brand',
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
