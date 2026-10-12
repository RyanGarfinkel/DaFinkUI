'use client';

import CommandInput, { type CommandOption } from '../../components/CommandInput/CommandInput';
import { Attachment, AttachmentGroup } from '../../components/Attachment/Attachment';
import { ChangeEvent, ClipboardEvent, FormEvent, useRef } from 'react';
import ModelPicker, { type ModelPickerProps } from './ModelPicker';
import Button from '../../components/Button/Button';

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
}

const PaperclipIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='m21.44 11.05-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L9.41 17.41a1.5 1.5 0 0 1-2.12-2.12l8.49-8.49' />
	</svg>
);

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
		className='motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] group-hover:-rotate-12'
	>
		<path d='m22 2-7 20-4-9-9-4Z' />
		<path d='M22 2 11 13' />
	</svg>
);

const StopIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
		<rect x='6' y='6' width='12' height='12' rx='2' />
	</svg>
);

// Shared by the main pane and ThreadPanel so the input, file upload, and send/stop button
// are one implementation — each pane just owns its own draft, attachment, and submit state.
export const Composer = (
	{
		draft, onDraftChange, onSubmit, isGenerating, onStop, attachedFiles, onAttach,
		commands, onCommand, placeholder, inputLabel, sendLabel, modelPicker,
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
		<form onSubmit={onSubmit} className='flex w-full flex-col items-center gap-2'>
			{attachedFiles.length > 0 && (
				<AttachmentGroup className='w-full max-w-md'>
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
			<div onPaste={handlePaste} className='flex w-full max-w-md items-center gap-1.5 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-1.5 shadow-[var(--shadow-lg)]'>
				<input
					ref={fileInputRef}
					type='file'
					multiple
					onChange={handleFileChange}
					className='hidden'
					tabIndex={-1}
					aria-hidden='true'
				/>
				<Button type='button' variant='ghost' size='icon' aria-label='Attach files' disabled={isGenerating} onClick={() => fileInputRef.current?.click()}>
					<PaperclipIcon />
				</Button>
				<CommandInput
					className='min-w-0 flex-1'
					value={draft}
					onChange={onDraftChange}
					commands={commands}
					onCommand={onCommand}
					placeholder={placeholder}
					aria-label={inputLabel}
					disabled={isGenerating}
				/>
				{isGenerating ? (
					<Button type='button' size='icon' aria-label='Stop generating' onClick={onStop}>
						<StopIcon />
					</Button>
				) : (
					<Button type='submit' size='icon' className='group' aria-label={sendLabel} disabled={!draft.trim() && attachedFiles.length === 0}>
						<SendIcon />
					</Button>
				)}
			</div>
			{modelPicker && (
				<div className='flex w-full max-w-md justify-end px-1.5'>
					<ModelPicker {...modelPicker} />
				</div>
			)}
		</form>
	);
};

export default Composer;
