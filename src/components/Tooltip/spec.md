# Tooltip

A small floating text label that appears next to its trigger on hover or keyboard focus. Never contains interactive content.

## Installation

```bash
npx dafink-ui add tooltip
```

No npm dependencies. No registry dependencies.

## Props

| Prop        | Type                                      | Default | Description                                                        |
|-------------|-------------------------------------------|---------|--------------------------------------------------------------------|
| `content`   | `ReactNode`                               | -       | The tooltip text. Must be non-interactive content only.            |
| `children`  | `ReactElement`                            | -       | A single trigger element; receives hover/focus handlers and `aria-describedby` via `cloneElement`. |
| `side`      | `'top' \| 'right' \| 'bottom' \| 'left'`  | `'top'` | Which side of the trigger the tooltip appears on.                  |
| `delay`     | `number`                                  | `300`   | Open delay in milliseconds for hover. Focus shows immediately.     |
| `className` | `string`                                  | `''`    | Additional classes on the wrapper span.                            |

## Keyboard Behavior

| Key / Event   | Action                                                          |
|---------------|------------------------------------------------------------------|
| Focus         | Shows the tooltip immediately (no delay: keyboard users must see it) |
| Blur          | Hides the tooltip                                                |
| Hover         | Shows after `delay` ms; leaving before the delay cancels the open |
| Mouse leave   | Hides the tooltip                                                |
| `Escape`      | Dismisses the tooltip (works for hover-triggered tooltips too; listener is on `document`) |

## Accessibility

- **Role**: the tooltip element has `role="tooltip"`.
- **`aria-describedby`**: set on the trigger pointing at the tooltip id while the tooltip is shown.
- **Shows on focus**: appears on keyboard focus as well as hover; keyboard users are never excluded.
- **Escape**: dismisses a tooltip that appeared on hover or focus.
- **No interactive content**: the tooltip is `pointer-events-none` and must never contain links or buttons. Use Popover for interactive floating content.
- **No focus management**: the tooltip never receives focus and never traps it.

## Interactive States

| State    | Behavior                                                                  |
|----------|---------------------------------------------------------------------------|
| Hidden   | Not mounted in the DOM                                                    |
| Entering | `opacity-0 scale-95` → `opacity-100 scale-100` over `var(--duration-base)` with `var(--ease-enter)` |
| Exiting  | Reverse over `var(--duration-fast)` with `var(--ease-exit)`, then unmounts |

The trigger element keeps its own hover/focus-visible styles; the Tooltip does not alter them.

## Rendering

The tooltip element is portalled to `document.body` via `createPortal` and positioned with `position: fixed` and coordinates computed from `getBoundingClientRect()`. This prevents clipping by any ancestor with `overflow: hidden` or `transform`. Position is recalculated on open, and on `resize` and `scroll` events while the tooltip is mounted.

## Animation

Fade + scale from `opacity-0 scale-95` to `opacity-100 scale-100`. Respects `prefers-reduced-motion` via the global rule in `globals.css`.

Only `opacity` and `transform` are transitioned (`transition-[opacity,transform]`, not `transition-all`): `top`/`left` are set from a post-mount `getBoundingClientRect()` measurement and must snap to their computed value instantly. Transitioning them would visibly animate the panel from its unmeasured `{0, 0}` starting position to its real position on every open.

## Tokens Used

`--color-surface`, `--color-surface-border`, `--color-text`, `--duration-base`, `--duration-fast`, `--ease-enter`, `--ease-exit`

## When to Use

Use Tooltip for short, supplementary text that labels or clarifies a control (icon buttons especially). Do not use it for content the user must read to proceed, for interactive content (use Popover), or for long-form help text. If the control already has a visible label, a tooltip repeating it is noise.
