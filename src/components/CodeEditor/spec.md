# CodeEditor

A CodeMirror 6-backed JSX/JavaScript code editor with syntax highlighting, dark/light theming, and Tab-to-indent. Built for the Design Skill playground; suitable anywhere a project needs an in-browser editable code surface rather than a read-only display (see `CodeBlock` for that case).

## Installation

```bash
npx dafink-ui add code-editor
```

**Registry dependencies:** none
**npm dependencies:** `@uiw/react-codemirror`, `@codemirror/lang-javascript`, `@codemirror/autocomplete`

---

## Props

| Prop          | Type                        | Default | Description                                                                                   |
|---------------|-----------------------------|---------|-------------------------------------------------------------------------------------------------|
| `value`       | `string`                    | None    | Required. The current code string.                                                              |
| `onChange`    | `(value: string) => void`   | None    | Required. Fires with the updated value on every edit.                                           |
| `extensions`  | `Extension[]`               | `[]`    | Extra CodeMirror extensions layered on top of the built-ins, e.g. a project-specific `autocompletion({ override: [...] })` call. |
| `aria-label`  | `string`                    | None    | Accessible name for the editor region.                                                          |
| `className`   | `string`                    | `''`    | Additional Tailwind classes merged onto the root wrapper.                                       |
| `minHeight`   | `string`                    | None    | CSS min-height for the editor surface (e.g. `'200px'`). Keeps the editor from collapsing to a single line on short content. |

---

## Built-in behavior

| Behavior | Detail |
|---|---|
| Language | `javascript({ jsx: true })`: JSX/JS syntax highlighting always on |
| Theme | Follows the document's `.dark` class via a `MutationObserver`; switches between CodeMirror's `light` and `dark` themes live |
| Tab | Indents the current line (CodeMirror's `indentWithTab`, on by default) |
| Tab (completion open) | Accepts the selected autocomplete suggestion instead of indenting: bound at `Prec.highest` so it intercepts before indentation, but falls through to indent when no completion is active |
| Escape | Blurs the editor: the accessible way out of the editor now that Tab is repurposed for indentation, matching this repo's "Escape returns focus" overlay convention |

Autocomplete itself is **not** built in; pass an `autocompletion({ override: [...] })` extension via the `extensions` prop with whatever completion sources the consumer needs (e.g. the Playground's registry-aware component/prop name completions). This keeps `CodeEditor` free of any domain-specific knowledge.

---

## Interactive States

| State         | Behaviour                                                                    |
|---------------|-------------------------------------------------------------------------------|
| Default       | Standard CodeMirror caret and selection styling                              |
| Focus         | Editor gains a visible active-line highlight; native contenteditable focus ring is CodeMirror's own, not suppressed |
| Focus-visible | Root wrapper border matches `border-surface-border`; no additional ring needed since CodeMirror's own focus affordances (active line, cursor) already communicate focus |

---

## Accessibility

- The editor region carries `role="textbox"` and `aria-multiline="true"` (built into CodeMirror), plus whatever `aria-label` the consumer supplies.
- **No keyboard trap:** although Tab is repurposed for indentation (and, when a completion is open, for accepting it), Escape always blurs the editor and returns focus to the surrounding page, consistent with WCAG 2.1.2 (No Keyboard Trap) and this repo's own overlay focus-return pattern.
- Autocomplete popups (when the consumer supplies a source) are keyboard-navigable via CodeMirror's own `completionKeymap`: ArrowUp/ArrowDown move the selection, Enter or Tab accepts it, Escape closes the popup (and, since nothing is left open, a second Escape blurs the editor).

---

## When to use

- An in-browser surface where a user types or edits code and expects the result to drive something live (a preview, a derived value); the Design Skill Playground is the reference consumer.
- Not for displaying static, non-editable code: use `CodeBlock` for that; `CodeEditor` pulls in CodeMirror's editing machinery, which is unnecessary weight for read-only snippets.

---

## Tokens used

| Token class              | Where                              |
|---------------------------|-------------------------------------|
| `border-surface-border`   | Root wrapper border                |
| `radius-lg` (`var(--radius-lg)`) | Root wrapper corner rounding |
| `border-width` (`var(--border-width)`) | Root wrapper border thickness |
