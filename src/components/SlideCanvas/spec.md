# SlideCanvas

A fixed-ratio slide stage that scales to fit, with free-positioned elements you can select, drag, resize, and nudge with the keyboard.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| elements | `T[]` (`T extends SlideElement`) | None | Elements on the slide, with any extra fields of your own. Array order is stacking order (last is on top). |
| onElementsChange | `(elements: T[]) => void` | None | Called with the updated array on move, resize, or delete. |
| renderToolbar | `(element: T, state) => ReactNode` | None | Floating toolbar for the selected element, rendered above it (or below, near the slide's top edge) at normal, unscaled size. Return `null` for none. |
| renderElement | `(element: T, state: { selected: boolean; editing: boolean }) => ReactNode` | None | Renders an element's content. |
| width | `number` | `1280` | Logical slide width in px. All element coordinates use this space. |
| height | `number` | `720` | Logical slide height in px. |
| stageStyle | `CSSProperties` | None | Extra styles on the stage only, never the floating toolbar. Override design-token variables here (e.g. `--color-text`, `--color-brand`, `fontFamily`) to theme the slide's content. Size, background, and transform still come from the canvas. |
| backdrop | `ReactNode` | None | Decorative layer behind the elements, filling the stage (e.g. `Particles`). `aria-hidden` and `pointer-events-none`. |
| scale | `number` | None | Fixed zoom (1 = 100%). The frame becomes `width × scale` px wide. Omit to fit the container width. |
| onScaleChange | `(scale: number) => void` | None | Reports the effective scale, e.g. to show a zoom percentage in fit mode. |
| background | `string` | None | Any CSS background for the stage. Defaults to `bg-surface`. |
| gridSize | `number` | None | Snap moves and resizes to this grid, in logical px. Also sets the keyboard step. |
| snapToElements | `boolean` | `true` | Snap pointer drags and resizes to the edges and centers of other elements and the slide, showing guide lines. Hold Alt to bypass. |
| selectedId | `string \| null` | None | Controlled selection. Omit to let the canvas manage it. |
| onSelectedIdChange | `(id: string \| null) => void` | None | Called when the selection changes. |
| canEdit | `(element: T) => boolean` | None | Which elements can enter editing mode. Omit to disable editing. |
| editingId | `string \| null` | None | Controlled editing element. Omit to let the canvas manage it. |
| onEditingIdChange | `(id: string \| null) => void` | None | Called when editing starts or stops. |
| drawing | `boolean` | `false` | Draw mode: pointer drags anywhere on the slide draw a new region instead of selecting or moving elements. Shows a crosshair cursor and a dashed preview. |
| onDraw | `(from: SlidePoint, to: SlidePoint) => void` | None | Called when a draw-mode drag ends, with grid-snapped start and end points in slide px. The consumer decides what to create (text box, shape, line from `from` to `to`). |
| readOnly | `boolean` | `false` | Presentation mode: elements aren't focusable, selectable, draggable, or editable. |
| className | `string` | `''` | Additional classes on the outer frame. |

Extends native `<div>` HTML attributes (except `onChange`).

### SlideElement

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Stable identifier. |
| label | `string` | Accessible name, e.g. "Title". |
| x, y, width, height | `number` | Position and size in logical px. |

Add any fields your renderer needs (`type`, `text`, `src`, ...). The canvas only reads the geometry, `id`, and `label`.

## Variants

None.

## Editing Mode

Rendered content is `pointer-events-none` so the element itself is the drag target. Content is not clipped to the element's box (text can overflow, as in slide apps); renderers that need clipping, like images, clip themselves. To let users edit content in place (rich text, table cells), pass `canEdit`. Double-clicking an editable element, or pressing Enter on it, puts it in editing mode:

- `renderElement` receives `editing: true`; content becomes interactive and text-selectable.
- Dragging, resize handles, and the canvas's own keyboard shortcuts are off for that element; keys go to the content.
- The element's role switches from `button` to `group` so editable content isn't nested inside a button.
- Escape leaves editing mode and returns focus to the element. Clicking another element or the empty stage also exits.

## Snapping and Guides

During a pointer drag or resize, the moving rect snaps to the nearest edge or center line of any other element or of the slide, within 6 screen px (divided by the scale, so it feels the same at every zoom). Snapping applies after `gridSize`, so alignment wins over the grid. Moves can snap any of the rect's left/center/right and top/middle/bottom lines; resizes only snap the edges being dragged, so the pinned corner never moves. While a snap is active, a 1px guide line spans the slide at the matched position (`bg-danger`, chosen because it's vivid in every theme, like slide apps' red guides). Guides clear on release. Holding Alt bypasses snapping. Keyboard nudges never snap.

## Floating Toolbar

`renderToolbar` renders outside the scaled stage, so it stays at normal size at any zoom. It sits 8px above the selected element, flipping below it when there's under 52px of room above, and anchors to the element's right edge when the element is in the slide's right half. Alt+F10 on a focused element moves focus into the toolbar; Escape inside it returns focus to the element.

## Draw Mode

With `drawing`, a pointer drag anywhere on the stage (including over existing elements, which are not moved or selected) draws a dashed preview rect; on release `onDraw(from, to)` receives both points, grid-snapped and clamped to the slide. Keeping the raw points (not just a rect) lets a consumer draw directed lines and arrows. The draft is mirrored in a ref so the final point is never lost to an unrendered last pointermove. Draw mode is pointer-only by nature; consumers should offer a keyboard path that inserts a default-size element instead (`SlideEditor` does this when a tool is picked from the keyboard).

## Scaling

The frame takes the full container width with `aspect-ratio: width / height`. The stage inside is laid out at the logical size and scaled with `transform: scale()`, measured with a `ResizeObserver`. Pointer deltas are divided by the scale, so dragging stays 1:1 with the cursor at any size. Resize handles counter-scale through `--slide-scale` so they stay 24px on screen.

## Interactive States

- **Element hover**: 1px `outline-input-border-hover` outline (not in read-only mode).
- **Element selected**: 2px `outline-brand` outline with a 2px offset, plus four corner resize handles.
- **Element focus-visible**: `ring-2 ring-offset-2 ring-brand-ring`, shown alongside the selection outline.
- **Dragging**: `cursor-move` on elements; corner handles use diagonal resize cursors. Moves and resizes are clamped to the slide and snap to `gridSize` when set. Minimum element size is 16px.
- **Read-only**: no hover outline, no move cursor, no handles, `tabIndex=-1`.

## Accessibility

- Frame: `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide"` (overridable).
- Elements: focusable `role="button"`, `aria-roledescription="slide element"`, `aria-label` from `label`, `aria-pressed` reflects selection. Elements are in DOM tab order (array order); focusing one selects it.
- Enter (or double-click) enters editing mode on elements allowed by `canEdit`; Escape exits it.
- Keyboard on a focused element: Arrows move 1px (Shift: 10px; with `gridSize`, one grid step). Alt/Option + Arrows resize from the bottom-right corner. Delete/Backspace removes it. Escape clears the selection.
- A polite `role="status"` live region announces the new position and size after keyboard moves and pointer drags ("Title: x 120, y 80, 400 by 80"), and announces deletions.
- Alt+F10 moves focus into the floating toolbar (the common editor-toolbar shortcut); Escape returns to the element.
- Resize handles are pointer-only and `aria-hidden`; keyboard resizing is via Alt + Arrows. Their hit area is 24px (screen px, at any zoom), growing to 44px with a larger dot on coarse pointers (`@media (pointer: coarse)`), so they're usable by touch.
- Not an overlay: no focus trap.

## When to Use

Use SlideCanvas for slide, poster, or card editors where elements sit at absolute positions on a fixed-size artboard. For freehand drawing, use `Canvas`. For node-and-edge diagrams, use `WorkflowBuilder` or `Graph`. For grid-based dashboards, use `Mosaic`.

## Tokens Used

- `bg-surface`: slide background, handle fill
- `border-surface-border`: frame border
- `--shadow`: frame shadow
- `outline-brand`, `border-brand`: selection outline and handle border
- `outline-input-border-hover`: hover outline
- `ring-brand-ring`: focus-visible ring
- `--radius`, `--radius-sm`, `--border-width`

## Installation

```bash
npx dafink-ui add slide-canvas
```

npm dependencies: none
No registry dependencies.
