'use client';

import { handleToolbarKeys, TOOLBAR_BUTTON, type Download } from './Toolbar';
import { Menu } from '../Menu/Menu';
import { ReactNode } from 'react';
import { Glyph } from './icons';

export interface ActionsProps {
	onUndo?:     () => void;
	onRedo?:     () => void;
	canUndo:     boolean;
	canRedo:     boolean;
	onDownload:  (kind: Download) => void;
	toolbarEnd?: ReactNode;
}

/** History, host actions and download: the cluster at the end of the formula bar row. */
export const Actions = ({ onUndo, onRedo, canUndo, canRedo, onDownload, toolbarEnd }: ActionsProps) => (
	<div role='toolbar' aria-label='Sheet actions' onKeyDown={handleToolbarKeys} className='flex shrink-0 items-center gap-0.5'>
		{(onUndo || onRedo) && (
			<>
				<button type='button' aria-label='Undo' title='Undo (⌘Z)' className={TOOLBAR_BUTTON} disabled={!canUndo} onClick={onUndo}><Glyph name='undo' /></button>
				<button type='button' aria-label='Redo' title='Redo (⇧⌘Z)' className={TOOLBAR_BUTTON} disabled={!canRedo} onClick={onRedo}><Glyph name='redo' /></button>
			</>
		)}
		{toolbarEnd}
		<Menu
			align='end'
			unstyledTrigger
			triggerClassName={TOOLBAR_BUTTON}
			triggerProps={{ 'aria-label': 'Download', title: 'Download' }}
			trigger={<Glyph name='download' />}
			items={[
				{ label: 'Comma-separated', detail: '.csv', onSelect: () => onDownload('csv') },
				{ label: 'Tab-separated', detail: '.tsv', onSelect: () => onDownload('tsv') },
			]}
		/>
	</div>
);
