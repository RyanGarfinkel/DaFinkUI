# Ripple

Decorative concentric rings expanding outward and fading out in a continuous, staggered loop, typically placed behind a logo or icon.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | - | Optional content rendered centered above the rings. |
| count | `number` | `4` | Number of concentric rings. |
| duration | `number` | `3000` | Milliseconds for one ring's full expand-and-fade cycle. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<div>` HTML attributes.

## Visual Design

- Each ring is an outline circle (`border-radius: 50%`, `border: 1px solid var(--color-brand)`, no fill) absolutely centered inside the container.
- A ring's animation scales it from `0.25` up to `1.5` while its `opacity` fades from `0.6` to `0`, looping `infinite` on `var(--ease-standard)`.
- Rings are staggered: ring `i` gets `animation-delay: (duration / count) * i`, so at any given moment multiple rings are visible mid-expansion at different stages rather than pulsing in lockstep.
- `children` (if present) is stacked above the rings via `z-index`, so a logo or icon placed inside always reads clearly on top of the animation.

## Accessibility

- **`prefers-reduced-motion: reduce`**: the entire rings container is set to `display: none`. A mid-expand-and-fade ring has no coherent "paused" frame that reads as intentional, so rather than freezing it, the effect is removed completely. Any `children` passed in still render normally and are unaffected.
- The rings container is `aria-hidden='true'` at all times — the animation is purely decorative and adds no information screen readers need. If `children` is present, that is the real content; the rings behind it add nothing to announce.

## When to Use

- As an ambient background accent behind a static logo, icon, or avatar — e.g. a "listening" or "live" indicator, a loading/processing accent, or a hero logo treatment.
- Do not use as the sole indicator of a loading or processing state where the outcome matters to the user — pair it with a text label or `Spinner` if the state needs to be unambiguous, since the rings alone carry no semantic meaning.
- Keep `count` modest (3–6); too many rings on a long `duration` becomes visual noise rather than an accent.

## Tokens Used

`--color-brand`, `--ease-standard`

## Installation

```bash
npx dafink-ui add ripple
```

npm dependencies: none
No registry dependencies.
