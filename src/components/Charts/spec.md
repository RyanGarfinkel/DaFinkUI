# Charts

Recharts-based chart primitives: `LineChart`, `BarChart`, `AreaChart`, `DonutChart`, and `RadarChart`. Requires Recharts as an npm dependency; install it alongside the component.

## Installation

```bash
npx dafink-ui add charts
```

npm dependency: `recharts`

## Components

### LineChart

Renders one or more lines over a shared x-axis.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | ChartDataPoint[] | required | Array of data objects |
| xKey | string | required | Key to use for the x-axis |
| series | ChartSeries[] | required | Lines to render |
| height | number | 240 | Chart height in px |
| showLegend | boolean | true | Whether to show the legend |
| showGrid | boolean | true | Whether to show the background grid |
| className | string | "" | Extra classes |

### BarChart

Vertical bars with optional stacking.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | ChartDataPoint[] | required | Array of data objects |
| xKey | string | required | Key to use for the x-axis |
| series | ChartSeries[] | required | Bar groups to render |
| stacked | boolean | false | Stack series on top of each other |
| height | number | 240 | Chart height in px |
| showLegend | boolean | true | Whether to show the legend |
| showGrid | boolean | true | Whether to show the background grid |
| className | string | "" | Extra classes |

### AreaChart

Filled area chart with optional stacking.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | ChartDataPoint[] | required | Array of data objects |
| xKey | string | required | Key to use for the x-axis |
| series | ChartSeries[] | required | Areas to render |
| stacked | boolean | false | Stack areas on top of each other |
| height | number | 240 | Chart height in px |
| showLegend | boolean | true | Whether to show the legend |
| showGrid | boolean | true | Whether to show the background grid |
| className | string | "" | Extra classes |

### DonutChart

Donut (or pie) chart from named slices.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | DonutSlice[] | required | Array of `{ label, value, color? }` |
| innerRadius | number | 0.65 | Inner radius as a fraction of outer (0 = pie) |
| height | number | 240 | Chart height in px |
| showLegend | boolean | true | Whether to show the legend |
| className | string | "" | Extra classes |

### RadarChart

Polygon chart comparing series across shared category axes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | ChartDataPoint[] | required | Array of data objects |
| xKey | string | required | Key to use for the category (angle) axis |
| series | ChartSeries[] | required | Polygons to render |
| height | number | 240 | Chart height in px |
| showLegend | boolean | true | Whether to show the legend |
| showGrid | boolean | true | Whether to show the polar grid |
| className | string | "" | Extra classes |

## Shared types

```ts
interface ChartDataPoint { [key: string]: string | number }
interface ChartSeries { key: string; label: string; color?: string }
interface DonutSlice   { label: string; value: number; color?: string }
```

## When to use

- **LineChart**: trends over time; multiple metrics on the same axis
- **BarChart**: comparisons across categories; use `stacked` for part-to-whole
- **AreaChart**: cumulative values or emphasising volume beneath a trend line
- **DonutChart**: part-to-whole proportions (5 slices or fewer for readability)
- **RadarChart**: comparing multiple entities across several shared metrics or dimensions at once (e.g. comparing products, teams, or skill sets across 3+ axes). Avoid it for more than ~8 categories (the polygon gets unreadable) and avoid it for trends over time; use `LineChart` or `AreaChart` instead

## Theming

All chart elements use CSS custom properties (`var(--color-brand)`, `var(--color-surface)`, etc.) so they respect the active design system theme automatically.

## Accessibility notes

- Every chart's SVG root gets Recharts' `accessibilityLayer` (on by default; none of these five charts disable it): `tabIndex={0}` and `role="application"`, plus focus/blur/keydown wiring, so `Tab` reaches the chart and `ArrowLeft`/`ArrowRight` step a shared tooltip through each data point (each slice, for `DonutChart`); `Enter` pins/unpins the active tooltip in place.
- `LineChart`, `AreaChart`, `DonutChart`, and `RadarChart` wrap their `ResponsiveContainer` in a `<div role="img" aria-label="… chart">` for an accessible name. `BarChart` instead passes a `title` prop straight to Recharts, which renders it as the SVG's own `<title>` element — same effect, different mechanism. Neither approach exposes the underlying data as text.
- Legends are static labels only: none of the five charts wire a click handler to their `<Legend>`, so activating a legend entry does not toggle that series' visibility (unlike Recharts' own optional capability for this).
- `DonutChart`'s slice-enlargement effect (the `activeShape` sector) is driven by this component's own `onMouseEnter`/`onMouseLeave` state, not by Recharts' keyboard-driven active index — keyboard users still get the stepped tooltip, but not the enlarged-slice visual.
- Charts are decorative by nature. Always pair a chart with a data table or text summary for screen-reader users.
- Color is not the only differentiator; series also differ by label and position.
