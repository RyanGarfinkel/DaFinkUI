# src/components/

Reusable, prop-driven UI components. Each one is copied into consumer projects by `npx dafink-ui add <slug>`, so treat every file here as public API.

Before touching anything here, read `rules/new-component.md` (creating and updating), `rules/tokens.md` (any styling), and `rules/code.md`. Overlay components also need `src/patterns/accessibility.md`.

## Folder contract

```
ComponentName/
├── ComponentName.tsx        # default export + named exports for props and variant types
├── ComponentName.test.tsx   # Vitest + @testing-library/react
└── spec.md                  # source of truth for the MCP server
```

Folder name = component name, PascalCase. Sibling helper files are allowed only when listed in the registry entry's `files`.

## Every change touches more than the component

| You changed | Also update |
|---|---|
| A prop, variant, size, state, or a11y behavior | `spec.md`, `ComponentName.test.tsx`, and the docs page's Accessibility section (`extraSections[slug]` in `app/_docs/registry/extraSections.tsx`) |
| Anything the docs demo shows | `usage` in `app/_docs/registry/index.ts` (or `effects.ts`) **and** the `case` in `app/_docs/components/ComponentLivePreview.tsx`. Re-read both side by side, including sample data |
| An import of another component | `registryDependencies` in the registry entry |
| An import of an npm package | `dependencies` in the registry entry. Ask the user before adding a new package |
| A new file in the folder | `files` in the registry entry |
| A token or utility class | `app/globals.css` **and** `packages/cli/src/lib/css.ts` |

After registry edits run `npm run sync-registry`. Never hand-edit `packages/cli/src/lib/registry.ts`; it's generated.

## Things that bite here

- **Dead Tailwind utilities.** `bg-foo` only exists if `--color-foo` is declared inside `@theme {}`. Grep for it before using a color class.
- **Portals bubble through the React tree.** A `Modal`/`Popover`/`Tooltip`/`Drawer` rendered inside an element with `onClick` or dnd-kit `listeners` fires those handlers. Wrap the portaled child in `<div className="contents" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>`. `Kanban.tsx` is the reference case.
- **`'use client'` on shared data files** silently breaks Server Component consumers. Don't add it to a file that also exports plain data.
- **Overlays** (Modal, Drawer, Menu, Popover, Tooltip, Combobox, Select, CommandPalette): focus in on open, focus back to trigger on close, Escape closes, trap only for Modal/Dialog/Drawer. Document all of it in `spec.md`.
- **Every component needs a docs-page Accessibility section.** `extraSections[slug]` in `app/_docs/registry/extraSections.tsx` must have a `heading: 'Accessibility'` entry — it renders last on the page, after Props. `scripts/validate-components.mjs` enforces this in CI. See `rules/docs-site.md` and the `toggle-group` entry for the pattern (prose on the focus model + a `KeyboardShortcutsTable` for real keyboard interactions).
- **Composite widgets** (Tabs, ToggleGroup, Radio, Tree, MenuBar) use roving tabindex.
- **Motion** must respect `prefers-reduced-motion`; the global rule in `globals.css` covers CSS animation, but JS-driven motion (Magnetic, Tilt, Particles, Confetti, CursorTrail, and similar) needs its own check.
- **Bug found → failing test first**, then the fix.

## Components other code depends on

Blocks in `src/blocks/` import from here by relative path. Renaming an export, changing a default prop, or moving a file can break a block that has no tests of its own. Grep `src/blocks/` for the component name before making a breaking change.

## Adding a component

1. Read `rules/new-component.md` end to end.
2. Search this directory for something that already does the job. Extend before creating.
3. Run `npm run new:component -- Name --category <Category>`. It creates the three files, the registry entry, the live preview case, and the `src/index.ts` export. Then replace the placeholders and fill in the `TODO`s.
4. Run tests and `node scripts/validate-components.mjs`. If you change the generated structure, update the templates in `scripts/scaffold.mjs` too.
