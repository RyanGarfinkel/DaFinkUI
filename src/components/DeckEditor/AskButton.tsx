'use client';

import { Glyph } from './icons';

export interface AskButtonProps {
	onAsk: () => void;
}

// Shown on its own only while the settings panel is open and the format bar, which normally carries
// this lasso button, is hidden. The mousedown default is prevented so pressing it doesn't blur the
// text box first, which would drop the highlighted text being asked about.
export const AskButton = ({ onAsk }: AskButtonProps) => (
	<button
		type='button'
		aria-label='Ask AI'
		title='Ask AI about this'
		onMouseDown={e => e.preventDefault()}
		onPointerDown={e => e.stopPropagation()}
		onClick={onAsk}
		className={[
			'inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border',
			'bg-surface-panel text-text shadow-[var(--shadow-lg)] backdrop-blur-[var(--backdrop-blur)]',
			'hover:bg-surface-hover motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
			'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
		].join(' ')}
	>
		<Glyph name='lasso' />
	</button>
);
