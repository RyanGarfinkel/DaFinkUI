# Switch

A toggle switch for boolean values, rendered as an accessible button with `role="switch"`.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | `boolean` | — | Controlled checked state. Required. |
| onCheckedChange | `(checked: boolean) => void` | — | Callback fired when the switch is toggled. Required. |
| label | `string` | — | Visible label rendered beside the switch; also used to auto-derive the `id`. |
| hint | `string` | — | Helper text rendered below the label. |
| disabled | `boolean` | `false` | Disables the switch. |
| id | `string` | auto | HTML id for the switch button. Auto-derived from `label` if omitted (e.g. `"switch-email-notifications"`). |
| className | `string` | `''` | Additional classes on the root wrapper. |

## Interactive States

- **hover**: no visual change to the track — cursor remains `pointer`
- **focus**: outline suppressed (`focus:outline-none`)
- **focus-visible**: 2px brand ring with 2px offset — `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring`
- **checked**: track becomes `bg-brand`; thumb translates `translate-x-5`
- **unchecked**: track is `bg-surface-active`; thumb sits at `translate-x-1`
- **disabled**: `opacity-40` on the track, `pointer-events-none`

## Visual Design

- Track: 24×40px (`h-6 w-10`) rounded-full
- Thumb: 16×16px (`h-4 w-4`) white (`bg-brand-fg`) circle with `shadow-sm`
- Both track color and thumb position transition with `duration-200 ease-out`
- Label uses `text-sm font-medium text-text` with `leading-6` to align with the switch's vertical center
- Hint uses `text-sm text-text-muted`, stacked below the label with `gap-0.5`

## Accessibility

- The switch button has `role="switch"` and `aria-checked` reflecting the `checked` prop
- `label` element is linked to the button via `htmlFor` / `id` — clicking the label text activates the switch
- When `hint` is present, the button's `aria-describedby` points to the hint paragraph id
- `disabled` is passed as a native `disabled` attribute on the `<button>`, correctly suppressed by screen readers

## When to Use

- Use Switch for an immediate binary setting that takes effect without a form submit (e.g. notifications on/off, dark mode, feature flags).
- Use Checkbox when the choice is part of a form and the user must explicitly submit to apply it.
- Always pair Switch with a visible label — never rely on position or color alone to convey what the switch controls.

## Installation

```bash
npx dafink-ui add switch
```

npm dependencies: none
No registry dependencies.
