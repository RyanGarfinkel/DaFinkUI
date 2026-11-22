'use client';

import CommandInput, { type CommandOption } from '../../components/CommandInput/CommandInput';
import { Attachment, AttachmentGroup } from '../../components/Attachment/Attachment';
import { ChangeEvent, ClipboardEvent, FormEvent, useRef } from 'react';
import ModelPicker, { type ModelPickerProps } from './ModelPicker';
import Button from '../../components/Button/Button';
import type { MessageAttachment } from './types';
import { PlusIcon } from './icons';

export interface ComposerProps {
	draft:              string;
	onDraftChange:      (value: string) => void;
	onSubmit:           (e: FormEvent) => void;
	isGenerating:       boolean;
	onStop:             () => void;
	attachedFiles:      File[];
	onAttach:           (files: File[]) => void;
	commands:           CommandOption[];
	onCommand:          (command: CommandOption) => void;
	placeholder:        string;
	inputLabel:         string;
	sendLabel:          string;
	modelPicker?:       ModelPickerProps;
	/** Things the message points at (e.g. a slide element), shown as removable chips beside attached files. */
	references?:        MessageAttachment[];
	onRemoveReference?: (index: number) => void;
	/** The form's DOM id, so the host can find the composer to focus it. */
	id?:                string;
}

const SendIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
	>
		<polyline points='9 10 4 15 9 20' />
		<path d='M20 4v7a4 4 0 0 1-4 4H4' />
	</svg>
);

const StopIcon = () => (
	<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
		<rect x='4' y='4' width='16' height='16' rx='4' />
	</svg>
);

// Shared by the main pane and ThreadPanel so the input, file upload, and send/stop button
// are one implementation — each pane just owns its own draft, attachment, and submit state.
export const Composer = (
	{
		draft, onDraftChange, onSubmit, isGenerating, onStop, attachedFiles, onAttach,
		commands, onCommand, placeholder, inputLabel, sendLabel, modelPicker, references = [], onRemoveReference, id,
	}: ComposerProps
) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const picked = Array.from(e.target.files ?? []);
		if(picked.length > 0) onAttach([...attachedFiles, ...picked]);
		e.target.value = '';
	};

	// Clipboard screenshots all arrive named "image.png", so each gets a distinct name.
	const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
		const images = Array.from(e.clipboardData.files).filter((file) => file.type.startsWith('image/'));
		if(images.length === 0) return;

		e.preventDefault();
		const named = images.map((file, index) => {
			const extension = file.type.split('/')[1].replace(/\+.*$/, '');
			return new File([file], `pasted-image-${attachedFiles.length + index + 1}.${extension}`, { type: file.type });
		});
		onAttach([...attachedFiles, ...named]);
	};

	return (
		<form id={id} onSubmit={onSubmit} className='flex w-full flex-col items-center gap-2'>
			{(attachedFiles.length > 0 || references.length > 0) && (
				<AttachmentGroup className='w-full max-w-xl'>
					{references.map((reference, index) => (
						<Attachment
							key={`${reference.name}-${index}`}
							compact
							name={reference.name}
							onRemove={() => onRemoveReference?.(index)}
						/>
					))}
					{attachedFiles.map((file, index) => (
						<Attachment
							key={`${file.name}-${index}`}
							compact
							name={file.name}
							onRemove={() => onAttach(attachedFiles.filter((_, i) => i !== index))}
						/>
					))}
				</AttachmentGroup>
			)}
			<div onPaste={handlePaste} className='w-full max-w-xl'>
				<CommandInput
					inputClassName='py-3! pl-4! pr-14!'
					className='w-full rounded-[var(--radius)] shadow-[var(--shadow-lg)]'
					value={draft}
					onChange={onDraftChange}
					commands={commands}
					onCommand={onCommand}
					placeholder={placeholder}
					aria-label={inputLabel}
					disabled={isGenerating}
					endContent={isGenerating ? (
						<Button type='button' variant='ghost' size='icon' aria-label='Stop generating' onClick={onStop}>
							<StopIcon />
						</Button>
					) : (
						<Button type='submit' variant='ghost' size='icon' aria-label={sendLabel} disabled={!draft.trim() && attachedFiles.length === 0 && references.length === 0}>
							<SendIcon />
						</Button>
					)}
				/>
			</div>
			<div className='flex w-full max-w-xl items-center justify-between px-1.5'>
				<input
					ref={fileInputRef}
					type='file'
					multiple
					onChange={handleFileChange}
					className='hidden'
					tabIndex={-1}
					aria-hidden='true'
				/>
				<Button type='button' variant='ghost' size='icon-sm' aria-label='Attach files' disabled={isGenerating} onClick={() => fileInputRef.current?.click()}>
					<PlusIcon />
				</Button>
				{modelPicker && <ModelPicker {...modelPicker} />}
			</div>
		</form>
	);
};

export default Composer;
