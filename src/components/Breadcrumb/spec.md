# Breadcrumb

A navigational landmark that shows the user's current location within a site hierarchy.

## Props

| Prop        | Type                                   | Default | Description                                                         |
|-------------|----------------------------------------|---------|---------------------------------------------------------------------|
| `items`     | `Array<{ label: string; href?: string }>` | None | Ordered list of crumbs. The last item is the current page and should have no `href`. |
| `separator` | `ReactNode`                            | `'/'`   | Rendered between each item. Accepts strings or any React element.   |
| `className` | `string`                               | `''`    | Additional classes applied to the wrapping `<nav>` element.         |

## Item Shape

| Field   | Type     | Required | Description                                                              |
|---------|----------|----------|--------------------------------------------------------------------------|
| `label` | `string` | Yes      | Display text for the breadcrumb item.                                    |
| `href`  | `string` | No       | Navigation target. Omit for the last (current) item.                    |

## Accessibility

- Wrapped in `<nav aria-label="breadcrumb">`: screen readers announce it as a breadcrumb navigation landmark.
- Items are rendered as an `<ol>` (ordered list) because order is semantically meaningful in a path hierarchy.
- The current page item renders as `<span aria-current="page">`, not a link, so screen readers announce it as the active location without offering a navigable target.
- Separators carry `aria-hidden="true"` so they are ignored by assistive technology and don't add noise between each item label.
- Links use Next.js `<Link>` for client-side navigation with correct `href` resolution.
- Focus state: `focus:outline-none focus-visible:underline`: suppresses the default outline on mouse click, replaces it with an underline for keyboard navigation only (`:focus-visible`).

## Tokens Used

| Token           | Applied to                                      |
|-----------------|-------------------------------------------------|
| `text-text`     | Current page label                              |
| `text-text-muted` | Link items at rest; hover target is `text-text` |
| `text-text-subtle` | Separator characters                          |

## Interactive States

- **hover**: link color shifts from `text-text-muted` to `text-text` via `transition-colors`
- **focus-visible**: underline appears on the focused link, keyboard navigation only
- No hover or focus state on the current page item: it is not interactive

## When to Use

- Use when the user is three or more levels deep in a navigational hierarchy and needs a quick path back.
- Always make every item except the last a real link; never render the full path as plain text.
- Keep labels short: prefer page titles over full URLs or verbose descriptions.
- Do not use as a substitute for primary navigation. Breadcrumbs supplement `<nav>` menus, they don't replace them.
- Avoid in flat site structures with only one level of depth: a single-item breadcrumb (just the current page) adds no value.
