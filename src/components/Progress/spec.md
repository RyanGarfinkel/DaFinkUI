# Progress

Horizontal bar indicating task completion.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `number` | required | Current value (0 – max). Required. |
| max | `number` | `100` | Maximum value. |
| showLabel | `boolean` | `false` | Show a "Progress X%" label row above the track. |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Track height. |
| className | `string` | `''` | Additional CSS classes merged onto the root wrapper. |

Extends all native `<div>` HTML attributes.

## Sizes

| Size | Track height |
|------|-------------|
| `sm` | 4px (`h-1`) |
| `md` | 8px (`h-2`) |
| `lg` | 12px (`h-3`) |

## Visual Design

- Full-width by default (`w-full`)
- Track uses `bg-surface-active rounded-full overflow-hidden`: rounded pill container
- Fill uses `bg-brand rounded-full`: brand color, clamped to `0–100%`
- Fill width animates with `transition-all duration-[var(--duration-normal)] ease-out` when value changes
- When `showLabel` is true, a small `text-xs text-text-muted` row appears above the track showing `"Progress"` on the left and `"X%"` on the right

## Accessibility

- The track element has `role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, and `aria-valuemax` set automatically from props.
- When `showLabel` is false, the screen reader still reads the numeric progress through `aria-valuenow`.
- Add a wrapping element with an accessible label (e.g. `aria-label="Uploading file"`) when the bar appears without surrounding text context.

## When to Use

- Use `sm` inside compact components like table rows or notification banners.
- Use `md` (default) for standard page-level progress: file uploads, multi-step forms.
- Use `lg` for prominent hero-level tasks like onboarding flows.
- Use `showLabel` when the numeric value adds clarity and space permits.
- For indeterminate loading where the duration is unknown, use Spinner instead.

## Installation

```bash
npx dafink-ui add progress
```

npm dependencies: none
No registry dependencies.
