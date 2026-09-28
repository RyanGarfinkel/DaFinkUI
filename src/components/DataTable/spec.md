# DataTable

A full-featured, column-definition driven data table with client-side sorting, row selection (with indeterminate header checkbox), and pagination. Built on the same visual language as the static `Table` component.

---

## Installation

```bash
npx dafink-ui add data-table
```

No additional npm dependencies. Requires the `checkbox` registry component (installed automatically by the CLI).

---

## When to use

- Displaying structured datasets where users need to sort, scan, or select rows
- Admin dashboards, user lists, order tables, or any tabular data with more than a few rows
- When you need pagination for large datasets
- When you need bulk-selection of rows (e.g. bulk delete, export)

Do not use DataTable for simple read-only tables with a handful of rows; use the static `Table` component instead.

---

## Props

### DataTableProps

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | None | Array of data objects to display. |
| `columns` | `ColumnDef<T>[]` | None | Column definitions. Controls headers, keys, sorting, and custom rendering. |
| `keyField` | `keyof T & string` | None | The key in each row object used as a unique identifier. Must be unique per row. |
| `selectable` | `boolean` | `false` | When true, prepends a checkbox column. Enables row selection. |
| `onSelectionChange` | `(selected: T[]) => void` | `undefined` | Called whenever the set of selected rows changes. Receives the full row objects. |
| `pageSize` | `number` | `10` | Rows per page. Set to `0` to disable pagination and show all rows. |
| `className` | `string` | `""` | Additional Tailwind classes merged onto the root wrapper div. |
| `emptyMessage` | `string` | `"No data"` | Text shown when `data` is empty or when no rows exist after pagination. |

### ColumnDef

| Prop | Type | Default | Description |
|---|---|---|---|
| `key` | `keyof T & string` | None | The property key in each row object to read for this column. |
| `header` | `string` | None | Column header text. |
| `sortable` | `boolean` | `false` | When true, the header renders as a button and clicking it sorts by this column. |
| `width` | `string` | `undefined` | CSS width value (e.g. `"8rem"`, `"120px"`) applied to the column. |
| `render` | `(value: T[keyof T], row: T) => ReactNode` | `undefined` | Custom cell renderer. If omitted, `String(value)` is used. |

---

## Sorting Behavior

- Clicking a `sortable` column header for the first time sorts ascending.
- Clicking the same header again sorts descending.
- Clicking a third time clears the sort and restores original order.
- Only one column can be sorted at a time. Clicking a different sortable column resets any previous sort.
- Sorting is entirely client-side; the `data` array is sorted in memory.
- Changing the sort direction resets pagination back to page 1.
- The active sort column's header button shows an up-chevron (↑) for ascending, down-chevron (↓) for descending. Unsorted sortable headers show a neutral double-chevron (⇅) at reduced opacity.

---

## Selection Behavior

When `selectable={true}`:

- A checkbox column is prepended as the first column.
- The header checkbox selects all rows in `data` (all pages).
- If all rows are selected, the header checkbox becomes unchecked. Clicking it deselects all.
- If some (but not all) rows are selected, the header checkbox is in an **indeterminate** state.
- Each row has its own checkbox that toggles that row's selection independently.
- Selected rows receive a `bg-surface-active` background.
- `onSelectionChange` is called with the array of full row objects on every selection change.

---

## Pagination Behavior

When `pageSize > 0` (the default):

- Rows are split into pages of `pageSize`.
- A footer shows "Showing X–Y of N" indicating the current range and total row count.
- **Prev** and **Next** buttons navigate between pages.
- **Prev** is disabled on the first page; **Next** is disabled on the last page.
- Changing the sort resets to page 1.
- Sorting changes reset the page to 1 automatically.

When `pageSize={0}`:

- All rows are shown with no pagination footer.

---

## Accessibility

### Grid Keyboard Navigation

DataTable is always a keyboard grid: the `<table>` renders `role="grid"` and uses roving tabindex, so it's a single Tab stop and Arrow keys move between cells instead of Tab stepping through every control one by one. Only one thing in the whole grid has `tabIndex={0}` at a time (row 0 = header, rows 1..N = body).

**Only a cell with something focusable inside it is ever a stop, and Tab/Arrow keys skip everything else.** If a cell contains a checkbox, a sort button, a row-action button, or an inline `Input`/`Select` from a custom `render()`, *that element* is the stop — reached with real, native DOM focus, never the wrapping `<td>`/`<th>`. A plain-text cell (no `render`, or a `render` whose output has nothing focusable in it) isn't a stop at all: the Arrow keys scan straight past it to the next cell in that direction that *does* have focusable content, exactly like it wasn't there. **Arrow keys wrap at the ends** — same as the other roving-tabindex composites in this library (Radio, ToggleGroup, MenuBarNav): running off the last focusable cell in a row/column comes back around to the first one in that same row/column, rather than stopping dead. **If a whole row or column has no focusable cell at all**, the Arrow key is a genuine no-op — there's nothing to wrap to, so focus stays put. **If nothing in the entire table is focusable — no `selectable`, no sortable column, no `render` that produces a button/input/link/checkbox — the grid isn't a Tab stop at all**: Tab skips straight over it to whatever's next on the page, same as a plain, non-interactive `<table>`. Because there's exactly one stop per grid position (or none), Enter/Space are handled natively by whatever's actually focused, with no handling of DataTable's own — a focused button responds to both, and the header/row `Checkbox` also responds to both, since [Checkbox itself](../Checkbox/spec.md) adds Enter support (native `<input type="checkbox">` only toggles on Space in every browser, which reads as broken next to a button). That fix lives on `Checkbox`, not here, so it works the same way anywhere `Checkbox` is used, not just inside this grid.

**A composite widget rendered inside a cell keeps its own Left/Right arrow-key behavior**, not just its own Enter/Space handling — a `ToggleGroup`, `RadioGroup`, or similar already calls `preventDefault()` on the arrow keys it consumes internally (to move between its own items) without calling `stopPropagation()`, so the grid's own Left/Right handler — which runs on the normal bubble phase, after the widget's own handler — checks `event.defaultPrevented` first and backs off whenever the widget already claimed the key, rather than also trying to move to a neighboring column.

**Up/Down always belong to the grid, even inside such a widget.** `ToggleGroup` and `RadioGroup` both treat ArrowUp/Down identically to ArrowLeft/Right (so they also work in a vertically-stacked layout), and since a widget with 2+ items always has a wrap target in either direction, it would call `preventDefault()` on every Up/Down press too — deferring to that the same way Left/Right do would mean Up/Down could never escape the cell at all, trapping the user inside it. The grid instead intercepts ArrowUp/Down on the *capture* phase — before the event reaches the widget's own (bubble-phase) handler at all — so there's no `preventDefault()` to defer to in the first place, and Up/Down reliably move to a different row no matter what's focused inside the cell.

| Key | Behavior |
|---|---|
| `Tab` | Moves focus onto the grid at its current (or first) focusable cell, or off the grid entirely if focus is already inside it — or does nothing at all if nothing in the grid is focusable |
| `Shift+Tab` | Same, in reverse |
| `Arrow Down` / `Arrow Up` | Moves to the next/previous focusable cell in the same column, skipping any cell with nothing focusable in it and wrapping at the top/bottom; no-op if the column has no other focusable cell |
| `Arrow Left` / `Arrow Right` | Moves to the next/previous focusable cell in the same row, skipping any cell with nothing focusable in it and wrapping at the start/end; no-op if the row has no other focusable cell |
| `Enter` | Native activation for whatever's focused (a sort button, a `render`-based action button, or the `Checkbox` component, which handles Enter itself) — no DataTable-specific handling |
| `Space` | Native activation/toggle for whatever's focused — a button, a checkbox. Already works on every control type with no help from DataTable |

If a cell's focused content needs arrow keys for its own native purpose — a text `Input`'s cursor movement, a `Select`'s value change, a `Textarea` — the grid doesn't intercept them: Arrow Up/Down/Left/Right pass straight through instead of moving to a neighboring cell. **Consumers with per-cell text/select inline editing** (e.g. `JobApplicationTracker`'s columns of `Input`/`Select`) can still Tab into the table and type in whichever field is currently the roving stop, but moving to a *different* cell from inside such a field needs Tab (which leaves the grid entirely, since nothing else in it has `tabIndex 0` while focus sits inside a passthrough field) rather than an arrow key — an explicit trade-off for keeping the grid a single, consistent Tab stop everywhere else.

**Which cell is "first" is resolved after render, not guessed.** A `useEffect` scans the table for the first cell (row-major: header row, then each body row, left to right) that actually contains a focusable element, and that's where `activeCell` starts — or `null`, deliberately, if there isn't one. The same effect re-validates `activeCell` whenever `data`/`columns`/`selectable` change (e.g. after sorting reorders which row holds which employee), falling back to the new first-focusable cell if the old position no longer has one.

**`tabIndex` is set declaratively wherever the cell's content is knowable up front** — the checkbox column and sort-header buttons get their `tabIndex` straight from render output (`activeCell`'s row/col compared inline), correct from the very first paint, including server-rendered HTML before hydration. A plain-text cell (no `render`) never gets a `tabIndex` prop at all — it's simply not part of the roving-tabindex set. Only a `render`-based cell's content is genuinely unknown ahead of time (it could return plain text, a button, an input — anything), so that one case is resolved in a `useEffect`, after the fact: it inspects what actually rendered and applies `tabIndex` to the first focusable element found, or removes any prior `tabindex` entirely if there isn't one. This split exists because an effect-only implementation was tried first and had a real gap: with no `tabIndex` in the initial HTML at all, every sort button and checkbox was natively tabbable simultaneously until that effect ran — visible as, for instance, Tab reaching a "Role" or "Department" sort button that should have been `tabIndex="-1"`.

### ARIA attributes

- The `<table>` has `role="grid"`; `<tr>`/`<th>`/`<td>` keep their implicit `row`/`columnheader`/`gridcell` roles from that context.
- Sortable `<th>` elements have `aria-sort="ascending"`, `"descending"`, or `"none"` reflecting the current sort state.
- Non-sortable `<th>` elements have no `aria-sort` attribute.
- Header and row checkboxes are the shared `Checkbox` component (see `src/components/Checkbox`), not a hand-rolled `<input>`. Header checkbox has `aria-label="Select all rows"`; row checkboxes have `aria-label="Select row {rowKey}"`.
- Prev / Next pagination buttons have `aria-label="Go to previous page"` and `"Go to next page"`.
- Disabled pagination buttons use the native HTML `disabled` attribute, not just visual styling.

### Focus indicators

Each `<th>`/`<td>` carries its own focus-visible ring, drawn inset since a table cell has no room for a ring offset:

```
focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ring
```

The Prev/Next and numbered pagination buttons use the standard offset ring:

```
focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring
```

### Structure

- Uses semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` with `role="grid"` on the `<table>`.
- Sort buttons are real `<button type="button">` elements inside `<th>`, not `<th role="button">`.

---

## Container Queries

The DataTable root wrapper carries `@container`, establishing a container context. Layout within the component adapts to the table's own rendered width rather than the viewport.

| Breakpoint | Container width | Behavior |
|---|---|---|
| Below `@sm` | < 24rem (384px) | The pagination footer stacks vertically: the "Showing X–Y of Z" range label appears above the Prev/Next controls. |
| `@sm` and above | ≥ 24rem (384px) | The pagination footer is a single horizontal row with the range label on the left and pagination controls on the right. |

The `overflow-x-auto` on the root wrapper handles column overflow at any container width; horizontal scrolling kicks in before columns collapse.

---

## Tokens used

| Token | Used for |
|---|---|
| `border-surface-border` | Table outer border, dividers between rows, pagination footer border |
| `bg-surface-active` | Header row background, selected row background |
| `bg-surface-hover` | Non-selected row hover background |
| `text-text` | Cell text, sort button active state |
| `text-text-muted` | Header label text, pagination range text |
| `text-text-subtle` | Neutral sort icon on unsorted columns |
| `focus-visible:ring-brand-ring` | Focus ring on all interactive elements |
| `bg-brand` / `text-brand-fg` / `border-brand` | `numbered` Paginator variant: current-page button fill, text, and border |
| `--duration-fast` | Hover and row transition duration |
