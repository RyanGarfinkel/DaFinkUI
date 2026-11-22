import { buildPrompt, collectArtifacts, sheetReference, slideReference } from './messageHelpers';
import type { DeckAskContext } from '../../components/DeckEditor/askcontext';
import type { ChatArtifact, ChatMessage, ChatTextMessage } from './types';
import { describe, it, expect } from 'vitest';

const reply = (id: number, extra: Partial<ChatTextMessage> = {}): ChatTextMessage => ({ id, kind: 'message', sender: 'ai', text: 'ok', ...extra });

const artifact = (id: string, title = id): ChatArtifact => ({ id, kind: 'markdown', title, content: '# hi' });

const context: DeckAskContext = {
	slideId: 'metrics', slideNumber: 2, slideCount: 3,
	elementId: 'metrics-title', elementLabel: 'Title', elementType: 'text',
	text: 'Signups by month', selectedText: false,
};

describe('slideReference', () =>
{
	const deck = { deckId: 'q3-review', title: 'Q3 review' };

	it('names the chip for people and describes the element for the model', () =>
	{
		const reference = slideReference(context, deck);
		expect(reference.name).toBe('Slide 2 · Title');
		expect(reference.detail).toContain('deck q3-review "Q3 review"');
		expect(reference.detail).toContain('slide 2 of 3 (id metrics)');
		expect(reference.detail).toContain('element metrics-title (text, "Title")');
		expect(reference.detail).toContain('content: "Signups by month"');
	});

	it('names the chip after highlighted text and says it was highlighted', () =>
	{
		const reference = slideReference({ ...context, text: 'Signups', selectedText: true }, deck);
		expect(reference.name).toBe('Slide 2 · “Signups”');
		expect(reference.detail).toContain('highlighted text: "Signups"');
	});

	it('shortens a long highlight in the chip name', () =>
	{
		const reference = slideReference({ ...context, text: 'A very long highlighted sentence that keeps going', selectedText: true }, deck);
		expect(reference.name.length).toBeLessThan(40);
		expect(reference.name.endsWith('”')).toBe(true);
	});

	it('leaves out content for an element with no text', () =>
	{
		expect(slideReference({ ...context, elementType: 'shape', text: '' }, deck).detail).not.toContain('content');
	});
});

describe('buildPrompt', () =>
{
	const ref = { name: 'Slide 2 · Title', detail: 'deck d, slide 2' };

	it('is just the text when there are no attachments', () => expect(buildPrompt('hello')).toBe('hello'));

	it('falls back to the file names when there is no text', () => expect(buildPrompt('', [{ name: 'a.png' }])).toBe('Attached: a.png'));

	it('appends references after the typed text, without treating them as files', () =>
	{
		expect(buildPrompt('make this bigger', [ref, { name: 'a.png' }])).toBe('make this bigger\n\nReferring to Slide 2 · Title: deck d, slide 2');
	});

	it('sends a reference-only message as just the reference', () =>
	{
		expect(buildPrompt('', [ref])).toBe('Referring to Slide 2 · Title: deck d, slide 2');
	});
});

describe('collectArtifacts', () =>
{
	it('returns nothing when no reply made anything', () =>
	{
		const messages: ChatMessage[] = [reply(1), { id: 2, kind: 'checkpoint', label: 'Compacted' }];
		expect(collectArtifacts(messages)).toEqual([]);
	});

	it('lists artifacts oldest first, with the reply that made each', () =>
	{
		const entries = collectArtifacts([reply(1, { artifacts: [artifact('a')] }), reply(2, { artifacts: [artifact('b'), artifact('c')] })]);
		expect(entries.map((e) => [e.key, e.messageId])).toEqual([['a', 1], ['b', 2], ['c', 2]]);
	});

	it('lists a slide deck once, using its latest edit', () =>
	{
		const edit = (title: string) => ({ deckId: 'q3', title, steps: [] });
		const entries = collectArtifacts([reply(1, { deckEdit: edit('Q3') }), reply(2, { artifacts: [artifact('a')] }), reply(3, { deckEdit: edit('Q3 review') })]);

		expect(entries.map((e) => e.key)).toEqual(['a', 'deck:q3']);
		expect(entries[1]).toMatchObject({ kind: 'slides', title: 'Q3 review', messageId: 3, deckId: 'q3' });
	});

	it('lists a sheet once, using its latest edit', () =>
	{
		const edit = (title: string) => ({ sheetId: 'budget', title, steps: [] });
		const entries = collectArtifacts([reply(1, { sheetEdit: edit('Budget') }), reply(2, { sheetEdit: edit('Q3 budget') })]);

		expect(entries).toHaveLength(1);
		expect(entries[0]).toMatchObject({ key: 'sheet:budget', kind: 'sheet', title: 'Q3 budget', messageId: 2, sheetId: 'budget' });
	});

	it('replaces an artifact when a later reply reuses its id', () =>
	{
		const entries = collectArtifacts([reply(1, { artifacts: [artifact('a', 'Draft')] }), reply(2, { artifacts: [artifact('a', 'Final')] })]);

		expect(entries).toHaveLength(1);
		expect(entries[0]).toMatchObject({ title: 'Final', messageId: 2 });
	});
});

describe('sheetReference', () =>
{
	const sheet = { sheetId: 'budget', title: 'Q3 budget' };

	it('names the chip for people and gives the model the sheet, range and contents', () =>
	{
		const reference = sheetReference({ range: 'B2:C3', activeCell: 'B2', rows: 2, cols: 2, text: '1\t2\n3\t=B2+C2', truncated: false }, sheet);
		expect(reference.name).toBe('Q3 budget · B2:C3');
		expect(reference.detail).toContain('sheet budget "Q3 budget", range B2:C3 (2 × 2, active cell B2)');
		expect(reference.detail).toContain('=B2+C2');
	});

	it('leaves out contents for an empty selection and says when they were cut off', () =>
	{
		expect(sheetReference({ range: 'A1', activeCell: 'A1', rows: 1, cols: 1, text: '', truncated: false }, sheet).detail).not.toContain('contents');
		expect(sheetReference({ range: 'A1:A99', activeCell: 'A1', rows: 99, cols: 1, text: 'x', truncated: true }, sheet).detail).toContain('cut off');
	});
});
