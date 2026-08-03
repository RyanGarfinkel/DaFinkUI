# MenuBar

A fixed horizontal navigation bar for the top of an application shell, composed of `MenuBar`, `MenuBarBrand`, `MenuBarActions`, and an optional sliding-pill nav group (`MenuBarNav`, `MenuBarNavItem`, `MenuBarNavMore`).

---

## Props

### MenuBar

| Name      | Type      | Default   | Description                                                    |
|-----------|-----------|-----------|------------------------------------------------------------------|
| height    | string    | `"h-14"`  | Tailwind height class for the bar.                              |
| className | string    | `""`      | Additional CSS classes merged onto the header element.          |
| children  | ReactNode | -         | MenuBar content, typically a brand, nav, search, and actions.    |

### MenuBarBrand

| Name      | Type      | Default   | Description                                          |
|-----------|-----------|-----------|-------------------------------------------------------|
| className | string    | `""`      | Additional CSS classes merged onto the div.          |
| children  | ReactNode | -         | Brand content, typically a logo mark and wordmark, often wrapped in a `Link` to `/`. |

### MenuBarActions

| Name      | Type      | Default   | Description                                                       |
|-----------|-----------|-----------|-----------------------------------------------------------------------|
| className | string    | `""`      | Additional CSS classes merged onto the div.                          |
| children  | ReactNode | -         | Right-aligned action content, typically buttons, menus, or toggles. Pinned to the right via `ml-auto`. |

### MenuBarNav

A controlled, single-select nav button group rendered as a `<nav>` landmark, with a sliding pill indicator behind the active item (same mechanic as `ToggleGroup` in `type="single"` mode).

| Name          | Type                             | Default     | Description                                                                 |
|---------------|-----------------------------------|-------------|-------------------------------------------------------------------------------|
| value         | string                            | -           | The value of the currently active item.                                     |
| onValueChange | (value: string) => void          | -           | Called with the new value when an item, or an entry inside `MenuBarNavMore`, is selected. |
| className     | string                            | `""`        | Additional CSS classes merged onto the `<nav>`.                             |
| aria-label    | string                            | `undefined` | Accessible name for the nav landmark (e.g. `"Main"`).                        |
| children      | ReactNode                        | -           | `MenuBarNavItem` and/or `MenuBarNavMore` elements.                           |

### MenuBarNavItem

| Name      | Type      | Default   | Description                                                                 |
|-----------|-----------|-----------|--------------------------------------------------------------------------------|
| value     | string    | -         | This item's value. Active when it equals `MenuBarNav`'s `value`.               |
| disabled  | boolean   | `false`   | Disables the item; excluded from roving tabindex and arrow key navigation.     |
| className | string    | `""`      | Additional CSS classes.                                                        |
| children  | ReactNode | -         | Item label.                                                                    |

Extends `ButtonHTMLAttributes<HTMLButtonElement>`, so native button props (`onClick` still fires alongside selection, `id`, etc.) pass through.

### MenuBarNavMore

A single nav-pill-styled entry that opens a `DropdownMenu` of overflow destinations. It participates in the same sliding pill and roving tabindex as `MenuBarNavItem`, and lights up as active whenever `MenuBarNav`'s `value` matches one of its own `items`.

| Name      | Type                                                                          | Default | Description                                                                                          |
|-----------|--------------------------------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------|
| value     | string                                                                          | -       | A stable identifier for this trigger's roving-tabindex slot. Does not need to appear in `onValueChange` calls. |
| items     | `{ label: string; value: string; onSelect?: () => void; disabled?: boolean }[]` | -       | Overflow entries rendered in the dropdown. Selecting one calls `MenuBarNav`'s `onValueChange(item.value)`, then `item.onSelect?.()`. |
| className | string                                                                          | `""`    | Additional CSS classes merged onto the trigger.                                                        |
| children  | ReactNode                                                                       | -       | Trigger label, e.g. `"More"`.                                                                          |

---

## Layout

`MenuBar` is `flex items-center` with `gap-2 px-3` (`sm:gap-3 sm:px-6` at wider widths): `MenuBarBrand`, any free-form children (e.g. `MenuBarNav`, or a search input, centered via its own `mx-auto`), and `MenuBarActions` all lay out along that single row. `MenuBarActions`' `ml-auto` pushes it to the right regardless of what precedes it.

By default `MenuBar` is `fixed top-0 left-0 right-0` so it stays pinned to the viewport. If `className` already includes a position keyword (`static`, `fixed`, `absolute`, `sticky`, or `relative`), that override is used instead and the default `fixed` positioning is omitted; this is how the component's own live preview renders it as a contained, in-flow bar (`className="relative"`) instead of covering the whole page.

When paired with a `Sidebar` that has `collapsible`, apply a dynamic `md:ml-56`/`md:ml-16` (matching the sidebar's expanded/collapsed width) via `className` so `MenuBar` starts where the sidebar ends rather than underlapping it; see the docs site's own `DocsHeader` usage (`app/_docs/components/DocsHeader.tsx`, a separate site-specific header) for a worked example.

`MenuBarNav` itself is `relative inline-flex items-center gap-1`, with a single shared indicator `<div>` (`bg-brand`, `motion-safe:transition-[left,width,opacity]`) that repositions to the currently active item's `offsetLeft`/`offsetWidth` on every `value` change, snapping instantly (no transition) on first mount.

---

## Interactive States

`MenuBar`, `MenuBarBrand`, and `MenuBarActions` are structural containers; they don't define their own interactive states.

`MenuBarNavItem` and `MenuBarNavMore`:

| State             | Implementation                                                              |
|-------------------|--------------------------------------------------------------------------------|
| default (inactive)| `text-text-muted`                                                             |
| hover (inactive)  | `hover:text-text hover:bg-surface-hover`                                      |
| active            | `text-brand-fg`, sits above the shared sliding `bg-brand` pill                |
| focus-visible     | `focus-visible:ring-2 focus-visible:ring-brand-ring`                          |
| disabled (`MenuBarNavItem` only) | `disabled:pointer-events-none disabled:opacity-40`, excluded from roving tabindex |

Other interactive elements placed inside `MenuBar` (search triggers, account menus, toggles) are responsible for their own hover/focus-visible/active treatment per `src/patterns/interactive-states.mdx`.

---

## Accessibility

- `<header>` landmark: announced as `banner` by screen readers when it is not nested inside `article`, `aside`, `main`, or `section`.
- `MenuBarNav` renders a `<nav>` landmark; always pass `aria-label` so multiple nav regions on a page (e.g. this one plus a `Sidebar`) are distinguishable.
- **Roving tabindex**: exactly one item (`MenuBarNavItem` or `MenuBarNavMore`'s trigger) has `tabIndex={0}` at a time — whichever is active, or the first non-disabled item if nothing matches yet. All others are `tabIndex={-1}`. Tab enters/exits the group at that one stop.
- **Arrow keys**: `ArrowLeft`/`ArrowRight` move roving focus between items; `Home`/`End` jump to the first/last. `ArrowUp`/`ArrowDown` are intentionally left unhandled by `MenuBarNav` so they still open/close `MenuBarNavMore`'s dropdown per `DropdownMenu`'s own keyboard behavior when it has focus.
- Active item uses `aria-current="page"`, not `aria-pressed` — this is a navigation landmark, not a toggle group.
- `MenuBarNavMore` composes `DropdownMenu` unmodified: focus moves into the menu on open, Escape closes and returns focus to the trigger, arrow keys navigate entries, typeahead and Enter/Space work as documented in `DropdownMenu`'s own spec. See `src/patterns/accessibility.md` for the full popup checklist.
- Purely a layout primitive otherwise: any accessibility requirements for search triggers, menu buttons, or toggles placed inside `MenuBarActions` are the responsibility of those inner components; see their own specs.

---

## When to Use

Use `MenuBar` for the persistent top bar of an application shell: brand, global nav, search, and account/theme controls. Compose `MenuBarBrand` for the leading logo/wordmark and `MenuBarActions` for trailing controls.

Add `MenuBarNav` when the bar itself carries primary site navigation (≤4-5 visible destinations). Use `MenuBarNavItem` for each direct destination, and `MenuBarNavMore` for any remaining destinations that don't fit — it keeps the same sliding-pill treatment and lights up when the active page is one of its entries, so the "current section" story stays coherent even when the active page is tucked inside the overflow menu.

Pair with `Sidebar` for a full dashboard shell (fixed sidebar + fixed top bar), or use `MenuBar` alone (with or without `MenuBarNav`) for flat, shallow navigation where a full sidebar isn't warranted.

---

## Tokens Used

| Token                  | Usage                                     |
|------------------------|--------------------------------------------|
| `bg-surface`           | Bar background (`bg-surface/95`)           |
| `border-surface-border`| Bottom border                              |
| `bg-brand`             | `MenuBarNav`'s sliding active-pill background |
| `text-brand-fg`        | Active nav item/trigger text                |
| `text-text-muted`      | Inactive nav item/trigger text              |
| `bg-surface-hover`     | Inactive nav item/trigger hover background  |
| `brand-ring`           | Focus-visible ring color                    |

---

## Installation

```bash
npx dafink-ui add menu-bar
```

No additional npm dependencies. `MenuBarNavMore` depends on `DropdownMenu` (installed automatically as a registry dependency).
