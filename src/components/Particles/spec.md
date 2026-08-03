# Particles

A purely decorative ambient background of small floating dots, gently drifting and pulsing opacity, meant to sit behind real content.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Optional content rendered above the particle layer. |
| quantity | `number` | `30` | Number of dots to render. |
| className | `string` | `''` | Additional CSS classes on the container. |

Extends all native `<div>` HTML attributes.

## Visual Design

- Outer container is `position: relative; overflow: hidden`, clipping dots to its bounds.
- Each dot is a small `<span>` (2–5px, `border-radius: 50%`, `background: var(--color-text-subtle)`), absolutely positioned via a per-dot `left`/`top` percentage.
- All dots share one `@keyframes dafink-particles-drift` combining a gentle vertical drift (`translateY(0) → translateY(-8px) → translateY(0)`) with an opacity pulse (`0.2 → 0.8 → 0.2`), so the field feels alive without any single dot dominating.
- Each dot gets its own `--particle-duration` and `--particle-delay` (both derived from the seeded PRNG) so dots drift and pulse out of sync with one another rather than in lockstep.
- `children`, if provided, renders in a `position: relative; z-index: 1` layer above the dots, so real content always stacks above the decorative background and remains fully interactive.

## Accessibility

- The entire dot layer is a single `aria-hidden='true'` wrapper: dots are purely decorative and never intercept focus, clicks, or screen reader traversal.
- **`prefers-reduced-motion: reduce`**: each dot's animation is set to `animation: none` with a static `opacity: 0.5`. Unlike a beam or a meteor, a still field of dots is a coherent static visual on its own, so dots remain visible, just motionless.
- **Deterministic seeded PRNG**: this component renders under SSR. Dot position/size/delay/duration are derived once via `useMemo` from a `mulberry32` PRNG seeded with a fixed constant (not `Date.now()` or unseeded `Math.random()`), so the server-rendered markup and the client's first render produce byte-identical dot placement. Using `Math.random()` directly during render would produce different values on each call, causing a React hydration mismatch on every page load.

## When to Use

- Use behind hero sections, empty states, or marketing panels that want ambient texture without distracting from foreground content.
- Keep `quantity` modest (default `30`); a dense field of animated dots competes with readability of the content above it.
- Do not use as the sole visual differentiator for interactive state — it's decorative background only.

## Tokens Used

`--color-text-subtle`, `--ease-standard`

## Installation

```bash
npx dafink-ui add particles
```

npm dependencies: none
No registry dependencies.
