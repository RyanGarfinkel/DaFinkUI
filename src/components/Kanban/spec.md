# Kanban

A drag-and-drop Kanban board built on `@dnd-kit/core`. Cards can be dragged between columns and reordered within columns. Full keyboard support is included via dnd-kit's keyboard sensor.

## Installation

```bash
npx @obi/ui add kanban
```

npm dependency: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

Ships as a separate entry point (`@obi/ui/dnd`) so the dnd-kit dependency is not pulled in unless needed.

## Components

### KanbanBoard

Root component. Owns drag state and handles cross-column card moves.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| initialColumns | KanbanColumnData[] | required | Initial column and card data |
| className | string | "" | Extra classes on the board container |

### KanbanColumn

A single column with a title, card count badge, and a sortable list of cards.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| column | KanbanColumnData | required | Column data including title and cards |
| className | string | "" | Extra classes |

### KanbanCard

An individual draggable card. Rendered by KanbanColumn — use directly for custom layouts.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| card | KanbanCardData | required | Card data |
| isDragging | boolean | false | True when the card is the active drag overlay |
| className | string | "" | Extra classes |

## Data types

```ts
interface KanbanCardData {
  id: string;
  title: string;
  description?: string;
  tag?: string;
}

interface KanbanColumnData {
  id: string;
  title: string;
  cards: KanbanCardData[];
}
```

## Accessibility notes

- `KanbanBoard` has `role="application"` and `aria-label="Kanban board"`
- Each `KanbanCard` has an `aria-label` describing the card and the keyboard activation instruction
- Keyboard dragging: Tab to focus a card, Space to start dragging, arrow keys to move, Space or Enter to drop, Escape to cancel
- dnd-kit's `KeyboardSensor` handles all keyboard interaction automatically

## When to use

- Project management boards
- Workflow visualisation
- Any multi-column drag-and-drop ordering UI

## Tokens used

`--color-surface`, `--color-surface-hover`, `--color-surface-border`, `--color-surface-border-hover`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-brand`, `--color-brand-ring`
