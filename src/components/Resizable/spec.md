# Resizable

A split-pane layout primitive composed of three sub-components: `Resizable`, `ResizablePanel`, and `ResizableHandle`. Lays out panels in a row or a column and lets the user drag a handle between two panels to resize the sized one, with min/max clamping and full keyboard support.

---

## Props

### Resizable

| Name      | Type                          | Default | Description                                                        |
|-----------|-------------------------------|---------|----------------------------------------------------------------------|
| direction | `'horizontal' \| 'vertical'`  | -       | Required. Axis panels split and resize along. `horizontal` renders a row (`flex-row`) and resizes widths; `vertical` renders a column (`flex-col`) and resizes heights. |
| className | string                        | `""`    | Additional CSS classes merged onto the root flex container.        |
| children  | ReactNode                     | -       | `ResizablePanel` and `ResizableHandle` elements, alternating.      |

Extends all native `<div>` HTML attributes.

### ResizablePanel

| Name        | Type      | Default | Description                                                                 |
|-------------|-----------|---------|-------------------------------------------------------------------------------|
| defaultSize | number    | -       | Initial size in pixels. When provided, this panel is a **sized** panel — it renders at an explicit width (horizontal) or height (vertical) and is the one a `ResizableHandle` next to it can drag. When omitted, the panel is the **flexible** panel: it renders `flex-1` with no explicit size and absorbs whatever space the sized panels don't use. A group is expected to have at most one flexible panel in practice — a handle only ever resizes the sized panel on one of its two sides — but nothing enforces that. |
| minSize     | number    | `120`   | Minimum size in pixels a sized panel can be dragged or keyed down to.       |
| maxSize     | number    | -       | Maximum size in pixels a sized panel can be dragged or keyed up to. Omit for no upper cap. |
| className   | string    | `""`    | Additional CSS classes merged onto the panel's root div.                    |
| children    | ReactNode | -       | Panel content. The panel clips overflow (`overflow-hidden`); content that needs its own scrolling should manage it internally (e.g. `ScrollFade`). |

Extends all native `<div>` HTML attributes.

### ResizableHandle

| Name       | Type   | Default            | Description                                                        |
|------------|--------|--------------------|------------------------------------------------------------------------|
| className  | string | `""`               | Additional CSS classes merged onto the handle.                     |
| aria-label | string | `'Resize panel'`   | Accessible name for the handle. Override with something specific to what it resizes, e.g. `"Resize chat sidebar"`. |

Extends all native `<div>` HTML attributes.

Must be placed as a JSX sibling directly between the two `ResizablePanel`s it resizes — it locates them via DOM sibling traversal (`previousElementSibling` / `nextElementSibling`), not props.

---

## How Resizing Works

Each `ResizableHandle` looks at its two DOM-adjacent siblings and finds whichever one is a **sized** panel (has `defaultSize`):

- If the **previous** sibling is sized, dragging/keying away from it (right for horizontal, down for vertical) grows it.
- Else if the **next** sibling is sized, dragging/keying toward it (left/up) grows it, since it sits on the far side of the handle.

During a pointer drag, the target panel's DOM element style is mutated directly (`element.style.width`/`height`) for smooth, per-frame updates without a React re-render on every `pointermove`. The final clamped value is committed to the panel's own React state once, on `pointerup`, so the size persists correctly across re-renders. Keyboard resizing (see below) always goes through the same clamp-and-commit path in one step, since there's no continuous drag to defer.

Every resize — pointer or keyboard — is clamped to `[minSize, maxSize]` before it's applied.

---

## Keyboard Behavior

`ResizableHandle` is a real focusable element (`role="separator"`, `tabIndex={0}`):

| Key                                    | Behavior                                                        |
|-----------------------------------------|-------------------------------------------------------------------|
| `ArrowRight` / `ArrowLeft` (horizontal) | Grow / shrink the sized panel by 16px (following the same "which side is sized" rule as drag). |
| `ArrowDown` / `ArrowUp` (vertical)      | Grow / shrink the sized panel by 16px.                            |
| `Shift` + arrow key                     | Same direction, 64px step instead of 16px.                       |
| `Home`                                  | Jump the sized panel to `minSize`.                                |
| `End`                                   | Jump the sized panel to `maxSize`. No-op if `maxSize` is unset.   |

All keyboard resizing is clamped identically to drag resizing.

---

## Accessibility

- `ResizableHandle` renders as two nested pieces: a full-length outer strip that's purely a larger pointer drag hit-area (not a tab stop), and a small centered knob — the visible "grab here" affordance — that carries `role="separator"`, `aria-orientation` set to the group's `direction`, `tabIndex={0}`, and `aria-valuenow` / `aria-valuemin` / `aria-valuemax` reflecting its sized panel's current size and bounds. One handle is always exactly one tab stop (the knob), regardless of the larger drag hit-area around it.
- Fully keyboard-operable: Tab reaches the knob, arrow keys (plus Home/End) resize — no drag required to reach any valid size. Satisfies WCAG 2.5.7 (dragging movements must have a single-pointer or keyboard alternative).
- Visible focus ring on the knob: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring`, matching this repo's standard focus treatment.
- `cursor-col-resize` (horizontal) / `cursor-row-resize` (vertical) on the handle. During an active pointer drag, the same cursor and `user-select: none` are also applied to `document.body`, restored on drag end, so the cursor doesn't flicker as the pointer crosses over panel content mid-drag.
- Plain mouse hover only ever changes the cursor — it does not recolor the handle. The full-length line and the knob change color for the two states that actually mean something is happening: focused (`group-focus-within`, covers both Tab and a plain click on the knob) and actively dragging (`isDragging`). The transition uses `motion-safe:transition-colors`, respecting `prefers-reduced-motion`.

---

## When to Use

Use `Resizable` for a layout where the user should be able to adjust how much space adjacent regions get: a sidebar next to a main content pane, a main pane next to a detail/thread panel, a code editor next to a preview pane. Use `direction="horizontal"` for side-by-side panels, `direction="vertical"` for stacked ones. Give every panel that should be independently draggable a `defaultSize`, and leave exactly one panel — the one that should absorb the remaining space — without one.

Don't use `Resizable` for a fixed layout that never needs user adjustment; a plain flex or grid layout is simpler and avoids the drag/keyboard interaction surface entirely.

---

## Tokens Used

| Token             | Usage                                      |
|--------------------|---------------------------------------------|
| `bg-surface-border`| Handle's default (idle) line/knob color    |
| `bg-brand`         | Handle's focused and active-drag line/knob color |
| `ring-brand-ring`  | Focus ring color                            |
| `--duration-fast`  | Handle color transition duration           |

---

## Installation

```bash
npx dafink-ui add resizable
```

npm dependencies: none
No registry dependencies.
