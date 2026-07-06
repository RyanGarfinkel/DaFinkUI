# dafink-ui

Add [DaFink UI](https://github.com/RyanGarfinkel/DaFinkUI) components to your project. Components are copied into your codebase as source — you own the files, there's no runtime package to update.

## Usage

```bash
npx dafink-ui init
npx dafink-ui add button
```

## Commands

| Command                | Description                                                        |
|-------------------------|--------------------------------------------------------------------|
| `init`                  | Interactive setup wizard — writes `dafink.config.json` and token CSS |
| `add [components...]`   | Copy component files into your project (`--all` for every component) |
| `skill [path]`          | Download the `dafink-ui.skill` design skill for AI coding assistants |
| `audit`                 | Copy static accessibility checks + CI workflow into your project (`--provider <github\|gitlab>`) |

## Setup

`init` walks you through:

- **Style** — `minimal`, `neumorph`, or `brutalist`
- **Palette** — `zinc`, `ocean`, `ember`, `forest`, `noir`, or `plum`
- Where components and blocks should live in your project
- Which CSS file to inject design tokens into

This writes a `dafink.config.json` that every other command reads from.

## Adding components

```bash
npx dafink-ui add button dialog
npx dafink-ui add --all
```

Component dependencies are resolved transitively — adding a block that depends on `Form` also pulls in `Form`'s own dependencies (`Input`, `Button`, etc.), and any missing npm packages are flagged for install.

## Links

- [Docs & component reference](https://github.com/RyanGarfinkel/DaFinkUI)
- [Contributing](https://github.com/RyanGarfinkel/DaFinkUI/blob/main/CONTRIBUTING.md)

## License

MIT
