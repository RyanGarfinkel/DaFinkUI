<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This repo uses **Next.js 16.2.3**, which has breaking changes from versions in your training data. APIs, conventions, and file structure may differ significantly. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
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
| `rules/new-block.md`       | Any time a new UI block is being created or updated                       |
| `rules/docs-site.md`       | Any time you work on files under `app/` (including `app/_docs/`)          |
| `rules/commits.md`         | Before writing any commit message                                         |

## Pattern Files

Design and accessibility patterns are in `src/patterns/`. These are served via MCP and are the canonical source of truth; do not duplicate their content elsewhere.

| Pattern file                              | What it covers                                               |
|-------------------------------------------|--------------------------------------------------------------|
| `src/patterns/design.md`                  | Visual philosophy, motion, color, spacing, typography        |
| `src/patterns/accessibility.md`           | Contrast, keyboard nav, focus management, ARIA, overlay spec |
| `src/patterns/interactive-states.mdx`     | Hover / focus / focus-visible states; overlay focus patterns |

---

## Known Footguns: Read Before Touching These Areas

**Dead Tailwind utility classes (tokens/CSS).** Tailwind v4 only generates a named utility (`bg-foo`, `text-foo`, ...) from a `--color-foo` custom property declared inside `@theme { }`. A token declared only in `:root`/`.dark` is invisible to the utility generator, so the class silently compiles to nothing and the element renders with no background/text/border, letting whatever's behind it show through. No build error, no lint error. This has happened twice: `--color-surface-panel` was added to `:root` only (missed `@theme`), and `bg-input` was used in `DropdownMenu.tsx`/`Popover.tsx` with no `--color-input` token ever defined anywhere. Before using or adding a color utility class:
- Confirm the matching `--color-*` token actually exists inside an `@theme { }` block in `app/globals.css`; grep for it, don't assume.
- `packages/cli/src/lib/css.ts` (`generateCss()`) is a **second, independent copy** of the token system, shipped to consumers via `npx dafink-ui init`. Any token that needs `@theme` registration in `app/globals.css` needs the same dual `:root`/`@theme` treatment there too; check both files, not just one.
- `app/globals.css` also defines standalone utility classes consumed by vendored components (currently `.scrollbar-hover`, used by `Sidebar.tsx`). If a vendored component references a custom class, `packages/cli/src/lib/css.ts` must emit that class's CSS too, or it silently degrades for every consumer.

**Component/block registries are generated — never hand-edit the CLI copy.** `app/_docs/registry/index.ts` (`registry: ComponentEntry[]`) and `app/_docs/registry/blocks.ts` (`blocks: BlockEntry[]`) are the single source of truth for component/block metadata. `packages/cli/src/lib/registry.ts` (`REGISTRY`) and `packages/cli/src/lib/blocksRegistry.ts` (`BLOCKS_REGISTRY`) — what the published CLI actually reads at install time for `npx dafink-ui add <slug>` — are **generated from those docs registries** by `packages/cli/scripts/build-registry.mjs` (it transpiles the docs `.ts` files with the TypeScript compiler API, dynamically imports them, and maps `dependencies` → `deps`). Both generated files start with an `AUTO-GENERATED` header; if you're editing content past that header, stop, you're in the wrong file. This used to be two independently hand-maintained lists that drifted apart — one component was completely uninstallable via the CLI, `audioplayer` silently shipped without its required `button`/`slider` deps, and two blocks listed component deps their source didn't even import. Instead:
- Edit `app/_docs/registry/index.ts` / `blocks.ts` only. Run `npm run sync-registry` from the repo root (or `cd packages/cli && npm run build`) to regenerate the CLI files and confirm they compile.
- If a component/block genuinely needs to exist for CLI resolution (e.g. as a `registryDependencies` target) without its own docs gallery page, give it `hidden: true` in the docs registry rather than adding it directly to the generated CLI file — see the `charts` entry in `index.ts` for the pattern. `hidden` entries are excluded from the /components and /blocks gallery, sidebar, and search (via `visibleRegistry` / `blocks.filter(!hidden)`) but stay directly linkable and installable.
- Ideally, run the compiled CLI's `add <slug>` command against a scratch project to confirm the file copies and `npm install` step both work, rather than trusting the diff alone.

**`build-changelog.mjs` and shallow clones.** The script's try/catch only guards against `git` *throwing*. On Vercel's default shallow clone, `git tag` returns success with zero tags instead of throwing, which used to dump the entire commit history into one "Unreleased" bucket and overwrite the correct committed changelog on every deploy. The script now explicitly throws when `tags.length === 0` so the catch block's "fall back to the committed file" path actually triggers. Don't remove that check, and apply the same "did this git command silently return something degenerate, not just fail" scrutiny to any future prebuild step that shells out to `git`.

---

## Accessibility: Non-Negotiable

These five rules apply to every component, no exceptions:

1. **Every interactive element is keyboard-navigable.** Tab reaches it. Enter/Space activates it. If it cannot be reached and activated by keyboard alone, it is not done.
2. **Every interactive element has a visible focus indicator.** `focus-visible:ring-2 focus-visible:ring-offset-2` is the baseline. Never suppress focus-visible without a direct replacement.
3. **Color contrast.** Body text: 4.5:1 minimum. Large text and UI components: 3:1 minimum. Design tokens are contrast-checked by the CI gate at `scripts/check-contrast.ts`. Run it after any token change. Never substitute a hardcoded color without a contrast check.
4. **Color is not the only signal.** Any state communicated by color (error, success, disabled) must also be communicated by a label, icon, or border change.
5. **All animation respects `prefers-reduced-motion`.** `globals.css` now contains the following rule; do not bypass it:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

---

## Popup and Overlay Components: Required Behavior

Any component that opens a floating layer (Modal, Dialog, Drawer, Dropdown, Menu, Combobox, Popover, Tooltip) must implement all of the following. Full implementation guide: `src/patterns/accessibility.md`. Checklist and animation patterns: `rules/new-component.md`.

| Behavior | Modal / Dialog / Drawer | Menu / Dropdown / Popover |
|---|---|---|
| Focus on open | Move to first focusable element inside | Move to first focusable element inside |
| Focus trap | **Required**: Tab/Shift+Tab cycle within | Not trapped |
| Escape | Close, return focus to trigger | Close, return focus to trigger |
| Tab | Wraps within overlay | Closes overlay, moves to next page element |
| Arrow keys | N/A | ArrowDown/Up navigate items; Home/End jump to ends; wraps |
| Typeahead | N/A | Typing a char moves to next matching item |
| Enter/Space | Confirms / closes | Activates item, closes |
| Backdrop click | Closes (same as Escape) | Closes |
| Scroll lock | `overflow: hidden` on `<body>` | Not needed |
| `aria-modal` | `"true"` | Omit |
| Animation | Fade + scale 0.95→1.0 in, reverse out | Same |

Return focus to the trigger element on close, always, regardless of how it was closed.

---

## Memory & Design Learning

**Aggressive note-taking.** Capture new patterns, preferences, and decisions as they emerge; don't wait to be asked. When a new design convention is validated, a visual approach is confirmed, or a pattern is ruled out, save it to memory immediately.

**Evolving design philosophy.** The files in `src/patterns/` and `rules/` are living documents. When new visual or interaction principles emerge from working sessions, update them. Design thinking in this project should be current, not frozen.
