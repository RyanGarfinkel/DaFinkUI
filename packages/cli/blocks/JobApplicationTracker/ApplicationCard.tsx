'use client';

import Badge, { type BadgeVariant } from '../../components/Badge/Badge';
import Avatar from '../../components/Avatar/Avatar';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApplicationStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface ResumeAttachment
{
	name: string;
	size: string;
	url:  string;
}

export interface JobApplication
{
	id:           string;
	role:         string;
	company:      string;
	status:       ApplicationStatus;
	workType:     'Remote' | 'Hybrid' | 'Onsite';
	location?:    string;
	salary?:      string;
	appliedDate?: string;
	url?:         string;
	contact?:     string;
	notes?:       string;
	resume?:      ResumeAttachment;
}

export interface ApplicationStage
{
	id:           ApplicationStatus;
	title:        string;
	badgeVariant: BadgeVariant;
}

// Edit this list to rename, reorder, or add stages — every card and the table's
// Stage column read from here, so this is the one place a new stage needs adding.
export const STAGES: ApplicationStage[] = [
	{ id: 'wishlist',     title: 'Wishlist',     badgeVariant: 'outline' },
	{ id: 'applied',      title: 'Applied',      badgeVariant: 'default' },
	{ id: 'interviewing', title: 'Interviewing', badgeVariant: 'warning' },
	{ id: 'offer',        title: 'Offer',        badgeVariant: 'success' },
	{ id: 'rejected',     title: 'Rejected',     badgeVariant: 'danger' },
];

export const getStage = (status: ApplicationStatus): ApplicationStage => STAGES.find((stage) => stage.id === status) ?? STAGES[0];

export const formatAppliedDate = (iso: string): string => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// ─── Icons ────────────────────────────────────────────────────────────────────

const PinIcon = () => (
	<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z' />
		<circle cx='12' cy='10' r='2.5' />
	</svg>
);

const CalendarIcon = () => (
	<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect x='3' y='4' width='18' height='18' rx='2' />
		<path d='M16 2v4M8 2v4M3 10h18' />
	</svg>
);

const PaperclipIcon = () => (
	<svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48' />
	</svg>
);

const ChevronIcon = () => (
	<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='m9 6 6 6-6 6' />
	</svg>
);

// ─── ApplicationCard ──────────────────────────────────────────────────────────

export interface ApplicationCardProps
{
	application: JobApplication;
	isDragging?: boolean;
	className?:  string;
	onOpen?:     (application: JobApplication) => void;
}

export const ApplicationCard = ({ application, isDragging = false, className = '', onOpen }: ApplicationCardProps) =>
{
	const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: application.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			onClick={() => onOpen?.(application)}
			aria-label={`${application.role} at ${application.company}. Press space to start dragging, or activate the details button to view and edit.`}
			className={[
				'group flex flex-col gap-2.5 rounded-[var(--radius-lg)] border-[length:var(--border-width)] bg-surface p-3.5 cursor-grab active:cursor-grabbing',
				'shadow-[var(--shadow-sm)] transition-all duration-[var(--duration-fast)]',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
				'hover:border-surface-border-hover hover:shadow-[var(--shadow)] hover:-translate-y-0.5',
				isSortableDragging || isDragging ? 'opacity-40 border-surface-border-hover' : 'border-surface-border',
				className,
			].join(' ')}
		>
			<div className='flex items-start gap-2.5'>
				<Avatar name={application.company} size='sm' shape='square' />
				<div className='min-w-0 flex-1'>
					<p className='truncate text-sm font-semibold text-text leading-snug'>{application.role}</p>
					<p className='truncate text-xs text-text-muted'>{application.company}</p>
				</div>
				<div className='flex shrink-0 flex-col items-end gap-1'>
					<Badge variant='outline' className='text-[10px]'>{application.workType}</Badge>
					{application.appliedDate && (
						<span className='flex items-center gap-1 text-[11px] text-text-subtle'>
							<CalendarIcon />
							{formatAppliedDate(application.appliedDate)}
						</span>
					)}
				</div>
			</div>

			{(!isDragging || application.location || application.salary || application.resume) && (
				<div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-subtle'>
					{application.location && (
						<span className='flex items-center gap-1 truncate'>
							<PinIcon />
							{application.location}
						</span>
					)}
					{application.salary && <span className='truncate text-text-muted'>{application.salary}</span>}
					{application.resume && (
						<span className='flex items-center gap-1 text-text-muted'>
							<PaperclipIcon />
							Resume
						</span>
					)}
					{!isDragging && (
						<button
							type='button'
							aria-label={`View details for ${application.role} at ${application.company}`}
							onPointerDown={(e) => e.stopPropagation()}
							onClick={(e) => { e.stopPropagation(); onOpen?.(application); }}
							className='ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-subtle opacity-0 transition-colors duration-[var(--duration-fast)] group-hover:opacity-100 hover:bg-surface-active hover:text-text focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
						>
							<ChevronIcon />
						</button>
					)}
				</div>
			)}

			{application.notes && (
				<p className='line-clamp-2 text-xs italic leading-relaxed text-text-muted'>{application.notes}</p>
			)}
		</div>
	);
};

export default ApplicationCard;
