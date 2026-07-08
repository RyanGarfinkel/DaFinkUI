# Timeline

A vertical step list with numbered indicators and connector lines. Use it to represent ordered sequences — installation guides, onboarding flows, multi-step processes, or activity feeds.

## Installation

```bash
npx dafink-ui add timeline
```

No npm dependencies. No registry dependencies.

---

## Components

`Timeline` — wrapper that injects index, last-item, and variant context into its children.  
`TimelineItem` — a single step with an indicator dot, title, connector line, and optional content.

---

## Props

### Timeline

| Prop        | Type                          | Default      | Description                                                   |
|-------------|-------------------------------|--------------|---------------------------------------------------------------|
| `animate`   | `"stagger" \| "none"`        | `"stagger"`  | Mount animation. `stagger` fades and slides each item in with a cascading delay; the container holds its full size from the start (no layout shift). Use `"none"` when items arrive dynamically and you're animating them yourself. |
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction. `horizontal` places items in a row with the connector line across the top. |
| `variant`   | `"brand" \| "muted"`         | `"brand"`    | Controls the indicator dot color. `brand` = filled brand blue; `muted` = outlined neutral. |
| `className` | `string`                      | `""`         | Additional classes on the wrapper `<div>`.                    |
| `children`  | `React.ReactNode`             | —            | One or more `<TimelineItem>` elements.                        |

### TimelineItem

| Prop        | Type              | Default | Description                                                                 |
|-------------|-------------------|---------|-----------------------------------------------------------------------------|
| `title`     | `string`          | —       | **Required.** Step label shown next to the indicator.                       |
| `indicator` | `React.ReactNode` | —       | Custom indicator content. Defaults to the auto-incremented step number.     |
| `className` | `string`          | `""`    | Additional classes on the item wrapper `<div>`.                             |
| `children`  | `React.ReactNode` | —       | Optional body content rendered below the title.                             |

> `_index`, `_isLast`, and `_variant` are internal props injected by `<Timeline>`. Do not set them manually.

---

## Variants

| Variant  | Indicator style                                     |
|----------|-----------------------------------------------------|
| `brand`  | Filled brand-color circle, `text-brand-fg` text (light-theme: white; dark-theme: near-black) |
| `muted`  | Surface-active background, neutral text, light border |

---

## Behavior

- **Auto-numbering** — when no `indicator` is provided, each `TimelineItem` displays its 1-based position.
- **Connector line** — a thin vertical line (or horizontal, in `direction="horizontal"`) connects each item to the next. The last item has no connector.
- **Custom indicator** — pass any `ReactNode` as `indicator` (icon, checkmark, status dot, etc.) to replace the number.
- **Stagger animation** — with `animate="stagger"` (default), items animate in on mount using opacity + transform. The container occupies its full final size immediately, so there is no layout shift as items appear.
- **Dynamic items** — when items are added over time (e.g. a live log), set `animate="none"` and apply your own per-item animation via `className` on each `<TimelineItem>`.

### Choosing `animate`

| Situation | Recommended value |
|---|---|
| All data available at render time | `"stagger"` (default) |
| Items arrive one by one over time | `"none"` — animate per-item via `className` |

---

## Accessibility

- Indicator dots and connector lines are marked `aria-hidden="true"` — they are decorative.
- Step titles are rendered as `<p>` elements; wrap in a `<ol>` / `<li>` structure via `className` if the sequence is semantically meaningful in your context.
- No keyboard interaction — Timeline is a display-only component.

---

## When to use

- **Installation / setup guides** — ordered steps where numbering matters.
- **Onboarding flows** — show a user what's coming next.
- **Activity logs** — combine with custom `indicator` icons (checkmark = done, spinner = in-progress) for status timelines.

---

## Tokens used

| Token               | Where                                |
|---------------------|--------------------------------------|
| `bg-brand`          | Indicator dot (brand variant)        |
| `text-brand-fg`     | Indicator number (brand variant) — resolves to a contrasting foreground color on the brand surface in both light and dark themes |
| `bg-surface-active` | Indicator dot (muted variant)        |
| `text-text-muted`   | Indicator number + body text         |
| `border-surface-border` | Indicator border (muted) + connector line |
| `text-text`         | Step title                           |

---

## Example

```tsx
import { Timeline, TimelineItem } from '@/components/ui/Timeline/Timeline';

export default function SetupGuide() {
  return (
    <Timeline>
      <TimelineItem title="Install the CLI">
        <p>Run <code>npx dafink-ui init</code> in your project root.</p>
      </TimelineItem>
      <TimelineItem title="Add components">
        <p>Use <code>npx dafink-ui add button input</code> to copy components.</p>
      </TimelineItem>
      <TimelineItem title="Import and use">
        <p>Import from <code>@/components/ui</code> and start building.</p>
      </TimelineItem>
    </Timeline>
  );
}
```
