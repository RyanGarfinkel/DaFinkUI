# MenuBar

A fixed horizontal navigation bar for the top of an application shell, composed of three sub-components: `MenuBar`, `MenuBarBrand`, and `MenuBarActions`.

---

## Props

### MenuBar

| Name      | Type      | Default   | Description                                                    |
|-----------|-----------|-----------|------------------------------------------------------------------|
| height    | string    | `"h-14"`  | Tailwind height class for the bar.                              |
| className | string    | `""`      | Additional CSS classes merged onto the header element.          |
| children  | ReactNode | -         | MenuBar content, typically a brand, search, and actions.        |

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

---

## Layout

`MenuBar` is `flex items-center` with `gap-2 px-3` (`sm:gap-3 sm:px-6` at wider widths): `MenuBarBrand`, any free-form children (e.g. a search input, centered via its own `mx-auto`), and `MenuBarActions` all lay out along that single row. `MenuBarActions`' `ml-auto` pushes it to the right regardless of what precedes it, so a search element in between doesn't need its own positioning logic beyond `flex-1`.

By default `MenuBar` is `fixed top-0 left-0 right-0` so it stays pinned to the viewport. If `className` already includes a position keyword (`static`, `fixed`, `absolute`, `sticky`, or `relative`), that override is used instead and the default `fixed` positioning is omitted; this is how the component's own live preview renders it as a contained, in-flow bar (`className="relative"`) instead of covering the whole page.

When paired with a `Sidebar` that has `collapsible`, apply a dynamic `md:ml-56`/`md:ml-16` (matching the sidebar's expanded/collapsed width) via `className` so `MenuBar` starts where the sidebar ends rather than underlapping it; see the docs site's own `TopNav` usage (`app/_docs/components/TopNav.tsx`, a separate site-specific header) for a worked example.

---

## Interactive States

`MenuBar`, `MenuBarBrand`, and `MenuBarActions` are structural containers; they don't define their own interactive states. Interactive elements placed inside (buttons, links, inputs) are responsible for their own hover/focus-visible/active treatment per `src/patterns/interactive-states.mdx`.

---

## Accessibility

- `<header>` landmark: announced as `banner` by screen readers when it is not nested inside `article`, `aside`, `main`, or `section`.
- Purely a layout primitive: any accessibility requirements for search triggers, menu buttons, or toggles placed inside (keyboard reachability, focus-visible rings, `aria-label`s) are the responsibility of those inner components; see their own specs.

---

## When to Use

Use `MenuBar` for the persistent top bar of an application shell: brand, global search, and account/theme controls. Compose `MenuBarBrand` for the leading logo/wordmark and `MenuBarActions` for trailing controls; place anything else (search, breadcrumbs) as plain children between them.

Pair with `Sidebar` for a full dashboard shell (fixed sidebar + fixed top bar), or use `MenuBar` alone for flat, shallow navigation (≤5 destinations) where a full sidebar isn't warranted.

---

## Tokens Used

| Token                  | Usage                          |
|------------------------|----------------------------------|
| `bg-surface`           | Bar background (`bg-surface/95`) |
| `border-surface-border`| Bottom border                    |

---

## Installation

```bash
npx dafink-ui add menu-bar
```

No additional npm dependencies. No registry dependencies.
