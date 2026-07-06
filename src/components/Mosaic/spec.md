# Mosaic

A drag-and-drop grid for metric tiles. Users can reposition tiles by dragging to any grid cell — including empty cells — and resize them by dragging the edge handles. Tiles that are displaced by a drag animate smoothly to their new positions.

---

## Components

### Mosaic

The container. Manages the dnd context, column-width measurement, and layout state callbacks.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `MosaicTileLayout[]` | — | **Required.** Array of tile layout entries with explicit positions. |
| `onLayoutChange` | `(layout: MosaicTileLayout[]) => void` | — | **Required.** Called when tiles are moved or resized. |
| `cols` | `number` | `12` | Number of grid columns. |
| `rowHeight` | `number` | `160` | Base row height in pixels. |
| `gap` | `number` | `16` | Gap between tiles in pixels. |
| `minColSpan` | `number` | `1` | Minimum column span a tile can shrink to. |
| `minRowSpan` | `number` | `1` | Minimum row span a tile can shrink to. |
| `maxColSpan` | `number` | `cols` | Maximum column span. Defaults to the full grid width. |
| `maxRowSpan` | `number` | `4` | Maximum row span. |
| `className` | `string` | `""` | Additional classes on the grid container. |

### MosaicTile

An individual grid tile. Provides drag and resize handles. Renders children as a render prop (receives current size) or as a static ReactNode.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | **Required.** Must match the corresponding `id` in the parent `layout` array. |
| `className` | `string` | `""` | Additional classes on the tile wrapper. |
| `children` | `ReactNode \| ((size: MosaicTileSize) => ReactNode)` | — | Static content or a render prop called with `{ colSpan, rowSpan }`. |

### MosaicTileLayout

```ts
interface MosaicTileLayout {
  id:      string;
  col:     number;    // 1-based column start position
  row:     number;    // 1-based row start position
  colSpan: number;
  rowSpan: number;
}
```

### MosaicTileSize

```ts
interface MosaicTileSize {
  colSpan: number;
  rowSpan: number;
}
```

---

## Interaction

### Drag to reposition

Each tile shows a 6-dot grip handle in the top-right corner on hover. Dragging it moves the tile to any empty cell or swaps it with the tile currently occupying the target cell.

- The DragOverlay ghost renders the tile's actual content and snaps to the nearest grid cell that yields a valid placement — not necessarily the cell directly under the pointer.
- If the target cell is occupied by exactly one other tile, that tile slides to the vacated position (swap). If it is empty, the dragged tile moves there and no other tile moves.
- Positions that would require displacing two or more tiles simultaneously are treated as invalid. Rather than freezing the ghost over a dead zone, the grid is scanned for the closest cell (by pixel distance) that is either empty or resolves to a clean single-tile swap, and the ghost snaps there instead — so wherever the ghost is shown, dropping there always has an effect.
- Drag activation requires moving 5px (prevents accidental drags on click).

### Resize width and height

Two resize handles appear on hover:
- **Right edge** — drag left/right to change `colSpan`
- **Bottom edge** — drag up/down to change `rowSpan`

The tile visually resizes live during the drag. The layout is committed on pointer release.

### Adaptive tile content

When `children` is a function, it receives the current `{ colSpan, rowSpan }` and re-renders whenever those values change:

```tsx
<MosaicTile id="revenue">
  {({ colSpan }) => (
    colSpan >= 4
      ? <RevenueChart />
      : <RevenueStat />
  )}
</MosaicTile>
```

---

## Accessibility

- Grid container has `role="grid"` and `aria-label="Mosaic"`
- Drag handles have `aria-label="Drag to reposition {id}"` and accept keyboard interaction via dnd-kit's keyboard sensor
- Resize handles are `aria-hidden` — resize is pointer-only
- `prefers-reduced-motion` is respected via `motion-safe:` Tailwind prefixes on all transitions

---

## When to Use

- Analytics dashboards where users arrange metric cards
- Customisable home screens or workspace views
- Any layout where the user should control the position and emphasis of panels, including layouts with intentional empty cells

---

## Dependencies

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

All three are peer dependencies — install them if not already present.

---

## Installation

```bash
npx @dafink/ui add mosaic
```

npm dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
No registry dependencies.
