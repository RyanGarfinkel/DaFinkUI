'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>
{
	label?:   string;
	error?:   string;
	hint?:    string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, hint, className = '', id, ...props }, ref) =>
	{
		const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

		const inputClasses = [
			'w-full rounded-md border bg-surface text-text px-3 py-2 text-sm',
			'placeholder:text-text-subtle',
			'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] outline-none',
			'hover:border-input-border-hover',
			'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-0',
			error
				? 'border-input-error focus-visible:outline-input-error-ring'
				: 'border-input-border focus-visible:outline-input-ring',
			'disabled:cursor-not-allowed disabled:bg-input-disabled-bg disabled:text-input-disabled-text disabled:border-input-border',
			className,
		].join(' ');

		return (
			<div className='flex flex-col gap-1.5'>
				{label && (
					<label htmlFor={inputId} className='text-sm font-medium text-text'>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={inputClasses}
					aria-invalid={!!error}
					aria-describedby={
						error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
					}
					{...props}
				/>
				{error && (
					<p id={`${inputId}-error`} className='text-sm text-input-error'>
						{error}
					</p>
				)}
				{!error && hint && (
					<p id={`${inputId}-hint`} className='text-sm text-text-muted'>
						{hint}
					</p>
				)}
			</div>
		);
	}
);

Input.displayName = 'Input';

export default Input;
