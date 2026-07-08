# DataTable

A full-featured, column-definition driven data table with client-side sorting, row selection (with indeterminate header checkbox), and pagination. Built on the same visual language as the static `Table` component.

---

## Installation

```bash
npx dafink-ui add data-table
```

No additional npm dependencies. Requires no other registry components.

---

## When to use

- Displaying structured datasets where users need to sort, scan, or select rows
- Admin dashboards, user lists, order tables, or any tabular data with more than a few rows
- When you need pagination for large datasets
- When you need bulk-selection of rows (e.g. bulk delete, export)

Do not use DataTable for simple read-only tables with a handful of rows — use the static `Table` component instead.

---

## Props

### DataTableProps

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | — | Array of data objects to display. |
| `columns` | `ColumnDef<T>[]` | — | Column definitions. Controls headers, keys, sorting, and custom rendering. |
| `keyField` | `keyof T & string` | — | The key in each row object used as a unique identifier. Must be unique per row. |
| `selectable` | `boolean` | `false` | When true, prepends a checkbox column. Enables row selection. |
| `onSelectionChange` | `(selected: T[]) => void` | `undefined` | Called whenever the set of selected rows changes. Receives the full row objects. |
| `pageSize` | `number` | `10` | Rows per page. Set to `0` to disable pagination and show all rows. |
| `className` | `string` | `""` | Additional Tailwind classes merged onto the root wrapper div. |
| `emptyMessage` | `string` | `"No data"` | Text shown when `data` is empty or when no rows exist after pagination. |

### ColumnDef

| Prop | Type | Default | Description |
|---|---|---|---|
| `key` | `keyof T & string` | — | The property key in each row object to read for this column. |
| `header` | `string` | — | Column header text. |
| `sortable` | `boolean` | `false` | When true, the header renders as a button and clicking it sorts by this column. |
| `width` | `string` | `undefined` | CSS width value (e.g. `"8rem"`, `"120px"`) applied to the column. |
| `render` | `(value: T[keyof T], row: T) => ReactNode` | `undefined` | Custom cell renderer. If omitted, `String(value)` is used. |

---

## Sorting Behavior

- Clicking a `sortable` column header for the first time sorts ascending.
- Clicking the same header again sorts descending.
- Clicking a third time clears the sort and restores original order.
- Only one column can be sorted at a time. Clicking a different sortable column resets any previous sort.
- Sorting is entirely client-side — the `data` array is sorted in memory.
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

### Keyboard behavior

| Element | Key | Behavior |
|---|---|---|
| Sortable column header button | Tab | Focuses the sort button |
| Sortable column header button | Enter / Space | Activates sort cycle (asc → desc → none) |
| Row checkbox | Tab | Focuses the checkbox |
| Row checkbox | Space | Toggles the checkbox |
| Header checkbox | Tab | Focuses the checkbox |
| Header checkbox | Space | Select all / deselect all |
| Prev / Next buttons | Tab | Focuses the button |
| Prev / Next buttons | Enter / Space | Navigates the page |

### ARIA attributes

- Sortable `<th>` elements have `aria-sort="ascending"`, `"descending"`, or `"none"` reflecting the current sort state.
- Non-sortable `<th>` elements have no `aria-sort` attribute.
- Header checkbox has `aria-label="Select all rows"`.
- Row checkboxes have `aria-label="Select row {rowKey}"`.
- Prev / Next pagination buttons have `aria-label="Go to previous page"` and `"Go to next page"`.
- Disabled pagination buttons use the native HTML `disabled` attribute, not just visual styling.

### Focus indicators

All interactive elements (sort buttons, checkboxes, pagination buttons) use:

```
focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring
```

### Structure

- Uses semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` — no ARIA role overrides needed.
- Sort buttons are real `<button type="button">` elements inside `<th>`, not `<th role="button">`.

---

## Container Queries

The DataTable root wrapper carries `@container`, establishing a container context. Layout within the component adapts to the table's own rendered width rather than the viewport.

| Breakpoint | Container width | Behavior |
|---|---|---|
| Below `@sm` | < 24rem (384px) | The pagination footer stacks vertically: the "Showing X–Y of Z" range label appears above the Prev/Next controls. |
| `@sm` and above | ≥ 24rem (384px) | The pagination footer is a single horizontal row with the range label on the left and pagination controls on the right. |

The `overflow-x-auto` on the root wrapper handles column overflow at any container width — horizontal scrolling kicks in before columns collapse.

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
| `border-input-border` | Checkbox border |
| `bg-surface` | Checkbox background |
| `focus-visible:ring-brand-ring` | Focus ring on all interactive elements |
| `accent-[var(--color-brand)]` | Checkbox accent (checked fill color) |
| `--duration-fast` | Hover and row transition duration |
