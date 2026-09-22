'use client';

import StreamingMessage, { type ChartSpec, type StackableChartSpec, type DonutSpec, type ImageSpec, type AudioSpec, type TableSpec } from './StreamingMessage';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import ToolCallTrace, { type ToolCallEntry, type ToolCallLink } from '../../components/ToolCallTrace/ToolCallTrace';
import CommandPalette, { CommandGroup, CommandItem } from '../../components/CommandPalette/CommandPalette';
import { Sidebar, SidebarButton, SidebarHeader, SidebarSection } from '../../components/Sidebar/Sidebar';
import { ChangeEvent, FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { Resizable, ResizablePanel, ResizableHandle } from '../../components/Resizable/Resizable';
import Questionnaire, { type QuestionStep } from '../../components/Questionnaire/Questionnaire';
import CommandInput, { type CommandOption } from '../../components/CommandInput/CommandInput';
import { Skeleton, SkeletonImage } from '../../components/Skeleton/Skeleton';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import Attachment from '../../components/Attachment/Attachment';
import Message from '../../components/Message/Message';
import Tooltip from '../../components/Tooltip/Tooltip';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import Input from '../../components/Input/Input';
import ThreadPanel from './ThreadPanel';

interface MessageAttachment {
	name: string;
	size: string;
}

export interface ChatTextMessage {
	id:                 number;
	kind:               'message';
	sender:             'user' | 'ai';
	text:               string;
	animate?:           boolean;
	generating?:        'image' | 'audio';
	attachment?:        MessageAttachment;
	toolCalls?:         ToolCallEntry[];
	questionnaire?:     QuestionStep;
	questionnaireAnswer?: string;
}

interface ChatCheckpoint {
	id:    number;
	kind:  'checkpoint';
	label: string;
}

export type ChatMessage = ChatTextMessage | ChatCheckpoint;

export interface ThreadRef {
	id:            string;
	rootMessageId: number;
	snippet:       string;
	createdAt:     string;
	replyCount:    number;
}

interface ChatEntry {
	id:         string;
	title:      string;
	messages:   ChatMessage[];
	threadRefs: ThreadRef[];
}

export interface AiChatHistoryMessage {
	role: 'user' | 'assistant';
	text: string;
}

export interface AiChatReply {
	text:       string;
	toolCalls?: ToolCallEntry[];
}

const HOME_PRICE_DATA: Record<string, string | number>[] = [
	{ year: 2019, price: 313000 },
	{ year: 2020, price: 329000 },
	{ year: 2021, price: 375000 },
	{ year: 2022, price: 395000 },
	{ year: 2023, price: 410000 },
	{ year: 2024, price: 426000 },
];

const HOME_PRICE_LINEPLOT: ChartSpec = {
	xKey:   'year',
	series: [{ key: 'price', label: 'Median home price' }],
	data:   HOME_PRICE_DATA,
};

const DOWNLOADS_BARCHART: StackableChartSpec = {
	xKey:   'month',
	series: [{ key: 'downloads', label: 'npm downloads' }],
	data: [
		{ month: 'Apr', downloads: 1200 },
		{ month: 'May', downloads: 1850 },
		{ month: 'Jun', downloads: 2400 },
		{ month: 'Jul', downloads: 3100 },
	],
};

const READING_PACE_AREACHART: StackableChartSpec = {
	xKey:   'week',
	series: [{ key: 'pages', label: 'Pages read' }],
	data: [
		{ week: 'Week 1', pages: 120 },
		{ week: 'Week 2', pages: 260 },
		{ week: 'Week 3', pages: 410 },
		{ week: 'Week 4', pages: 590 },
	],
};

const WORKOUT_SPLIT_DONUTCHART: DonutSpec = {
	data: [
		{ label: 'Push', value: 2 },
		{ label: 'Pull', value: 2 },
		{ label: 'Legs', value: 1 },
		{ label: 'Rest', value: 2 },
	],
};

const FITNESS_RADARCHART: ChartSpec = {
	xKey:   'category',
	series: [{ key: 'score', label: 'This month' }],
	data: [
		{ category: 'Strength',    score: 8 },
		{ category: 'Endurance',   score: 6 },
		{ category: 'Flexibility', score: 4 },
		{ category: 'Balance',     score: 5 },
		{ category: 'Speed',       score: 7 },
	],
};

const SAMPLE_EQUATIONS = ['x^2 - 2', 'sin(x)', '0.5*x + 3'];

const SAMPLE_IMAGE: ImageSpec = {
	url: 'https://picsum.photos/seed/dafink-aichat/480/320',
	alt: 'A generated illustration',
};

const SAMPLE_AUDIO: AudioSpec = {
	src:   'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
	title: 'Generated audio clip',
};

const PASTA_TABLE: TableSpec = {
	columns: [
		{ key: 'ingredient', label: 'Ingredient' },
		{ key: 'amount',     label: 'Amount' },
	],
	rows: [
		{ ingredient: 'Spaghetti',     amount: '200g' },
		{ ingredient: 'Garlic',        amount: '4 cloves, sliced' },
		{ ingredient: 'Olive oil',     amount: '60ml' },
		{ ingredient: 'Chili flakes',  amount: '1 tsp' },
		{ ingredient: 'Parsley',       amount: '2 tbsp, chopped' },
	],
};

const BENCH_PRESS_LINEPLOT: ChartSpec = {
	xKey:   'week',
	series: [{ key: 'weight', label: 'Bench press (lb)' }],
	data: [
		{ week: 1,  weight: 135 },
		{ week: 3,  weight: 145 },
		{ week: 5,  weight: 150 },
		{ week: 7,  weight: 160 },
		{ week: 9,  weight: 165 },
		{ week: 11, weight: 175 },
	],
};

const WORKOUT_SPLIT_TABLE: TableSpec = {
	columns: [
		{ key: 'day',   label: 'Day' },
		{ key: 'focus', label: 'Focus' },
	],
	rows: [
		{ day: 'Monday',    focus: 'Push (chest, shoulders, triceps)' },
		{ day: 'Tuesday',   focus: 'Pull (back, biceps)' },
		{ day: 'Wednesday', focus: 'Legs' },
		{ day: 'Thursday',  focus: 'Rest' },
		{ day: 'Friday',    focus: 'Full body' },
		{ day: 'Saturday',  focus: 'Optional cardio' },
		{ day: 'Sunday',    focus: 'Rest' },
	],
};

const READING_LIST_TABLE: TableSpec = {
	columns: [
		{ key: 'title', label: 'Title' },
		{ key: 'genre', label: 'Genre' },
		{ key: 'pages', label: 'Pages' },
	],
	rows: [
		{ title: 'Klara and the Sun',  genre: 'Literary fiction', pages: 303 },
		{ title: 'Project Hail Mary',  genre: 'Sci-fi',           pages: 496 },
		{ title: 'Atomic Habits',      genre: 'Non-fiction',      pages: 320 },
	],
};

const INSTALL_SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'Installation — DaFink UI Docs', url: 'https://ui.ryangarfinkel.dev/installation' },
	{ title: 'dafink-ui — npm',                url: 'https://www.npmjs.com/package/dafink-ui' },
	{ title: 'DaFink UI CLI source — GitHub',  url: 'https://github.com/RyanGarfinkel/DaFinkUI/tree/main/packages/cli' },
];

const PASTA_SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'Spaghetti Aglio e Olio Recipe',   url: 'https://www.seriouseats.com/spaghetti-aglio-e-olio-recipe' },
	{ title: 'Aglio e Olio — Bon Appétit',      url: 'https://www.bonappetit.com/recipe/spaghetti-aglio-e-olio' },
	{ title: 'Classic Aglio e Olio — NYT Cooking', url: 'https://cooking.nytimes.com/recipes/1017256-spaghetti-aglio-e-olio' },
];

const WORKOUT_SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'Push Pull Legs: The Complete Guide', url: 'https://www.strongerbyscience.com/push-pull-legs/' },
	{ title: 'PPL Split for Beginners — r/Fitness Wiki', url: 'https://thefitness.wiki/routines/push-pull-legs/' },
	{ title: 'Push/Pull/Legs Split — Bodybuilding.com', url: 'https://www.bodybuilding.com/content/push-pull-legs-split.html' },
];

const READING_SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'The Best Reviewed Books of 2025', url: 'https://www.goodreads.com/list/show/best-books-2025' },
	{ title: '2025 in Books — The New York Times', url: 'https://www.nytimes.com/2025/books/best-books-2025.html' },
	{ title: "NPR's Book Picks for 2025",       url: 'https://www.npr.org/2025/books-we-love' },
];

const INSTALL_MESSAGES: ChatMessage[] = [
	{ id: 1, kind: 'message', sender: 'ai',   text: 'Hi! I’m the DaFink UI assistant. Ask me anything about installing or using components.' },
	{ id: 2, kind: 'message', sender: 'user', text: 'How do I install a component?' },
	{
		id: 3, kind: 'message', sender: 'ai',
		text: 'Run this in your project root — it copies the component source straight into your repo:\n\n```bash\nnpx dafink-ui add button\n```',
		toolCalls: [
			{ id: 't1', kind: 'thought', title: 'Thinking',   detail: 'The user wants the install command — check the CLI docs for the exact syntax before answering.' },
			{ id: 't2', kind: 'search',  title: 'Web search', detail: '"dafink-ui cli install command"', links: INSTALL_SEARCH_LINKS },
			{ id: 't3', kind: 'tool',    title: 'Read file',  detail: 'packages/cli/src/commands/add.ts', result: 'Found the add command implementation' },
		],
	},
	{ id: 4, kind: 'message', sender: 'user', text: 'Does it work with dark mode out of the box?' },
	{ id: 5, kind: 'message', sender: 'ai',   text: 'Yes — every component is built on [design tokens](https://ui.ryangarfinkel.dev/theme), so it adapts automatically to your theme’s light and dark palettes.' },
];

const PASTA_MESSAGES: ChatMessage[] = [
	{ id: 6, kind: 'message', sender: 'user', text: 'What’s a good pasta recipe for a weeknight?' },
	{
		id: 7, kind: 'message', sender: 'ai',
		text: `Here's a quick weeknight pasta you can have on the table in 20 minutes:\n\n\`\`\`table\n${JSON.stringify(PASTA_TABLE)}\n\`\`\``,
		toolCalls: [
			{ id: 'p1', kind: 'search', title: 'Web search', detail: '"quick pasta aglio e olio recipe"', links: PASTA_SEARCH_LINKS },
		],
	},
];

const WORKOUT_MESSAGES: ChatMessage[] = [
	{ id: 8, kind: 'message', sender: 'user', text: 'Can you put together a push day routine for me?' },
	{
		id: 9, kind: 'message', sender: 'ai',
		text: `A simple push/pull/legs split spread across the week looks like this:\n\n\`\`\`table\n${JSON.stringify(WORKOUT_SPLIT_TABLE)}\n\`\`\``,
		toolCalls: [
			{ id: 'w1', kind: 'search', title: 'Web search', detail: '"balanced push pull legs split for beginners"', links: WORKOUT_SEARCH_LINKS },
		],
	},
	{ id: 10, kind: 'message', sender: 'user', text: 'What should my bench press progress look like over the next few months?' },
	{
		id: 11, kind: 'message', sender: 'ai',
		text: `Here's what a realistic bench press progression over a few months could look like:\n\n\`\`\`lineplot\n${JSON.stringify(BENCH_PRESS_LINEPLOT)}\n\`\`\``,
		toolCalls: [
			{ id: 'w2', kind: 'thought', title: 'Thinking', detail: 'No existing log was shared — build an illustrative progression instead of guessing at real numbers.' },
		],
	},
	{ id: 16, kind: 'message', sender: 'user', text: 'Quick one — how do I calculate my BMI?' },
	{
		id: 17, kind: 'message', sender: 'ai',
		text: 'Body Mass Index is your weight divided by your height squared:\n\n$$BMI = \\frac{weight_{kg}}{height_m^2}$$\n\nFor example, at 80 kg and 1.8 m, that\'s $80 / 1.8^2 \\approx 24.7$ — solidly in the "normal weight" range (18.5–24.9). It\'s a rough screening number, not a fitness metric — it doesn\'t account for muscle mass.',
	},
];

const READING_MESSAGES: ChatMessage[] = [
	{ id: 12, kind: 'message', sender: 'user', text: 'Any book recommendations for this fall?' },
	{
		id: 13, kind: 'message', sender: 'ai',
		text: `A few worth picking up next:\n\n\`\`\`table\n${JSON.stringify(READING_LIST_TABLE)}\n\`\`\``,
		toolCalls: [
			{ id: 'rd1', kind: 'search', title: 'Web search', detail: '"best-reviewed books 2025"', links: READING_SEARCH_LINKS },
		],
	},
];

const PLANNING_MESSAGES: ChatMessage[] = [
	{ id: 14, kind: 'message', sender: 'user', text: 'Can you help me plan something new to try this week?' },
	{
		id: 15, kind: 'message', sender: 'ai',
		text: 'Happy to help — first, what should we focus on?',
		questionnaire: {
			type:        'radio',
			question:    'What should we focus on?',
			description: 'Pick a direction, or describe something else.',
			options: [
				{ id: 'cooking', label: 'Cooking', description: 'A new recipe to try this week' },
				{ id: 'gym',     label: 'Fitness',  description: 'A workout plan to follow' },
				{ id: 'reading', label: 'Reading',  description: 'Something new to read' },
			],
			otherPlaceholder: 'Describe something else…',
		},
	},
];

const INSTALL_THREAD_REFS: ThreadRef[] = [
	{ id: 'thread-install-1', rootMessageId: 3, snippet: 'Run this in your project root — it copies…', createdAt: '2 days ago', replyCount: 2 },
	{ id: 'thread-install-2', rootMessageId: 5, snippet: 'Yes — every component is built on design t…', createdAt: '1 day ago', replyCount: 2 },
];

const WORKOUT_THREAD_REFS: ThreadRef[] = [
	{ id: 'thread-workout-1', rootMessageId: 9, snippet: 'A simple push/pull/legs split spread across…', createdAt: '3 hours ago', replyCount: 3 },
];

const THREAD_MESSAGES: Record<string, ChatMessage[]> = {
	'thread-install-1': [
		{ id: 201, kind: 'message', sender: 'user', text: 'Does the CLI work with pnpm or yarn too, or only npm?' },
		{ id: 202, kind: 'message', sender: 'ai',   text: 'Yep — `npx` is just npm’s package runner; pnpm and yarn both ship an equivalent (`pnpm dlx dafink-ui add button`, `yarn dlx dafink-ui add button`), so pick whichever your project already uses.' },
	],
	'thread-install-2': [
		{ id: 203, kind: 'message', sender: 'user', text: 'Can I swap the accent color without touching every component?' },
		{ id: 204, kind: 'message', sender: 'ai',   text: 'Yes — change the `--color-brand` token in your `globals.css` and every component using `bg-brand`/`text-brand` picks it up automatically, no per-component edits needed.' },
	],
	'thread-workout-1': [
		{ id: 205, kind: 'message', sender: 'user', text: 'How long should I rest between sets on push day?' },
		{ id: 206, kind: 'message', sender: 'ai',   text: 'For compound lifts (bench, overhead press) aim for 2–3 minutes; for isolation work (lateral raises, triceps pushdowns) 60–90 seconds is plenty.' },
		{ id: 207, kind: 'message', sender: 'user', text: 'Good to know, thanks.' },
	],
};

const THREAD_FETCH_DELAY_MS = 600;

const fetchThread = (threadId: string): Promise<ChatMessage[]> =>
	new Promise((resolve) => {
		setTimeout(() => resolve(THREAD_MESSAGES[threadId] ?? []), THREAD_FETCH_DELAY_MS);
	});

const INITIAL_CHATS: ChatEntry[] = [
	{ id: '1', title: 'Installing components',   messages: INSTALL_MESSAGES,  threadRefs: INSTALL_THREAD_REFS },
	{ id: '2', title: 'Weeknight pasta ideas',   messages: PASTA_MESSAGES,    threadRefs: [] },
	{ id: '3', title: 'Push day workout plan',   messages: WORKOUT_MESSAGES,  threadRefs: WORKOUT_THREAD_REFS },
	{ id: '4', title: 'Books to read this fall', messages: READING_MESSAGES,  threadRefs: [] },
	{ id: '5', title: 'Something new this week', messages: PLANNING_MESSAGES, threadRefs: [] },
];

const COMMANDS: CommandOption[] = [
	{ name: 'compact',    description: 'Summarize this conversation to save space' },
	{ name: 'clear',      description: 'Clear all messages in this chat' },
	{ name: 'rename',     description: 'Rename this chat' },
	{ name: 'plot',       description: 'Show a sample line chart: median home prices over the years' },
	{ name: 'barchart',   description: 'Show a sample bar chart: npm downloads by month' },
	{ name: 'areachart',  description: 'Show a sample area chart: pages read per week' },
	{ name: 'donutchart', description: 'Show a sample donut chart: workout split breakdown' },
	{ name: 'radarchart', description: 'Show a sample radar chart: fitness category scores' },
	{ name: 'math',       description: 'Show a sample math block: plot a few equations' },
	{ name: 'formula',    description: 'Show a sample math formula: the quadratic formula' },
	{ name: 'image',      description: 'Generate a sample image (shows a loading skeleton first)' },
	{ name: 'audio',      description: 'Generate a sample audio clip (shows a loading skeleton first)' },
];

const PlusIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M12 5v14M5 12h14' />
	</svg>
);

const PencilIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
	</svg>
);

const TrashIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6' />
	</svg>
);

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

const CloseIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M18 6 6 18M6 6l12 12' />
	</svg>
);

const ReplyIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='9 14 4 9 9 4' />
		<path d='M20 20v-7a4 4 0 0 0-4-4H4' />
	</svg>
);

const CopyIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
		<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
	</svg>
);

const CheckIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

const SearchIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<circle cx='11' cy='11' r='8' />
		<path d='m21 21-4.35-4.35' />
	</svg>
);

// Calls your own API route (or a direct call to your model provider) with the user's
// message and the conversation history, and returns the assistant's reply. Everything
// downstream (typing indicator, streaming reveal, tool-call trace, table/chart rendering)
// keeps working unchanged as long as this keeps returning { text, toolCalls? }.
const sendMessage = async (message: string, history: AiChatHistoryMessage[]): Promise<AiChatReply> => {
	const res = await fetch('/api/ai-chat', {
		method:  'POST',
		headers: { 'Content-Type': 'application/json' },
		body:    JSON.stringify({ message, history }),
	});
	if(!res.ok) throw new Error('Failed to fetch AI reply');
	return res.json();
};

const buildHistory = (messages: ChatMessage[]): AiChatHistoryMessage[] =>
	messages
		.filter((m): m is ChatTextMessage => m.kind === 'message')
		.map((m) => ({ role: m.sender === 'user' ? 'user' as const : 'assistant' as const, text: m.text }));

const NEAR_BOTTOM_THRESHOLD_PX = 80;

const Divider = ({ label }: { label: string }) => (
	<div className='flex items-center gap-3'>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
		<span className='shrink-0 text-xs font-medium text-text-muted'>{label}</span>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
	</div>
);

interface ThreadIndicatorProps {
	align:      'start' | 'end';
	messageId:  number;
	text:       string;
	threadRef:  ThreadRef | undefined;
	replyCount: number;
	loading:    boolean;
	onReply:    () => void;
}

const HOVER_ACTION_BUTTON_CLASSES = 'flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] group-hover:opacity-100 focus-visible:opacity-100 hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring';

// Hover/focus-revealed, same reveal behavior as the reply trigger next to it regardless of
// whether a thread exists yet — copying is a lightweight secondary action, not something
// that needs to stay pinned open like the reply-count badge does.
const CopyMessageButton = ({ text }: { text: string }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try
		{
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
		catch
		{
			// clipboard unavailable, silently ignore
		}
	};

	return (
		<Tooltip content={copied ? 'Copied' : 'Copy'}>
			<button
				type='button'
				aria-label={copied ? 'Copied' : 'Copy message'}
				onClick={handleCopy}
				className={HOVER_ACTION_BUTTON_CLASSES}
			>
				{copied ? <CheckIcon /> : <CopyIcon />}
			</button>
		</Tooltip>
	);
};

// Hover/focus-revealed reply trigger on a message with no thread yet; an always-visible
// reply-count badge once one exists. The trigger stays in the tab order (opacity-0, not
// hidden), so it's reachable and reveals itself on its own focus-visible even though the
// row wasn't hovered. Identified by a plain DOM id (not a ref) so closing a thread can
// hand focus back with a simple document.getElementById lookup — the same approach
// CommandPalette already uses for its active-option scroll-into-view.
// The hover-only copy button always sits on the outside (away from the bubble), with the
// reply control (badge or hover icon) flush against the bubble edge — otherwise the copy
// button's reserved layout space (it's opacity-0, not hidden, to stay keyboard-reachable)
// would push the reply control away from that edge whenever the row isn't hovered.
const ThreadIndicator = ({ align, messageId, text, threadRef, replyCount, loading, onReply }: ThreadIndicatorProps) => {
	const copyButton = <CopyMessageButton text={text} />;

	// A thread with zero replies (just started, nobody's answered yet) has nothing worth
	// badging — fall back to the same hover-revealed trigger a message with no thread gets.
	const replyControl = threadRef && (loading || replyCount > 0) ? (
		<button
			id={`thread-trigger-${messageId}`}
			type='button'
			onClick={onReply}
			className='inline-flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
		>
			<Badge variant='outline' className='gap-1 text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:border-surface-border-hover hover:text-text'>
				<ReplyIcon />
				{loading ? 'Loading…' : `${replyCount} message${replyCount === 1 ? '' : 's'}`}
			</Badge>
		</button>
	) : (
		<button
			id={`thread-trigger-${messageId}`}
			type='button'
			aria-label='Reply in thread'
			onClick={onReply}
			className={HOVER_ACTION_BUTTON_CLASSES}
		>
			<ReplyIcon />
		</button>
	);

	return (
		<div className={['flex w-full items-center gap-1', align === 'end' ? 'justify-end' : 'justify-start'].join(' ')}>
			{align === 'end' ? (
				<>
					{copyButton}
					{replyControl}
				</>
			) : (
				<>
					{replyControl}
					{copyButton}
				</>
			)}
		</div>
	);
};

interface ChatMessageRowProps {
	message:               ChatMessage;
	onStreamComplete:      (messageId: number) => void;
	onQuestionnaireAnswer: (messageId: number, value: string) => void;
	renderTrailing?:       (m: ChatTextMessage) => ReactNode;
}

// Shared by the main pane and ThreadPanel: a thread is just another list of the same
// ChatMessage shape, so the bubble/tool-call/questionnaire/streaming rendering only
// needs to live once. The streaming-complete guard (is this still the active streaming
// message?) lives in each pane's own onStreamComplete, since the main pane and an open
// thread stream independently of each other. `renderTrailing` is only supplied by the
// main pane, to slot the reply-in-thread trigger under each row.
const ChatMessageRow = ({ message: m, onStreamComplete, onQuestionnaireAnswer, renderTrailing }: ChatMessageRowProps) => {
	if(m.kind === 'checkpoint') return <Divider label={m.label} />;

	if(m.sender === 'user') {
		return (
			<div className='group flex flex-col items-end gap-1.5'>
				{m.attachment && <Attachment name={m.attachment.name} size={m.attachment.size} />}
				{m.text && <Message variant='sent'>{m.text}</Message>}
				{renderTrailing?.(m)}
			</div>
		);
	}

	return (
		<div className='group flex flex-col gap-1.5'>
			{m.toolCalls && <ToolCallTrace toolCalls={m.toolCalls} />}
			<Message variant='received' bubble={false}>
				{m.generating === 'image' ? (
					<SkeletonImage aspectRatio='4/3' className='w-full max-w-xs' />
				) : m.generating === 'audio' ? (
					<div className='flex w-56 items-center gap-2'>
						<Skeleton className='h-9 w-9 shrink-0 rounded-full' />
						<Skeleton className='h-2 flex-1 rounded-full' />
					</div>
				) : (
					<StreamingMessage
						text={m.text}
						streaming={!!m.animate}
						onComplete={() => onStreamComplete(m.id)}
					/>
				)}
			</Message>
			{m.questionnaire && (
				<Questionnaire
					step={m.questionnaire}
					answer={m.questionnaireAnswer}
					onAnswer={(value) => onQuestionnaireAnswer(m.id, value)}
				/>
			)}
			{renderTrailing?.(m)}
		</div>
	);
};

export const AiChat = () => {
	const [chats, setChats] = useState<ChatEntry[]>(INITIAL_CHATS);
	const [activeId, setActiveId] = useState<string | null>(INITIAL_CHATS[0].id);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draftTitle, setDraftTitle] = useState('');
	const [draft, setDraft] = useState('');
	const [attachedFile, setAttachedFile] = useState<File | null>(null);
	const [typingChatId, setTypingChatId] = useState<string | null>(null);
	const [streamingChatId, setStreamingChatId] = useState<string | null>(null);
	const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
	const [chatPendingDeletion, setChatPendingDeletion] = useState<ChatEntry | null>(null);
	const [threadMessages, setThreadMessages] = useState<Record<string, ChatMessage[]>>({});
	const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
	const [activeThread, setActiveThread] = useState<{ chatId: string; threadId: string; rootMessageId: number } | null>(null);
	const [threadDraft, setThreadDraft] = useState('');
	const [threadTypingId, setThreadTypingId] = useState<string | null>(null);
	const [threadStreamingId, setThreadStreamingId] = useState<string | null>(null);
	const [threadStreamingMessageId, setThreadStreamingMessageId] = useState<number | null>(null);
	const [threadSearchOpen, setThreadSearchOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const nextChatId = useRef(INITIAL_CHATS.length + 1);
	const nextThreadId = useRef(1);
	const nextMessageId = useRef(
		INSTALL_MESSAGES.length + PASTA_MESSAGES.length + WORKOUT_MESSAGES.length + READING_MESSAGES.length + PLANNING_MESSAGES.length + 1
	);
	const pendingReplyRef = useRef(0);
	const pendingThreadReplyRef = useRef(0);
	// True as long as the user hasn't scrolled away from the bottom. Auto-scroll (below)
	// only acts while this is true, so reading back through history — including while a
	// reply is still streaming in — never gets yanked back down. Reset to true whenever
	// the user does something that should re-anchor the view (send a message, switch chats).
	const shouldAutoScrollRef = useRef(true);

	const activeChat = chats.find((c) => c.id === activeId) ?? null;
	const isTyping = typingChatId === activeId;
	const isGenerating = isTyping || streamingChatId === activeId;
	const isThreadGenerating = activeThread !== null && (threadTypingId === activeThread.threadId || threadStreamingId === activeThread.threadId);
	const isThreadTyping = activeThread !== null && threadTypingId === activeThread.threadId;

	useEffect(() => {
		const container = containerRef.current;
		const content   = contentRef.current;
		if(!container || !content) return;

		const handleScroll = () => {
			const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
			shouldAutoScrollRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
		};
		container.addEventListener('scroll', handleScroll, { passive: true });

		const scrollToBottom = () => {
			if(shouldAutoScrollRef.current) container.scrollTop = container.scrollHeight;
		};
		scrollToBottom();

		// Content keeps growing for as long as a reply streams in (typewriter reveal, table
		// rows appending, favicon images loading), so this stays observing for the effect's
		// whole lifetime rather than a fixed window — safe to leave running indefinitely
		// since scrollToBottom above already no-ops once the user has scrolled away.
		const observer = new ResizeObserver(scrollToBottom);
		observer.observe(content);

		return () => {
			container.removeEventListener('scroll', handleScroll);
			observer.disconnect();
		};
	}, [chats, isTyping, activeId]);

	useEffect(() => {
		return () => { pendingReplyRef.current++; pendingThreadReplyRef.current++; };
	}, []);

	const handleNewChat = () => {
		const chat: ChatEntry = { id: String(nextChatId.current++), title: 'New chat', messages: [], threadRefs: [] };
		shouldAutoScrollRef.current = true;
		setChats((prev) => [chat, ...prev]);
		setActiveId(chat.id);
		setDraft('');
		setAttachedFile(null);
	};

	const handleSelectChat = (id: string) => {
		shouldAutoScrollRef.current = true;
		setActiveId(id);
		setDraft('');
		setAttachedFile(null);
	};

	const handleStartEdit = (chat: ChatEntry) => {
		setEditingId(chat.id);
		setDraftTitle(chat.title);
	};

	const handleCommitEdit = () => {
		const title = draftTitle.trim();
		if(title) setChats((prev) => prev.map((c) => (c.id === editingId ? { ...c, title } : c)));
		setEditingId(null);
	};

	const handleCancelEdit = () => setEditingId(null);

	const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if(e.key === 'Enter') { e.preventDefault(); handleCommitEdit(); }
		if(e.key === 'Escape') { e.preventDefault(); handleCancelEdit(); }
	};

	const handleDelete = (id: string) => {
		setChats((prev) => {
			const next = prev.filter((c) => c.id !== id);
			if(activeId === id) setActiveId(next[0]?.id ?? null);
			return next;
		});
		if(editingId === id) setEditingId(null);
	};

	const handleDeleteOpenChange = (open: boolean) => {
		if(!open) setChatPendingDeletion(null);
	};

	const handleConfirmDelete = () => {
		if(!chatPendingDeletion) return;
		handleDelete(chatPendingDeletion.id);
		setChatPendingDeletion(null);
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if(file) setAttachedFile(file);
		e.target.value = '';
	};

	const queueAiReply = (chatId: string, message: string, history: AiChatHistoryMessage[]) => {
		setTypingChatId(chatId);
		const requestId = ++pendingReplyRef.current;

		sendMessage(message, history)
			.then((reply) => {
				if(pendingReplyRef.current !== requestId) return;
				setTypingChatId((prev) => (prev === chatId ? null : prev));
				const aiMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: reply.text, animate: true, toolCalls: reply.toolCalls };
				setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, aiMessage] } : c)));
				setStreamingChatId(chatId);
				setStreamingMessageId(aiMessage.id);
			})
			.catch(() => {
				if(pendingReplyRef.current !== requestId) return;
				setTypingChatId((prev) => (prev === chatId ? null : prev));
				const errorMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: 'Something went wrong — try sending that again.' };
				setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, errorMessage] } : c)));
			});
	};

	const handleStop = () => {
		if(typingChatId)
		{
			pendingReplyRef.current++;
			setTypingChatId(null);
			return;
		}
		if(streamingChatId && streamingMessageId !== null)
		{
			const chatId    = streamingChatId;
			const messageId = streamingMessageId;
			setChats((prev) => prev.map((c) => (c.id !== chatId ? c : {
				...c,
				messages: c.messages.map((m) => (m.kind === 'message' && m.id === messageId
					? { ...m, animate: false }
					: m
				)),
			})));
			setStreamingChatId(null);
			setStreamingMessageId(null);
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if(!activeChat || isGenerating) return;
		const text = draft.trim();
		if(!text && !attachedFile) return;

		const chatId = activeChat.id;
		const attachment: MessageAttachment | undefined = attachedFile
			? { name: attachedFile.name, size: `${Math.max(1, Math.round(attachedFile.size / 1024))} KB` }
			: undefined;
		const history = buildHistory(activeChat.messages);
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text, attachment };
		shouldAutoScrollRef.current = true;
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, userMessage] } : c)));
		setDraft('');
		setAttachedFile(null);
		queueAiReply(chatId, text, history);
	};

	const handleQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeChat || !value.trim()) return;
		const chatId = activeChat.id;
		const history = buildHistory(activeChat.messages);
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text: value };
		shouldAutoScrollRef.current = true;
		setChats((prev) => prev.map((c) => {
			if(c.id !== chatId) return c;
			const updated = c.messages.map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, questionnaireAnswer: value } : m));
			return { ...c, messages: [...updated, userMessage] };
		}));
		queueAiReply(chatId, value, history);
	};

	const handleMainStreamComplete = (messageId: number) => {
		if(messageId !== streamingMessageId) return;
		setChats((prev) => prev.map((c) => (c.id !== streamingChatId ? c : {
			...c,
			messages: c.messages.map((msg) => (msg.kind === 'message' && msg.id === messageId ? { ...msg, animate: false } : msg)),
		})));
		setStreamingChatId(null);
		setStreamingMessageId(null);
	};

	const getThreadRootHistory = (chatId: string, rootMessageId: number): ChatMessage[] => {
		const chat = chats.find((c) => c.id === chatId);
		if(!chat) return [];
		const rootIndex = chat.messages.findIndex((m) => m.id === rootMessageId);
		return rootIndex === -1 ? chat.messages : chat.messages.slice(0, rootIndex + 1);
	};

	// Display-only: the thread panel shows just the message the thread branched from, not
	// the whole conversation up to that point. Reply generation still needs the full history
	// (getThreadRootHistory above) so the assistant keeps that context.
	const getThreadRootMessage = (chatId: string, rootMessageId: number): ChatMessage[] => {
		const chat = chats.find((c) => c.id === chatId);
		const rootMessage = chat?.messages.find((m) => m.id === rootMessageId);
		return rootMessage ? [rootMessage] : [];
	};

	const handleOpenThread = (chatId: string, threadId: string, rootMessageId: number) => {
		setActiveThread({ chatId, threadId, rootMessageId });
		if(activeId !== chatId) setActiveId(chatId);
		setThreadDraft('');
		setThreadSearchOpen(false);
		if(threadMessages[threadId]) return;
		setLoadingThreadId(threadId);
		fetchThread(threadId).then((messages) => {
			setThreadMessages((prev) => ({ ...prev, [threadId]: messages }));
			setLoadingThreadId((prev) => (prev === threadId ? null : prev));
		});
	};

	const handleStartThread = (chatId: string, rootMessageId: number) => {
		const chat = chats.find((c) => c.id === chatId);
		const rootMessage = chat?.messages.find((m) => m.id === rootMessageId);
		const snippet = rootMessage && rootMessage.kind === 'message' ? rootMessage.text.replace(/\s+/g, ' ').trim().slice(0, 60) : 'New thread';
		const threadId = `thread-new-${nextThreadId.current++}`;
		const threadRef: ThreadRef = { id: threadId, rootMessageId, snippet, createdAt: 'Just now', replyCount: 0 };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, threadRefs: [...c.threadRefs, threadRef] } : c)));
		setThreadMessages((prev) => ({ ...prev, [threadId]: [] }));
		setActiveThread({ chatId, threadId, rootMessageId });
		setThreadDraft('');
	};

	const handleCloseThread = () => {
		const rootMessageId = activeThread?.rootMessageId;
		setActiveThread(null);
		if(rootMessageId !== undefined) document.getElementById(`thread-trigger-${rootMessageId}`)?.focus();
	};

	const queueThreadReply = (threadId: string, message: string, history: AiChatHistoryMessage[]) => {
		setThreadTypingId(threadId);
		const requestId = ++pendingThreadReplyRef.current;

		sendMessage(message, history)
			.then((reply) => {
				if(pendingThreadReplyRef.current !== requestId) return;
				setThreadTypingId((prev) => (prev === threadId ? null : prev));
				const aiMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: reply.text, animate: true, toolCalls: reply.toolCalls };
				setThreadMessages((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), aiMessage] }));
				setThreadStreamingId(threadId);
				setThreadStreamingMessageId(aiMessage.id);
			})
			.catch(() => {
				if(pendingThreadReplyRef.current !== requestId) return;
				setThreadTypingId((prev) => (prev === threadId ? null : prev));
				const errorMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: 'Something went wrong — try sending that again.' };
				setThreadMessages((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), errorMessage] }));
			});
	};

	const handleThreadStop = () => {
		if(!activeThread) return;
		const { threadId } = activeThread;
		if(threadTypingId === threadId)
		{
			pendingThreadReplyRef.current++;
			setThreadTypingId(null);
			return;
		}
		if(threadStreamingId === threadId && threadStreamingMessageId !== null)
		{
			const messageId = threadStreamingMessageId;
			setThreadMessages((prev) => ({
				...prev,
				[threadId]: (prev[threadId] ?? []).map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, animate: false } : m)),
			}));
			setThreadStreamingId(null);
			setThreadStreamingMessageId(null);
		}
	};

	const handleThreadSubmit = (e: FormEvent) => {
		e.preventDefault();
		if(!activeThread || isThreadGenerating) return;
		const text = threadDraft.trim();
		if(!text) return;

		const { chatId, threadId, rootMessageId } = activeThread;
		const rootHistory = getThreadRootHistory(chatId, rootMessageId);
		const history = [...buildHistory(rootHistory), ...buildHistory(threadMessages[threadId] ?? [])];
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text };
		setThreadMessages((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), userMessage] }));
		setThreadDraft('');
		queueThreadReply(threadId, text, history);
	};

	const handleThreadStreamComplete = (messageId: number) => {
		if(!activeThread || messageId !== threadStreamingMessageId) return;
		const threadId = activeThread.threadId;
		setThreadMessages((prev) => ({
			...prev,
			[threadId]: (prev[threadId] ?? []).map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, animate: false } : m)),
		}));
		setThreadStreamingId(null);
		setThreadStreamingMessageId(null);
	};

	const handleThreadQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeThread || !value.trim()) return;
		const { chatId, threadId, rootMessageId } = activeThread;
		const rootHistory = getThreadRootHistory(chatId, rootMessageId);
		const existing = threadMessages[threadId] ?? [];
		const history = [...buildHistory(rootHistory), ...buildHistory(existing)];
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text: value };
		setThreadMessages((prev) => {
			const current = prev[threadId] ?? [];
			const updated = current.map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, questionnaireAnswer: value } : m));
			return { ...prev, [threadId]: [...updated, userMessage] };
		});
		queueThreadReply(threadId, value, history);
	};

	const pushAiMessage = (chatId: string, text: string) => {
		const message: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, message] } : c)));
	};

	const pushGeneratingMessage = (chatId: string, generating: 'image' | 'audio', text: string, delay: number) => {
		const id = nextMessageId.current++;
		const message: ChatMessage = { id, kind: 'message', sender: 'ai', text: '', generating };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, message] } : c)));

		setTimeout(() => {
			setChats((prev) => prev.map((c) => (
				c.id !== chatId ? c : {
					...c,
					messages: c.messages.map((m) => (m.kind === 'message' && m.id === id ? { ...m, generating: undefined, text } : m)),
				}
			)));
		}, delay);
	};

	const handleCommand = (command: CommandOption) => {
		if(!activeChat) return;
		const chatId = activeChat.id;

		const commandMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text: `/${command.name}` };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, commandMessage] } : c)));

		switch(command.name)
		{
			case 'compact': {
				const count = activeChat.messages.length;
				if(count === 0) return;
				const checkpoint: ChatMessage = {
					id:    nextMessageId.current++,
					kind:  'checkpoint',
					label: `Compacted · ${count} message${count === 1 ? '' : 's'} summarized`,
				};
				setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, checkpoint] } : c)));
				break;
			}

			case 'clear':
				setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [] } : c)));
				break;

			case 'rename':
				handleStartEdit(activeChat);
				break;

			case 'plot':
				pushAiMessage(chatId, `Here's the trend in median home prices over the last several years:\n\n\`\`\`lineplot\n${JSON.stringify(HOME_PRICE_LINEPLOT)}\n\`\`\``);
				break;

			case 'barchart':
				pushAiMessage(chatId, `Here's npm downloads by month:\n\n\`\`\`barchart\n${JSON.stringify(DOWNLOADS_BARCHART)}\n\`\`\``);
				break;

			case 'areachart':
				pushAiMessage(chatId, `Here's pages read per week:\n\n\`\`\`areachart\n${JSON.stringify(READING_PACE_AREACHART)}\n\`\`\``);
				break;

			case 'donutchart':
				pushAiMessage(chatId, `Here's how a weekly workout split breaks down:\n\n\`\`\`donutchart\n${JSON.stringify(WORKOUT_SPLIT_DONUTCHART)}\n\`\`\``);
				break;

			case 'radarchart':
				pushAiMessage(chatId, `Here's a fitness category breakdown for this month:\n\n\`\`\`radarchart\n${JSON.stringify(FITNESS_RADARCHART)}\n\`\`\``);
				break;

			case 'math':
				pushAiMessage(chatId, `Here are a few equations plotted together:\n\n\`\`\`math\n${JSON.stringify({ equations: SAMPLE_EQUATIONS })}\n\`\`\``);
				break;

			case 'formula':
				pushAiMessage(chatId, 'The quadratic formula, for solving $ax^2 + bx + c = 0$:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$');
				break;

			case 'image':
				pushGeneratingMessage(
					chatId,
					'image',
					`Here's the image:\n\n\`\`\`image\n${JSON.stringify(SAMPLE_IMAGE)}\n\`\`\``,
					1800
				);
				break;

			case 'audio':
				pushGeneratingMessage(
					chatId,
					'audio',
					`Here's the audio clip:\n\n\`\`\`audio\n${JSON.stringify(SAMPLE_AUDIO)}\n\`\`\``,
					1800
				);
				break;
		}
	};

	const renderThreadMessage = (m: ChatMessage) => (
		<ChatMessageRow
			key={m.id}
			message={m}
			onStreamComplete={handleThreadStreamComplete}
			onQuestionnaireAnswer={handleThreadQuestionnaireAnswer}
		/>
	);

	return (
		<div className='w-full'>
			<div className='flex h-[32rem] w-full max-w-6xl overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border'>
				<Sidebar width='w-64' height='h-full'>
					<SidebarHeader>
						<div className='flex w-full gap-1.5'>
							<Button variant='outlined' size='sm' className='flex-1 justify-center gap-1.5' onClick={handleNewChat}>
								<PlusIcon />
								New chat
							</Button>
							<Button variant='outlined' size='icon' aria-label='Search threads' onClick={() => setThreadSearchOpen(true)}>
								<SearchIcon />
							</Button>
						</div>
					</SidebarHeader>
					<SidebarSection label='Chats'>
						{chats.map((chat) => (
							editingId === chat.id ? (
								<Input
									key={chat.id}
									autoFocus
									value={draftTitle}
									onChange={(e) => setDraftTitle(e.target.value)}
									onBlur={handleCommitEdit}
									onKeyDown={handleEditKeyDown}
									aria-label='Chat title'
								/>
							) : (
								<SidebarButton
									key={chat.id}
									isActive={activeId === chat.id}
									onClick={() => handleSelectChat(chat.id)}
									actionGutter='pr-16'
									action={
										<div className='flex items-center gap-0.5'>
											<button
												type='button'
												aria-label={`Rename ${chat.title}`}
												onClick={() => handleStartEdit(chat)}
												className='flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
											>
												<PencilIcon />
											</button>
											<button
												type='button'
												aria-label={`Delete ${chat.title}`}
												onClick={() => setChatPendingDeletion(chat)}
												className='flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
											>
												<TrashIcon />
											</button>
										</div>
									}
								>
									{chat.title}
								</SidebarButton>
							)
						))}
						{chats.length === 0 && (
							<p className='px-3 py-2 text-xs text-text-muted'>No chats yet.</p>
						)}
					</SidebarSection>
				</Sidebar>

				<Resizable direction='horizontal' className='flex-1 min-w-0'>
					<ResizablePanel minSize={280} className='flex'>
						<div className='flex flex-1 flex-col'>
							{activeChat ? (
								<>
									<div className='border-b-[length:var(--border-width)] border-surface-border px-4 py-3'>
										<h3 className='text-base font-semibold text-text'>{activeChat.title}</h3>
									</div>
									<div className='relative flex min-h-0 flex-1 flex-col'>
										<ScrollFade ref={containerRef} direction='vertical' className='h-full' wrapperClassName='min-h-0 flex-1'>
											<div ref={contentRef} className='flex min-h-full shrink-0 flex-col gap-4 p-5 pb-28'>
												{activeChat.messages.length === 0 ? (
													<div className='flex flex-1 flex-col items-center justify-center gap-1.5 text-center'>
														<p className='font-serif text-2xl italic text-text'>Welcome back</p>
														<p className='text-sm text-text-muted'>Send a message to start the conversation.</p>
													</div>
												) : (
													<>
														<Divider label='Conversation starts here' />
														{activeChat.messages.map((m) => (
															<ChatMessageRow
																key={m.id}
																message={m}
																onStreamComplete={handleMainStreamComplete}
																onQuestionnaireAnswer={handleQuestionnaireAnswer}
																renderTrailing={(msg) => {
																	const threadRef = activeChat.threadRefs.find((t) => t.rootMessageId === msg.id);
																	return (
																		<ThreadIndicator
																			align={msg.sender === 'user' ? 'end' : 'start'}
																			messageId={msg.id}
																			text={msg.text}
																			threadRef={threadRef}
																			replyCount={threadRef ? (threadMessages[threadRef.id]?.length ?? threadRef.replyCount) : 0}
																			loading={threadRef ? loadingThreadId === threadRef.id : false}
																			onReply={() => (threadRef
																				? handleOpenThread(activeChat.id, threadRef.id, msg.id)
																				: handleStartThread(activeChat.id, msg.id)
																			)}
																		/>
																	);
																}}
															/>
														))}
													</>
												)}
												{isTyping && (
													<p className='text-xs text-text-muted'>Assistant is typing…</p>
												)}
											</div>
										</ScrollFade>
										<div className='absolute inset-x-0 bottom-0 p-4'>
											<form onSubmit={handleSubmit} className='flex w-full flex-col items-center gap-2'>
												{attachedFile && (
													<div className='flex w-full max-w-md items-center gap-2'>
														<Attachment name={attachedFile.name} size={`${Math.max(1, Math.round(attachedFile.size / 1024))} KB`} />
														<Button type='button' variant='ghost' size='icon-sm' aria-label='Remove attachment' onClick={() => setAttachedFile(null)}>
															<CloseIcon />
														</Button>
													</div>
												)}
												<div className='flex w-full max-w-md items-center gap-1.5 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-1.5 shadow-[var(--shadow-lg)]'>
													<input
														ref={fileInputRef}
														type='file'
														onChange={handleFileChange}
														className='hidden'
														tabIndex={-1}
														aria-hidden='true'
													/>
													<Button type='button' variant='ghost' size='icon' aria-label='Attach file' disabled={isGenerating} onClick={() => fileInputRef.current?.click()}>
														<PaperclipIcon />
													</Button>
													<CommandInput
														className='min-w-0 flex-1'
														value={draft}
														onChange={setDraft}
														commands={COMMANDS}
														onCommand={handleCommand}
														placeholder='Message… (try /compact)'
														aria-label='Message'
														disabled={isGenerating}
													/>
													{isGenerating ? (
														<Button type='button' size='icon' aria-label='Stop generating' onClick={handleStop}>
															<StopIcon />
														</Button>
													) : (
														<Button type='submit' size='icon' className='group' aria-label='Send message' disabled={!draft.trim() && !attachedFile}>
															<SendIcon />
														</Button>
													)}
												</div>
											</form>
										</div>
									</div>
								</>
							) : (
								<div className='flex flex-1 items-center justify-center p-6 text-center'>
									<p className='text-sm text-text-muted'>Select or start a chat to begin.</p>
								</div>
							)}
						</div>
					</ResizablePanel>

				{activeThread && activeChat && (
					<>
						<ResizableHandle aria-label='Resize thread panel' />
						<ResizablePanel defaultSize={320} minSize={240} maxSize={480} className='flex'>
							<ThreadPanel
								title={activeChat.title}
								rootMessages={getThreadRootMessage(activeThread.chatId, activeThread.rootMessageId)}
								threadMessages={threadMessages[activeThread.threadId] ?? []}
								loading={loadingThreadId === activeThread.threadId}
								draft={threadDraft}
								onDraftChange={setThreadDraft}
								onSubmit={handleThreadSubmit}
								isGenerating={isThreadGenerating}
								isTyping={isThreadTyping}
								onStop={handleThreadStop}
								renderMessage={renderThreadMessage}
								onClose={handleCloseThread}
							/>
						</ResizablePanel>
					</>
				)}
				</Resizable>
			</div>

			<Modal open={chatPendingDeletion !== null} onOpenChange={handleDeleteOpenChange}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>Delete chat</ModalTitle>
				</ModalHeader>
				<ModalContent>
					{`Delete "${chatPendingDeletion?.title}"? This can't be undone.`}
				</ModalContent>
				<ModalFooter>
					<Button variant='secondary' onClick={() => setChatPendingDeletion(null)}>Cancel</Button>
					<Button variant='destructive' onClick={handleConfirmDelete}>Delete</Button>
				</ModalFooter>
			</Modal>

			<CommandPalette open={threadSearchOpen} onClose={() => setThreadSearchOpen(false)} placeholder='Search threads…'>
				{chats.filter((c) => c.threadRefs.length > 0).map((chat) => (
					<CommandGroup key={chat.id} label={chat.title}>
						{chat.threadRefs.map((ref) => (
							<CommandItem
								key={ref.id}
								value={ref.snippet}
								icon={<ReplyIcon />}
								onSelect={() => handleOpenThread(chat.id, ref.id, ref.rootMessageId)}
							>
								{`${ref.snippet} · ${ref.createdAt}`}
							</CommandItem>
						))}
					</CommandGroup>
				))}
			</CommandPalette>
		</div>
	);
};

export default AiChat;
