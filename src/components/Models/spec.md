# Models

Shared prop shapes that more than one component uses. Types only: nothing renders and there is nothing to import at runtime. It installs automatically as a dependency of the components that use it.

---

## Types

| Type | Shape | Used by |
|------|-------|---------|
| `FieldProps` | `{ label?, hint?, error? }` | Input, Textarea, Select, Combobox |
| `Option` | `{ value: string; label: string }` | Select, Combobox |
| `Tone` | `'default' \| 'success' \| 'warning' \| 'danger'` | Alert, Toast, Badge |
| `EditHistory` | `{ undo, redo, canUndo, canRedo }` | DeckEditor, SheetEditor |

Each component re-exports its own name for the shape (`SelectOption`, `AlertVariant`, and so on), so existing imports keep working.

## Interactive States

None. Types only.

## Accessibility

Nothing renders. `FieldProps` carries the label, hint and error text that the components above connect to their control with `htmlFor`, `aria-describedby` and `aria-invalid`.

## When to Use

Extend `FieldProps` when a new form control takes a label, hint and error, so every control documents and behaves the same. Reach for `Tone` when a component shows success, warning or danger. Add a type here only when two or more components share the same meaning, not just the same shape.

## Installation

```bash
npx dafink-ui add models
```

npm dependencies: none
No registry dependencies.
