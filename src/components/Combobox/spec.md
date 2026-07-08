# Combobox

A searchable dropdown that filters options as the user types. Supports single-select and multi-select modes. Built on the ARIA combobox pattern.

## Installation

```bash
npx dafink-ui add combobox
```

No npm dependencies. No registry dependencies.

## Props

| Prop          | Type                                             | Default       | Description                                                             |
|---------------|--------------------------------------------------|---------------|-------------------------------------------------------------------------|
| `options`     | `ComboboxOption[]`                               | —             | Array of `{ value, label, disabled? }` objects.                         |
| `value`       | `string` (single) \| `string[]` (multi)          | `undefined`   | Controlled selected value(s).                                           |
| `onChange`    | `(value: string) => void` \| `(value: string[]) => void` | `undefined` | Called when selection changes.                                   |
| `multiple`    | `boolean`                                        | `false`       | Enables multi-select mode. Changes `value` and `onChange` signatures.   |
| `placeholder` | `string`                                         | `'Search…'`   | Placeholder text in the search input.                                   |
| `label`       | `string`                                         | `undefined`   | Visible label rendered above the input.                                 |
| `hint`        | `string`                                         | `undefined`   | Helper text below the input (hidden when error is set).                 |
| `error`       | `string`                                         | `undefined`   | Error message; switches the input to error state and sets `aria-invalid`.|
| `size`        | `'sm' \| 'md'`                                   | `'md'`        | Controls input and option text size and padding.                        |
| `disabled`    | `boolean`                                        | `false`       | Disables the input and prevents the dropdown from opening.              |
| `className`   | `string`                                         | `''`          | Additional classes on the root wrapper element.                         |

### ComboboxOption shape

| Field      | Type      | Description                               |
|------------|-----------|-------------------------------------------|
| `value`    | `string`  | Unique identifier for the option.         |
| `label`    | `string`  | Human-readable text shown in the list.    |
| `disabled` | `boolean` | When true, option is visible but not selectable. |

## Filtering

Filtering is case-insensitive substring match on `label`. The matched substring is highlighted in brand color and bold weight within the rendered option. When no options match, a "No options" message is shown.

## Single Mode Behavior

- Typing filters the option list.
- Selecting an option fills the input with the option's label, closes the dropdown, and calls `onChange(value)`.
- The dropdown re-opens and re-filters whenever the user focuses the input and types.

## Multi Mode Behavior

- Selecting an option adds it as a pill chip above the input. The input stays open and cleared for further selections.
- Each pill has a × remove button (`aria-label="Remove {label}"`).
- Pressing Backspace on an empty input removes the last selected option.
- The pills container has `aria-label="Selected options"`.
- Clicking a pill for an already-selected option deselects it (toggle).

## Keyboard Behavior

| Key           | Action                                                              |
|---------------|---------------------------------------------------------------------|
| `ArrowDown`   | Open dropdown (if closed); move to next enabled option              |
| `ArrowUp`     | Open dropdown (if closed); move to previous enabled option          |
| `Home`        | Jump to the first enabled option                                    |
| `End`         | Jump to the last enabled option                                     |
| `Enter`       | Select the currently focused option                                 |
| `Escape`      | Close the dropdown and return focus to the input (or clear input if already closed) |
| `Tab`         | Close the dropdown; move focus to the next page element (not trapped) |
| `Backspace`   | (multi mode) When input is empty, remove the last selected pill     |

Disabled options are skipped during ArrowDown/Up/Home/End navigation.

## Accessibility

### Focus Behavior

- **On open**: The dropdown appears but focus remains in the input. Active option is communicated via `aria-activedescendant` — the input retains focus throughout.
- **Focus trap**: Not trapped. Tab closes the dropdown and moves focus to the next page element naturally.
- **Escape**: Closes the dropdown; focus stays in the input.
- **Tab**: Closes without returning focus to the input; lets Tab land on the next element.

### ARIA Roles

| Element              | Role / Attribute                                                                 |
|----------------------|----------------------------------------------------------------------------------|
| `<input>`            | `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls`, `aria-activedescendant`, `aria-invalid` |
| `<ul>`               | `role="listbox"`, `aria-label="Options"`, `aria-multiselectable` (multi mode)    |
| `<li>`               | `role="option"`, `aria-selected`, `aria-disabled`                                |
| Pills container      | `aria-label="Selected options"`                                                  |
| Pill remove button   | `aria-label="Remove {label}"`                                                    |

### Popup Checklist

- [x] Focus on open — focus stays in input; `aria-activedescendant` tracks focused option
- [x] Focus trap — not required (non-modal dropdown)
- [x] Escape closes — returns focus to input
- [x] Tab closes — moves focus naturally, no trap
- [x] Arrow key navigation — ArrowDown/Up cycle enabled options; Home/End jump to ends
- [x] Disabled option skip — disabled options are not selectable and are skipped by keyboard nav
- [x] Enter confirms — selects the aria-activedescendant option
- [x] Backdrop click — clicking outside closes the dropdown
- [x] ARIA roles — `combobox`, `listbox`, `option` with correct attributes throughout

## Interactive States

| State         | Input element                                                   | Option item                                |
|---------------|-----------------------------------------------------------------|--------------------------------------------|
| Default       | `border-input-border bg-surface`                                | `text-text-muted`                          |
| Hover         | `hover:border-input-border-hover`                               | `hover:bg-surface-hover hover:text-text`   |
| Focus-visible | `focus-visible:ring-2 focus-visible:ring-brand-ring`            | N/A (keyboard via `aria-activedescendant`) |
| Active (kbd)  | —                                                               | `bg-surface-active text-text`              |
| Error         | `border-danger`                                                 | —                                          |
| Disabled      | `opacity-50 cursor-not-allowed bg-input-disabled-bg`            | `opacity-50 cursor-not-allowed`            |

## Animation

The dropdown enters with `opacity-0 scale-95` → `opacity-100 scale-100` at `var(--duration-fast)`. Exit is the reverse. The chevron icon rotates 180° when the list is open. All motion respects `prefers-reduced-motion` via the global rule in `globals.css`.

## Tokens Used

`--color-brand`, `--color-brand-ring`, `--color-surface`, `--color-surface-hover`, `--color-surface-active`, `--color-surface-border`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-input-border`, `--color-input-border-hover`, `--color-input-disabled-bg`, `--color-input-disabled-text`, `--color-danger`, `--duration-fast`

## When to Use

Use Combobox when:

- The option list is long enough (more than ~10 items) that searching is faster than scanning.
- You need multi-select with chip/pill feedback.
- Users need to find options by typing partial text.

Use Select instead when:
- The list is short (≤ 10 items) and scanning is natural.
- No search/filter behavior is needed.

Use RadioGroup instead when:
- There are fewer than 5 options and they should always be visible.
