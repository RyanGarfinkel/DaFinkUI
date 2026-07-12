# Accordion

A compound component for showing and hiding sections of content. Supports single-item and multi-item expansion modes.

## Subcomponents

### `Accordion`

The root wrapper. Manages open/closed state for all child items.

| Prop           | Type                    | Default    | Description                                                                   |
|----------------|-------------------------|------------|-------------------------------------------------------------------------------|
| type           | `'single' \| 'multiple'` | `'single'` | Whether one or many items can be open at once                                 |
| defaultValue   | `string \| string[]`    | None       | Item value(s) open on initial render                                           |
| collapsible    | boolean                 | `false`    | When `type='single'`, whether the open item can be collapsed by clicking again |
| className      | string                  | None       | Additional classes on the root `<div>`                                         |

Accepts all native `<div>` HTML attributes.

### `AccordionItem`

Wraps a single trigger + content pair.

| Prop      | Type      | Default | Description                                            |
|-----------|-----------|---------|--------------------------------------------------------|
| value     | string    | None    | Unique identifier used to track open/closed state      |
| className | string    | None    | Additional classes on the item wrapper `<div>`         |

Accepts all native `<div>` HTML attributes.

### `AccordionTrigger`

The clickable header that toggles the item open or closed.

| Prop      | Type      | Default | Description                                         |
|-----------|-----------|---------|-----------------------------------------------------|
| disabled  | boolean   | false   | Prevents toggling and applies disabled styling      |
| className | string    | None    | Additional classes on the trigger `<button>`        |

Accepts all native `<button>` HTML attributes. Renders a chevron icon that rotates 180° when the item is open.

### `AccordionContent`

The panel shown when the item is open. Uses `hidden` attribute to toggle visibility.

| Prop      | Type      | Default | Description                                       |
|-----------|-----------|---------|---------------------------------------------------|
| className | string    | None    | Additional classes on the content wrapper `<div>` |

Accepts all native `<div>` HTML attributes.

## Behavior

- **Single mode** (`type='single'`): at most one item is open at a time. Opening a new item closes the previous one.
- **Multiple mode** (`type='multiple'`): any number of items can be open simultaneously.
- **Collapsible** (`collapsible=true`, single mode only): the open item can be closed by clicking its trigger again. When `false`, clicking the already-open trigger does nothing.
- **defaultValue**: sets the initially open item(s) without controlling state externally. Accordion manages open state internally.
- Hidden content uses the `hidden` attribute: items are not unmounted, just hidden.

## Interactive States

- **hover**: `hover:text-text-muted`, trigger text dims slightly on hover
- **focus**: `focus:outline-none`, native outline suppressed
- **focus-visible**: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring`, keyboard-only focus ring in the brand color
- **disabled**: `disabled:pointer-events-none disabled:opacity-40`, trigger is visible but non-interactive

## Accessibility

- Each `AccordionTrigger` is a `<button>` with `aria-expanded` reflecting the open/closed state
- Content panels use `role="region"`
- Chevron icon is `aria-hidden`
- Keyboard: `Tab` moves focus between triggers; `Enter`/`Space` toggles the focused item

## Tokens Used

| Token                          | Used on                             |
|-------------------------------|--------------------------------------|
| `text-text`                   | Trigger text (default)               |
| `text-text-muted`             | Trigger text (hover), content text, chevron |
| `divide-surface-border`       | Dividers between items               |
| `focus-visible:ring-brand-ring` | Keyboard focus ring               |

## When to Use

- Use Accordion when you have multiple sections of content that are each independently collapsible, and screen real estate is limited.
- Use `type='single'` when only one section should be visible at a time (e.g., FAQ, settings categories).
- Use `type='multiple'` when users may need to compare or reference several sections simultaneously.
- Do not use Accordion for a single collapsible panel; use a simple toggle/disclosure instead.
- Do not use Accordion for navigation; use Tabs or a sidebar nav instead.
