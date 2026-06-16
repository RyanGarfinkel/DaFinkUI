# Checkbox

Controlled or uncontrolled checkbox with optional label.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | — | Text label rendered beside the checkbox. |
| id | `string` | — | HTML id for the input; links the label element via `htmlFor`. |
| checked | `boolean` | — | Controlled checked state. |
| defaultChecked | `boolean` | — | Uncontrolled initial checked state. |
| disabled | `boolean` | `false` | Disables the checkbox. |
| onChange | `ChangeEventHandler<HTMLInputElement>` | — | Native change event handler. |
| className | `string` | `''` | Additional classes merged onto the label wrapper. |

Extends all native `<input type="checkbox">` HTML attributes (except `type`). Accepts a `ref`.

## Interactive States

- **hover**: cursor is `pointer`; no visual change to the checkbox itself (browser handles ring styles)
- **focus-visible**: 2px brand ring with 2px offset — `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring`
- **checked**: filled with brand accent color via `accent-[var(--color-brand)]`
- **disabled**: 50% opacity on the input; pointer events removed; label text also dims

## Visual Design

- 16×16px (`w-4 h-4`) native checkbox with `rounded` corners and `border-input-border`
- Uses CSS `accent-color` to apply the brand color to the checked state — cross-browser without custom SVG markup
- Label and checkbox are co-located in a single `<label>` wrapper, making the entire label text a click target

## Accessibility

- The `<label>` element wraps both the input and the label text, so clicking anywhere on the label row toggles the checkbox.
- When `id` is provided, the label is additionally linked via `htmlFor` — this is required when placing the label outside the wrapper.
- `aria-invalid` is not set by Checkbox itself — if you need error state, wrap it in a `FormField` with `FormMessage`.
- Disabled state uses native `disabled` attribute, which is correctly announced by screen readers.

## When to Use

- Use Checkbox for binary opt-in choices (e.g. "Accept terms", "Remember me").
- Use a group of checkboxes when the user can select multiple options independently; use RadioGroup when exactly one option must be chosen.
- For a single on/off toggle that represents a setting, prefer Switch — it carries a clearer "on/off" semantic.

## Installation

```bash
npx @dafink/ui add checkbox
```

npm dependencies: none
No registry dependencies.
