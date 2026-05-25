# Rule: Docs Site

Apply this rule when working on any file under `app/` or `src/docs/`.

## Overview

The docs site is a Next.js app that lives alongside the component library. It replaces Storybook as the primary showcase. It is built with Obi UI components — no external component libraries.

## Route Structure

```
app/
├── layout.tsx                        # Root layout: font, dark mode flash-prevention script
├── page.tsx                          # Home page
├── globals.css                       # Design tokens — already exists, do not modify
└── (docs)/                           # Route group — no URL prefix
    ├── layout.tsx                    # Docs shell: sidebar + main content area
    ├── installation/
    │   └── page.tsx                  # How to install (placeholder — content TBD)
    └── components/
        └── [slug]/
            └── page.tsx              # Component detail page
```

## Dark Mode

Dark mode is class-based (`.dark` on `<html>`). Toggle is stored in `localStorage` under the key `theme`.

**Flash prevention**: the root layout must include an inline `<script>` that runs before paint:

```tsx
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
` }} />
```

The `ThemeToggle` button reads `document.documentElement.classList` to determine current state and toggles it, then writes to `localStorage`. It must be a `'use client'` component. No ThemeProvider or context — direct DOM manipulation only.

## Sidebar

- `DocsSidebar` is a **Server Component** — it receives the full component list and renders links
- `DocsSidebarLink` is a **Client Component** — it uses `usePathname()` to apply active styles
- Sidebar groups components by category: Actions, Inputs, Display, Navigation, Forms, Disclosure, Overlay, Feedback
- Sidebar also includes top-level links: Home, Installation
- Sidebar is fixed on desktop, hidden on mobile (mobile nav is out of scope)

## Component Registry

All component metadata lives in `src/docs/registry/index.ts`. Each entry is typed as `ComponentEntry`:

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

The `dependencies` and `registryDependencies` fields power the CLI installer. When a user runs `npx @obi/ui add modal`:

1. The CLI reads the `modal` registry entry
2. It installs any `dependencies` as npm packages (`npm install date-fns` etc.)
3. It resolves `registryDependencies` transitively — if Modal depends on Button, and Button has no further registry deps, both are copied into the user's project
4. It copies all `files` into the user's `components/ui/` directory

This means a component author must correctly declare all dependencies at registration time. Missing a registry dependency means users get broken imports. Missing an npm dependency means users get a runtime error.

## Component Detail Page

Each page (`app/(docs)/components/[slug]/page.tsx`) renders:

1. Component name + description
2. Install command — `npx @obi/ui add {slug}` in a `CodeBlock`; if the component has `registryDependencies`, list them as "Also installs: Button, Icon" below the command
3. Live preview — render the component with representative props
4. Usage code block (from registry `usage` field)
5. Props table (from registry `props` field)

**Next.js 16 note**: `params` is a `Promise` — always destructure with `await`:

```tsx
export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> })
{
  const { slug } = await params;
  // ...
}
```

## Themes and Design System Picker

The docs site supports multiple sample design systems that the user can switch between live. This is implemented via CSS custom property injection — the `DesignSystemPicker` writes theme token overrides onto a wrapper `div` around the component preview area.

### How It Works

Theme definitions live in `src/themes/`. Each theme is a flat object of CSS variable name → value pairs:

```ts
// src/themes/default.ts
export const defaultTheme = {
  '--color-brand': '#2563eb',
  '--color-brand-hover': '#1d4ed8',
  // ... other token overrides
};
```

The `DesignSystemPicker` is a **Client Component** that maintains the active theme in state and applies it:

```tsx
<div style={activeTheme as React.CSSProperties}>
  <ComponentPreview />
</div>
```

Because components use token classes (`bg-brand`, `text-text`, etc.) which resolve through CSS variables, swapping the variables on the wrapper is enough to re-theme the preview — no component changes needed.

### Theme Storage

The active theme selection is stored in `localStorage` under the key `design-system`. Apply it before paint (same flash-prevention pattern as dark mode) in the root layout script.

### Themes to Create

Start with three sample themes: `default`, `ocean` (cool blues and teals), and `warm` (ambers and earth tones). Each theme must define the full set of tokens — do not rely on cascade fallbacks.

## Shared Docs Components

These live in `src/docs/components/`:

| Component             | Type   | Purpose                                                             |
|-----------------------|--------|---------------------------------------------------------------------|
| `DocsSidebar`         | Server | Sidebar shell — renders category groups and `DocsSidebarLink` items |
| `DocsSidebarLink`     | Client | Single sidebar link with active state via `usePathname()`           |
| `ThemeToggle`         | Client | Sun/moon icon button; toggles `.dark` class + localStorage          |
| `DesignSystemPicker`  | Client | Dropdown/toggle that switches the active sample design system       |
| `CodeBlock`           | Server | `<pre><code>` with token background and horizontal scroll           |
| `PropsTable`          | Server | Renders a prop rows table from `PropRow[]`                          |
| `ComponentPreview`    | Server | Wrapper div that centers/pads the live component demo               |

## Styling Rules

- Use only token-derived Tailwind classes (see `rules/tokens.md`) — no hardcoded colors
- Docs-specific layout classes (`w-64`, `min-h-screen`, etc.) are fine as layout utilities
- `CodeBlock` background: `bg-surface-active`, text: `text-text`, font: `font-mono text-sm`
- Sidebar width: `w-56` on desktop
- Main content max-width: `max-w-3xl`

## What Not to Build

- No search
- No versioning
- No mobile nav (sidebar hidden on mobile is fine)
- No syntax highlighting library — plain `<pre><code>` only
- No MDX — all content is in the registry TypeScript file
