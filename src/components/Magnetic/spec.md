# Magnetic

A wrapper that makes its child subtly translate toward the cursor when nearby, and snap back to rest when the cursor leaves.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `React.ReactElement` | - | Required. A single interactive child (e.g. a `<Button>`). |
| strength | `number` | `0.3` | Multiplier (0–1) applied to the cursor offset; how strongly the child follows the cursor. |
| range | `number` | `80` | Activation radius in px around the wrapper. Pointer moves beyond this distance are ignored and the child stays at rest. |
| className | `string` | `''` | Additional CSS classes on the wrapping `<div>`. |

Extends all native `<div>` HTML attributes on the wrapper (not the child).

## Visual Design

- The outer `<div>` (`inline-block`, `relative`) tracks pointer position; an inner `<div>` wraps `children` directly and is the element that actually translates — `children` itself is never cloned or mutated.
- While the pointer is within `range`, the inner div's `transform` is set directly via ref (not `setState`) on every `pointermove`, so the follow is instant with zero re-render cost and zero transition delay.
- On `pointerleave`, or when the pointer moves beyond `range`, the inner div resets to `translate(0px, 0px)` with a `transition-transform` of `var(--duration-base)` / `var(--ease-standard)`, so it snaps back smoothly rather than jumping.
- Offset is computed from the wrapper's center: `(pointer.x - center.x) * strength`, `(pointer.y - center.y) * strength`.

## Accessibility

- Purely cosmetic hover feedback; it has no effect on keyboard or touch interaction, and conveys no information on its own — the wrapped child's own focus/hover/active states are unaffected and still fully accessible.
- **`prefers-reduced-motion: reduce`**: checked once via `window.matchMedia('(prefers-reduced-motion: reduce)').matches` on mount (CSS alone cannot intercept a JS pointer-follow loop). When true, the pointer-follow logic is never attached — `onPointerMove`/`onPointerLeave` short-circuit immediately and the child renders at rest, full stop.
- Because the inner wrapper is a plain, non-semantic `<div>`, it adds no ARIA role or tabbable surface; the child retains its own semantics untouched.

## When to Use

- Buttons, icon links, or other small interactive elements where a tactile "pull toward the cursor" effect reinforces that they're clickable.
- Best on isolated, singular targets (a CTA button, a floating action button) — avoid wrapping dense lists of items, where multiple magnetic effects competing for the same cursor become distracting.
- Do not wrap large content blocks; the effect is designed for compact targets, not full cards or sections.

## Tokens Used

`--duration-base`, `--ease-standard`

## Installation

```bash
npx dafink-ui add magnetic
```

npm dependencies: none
No registry dependencies.
