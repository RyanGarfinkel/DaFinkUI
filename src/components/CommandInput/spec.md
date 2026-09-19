# CommandInput

A plain text input that also handles slash-style commands. Typing the trigger character (`/` by default) as the first character opens a filtered, keyboard-navigable command menu anchored to the input; typing anything else behaves like a normal text field.

## Installation

```bash
npx dafink-ui add command-input
```

No npm dependencies. No registry dependencies.

## Props

| Prop        | Type                            | Default     | Description                                                              |
|-------------|----------------------------------|-------------|---------------------------------------------------------------------------|
| `value`     | `string`                        | None        | Controlled input value.                                                   |
| `onChange`  | `(value: string) => void`       | None        | Called on every text change, including internal completions/clears.       |
| `commands`  | `CommandOption[]`                | None        | Array of `{ name, description?, icon? }` objects available for autocomplete. |
| `onCommand` | `(command: CommandOption) => void` | None     | Called when a command is executed (Enter or pointer-select on a menu item). |
| `trigger`   | `string`                        | `'/'`       | Character that opens the command menu when it's the first character typed. |
| `menuSide`  | `'top' \| 'bottom'`              | `'top'`     | Which side of the input the menu opens on.                                |
| `className` | `string`                        | `''`        | Additional classes on the root wrapper element.                           |

Also accepts and forwards standard `<input>` attributes (`placeholder`, `disabled`, `name`, `id`, `autoFocus`, etc.) except `value`, `onChange`, and `onKeyDown`, which are owned by the component.

### CommandOption shape

| Field         | Type        | Description                                    |
|---------------|-------------|-------------------------------------------------|
| `name`        | `string`    | Command name, without the trigger character.    |
| `description` | `string`    | Optional one-line description shown in the menu.|
| `icon`        | `ReactNode` | Optional leading icon shown in the menu row.    |

## Behavior

- The menu opens only when `value` starts with `trigger` as its very first character (e.g. `/compact`, not `and/or`).
- Filtering is a case-insensitive prefix match on `command.name` against the text after the trigger. The matched prefix is bolded in brand color in the menu.
- When no commands match, the menu shows a "No matching commands" row instead of closing.
- The first (or otherwise active) match is highlighted automatically as soon as the menu opens — there's always something to Tab-complete or Enter-run once at least one match exists.
- Typing when the value no longer starts with `trigger` (trigger character deleted) closes the menu and the field behaves as a normal text input; whatever was typed is preserved via the normal `onChange`.
- When the menu is closed (value doesn't start with `trigger`, or nothing matches), Enter is left unhandled so it can bubble to a surrounding `<form onSubmit>` for normal submission — CommandInput is a drop-in swap for a plain message input.

## Keyboard Behavior

| Key         | Action                                                                                   |
|-------------|-------------------------------------------------------------------------------------------|
| `ArrowDown` | Move to the next matching command (wraps)                                                 |
| `ArrowUp`   | Move to the previous matching command (wraps)                                             |
| `Home`      | Jump to the first matching command                                                        |
| `End`       | Jump to the last matching command                                                         |
| `Tab`       | Complete the active command's full name into the input; menu stays open; does **not** run it |
| `Enter`     | Runs the active command: calls `onCommand`, clears the input, closes the menu             |
| `Escape`    | Closes the menu and returns focus to the input                                            |

Tab and Enter are intentionally different actions: Tab only autocompletes the text (so you can keep typing arguments), Enter is what actually executes the command.

## Accessibility

### Focus Behavior

- **On open**: The menu appears but focus remains in the input the whole time. The active option is communicated via `aria-activedescendant`.
- **Focus trap**: Not trapped — this is a combobox/listbox pattern, not a modal.
- **Escape**: Closes the menu; focus stays in (returns to) the input.
- **Tab**: When the menu is open with an active match, Tab is intercepted to complete the text instead of moving focus. When there's nothing to complete, Tab behaves natively and closes the menu.

### ARIA Roles

| Element   | Role / Attribute                                                                 |
|-----------|------------------------------------------------------------------------------------|
| `<input>` | `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls`, `aria-activedescendant` |
| `<ul>`    | `role="listbox"`, `aria-label="Commands"`                                          |
| `<li>`    | `role="option"`, `aria-selected`                                                   |

### Popup Checklist

- [x] Focus on open: focus stays in the input; `aria-activedescendant` tracks the active option
- [x] Focus trap: not required (non-modal combobox)
- [x] Escape closes: returns focus to the input
- [x] Tab: completes when there's an active match, otherwise closes and moves on naturally
- [x] Arrow key navigation: ArrowDown/Up wrap; Home/End jump to ends
- [x] Enter confirms: runs the active command and clears the input
- [x] Outside click closes: pointerdown outside the component closes the menu
- [x] ARIA roles: `combobox`, `listbox`, `option` with correct attributes throughout

## Interactive States

| State         | Input element                                        | Option row                                   |
|---------------|-------------------------------------------------------|-----------------------------------------------|
| Default       | `border-input-border bg-surface`                       | `text-text-muted`                              |
| Hover         | `hover:border-input-border-hover`                      | `hover:bg-surface-hover hover:text-text`       |
| Focus-visible | `focus-visible:ring-2 focus-visible:ring-brand-ring`   | N/A (keyboard via `aria-activedescendant`)     |
| Active (kbd/pointer) | None                                            | `bg-surface-active text-text`                  |
| Disabled      | `opacity-50 cursor-not-allowed bg-input-disabled-bg`   | N/A                                            |

## Animation

The menu enters with `opacity-0 scale-95` → `opacity-100 scale-100` at `var(--duration-fast)`, scaling from the edge nearest the input (`origin-bottom` when `menuSide="top"`, `origin-top` when `menuSide="bottom"`). Exit is the reverse. All motion respects `prefers-reduced-motion` via the global rule in `globals.css`.

## Tokens Used

`--color-brand`, `--color-brand-ring`, `--color-surface`, `--color-surface-panel`, `--color-surface-hover`, `--color-surface-active`, `--color-surface-border`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-input-border`, `--color-input-border-hover`, `--color-input-disabled-bg`, `--color-input-disabled-text`, `--duration-fast`, `--radius`, `--radius-sm`, `--radius-lg`, `--shadow-lg`, `--backdrop-blur`

## When to Use

Use CommandInput when:

- A text field should support inline, discoverable "slash commands" (chat composers, comment boxes, search bars with power-user shortcuts).
- Users need to keep typing a normal message most of the time, with commands as an opt-in escape hatch rather than a separate mode.

Use CommandPalette instead when:

- The trigger is global (e.g. ⌘K), not scoped to one text field, and should take over the screen as a modal launcher.

Use Combobox instead when:

- The entire field is dedicated to picking one value from a list, rather than a free-text field that occasionally opens a command menu.
