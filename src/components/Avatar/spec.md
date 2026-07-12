# Avatar

User or entity image with graceful fallback to initials, plus an overlapping AvatarGroup with overflow indicator.

---

## Props

### Avatar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | `string` | None | Image URL. When set, `alt` is required (enforced by the prop types). |
| alt | `string` | None | Accessible description of the person; required with `src`, optional otherwise. |
| name | `string` | None | Full name used to derive fallback initials ("Ada Lovelace" → "AL") and the fallback's accessible label when `alt` is absent. |
| fallback | `string` | None | Explicit fallback text; overrides initials derived from `name`. |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Avatar dimensions: 28px / 36px / 48px. |
| shape | `'circle' \| 'square'` | `'circle'` | `circle` is `rounded-full`; `square` is `rounded-md`. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<span>` HTML attributes.

### AvatarGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| max | `number` | None | Maximum avatars shown before collapsing the rest into a "+N" indicator. |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Size injected into child avatars that don't set their own. |
| shape | `'circle' \| 'square'` | `'circle'` | Shape injected into child avatars that don't set their own. |
| children | `ReactNode` | None | `<Avatar>` elements. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<div>` HTML attributes.

## Fallback Behavior

1. `src` provided and loads → the image is shown.
2. `src` missing or the image fires `onError` → fallback is shown:
   - `fallback` prop text if provided, else
   - initials derived from `name` (first + last word; first two letters of a single-word name), else
   - a decorative person glyph.
3. The error state resets automatically if `src` changes.

## Visual Design

- Fallback surface: `bg-surface-active text-text-muted border border-surface-border`, token-driven, dark-mode aware.
- Sizes: `sm` `h-7 w-7 text-[10px]`, `md` `h-9 w-9 text-xs`, `lg` `h-12 w-12 text-sm`.
- Group overlap: `-space-x-2` with `ring-2 ring-surface` on each avatar so overlapping edges stay legible on any surface.
- The "+N" indicator is styled identically to a fallback avatar.

## Accessibility

- **With an image**: the `<img>` carries the required `alt`. Describe the person ("Ada Lovelace"), not the picture.
- **Fallback with a name/alt**: the root gets `role="img"` and `aria-label` set to `alt ?? name`; the initials text is `aria-hidden="true"` so screen readers announce the name, never the raw initials.
- **Fallback with no name, alt, or fallback**: the avatar is purely decorative and the root is `aria-hidden="true"`.
- **AvatarGroup overflow**: the "+N" indicator has `role="img"` with `aria-label="N more"`; the visible "+N" text is `aria-hidden="true"`.
- Avatar is non-interactive. Wrap it in a button or link if it should be clickable; do not add handlers directly.

## When to Use

- Use Avatar to represent a person or organization in comments, tables, navigation, and activity feeds.
- Always pass `name` (or `alt`) even when you have an image, so the fallback is meaningful if the image fails.
- Use AvatarGroup with `max` for collaborator lists and shared-with rows; keep visible avatars to 5 or fewer.
- For status (online/away), compose a Badge alongside. Avatar does not render status dots itself.

## Tokens Used

`--color-surface`, `--color-surface-active`, `--color-surface-border`, `--color-text-muted`

## Installation

```bash
npx dafink-ui add avatar
```

npm dependencies: none
No registry dependencies.
