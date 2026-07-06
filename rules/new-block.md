# Rule: New Block

Apply this rule whenever creating a new UI block in `src/blocks/`.

## What a Block Is

A block is a full, opinionated composition of existing components — a dashboard, a login flow, a settings form — meant to give a fast starting point that gets copied in and then adapted. It is **not** a reusable, prop-driven API like a component. If you find yourself adding a `variant` or `size` prop to a block, it's drifting into being a component — stop and reconsider.

## Required File Structure

Every block lives in its own folder under `src/blocks/`. The folder name is PascalCase and matches the block name exactly.

```
src/blocks/BlockName/
└── BlockName.tsx        # The block
```

Unlike components (`rules/new-component.md`), a block does **not** require a `.test.tsx` or a `spec.md`. It composes components that are already tested and specced individually; the block itself has no stable prop API to test or document beyond its registry entry.

## BlockName.tsx

- `'use client';` on line 1 — blocks are interactive by nature
- Export the block as a named export matching the file name, plus a default export
- No props — a block takes no configuration. Internal state (form values, active step, selected period) is fine; anything a consumer would want to change is meant to be edited directly in the copied file
- Not exported from `src/index.ts` — blocks are never `npm install`ed, only copied via the CLI or by hand
- Build it entirely from existing components (`src/components/`) — if the composition needs something that doesn't exist yet, add that as a proper component first, then use it in the block

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

**`registryDependencies`** here means *component* slugs, not other blocks — blocks don't nest. List every component the block imports directly; the CLI resolves each component's own `registryDependencies` transitively, so you only need to declare direct usage.

### Preview (Required)

Add the block to `app/_docs/registry/blockPreviews.tsx`'s `blockPreviews` map: `import` it from `src/blocks/` and render it with no props, e.g. `'settings-form': <SettingsForm />`. Because this renders the real installable file, there's no separate "demo" implementation to keep in sync — only `usage` needs manual updating when the block's source changes.

## Updating a Block

- If the block's real source (`src/blocks/BlockName/BlockName.tsx`) changes, update `usage` in `blocks.ts` to match — the same "usage code and preview must align" discipline as components (`rules/docs-site.md`)
- If the block starts using a new component, add it to `registryDependencies`
- If the block starts using a new npm package, add it to `dependencies`
