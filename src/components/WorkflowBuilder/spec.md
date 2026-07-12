# WorkflowBuilder

A drag-and-drop graph editor for building typed workflows. Users connect nodes visually; the component outputs a serializable `WorkflowGraph` object (nodes + edges) via an `onChange` callback.

## Installation

```bash
npx dafink-ui add workflow-builder
```

**npm dependency:** `@xyflow/react`

Also add the React Flow stylesheet to your entry CSS:

```css
@import '@xyflow/react/dist/style.css';
```

Or in a layout/root component:

```ts
import '@xyflow/react/dist/style.css';
```

## Props

| Prop           | Type                          | Default | Description                                                         |
|----------------|-------------------------------|---------|---------------------------------------------------------------------|
| `defaultGraph` | `WorkflowGraph`               | -       | Pre-populated graph. Nodes and edges are loaded on first render only. Not reactive: subsequent changes are managed internally. |
| `onChange`     | `(graph: WorkflowGraph) => void` | -    | Fired after every change: node move, edge connect, label edit, node add/delete. |
| `height`       | `number`                      | `500`   | Canvas height in pixels.                                            |
| `className`    | `string`                      | `""`    | Additional classes on the root container.                           |

## Data Shape

```ts
type WorkflowNodeType = 'trigger' | 'condition' | 'action' | 'transform' | 'output';

interface WorkflowGraph {
  nodes: {
    id:       string;
    type:     WorkflowNodeType;
    label:    string;
    position: { x: number; y: number };
  }[];
  edges: {
    id:     string;
    source: string;
    target: string;
  }[];
}
```

## Node Types

Each type has a distinct shape and accent color so they are instantly recognisable in a dense graph. Shapes are achieved purely via CSS (border-radius and transform) so they remain legible UI components rather than clip-art icons.

| Type        | Icon | Shape                              | Accent color | Purpose                                              | Default label             |
|-------------|------|------------------------------------|--------------|------------------------------------------------------|---------------------------|
| `trigger`   | ⚡   | Pill (border-radius: 9999px)       | Brand        | Entry point: something that starts the workflow     | "When this happens"       |
| `condition` | ◇    | Diamond (80×80 square, rotate 45°, inside a 120×120 container) | Warning | Branching logic: a decision point in the flow | "If condition is met" |
| `action`    | ▶    | Standard card (border-radius: var(--radius)) | Success | Side effect: sends email, writes to DB, calls API | "Do something"         |
| `transform` | ⇄    | Sharp left, rounded right (4px 12px 12px 4px) | Text-muted | Data mutation: formats, maps, or filters a value | "Transform data"      |
| `output`    | ◼    | Flat top, curved bottom (4px 4px 14px 14px)  | Danger     | Terminal node: the final result or response      | "Return result"        |

The condition node occupies a 120×120 bounding box (vs 176px wide for the others) so the diamond fits without overflow. Its connection handles sit at the left and right midpoints of the bounding box, which coincide with the visual diamond tips.

## Interactions

| Action                  | How                                                                       |
|-------------------------|---------------------------------------------------------------------------|
| Move a node             | Drag the node card                                                        |
| Connect nodes           | Drag from a right-side handle to a left-side handle on another node       |
| Edit a label            | Click the label text; press Enter or click away to confirm                |
| Add a node              | Click a type button in the "Add node" panel (top-left)                    |
| Delete a node (button)  | Hover the node; click the × button that appears in the top-right corner   |
| Delete a node (keyboard)| Select it and press Delete or Backspace                                   |
| Delete an edge          | Select it and press Delete or Backspace                                   |
| Pan the canvas          | Click and drag on the background                                          |
| Zoom                    | Scroll wheel, or use the Controls panel buttons                           |
| Fit to view             | Click the fit button in the Controls panel                                |

## Run Animation

Click **▶ Run** in the toolbar to visualise workflow execution. A BFS traversal starts from all `trigger` nodes and propagates outward wave-by-wave.

**Timing (full motion)**

| Step | Duration |
|---|---|
| Initial trigger dwell | 300 ms |
| Pulse dot travels each edge | 600 ms |
| Active-node dwell before moving to next wave | 300 ms |
| "Complete" hold before resetting | 1 500 ms |

**Node states during animation**

| State | Visual |
|---|---|
| `idle` | Default appearance |
| `active` | Accent-coloured glow ring via `box-shadow` |
| `completed` | 60 % opacity + ✓ badge top-right |

**Edge state during animation**

An SVG `<circle r={5}>` travels along the bezier path using `<animateMotion>`. Each edge in the current wave animates simultaneously (branching condition nodes fire both outgoing edges in parallel).

**Reduced motion**: when `prefers-reduced-motion: reduce` is set, all delays collapse to near-zero and the traveling dot is never rendered; the graph snaps through states and resets after 600 ms.

**Stop / reset**: the button becomes **◼ Stop** while running. Clicking it (or pressing Stop from outside) increments an internal generation counter that cancels any in-flight async steps and immediately resets all visual states.

**Add-node buttons** are disabled (opacity 40 %, pointer-events off) while the animation is running.

## Accessibility

- The "Add node" toolbar is a `role="toolbar"`, with each button having a descriptive `aria-label`.
- Each node renders with `aria-label` stating its type and current label.
- Node label paragraphs have `role="button"` and `tabIndex={0}`; keyboard users can reach and activate them with Enter or Space.
- The label input supports Escape to cancel and Enter to confirm.
- Canvas pan/zoom interactions are handled by `@xyflow/react`'s built-in keyboard support (arrow keys pan, +/- zoom).
- React Flow's Controls panel provides focus-accessible zoom/fit buttons.

## Tokens Used

| Token                       | Usage                                      |
|-----------------------------|--------------------------------------------|
| `--color-surface`           | Node card background, handle fill          |
| `--color-surface-border`    | Node border, canvas dot grid color         |
| `--color-surface-border-hover` | Handle border                           |
| `--color-surface-hover`     | Add-node toolbar button hover              |
| `--color-text`              | Node label text                            |
| `--color-text-subtle`       | Node type badge text                       |
| `--color-brand`             | Trigger accent, connection line preview    |
| `--color-brand-ring`        | Focus ring on label / node selection ring  |
| `--color-warning`           | Condition accent                           |
| `--color-success`           | Action accent                              |
| `--color-text-muted`        | Transform accent                           |
| `--color-danger`            | Output accent; delete button hover tint    |
| `--shadow`                  | Node card shadow                           |
| `--shadow-sm`               | Add-node toolbar shadow                    |
| `--radius`                  | Node card corner radius                    |
| `--radius-lg`               | Container corner radius                    |
| `--radius-sm`               | Toolbar button corner radius               |
| `--duration-fast`           | Toolbar button hover transition            |

## When to Use

- Visual workflow editors, automation builders, decision-tree designers
- Anywhere the user needs to define a sequence of typed operations by connecting them visually
- Configuration UIs where the structure (not just the values) is user-defined

Not a substitute for a read-only force-directed graph (`Graph`) or a static diagram: use WorkflowBuilder when editing is the primary goal.
