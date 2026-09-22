# Rule: New Block

Apply this rule whenever creating a new UI block in `src/blocks/`.

`src/blocks/CLAUDE.md` is the directory-level guide that Claude loads when working in that folder. It summarizes this rule plus the sync checklist. **Keep it current**: when this rule, the block registry workflow, or a block footgun changes, update `src/blocks/CLAUDE.md` in the same change.

## What a Block Is

A block is a full, opinionated composition of existing components (a dashboard, a login flow, a settings form) meant to give a fast starting point that gets copied in and then adapted. It is **not** a reusable, prop-driven API like a component. If you find yourself adding a `variant` or `size` prop to a block, it's drifting into being a component: stop and reconsider.

## Scaffolding

Start every new block with the generator:

```
npm run new:block -- PricingTable --category Marketing [--slug pricing-table] [--description "..."]
```

It creates `BlockName.tsx` (a minimal Card + Button composition to replace), the `blocks.ts` entry, and the `blockPreviews.tsx` entry, then runs `eslint --fix` and `npm run sync-registry`. Replace the placeholder source, then update `usage` and `registryDependencies` to match. Multi-file blocks still need their sibling files and `files` entries added by hand. The templates live in `scripts/scaffold.mjs`; **when this rule changes, update the templates in the same change.**

## Required File Structure

Every block lives in its own folder under `src/blocks/`. The folder name is PascalCase and matches the block name exactly.

```
src/blocks/BlockName/
└── BlockName.tsx        # The block
```

Unlike components (`rules/new-component.md`), a block does **not** require a `.test.tsx` or a `spec.md`. It composes components that are already tested and specced individually; the block itself has no stable prop API to test or document beyond its registry entry.

### Multi-file blocks

A block that's grown large enough to have a distinct, sizeable sub-piece — one that the top-level file renders repeatedly or that's substantial enough to reason about on its own — may split that piece into a sibling file in the same folder instead of keeping everything in one file:

```
src/blocks/AiChat/
├── AiChat.tsx          # Orchestrator; imports and renders the siblings below
├── ToolCallTrace.tsx   # Sub-piece, prop-driven, used by AiChat.tsx
└── QuestionCard.tsx    # Sub-piece, prop-driven, used by AiChat.tsx
```

This is the one place a block is allowed to take props: a sibling file exists specifically to be imported and reused *within its own folder*, so unlike the top-level block file, it does have a real API worth stabilizing (e.g. `ToolCallTrace({ toolCalls })`, `QuestionCard({ step, answer, onAnswer })`). The top-level block file (`AiChat.tsx`) still takes no props itself.

- List every sibling file in the registry entry's `files` array (`files: ['AiChat/AiChat.tsx', 'AiChat/ToolCallTrace.tsx', 'AiChat/QuestionCard.tsx']`), so installing the block via the CLI copies the whole folder together
- `registryDependencies` stays flat and complete: since blocks don't nest, list every *component* every sibling file imports directly, not just what the top-level file imports (e.g. if `ToolCallTrace.tsx` imports `Collapsible`/`Timeline` and `QuestionCard.tsx` imports `DatePicker`/`Slider`, all four go in the one `ai-chat` entry's `registryDependencies`, flattened)
- A sibling piece worth documenting on its own may get its own hidden entry in `blocks.ts` (`hidden: true`) whose `files` points at the *same* nested path (e.g. `files: ['AiChat/ToolCallTrace.tsx']`) so it's individually linkable at `/blocks/{slug}` and installable on its own — see "Block Registry" → point 4 in `rules/docs-site.md` for the general hidden-variant mechanism. Because the sibling takes props, its `preview`/`usage` need a small demo wrapper supplying sample data (e.g. `app/_docs/components/examples/ToolCallTraceDemo.tsx`) rather than rendering the bare file with no props — that wrapper is docs-only, not part of the installed `files`
- Don't reach for this by default: most blocks are one file. Only split out a sibling when a piece is both substantial and reused multiple times within the same block's own render — a single one-off section doesn't qualify

## BlockName.tsx

- `'use client';` on line 1, since blocks are interactive by nature
- Export the block as a named export matching the file name, plus a default export
- No props: a block takes no configuration. Internal state (form values, active step, selected period) is fine; anything a consumer would want to change is meant to be edited directly in the copied file
- Not exported from `src/index.ts`, since blocks are never `npm install`ed, only copied via the CLI or by hand
- Build it entirely from existing components (`src/components/`). If the composition needs something that doesn't exist yet, add that as a proper component first, then use it in the block

## Registry Entry (app/_docs/registry/blocks.ts)

Every new block must have an entry in `blocks.ts`. See `rules/docs-site.md` → "Block Registry" for the full field reference and the `blockCategories.ts` / `blockPreviews.tsx` files that go with it.

```ts
// Example entry
{
  slug: 'settings-form',
  name: 'Settings form',
  category: 'Forms',
  description: 'A general-purpose account settings form...',
  usage: `'use client';\n\n...`,      // full runnable source, kept in sync with src/blocks/SettingsForm/SettingsForm.tsx by hand
  dependencies: [],                   // npm packages, e.g. ["recharts"] for a chart-heavy block
  registryDependencies: ['card', 'form', 'input', 'textarea', 'switch', 'select', 'button', 'badge'],
  files: ['SettingsForm/SettingsForm.tsx'],
}
```

**`registryDependencies`** here means *component* slugs, not other blocks: blocks don't nest. List every component the block imports directly; the CLI resolves each component's own `registryDependencies` transitively, so you only need to declare direct usage.

### Preview (Required)

Add the block to `app/_docs/registry/blockPreviews.tsx`'s `blockPreviews` map: `import` it from `src/blocks/` and render it with no props, e.g. `'settings-form': <SettingsForm />`. Because this renders the real installable file, there's no separate "demo" implementation to keep in sync; only `usage` needs manual updating when the block's source changes.

## Updating a Block

- If the block's real source (`src/blocks/BlockName/BlockName.tsx`) changes, update `usage` in `blocks.ts` to match: the same "usage code and preview must align" discipline as components (`rules/docs-site.md`)
- If the block starts using a new component, add it to `registryDependencies`
- If the block starts using a new npm package, add it to `dependencies`
