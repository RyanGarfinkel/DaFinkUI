# Collapsible

A single-item show/hide component. Use it when you need to toggle one section of content — a filter panel, a "show more" block, a settings group. For multiple togglable sections, use Accordion instead.

---

## Props

### Collapsible

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Controlled open state. When provided, the component is controlled. |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Called when the open state changes. Receives the new value. |
| `disabled` | `boolean` | `false` | Disables the trigger and prevents toggling. |
| `className` | `string` | `""` | Additional classes on the root div. |
| `children` | `ReactNode` | — | Must include `CollapsibleTrigger` and `CollapsibleContent`. |

### CollapsibleTrigger

Extends `ButtonHTMLAttributes<HTMLButtonElement>`. Renders a full-width button with a rotating chevron.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional classes on the button element. |
| `children` | `ReactNode` | — | Trigger label content. |

### CollapsibleContent

Extends `HTMLAttributes<HTMLDivElement>`. Animates open and closed using `grid-template-rows`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Additional classes on the inner content wrapper. |
| `children` | `ReactNode` | — | Content shown when open. |

---

## Variants

None — Collapsible is unstyled at the container level. Apply your own border, background, or padding via `className`.

---

## Interactive States

| State | Trigger behavior |
|-------|-----------------|
| Default | `text-text`, no background |
| Hover | `hover:text-text-muted` |
| Focus-visible | `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` |
| Disabled | `opacity-40`, `pointer-events-none` — no hover or focus-visible styles |

---

## Accessibility

- `CollapsibleTrigger` sets `aria-expanded` on the `<button>` to reflect the current open state.
- `CollapsibleContent` sets `role="region"` and `aria-hidden` — `true` when closed, `false` when open.
- The root `<div>` receives `data-state="open"` or `data-state="closed"` for CSS targeting.
- Keyboard: trigger is a native `<button>` — reachable by Tab, activated by Enter or Space.
- Disabled state is set via the native `disabled` attribute on the button.

---

## When to Use

- A single expandable section: "Advanced settings", "More details", "Read more"
- Filter panels that collapse on mobile
- Inline help or description text that shouldn't always be visible

Use **Accordion** when you have multiple related sections that share a visual group and single/multi-expand behavior.

---

## Tokens Used

| Token | Purpose |
|-------|---------|
| `text-text` | Trigger label color |
| `text-text-muted` | Trigger hover color; content text color |
| `brand-ring` | Focus ring color |

---

## Installation

```bash
npx @dafink/ui add collapsible
```

No npm dependencies. No registry dependencies.
