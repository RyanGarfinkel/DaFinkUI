# src/blocks/

Blocks are full, opinionated compositions of components (dashboards, auth flows, settings forms) that get **copied** into a consumer's project and then edited. They are not a prop-driven API. If you're adding `variant` or `size` to a block, it should be a component instead.

Before touching anything here, read `rules/new-block.md`, `rules/docs-site.md` → "Block Registry", and `rules/code.md`.

## Folder contract

```
BlockName/
└── BlockName.tsx      # 'use client'; named export + default export; no props
```

- No `.test.tsx` and no `spec.md`. The components a block composes are already tested and specced.
- Build only from `src/components/`. If something is missing, create the component first (`src/components/CLAUDE.md`), then use it here.
- Import components by relative path (`'../../components/Button/Button'`), matching existing blocks.
- Not exported from `src/index.ts`.
- Multi-file blocks (like `AiChat/`) are the exception, not the default. The top-level file still takes no props; sibling files may. Details in `rules/new-block.md` → "Multi-file blocks".

## Every change touches more than the block

| You changed | Also update |
|---|---|
| The block's source | `usage` in `app/_docs/registry/blocks.ts`. It's a hand-maintained copy and drifts silently |
| A component import | `registryDependencies` in `blocks.ts`. List components only, flat, across **all** sibling files |
| An npm import | `dependencies` in `blocks.ts`. Ask the user before adding a new package |
| A sibling file added or removed | `files` in `blocks.ts` |
| A new block | `blocks.ts`, `blockCategories.ts`, `blockPreviews.tsx` (renders the real file with no props) |

Then run `npm run sync-registry`.

## Generated copies: don't edit

`packages/cli/blocks/` is copied from this directory by `packages/cli/scripts/build-registry.mjs`, and `packages/cli/src/lib/blocksRegistry.ts` is generated from `blocks.ts`. Edit `src/blocks/` and `app/_docs/registry/blocks.ts` only, then sync. The `packages/cli/blocks/` diff should then match this directory.

## Things that bite here

- **A block that reimplements a component inline** is a bug. Extract it to `src/components/` first. `AiChat`'s tool-call trace and questionnaire became `ToolCallTrace` and `Questionnaire` this way.
- **Nested portals**: a `Modal` or `Popover` inside a clickable or draggable card fires the card's handlers (React bubbles through the component tree). Wrap it in a `className="contents"` div that stops click and pointerdown propagation. See `Kanban.tsx`.
- **Hardcoded runtime data**: sample data in blocks is fine because the file gets copied and edited, but real endpoints, keys, and IDs are not. `AiChat` talks to `app/api/ai-chat/route.ts`; keep environment-specific values out of the block file.
- **Docs demo wrappers** for prop-taking sibling files live in `app/_docs/components/examples/` and are docs-only, never in `files`.
- **Dead Tailwind utilities**: confirm any color class has a `--color-*` token inside `@theme {}` in `app/globals.css`.

## Adding a block

1. Read `rules/new-block.md` end to end.
2. Check `src/components/` for everything you need, and existing blocks for something to extend.
3. Run `npm run new:block -- Name --category <Category>`. It creates `BlockName/BlockName.tsx`, the `blocks.ts` entry, and the preview. Replace the placeholder source, then update `usage` and `registryDependencies` to match. A new category also needs `blockCategories.ts`.
4. Run lint (`npm run lint -- --fix` first) and `npm run sync-registry`. Ideally run the compiled CLI's `add <slug>` in a scratch project.
