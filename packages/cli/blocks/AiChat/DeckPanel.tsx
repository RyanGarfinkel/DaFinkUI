'use client';

import { DeckEditor } from '../../components/DeckEditor/DeckEditor';
import { CloseIcon, CollapseIcon, ExpandIcon } from './icons';
import type { Deck } from '../../components/DeckEditor/deck';
import Button from '../../components/Button/Button';
import { KeyboardEvent, useState } from 'react';

export interface DeckActivity {
	/** The reply whose changes are landing. */
	messageId:  number;
	label:      string;
	slideId?:   string;
	elementId?: string;
}

export interface DeckPanelProps {
	deck:      Deck;
	/** What the AI is changing right now, or null when it's idle. */
	activity:  DeckActivity | null;
	/** A note for after an edit finishes, e.g. that some changes were skipped. */
	note:      string;
	onChange:  (next: Deck, coalesceKey?: string) => void;
	onUndo:    () => void;
	onRedo:    () => void;
	canUndo:   boolean;
	canRedo:   boolean;
	expanded:       boolean;
	onToggleExpand: () => void;
	onClose:   () => void;
}

// Shares the thread panel's column (only one is open at a time) and, like it, is a
// persistent column rather than an overlay: no focus trap, Escape is a nicety.
// You and the AI edit the same deck: the view follows the AI's changes until you
// pick a slide or start working yourself, then stays put for the rest of that reply.
export const DeckPanel = ({ deck, activity, note, onChange, onUndo, onRedo, canUndo, canRedo, expanded, onToggleExpand, onClose }: DeckPanelProps) => {
	const [viewSlideId, setViewSlideId] = useState<string | undefined>(undefined);
	const [stoppedFollowing, setStoppedFollowing] = useState<number | null>(null);
	const following = activity !== null && stoppedFollowing !== activity.messageId;
	const shownSlideId = following ? activity.slideId ?? viewSlideId : viewSlideId;

	const takeOver = () => {
		if(!following) return;
		setStoppedFollowing(activity.messageId);
		setViewSlideId(shownSlideId);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if(e.key !== 'Escape' || e.defaultPrevented) return;
		// Escape inside the editor (leaving a text box, cancelling a tool) is the editor's.
		if(e.target !== e.currentTarget && (e.target as HTMLElement).closest('[role="region"]')) return;
		e.preventDefault();
		onClose();
	};

	return (
		<div onKeyDown={handleKeyDown} className='flex min-w-0 flex-1 flex-col border-l-[length:var(--border-width)] border-surface-border'>
			<div className='flex items-center justify-between gap-2 border-b-[length:var(--border-width)] border-surface-border px-4 py-3'>
				<div className='min-w-0'>
					<p className='text-[11px] font-medium uppercase tracking-wide text-text-subtle'>Slides</p>
					<h3 className='truncate text-base font-semibold text-text'>{deck.title}</h3>
				</div>
				<div className='flex shrink-0 items-center gap-1'>
					<Button variant='ghost' size='icon-sm' aria-label={expanded ? 'Show chat' : 'Expand slides'} data-expand-toggle onClick={onToggleExpand}>
						{expanded ? <CollapseIcon /> : <ExpandIcon />}
					</Button>
					<Button variant='ghost' size='icon-sm' aria-label='Close slides' onClick={onClose}>
						<CloseIcon />
					</Button>
				</div>
			</div>

			<div className='min-h-0 flex-1 p-2' onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}>
				<DeckEditor
					deck={deck}
					onChange={onChange}
					onUndo={onUndo}
					onRedo={onRedo}
					canUndo={canUndo}
					canRedo={canRedo}
					highlightIds={activity?.elementId ? [activity.elementId] : []}
					activeSlideId={shownSlideId}
					onActiveSlideChange={setViewSlideId}
					status={activity ? `${activity.label}…` : note}
				/>
			</div>
		</div>
	);
};

export default DeckPanel;
