# SlideIn

A small, fixed-distance jump-and-fade entrance triggered by IntersectionObserver, from the left, right, or bottom edge.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | `'left' \| 'right' \| 'bottom'` | `'bottom'` | Which edge the element jumps in from when scrolled into view. |
| distance | `number` | `24` | Pixel distance of the jump. Deliberately small — this is a short "settle into place" motion, not a long travel. |
| once | `boolean` | `true` | Reveal only on first entry. When `false`, content re-hides on exit and re-reveals on re-entry. |
| className | `string` | `''` | Additional CSS classes. |
| children | `ReactNode` | n/a | Content to reveal. |

Extends all native `<div>` HTML attributes.

## Behavior

- **Progressive enhancement**: content renders fully visible on the server, without JavaScript, and when IntersectionObserver is unavailable. It is only hidden after the observer is confirmed running on mount, so nothing is ever stuck invisible.
- Triggers at 15% visibility (`threshold: 0.15`), same as Reveal.
- `direction='left'` starts translated `-{distance}px` on the X axis (enters moving right); `'right'` starts `+{distance}px` (enters moving left); `'bottom'` starts `+{distance}px` on the Y axis (enters moving up). All settle to `translate(0, 0)` and `opacity: 1` at `--duration-slow` with `--ease-enter`.
- With `once` (default), the element is unobserved after revealing.

## Relationship to Reveal

This overlaps with `Reveal`'s `slide-up`/`slide-left`/`slide-right` effects, which use the same IntersectionObserver mechanism. `SlideIn` is a narrower, more literal component for exactly one job — a small directional jump named after the edge it enters from (`left`/`right`/`bottom`) rather than the direction of travel — with a tunable `distance` instead of a fixed `4` (1rem). Reach for `Reveal`/`RevealGroup` when you also want `fade`/`scale` effects or staggered group cascades; reach for `SlideIn` when you just want a small, clearly-named directional entrance on a single element.

## Accessibility

- **`prefers-reduced-motion: reduce`**: checked via `matchMedia` before anything is hidden; content stays fully visible and no observer is created. No motion, no flash.
- The wrapper is a plain `<div>` with no role; it adds nothing to the accessibility tree and does not affect focus order or semantics of its children.
- Content is present in the DOM at all times (only opacity/transform animate), so screen readers and find-in-page see it before it animates.

## When to Use

- Use for marketing/landing sections, feature lists, and cards entering on scroll, when you want a specific, named edge (e.g. "this card jumps in from the right") rather than Reveal's direction-of-travel naming.
- Do not wrap critical UI (forms, errors, navigation): entrance choreography is for presentation, not function.
- Keep `distance` small (16–32px): this is meant to read as a settle-into-place nudge, not a slide-in panel.

## Tokens Used

`--duration-slow`, `--ease-enter`

## Installation

```bash
npx dafink-ui add slide-in
```

npm dependencies: none
No registry dependencies.
