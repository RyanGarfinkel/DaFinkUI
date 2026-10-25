# dafink-ui

Add [DaFink UI](https://github.com/RyanGarfinkel/DaFinkUI) components to your project. Components are copied into your codebase as source: you own the files, and there's no runtime package to update.

## Usage

```bash
npx dafink-ui init
npx dafink-ui add button
```

## Commands

| Command                | Description                                                        |
|-------------------------|--------------------------------------------------------------------|
| `init`                  | Interactive setup wizard, writes `dafink.config.json` and token CSS |
| `add [components...]`   | Copy component files into your project (`--all` for every component) |
| `skill [path]`          | Download the `dafink-ui.skill` design skill for AI coding assistants |
| `audit`                 | Copy static accessibility checks + CI workflow into your project (`--provider <github\|gitlab>`) |
| `eslint`                | Copy the DaFink ESLint rules + config into your project and install their dev dependencies (also offered during `init`) |

## Setup

`init` walks you through:

- **Style**: `minimal`, `neumorph`, or `brutalist`
- **Palette**: `zinc`, `ocean`, `ember`, `forest`, `noir`, or `plum`
- Where components and blocks should live in your project
- Which CSS file to inject design tokens into

This writes a `dafink.config.json` that every other command reads from.

### Non-interactive (agents, CI)

Every prompt has a flag. Anything you don't pass is prompted for; with `--yes` (or when stdin isn't a TTY) it takes the default instead: `minimal`, `zinc`, the detected framework and CSS file, `src/components/ui`, no ESLint, no hook.

```bash
npx dafink-ui init --style minimal --palette ocean --hook --yes
```

| Flag | Values |
|---|---|
| `--style <name>` | `minimal`, `neumorph`, `brutalist` |
| `--palette <name>` | `zinc`, `ocean`, `ember`, `forest`, `noir`, `plum` |
| `--framework <name>` | `next`, `react` (default: detected) |
| `--components-dir <path>` | default `src/components/ui` |
| `--css-file <path>` | required if no CSS file is auto-detected |
| `--eslint` | also install the ESLint rules |
| `--hook` | also add the Claude Code lint hook to `.claude/settings.json` (implies `--eslint`) |
| `--hook-fix` | like `--hook`, but the hook autofixes problems before reporting the rest |
| `-y, --yes` | never prompt |

Invalid values exit with code 1.

## Adding components

Each component installs as a single file, e.g. `src/components/ui/Button.tsx`. With `--with-tests` it installs into its own folder alongside its test file (`Button/Button.tsx`, `Button/Button.test.tsx`).

Each component installs as a single file, e.g. `src/components/ui/Button.tsx`. With `--with-tests` it installs into its own folder alongside its test file (`Button/Button.tsx`, `Button/Button.test.tsx`).

```bash
npx dafink-ui add button dialog
npx dafink-ui add --all
```

Component dependencies are resolved transitively: adding a block that depends on `Form` also pulls in `Form`'s own dependencies (`Input`, `Button`, etc.), and any missing npm packages are flagged for install.

## Links

- [Docs & component reference](https://github.com/RyanGarfinkel/DaFinkUI)
- [Contributing](https://github.com/RyanGarfinkel/DaFinkUI/blob/main/CONTRIBUTING.md)

## License

MIT
