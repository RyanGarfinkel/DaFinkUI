'use client';

import { InputHTMLAttributes, useLayoutEffect, useRef } from 'react';
import type { FormulaSegment } from './refs';

export interface FormulaInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
	value:    string;
	segments: FormulaSegment[];
}

/** A text input that paints each cell reference in its own color. The colored text is a mirror behind a transparent-text input, so editing stays native. */
export const FormulaInput = ({ value, segments, className = '', onScroll, ...props }: FormulaInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const mirrorRef = useRef<HTMLSpanElement>(null);
	const colored = segments.some(segment => segment.color);

	const syncScroll = () => {
		if(mirrorRef.current && inputRef.current) mirrorRef.current.style.transform = `translateX(${-inputRef.current.scrollLeft}px)`;
	};

	useLayoutEffect(syncScroll);

	return (
		<div className={`relative h-7 min-w-0 flex-1 rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-input-border bg-surface focus-within:ring-2 focus-within:ring-brand-ring ${className}`}>
			{colored && (
				<span aria-hidden='true' className='pointer-events-none absolute inset-0 flex items-center overflow-hidden px-2 text-sm'>
					<span ref={mirrorRef} className='whitespace-pre text-text'>
						{segments.map((segment, i) => (
							<span key={i} style={segment.color ? { color: segment.color, fontWeight: 600 } : undefined}>{segment.text}</span>
						))}
					</span>
				</span>
			)}
			<input
				{...props}
				ref={inputRef}
				value={value}
				spellCheck={false}
				autoComplete='off'
				className={`absolute inset-0 h-full w-full bg-transparent px-2 text-sm focus:outline-none ${colored ? 'text-transparent caret-[var(--color-text)]' : 'text-text'}`}
				onScroll={e =>
				{
					syncScroll();
					onScroll?.(e);
				}}
			/>
		</div>
	);
};
