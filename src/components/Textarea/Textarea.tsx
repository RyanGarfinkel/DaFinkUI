'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>
{
	label?:    string;
	error?:    string;
	hint?:     string;
	className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ label, error, hint, className = '', id, ...props }, ref) =>
	{
		const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

		const textareaClasses = [
			'w-full rounded-md border bg-surface text-text px-3 py-2 text-sm',
			'min-h-[80px] resize-y',
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
					<label htmlFor={textareaId} className='text-sm font-medium text-text'>
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={textareaId}
					className={textareaClasses}
					aria-invalid={!!error}
					aria-describedby={
						error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
					}
					{...props}
				/>
				{error && (
					<p id={`${textareaId}-error`} className='text-sm text-input-error'>
						{error}
					</p>
				)}
				{!error && hint && (
					<p id={`${textareaId}-hint`} className='text-sm text-text-muted'>
						{hint}
					</p>
				)}
			</div>
		);
	}
);

Textarea.displayName = 'Textarea';

export default Textarea;
