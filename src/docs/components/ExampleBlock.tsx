'use client';

import { CodeBlock } from '@/src/docs/components/CodeBlock';
import { useState } from 'react';

export interface ExampleBlockProps {
	/** Source code shown in the Code tab. */
	code:        string;
	/** The live preview rendered in the Preview tab. */
	children:    React.ReactNode;
	/** Accessible label for the tab strip. Falls back to "example". */
	label?:      string;
	/** Minimum height of the preview pane. Defaults to "200px". */
	minHeight?:  string;
	/** Alignment of preview content. Defaults to "center". */
	align?:      'center' | 'start';
}

export const ExampleBlock = (
    {
        code,
        children,
        label     = 'example',
        minHeight = '200px',
        align     = 'center',
    }: ExampleBlockProps
) => {
	const [tab, setTab] = useState<'preview' | 'code'>('preview');

	return (
		<div className='flex flex-col gap-0'>
			{/* Tab strip */}
			<div
				role='tablist'
				aria-label={label}
				className='flex items-center gap-1 mb-3'
			>
				{(['preview', 'code'] as const).map((t) => (
					<button
						key={t}
						type='button'
						role='tab'
						aria-selected={tab === t}
						aria-controls={`${label}-${t}`}
						onClick={() => setTab(t)}
						className={[
							'px-3 py-1.5 rounded-md text-xs font-medium capitalize',
							'transition-colors duration-[var(--duration-fast)]',
							'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
							tab === t
								? 'bg-surface-active text-text'
								: 'text-text-muted hover:bg-surface-hover hover:text-text',
						].join(' ')}
					>
						{t}
					</button>
				))}
			</div>

			{/* Panels */}
			{tab === 'preview' ? (
				<div
					id={`${label}-preview`}
					role='tabpanel'
					style={{ minHeight }}
					className={[
						'rounded-lg border border-surface-border bg-surface-hover/30 p-8 w-full',
						'flex flex-wrap',
						align === 'center' ? 'items-center justify-center' : 'items-start justify-start',
					].join(' ')}
				>
					{children}
				</div>
			) : (
				<div id={`${label}-code`} role='tabpanel'>
					<CodeBlock code={code} />
				</div>
			)}
		</div>
	);
};
