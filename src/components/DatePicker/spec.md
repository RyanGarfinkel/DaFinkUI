# DatePicker

A trigger button that opens a popup for selecting a single date, a time of day, or both (`granularity` prop). No external date libraries: all date math is implemented in plain JavaScript.

---

## Installation

```bash
npx dafink-ui add date-picker
```

No npm dependencies. No registry dependencies.

---

## Props

| Name          | Type                    | Default          | Description                                                    |
|---------------|-------------------------|------------------|----------------------------------------------------------------|
| `value`       | `Date \| null`          | `undefined`      | The currently selected date (controlled).                      |
| `onChange`    | `(date: Date) => void`  | `undefined`      | Called when the user selects a day from the calendar.          |
| `placeholder` | `string`                | `'Pick a date'`  | Text shown in the trigger when no date is selected. Defaults to `'Pick a time'` / `'Pick a date & time'` for the other two `granularity` values when omitted. |
| `granularity` | `'date' \| 'time' \| 'datetime'` | `'date'` | Controls whether the popup shows a calendar grid, a time-entry row, or both.       |
| `min`         | `Date`                  | `undefined`      | Earliest selectable date. Days before this are disabled.       |
| `max`         | `Date`                  | `undefined`      | Latest selectable date. Days after this are disabled.          |
| `disabled`    | `boolean`               | `false`          | Disables the trigger and prevents the calendar from opening.   |
| `label`       | `string`                | `undefined`      | Visible label rendered above the trigger button.               |
| `hint`        | `string`                | `undefined`      | Helper text below the trigger. Hidden when `error` is set.     |
| `error`       | `string`                | `undefined`      | Error message below the trigger; also applies error border.    |
| `panelSide`   | `'top' \| 'bottom'`     | `'bottom'`       | Which side of the trigger the calendar panel opens on. Use `'top'` when the trigger sits near the bottom of its container (e.g. a card near the end of a scrollable list) so the panel doesn't get clipped or push the container taller. |
| `className`   | `string`                | `''`             | Additional classes merged onto the root wrapper element.       |

---

## Interactive States

### Trigger button

| State        | Visual                                                                    |
|--------------|---------------------------------------------------------------------------|
| Default      | `border-input-border bg-surface text-text`                                |
| Hover        | `hover:border-brand`: border shifts to brand color                        |
| Focus        | `focus:outline-none`: browser default suppressed                          |
| Focus-visible| `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` |
| Disabled     | `opacity-50 cursor-not-allowed pointer-events-none`: no hover or focus    |
| Error        | `border-danger` instead of `border-input-border`                          |
| Open         | Popup mounts; `aria-expanded="true"` on trigger                           |

### Day buttons in the grid

| State          | Visual                                                                              |
|----------------|-------------------------------------------------------------------------------------|
| Default        | `text-text hover:bg-surface-hover`                                                  |
| Today          | `underline underline-offset-2`: underlined, not filled                            |
| Selected       | `bg-brand text-brand-fg font-medium`: filled brand background                      |
| Outside month  | `opacity-30`: still navigable via arrow keys                                        |
| Disabled       | `opacity-30 cursor-not-allowed pointer-events-none`: not clickable                  |
| Focus-visible  | `focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring`    |

### Time segments (`granularity="time"` or `"datetime"`)

Rendered by the internal `TimeField` sub-component (`DatePicker/TimeField.tsx`) as a single bordered `role="group"` container — styled like one text input — holding four `role="spinbutton"` cells (Hours, Minutes, Seconds, AM/PM). This is a deliberate divergence from `OTPInput`'s look: `OTPInput` gives each character its own bordered box, but a clock time reads as one value, so the border lives on the outer group and each segment is just a borderless, individually focusable hit target inside it. For `granularity="time"`, a leading clock icon renders inside the same bordered group (`icon` prop on `TimeField`), matching the "icon inside the field" convention other inputs use rather than sitting outside it.

| Element        | State          | Visual                                                                              |
|----------------|----------------|--------------------------------------------------------------------------------------|
| Outer group    | Default        | `border-input-border bg-surface`                                                     |
| Outer group    | Hover          | `hover:border-input-border-hover`                                                    |
| Outer group    | Disabled       | `opacity-50 cursor-not-allowed`                                                       |
| Segment cell   | Default        | `text-text`, no border of its own                                                    |
| Segment cell   | Hover          | `hover:bg-surface-hover`                                                             |
| Segment cell   | Focus-visible  | `focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring`     |

Segments sit flush next to each other inside the group (colon separators between Hours/Minutes/Seconds); the group itself, not each cell, owns the gap-inducing `p-1`-style gutter, so a focus ring on one segment doesn't collide with the border of the whole field.

### Clock icon button and time wheel (`granularity="time"`)

The leading clock icon (`icon` prop on `TimeField`) is a real `<button>`, not decoration: clicking it opens a second, independent popover — rendered by the internal `TimeWheel` sub-component (`DatePicker/TimeWheel.tsx`) — with four scrollable wheel columns (Hour, Minute, Second, AM/PM) for picking a time visually instead of typing into the segments. It is additive: the segments below remain fully usable whether or not the wheel is open.

| State          | Visual                                                                              |
|----------------|-------------------------------------------------------------------------------------|
| Default        | `text-text-muted`, no border (blends into the group)                                |
| Hover          | `hover:bg-surface-hover hover:text-text`                                            |
| Focus-visible  | `focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring`     |
| Open           | `aria-expanded="true"`; wheel popover mounts below it                               |

Clicking anywhere in the blank padding of the segmented group (not a segment, not the icon button) focuses the Hours segment — the same convenience a native text input gives you when you click its padding instead of squarely on its text.

---

## Time Wheel Popup (`granularity="time"`, via the clock icon)

- Opens below the clock icon button; positioned `top-full mt-1 left-0` relative to the group.
- Non-modal: focus is **not** trapped. It layers on top of the segmented field, which stays interactive underneath.
- Four independent `role="listbox"` columns share one popover: Hour (1-12), Minute (00-59), Second (00-59), AM/PM. Each column is its own scroll container using native CSS scroll-snap (`snap-y snap-mandatory`, `scroll-snap-align: center` per row) so a mouse-wheel or trackpad gesture settles naturally on a row; a debounced `scroll` handler (120ms of quiet) then commits whatever row ended up centered.
- **Hour, Minute, and Second loop endlessly** — scrolling up past `00` wraps to `59` (and vice versa) — by rendering each of those columns' option list three times back-to-back and silently re-centering the scroll position into the middle copy once the column settles (imperceptible: the three copies are pixel-identical, so the jump never shows). **AM/PM does not loop** — it's a plain two-item list, since a two-value loop would just spin in place.
- Clicking a row commits its value immediately and smooth-scrolls the column to center it (skipped in favor of an instant jump under `prefers-reduced-motion: reduce`).
- Scrollbars are fully hidden on the wheel columns (`scrollbar-none` utility in `globals.css` — mirrored in `packages/cli/src/lib/css.ts`), since the center highlight band is the only affordance needed for "current value."
- Closes via Escape, Enter, a click outside both the icon button and the popover, or Tab forward off the last (AM/PM) column.

---

## Calendar Popup Behavior

- Opens below the trigger button; positioned `top-full mt-1 left-0` relative to the trigger wrapper.
- Popup is **not** a modal, so focus is **not** trapped. Tab closes the popup and moves to the next focusable element in the document.
- Arrow navigation updates the focused day across month boundaries (automatically advances `viewMonth` / `viewYear`).
- Prev/next month chevron buttons navigate the month view without closing the popup.
- Clicking a day selects it. For `granularity="date"` this closes the popup, same as always. For `granularity="datetime"` the popup **stays open** after picking a day, so the user can then set the time; it closes only via Escape, backdrop click, Enter/Escape on a time segment, or Tab out of the last (AM/PM) segment.
- Days in the previous or next month overflow are shown at 30% opacity and are still keyboard-navigable.
- `granularity="time"` renders no calendar grid at all — the popup is just the time-entry row, and initial focus on open lands on the Hours segment instead of a day.
- `granularity="datetime"` renders the grid followed by the time row (separated by a `border-t`), both inside the same popup.

---

## Keyboard Behavior

### Calendar grid

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
| `Enter` / `Space`| Select the currently focused day (if not disabled); closes the popup only for `granularity="date"` |
| `Escape`         | Close the popup, return focus to the trigger button                              |
| `Tab`            | Closes the popup and moves to the next focusable element **only when there's no time row after the grid** (`granularity="date"`); for `"datetime"` it moves focus onward into the time row instead |

### Time segments

| Key              | Behavior                                                                         |
|------------------|----------------------------------------------------------------------------------|
| `0`-`9`          | Types into the focused segment (Hours/Minutes/Seconds); see digit buffering below |
| `ArrowUp` / `ArrowDown` | Increments/decrements the focused segment's value immediately, with wraparound (Hours 1↔12, Minutes/Seconds 0↔59, AM/PM toggles) |
| `ArrowLeft` / `ArrowRight` | Moves focus to the adjacent segment (clamped at the ends, no wrap)        |
| `a` / `p`        | Sets the AM/PM segment directly (only meaningful when it has focus)             |
| `Enter` / `Escape` | Closes the popup and returns focus to the trigger, from any segment            |
| `Tab`            | On the AM/PM segment only (and not Shift+Tab): closes the popup without returning focus to the trigger, same convention as the grid's Tab handling |

#### Digit buffering & overflow rollover

Typing a digit into Hours/Minutes/Seconds commits it immediately if it's a complete value on its own (e.g. Minutes "6" — no digit could extend "6" into a valid two-digit minute). If a second digit could still complete a larger valid value (e.g. Hours "1", Minutes/Seconds "0"-"5"), the segment buffers that digit for ~550ms waiting for a second one; the timeout just clears the buffer; it never changes focus or value on its own (the first digit's tentative value already committed immediately). A second digit that would overflow the field (e.g. Hours "1" then "9" → 19) leaves the first digit's committed value alone, moves focus to the next segment, and re-seeds that segment's buffer with the overflow digit as if it were its own first keystroke — matching how a native `<input type="time">` handles the same keystroke sequence. Backspace/Delete are intentionally unhandled on these segments.

### Time wheel columns

| Key              | Behavior                                                                         |
|------------------|----------------------------------------------------------------------------------|
| `ArrowUp` / `ArrowDown` | Move the focused column by one row immediately (Hour/Minute/Second wrap; AM/PM clamps at the ends) |
| `Home` / `End`   | Jump to the first/last value in the focused column                              |
| `ArrowLeft` / `ArrowRight` | Move focus to the adjacent column (clamped at the ends, no wrap)          |
| `Enter` / `Escape` | Closes the wheel popover and returns focus to the clock icon button, from any column |
| `Tab`            | On the AM/PM column only (and not Shift+Tab): closes the popover without returning focus to the icon button |

---

## Accessibility

### ARIA Roles and Attributes

| Element            | Role / Attribute                                                              |
|--------------------|-------------------------------------------------------------------------------|
| Trigger button     | `role="button"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`  |
| Popup container    | `role="dialog"`, `aria-label` = "Date picker" / "Time picker" / "Date and time picker" per `granularity` (**no** `aria-modal`) |
| Grid container     | `role="grid"`, `aria-label="Month YYYY"`, `tabIndex={0}`                     |
| Column headers     | `role="columnheader"`, `<abbr>` with full day name as `title`                |
| Grid rows          | `role="row"` on each week row                                                 |
| Grid cells         | `role="gridcell"`, `aria-selected`, `aria-disabled`                          |
| Day buttons        | `aria-label="D Month YYYY"`, `aria-current="date"` on today                  |
| Time segment group | `role="group"`, `aria-label="Time"`                                          |
| Time segments      | `role="spinbutton"`, `aria-label` ("Hours"/"Minutes"/"Seconds"/"AM or PM"), `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext` |
| Clock icon button  | `role="button"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`, `aria-label="Open time picker"` |
| Time wheel popover | `role="dialog"`, `aria-label="Select time"` (**no** `aria-modal`)            |
| Time wheel columns | `role="listbox"`, `aria-label` ("Hours"/"Minutes"/"Seconds"/"AM or PM"), `aria-activedescendant` |
| Time wheel rows    | `role="option"`, `aria-selected`                                             |

**Deliberate divergence from the roving-tabindex composite pattern**: `src/patterns/accessibility.md`'s "Composite Widgets (Roving tabindex)" guidance says arrow keys should move focus only, with Enter/Space confirming the value — that's the right default for menus, listboxes, and tab lists. The time segments intentionally don't follow it: per the WAI-ARIA spinbutton pattern (and how a native `<input type="time">` behaves), Arrow Up/Down change the segment's value immediately, and each segment is its own independent Tab stop rather than a single roving `tabIndex={0}` — the same reasoning `OTPInput` already uses for its per-character cells.

### Focus Management

- On open: for `granularity="date"`/`"datetime"`, focus moves to the `role="grid"` container immediately via `requestAnimationFrame`; for `granularity="time"`, it moves to the Hours segment instead (there is no grid).
- Focus is **not** trapped: this is a non-modal overlay.
- On close (any method): focus returns to the trigger button, except a plain Tab out of the popup's last element, which leaves focus wherever the browser's own Tab order takes it next.
- Focused day within the grid uses a single roving `tabIndex={0}` button; all other day buttons have `tabIndex={-1}`.
- Arrow keys move the roving focus through the grid; month boundaries are crossed transparently.
- Time segments are each independently focusable (`tabIndex={0}`, not roving) — Tab moves between them in document order like a native multi-part time input.
- Opening the time wheel popover moves focus to its Hours column immediately; closing it (any method) returns focus to the clock icon button, except a plain Tab out of the AM/PM column, which leaves focus wherever the browser's own Tab order takes it next.

### Reduced Motion

All transitions use the `motion-safe:` Tailwind prefix. The global `prefers-reduced-motion` rule in `globals.css` covers everything else.

---

## Animation

Follows the mounted/visible two-step pattern from `Select`:

1. `setMounted(true)`: adds the popup to the DOM.
2. `requestAnimationFrame(() => setVisible(true))`: triggers the CSS transition on the next paint.
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
| `border-surface-border`| Popup border; divider between grid and time row (`datetime`) |
| `text-danger`          | Error message text                    |
| `--duration-fast`      | All transition durations              |
| `border-input-border-hover` | Time segment group hover border  |
| `border-surface-border` (wheel) | Time wheel popover border         |
| `bg-surface-panel`     | Time wheel popover background         |
| `bg-surface-hover`     | Time wheel center-row highlight band; icon button hover |

The time wheel columns also use the `scrollbar-none` utility class (`app/globals.css`, mirrored in `packages/cli/src/lib/css.ts`) to hide their scrollbars entirely — not a color token, but tracked here since it's the same "must exist in both CSS files" footgun as the token rules above.

---

## When to Use

Use `DatePicker` when:
- The user must select a single specific date from a calendar interface.
- You need `min`/`max` bounds to constrain selectable dates (e.g. a future-only booking picker).
- A plain text input with date formatting is insufficient and you want a spatial calendar view.
- You also need a time-of-day (`granularity="time"`) or combined date-and-time (`granularity="datetime"`) value, e.g. scheduling an appointment.

Do **not** use when:
- The user needs to select a date range. This component is single-date only.
- The date is typed, not picked: use a plain `Input` with `type="date"` instead.
