# Message

A chat-style message bubble (`sent`/`received`) that can carry a cluster of small "reaction" chips overlapping its bottom corner — iOS-tapback style — without shifting the bubble's own content. The same chip primitive generalizes beyond chat reactions to numbered source-citation links under an LLM response.

---

## Exports

`Message` (default export), `MessageReactions`, `MessageReaction`.

---

## Props

### `Message`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'sent' \| 'received'` | `'received'` | `'sent'` right-aligns the bubble in brand fill; `'received'` left-aligns it in a neutral surface tint. |
| avatar | `ReactNode` | — | Optional avatar rendered beside the bubble (e.g. `<Avatar />`). Sits at the outer edge, bottom-aligned with the bubble via `items-end`. |
| className | `string` | `''` | Additional CSS classes merged onto the root row. |
| children | `ReactNode` | — | The message content. A `MessageReactions` child is detected and extracted automatically — render it anywhere inside `Message`, it does not need to be last. |

Extends all native `<div>` attributes.

### `MessageReactions`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| aria-label | `string` | `'Reactions'` | Override for non-chat use cases, e.g. `'Sources'` for citation chips. |
| max | `number` | — | Maximum number of chips shown. Once exceeded, the remaining chips collapse into a `role="img"` "+N" indicator and the visible chips overlap into a stack — the same `max`/overflow pattern as `AvatarGroup`. Omit it to let every chip wrap onto its own row instead. |
| className | `string` | `''` | Additional CSS classes. |
| children | `ReactNode` | — | One or more `MessageReaction` chips. |

Extends all native `<div>` attributes. Renders `role="group"`.

Usable standalone, outside `Message` entirely — e.g. directly under an LLM response paragraph as an inline row of citation chips. It carries no positioning opinion of its own; `Message` is what absolutely positions it against the bubble corner.

### `MessageReaction`

A single chip. Renders as a real `<a>` when `href` is set, otherwise a real `<button type="button">`. Never a `<div>` with `onClick`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | `ReactNode` | — | Decorative glyph — an emoji string or icon node. Always `aria-hidden`. |
| label | `ReactNode` | — | Visible text next to the icon — a count label, a footnote number (`"1"`), or a source name. |
| count | `number` | — | Aggregate count for a tapback-style reaction (e.g. 3 people reacted). When set, drives the auto-generated `aria-label` and is shown in place of `label` if `label` is omitted. |
| active | `boolean` | `false` | Whether the current user is included in this reaction. Communicated via border + solid fill + a checkmark icon — never color alone. |
| href | `string` | — | Renders the chip as a link (citation/source use case). Mutually exclusive with button-only native props. |
| className | `string` | `''` | Additional CSS classes. |

When `href` is set, extends `AnchorHTMLAttributes<HTMLAnchorElement>` (minus `children`). Otherwise extends `ButtonHTMLAttributes<HTMLButtonElement>` (minus `children`) — so `disabled`, `onClick`, `target`, `rel`, etc. all pass through natively.

---

## Variants

| Variant | Use case |
|---------|----------|
| `sent` | The current user's own message — right-aligned, brand-filled bubble. |
| `received` | A message from someone else — left-aligned, neutral surface-tinted bubble. |

---

## Accessible Name Behavior

A reaction chip's visible content (emoji, count, or footnote number) is never assumed to be sufficient on its own for a screen reader:

- If `count` is set and no explicit `aria-label` is passed, one is generated: `"{glyph} {count} reaction(s){, including yours if active}"` — e.g. `aria-label="👍 3 reactions, including yours"`. In this case the visible icon/count text is marked `aria-hidden` to avoid double-announcing.
- If neither `label` nor a string `icon` nor `count` is present (icon-only, no count), a generic fallback (`"Reaction"` / `"Reaction, including yours"`) is used so the chip is never nameless.
- Otherwise (typically the citation case — a string `label` with no `count`), the visible text is left in the accessibility tree and serves as the element's accessible name. Pass an explicit `aria-label` for a richer description (e.g. `aria-label="Source 1: nytimes.com"`) when the visible label alone (`"1"`) is not descriptive enough.
- An explicit `aria-label` prop always wins over the computed one.

---

## Visual Design

- Bubble corners: `rounded-[var(--radius-lg)]` with the corner nearest the "tail" pulled in to `rounded-[var(--radius-sm)]` (bottom-right for `sent`, bottom-left for `received`) — the standard chat-bubble tail cue.
- `sent`: `bg-brand text-brand-fg`, row is `flex-row-reverse` (bubble + avatar on the right).
- `received`: `bg-surface-active text-text`, row is `flex-row` (bubble + avatar on the left).
- Bubble caps at `max-w-[75%]` of its row — a percentage, not a fixed breakpoint, so it stays responsive at any container width without media queries.
- `MessageReactions`, when it's a child of `Message`, is pulled out of normal flow and rendered in an `absolute -bottom-3` wrapper anchored to the bubble's inner corner (`right-3` for `received`, `left-3` for `sent`) — so it overlaps the bubble's bottom edge like an iOS tapback, without adding height to the bubble or shifting its text content.
- Each `MessageReaction` chip: `h-6 rounded-full border` pill with `shadow-[var(--shadow-sm)]` so it reads as a floating element above the bubble/page background. `gap-2` between chips in `MessageReactions` satisfies the WCAG 2.5.8 24px-target spacing minimum.
- `active` chip: `border-brand bg-brand text-brand-fg` (matches the "selected" convention used by `ToggleGroup`) plus a leading checkmark icon — border, fill, and icon all change together, never color alone.
- Inactive chip: `border-surface-border bg-surface-panel text-text-muted`, with a `hover:` shift to `surface-hover`/`text`.
- When `max` is set and exceeded, `MessageReactions` switches from `gap-2` to `-space-x-2` and adds `ring-2 ring-surface` to each visible chip (plus the trailing "+N" indicator) — an overlapping stack identical in spirit to `AvatarGroup`'s `max`/overflow treatment, just built from pill chips instead of circular avatars. The ring color matches the surrounding surface so the overlap reads as separated layers rather than a color clash.

---

## Interactive States

| State | Implementation |
|---|---|
| Hover | `hover:bg-surface-hover hover:text-text` (inactive) / `hover:bg-brand-hover` (active) |
| Focus | `focus:outline-none` — browser default suppressed |
| Focus-visible | `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` |
| Active/pressed | `active:scale-[0.97]` |
| Disabled | `disabled:pointer-events-none disabled:opacity-40` — button variant only; links have no native disabled state, don't pass `href` for a chip that should be inert |

All transitions use `motion-safe:transition-[...] motion-safe:duration-[var(--duration-fast)]` and therefore respect `prefers-reduced-motion` via the global rule.

---

## Accessibility

- `MessageReaction` is always a real `<a>` or `<button type="button">` — fully keyboard reachable (`Tab`), activatable with `Enter`/`Space` (button) or `Enter` (link), and carries a visible `focus-visible` ring.
- `MessageReactions` is `role="group"` with an `aria-label` (`"Reactions"` by default, override for other use cases like `"Sources"`) so assistive tech announces the cluster as a related set rather than a stream of unrelated buttons.
- The `max` overflow indicator is a `role="img"` span (not a button — it triggers no action) with its own `aria-label` (e.g. `"2 more reactions"`, singular `"1 more reaction"`) so its count is announced even though the `+N` text itself is `aria-hidden`.
- The `active`/"yours" state is never communicated by color alone: it also changes the border, fills the chip solid, and adds a checkmark icon — plus the computed `aria-label` says "including yours" outright.
- Reaction chips are not a roving-tabindex composite widget — they're independent actions (like a small toolbar of buttons), so each one is a normal `Tab` stop in DOM order. No arrow-key navigation is implied or required.
- `Message` itself adds no interactive semantics — it's a layout/grouping component. Any accessible name for the message content (e.g. "message from Ada") is the consumer's responsibility via surrounding context (a `<ul>`/`<li>` log, `aria-label` on a list container, etc.) — `Message` does not assume a chat-log structure.

---

## When to Use

- `Message` — any chat/DM-style transcript: sent vs. received bubbles, optionally paired with `Avatar`.
- `MessageReactions` + `MessageReaction` inside `Message` — emoji tapback reactions on a chat bubble (`icon` + `count`, `onClick` to toggle the user's own reaction, `active` to reflect it).
- `MessageReactions` + `MessageReaction` standalone (no `Message` wrapper) — a row of numbered or named source-citation chips under an LLM response (`label` + `href`, no `count`/`active`).
- Pass `max` on `MessageReactions` whenever a bubble could accumulate many different reaction kinds (or many sources) — it caps the visible chips and rolls the rest into a "+N" chip, the same tradeoff `AvatarGroup` makes for long people-lists.
- Don't reach for `MessageReaction` for a single, non-clustered badge/tag — use `Badge` instead.

---

## Tokens Used

| Token | Usage |
|---|---|
| `bg-brand` / `text-brand-fg` / `border-brand` | Sent bubble fill; active ("yours") reaction chip |
| `bg-surface-active` / `bg-surface-panel` | Received bubble fill; inactive reaction chip |
| `border-surface-border` / `border-surface-border-hover` | Inactive chip border and its hover state |
| `text-text` / `text-text-muted` | Bubble/chip text |
| `--radius-lg` / `--radius-sm` | Bubble corner radii (the tail-side corner is tightened) |
| `--shadow-sm` | Floating elevation on each reaction chip |
| `--duration-fast` | Chip hover/press/focus transitions |
| `ring-brand-ring` | Focus-visible ring on reaction chips |

---

## Installation

```bash
npx @dafink/ui add message
```

No additional npm dependencies. No registry dependencies (composes with `Avatar` by prop, not by import — pass any `ReactNode` as `avatar`).
