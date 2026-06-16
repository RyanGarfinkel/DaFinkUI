'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';

export type InputVariant = 'default' | 'floating';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>
{
	label?:   string;
	error?:   string;
	hint?:    string;
	variant?: InputVariant;
}

const SHARED_INPUT = [
	'w-full rounded-[var(--radius)] border-[length:var(--border-width)] bg-surface text-text text-sm',
	'placeholder:text-text-subtle',
	'motion-safe:transition-shadow motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] outline-none',
	'hover:border-input-border-hover',
	'focus:outline-none',
	'shadow-[var(--inner-shadow)] focus-visible:shadow-[var(--input-focus-shadow)]',
	'disabled:cursor-not-allowed disabled:bg-input-disabled-bg disabled:text-input-disabled-text disabled:border-input-border',
];

const EyeIcon = () => (
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
	>
		<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
		<circle cx='12' cy='12' r='3' />
	</svg>
);

const EyeOffIcon = () => (
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
	>
		<path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
		<line x1='1' y1='1' x2='23' y2='23' />
	</svg>
);

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label, error, hint, variant = 'default', className = '',
			id, type, onFocus, onBlur, onChange, value, defaultValue, disabled, ...props
		},
		ref
	) =>
	{
		const [isFocused, setIsFocused] = useState(false);
		const [showPassword, setShowPassword] = useState(false);
		const [localValue, setLocalValue] = useState<string>(() =>
		{
			if(typeof defaultValue === 'string') return defaultValue;
			if(typeof defaultValue === 'number') return String(defaultValue);
			return '';
		});

		const isPassword = type === 'password';
		const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

		const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
		const isControlled = value !== undefined;
		const hasValue = isControlled ? (value !== '' && value != null) : localValue !== '';
		const labelFloated = isFocused || hasValue || !!error;

		const borderClass = error
			? 'border-input-error focus:border-input-error-ring'
			: 'border-input-border focus:border-input-ring';

		const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
		{
			setIsFocused(true);
			onFocus?.(e);
		};

		const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
		{
			setIsFocused(false);
			onBlur?.(e);
		};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		{
			if(!isControlled) setLocalValue(e.target.value);
			onChange?.(e);
		};

		const feedbackId = error
			? `${inputId}-error`
			: hint ? `${inputId}-hint` : undefined;

		const feedbackText = error ?? hint;

		const feedbackBlock = (
			<div
				className={[
					'grid motion-safe:transition-all motion-safe:duration-[var(--duration-fast)]',
					feedbackText ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
				].join(' ')}
			>
				<div className='overflow-hidden'>
					<p
						id={feedbackId}
						className={`pt-1 text-sm ${error ? 'text-input-error' : 'text-text-muted'}`}
					>
						{feedbackText ?? ''}
					</p>
				</div>
			</div>
		);

		const eyeButton = isPassword && (
			<button
				type='button'
				onClick={() => setShowPassword(s => !s)}
				aria-label={showPassword ? 'Hide password' : 'Show password'}
				disabled={disabled}
				className={[
					'absolute right-3 top-1/2 -translate-y-1/2',
					'text-text-muted hover:text-text',
					'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-input-ring',
					'rounded-[var(--radius-sm)] disabled:pointer-events-none',
				].join(' ')}
			>
				{showPassword ? <EyeOffIcon /> : <EyeIcon />}
			</button>
		);

		const sharedInputProps = {
			ref,
			id:                inputId,
			type:              effectiveType,
			value,
			defaultValue:      isControlled ? undefined : defaultValue,
			disabled,
			'aria-invalid':    !!error,
			'aria-describedby': feedbackId,
			onFocus:           handleFocus,
			onBlur:            handleBlur,
			onChange:          handleChange,
			...props,
		};

		if(variant === 'floating')
		{
			return (
				<div className='flex flex-col'>
					<div className='relative'>
						<input
							{...sharedInputProps}
							className={[
								...SHARED_INPUT,
								borderClass,
								'px-3 pt-5 pb-2',
								isPassword ? 'pr-10' : '',
								className,
							].join(' ')}
						/>
						{label && (
							<label
								htmlFor={inputId}
								className={[
									'absolute left-3 pointer-events-none font-medium',
									'motion-safe:transition-all motion-safe:duration-[var(--duration-fast)]',
									labelFloated
										? `top-1.5 text-xs ${error ? 'text-input-error' : 'text-text-muted'}`
										: 'top-1/2 -translate-y-1/2 text-sm text-text-subtle',
								].join(' ')}
							>
								{label}
							</label>
						)}
						{eyeButton}
					</div>
					{feedbackBlock}
				</div>
			);
		}

		return (
			<div className='flex flex-col gap-1.5'>
				{label && (
					<label htmlFor={inputId} className='text-sm font-medium text-text'>
						{label}
					</label>
				)}
				<div className={isPassword ? 'relative' : undefined}>
					<input
						{...sharedInputProps}
						className={[
							...SHARED_INPUT,
							borderClass,
							'px-3 py-2',
							isPassword ? 'pr-10' : '',
							className,
						].join(' ')}
					/>
					{eyeButton}
				</div>
				{feedbackBlock}
			</div>
		);
	}
);

Input.displayName = 'Input';

export default Input;
