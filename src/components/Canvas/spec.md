# Canvas

A freehand drawing surface built on the HTML5 Canvas API. Supports pen and eraser tools, a color palette, variable stroke widths, undo/redo, and PNG download. Pointer events handle mouse, stylus, and touch.

This component is a **docs showcase pattern** — it ships as a complete, copy-paste-owned component rather than a primitive you compose. Treat it as a starting point and extend it for your use case.

## Installation

```bash
npx dafink-ui add canvas
```

No npm dependencies beyond React.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | container width | Canvas width in px. Defaults to responsive container width. |
| height | number | 400 | Canvas height in px |
| defaultColor | string | '#18181b' | Initial stroke color |
| defaultStrokeWidth | number | 4 | Initial stroke width in px |
| showToolbar | boolean | true | Whether to render the built-in toolbar |
| className | string | "" | Extra classes on the wrapper div |

## Toolbar

The built-in toolbar includes:

- **Tool selector** — Pen and Eraser toggle buttons
- **Color palette** — 9 preset colors (black, white, red, orange, yellow, green, blue, violet, pink)
- **Stroke width** — 4 sizes (2, 4, 8, 14 px)
- **Undo / Redo** — per-stroke history
- **Clear** — removes all strokes
- **Download** — saves the canvas as a PNG file

## Accessibility notes

- The canvas element has `role="img"` and `aria-label="Drawing canvas"`
- Tool buttons have `aria-pressed` for the active state
- Color swatches use `role="radio"` within a `role="radiogroup"`
- Stroke width buttons have `aria-pressed`
- All toolbar buttons have `aria-label` and `title` attributes
- Keyboard users can interact with all toolbar controls; the canvas surface itself is pointer-only (drawing on a canvas via keyboard is out of scope for this pattern)

## When to use

- Whiteboard and annotation surfaces
- Signature capture
- Simple sketch tools embedded in larger apps
- Collaborative drawing features (pair with a WebSocket layer for multiplayer)

## Tokens used

`--color-surface`, `--color-surface-hover`, `--color-surface-active`, `--color-surface-border`, `--color-text`, `--color-text-muted`, `--color-brand`, `--color-brand-ring`

Note: the canvas background is always white (`bg-white`) so drawings look consistent regardless of theme.
