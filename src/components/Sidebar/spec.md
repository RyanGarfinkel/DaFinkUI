# Sidebar

A vertical navigation sidebar composed of six sub-components: `Sidebar`, `SidebarHeader`, `SidebarFooter`, `SidebarSection`, `SidebarLink`, and `SidebarDivider`. Supports an optional collapsed/expanded rail state with a built-in toggle button.

---

## Props

### Sidebar

| Name              | Type                          | Default   | Description                                                             |
|-------------------|-------------------------------|-----------|---------------------------------------------------------------------------|
| width             | string                        | `"w-56"`  | Tailwind width class used when expanded.                                |
| collapsedWidth    | string                        | `"w-16"`  | Tailwind width class used when collapsed.                               |
| collapsible       | boolean                       | `false`   | Renders the built-in expand/collapse toggle button.                     |
| collapsed         | boolean                       | -         | Controlled collapsed state. Omit to let `Sidebar` manage state itself.  |
| defaultCollapsed  | boolean                       | `false`   | Initial collapsed state when uncontrolled.                              |
| onCollapsedChange | (collapsed: boolean) => void  | -         | Called whenever the toggle button changes the collapsed state.          |
| togglePosition    | `'top' \| 'middle' \| 'bottom'` | `'middle'` | Where the collapse toggle button sits along the sidebar's right border. |
| className         | string                        | `""`      | Additional CSS classes merged onto the aside element.                   |
| children          | ReactNode                     | -         | Sidebar content (header, sections, links, dividers, footer).            |

### SidebarHeader

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|-------------------------------------------------------|
| className | string      | `""`      | Additional CSS classes merged onto the div.          |
| children  | ReactNode   | -         | Header content, typically brand/logo or a title.    |

### SidebarFooter

| Name      | Type        | Default   | Description                                                  |
|-----------|-------------|-----------|------------------------------------------------------------------|
| className | string      | `""`      | Additional CSS classes merged onto the div.                    |
| children  | ReactNode   | -         | Footer content, typically a user menu or settings link.       |

### SidebarSection

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|-------------------------------------------------------|
| label     | string      | -         | Optional heading label rendered above the group.     |
| className | string      | `""`      | Additional CSS classes merged onto the div.          |
| children  | ReactNode   | -         | Navigation items inside the section.                 |

### SidebarLink

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|-------------------------------------------------------|
| href      | string      | -         | Navigation target passed to Next.js `Link`.          |
| isActive  | boolean     | `false`   | Highlights the link as the current page.             |
| icon      | ReactNode   | -         | Optional leading icon (16×16). When set and the parent `Sidebar` is collapsed, the text label is visually hidden (`sr-only`) and only the icon shows. |
| action    | ReactNode   | -         | Optional trailing interactive element (e.g. a `Button` with `size="icon-sm"`) rendered inside the same pill, for a row-level action like favoriting or a quick menu. Hidden when the parent `Sidebar` is collapsed to an icon rail (there's no room for it). See "Row Actions" below. |
| className | string      | `""`      | Additional CSS classes merged onto the link.         |
| children  | ReactNode   | -         | Link label text or elements.                         |

### SidebarDivider

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|-------------------------------------------------------|
| className | string      | `""`      | Additional CSS classes merged onto the hr element.   |

---

## Layout Regions

`Sidebar` scans its direct children for a `SidebarHeader` and/or a `SidebarFooter` and, when present, pins them outside the scrollable area:

- **Header** (if present): fixed at the top, never scrolls.
- **Footer** (if present): fixed at the bottom, never scrolls.
- **Everything else** (sections, links, dividers, or any other children): rendered in a middle region built on `ScrollFade`, which scrolls independently (`overflow-y-auto`) when its content exceeds the available height and fades the top and/or bottom edge while there's more to scroll in that direction.

If neither a header nor a footer is present, all children render in the single scrollable region, same as before. This means the header/footer never get pushed out of view: only the navigation list scrolls, regardless of how many items it contains.

Every direct child of the scrollable region gets `shrink-0` (`[&>*]:shrink-0`). Without it, once total content overflows the available height, small children (e.g. a single bare `SidebarLink` placed directly under a `SidebarDivider`, not wrapped in a `SidebarSection`) get squeezed toward zero height once larger siblings (a `<nav>` block, a tall `SidebarSection`) hit their own min-content floor first: flexbox distributes shrinkage unevenly, not proportionally to visual size once some items stop shrinking. Overflow must always scroll, never compress content.

---

## Row Actions

Pass `action` to render a secondary control (typically a `Button` with `size="icon-sm"` and `variant="ghost"`) inside a `SidebarLink`'s pill, alongside the navigation link itself:

```tsx
<SidebarLink
  href="/projects/acme"
  icon={<FolderIcon />}
  action={
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Add Button to favorites"
      onClick={() => toggleFavorite('acme')}
    >
      <StarIcon />
    </Button>
  }
>
  Acme
</SidebarLink>
```

**Why it's not nested inside the `<a>`:** a button cannot be a descendant of an anchor — it's invalid HTML and produces ambiguous keyboard/screen-reader behavior (activating the outer link and the inner button becomes indistinguishable). `SidebarLink` instead renders the action as a DOM **sibling** of the `<a>`, both inside a shared wrapper `<div>`, with the action absolutely positioned over the pill's trailing edge (`z-20`, above the link's `z-10`). Visually it reads as one pill; structurally it's two independent, independently-focusable controls. Clicking the action can never trigger navigation, because it was never inside the anchor to begin with — no `stopPropagation`/`preventDefault` workaround needed.

The action fades in on hover or focus-within and stays hidden otherwise, matching the rest of the design system's subtle-motion default. Tab order visits the link, then the action (plain DOM order); the action is a normal tab stop and does **not** participate in the sidebar's roving-tabindex/arrow-key navigation, which only tracks `a[href]` elements — arrow keys move strictly between links, Tab reaches both.

---

## Interactive States

| State        | Behavior                                                               |
|--------------|------------------------------------------------------------------------|
| Default      | `text-text-muted` for inactive links                                   |
| Hover        | `hover:bg-surface-hover hover:text-text` (background and text shift)   |
| Focus-visible| `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` |
| Active/page  | `bg-surface-active text-text font-medium` (set via `isActive` prop)    |

Disabled: not applicable to navigation links.

The sliding active-indicator pill fades out (`opacity-0`) whenever no `SidebarLink` currently has `aria-current="page"`, for example, an icon-less link that's unmounted while collapsed. It never lingers at a stale position; it only reappears, faded in, once a real active link is found. If more than one link shares `aria-current` (unusual, but possible if a consumer marks both a parent and a specific child active), the indicator tracks the last one in DOM order.

Collapse toggle button (`collapsible`): a circular button straddling the aside's right border. Position is controlled by `togglePosition`: `middle` (default, vertically centered, the safest choice with no adjacent top bar), `top` (`top-11`, which centers the button on the bottom edge of a standard `h-14` (56px) `MenuBar`, so it sits right at the intersection of the sidebar's and top bar's borders), or `bottom` (near the footer). Rotates its chevron 180° and swaps its `aria-label` between "Collapse navigation" and "Expand navigation" on toggle. Width transitions between `width` and `collapsedWidth` via `motion-safe:transition-[width]`.

---

## Accessibility

- `<aside>` landmark for the sidebar container: screen readers announce it as complementary.
- `aria-current="page"` is set on the active `SidebarLink` to inform screen readers of the current location.
- All links are keyboard-navigable (Tab) and activatable (Enter).
- Focus ring uses `focus-visible:ring-*`, only shown for keyboard navigation, not mouse clicks.
- The collapse toggle is a real `<button>` with `aria-expanded` reflecting the expanded/collapsed state and an `aria-label` describing the action it performs next.
- When collapsed, a `SidebarLink` with an `icon` keeps its text label in the DOM as `sr-only` rather than removing it, so screen reader users always get the full label regardless of collapsed state. A `SidebarLink` with no `icon` renders nothing at all while collapsed: there's no icon to represent it in the narrow rail, so it's hidden entirely (not clipped) until the sidebar expands again. A `SidebarSection`'s `label` similarly becomes `sr-only` (not removed) when collapsed.
- When collapsed, an icon-only `SidebarLink` is also wrapped in a `Tooltip` (shown on hover or keyboard focus, `side="right"`) so sighted users can see the label without expanding the sidebar. This is in addition to, not instead of, the `sr-only` label: the tooltip's `aria-describedby` supplements the link's existing accessible name.
- A `SidebarLink`'s `action` is never nested inside the link's `<a>`: it renders as a sibling control so the link and the action remain two independently keyboard-reachable elements with unambiguous roles, rather than an invalid button-inside-anchor structure. See "Row Actions" above.

---

## When to Use

Use `Sidebar` for persistent vertical navigation in application layouts: dashboards, docs sites, settings panels. Pair with a `SidebarSection` per logical group of links. Use `SidebarDivider` to separate unrelated groups. Use `SidebarHeader` for a brand/logo slot and `SidebarFooter` for account-level actions (e.g. a user menu or logout link) pinned to the bottom. Add `collapsible` when the host layout benefits from a narrow icon-rail mode, and pass an `icon` to the links you want to remain meaningful once collapsed.

For breadcrumb-style hierarchical location indicators, use `Breadcrumb` instead.

---

## Tokens Used

| Token                  | Usage                                    |
|------------------------|-------------------------------------------|
| `bg-surface`           | Sidebar background, toggle button background |
| `border-surface-border`| Right border of sidebar, divider line, toggle button border, header/footer border |
| `bg-surface-hover`     | Link hover background, toggle button hover background |
| `bg-surface-active`    | Active link background                   |
| `text-text`            | Active link and hover text color         |
| `text-text-muted`      | Inactive link text color, toggle button icon color |
| `text-text-subtle`     | Section label text color                 |
| `ring-brand-ring`      | Focus ring color                         |
| `--duration-fast`      | Transition duration for hover            |

---

## Installation

```bash
npx dafink-ui add sidebar
```

No additional npm dependencies. Registry dependencies: `Tooltip` (used to label icon-only links when collapsed) and `ScrollFade` (wraps the scrollable middle region so it fades at whichever edge still has more content).
