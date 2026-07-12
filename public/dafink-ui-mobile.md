---
name: dafink-ui-mobile
description: >-
  Mobile web and responsive design guidance for DaFink UI. Covers touch
  target sizing against the repo's own WCAG 2.5.8 rule, viewport meta and
  safe-area handling, responsive breakpoints and @container patterns,
  choosing between Drawer, Modal, and SidePanel on small screens, adapting
  data-heavy components (Table, DataTable, Kanban, CommandPalette, Carousel)
  for touch, hover-only affordance pitfalls, performance and
  prefers-reduced-motion, mobile form input rules including the repo's
  16px-minimum-body-text rule, and common pitfalls when an AI agent builds
  mobile UI with this library. This is a companion to the main dafink-ui
  skill: for component API details use get_component_spec(), and for
  general layout/style/palette judgment use the primary dafink-ui-ux skill.
  Triggers: "make this responsive", "mobile layout", "touch target", "safe
  area", "mobile navigation", "swipe", "mobile form", "build for phone",
  "responsive breakpoints", "bottom sheet".
---

# DaFink UI: Mobile Development Skill

This skill covers mobile *web*: responsive layout, touch interaction, and
small-screen behavior for DaFink UI components running in a browser on a
phone or tablet. This library ships no native iOS/Android code and has no
React Native package; there is nothing here about native mobile development.
Everything below assumes a responsive Next.js/React web app viewed on a
touch device, not a native app shell.

This skill assumes DaFink UI is already installed. For component API
details, call `get_component_spec("<Name>")`. For style/palette/layout
judgment that isn't mobile-specific, see the `dafink-ui-ux` skill.

---

## 1. Touch Target Sizing

Two numbers matter here, and they are not the same number.

**The accessibility floor:** `src/patterns/accessibility.md` documents WCAG
2.2's 2.5.8 (Target Size Minimum, AA): every interactive target must be at
least 24×24 CSS pixels, OR have enough surrounding spacing that a 24px circle
centered on the target doesn't intersect another target or the viewport
edge. That file explicitly calls out the components to audit against this
rule: Checkbox/Radio (default 20px, passes only if the label extends the
clickable area), icon-only buttons, DataTable sort headers, and Carousel
dots.

**The design target:** `src/patterns/design.md` sets a higher bar for actual
touch comfort: minimum 44×44px on touch devices, with 24×24px called out
explicitly as "the absolute floor," not the goal. Build to 44px; treat 24px
as the line you must never cross, not the line you aim for.

Rules that follow from both documents:

- A visual element can be smaller than its tap target. Extend the hit area
  with padding, not by inflating the visual element itself. A `ghost`
  icon-only `Button` should look like a 20px icon but have a 44px click
  region around it.
- Adjacent touch targets need at least 8px of separation, or enough offset
  that a 44px circle centered on one target doesn't overlap its neighbor.
- Never shrink a target to fit more items in a row on mobile. Wrap to a new
  row, or collapse into a menu, instead.
- Audit `Carousel` dots (`CarouselDots`) and `DataTable` sort-header buttons
  specifically when building for touch: both are named risks in the
  accessibility pattern file.

---

## 2. Viewport, Safe Areas, and the Viewport Meta Tag

**Viewport meta tag.** `app/layout.tsx` in this repo does not currently
export a `viewport` object. Next.js 16 auto-generates the viewport meta tag
in that case (`width=device-width, initial-scale=1`), which is sufficient
for most pages. If a page needs edge-to-edge content on notched devices
(a full-bleed hero, a bottom `Drawer` that should sit flush against the
device's rounded corners), export a `viewport` object with `viewportFit`:

```tsx
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
```

`viewportFit: 'cover'` is what makes `env(safe-area-inset-*)` resolve to
real values instead of `0px` on notched devices; without it, the safe-area
environment variables are inert.

**Safe areas.** `src/patterns/design.md` already states the rule: "Fixed or
sticky chrome accounts for `env(safe-area-inset-*)` on notched devices."
This repo doesn't currently apply that CSS anywhere (no component or page
references `env(safe-area-inset-*)` yet), so treat it as a requirement to
add, not an existing pattern to copy. Apply it to anything that is `fixed`
or edge-flush:

- `MenuBar` is `fixed top-0 left-0 right-0` by default. Add
  `pt-[env(safe-area-inset-top)]` (or bake it into the component's own
  padding) so the bar's content doesn't sit under a notch or camera cutout.
- `Drawer` with `side="bottom"` or `side="top"` is edge-to-edge
  (`inset-x-0`, flush against the viewport edge per its own spec). Add
  `pb-[env(safe-area-inset-bottom)]` to `DrawerContent`/`DrawerFooter` for a
  bottom drawer so its footer buttons clear the home-indicator area on iOS.
- `Toast`'s fixed positioning layer should account for
  `env(safe-area-inset-bottom)` when positioned `bottom-*`, same reasoning.
- `SidePanel` and `side="left"/"right"` `Drawer` instances are already
  inset from the edge (`SidePanel` by 16px margin, side `Drawer`s by their
  own width) so they're lower risk, but still check the leading/trailing
  edge against `env(safe-area-inset-left/right)` in landscape orientation
  on notched devices.

---

## 3. Responsive Breakpoints and Layout Patterns

This repo has no `tailwind.config.js` and no `--breakpoint-*` overrides in
`app/globals.css`'s `@theme` block, so it runs on Tailwind v4's stock
breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.
Don't invent custom breakpoint tokens; there's no precedent for it here and
the default scale is already what every existing page and component
targets.

**Mobile-first, always.** The unprefixed class targets phones; breakpoints
layer enhancements on top of that, never the reverse.

```tsx
// Correct
<div className="flex flex-col md:flex-row gap-4">

// Wrong: desktop-first patching
<div className="flex flex-row max-md:flex-col gap-4">
```

**Page-level breakpoints** (from the primary skill's layout guidance, still
accurate here): `Sidebar` appears and multi-column grids activate at `md:`
(768px); wider containers and full desktop chrome land at `lg:` (1024px);
max-width containers (`max-w-7xl`) cap out at `xl:` (1280px). Below `md:`,
`Sidebar` should be hidden and navigation moved into a `Drawer` (see
Section 4).

**Two different kinds of breakpoint exist in this system, and they answer
different questions:**

- **Viewport breakpoints** (`md:`, `lg:`, `xl:`) answer "how big is the
  screen." Use them for page-level structural decisions: does the sidebar
  show, does the grid go to 2 columns or 4, does the top bar's hamburger
  disappear.
- **Container queries** (`@sm`, `@md`, ...) answer "how much room does this
  specific component have," independent of the viewport. `Card` establishes
  a `@container` context and `CardFooter` switches from stacked buttons to
  a row at `@sm` of the card's own width, not the viewport's. `DataTable`
  does the same on its root wrapper: its pagination footer stacks the
  "Showing X–Y of N" label above the Prev/Next controls below `@sm`
  (384px of the table's own rendered width) and goes to a single row at
  `@sm` and above. That's a real, already-shipped example of a component
  that's responsive to its container, not the phone.

On mobile, this distinction matters because a data-heavy component like
`DataTable` might be embedded in a narrow `SidePanel` or a `Drawer` even on
a wide desktop viewport; its `@container` query, not a `md:` class, is what
correctly stacks its footer in that case. Don't reach for a viewport
breakpoint to fix a layout problem that's actually about the component's
own container width.

**Spacing compresses on mobile; type mostly doesn't.** Container padding
should shrink (`px-4 md:px-8`), but body text (`text-sm`/`text-base`) stays
at its standard size on phones. Only display-scale headings step down
(`text-3xl md:text-5xl`); shrinking body copy on small screens is not an
acceptable way to fit more content.

---

## 4. Choosing the Right Overlay on Small Screens

This library ships three floating-layer components with genuinely different
contracts: `Modal`, `Drawer`, and `SidePanel`. On mobile, picking the wrong
one is the most common structural mistake.

| Situation | Use | Why |
|---|---|---|
| Confirmation, short blocking decision | `Modal` | Needs full attention; on mobile it should go full-width with margin rather than staying a small centered card |
| Navigation, filters, editing a record, action sheet | `Drawer` | Built on native `<dialog>.showModal()`: focus trap, scroll lock, and top-layer rendering all work with zero extra wiring |
| Non-blocking inspector, quick preview, "drill down" panel that shouldn't block the page | `SidePanel` | No backdrop, no scroll lock, no focus trap: the page stays scrollable underneath, which matters on mobile where blocking scroll on a small viewport feels heavier than on desktop |

**`side="bottom"` `Drawer` is the standard mobile action-sheet pattern in
this system.** `Drawer`'s spec explicitly lists `side="bottom"` for
"mobile-style sheets," and its `bottom`/`top` variant caps at `max-h-[85vh]`
with a `translate-y-full` hidden state, exactly the iOS/Android bottom-sheet
shape. Reach for it instead of a centered `Modal` whenever the trigger is a
mobile-context action (a row's overflow menu, a mobile-only "Filter" button)
and the content is a short list of options or a compact form. A centered
`Modal` on a narrow viewport still has to render a backdrop and a small
floating card, which reads as cramped; a bottom `Drawer` uses the full
width naturally.

**Prefer a full-screen or bottom `Drawer` over a centered `Modal` on mobile
whenever the content is longer than a couple of sentences.** `Modal` is
built for short, focused decisions; a form with several fields or a list of
options belongs in a `Drawer` even if it would be a `Modal` on desktop.
Swap based on viewport, not by using two different components: pass a
responsive `side` (`side="bottom"` below `md:`, `side="right"` at `md:` and
above) into the same `Drawer` rather than conditionally rendering `Modal` on
mobile and `Drawer` on desktop. Consistent accessibility contract, one code
path.

**`SidePanel`'s floating-card shape doesn't suit small phones.** Its
default width is `w-96` with `max-w-[calc(85vw_-_2rem)]` and it insets 16px
from every edge (`inset-y-4`, `right-4`, etc.). On a narrow phone that
`max-w` clamp still leaves very little breathing room around the card,
and the whole point of `SidePanel`, that the rest of the page stays visible
and clickable around it, is far less useful when the panel already
covers nearly the full width. Reach for `Drawer` on phone-sized viewports
for anything that would be a `SidePanel` on desktop; `SidePanel`'s
"floating card, page stays interactive" value proposition is a
tablet/desktop pattern.

**`Sidebar` collapses to a `Drawer`, it does not shrink to an icon rail, on
phone-sized viewports.** `Sidebar`'s own `collapsible` prop toggles between
`width` (default `w-56`) and `collapsedWidth` (default `w-16`); that's a
desktop icon-rail pattern, not a mobile one, `w-16` is still a persistent
fixed column eating screen width on a phone. Below `md:`, hide `Sidebar`
entirely and put its navigation content inside a `side="left"` `Drawer`
opened by a `ghost` icon `Button` placed in `MenuBarActions`. `MenuBar` itself
is a pure layout primitive (per its spec: "any accessibility requirements
for... menu buttons... are the responsibility of those inner components");
it does not ship a built-in hamburger, so that toggle button and its
`Drawer` wiring are the consumer's responsibility to compose.

---

## 5. Data-Heavy Components on Mobile

**Table vs DataTable.** Neither component collapses columns into
stacked "cards" on narrow viewports; both stay tabular and rely on
`overflow-x-auto` for horizontal scroll. `DataTable`'s root wrapper
explicitly documents this: "`overflow-x-auto` on the root wrapper handles
column overflow at any container width; horizontal scrolling kicks in
before columns collapse." Don't work against this by writing a custom
card-based mobile fallback unless the dataset genuinely needs it; for most admin
tables, horizontal scroll inside a bounded container is the expected
behavior. What does respond on mobile is `DataTable`'s pagination footer,
which stacks vertically below its own `@sm` container width (see Section
3). If a table has so many columns that horizontal scroll becomes
unusable on phones, reduce the column set conditionally (hide low-priority
`ColumnDef` entries below `md:`) rather than inventing a stacked-card
layout DataTable doesn't support.

**Kanban and touch dragging.** `Kanban` is built on `@dnd-kit/core` and
supports full keyboard dragging (Tab to focus, Space to pick up, arrows to
move, Space/Enter to drop) via dnd-kit's `KeyboardSensor`. For pointer
input, the board configures a single `PointerSensor` with
`activationConstraint: { distance: 5 }`, a 5px movement threshold before a
drag starts. That threshold is tuned for mouse precision, not touch: on a
touchscreen, a 5px movement is easy to trigger accidentally while trying to
scroll the column vertically, which can hijack a scroll gesture into a drag.
If `Kanban` needs to work well on a phone, this is a real gap to test
against, not a solved problem; dnd-kit's own `TouchSensor` with a `delay` +
`tolerance` activation constraint (press-and-hold before a drag starts,
rather than a plain distance threshold) is the standard fix, and it isn't
wired up here yet.

**CommandPalette on touch.** It opens as a centered modal with a search
input that receives focus immediately on open, which on a touch device
means the on-screen keyboard opens at the same time as the palette. That's
expected for a `⌘K`-style palette, but if it's triggered from a visible
mobile button rather than a keyboard shortcut, expect the keyboard to
consume roughly half the viewport height immediately; the palette's own
scrollable results list (wrapped in `ScrollFade`) needs to still be usable
in whatever space is left. There's no separate mobile layout for it; it
uses the same centered-dialog treatment at every viewport width.

**Carousel swipe/touch.** This one is genuinely built for touch. Per its
spec, `CarouselContent`'s track implements pointer-based drag-to-navigate
using native Pointer Events (`onPointerDown`/`onPointerMove`/`onPointerUp`),
so mouse, touch, and pen are handled uniformly with no separate touch code
path. A drag only activates past a 5px movement threshold (so taps on
interactive content inside a slide still register as taps), and releasing
past 20% of the track's width advances or retreats a slide using the same
logic as the button controls. It also sets `touch-action: pan-y` on the
track so vertical page scroll on a touch device is left alone; only
horizontal panning is captured. This is the one component in the list that
needs no additional mobile work.

---

## 6. Gesture and Touch Interaction Patterns; Avoiding Hover-Only Affordances

Touch devices have no hover state. Anything that only reveals itself on
`:hover` is invisible and unreachable on a phone. `src/patterns/design.md`
states this directly: "Hover is not available on touch. Anything revealed
on hover (tooltips, hover cards, secondary actions) must also be reachable
by tap or focus. Use `@media (hover: hover)` for hover-only affordances
rather than letting them dangle on touch devices."

Concretely, when composing pages with this library:

- Row-hover-revealed action buttons in a `Table`/`DataTable` row (e.g. a
  ghost "edit"/"delete" icon that only appears on `hover:opacity-100`) are
  invisible on touch. Either always show them at reduced opacity on
  touch/coarse-pointer contexts, or move the action into a persistent
  overflow menu instead of a hover reveal.
- `Tooltip` content shown purely via `:hover` needs a tap/focus path too.
  `Sidebar`'s own collapsed icon-only links already do this correctly: they
  wrap the icon in a `Tooltip` "shown on hover or keyboard focus," which
  means it's reachable via focus, not hover alone. Follow that pattern for
  any other hover-triggered tooltip.
- `Carousel`'s previous/next buttons don't rely on hover to appear; they're
  always visible controls plus the swipe gesture. That's the right model
  for touch: a persistent, always-visible affordance, not a hover reveal.
- When you do want a genuine desktop-only hover effect (a card lift, a
  subtle background change), gate it with the `hover: hover` media feature
  rather than the bare `hover:` Tailwind variant if the effect would look
  "stuck on" when a touch device fires a synthetic hover after tap.

**Drag gestures need a non-drag fallback.** `src/patterns/accessibility.md`'s
WCAG 2.2 section (2.5.7, Dragging Movements) requires any UI action that
needs dragging to also be achievable with a single tap/click or keyboard.
`Kanban` already satisfies this via `KeyboardSensor`; `Carousel`'s drag is
supplementary to its button and keyboard controls, not a replacement. Keep
that pattern for anything new: drag is always an enhancement on top of a
tap-based and keyboard-based path, never the only path.

---

## 7. Mobile Performance and `prefers-reduced-motion`

Mobile devices are more likely to be on battery, thermal-throttled, or
simply less powerful than the desktop this code was built on; motion and
paint cost more there.

`app/globals.css` already carries a strict, global reduced-motion rule that
applies everywhere in this system, not just on mobile:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1      !important;
    transition-duration:       0.01ms !important;
  }
}
```

Every animated component in this library (`Drawer`, `SidePanel`,
`CommandPalette`, `Reveal`, `TextShimmer`, `Typewriter`, `Carousel`,
overlay enter/exit transitions) is already built with `motion-safe:` or
equivalent gating so this global rule collapses their animation to
effectively instant when the user has reduced motion set. Do not add
per-component reduced-motion checks and do not bypass this rule; it is
already the correct behavior for every shipped component.

What's mobile-specific on top of that global rule:

- Respect the same rule for anything custom you add (parallax effects,
  scroll-linked transforms, custom `transition` classes on new markup);
  gate it the same way the existing components do, don't add a manual
  `matchMedia` check per instance.
- `Reveal`'s scroll-triggered entry animation is more likely to fire in
  rapid succession on mobile, where a user flicks through a long page fast.
  The primary skill's rule to cap Reveal at 2–3 sections per scroll and
  never use it above the fold applies with extra force on mobile, where
  scroll velocity is higher and janky staggered animations are more
  noticeable.
- Prefer `Skeleton` over `Spinner` for anything loading on mount, same rule
  as desktop, but doubly relevant on mobile where network conditions are
  more variable and a loading state is more likely to actually be visible
  for a meaningful duration.
- Avoid stacking multiple simultaneously-animating components (a
  `TextShimmer` heading plus a `CountUp` stat plus a `Reveal` section all
  firing on the same mobile viewport at once) purely for the visual noise
  reason the primary skill already states, which is more pronounced on a
  small screen where everything is close together.

---

## 8. Forms on Mobile

**16px minimum body text, hard floor.** This is already documented on the
docs site's typography page: "Must be legible at 16–20px with good line
spacing (~1.5)... Hard floor: 16px minimum. Below that, mobile browsers
auto-zoom on focus and disorient users." `src/patterns/design.md` states
the same rule for inputs specifically: "Inputs use a 16px font size minimum
on mobile. Smaller values trigger iOS auto-zoom on focus." In practice:
`text-sm` (14px) on an `Input` is only safe above the `sm:` breakpoint
(640px); use `text-base` (16px) on inputs that render on mobile, or apply
`text-base sm:text-sm` if the design wants a smaller field on desktop.

**Use the correct `type` for the on-screen keyboard.** `Input` spreads all
native props, so pass `type` to get the matching mobile keyboard: `email`
brings up the `@` key, `tel` brings up a numeric dialpad, `url` brings up
the `/` and `.com` row, `number` brings up digits. Don't default everything
to `type="text"`; the wrong keyboard is a real mobile-usability cost that
has no desktop equivalent.

**Set `autocomplete` on identity fields, not just for convenience.**
`src/patterns/accessibility.md`'s WCAG 2.2 section flags this as an
accessibility requirement, not a nicety: 1.3.5 (Identify Input Purpose)
requires identity inputs (name, email, phone, address) to carry the
correct `autocomplete` value, and 3.3.8 (Accessible Authentication)
requires autofill/autocomplete not be blocked on authentication forms. On
mobile this also directly enables the OS-level autofill sheet (saved
passwords, saved addresses, Face ID/Touch ID-backed credential fill),
which is the primary way many users complete forms on a phone at all. Use
the values already shown in the primary skill's form example:
`autocomplete="email"`, `autocomplete="new-password"`, and their
counterparts for name/phone/address fields.

**Use `inputMode` when `type` alone doesn't get the right keyboard.** For a
field that should stay `type="text"` semantically (e.g. a numeric ID that
shouldn't be treated as a `<input type="number">` spinner) but still wants
a numeric keypad, pass `inputMode="numeric"` alongside `type="text"`.
`inputMode="decimal"`, `"tel"`, `"email"`, `"url"`, and `"search"` cover
the other common mismatches between semantic type and desired keyboard.

**Never block paste.** `src/patterns/accessibility.md` (3.3.7, Redundant
Entry) requires that paste not be suppressed on any input, and specifically
calls out `OTPInput`: verify `onPaste` isn't blocked there. This matters
more on mobile, where a user copying a one-time code from a texts app or
password manager and pasting it is the dominant flow, not manual retyping.

**Password visibility toggle already exists.** `Input` with
`type="password"` automatically renders an eye-icon toggle button inside
the field (per its spec) that switches between hidden and visible text and
updates its `aria-label` accordingly. On mobile, where typing on a small
keyboard is more error-prone, this toggle is doing real work; don't
suppress or duplicate it.

**Multi-field forms still use `SkeletonForm` while data loads**, same as
desktop, but the layout-shift cost of skipping it is higher on mobile where
the viewport is short enough that a shift can push the field the user is
about to tap entirely off screen.

---

## 9. Common Pitfalls When an AI Agent Builds Mobile UI With This Library

| Pitfall | Correct approach |
|---|---|
| Shrinking a touch target below 24×24px to fit more UI on screen | 24×24px is the accessibility floor per WCAG 2.5.8; build to 44×44px per `src/patterns/design.md`, extend the hit area with padding instead |
| Using a centered `Modal` for a long form or option list on mobile | Use `Drawer` with `side="bottom"`; reserve `Modal` for short confirmations |
| Reaching for `SidePanel` on a phone-sized viewport | `SidePanel`'s "floating card, page stays interactive" value breaks down at narrow widths; use `Drawer` on phone, `SidePanel` on tablet/desktop |
| Collapsing `Sidebar` to `collapsedWidth` (icon rail) below `md:` | That's a desktop pattern; hide `Sidebar` entirely below `md:` and move its links into a `side="left"` `Drawer` triggered from `MenuBarActions` |
| Assuming `MenuBar` ships a built-in hamburger/mobile menu | It's a pure layout primitive per its own spec; the toggle button and its `Drawer` are the consumer's responsibility to compose |
| Building a custom stacked-card mobile fallback for `Table`/`DataTable` | Both rely on `overflow-x-auto` by design; reduce visible columns below `md:` instead of inventing a card layout the components don't support |
| Assuming `Kanban` drag works well on touch out of the box | Its `PointerSensor` uses a 5px distance-only activation constraint tuned for mouse input; a touch drag can hijack column scrolling. Test explicitly and consider a `TouchSensor` with `delay`/`tolerance` if targeting touch |
| Putting an interactive affordance behind `hover:` only | Touch has no hover; gate true desktop-only effects with `@media (hover: hover)` and give touch/keyboard users an always-visible or focus-reachable equivalent |
| Leaving `text-sm` (14px) on a mobile `Input` | 16px is the hard floor for body/input text; below it, iOS auto-zooms on focus. Use `text-base` on inputs that render on mobile |
| Skipping `type`/`autocomplete`/`inputMode` on form fields | These aren't cosmetic on mobile: they select the correct on-screen keyboard and enable OS-level autofill, and `autocomplete` on identity fields is a WCAG 2.2 requirement (1.3.5), not optional |
| Adding a manual `prefers-reduced-motion` check to a new animated element | `app/globals.css` already enforces this globally; gate new motion with the same `motion-safe:` pattern existing components use instead of a duplicate check |
| Not accounting for `env(safe-area-inset-*)` on fixed/edge-flush elements | `MenuBar` (`fixed top-0`), bottom `Drawer`, and the `Toast` layer all need safe-area padding on notched devices; requires exporting a `viewport` object with `viewportFit: 'cover'` first, since this repo doesn't currently export one |
| Fixing a component's internal layout with a viewport breakpoint (`md:`) | If the component establishes its own `@container` context (`Card`, `DataTable`), use a container query (`@sm`); the component may render inside a narrow `Drawer` or `SidePanel` on a wide viewport, where a viewport breakpoint would fire incorrectly |
