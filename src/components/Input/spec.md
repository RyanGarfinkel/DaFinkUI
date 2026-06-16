# Input

A single-line text input with optional label, hint, and error messaging. Supports a floating label variant where the label animates inside the input field.

## Props

| Prop        | Type                      | Default      | Description                                        |
|-------------|---------------------------|--------------|----------------------------------------------------|
| label       | string                    | —            | Visible label; also used to derive the input `id`  |
| placeholder | string                    | —            | Placeholder text (default variant only)            |
| hint        | string                    | —            | Helper text shown below the input                  |
| error       | string                    | —            | Error message; switches input to error state       |
| variant     | `'default' \| 'floating'` | `'default'`  | `'floating'` animates the label inside the input   |
| disabled    | boolean                   | false        | Disables the input                                 |

Extends all native `<input>` HTML attributes. Accepts a `ref`.

## Variants

| Variant    | Description                                                                                     |
|------------|-------------------------------------------------------------------------------------------------|
| `default`  | Label sits above the input; placeholder is separate text inside the field                       |
| `floating` | Label starts centered inside the input (acting as a placeholder) and floats to the top on focus or when a value is entered |

## Interactive States

- **hover**: border shifts to `input-border-hover`
- **focus**: outline suppressed (`outline-none`)
- **focus-visible**: 3px outline at offset 0 — `input-ring` default, `input-error-ring` in error state
- **disabled**: muted background, text, and border; no hover or focus-visible styles

## Error State

Set the `error` prop to a non-empty string to enter the error state:
- Border becomes `input-error`
- Focus-visible outline becomes `input-error-ring`
- Error message animates in below the input using a grid height transition
- `aria-invalid="true"` and `aria-describedby` are set automatically
- In floating variant: label is always floated and colored `input-error`

## Password Toggle

When `type="password"` is passed, the input automatically renders an eye icon button inside the right edge of the field. Clicking it toggles between `type="password"` (hidden) and `type="text"` (visible). The button updates its `aria-label` between `"Show password"` and `"Hide password"`.

The button is part of the normal tab order — `Tab` from the input reaches the toggle. The input gets `pr-10` to prevent text from overlapping the button. When `disabled` is set, the toggle button is also disabled.

## Floating Label Animation

In the `floating` variant:
- The label is absolutely positioned inside the input
- **Resting**: `top-1/2 -translate-y-1/2 text-sm text-text-subtle` (center of input)
- **Floated** (focused, has value, or error): `top-1.5 text-xs` (upper-left of input)
- Transition uses `--duration-fast` (150ms) — respects `prefers-reduced-motion`
- Focus and blur state are tracked via React state; value presence is derived from controlled or uncontrolled input state

## Animated Feedback

Both variants animate the error/hint message in and out using a CSS grid height transition (`grid-rows-[0fr]` → `grid-rows-[1fr]`). The message container is always in the DOM; the grid row collapses it when there is no message.

## Accessibility

- `label` and `id` are linked via `htmlFor` / `id`
- Error and hint messages are associated via `aria-describedby`
- Error state sets `aria-invalid="true"`
- In floating variant, the label element is still a proper `<label>` linked to the input — screen readers announce it correctly

## When to Use

Use **default** for most forms where labels and inputs should be visually distinct.

Use **floating** for compact layouts (login forms, inline search fields) where you want a single-element look. Do not use floating when the form has many fields in a tight grid — the label motion can become distracting.

## Tokens Used

- Colors: `colors.input` (`input-border`, `input-border-hover`, `input-ring`, `input-error`, `input-error-ring`, `input-disabled-bg`, `input-disabled-text`)
- Motion: `--duration-fast`

## Installation

```
npx @dafink/ui add input
```

No npm dependencies. No registry dependencies.
