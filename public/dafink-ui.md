---
name: dafink-ui-ux
description: >-
  Holistic UI/UX design intelligence for DaFink UI. Covers how to compose
  components into layouts, when to choose each style (Minimal/Neumorph/
  Brutalist) and palette (Zinc/Ocean/Ember/Forest/Noir/Plum), when to use
  loading and animation effects (Skeleton, Spinner, TextShimmer, Typewriter,
  CountUp, Reveal), feedback hierarchy (Toast vs Alert vs Modal), button and
  action hierarchy, content hierarchy and spacing, and responsive design rules.
  This is design-judgment guidance, not component API reference — use
  get_component_spec() for prop tables. Triggers: "which style should I use",
  "how should I lay this out", "when should I use a skeleton", "pick a palette",
  "design a dashboard", "build a form page", "choose between modal and drawer",
  "compose components", "UI architecture", "design system guidance".
---

# DaFink UI — Design & UX Skill

This skill covers *design judgment*: how to combine components, which style and
palette to choose, when to use animations and loading effects, and how to
structure layouts. For component API details, call `get_component_spec("<Name>")`.

This skill assumes DaFink UI is already installed. If not, see the component
skill (`dafink-ui`) for installation and CLI instructions.

---

## 1. Choosing a Style

A style controls the physical feel of every surface — corner rounding, border
weight, shadow character, and depth. It is set once at the root and cascades to
all components. Three styles are available.

### Minimal (default)

**Character:** Flat, crisp, utility-first. Thin borders, small radii, very
light shadows. Surfaces feel clean and weightless.

**Tokens set:** `--radius 0.5rem`, `--border-width 1px`, shadow is a soft drop
shadow with low opacity. No inner shadow, no blur.

**Use when:**
- Building data-dense tools: dashboards, admin panels, analytics, CRMs.
- The UI needs to recede — content is the product, not the surface.
- You are unsure which style fits — Minimal is the safe default and works with
  every palette.
- The product will be used in long work sessions; heavy visual effects fatigue
  users over time.

**Avoid when:** The product needs a strong aesthetic identity and a flat look
feels underdeveloped. In that case, reach for Brutalist (strong) or Neumorph
(soft premium).

---

### Neumorph

**Character:** Soft, rounded, extruded surfaces. No visible borders — depth is
created entirely by bilateral shadow pairs (one dark, one light). Elements
appear pressed into or raised out of the background.

**Tokens set:** `--radius 1.25rem`, `--border-width 0px`, paired
`--shadow`/`--inner-shadow` values. The shadow depends on the background being a
near-neutral mid-tone — too dark or too saturated and the effect breaks.

**Use when:**
- Building consumer apps: health, wellness, meditation, music players, settings
  screens.
- The UI is light-theme-first and the user spends time in a calm context.
- Combined with Zinc or Noir, where the neutral surface color makes the
  bilateral shadow work correctly.

**Avoid when:**
- The app is primarily dark-mode (dark Neumorph reduces the soft-light effect
  dramatically — the white reflection component dims).
- Combined with highly chromatic palettes (Ocean, Ember, Forest, Plum) — the
  fixed white/black shadow components fight tinted backgrounds. Prefer Minimal
  with those palettes.
- The UI is data-dense; large-radius cards waste space and the borderless style
  makes table rows visually ambiguous.

---

### Brutalist

**Character:** Perfectly sharp edges (zero border-radius), heavy 2px borders,
hard offset shadows. Nothing is rounded; every surface has a definite boundary.

**Tokens set:** `--radius 0px` at all scales, `--border-width 2px`,
`--shadow` is a hard CSS offset (no blur) using `--shadow-color`.

**Use when:**
- Building marketing pages, landing pages, portfolio sites, editorial UIs.
- Making a deliberate stylistic statement — Brutalist reads as intentional, not
  accidental.
- Combined with Zinc (stark, journalistic) or Plum (dramatic, high-contrast).

**Avoid when:**
- Building data-dense UIs (tables, forms, dashboards) — the heavy borders
  create visual noise at density.
- Building apps users will use for hours at a stretch — the stark geometry is
  tiring over long sessions.
- Combined with Ember or Forest where the hard shadows fight the warm/organic
  color character.

---

## 2. Choosing a Palette

A palette sets the brand color and all neutral surface/text colors. It applies
via CSS custom properties and re-colors the entire UI without touching
components. Every palette ships a light and dark variant; dark mode resolves
automatically.

### Zinc (default)

**Brand:** Near-black (`#18181b` light / light-grey `#e8e8ea` dark). Surface
hover is a very light grey. Text is near-black.

**Character:** Neutral, professional, no chromatic bias. The most versatile
palette.

**Fits:** B2B tools, developer tools, admin panels, documentation sites,
anything that needs to feel serious and focused. A safe default when the brand
color hasn't been defined.

---

### Ocean

**Brand:** Sky blue (`#0284c7` light / `#38bdf8` dark). Surface hover is
blue-tinted (`#f0f9ff`). Text carries a deep blue hue (`#0c4a6e`).

**Character:** Energetic, fresh, productive. The whole UI has a cool blue cast.

**Fits:** SaaS products, productivity tools, task managers, cloud services,
anything that benefits from a tech-forward, approachable feeling.

**Note:** Light Ocean surfaces are distinctly blue-tinted — this is intentional
but may compete with data visualizations that use blue. If charts are a core
feature, confirm they don't blend with the palette.

---

### Ember

**Brand:** Warm orange (`#ea580c` light / `#fb923c` dark). Surface hover is
cream-orange (`#fff7ed`). Text is dark brown.

**Character:** Warm, energetic, inviting. The palette has a golden-hour feel
in light mode.

**Fits:** Creative tools, food/recipe apps, lifestyle products, social apps,
e-commerce with a warm brand. Pairs naturally with Minimal style (keeps the
warmth readable) or Brutalist (edgy contrast).

**Avoid Neumorph:** The orange-tinted surfaces fight the fixed white shadow
component.

---

### Forest

**Brand:** Emerald green (`#16a34a` light / `#4ade80` dark). Surface hover is
green-tinted (`#f0fdf4`). Text is dark forest green.

**Character:** Natural, calm, trustworthy. Light mode feels fresh and organic.

**Fits:** Health apps, sustainability platforms, environmental products, fitness
trackers, anything where green means "good" or "go."

**Avoid Neumorph:** Green-tinted surfaces undermine the neumorphic effect.

---

### Noir

**Brand:** Deep slate (`#1e293b` light / `#f1f5f9` dark). Surfaces are cool
grey with a blue-slate undertone (vs. Zinc's warmer neutrals).

**Character:** Cool, understated, editorial. Zinc with a slight blueish coolness
and a matte-paper surface tone.

**Fits:** Portfolio sites, photography, developer documentation, design tools,
any product where coolness and restraint are on-brand. In dark mode the brand
flips to near-white `#f1f5f9` — excellent for dark-first apps.

---

### Plum

**Brand:** Purple-violet (`#7c3aed` light / `#a78bfa` dark). Surface hover is
lavender-tinted (`#f5f3ff`). Text is deep indigo (`#2e1065`).

**Character:** Bold, creative, luxurious. The purple brand creates strong
hierarchy against neutral backgrounds.

**Fits:** Crypto products, creative studios, music platforms, luxury brands,
AI products, anything that should feel distinct and forward-thinking.

**Pairs well with Brutalist:** Hard edges + purple creates high-impact landing
pages. Also works with Minimal for a polished SaaS feel.

---

## 3. Style + Palette Combinations

Not every combination works equally well. Recommendations from highest to lowest
confidence:

| Style | Palette | Works because |
|-------|---------|---------------|
| Minimal | Zinc | Default; neutral and professional, works everywhere |
| Minimal | Ocean | Clean SaaS product feel |
| Minimal | Noir | Developer tools, documentation |
| Minimal | Plum | Polished AI/creative SaaS |
| Minimal | Ember | Warm creative tool |
| Minimal | Forest | Health/sustainability app |
| Neumorph | Zinc | Soft consumer UI; the neutral surface makes shadows work |
| Neumorph | Noir | Cool, premium; surfaces are slate-neutral which shadows handle well |
| Neumorph | Plum | Luxury feel; test in dark mode carefully |
| Brutalist | Zinc | Stark editorial; maximum contrast |
| Brutalist | Plum | High-impact landing page |
| Brutalist | Noir | Cool editorial/portfolio |
| Brutalist | Ember | Edgy, warm marketing pages |

**Avoid:** Neumorph + Ocean, Neumorph + Ember, Neumorph + Forest. The chromatic
tinting of those palettes' surfaces conflicts with the bilateral shadow that
Neumorph depends on.

---

## 4. Component Layout Patterns

### Page structure

```
┌─────────────────────────────────────┐
│  TopNav (or Sidebar for nav-heavy)  │
├──────────┬──────────────────────────┤
│ Sidebar  │  Main content area       │
│ (md:+)   │  (scrollable)            │
│          │                          │
└──────────┴──────────────────────────┘
│  Toast layer (fixed, pointer-none)  │
└─────────────────────────────────────┘
```

- Use `Sidebar` (fixed, collapsible) when the app has more than ~6 navigation
  destinations or nested navigation.
- Use `TopNav` when navigation is flat and shallow (≤5 items).
- Below `md:`, `Sidebar` hides; navigation moves to a `Drawer` (side `left`)
  opened by a hamburger in `TopNav`.
- The `Toast` layer sits at fixed position and is always last in the render tree.

### Card as the primary container

`Card` is the main content container. Almost all non-full-bleed content lives
inside a Card. Use the three-section structure for structured content:

```tsx
<Card>
  <CardHeader>
    <h2 className="text-base font-semibold text-text">Title</h2>
    <p className="text-sm text-text-muted">Supporting description.</p>
  </CardHeader>
  <CardContent>
    {/* main content */}
  </CardContent>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

`CardFooter` stacks actions vertically on narrow containers and rows them at
`@sm` — this is built-in; don't fight it with custom flex overrides.

**Card variants:**
- `default` — standard bordered card with subtle shadow. Use for most content.
- `elevated` — deeper shadow, no border. Use for modals-within-pages, popovers,
  or cards that need to float above surrounding content.
- `outline` — no background, just a border. Use for ghost containers, selection
  states, or when the parent already has a surface color.
- `interactive` — adds hover lift (`-translate-y-0.5`) and focus-visible ring.
  Use when the entire card is the clickable target (navigation cards, selection
  grids). Do **not** put interactive cards inside another interactive container.

### Forms

Standard form layout inside a Card:

```tsx
<Card className="max-w-md">
  <CardHeader>
    <h2 className="text-base font-semibold text-text">Create account</h2>
  </CardHeader>
  <CardContent>
    <Form>
      <Input label="Email" type="email" autocomplete="email" />
      <Input label="Password" type="password" autocomplete="new-password" />
    </Form>
  </CardContent>
  <CardFooter>
    <Button variant="primary" type="submit">Create account</Button>
  </CardFooter>
</Card>
```

For multi-field forms: use `SkeletonForm` while the initial form data loads
(e.g., an edit form fetching current values). Replace the skeleton with the
real `Form` once data is ready — no layout shift.

### Data display

- `Table` — static tabular data; no sorting, no pagination. Use for small,
  fixed datasets (5–20 rows). Composes directly in JSX with `TableHead`,
  `TableBody`, `TableRow`, `TableCell`.
- `DataTable` — interactive tables. Use when the user needs to sort columns,
  filter rows, or paginate through a large dataset. Comes with a built-in
  `Paginator`. Accepts a `columns` definition array and a `data` array.
- Rule: if the user might want to sort or search, use `DataTable`. If the
  dataset is truly static, `Table` is lighter.

Pair either with `SkeletonTableRow` stacked 3–5 times while data loads.

### Dashboards

Grid of Cards, each containing a Chart or CountUp stat:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  <Card>
    <CardContent>
      <p className="text-sm text-text-muted">Total revenue</p>
      <CountUp end={142500} prefix="$" className="text-2xl font-bold text-text" />
    </CardContent>
  </Card>
  {/* ... */}
</div>
<Card className="mt-4">
  <CardHeader><h3 className="text-sm font-semibold text-text">Revenue over time</h3></CardHeader>
  <CardContent>
    <AreaChart data={revenueData} />
  </CardContent>
</Card>
```

Use `SkeletonCard` in place of each dashboard card while data loads on mount.

### Kanban and Timeline

- `Kanban` — drag-and-drop column/card board. Uses dnd-kit; install with
  `npx @dafink/ui add kanban`. Ships as a separate entry point (`@dafink/ui/dnd`)
  to avoid pulling the dnd-kit bundle into projects that don't need it.
- `Timeline` — vertical event sequence. Use for activity logs, order history,
  deployment pipelines, onboarding progress.

---

## 5. Button and Action Hierarchy

Every screen should have at most **one primary action**. The hierarchy:

| Variant | Token | When to use |
|---------|-------|-------------|
| `primary` | `bg-brand` | The main submit / confirm action. One per view. |
| `secondary` | `bg-surface` + border | Supporting actions alongside primary (Cancel, Back). |
| `outlined` | `border-brand text-brand` | Less emphasis than primary; alternative CTAs. |
| `ghost` | `hover:bg-surface-hover` | Tertiary actions, icon buttons, toolbar items. |
| `link` | underline on hover | In-line navigation, "Learn more" text-style links. |
| `destructive` | `bg-danger` | Irreversible destructive actions (Delete, Revoke). One per view max. |

**Rules:**
- Never place two `primary` buttons on the same visible surface.
- Never use `primary` for Cancel — use `secondary` or `ghost`.
- Use `destructive` inside a confirmation `Modal` — never expose a destructive
  action without a confirmation step if the consequence is data loss.
- For icon-only buttons (toolbar, close buttons), use `ghost` with an
  `aria-label`. Never omit the label.

---

## 6. Feedback and Notification Hierarchy

Choose the right feedback component based on persistence and blocking behavior:

| Situation | Component | Why |
|-----------|-----------|-----|
| Action succeeded (save, copy, publish) | `Toast` variant `success` | Transient; disappears automatically |
| Action failed (network error, validation) | `Toast` variant `danger` + `Alert` danger inline | Toast for immediate notice; Alert for persistent context |
| Form-level error (multiple fields invalid) | `Alert` variant `danger` | Persistent; user must see it while fixing |
| Field-level error | `Input` / `Textarea` `error` prop | Closest to the problem |
| Non-blocking concern (approaching limit) | `Alert` variant `warning` | Persistent, non-dismissible |
| General info / tips | `Alert` variant `default` | Inline, non-alarming |
| Blocking confirmation (Delete, Publish) | `Modal` | Forces a decision before proceeding |
| Side-panel workflow (edit without leaving) | `Drawer` side `right` | Non-blocking; page stays visible |
| Navigation drawer (mobile) | `Drawer` side `left` | Standard mobile nav pattern |

**Toast guidelines:**
- Keep `title` to 3–5 words. Use `description` for detail, not the title.
- Use `action` sparingly — one obvious recovery step only (e.g., "Undo").
- Default `duration` (4000ms) is fine for success; extend to 6000ms for
  warnings that need more reading time.
- Position: `bottom-right` for desktop apps; `bottom-center` for mobile-first.
- Do **not** use Toast for errors that block the user's workflow — they auto-
  dismiss before the user can act on them. Use an inline Alert instead.

**Modal vs Drawer:**
- `Modal`: needs the user's full attention; blocks the page; has a backdrop.
  Use for confirmation dialogs, warnings, and short focused tasks.
- `Drawer`: side-panel workflow; the page remains partially visible. Use for
  editing a record, viewing detail, or any task that benefits from maintaining
  context. `side="right"` for detail/editing; `side="left"` for navigation;
  `side="bottom"` for mobile-style action sheets.
- Both require a focus trap and Escape-to-close. This is built into the
  components — do not suppress it.

---

## 7. Loading and Skeleton States

Show a skeleton whenever async data will take more than ~300ms to arrive.
Never render an empty container then snap in content — the layout shift is
disorienting.

### Which skeleton to use

| What's loading | Skeleton to use |
|----------------|-----------------|
| A text card with title + body | `SkeletonCard lines={3}` |
| A form being initialized (edit) | `SkeletonForm fields={n}` |
| A single form field | `SkeletonInput label` |
| Table body rows | Stack 3–5 `SkeletonTableRow columns={n}` |
| An image or media card | `SkeletonImage aspectRatio="16/9"` (default) |
| Avatar | `Skeleton width="40px" height="40px" className="rounded-full"` |
| Arbitrary shape | `Skeleton` with explicit `width` and `height` |

**Skeleton vs Spinner — the rule:**
- `Skeleton`: page-level or section-level loading (data arriving on mount or
  navigation). The layout is known; show its shape.
- `Spinner`: action-triggered loading (button click, form submit, file upload).
  The user initiated something; show that the system is responding.
- Never use `Spinner` for initial page load. Never use `Skeleton` on a button.

**Pattern for data-driven cards:**

```tsx
{isLoading
  ? <SkeletonCard lines={3} />
  : <Card>...</Card>
}
```

**Pattern for table bodies:**

```tsx
{isLoading
  ? Array.from({ length: 5 }, (_, i) => <SkeletonTableRow key={i} columns={4} />)
  : rows.map(row => <TableRow key={row.id}>...</TableRow>)
}
```

---

## 8. Animation and Motion Effects

DaFink UI ships several animated display components. Use them purposefully — one
animation effect per view is enough. Stacking multiple animated elements creates
visual noise.

### TextShimmer

A gradient shimmer that sweeps across text. Decorative — no interaction, no
semantic meaning.

**Use for:** Hero headings, loading labels ("Generating…"), brand statements on
marketing pages.

**Rules:**
- Maximum one `TextShimmer` per visible view.
- Use on display-scale text (headings, large labels). On body text it is too
  subtle to register.
- The shimmer duration defaults to a slow sweep — leave it at the default unless
  there's a strong reason to change it.

### Typewriter

Animates text character by character, with an optional blinking cursor.

**Use for:** Hero taglines on landing pages, onboarding welcome screens,
"AI is generating" streaming indicators, empty-state prompts.

**Rules:**
- Effective at one instance per screen. Two typewriters running simultaneously
  split attention without benefit.
- If used for AI generation states, chain `showCursor={streaming}` — show the
  cursor while generating, hide it when done.
- Pair with `delay` to let the page settle before the animation starts; a
  typewriter that fires instantly on mount feels rushed.

### CountUp

Animates a number from 0 to its target value on mount.

**Use for:** Dashboard metrics, stat tiles, landing page social proof numbers
("10,000+ customers").

**Rules:**
- Triggers on mount by default. Place it in a `Reveal` wrapper or behind an
  `IntersectionObserver` if the stat is below the fold, so it fires when the
  user sees it.
- Use `prefix` for currency (`"$"`) and `suffix` for units (`"k"`, `"%"`).
- Keep animation duration natural — the default is around 2s. Faster feels
  cheap; slower loses the effect.
- On a dashboard with multiple stats, they should all fire together (same mount
  timing), not stagger.

### Reveal

Wraps content with a scroll-triggered fade/slide entry animation.

**Use for:** Marketing page sections that animate in as the user scrolls.
Brings life to content that would otherwise just be static text.

**Rules:**
- Do **not** use Reveal on content above the fold (hero sections). The user
  should see the hero immediately.
- Do not chain more than 2–3 Reveal sections on a single scroll; past that,
  the pattern feels gimmicky.
- Trust the default animation — the standard fade+translate is designed for
  this system. Aggressive custom transforms fight the motion design language.
- All Reveal animations are suppressed by `globals.css` when
  `prefers-reduced-motion` is set. Do not add a manual check.

### Carousel

Multi-item scroll container with navigation.

**Use for:** Image galleries, feature highlights, testimonial sliders, media
browsing.

**Avoid for:** Primary navigation or any content that must all be visible
simultaneously. Carousels hide content — use them only when the hidden items are
genuinely supplementary.

### Progress

Linear progress bar for tasks with a known completion percentage.

**Use for:** File upload progress, multi-step forms (step 2 of 4), background
jobs with progress reporting.

**Do not use** for indeterminate loading (use `Spinner` instead) or as a
decorative stat bar (use `CountUp` for numbers).

---

## 9. Content Hierarchy and Typography

### Text levels

The system has three semantic text levels. Use them consistently:

| Level | Token | Use for |
|-------|-------|---------|
| Primary | `text-text` | Body content, input values, primary labels |
| Secondary | `text-text-muted` | Descriptions, supporting copy, captions |
| Tertiary | `text-text-subtle` | Timestamps, metadata, de-emphasized UI chrome |

Never reach for `text-zinc-500` or any palette class — always use tokens. They
adapt to dark mode and palette changes automatically.

### Scale

- Page titles: `text-2xl font-bold tracking-tight text-text` (step down to
  `text-xl` on mobile)
- Section headings (within cards): `text-base font-semibold text-text`
- Card sub-headings: `text-sm font-medium text-text`
- Body copy: `text-sm text-text` (dense UI) or `text-base text-text` (reading)
- Supporting descriptions (under headings): `text-sm text-text-muted`
- Captions, timestamps: `text-xs text-text-subtle`

**Rules:**
- Maximum two font weights on a single surface (e.g., `font-semibold` for
  headings, `font-normal` for body). Adding `font-bold` and `font-medium` on top
  creates noise.
- Use `tracking-tight` on headings and buttons only. Leave body text at default
  tracking.
- Inputs require a minimum 16px font size on mobile to prevent iOS auto-zoom on
  focus. `text-sm` (14px) is safe only above 640px; use `text-base` on mobile
  inputs if this is a concern.

---

## 10. Spacing and Layout

The system uses Tailwind's 4px base unit. Prefer these values:

| Gap / Padding | Value | When to use |
|---------------|-------|-------------|
| `gap-1` / `p-1` | 4px | Tight internal spacing (icon + label) |
| `gap-2` / `p-2` | 8px | Between closely related elements (badge groups, tag clouds) |
| `gap-3` / `p-3` | 12px | Form field internal spacing (label → input) |
| `gap-4` / `p-4` | 16px | Between form fields; card internal sections |
| `gap-6` / `p-6` | 24px | Between content sections within a card |
| `gap-8` / `p-8` | 32px | Between major page-level sections |
| `gap-12` / `p-12` | 48px | Between top-level page regions |

**Rules:**
- Increase spacing to express hierarchy, not font size alone.
- Consistent padding within a component family: all form inputs share the same
  horizontal padding, all CardHeader/CardContent sections use the same lateral
  padding (`px-4 md:px-6`).
- Container padding compresses on mobile (`px-4 md:px-8`). Content stays
  full-width; only the outer gutter shrinks.

---

## 11. Responsive Design

DaFink UI is **mobile-first**. The unprefixed style targets phones; breakpoints
layer enhancements up.

```tsx
// Correct — stacks on mobile, rows on md+
<div className="flex flex-col md:flex-row gap-4">

// Wrong — desktop-first patching
<div className="flex flex-row max-md:flex-col gap-4">
```

### Page layout breakpoints

| Breakpoint | What changes |
|------------|-------------|
| `md:` (768px) | Sidebar appears. TopNav hamburger disappears. Multi-column grids activate. |
| `lg:` (1024px) | Wider containers. Full desktop chrome visible. |
| `xl:` (1280px) | Max-width containers cap here (`max-w-7xl`). |

### Component-internal layout

Components use `@container` queries for internal layout — they respond to their
container's width, not the viewport. `Card` already establishes a container
context (`@container`). `CardFooter` switches from stacked to row at `@sm`
(the card's own width), not at a viewport breakpoint.

Prefer `@container` for component internals. Reserve viewport breakpoints for
page-level decisions (sidebar/nav visibility, grid column count).

### Touch targets

Every interactive element must be at least 44×44px on touch devices. Small
icon buttons and checkboxes extend their hit area via padding — the visual
element stays its designed size. Minimum 8px of separation between adjacent
targets.

### Overlays on mobile

Modals that appear as centered cards on desktop should go full-width (with a
horizontal margin) on narrow screens. Drawers can become bottom sheets on
mobile. The accessibility contract is the same at every size.

---

## 12. Color Usage Rules

These are the hardest constraints in the system:

1. **Brand is reserved for the single primary action.** One `bg-brand` button
   per screen. Do not use it on badges, highlights, charts, or decorative
   elements. Overusing brand color dilutes the call-to-action signal.

2. **Danger is reserved for destructive/irreversible actions.** One `bg-danger`
   button per screen, inside a confirmation flow. Do not use it for general
   errors that aren't actions — use `Alert variant="danger"` for those.

3. **Success, warning tokens are for status communication only.** Use
   `bg-success-bg` / `border-success-border` / `text-success` inside Alert and
   Badge, not for arbitrary green highlights.

4. **Never hardcode colors.** No hex values, no Tailwind palette classes
   (`bg-blue-600`, `text-zinc-500`). All colors must come from design tokens so
   they respond to palette swaps and dark mode.

5. **No `dark:` prefixes for color.** Tokens carry their own dark values. A
   component that uses `text-text` automatically renders the dark-mode text
   color when inside a `.dark` parent. `dark:` is only for properties that have
   no token (rare; add the token instead).

6. **Color is never the only signal.** Error states: red border + error message
   + icon. Success states: green color + checkmark label. Disabled states:
   reduced opacity + pointer-events-none + `aria-disabled`. Never rely on color
   alone.

---

## 13. Accessibility Non-Negotiables

These apply to every component and every page, without exception:

1. **Keyboard-navigable.** Tab reaches every interactive element; Enter/Space
   activates it. Arrow keys navigate composite widgets (menus, tabs, sliders).

2. **Visible focus indicator.** Baseline: `focus:outline-none
   focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring`.
   Never remove `focus-visible` without a direct visible replacement.

3. **Contrast.** Body text ≥ 4.5:1; large text and UI components ≥ 3:1.
   Design tokens are pre-validated. Never substitute a token with a hardcoded
   color without a contrast check (`scripts/check-contrast.ts`).

4. **Color is not the only signal.** See rule 6 in the color section above.

5. **All motion respects `prefers-reduced-motion`.** Handled globally in
   `globals.css` — this covers all Tailwind transitions, Reveal, TextShimmer,
   Typewriter, Carousel, and overlay animations. Do not add per-component
   reduced-motion checks or bypass the global rule.

**Overlay contract (Modal, Drawer, Dropdown, Popover, Combobox, Tooltip):**
- Focus moves into the overlay on open.
- Modals/Drawers trap focus (Tab cycles within); menus/dropdowns do not trap
  (Tab closes and moves on).
- Escape always closes and returns focus to the trigger.
- Backdrop click closes modals.
- These behaviors are built into the components — do not suppress them.

---

## 14. Common Pitfalls

| Pitfall | Correct approach |
|---------|-----------------|
| Two `primary` buttons on one surface | One primary; demote the other to `secondary` or `ghost` |
| Empty container before data arrives | Show `Skeleton` variants immediately; replace on data resolve |
| `Spinner` on initial page load | Use `Skeleton`; Spinner is for action-triggered loading only |
| `Toast` for blocking errors | Toast auto-dismisses; use inline `Alert` for errors the user must read |
| `Modal` for everything | `Drawer` for side-panel workflows; Modal only for focused blocking tasks |
| Hard-coding `text-zinc-900` | `text-text`; hard-coded values break dark mode and palette swaps |
| Neumorph + Ocean/Ember/Forest | The bilateral shadow depends on near-neutral surfaces; chromatic palettes break the effect |
| Multiple `TextShimmer` / `Typewriter` at once | One animated text effect per view |
| Removing `focus-visible` styles | Always replace with an equivalent visible indicator |
| `dark:` color prefixes on components | Tokens carry dark values; `dark:` is not needed and will diverge |
| Large-radius cards in data-dense layouts | Use Minimal style; Neumorph's 1.25rem radius wastes space in tables |
| Viewport breakpoints for component internals | Use `@container` queries; viewport breakpoints are for page layout only |
