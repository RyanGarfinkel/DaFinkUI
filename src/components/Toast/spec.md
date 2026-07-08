# Toast

Ephemeral notification toasts with auto-dismiss, variants, and optional actions.

---

## Setup

Toast requires a context provider. Wrap your app root or layout with `ToastProvider`, then call `useToast()` inside any descendant component.

```tsx
// layout.tsx
import { ToastProvider } from '@/src/components/Toast/Toast';

export default function Layout({ children }) {
  return (
    <ToastProvider position="bottom-right">
      {children}
    </ToastProvider>
  );
}
```

```tsx
// anywhere inside the tree
import { useToast } from '@/src/components/Toast/Toast';

const { toast } = useToast();

toast({ title: 'Saved', variant: 'success', duration: 4000 });
```

---

## Props

### ToastProvider

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `ReactNode` | — | App content rendered inside the provider. |
| position | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | Where toasts appear on screen. |

### toast() options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| title | `string` | — | Bold heading text. |
| description | `string` | — | Body message rendered below the title. |
| variant | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color and icon style. |
| duration | `number` | `4000` | Auto-dismiss delay in milliseconds. |
| action | `{ label: string; onClick: () => void }` | — | Optional action button inside the toast. Activating it also dismisses the toast. |

## Variants

| Variant | Use case |
|---------|----------|
| `default` | General info or neutral notifications |
| `success` | Confirmation of a successful action (saved, published, sent) |
| `warning` | Non-blocking concern the user should be aware of |
| `danger` | Failed operation or error requiring attention |

## Behavior

- Toasts animate in (fade + vertical slide) on mount and animate out on dismiss
- Top-positioned toasts slide in from above; bottom-positioned toasts slide from below
- Auto-dismiss fires after `duration` ms; the timer is set on mount and cleared on unmount
- The dismiss button (×) is always visible and immediately removes the toast
- Multiple toasts stack in the container; bottom positions stack upward, top positions stack downward
- The toast container is `pointer-events-none`; individual toast cards re-enable pointer events so they are clickable

## Accessibility

- Each toast card has `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` — screen readers announce it when it appears
- The dismiss button has `aria-label="Dismiss"`
- The action button is a focusable `<button>` in normal tab order
- The container region has `aria-label="Notifications"`

## When to Use

- Use toast for transient feedback that does not require the user to take action (save confirmations, copy success).
- Use `action` when a single obvious recovery step is available (e.g. "Undo").
- Do not use toast for errors that block the user's workflow — use an Alert inline in the form or page instead.
- Keep `title` short (3–5 words) and `description` optional. If you need more space, use a dialog.

## Installation

```bash
npx dafink-ui add toast
```

npm dependencies: none
No registry dependencies.
