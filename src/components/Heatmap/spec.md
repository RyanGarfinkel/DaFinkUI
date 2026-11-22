# Heatmap

A grid of cells shaded by value, for spotting patterns across two dimensions such as activity by day and hour. Built from a real table with a light-to-dark scale and a legend, and no dependencies.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `(number \| null)[][]` | required | One array per row. `null` marks a cell with no data, drawn as a dashed outline. |
| rowLabels | `string[]` | None | Labels down the left edge, one per row. |
| columnLabels | `string[]` | None | Labels across the top, one per column. |
| min | `number` | Smallest value | Value shaded as the lightest cell. Values below it clamp to the lightest shade. |
| max | `number` | Largest value | Value shaded as the darkest cell. Values above it clamp to the darkest shade. |
| showValues | `boolean` | `false` | Prints each value inside its cell, on a small surface chip. |
| formatValue | `(value: number) => string` | Rounded to 2 places | Formats values in cells, tooltips, the legend and screen-reader text. |
| showLegend | `boolean` | `true` | Shows the light-to-dark scale with its low and high values. Hidden when `data` has no numbers. |
| label | `string` | `'Heatmap'` | Accessible name of the table. |
| className | `string` | `''` | Extra classes on the root. |

Extends all native `<div>` HTML attributes.

## Shading

A cell's shade is the brand color mixed into the surface color, from 8% (at `min`) to 85% (at `max`), so it follows light and dark themes. When every value is equal the cells take the middle shade.

## Interactive States

Non-interactive. There is no hover, focus or disabled state: cells are not focusable, and values are available through the table, tooltips and `showValues`.

## Accessibility

- Rendered as a `<table>` named by `label`. Column labels are `<th scope="col">` and row labels are `<th scope="row">`.
- Every cell has its value as text (`sr-only` unless `showValues`), and empty cells read "No data". Cells with labels also have a `title` such as "Mon, Noon: 5".
- Color is not the only signal: the legend gives the scale's low and high values, and `showValues` prints the numbers. The value chip sits on the surface color, so its text meets 4.5:1 at every shade.
- The legend is `aria-hidden`; its information is already in the cells.

## When to Use

Use a Heatmap to compare many values at once and spot clusters or gaps across two categories (activity by weekday and hour, scores by team and quarter). For trends over one dimension use `LineChart` or `AreaChart`; for exact values in a few rows, use `Table`.

## Tokens Used

`brand` and `surface` (cell shade, mixed with `color-mix`), `surface-border` (empty cells), `text` and `text-muted` (chips, labels, legend), `radius-sm`, `border-width`.

## Installation

```bash
npx dafink-ui add heatmap
```

npm dependencies: none
No registry dependencies.
