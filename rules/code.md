# Rule: Code Style

General code style rules that apply to all files in this repo.

## Import Order

Imports must be ordered by statement length: longest import statement at the top, shortest at the bottom. No grouping by type (third-party vs local).

```ts
// Correct
import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { something } from '../utils';
import type { Foo } from './types';

// Wrong: shorter imports above longer ones
import type { Foo } from './types';
import { createContext, useContext } from 'react';
```

In Next.js / React files with `'use client'`:
- `'use client';` on line 1
- One blank line
- Then imports (longest → shortest)

Both are enforced by ESLint: `perfectionist/sort-imports` for the order, and the local `directive/use-client-spacing` rule (`eslint-rules/directive.mjs`) for the directive: exactly one semicolon (`'use client';`, never `;;`) and exactly one blank line before the first import. Both autofix with `npm run lint -- --fix`.

## Interface Declarations

The opening brace of an `interface` goes on the **same line** as the declaration. This is an exception to the new-line brace style used for functions, classes, and loops.

```ts
// Correct
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
}

// Wrong
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
	variant?: ButtonVariant;
}
```

Applies to new and edited interfaces, including exported props interfaces. Enforced by the local ESLint rule `braces/interface-brace` (`eslint-rules/braces.mjs`), which autofixes with `npm run lint -- --fix`.

## Arrow Function Variables

The opening brace of an arrow function assigned to a variable goes on the **same line** as the `=>`. Callbacks passed as arguments (`it('...', () =>`, `.map(...)`, `useEffect(...)`) are not covered and keep the new-line style.

```ts
// Correct
const useAccordionContext = () => {
	...
};

// Wrong
const useAccordionContext = () =>
{
	...
};

// Callbacks are unchanged
describe('Accordion', () =>
{
	...
});
```

Enforced by the local ESLint rule `braces/arrow-brace` (`eslint-rules/braces.mjs`), which autofixes with `npm run lint -- --fix`.

## Comments

Keep comments to a minimum. Code should be self-explanatory through naming and structure.

**Don't write:**
- Section dividers or banners (`// ─── Types ───`). Enforced by the local ESLint rule `comments/no-banner` (`eslint-rules/comments.mjs`), which autofixes by deleting them.
- Comments that restate what the next line does.
- JSDoc that only repeats a prop's name or type. Keep a doc comment only when it adds information a reader can't get from the signature (units, accepted formats, a required pairing like `src` + `alt`).
- Commented-out code, or notes about the change you just made ("moved from X", "now uses Y"). A comment describes the code as it is.

**Do write**, briefly (one to three lines), when the *why* isn't obvious from the code: a workaround, a browser or accessibility constraint, or a large or genuinely complex block. Explain why, not what.

`eslint-disable` directives always carry a reason after `--`.

## Automatic Linting

A Claude Code `PostToolUse` hook (`.claude/settings.json` → `scripts/linthook.sh`) runs `eslint --fix` on every `.ts`/`.tsx`/`.mjs` file Claude writes or edits (skipping `packages/`, `.claude/`, `node_modules/`). Anything ESLint can't autofix is reported back to Claude to fix. It does not replace the pre-commit and CI lint. If you change the lint scope, update `scripts/linthook.sh`.
