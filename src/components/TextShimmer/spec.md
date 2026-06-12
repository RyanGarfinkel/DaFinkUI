# TextShimmer

Text with a looping gradient shimmer sweeping across it via `background-clip: text`.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| duration | `number` | `calc(var(--duration-slow) * 8)` (2400ms) | Duration of one shimmer sweep in milliseconds. |
| children | `ReactNode` | — | Required. The text to shimmer. |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<span>` HTML attributes.

## Visual Design

- Gradient: `linear-gradient(110deg, var(--color-text) 35%, var(--color-text-muted) 50%, var(--color-text) 65%)`, `background-size: 200% auto`, clipped to the glyphs with `background-clip: text`.
- The base of the gradient is `--color-text` and the moving highlight is `--color-text-muted` — both AA-validated tokens, so the text remains readable at every frame of the loop, in light and dark mode.
- The sweep animates `background-position` from `200%` to `-200%` with `--ease-standard`, looping infinitely.
- Default sweep duration is token-derived (`calc(var(--duration-slow) * 8)`); pass `duration` to override.

## Accessibility

- **`prefers-reduced-motion: reduce`** — a CSS media query removes the animation *and* the gradient, restoring plain static `--color-text` via `-webkit-text-fill-color: currentColor`. No motion, full contrast.
- The text is real DOM text — selectable, searchable, and read normally by screen readers. The shimmer is purely presentational and adds no ARIA noise.
- Both gradient stops meet the 4.5:1 body-text contrast minimum, so contrast never dips below AA mid-sweep.

## When to Use

- Use sparingly for a single emphasized phrase — a hero heading, an AI "thinking" label, or a premium/new feature callout.
- Do not apply to body copy or to more than one element per view; a looping animation competes for attention.
- For loading placeholders of unknown content, use `Skeleton` instead — TextShimmer is for real, readable text.

## Tokens Used

`--color-text`, `--color-text-muted`, `--duration-slow`, `--ease-standard`

## Installation

```bash
npx @obi/ui add text-shimmer
```

npm dependencies: none
No registry dependencies.
