# Modal

A blocking overlay dialog with focus trap, Escape-to-close, and backdrop dismissal. Uses the native `<dialog>` element with `showModal()` for top-layer rendering — no z-index required, not clippable by ancestor overflow or transform. Composed of `Modal`, `ModalHeader`, `ModalTitle`, `ModalContent`, `ModalFooter`, and `ModalClose`.

---

## Installation

```bash
npx dafink-ui add modal
```

No additional npm packages required. No registry dependencies.

---

## Exports

| Export         | Type      | Description                                              |
|----------------|-----------|----------------------------------------------------------|
| `Modal`        | Component | The dialog root — default export. Renders backdrop + panel and owns all focus / keyboard behavior. |
| `ModalHeader`  | Component | Layout wrapper for the title area.                       |
| `ModalTitle`   | Component | Heading element automatically wired to `aria-labelledby`.|
| `ModalContent` | Component | Body content area.                                       |
| `ModalFooter`  | Component | Action row, right-aligned.                               |
| `ModalClose`   | Component | An × button in the top-right corner that closes the modal. |

---

## Props

### Modal

| Prop           | Type                      | Default | Description                                              |
|----------------|---------------------------|---------|----------------------------------------------------------|
| `open`         | `boolean`                 | —       | Controls whether the modal is rendered and visible (controlled). |
| `onOpenChange` | `(open: boolean) => void` | —       | Called with `false` when the user dismisses via Escape, backdrop click, or `ModalClose`. |
| `className`    | `string`                  | `''`    | Additional classes merged onto the panel element.        |
| `children`     | `ReactNode`               | —       | Modal subcomponents and arbitrary content.               |

`Modal` extends `DialogHTMLAttributes<HTMLDialogElement>` — all native dialog props are spread onto the `<dialog>` element.

### ModalHeader / ModalContent / ModalFooter

| Prop        | Type        | Default | Description                              |
|-------------|-------------|---------|------------------------------------------|
| `className` | `string`    | `''`    | Additional classes on the wrapper div.   |
| `children`  | `ReactNode` | —       | Content.                                 |

### ModalTitle

| Prop        | Type        | Default | Description                                                       |
|-------------|-------------|---------|-------------------------------------------------------------------|
| `className` | `string`    | `''`    | Additional classes on the `<h2>` element.                         |
| `children`  | `ReactNode` | —       | The dialog title. Its id is referenced by the panel's `aria-labelledby`. |

### ModalClose

| Prop         | Type     | Default   | Description                                  |
|--------------|----------|-----------|----------------------------------------------|
| `aria-label` | `string` | `'Close'` | Accessible name for the close button.        |
| `className`  | `string` | `''`      | Additional classes on the button element.    |

---

## Interactive States

| Element       | State         | Visual behavior                                                       |
|---------------|---------------|-----------------------------------------------------------------------|
| `ModalClose`  | hover         | `bg-surface-hover`, text shifts from `text-text-muted` to `text-text` |
| `ModalClose`  | focus         | Browser outline suppressed (`focus:outline-none`)                     |
| `ModalClose`  | focus-visible | `ring-2 ring-offset-2 ring-brand-ring`                                |
| Panel         | focus         | `focus:outline-none` — the panel itself only receives focus as a fallback when there are no focusable children |

---

## Keyboard Behavior

| Key         | Behavior                                                                       |
|-------------|--------------------------------------------------------------------------------|
| `Escape`    | Closes the modal — calls `onOpenChange(false)`. Focus returns to the trigger.  |
| `Tab`       | Cycles focus forward within the modal (focus trap). Wraps from last to first.  |
| `Shift+Tab` | Cycles focus backward within the modal. Wraps from first to last.              |
| `Enter/Space` | Activates the focused button (native behavior).                              |

---

## Accessibility

### ARIA Roles

| Element          | Role / Attribute                                                          |
|------------------|---------------------------------------------------------------------------|
| `<dialog>`       | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → `ModalTitle` id |
| Inner panel div  | `aria-labelledby` → `ModalTitle` id (legacy AT support)                   |
| Backdrop         | `aria-hidden="true"`                                                      |
| Close            | `<button>` with `aria-label="Close"`, decorative icon `aria-hidden`       |

### Focus Management

- **Focus on open:** focus moves to the first focusable element inside the panel immediately after the enter frame. If the panel contains no focusable elements, the panel itself (`tabIndex={-1}`) receives focus.
- **Focus trap:** Tab and Shift+Tab cycle within the panel; focusable elements are re-queried on every Tab press, so dynamic content is handled. Focus never escapes to the page behind.
- **Escape:** closes the modal and stops propagation so nested overlays are not dismissed simultaneously.
- **Backdrop click:** treated identically to Escape.
- **Focus return:** the element focused at open time is saved and re-focused whenever the modal closes — regardless of whether it closed via Escape, backdrop, `ModalClose`, a footer action, or unmounting.

### Scroll Lock

Handled natively by `showModal()` — no manual `document.body.style.overflow` manipulation required.

### Reduced Motion

All transitions use the `motion-safe:` Tailwind variant — the modal appears and disappears instantly when `prefers-reduced-motion: reduce` is set. Do not add per-component overrides.

---

## Animation

Uses the `mounted` + `visible` two-phase pattern (same as `CommandPalette`):

1. `mounted` — controls DOM presence. Set on open; cleared via `setTimeout(150)` after the exit transition.
2. `visible` — controls CSS classes, toggled via `requestAnimationFrame` so the initial state paints first.

**Backdrop:** `opacity-0` → `opacity-100` at `--duration-base` / `--ease-enter`; reverse at `--duration-fast` / `--ease-exit`.
**Panel:** `opacity-0 scale-95` → `opacity-100 scale-100` at `--duration-base` / `--ease-enter` on enter; reverse at `--duration-fast` / `--ease-exit` on exit.

The panel exposes `data-state="open" | "closed"` for style extension.

---

## Tokens Used

| Token                   | Where used                                  |
|-------------------------|---------------------------------------------|
| `bg-surface`            | Panel background                            |
| `border-surface-border` | Panel border                                |
| `bg-surface-hover`      | Close button hover background               |
| `text-text`             | Title text, close button hover text         |
| `text-text-muted`       | Body text, close button default text        |
| `ring-brand-ring`       | Close button focus-visible ring             |
| `bg-text/40`            | Backdrop overlay (text color at 40% opacity)|
| `--duration-base/fast`  | Enter / exit transition durations           |
| `--ease-enter/exit`     | Enter / exit easing curves                  |

---

## When to Use

- Use a modal for a focused task or decision that blocks the rest of the page — confirmations, short forms, destructive-action warnings.
- Keep modal content short. If the content needs scrolling or houses a multi-step flow, use a dedicated page or a `Drawer`.
- Always include a `ModalTitle` — the dialog's accessible name depends on it.
- Do not nest modals.

---

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalClose,
} from '@/src/components/Modal/Modal';
import Button from '@/src/components/Button/Button';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalClose />
        <ModalHeader>
          <ModalTitle>Delete project</ModalTitle>
        </ModalHeader>
        <ModalContent>
          This action cannot be undone. The project and all of its data will be
          permanently removed.
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```
