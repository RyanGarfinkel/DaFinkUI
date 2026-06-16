# Badge

Inline label for status, category, or count.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'success' \| 'warning' \| 'danger' \| 'outline'` | `'default'` | Visual style of the badge. |
| className | `string` | `''` | Additional CSS classes. |
| children | `ReactNode` | — | Badge label text or content. |

Extends all native `<span>` HTML attributes.

## Variants

| Variant | Use case |
|---------|----------|
| `default` | Neutral category labels, tags, and counts |
| `success` | Completed, active, verified, or passing states |
| `warning` | Pending, expiring, or attention-required states |
| `danger` | Failed, rejected, overdue, or critical states |
| `outline` | Inactive or secondary labels where a lighter treatment is preferred |

## Visual Design

- `rounded-full` — pill shape, distinct from button's `rounded-md`
- `inline-flex items-center` — flows naturally inside text or table cells
- `px-2 py-0.5 text-xs font-medium leading-none` — compact, readable at small sizes
- Borders are always present; `default` uses `border-transparent` so the shape is consistent across variants without a visible line

## Accessibility

- Badge is a `<span>` — it carries no interactive role. Do not make it focusable or clickable without wrapping it in a button.
- Color is not the sole signal: pair status badges with meaningful text labels (`"Active"`, `"Failed"`) rather than color alone. The `success-border`, `warning-border`, and `danger-border` token changes reinforce the distinction beyond color.
- If a badge communicates live status that updates dynamically, add `aria-live="polite"` to a containing element.

## When to Use

- Use badges to label the status of a row in a table, a card, or an item in a list.
- Use `default` for categorical tags (e.g. `"React"`, `"v1.2.0"`) that carry no urgency.
- Use status variants (`success`, `warning`, `danger`) only when the state meaningfully affects what the user should do next.
- Keep badge text short — one or two words. For longer context use an Alert or tooltip.

## Installation

```bash
npx @dafink/ui add badge
```

npm dependencies: none
No registry dependencies.
