# Terminal

A code editor workspace: activity bar, file explorer, source control and run sidebar, open-file tabs, editor with a Run button, an optional closable command terminal, a settings modal, and a status bar. Paths below are relative to wherever this block was installed. This is a directory guide for what's specific to Terminal, not general conventions for the project it lives in.

## File map

| File | What's in it | Edit this when you're... |
|---|---|---|
| `Terminal.tsx` | The orchestrator: tree, git, and file state, open tabs, active file, sidebar view, terminal visibility, run script and settings state, loading/error states, and the layout. No props. | ...changing the layout, tab behavior, run behavior, or what the status bar shows. |
| `GitPanel.tsx` | The source control view: branch name and the list of changed files with a status badge. Takes `git`, `status`, and `onOpen`. | ...changing how changes are listed or labeled. |
| `RunPanel.tsx` | The Run sidebar view: the run-script input and a Run button. Also exports `FILE_PLACEHOLDER` (`{file}`) and `canRunScript`, shared with the Run button in the editor's tab row. | ...changing how a run script is configured or when running is allowed. |
| `Shell.tsx` | The terminal panel, purely presentational: header with a close button, history, the prompt, ArrowUp/ArrowDown recall, auto-scroll. Takes `entries`, `running`, `onRun`, `onClear`, `onClose`; handles `clear` itself. | ...changing the prompt or how output renders. |
| `useShell.ts` | Owns the command history and the in-flight flag; calls `runCommand`. Terminal.tsx holds one instance so the prompt and the Run button feed the same history. | ...changing how a command is run or recorded. |
| `terminalApi.ts` | Every `fetch` call: `fetchTree` (`/api/terminal/files`), `fetchFile` (`/api/terminal/files/{id}`), `fetchGitStatus` (`/api/terminal/git`), and `runCommand` (`/api/terminal/exec`). | ...pointing the block at your own backend. Keep each function's return shape. |
| `types.ts` | `TerminalNode`, `TerminalFile`, `GitChange`, `GitStatus`, `ShellResult`, `ShellEntry`. | ...changing what the API returns. |
| `icons.tsx` | The file, close, explorer, git, run, settings, and terminal icons. | ...adding or restyling an icon. |

## Gotchas

**Edits live in component state only.** `editFile` updates the loaded copy so edits survive tab switches, but nothing is saved. To persist, add a save call to `terminalApi.ts` and invoke it from `Terminal.tsx`.

**The exec route is a mock, like AiChat's demo.** The docs-site `/api/terminal/exec` route matches each command against canned replies in the docs-site mock and returns plausible output. Nothing is executed and no file is read. For a real terminal, run commands in a sandboxed container and return their output; keep the `{ output, error? }` shape.

**Run and settings state is component state only.** `runScript`, `openOnRun`, and `clearOnRun` reset on reload. The `{file}` placeholder is substituted client-side in `handleRun` with the active file's path before the command is sent, so your backend only ever sees the final command string.

**Git status loads once, on mount.** It is fetched alongside the file tree and not refreshed when you edit a file. Refetch after a save or a command if you need it live.

**The tab close "button" is a span inside the trigger.** A real `button` nested in a `TabsTrigger` button is invalid HTML, so the X is an `aria-hidden` span with its own click handler that calls `stopPropagation` so closing a tab doesn't also activate it. It is hidden with `opacity` (not `display`) so tabs never shift width on hover, and it shows on hover, trigger focus, and touch. Because the span isn't focusable, keyboard users close the focused tab with Delete.

**The editor scrolls through its container, not itself.** `CodeEditor` grows with its content, so `TabsContent` owns `overflow-auto` and the editor uses `min-h-full`. Giving the editor `h-full` clips long files instead of scrolling them.

**`CodeEditor` highlights JavaScript/JSX only.** Other file types still open and edit, just without their own highlighting. Pass a language extension through `CodeEditor`'s `extensions` prop keyed on `TerminalFile.language` to add more.

**A file id is its path.** `fetchFile` URL-encodes the id, and the tab value, tree selection, git change paths, and `files` cache all key on it. Keep ids unique across the tree.

**Files load once.** A file already in `files` is not refetched when reopened; close-and-reopen shows the in-memory copy.
