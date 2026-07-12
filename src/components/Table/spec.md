# Table

A set of composable table subcomponents for displaying structured, tabular data. Supports sortable columns, row striping, and hover highlights. All subcomponents are named exports from `Table.tsx`.

---

## Subcomponents

| Subcomponent   | Element    | Description                                               |
|----------------|------------|-----------------------------------------------------------|
| `Table`        | `<table>`  | Outer wrapper. Applies full-width, border-collapse, optional striping. |
| `TableHead`    | `<thead>`  | Header section wrapper. Applies header background.        |
| `TableBody`    | `<tbody>`  | Body section wrapper. Applies row dividers.               |
| `TableRow`     | `<tr>`     | Row wrapper. Hover highlight on body rows; suppressed on header rows. |
| `TableHeader`  | `<th>`     | Header cell. Optional sort affordance.                    |
| `TableCell`    | `<td>`     | Body cell.                                                |

---

## Props

### Table

| Prop        | Type                     | Default     | Description                                                                        |
|-------------|--------------------------|-------------|-------------------------------------------------------------------------------------|
| `striped`   | `boolean`                | `false`     | Alternates odd/even row background colors in the body. No effect when `variant="minimal"`. |
| `variant`   | `'default' \| 'minimal'` | `'default'` | Visual style. See Variants below.                                                  |
| `className` | `string`                 | `''`        | Additional classes merged onto the `<table>` element.                              |
| `...props`  | `TableHTMLAttributes<HTMLTableElement>` | - | All native table attributes are forwarded. |

### TableHead / TableBody

| Prop        | Type     | Default | Description                             |
|-------------|----------|---------|-----------------------------------------|
| `className` | `string` | `''`    | Additional classes merged onto the element. |
| `...props`  | `HTMLAttributes<HTMLTableSectionElement>` | - | All native section attributes forwarded. |

### TableRow

| Prop        | Type      | Default | Description                                                              |
|-------------|-----------|---------|--------------------------------------------------------------------------|
| `header`    | `boolean` | `false` | When `true`, suppresses hover background (used inside `<TableHead>`).    |
| `className` | `string`  | `''`    | Additional classes merged onto the `<tr>` element.                       |
| `...props`  | `HTMLAttributes<HTMLTableRowElement>` | - | All native tr attributes forwarded. |

### TableHeader

| Prop            | Type                          | Default     | Description                                                  |
|-----------------|-------------------------------|-------------|--------------------------------------------------------------|
| `sortDirection` | `'asc' \| 'desc' \| null`     | `undefined` | Current sort direction. Renders sort icon when set.          |
| `onSort`        | `() => void`                  | `undefined` | Callback fired when the sort button is clicked. Providing this prop makes the header sortable. |
| `className`     | `string`                      | `''`        | Additional classes merged onto the `<th>` element.           |
| `...props`      | `ThHTMLAttributes<HTMLTableCellElement>` | - | All native th attributes forwarded. |

### TableCell

| Prop        | Type     | Default | Description                                          |
|-------------|----------|---------|------------------------------------------------------|
| `className` | `string` | `''`    | Additional classes merged onto the `<td>` element.   |
| `...props`  | `TdHTMLAttributes<HTMLTableCellElement>` | - | All native td attributes forwarded. |

---

## Variants

The `variant` prop on `Table` is threaded down to all subcomponents via context: you only ever set it on the outer `<Table>`, never on individual subcomponents.

| Variant     | Look                                                                                                    |
|-------------|-----------------------------------------------------------------------------------------------------------|
| `'default'` | Card-like: outer border, rounded corners, filled header background, `divide-y` row separators, optional `striped` zebra rows. |
| `'minimal'` | Flat, borderless list look (matches the docs site's `PropsTable`): no outer wrapper border, no header background fill, no zebra striping, no vertical column borders. Only a `border-b border-surface-border` under the header cells and under each body row. Header cells are `text-xs font-medium text-text-muted uppercase tracking-wide`. Body cells are `py-3 align-top text-sm text-text`; pass `className` per `<TableCell>` (e.g. `font-mono`, `text-text-muted`) to differentiate columns. |

`striped` has no effect when `variant="minimal"`: the two are mutually exclusive by design (minimal is the flat, no-fill look).

---

## Sort Icons

| `sortDirection` | Icon displayed |
|-----------------|----------------|
| `'asc'`         | `▲`            |
| `'desc'`        | `▼`            |
| `null`          | `⇅` (unsorted) |

---

## Interactive States

### TableRow (body)
- **Default**: transparent background
- **Hover**: `bg-surface-hover`, 150ms ease transition
- **No hover on header rows**: pass `header` prop to opt out

### TableHeader (sortable)
- **Default**: `text-text-muted` label
- **Hover**: `text-text`, color shift, 150ms ease transition
- **Focus-visible**: `ring-2 ring-offset-2 ring-brand-ring` on the inner `<button>`, keyboard-accessible, never shown on mouse click
- All transitions respect `prefers-reduced-motion` via `motion-reduce:transition-none`

---

## Accessibility

- Sortable `<TableHeader>` cells set `aria-sort` on the `<th>`:
  - `sortDirection="asc"` → `aria-sort="ascending"`
  - `sortDirection="desc"` → `aria-sort="descending"`
  - `sortDirection={null}` → `aria-sort="none"`
- Sort affordance is a real `<button type="button">` inside the `<th>`, fully keyboard-operable
- Sort icons are wrapped in `aria-hidden="true"` spans so screen readers rely on `aria-sort` alone
- The outer `<table>` accepts `aria-label` or `aria-labelledby` via spread props for screen reader context
- Use `scope="col"` on `<TableHeader>` elements for complex tables

---

## When to Use

- Displaying structured data with rows and columns where relationships between cells matter
- Lists of records (users, orders, products) where each row is an entity
- Data that benefits from column-level sorting
- Use `striped` when the table has many rows and visual row separation aids scanning
- Use `variant="minimal"` for flatter, denser tables inside docs, sidebars, or panels where a card-style border would be too heavy
- Prefer this over a plain `<ul>` whenever the data is genuinely tabular (two-dimensional)

**Do not use** for layout purposes. Tables are for data.

---

## Tokens Used

| Token                  | Usage                                      |
|------------------------|--------------------------------------------|
| `bg-surface-active`    | Header row background                      |
| `bg-surface-hover`     | Body row hover state; even rows in striped |
| `bg-surface`           | Odd rows in striped mode                   |
| `border-surface-border`| Table outer border, row dividers           |
| `text-text`            | Cell body text                             |
| `text-text-muted`      | Header cell label text                     |
| `text-text-subtle`     | Unsorted icon color                        |
| `ring-brand-ring`      | Focus-visible ring on sort button          |
