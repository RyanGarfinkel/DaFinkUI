'use client';

import { Glyph } from '../../components/DeckEditor/icons';
import type { SaveState } from './useDeckDocument';

const LABELS: Record<SaveState, string> = {
	saved:   'Saved',
	unsaved: 'Saving…',
	saving:  'Saving…',
	error:   'Couldn\'t save. Retry',
};

export const SaveIndicator = ({ state, onRetry }: { state: SaveState; onRetry: () => void }) => {
	const failed = state === 'error';

	return (
		<span role='status' aria-live='polite' className='flex items-center'>
			{failed ? (
				<button
					type='button'
					onClick={onRetry}
					className='inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 text-xs font-medium text-danger hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-ring'
				>
					<Glyph name='cloudOff' size={14} />
					{LABELS.error}
				</button>
			) : (
				<span className='inline-flex h-8 items-center gap-1.5 px-2 text-xs text-text-muted' title={LABELS[state]}>
					<Glyph name='cloudCheck' size={14} className={state === 'saved' ? '' : 'motion-safe:animate-pulse'} />
					<span className='sr-only sm:not-sr-only'>{LABELS[state]}</span>
				</span>
			)}
		</span>
	);
};
