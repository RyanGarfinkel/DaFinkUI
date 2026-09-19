# Sidebar

A vertical navigation sidebar composed of seven sub-components: `Sidebar`, `SidebarHeader`, `SidebarFooter`, `SidebarSection`, `SidebarLink`, `SidebarButton`, and `SidebarDivider`. Supports an optional collapsed/expanded rail state with a built-in toggle button.

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

| Name      | Type        | Default     | Description                                          |
|-----------|-------------|-------------|-------------------------------------------------------|
| href      | string      | -           | Navigation target passed to Next.js `Link`.          |
| isActive  | boolean     | *auto*      | Highlights the link as the current page. When omitted (the normal case), the link derives its own active state from the current pathname — see "Automatic Active Matching" below. Pass an explicit `true`/`false` to override that entirely, e.g. for a custom match rule the automatic one can't express. |
| icon      | ReactNode   | -           | Optional leading icon (16×16). When set and the parent `Sidebar` is collapsed, the text label is visually hidden (`sr-only`) and only the icon shows. |
| action    | ReactNode   | -           | Optional trailing interactive element (e.g. a `Button` with `size="icon-sm"`) rendered inside the same pill, for a row-level action like favoriting or a quick menu. Hidden when the parent `Sidebar` is collapsed to an icon rail (there's no room for it). See "Row Actions" below. |
| className | string      | `""`        | Additional CSS classes merged onto the link.         |
| children  | ReactNode   | -           | Link label text or elements.                         |

### SidebarButton

The event-driven counterpart to `SidebarLink`: same pill, same icon/action/collapsed/tooltip behavior, but renders a `<button>` instead of a navigation `<a>`, for sidebar items that swap displayed content without changing the URL (e.g. an inbox/drafts/sent switcher, a settings-panel tab list). Unlike `SidebarLink`, `isActive` is never auto-derived — there's no pathname to derive it from — so the consumer owns the selection state entirely (typically a single `useState` alongside the content it toggles).

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|-------------------------------------------------------|
| isActive  | boolean     | `false`   | Highlights the button as the current selection. Fully controlled — the consumer decides which button in a group is active. |
| indicator | boolean     | `true`    | Whether an active button participates in the shared sliding indicator (sets `aria-current="page"`). Set `false` for a button that shouldn't drag the indicator to itself — e.g. a one-off action like "Compose" that can still look active (bold text) without being part of an exclusive "current view" group. |
| icon      | ReactNode   | -         | Optional leading icon (16×16). Same collapsed-rail behavior as `SidebarLink`'s `icon`. |
| action    | ReactNode   | -         | Optional trailing interactive element, identical treatment to `SidebarLink`'s `action`. |
| className | string      | `""`      | Additional CSS classes merged onto the button.       |
| children  | ReactNode   | -         | Button label text or elements.                       |

All other native `<button>` attributes (`onClick`, `disabled`, `aria-label`, etc.) pass through.

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

## Automatic Active Matching

When a `SidebarLink`'s `isActive` prop is omitted, `Sidebar` resolves which link is "current" from the actual URL instead of requiring every consumer to hand-compute `pathname === href` themselves:

- Every such link registers its `href` with the nearest `Sidebar` ancestor and re-registers whenever `href` changes.
- On each pathname change, `Sidebar` picks the single **longest registered href that matches** the current pathname, where a match is an exact match (`pathname === href`) or an ancestor match (`pathname` starts with `href + '/'`). Longest wins so a specific route always beats a general one: on `/chat/abc`, a link to `/chat/abc` wins over a sibling link to `/chat`; on `/projects/overview`, a link to `/projects` still lights up via the ancestor match if no more specific `/projects/overview` link exists in the sidebar.
- `href="/"` is never treated as an ancestor of every route — it only matches when the pathname is exactly `/`.
- Passing an explicit `isActive` (`true` or `false`) always wins outright: the link skips auto-registration entirely, for cases the automatic rule can't express (e.g. a link that should read as active across a whole set of unrelated routes).
- This is why `SidebarLink`'s `isActive` type is optional (`boolean | undefined`) rather than defaulting to `false`: `undefined` is what triggers auto-matching. `SidebarButton` has no equivalent, since it has no `href`/pathname to derive from.

```tsx
// No isActive needed — resolves automatically from the URL.
<SidebarLink href="/projects">Projects</SidebarLink>
<SidebarLink href="/projects/overview">Overview</SidebarLink>
```

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

The action fades in on hover or focus-within and stays hidden otherwise, matching the rest of the design system's subtle-motion default. Tab order visits the link, then the action (plain DOM order); the action is a normal tab stop and does **not** participate in the sidebar's roving-tabindex/arrow-key navigation, which only tracks elements marked `data-sidebar-item` (every `SidebarLink` and `SidebarButton`) — arrow keys move strictly between links/buttons, Tab reaches both them and any actions. `SidebarButton` renders the same action pattern identically.

---

## Interactive States

| State        | Behavior                                                               |
|--------------|------------------------------------------------------------------------|
| Default      | `text-text-muted` for inactive links/buttons                           |
| Hover        | `hover:bg-surface-hover hover:text-text` (background and text shift)   |
| Focus-visible| `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` |
| Active/page  | `bg-surface-active text-text font-medium` (set via `isActive`, automatic for `SidebarLink`, controlled for `SidebarButton`) |

Disabled: not applicable to `SidebarLink`; a `SidebarButton` accepts the native `disabled` attribute like any button.

The sliding active-indicator pill fades out (`opacity-0`) whenever nothing inside the sidebar currently has `aria-current="page"` — for example, an icon-less link that's unmounted while collapsed, or every `SidebarButton` in a group being deselected. It never lingers at a stale position; it only reappears, faded in, once a real active item is found. Because a `SidebarButton`'s active state is consumer-controlled rather than pathname-driven, the indicator re-measures on every render (not just on route change) so it follows button clicks too. If more than one item shares `aria-current` (unusual, but possible if a consumer marks both a parent and a specific child active), the indicator tracks the last one in DOM order. A `SidebarButton` with `indicator={false}` never sets `aria-current`, so it can never claim the indicator even while `isActive`.

Collapse toggle button (`collapsible`): a circular button straddling the aside's right border. Position is controlled by `togglePosition`: `middle` (default, vertically centered, the safest choice with no adjacent top bar), `top` (`top-11`, which centers the button on the bottom edge of a standard `h-14` (56px) `MenuBar`, so it sits right at the intersection of the sidebar's and top bar's borders), or `bottom` (near the footer). Rotates its chevron 180° and swaps its `aria-label` between "Collapse navigation" and "Expand navigation" on toggle. Width transitions between `width` and `collapsedWidth` via `motion-safe:transition-[width]`.

---

## Accessibility

- `<aside>` landmark for the sidebar container: screen readers announce it as complementary.
- `aria-current="page"` is set on the active `SidebarLink`, and on an active `SidebarButton` unless `indicator={false}`, to inform screen readers of the current location/selection.
- All links and buttons are keyboard-navigable (Tab) and activatable (Enter, or Enter/Space for `SidebarButton` since it's a native `<button>`).
- Focus ring uses `focus-visible:ring-*`, only shown for keyboard navigation, not mouse clicks.
- The collapse toggle is a real `<button>` with `aria-expanded` reflecting the expanded/collapsed state and an `aria-label` describing the action it performs next.
- When collapsed, a `SidebarLink`/`SidebarButton` with an `icon` keeps its text label in the DOM as `sr-only` rather than removing it, so screen reader users always get the full label regardless of collapsed state. One with no `icon` renders nothing at all while collapsed: there's no icon to represent it in the narrow rail, so it's hidden entirely (not clipped) until the sidebar expands again. A `SidebarSection`'s `label` similarly becomes `sr-only` (not removed) when collapsed.
- When collapsed, an icon-only `SidebarLink`/`SidebarButton` is also wrapped in a `Tooltip` (shown on hover or keyboard focus, `side="right"`) so sighted users can see the label without expanding the sidebar. This is in addition to, not instead of, the `sr-only` label: the tooltip's `aria-describedby` supplements the item's existing accessible name.
- An `action` is never nested inside the link's `<a>` or the button's `<button>`: it renders as a sibling control so the item and the action remain two independently keyboard-reachable elements with unambiguous roles, rather than an invalid nested-interactive-control structure. See "Row Actions" above.

---

## When to Use

Use `Sidebar` for persistent vertical navigation in application layouts: dashboards, docs sites, settings panels. Pair with a `SidebarSection` per logical group of links. Use `SidebarDivider` to separate unrelated groups. Use `SidebarHeader` for a brand/logo slot and `SidebarFooter` for account-level actions (e.g. a user menu or logout link) pinned to the bottom. Add `collapsible` when the host layout benefits from a narrow icon-rail mode, and pass an `icon` to the links you want to remain meaningful once collapsed.

Use `SidebarButton` instead of `SidebarLink` when selecting the item should change what's displayed without changing the URL: a mail client's inbox/drafts/sent switcher, a settings sidebar whose panels are swapped client-side, a chat app's per-conversation selector. It's a drop-in visual match for `SidebarLink` (same pill, same collapsed/tooltip/action behavior, same keyboard sequence) so a sidebar can freely mix URL-backed and event-backed items in one list.

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
