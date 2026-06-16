# Sidebar

A vertical navigation sidebar composed of four sub-components: `Sidebar`, `SidebarSection`, `SidebarLink`, and `SidebarDivider`.

---

## Props

### Sidebar

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|------------------------------------------------------|
| width     | string      | `"w-56"`  | Tailwind width class for the sidebar container.      |
| className | string      | `""`      | Additional CSS classes merged onto the aside element.|
| children  | ReactNode   | —         | Sidebar content (sections, links, dividers).         |

### SidebarSection

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|------------------------------------------------------|
| label     | string      | —         | Optional heading label rendered above the group.     |
| className | string      | `""`      | Additional CSS classes merged onto the div.          |
| children  | ReactNode   | —         | Navigation items inside the section.                 |

### SidebarLink

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|------------------------------------------------------|
| href      | string      | —         | Navigation target passed to Next.js `Link`.          |
| isActive  | boolean     | `false`   | Highlights the link as the current page.             |
| className | string      | `""`      | Additional CSS classes merged onto the link.         |
| children  | ReactNode   | —         | Link label text or elements.                         |

### SidebarDivider

| Name      | Type        | Default   | Description                                          |
|-----------|-------------|-----------|------------------------------------------------------|
| className | string      | `""`      | Additional CSS classes merged onto the hr element.   |

---

## Interactive States

| State        | Behavior                                                               |
|--------------|------------------------------------------------------------------------|
| Default      | `text-text-muted` for inactive links                                   |
| Hover        | `hover:bg-surface-hover hover:text-text` — background and text shift   |
| Focus-visible| `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` |
| Active/page  | `bg-surface-active text-text font-medium` — set via `isActive` prop    |

Disabled: not applicable to navigation links.

---

## Accessibility

- `<aside>` landmark for the sidebar container — screen readers announce it as complementary.
- `aria-current="page"` is set on the active `SidebarLink` to inform screen readers of the current location.
- All links are keyboard-navigable (Tab) and activatable (Enter).
- Focus ring uses `focus-visible:ring-*` — only shown for keyboard navigation, not mouse clicks.

---

## When to Use

Use `Sidebar` for persistent vertical navigation in application layouts — dashboards, docs sites, settings panels. Pair with a `SidebarSection` per logical group of links. Use `SidebarDivider` to separate unrelated groups.

For breadcrumb-style hierarchical location indicators, use `Breadcrumb` instead.

---

## Tokens Used

| Token                  | Usage                                    |
|------------------------|------------------------------------------|
| `bg-surface`           | Sidebar background                       |
| `border-surface-border`| Right border of sidebar, divider line    |
| `bg-surface-hover`     | Link hover background                    |
| `bg-surface-active`    | Active link background                   |
| `text-text`            | Active link and hover text color         |
| `text-text-muted`      | Inactive link text color                 |
| `text-text-subtle`     | Section label text color                 |
| `ring-brand-ring`      | Focus ring color                         |
| `--duration-fast`      | Transition duration for hover            |

---

## Installation

```bash
npx @dafink/ui add sidebar
```

No additional npm dependencies. No registry dependencies.
