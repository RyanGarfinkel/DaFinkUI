# Contributing to Obi UI

Obi UI is open source and contributions are welcome. This guide covers how to set up the project, the rules you need to follow, and how to submit your work.

---

## Getting started

```bash
git clone https://github.com/RyanGarfinkel/ObiUI.git
cd ObiUI
npm install
npm run dev
```

The docs site runs at `http://localhost:3000`.

---

## What to contribute

- **New components** — follow the rules in `rules/new-component.md` exactly
- **Bug fixes** — open an issue first if the fix is non-trivial
- **Docs improvements** — fixes to descriptions, examples, or specs
- **Accessibility fixes** — always welcome, no issue required

If you want to contribute a new component, **open an issue first** describing what the component does and why it belongs in the library. This avoids duplicate effort and ensures the component fits the scope.

---

## Code style

All code must follow the rules in `rules/code.md` and `CLAUDE.md`. The short version:

- Tabs, not spaces
- Opening brace on a new line (standard functions/classes/if blocks)
- Imports ordered by character length, longest first
- No comments unless the WHY is non-obvious
- No dead code, no unused imports

Run the linter before opening a PR:

```bash
npm run lint
```

---

## Adding a new component

Every new component requires all of the following — no exceptions:

1. `src/components/ComponentName/ComponentName.tsx` — the component
2. `src/components/ComponentName/ComponentName.test.tsx` — Vitest tests
3. `src/components/ComponentName/spec.md` — machine-readable spec
4. An entry in `app/_docs/registry/index.ts`
5. A `case` in `app/_docs/components/ComponentLivePreview.tsx`

Read `rules/new-component.md` before writing any code. It covers required file structure, interactive states, accessibility requirements, and the overlay component checklist.

### Accessibility is non-negotiable

Every component must pass all five rules in `AGENTS.md`:

- Keyboard-navigable
- Visible focus indicator
- Sufficient color contrast (4.5:1 body, 3:1 UI)
- Color is not the only signal
- Animations respect `prefers-reduced-motion`

Components that fail any of these will not be merged.

---

## Design

Read `rules/design.md` and `rules/tokens.md` before making any visual decisions. Components must use design tokens (`bg-brand`, `text-text`, etc.) — never hardcoded colors.

---

## Testing

```bash
npm run test
```

Tests use Vitest and `@testing-library/react`. Every component must cover: rendering, variants, interactive states, disabled state, accessibility attributes, and prop forwarding.

---

## Submitting a pull request

1. Fork the repo and create a branch from `main`
2. Follow the code and component rules above
3. Run `npm run lint` and `npm run test` — both must pass
4. Open a PR with a clear description of what changed and why
5. For new components, include a screenshot or screen recording of the live preview

PR titles follow the same conventions as commit messages (`rules/commits.md`): `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

---

## Reporting bugs

Open a GitHub issue with:

- What you expected to happen
- What actually happened
- A minimal reproduction (CodeSandbox or a code snippet)
- Browser and OS if the bug is visual or interaction-related

---

## Questions

Open a GitHub Discussion or file an issue tagged `question`.
