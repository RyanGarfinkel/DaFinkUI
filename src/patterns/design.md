# Design Guidelines

These principles apply to every component, pattern, and page in this design system. Read this before making any visual or layout decision.

---

## Philosophy

Design should be invisible. The user's goal is to complete a task — the interface should get out of the way. Every visual decision should either aid comprehension or communicate state. If it does neither, remove it.

- **Subtle over loud** — restraint is a feature. Hover states, transitions, and shadows should be noticeable without demanding attention.
- **Consistent over clever** — prefer the established pattern. Deviations require justification.
- **Functional over decorative** — color, motion, and emphasis exist to communicate, not to decorate.
- **Accessible by default** — accessibility is not a layer added at the end. Color contrast, keyboard navigation, and screen reader support are built in from the first line of code, not retrofitted. If a component cannot be used with a keyboard alone, it is not finished.
- **Motion with purpose** — every animation must earn its place. A transition that orients the user or confirms an action is welcome. A transition that exists because it looks nice is noise.
- **Lively, not static** — a well-built interface feels alive. Every hover, focus change, and state transition should respond with a visible but subtle cue. A UI that doesn't react to the user reads as broken. Micro-animations on interactive elements are the baseline expectation, not a finishing touch.

---

## Motion

Animation should feel natural, not performative. The goal is to smooth transitions and orient the user — not to entertain them.

### Principles

- **Purposeful** — animate to show state change, hierarchy, or navigation direction. Never animate for its own sake.
- **Subtle** — short durations, gentle easing. If an animation draws attention to itself, it is too much.
- **Present** — every interactive element must respond to hover, focus, and state changes with a visible animation. A color fade on hover, a ring on focus, a slide on active state — whatever fits the element. The UI should feel reactive at all times. Stillness reads as inert.
- **Respectful** — always honor `prefers-reduced-motion`. All animations are wrapped in a reduced-motion check.

### Durations

| Token              | Value  | Use case                                      |
|--------------------|--------|-----------------------------------------------|
| `--duration-fast`  | 150ms  | Micro-interactions: hover, focus ring, toggle |
| `--duration-base`  | 200ms  | Page transitions, modals, dropdowns           |
| `--duration-slow`  | 300ms  | Complex entry animations, large surface moves |

Default to `--duration-fast` for component-level transitions. Use `--duration-base` for anything that involves layout change or navigation.

### Easing

| Token              | Curve                        | Use case                    |
|--------------------|------------------------------|-----------------------------|
| `--ease-standard`  | cubic-bezier(0.2, 0, 0, 1)   | General transitions         |
| `--ease-enter`     | cubic-bezier(0, 0, 0.2, 1)   | Elements entering the screen |
| `--ease-exit`      | cubic-bezier(0.4, 0, 1, 1)   | Elements leaving the screen  |

### Page Transitions

Pages fade out and fade in using the CSS View Transitions API (`@view-transition { navigation: auto }`). This is configured globally in `globals.css` — no per-page code needed.

The transition uses `--duration-base` (200ms) with `--ease-exit` on the outgoing page and `--ease-enter` on the incoming page.

Do not add page-level entry animations that duplicate or conflict with the view transition. The fade handles it.

### Component Transitions

Use `transition-all duration-[var(--duration-fast)]` as the default for interactive components. The `Button` and `Input` components already implement this pattern — follow it for new components.

### Overlay and Popup Animations

Popups, modals, dropdowns, and tooltips should animate in and out — never appear and disappear instantly. The standard pattern:

- **Enter**: fade in + subtle scale up (`opacity-0 scale-95` → `opacity-100 scale-100`) using `--ease-enter` at `--duration-base`
- **Exit**: fade out + subtle scale down (`opacity-100 scale-100` → `opacity-0 scale-95`) using `--ease-exit` at `--duration-fast`

Keep scale transforms tight (0.95–1.0 range). Larger scale swings feel cartoonish. The animation should make the overlay feel like it arrived, not like it teleported.

---

## Color

Color is used to communicate, not to decorate.

- **Brand color** (`bg-brand`) is reserved for the single primary action on a screen. Do not use it for decorative elements or secondary actions.
- **Danger color** (`bg-danger`) is reserved for destructive or irreversible actions. Using it for anything else erodes its meaning.
- **Surface and text tokens** handle all neutral UI. Do not reach for Tailwind's built-in zinc/gray palette — use the surface and text tokens, which respond to dark mode automatically.
- **Never hardcode hex values or Tailwind palette classes** in components. Always use tokens. See `.github/rules/tokens.md`.

---

## Spacing

Spacing follows Tailwind's default 4px base unit. Prefer spacing values from the scale (1, 2, 3, 4, 6, 8, 10, 12, 16) over arbitrary values.

- Use consistent internal padding within a component family — all form elements should share the same horizontal padding.
- Increase spacing to create hierarchy, not font size alone.

---

## Typography

- Body text: `text-sm` (14px) for dense UI, `text-base` (16px) for reading contexts.
- Labels: `text-sm font-medium` — never bold for regular labels.
- Use `tracking-tight` on buttons and headings. Leave body text at default tracking.
- Do not use more than two font weights on a single surface.

---

## Accessibility

Accessibility is the baseline, not the bonus. Every component must be fully operable without a mouse. See `src/patterns/accessibility.md` for the complete reference.

### Color Contrast

Minimum contrast ratios are non-negotiable:

| Text type                        | Minimum ratio | WCAG level |
|----------------------------------|---------------|------------|
| Body text (< 18px or non-bold)   | 4.5:1         | AA         |
| Large text (≥ 18px or 14px bold) | 3:1           | AA         |
| UI components and icons          | 3:1           | AA         |
| Focus rings                      | 3:1 against adjacent colors | AA |

Design tokens are pre-validated for contrast in both light and dark mode. Never substitute a token with a hardcoded value without verifying contrast.

### Keyboard Navigation

Every interactive component must be fully operable by keyboard alone:

- **Tab / Shift+Tab** — moves focus between interactive elements
- **Enter / Space** — activates buttons, toggles, and links
- **Arrow keys** — navigates within composite widgets (menus, listboxes, radio groups, sliders)
- **Escape** — dismisses overlays, cancels operations, closes popups
- **Home / End** — jumps to first or last item within a composite widget

Focus order must follow DOM order. Do not reorder focus with `tabindex` values above 0.

### Overlays and Popups

Popups, modals, drawers, dropdowns, and menus have strict accessibility requirements. See `src/patterns/accessibility.md` for the full spec. The short version:

- When an overlay opens, focus moves inside it immediately
- Focus is trapped within the overlay while it is open — Tab and Shift+Tab cycle within it, not through the page behind
- Escape always closes the overlay and returns focus to the trigger
- When the overlay closes, focus returns to the element that opened it
- Menu-type overlays (list of options) support arrow key navigation, Home/End, and typeahead search

### Other Rules

- Color is never the only means of communicating state — pair it with a label, icon, or border change
- All motion respects `prefers-reduced-motion`
- Every interactive element requires an accessible name — use visible labels, `aria-label`, or `aria-labelledby`
- Decorative icons are `aria-hidden="true"`; meaningful icons need an accessible label
