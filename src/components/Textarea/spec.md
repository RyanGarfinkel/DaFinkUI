# Textarea

A multi-line text input with optional label, hint, and error messaging.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Visible label rendered above the textarea; also used to derive the `id`. |
| placeholder | `string` | — | Placeholder text shown when the textarea is empty. |
| hint | `string` | — | Helper text rendered below the textarea when there is no error. |
| error | `string` | — | Error message; switches the textarea to error state. |
| disabled | `boolean` | `false` | Disables the textarea. |
| className | `string` | `''` | Additional classes merged onto the `<textarea>` element. |
| id | `string` | — | HTML id; auto-derived from `label` if omitted. |

Extends all native `<textarea>` HTML attributes. Accepts a `ref`.

## Interactive States

- **hover**: border shifts to `input-border-hover`
- **focus**: outline suppressed (`outline-none`)
- **focus-visible**: 3px outline at offset 0 — `input-ring` by default, `input-error-ring` in error state
- **disabled**: muted background (`input-disabled-bg`), muted text (`input-disabled-text`), `cursor-not-allowed`; no hover or focus-visible styles

## Error State

Set the `error` prop to a non-empty string to enter the error state:

- Border becomes `input-error`
- Focus-visible outline becomes `input-error-ring`
- Error message appears below the textarea in `text-sm text-input-error`
- `aria-invalid="true"` and `aria-describedby` pointing to the error paragraph are set automatically
- When an error is set, `hint` is suppressed — only the error message is shown

## Visual Design

- `min-h-[80px] resize-y` — user can drag the handle to increase height; minimum height prevents collapse
- `rounded-md border bg-surface text-text px-3 py-2 text-sm` — consistent with Input styling
- `placeholder:text-text-subtle` — placeholder is visually distinct from entered text
- `motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)]` — border color transitions respect `prefers-reduced-motion`

## Accessibility

- `label` and `id` are linked via `htmlFor` / `id`
- Error and hint messages are associated via `aria-describedby`
- Error state sets `aria-invalid="true"`
- The id is auto-derived from `label` by lowercasing and replacing spaces with hyphens — providing an explicit `id` overrides this

## When to Use

- Use Textarea for free-form multi-line text: messages, descriptions, notes, feedback.
- Use Input instead for single-line values like names, emails, and search queries.
- Set a meaningful `placeholder` to guide the user on format or length expectations.
- Use `hint` for character limits or formatting guidance; use `error` for validation failures after submission.

## Installation

```bash
npx @dafink/ui add textarea
```

npm dependencies: none
No registry dependencies.
