# Spinner

Animated loading indicator.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the spinner ring. |
| label | `string` | `'Loading…'` | Screen reader label announced via `aria-label` and a visually hidden `<span>`. |
| className | `string` | `''` | Additional CSS classes on the outer wrapper. |

Extends all native `<span>` HTML attributes.

## Sizes

| Size | Diameter | Border |
|------|----------|--------|
| `sm` | 16px (`w-4 h-4`) | 2px |
| `md` | 24px (`w-6 h-6`) | 2px |
| `lg` | 32px (`w-8 h-8`) | 3px |

## Visual Design

- Rendered as two nested `<span>` elements: the outer wrapper holds the role and label; the inner span is the visible ring
- The ring uses `rounded-full border-surface-active border-t-brand animate-spin`: a gray full border with a single brand-colored segment at the top that spins to create the arc effect
- `animate-spin` uses the Tailwind default 1-turn/1s linear spin; respects `prefers-reduced-motion` via the global CSS rule

## Accessibility

- Outer element has `role="status"` and `aria-label` set to the `label` prop; screen readers announce it when it mounts
- The visual ring is `aria-hidden="true"` to avoid double-announcement
- A visually hidden `<span className="sr-only">` inside the wrapper provides fallback text for assistive technologies that do not read `aria-label` on non-interactive elements
- `label` defaults to `'Loading…'`; override it with context-specific text when the Spinner is associated with a named action (e.g. `'Saving changes…'`)

## When to Use

- Use Spinner for short, user-triggered async operations (form submit, button action, data reload).
- Use Skeleton for initial page/data loads where the layout shape is known in advance.
- Inline `sm` next to a button label to indicate that the button's action is in progress.
- Use `lg` as a standalone page-level indicator when the entire view is loading.

## Installation

```bash
npx dafink-ui add spinner
```

npm dependencies: none
No registry dependencies.
