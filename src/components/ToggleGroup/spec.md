# ToggleGroup

A segmented group of toggle buttons where one item (single mode) or many items (multiple mode) can be active at once. Commonly used for formatting controls, view switchers, and filter sets.

---

## Subcomponents

### ToggleGroup

The container component. Manages selection state and distributes it to child items via React context.

| Prop            | Type                              | Default    | Description                                                         |
|-----------------|-----------------------------------|------------|---------------------------------------------------------------------|
| `type`          | `'single' \| 'multiple'`          | -          | Required. Controls whether one or many items can be active at once. |
| `value`         | `string \| string[]`              | -          | Required. Controlled value. String for single, string[] for multiple.|
| `onValueChange` | `(value: string \| string[]) => void` | -      | Required. Called with the new value when selection changes.         |
| `size`          | `'sm' \| 'md' \| 'lg'`           | `'md'`     | Controls the height and padding of all items in the group.          |
| `disabled`      | `boolean`                         | `false`    | Disables all items in the group.                                    |
| `className`     | `string`                          | `''`       | Additional classes merged onto the container element.               |
| `children`      | `React.ReactNode`                 | -          | Required. Should be `ToggleGroupItem` elements.                     |

---

### ToggleGroupItem

An individual toggle button within the group. Must be a direct or indirect child of `ToggleGroup`.

Extends `ButtonHTMLAttributes<HTMLButtonElement>`: all native button attributes are forwarded.

| Prop        | Type                  | Default | Description                                                  |
|-------------|-----------------------|---------|--------------------------------------------------------------|
| `value`     | `string`              | -       | Required. The value this item represents.                    |
| `disabled`  | `boolean`             | `false` | Disables this specific item independently of the group.      |
| `children`  | `React.ReactNode`     | -       | Required. Content of the button: text, icon, or both.       |
| `className` | `string`              | `''`    | Additional classes merged onto the button element.           |

---

## Sizes

| Size | Height | Padding   | Font size |
|------|--------|-----------|-----------|
| `sm` | `h-8`  | `px-3`    | `text-xs` |
| `md` | `h-9`  | `px-4`    | `text-sm` |
| `lg` | `h-11` | `px-5`    | `text-base` |

---

## Interactive States

| State         | Behavior                                                                                           |
|---------------|----------------------------------------------------------------------------------------------------|
| Default       | `bg-surface text-text` (neutral surface background with primary text color).                       |
| Active        | `bg-brand text-brand-fg` (brand-colored background indicating the item is selected).               |
| Hover         | `hover:bg-surface-hover` (subtle background shift). Not applied when item is active or disabled.   |
| Focus-visible | `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` (keyboard focus ring using brand ring token). Suppressed on disabled items via `disabled:pointer-events-none`. |
| Disabled      | `disabled:opacity-40 disabled:pointer-events-none` (reduced opacity, no pointer events, no hover or focus-visible styles). Applied when `disabled` is set on the item or its parent group. |

---

## Accessibility

- Each `ToggleGroupItem` renders as a `<button type="button">`.
- `aria-pressed` is set to `true` on active items and `false` on inactive items, communicating toggle state to assistive technologies.
- The container renders with `role="group"` to semantically associate the buttons.
- All items are keyboard-reachable via Tab. Activation is via Space or Enter (native button behavior).
- When an item has only icon content, pass an `aria-label` prop to provide a text alternative.
- `focus:outline-none` suppresses the browser default; `focus-visible:ring-*` provides a visible keyboard-only focus indicator.

---

## When to Use

- **Single mode**: use when exactly one option must be selected at a time, e.g., text alignment (left / center / right), view mode (grid / list).
- **Multiple mode**: use when any combination of options can be active simultaneously, e.g., text formatting (bold / italic / underline), filter tags.
- Prefer ToggleGroup over a row of checkboxes or radio buttons when the options are visually cohesive and the control should feel like a single segmented unit.
- Use `disabled` on the group when the entire control is unavailable in the current context. Use `disabled` on an individual item when only that option is temporarily unavailable.

---

## Tokens Used

| Token                  | Applied to                              |
|------------------------|-----------------------------------------|
| `bg-brand`             | Active item background                  |
| `text-brand-fg`        | Active item foreground text             |
| `bg-surface`           | Default item and container background   |
| `bg-surface-hover`     | Item background on hover (inactive)     |
| `border-surface-border`| Container border and item dividers      |
| `text-text`            | Default item text color                 |
| `focus-visible:ring-brand-ring` | Keyboard focus ring color      |
