# Skeleton

A set of loading placeholder components that mimic content shapes while data is being fetched.

---

## Components

| Export | Description |
|--------|-------------|
| `Skeleton` | Base block — set `width`, `height`, and `className` to match any shape |
| `SkeletonCard` | Header line + configurable body text lines |
| `SkeletonInput` | Input field placeholder with optional label line |
| `SkeletonTableRow` | Row of equal-width column blocks |
| `SkeletonForm` | Stack of labelled input placeholders |
| `SkeletonImage` | Rectangular image placeholder with a centred photo icon |

## Props

### Skeleton (base)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `string` | — | Inline CSS width (e.g. `'200px'`, `'40%'`). |
| height | `string` | — | Inline CSS height (e.g. `'14px'`, `'2.25rem'`). |
| className | `string` | `''` | Tailwind classes for sizing, rounding, or layout. |

Extends all native `<div>` HTML attributes.

### SkeletonCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| lines | `number` | `3` | Number of body text lines to render below the heading block. |
| className | `string` | `''` | Additional classes on the wrapper. |

### SkeletonInput

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `boolean` | `false` | Whether to show a label placeholder above the input block. |
| className | `string` | `''` | Additional classes on the wrapper. |

### SkeletonTableRow

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | `number` | `4` | Number of equal-width column blocks in the row. |
| className | `string` | `''` | Additional classes on the wrapper. |

### SkeletonForm

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| fields | `number` | `3` | Number of labelled input fields (each is a `SkeletonInput` with `label`). |
| className | `string` | `''` | Additional classes on the wrapper. |

### SkeletonImage

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| aspectRatio | `string` | `'16/9'` | CSS `aspect-ratio` value. Controls height relative to width (e.g. `'4/3'`, `'1'`). |
| className | `string` | `''` | Additional classes — use for width constraints (e.g. `'w-64'`). |

## Visual Design

- All blocks use `animate-pulse bg-surface-active rounded` — the pulse animation fades the block in and out
- `SkeletonCard` staggers line widths from the `lineWidths` array to mimic realistic text wrapping
- `SkeletonInput` renders the input block at `h-[2.25rem]` to match the real Input component height
- `SkeletonTableRow` uses `flex gap-4` with `flex-1` columns — columns stretch to fill available width
- `SkeletonImage` is a block-level div; height is derived from `aspectRatio` and the element's width. A centred photo icon (`text-text-muted opacity-40`) provides visual affordance.

## Accessibility

- All skeleton elements have `aria-hidden="true"` — screen readers skip them entirely
- When skeleton content is replaced by real content, no additional announcement is needed; the real content speaks for itself
- If you need to announce loading state to screen readers, add a visually hidden `<span role="status">Loading…</span>` outside the skeleton

## When to Use

- Use `SkeletonCard` to replace card components while their data loads.
- Use `SkeletonInput` / `SkeletonForm` to hold form layout during async initialization.
- Use `SkeletonTableRow` in table bodies while paginated data is fetching.
- Use `SkeletonImage` to hold the layout of an image or media card while the source loads.
- Use the base `Skeleton` for anything custom — avatars, stat tiles, or shapes not covered by the named variants.
- Do not use Skeleton for actions triggered by the user (button presses, form submits) — use Spinner for those.

## Installation

```bash
npx dafink-ui add skeleton
```

npm dependencies: none
No registry dependencies.
