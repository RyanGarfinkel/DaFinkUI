# ToolCallTrace

A collapsible summary of an AI assistant's tool calls, web searches, and internal "thoughts" behind a single reply: a one-line trigger ("Thought, searched the web, used 2 tools") that expands into a vertical timeline of each step, with its result or source links underneath.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `toolCalls` | `ToolCallEntry[]` | — | The ordered list of steps to summarize and, once expanded, render as a timeline. The component renders nothing (`null`) when the array is empty. |

### `ToolCallEntry`

A `ToolCallEntry` is one step in the timeline — a single thing the assistant did while producing its reply: ran a tool, searched the web, or reasoned out loud. One entry renders as one row of the expanded timeline.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Stable identifier, used as the timeline item's key. |
| `kind` | `string` | Category of step. `'search'` and `'thought'` get dedicated summary phrasing ("searched the web", "Thought"); everything else — `'tool'` or any kind you invent (`'memory'`, `'code'`, ...) — is summarized as "used N tools". Not a closed set: pair a custom kind with `icon` for a matching glyph. |
| `title` | `string` | The short label shown in the timeline for this step (e.g. "Web search", "Read file", "Thinking"). |
| `detail` | `string` | The one-line description shown under the title — the search query, the file path read, or the thought text itself. |
| `result?` | `string` | An optional short result line shown below the detail (e.g. "Found the add command implementation"), rendered in a highlighted block. Only shown when `links` is not set. |
| `links?` | `ToolCallLink[]` | An optional list of reference links (e.g. search results), rendered as a small scrollable list of favicon + title + hostname rows in place of the `result` line when present. |
| `icon?` | `ReactNode` | Overrides the built-in icon for this entry. Without one, `kind` resolves to a built-in icon for `'tool'`/`'search'`/`'thought'`, or a generic tool icon for anything else. |

### `ToolCallLink`

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Link display title. |
| `url` | `string` | Target URL; also used to derive the favicon and the displayed hostname. |

---

## Variants

None — a single Collapsible + Timeline composition. `kind` and `icon` swap the per-entry icon and (for `kind`) change how that entry is counted in the summary line, but don't change the component's structure.

---

## Interactive States

| Element | State | Implementation |
|---|---|---|
| Trigger | Default / hover / focus-visible | Inherited from `Collapsible`'s `CollapsibleTrigger` |
| Link row | Hover | `hover:bg-surface-hover` |
| Link row | Focus-visible | `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-ring` |

---

## Accessibility

- Built on `Collapsible`: the trigger is a native `<button>` with `aria-expanded`, reachable by Tab and toggled with Enter/Space; the timeline region is `aria-hidden` while collapsed.
- Each link opens in a new tab with `target="_blank" rel="noopener noreferrer"`.
- Decorative icons (`ToolIcon`, `SearchIcon`, `ThoughtIcon`, `ExternalLinkIcon`) are `aria-hidden`; link favicon images use an empty `alt`.

---

## When to Use

- Above an assistant chat reply that used tools, ran searches, or reasoned before answering, to make that work inspectable without cluttering the reply itself
- Any agent/assistant UI that wants to show its work as a collapsed-by-default trace

---

## Tokens Used

| Token | Purpose |
|-------|---------|
| `radius-sm` | Link list and result block corner radius |
| `border-width` / `surface-border` | Link list border and row dividers |
| `surface-hover` | Link row hover background |
| `surface-active` | Result block background |
| `text` / `text-muted` / `text-subtle` | Text hierarchy across title, detail, and hostname |
| `brand-ring` | Focus ring color on link rows |
| `duration-fast` | Link row hover transition timing |

---

## Installation

```bash
npx dafink-ui add tool-call-trace
```

No npm dependencies. Registry dependencies: `collapsible`, `timeline`, `scroll-fade`.
