'use client';

import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCorners, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import ApplicationCard, { type ApplicationStage, type ApplicationStatus, type JobApplication, STAGES } from './ApplicationCard';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ToggleGroup, ToggleGroupItem } from '../../components/ToggleGroup/ToggleGroup';
import DataTable, { type ColumnDef } from '../../components/DataTable/DataTable';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Select } from '../../components/Select/Select';
import { Alert } from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { useApplications } from './useApplications';
import Badge from '../../components/Badge/Badge';
import Input from '../../components/Input/Input';
import TrackerSkeleton from './TrackerSkeleton';
import { useState } from 'react';

// A single base CV shared across the whole search — distinct from the
// per-application resume attached in each card's details modal.
const MASTER_CV = {
	name: 'Resume_MasterCopy.pdf',
	url:  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
};

type TrackerView = 'board' | 'table';

const WORK_TYPE_OPTIONS = [
	{ value: 'Remote', label: 'Remote' },
	{ value: 'Hybrid', label: 'Hybrid' },
	{ value: 'Onsite', label: 'Onsite' },
];

const STAGE_OPTIONS = STAGES.map((stage) => ({ value: stage.id, label: stage.title }));

// The table doubles as an editable grid using the same Input/Select components as
// the details modal — no need to open the modal just to fix a role, stage, or
// salary. At rest a cell reads as plain text; hovering or focusing it reveals the
// component's normal bordered, editable look. The `:not(:hover):not(:focus)`
// scoping (rather than fighting Input/Select's own hover/focus classes with more
// `!important`) means those default styles apply completely untouched the moment
// either state is true — no cascade tug-of-war with the component's own classes.
const CLEAN_FIELD_CLASS = '!px-1.5 !py-1 [&:not(:hover):not(:focus)]:!border-transparent [&:not(:hover):not(:focus)]:!bg-transparent [&:not(:hover):not(:focus)]:!shadow-none';

// Applied date is the one exception: there's no headless-friendly (no visible
// label required) date component in the library yet, so it falls back to a
// native date input — fully accessible on its own, styled to match the same
// text-until-hover look via ordinary (non-important) Tailwind variants, since
// there's no competing component style here to override.

interface InlineDateFieldProps {
	value:     string | undefined;
	onChange:  (value: string | undefined) => void;
	ariaLabel: string;
}

const InlineDateField = ({ value, onChange, ariaLabel }: InlineDateFieldProps) => (
	<input
		type='date'
		value={value ? value.slice(0, 10) : ''}
		aria-label={ariaLabel}
		onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
		className='w-full rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-transparent bg-transparent px-1.5 py-1 text-sm text-text shadow-none transition-colors duration-[var(--duration-fast)] hover:border-input-border hover:bg-surface hover:shadow-[var(--inner-shadow)] focus:border-input-border focus:bg-surface focus:outline-none focus-visible:shadow-[var(--input-focus-shadow)]'
	/>
);

const FileIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' />
		<path d='M14 2v4a2 2 0 0 0 2 2h4' />
	</svg>
);

const SparkleIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
		<path d='M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.13-1.58a.5.5 0 0 1 0-.96l6.13-1.58A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0Z' />
	</svg>
);

// Its own droppable region (not just a SortableContext) so a column that's been
// dragged empty can still be dropped back into.

interface BoardColumnProps {
	stage:        ApplicationStage;
	applications: JobApplication[];
	onOpen:       (application: JobApplication) => void;
}

const BoardColumn = ({ stage, applications, onOpen }: BoardColumnProps) => {
	const { setNodeRef } = useDroppable({ id: stage.id });

	return (
		<div
			ref={setNodeRef}
			className='flex flex-col gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-hover p-3 min-w-[240px] w-[240px]'
		>
			<div className='flex items-center justify-between px-1'>
				<h3 className='text-xs font-semibold text-text uppercase tracking-wide'>{stage.title}</h3>
				<Badge variant={stage.badgeVariant} className='text-[10px]'>{applications.length}</Badge>
			</div>

			<SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
				<div className='flex flex-col gap-2 min-h-[60px]'>
					{applications.map((application) => (
						<ApplicationCard key={application.id} application={application} onOpen={onOpen} />
					))}
				</div>
			</SortableContext>
		</div>
	);
};

export const JobApplicationTracker = () => {
	const { applications, status, retry, syncError, dismissSyncError, addDraft, discardDraft, save, update, remove, setLocalApplications } = useApplications();
	const [view, setView]                 = useState<TrackerView>('board');
	const [selectedId, setSelectedId]     = useState<string | null>(null);
	const [activeId, setActiveId]         = useState<string | null>(null);

	const selectedApplication = applications.find((a) => a.id === selectedId) ?? null;
	const activeApplication   = applications.find((a) => a.id === activeId) ?? null;

	const openDetails = (application: JobApplication) => setSelectedId(application.id);

	const handleViewCv = () => window.open(MASTER_CV.url, '_blank', 'noopener,noreferrer');

	const updateApplication = (id: string, patch: Partial<JobApplication>) => update(id, patch);

	const handleAddApplication = () => setSelectedId(addDraft());

	const handleModalOpenChange = (open: boolean) => {
		if(open) return;
		discardDraft();
		setSelectedId(null);
	};

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if(!over) return;

		const activeApp = applications.find((a) => a.id === active.id);
		if(!activeApp) return;

		const overApp    = applications.find((a) => a.id === over.id);
		const overStatus = overApp ? overApp.status : STAGES.some((s) => s.id === over.id) ? (over.id as ApplicationStatus) : null;
		if(!overStatus || overStatus === activeApp.status) return;

		setLocalApplications((prev) => prev.map((a) => a.id === active.id ? { ...a, status: overStatus } : a));
	};

	const syncDraggedStatus = (id: string) => {
		const dragged = applications.find((a) => a.id === id);
		if(dragged) update(id, { status: dragged.status }, true);
	};

	const handleDragCancel = () => {
		if(activeId) syncDraggedStatus(activeId);
		setActiveId(null);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		syncDraggedStatus(active.id as string);
		if(!over || active.id === over.id) return;

		const activeApp = applications.find((a) => a.id === active.id);
		const overApp   = applications.find((a) => a.id === over.id);
		if(!activeApp || !overApp || activeApp.status !== overApp.status) return;

		setLocalApplications((prev) =>
		{
			const oldIndex = prev.findIndex((a) => a.id === active.id);
			const newIndex = prev.findIndex((a) => a.id === over.id);
			return arrayMove(prev, oldIndex, newIndex);
		});
	};

	const activeCount        = applications.filter((a) => a.status === 'applied' || a.status === 'interviewing' || a.status === 'offer').length;
	const interviewingCount  = applications.filter((a) => a.status === 'interviewing').length;
	const offerCount         = applications.filter((a) => a.status === 'offer').length;

	const tableColumns: ColumnDef<JobApplication>[] = [
		{
			key: 'role',
			header: 'Role',
			sortable: true,
			width: '170px',
			render: (value, row) => <Input value={value as string} aria-label={`Role for ${row.company || 'this application'}`} onChange={(e) => updateApplication(row.id, { role: e.target.value })} className={CLEAN_FIELD_CLASS} />,
		},
		{
			key: 'company',
			header: 'Company',
			sortable: true,
			width: '150px',
			render: (value, row) => <Input value={value as string} aria-label={`Company for ${row.role || 'this application'}`} onChange={(e) => updateApplication(row.id, { company: e.target.value })} className={CLEAN_FIELD_CLASS} />,
		},
		{
			key: 'status',
			header: 'Stage',
			sortable: true,
			width: '140px',
			render: (value, row) => (
				<Select
					options={STAGE_OPTIONS}
					value={value as string}
					size='sm'
					aria-label={`Stage for ${row.role || 'this application'}`}
					onChange={(v) => updateApplication(row.id, { status: v as ApplicationStatus })}
					triggerClassName={CLEAN_FIELD_CLASS}
				/>
			),
		},
		{
			key: 'workType',
			header: 'Work type',
			width: '120px',
			render: (value, row) => (
				<Select
					options={WORK_TYPE_OPTIONS}
					value={value as string}
					size='sm'
					aria-label={`Work type for ${row.role || 'this application'}`}
					onChange={(v) => updateApplication(row.id, { workType: v as JobApplication['workType'] })}
					triggerClassName={CLEAN_FIELD_CLASS}
				/>
			),
		},
		{
			key: 'location',
			header: 'Location',
			width: '150px',
			render: (value, row) => <Input value={(value as string) ?? ''} placeholder='Optional' aria-label={`Location for ${row.role || 'this application'}`} onChange={(e) => updateApplication(row.id, { location: e.target.value })} className={CLEAN_FIELD_CLASS} />,
		},
		{
			key: 'appliedDate',
			header: 'Applied',
			sortable: true,
			width: '140px',
			render: (value, row) => <InlineDateField value={value as string | undefined} ariaLabel={`Applied date for ${row.role || 'this application'}`} onChange={(v) => updateApplication(row.id, { appliedDate: v })} />,
		},
		{
			key: 'salary',
			header: 'Salary',
			width: '130px',
			render: (value, row) => <Input value={(value as string) ?? ''} placeholder='Optional' aria-label={`Salary for ${row.role || 'this application'}`} onChange={(e) => updateApplication(row.id, { salary: e.target.value })} className={CLEAN_FIELD_CLASS} />,
		},
		{
			key: 'id',
			header: '',
			width: '84px',
			render: (_value, row) => <Button variant='ghost' size='sm' onClick={() => openDetails(row)}>Details</Button>,
		},
	];

	return (
		<div className='flex flex-col gap-5 w-full' aria-busy={status === 'loading'}>
			<div className='flex flex-col gap-3'>
				<div className='flex flex-col gap-1'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<h2 className='text-2xl font-semibold text-text'>Job search tracker</h2>
						<div className='flex items-center gap-2'>
							<Button size='sm' variant='outlined' onClick={handleViewCv}>
								<FileIcon />
								View CV
							</Button>
							<Button size='sm' variant='outlined' disabled>
								<SparkleIcon />
								Tailor resume
								<Badge variant='outline' className='ml-1 text-[10px]'>Coming soon</Badge>
							</Button>
						</div>
					</div>
					<p className='text-sm text-text-muted'>Drag cards on the board, or edit properties directly in the table — both stay in sync.</p>
				</div>

				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div className='flex items-center gap-2'>
						{status === 'ready' ? (
							<>
								<Badge variant='default'>{activeCount} active</Badge>
								<Badge variant='warning'>{interviewingCount} interviewing</Badge>
								<Badge variant='success'>{offerCount} offer{offerCount === 1 ? '' : 's'}</Badge>
							</>
						) : (
							<Skeleton width='15rem' height='1.5rem' aria-hidden='true' />
						)}
					</div>

					<div className='flex items-center gap-2'>
						<ToggleGroup type='single' value={view} onValueChange={(value) => setView(value as TrackerView)} size='sm' aria-label='Board or table view'>
							<ToggleGroupItem value='board'>Board</ToggleGroupItem>
							<ToggleGroupItem value='table'>Table</ToggleGroupItem>
						</ToggleGroup>
						<Button size='sm' variant='secondary' disabled={status !== 'ready'} onClick={handleAddApplication}>+ Add application</Button>
					</div>
				</div>
			</div>

			{syncError && (
				<Alert variant='danger' title='Sync failed'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<span>{syncError}</span>
						<Button size='sm' variant='outlined' onClick={dismissSyncError}>Dismiss</Button>
					</div>
				</Alert>
			)}

			{status === 'loading' && (
				<>
					<span role='status' className='sr-only'>Loading applications…</span>
					<TrackerSkeleton view={view} />
				</>
			)}

			{status === 'error' && (
				<Alert variant='danger' title='Could not load applications'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<span>Something went wrong fetching your applications.</span>
						<Button size='sm' variant='outlined' onClick={retry}>Try again</Button>
					</div>
				</Alert>
			)}

			{status === 'ready' && (view === 'board' ? (
				<DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
					<div role='application' aria-label='Job application board' className='flex gap-4 overflow-x-auto pb-2'>
						{STAGES.map((stage) => (
							<BoardColumn key={stage.id} stage={stage} applications={applications.filter((a) => a.status === stage.id)} onOpen={openDetails} />
						))}
					</div>

					<DragOverlay>
						{activeApplication && (
							<ApplicationCard application={activeApplication} isDragging className='rotate-1 shadow-[var(--shadow-lg)] opacity-95' />
						)}
					</DragOverlay>
				</DndContext>
			) : (
				<DataTable data={applications} columns={tableColumns} keyField='id' pageSize={10} emptyMessage='No applications yet.' />
			))}

			<ApplicationDetailsModal
				open={selectedId !== null}
				application={selectedApplication}
				onOpenChange={handleModalOpenChange}
				onSave={save}
				onDelete={remove}
			/>
		</div>
	);
};

export default JobApplicationTracker;
