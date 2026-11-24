'use client';

import { ChevronLeftIcon, CloseIcon, CollapseIcon, ExpandIcon } from './icons';
import { KIND_ICONS, KIND_LABELS } from './artifactKinds';
import Button from '../../components/Button/Button';
import { ArtifactViewer } from './ArtifactViewer';
import type { ArtifactEntry } from './types';
import { KeyboardEvent } from 'react';

export interface ArtifactsPanelProps {
	entries:        ArtifactEntry[];
	/** The entry open in the viewer, or null for the list. */
	openKey:        string | null;
	onSelect:       (key: string | null) => void;
	/** A slide deck or a sheet opens in its own panel, not here. */
	onOpenDocument: (entry: ArtifactEntry) => void;
	/** Called with an artifact's id and new content when the person edits it (document artifacts). */
	onArtifactChange?: (artifactId: string, content: string) => void;
	expanded:       boolean;
	onToggleExpand: () => void;
	onClose:        () => void;
	/** Rendered inside a Drawer (mobile): the Drawer owns Escape and the expand button is hidden. */
	inDrawer?:      boolean;
}

export const ArtifactsPanel = ({ entries, openKey, onSelect, onOpenDocument, onArtifactChange, expanded, onToggleExpand, onClose, inDrawer = false }: ArtifactsPanelProps) => {
	const open = entries.find((entry) => entry.key === openKey && entry.artifact);

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if(e.key !== 'Escape' || inDrawer) return;
		e.preventDefault();
		onClose();
	};

	const handleBack = () => {
		const key = open?.key;
		onSelect(null);
		if(key) requestAnimationFrame(() => document.getElementById(`artifact-row-${key}`)?.focus());
	};

	return (
		<div onKeyDown={handleKeyDown} className={`flex min-w-0 flex-1 flex-col ${inDrawer ? '' : 'border-l-[length:var(--border-width)] border-surface-border'}`}>
			<div className='flex items-center justify-between gap-2 border-b-[length:var(--border-width)] border-surface-border px-4 py-3'>
				<div className='flex min-w-0 items-center gap-2'>
					{open && (
						<Button variant='ghost' size='icon-sm' aria-label='Back to artifacts' onClick={handleBack}>
							<ChevronLeftIcon />
						</Button>
					)}
					<div className='min-w-0'>
						<p className='text-[11px] font-medium uppercase tracking-wide text-text-subtle'>{open ? KIND_LABELS[open.kind] : 'Artifacts'}</p>
						<h3 className='truncate text-base font-semibold text-text'>{open ? open.title : `${entries.length} in this chat`}</h3>
					</div>
				</div>
				<div className='flex shrink-0 items-center gap-1'>
					{!inDrawer && (
						<Button variant='ghost' size='icon-sm' aria-label={expanded ? 'Show chat' : 'Expand artifacts'} data-expand-toggle onClick={onToggleExpand}>
							{expanded ? <CollapseIcon /> : <ExpandIcon />}
						</Button>
					)}
					<Button variant='ghost' size='icon-sm' aria-label='Close artifacts' onClick={onClose}>
						<CloseIcon />
					</Button>
				</div>
			</div>

			<div className='min-h-0 flex-1'>
				{open?.artifact ? (
					<ArtifactViewer artifact={open.artifact} onChange={(content) => onArtifactChange?.(open.artifact!.id, content)} />
				) : entries.length === 0 ? (
					<p className='p-5 text-sm text-text-muted'>Documents, images, slides and sheets the AI makes in this chat will appear here.</p>
				) : (
					<ul aria-label='Artifacts' className='flex h-full flex-col gap-1 overflow-auto p-2'>
						{entries.map((entry) => (
							<li key={entry.key}>
								<button
									id={`artifact-row-${entry.key}`}
									type='button'
									onClick={() => (entry.artifact ? onSelect(entry.key) : onOpenDocument(entry))}
									className={[
										'flex w-full items-center gap-3 rounded-[var(--radius)] p-2 text-left',
										'motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]',
										'hover:bg-surface-hover',
										'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
									].join(' ')}
								>
									<span aria-hidden='true' className='flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-surface-hover text-text-muted'>
										{KIND_ICONS[entry.kind]}
									</span>
									<span className='min-w-0 flex-1'>
										<span className='block truncate text-sm font-medium text-text'>{entry.title}</span>
										<span className='block truncate text-xs text-text-muted'>{KIND_LABELS[entry.kind]}</span>
									</span>
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default ArtifactsPanel;
