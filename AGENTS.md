<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Rule Files

Project-specific rules are in `rules/`. Read the relevant file before starting any work.

| Rule file                  | When to read                                                              |
|----------------------------|---------------------------------------------------------------------------|
| `rules/code.md`            | Before writing any code in this repo                                      |
| `rules/design.md`          | Before any visual, layout, or motion decision                             |
| `rules/tokens.md`          | Any time you write or touch styles in any component or pattern            |
| `rules/new-component.md`   | Any time a new UI component is being created or updated                   |
| `rules/docs-site.md`       | Any time you work on files under `app/` (including `app/_docs/`)          |
| `rules/commits.md`         | Before writing any commit message                                         |

## Pattern Files

Design and accessibility patterns are in `src/patterns/`. These are served via MCP and are the canonical source of truth — do not duplicate their content elsewhere.

| Pattern file                              | What it covers                                               |
|-------------------------------------------|--------------------------------------------------------------|
| `src/patterns/design.md`                  | Visual philosophy, motion, color, spacing, typography        |
| `src/patterns/accessibility.md`           | Contrast, keyboard nav, focus management, ARIA, overlay spec |
| `src/patterns/interactive-states.mdx`     | Hover / focus / focus-visible states; overlay focus patterns |

---

## Accessibility — Non-Negotiable

These five rules apply to every component, no exceptions:

1. **Every interactive element is keyboard-navigable.** Tab reaches it. Enter/Space activates it. If it cannot be reached and activated by keyboard alone, it is not done.
2. **Every interactive element has a visible focus indicator.** `focus-visible:ring-2 focus-visible:ring-offset-2` is the baseline. Never suppress focus-visible without a direct replacement.
3. **Color contrast.** Body text: 4.5:1 minimum. Large text and UI components: 3:1 minimum. Design tokens are pre-validated — use them. Never substitute a hardcoded color without a contrast check.
4. **Color is not the only signal.** Any state communicated by color (error, success, disabled) must also be communicated by a label, icon, or border change.
5. **All animation respects `prefers-reduced-motion`.** The global CSS rule in `globals.css` handles this — do not bypass it.

---

## Popup and Overlay Components — Required Behavior

Any component that opens a floating layer (Modal, Dialog, Drawer, Dropdown, Menu, Combobox, Popover, Tooltip) must implement all of the following. Full implementation guide: `src/patterns/accessibility.md`. Checklist and animation patterns: `rules/new-component.md`.

| Behavior | Modal / Dialog / Drawer | Menu / Dropdown / Popover |
|---|---|---|
| Focus on open | Move to first focusable element inside | Move to first focusable element inside |
| Focus trap | **Required** — Tab/Shift+Tab cycle within | Not trapped |
| Escape | Close, return focus to trigger | Close, return focus to trigger |
| Tab | Wraps within overlay | Closes overlay, moves to next page element |
| Arrow keys | N/A | ArrowDown/Up navigate items; Home/End jump to ends; wraps |
| Typeahead | N/A | Typing a char moves to next matching item |
| Enter/Space | Confirms / closes | Activates item, closes |
| Backdrop click | Closes (same as Escape) | Closes |
| Scroll lock | `overflow: hidden` on `<body>` | Not needed |
| `aria-modal` | `"true"` | Omit |
| Animation | Fade + scale 0.95→1.0 in, reverse out | Same |

Return focus to the trigger element on close — always, regardless of how it was closed.

---

## Memory & Design Learning

**Aggressive note-taking.** Capture new patterns, preferences, and decisions as they emerge — don't wait to be asked. When a new design convention is validated, a visual approach is confirmed, or a pattern is ruled out, save it to memory immediately.

**Evolving design philosophy.** The files in `src/patterns/` and `rules/` are living documents. When new visual or interaction principles emerge from working sessions, update them. Design thinking in this project should be current, not frozen.
