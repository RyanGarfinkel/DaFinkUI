# Graph

A force-directed node/edge graph rendered in SVG with draggable nodes, pan/zoom, hover-highlighting of connected edges, and full keyboard accessibility. Uses d3-force for physics simulation (run to completion synchronously, with no animation).

## Installation

```bash
npx dafink-ui add graph
```

npm dependency: `d3-force`. No registry dependencies.

---

## Props

| Prop           | Type                          | Default | Description                                                              |
|----------------|-------------------------------|---------|--------------------------------------------------------------------------|
| `nodes`        | `GraphNode[]`                 | required | Required. Array of `{ id, label, group? }` objects.                    |
| `edges`        | `GraphEdge[]`                 | required | Required. Array of `{ source, target }` objects referencing node ids.  |
| `width`        | `number`                      | `600`   | SVG width in pixels.                                                     |
| `height`       | `number`                      | `400`   | SVG height in pixels.                                                    |
| `className`    | `string`                      | `""`    | Additional classes on the root wrapper div.                              |
| `onNodeSelect` | `(node: GraphNode) => void`   | n/a     | Called when a node is selected via click or keyboard Enter/Space.        |

### GraphNode

| Field   | Type     | Description                                      |
|---------|----------|--------------------------------------------------|
| `id`    | `string` | Unique identifier.                               |
| `label` | `string` | Display text shown below the node (≤50 nodes).  |
| `group` | `string` | Optional group tag (reserved for future color mapping). |

### GraphEdge

| Field    | Type     | Description                        |
|----------|----------|------------------------------------|
| `source` | `string` | `id` of the source node.           |
| `target` | `string` | `id` of the target node.           |

---

## Behavior

- **Simulation**: d3-force runs synchronously at mount (300 ticks). Positions are stored in React state; d3 is never used for DOM manipulation.
- **Dragging**: pointer-capture drag on individual nodes updates their position in state. The simulation is not re-run after drag.
- **Pan**: pointer-down on the SVG background starts a pan; moving the pointer shifts the viewport transform.
- **Zoom**: mouse wheel zooms (clamped 0.2–4×). Keyboard `+`/`=` zooms in, `-` zooms out, `0` resets.
- **Hover highlight**: hovering a node highlights its connected edges in brand color and dims all other edges.
- **Labels**: 11px text labels are shown below each node when the graph has ≤50 nodes.

---

## Interactive States

| State         | Node appearance                                      |
|---------------|------------------------------------------------------|
| Default       | `var(--color-brand)` fill                            |
| Hover         | `var(--color-brand-hover)` fill                      |
| Selected      | `var(--color-brand-active)` fill + ring indicator    |
| Edge default  | `var(--color-surface-border)` stroke, width 1.5      |
| Edge active   | `var(--color-brand)` stroke, width 2                 |
| Edge dimmed   | opacity 0.2 (non-connected while a node is hovered)  |

---

## Accessibility

### ARIA roles

| Element           | Role / attribute                               |
|-------------------|------------------------------------------------|
| `<svg>`           | `role="application"`, `aria-label="Graph"`     |
| Node container    | `role="list"`, `aria-label="Nodes"`            |
| Each node `<g>`   | `role="listitem"`, `aria-label={node.label}`, `aria-pressed={isSelected}` |
| Live region       | `role="status"`, `aria-live="polite"`: announces selection and initial node/edge count |

### Keyboard model

| Key                       | Action                                                      |
|---------------------------|-------------------------------------------------------------|
| `Tab`                     | Moves focus into the SVG container                          |
| `ArrowRight` / `ArrowDown` | Moves selection to the next node (wraps)                   |
| `ArrowLeft` / `ArrowUp`   | Moves selection to the previous node (wraps)                |
| `Enter` / `Space`         | Selects the focused node; fires `onNodeSelect`              |
| `Escape`                  | Returns focus to the SVG container                          |
| `+` / `=`                 | Zoom in                                                     |
| `-`                       | Zoom out                                                    |
| `0`                       | Reset zoom and pan                                          |

Roving tabindex: only the currently selected node has `tabIndex={0}`; all others are `tabIndex={-1}`.

### Motion

Simulation ticks run synchronously, so there is no DOM animation to suppress. The component fully respects `prefers-reduced-motion` by design.

---

## When to use

- **Knowledge graphs**: visualise relationships between concepts, notes, or entities (Obsidian-style).
- **Dependency graphs**: show package or module dependencies.
- **Network diagrams**: illustrate connections between services, people, or systems.
- **Exploration interfaces**: let users drag, pan, and zoom to explore complex relationship data.

---

## Tokens used

| Token                    | Where                               |
|--------------------------|-------------------------------------|
| `var(--color-brand)`     | Node fill (default), active edge stroke |
| `var(--color-brand-hover)` | Node fill on hover                |
| `var(--color-brand-active)` | Node fill when selected           |
| `var(--color-brand-ring)` | Focus ring on SVG container + selected node ring |
| `var(--color-surface-border)` | Edge stroke (default), node stroke |
| `var(--color-text-muted)` | Node label text                    |
| `var(--color-surface)`    | SVG background                     |

---

## Example

```tsx
import Graph, { type GraphNode, type GraphEdge } from '@/components/ui/Graph/Graph';

const NODES: GraphNode[] = [
  { id: 'react',      label: 'React'      },
  { id: 'nextjs',     label: 'Next.js'    },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'tailwind',   label: 'Tailwind'   },
  { id: 'dafink',        label: 'DaFink UI'     },
];

const EDGES: GraphEdge[] = [
  { source: 'react',      target: 'nextjs'     },
  { source: 'react',      target: 'typescript' },
  { source: 'nextjs',     target: 'dafink'        },
  { source: 'tailwind',   target: 'dafink'        },
];

export default function Example() {
  return (
    <Graph
      nodes={NODES}
      edges={EDGES}
      width={600}
      height={400}
      onNodeSelect={node => console.log('selected', node.label)}
    />
  );
}
```
