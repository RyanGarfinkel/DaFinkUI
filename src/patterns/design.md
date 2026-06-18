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
- **Lively, not static** — a well-built interface feels alive. Every hover, focus change, and state transition should respond with a visible but subtle cue. A UI that doesn't react to the user reads as broken. Micro-animations on interactive elements are the baseline expectation.

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

## Responsive Design

Every surface in this system — components, docs pages, examples — must be usable on a phone. Responsiveness is not a desktop layout that shrinks; it is a mobile layout that grows.

### Mobile-First

Write base styles for the smallest screen, then layer enhancements upward with `min-width` breakpoints (`sm:`, `md:`, `lg:`). Never write desktop styles first and patch them down with `max-*` variants — that inverts the cascade and rots quickly.

- The unprefixed style is the mobile style. `flex-col md:flex-row`, not `flex-row max-md:flex-col`.
- Test at 360px before testing at 1440px. If it works small, growing is easy; the reverse is not.
- Content is never clipped or requires horizontal page scroll at any width ≥ 320px. Wide content (tables, code blocks) scrolls within its own container, not the page.

### Breakpoints

Use Tailwind's default scale. Do not invent custom breakpoints — pick the nearest standard one.

| Breakpoint | Width    | Typical role                                  |
|------------|----------|-----------------------------------------------|
| (none)     | 0+       | Phones — the default target                   |
| `sm:`      | 640px+   | Large phones, small tablets                   |
| `md:`      | 768px+   | Tablets — sidebars and multi-column layouts appear here |
| `lg:`      | 1024px+  | Laptops — full desktop chrome                 |
| `xl:`      | 1280px+  | Wide screens — max-width containers cap here  |

Breakpoints describe the viewport, not the component. A component dropped into a narrow sidebar on desktop still needs to work — **prefer container queries (`@container`) over viewport breakpoints for component-internal layout** (Card and DataTable already do this; follow that pattern). Reserve viewport breakpoints for page-level layout: navigation, sidebars, grids.

### Touch Targets

Pointer accuracy on touch is coarse. Small targets are an accessibility failure, not a style choice.

- **Minimum interactive target: 44×44px on touch devices.** WCAG 2.2 requires 24×24px (AA) as the absolute floor; 44px is the standard this system builds to.
- A visual element may be smaller than its target — extend the hit area with padding or a pseudo-element, never by inflating the visual.
- Adjacent touch targets need at least 8px of separation, or enough combined offset that a 44px circle centered on one does not overlap its neighbor.
- Hover is not available on touch. Anything revealed on hover (tooltips, hover cards, secondary actions) must also be reachable by tap or focus. Use `@media (hover: hover)` for hover-only affordances rather than letting them dangle on touch devices.

### Layout Rules

- **Navigation collapses, never crowds.** Horizontal nav that doesn't fit becomes a drawer or menu behind a visible, labeled toggle — it does not wrap or shrink into illegibility. Off-canvas navigation follows the overlay rules in `src/patterns/accessibility.md` (focus trap, Escape, focus return).
- **Multi-column becomes single-column.** Sidebars, split panes, and grids stack below `md:`. Order the stacked content by importance, which may differ from the desktop left-to-right order.
- **Spacing compresses, type mostly doesn't.** Reduce container padding on small screens (`px-4 md:px-8`), but keep body text at its standard size — small screens are not an excuse for small text. Only display-scale headings step down (`text-3xl md:text-5xl`).
- **Inputs use a 16px font size minimum on mobile.** Smaller values trigger iOS auto-zoom on focus, which disorients the user.
- **Respect safe areas.** Fixed or sticky chrome accounts for `env(safe-area-inset-*)` on notched devices.
- **Overlays adapt.** Modals that center as a card on desktop may take the full width (with margin) on phones; drawers may become bottom sheets. The accessibility contract is identical at every size.

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
