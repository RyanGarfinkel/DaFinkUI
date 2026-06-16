# CommandPalette

A global command palette overlay for quick navigation and action execution. Opens as a modal centered on the screen, accepts freeform text search, and filters a compound list of grouped, actionable items in real time.

---

## Installation

```bash
npx @dafink/ui add command-palette
```

No additional npm packages required. No registry dependencies.

---

## Exports

| Export           | Type      | Description                                      |
|------------------|-----------|--------------------------------------------------|
| `CommandPalette` | Component | The modal overlay — default and named export     |
| `CommandGroup`   | Component | Groups items with an optional heading label      |
| `CommandItem`    | Component | A single actionable item within a group          |

---

## Props

### CommandPalette

| Prop          | Type          | Default             | Description                                                    |
|---------------|---------------|---------------------|----------------------------------------------------------------|
| `open`        | `boolean`     | —                   | Controls whether the palette is rendered and visible.          |
| `onClose`     | `() => void`  | —                   | Called when the user dismisses via Escape, backdrop, or select.|
| `placeholder` | `string`      | `"Search commands…"`| Placeholder text for the search input.                         |
| `children`    | `ReactNode`   | —                   | `CommandGroup` and/or `CommandItem` elements.                  |

### CommandGroup

| Prop       | Type        | Default | Description                                             |
|------------|-------------|---------|---------------------------------------------------------|
| `label`    | `string`    | —       | Optional heading label rendered above the group items.  |
| `children` | `ReactNode` | —       | One or more `CommandItem` elements.                     |

### CommandItem

| Prop       | Type          | Default | Description                                                                |
|------------|---------------|---------|----------------------------------------------------------------------------|
| `onSelect` | `() => void`  | —       | Called when the item is activated by click, pointer, or Enter key.         |
| `value`    | `string`      | —       | The string used for search filtering (case-insensitive substring match).   |
| `disabled` | `boolean`     | `false` | When true, item is shown dimmed, is skipped in keyboard nav, and is not clickable. |
| `icon`     | `ReactNode`   | —       | Optional icon rendered left of the label.                                  |
| `shortcut` | `string`      | —       | Optional keyboard shortcut string shown right-aligned (e.g. `"⌘K"`).       |
| `children` | `ReactNode`   | —       | The display label. String children have matched substrings highlighted.    |

---

## Search Filtering

- Filtering is case-insensitive substring matching against each item's `value` prop.
- Items whose `value` does not contain the current query are hidden (`display: none` equivalent — they return `null` from render).
- `CommandGroup` components hide themselves entirely when all their child items are filtered out.
- When the query is non-empty and zero items match, an empty state message is shown: `No results for "{query}"`.
- Matched substring in string `children` is wrapped in `<mark>` with `text-brand font-semibold`.

---

## Keyboard Behavior

| Key            | Behavior                                                                      |
|----------------|-------------------------------------------------------------------------------|
| `ArrowDown`    | Move focus to next visible, enabled item. Wraps from last to first.           |
| `ArrowUp`      | Move focus to previous visible, enabled item. Wraps from first to last.       |
| `Home`         | Jump focus to the first visible, enabled item.                                |
| `End`          | Jump focus to the last visible, enabled item.                                 |
| `Enter`        | Activate the currently focused item — calls `onSelect`, then `onClose`.       |
| `Escape`       | Close the palette — calls `onClose`. Focus returns to the trigger element.    |
| `Tab`          | Cycles focus within the overlay (focus trap). Does not escape to the page.    |
| `Shift+Tab`    | Cycles focus backward within the overlay (focus trap).                        |

Disabled items are completely skipped during keyboard navigation.

---

## Accessibility

### ARIA Roles

| Element              | Role / Attribute                                                              |
|----------------------|-------------------------------------------------------------------------------|
| Overlay wrapper      | `role="dialog"`, `aria-modal="true"`, `aria-label="Command palette"`          |
| Search input         | `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded="true"`, `aria-controls={listId}`, `aria-activedescendant` (points to focused item id) |
| Item list            | `role="listbox"`, `aria-label="Commands"`                                     |
| Group                | `role="group"`, `aria-label` = group label (when provided)                    |
| Item                 | `role="option"`, `aria-selected` (true when focused), `aria-disabled` (when disabled) |

### Focus Management

- On open: focus moves to the search input immediately via `requestAnimationFrame`.
- Focus trap: Tab and Shift+Tab cycle through all focusable elements within the dialog (search input and any other interactive content). Focus never escapes to the page behind the overlay.
- On close: the caller is responsible for returning focus to the trigger element. `onClose` is called without side effects — store a `ref` to the trigger and call `.focus()` in the `onClose` handler.
- Escape: calls `onClose` and stops event propagation to prevent nested overlays from being dismissed simultaneously.

### Scroll Lock

While the palette is open, `document.body.style.overflow` is set to `'hidden'`. This is removed when `open` becomes false (or on component unmount). The previous overflow value is restored.

### Reduced Motion

All transitions use the `motion-safe:` Tailwind variant. The palette does not animate when the user has `prefers-reduced-motion: reduce` set.

---

## Animation

Uses the `mounted` + `visible` two-phase pattern (same as `Select`):

1. `mounted` — controls DOM presence. Set to `true` when `open` becomes `true`. Set to `false` via `setTimeout(150)` after `visible` becomes `false` (exit transition must complete before unmounting).
2. `visible` — controls CSS classes. Set to `true` via `requestAnimationFrame` after `mounted` to ensure the initial `opacity-0 scale-95` state is painted before the transition begins.

**Backdrop:** `opacity-0` → `opacity-100` at `--duration-base`.
**Panel:** `opacity-0 scale-95` → `opacity-100 scale-100` at `--duration-base` on enter; reverse at `--duration-base` on exit.

---

## Tokens Used

| Token                  | Where used                                                 |
|------------------------|------------------------------------------------------------|
| `bg-surface`           | Panel background                                           |
| `border-surface-border`| Panel border, group header separator, shortcut key border  |
| `bg-surface-active`    | Focused item background                                    |
| `bg-surface-hover`     | Hovered item background                                    |
| `text-text`            | Primary item text, focused item text                       |
| `text-text-muted`      | Unfocused item text, icon color, shortcut key color        |
| `text-text-subtle`     | Placeholder text, group heading text                       |
| `text-brand`           | Highlighted match characters in `<mark>`                   |
| `bg-text/40`           | Backdrop overlay (brand text color at 40% opacity)         |

---

## When to Use

Use a command palette when:

- The product has many actions or destinations that are hard to surface through standard navigation.
- Power users benefit from keyboard-first access to any action in the app.
- You want a unified search-and-execute surface (Linear, Vercel, GitHub all use this pattern).

Do not use a command palette as a replacement for well-organized navigation. It complements navigation — it does not replace it.

---

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import CommandPalette, {
  CommandGroup,
  CommandItem,
} from '@/src/components/CommandPalette/CommandPalette';
import Button from '@/src/components/Button/Button';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open palette ⌘K</Button>

      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        placeholder="Search commands…"
      >
        <CommandGroup label="Navigation">
          <CommandItem value="Go to Dashboard" onSelect={() => setOpen(false)} shortcut="⌘D">
            Go to Dashboard
          </CommandItem>
          <CommandItem value="Go to Settings" onSelect={() => setOpen(false)} shortcut="⌘,">
            Go to Settings
          </CommandItem>
        </CommandGroup>
        <CommandGroup label="Actions">
          <CommandItem value="Create new project" onSelect={() => setOpen(false)} shortcut="⌘N">
            Create new project
          </CommandItem>
          <CommandItem value="Delete account" onSelect={() => setOpen(false)} disabled>
            Delete account
          </CommandItem>
        </CommandGroup>
      </CommandPalette>
    </>
  );
}
```
