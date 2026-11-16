'use client';

import { DeckEditor, TOOLBAR_BUTTON } from '../../components/DeckEditor/DeckEditor';
import { exportJson } from '../../components/DeckEditor/exporters';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import type { DeckDocument } from './useDeckDocument';
import Button from '../../components/Button/Button';
import { useDeckDocument } from './useDeckDocument';
import { SaveIndicator } from './SaveIndicator';
import { DeckMenu } from './DeckMenu';
import { useState } from 'react';

const FRAME = 'flex h-[760px] max-h-[100dvh] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel';

/** The editor for one loaded deck: undo history, autosave, and the deck menu around DeckEditor (which has its own Download menu). */
const LoadedDeck = ({ doc }: { doc: DeckDocument }) => {
	const { history, dispatch } = doc;
	const deck = history.present;
	const [status, setStatus] = useState('');

	const runExportJson = () => {
		exportJson(deck);
		setStatus('Deck file downloaded.');
		setTimeout(() => setStatus(''), 4000);
	};

	return (
		<DeckEditor
			deck={deck}
			onChange={(next, coalesceKey) => dispatch({ type: 'change', deck: next, coalesceKey })}
			onUndo={() => dispatch({ type: 'undo' })}
			onRedo={() => dispatch({ type: 'redo' })}
			canUndo={history.past.length > 0}
			canRedo={history.future.length > 0}
			status={status}
			toolbarEnd={(
				<>
					<SaveIndicator state={doc.saveState} onRetry={doc.retrySave} />
					<DeckMenu
						doc={doc}
						title={deck.title}
						onRename={title => dispatch({ type: 'change', deck: { ...deck, title } })}
						onExportJson={runExportJson}
						onStatus={setStatus}
						buttonClass={TOOLBAR_BUTTON}
					/>
				</>
			)}
			className='h-[760px] max-h-[100dvh]'
		/>
	);
};

export const SlideEditor = () => {
	const doc = useDeckDocument();

	// Keyed by deck id, so opening another deck starts fresh (slide, selection, zoom).
	if(doc.load.kind === 'ready' && doc.deckId) return <LoadedDeck key={doc.deckId} doc={doc} />;

	return (
		<div className={FRAME}>
			{doc.load.kind === 'loading' ? (
				<div role='status' aria-label='Loading deck' className='flex flex-1 flex-col gap-4 bg-surface-active p-6'>
					<Skeleton className='mx-auto aspect-video w-full max-w-3xl' />
					<div className='flex gap-3'>
						{[0, 1, 2].map(i => <Skeleton key={i} className='aspect-video w-36' />)}
					</div>
				</div>
			) : (
				<div role='alert' className='flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center'>
					<p className='text-sm text-text'>Couldn&apos;t load the deck.</p>
					<p className='max-w-md text-sm text-text-muted'>{doc.load.kind === 'error' ? doc.load.message : ''}</p>
					<Button variant='outlined' size='sm' onClick={doc.retry}>Try again</Button>
				</div>
			)}
		</div>
	);
};

export default SlideEditor;
