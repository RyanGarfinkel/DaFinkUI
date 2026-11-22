# SheetEditor

A spreadsheet editor: a cell grid with formulas, a formula bar, formatting, selection stats, and CSV export. You own the sheet and its undo history.

- a virtualized grid (only visible rows render), column headers, row headers, drag-to-resize columns
- a formula bar for the active cell
- undo/redo, host actions (`toolbarEnd`) and download at the end of the formula bar row
- custom text and fill colors (a color picker with Apply, beside the swatches) and custom number formats (`CellStyle.format` is a preset name or a pattern such as `#,##0.0 "kg"`: `0`/`#` digits, `,` thousands, `.` decimals, `%` ×100, quoted or `\`-escaped literals)
- horizontal and vertical (top/middle/bottom) alignment; rows are a fixed height, so vertical alignment shifts text only slightly
- function suggestions as you type a formula (see Accessibility for the keys)
- cell references in a formula are color-coded: the formula bar paints each reference in its own color, and the referenced cells are tinted and outlined in the grid, with their row and column headers tinted too. Shown for the active cell's formula and while editing
- a floating toolbar, centered over the bottom of the grid: bold, italic, text color, fill color, alignment, number format, cell borders, charts, and a ⋮ menu with cut/copy/paste, clear contents, and insert/delete rows and columns. Its menus open upward
- cell borders (`CellStyle.borders`: any of `top`/`right`/`bottom`/`left`) and charts (`Sheet.charts`: line, bar or area over a selected range, shown in a strip under the grid; a text first row names the series and a text first column labels the points)
- a formula engine (see below) with cycle detection and error values
- a status line with Sum / Average / Count of the selected cells

It holds no document state of its own except the selection. The host owns the `Sheet` and its undo history, so the same editor works for a sheet saved to an API, a local draft, or one an AI is editing.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| sheet | `Sheet` | required | The sheet being edited (controlled). |
| onChange | `(next: Sheet, coalesceKey?: string) => void` | required | Every edit, as the whole next sheet. Consecutive changes sharing a `coalesceKey` (typing in one cell, dragging a column edge) belong in one undo step. |
| history | `EditHistory` | None | `{ undo, redo, canUndo, canRedo }`: undo/redo from the toolbar and ⌘Z / ⇧⌘Z. Omit to hide the undo controls. |
| toolbarEnd | `ReactNode` | None | Host actions at the end of the formula bar row, before Download. Use the exported `SHEET_TOOLBAR_BUTTON` class so they match. |
| status | `string` | None | A host message for the polite status line. Shown instead of the editor's own messages while set. |
| highlight | `string` | None | Cells someone else (like an AI) is editing right now, in A1 notation (`"B2:C5"`): outlined, pulsing (when motion is allowed), tagged, and scrolled into view. |
| highlightLabel | `string` | `'AI'` | Text on the tag over the highlighted range. |
| onAsk | `(context: SheetAskContext) => void` | None | Adds an **Ask AI** (lasso) button to the toolbar. Called with the selected range, the active cell, its size, and the typed values in the selection (tab-separated, cut off at 600 characters). |
| className | `string` | `''` | Extra classes on the root. The editor fills its container, so give the container or this a height. |

Extends native `<div>` attributes (except `onChange`).

## The Sheet model

```ts
interface Sheet {
	title:     string;
	rows:      number;                 // grid size; paste and insert grow it
	cols:      number;
	cells:     Record<string, Cell>;   // keyed by A1 address; blank, unstyled cells are absent
	colWidths: Record<number, number>; // column index → px; missing = 104
}

interface Cell {
	value:   string;                   // what the user typed: "12", "Rent", "=SUM(A1:A5)"
	bold?, italic?: boolean;
	align?:  'left' | 'center' | 'right';
	color?, fill?: string;             // CSS colors
	format?: 'general' | 'number' | 'currency' | 'percent';
}
```

`createSheet(rows, cols, title)` makes an empty one. `createEvaluator(sheet).valueAt(row, col)` computes any cell's value (0-based), for reading a sheet outside the editor.

## Formulas

A cell starting with `=` is a formula. Operators: `+ - * / ^ &` (concatenate), comparisons `= <> < > <= >=`, a postfix `%`, parentheses. References are `A1` (with optional `$`) and ranges `A1:B5`.

Functions: `SUM PRODUCT AVERAGE MIN MAX MEDIAN COUNT COUNTA ABS SQRT INT ROUND MOD POWER IF IFERROR AND OR NOT CONCAT CONCATENATE LEN UPPER LOWER TRIM LEFT RIGHT`.

Errors show their code, never just color: `#DIV/0!`, `#REF!` (deleted reference), `#NAME?` (unknown function or name), `#VALUE!`, `#NUM!`, `#CYCLE!` (circular reference), `#ERROR!` (can't parse). Errors propagate through formulas that use them; wrap with `IFERROR` to handle them.

Typed text is read as a number when it looks like one (`1,200`, `$5.50`, `12%`); otherwise it is text. Inserting or deleting rows and columns rewrites every reference that points past the change.

## Editing a sheet with ops (agents)

`sheetops.ts` (exported from the package index) is the one validated way to change a sheet outside the editor: `applySheetOp(s)` throws a `SheetOpError` for an invalid op, `applySheetOpsLenient` skips what no longer fits and returns it, and `diffSheets(a, b)` produces the ops that turn one sheet into another (what an undo history is made of). The ops are `setCells`, `styleCells`, `insertLines`, `deleteLines`, `resizeCol`, `setSize`, `rename` and `replaceCells`. `SHEET_REFERENCE` is a ready-made system-prompt section describing them, the formula language and the limits, built from the same lists the editor uses so it can't drift. The AI chat block uses these to let an agent edit a sheet live beside you.

## Clipboard

Copy and cut put the selected cells' typed values on the clipboard as tab-separated text; paste reads tab-separated text (so it works with other spreadsheets) at the selection's top-left cell and grows the grid if needed. Formulas are copied as text and are **not** re-pointed relative to the new location.

## Downloads

The Download menu exports the used area with number formats applied, as `.csv` or `.tsv`.

## Interactive States

- Toolbar buttons use the shared hover (`bg-surface-hover`) and focus-visible (`ring-2 ring-brand-ring`) treatment; toggles (bold, italic, align) show `aria-pressed` with `bg-surface-active`. Disabled undo/redo are dimmed and inert.
- Cells: the selection range is tinted (`bg-brand/10`), the active cell has a 2px inset `ring-brand-ring`. Row and column headers of the selection are highlighted. The grid has no outline of its own: the active cell's ring is its focus indicator.
- Column edges show a `bg-brand/30` handle on hover for resizing.
- Highlighted cells (from `highlight`) get a 2px inset `ring-brand` that pulses under `motion-safe`, plus a tag; the tag and outline are not the only signal because the host's status line names what the AI is doing.

## Accessibility

- The editor is a `role="region"` named `"<title> editor"`. Tab order: formula bar, grid, toolbar, then onward.
- The toolbar is `role="toolbar"`; Left/Right arrows move between its buttons.
- The grid is `role="grid"` with `aria-rowcount`, `aria-colcount`, `aria-multiselectable`, and a single tab stop using `aria-activedescendant` for the active cell. Cells are `gridcell`s with `aria-colindex`/`aria-rowindex` and `aria-selected`. Only rows near the viewport are rendered, so counts come from the sheet, not the DOM.
- Keys: arrows move (Shift extends, ⌘/Ctrl jumps to the edge), Tab/Shift+Tab move across (leaving the grid at the last column), Enter/F2 edit, typing replaces, Escape cancels, Delete clears contents, ⌘A selects all, ⌘B/⌘I format, ⌘C/X/V clipboard, ⌘Z/⇧⌘Z undo/redo, Home/End/Page Up/Page Down.
- While typing a formula, an arrow key right after `=`, an operator, `(` or `,` inserts a reference to the neighbouring cell of the one being edited (in E2, Up gives `E1`; Down then Left gives `D3`). More arrows move that reference, Shift+arrow extends it to a range (`D1:D2`), and any other key ends it. Elsewhere in a formula the arrows move the caret as usual.
- While typing a function name in a formula, a suggestion list opens under the formula bar with each match's signature and a one-line description. Matching is by name prefix, then anywhere in the name, then by keyword, so "mean" finds AVERAGE and "total" finds SUM. Up/Down move through the list, Tab or Enter inserts the name with an opening parenthesis, and clicking a row does the same. Typing on narrows the list; a complete name with no other match closes it. The list is `role="listbox"` and a polite live region announces the count and the selected function.
- While editing, Enter commits and moves down (Shift+Enter: up), Tab commits and moves right, Escape cancels. Focus returns to the grid after every commit or cancel.
- Errors always show their code text. Cell colors are user data: when a fill is set without a text color, text defaults to dark so it stays readable in dark mode.
- Column resizing is pointer-only; the same widths can be set by the host through `colWidths`.
- Status messages ("Pasted 2 × 2", "Inserted 1 row") are announced through a polite live region.

## When to Use

Use SheetEditor for editable tabular data where people need formulas, formatting and quick totals: budgets, trackers, lightweight calculators, or a sheet an AI edits alongside someone. For read-only tables use `Table`; for a sortable list with row actions use a data table.

It is not a full Excel: one sheet per editor, no cross-sheet references, floating or resizable charts (chart ranges don't shift when rows or columns are inserted), merged cells, filters or relative formula copying.

## Tokens Used

`surface`, `surface-hover`, `surface-active`, `surface-border`, `input-border`, `text`, `text-muted`, `danger`, `brand`, `brand-ring`, `--radius-sm`, `--radius-lg`, `--border-width`, `--duration-fast`.

## Installation

```bash
npx dafink-ui add sheet-editor
```

npm dependencies: none
Registry dependencies: `menu`, `popover`, `select`
