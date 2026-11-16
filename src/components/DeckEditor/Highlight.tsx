import type { ReactNode } from 'react';

interface HighlightProps {
	/** Text on the tag, e.g. "AI". */
	label:    string;
	children: ReactNode;
}

/** A pulsing outline and a name tag around an element someone else is editing. Sized in slide px via `--slide-scale`. */
export const Highlight = ({ label, children }: HighlightProps) => (
	<div data-highlighted className='relative h-full w-full'>
		{children}
		<span
			aria-hidden='true'
			className='pointer-events-none absolute -inset-[calc(6px/var(--slide-scale))] rounded-[var(--radius)] border-brand motion-safe:animate-pulse'
			style={{ borderWidth: 'calc(2px / var(--slide-scale))' }}
		/>
		<span
			aria-hidden='true'
			className='pointer-events-none absolute left-0 rounded-[var(--radius-sm)] bg-brand font-semibold text-brand-fg'
			style={{
				top:      'calc(-26px / var(--slide-scale))',
				fontSize: 'calc(11px / var(--slide-scale))',
				padding:  'calc(2px / var(--slide-scale)) calc(6px / var(--slide-scale))',
			}}
		>
			{label}
		</span>
	</div>
);
