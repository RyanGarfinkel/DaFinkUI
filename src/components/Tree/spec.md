# Tree

A collapsible, keyboard-navigable tree view for hierarchical data — file trees, org charts, nested navigation, and similar structures.

## Installation

```bash
npx @obi/ui add tree
```

No additional npm dependencies. No registry dependencies.

---

## Props

### Tree

| Prop        | Type        | Default | Description                                      |
|-------------|-------------|---------|--------------------------------------------------|
| `children`  | `ReactNode` | —       | One or more `TreeItem` elements.                 |
| `className` | `string`    | `""`    | Additional classes on the root `div[role=tree]`. |

### TreeItem

| Prop          | Type        | Default | Description                                                              |
|---------------|-------------|---------|--------------------------------------------------------------------------|
| `label`       | `ReactNode` | —       | The text or content displayed for this node.                             |
| `children`    | `ReactNode` | —       | Nested `TreeItem` elements. Presence makes this a branch node.           |
| `defaultOpen` | `boolean`   | `false` | Whether a branch starts expanded on initial render.                      |
| `icon`        | `ReactNode` | —       | Custom icon overriding the default chevron (branch) or file icon (leaf). |
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

Focus management is context-driven: a single `onKeyDown` handler on the tree container reads `offsetParent` to determine the current visible item list and calls `.focus()` on the target element.

---

## Accessibility

- `role="tree"` on the root container.
- `role="treeitem"` on each item wrapper.
- `role="group"` on each children container.
- `aria-expanded` set to `true`/`false` on branch nodes only; absent on leaf nodes.
- `aria-disabled="true"` on disabled items.
- Branch icon chevron and file icon are `aria-hidden="true"`.
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
| `--color-text-subtle`    | Leaf file icon color             |
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
