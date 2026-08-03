# Confetti

Wraps content, typically a button, and bursts colorful confetti pieces outward from the click point on every click — falling, spinning, and fading out. A celebratory effect for success states, completions, and purchases.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Required. Content to wrap, typically a button. Clicking it (or anywhere in the wrapper) triggers the burst. |
| particleCount | `number` | `60` | Number of confetti pieces rendered per burst. |
| colors | `string[]` | `['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa']` | Hex colors randomly assigned to pieces. |
| duration | `number` | `1500` | Milliseconds for one burst's full fall-and-fade animation. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<div>` HTML attributes, including `onClick` — a passed-in handler is always called, even when a burst is skipped under reduced motion.

## Visual Design

- Outer wrapper: `position: relative`. Clicking anywhere inside it (including on `children`) triggers a burst.
- On click, a burst object `{ id, x, y, pieces }` is added to state, positioned at the click coordinates relative to the wrapper. `pieces` are generated once at spawn time: each is a tiny rectangle (`2–4px` wide, `6–10px` tall) with a random color from `colors`, a random initial rotation, a random end offset (`dx` roughly ±100px, `dy` 100–250px downward so pieces generally fall outward and down), and a random additional spin (±360°).
- Unlike the evenly-distributed spark lines in `ClickSpark`, every piece needs its own randomized end position — so each piece animates via an inline CSS `transition` (`transform`, `opacity`) rather than a shared `@keyframes`. On mount, a burst renders all pieces at their start transform/opacity, then flips to the pre-computed random end transform/opacity a tick later (via `requestAnimationFrame`), letting the CSS transition carry them from start to end.
- Multiple rapid clicks stack independent, overlapping bursts — bursts are a keyed array, not a single value, so nothing is dropped or overwritten.
- Each burst is removed from state via `setTimeout` once `duration` elapses, cleaning up its DOM nodes. All pending timeouts are cleared on unmount.

## Accessibility

- Every burst container is `aria-hidden='true'`: it's decorative feedback, not information.
- **`prefers-reduced-motion: reduce`**: checked once inside the click handler itself. When true, burst spawning is skipped entirely — no burst is added to state, no confetti pieces are ever rendered or animated. This is a full skip, not a sped-up or frozen animation. A passed-in `onClick` still fires regardless of reduced-motion state.

## When to Use

- Success states, completions, purchases, or any moment worth a brief celebratory flourish.
- Not for frequent or repeated actions — reserve it for genuinely notable moments so it doesn't become noise.

## Tokens Used

None — confetti color is intentionally arbitrary/decorative rather than semantic UI color; the effect's entire purpose depends on genuine multi-hue variety, which the repo's semantic design tokens (brand, text, surface) don't provide. Override via the `colors` prop if you need brand-specific hues.

## Installation

```bash
npx dafink-ui add confetti
```

npm dependencies: none
No registry dependencies.
