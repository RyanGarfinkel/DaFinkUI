# Spotlight

Wraps content in a container with a soft radial glow that follows the cursor, revealing a "spotlight" highlight as it moves over it.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Required. Content rendered inside the spotlighted container. |
| size | `number` | `400` | Glow diameter in pixels. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<div>` HTML attributes.

## Visual Design

- Root container: `position: relative`, `overflow: hidden` so the glow never spills outside rounded corners.
- An absolutely-positioned overlay sits above `children` visually but with `pointer-events: none`, so it never blocks interaction with the real content underneath.
- The glow is a radial gradient centered on the cursor: `radial-gradient(circle at var(--spot-x) var(--spot-y), color-mix(in srgb, var(--color-brand) 15%, transparent) 0%, transparent {size/2}px)`. `color-mix(in srgb, ...)` is used to derive a translucent brand tint from a token that's stored as a plain hex string.
- On pointer move, `--spot-x`/`--spot-y` are mutated directly on the overlay element's style via `ref.current.style.setProperty(...)` — not through React state — so the glow tracks the cursor smoothly without a re-render on every `pointermove` event. Offsets are computed relative to the container's bounding rect, so the gradient tracks correctly regardless of page scroll position.
- The overlay fades in/out via `opacity-0` → `opacity-100` on `onPointerEnter`/`onPointerLeave`, animated with `transition-opacity duration-[var(--duration-base)]`.
- `--spot-x`/`--spot-y` default to `50%`/`50%` as initial inline styles, so there's no flash of an undefined position before the first pointer move.

## Accessibility

- The overlay is `aria-hidden='true'`: it's purely decorative and adds no information for assistive technology.
- The pointer-follow effect has no reduced-motion special case beyond the global transition-clamp in `globals.css`. It's a user-driven, one-shot response to cursor movement, not an automatic or looping animation, so there is nothing to suppress under `prefers-reduced-motion`; the fade transition itself is already clamped to near-instant by the global rule.
- On touch devices or with no pointer, the glow simply never appears (no `pointerenter`/`pointermove` events fire) — this is fine, since the glow is a non-essential visual embellishment and `children` render and function identically either way.

## When to Use

- Cards, panels, or feature tiles that benefit from a premium, interactive feel on hover.
- Do not rely on it to convey information — it's decorative only. Any state that matters must also be communicated through visible content or borders.

## Tokens Used

`--color-brand`, `--duration-base`

## Installation

```bash
npx dafink-ui add spotlight
```

npm dependencies: none
No registry dependencies.
