# Popover

A click-triggered, non-modal floating panel anchored to its trigger button. Focus moves in on open but is never trapped.

## Installation

```bash
npx dafink-ui add popover
```

No npm dependencies. No registry dependencies.

## Props

| Prop               | Type                                      | Default     | Description                                                  |
|--------------------|-------------------------------------------|-------------|---------------------------------------------------------------|
| `trigger`          | `ReactNode`                               | —           | Content of the built-in trigger button.                      |
| `children`         | `ReactNode`                               | —           | Panel content. May contain interactive elements.             |
| `side`             | `'top' \| 'right' \| 'bottom' \| 'left'`  | `'bottom'`  | Which side of the trigger the panel appears on.              |
| `align`            | `'start' \| 'center' \| 'end'`            | `'center'`  | Alignment along the chosen side.                             |
| `label`            | `string`                                  | `undefined` | Accessible name for the panel (`aria-label`).                |
| `onOpenChange`     | `(open: boolean) => void`                 | `undefined` | Called whenever the popover opens or closes.                 |
| `disabled`         | `boolean`                                 | `false`     | Disables the trigger.                                        |
| `className`        | `string`                                  | `''`        | Additional classes on the panel.                             |
| `triggerClassName` | `string`                                  | `''`        | Additional classes on the trigger button.                    |

## Keyboard Behavior

| Key / Event     | Action                                                              |
|-----------------|----------------------------------------------------------------------|
| `Enter / Space` | On trigger: toggles the popover (native button activation)          |
| `Escape`        | Closes the popover and returns focus to the trigger                 |
| `Tab`           | Moves through the panel content; tabbing past the end closes the popover and continues to the next page element |
| Click outside   | Closes the popover (focus is not stolen)                            |

## Accessibility

- **Focus entry**: on open, focus moves to the first focusable element inside the panel, or to the panel itself (`tabIndex={-1}`) if there is none.
- **Focus trap**: **not trapped** — this is a non-modal overlay. Tab walks through the panel and then out; leaving the panel closes it.
- **Escape**: closes and returns focus to the trigger.
- **Tab**: not intercepted; focus leaving the panel closes it via `focusout` without grabbing focus back.
- **ARIA roles**: panel has `role="dialog"` with **no** `aria-modal`; trigger has `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` while open. Name the panel with `label`.
- **Focus return**: focus returns to the trigger when closed via Escape or trigger toggle; outside-click and tab-out leave focus where the user put it.
- **No scroll lock**: the page behind remains scrollable (non-blocking overlay).

## Interactive States

| State         | Trigger                                            | Panel                       |
|---------------|----------------------------------------------------|-----------------------------|
| Default       | `border-input-border bg-input`                     | `bg-surface border-surface-border shadow-lg` |
| Hover         | `hover:border-brand`                               | —                           |
| Focus-visible | `focus-visible:ring-2 ring-brand-ring ring-offset-2` | —                         |
| Disabled      | `opacity-50 cursor-not-allowed pointer-events-none` | —                          |

## Rendering

The panel is portalled to `document.body` via `createPortal` and positioned with `position: fixed` and coordinates computed from `getBoundingClientRect()`. This prevents clipping by any ancestor with `overflow: hidden` or `transform`. Position is recalculated on open, and on `resize` and `scroll` events while the panel is mounted.

## Animation

Panel enters with `opacity-0 scale-95` → `opacity-100 scale-100` over `var(--duration-base)` with `var(--ease-enter)`, exits in reverse over `var(--duration-fast)` with `var(--ease-exit)`. Respects `prefers-reduced-motion` via the global rule in `globals.css`.

## Tokens Used

`--color-brand`, `--color-brand-ring`, `--color-input`, `--color-input-border`, `--color-surface`, `--color-surface-border`, `--color-text`, `--duration-base`, `--duration-fast`, `--ease-enter`, `--ease-exit`

## When to Use

Use Popover for small interactive surfaces anchored to a control — filters, share panels, inline settings. Use Modal/Dialog instead when the task must block the page, and Tooltip when the content is plain non-interactive text. Use DropdownMenu when the content is a list of actions.
