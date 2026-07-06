# OTPInput

A one-time password input composed of individual single-character cells. Supports keyboard navigation, paste, and auto-advance on entry.

## Props

| Prop      | Type                      | Default | Description                                           |
|-----------|---------------------------|---------|-------------------------------------------------------|
| length    | number                    | 6       | Number of cells                                       |
| value     | string                    | `''`    | Controlled value — each character maps to a cell      |
| onChange  | `(value: string) => void` | —       | Called with the full updated string on any change     |
| label     | string                    | —       | Visible label above the cells                         |
| error     | string                    | —       | Error message; all cells enter the error state        |
| hint      | string                    | —       | Helper text shown below the cells                     |
| disabled  | boolean                   | false   | Disables all cells                                    |
| className | string                    | `''`    | Additional classes on the root container              |

## Keyboard Behavior

| Key          | Action                                                                           |
|--------------|----------------------------------------------------------------------------------|
| Digit (0–9)  | Enters the digit, advances focus to the next cell                                |
| Backspace     | If cell has a value: clears it. If empty: clears previous cell and moves back    |
| ArrowLeft     | Moves focus to the previous cell                                                  |
| ArrowRight    | Moves focus to the next cell                                                      |

## Paste

Pasting into any cell fills the entire input from the beginning using the first `length` numeric characters of the clipboard value. Focus moves to the last filled cell (or the last cell if all are filled).

## Interactive States

- **hover**: border shifts to `input-border-hover`
- **focus-visible**: 3px outline — `input-ring` default, `input-error-ring` in error state
- **focus (custom cursor)**: the currently focused cell renders a blinking horizontal-line cursor beneath the character, mimicking a typewriter/terminal caret — `input-ring` default, `input-error-ring` in error state. Only ever shown in the one focused cell.
- **disabled**: all cells get muted background, text, and border
- **error**: all cells get `border-input-error`

## Blinking Cursor

Since the native text caret is hidden (`caret-transparent`), the currently focused cell renders a custom blinking horizontal line beneath the character as a substitute caret. This reuses the same technique, animation, and timing as `Typewriter`'s cursor for visual/timing consistency across the design system:

- `@keyframes dafink-cursor-blink` — `1s step-start infinite`, alternating `opacity: 1` / `opacity: 0`
- Injected via an inline `<style>` tag scoped to the component
- `@media (prefers-reduced-motion: reduce)` disables the animation (`animation: none`)
- The cursor element is `aria-hidden="true"` — it is purely decorative; screen readers rely on the input's own focus and value

## Accessibility

- Each cell has `aria-label="Digit N of M"` for screen readers
- Cells are grouped in a `role="group"` with `aria-labelledby` linked to the label
- Error and hint messages are associated to the group via `aria-describedby`
- `caret-transparent` hides the native blinking text cursor — the cell's box-shadow focus ring plus the custom blinking cursor line provide the visual focus indicator
- The first cell carries `autoComplete='one-time-code'`; remaining cells use `autoComplete='off'`. This enables SMS and browser autofill of OTP codes (WCAG 1.3.5)

## When to Use

Use for email confirmation codes, SMS verification, two-factor authentication, and any other fixed-length code entry. For variable-length codes, use a plain `Input` with `type="text"`.

## Tokens Used

- Colors: `colors.input`
- Motion: `--duration-fast`

## Installation

```
npx @dafink/ui add otp-input
```

No npm dependencies. No registry dependencies.
