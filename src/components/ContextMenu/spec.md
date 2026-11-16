# ContextMenu

A right-click menu for any element, opened at the cursor or from the keyboard with Shift+F10 or the Menu key.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | `MenuLeafEntry[]` | None | `{ label, onSelect?, disabled?, selected?, detail? }` or `{ separator: true }`. Same entry shape as `Menu`, minus submenus. |
| children | `ReactNode` | None | The region that opens the menu. Wrapped in a `display: contents` div, so it adds no layout box. |
| label | `string` | `'Context menu'` | Accessible name for the menu (`aria-label`). |
| disabled | `boolean` | `false` | Never opens; the browser's native context menu is left alone. |
| onOpenChange | `(open: boolean) => void` | None | Called when the menu opens or closes. |
| className | `string` | `''` | Additional classes on the menu panel. |

## Variants

None.

## Interactive States

Items render through `Menu`'s exported `MenuEntries`, and the panel uses `Menu`'s `menuPanelClasses`, so hover, active, disabled, and selected states match `Menu` exactly:

- **Item hover / active**: `bg-surface-hover` on hover, `bg-surface-active` for the keyboard-active item.
- **Disabled item**: `opacity-50 cursor-not-allowed`, skipped by arrow keys and typeahead, ignores presses.
- **Panel**: sizes to its content, capped at the viewport height (not `Menu`'s scrolling `max-h-72`); fades and scales 0.95 → 1 on open, reverses on close (150ms exit), respecting `prefers-reduced-motion` via the global rule.

## Accessibility

Popup checklist (menu type, so no focus trap):

- **Touch**: a 500ms long-press opens at the touch point; moving more than 10px or lifting cancels it. (iOS Safari doesn't fire `contextmenu` for long-presses; Android does, and opening twice at one point is harmless.) Mouse presses never start a long-press.
- **Opening**: right-click opens at the cursor, clamped 8px inside the viewport. Shift+F10 or the Menu key opens it anchored below the focused element. A keyboard-initiated `contextmenu` event that reports (0, 0) is anchored the same way.
- **Focus on open**: moves to the menu (`role="menu"`, `tabIndex=-1`); the active item is conveyed with `aria-activedescendant`. The first enabled item starts active.
- **Focus trap**: none (menus don't trap).
- **Escape / Tab**: close and return focus to the element that opened the menu (the nearest focusable ancestor of the right-click target, or whatever had focus).
- **Arrow keys**: Up/Down move between enabled items, wrapping; Home/End jump to the ends.
- **Typeahead**: typing moves to the next item whose label starts with the typed characters (500ms buffer).
- **Enter / Space**: activate the active item, close, and return focus. Items activate on pointer press (same as `Menu`).
- **Outside press, scroll, resize**: close without moving focus.
- **ARIA**: `role="menu"` with `aria-label`; items are `menuitem` (or `menuitemradio` with `aria-checked` when `selected` is set); `aria-disabled` on disabled items; separators are `role="separator"`. No `aria-modal`.
- **Target size**: items are 36px tall.

## When to Use

Use ContextMenu for secondary actions on an object the user is already pointing at: a slide thumbnail, a file, a table row. Always offer the same actions somewhere visible too; right-click is invisible to many users and unavailable on touch. Use `Menu` when the actions should hang off a visible button.

## Tokens Used

Inherited from `Menu`: `bg-surface-panel`, `border-surface-border`, `bg-surface-hover`, `bg-surface-active`, `text-text`, `text-text-muted`, `--shadow-lg`, `--backdrop-blur`, `--radius-lg`, `--radius-sm`, `--duration-base`, `--duration-fast`, `--ease-enter`, `--ease-exit`.

## Installation

```bash
npx dafink-ui add context-menu
```

npm dependencies: none
Registry dependencies: `menu`
