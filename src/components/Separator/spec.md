# Separator

A thin dividing line between content (horizontal or vertical), optionally broken up by a short text label (e.g. "OR").

## Props

| Prop            | Type                              | Default      | Description                                                                 |
|-----------------|-----------------------------------|--------------|-------------------------------------------------------------------------------|
| `orientation`   | `'horizontal' \| 'vertical'`      | `'horizontal'` | `'vertical'` renders a full-height line for use inside a flex row (e.g. between toolbar buttons). |
| `labelPosition` | `'start' \| 'center' \| 'end'`    | `'center'`   | Where the label sits along the line's own axis: left-to-right when horizontal, top-to-bottom when vertical. Only applies when `children` is set. |
| `variant`       | `'solid' \| 'dashed' \| 'dotted'` | `'solid'`    | Border style of the line. Applies to every line segment, including both sides of a labeled separator. |
| `children`      | `ReactNode`                       | n/a          | Optional text that breaks up the line, in either orientation (e.g. "OR"). Stays upright, not rotated, when `orientation="vertical"`. |
| `className`     | `string`                          | `''`         | Additional classes applied to the root element.                            |

Extends all native attributes of the rendered root element (`<hr>` for the plain horizontal case, `<div>` otherwise), e.g. `data-*`, `id`.

## Behavior

- **No `children`**: renders a real `<hr>` (horizontal) or a bare `<div role="separator" aria-orientation="vertical">` line (vertical). `<hr>` carries an implicit `separator` role and horizontal orientation natively, so no ARIA attributes are added there; the vertical line needs the explicit role/orientation since a plain `<div>` has no implicit separator semantics. `self-stretch` makes the vertical line fill the height of a flex row it's placed in; `shrink-0` keeps it from being compressed by flexible siblings.
- **With `children`**: renders a `<div role="separator" aria-orientation="...">` containing up to two decorative line segments (`aria-hidden`) and the label, arranged along the line's own axis by `labelPosition`:
  - `'start'`: label, then a line filling the rest of the axis (rest of the row when horizontal, rest of the column when vertical).
  - `'center'` (default): a line, the label, then another line; both sides fill equally via `flex-1`.
  - `'end'`: a line filling the axis, then the label.
  The vertical labeled case swaps the row for a column (`flex-col`) and the horizontal line segments (`border-t`) for vertical ones (`border-l`), but the label text itself is never rotated: it reads normally regardless of orientation.

## Accessibility

- The no-label horizontal case is a real `<hr>`: its `separator` role and orientation are implicit, nothing to add.
- Every other case is a `<div role="separator">` with an explicit `aria-orientation`, since a plain `<div>` has no implicit separator semantics.
- The decorative line segments either side of a label are `aria-hidden="true"`: only the label text itself is exposed to assistive tech, read as static text (a separator is not a focusable, interactive widget, so no `tabindex` is added, per the WAI-ARIA `separator` role guidance for non-interactive use).

## Visual Design

- Line color: `border-surface-border` on the token-driven `border-t-[length:var(--border-width)]` (horizontal) or `border-l-[length:var(--border-width)]` (vertical); respects the `--border-width` design token rather than a hardcoded `1px`.
- Line style: `variant` adds `border-solid` (default), `border-dashed`, or `border-dotted` alongside the width/color classes above: thickness and color stay the same across all three, only the stroke pattern changes.
- Label text: `text-xs font-medium text-text-subtle uppercase tracking-wide`: the same muted small-caption treatment `SidebarSection` uses for its group labels, so a labeled separator reads as quiet metadata, not another heading. Identical in both orientations; only the surrounding line direction changes.
- Horizontal: label and line segments sit in a `flex items-center gap-3` row. Vertical: the same idea in a `flex flex-col items-center gap-3 self-stretch shrink-0` column. Either way, the line segments use `flex-1` so both sides stay balanced (or fill the remaining space for `'start'`/`'end'`) regardless of container size.

## When to Use

- Plain horizontal/vertical `Separator`: dividing sections of a page, list items, or toolbar buttons (`orientation="vertical"`) without a heading.
- Labeled `Separator` (`children` set): an "OR" break between two alternative actions (e.g. sign in with email vs. a social provider), or any short inline caption breaking up a line. Works in a vertical layout too, e.g. an "OR" between two stacked options in a narrow column, or between two side-by-side panels using a vertical divider.
- Don't use `Separator` for a full section heading; use `Typography`/an `<h2>` instead. `Separator`'s label is deliberately quiet (small, muted, uppercase), not a heading substitute.

## Tokens Used

| Token               | Applied to                          |
|---------------------|--------------------------------------|
| `border-surface-border` | Line color (horizontal and vertical) |
| `--border-width`    | Line thickness                       |
| `text-text-subtle`  | Label text color                     |

## Installation

```bash
npx dafink-ui add separator
```

No npm dependencies. No registry dependencies.
