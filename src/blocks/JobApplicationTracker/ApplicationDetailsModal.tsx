'use client';

import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import { type ApplicationStatus, type JobApplication, STAGES } from './ApplicationCard';
import { Select, type SelectOption } from '../../components/Select/Select';
import Attachment from '../../components/Attachment/Attachment';
import DatePicker from '../../components/DatePicker/DatePicker';
import Separator from '../../components/Separator/Separator';
import Textarea from '../../components/Textarea/Textarea';
import { ChangeEvent, useRef, useState } from 'react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';

const WORK_TYPE_OPTIONS: SelectOption[] = [
	{ value: 'Remote', label: 'Remote' },
	{ value: 'Hybrid', label: 'Hybrid' },
	{ value: 'Onsite', label: 'Onsite' },
];

const STAGE_OPTIONS: SelectOption[] = STAGES.map((stage) => ({ value: stage.id, label: stage.title }));

const formatFileSize = (bytes: number): string =>
{
	if(bytes < 1024) return `${bytes} B`;
	if(bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CloseIcon = () => (
	<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M18 6 6 18' />
		<path d='m6 6 12 12' />
	</svg>
);

export interface ApplicationDetailsModalProps
{
	open:         boolean;
	application:  JobApplication | null;
	onOpenChange: (open: boolean) => void;
	onSave:       (application: JobApplication) => void;
	onDelete:     (id: string) => void;
}

export const ApplicationDetailsModal = ({ open, application, onOpenChange, onSave, onDelete }: ApplicationDetailsModalProps) =>
{
	const [draft, setDraft] = useState<JobApplication | null>(application);
	const resumeInputRef    = useRef<HTMLInputElement>(null);

	// Reseed the draft whenever a different (non-null) application is selected, but keep the
	// last draft around while `application` goes back to null so the close animation still
	// has content to render instead of flashing empty.
	if(application && application.id !== draft?.id)
	{
		setDraft(application);
	}

	const updateDraft = (patch: Partial<JobApplication>) => setDraft((prev) => prev ? { ...prev, ...patch } : prev);

	const handleResumeSelect = (e: ChangeEvent<HTMLInputElement>) =>
	{
		const file = e.target.files?.[0];
		e.target.value = '';
		if(!file) return;
		updateDraft({ resume: { name: file.name, size: formatFileSize(file.size), url: URL.createObjectURL(file) } });
	};

	const handleSave = () =>
	{
		if(!draft || !draft.role.trim() || !draft.company.trim()) return;
		onSave({ ...draft, role: draft.role.trim(), company: draft.company.trim() });
		onOpenChange(false);
	};

	const handleDelete = () =>
	{
		if(!draft) return;
		onDelete(draft.id);
		onOpenChange(false);
	};

	if(!draft) return null;

	return (
		<Modal open={open} onOpenChange={onOpenChange} size='lg'>
			<ModalClose />
			<ModalHeader>
				<ModalTitle>{draft.role || draft.company ? `${draft.role || 'New role'} at ${draft.company || 'new company'}` : 'New application'}</ModalTitle>
			</ModalHeader>
			<ModalContent className='flex flex-col gap-4'>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
					<Input label='Role' value={draft.role} onChange={(e) => updateDraft({ role: e.target.value })} />
					<Input label='Company' value={draft.company} onChange={(e) => updateDraft({ company: e.target.value })} />
					<Select label='Stage' options={STAGE_OPTIONS} value={draft.status} onChange={(value) => updateDraft({ status: value as ApplicationStatus })} />

					<Select label='Work type' options={WORK_TYPE_OPTIONS} value={draft.workType} onChange={(value) => updateDraft({ workType: value as JobApplication['workType'] })} />
					<Input label='Location' placeholder='Optional' value={draft.location ?? ''} onChange={(e) => updateDraft({ location: e.target.value })} />
					<Input label='Salary' placeholder='Optional' value={draft.salary ?? ''} onChange={(e) => updateDraft({ salary: e.target.value })} />

					<div className='flex flex-col gap-1.5'>
						<DatePicker
							label='Applied date'
							value={draft.appliedDate ? new Date(draft.appliedDate) : null}
							onChange={(date) => updateDraft({ appliedDate: date.toISOString() })}
						/>
						{draft.appliedDate && (
							<button
								type='button'
								onClick={() => updateDraft({ appliedDate: undefined })}
								className='self-start text-xs text-text-muted hover:text-text focus:outline-none focus-visible:underline'
							>
								Clear applied date
							</button>
						)}
					</div>
					<Input label='Contact' placeholder='Optional' value={draft.contact ?? ''} onChange={(e) => updateDraft({ contact: e.target.value })} />
					<Input label='Job posting URL' placeholder='Optional' value={draft.url ?? ''} onChange={(e) => updateDraft({ url: e.target.value })} />
				</div>

				<Separator />

				<div className='flex flex-col gap-1.5'>
					<span className='text-sm font-medium text-text'>Resume</span>
					{draft.resume ? (
						<div className='flex items-center gap-2'>
							<Attachment name={draft.resume.name} size={draft.resume.size} type='PDF' href={draft.resume.url} target='_blank' rel='noopener noreferrer' />
							<Button
								variant='ghost'
								size='icon-sm'
								aria-label='Remove resume'
								onClick={() => updateDraft({ resume: undefined })}
							>
								<CloseIcon />
							</Button>
						</div>
					) : (
						<Button variant='outlined' size='sm' className='w-fit' onClick={() => resumeInputRef.current?.click()}>
							Upload resume
						</Button>
					)}
					<input
						ref={resumeInputRef}
						type='file'
						accept='.pdf,.doc,.docx'
						onChange={handleResumeSelect}
						tabIndex={-1}
						aria-hidden='true'
						className='sr-only'
					/>
				</div>

				<Textarea label='Notes' placeholder='Interview prep, recruiter conversations, follow-ups…' rows={3} value={draft.notes ?? ''} onChange={(e) => updateDraft({ notes: e.target.value })} />
			</ModalContent>
			<ModalFooter>
				<Button variant='destructive' size='sm' className='mr-auto' onClick={handleDelete}>Delete</Button>
				<Button variant='secondary' size='sm' onClick={() => onOpenChange(false)}>Cancel</Button>
				<Button size='sm' onClick={handleSave} disabled={!draft.role.trim() || !draft.company.trim()}>Save</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ApplicationDetailsModal;
