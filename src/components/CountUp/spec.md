# CountUp

Animates a number from a start value to its final value when scrolled into view, while screen readers always get the real value.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `number` | — | Required. Final value to count up to. |
| start | `number` | `0` | Value the animation starts from. |
| duration | `number` | `1000` | Animation duration in milliseconds. |
| decimals | `number` | `0` | Number of decimal places rendered. |
| prefix | `string` | `''` | String prepended to the number (e.g. `"$"`). |
| suffix | `string` | `''` | String appended to the number (e.g. `"%"`). |
| separator | `string` | `''` | Thousands separator (e.g. `","`). |
| className | `string` | `''` | Additional CSS classes. |

Extends all native `<span>` HTML attributes.

## Behavior

- Animates with `requestAnimationFrame`, eased by the `--ease-standard` token curve `cubic-bezier(0.2, 0, 0, 1)` (evaluated in JS, mirroring `src/tokens/motion.ts`).
- Starts when the element is 50% visible (`threshold: 0.5`); runs once, then unobserves.
- Server render / no JavaScript / no IntersectionObserver → the final value is rendered immediately.
- The pending frame is cancelled on unmount.
- `tabular-nums` is applied so digits don't jitter horizontally while counting.

## Accessibility

- **The real final value is always in the DOM** in a visually hidden (`sr-only`) span — screen readers read the true number regardless of animation state. The animated counter is `aria-hidden="true"` and purely visual. No `aria-live` churn, no announcing intermediate values.
- **`prefers-reduced-motion: reduce`** — checked via `matchMedia('(prefers-reduced-motion: reduce)')` in JS (CSS rules can't stop rAF animation); the final value renders immediately with no counting.
- Non-interactive: no focus, no role.

## When to Use

- Use for stat blocks, KPI dashboards, and marketing metrics where the count-up draws attention to a number as it scrolls in.
- Do not use for values that update continuously (timers, live prices) — it animates once on entry.
- Pair with `Reveal` for combined entrance + count choreography.

## Tokens Used

`--ease-standard` (curve mirrored in JS from `src/tokens/motion.ts`)

## Installation

```bash
npx @obi/ui add count-up
```

npm dependencies: none
No registry dependencies.
