# DatePicker

A trigger button that opens a calendar popup for selecting a single date. No external date libraries — all date math is implemented in plain JavaScript.

---

## Installation

```bash
npx @obi/ui add date-picker
```

No npm dependencies. No registry dependencies.

---

## Props

| Name          | Type                    | Default          | Description                                                    |
|---------------|-------------------------|------------------|----------------------------------------------------------------|
| `value`       | `Date \| null`          | `undefined`      | The currently selected date (controlled).                      |
| `onChange`    | `(date: Date) => void`  | `undefined`      | Called when the user selects a day from the calendar.          |
| `placeholder` | `string`                | `'Pick a date'`  | Text shown in the trigger when no date is selected.            |
| `min`         | `Date`                  | `undefined`      | Earliest selectable date. Days before this are disabled.       |
| `max`         | `Date`                  | `undefined`      | Latest selectable date. Days after this are disabled.          |
| `disabled`    | `boolean`               | `false`          | Disables the trigger and prevents the calendar from opening.   |
| `label`       | `string`                | `undefined`      | Visible label rendered above the trigger button.               |
| `hint`        | `string`                | `undefined`      | Helper text below the trigger. Hidden when `error` is set.     |
| `error`       | `string`                | `undefined`      | Error message below the trigger; also applies error border.    |
| `className`   | `string`                | `''`             | Additional classes merged onto the root wrapper element.       |

---

## Interactive States

### Trigger button

| State        | Visual                                                                    |
|--------------|---------------------------------------------------------------------------|
| Default      | `border-input-border bg-surface text-text`                                |
| Hover        | `hover:border-brand` — border shifts to brand color                       |
| Focus        | `focus:outline-none` — browser default suppressed                         |
| Focus-visible| `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` |
| Disabled     | `opacity-50 cursor-not-allowed pointer-events-none` — no hover or focus   |
| Error        | `border-danger` instead of `border-input-border`                          |
| Open         | Popup mounts; `aria-expanded="true"` on trigger                           |

### Day buttons in the grid

| State          | Visual                                                                              |
|----------------|-------------------------------------------------------------------------------------|
| Default        | `text-text hover:bg-surface-hover`                                                  |
| Today          | `ring-2 ring-brand-ring ring-offset-1` — brand ring, not filled                    |
| Selected       | `bg-brand text-brand-fg font-medium` — filled brand background                     |
| Outside month  | `opacity-30` — still navigable via arrow keys                                       |
| Disabled       | `opacity-30 cursor-not-allowed pointer-events-none` — not clickable                 |
| Focus-visible  | `focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring`    |

---

## Calendar Popup Behavior

- Opens below the trigger button; positioned `top-full mt-1 left-0` relative to the trigger wrapper.
- Popup is **not** a modal — focus is **not** trapped. Tab closes the popup and moves to the next focusable element in the document.
- Arrow navigation updates the focused day across month boundaries (automatically advances `viewMonth` / `viewYear`).
- Prev/next month chevron buttons navigate the month view without closing the popup.
- Clicking a day selects it and closes the popup.
- Days in the previous or next month overflow are shown at 30% opacity and are still keyboard-navigable.

---

## Keyboard Behavior

| Key              | Behavior                                                                         |
|------------------|----------------------------------------------------------------------------------|
| `ArrowLeft`      | Move focused day back 1 day; wraps to previous month if needed                  |
| `ArrowRight`     | Move focused day forward 1 day; wraps to next month if needed                   |
| `ArrowUp`        | Move focused day back 7 days (one week)                                          |
| `ArrowDown`      | Move focused day forward 7 days (one week)                                       |
| `Home`           | Move to the Sunday of the current week                                           |
| `End`            | Move to the Saturday of the current week                                         |
| `PageUp`         | Navigate to the previous month                                                   |
| `PageDown`       | Navigate to the next month                                                       |
| `Enter` / `Space`| Select the currently focused day (if not disabled) and close the popup           |
| `Escape`         | Close the popup, return focus to the trigger button                              |
| `Tab`            | Close the popup; move focus to the next focusable element in the page            |

---

## Accessibility

### ARIA Roles and Attributes

| Element            | Role / Attribute                                                              |
|--------------------|-------------------------------------------------------------------------------|
| Trigger button     | `role="button"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`  |
| Popup container    | `role="dialog"`, `aria-label="Date picker"` — **no** `aria-modal`            |
| Grid container     | `role="grid"`, `aria-label="Month YYYY"`, `tabIndex={0}`                     |
| Column headers     | `role="columnheader"`, `<abbr>` with full day name as `title`                |
| Grid rows          | `role="row"` on each week row                                                 |
| Grid cells         | `role="gridcell"`, `aria-selected`, `aria-disabled`                          |
| Day buttons        | `aria-label="D Month YYYY"`, `aria-current="date"` on today                  |

### Focus Management

- On open: focus moves to the `role="grid"` container immediately via `requestAnimationFrame`.
- Focus is **not** trapped — this is a non-modal overlay.
- On close (any method): focus returns to the trigger button.
- Focused day within the grid uses a single roving `tabIndex={0}` button; all other day buttons have `tabIndex={-1}`.
- Arrow keys move the roving focus through the grid; month boundaries are crossed transparently.

### Reduced Motion

All transitions use the `motion-safe:` Tailwind prefix. The global `prefers-reduced-motion` rule in `globals.css` covers everything else.

---

## Animation

Follows the mounted/visible two-step pattern from `Select`:

1. `setMounted(true)` — adds the popup to the DOM.
2. `requestAnimationFrame(() => setVisible(true))` — triggers the CSS transition on the next paint.
3. On close: `setVisible(false)` immediately; `setTimeout(() => setMounted(false), 150)` removes DOM after transition completes.

CSS classes: `opacity-0 scale-95` → `opacity-100 scale-100` with `motion-safe:transition-[opacity,transform] motion-safe:duration-[var(--duration-fast)]`.

---

## Tokens Used

| Token                  | Where used                            |
|------------------------|---------------------------------------|
| `bg-surface`           | Trigger and popup background          |
| `border-input-border`  | Trigger border (default)              |
| `border-danger`        | Trigger border (error state)          |
| `bg-brand`             | Selected day background               |
| `text-brand-fg`        | Selected day text                     |
| `ring-brand-ring`      | Focus ring on trigger and day buttons |
| `text-text`            | Primary text                          |
| `text-text-muted`      | Day-of-week headers and calendar icon |
| `text-text-subtle`     | Placeholder text in trigger           |
| `bg-surface-hover`     | Day button hover background           |
| `border-surface-border`| Popup border                          |
| `text-danger`          | Error message text                    |
| `--duration-fast`      | All transition durations              |

---

## When to Use

Use `DatePicker` when:
- The user must select a single specific date from a calendar interface.
- You need `min`/`max` bounds to constrain selectable dates (e.g. a future-only booking picker).
- A plain text input with date formatting is insufficient and you want a spatial calendar view.

Do **not** use when:
- The user needs to select a date range — this component is single-date only.
- The date is typed, not picked — use a plain `Input` with `type="date"` instead.
