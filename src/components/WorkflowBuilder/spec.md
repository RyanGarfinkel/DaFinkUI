# WorkflowBuilder

A drag-and-drop graph editor for generic input/logic/output nodes. Users connect nodes visually and edit each node's title, description, and ports in a docked inspector panel; the component outputs a serializable `WorkflowGraph` object (nodes + edges) via an `onChange` callback.

## Installation

```bash
npx dafink-ui add workflow-builder
```

**npm dependency:** `@xyflow/react`

**Registry dependency:** `toggle-group` (powers the horizontal/vertical layout toggle; installed automatically by the CLI)

Also add the React Flow stylesheet to your entry CSS:

```css
@import '@xyflow/react/dist/style.css';
```

Or in a layout/root component:

```ts
import '@xyflow/react/dist/style.css';
```

## Props

| Prop               | Type                              | Default        | Description                                                         |
|--------------------|-----------------------------------|----------------|-----------------------------------------------------------------------|
| `defaultGraph`     | `WorkflowGraph`                   | -              | Pre-populated graph. Nodes and edges are loaded on first render only. Not reactive: subsequent changes are managed internally. |
| `onChange`         | `(graph: WorkflowGraph) => void`  | -              | Fired after every change: node move, edge connection, inspector panel edit (title/description/ports), node add/delete. |
| `height`           | `number`                          | `500`          | Canvas height in pixels.                                            |
| `className`        | `string`                          | `""`           | Additional classes on the root container.                           |
| `defaultDirection` | `'horizontal' \| 'vertical'`      | `'horizontal'` | Initial flow orientation. Not reactive after mount — the user can still switch orientation live via the "Layout" toggle in the toolbar. When no `defaultGraph` is given and `defaultDirection` is `'vertical'`, the built-in demo graph is auto-laid-out vertically on first render. |

## Data Shape

```ts
interface WorkflowPort {
  id:    string;
  label: string;
}

interface WorkflowGraph {
  nodes: {
    id:           string;
    label:        string;          // node title
    description?: string;          // free-text "logic" shown on the card + editable in the panel
    inputs:       WorkflowPort[];  // 0+ named input ports
    outputs:      WorkflowPort[];  // 0+ named output ports
    position:     { x: number; y: number };
  }[];
  edges: {
    id:           string;
    source:       string;
    target:       string;
    sourceHandle: string;          // id of the source node's output port
    targetHandle: string;          // id of the target node's input port
  }[];
}
```

## Node Model

Every node is the same shape: it has zero-or-more **inputs**, some free-text **logic** (title + optional description), and zero-or-more **outputs**. There is no fixed vocabulary of node types — a node's role in the graph is entirely determined by its ports:

- A node with **0 inputs** is an **entry point** — nothing needs to happen before it, so the run animation starts there and the auto-layout treats it as level 0.
- A node with **0 outputs** is **terminal** — nothing flows out of it.
- A node can have any number of inputs and outputs (e.g. a branching node with 2 outputs, or a merge node with 2 inputs); each port gets its own connection handle.

Ports are rendered along the node's edges, direction-aware: in horizontal layout, inputs stack down the left edge and outputs stack down the right edge; in vertical layout, inputs spread across the top edge and outputs spread across the bottom edge. Each port `<Handle>` is positioned via CSS absolute positioning relative to its own row/cell (not the whole card), so this works regardless of card height or port count. Handle `id` is the port's own `id` — required by `@xyflow/react` so multiple handles of the same type on one node resolve correctly.

Port **names are not shown on the canvas card** — only the dot — to keep nodes visually quiet; a port's `label` is a native `title` tooltip on hover, and the full editable name lives in the inspector panel (see "Editing" below).

## Interactions

| Action                     | How                                                                       |
|-----------------------------|---------------------------------------------------------------------------|
| Move a node                | Drag the node card; snaps to a 20px grid (matches the dot Background)     |
| Connect nodes               | Drag from an output handle to an input handle on another node (right→left when horizontal, bottom→top when vertical) |
| Select a node / open panel | Click the node card                                                       |
| Edit a node                | Select it, then edit Title / Description / Inputs / Outputs in the inspector panel (top-right) |
| Add a node                 | Click "Add node" in the toolbar (top-left); it starts with 1 input and 1 output |
| Switch layout direction    | Click "Horizontal" or "Vertical" in the "Layout" toggle (top-left panel)  |
| Delete a node (button)     | Hover the node; click the × button that appears in the top-right corner   |
| Delete a node (keyboard)   | Select it and press Delete or Backspace                                   |
| Delete an edge             | Select it and press Delete or Backspace                                   |
| Pan the canvas             | Click and drag on the background                                          |
| Zoom                       | Scroll wheel, or use the Controls panel buttons                           |
| Fit to view                | Click the fit button in the Controls panel                                |

## Editing: Node Inspector Panel

Clicking a node selects it (`selected: true`, managed internally by `@xyflow/react`'s node state) and opens a panel docked to the right edge of the canvas — full height, not a floating overlay. It disappears automatically when the node is deselected (clicking blank canvas, per React Flow's default behavior) or via its own close (×) button.

- **Node ID**: read-only, monospace, shown in the panel header for reference.
- **Title**: a text input bound to the node's `label`. Updates are live — no separate draft/commit step, since this is a form, not a click-to-edit affordance.
- **Description**: a textarea bound to the node's `description`.
- **Inputs** / **Outputs**: a list of rows, each a text input (the port's `label`) plus a × remove button, and a "+ Add input" / "+ Add output" button below the list. New ports default to the label `"in"`/`"out"`.
- **Removing a port also removes any edge connected to it** (matched by `sourceHandle`/`targetHandle` against the removed port's id) — this prevents dangling edges that reference a handle that no longer exists.

This is a **persistent, docked panel — not an overlay**. It does not need (and does not implement) any of the Modal/Dialog/Drawer/Popover focus-trap/Escape-close/`aria-modal` treatment described in `rules/new-component.md`'s "Popup and Overlay Components" section: that checklist applies to floating layers, and this panel is part of normal document layout the same way `Sidebar` is, just docked to the opposite edge (`border-l` instead of `border-r`). All of its fields use plain, normal tab order.

## Layout Direction

The "Layout" toggle in the toolbar switches the graph between a horizontal (left→right) and vertical (top→bottom) flow:

- Toggling **flips every port's handle positions** (`Position.Left`/`Position.Right` ↔ `Position.Top`/`Position.Bottom`, and the input/output column layout ↔ row layout) so connections always point the right way.
- Toggling also **re-runs an auto-layout pass**: nodes are grouped into levels via BFS from all entry nodes (nodes with 0 inputs — or, failing that, nodes with no incoming edges), then spread along the flow axis (260px per level) and across the cross axis (220px per sibling, wide enough to clear the node card's width), centered within their level.
- The canvas re-fits to the new layout (`fitView`) after the toggle.
- The toggle is disabled while the run animation is in progress.
- `defaultDirection` only sets the *initial* orientation; the toggle is the live, user-facing control. There is no `onDirectionChange` callback — orientation is not part of the serialized `WorkflowGraph`.

## Grid Snapping

Dragging a node snaps its position to a 20px grid (`GRID_SIZE` in `WorkflowBuilder.tsx`), via `@xyflow/react`'s `snapToGrid`/`snapGrid={[20, 20]}` props — the same value used for the dot `Background`'s `gap`, so the visible dots are exactly the grid nodes snap to, not just a similar-looking texture. A node added via the toolbar also gets its randomized initial position rounded to the nearest grid multiple, so it never starts off-grid.

## Run Animation

Click **▶ Run** in the toolbar to visualise workflow execution. Every entry node (0 inputs) activates immediately; from there, execution is a proper dependency-gated scheduler, not a simple breadth-first wave: **a node only activates once every edge feeding it has arrived**, not on the first one. A merge node with two connected inputs from branches of different lengths correctly waits for the slower branch — it does not fire early just because one input got there first. A node with multiple outputs fires all of them in parallel once it activates.

The animation is intentionally flat — no blur, no drop-shadow, no multi-dot particle trail — to match the minimal card/wire look. A single solid pulse crosses each edge once; active nodes get a crisp 2px brand-colored ring, not a glow.

**Implementation**: `runAnimation` builds `incomingEdges`/`outgoingEdges` maps, then recursively calls `activateNode` for each entry node (`Promise.all` across all entry nodes so independent branches run concurrently). After a node's outgoing edges finish animating, it checks, for each downstream target, whether *every* edge in that target's `incomingEdges` is now in a plain runtime `doneEdges` set (not React state — concurrent branches need synchronous read/write, which state updates batched across renders can't guarantee); only the branch that delivers the last required edge proceeds to activate the target (a `claimed` set prevents double-activation if that check ever raced). `doneEdges`/`claimed` are local to one `runAnimation()` call and discarded when it finishes.

**Timing (full motion)** — named constants in `WorkflowBuilder.tsx` (`TRIGGER_DWELL_MS`, `EDGE_TRAVEL_MS`, `NODE_DWELL_MS`, `COMPLETE_HOLD_MS`, `REDUCED_MOTION_HOLD_MS`); the edge pulse's `<animateMotion dur>` is derived from `EDGE_TRAVEL_MS` so they can never drift apart.

| Step | Duration |
|---|---|
| Initial entry-node dwell | 250 ms |
| Pulse travels each edge | 450 ms |
| Active-node dwell before its own outgoing edges start | 200 ms |
| "Complete" hold before resetting | 900 ms |

**Node states during animation**

| State | Visual |
|---|---|
| `idle` | Default appearance |
| `active` | Crisp 2px `var(--color-brand)` ring via `box-shadow: 0 0 0 2px var(--color-brand)` — no blur layer |
| `completed` | 60 % opacity + ✓ badge top-right |

**Edge state during animation**

Edges route as right-angle "step" paths (`getSmoothStepPath`, 8px corner radius) rather than curves, so the graph reads as a clean wiring diagram — **except** when the two handles are perfectly aligned (straight down for a vertical Bottom→Top connection, straight across for a horizontal Right→Left one), in which case `AnimatedEdge` uses `getStraightPath` instead: `getSmoothStepPath` otherwise draws a small unnecessary jog even when there's nothing to step around. A single flat SVG `<circle r={4}>` (solid brand fill, no filter) travels the step path once via `<animateMotion dur={EDGE_TRAVEL_MS}ms repeatCount="1">`, then unmounts the instant its wave ends — it never loops or lingers. The circle sets `cx`/`cy` to the edge's own source point so it starts anchored on the wire; without that, the browser briefly renders it at the SVG origin (the canvas's top-left corner) before the motion path takes over. Idle (non-animating, non-completed) edges are tinted with a brand/border color mix (`color-mix(in srgb, var(--color-brand) 45%, var(--color-surface-border-hover))`, 1.5px stroke) so the wiring reads as intentional even before Run is clicked. Completed edges hold flat brand-colored stroke at 35% opacity, no filter.

**Reduced motion**: when `prefers-reduced-motion: reduce` is set, all delays collapse to near-zero and the traveling pulse is never rendered; the graph snaps through states and resets after `REDUCED_MOTION_HOLD_MS` (400 ms).

**Run button**: a filled, full-width button in the toolbar with three visual states — idle (`bg-brand`/`text-brand-fg`, "▶ Run"), running (`bg-danger/10`/`text-danger`, "◼ Stop"), complete (`bg-success-bg`/`text-success`, "✓ Done", briefly disabled). Clicking it while running (or pressing Stop) increments an internal generation counter that cancels any in-flight async steps and immediately resets all visual states.

**The Add-node button** is disabled (opacity 40 %, pointer-events off) while the animation is running. So is the Layout toggle.

## Accessibility

- The "Add node" toolbar is a `role="toolbar"`, with its button carrying a descriptive `aria-label`.
- The "Layout" direction control is a `ToggleGroup` (`role="group"`) with roving tabindex between its two items; the active item carries `aria-pressed="true"`.
- Each node renders with `aria-label` stating its label and description (when present); `@xyflow/react` itself also gives every node `role="group"`, `tabIndex={0}`, and `aria-roledescription="node"`, so nodes sit in normal document tab order — not a roving-tabindex group — alongside the toolbar and inspector panel.
- Node keyboard interaction comes from React Flow's default keyboard support (not disabled here via `disableKeyboardA11y`): `Enter`/`Space` selects a focused node and opens the inspector panel, arrow keys reposition the selected node (`Shift`+arrow moves it further per press), `Escape` deselects it, and `Delete`/`Backspace` deletes the selected node or edge. None of this fires in `readOnly` mode.
- Connecting two nodes (dragging from an output handle to an input handle) is pointer/touch-only: `Handle` renders a plain, non-focusable `<div>` with only `onMouseDown`/`onTouchStart`/`onClick` — there is no keyboard path to wire two ports together.
- The node inspector panel (`aria-label="Node inspector"`) is a plain docked form region, not an overlay — see "Editing" above. Every field is a real `<label>`-associated `<input>`/`<textarea>`; port rows carry a descriptive `aria-label` (e.g. "Input port label", "Remove output out"); the close button is `aria-label="Close node inspector"`.
- Zooming/fitting the canvas is done via the Controls panel's own focusable buttons; there is no raw keyboard pan or +/- zoom shortcut on the canvas itself.

## Tokens Used

| Token                            | Usage                                                        |
|-----------------------------------|---------------------------------------------------------------|
| `--color-surface`                | Node card background, handle fill, inspector panel & field backgrounds |
| `--color-surface-border`         | Node border, canvas dot grid color, toolbar/panel borders    |
| `--color-surface-border-hover`   | Handle border, idle edge stroke color-mix                    |
| `--color-surface-hover`          | Add-node/toolbar button hover, panel close-button hover       |
| `--color-text`                   | Node title text, field input text                             |
| `--color-text-muted`             | Node description text                                         |
| `--color-text-subtle`            | Untitled-node placeholder, toolbar section headers, panel field captions, Node ID text |
| `--color-input-border`           | Title/Description/port-label field borders                    |
| `--color-brand`                  | Idle edge tint, run-pulse dot, active-node ring, Run button (idle) background, "+ Add input/output" link |
| `--color-brand-fg`               | Run button (idle) text                                        |
| `--color-brand-hover` / `--color-brand-active` | Run button (idle) hover/active                   |
| `--color-brand-ring`             | Focus-visible ring (toolbar, ToggleGroup, panel fields, node selection ring) |
| `--color-success`                | ✓ completed badge, Run button (complete) text                 |
| `--color-success-bg` / `--color-success-border` | Run button (complete) background/border          |
| `--color-danger`                 | Delete-button hover tint (node + port), Run button (running) text |
| `--color-danger-ring`            | Run button (running) focus ring                                |
| `--shadow`                       | Node card shadow                                               |
| `--shadow-sm`                    | Toolbar and inspector panel shadow                              |
| `--radius`                       | Node card corner radius                                        |
| `--radius-lg`                    | Container corner radius                                        |
| `--radius-sm`                    | Toolbar/Run/field input corner radius                           |
| `--border-width`                 | Inspector panel's left border width                             |
| `--duration-fast`                | Toolbar/button hover transition                                 |

## When to Use

- Visual node-based editors: automation builders, shader/material graphs, data pipelines, blueprint-style logic editors
- Anywhere the user needs to define a graph of input→logic→output nodes by connecting them visually, without a fixed vocabulary of node kinds
- Configuration UIs where the structure (not just the values) is user-defined

Not a substitute for a read-only force-directed graph (`Graph`) or a static diagram: use WorkflowBuilder when editing is the primary goal.
