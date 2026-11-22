import type { ToolCallEntry } from '@/src/components/ToolCallTrace/ToolCallTrace';
import type { AiChatReply, SheetEditStep } from '@/src/blocks/AiChat/AiChat';
import { createSheet } from '@/src/components/SheetEditor/sheet';

// Docs-only scripted "agent" edits for the ai-chat demo. With a real model, the agent's tool
// calls would produce these SheetOps instead; see SHEET_REFERENCE in the SheetEditor component
// for what to put in its system prompt. Each step is one landing change, so steps are about
// a row or a column, not a cell.

const SHEET_ID = 'q3-budget';
export const SHEET_TITLE = 'Q3 budget';

const HEADER = { bold: true, fill: '#f4f4f5' };

const CREATE_STEPS: SheetEditStep[] = [
	{ label: 'Writing the column headers', op: { type: 'setCells', cells: { A1: 'Item', B1: 'Q1', C1: 'Q2', D1: 'Q3', E1: 'Total' } } },
	{ label: 'Styling the header row', op: { type: 'styleCells', range: 'A1:E1', style: HEADER } },
	{ label: 'Right-aligning the number headers', op: { type: 'styleCells', range: 'B1:E1', style: { align: 'right' } } },
	{ label: 'Adding the cost lines', op: { type: 'setCells', cells: { A2: 'Hosting', A3: 'Salaries', A4: 'Marketing', A5: 'Software' } } },
	{ label: 'Entering Q1', op: { type: 'setCells', cells: { B2: '1200', B3: '48000', B4: '6200', B5: '2400' } } },
	{ label: 'Entering Q2', op: { type: 'setCells', cells: { C2: '1350', C3: '48000', C4: '7800', C5: '2400' } } },
	{ label: 'Entering Q3', op: { type: 'setCells', cells: { D2: '1500', D3: '51000', D4: '9100', D5: '2650' } } },
	{ label: 'Totalling each line', op: { type: 'setCells', cells: { E2: '=SUM(B2:D2)', E3: '=SUM(B3:D3)', E4: '=SUM(B4:D4)', E5: '=SUM(B5:D5)' } } },
	{ label: 'Totalling each quarter', op: { type: 'setCells', cells: { A6: 'Total', B6: '=SUM(B2:B5)', C6: '=SUM(C2:C5)', D6: '=SUM(D2:D5)', E6: '=SUM(E2:E5)' } } },
	{ label: 'Formatting costs as currency', op: { type: 'styleCells', range: 'B2:E6', style: { format: 'currency' } } },
	{ label: 'Bolding the total row', op: { type: 'styleCells', range: 'A6:E6', style: { bold: true } } },
	{ label: 'Adding growth and a budget check', op: { type: 'setCells', cells: { A8: 'Q3 vs Q1', B8: '=D6/B6-1', A9: 'Over budget?', B9: '=IF(E6>130000,"Yes","No")' } } },
	{ label: 'Formatting the growth as a percent', op: { type: 'styleCells', range: 'B8', style: { format: 'percent' } } },
	{ label: 'Widening the first column', op: { type: 'resizeCol', col: 0, width: 140 } },
];

const REVISE_STEPS: SheetEditStep[] = [
	{ label: 'Adding a Share column', op: { type: 'setCells', cells: { F1: 'Share', F2: '=E2/E$6', F3: '=E3/E$6', F4: '=E4/E$6', F5: '=E5/E$6', F6: '=SUM(F2:F5)' } } },
	{ label: 'Formatting shares as percentages', op: { type: 'styleCells', range: 'F2:F6', style: { format: 'percent' } } },
	{ label: 'Styling the new header', op: { type: 'styleCells', range: 'F1', style: { ...HEADER, align: 'right' } } },
	{ label: 'Bolding the share total', op: { type: 'styleCells', range: 'F6', style: { bold: true } } },
	{ label: 'Highlighting the biggest cost', op: { type: 'styleCells', range: 'A3:F3', style: { fill: '#fef3c7' } } },
];

const trace = (steps: SheetEditStep[]): ToolCallEntry[] =>
	steps.map((step, i) => ({ id: `sheet-${i}`, kind: 'tool', title: 'Edit sheet', detail: step.label }));

export const CREATE_REPLY: AiChatReply = {
	text:      `Here's a ${SHEET_TITLE} sheet: four cost lines by quarter, totals that update as you edit, growth since Q1, and a budget check. Open it to watch the edits, or ask me to change anything.`,
	toolCalls: trace(CREATE_STEPS),
	sheetEdit: {
		sheetId: SHEET_ID,
		title:   SHEET_TITLE,
		base:    createSheet(30, 8, SHEET_TITLE),
		steps:   CREATE_STEPS,
	},
};

const REVISE_REPLY: AiChatReply = {
	text:      'Done: a Share column (each line as a percent of the total) with its own total, and your biggest cost, Salaries, highlighted.',
	toolCalls: trace(REVISE_STEPS),
	sheetEdit: { sheetId: SHEET_ID, title: SHEET_TITLE, steps: REVISE_STEPS },
};

const SHEET_WORDS = /\b(sheets?|spreadsheets?|budget|excel)\b/i;
const EDIT_WORDS = /\b(edit|change|make|revise|update|tweak|improve|add)\b/i;

/**
 * A scripted sheet reply, or null for another reply. Asking for a spreadsheet creates it;
 * asking to change a freshly created one revises it. The revise script applies once per
 * sheet, so after it, asking for a spreadsheet starts over.
 */
export const sheetReply = (message: string, history: { role: string; text: string }[]): AiChatReply | null => {
	const last = history.findLast(h => h.role === 'assistant' && (h.text === CREATE_REPLY.text || h.text === REVISE_REPLY.text));
	if(last?.text === CREATE_REPLY.text && EDIT_WORDS.test(message)) return REVISE_REPLY;
	return SHEET_WORDS.test(message) ? CREATE_REPLY : null;
};
