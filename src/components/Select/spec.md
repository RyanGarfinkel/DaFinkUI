# Select

A single-value dropdown selector with full keyboard navigation, typeahead, and accessible ARIA roles.

## Installation

```bash
npx dafink-ui add select
```

No npm dependencies. No registry dependencies.

## Props

| Prop          | Type                              | Default       | Description                                          |
|---------------|-----------------------------------|---------------|------------------------------------------------------|
| `options`     | `SelectOption[]`                  | —             | Array of `{ value, label }` objects.                 |
| `value`       | `string`                          | `undefined`   | Controlled selected value.                           |
| `onChange`    | `(value: string) => void`         | `undefined`   | Called with the new value when a selection is made.  |
| `placeholder` | `string`                          | `'Select…'`   | Text shown when no value is selected.                |
| `label`       | `string`                          | `undefined`   | Visible label above the trigger.                     |
| `hint`        | `string`                          | `undefined`   | Helper text below the trigger (hidden when error).   |
| `error`       | `string`                          | `undefined`   | Error message; switches trigger to error state.      |
| `size`        | `'sm' \| 'md'`                    | `'md'`        | Trigger height and text size.                        |
| `disabled`    | `boolean`                         | `false`       | Prevents interaction.                                |
| `className`   | `string`                          | `''`          | Additional classes on the root wrapper.              |

## Keyboard Behavior

| Key            | Action                                              |
|----------------|-----------------------------------------------------|
| `Enter / Space`| Open dropdown (on trigger); confirm selection (in list) |
| `ArrowDown`    | Move to next option (wraps)                         |
| `ArrowUp`      | Move to previous option (wraps)                     |
| `Home`         | Jump to first option                                |
| `End`          | Jump to last option                                 |
| `Escape`       | Close, return focus to trigger                      |
| `Tab`          | Close, move focus to next page element              |
| Printable char | Typeahead — moves to next option whose label starts with accumulated characters (resets after 500 ms) |

## Accessibility

- **Focus on open**: Focus moves to the listbox (`tabIndex={-1}`, focused programmatically).
- **Focus trap**: Not trapped — Tab closes the dropdown and moves focus naturally.
- **Escape**: Closes and returns focus to the trigger button.
- **Tab**: Closes without returning focus to trigger; lets Tab land on the next page element.
- **ARIA roles**: trigger has `role="button"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`. List has `role="listbox"`, `aria-activedescendant`. Options have `role="option"`, `aria-selected`.
- **Selected option**: Shown with bold text and a brand-colored checkmark icon.

## Interactive States

| State        | Trigger                                   | Option                              |
|--------------|-------------------------------------------|-------------------------------------|
| Default      | `border-input-border bg-input`            | `text-text-muted`                   |
| Hover        | `hover:border-brand`                      | `hover:bg-surface-hover hover:text-text` |
| Focus-visible | `focus-visible:ring-2 ring-brand-ring`   | N/A (keyboard via `activeIndex`)    |
| Active (kbd) | —                                         | `bg-surface-active text-text`       |
| Error        | `border-danger`                           | —                                   |
| Disabled     | `opacity-50 cursor-not-allowed`           | —                                   |

## Animation

Dropdown enters with `opacity-0 scale-95` → `opacity-100 scale-100` and exits in reverse, both over `var(--duration-fast)`. Chevron icon rotates 180° when open.

## Tokens Used

`--color-brand`, `--color-brand-ring`, `--color-input`, `--color-input-border`, `--color-surface`, `--color-surface-border`, `--color-surface-hover`, `--color-surface-active`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-danger`, `--duration-fast`

## When to Use

Use Select for choosing a single value from a short-to-medium list (up to ~20 options). For very long lists, prefer a Combobox with search. For fewer than 4 options that are always visible, prefer RadioGroup.
