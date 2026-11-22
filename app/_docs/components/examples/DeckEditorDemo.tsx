'use client';

import { DeckEditor, TOOLBAR_BUTTON } from '@/src/components/DeckEditor/DeckEditor';
import type { TextStyleId } from '@/src/components/DeckEditor/textstyles';
import type { Deck, DeckElement } from '@/src/components/DeckEditor/deck';
import { textStyleFields } from '@/src/components/DeckEditor/textstyles';
import { createSlide } from '@/src/components/DeckEditor/deck';
import type { DeckOp } from '@/src/components/DeckEditor/ops';
import { applyOps } from '@/src/components/DeckEditor/ops';
import { useState } from 'react';

const text = (id: string, style: TextStyleId, html: string, box: Pick<DeckElement, 'x' | 'y' | 'width' | 'height'>, extra: Partial<DeckElement> = {}) => (
	{ id, label: id, type: 'text', style, html, ...textStyleFields(style), ...box, ...extra } as DeckElement
);

const LOGO = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="20"/><path d="M14 30l8-8 5 5 8-10"/><path d="M29 17h6v6"/></svg>';

const footer = (slideId: string): DeckOp => ({
	type: 'addElement', slideId, element: text(`${slideId}-footer`, 'footer', '<p>Acme · Q3 review</p>', { x: 96, y: 664, width: 700, height: 32 }),
});

// The deck is built the way an agent would build it: a few validated ops.
const BUILD: DeckOp[] = [
	{ type: 'updateTheme', patch: { colors: { accent: '#f97316' }, headingFont: 'serif', radius: 20 } },
	{ type: 'addElement', slideId: 'cover', element: { id: 'logo', label: 'Logo', type: 'svg', svg: LOGO, color: 'var(--color-brand)', x: 592, y: 112, width: 96, height: 96 } },
	{ type: 'addElement', slideId: 'cover', element: text('cover-title', 'title', '<p style="text-align: center">Q3 review</p>', { x: 96, y: 248, width: 1088, height: 120 }) },
	{ type: 'addElement', slideId: 'cover', element: text('cover-sub', 'body', '<p style="text-align: center">Growth, retention, and what\'s next</p>', { x: 96, y: 384, width: 1088, height: 56 }, { fontSize: 32, color: 'var(--color-text-muted)' }) },
	{ type: 'addSlideFromLayout', layout: 'chart', slideId: 'metrics' },
	{ type: 'updateElement', slideId: 'metrics', elementId: 'metrics:title', patch: { html: '<p>Signups by month</p>' } },
	{
		type: 'updateElement', slideId: 'metrics', elementId: 'metrics:chart',
		patch: { chart: 'area', seriesLabel: 'Signups', width: 660, data: [{ label: 'Jul', value: 1200 }, { label: 'Aug', value: 980 }, { label: 'Sep', value: 1640 }, { label: 'Oct', value: 2100 }] },
	},
	{ type: 'addElement', slideId: 'metrics', element: { id: 'card', label: 'Card', type: 'shape', shape: 'rect', fill: 'var(--color-surface-active)', x: 800, y: 184, width: 384, height: 440 } },
	{ type: 'addElement', slideId: 'metrics', element: text('takeaways', 'body', '<ul><li><p>October is our best month</p></li><li><p>Activation up 12%</p></li><li><p>Churn flat at 2.1%</p></li></ul>', { x: 824, y: 208, width: 336, height: 392 }, { fontSize: 24 }) },
	{ type: 'updateSlide', slideId: 'metrics', patch: { notes: 'Lead with October, then the activation story.' } },
	{ type: 'addSlideFromLayout', layout: 'titleContent', slideId: 'plan' },
	{ type: 'updateElement', slideId: 'plan', elementId: 'plan:title', patch: { html: '<p>Next quarter</p>' } },
	{ type: 'updateElement', slideId: 'plan', elementId: 'plan:body', patch: { width: 500, html: '<ul><li><p>Self-serve onboarding</p></li><li><p>Usage-based pricing</p></li><li><p>Team workspaces</p></li></ul>' } },
	{
		type: 'addElement', slideId: 'plan', element: {
			id: 'plan-table', label: 'Plan', type: 'table', header: true, fontSize: 22, x: 640, y: 184, width: 544, height: 240,
			rows: [['Initiative', 'Owner', 'Target'], ['Onboarding', 'Growth', 'Nov 30'], ['Pricing', 'Billing', 'Dec 15'], ['Workspaces', 'Platform', 'Jan 20']],
		},
	},
	...['cover', 'metrics', 'plan'].map(footer),
	{ type: 'updateSlides', patch: { transition: { type: 'fade', duration: 500 } } },
	{ type: 'updateSlide', slideId: 'cover', patch: { ambient: 'particles' } },
	{ type: 'updateElements', elementType: 'text', patch: { effect: { type: 'fade', delay: 150 } } },
];

const BASE: Deck = { title: 'Q3 review', theme: 'midnight', slides: [{ ...createSlide(), id: 'cover' }] };
const START = applyOps(BASE, BUILD);

// Each press restyles the whole deck with a couple of ops, and is one undo step.
const LOOKS: DeckOp[][] = [
	[{ type: 'updateTheme', patch: { colors: { accent: '#22d3ee' }, headingFont: 'mono', radius: 4, margin: 80 } }, { type: 'updateSlide', slideId: 'cover', patch: { ambient: 'meteors' } }],
	[{ type: 'updateTheme', patch: { colors: { accent: '#f97316' }, headingFont: 'serif', radius: 20, margin: 96 } }, { type: 'updateSlide', slideId: 'cover', patch: { ambient: 'particles' } }],
];

interface History {
	past:     Deck[];
	present:  Deck;
	future:   Deck[];
	lastKey?: string;
}

export const DeckEditorDemo = () => {
	const [history, setHistory] = useState<History>({ past: [], present: START, future: [] });
	const [look, setLook] = useState(0);

	// A run of edits sharing a key (a drag, a typing burst) is one undo step.
	const change = (deck: Deck, key?: string) => setHistory(h => ({
		past:    key && key === h.lastKey ? h.past : [...h.past, h.present],
		present: deck,
		future:  [],
		lastKey: key,
	}));

	const undo = () => setHistory(h => (h.past.length ? { past: h.past.slice(0, -1), present: h.past.at(-1)!, future: [h.present, ...h.future] } : h));
	const redo = () => setHistory(h => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h));

	const restyle = () => {
		change(applyOps(history.present, LOOKS[look % LOOKS.length]));
		setLook(look + 1);
	};

	return (
		<div className='h-[640px] w-full'>
			<DeckEditor
				deck={history.present}
				onChange={change}
				history={{ undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0 }}
				toolbarEnd={<button type='button' className={TOOLBAR_BUTTON} onClick={restyle}>Restyle deck</button>}
			/>
		</div>
	);
};
