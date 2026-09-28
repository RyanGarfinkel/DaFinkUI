import type { ChartSpec, TableSpec, WorkflowSpec } from '@/src/blocks/AiChat/StreamingMessage';
import type { ChatEntry, ChatMessage, SearchCorpusEntry } from '@/src/blocks/AiChat/AiChat';
import type { ToolCallLink } from '@/src/components/ToolCallTrace/ToolCallTrace';

// Docs-site-only sample store backing the /blocks/ai-chat live preview. Never listed in the
// ai-chat block's registry `files`. In a real app this is your database: the chats route
// lists a user's conversations, the threads route loads one thread, and search queries it.

const CI_PIPELINE_WORKFLOW: WorkflowSpec = {
	nodes: [
		{ id: 'ci1', label: 'PR opened',            description: '',                                            inputs: [],                          outputs: [{ id: 'out', label: 'out' }],                          position: { x: 0,   y: 80  } },
		{ id: 'ci2', label: 'Lint & test',          description: '',                                            inputs: [{ id: 'in', label: 'in' }], outputs: [{ id: 'pass', label: 'pass' }, { id: 'fail', label: 'fail' }], position: { x: 260, y: 80  } },
		{ id: 'ci3', label: 'Build preview',        description: '',                                            inputs: [{ id: 'in', label: 'in' }], outputs: [{ id: 'out', label: 'out' }],                          position: { x: 560, y: 0   } },
		{ id: 'ci4', label: 'Notify author',        description: 'Comments the failure back on the PR.',        inputs: [{ id: 'in', label: 'in' }], outputs: [],                                                      position: { x: 560, y: 180 } },
		{ id: 'ci5', label: 'Deploy to production', description: '',                                            inputs: [{ id: 'in', label: 'in' }], outputs: [],                                                      position: { x: 860, y: 0   } },
	],
	edges: [
		{ id: 'cie1', source: 'ci1', target: 'ci2', sourceHandle: 'out',  targetHandle: 'in' },
		{ id: 'cie2', source: 'ci2', target: 'ci3', sourceHandle: 'pass', targetHandle: 'in' },
		{ id: 'cie3', source: 'ci2', target: 'ci4', sourceHandle: 'fail', targetHandle: 'in' },
		{ id: 'cie4', source: 'ci3', target: 'ci5', sourceHandle: 'out', targetHandle: 'in' },
	],
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
	{ id: 18, kind: 'message', sender: 'user', text: 'What does the release pipeline for this repo actually look like?' },
	{
		id: 19, kind: 'message', sender: 'ai',
		text: `Here's roughly what happens between opening a PR and it reaching production:\n\n\`\`\`workflow\n${JSON.stringify(CI_PIPELINE_WORKFLOW)}\n\`\`\``,
	},
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

export const CHATS: ChatEntry[] = [
	{
		id: '1', title: 'Installing components', messages: INSTALL_MESSAGES,
		threadRefs: [
			{ id: 'thread-install-1', rootMessageId: 3, snippet: 'Run this in your project root — it copies…', createdAt: '2 days ago', replyCount: 2 },
			{ id: 'thread-install-2', rootMessageId: 5, snippet: 'Yes — every component is built on design t…', createdAt: '1 day ago', replyCount: 2 },
		],
	},
	{ id: '2', title: 'Weeknight pasta ideas', messages: PASTA_MESSAGES, threadRefs: [] },
	{
		id: '3', title: 'Push day workout plan', messages: WORKOUT_MESSAGES,
		threadRefs: [
			{ id: 'thread-workout-1', rootMessageId: 9, snippet: 'A simple push/pull/legs split spread across…', createdAt: '3 hours ago', replyCount: 3 },
		],
	},
	{ id: '4', title: 'Books to read this fall', messages: READING_MESSAGES, threadRefs: [] },
	{ id: '5', title: 'Something new this week', messages: PLANNING_MESSAGES, threadRefs: [] },
];

export const THREAD_MESSAGES: Record<string, ChatMessage[]> = {
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

const toSearchMessages = (messages: ChatMessage[]): SearchCorpusEntry['messages'] =>
	messages.flatMap((m) => (m.kind === 'message' ? [{ id: m.id, sender: m.sender, text: m.text }] : []));

export const buildSeedThreadCorpus = (): SearchCorpusEntry[] =>
	CHATS.flatMap((chat) => chat.threadRefs.map((ref) => ({
		chatId:        chat.id,
		chatTitle:     chat.title,
		threadId:      ref.id,
		rootMessageId: ref.rootMessageId,
		messages:      toSearchMessages(THREAD_MESSAGES[ref.id] ?? []),
	})));
