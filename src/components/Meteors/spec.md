# Meteors

A purely decorative ambient background of small diagonal "shooting star" streaks that repeatedly fall across a container, staggered so several are visible mid-flight at once.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Optional content rendered above the meteors layer. |
| count | `number` | `10` | Number of meteor streaks rendered. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<div>` HTML attributes.

## Visual Design

- Outer container: `position: relative`, `overflow: hidden`.
- Each meteor is a small `<span>` streak: a short gradient tail (`background: linear-gradient(var(--color-text-subtle), transparent)`), rotated to a diagonal angle (`rotate: 215deg`), positioned at a seeded `left`% and starting above the container (`top: -10%`) so it enters from off-screen.
- A single shared `@keyframes dafink-meteor` animates each streak's `translate` diagonally down-and-across while fading `opacity` from `1` to `0`, with `animation-iteration-count: infinite`. Per-meteor `animation-duration` and `animation-delay` are seeded so multiple streaks are visible mid-flight simultaneously rather than firing in lockstep.
- The meteors layer is `aria-hidden='true'`. `children`, if present, render above it in a `position: relative; z-index: 10` layer so they stay stacked correctly and remain interactive.

## Accessibility

- The meteors layer is `aria-hidden='true'`: it's decorative and contributes no information.
- **`prefers-reduced-motion: reduce`**: the entire meteors layer is set to `display: none`, rather than just freezing the animation in place. A meteor streak frozen mid-flight doesn't read as an intentional static design the way, say, a field of static dots would — so it's hidden outright. `children` is unaffected either way.
- **Deterministic seeding**: this component renders under SSR. Positions, delays, and durations are derived from a seeded PRNG (`mulberry32`, fixed seed) inside a `useMemo`, not `Math.random()`, so the server-rendered markup and the client's first render produce the exact same values. Using `Math.random()` directly would make the two renders diverge and trigger a React hydration mismatch.

## When to Use

- Ambient decoration behind a hero section, empty state, or marketing panel.
- Not for content that needs to remain perfectly legible while animating heavily behind it — keep contrast in mind when placing text over the layer.

## Tokens Used

`--color-text-subtle`

## Installation

```bash
npx dafink-ui add meteors
```

npm dependencies: none
No registry dependencies.
