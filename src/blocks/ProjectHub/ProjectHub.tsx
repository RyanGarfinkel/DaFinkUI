'use client';

import KanbanBoard, { type KanbanCardDetailsRenderer, type KanbanColumnData, type KanbanCardData, type KanbanSubtask } from '../../components/Kanban/Kanban';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import { Sidebar, SidebarButton, SidebarHeader, SidebarSection } from '../../components/Sidebar/Sidebar';
import { Select, type SelectOption } from '../../components/Select/Select';
import TextShimmer from '../../components/TextShimmer/TextShimmer';
import Typewriter from '../../components/Typewriter/Typewriter';
import DatePicker from '../../components/DatePicker/DatePicker';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Card, CardContent } from '../../components/Card/Card';
import Textarea from '../../components/Textarea/Textarea';
import Checkbox from '../../components/Checkbox/Checkbox';
import Progress from '../../components/Progress/Progress';
import CountUp from '../../components/CountUp/CountUp';
import Button from '../../components/Button/Button';
import Avatar from '../../components/Avatar/Avatar';
import { useMemo, useRef, useState } from 'react';
import Badge from '../../components/Badge/Badge';
import Input from '../../components/Input/Input';
import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Accent = 'brand' | 'success' | 'warning' | 'danger';

interface ProjectLink
{
	id:    string;
	label: string;
	url:   string;
}

interface ProjectData
{
	id:          string;
	name:        string;
	description: string;
	accent:      Accent;
	members:     string[];
	dueDate:     string;
	links:       ProjectLink[];
	columns:     KanbanColumnData[];
}

type AiStatus = 'idle' | 'thinking' | 'ready';

interface AiSuggestion
{
	title:       string;
	description: string;
	tag:         string;
}

// ─── Accent maps ──────────────────────────────────────────────────────────────

const ACCENTS: Accent[] = ['brand', 'success', 'warning', 'danger'];

const ACCENT_DOT: Record<Accent, string> = {
	brand:   'bg-brand',
	success: 'bg-success',
	warning: 'bg-warning',
	danger:  'bg-danger',
};

const ACCENT_RING: Record<Accent, string> = {
	brand:   'ring-brand',
	success: 'ring-success',
	warning: 'ring-warning',
	danger:  'ring-danger',
};

const ACCENT_LABEL: Record<Accent, string> = {
	brand:   'Blue',
	success: 'Green',
	warning: 'Amber',
	danger:  'Red',
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M12 5v14M5 12h14' />
	</svg>
);

const CalendarIcon = () => (
	<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect x='3' y='4' width='18' height='18' rx='2' />
		<path d='M16 2v4M8 2v4M3 10h18' />
	</svg>
);

const SparkleIcon = ({ className = '' }: { className?: string }) => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' className={className}>
		<path d='M12 2.5c.4 3.6 1.1 6 2.2 7.3 1.2 1.2 3.7 2 7.3 2.2-3.6.4-6 1.1-7.3 2.2-1.2 1.2-2 3.7-2.2 7.3-.4-3.6-1.1-6-2.2-7.3C8.5 12.9 6 12.1 2.5 12c3.6-.4 6-1.1 7.3-2.2C10.9 8.5 11.6 6 12 2.5Z' />
	</svg>
);

const CloseIcon = () => (
	<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M18 6 6 18' />
		<path d='m6 6 12 12' />
	</svg>
);

const LinkIcon = () => (
	<svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' />
		<path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' />
	</svg>
);

const GridIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect x='3' y='3' width='7' height='7' rx='1' />
		<rect x='14' y='3' width='7' height='7' rx='1' />
		<rect x='3' y='14' width='7' height='7' rx='1' />
		<rect x='14' y='14' width='7' height='7' rx='1' />
	</svg>
);

// ─── Kanban card details ──────────────────────────────────────────────────────
// KanbanCard ships no built-in edit form; this is this block's own, hand-rolled
// for the fields its cards actually use (tag, description, due date, effort
// points, and a subtask checklist).

const POINTS_OPTIONS: SelectOption[] = [
	{ value: '',  label: 'No estimate' },
	{ value: '1', label: '1' },
	{ value: '2', label: '2' },
	{ value: '3', label: '3' },
	{ value: '5', label: '5' },
	{ value: '8', label: '8' },
];

const ProjectCardDetails: KanbanCardDetailsRenderer = ({ card, onUpdate, onDelete, onClose }) => {
	const [draftTitle, setDraftTitle] = useState(card.title);
	const [draftTag, setDraftTag] = useState(card.tag ?? '');
	const [draftDescription, setDraftDescription] = useState(card.description ?? '');
	const [draftDueDate, setDraftDueDate] = useState(card.dueDate ?? '');
	const [draftPoints, setDraftPoints] = useState(card.points !== undefined ? String(card.points) : '');
	const [draftSubtasks, setDraftSubtasks] = useState<KanbanSubtask[]>(card.subtasks ?? []);
	const [newSubtaskLabel, setNewSubtaskLabel] = useState('');
	const subtaskCounterRef = useRef(0);

	const handleAddSubtask = () => {
		const label = newSubtaskLabel.trim();
		if(!label) return;
		subtaskCounterRef.current += 1;
		setDraftSubtasks((prev) => [...prev, { id: `subtask-${subtaskCounterRef.current}`, label, done: false }]);
		setNewSubtaskLabel('');
	};

	const toggleSubtask = (id: string) => {
		setDraftSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, done: !s.done } : s));
	};

	const removeSubtask = (id: string) => {
		setDraftSubtasks((prev) => prev.filter((s) => s.id !== id));
	};

	const handleSave = () => {
		const title = draftTitle.trim();
		if(!title) return;
		onUpdate({
			...card,
			title,
			tag:         draftTag.trim() || undefined,
			description: draftDescription.trim() || undefined,
			dueDate:     draftDueDate || undefined,
			points:      draftPoints ? Number(draftPoints) : undefined,
			subtasks:    draftSubtasks.length > 0 ? draftSubtasks : undefined,
		});
	};

	return (
		<>
			<ModalClose />
			<ModalHeader>
				<ModalTitle>Edit card</ModalTitle>
			</ModalHeader>
			<ModalContent className='flex flex-col gap-4'>
				<Input
					label='Title'
					value={draftTitle}
					onChange={(e) => setDraftTitle(e.target.value)}
					onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
				/>
				<Input label='Tag' placeholder='Optional' value={draftTag} onChange={(e) => setDraftTag(e.target.value)} />
				<Textarea
					label='Description'
					placeholder='Optional'
					rows={4}
					value={draftDescription}
					onChange={(e) => setDraftDescription(e.target.value)}
				/>

				<div className='flex flex-col gap-4 sm:flex-row'>
					<div className='flex flex-1 flex-col gap-1.5'>
						<DatePicker
							label='Due date'
							value={draftDueDate ? new Date(draftDueDate) : null}
							onChange={(date) => setDraftDueDate(date.toISOString())}
						/>
						{draftDueDate && (
							<button
								type='button'
								onClick={() => setDraftDueDate('')}
								className='self-start text-xs text-text-muted hover:text-text focus:outline-none focus-visible:underline'
							>
								Clear due date
							</button>
						)}
					</div>
					<Select label='Points' options={POINTS_OPTIONS} value={draftPoints} onChange={setDraftPoints} className='flex-1' />
				</div>

				<div className='flex flex-col gap-2'>
					<span className='text-sm font-medium text-text'>Related items</span>

					{draftSubtasks.length > 0 && (
						<ul className='flex flex-col gap-1.5'>
							{draftSubtasks.map((subtask) => (
								<li key={subtask.id} className='flex items-center gap-2'>
									<Checkbox checked={subtask.done} onChange={() => toggleSubtask(subtask.id)} aria-label={subtask.label} />
									<span className={`flex-1 text-sm ${subtask.done ? 'text-text-muted line-through' : 'text-text'}`}>
										{subtask.label}
									</span>
									<button
										type='button'
										aria-label={`Remove ${subtask.label}`}
										onClick={() => removeSubtask(subtask.id)}
										className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-muted hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
									>
										<CloseIcon />
									</button>
								</li>
							))}
						</ul>
					)}

					<div className='flex items-center gap-1.5'>
						<Input
							value={newSubtaskLabel}
							onChange={(e) => setNewSubtaskLabel(e.target.value)}
							onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
							placeholder='Add a related item'
							aria-label='Add a related item'
							className='flex-1'
						/>
						<Button size='icon-sm' variant='secondary' aria-label='Add related item' onClick={handleAddSubtask} disabled={!newSubtaskLabel.trim()}>
							<PlusIcon />
						</Button>
					</div>
				</div>
			</ModalContent>
			<ModalFooter>
				<Button variant='destructive' size='sm' className='mr-auto' onClick={() => onDelete(card.id)}>Delete</Button>
				<Button variant='secondary' size='sm' onClick={onClose}>Cancel</Button>
				<Button size='sm' onClick={handleSave} disabled={!draftTitle.trim()}>Save</Button>
			</ModalFooter>
		</>
	);
};

// ─── Fake AI task drafting ────────────────────────────────────────────────────

const TAG_KEYWORDS: { keywords: string[]; tag: string }[] = [
	{ keywords: ['bug', 'fix', 'broken', 'crash'],      tag: 'Bug' },
	{ keywords: ['design', 'ui', 'ux', 'layout'],        tag: 'Design' },
	{ keywords: ['test', 'qa', 'coverage'],              tag: 'QA' },
	{ keywords: ['doc', 'write', 'copy', 'content'],     tag: 'Docs' },
	{ keywords: ['api', 'backend', 'server', 'database'], tag: 'Engineering' },
];

const pickTag = (prompt: string): string => {
	const lower = prompt.toLowerCase();
	const match = TAG_KEYWORDS.find(({ keywords }) => keywords.some((word) => lower.includes(word)));
	return match?.tag ?? 'Task';
};

const draftTaskFromPrompt = (prompt: string): AiSuggestion => {
	const trimmed = prompt.trim().replace(/[.?!]+$/, '');
	const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
	const title = capitalized.length > 72 ? `${capitalized.slice(0, 69)}...` : capitalized;

	return {
		title,
		description: `Drafted from your prompt: "${prompt.trim()}". Review scope and assign before starting.`,
		tag: pickTag(prompt),
	};
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const getDefaultColumns = (): KanbanColumnData[] => [
	{ id: 'todo',        title: 'To do',       cards: [] },
	{ id: 'in-progress', title: 'In progress', cards: [] },
	{ id: 'review',      title: 'Review',      cards: [] },
	{ id: 'done',        title: 'Done',        cards: [] },
];

const INITIAL_PROJECTS: ProjectData[] = [
	{
		id:          'marketing-site',
		name:        'Marketing site redesign',
		description: 'Refresh the public marketing site with the new brand system and a faster page-build pipeline.',
		accent:      'brand',
		members:     ['Ava Thompson', 'Noah Martinez', 'Priya Sharma'],
		dueDate:     'Sep 12',
		links: [
			{ id: 'ms-link-1', label: 'Design file', url: 'https://www.figma.com' },
			{ id: 'ms-link-2', label: 'Staging site', url: 'https://vercel.com' },
		],
		columns: [
			{
				id: 'todo', title: 'To do', cards: [
					{ id: 'ms-1', title: 'Rewrite homepage hero copy', tag: 'Copy' },
					{ id: 'ms-2', title: 'Audit third-party scripts for perf', tag: 'Engineering' },
				],
			},
			{
				id: 'in-progress', title: 'In progress', cards: [
					{
						id: 'ms-3', title: 'Build new pricing page layout', description: 'Match the updated tier structure from the pricing block.', tag: 'Design',
						points: 5, dueDate: '2026-09-10T12:00:00.000Z',
						subtasks: [
							{ id: 'ms-3-sub-1', label: 'Wire up new tier cards', done: true },
							{ id: 'ms-3-sub-2', label: 'Connect billing toggle', done: false },
							{ id: 'ms-3-sub-3', label: 'QA responsive breakpoints', done: false },
						],
					},
				],
			},
			{
				id: 'review', title: 'Review', cards: [
					{ id: 'ms-4', title: 'Dark mode pass on the docs shell', tag: 'Design', points: 3 },
				],
			},
			{
				id: 'done', title: 'Done', cards: [
					{ id: 'ms-5', title: 'Migrate blog to the new CMS', tag: 'Engineering' },
					{ id: 'ms-6', title: 'Ship updated favicon & OG images', tag: 'Design' },
				],
			},
		],
	},
	{
		id:          'mobile-app-v2',
		name:        'Mobile app v2',
		description: 'Native rebuild of the mobile app with offline support and a redesigned onboarding flow.',
		accent:      'success',
		members:     ['Liam Chen', 'Sofia Rossi', 'Ethan Brooks', 'Maya Patel'],
		dueDate:     'Aug 30',
		links: [
			{ id: 'mv-link-1', label: 'Repo', url: 'https://github.com' },
			{ id: 'mv-link-2', label: 'Design file', url: 'https://www.figma.com' },
		],
		columns: [
			{
				id: 'todo', title: 'To do', cards: [
					{ id: 'mv-1', title: 'Wire up push notification opt-in', tag: 'Engineering' },
				],
			},
			{
				id: 'in-progress', title: 'In progress', cards: [
					{
						id: 'mv-2', title: 'Offline sync for saved items', description: 'Cache last-known state and reconcile on reconnect.', tag: 'Engineering',
						points: 8, dueDate: '2026-08-29T12:00:00.000Z',
						subtasks: [
							{ id: 'mv-2-sub-1', label: 'Local cache write-through', done: true },
							{ id: 'mv-2-sub-2', label: 'Conflict resolution on reconnect', done: true },
							{ id: 'mv-2-sub-3', label: 'Offline banner UI', done: false },
						],
					},
				],
			},
			{
				id: 'review', title: 'Review', cards: [
					{ id: 'mv-3', title: 'New onboarding carousel', tag: 'Design' },
				],
			},
			{
				id: 'done', title: 'Done', cards: [
					{ id: 'mv-4', title: 'Biometric login', tag: 'Engineering' },
					{ id: 'mv-5', title: 'Redesign tab bar icons', tag: 'Design' },
					{ id: 'mv-6', title: 'App store screenshots refresh', tag: 'Marketing' },
				],
			},
		],
	},
	{
		id:          'q3-sprint',
		name:        'Q3 growth sprint',
		description: 'A focused two-week sprint to test onboarding and pricing experiments before the Q3 close.',
		accent:      'warning',
		members:     ['Jordan Park', 'Riley Yu'],
		dueDate:     'in 4 days',
		links: [
			{ id: 'q3-link-1', label: 'Experiment doc', url: 'https://www.notion.so' },
		],
		columns: [
			{
				id: 'todo', title: 'To do', cards: [
					{ id: 'q3-1', title: 'Set up A/B test for signup flow', tag: 'Engineering' },
					{ id: 'q3-2', title: 'Draft experiment brief', tag: 'Docs' },
					{ id: 'q3-3', title: 'Segment churn-risk cohort', tag: 'Research' },
				],
			},
			{
				id: 'in-progress', title: 'In progress', cards: [
					{ id: 'q3-4', title: 'Build referral incentive banner', tag: 'Design', points: 2, dueDate: '2026-08-30T12:00:00.000Z' },
				],
			},
			{ id: 'review', title: 'Review', cards: [] },
			{
				id: 'done', title: 'Done', cards: [
					{ id: 'q3-5', title: 'Instrument funnel analytics', tag: 'Engineering' },
				],
			},
		],
	},
	{
		id:          'api-migration',
		name:        'API v3 migration',
		description: 'Move all internal services off the deprecated v2 API before it sunsets at the end of the quarter.',
		accent:      'danger',
		members:     ['Casey Diaz', 'Drew Nolan'],
		dueDate:     'Overdue',
		links: [
			{ id: 'am-link-1', label: 'Repo', url: 'https://github.com' },
			{ id: 'am-link-2', label: 'Runbook', url: 'https://www.notion.so' },
		],
		columns: [
			{
				id: 'todo', title: 'To do', cards: [
					{ id: 'am-1', title: 'Migrate billing service', tag: 'Bug' },
					{ id: 'am-2', title: 'Update webhook signature verification', tag: 'Bug' },
				],
			},
			{
				id: 'in-progress', title: 'In progress', cards: [
					{
						id: 'am-3', title: 'Rewrite rate-limit middleware', tag: 'Engineering',
						points: 13, dueDate: '2026-09-01T12:00:00.000Z',
						subtasks: [
							{ id: 'am-3-sub-1', label: 'Design token-bucket algorithm', done: true },
							{ id: 'am-3-sub-2', label: 'Migrate existing callers', done: false },
						],
					},
				],
			},
			{
				id: 'review', title: 'Review', cards: [
					{ id: 'am-4', title: 'Deprecation notice for partner docs', tag: 'Docs' },
				],
			},
			{ id: 'done', title: 'Done', cards: [] },
		],
	},
];

const getProjectStats = (project: ProjectData) => {
	const totalTasks = project.columns.reduce((sum, col) => sum + col.cards.length, 0);
	const doneTasks  = project.columns.find((col) => col.id === 'done')?.cards.length ?? 0;
	return { totalTasks, doneTasks };
};

const BOARD_COLUMN_DEFS: { id: string; title: string }[] = [
	{ id: 'todo',        title: 'To do' },
	{ id: 'in-progress', title: 'In progress' },
	{ id: 'review',      title: 'Review' },
	{ id: 'done',        title: 'Done' },
];

// ─── StatTile ─────────────────────────────────────────────────────────────────

interface StatTileProps
{
	label:     string;
	value:     number;
	suffix?:   string;
	progress?: number;
}

const StatTile = ({ label, value, suffix = '', progress }: StatTileProps) => (
	<Card>
		<CardContent className='flex flex-col gap-2'>
			<span className='text-xs text-text-muted'>{label}</span>
			<span className='text-2xl font-semibold text-text'>
				<CountUp value={value} suffix={suffix} duration={900} />
			</span>
			{progress !== undefined && <Progress value={progress} max={100} size='sm' />}
		</CardContent>
	</Card>
);

// ─── ProjectHub ───────────────────────────────────────────────────────────────

export const ProjectHub = () => {
	const [projects, setProjects] = useState<ProjectData[]>(INITIAL_PROJECTS);
	const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
	const [boardKey, setBoardKey] = useState(0);

	const [createOpen, setCreateOpen] = useState(false);
	const [newProjectName, setNewProjectName] = useState('');
	const [newProjectAccent, setNewProjectAccent] = useState<Accent>('brand');

	const [aiPrompt, setAiPrompt] = useState('');
	const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
	const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
	const [aiTitleRevealed, setAiTitleRevealed] = useState(false);
	const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [newMemberName, setNewMemberName] = useState('');
	const [newLinkLabel, setNewLinkLabel] = useState('');
	const [newLinkUrl, setNewLinkUrl] = useState('');

	const idCounterRef = useRef(0);
	const nextId = (prefix: string) => {
		idCounterRef.current += 1;
		return `${prefix}-${idCounterRef.current}`;
	};

	const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

	const overallStats = useMemo(() => {
		const totalTasks = projects.reduce((sum, p) => sum + p.columns.reduce((s, col) => s + col.cards.length, 0), 0);
		const doneTasks  = projects.reduce((sum, p) => sum + (p.columns.find((col) => col.id === 'done')?.cards.length ?? 0), 0);
		const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
		return { totalTasks, doneTasks, completionRate };
	}, [projects]);

	const allTasksColumns = useMemo<KanbanColumnData[]>(() => (
		BOARD_COLUMN_DEFS.map(({ id, title }) => ({
			id,
			title,
			// Cross-project view: swap each card's tag for its project name so it's
			// clear at a glance which project a task belongs to once tasks are pooled.
			cards: projects.flatMap((project) => {
				const column = project.columns.find((col) => col.id === id);
				return (column?.cards ?? []).map((card) => ({ ...card, tag: project.name }));
			}),
		}))
	), [projects]);

	const resetAiComposer = () => {
		if(aiTimeoutRef.current)
		{
			clearTimeout(aiTimeoutRef.current);
			aiTimeoutRef.current = null;
		}
		setAiPrompt('');
		setAiStatus('idle');
		setAiSuggestion(null);
		setAiTitleRevealed(false);
	};

	const resetProjectEditors = () => {
		setNewMemberName('');
		setNewLinkLabel('');
		setNewLinkUrl('');
	};

	const openProject = (id: string) => {
		setActiveProjectId(id);
		setBoardKey((k) => k + 1);
		resetAiComposer();
		resetProjectEditors();
	};

	const backToOverview = () => {
		setActiveProjectId(null);
		resetAiComposer();
		resetProjectEditors();
	};

	const updateActiveProject = (updater: (project: ProjectData) => ProjectData) => {
		if(!activeProjectId) return;
		setProjects((prev) => prev.map((p) => p.id === activeProjectId ? updater(p) : p));
	};

	const handleAddMember = () => {
		const name = newMemberName.trim();
		if(!name) return;
		updateActiveProject((p) => p.members.includes(name) ? p : { ...p, members: [...p.members, name] });
		setNewMemberName('');
	};

	const handleRemoveMember = (name: string) => {
		updateActiveProject((p) => ({ ...p, members: p.members.filter((m) => m !== name) }));
	};

	const handleAddLink = () => {
		const label = newLinkLabel.trim();
		const url   = newLinkUrl.trim();
		if(!label || !url) return;
		updateActiveProject((p) => ({ ...p, links: [...p.links, { id: nextId('link'), label, url }] }));
		setNewLinkLabel('');
		setNewLinkUrl('');
	};

	const handleRemoveLink = (id: string) => {
		updateActiveProject((p) => ({ ...p, links: p.links.filter((l) => l.id !== id) }));
	};

	const handleCreateOpenChange = (open: boolean) => {
		setCreateOpen(open);
		if(!open)
		{
			setNewProjectName('');
			setNewProjectAccent('brand');
		}
	};

	const handleCreateProject = () => {
		const name = newProjectName.trim();
		if(!name) return;

		const project: ProjectData = {
			id:          nextId('project'),
			name,
			description: 'A freshly created project. Add a description and start planning.',
			accent:      newProjectAccent,
			members:     [],
			dueDate:     'No due date yet',
			links:       [],
			columns:     getDefaultColumns(),
		};

		setProjects((prev) => [project, ...prev]);
		setBoardKey((k) => k + 1);
		handleCreateOpenChange(false);
	};

	const handleGenerateTask = () => {
		const prompt = aiPrompt.trim();
		if(!prompt || aiStatus === 'thinking') return;

		setAiStatus('thinking');
		setAiSuggestion(null);
		setAiTitleRevealed(false);

		aiTimeoutRef.current = setTimeout(() => {
			aiTimeoutRef.current = null;
			setAiSuggestion(draftTaskFromPrompt(prompt));
			setAiStatus('ready');
		}, 1100);
	};

	const handleAddSuggestion = () => {
		const targetProjectId = activeProjectId;
		if(!aiSuggestion || !targetProjectId) return;

		const card: KanbanCardData = {
			id:          nextId('ai'),
			title:       aiSuggestion.title,
			description: aiSuggestion.description,
			tag:         aiSuggestion.tag,
		};

		setProjects((prev) => prev.map((p) => {
			if(p.id !== targetProjectId) return p;
			return { ...p, columns: p.columns.map((col, index) => index === 0 ? { ...col, cards: [card, ...col.cards] } : col) };
		}));

		// KanbanBoard owns its drag state internally once mounted; bumping the key
		// remounts it with the updated columns so the new card actually appears.
		setBoardKey((k) => k + 1);
		resetAiComposer();
	};

	let mainContent: ReactNode;

	if(activeProject)
	{
		const { totalTasks, doneTasks } = getProjectStats(activeProject);

		mainContent = (
			<div className='flex flex-col gap-6 w-full'>
				<Breadcrumb items={[{ label: 'Projects', onClick: backToOverview }, { label: activeProject.name }]} />

				<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
					<div className='flex flex-col gap-2 min-w-0'>
						<div className='flex items-center gap-2'>
							<span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ACCENT_DOT[activeProject.accent]}`} aria-hidden='true' />
							<h2 className='text-xl font-semibold text-text truncate'>{activeProject.name}</h2>
						</div>
						<p className='text-sm text-text-muted max-w-lg'>{activeProject.description}</p>
					</div>

					<div className='flex flex-col items-start gap-2 sm:items-end shrink-0'>
						<div className='flex flex-wrap items-center gap-1.5 sm:justify-end'>
							{activeProject.members.map((name) => (
								<span
									key={name}
									className='inline-flex items-center gap-1.5 rounded-full border-[length:var(--border-width)] border-surface-border bg-surface-hover py-1 pl-1 pr-1.5'
								>
									<Avatar name={name} size='sm' />
									<span className='text-xs text-text'>{name}</span>
									<button
										type='button'
										aria-label={`Remove ${name}`}
										onClick={() => handleRemoveMember(name)}
										className='flex h-4 w-4 items-center justify-center rounded-full text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
									>
										<CloseIcon />
									</button>
								</span>
							))}
						</div>

						<div className='flex items-center gap-1.5'>
							<Input
								value={newMemberName}
								onChange={(e) => setNewMemberName(e.target.value)}
								onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
								placeholder='Add member'
								aria-label='Add a team member'
								className='w-32'
							/>
							<Button size='icon-sm' variant='secondary' aria-label='Add member' onClick={handleAddMember} disabled={!newMemberName.trim()}>
								<PlusIcon />
							</Button>
						</div>

						<span className='flex items-center gap-1.5 text-xs text-text-muted'>
							<CalendarIcon />
							Due {activeProject.dueDate}
						</span>
					</div>
				</div>

				<div className='flex items-center gap-3'>
					<Progress value={doneTasks} max={Math.max(totalTasks, 1)} size='sm' className='max-w-xs' />
					<span className='text-xs text-text-muted whitespace-nowrap'>{doneTasks} of {totalTasks} done</span>
				</div>

				<div className='flex flex-col gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-4'>
					<h3 className='text-sm font-semibold text-text'>Related links</h3>

					{activeProject.links.length > 0 && (
						<ul className='flex flex-col gap-2'>
							{activeProject.links.map((link) => (
								<li key={link.id} className='flex items-center justify-between gap-2'>
									<a
										href={link.url}
										target='_blank'
										rel='noopener noreferrer'
										className='flex min-w-0 items-center gap-2 text-sm text-brand hover:underline focus:outline-none focus-visible:underline'
									>
										<LinkIcon />
										<span className='truncate'>{link.label}</span>
									</a>
									<button
										type='button'
										aria-label={`Remove link ${link.label}`}
										onClick={() => handleRemoveLink(link.id)}
										className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
									>
										<CloseIcon />
									</button>
								</li>
							))}
						</ul>
					)}

					<div className='flex flex-col gap-2 sm:flex-row'>
						<Input
							value={newLinkLabel}
							onChange={(e) => setNewLinkLabel(e.target.value)}
							onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
							placeholder='Label, e.g. Figma file'
							aria-label='Link label'
							className='sm:flex-1'
						/>
						<Input
							value={newLinkUrl}
							onChange={(e) => setNewLinkUrl(e.target.value)}
							onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
							placeholder='https://…'
							aria-label='Link URL'
							className='sm:flex-1'
						/>
						<Button size='sm' variant='secondary' onClick={handleAddLink} disabled={!newLinkLabel.trim() || !newLinkUrl.trim()}>
							<PlusIcon />
							Add
						</Button>
					</div>
				</div>

				<div className='flex flex-col gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-brand/25 bg-brand/5 p-4'>
					<div className='flex items-center gap-2'>
						<span className='flex h-6 w-6 items-center justify-center rounded-full bg-brand/15 text-brand'>
							<SparkleIcon />
						</span>
						<h3 className='text-sm font-semibold text-text'>Draft a task with AI</h3>
					</div>

					<div className='flex flex-col gap-2 sm:flex-row'>
						<Input
							value={aiPrompt}
							onChange={(e) => setAiPrompt(e.target.value)}
							onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleGenerateTask(); } }}
							placeholder='Describe a task, e.g. "add empty states to the billing page"'
							aria-label='Describe a task for AI to draft'
							disabled={aiStatus === 'thinking'}
							className='flex-1'
						/>
						<Button
							size='sm'
							onClick={handleGenerateTask}
							loading={aiStatus === 'thinking'}
							disabled={!aiPrompt.trim() || aiStatus === 'thinking'}
						>
							<SparkleIcon />
							Generate task
						</Button>
					</div>

					{aiStatus === 'thinking' && (
						<div className='flex items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface-panel px-3 py-2.5'>
							<span className='text-brand motion-safe:animate-pulse'>
								<SparkleIcon />
							</span>
							<TextShimmer className='text-sm'>Drafting a task from your prompt…</TextShimmer>
						</div>
					)}

					{aiStatus === 'ready' && aiSuggestion && (
						<div className='flex flex-col gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-3'>
							<div className='flex items-center gap-2'>
								<Badge variant='outline'>{aiSuggestion.tag}</Badge>
								<span className='text-xs text-text-muted'>AI suggestion, adds to To do</span>
							</div>
							<p className='text-sm font-medium text-text'>
								<Typewriter text={aiSuggestion.title} speed={16} onComplete={() => setAiTitleRevealed(true)} />
							</p>
							<p className={`text-xs text-text-muted motion-safe:transition-opacity motion-safe:duration-[var(--duration-base)] ${aiTitleRevealed ? 'opacity-100' : 'opacity-0'}`}>
								{aiSuggestion.description}
							</p>
							<div className='flex items-center gap-2 pt-1'>
								<Button size='sm' onClick={handleAddSuggestion}>Add to board</Button>
								<Button size='sm' variant='ghost' onClick={resetAiComposer}>Discard</Button>
							</div>
						</div>
					)}

					<p className='text-[11px] text-text-subtle'>Simulated locally, wire this up to your own model call.</p>
				</div>

				<KanbanBoard
					key={boardKey}
					initialColumns={activeProject.columns}
					renderCardDetails={ProjectCardDetails}
					onCardUpdate={(updated) => updateActiveProject((p) => ({
						...p,
						columns: p.columns.map((col) => ({ ...col, cards: col.cards.map((c) => c.id === updated.id ? updated : c) })),
					}))}
					onCardDelete={(id) => updateActiveProject((p) => ({
						...p,
						columns: p.columns.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== id) })),
					}))}
				/>
			</div>
		);
	}
	else
	{
		mainContent = (
			<div className='flex flex-col gap-6 w-full'>
				<div className='flex flex-col gap-1'>
					<h2 className='text-xl font-semibold text-text'>Overview</h2>
					<p className='text-sm text-text-muted'>A snapshot across every project.</p>
				</div>

				<div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
					<StatTile label='Active projects' value={projects.length} />
					<StatTile label='Total tasks' value={overallStats.totalTasks} />
					<StatTile label='Completed' value={overallStats.doneTasks} />
					<StatTile label='Completion' value={overallStats.completionRate} suffix='%' progress={overallStats.completionRate} />
				</div>

				<div className='flex flex-col gap-3'>
					<div className='flex flex-col gap-1'>
						<h3 className='text-sm font-semibold text-text uppercase tracking-wide'>All tasks</h3>
						<p className='text-xs text-text-muted'>Every task across every project, tagged by project.</p>
					</div>
					<KanbanBoard key={`all-${boardKey}`} initialColumns={allTasksColumns} renderCardDetails={ProjectCardDetails} />
				</div>
			</div>
		);
	}

	return (
		<div className='flex w-full overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border'>
			<Sidebar width='w-64' height='h-full'>
				<SidebarHeader>
					<Button variant='outlined' size='sm' className='w-full justify-center gap-1.5' onClick={() => setCreateOpen(true)}>
						<PlusIcon />
						New project
					</Button>
				</SidebarHeader>

				<SidebarSection label='Workspace'>
					<SidebarButton isActive={!activeProject} onClick={backToOverview} icon={<GridIcon />}>
						Overview
					</SidebarButton>
				</SidebarSection>

				<SidebarSection label='Projects'>
					{projects.map((project) => (
						<SidebarButton
							key={project.id}
							isActive={project.id === activeProjectId}
							onClick={() => openProject(project.id)}
							icon={<span className={`h-2.5 w-2.5 rounded-full ${ACCENT_DOT[project.accent]}`} />}
						>
							{project.name}
						</SidebarButton>
					))}
				</SidebarSection>
			</Sidebar>

			<div className='min-w-0 flex-1 p-6'>
				{mainContent}
			</div>

			<Modal open={createOpen} onOpenChange={handleCreateOpenChange}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>New project</ModalTitle>
				</ModalHeader>
				<ModalContent className='flex flex-col gap-4'>
					<Input
						label='Name'
						placeholder='Q3 marketing site'
						value={newProjectName}
						onChange={(e) => setNewProjectName(e.target.value)}
						onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleCreateProject(); } }}
					/>
					<div className='flex flex-col gap-1.5'>
						<span className='text-sm font-medium text-text'>Accent color</span>
						<div className='flex items-center gap-2'>
							{ACCENTS.map((accent) => (
								<button
									key={accent}
									type='button'
									aria-label={`${ACCENT_LABEL[accent]} accent`}
									aria-pressed={newProjectAccent === accent}
									onClick={() => setNewProjectAccent(accent)}
									className={[
										'h-6 w-6 rounded-full motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)]',
										ACCENT_DOT[accent],
										'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
										newProjectAccent === accent ? `scale-110 ring-2 ring-offset-2 ${ACCENT_RING[accent]}` : 'hover:scale-105',
									].join(' ')}
								/>
							))}
						</div>
					</div>
				</ModalContent>
				<ModalFooter>
					<Button variant='secondary' onClick={() => handleCreateOpenChange(false)}>Cancel</Button>
					<Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>Create project</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default ProjectHub;
