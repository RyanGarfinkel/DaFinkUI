# CodeBlock

A dual-purpose display component that renders a styled `<pre><code>` block with a copy-to-clipboard button (`variant="code"`), or a tabbed Preview/Code switcher for live component examples (`variant="example"`). First-class design system component; the docs site ExampleBlock is a thin alias.

## Installation

```bash
npx dafink-ui add code-block
```

**Registry dependencies:** `toggle-group` (installed automatically)  
**npm dependencies:** none

---

## Props

| Prop        | Type                         | Default      | Description                                                                               |
|-------------|------------------------------|--------------|-------------------------------------------------------------------------------------------|
| `code`      | `string`                     | None         | Required. The raw source code rendered in the code panel.                                 |
| `variant`   | `'code' \| 'example'`        | `'code'`     | `'code'` renders the code block alone. `'example'` adds a Preview/Code ToggleGroup above. |
| `children`  | `React.ReactNode`            | None         | Required when `variant="example"`. Rendered in the Preview tab.                           |
| `label`     | `string`                     | `'example'`  | Accessible label for the ToggleGroup tab strip (example variant only).                    |
| `minHeight` | `string`                     | `'200px'`    | CSS `min-height` on the preview pane (example variant only).                              |
| `align`     | `'center' \| 'start'`        | `'center'`   | Flex alignment of content in the preview pane (example variant only).                     |
| `className` | `string`                     | `''`         | Additional Tailwind classes merged onto the root wrapper.                                 |

---

## Variants

| Variant     | Description                                                                        |
|-------------|------------------------------------------------------------------------------------|
| `'code'`    | A `<pre><code>` block with syntax-safe monospace rendering and a copy button.      |
| `'example'` | A ToggleGroup switcher with a live Preview tab and a Code tab. Replaces ExampleBlock. |

---

## Interactive States

### Copy button (both variants)
| State          | Behaviour                                                                                   |
|----------------|---------------------------------------------------------------------------------------------|
| Default        | Invisible: `opacity-0`; fades in on group hover or keyboard focus                         |
| Hover          | `opacity-100`, `bg-surface-hover`, `text-text`                                              |
| Focus-visible  | `opacity-100`, `ring-2 ring-offset-2 ring-brand-ring`                                       |
| Active/clicked | Icon swaps to a checkmark for 2 000 ms, then reverts. No visible text label in either state: the `aria-label` (see Accessibility) carries the "Copy to clipboard" / "Copied" wording for assistive tech. |

### ToggleGroup tabs (example variant)
Interaction states are owned by the `ToggleGroup` / `ToggleGroupItem` component. See its spec.

---

## Accessibility

- The copy button uses `aria-label` that changes to `"Copied"` on success, giving screen reader feedback.
- SVG icons inside the copy button carry `aria-hidden="true"`.
- In `variant="example"`, the two panels carry `role="tabpanel"` and `aria-label` matching the tab name.
- The ToggleGroup strip receives an `aria-label` from the `label` prop.
- No focus trap is needed: neither variant opens a floating overlay.
- The `<pre>` block (read-only variant) is conditionally focusable based on overflow state. When code overflows horizontally (`scrollWidth > clientWidth`), the element receives `tabIndex={0}`, `role="region"`, `aria-label="Code sample"`, and `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring` so keyboard users can scroll to read clipped content. When content fits without overflow, `tabIndex={-1}` keeps it out of the tab order and the copy button remains the primary tab stop. A `ResizeObserver` tracks this state and updates dynamically.
- **`editable` mode intercepts Tab.** When `editable` is true, the `<textarea>`'s `onKeyDown` checks `e.key === 'Tab'` only (it does not check `e.shiftKey`), so both Tab and Shift+Tab are `preventDefault()`-ed and insert two spaces at the caret instead of moving focus. There is currently no keyboard-only way to leave the textarea once it's focused (a mouse click elsewhere, or a screen-reader-specific focus command, is required). Anyone embedding `editable` should be aware this is a keyboard trap by the letter of WCAG 2.1.2 and should pair it with an escape hatch (e.g. an Escape handler, or a visible "done editing" control) if used outside a controlled docs context.

---

## When to use

- **`variant="code"`**: Anywhere you need to display a standalone code snippet (docs prose, README-style pages, installation instructions).
- **`variant="example"`**: Component showcase pages where you want to show the rendered result alongside the source code. Replaces the old `ExampleBlock` component.

---

## Tokens used

| Token class            | Where                              |
|------------------------|------------------------------------|
| `bg-surface-active`    | `<pre>` background                 |
| `text-text`            | Code text, copy button hover text  |
| `text-text-muted`      | Copy button default text           |
| `bg-surface`           | Copy button background             |
| `bg-surface-hover`     | Copy button hover background; preview pane tint |
| `border-surface-border`| Copy button border; preview pane border |
| `ring-brand-ring`      | Focus ring on copy button and overflowing `<pre>` |
| `duration-[var(--duration-fast)]` | Copy button transition  |
