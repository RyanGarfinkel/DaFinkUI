import type { Deck } from '../../components/DeckEditor/deck';

// Consecutive edits with the same key inside this window (a drag, a typing
// burst) collapse into one undo step instead of one step per pointermove/keystroke.
const COALESCE_MS = 800;
const HISTORY_LIMIT = 100;

export interface DeckHistory {
	past:          Deck[];
	present:       Deck;
	future:        Deck[];
	lastKey:       string | null;
	lastChangedAt: number;
}

export type DeckAction =
	| { type: 'change'; deck: Deck; coalesceKey?: string }
	/** Replaces the deck and clears undo/redo, e.g. after opening a different deck. */
	| { type: 'load'; deck: Deck }
	| { type: 'undo' }
	| { type: 'redo' };

export const createHistory = (deck: Deck): DeckHistory => ({
	past: [], present: deck, future: [], lastKey: null, lastChangedAt: 0,
});

export const historyReducer = (state: DeckHistory, action: DeckAction): DeckHistory => {
	if(action.type === 'load') return createHistory(action.deck);

	if(action.type === 'undo')
	{
		const previous = state.past.at(-1);
		if(!previous) return state;
		return { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future], lastKey: null, lastChangedAt: 0 };
	}

	if(action.type === 'redo')
	{
		const [next, ...rest] = state.future;
		if(!next) return state;
		return { past: [...state.past, state.present], present: next, future: rest, lastKey: null, lastChangedAt: 0 };
	}

	const now = Date.now();
	const coalesce = !!action.coalesceKey && action.coalesceKey === state.lastKey && now - state.lastChangedAt < COALESCE_MS;

	return {
		past:          coalesce ? state.past : [...state.past, state.present].slice(-HISTORY_LIMIT),
		present:       action.deck,
		future:        [],
		lastKey:       action.coalesceKey ?? null,
		lastChangedAt: now,
	};
};

const SAMPLE_IMAGE = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="300" cy="80" r="40" fill="#fff" fill-opacity=".35"/><path d="M0 300 140 150l90 90 60-50 110 110z" fill="#fff" fill-opacity=".25"/></svg>',
)}`;

export const SAMPLE_DECK: Deck = {
	title:  'Quarterly review',
	theme:  'app',
	slides: [
		{
			id:         'intro',
			background: '',
			transition: { type: 'none', duration: 500 },
			ambient:    'particles',
			skipped:    false,
			notes:      'Welcome everyone. Thirty seconds on the headline numbers, then hand off.',
			elements:   [
				{ id: 'intro-icon', label: 'Rocket icon', type: 'icon', icon: 'rocket', color: '', x: 96, y: 136, width: 72, height: 72 },
				{ id: 'intro-title', label: 'Title', type: 'text', effect: { type: 'typewriter', delay: 0 }, html: '<p><strong>Quarterly review</strong></p>', fontSize: 72, color: '', x: 96, y: 232, width: 720, height: 104 },
				{ id: 'intro-subtitle', label: 'Subtitle', type: 'text', effect: { type: 'fade', delay: 900 }, html: '<p>Growth, retention, and what&apos;s next</p>', fontSize: 32, color: 'var(--color-text-muted)', x: 96, y: 344, width: 640, height: 56 },
				{ id: 'intro-image', label: 'Cover image', type: 'image', effect: { type: 'slide-left', delay: 300 }, src: SAMPLE_IMAGE, alt: 'Abstract gradient illustration', fit: 'cover', x: 864, y: 136, width: 320, height: 448 },
			],
		},
		{
			id:         'metrics',
			background: '',
			transition: { type: 'push', duration: 600 },
			ambient:    'none',
			skipped:    false,
			notes:      'Signups dipped in August because of the pricing change; call that out.',
			elements:   [
				{ id: 'metrics-title', label: 'Title', type: 'text', html: '<p><strong>Signups by month</strong></p>', fontSize: 48, color: '', x: 96, y: 72, width: 720, height: 72 },
				{
					id: 'metrics-chart', label: 'Signups chart', type: 'chart', chart: 'bar', seriesLabel: 'Signups', effect: { type: 'slide-up', delay: 0 }, x: 96, y: 176, width: 640, height: 448,
					data: [
						{ label: 'Jul', value: 1200 },
						{ label: 'Aug', value: 980 },
						{ label: 'Sep', value: 1640 },
						{ label: 'Oct', value: 2100 },
					],
				},
				{ id: 'metrics-notes', label: 'Highlights', type: 'text', effect: { type: 'fade', delay: 400 }, html: '<ul><li><p>Best month on record in October</p></li><li><p>Activation up 12%</p></li><li><p>Churn flat at 2.1%</p></li></ul>', fontSize: 28, color: '', x: 784, y: 192, width: 400, height: 240 },
			],
		},
		{
			id:         'plan',
			background: '',
			transition: { type: 'fade', duration: 500 },
			ambient:    'none',
			skipped:    false,
			notes:      '',
			elements:   [
				{ id: 'plan-title', label: 'Title', type: 'text', html: '<p><strong>Next quarter</strong></p>', fontSize: 48, color: '', x: 96, y: 72, width: 720, height: 72 },
				{
					id: 'plan-table', label: 'Plan table', type: 'table', header: true, fontSize: 22, x: 96, y: 184, width: 1088, height: 264,
					rows: [
						['Initiative', 'Owner', 'Target'],
						['Self-serve onboarding', 'Growth', 'Nov 30'],
						['Usage-based pricing', 'Billing', 'Dec 15'],
						['SOC 2 Type II', 'Security', 'Jan 20'],
					],
				},
				{ id: 'plan-shape', label: 'Accent bar', type: 'shape', shape: 'rect', fill: '', radius: 8, x: 96, y: 496, width: 160, height: 16 },
			],
		},
	],
};
