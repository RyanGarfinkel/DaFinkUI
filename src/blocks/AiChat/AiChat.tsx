'use client';

import { LineChart, BarChart, AreaChart, DonutChart, RadarChart, type ChartSeries, type DonutSlice } from '../../components/Charts/Charts';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../components/Modal/Modal';
import { Sidebar, SidebarButton, SidebarHeader, SidebarSection } from '../../components/Sidebar/Sidebar';
import CommandInput, { type CommandOption } from '../../components/CommandInput/CommandInput';
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import ToolCallTrace, { type ToolCallEntry, type ToolCallLink } from './ToolCallTrace';
import FunctionPlotter from '../../components/FunctionPlotter/FunctionPlotter';
import { Skeleton, SkeletonImage } from '../../components/Skeleton/Skeleton';
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer';
import QuestionCard, { type QuestionStep } from './QuestionCard';
import ScrollFade from '../../components/ScrollFade/ScrollFade';
import Typewriter from '../../components/Typewriter/Typewriter';
import Attachment from '../../components/Attachment/Attachment';
import Message from '../../components/Message/Message';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import ChatMarkdown from './ChatMarkdown';

interface MessageAttachment {
	name: string;
	size: string;
}

interface ChatTextMessage {
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

type ChatMessage = ChatTextMessage | ChatCheckpoint;

interface ChartSpec {
	xKey:   string;
	series: ChartSeries[];
	data:   Record<string, string | number>[];
}

interface StackableChartSpec extends ChartSpec {
	stacked?: boolean;
}

interface DonutSpec {
	data: DonutSlice[];
}

interface MathSpec {
	equations: string[];
}

interface ImageSpec {
	url: string;
	alt: string;
}

interface AudioSpec {
	src:    string;
	title?: string;
}

interface TableSpec {
	columns: { key: string; label: string }[];
	rows:    Record<string, string | number>[];
}

const toMarkdownTable = ({ columns, rows }: TableSpec): string => {
	const header  = `| ${columns.map((c) => c.label).join(' | ')} |`;
	const divider = `| ${columns.map(() => '---').join(' | ')} |`;
	const body    = rows.map((row) => `| ${columns.map((c) => row[c.key]).join(' | ')} |`).join('\n');
	return [header, divider, body].join('\n');
};

type MessageSegment =
	| { kind: 'text';       text: string }
	| { kind: 'lineplot';   spec: ChartSpec }
	| { kind: 'barchart';   spec: StackableChartSpec }
	| { kind: 'areachart';  spec: StackableChartSpec }
	| { kind: 'radarchart'; spec: ChartSpec }
	| { kind: 'donutchart'; spec: DonutSpec }
	| { kind: 'math';       spec: MathSpec }
	| { kind: 'image';      spec: ImageSpec }
	| { kind: 'audio';      spec: AudioSpec };

const FENCE_PATTERN = /```(\w+)\n([\s\S]*?)```/g;

const FENCE_LANGS = new Set(['lineplot', 'barchart', 'areachart', 'radarchart', 'donutchart', 'math', 'image', 'audio']);

const parseMessageSegments = (text: string): MessageSegment[] => {
	const segments: MessageSegment[] = [];
	let lastIndex = 0;

	FENCE_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;
	while((match = FENCE_PATTERN.exec(text)) !== null)
	{
		const [full, lang, body] = match;
		if(match.index > lastIndex) segments.push({ kind: 'text', text: text.slice(lastIndex, match.index) });

		if(FENCE_LANGS.has(lang))
		{
			try { segments.push({ kind: lang, spec: JSON.parse(body) } as MessageSegment); }
			catch { segments.push({ kind: 'text', text: full }); }
		}
		else segments.push({ kind: 'text', text: full });

		lastIndex = match.index + full.length;
	}

	if(lastIndex < text.length) segments.push({ kind: 'text', text: text.slice(lastIndex) });
	if(segments.length === 0) segments.push({ kind: 'text', text });

	return segments;
};

const renderSegment = (seg: MessageSegment, index: number) => {
	switch(seg.kind)
	{
		case 'lineplot':
			return <LineChart key={index} data={seg.spec.data} xKey={seg.spec.xKey} series={seg.spec.series} height={180} />;

		case 'barchart':
			return <BarChart key={index} data={seg.spec.data} xKey={seg.spec.xKey} series={seg.spec.series} stacked={seg.spec.stacked} height={180} />;

		case 'areachart':
			return <AreaChart key={index} data={seg.spec.data} xKey={seg.spec.xKey} series={seg.spec.series} stacked={seg.spec.stacked} height={180} />;

		case 'radarchart':
			return <RadarChart key={index} data={seg.spec.data} xKey={seg.spec.xKey} series={seg.spec.series} height={220} />;

		case 'donutchart':
			return <DonutChart key={index} data={seg.spec.data} height={200} />;

		case 'math':
			return <FunctionPlotter key={index} initialEquations={seg.spec.equations} readOnly layout='bottom' height={220} />;

		case 'image':
			return (
				// eslint-disable-next-line @next/next/no-img-element -- arbitrary generated-image URL, not a static asset
				<img key={index} src={seg.spec.url} alt={seg.spec.alt} className='w-full max-w-xs rounded-[var(--radius-lg)]' />
			);

		case 'audio':
			return <AudioPlayer key={index} size='compact' src={seg.spec.src} title={seg.spec.title} className='w-56' />;

		case 'text':
			return seg.text.trim() ? <ChatMarkdown key={index} text={seg.text.trim()} /> : null;
	}
};

interface ChatEntry {
	id:       string;
	title:    string;
	messages: ChatMessage[];
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
		text: `Here's a quick weeknight pasta you can have on the table in 20 minutes:\n\n${toMarkdownTable(PASTA_TABLE)}`,
		toolCalls: [
			{ id: 'p1', kind: 'search', title: 'Web search', detail: '"quick pasta aglio e olio recipe"', links: PASTA_SEARCH_LINKS },
		],
	},
];

const WORKOUT_MESSAGES: ChatMessage[] = [
	{ id: 8, kind: 'message', sender: 'user', text: 'Can you put together a push day routine for me?' },
	{
		id: 9, kind: 'message', sender: 'ai',
		text: `A simple push/pull/legs split spread across the week looks like this:\n\n${toMarkdownTable(WORKOUT_SPLIT_TABLE)}`,
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
		text: `A few worth picking up next:\n\n${toMarkdownTable(READING_LIST_TABLE)}`,
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

interface CannedReply {
	text:       string;
	toolCalls?: ToolCallEntry[];
}

const CANNED_REPLIES: CannedReply[] = [
	{
		text: 'For fluffier rice, rinse it under cold water until it runs clear — that washes off the surface starch that makes grains clump.',
	},
	{
		text: `Here's a quick weeknight pasta you can have on the table in 20 minutes:\n\n${toMarkdownTable(PASTA_TABLE)}`,
		toolCalls: [
			{ id: 'r1', kind: 'search', title: 'Web search', detail: '"quick pasta aglio e olio recipe"', links: PASTA_SEARCH_LINKS },
		],
	},
	{
		text: 'Progressive overload doesn’t always mean adding weight — a slower tempo or one extra rep works just as well some weeks.',
	},
	{
		text: `Here's what a realistic bench press progression over a few months could look like:\n\n\`\`\`lineplot\n${JSON.stringify(BENCH_PRESS_LINEPLOT)}\n\`\`\``,
		toolCalls: [
			{ id: 'r2', kind: 'thought', title: 'Thinking', detail: 'No existing log was shared — build an illustrative progression instead of guessing at real numbers.' },
		],
	},
	{
		text: `A simple push/pull/legs split spread across the week looks like this:\n\n${toMarkdownTable(WORKOUT_SPLIT_TABLE)}`,
		toolCalls: [
			{ id: 'r3', kind: 'search', title: 'Web search', detail: '"balanced push pull legs split for beginners"', links: WORKOUT_SEARCH_LINKS },
		],
	},
	{
		text: 'If you want something short and sharp, Klara and the Sun is worth it — under 300 pages and hard to put down once you start.',
	},
	{
		text: 'A squeeze of lime right before serving wakes up almost any braise — acid is the most under-used seasoning in a home kitchen.',
	},
	{
		text: `A few worth picking up next:\n\n${toMarkdownTable(READING_LIST_TABLE)}`,
		toolCalls: [
			{ id: 'r4', kind: 'search', title: 'Web search', detail: '"best-reviewed books 2025"', links: READING_SEARCH_LINKS },
		],
	},
];

const INITIAL_CHATS: ChatEntry[] = [
	{ id: '1', title: 'Installing components',   messages: INSTALL_MESSAGES },
	{ id: '2', title: 'Weeknight pasta ideas',   messages: PASTA_MESSAGES },
	{ id: '3', title: 'Push day workout plan',   messages: WORKOUT_MESSAGES },
	{ id: '4', title: 'Books to read this fall', messages: READING_MESSAGES },
	{ id: '5', title: 'Something new this week', messages: PLANNING_MESSAGES },
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
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
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

const randomReplyDelay = () => 600 + Math.random() * 300;

const Divider = ({ label }: { label: string }) => (
	<div className='flex items-center gap-3'>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
		<span className='shrink-0 text-xs font-medium text-text-muted'>{label}</span>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
	</div>
);

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
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const streamingRevealedRef = useRef(0);
	const nextChatId = useRef(INITIAL_CHATS.length + 1);
	const nextMessageId = useRef(
		INSTALL_MESSAGES.length + PASTA_MESSAGES.length + WORKOUT_MESSAGES.length + READING_MESSAGES.length + PLANNING_MESSAGES.length + 1
	);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const activeChat = chats.find((c) => c.id === activeId) ?? null;
	const isTyping = typingChatId === activeId;
	const isGenerating = isTyping || streamingChatId === activeId;

	useEffect(() => {
		const container = containerRef.current;
		const content   = contentRef.current;
		if(!container || !content) return;

		const scrollToBottom = () => { container.scrollTop = container.scrollHeight; };
		scrollToBottom();

		// Content can still grow after this runs (favicon images, web fonts loading in),
		// which would leave the view under-scrolled; re-snap to bottom for a short window
		// while that settles. Bounded rather than kept open for the chat's whole lifetime,
		// so a later manual resize (e.g. expanding a ToolCallTrace) doesn't yank the view
		// back down.
		const observer = new ResizeObserver(scrollToBottom);
		observer.observe(content);
		const settleTimeout = setTimeout(() => observer.disconnect(), 800);

		return () => {
			observer.disconnect();
			clearTimeout(settleTimeout);
		};
	}, [chats, isTyping, activeId]);

	useEffect(() => {
		return () => clearTimeout(timeoutRef.current);
	}, []);

	const handleNewChat = () => {
		const chat: ChatEntry = { id: String(nextChatId.current++), title: 'New chat', messages: [] };
		setChats((prev) => [chat, ...prev]);
		setActiveId(chat.id);
		setDraft('');
		setAttachedFile(null);
	};

	const handleSelectChat = (id: string) => {
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

	const queueAiReply = (chatId: string) => {
		setTypingChatId(chatId);
		timeoutRef.current = setTimeout(() => {
			const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
			setTypingChatId((prev) => (prev === chatId ? null : prev));
			const aiMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: reply.text, animate: true, toolCalls: reply.toolCalls };
			setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, aiMessage] } : c)));
			streamingRevealedRef.current = 0;
			setStreamingChatId(chatId);
			setStreamingMessageId(aiMessage.id);
		}, randomReplyDelay());
	};

	const handleStop = () => {
		if(typingChatId)
		{
			clearTimeout(timeoutRef.current);
			setTypingChatId(null);
			return;
		}
		if(streamingChatId && streamingMessageId !== null)
		{
			const chatId    = streamingChatId;
			const messageId = streamingMessageId;
			const revealed  = streamingRevealedRef.current;
			setChats((prev) => prev.map((c) => (c.id !== chatId ? c : {
				...c,
				messages: c.messages.map((m) => (m.kind === 'message' && m.id === messageId
					? { ...m, text: m.text.slice(0, revealed), animate: false }
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
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text, attachment };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, userMessage] } : c)));
		setDraft('');
		setAttachedFile(null);
		queueAiReply(chatId);
	};

	const handleQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeChat || !value.trim()) return;
		const chatId = activeChat.id;
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text: value };
		setChats((prev) => prev.map((c) => {
			if(c.id !== chatId) return c;
			const updated = c.messages.map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, questionnaireAnswer: value } : m));
			return { ...c, messages: [...updated, userMessage] };
		}));
		queueAiReply(chatId);
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

	return (
		<div className='flex h-[32rem] w-full max-w-4xl overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border'>
			<Sidebar width='w-64' height='h-full'>
				<SidebarHeader>
					<Button variant='outlined' size='sm' className='w-full justify-center gap-1.5' onClick={handleNewChat}>
						<PlusIcon />
						New chat
					</Button>
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
											{activeChat.messages.map((m) => {
												if(m.kind === 'checkpoint') return <Divider key={m.id} label={m.label} />;
												if(m.sender === 'user') {
													return (
														<div key={m.id} className='flex flex-col items-end gap-1.5'>
															{m.attachment && <Attachment name={m.attachment.name} size={m.attachment.size} />}
															{m.text && <Message variant='sent'>{m.text}</Message>}
														</div>
													);
												}

												return (
													<div key={m.id} className='flex flex-col gap-1.5'>
														{m.toolCalls && <ToolCallTrace toolCalls={m.toolCalls} />}
														<Message variant='received' bubble={false}>
															{m.generating === 'image' ? (
																<SkeletonImage aspectRatio='4/3' className='w-full max-w-xs' />
															) : m.generating === 'audio' ? (
																<div className='flex w-56 items-center gap-2'>
																	<Skeleton className='h-9 w-9 shrink-0 rounded-full' />
																	<Skeleton className='h-2 flex-1 rounded-full' />
																</div>
															) : m.animate ? (
																<Typewriter
																	text={m.text}
																	speed={18}
																	onReveal={(n) => { if(m.id === streamingMessageId) streamingRevealedRef.current = n; }}
																	onComplete={() => {
																		if(m.id !== streamingMessageId) return;
																		setStreamingChatId(null);
																		setStreamingMessageId(null);
																	}}
																/>
															) : (
																<div className='flex flex-col gap-3'>
																	{parseMessageSegments(m.text).map((seg, i) => renderSegment(seg, i))}
																</div>
															)}
														</Message>
														{m.questionnaire && (
															<QuestionCard
																step={m.questionnaire}
																answer={m.questionnaireAnswer}
																onAnswer={(value) => handleQuestionnaireAnswer(m.id, value)}
															/>
														)}
													</div>
												);
											})}
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
											<Button type='submit' size='icon' aria-label='Send message' disabled={!draft.trim() && !attachedFile}>
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
		</div>
	);
};

export default AiChat;
