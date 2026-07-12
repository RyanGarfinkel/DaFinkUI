# Drawer

A blocking side-panel overlay that slides in from an edge of the screen. Uses the native `<dialog>` element with `showModal()` for top-layer rendering, so no z-index is required and it is not clippable by ancestor overflow or transform. Shares the full modal accessibility contract (focus trap, Escape-to-close, backdrop dismissal, focus return) but uses a translate animation instead of fade + scale. Composed of `Drawer`, `DrawerHeader`, `DrawerTitle`, `DrawerContent`, `DrawerFooter`, and `DrawerClose`.

---

## Installation

```bash
npx dafink-ui add drawer
```

No additional npm packages required. No registry dependencies.

---

## Exports

| Export          | Type      | Description                                              |
|-----------------|-----------|----------------------------------------------------------|
| `Drawer`        | Component | The drawer root, default export. Renders backdrop + panel and owns all focus / keyboard behavior. |
| `DrawerHeader`  | Component | Layout wrapper for the title area.                       |
| `DrawerTitle`   | Component | Heading element automatically wired to `aria-labelledby`.|
| `DrawerContent` | Component | Scrollable body content area (`flex-1 overflow-y-auto`). |
| `DrawerFooter`  | Component | Action row, right-aligned.                               |
| `DrawerClose`   | Component | An × button in the top-right corner that closes the drawer. |
| `DrawerSide`    | Type      | `'left' \| 'right' \| 'top' \| 'bottom'`                 |

---

## Props

### Drawer

| Prop           | Type                                     | Default   | Description                                              |
|----------------|------------------------------------------|-----------|----------------------------------------------------------|
| `open`         | `boolean`                                | required  | Controls whether the drawer is rendered and visible (controlled). |
| `onOpenChange` | `(open: boolean) => void`                | required  | Called with `false` when the user dismisses via Escape, backdrop click, or `DrawerClose`. |
| `side`         | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Which edge of the screen the drawer slides in from.      |
| `className`    | `string`                                 | `''`      | Additional classes merged onto the panel element.        |
| `children`     | `ReactNode`                              | required  | Drawer subcomponents and arbitrary content.              |

`Drawer` extends `DialogHTMLAttributes<HTMLDialogElement>`: all native dialog props are spread onto the `<dialog>` element.

### DrawerHeader / DrawerContent / DrawerFooter

| Prop        | Type        | Default | Description                              |
|-------------|-------------|---------|------------------------------------------|
| `className` | `string`    | `''`    | Additional classes on the wrapper div.   |
| `children`  | `ReactNode` | required | Content.                                |

### DrawerTitle

| Prop        | Type        | Default | Description                                                       |
|-------------|-------------|---------|-------------------------------------------------------------------|
| `className` | `string`    | `''`    | Additional classes on the `<h2>` element.                         |
| `children`  | `ReactNode` | required | The drawer title. Its id is referenced by the panel's `aria-labelledby`. |

### DrawerClose

| Prop         | Type     | Default   | Description                                  |
|--------------|----------|-----------|----------------------------------------------|
| `aria-label` | `string` | `'Close'` | Accessible name for the close button.        |
| `className`  | `string` | `''`      | Additional classes on the button element.    |

---

## Variants (side)

| Side     | Panel placement                          | Hidden transform     |
|----------|------------------------------------------|----------------------|
| `right`  | `inset-y-0 right-0 w-80 max-w-[85vw]`    | `translate-x-full`   |
| `left`   | `inset-y-0 left-0 w-80 max-w-[85vw]`     | `-translate-x-full`  |
| `top`    | `inset-x-0 top-0 max-h-[85vh]`           | `-translate-y-full`  |
| `bottom` | `inset-x-0 bottom-0 max-h-[85vh]`        | `translate-y-full`   |

The panel exposes `data-side` and `data-state="open" | "closed"` for style extension.

---

## Interactive States

| Element        | State         | Visual behavior                                                       |
|----------------|---------------|-----------------------------------------------------------------------|
| `DrawerClose`  | hover         | `bg-surface-hover`, text shifts from `text-text-muted` to `text-text` |
| `DrawerClose`  | focus         | Browser outline suppressed (`focus:outline-none`)                     |
| `DrawerClose`  | focus-visible | `ring-2 ring-offset-2 ring-brand-ring`                                |
| Panel          | focus         | `focus:outline-none`: the panel itself only receives focus as a fallback when there are no focusable children |

---

## Keyboard Behavior

| Key         | Behavior                                                                        |
|-------------|----------------------------------------------------------------------------------|
| `Escape`    | Closes the drawer: calls `onOpenChange(false)`. Focus returns to the trigger.   |
| `Tab`       | Cycles focus forward within the drawer (focus trap). Wraps from last to first.   |
| `Shift+Tab` | Cycles focus backward within the drawer. Wraps from first to last.               |
| `Enter/Space` | Activates the focused button (native behavior).                                |

---

## Accessibility

### ARIA Roles

| Element          | Role / Attribute                                                            |
|------------------|-----------------------------------------------------------------------------|
| `<dialog>`       | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → `DrawerTitle` id |
| Inner panel div  | `aria-labelledby` → `DrawerTitle` id (legacy AT support)                    |
| Backdrop         | `aria-hidden="true"`                                                        |
| Close            | `<button>` with `aria-label="Close"`, decorative icon `aria-hidden`         |

### Focus Management

- **Focus on open:** focus moves to the first focusable element inside the panel immediately after the enter frame. If the panel contains no focusable elements, the panel itself (`tabIndex={-1}`) receives focus.
- **Focus trap:** Tab and Shift+Tab cycle within the panel; focusable elements are re-queried on every Tab press, so dynamic content is handled. Focus never escapes to the page behind.
- **Escape:** closes the drawer and stops propagation so nested overlays are not dismissed simultaneously.
- **Backdrop click:** treated identically to Escape.
- **Focus return:** the element focused at open time is saved and re-focused whenever the drawer closes, regardless of whether it closed via Escape, backdrop, `DrawerClose`, a footer action, or unmounting.

### Scroll Lock

Handled natively by `showModal()`: no manual `document.body.style.overflow` manipulation required.

### Reduced Motion

All transitions use the `motion-safe:` Tailwind variant, so the drawer appears and disappears instantly when `prefers-reduced-motion: reduce` is set. Do not add per-component overrides.

---

## Animation

Uses the `mounted` + `visible` two-phase pattern (same as `Modal` and `CommandPalette`):

1. `mounted`: controls DOM presence. Set on open; cleared via `setTimeout(150)` after the exit transition.
2. `visible`: controls CSS classes, toggled via `requestAnimationFrame` so the initial state paints first.

**Backdrop:** `opacity-0` → `opacity-100` at `--duration-base` / `--ease-enter`; reverse at `--duration-fast` / `--ease-exit`.
**Panel:** off-screen translate (per `side`) → `translate-0` at `--duration-base` / `--ease-enter` on enter; reverse at `--duration-fast` / `--ease-exit` on exit.

---

## Tokens Used

| Token                   | Where used                                  |
|-------------------------|---------------------------------------------|
| `bg-surface`            | Panel background                            |
| `border-surface-border` | Panel edge border                           |
| `bg-surface-hover`      | Close button hover background               |
| `text-text`             | Title text, close button hover text         |
| `text-text-muted`       | Body text, close button default text        |
| `ring-brand-ring`       | Close button focus-visible ring             |
| `bg-text/40`            | Backdrop overlay (text color at 40% opacity)|
| `--duration-base/fast`  | Enter / exit transition durations           |
| `--ease-enter/exit`     | Enter / exit easing curves                  |

---

## When to Use

- Use a drawer for supplementary content or tasks that benefit from staying anchored to the page context: filter panels, detail views, settings, carts, notification lists.
- Use `side="right"` (default) for detail/inspection panes, `side="left"` for navigation, `side="bottom"` for mobile-style sheets.
- Prefer a `Modal` for short, focused decisions (confirmations); prefer a drawer when the content is longer or list-like.
- Always include a `DrawerTitle`: the dialog's accessible name depends on it.

---

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import Drawer, {
  DrawerHeader,
  DrawerTitle,
  DrawerContent,
  DrawerFooter,
  DrawerClose,
  type DrawerSide,
} from '@/src/components/Drawer/Drawer';
import Button from '@/src/components/Button/Button';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<DrawerSide>('right');

  const openFrom = (s: DrawerSide) => {
    setSide(s);
    setOpen(true);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button variant="secondary" onClick={() => openFrom('left')}>Left</Button>
      <Button variant="secondary" onClick={() => openFrom('right')}>Right</Button>
      <Button variant="secondary" onClick={() => openFrom('top')}>Top</Button>
      <Button variant="secondary" onClick={() => openFrom('bottom')}>Bottom</Button>

      <Drawer open={open} onOpenChange={setOpen} side={side}>
        <DrawerClose />
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>
        <DrawerContent>
          You have no unread notifications.
        </DrawerContent>
        <DrawerFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}
```
