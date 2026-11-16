'use client';

import Modal, { ModalContent, ModalFooter, ModalHeader, ModalTitle } from '../../components/Modal/Modal';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { Glyph } from '../../components/DeckEditor/icons';
import { TEMPLATES, buildTemplate } from './templates';
import type { DeckDocument } from './useDeckDocument';
import Button from '../../components/Button/Button';
import { Menu } from '../../components/Menu/Menu';
import Input from '../../components/Input/Input';

interface DeckMenuProps {
	doc:          DeckDocument;
	title:        string;
	onRename:     (title: string) => void;
	onExportJson: () => void;
	onStatus:    (message: string) => void;
	buttonClass: string;
}

export const DeckMenu = ({ doc, title, onRename, onExportJson, onStatus, buttonClass }: DeckMenuProps) => {
	const [renaming, setRenaming] = useState(false);
	const [draft, setDraft] = useState('');
	const fileRef = useRef<HTMLInputElement>(null);

	const run = (action: Promise<unknown>, failure: string) =>
		action.catch(error => onStatus(`${failure}: ${error instanceof Error ? error.message : 'unknown error'}`));

	const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if(file) run(doc.importFile(file), `Couldn't import ${file.name}`);
	};

	const submitRename = (e: FormEvent) => {
		e.preventDefault();
		const next = draft.trim();
		if(!next) return;
		onRename(next);
		setRenaming(false);
	};

	return (
		<>
			<Menu
				align='end'
				unstyledTrigger
				triggerClassName={buttonClass}
				triggerProps={{ 'aria-label': `Deck: ${title}`, title: 'Deck' }}
				trigger={<Glyph name='folder' />}
				items={[
					{
						label:   'New deck',
						submenu: [
							{ label: 'Blank', onSelect: () => run(doc.create({ title: 'Untitled deck' }), 'Couldn\'t create a deck') },
							{ separator: true },
							...TEMPLATES.map(t => ({ label: t.label, detail: `${t.layouts.length} slides`, onSelect: () => run(doc.create({ deck: buildTemplate(t) }), 'Couldn\'t create a deck') })),
						],
					},
					{
						label:   'Open',
						submenu: doc.decks.map(d => ({
							label:    d.title,
							detail:   `${d.slideCount} ${d.slideCount === 1 ? 'slide' : 'slides'}`,
							selected: d.id === doc.deckId,
							onSelect: () => doc.open(d.id),
						})),
					},
					{
						label:    'Rename…',
						onSelect: () =>
						{
							setDraft(title);
							setRenaming(true);
						},
					},
					{ separator: true },
					{ label: 'Import .json…', onSelect: () => fileRef.current?.click() },
					{ label: 'Export .json', onSelect: onExportJson },
				]}
			/>
			<input ref={fileRef} type='file' accept='application/json,.json' tabIndex={-1} aria-hidden='true' onChange={handleImport} className='sr-only' />

			<Modal open={renaming} onOpenChange={setRenaming} size='sm'>
				<form onSubmit={submitRename}>
					<ModalHeader>
						<ModalTitle>Rename deck</ModalTitle>
					</ModalHeader>
					<ModalContent>
						<Input label='Deck name' value={draft} maxLength={200} onChange={e => setDraft(e.target.value)} />
					</ModalContent>
					<ModalFooter>
						<Button type='button' variant='ghost' onClick={() => setRenaming(false)}>Cancel</Button>
						<Button type='submit' disabled={!draft.trim()}>Rename</Button>
					</ModalFooter>
				</form>
			</Modal>
		</>
	);
};
