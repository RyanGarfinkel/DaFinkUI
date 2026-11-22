import { EMPTY_LIVE_SHEETS, liveSheetsReducer, sheetBefore, sheetFrames, resolveSheetEdit, type LiveSheetsAction, type LiveSheetsState } from './useLiveSheet';
import { createSheet, type Sheet } from '../../components/SheetEditor/sheet';
import type { ChatMessage, SheetEditStep } from './types';
import { describe, it, expect } from 'vitest';

const BASE: Sheet = createSheet(10, 5, 'Budget');

const STEPS: SheetEditStep[] = [
	{ label: 'Headers', op: { type: 'setCells', cells: { A1: 'Item', B1: 'Cost' } } },
	{ label: 'Total', op: { type: 'setCells', cells: { B3: '=SUM(B2:B2)' } } },
];

const run = (state: LiveSheetsState, ...actions: LiveSheetsAction[]) => actions.reduce(liveSheetsReducer, state);

const drain = (state: LiveSheetsState) => {
	let next = state;
	while(next.queue.length) next = liveSheetsReducer(next, { type: 'tick' });
	return next;
};

const opened = run(EMPTY_LIVE_SHEETS, { type: 'open', docKey: 's', doc: BASE });

describe('sheetFrames', () =>
{
	it('makes one final frame per step, carrying the range it touches', () =>
	{
		const frames = sheetFrames(STEPS);
		expect(frames).toHaveLength(2);
		expect(frames.map(f => f.range)).toEqual(['A1:B1', 'B3']);
		expect(frames.every(f => f.final && !f.typing)).toBe(true);
	});
});

describe('liveSheetsReducer', () =>
{
	it('lands queued steps one tick at a time', () =>
	{
		const queued = run(opened, { type: 'edit', docKey: 's', messageId: 1, steps: STEPS, instant: false });
		expect(queued.queue).toHaveLength(2);
		const first = liveSheetsReducer(queued, { type: 'tick' });
		expect(first.docs.s.cells.A1.value).toBe('Item');
		expect(first.docs.s.cells.B3).toBeUndefined();
		expect(drain(queued).docs.s.cells.B3.value).toBe('=SUM(B2:B2)');
	});

	it('lands everything at once when instant', () =>
	{
		const state = run(opened, { type: 'edit', docKey: 's', messageId: 1, steps: STEPS, instant: true });
		expect(state.queue).toHaveLength(0);
		expect(state.docs.s.cells.B1.value).toBe('Cost');
	});

	it('skips and counts a step aimed at cells that no longer exist', () =>
	{
		const steps: SheetEditStep[] = [{ label: 'Style', op: { type: 'styleCells', range: 'Z90:Z99', style: { bold: true } } }];
		const state = drain(run(opened, { type: 'edit', docKey: 's', messageId: 4, steps, instant: false }));
		expect(state.skipped[4]).toBe(1);
	});

	it('a base starts the sheet over and clears its history', () =>
	{
		const edited = run(opened, { type: 'change', docKey: 's', doc: { ...BASE, title: 'Mine' } });
		const fresh = run(edited, { type: 'edit', docKey: 's', messageId: 2, base: createSheet(5, 5, 'New'), steps: [], instant: true });
		expect(fresh.docs.s.title).toBe('New');
		expect(fresh.history.s.past).toHaveLength(0);
	});

	it('undo reverts only your own change, keeping what the AI added since', () =>
	{
		const mine = { ...BASE, cells: { A1: { value: 'mine' } } };
		let state = run(opened, { type: 'change', docKey: 's', doc: mine });
		state = drain(run(state, { type: 'edit', docKey: 's', messageId: 1, steps: [{ label: 'AI', op: { type: 'setCells', cells: { C1: 'ai' } } }], instant: false }));
		state = run(state, { type: 'undo', docKey: 's' });
		expect(state.docs.s.cells.A1).toBeUndefined();
		expect(state.docs.s.cells.C1.value).toBe('ai');
		state = run(state, { type: 'redo', docKey: 's' });
		expect(state.docs.s.cells.A1.value).toBe('mine');
	});

	it('coalesces changes sharing a key into one undo step', () =>
	{
		const resize = (width: number): LiveSheetsAction => ({ type: 'change', docKey: 's', doc: { ...BASE, colWidths: { 0: width } }, coalesceKey: 'resize:0' });
		const state = run(opened, resize(120), resize(150), resize(180));
		expect(state.history.s.past).toHaveLength(1);
		expect(run(state, { type: 'undo', docKey: 's' }).docs.s.colWidths[0] ?? 104).toBe(104);
	});

	it('ignores a change that alters nothing', () =>
	{
		expect(run(opened, { type: 'change', docKey: 's', doc: BASE })).toBe(opened);
	});
});

describe('sheetBefore / resolveSheetEdit', () =>
{
	const msg = (id: number, sheetEdit: ChatMessage extends infer M ? (M extends { sheetEdit?: infer E } ? E : never) : never): ChatMessage => ({ id, kind: 'message', sender: 'ai', text: '', sheetEdit });

	it('replays earlier edits of the same sheet from its base', () =>
	{
		const history = [
			msg(1, { sheetId: 'a', title: 'A', base: BASE, steps: [STEPS[0]] }),
			msg(2, { sheetId: 'a', title: 'A', steps: [STEPS[1]] }),
		];
		const next = { sheetId: 'a', title: 'A', steps: [{ label: 'More', op: { type: 'setCells', cells: { C1: 'x' } } } as SheetEditStep] };
		const before = sheetBefore(next, history)!;
		expect(before.cells.B3.value).toBe('=SUM(B2:B2)');
		expect(resolveSheetEdit(next, history)!.final.cells.C1.value).toBe('x');
	});

	it('is null when there is nothing to continue from', () =>
	{
		expect(resolveSheetEdit({ sheetId: 'zzz', title: '', steps: STEPS }, [])).toBeNull();
	});
});
