'use client';

import { FUNCTION_DOCS } from './functions';

export interface FunctionHintsProps {
	id:      string;
	matches: string[];
	active:  number;
	onPick:  (name: string) => void;
}

export const FunctionHints = ({ id, matches, active, onPick }: FunctionHintsProps) => (
	<ul
		id={id}
		role='listbox'
		aria-label='Function suggestions'
		className='absolute left-8 top-full z-50 mt-1 w-72 max-w-[calc(100%-3rem)] overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel py-1 shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]'
	>
		{matches.map((name, i) => (
			<li
				key={name}
				id={`${id}-${name}`}
				role='option'
				aria-selected={i === active}
				className={`cursor-pointer px-3 py-1.5 ${i === active ? 'bg-surface-active' : 'hover:bg-surface-hover'}`}
				onPointerDown={e =>
				{
					e.preventDefault();
					onPick(name);
				}}
			>
				<div className='truncate font-mono text-sm text-text'>{FUNCTION_DOCS[name].signature}</div>
				<div className='truncate text-xs text-text-muted'>{FUNCTION_DOCS[name].description}</div>
			</li>
		))}
	</ul>
);
