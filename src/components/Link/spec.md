# Link

An inline text link with no padding, for use inside paragraphs and other running text.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| href | `string` | None | Destination. Required. Renders through `next/link`. |
| className | `string` | `''` | Additional CSS classes. |
| children | `ReactNode` | None | Link text. |

Extends all native `<a>` HTML attributes except `href`.

## Variants

None. For a padded, button-shaped link use `Button` with an `href`.

## Interactive States

- **Default:** `text-text`, underlined with a muted (`text-subtle`) decoration.
- **Hover:** the underline darkens to `text`.
- **Active:** text shifts to `text-muted`.
- **Focus-visible:** `ring-2` in `brand-ring` with `ring-offset-2`.

## Accessibility

Renders a native `<a>`, so it is reachable by Tab and activated by Enter. The underline is always present, so the link does not rely on color alone to stand out from surrounding text. For links that open in a new tab, pass `target='_blank'` and `rel='noopener noreferrer'` and make that clear in the link text.

## When to Use

Use inside a paragraph or sentence where the link is part of the text flow. Use `Button` (with `href`) for standalone calls to action, and `Button variant='link'` only for a button-sized action that should look like a link.

## Tokens Used

`text-text`, `text-text-muted`, `text-text-subtle` (decoration), `brand-ring`.

## Installation

```bash
npx dafink-ui add link
```

npm dependencies: none
No registry dependencies.
