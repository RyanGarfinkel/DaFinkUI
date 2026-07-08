# FunctionPlotter

An interactive 2D mathematical function plotter. Users enter one or more single-variable equations and see them graphed on a zoomable, pannable HTML5 canvas. Supports up to six simultaneous equations.

---

## Installation

```bash
npx dafink-ui add function-plotter
```

No npm dependencies. No registry dependencies.

---

## Props

| Name               | Type       | Default                    | Description                                                     |
|--------------------|------------|----------------------------|-----------------------------------------------------------------|
| `initialEquations` | `string[]` | `['2*x + 1', 'x^2']`      | Equations pre-loaded on mount. Max 6. Excess entries are sliced. |
| `height`           | `number`   | `400`                      | Canvas height in px. Width is always responsive (full container). |
| `className`        | `string`   | `''`                       | Additional classes merged onto the root wrapper div.             |

---

## Expression Syntax

Equations are plain JavaScript expressions with `x` as the variable. Supported shorthands:

| Input       | Interpreted as |
|-------------|----------------|
| `x^2`       | `x**2`         |
| `2x`        | `2*x`          |
| `x3`        | `x*3`          |
| `sin(x)`    | `Math.sin(x)` — not natively supported; use `Math.sin(x)` |

Expressions are evaluated with `new Function` in strict mode. If parsing or evaluation at `x=0` throws, the input is marked invalid (`aria-invalid="true"`, red border). The curve for that equation is not drawn.

---

## Viewport

The viewport is kept in a ref (`cx`, `cy`, `scale`) to avoid re-renders during continuous pan and zoom.

| Field   | Type     | Default | Meaning                          |
|---------|----------|---------|----------------------------------|
| `cx`    | `number` | `0`     | World x-coordinate at canvas center |
| `cy`    | `number` | `0`     | World y-coordinate at canvas center |
| `scale` | `number` | `60`    | Pixels per world unit            |

World → screen conversion:
```
screenX = width/2  + (worldX - cx) * scale
screenY = height/2 - (worldY - cy) * scale   // y-axis is flipped
```

---

## Interactions

| Gesture / Action      | Behavior                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| Drag on canvas        | Pans the viewport. Uses `setPointerCapture` for reliable tracking.       |
| Scroll wheel on canvas | Zooms in/out keeping the world point under the cursor fixed. Scale clamped 5–5000. |
| Zoom In button (+)    | Multiplies scale by 1.5.                                                 |
| Zoom Out button (−)   | Divides scale by 1.5.                                                    |
| Reset View button     | Returns viewport to `{ cx: 0, cy: 0, scale: 60 }`.                      |

---

## Equation Controls

- Up to 6 equations can be active simultaneously.
- Each equation row shows a colored dot (matching the curve), a text input, and a remove button.
- The remove button is `disabled` when only one equation remains.
- The Add equation button is `disabled` when 6 equations are present.
- Entering an invalid expression applies a danger-colored border and sets `aria-invalid="true"`. The equation is skipped during rendering.

---

## Color Palette

Curve colors are fixed hex values assigned in round-robin order:

```ts
['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899']
```

These are intentional plot colors, not design tokens.

---

## Canvas Rendering

1. **Background** — filled with `--color-surface`.
2. **Grid** — "nice" step computed as the smallest value in `[0.25, 0.5, 1, 2, 5, 10, 25, 50, 100]` where `step × scale ≥ 60px`. Grid lines use `--color-surface-border`.
3. **Axes** — x-axis (y=0) and y-axis (x=0) rendered in `--color-text-subtle`, lineWidth 1.5.
4. **Tick labels** — at each grid line, numeric label in `10px system-ui`. Labels within 20px of the origin are skipped to avoid collision. Color: `--color-text-muted`.
5. **Curves** — sampled at every pixel column. `NaN`, `Infinity`, or `|screenY| > height × 10` lifts the pen. lineWidth 2, lineCap/lineJoin `round`.
6. **DPR scaling** — canvas physical pixels are scaled by `devicePixelRatio`. The context is pre-scaled so all draw calls use CSS pixel coordinates.

---

## Interactive States

| Element          | Hover                                 | Focus-visible                                          | Disabled                          |
|------------------|---------------------------------------|--------------------------------------------------------|-----------------------------------|
| Equation input   | `border-input-border-hover`           | `ring-2 ring-offset-2 ring-brand-ring`                 | N/A (never disabled)              |
| Remove button    | `bg-surface-hover text-text`          | `ring-2 ring-offset-2 ring-brand-ring`                 | `opacity-40 pointer-events-none`  |
| Add button       | `bg-surface-hover text-text border-surface-border-hover` | `ring-2 ring-offset-2 ring-brand-ring` | `opacity-40 pointer-events-none` |
| Zoom buttons     | `bg-surface-hover text-text`          | `ring-2 ring-offset-2 ring-brand-ring`                 | N/A                               |

Invalid equation input: `border-danger ring-danger-ring`.

---

## Accessibility

- The `<canvas>` has `role="img"` and `aria-label="Function plot"`.
- Every equation input has `aria-label="Equation N"` (1-indexed) and `aria-invalid` reflecting parse state.
- Every remove button has `aria-label="Remove equation N"`.
- The Add button has `aria-label="Add equation"`.
- Zoom buttons have descriptive `aria-label` values: `"Zoom in"`, `"Zoom out"`, `"Reset view"`.
- All interactive elements are keyboard-reachable via Tab.
- All animations and transitions respect `prefers-reduced-motion` via the global `globals.css` rule.
- Decorative SVG icons are `aria-hidden="true"`.

---

## Tokens Used

| Token                      | Where used                          |
|----------------------------|-------------------------------------|
| `--color-surface`          | Canvas background, input background, zoom controls background |
| `--color-surface-hover`    | Button hover backgrounds            |
| `--color-surface-border`   | Canvas wrapper border, grid lines, zoom controls border, Add button border |
| `--color-surface-border-hover` | Add button border on hover      |
| `--color-text`             | Primary text, button active text    |
| `--color-text-muted`       | Equation inputs text, button default text, tick labels |
| `--color-text-subtle`      | Axis lines, input placeholder       |
| `--color-input-border`     | Equation input border (valid)       |
| `--color-input-border-hover` | Equation input border on hover    |
| `--color-brand-ring`       | Focus ring on buttons and valid inputs |
| `--color-danger`           | Invalid input border                |
| `--color-danger-ring`      | Focus ring on invalid inputs        |
| `--duration-fast`          | All transition durations            |

---

## When to Use

Use `FunctionPlotter` when you need an exploratory mathematical visualization embedded in a UI — education tools, data exploration pages, documentation for numerical functions, or any context where end users benefit from interactively graphing equations without leaving the application.

Do not use it to display static charts or non-mathematical data — reach for the `LineChart` or `AreaChart` components instead.
