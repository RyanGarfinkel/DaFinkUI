# ClickSpark

Wraps content and spawns a brief burst of thin spark lines radiating outward from the click point on every click, fading out as they travel — a satisfying, subtle click-feedback effect.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Required. Content to wrap. Clicks anywhere within trigger a burst at the click coordinates. |
| sparkCount | `number` | `8` | Number of spark lines rendered per burst. |
| sparkSize | `number` | `12` | Length of each spark line in pixels. |
| duration | `number` | `400` | Milliseconds for one burst's full shoot-and-fade animation. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<div>` HTML attributes, including `onClick` — a passed-in handler is always called, even when a burst is skipped under reduced motion.

## Visual Design

- Outer wrapper: `position: relative`. Clicking anywhere inside it (including on `children`) triggers a burst.
- On click, a burst object `{ id, x, y }` is added to state, positioned at the click coordinates relative to the wrapper. Each burst renders `sparkCount` thin line `<span>`s, evenly distributed around the circle.
- Each spark line is rotated to its own angle (`(360 / sparkCount) * i` degrees) via a `--spark-angle` custom property, and animated by a single shared `@keyframes dafink-click-spark` that translates the line outward along that rotated axis (`rotate(angle) translateX(0 → travel)`) while fading `opacity` from `1` to `0`. Per-burst `--spark-duration` is piped in via inline style so `sparkSize`/`duration` changes don't require rewriting the keyframe.
- Spark color is `background: var(--color-text-muted)`.
- Multiple rapid clicks stack independent, overlapping bursts — bursts are a keyed array, not a single value, so nothing is dropped or overwritten.
- Each burst is removed from state via `setTimeout` once `duration` elapses, cleaning up its DOM nodes. All pending timeouts are cleared on unmount.

## Accessibility

- Every burst container is `aria-hidden='true'`: it's decorative feedback, not information.
- **`prefers-reduced-motion: reduce`**: checked once inside the click handler itself. When true, burst spawning is skipped entirely — no burst is added to state, no spark lines are ever rendered or animated. This is a full skip, not a sped-up or frozen animation. A passed-in `onClick` still fires regardless of reduced-motion state.

## When to Use

- Buttons, cards, or any clickable surface where a small, satisfying tactile confirmation on click improves feel without being distracting.
- Not for surfaces that are clicked very frequently or in rapid succession as part of a core workflow (e.g. a counter incrementing on every click) — the effect is meant to be occasional flourish, not constant motion.

## Tokens Used

`--color-text-muted`

## Installation

```bash
npx dafink-ui add click-spark
```

npm dependencies: none
No registry dependencies.
