'use client';

import { DeckEditor } from '@/src/components/DeckEditor/DeckEditor';
import { createSlide } from '@/src/components/DeckEditor/deck';
import type { Deck } from '@/src/components/DeckEditor/deck';
import { useState } from 'react';

const START: Deck = {
	title:  'Launch plan',
	theme:  'ocean',
	slides: [
		{
			...createSlide([
				{ id: 'title', label: 'Title', type: 'text', html: '<p>Launch plan</p>', bold: true, fontSize: 72, color: '', x: 96, y: 248, width: 1088, height: 120 },
				{ id: 'subtitle', label: 'Subtitle', type: 'text', html: '<p>Spring release, week by week</p>', fontSize: 32, color: 'var(--color-text-muted)', x: 96, y: 384, width: 1088, height: 56 },
			]),
			id: 'cover',
		},
		{ ...createSlide(), id: 'next' },
	],
};

interface History {
	past:     Deck[];
	present:  Deck;
	future:   Deck[];
	lastKey?: string;
}

export const DeckEditorDemo = () => {
	const [history, setHistory] = useState<History>({ past: [], present: START, future: [] });

	// A run of edits sharing a key (a drag, a typing burst) is one undo step.
	const change = (deck: Deck, key?: string) => setHistory(h => ({
		past:    key && key === h.lastKey ? h.past : [...h.past, h.present],
		present: deck,
		future:  [],
		lastKey: key,
	}));

	const undo = () => setHistory(h => (h.past.length ? { past: h.past.slice(0, -1), present: h.past.at(-1)!, future: [h.present, ...h.future] } : h));
	const redo = () => setHistory(h => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h));

	return (
		<div className='h-[560px] w-full'>
			<DeckEditor
				deck={history.present}
				onChange={change}
				onUndo={undo}
				onRedo={redo}
				canUndo={history.past.length > 0}
				canRedo={history.future.length > 0}
			/>
		</div>
	);
};
