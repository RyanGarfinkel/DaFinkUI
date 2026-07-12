# SidePanel

A non-modal overlay panel that slides in from an edge of the screen but floats with margin on every side instead of sitting flush against the viewport edge, a rounded, elevated `Card` rather than an edge-to-edge sheet. The panel's visual surface is the real `Card` component (`variant="elevated"`): `SidePanelHeader`/`SidePanelContent`/`SidePanelFooter` are thin wrappers around `CardHeader`/`CardContent`/`CardFooter`, so it inherits Card's exact spacing, radius, and shadow tokens rather than duplicating them. Rendered via `createPortal` to `document.body` with `position: fixed`, so there are no z-index stacking-context issues, it's not clippable by ancestor overflow or transform, and (unlike a native `<dialog>` with `showModal()`) it never promotes to the top layer or makes the rest of the page inert. Has **no backdrop, no scroll lock, and no focus trap**: the rest of the page stays fully visible, undimmed, unblurred, scrollable, and clickable while the panel is open. It behaves like a docked utility panel rather than a modal: it stays open until Escape or an explicit close action, so any number of independent `SidePanel` instances, each with its own trigger elsewhere on the page, can be open at the same time. Panels opened on the same `side` automatically stack: opening a second one shifts every earlier same-side panel further toward the center (by that panel's own measured size), so all of them stay visible and clickable side by side; no manual positioning needed. Reads as visually distinct from `Drawer`: inset margin on all sides, a constrained width/height, and rounded corners on all four corners rather than square edge-flush corners. Composed of `SidePanel`, `SidePanelHeader`, `SidePanelTitle`, `SidePanelContent`, `SidePanelFooter`, and `SidePanelClose`.

---

## Installation

```bash
npx dafink-ui add side-panel
```

No additional npm packages required.

**Registry dependencies:** `card` (installed automatically): `SidePanel`'s floating surface is composed from the real `Card` component.

---

## Exports

| Export              | Type      | Description                                              |
|----------------------|-----------|----------------------------------------------------------|
| `SidePanel`          | Component | The panel root, default export. Renders the floating panel (no backdrop) and owns all focus / keyboard behavior. |
| `SidePanelHeader`    | Component | Layout wrapper for the title area.                       |
| `SidePanelTitle`     | Component | Heading element automatically wired to `aria-labelledby`.|
| `SidePanelContent`   | Component | Scrollable body content area (`flex-1 overflow-y-auto`). |
| `SidePanelFooter`    | Component | Action row, right-aligned.                               |
| `SidePanelClose`     | Component | An × button in the top-right corner that closes the panel. Auto-disables while blocked (see Stacking). |
| `SidePanelSide`      | Type      | `'left' \| 'right' \| 'top' \| 'bottom'`                 |
| `useSidePanelBlocked`| Hook      | Returns `true` when this panel has another panel open in front of it on the same side. Use it to disable any custom close controls you build instead of `SidePanelClose`. Must be called from a component rendered inside `<SidePanel>`. |

---

## Props

### SidePanel

| Prop           | Type                                     | Default   | Description                                              |
|----------------|------------------------------------------|-----------|----------------------------------------------------------|
| `open`         | `boolean`                                | -         | Controls whether the panel is rendered and visible (controlled). |
| `onOpenChange` | `(open: boolean) => void`                | -         | Called with `false` when the user dismisses via Escape or `SidePanelClose`. |
| `side`         | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Which edge of the screen the panel slides in from.        |
| `className`    | `string`                                 | `''`      | Additional classes merged onto the panel Card.           |
| `children`     | `ReactNode`                              | -         | SidePanel subcomponents and arbitrary content.            |

`SidePanel` extends `HTMLAttributes<HTMLDivElement>`; all native div props are spread onto the portaled panel element.

### SidePanelHeader / SidePanelContent / SidePanelFooter

| Prop        | Type        | Default | Description                              |
|-------------|-------------|---------|-------------------------------------------|
| `className` | `string`    | `''`    | Additional classes on the wrapper div.   |
| `children`  | `ReactNode` | -       | Content.                                 |

### SidePanelTitle

| Prop        | Type        | Default | Description                                                       |
|-------------|-------------|---------|---------------------------------------------------------------------|
| `className` | `string`    | `''`    | Additional classes on the `<h2>` element.                          |
| `children`  | `ReactNode` | -       | The panel title. Its id is referenced by the panel's `aria-labelledby`. |

### SidePanelClose

| Prop         | Type     | Default   | Description                                  |
|--------------|----------|-----------|------------------------------------------------|
| `aria-label` | `string` | `'Close'` | Accessible name for the close button.        |
| `className`  | `string` | `''`      | Additional classes on the button element.    |

---

## Variants (side)

| Side     | Panel placement                                       | Hidden transform     |
|----------|--------------------------------------------------------|-----------------------|
| `right`  | `inset-y-4 right-4 w-96 max-w-[calc(85vw_-_2rem)]`        | `translate-x-full`   |
| `left`   | `inset-y-4 left-4 w-96 max-w-[calc(85vw_-_2rem)]`         | `-translate-x-full`  |
| `top`    | `inset-x-4 top-4 h-96 max-h-[calc(85vh_-_2rem)]`          | `-translate-y-full`  |
| `bottom` | `inset-x-4 bottom-4 h-96 max-h-[calc(85vh_-_2rem)]`       | `translate-y-full`   |

The visual surface (rounded corners on all four sides (`rounded-[var(--radius)]`) and elevation (`shadow-[var(--shadow-lg)]`), no border) comes from the nested `Card variant="elevated"`, since the panel never sits flush against a viewport edge. This is the key visual distinction from `Drawer`, which is edge-to-edge (`inset-y-0`/`inset-x-0`, `h-full`/`w-full`) with square corners and a border only on the anchored edge.

The panel exposes `data-side` and `data-state="open" | "closed"` for style extension.

---

## Interactive States

| Element           | State         | Visual behavior                                                       |
|--------------------|---------------|-----------------------------------------------------------------------|
| `SidePanelClose`   | hover         | `bg-surface-hover`, text shifts from `text-text-muted` to `text-text` |
| `SidePanelClose`   | focus         | Browser outline suppressed (`focus:outline-none`)                     |
| `SidePanelClose`   | focus-visible | `ring-2 ring-offset-2 ring-brand-ring`                                |
| Panel             | focus         | `focus:outline-none`: the panel itself only receives focus as a fallback when there are no focusable children |

---

## Keyboard Behavior

| Key           | Behavior                                                                        |
|----------------|------------------------------------------------------------------------------------|
| `Escape`      | Closes the panel; calls `onOpenChange(false)`. Focus returns to the trigger.    |
| `Tab`         | Moves focus natively, not trapped. Tabbing past the panel's last focusable element moves focus to the next element in DOM order (the panel stays open). |
| `Enter/Space` | Activates the focused button (native behavior).                                  |

---

## Accessibility

### ARIA Roles

| Element          | Role / Attribute                                                            |
|-------------------|-------------------------------------------------------------------------------|
| Panel element     | `role="dialog"`, `aria-labelledby` → `SidePanelTitle` id (no `aria-modal`)    |
| Close             | `<button>` with `aria-label="Close"`, decorative icon `aria-hidden`           |

**No backdrop element, and not modal.** Unlike `Drawer`/`Modal`, `SidePanel` renders no dimming or blur layer over the rest of the page, and does not set `aria-modal`: the page behind it stays fully visible, clickable, and operable by keyboard/screen-reader while the panel is open. This is a deliberate, load-bearing difference from `Drawer`/`Modal`: those use native `<dialog>.showModal()`, which promotes to the top layer and makes the rest of the document `inert` (blocking clicks and focus) regardless of whether a visible backdrop is drawn. `SidePanel` never does this. It's a portaled `<div>`, not a `<dialog>`, specifically so multiple independent panels (each with its own trigger elsewhere on the page) can be open simultaneously without blocking each other.

### Focus Management

- **Focus entry:** focus moves to the first focusable element inside the panel immediately after the enter frame. If the panel contains no focusable elements, the panel itself (`tabIndex={-1}`) receives focus.
- **No focus trap:** Tab and Shift+Tab move focus natively. Tabbing out of the panel moves to the next/previous element in DOM order and the panel stays open; it does not wrap and does not close.
- **Escape:** closes the panel and stops propagation so nested overlays are not dismissed simultaneously. Focus returns to the trigger. No-op if the panel is currently blocked (see Stacking): a panel with another panel stacked in front of it can't be dismissed via Escape either.
- **No outside-click dismissal:** clicking elsewhere on the page, including a different `SidePanel`'s trigger, does **not** close the panel. This is what makes independent, simultaneously-open panels possible; the panel only closes via Escape or an explicit close action.
- **Focus return:** the element focused at open time is saved and re-focused whenever the panel closes, regardless of whether it closed via Escape, `SidePanelClose`, a footer action, or unmounting.

### No Scroll Lock

Unlike `Drawer`/`Modal`, `SidePanel` does **not** lock body scroll while open. The rest of the page remains fully scrollable and interactive. This is intentional: `SidePanel` is meant to be a lightweight, non-blocking utility panel (no backdrop, doesn't take up the full viewport, doesn't trap focus), so the main content behind it should keep behaving normally, including responding to the scroll wheel and mouse clicks.

### Reduced Motion

All transitions use the `motion-safe:` Tailwind variant, so the panel appears and disappears instantly when `prefers-reduced-motion: reduce` is set. Do not add per-component overrides.

---

## Stacking

Any number of `SidePanel` instances can be open at once. Panels on **different** sides never interact. Panels on the **same** side automatically stack: each one that opens joins a shared, module-level registry keyed by `side`, and every earlier panel on that side shifts further toward the center by the newly-opened panel's own measured size plus a fixed 16px gap, purely a position change, no dimming, scaling, or loss of interactivity. The most recently opened panel on a side always sits at the true edge position (`right-4`/`left-4`/etc.); each one behind it is offset by the cumulative size of everything opened after it.

- **Automatic, no wiring required:** any two (or more) `SidePanel` instances on the same side stack correctly, whether opened from a single shared trigger area or from a button *inside* an already-open panel (the common "drill-down" case, where a panel opens a more detailed panel next to it, pushing itself toward the center).
- **Sizes are measured, not assumed:** each panel reports its own rendered width (for `left`/`right`) or height (for `top`/`bottom`) via `ResizeObserver`, so custom-width/height panels (via `className` overrides) stack correctly without configuration.
- **Reversible:** closing the front-most panel removes it from the registry and every panel behind it snaps back toward the edge by that panel's size; closing "Advanced filters" returns "Filters" to its original position.
- **Pushed-back panels stay visible and readable, but can't be closed:** a panel with another panel open in front of it on the same side can't be dismissed. Escape and `SidePanelClose` are no-ops on it (`SidePanelClose` also renders `disabled`) until the panel in front of it closes first. Its content, scrolling, and focus keep working normally; only closing is blocked, so the panel that opened "in response to" it can't be left pointing at nothing. Use `useSidePanelBlocked()` to disable any custom close controls you build yourself instead of `SidePanelClose`.
- Implemented as a small external store (`src/components/SidePanel/sidePanelStack.ts`), not React context, so it works across the whole app without requiring a shared provider ancestor. The offset is applied via an inline `transform`. Tailwind v4's `translate-x-full`/`-translate-x-full`/etc. utilities compile to the standalone CSS `translate` property, so the stack offset (on `transform`) layers on top of the enter/exit animation without either one overriding the other.

---

## Animation

Uses the `mounted` + `visible` two-phase pattern (same as `Drawer`, `Modal`, and `CommandPalette`):

1. `mounted`: controls DOM presence. Set on open; cleared via `setTimeout(150)` after the exit transition.
2. `visible`: controls CSS classes, toggled via `requestAnimationFrame` so the initial state paints first.

**Panel:** off-screen translate (per `side`) → `translate-0` at `--duration-base` / `--ease-enter` on enter; reverse at `--duration-fast` / `--ease-exit` on exit. There is no backdrop to animate.

---

## Tokens Used

| Token                   | Where used                                  |
|--------------------------|-----------------------------------------------|
| `bg-surface-panel`      | Panel background (via `Card`)               |
| `bg-surface-hover`      | Close button hover background               |
| `text-text`             | Title text, close button hover text         |
| `text-text-muted`       | Body text, close button default text        |
| `ring-brand-ring`       | Close button focus-visible ring             |
| `--radius`              | Rounded corners on all four sides (via `Card variant="elevated"`) |
| `--shadow-lg`           | Panel elevation shadow (via `Card variant="elevated"`) |
| `--duration-base/fast`  | Enter / exit transition durations           |
| `--ease-enter/exit`     | Enter / exit easing curves                  |

---

## When to Use

- Use `SidePanel` for a lightweight, non-blocking utility panel that should feel like a floating card rather than a pinned sheet (quick previews, contextual editors, an inspector, or any number of independent panels open at once) without preventing the user from continuing to interact with the rest of the page.
- Use `Drawer` or `Modal` instead when the task genuinely needs to block interaction with the rest of the page until it's resolved (destructive confirmations, required multi-step flows, anchored filter/navigation panels).
- Use `side="right"` (default) for detail/inspection panes, `side="left"` for navigation-adjacent panels, `side="top"`/`side="bottom"` for compact floating sheets.
- Always include a `SidePanelTitle`: the dialog's accessible name depends on it.

---

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import SidePanel, {
  SidePanelHeader,
  SidePanelTitle,
  SidePanelContent,
  SidePanelFooter,
  SidePanelClose,
  type SidePanelSide,
} from '@/src/components/SidePanel/SidePanel';
import Button from '@/src/components/Button/Button';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<SidePanelSide>('right');

  const openFrom = (s: SidePanelSide) => {
    setSide(s);
    setOpen(true);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button variant="secondary" onClick={() => openFrom('left')}>Left</Button>
      <Button variant="secondary" onClick={() => openFrom('right')}>Right</Button>
      <Button variant="secondary" onClick={() => openFrom('top')}>Top</Button>
      <Button variant="secondary" onClick={() => openFrom('bottom')}>Bottom</Button>

      <SidePanel open={open} onOpenChange={setOpen} side={side}>
        <SidePanelClose />
        <SidePanelHeader>
          <SidePanelTitle>Quick preview</SidePanelTitle>
        </SidePanelHeader>
        <SidePanelContent>
          A floating panel, inset from every edge it does not anchor to.
        </SidePanelContent>
        <SidePanelFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </SidePanelFooter>
      </SidePanel>
    </div>
  );
}
```
