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

- Charts are decorative by nature. Always pair a chart with a data table or text summary for screen-reader users.
- Tooltips are keyboard-accessible via Recharts' built-in implementation.
- Color is not the only differentiator; series also differ by label and position.
