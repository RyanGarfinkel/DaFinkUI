# DropdownMenu

A trigger button that opens a floating menu of actions with full keyboard navigation, typeahead, separators, and disabled items.

## Installation

```bash
npx @obi/ui add dropdown-menu
```

No npm dependencies. No registry dependencies.

## Props

| Prop               | Type                                      | Default     | Description                                                  |
|--------------------|-------------------------------------------|-------------|---------------------------------------------------------------|
| `items`            | `DropdownMenuEntry[]`                     | —           | Array of items (`{ label, onSelect?, disabled? }`) and separators (`{ separator: true }`). |
| `trigger`          | `ReactNode`                               | —           | Content of the built-in trigger button.                      |
| `side`             | `'top' \| 'right' \| 'bottom' \| 'left'`  | `'bottom'`  | Which side of the trigger the menu appears on.               |
| `align`            | `'start' \| 'center' \| 'end'`            | `'start'`   | Alignment along the chosen side.                             |
| `onSelect`         | `(item: DropdownMenuItem) => void`        | `undefined` | Called with the activated item, in addition to the item's own `onSelect`. |
| `disabled`         | `boolean`                                 | `false`     | Disables the trigger.                                        |
| `className`        | `string`                                  | `''`        | Additional classes on the menu list.                         |
| `triggerClassName` | `string`                                  | `''`        | Additional classes on the trigger button.                    |

## Keyboard Behavior

| Key             | Action                                                            |
|-----------------|--------------------------------------------------------------------|
| `Enter / Space` | On trigger: opens the menu. In menu: activates the active item and closes |
| `ArrowDown`     | On trigger: opens with first item active. In menu: next enabled item (wraps) |
| `ArrowUp`       | On trigger: opens with last item active. In menu: previous enabled item (wraps) |
| `Home`          | First enabled item                                                |
| `End`           | Last enabled item                                                 |
| `Escape`        | Closes, returns focus to the trigger                              |
| `Tab`           | Closes, moves focus to the next page element (not trapped)        |
| Printable char  | Typeahead — moves to the next enabled item whose label starts with the accumulated characters (buffer resets after 500 ms) |

Disabled items are skipped by arrow navigation, Home/End, and typeahead, but remain visible in the menu.

## Accessibility

- **Focus entry**: on open, focus moves to the menu list (`tabIndex={-1}`); the active item is tracked via `aria-activedescendant`.
- **Focus trap**: **not trapped** — Tab closes the menu and moves on.
- **Escape**: closes and returns focus to the trigger.
- **Tab**: closes without intercepting the keypress, so focus continues to the next page element.
- **Arrow keys**: ArrowDown/ArrowUp move between enabled items with wrapping; Home/End jump to the ends.
- **ARIA roles**: trigger has `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`. List has `role="menu"`, `aria-labelledby` (the trigger), `aria-activedescendant`. Items have `role="menuitem"`; separators have `role="separator"`.
- **Disabled items**: communicated with `aria-disabled="true"` plus reduced opacity and `cursor-not-allowed` — never color alone. They are visible but skipped in navigation and inert to clicks.
- **Focus return**: focus returns to the trigger on Escape and on item activation; outside-click and Tab leave focus where the user sent it.

## Interactive States

| State          | Trigger                                            | Item                                  |
|----------------|----------------------------------------------------|----------------------------------------|
| Default        | `border-input-border bg-input`                     | `text-text-muted`                     |
| Hover          | `hover:border-brand`                               | `hover:bg-surface-hover hover:text-text` |
| Focus-visible  | `focus-visible:ring-2 ring-brand-ring ring-offset-2` | N/A (keyboard via `aria-activedescendant`) |
| Active (kbd)   | —                                                  | `bg-surface-active text-text`         |
| Disabled       | `opacity-50 cursor-not-allowed pointer-events-none` | `opacity-50 cursor-not-allowed` + `aria-disabled` |

## Animation

Menu enters with `opacity-0 scale-95` → `opacity-100 scale-100` over `var(--duration-base)` with `var(--ease-enter)`, exits in reverse over `var(--duration-fast)` with `var(--ease-exit)`. Transform origin faces the trigger. Respects `prefers-reduced-motion` via the global rule in `globals.css`.

## Tokens Used

`--color-brand`, `--color-brand-ring`, `--color-input`, `--color-input-border`, `--color-surface`, `--color-surface-border`, `--color-surface-hover`, `--color-surface-active`, `--color-text`, `--color-text-muted`, `--duration-base`, `--duration-fast`, `--ease-enter`, `--ease-exit`

## When to Use

Use DropdownMenu for a list of actions attached to a button — row actions, "more" menus, bulk operations. Use Select when the user is choosing a value that persists, Popover for arbitrary interactive content, and CommandPalette for global, searchable command lists.
