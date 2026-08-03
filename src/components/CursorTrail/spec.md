# CursorTrail

Wraps content in a container; as the pointer moves within it, a short trail of glowing dots follows the cursor with a slight lag, each dot progressively smaller and fainter toward the tail.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Required. Content the trail overlays. |
| trailLength | `number` | `6` | Number of dots in the trail. |
| size | `number` | `12` | Diameter in pixels of the leading (largest) dot. Trailing dots shrink proportionally toward the tail. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<div>` HTML attributes.

## Visual Design

- Root container: `position: relative`, `overflow: hidden` so the trail never spills outside rounded corners.
- Renders `trailLength` absolutely-positioned dot `<span>` elements above `children`, each `aria-hidden='true'` and `pointer-events: none` so the trail never blocks interaction with the real content underneath.
- Dot `index` (0 is the leading dot) is sized as `size * (1 - index / trailLength)` and given a matching opacity fraction `1 - index / trailLength`, so the leading dot is largest and fully opaque, and each dot toward the tail is progressively smaller and fainter.
- On pointer move, the pointer position (relative to the container's bounding rect) is unshifted into a ring buffer of the last `trailLength` positions held in a ref, with the oldest position popped off the end. Each dot's `style.left`/`style.top` is then mutated directly from the corresponding entry in that buffer — dot 0 gets the newest position, dot 1 the previous one, and so on — producing the lagging-trail look. This is a direct DOM mutation, not `setState`, so the trail never triggers a React re-render on `pointermove`, matching Spotlight's performance pattern.
- Each dot has `transition-[left,top] duration-[var(--duration-fast)] ease-[var(--ease-standard)]`, so its position eases smoothly between pointer-move samples instead of snapping — this easing between discrete samples is what actually produces the visible "lag."
- Dot color is `background: var(--color-brand)` with a matching `box-shadow` blur for a soft glow, both token-derived.
- Dots start at `opacity: 0` (and an inert `left: 0px; top: 0px`) so there is no flash of stacked dots at the origin before the user has moved the cursor. The first `pointermove` sets each dot's opacity to its computed target value; subsequent moves only update position, since opacity per dot is otherwise static.

## Accessibility

- All dots are `aria-hidden='true'`: the trail is purely decorative and adds no information for assistive technology.
- **`prefers-reduced-motion: reduce`**: checked once on mount via `window.matchMedia('(prefers-reduced-motion: reduce)').matches` into a ref (not state), following the same pattern as `Magnetic`. When true, the `pointermove` handler's positioning logic short-circuits immediately and never runs — dots are never revealed and never repositioned, so they simply stay at their initial, invisible rest state (`opacity: 0`) for the lifetime of the component, rather than partially degrading (e.g. flashing into view and then freezing).
- On touch devices or with no pointer, the trail never appears (no `pointermove` events fire) — this is fine, since the trail is a non-essential visual embellishment and `children` render and function identically either way.

## When to Use

- Hero sections, interactive canvases, or empty states that benefit from an ambient, playful cursor-follow effect.
- Do not rely on it to convey information — it's decorative only. Any state that matters must also be communicated through visible content or borders.

## Tokens Used

`--color-brand`, `--duration-fast`, `--ease-standard`

## Installation

```bash
npx dafink-ui add cursor-trail
```

npm dependencies: none
No registry dependencies.
