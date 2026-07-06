# Rule: Docs Site

Apply this rule when working on any file under `app/`, including `app/_docs/`.

## Overview

The docs site is a Next.js app that lives alongside the component library. It replaces Storybook as the primary showcase. It is built with DaFink UI components — no external component libraries.

## Route Structure

```
app/
├── layout.tsx                        # Root layout: font, dark mode flash-prevention script
├── page.tsx                          # Home page
├── globals.css                       # Design tokens — already exists, do not modify
├── _docs/                            # Private folder (not routable): registry + shared docs components
│   ├── registry/
│   │   ├── index.ts                  # Component registry (ComponentEntry[])
│   │   ├── componentExamples.tsx     # Data-driven "Examples" sections (one entry per sub-example), keyed by component slug
│   │   ├── extraSections.tsx         # Data-driven variant/interactive sections, keyed by component slug
│   │   ├── blocks.ts                 # Block registry (BlockEntry[])
│   │   ├── blockCategories.ts        # Block category order
│   │   ├── blockPreviews.tsx         # Live preview per block, keyed by block slug
│   │   └── changelog.ts              # Release history (ChangelogEntry[]) — generated, see `npm run build-changelog`
│   └── components/                   # Shared docs components (sidebar, code block, live preview, …)
└── (docs)/                           # Route group — no URL prefix
    ├── layout.tsx                    # Docs shell: sidebar + main content area
    ├── installation/
    │   └── page.tsx                  # How to install (placeholder — content TBD)
    ├── changelog/
    │   └── page.tsx                  # Package release history
    ├── components/
    │   └── [slug]/
    │       └── page.tsx              # Component detail page
    └── blocks/
        ├── page.tsx                  # Blocks gallery page
        └── [slug]/
            └── page.tsx              # Block detail page
```

## Light & Dark Mode

Dark mode is class-based (`.dark` on `<html>`). The active mode is stored in both `localStorage` (key `theme`) and a `theme` cookie, kept in sync.

**Flash prevention**: the root layout (`app/layout.tsx`) is an `async` Server Component that reads the `theme` cookie via `next/headers` `cookies()` and conditionally adds `dark` to the `<html>` `className` before the first paint — no inline bootstrap `<script>` is needed because the server already knows the mode.

`DarkModeToggle` (`app/_docs/components/DocsSidebar.tsx`'s sibling, `app/_docs/components/DarkModeToggle.tsx`) is the single source of truth for toggling: on mount it reconciles `localStorage`/system preference with the DOM class and writes the cookie so the next SSR render matches; on click it flips the `.dark` class, `localStorage`, and the cookie together. It must be a `'use client'` component. No ThemeProvider or context — direct DOM manipulation only. It is rendered in `TopNav` (always visible) and again on the Theme page as a live demo — both are the same real component, not a reimplementation.

## Sidebar

- `DocsSidebar` is a **Client Component** (`'use client'`) — it calls `usePathname()` directly to decide which item list to expand, and receives `collapsed`/`onCollapsedChange` from `DocsShell`'s collapse state.
- `DocsSidebarLink` is also a **Client Component** — it uses `usePathname()` to apply active styles, and forwards an optional `icon` to `SidebarLink`
- Sidebar's top-level links: Home, Installation, Theme, Typography, Examples, MCP Server, Design Skill — each a plain nav item with a matching icon from `app/_docs/components/NavIcons.tsx`. There is no standalone "Blocks" top-level link — Blocks is reached via "All Blocks" below. "Theme" is a single page (`/theme`) covering the color-palette system, the surface-style system, and light/dark mode together — there is no separate "Styles" page.
- Below a `SidebarDivider`, two links are **always visible**, regardless of route: "All Components" (`/components`) and "All Blocks" (`/blocks`), Components first. Only the *item list underneath each* is route-conditional:
  - On `/components` or `/components/*`: the full category tree renders under "All Components" (`CATEGORIES` from `app/_docs/registry/categories.ts`, one `SidebarSection` per category, matching registry `category` fields exactly).
  - On `/blocks` or `/blocks/*`: a flat list of every block renders under "All Blocks" — no category grouping (only the `/blocks` gallery page itself groups by category; the sidebar list intentionally doesn't, since the block count doesn't warrant it).
  - On every other route, both links show with nothing expanded beneath them.
- Sidebar is `collapsible` (`togglePosition="top"`) and full viewport height (`h-screen`, `top-0`) on desktop (`md:` and up), hidden below `md:`. `DocsShell` lifts the collapsed state so `TopNav` and the main content margin shift in sync. On mobile, navigation lives in `MobileNav` — a hamburger button in the `TopNav` that opens the library's `Drawer` (side `left`) with the same links and the same always-visible-link/conditional-list behavior. The drawer closes on route change and follows the standard overlay accessibility contract

## Component Registry

All component metadata lives in `app/_docs/registry/index.ts`. Each entry is typed as `ComponentEntry`:

```ts
export interface ComponentEntry {
  slug: string;                    // URL segment, e.g. "button"
  name: string;                    // Display name, e.g. "Button"
  category: string;                // One of the sidebar categories
  description: string;             // One paragraph description
  usage: string;                   // Complete, runnable code example (the string shown in CodeBlock)
  props: PropRow[];                // Drives the PropsTable
  dependencies?: string[];         // npm packages this component requires, e.g. ["date-fns"]
  registryDependencies?: string[]; // Other components from this registry it requires, e.g. ["button"]
  files: string[];                 // Source files to copy, relative to src/components/, e.g. ["Button/Button.tsx"]
}

export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
}
```

`generateStaticParams` in the `[slug]` page imports and maps over this registry.

### How Dependencies Work

The `dependencies` and `registryDependencies` fields power the CLI installer. When a user runs `npx @dafink/ui add modal`:

1. The CLI reads the `modal` registry entry
2. It installs any `dependencies` as npm packages (`npm install date-fns` etc.)
3. It resolves `registryDependencies` transitively — if Modal depends on Button, and Button has no further registry deps, both are copied into the user's project
4. It copies all `files` into the user's `components/ui/` directory

This means a component author must correctly declare all dependencies at registration time. Missing a registry dependency means users get broken imports. Missing an npm dependency means users get a runtime error.

## Component Detail Page

Each page (`app/(docs)/components/[slug]/page.tsx`) renders these sections, in this order:

1. **Header** — component name (`text-3xl font-semibold tracking-tight text-text`) + description (`text-base text-text-muted leading-relaxed`)
2. **Installation** — `npx @dafink/ui add {slug}` in a `CodeBlock`; if the component has `registryDependencies`, list them as "Also installs: Button, Icon" below the command; if it has npm `dependencies`, list them as "Requires: …" in inline `font-mono text-xs` code
3. **Demo / Demos** — one `<h2>` heading, always rendered (never "Preview" as its own heading, never "Examples" as its own heading, and there is no separate "Usage" heading — those three concepts were merged into this single section). It is a list with **at least one element**: the primary live render, wrapped in `CodeBlock variant='example'` with `code={entry.usage}` — so the primary item's own Preview↔Code toggle is what shows its usage code; nothing else duplicates it. If the slug has entries in `componentExamples`, they render underneath, separated by a top border, each with its own title/description/`CodeBlock variant='example'` Preview↔Code toggle — see Examples Guidelines below. **Heading text**: singular **"Demo"** when the list has exactly one item (no `componentExamples` entries for this slug), plural **"Demos"** when it has more than one. **Rule**: no page may have a bare "Preview", "Examples", or "Usage" `<h2>` — always "Demo"/"Demos". The Preview/Code toggle *inside* a `CodeBlock variant='example'` keeps the word "Preview" as its tab label — that is a different, unrelated piece of UI text and is not renamed by this rule.
4. **Composition (optional, per component)** — only rendered for compound components with a registered `composition`
5. **Extra sections (optional, per component)** — variant demos and interactive examples that aren't a simple list of named examples (e.g. Timeline "Horizontal variant" / "Interactive example", Workflow Builder "Examples")
6. **Props** — `PropsTable` from the registry `props` field

### Section Format

Every section after the header follows the same structure — match it exactly when adding sections:

- Wrapper: `<section className='flex flex-col gap-3'>`; sections are spaced by the page-level `flex flex-col gap-10`
- Heading: `<h2 className='text-sm font-semibold text-text uppercase tracking-wide'>` — sentence case in source ("Horizontal variant"); the uppercase rendering comes from CSS, never type headings in caps
- Optional one-paragraph intro: `text-sm text-text-muted`; inline prop/code references use `<code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>`
- Demos always go inside `ComponentPreview`; standalone demo components live in `app/_docs/components/examples/`

### Examples Guidelines

Add entries to `componentExamples` (not Extra Sections) when a component has several sub-variants or sub-components that each deserve their own labeled preview + runnable code snippet, appended to the same "Demos" heading — this replaces one-off bespoke showcase components.

- **Data-driven, not hardcoded**: register examples in `app/_docs/registry/componentExamples.tsx` as `componentExamples[slug]: ComponentExample[]` (`id`, `title`, optional `description`, `usage`, `preview`). The `[slug]/page.tsx` template renders `componentExamples[slug] ?? []` generically inside the Demos section — adding examples for a component means adding an entry to that map, never touching the page template
- Each example renders as: title (`font-mono`) + optional muted description + `CodeBlock variant='example'` (`label={id}`, `code={usage}`, `minHeight='120px'`, `align='start'`) wrapping the live `preview`
- `usage` must follow the "Usage Code and Preview Must Align" rule below — the code string must reproduce exactly what `preview` renders
- Unlike the primary demo's `entry.usage` (which keeps its `import` line(s)), an example's `usage` string omits them — start directly at `export default function Example() { ... }`
- Nothing extra renders when `componentExamples[slug]` is absent or empty — the Demo heading still renders (it always does, for the primary preview, singular "Demo" in this case), it just has no additional examples underneath

### Extra Section Guidelines

- A variant section = heading + one-line prose explaining the prop that enables it + a `ComponentPreview` demo
- An interactive example section = heading + one-line prose stating what to do and what to expect + a `ComponentPreview` demo
- Demos must follow the "Usage Code and Preview Must Align" rule below if their code is shown anywhere
- **Data-driven, not hardcoded**: extra sections are never `{slug === 'x' && ...}` conditionals in `page.tsx`. Register them in `app/_docs/registry/extraSections.tsx` as `extraSections[slug]: ExtraSection[]` (`heading`, optional `description`, `demo`). The `[slug]/page.tsx` template loops over `extraSections[slug] ?? []` generically — adding a new variant/interactive section for a component means adding an entry to that map, never touching the page template
- Use Extra Sections (not Examples) for demos that aren't simply "one example per sub-component" — e.g. a single named variant demo or an interactive scripted example

**Next.js 16 note**: `params` is a `Promise` — always destructure with `await`:

```tsx
export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> })
{
  const { slug } = await params;
  // ...
}
```

## Block Registry

Blocks are prebuilt, opinionated compositions (dashboards, auth flows, forms, pricing tables, and similar) meant to be copied and adapted, not used as-is — see `src/patterns/design.md` for when to reach for a block vs a component. They live in `src/blocks/{BlockName}/{BlockName}.tsx`, mirroring `src/components/` but lighter: no `.test.tsx` or `spec.md` requirement, and no configurable props (a block is edited directly after copying, not parameterized). See `rules/new-block.md` for the full authoring rule.

Three registry files in `app/_docs/registry/` drive the blocks pages, mirroring the component registry pattern:

- **`blockCategories.ts`** — `BLOCK_CATEGORIES` — canonical category order for the gallery.
- **`blocks.ts`** — `BlockEntry[]`: `slug, name, category, description, usage, dependencies, registryDependencies, files`. No `props` field — blocks aren't parameterized.
- **`blockPreviews.tsx`** — `Record<slug, React.ReactNode>`, importing directly from `src/blocks/*` and rendering with no props. Because this renders the real installable file directly, the preview can never drift from what installing the block actually gives the user — unlike the component registry, where `usage` and `ComponentLivePreview.tsx` must still be kept in sync by hand.

`registryDependencies` on a block lists the *component* slugs it depends on (e.g. Dashboard depends on `card`, `data-table`, `charts`, …) — the CLI resolves these transitively when installing the block, so `npx @dafink/ui add dashboard` also pulls in every component it uses.

## Block Detail Page

Each page (`app/(docs)/blocks/[slug]/page.tsx`) renders:

1. **Header** — same as the component page (name + description)
2. **Installation** — same as the component page (install command, "Also installs" / "Requires" lines)
3. **Demo / Demos** — follows the same Demo/Demos convention as the component page (see "Component Detail Page" → point 3 above), via `blockExamples.tsx` mirroring `componentExamples.tsx`: the primary item is a single `<CodeBlock variant="example">` with the block's live render (`blockPreviews[slug]`) as `children` and `entry.usage` as `code`. Heading is singular **"Demo"** when `blockExamples[slug]` is empty/absent, plural **"Demos"** once it has entries. Extra examples render underneath, separated by a top border, each with its own title/description/`CodeBlock variant='example'` Preview/Code toggle — identical treatment to `componentExamples`, except a block example's `usage` string is the *complete* runnable source (`'use client'` header and imports included), not a trimmed snippet, since each example is its own standalone file rather than a sub-variant of a shared import context.
4. Register block example variants in `app/_docs/registry/blockExamples.tsx` as `blockExamples[slug]: BlockExample[]` (`id`, `title`, optional `description`, `usage`, `preview`). The variant's source component lives in its own `src/blocks/{Name}/{Name}.tsx` file but is **not** added to `blocks.ts`'s main `blocks` array or the sidebar/gallery listing — it's a variant surfaced only through the parent block's Demos section, the same relationship `componentExamples.skeleton` entries have to the Skeleton component.

No Props section — blocks have none. The gallery page (`app/(docs)/blocks/page.tsx`) mirrors `app/(docs)/components/page.tsx`'s category-grouped card grid.

## Themes and Styles

The docs site supports multiple built-in themes (color palette) and styles (surface treatment) that the user can switch between live, site-wide. Both axes are documented together on the single `/theme` page (see "Theme Page" below) and are orthogonal to light/dark mode — see "Light & Dark Mode" above.

### How It Works

Theme definitions live in `src/themes/`, one file per theme, each satisfying the `Theme` interface (`src/themes/types.ts`): `name`, `label`, `accent` (swatch hex), and `light`/`dark` token maps. Style definitions live in `src/styles/` and mirror this shape via the `Style` interface (`src/styles/types.ts`), covering the `SURFACE_TOKENS` contract (radius, border, shadow, blur, alpha) rather than color.

`TopNav` holds the active theme and style in state and applies each via a global `<style>` element injected into `<head>` (`#theme-override` / `#style-override`), writing both the `:root` and `.dark` variants so the override still respects the current dark/light mode:

```ts
styleEl.textContent = `:root {\n${lightVars}\n}\n.dark {\n${darkVars}\n}`;
```

Because components use token classes (`bg-brand`, `rounded-[var(--radius)]`, etc.) which resolve through these CSS custom properties, swapping the variables is enough to re-theme or re-style the entire site — no component changes needed. Selecting the default theme (`default`) or default style (`minimal`) removes the override element entirely rather than writing empty rules.

### Theme and Style Storage

The active theme is stored in `localStorage` under `design-system`; the active style under `design-style`. Both are applied in a `useEffect` on `TopNav` mount, reading the saved value and re-running the same apply function used on selection.

### Theme Page

`app/(docs)/theme/page.tsx` is a single merged page — there is no separate `/styles` route. It covers, in order: a live `DarkModeToggle` demo ("Light & dark mode"), the pre-built themes grid ("Color palettes", driven by `themes` from `@/src/themes`, each a color-only swap — radius/shadow/border come from the Style, not the Theme), the style cards (driven by `styles` from `@/src/styles`), how to apply a theme, how to author a custom theme, and the underlying CSS variable/token-build pipeline.

## Shared Docs Components

These live in `app/_docs/components/`:

| Component             | Type   | Purpose                                                             |
|-----------------------|--------|---------------------------------------------------------------------|
| `DocsShell`           | Client | Owns sidebar collapsed state; renders `TopNav`, `DocsSidebar`, main content, and `Footer` in sync |
| `DocsSidebar`         | Client | Sidebar shell — brand header, top-level links, route-conditional Components/Blocks lists, footer (Changelog, GitHub, npm) |
| `DocsSidebarLink`     | Client | Single sidebar link with active state via `usePathname()` and optional `icon`   |
| `DarkModeToggle`      | Client | Sun/moon icon button; toggles `.dark` class + localStorage + cookie. Rendered in `TopNav` and again on the Theme page |
| `CodeBlock`           | Server | `<pre><code>` with token background and horizontal scroll           |
| `PropsTable`          | Server | Renders a prop rows table from `PropRow[]`                          |
| `ComponentPreview`    | Client | Wrapper that centers/pads the live demo; horizontally scrollable with conditional focusability when content overflows |
| `MobileNav`           | Client | Hamburger + left `Drawer` with navigation links only; shown below `md:` |

## Styling Rules

- Use only token-derived Tailwind classes (see `rules/tokens.md`) — no hardcoded colors
- Docs-specific layout classes (`w-64`, `min-h-screen`, etc.) are fine as layout utilities
- `CodeBlock` background: `bg-surface-active`, text: `text-text`, font: `font-mono text-sm`
- Sidebar width: `w-56` expanded, `w-16` collapsed (default `collapsedWidth`) on desktop
- Main content max-width: `max-w-6xl`, centered with `mx-auto` in the space right of the sidebar (`Footer`'s inner wrapper matches so its content lines up with `<main>`)

## Responsive Rules

The docs site follows the "Responsive Design" section of `src/patterns/design.md` — mobile-first, no horizontal page scroll at any width ≥ 320px.

- Main content: `px-4 py-8` base, `md:px-8 md:py-10` — the wrapping div in `DocsShell` applies `md:ml-56` (or `md:ml-16` when the sidebar is collapsed) so it only exists at `md:` and up; always include `min-w-0` on the flex main so wide children scroll within their containers instead of widening the page
- Fixed-width demo content needs `max-w-full` so it shrinks inside `ComponentPreview` at narrow widths
- Wide content (tables, code, previews) scrolls inside its own container (`overflow-x-auto`); scrollable containers get conditional focusability (tabIndex 0 + `role="region"` + label + focus ring **only when actually overflowing** — see `CodeBlock`/`ComponentPreview` for the ResizeObserver pattern)
- Touch targets in docs chrome: 44px minimum below `md:` (`h-11 w-11 md:h-8 md:w-8` for icon buttons)
- The `MobileNav` drawer contains navigation links only — do not inject settings or pickers into it. Header controls that don't fit on phones are hidden below `sm:` if they are non-essential niceties (the design-system theme picker does this; the dark-mode toggle always stays). Never let the header wrap or overflow

## Usage Code and Preview Must Align

The registry `usage` field is the string shown in the code block on the detail page. The live preview renders the component with representative props directly. These two must be consistent:

- The component and props shown in the live preview must match what the `usage` code string imports and renders
- If the preview shows `<Input label="Email" />`, the usage string must also show `<Input label="Email" />` — not a different label, different variant, or different component altogether
- If a new prop is added, update both the preview render and the usage string

This rule exists because users copy from the usage code block and expect it to reproduce what they saw in the preview.

## What Not to Build

- No per-component versioning — components don't carry individual version numbers. The one exception is the package-level `/changelog` page (see below), which tracks releases of `@dafink/ui` as a whole
- No syntax highlighting library — plain `<pre><code>` only
- No MDX — all content is in the registry TypeScript file

## Changelog Page

`app/(docs)/changelog/page.tsx` renders release history for the `@dafink/ui` package, sourced from `app/_docs/registry/changelog.ts`.

- `changelog.ts` is **generated, not hand-written** — run `npm run build-changelog` (`scripts/build-changelog.mjs`) to regenerate it. The script reads git tags and conventional-commit messages (`feat`/`fix`/`refactor`/`perf`/`style`/`chore`/`docs`) between each tag and groups them into `Added` / `Fixed` / `Changed` / `Docs` sections; commits after the latest tag are grouped under an `Unreleased` entry. Re-run it whenever a new tag is cut
- Never hand-edit `changelog.ts` directly — edit commit messages/tags and regenerate instead, or the file will drift from git history
- Linked from the sidebar footer (`DocsSidebar.tsx`), alongside GitHub and npm
