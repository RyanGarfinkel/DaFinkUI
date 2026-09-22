import type { ToolCallEntry, ToolCallLink } from '@/src/components/ToolCallTrace/ToolCallTrace';
import type { AiChatHistoryMessage, AiChatReply } from '@/src/blocks/AiChat/AiChat';
import type { ChartSpec, TableSpec } from '@/src/blocks/AiChat/StreamingMessage';
import { NextResponse } from 'next/server';

// Docs-site-only infrastructure backing the /blocks/ai-chat live preview. Never listed in
// the ai-chat block's registry `files`, so the CLI never ships this to consumers.

interface CannedReply {
	text:       string;
	toolCalls?: ToolCallEntry[];
}

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

const CANNED_REPLIES: CannedReply[] = [
	{
		text: 'For fluffier rice, rinse it under cold water until it runs clear — that washes off the surface starch that makes grains clump.',
	},
	{
		text: `Here's a quick weeknight pasta you can have on the table in 20 minutes:\n\n\`\`\`table\n${JSON.stringify(PASTA_TABLE)}\n\`\`\``,
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
		text: `A simple push/pull/legs split spread across the week looks like this:\n\n\`\`\`table\n${JSON.stringify(WORKOUT_SPLIT_TABLE)}\n\`\`\``,
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
		text: `A few worth picking up next:\n\n\`\`\`table\n${JSON.stringify(READING_LIST_TABLE)}\n\`\`\``,
		toolCalls: [
			{ id: 'r4', kind: 'search', title: 'Web search', detail: '"best-reviewed books 2025"', links: READING_SEARCH_LINKS },
		],
	},
];

const randomReplyDelay = () => 600 + Math.random() * 300;

export const POST = async (request: Request) => {
	const { message } = (await request.json()) as { message: string; history: AiChatHistoryMessage[] };
	if(!message?.trim()) return NextResponse.json({ error: 'message is required' }, { status: 400 });

	await new Promise((resolve) => setTimeout(resolve, randomReplyDelay()));
	const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
	const body: AiChatReply = { text: reply.text, toolCalls: reply.toolCalls };
	return NextResponse.json(body);
};
