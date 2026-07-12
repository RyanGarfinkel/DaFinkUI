# Card

A flexible container component for grouping related content into a distinct visual surface. Card is a compound component: use `CardHeader`, `CardContent`, and `CardFooter` as direct children to create a well-structured layout with consistent spacing.

## Components

### Card

The root container. Accepts a `variant` prop that controls the visual treatment of the surface.

| Prop      | Type                                  | Default     | Description                                      |
|-----------|---------------------------------------|-------------|--------------------------------------------------|
| variant   | `'default' \| 'elevated' \| 'outline'` | `'default'` | Visual style of the card surface                 |
| className | `string`                              | `''`        | Additional Tailwind classes merged onto the root |

Extends all native `<div>` HTML attributes.

---

### CardHeader

The top section of the card. Intended for titles, subtitles, or metadata. Adds top-and-sides padding with a tighter bottom gap to separate it from content below.

| Prop      | Type     | Default | Description                            |
|-----------|----------|---------|----------------------------------------|
| className | `string` | `''`    | Additional classes merged onto the div |

Extends all native `<div>` HTML attributes.

---

### CardContent

The main body section. Use for descriptions, data, form fields, or any primary content. Adds equal vertical padding on both sides.

| Prop      | Type     | Default | Description                            |
|-----------|----------|---------|----------------------------------------|
| className | `string` | `''`    | Additional classes merged onto the div |

Extends all native `<div>` HTML attributes.

---

### CardFooter

The bottom section. Lays out children in a right-aligned flex row with a small gap, suitable for action buttons. Use `justify-start` via `className` to override alignment if needed.

| Prop      | Type     | Default | Description                            |
|-----------|----------|---------|----------------------------------------|
| className | `string` | `''`    | Additional classes merged onto the div |

Extends all native `<div>` HTML attributes.

---

## Variants

| Variant   | Background      | Border                          | Shadow    | When to use                                                          |
|-----------|-----------------|---------------------------------|-----------|----------------------------------------------------------------------|
| `default` | `bg-surface`    | `border border-surface-border`  | none      | Standard cards in most layouts; clear boundary without visual weight |
| `elevated` | `bg-surface`   | none                            | `shadow-md` | Cards that need to float above the page: dashboards, modals, feature callouts |
| `outline`  | `bg-transparent` | `border-2 border-surface-border` | none     | Cards on a white or colored background where you want definition without a filled surface |

---

## Tokens Used

All styling uses semantic design tokens only, never raw palette values.

- `bg-surface`: default card background
- `bg-transparent`: outline variant background
- `border-surface-border`: default and outline border color
- `text-text`: primary text inside cards
- `text-text-muted`: secondary / supporting text
- `text-text-subtle`: tertiary / de-emphasized text
- `shadow-md`: elevated variant shadow

---

## Container Queries

The `Card` root element carries `@container`, establishing a container context. The subcomponents adapt their padding and layout based on the card's own rendered width, not the viewport.

| Breakpoint | Container width | Behavior |
|---|---|---|
| Below `@sm` | < 24rem (384px) | `CardHeader`, `CardContent`, `CardFooter` use reduced padding (`px-4`, `py-3`). `CardFooter` stacks children vertically (`flex-col`) and left-aligns them. |
| `@sm` and above | ≥ 24rem (384px) | Full padding (`px-6`). `CardFooter` switches to a right-aligned horizontal row (`flex-row justify-end`). |

This means the same `Card` component placed in a narrow sidebar column and in a wide content area will use the correct internal spacing and button layout for its context: no consumer overrides needed.

---

## When to Use

- Use `Card` to group related content into a self-contained unit: a user profile, a pricing tier, a form section, a data summary.
- Use `CardHeader` for titles and metadata; use `CardContent` for the main body; use `CardFooter` for actions.
- Not all three subcomponents are required; compose only what the content needs.
- Use `default` in the majority of cases. Reach for `elevated` when the card competes with a busy background. Use `outline` on surfaces where a filled background would feel heavy.
- Card is not interactive by default. Do not apply click handlers directly to `Card`; use a button or link inside `CardFooter` for actions.
