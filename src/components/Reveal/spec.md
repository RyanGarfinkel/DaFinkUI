# Reveal

Scroll-triggered entrance animation driven by IntersectionObserver, with a RevealGroup for staggered cascades.

---

## Props

### Reveal

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| effect | `'fade' \| 'slide-up' \| 'slide-left' \| 'slide-right' \| 'scale'` | `'fade'` | Entrance effect applied when the element scrolls into view. |
| delay | `number` | `0` | Delay in milliseconds before the transition starts. |
| once | `boolean` | `true` | Reveal only on first entry. When `false`, content re-hides on exit and re-reveals on re-entry. |
| className | `string` | `''` | Additional CSS classes. |
| children | `ReactNode` | — | Content to reveal. |

Extends all native `<div>` HTML attributes.

### RevealGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| stagger | `number` | `100` | Milliseconds added to each successive child Reveal's delay. |
| delay | `number` | `0` | Base delay applied to the first child. |
| effect | `RevealEffect` | — | Default effect for child Reveal items that don't set their own. |
| once | `boolean` | — | Default `once` for child Reveal items that don't set their own. |
| children | `ReactNode` | — | `<Reveal>` elements (non-Reveal children render unchanged). |

Extends all native `<div>` HTML attributes.

## Effects

| Effect | Hidden state |
|--------|--------------|
| `fade` | `opacity-0` |
| `slide-up` | `opacity-0 translate-y-4` — enters moving up |
| `slide-left` | `opacity-0 translate-x-4` — enters moving left |
| `slide-right` | `opacity-0 -translate-x-4` — enters moving right |
| `scale` | `opacity-0 scale-95` |

All effects transition to `opacity-100 translate-x-0 translate-y-0 scale-100` at `--duration-slow` (300ms) with `--ease-enter`, per the design guideline for complex entry animations.

## Behavior

- **Progressive enhancement** — content renders fully visible on the server, without JavaScript, and when IntersectionObserver is unavailable. It is only hidden after the observer is confirmed running on mount, so nothing is ever stuck invisible.
- Reveal triggers at 15% visibility (`threshold: 0.15`).
- With `once` (default), the element is unobserved after revealing.
- RevealGroup cascades `delay + index * stagger` onto children; a child's explicit `delay`, `effect`, or `once` always wins.

## Accessibility

- **`prefers-reduced-motion: reduce`** — checked via `matchMedia` before anything is hidden; content stays fully visible and no observer is created. No motion, no flash.
- The wrapper is a plain `<div>` with no role — it adds nothing to the accessibility tree and does not affect focus order or semantics of its children.
- Content is present in the DOM at all times (only opacity/transform animate), so screen readers and find-in-page see it before it animates.

## When to Use

- Use for marketing/landing sections, feature lists, and stat blocks entering on scroll.
- Do not wrap critical UI (forms, errors, navigation) — entrance choreography is for presentation, not function.
- Do not combine with page-level entry animations; page transitions are handled globally.
- Keep staggers modest (50–150ms) — long cascades make users wait.

## Tokens Used

`--duration-slow`, `--ease-enter`

## Installation

```bash
npx @dafink/ui add reveal
```

npm dependencies: none
No registry dependencies.
