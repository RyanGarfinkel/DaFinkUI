# Alert

Contextual feedback banner for success, warning, danger, or info.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Alert color and icon. |
| title | `string` | — | Bold heading text rendered above children. |
| children | `ReactNode` | — | Body content rendered below the title. |
| className | `string` | `''` | Additional CSS classes merged onto the root element. |

Extends all native `<div>` HTML attributes.

## Variants

| Variant | Use case |
|---------|----------|
| `default` | Neutral informational callouts; no urgency |
| `success` | Confirmation that an action completed successfully |
| `warning` | Non-blocking issue the user should be aware of |
| `danger` | Error state or a destructive consequence requiring attention |

Each variant applies a matching background, border, text color, and icon. The icon is decorative (`aria-hidden`) — the `role="alert"` on the wrapper ensures screen readers announce the content.

## Visual Design

- `rounded-lg border p-4` — contained, padded block with visible boundary
- Icon is 16px and aligned to `mt-0.5` so it tracks with the first line of text
- Title uses `text-sm font-semibold leading-snug`
- Body uses `text-sm leading-relaxed opacity-90`
- `danger` variant uses `bg-danger/10` and `border-danger/20` (alpha tokens) to avoid a heavy red fill

## Accessibility

- Root element has `role="alert"`, which causes screen readers to announce the content immediately when it is added to the DOM.
- The icon is `aria-hidden="true"` — variant state is communicated by the text content, not the icon alone.
- Color is not the only signal: each variant renders a semantically different icon path in addition to the color change.

## When to Use

- Use `default` for tips, notes, or general guidance that does not require action.
- Use `success` after a form submission, file upload, or any irreversible success.
- Use `warning` when data may be stale, a limit is approaching, or an action has side effects.
- Use `danger` for form-level errors, failed operations, or destructive state. For field-level errors, use the `error` prop on Input or Textarea instead.
- Prefer `danger` over `warning` when the user must take action to continue.

## Installation

```bash
npx dafink-ui add alert
```

npm dependencies: none
No registry dependencies.
