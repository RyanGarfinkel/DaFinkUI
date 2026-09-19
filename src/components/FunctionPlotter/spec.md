# FunctionPlotter

An interactive 2D mathematical function plotter. Users enter one or more single-variable equations and see them graphed on a zoomable, pannable HTML5 canvas. Supports up to six simultaneous equations.

---

## Installation

```bash
npx dafink-ui add function-plotter
```

Requires `mathjs`. No registry dependencies.

---

## Props

| Name               | Type       | Default                    | Description                                                     |
|--------------------|------------|----------------------------|-----------------------------------------------------------------|
| `initialEquations` | `string[]` | `['2*x + 1', 'x^2']`      | Equations pre-loaded on mount. Max 6. Excess entries are sliced. |
| `height`           | `number`   | `400`                      | Canvas height in px. Width is always responsive (full container). |
| `className`        | `string`   | `''`                       | Additional classes merged onto the root wrapper div.             |
| `readOnly`         | `boolean`  | `false`                    | Hides the equation list/editor, leaving just the plot and zoom controls. |
| `tooltip`          | `boolean`  | `true`                     | Shows an (x, y) tooltip when hovering near a plotted curve.      |
| `layout`           | `'bottom' \| 'side'` | `'bottom'`        | `'bottom'` flows the equation list below the canvas (default). `'side'` places it beside the canvas as a bordered panel once the component is wide enough (see Layout below). Has no effect when `readOnly` — there's no list to position. |

---

## Expression Syntax

Equations are parsed and evaluated by [mathjs](https://mathjs.org)'s expression parser (`math.parse(expr).compile().evaluate({ x })`), **not** `new Function`/`eval` — the string is never handed to the JS engine. mathjs's grammar is math-only (operators, numbers, function calls, implicit multiplication), and its `AccessorNode` already refuses property access like `.constructor`, so there is no path from an equation string to arbitrary JS.

On top of that, a handful of mathjs functions that mathjs's own docs call out as unsafe for untrusted expressions are explicitly disabled before any equation is parsed: `import`, `createUnit`, `simplify`, `derivative`, `resolve`, `evaluate`, `parse`, `parser`, `compile`, `help`, `reviver`. These can rebind functions, mutate mathjs's global unit registry, or (for `simplify`/`derivative`) blow up on crafted input — none of them are needed to plot `y = f(x)`. Everything else mathjs offers (trig, hyperbolic, log, stats, rounding, etc.) is available as normal.

Common syntax:

| Category      | Examples                                                                   |
|----------------|----------------------------------------------------------------------------|
| Operators      | `+  -  *  /  %  ^` (power)                                                |
| Variable       | `x`                                                                        |
| Constants      | `pi`, `e`                                                                  |
| Functions      | `sin cos tan asin acos atan atan2 sinh cosh tanh sqrt cbrt abs log log10 log2 exp floor ceil round sign min max pow`, and more of mathjs's [function reference](https://mathjs.org/docs/reference/functions.html) |
| Grouping       | `(...)`, function calls with comma-separated args (e.g. `atan2(x, 1)`)    |
| Implicit mult. | `2x` → `2*x`, `2(x+1)` → `2*(x+1)`, `x sin(x)` → `x*sin(x)`, etc. (native mathjs behavior) |

Note: `log(x)` is natural log (matches mathjs, not `Math.log10`) — use `log10(x)` explicitly for base-10. `e^x` is written `e^x` or `exp(x)`.

An equation is valid only if it parses **and** evaluates to a plain `number` at `x=0`. This excludes not just parse errors but also inputs mathjs accepts syntactically without producing a plottable value — a function assignment (`f(x) = x^2`), a bare comparison (`x > 1`), or anything returning a matrix/unit/complex value. Any of these mark the input invalid (`aria-invalid="true"`, red border) and the curve isn't drawn. Once validated, subsequent points that happen to evaluate to a non-number (rare, since the shape of a valid expression doesn't change per-point) are treated as `NaN` and simply lift the pen.

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

## Hover Tooltip

When `tooltip` is `true` (the default), moving over the canvas finds the plotted curve whose screen `y` is closest to the pointer at that `x`, within `16px`. If one is within range, a small dot marks the point on the curve and a tooltip above it shows `(x, y)` in the curve's color, each value rounded to 4 significant figures. Moving more than `16px` from every curve, leaving the canvas, or starting a drag to pan all clear the tooltip. This is pointer-hover only — there's no keyboard-accessible equivalent for inspecting a specific point yet.

---

## Active Equation, Extrema & Intersections

One equation can be "active" at a time, tracked as `activeId` (internal state, not a prop):

- **Set active** by clicking its curve (a plain click — not a drag — within `16px`, same hit-test as the hover tooltip) or by focusing its input in the equation list.
- **Cleared** by clicking empty canvas (no curve within range), or when its equation is removed.
- **Visual**: the active curve renders at `lineWidth 3` and full opacity; every other curve drops to `35%` opacity. Its row in the equation list gets a `bg-surface-hover` + `ring-brand-ring/40` highlight. When nothing is active, all curves render identically (`lineWidth 2`, full opacity) — the pre-existing behavior.

While an equation is active, its local minima and maxima **within the current viewport** are marked with a small filled dot (its curve color, ringed in the surface color for contrast). Detection is numeric, not symbolic — `derivative` is one of the mathjs functions disabled for [security](#expression-syntax), so extrema come from watching the discrete slope between adjacent sampled pixels for a sign change, then refining that rough location into a precise `(x, y)` via 40 iterations of ternary search over the few-pixel-wide window around it. A sample landing on exactly zero slope (common right at a symmetric vertex under the default centered viewport, e.g. `x^2` at `x=0`) is skipped rather than recorded as the new reference slope — otherwise it erases the sign needed to catch the flip on the very next sample, silently hiding the extremum. Capped at 12 dots per draw as a defensive limit; recomputed on every redraw, so panning/zooming updates which extrema are visible in real time.

While an equation is active, every pair of curves that includes it is also checked for **intersections within the current viewport**, marked with a small dot in `--color-text` (a neutral color, since it doesn't belong to one curve). Same numeric technique as extrema, but finding a root of the *difference* between two curves — a sign change in `(a - b)` between adjacent samples brackets a crossing, refined via 40 iterations of bisection (with the same zero-diff-sample skip as extrema). Like extrema, intersections are gated behind having an active equation: with nothing active, no intersection dots show at all; once a curve is active, only intersections involving it appear (an intersection between two *other*, non-active curves stays hidden). Capped at 16 intersection dots per draw.

**Clicking a dot** — extremum or intersection — opens a small pinned popup above it — `role="dialog"` — showing a color swatch and `(x, y)` (same 4-significant-figure formatting as the hover tooltip) with a close button. The kind of point (`Min`, `Max`, or `Intersection`) isn't shown as visible text — it's conveyed only via `aria-label` on the dialog, for screen readers. Unlike the hover tooltip, this popup is click-anchored and persists as you move the mouse away. It closes on: clicking the same dot again, clicking the close button, pressing <kbd>Escape</kbd>, clicking elsewhere on the canvas, or panning/zooming (its screen position isn't continuously re-derived from world coordinates during those, so it closes rather than drift out of sync — the same tradeoff the hover tooltip makes). As with the tooltip, there's no non-pointer way to select a curve or open a dot's popup in the first place; once open, though, the popup's close button is keyboard-reachable and Escape works regardless of input method.

---

## Equation Controls

- Up to 6 equations can be active simultaneously.
- Each equation row is a single bordered field containing a colored dot (matching the curve), a borderless `font-mono` text input, and a remove button — the row itself carries the border and focus ring rather than the `<input>`, so focusing/hovering/erroring is one visual unit instead of a separate dot + boxed input.
- Focus state lives on the row via `focus-within:ring-2 focus-within:ring-offset-2`, not on the input directly — the input itself has no visible focus ring of its own, which is what makes the merged look possible without losing the required focus indicator.
- The remove button is `disabled` when only one equation remains.
- The Add equation button is `disabled` when 6 equations are present.
- Entering an invalid expression turns the row's border/background danger-colored and sets `aria-invalid="true"` on the input. The equation is skipped during rendering.
- The active equation's row additionally gets a `border-brand-ring/50 bg-surface-hover` tint (independent of and layered with the danger/focus states).

---

## Layout

The root wrapper is a `@container`, so the `layout` prop's effect is driven by the component's own rendered width, not the viewport — it works correctly even when embedded in a narrow sidebar on a wide screen (per the container-query-over-breakpoint convention `Card`/`DataTable` already use).

- **`'bottom'`** (default): canvas on top, equation list flows below it as a plain list — no extra panel border, matching the original layout.
- **`'side'`**: canvas and equation list sit in a `flex flex-col @3xl:flex-row` container. Below the `@3xl` (48rem / 768px) container threshold, it's identical to `'bottom'` except the list is wrapped in a bordered `bg-surface-panel` card. At `@3xl` and up, that same card becomes a `w-72` sidebar beside the canvas (`flex-1 min-w-0`), so the canvas still gets all the remaining width.
- `readOnly` overrides `layout` entirely: with no equation list to place, `layout` has nothing to act on.

---

## Color Palette

Curve colors are fixed hex values assigned in round-robin order:

```ts
['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899']
```

These are intentional plot colors, not design tokens.

---

## Canvas Rendering

1. **Background**: filled with `--color-surface`.
2. **Grid**: "nice" step computed as the smallest value in `[0.25, 0.5, 1, 2, 5, 10, 25, 50, 100]` where `step × scale ≥ 60px`. Grid lines use `--color-surface-border`.
3. **Axes**: x-axis (y=0) and y-axis (x=0) rendered in `--color-text-subtle`, lineWidth 1.5.
4. **Tick labels**: at each grid line, numeric label in `10px system-ui`. Labels within 20px of the origin are skipped to avoid collision. Color: `--color-text-muted`.
5. **Curves**: sampled at every pixel column. `NaN`, `Infinity`, or `|screenY| > height × 10` lifts the pen. lineWidth 2, lineCap/lineJoin `round`.
6. **DPR scaling**: canvas physical pixels are scaled by `devicePixelRatio`. The context is pre-scaled so all draw calls use CSS pixel coordinates.

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

Use `FunctionPlotter` when you need an exploratory mathematical visualization embedded in a UI: education tools, data exploration pages, documentation for numerical functions, or any context where end users benefit from interactively graphing equations without leaving the application.

Do not use it to display static charts or non-mathematical data; reach for the `LineChart` or `AreaChart` components instead.
