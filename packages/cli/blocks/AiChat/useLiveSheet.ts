'use client';

import { applySheetOps, applySheetOpsLenient, diffSheets, opRange, type SheetOp } from '../../components/SheetEditor/sheetops';
import { createLiveReducer, useLiveDocs, type Frame, type LiveAction, type LiveState } from './liveDocs';
import type { ChatMessage, SheetEdit, SheetEditStep } from './types';
import type { Sheet } from '../../components/SheetEditor/sheet';

// One live document per sheet in a chat; the shared machinery is in liveDocs.ts. Each step is
// one frame, so a step's size is the pacing: an agent writes a column per step, not a cell.

export type SheetFrame = Frame<SheetOp, { range?: string }>;

export const sheetFrames = (steps: SheetEditStep[]): SheetFrame[] =>
	steps.map(step => ({ op: step.op, label: step.label, range: opRange(step.op), typing: false, final: true }));

/** The sheet before an edit: its own `base`, or the result of earlier edits to the same sheet in `previous`. */
export const sheetBefore = (edit: SheetEdit, previous: ChatMessage[]): Sheet | null => {
	if(edit.base) return edit.base;
	let sheet: Sheet | null = null;
	for(const m of previous)
	{
		if(m.kind !== 'message' || m.sheetEdit?.sheetId !== edit.sheetId) continue;
		const start: Sheet | null = m.sheetEdit.base ?? sheet;
		if(!start) continue;
		sheet = applySheetOps(start, m.sheetEdit.steps.map(s => s.op));
	}
	return sheet;
};

/** The sheet before and after an edit, or null when it can't be applied (nothing to continue from, or a step fails). */
export const resolveSheetEdit = (edit: SheetEdit, previous: ChatMessage[]): { base: Sheet; final: Sheet } | null => {
	try
	{
		const base = sheetBefore(edit, previous);
		return base ? { base, final: applySheetOps(base, edit.steps.map(s => s.op)) } : null;
	}
	catch
	{
		return null;
	}
};

export type LiveSheetsState = LiveState<Sheet, SheetOp, SheetFrame>;

export type LiveSheetsAction = LiveAction<Sheet, SheetEditStep>;

export const EMPTY_LIVE_SHEETS: LiveSheetsState = { docs: {}, history: {}, queue: [], skipped: {} };

export const liveSheetsReducer = createLiveReducer<Sheet, SheetOp, SheetEditStep, SheetFrame>({
	frames: sheetFrames,
	apply:  (sheet, ops) => {
		const result = applySheetOpsLenient(sheet, ops);
		return { doc: result.sheet, skipped: result.skipped };
	},
	diff: diffSheets,
});

export const sheetDocKey = (chatId: string, sheetId: string) => `${chatId}:${sheetId}`;

export const useLiveSheet = () => useLiveDocs(liveSheetsReducer);
