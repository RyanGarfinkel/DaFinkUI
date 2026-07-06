'use client';

import { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

export type OTPCharset = 'numeric' | 'alphanumeric' | 'alphabetic' | 'any';

export interface OTPInputProps
{
	length?:    number;
	value?:     string;
	onChange?:  (value: string) => void;
	charset?:   OTPCharset;
	label?:     string;
	error?:     string;
	hint?:      string;
	disabled?:  boolean;
	className?: string;
}

const CHARSET_CONFIG: Record<OTPCharset, { filter: (s: string) => string; inputMode: React.HTMLAttributes<HTMLInputElement>['inputMode']; pattern: string }> = {
	numeric:     { filter: s => s.replace(/\D/g, ''),            inputMode: 'numeric', pattern: '[0-9]*'       },
	alphanumeric:{ filter: s => s.replace(/[^a-zA-Z0-9]/g, ''), inputMode: 'text',    pattern: '[a-zA-Z0-9]*' },
	alphabetic:  { filter: s => s.replace(/[^a-zA-Z]/g, ''),    inputMode: 'text',    pattern: '[a-zA-Z]*'    },
	any:         { filter: s => s,                               inputMode: 'text',    pattern: '.*'           },
};

const OTPInput = ({
	length = 6,
	value = '',
	onChange,
	charset = 'any',
	label,
	error,
	hint,
	disabled,
	className = '',
}: OTPInputProps) =>
{
	const inputId = label?.toLowerCase().replace(/\s+/g, '-') ?? 'otp';
	const refs = useRef<(HTMLInputElement | null)[]>([]);

	const [slots, setSlots] = useState<string[]>(() =>
		Array.from({ length }, (_, i) => value[i] ?? '')
	);
	const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
	const lastEmitted = useRef(value);

	useEffect(() =>
	{
		if(value !== lastEmitted.current)
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSlots(Array.from({ length }, (_, i) => value[i] ?? ''));
	}, [value, length]);

	const { filter, inputMode, pattern } = CHARSET_CONFIG[charset];

	const emit = (newSlots: string[]) =>
	{
		const joined = newSlots.join('');
		lastEmitted.current = joined;
		onChange?.(joined);
	};

	const feedbackId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
	const feedbackText = error ?? hint;

	const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) =>
	{
		const char = filter(e.target.value).slice(-1);
		const newSlots = [...slots];
		newSlots[index] = char;
		setSlots(newSlots);
		emit(newSlots);

		if(char && index < length - 1)
			refs.current[index + 1]?.focus();
	};

	const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) =>
	{
		if(e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && slots[index])
		{
			const char = filter(e.key);
			if(char)
			{
				e.preventDefault();
				const newSlots = [...slots];
				newSlots[index] = char;
				setSlots(newSlots);
				emit(newSlots);
				if(index < length - 1) refs.current[index + 1]?.focus();
			}
			return;
		}

		if(e.key === 'Backspace')
		{
			if(slots[index])
			{
				const newSlots = [...slots];
				newSlots[index] = '';
				setSlots(newSlots);
				emit(newSlots);
			}
			else if(index > 0)
			{
				const newSlots = [...slots];
				newSlots[index - 1] = '';
				setSlots(newSlots);
				emit(newSlots);
				refs.current[index - 1]?.focus();
			}
		}
		else if(e.key === 'ArrowLeft' && index > 0)
		{
			e.preventDefault();
			refs.current[index - 1]?.focus();
		}
		else if(e.key === 'ArrowRight' && index < length - 1)
		{
			e.preventDefault();
			refs.current[index + 1]?.focus();
		}
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) =>
	{
		e.preventDefault();
		const pasted = filter(e.clipboardData.getData('text')).slice(0, length);
		if(!pasted) return;
		const newSlots = Array.from({ length }, (_, i) => pasted[i] ?? '');
		setSlots(newSlots);
		emit(newSlots);
		refs.current[Math.min(pasted.length, length - 1)]?.focus();
	};

	const handleFocus = (index: number) => (e: React.FocusEvent<HTMLInputElement>) =>
	{
		const el = e.currentTarget;
		requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
		setFocusedIndex(index);
	};

	const handleBlur = () => setFocusedIndex(null);

	const cellClass = [
		'w-10 h-12 text-center text-lg font-semibold rounded-[var(--radius)] border-[length:var(--border-width)] bg-surface text-text',
		'caret-transparent outline-none',
		'motion-safe:transition-shadow motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
		'hover:border-input-border-hover',
		error ? 'border-input-error' : 'border-input-border',
		'shadow-[var(--inner-shadow)] focus-visible:shadow-[var(--input-focus-shadow)]',
		'disabled:cursor-not-allowed disabled:bg-input-disabled-bg disabled:text-input-disabled-text disabled:border-input-border',
	].join(' ');

	return (
		<>
			<style>{`
				@keyframes dafink-cursor-blink {
					0%, 100% { opacity: 1; }
					50%       { opacity: 0; }
				}
				.dafink-otp-cursor {
					animation: dafink-cursor-blink 1s step-start infinite;
				}
				@media (prefers-reduced-motion: reduce) {
					.dafink-otp-cursor { animation: none; }
				}
			`}</style>
			<div className={`flex flex-col gap-1.5 ${className}`}>
				{label && (
					<label
						id={`${inputId}-label`}
						htmlFor={`${inputId}-0`}
						className='text-sm font-medium text-text'
					>
						{label}
					</label>
				)}
				<div
					role='group'
					aria-labelledby={label ? `${inputId}-label` : undefined}
					aria-describedby={feedbackId}
					className='flex gap-2'
				>
					{Array.from({ length }).map((_, index) => (
						<div key={index} className='relative'>
							<input
								ref={el => { refs.current[index] = el; }}
								id={index === 0 ? `${inputId}-0` : undefined}
								type='text'
								inputMode={inputMode}
								pattern={pattern}
								maxLength={1}
								value={slots[index]}
								onChange={handleChange(index)}
								onKeyDown={handleKeyDown(index)}
								onPaste={handlePaste}
								onFocus={handleFocus(index)}
								onBlur={handleBlur}
								disabled={disabled}
								autoComplete={index === 0 ? 'one-time-code' : 'off'}
								aria-label={`Character ${index + 1} of ${length}`}
								className={cellClass}
							/>
							{focusedIndex === index && (
								<span
									aria-hidden='true'
									className={[
										'dafink-otp-cursor absolute bottom-2.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full',
										error ? 'bg-input-error-ring' : 'bg-input-ring',
									].join(' ')}
								/>
							)}
						</div>
					))}
				</div>
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
			</div>
		</>
	);
};

OTPInput.displayName = 'OTPInput';

export default OTPInput;
