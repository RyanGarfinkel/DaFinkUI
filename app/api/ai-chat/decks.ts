import type { ToolCallEntry } from '@/src/components/ToolCallTrace/ToolCallTrace';
import type { AiChatReply, DeckEditStep } from '@/src/blocks/AiChat/AiChat';
import type { DeckElement, Slide } from '@/src/components/DeckEditor/deck';
import { NO_TRANSITION } from '@/src/components/DeckEditor/deck';

// Docs-only scripted "agent" edits for the ai-chat demo. Element ids are fixed so the
// revise script can target what the create script made. With a real model, the
// agent's tool calls would produce these DeckOps instead.

const DECK_ID = 'q3-review';
export const DECK_TITLE = 'Q3 review';

const slide = (id: string, elements: DeckElement[] = []): Slide => ({
	id, background: '', notes: '', transition: { type: 'fade', duration: 500 }, ambient: 'none', skipped: false, elements,
});

const text = (id: string, label: string, html: string, box: Pick<DeckElement, 'x' | 'y' | 'width' | 'height'>, fontSize: number, bold?: boolean): DeckElement => ({
	id, label, type: 'text', html, fontSize, color: '', bold, ...box,
});

const CREATE_STEPS: DeckEditStep[] = [
	{ label: 'Applying the Midnight theme', op: { type: 'setTheme', theme: 'midnight' } },
	{ label: 'Writing the title', op: { type: 'addElement', slideId: 'cover', element: text('cover-title', 'Title', '<p style="text-align: center">Q3 review</p>', { x: 96, y: 248, width: 1088, height: 120 }, 72, true) } },
	{ label: 'Adding a subtitle', op: { type: 'addElement', slideId: 'cover', element: text('cover-subtitle', 'Subtitle', '<p style="text-align: center">Growth, retention, and what\'s next</p>', { x: 96, y: 384, width: 1088, height: 56 }, 32) } },
	{ label: 'Adding slide 2', op: { type: 'addSlide', slide: slide('metrics') } },
	{ label: 'Titling slide 2', op: { type: 'addElement', slideId: 'metrics', element: text('metrics-title', 'Title', '<p>Signups by month</p>', { x: 96, y: 64, width: 1088, height: 88 }, 48, true) } },
	{
		label: 'Adding a chart to slide 2',
		op:    {
			type: 'addElement', slideId: 'metrics', element: {
				id: 'metrics-chart', label: 'Signups chart', type: 'chart', chart: 'bar', seriesLabel: 'Signups', x: 96, y: 184, width: 620, height: 440,
				data: [{ label: 'Jul', value: 1200 }, { label: 'Aug', value: 980 }, { label: 'Sep', value: 1640 }],
			},
		},
	},
	{ label: 'Writing takeaways on slide 2', op: { type: 'addElement', slideId: 'metrics', element: text('metrics-notes', 'Takeaways', '<ul><li><p>September was our best month</p></li><li><p>Activation up 12%</p></li><li><p>Churn flat at 2.1%</p></li></ul>', { x: 764, y: 184, width: 420, height: 440 }, 28) } },
	{ label: 'Adding slide 3', op: { type: 'addSlide', slide: slide('plan') } },
	{ label: 'Titling slide 3', op: { type: 'addElement', slideId: 'plan', element: text('plan-title', 'Title', '<p>Next quarter</p>', { x: 96, y: 64, width: 1088, height: 88 }, 48, true) } },
	{
		label: 'Adding the plan table to slide 3',
		op:    {
			type: 'addElement', slideId: 'plan', element: {
				id: 'plan-table', label: 'Plan', type: 'table', header: true, fontSize: 24, x: 96, y: 184, width: 1088, height: 240,
				rows: [['Initiative', 'Owner', 'Target'], ['Self-serve onboarding', 'Growth', 'Nov 30'], ['Usage-based pricing', 'Billing', 'Dec 15']],
			},
		},
	},
];

const REVISE_STEPS: DeckEditStep[] = [
	{ label: 'Rewording the title', op: { type: 'updateElement', slideId: 'cover', elementId: 'cover-title', patch: { html: '<p style="text-align: center">Q3: a record quarter</p>' } } },
	{ label: 'Adding October to the chart', op: { type: 'updateElement', slideId: 'metrics', elementId: 'metrics-chart', patch: { data: [{ label: 'Jul', value: 1200 }, { label: 'Aug', value: 980 }, { label: 'Sep', value: 1640 }, { label: 'Oct', value: 2100 }] } } },
	{ label: 'Switching the chart to a line', op: { type: 'updateElement', slideId: 'metrics', elementId: 'metrics-chart', patch: { chart: 'line' } } },
	{ label: 'Adding a closing slide', op: { type: 'addSlide', slide: slide('closing') } },
	{ label: 'Writing the closing line', op: { type: 'addElement', slideId: 'closing', element: text('closing-title', 'Closing', '<p style="text-align: center">Questions?</p>', { x: 96, y: 296, width: 1088, height: 120 }, 72, true) } },
	{ label: 'Switching to the Ocean theme', op: { type: 'setTheme', theme: 'ocean' } },
];

const trace = (steps: DeckEditStep[]): ToolCallEntry[] =>
	steps.map((step, i) => ({ id: `deck-${i}`, kind: 'tool', title: 'Edit slides', detail: step.label }));

export const CREATE_REPLY: AiChatReply = {
	text:      `Here's a ${DECK_TITLE} deck: a title slide, signups by month, and next quarter's plan. Open it to watch the edits, or ask me to change anything.`,
	toolCalls: trace(CREATE_STEPS),
	deckEdit:  {
		deckId: DECK_ID,
		title:  DECK_TITLE,
		base:   { title: DECK_TITLE, theme: 'app', slides: [{ ...slide('cover'), transition: NO_TRANSITION }] },
		steps:  CREATE_STEPS,
	},
};

const REVISE_REPLY: AiChatReply = {
	text:      'Done: a punchier title, October in the chart (now a line), a closing slide, and the Ocean theme.',
	toolCalls: trace(REVISE_STEPS),
	deckEdit:  { deckId: DECK_ID, title: DECK_TITLE, steps: REVISE_STEPS },
};

const DECK_WORDS = /\b(slides?|deck|presentation)\b/i;
const ABOUT_DECK = /\b(slides?|deck|presentation|title|chart|theme)\b/i;
const EDIT_WORDS = /\b(edit|change|make|revise|update|tweak|improve)\b/i;

/**
 * A scripted deck reply, or null for an ordinary canned reply. Asking for slides
 * creates the deck; asking to change a freshly created deck revises it. The revise
 * script only applies once per deck, so after it, asking for slides starts over.
 */
export const deckReply = (message: string, history: { role: string; text: string }[]): AiChatReply | null => {
	if(!ABOUT_DECK.test(message)) return null;
	const lastDeckReply = history.findLast(h => h.role === 'assistant' && (h.text === CREATE_REPLY.text || h.text === REVISE_REPLY.text));
	if(lastDeckReply?.text === CREATE_REPLY.text && EDIT_WORDS.test(message)) return REVISE_REPLY;
	return DECK_WORDS.test(message) ? CREATE_REPLY : null;
};
