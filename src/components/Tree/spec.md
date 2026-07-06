# Tree

A collapsible, keyboard-navigable tree view for hierarchical data — file trees, org charts, nested navigation, and similar structures.

## Installation

```bash
npx @dafink/ui add tree
```

No additional npm dependencies. No registry dependencies.

---

## Props

### Tree

| Prop              | Type        | Default     | Description                                                              |
|-------------------|-------------|-------------|---------------------------------------------------------------------------|
| `children`        | `ReactNode` | —           | One or more `TreeItem` elements.                                          |
| `className`       | `string`    | `""`        | Additional classes on the root `div[role=tree]`.                         |
| `terminalIcon`    | `ReactNode` | `undefined` | Default icon for leaf items (no children) that don't set their own `icon`. No icon renders if omitted — there is no built-in default. |
| `nonTerminalIcon` | `ReactNode` | `undefined` | Default icon for `collapsible={false}` branch items that don't set their own `icon`. No icon renders if omitted. Collapsible branches always show the chevron instead, since that icon is functional (the expand/collapse toggle), not decorative. |
| `selectable`      | `boolean`   | `false`     | Allows text selection/copy inside the tree (`select-text` instead of `select-none`). Off by default since a normal interactive tree treats click as select/toggle, not text selection. Turn on for read-only, fully non-collapsible trees (e.g. a structural diagram). |

### TreeItem

| Prop          | Type        | Default | Description                                                              |
|---------------|-------------|---------|--------------------------------------------------------------------------|
| `label`       | `ReactNode` | —       | The text or content displayed for this node.                             |
| `children`    | `ReactNode` | —       | Nested `TreeItem` elements. Presence makes this a branch node.           |
| `defaultOpen` | `boolean`   | `false` | Whether a branch starts expanded on initial render. Ignored when `collapsible` is `false` (the branch is always open). |
| `collapsible` | `boolean`   | `true`  | When `false`, the item is fully non-interactive: no chevron toggle, no hover/focus-visible/active styling, `tabIndex={-1}` (excluded from the Tab order and from arrow-key roving focus entirely — never registered with the tree, so `ArrowDown`/`ArrowUp`/`Home`/`End` skip over it), and no `onClick`/`onKeyDown`/`onFocus` handlers. A branch also becomes permanently expanded and `aria-expanded` always reports `true`. Applies equally to leaf items — a `collapsible={false}` leaf is just as inert. Use for read-only structural diagrams where nothing should look or behave like a control. |
| `icon`        | `ReactNode` | —       | Custom icon for this specific item, overriding the chevron (collapsible branch), `Tree`'s `nonTerminalIcon` (non-collapsible branch), or `Tree`'s `terminalIcon` (leaf). Always rendered even when `collapsible` is `false`. |
| `disabled`    | `boolean`   | `false` | Disables interaction. Item is visible but not clickable or focusable.    |
| `className`   | `string`    | `""`    | Additional classes on the item row element.                              |

---

## Usage

```tsx
import Tree, { TreeItem } from '@/src/components/Tree/Tree';

export default function Example() {
  return (
    <Tree>
      <TreeItem label="src" defaultOpen>
        <TreeItem label="components">
          <TreeItem label="Button.tsx" />
          <TreeItem label="Input.tsx" />
        </TreeItem>
        <TreeItem label="app">
          <TreeItem label="page.tsx" />
          <TreeItem label="layout.tsx" />
        </TreeItem>
      </TreeItem>
      <TreeItem label="package.json" />
      <TreeItem label="tsconfig.json" />
    </Tree>
  );
}
```

---

## Visual States

| State         | Implementation                                                              |
|---------------|-----------------------------------------------------------------------------|
| Default        | `text-text` on transparent background.                                     |
| Hover          | `bg-surface-hover` — 150ms ease transition.                                |
| Active/pressed | `bg-surface-active` on mousedown.                                          |
| Focus-visible  | `ring-2 ring-offset-2 ring-brand-ring` via `:focus-visible`.               |
| Disabled       | `opacity-40`, `cursor-not-allowed`, `pointer-events-none`. No hover/focus. |
| Non-collapsible (`collapsible={false}`) | Plain `cursor-default`. No hover, focus-visible, or active styling — the row never looks like a control. |

---

## Keyboard Navigation

| Key            | Behavior                                                                   |
|----------------|----------------------------------------------------------------------------|
| `ArrowDown`    | Move focus to the next visible item (wraps to top).                        |
| `ArrowUp`      | Move focus to the previous visible item (wraps to bottom).                 |
| `ArrowRight`   | If branch is closed: expand it. If branch is open: move to first child.    |
| `ArrowLeft`    | If branch is open: collapse it. If branch is closed: move to parent.       |
| `Home`         | Jump focus to the first visible item.                                      |
| `End`          | Jump focus to the last visible item.                                       |
| `Enter`        | Toggle a branch open or closed.                                            |
| `Space`        | Toggle a branch open or closed.                                            |

A `collapsible={false}` item (branch or leaf) is excluded entirely from keyboard interaction, not just the open/close toggle: it has `tabIndex={-1}` (not a Tab stop), is never registered with the tree's roving-focus index, so `ArrowDown`/`ArrowUp`/`Home`/`End` skip over it and can never land on it, and has no `onClick`/`onKeyDown`/`onFocus` handlers at all. It behaves like static content, not a control. Sibling items that are still collapsible continue to participate in keyboard navigation normally.

Focus management is context-driven: a single `onKeyDown` handler on the tree container reads `offsetParent` to determine the current visible item list and calls `.focus()` on the target element.

---

## Accessibility

- `role="tree"` on the root container.
- `role="treeitem"` on each item wrapper.
- `role="group"` on each children container.
- `aria-expanded` set to `true`/`false` on branch nodes only; absent on leaf nodes. Always `true` on a `collapsible={false}` branch, since it can never close.
- `aria-disabled="true"` on disabled items.
- The icon span is always `aria-hidden="true"`, whatever it renders (chevron, `terminalIcon`, `nonTerminalIcon`, a per-item `icon`, or nothing at all). No chevron is rendered for a `collapsible={false}` branch — there is no affordance implying it can be closed. There is no built-in default icon of any kind: leaves and non-collapsible branches render no icon unless `Tree` is given `terminalIcon`/`nonTerminalIcon`, or the item is given its own `icon`.
- A `collapsible={false}` item has no hover, focus-visible, or active styling and is excluded from the Tab order and arrow-key roving focus — it presents as static content, not a control.
- All animation respects `prefers-reduced-motion` via the `motion-safe:` Tailwind prefix.

---

## Animation

Branch expand/collapse uses the CSS grid trick for smooth height animation without a fixed max-height:

```tsx
<div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr' }}
     className="motion-safe:grid motion-safe:transition-[grid-template-rows] motion-safe:duration-[var(--duration-fast)]">
  <div style={{ overflow: 'hidden' }} role="group">
    {children}
  </div>
</div>
```

The chevron icon rotates 90° when a branch opens using `motion-safe:transition-transform`.

---

## Tokens Used

| Token                    | Usage                            |
|--------------------------|----------------------------------|
| `--color-text`           | Item label color                 |
| `--color-text-muted`     | Branch chevron icon color        |
| `--color-surface-hover`  | Item hover background            |
| `--color-surface-active` | Item active/pressed background   |
| `--color-brand-ring`     | Focus-visible ring color         |
| `--duration-fast`        | Transition duration (150ms)      |

---

## When to Use

- File system explorers and directory browsers
- Nested navigation menus with multiple levels
- Org charts or hierarchical data displays
- Settings panels with grouped sections
- Any structure where items belong to groups and groups can be collapsed
- Read-only structural diagrams where the full hierarchy must always be visible and nothing should look interactive — set `collapsible={false}` on every `TreeItem` (e.g. a compound component's composition diagram)
