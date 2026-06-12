# Accessibility Patterns

This is the canonical accessibility reference for Obi UI. Read this before building any interactive component, and especially before building anything that involves overlays, focus management, or keyboard interaction.

---

## Core Principle

Every component must be fully operable by keyboard alone, perceivable without color, and compatible with assistive technology. Accessibility is not a separate checklist — it is part of what "done" means.

---

## Color Contrast

All text and UI elements must meet WCAG 2.1 AA contrast ratios. Design tokens are pre-validated — never replace a token with a hardcoded value without running a contrast check.

| Context                          | Minimum ratio | Notes                                      |
|----------------------------------|---------------|--------------------------------------------|
| Body text (< 18px regular)       | 4.5:1         | Against the component's background         |
| Large text (≥ 18px or 14px bold) | 3:1           |                                            |
| UI components (inputs, buttons)  | 3:1           | Component boundary against its background  |
| Icons (meaningful, not decorative)| 3:1          |                                            |
| Focus rings                      | 3:1           | Ring color against adjacent background     |
| Placeholder text                 | 4.5:1         | Placeholder is often body-weight text      |
| Disabled states                  | No minimum    | Disabled elements are exempt from contrast requirements, but should still be clearly distinguishable from enabled states |

### Checking Contrast

Before shipping a new token or hardcoded color, verify with a tool like the WebAIM Contrast Checker. Run `scripts/check-contrast.ts` to verify token contrast ratios before shipping any token changes.

---

## Keyboard Navigation

### Focus Order

Focus must follow the visual and DOM order. Never use `tabindex` values greater than 0 to artificially reorder focus — fix the DOM order instead.

```tsx
// Wrong — this creates a confusing tab order
<button tabIndex={3}>Third</button>
<button tabIndex={1}>First</button>

// Right — DOM order equals tab order
<button>First</button>
<button>Second</button>
```

### Standard Key Bindings

| Key              | Behavior                                                             |
|------------------|----------------------------------------------------------------------|
| `Tab`            | Move focus to the next focusable element                             |
| `Shift+Tab`      | Move focus to the previous focusable element                         |
| `Enter`          | Activate a button, link, or submit a form                            |
| `Space`          | Toggle a checkbox, radio, switch; activate a button                  |
| `Escape`         | Dismiss an overlay, cancel an operation, close a popup               |
| `ArrowDown`      | Move to next item within a menu, listbox, radio group, or slider     |
| `ArrowUp`        | Move to previous item within a menu, listbox, radio group, or slider |
| `ArrowLeft`      | Move to previous item in horizontal composites (tabs, segmented control) |
| `ArrowRight`     | Move to next item in horizontal composites                           |
| `Home`           | Jump to first item in a composite widget                             |
| `End`            | Jump to last item in a composite widget                              |
| `PageUp/PageDown`| Large step in sliders and scrollable listboxes                       |

### Composite Widgets (Roving tabindex)

For components that contain multiple focusable children — menus, listboxes, radio groups, tab lists, segmented controls — use the **roving tabindex** pattern:

1. Only one child has `tabIndex={0}` at a time; all others have `tabIndex={-1}`
2. Arrow keys move focus and update which element has `tabIndex={0}`
3. Tab moves focus out of the widget entirely — it does not cycle through children

This keeps the tab stop count manageable for keyboard users navigating long pages.

```tsx
// Simplified roving tabindex example
const [activeIndex, setActiveIndex] = useState(0);

items.map((item, i) => (
  <div
    key={item.id}
    tabIndex={i === activeIndex ? 0 : -1}
    onKeyDown={(e) => {
      if (e.key === 'ArrowDown') setActiveIndex(Math.min(i + 1, items.length - 1));
      if (e.key === 'ArrowUp') setActiveIndex(Math.max(i - 1, 0));
      if (e.key === 'Home') setActiveIndex(0);
      if (e.key === 'End') setActiveIndex(items.length - 1);
    }}
  />
))
```

**Arrow navigation vs. selection.** Arrow keys move focus only — they do not change the selected/active value. The user confirms a choice with Enter or Space. This separates navigation intent from activation intent and avoids accidental state changes when exploring options.

**Focus-visible on selected items.** When the focused item is also the selected one, use a double-outline to distinguish "focused" from merely "selected": `ring-2 ring-offset-2 ring-brand-ring` with the offset color set to the container's background. This matches the primary button's focus convention. When the focused item is *not* selected (e.g., arrow-navigating to an unactivated option), use a single ring without offset: `ring-2 ring-brand-ring`.

**ToggleGroup implementation note.** `ToggleGroup` (single type) uses a sliding pill indicator as the selected state. The focus ring targets an absolutely-positioned inner `<span>` sized to match the pill (`inset-y-[5px] inset-x-1 rounded`), not the full button height. This gives the focus ring the same shape as the pill rather than a taller rectangle.

---

## Focus Management

### Returning Focus

Whenever focus moves into a new context — a modal opens, a panel expands, a form step advances — focus must be managed intentionally. When that context closes, focus must return to where it came from.

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

function openModal() {
  // Save trigger, open modal, move focus inside
}

function closeModal() {
  setIsOpen(false);
  // Return focus to trigger after close
  triggerRef.current?.focus();
}
```

### Focus Trap

Any overlay that blocks the page behind it (modal dialog, drawer, alert dialog) must trap focus. A focus trap means:

- `Tab` cycles forward through focusable elements **within the overlay** and wraps to the first when it reaches the last
- `Shift+Tab` cycles backward and wraps to the last when it reaches the first
- Focus **never** escapes to the document behind the overlay while it is open

Implementation approach — query all focusable elements within the container on open, listen for `keydown` on the container, and intercept Tab/Shift+Tab:

```tsx
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function trapFocus(container: HTMLElement, e: KeyboardEvent) {
  if (e.key !== 'Tab') return;
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
```

Re-query focusable elements whenever the overlay content changes — dynamic content may add or remove focusable elements.

---

## Popup and Overlay Patterns

This section defines the required keyboard and focus behavior for every popup-type component: **Modal**, **Dialog**, **Drawer**, **Dropdown**, **Menu**, **Combobox**, **Tooltip**, **Popover**, **Toast**.

### All Overlays

| Behavior              | Requirement                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| On open               | Focus moves into the overlay immediately (first focusable element, or the overlay itself if no focusable children) |
| While open            | Focus is trapped inside (modals/dialogs/drawers); or focus stays manageable (menus/dropdowns) |
| Escape key            | Closes the overlay and returns focus to the trigger element                 |
| On close              | Focus returns to the element that triggered the overlay                     |
| Background scroll     | Scrolling the page behind a blocking overlay is prevented (`overflow: hidden` on `<body>`) |
| `aria-modal`          | Blocking overlays (modal, dialog, drawer) set `aria-modal="true"` on the overlay container |

### Modal / Dialog

- Role: `role="dialog"` with `aria-modal="true"`
- Labelled by: `aria-labelledby` pointing to the dialog title
- Described by: `aria-describedby` pointing to body text (if present)
- Focus trap: **required** — Tab and Shift+Tab cycle within the dialog
- Escape: closes dialog, returns focus to trigger
- Tab from last focusable element: wraps to first (inside the dialog)
- Click outside (backdrop): closes dialog — treat the same as Escape

### Dropdown Menu / Context Menu

Menus are composite widgets using **roving tabindex** or `aria-activedescendant`. Use `role="menu"` on the container and `role="menuitem"` on each option.

| Key          | Behavior                                                       |
|--------------|----------------------------------------------------------------|
| `ArrowDown`  | Move focus to next menu item; wrap to first from last          |
| `ArrowUp`    | Move focus to previous menu item; wrap to last from first      |
| `Home`       | Move focus to first menu item                                  |
| `End`        | Move focus to last menu item                                   |
| `Enter/Space`| Activate the focused menu item and close the menu              |
| `Escape`     | Close the menu without selecting; return focus to trigger      |
| `Tab`        | Close the menu; move focus to the next focusable element in the page (not trapped) |
| Typeahead    | Typing a character moves focus to the next item starting with that character |

Tab does **not** trap inside a menu — it closes the menu and moves on. This is the expected behavior for a non-blocking overlay.

### Select / Listbox

- Role: `role="listbox"` on the list, `role="option"` on each item
- `aria-selected` on the currently selected option(s)
- `aria-expanded` on the trigger button
- Arrow key navigation with Home/End
- Typing a character performs typeahead search
- Escape closes without selecting; Enter/Space confirms

### Combobox (Autocomplete)

- Role: `role="combobox"` on the input, `role="listbox"` on the suggestion list
- `aria-expanded`, `aria-controls`, `aria-activedescendant` on the input
- Arrow keys move through suggestions without moving cursor in the input
- Enter confirms the highlighted suggestion
- Escape clears the suggestion list (or clears the input on second press)

### Tooltip

- Role: `role="tooltip"` on the tooltip element
- Trigger has `aria-describedby` pointing to the tooltip id
- Shows on focus-visible as well as hover (keyboard users must see it too)
- Escape dismisses a tooltip that appeared on hover
- Never put interactive content (links, buttons) inside a tooltip

### Popover (non-modal)

A popover is a non-modal overlay — it does not trap focus.

- Role: `role="dialog"` without `aria-modal` (or omit `aria-modal`)
- `Tab` moves focus through the popover content and then out to the next element in the page
- `Escape` closes the popover and returns focus to the trigger
- Clicking outside closes the popover

---

## ARIA Roles Quick Reference

| Pattern             | Container role     | Item role        | Trigger attributes                     |
|---------------------|--------------------|------------------|----------------------------------------|
| Modal dialog        | `dialog`           | —                | `aria-haspopup="dialog"`, `aria-expanded` |
| Menu                | `menu`             | `menuitem`       | `aria-haspopup="menu"`, `aria-expanded` |
| Listbox / Select    | `listbox`          | `option`         | `aria-haspopup="listbox"`, `aria-expanded` |
| Combobox            | `combobox` (input) | `option`         | `aria-expanded`, `aria-controls`, `aria-activedescendant` |
| Tab list            | `tablist`          | `tab` + `tabpanel` | `aria-selected`, `aria-controls`     |
| Accordion           | —                  | `button`         | `aria-expanded`, `aria-controls`       |
| Tooltip             | `tooltip`          | —                | `aria-describedby` on trigger          |

---

## Screen Reader Announcements

Use `aria-live` regions to announce dynamic content changes that don't receive focus:

- `aria-live="polite"` — announces after the user finishes their current action (success messages, status updates)
- `aria-live="assertive"` — interrupts immediately (errors that block submission, urgent alerts)
- `role="status"` — equivalent to `aria-live="polite"` with an implicit label
- `role="alert"` — equivalent to `aria-live="assertive"`

Do not overuse live regions — too many announcements create noise for screen reader users.

---

## Reduced Motion

All animations must be suppressed or replaced with an instant transition when the user has requested reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This is configured globally in `globals.css`. Do not add per-component reduced-motion overrides — the global rule handles it.

---

## WCAG 2.2 Additions

WCAG 2.2 is the current conformance target (enforceable under the European Accessibility Act since June 2025). These criteria are not covered by the WCAG 2.1 patterns above.

### 2.5.8 — Target Size Minimum (AA)

Every interactive target must be at least 24×24 CSS pixels, OR have spacing around it such that a 24px circle centered on the target doesn't intersect another target or the edge of the viewport.

Components to audit: Checkbox/Radio (default 20px — passes if the label extends the clickable area), icon-only buttons, DataTable sort headers, Carousel dots.

### 2.4.11 — Focus Not Obscured (AA)

A focused element must not be completely hidden by a sticky or fixed-position element. Applies to: Toast (floating overlay), sticky Sidebar headers, sticky TopNav. Verify that none of these can fully cover a focused element on the page beneath them.

### 2.5.7 — Dragging Movements (AA)

Any UI action that requires dragging must also be achievable with a single-pointer action (click/tap) or keyboard. Applies to: Kanban (already has KeyboardSensor — good), Slider, Carousel, any sortable list.

### 3.3.7 — Redundant Entry (AA)

Never block paste on any input field. OTPInput: verify `onPaste` is not suppressed. Auto-populated fields (autofill, clipboard) must not require re-entry.

### 3.3.8 — Accessible Authentication (AA)

Do not prevent autofill or autocomplete on authentication forms. Since Input spreads all props, consumers can set `autocomplete` — document that they must.

### 1.3.5 — Identify Input Purpose (2.1 AA, feeds 2.2 criteria)

Identity inputs — name, email, phone, address — must have the appropriate `autocomplete` attribute. Input's prop spread means consumers can set this; the component spec should require it for identity fields. Without it, password managers and autofill cannot assist users, which also violates 3.3.7.

---

## Testing Accessibility

Before marking a component complete:

1. **Keyboard-only walkthrough** — tab through the component, activate it with Enter/Space, navigate any composite widgets with arrow keys, dismiss overlays with Escape. Nothing should be unreachable or break.
2. **Focus visibility** — every focused element must have a clearly visible focus indicator at all times during keyboard navigation.
3. **Contrast check** — verify text and UI component contrast ratios if any new colors are introduced.
4. **Screen reader smoke test** — use VoiceOver (macOS) or NVDA (Windows) to verify role announcements and live region messages are sensible.
5. **Automated scan** — the `@storybook/addon-a11y` axe integration catches common violations; fix all errors before shipping.
