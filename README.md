# DaFink UI

A token-driven, accessibility-first design system built on Next.js and Tailwind v4. Components ship as source you own: each one lives in its own folder with implementation, tests, and a machine-readable spec, and is documented on the built-in docs site with a live preview.

## Getting Started

```bash
npm install
npm run dev   # docs site at http://localhost:3000
```

## Commands

| Command                  | Description                                        |
|--------------------------|----------------------------------------------------|
| `npm run dev`            | Start the Next.js docs site dev server             |
| `npm run build`          | Build the docs site                                |
| `npm run test`           | Run Vitest unit tests                              |
| `npm run test:watch`     | Run tests in watch mode                            |
| `npm run lint`           | Run ESLint                                         |
| `npm run typecheck`      | Type-check without emitting                        |
| `npm run tokens`         | Build CSS variables from the JSON token sources    |
| `npm run check-contrast` | Validate token contrast ratios (runs in CI)        |

## Structure

```
app/              # Next.js docs site
  api/mcp/        # MCP server, serves component specs, tokens, and patterns
  _docs/          # Docs site components and the component registry
src/
  components/     # Library source, each component has TSX, tests, and spec.md
  tokens/         # Design token definitions (TypeScript mirror of globals.css)
  themes/         # Theme definitions (zinc, ocean, ember, forest, noir, plum)
  patterns/       # Design, accessibility, and interaction guidelines
tokens/           # JSON token sources (per theme, light/dark)
scripts/          # Token build, contrast gate, component validation
rules/            # Rules for contributors and AI agents working in this repo
```

## MCP Server

The docs site exposes an MCP endpoint at `/api/mcp` that serves component specs (from each component's `spec.md`), design tokens, and pattern docs. Any AI coding assistant connected to it gets live, always-current component API documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Before adding or modifying a component, read the rules in `rules/`:

- `design.md`: visual and motion decisions
- `tokens.md`: how to use design tokens
- `new-component.md`: required file structure for every component
- `docs-site.md`: conventions for the docs site under `app/`
- `commits.md`: commit message format

Accessibility is non-negotiable: every component must be keyboard-navigable, have visible focus indicators, meet contrast minimums, never rely on color alone, and respect `prefers-reduced-motion`.
