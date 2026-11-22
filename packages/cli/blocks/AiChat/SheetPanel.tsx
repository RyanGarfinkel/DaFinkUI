'use client';

import type { SheetAskContext } from '../../components/SheetEditor/askcontext';
import type { EditHistory, Sheet } from '../../components/SheetEditor/sheet';
import { SheetEditor } from '../../components/SheetEditor/SheetEditor';
import { CloseIcon, CollapseIcon, ExpandIcon } from './icons';
import Button from '../../components/Button/Button';
import { KeyboardEvent, useState } from 'react';

export interface SheetActivity {
	/** The reply whose changes are landing. */
	messageId: number;
	label:     string;
	/** Where the change lands, in A1 notation. */
	range?:    string;
}

export interface SheetPanelProps {
	sheet:          Sheet;
	/** What the AI is changing right now, or null when it's idle. */
	activity:       SheetActivity | null;
	/** A note for after an edit finishes, e.g. that some changes were skipped. */
	note:           string;
	onChange:       (next: Sheet, coalesceKey?: string) => void;
	history:        EditHistory;
	expanded:      boolean;
	onToggleExpand: () => void;
	onClose:        () => void;
	/** Rendered inside a Drawer (mobile): the Drawer owns Escape and the expand button is hidden. */
	inDrawer?:      boolean;
	/** Adds an Ask AI button to the editor; called with the cells the user selected. */
	onAsk?:         (context: SheetAskContext) => void;
}

// A persistent column, not an overlay: no focus trap. The AI's cells stay outlined until you click or type, which takes the view back for that reply.
export const SheetPanel = ({ sheet, activity, note, onChange, history, expanded, onToggleExpand, onClose, inDrawer = false, onAsk }: SheetPanelProps) => {
	const [stoppedFollowing, setStoppedFollowing] = useState<number | null>(null);
	const following = activity !== null && stoppedFollowing !== activity.messageId;

	const takeOver = () => {
		if(following) setStoppedFollowing(activity.messageId);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if(e.key !== 'Escape' || e.defaultPrevented) return;
		const insideEditor = e.target !== e.currentTarget && (e.target as HTMLElement).closest('[role="region"]');
		// Escape inside the editor (cancelling a cell edit) is the editor's; the Drawer must not close on it either.
		if(insideEditor)
		{
			if(inDrawer) e.stopPropagation();
			return;
		}
		if(inDrawer) return;
		e.preventDefault();
		onClose();
	};

	return (
		<div onKeyDown={handleKeyDown} className={`flex min-w-0 flex-1 flex-col ${inDrawer ? '' : 'border-l-[length:var(--border-width)] border-surface-border'}`}>
			<div className='flex items-center justify-between gap-2 border-b-[length:var(--border-width)] border-surface-border px-4 py-3'>
				<div className='min-w-0'>
					<p className='text-[11px] font-medium uppercase tracking-wide text-text-subtle'>Sheet</p>
					<h3 className='truncate text-base font-semibold text-text'>{sheet.title}</h3>
				</div>
				<div className='flex shrink-0 items-center gap-1'>
					{!inDrawer && (
						<Button variant='ghost' size='icon-sm' aria-label={expanded ? 'Show chat' : 'Expand sheet'} data-expand-toggle onClick={onToggleExpand}>
							{expanded ? <CollapseIcon /> : <ExpandIcon />}
						</Button>
					)}
					<Button variant='ghost' size='icon-sm' aria-label='Close sheet' onClick={onClose}>
						<CloseIcon />
					</Button>
				</div>
			</div>

			<div className='min-h-0 flex-1 p-2' onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}>
				<SheetEditor
					sheet={sheet}
					onChange={onChange}
					history={history}
					highlight={following ? activity.range : undefined}
					status={activity ? `${activity.label}…` : note || undefined}
					onAsk={onAsk}
				/>
			</div>
		</div>
	);
};

export default SheetPanel;
