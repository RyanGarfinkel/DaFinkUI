import { MAX_COLS, MAX_ROWS } from './sheet';
import { FUNCTION_NAMES } from './formulas';

/**
 * Everything an agent needs to edit a sheet: the ops, the formula language, and the limits, built
 * from the same lists the editor uses so it can't drift. Put it in a system prompt or return it
 * from a "describe sheet settings" tool.
 */
export const SHEET_REFERENCE = `Sheet edits are SheetOps; an invalid op throws a SheetOpError that says what was wrong.

Addresses are A1 style: column letters then a 1-based row ("B3"). Ranges are "A1:C5". Rows and columns passed as numbers (at, col) are 0-based.
Limits: ${MAX_ROWS} rows by ${MAX_COLS} columns. Writing a cell past the edge grows the sheet.

VALUES  { type: 'setCells', cells: { A1: 'Item', B1: '12', C1: '=SUM(B2:B9)' } }
  Every value is a string, exactly as a person would type it: text, a number ("1,200", "$5.50" and "12%" are read as numbers), or a formula starting with "=".
  Keeps each cell's formatting. An empty string clears the value.

FORMATTING  { type: 'styleCells', range, style }
  style: { bold, italic: boolean; align: 'left' | 'center' | 'right'; color, fill: CSS color; format: 'general' | 'number' | 'currency' | 'percent' }
  Set a property to null to remove it. Numbers right-align by default; text left-aligns.

ROWS AND COLUMNS  { type: 'insertLines' | 'deleteLines', axis: 'row' | 'col', at, count }  |  { type: 'resizeCol', col, width (px) }  |  { type: 'setSize', rows?, cols? }
  Inserting or deleting re-points every formula. A reference to a deleted cell becomes #REF!.

SHEET  { type: 'rename', title }

FORMULAS
  Operators: + - * / ^ & (join text), comparisons = <> < > <= >=, postfix %, parentheses. References A1, $A$1 and ranges A1:B5.
  Functions: ${FUNCTION_NAMES.join(', ')}.
  Errors show as text: #DIV/0!, #REF!, #NAME?, #VALUE!, #NUM!, #CYCLE! (a formula that depends on itself), #ERROR! (can't parse). IFERROR(x, fallback) handles them.
  Prefer formulas over typed results (totals, averages, percentages) so the sheet stays live when someone edits the inputs.`;
