# Rule: Writing Commit Messages

Commits follow the [Conventional Commits](https://www.conventionalcommits.org) spec and are enforced by commitlint on every commit (husky) and on every PR (CI).

## Format

```
type: short description
```

The header must be 72 characters or fewer. The description must be lower-case.

## Allowed Types

| Type       | When to use                                               |
|------------|-----------------------------------------------------------|
| `feat`     | A new component, variant, token, pattern, or MCP resource |
| `fix`      | A bug fix or incorrect behavior                           |
| `docs`     | Changes to `.md`, `.mdx`, or `spec.md` files only        |
| `style`    | Visual/CSS changes with no behavior change                |
| `refactor` | Code restructure with no behavior or visual change        |
| `test`     | Adding or updating tests only                             |
| `chore`    | Config, tooling, dependencies, CI                         |

## Examples

```
feat: add Select component
fix: correct focus-visible ring color on outlined button
docs: update Button spec with outlined variant
style: increase outlined border to 2px
refactor: extract variant classes into separate map
test: add disabled state tests for Input
chore: add commitlint and husky
```

## Pre-commit Checks

The pre-commit hook runs automatically on every `git commit` and will block if either check fails:

1. **Lint** — `npm run lint` must pass with no errors
2. **Typecheck** — `npm run typecheck` must pass with no errors
3. **Tests** — `npm test` must pass with no failures

Fix all lint errors and failing tests before committing. Do not bypass the hook with `--no-verify`.

## Rules

- No scope required — keep it flat
- No capital letter at the start of the description
- No period at the end
- Use imperative mood: "add", not "added" or "adds"
- If a commit touches multiple concerns, split it into multiple commits
