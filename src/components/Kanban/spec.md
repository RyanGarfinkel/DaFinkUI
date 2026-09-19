# Kanban

A drag-and-drop Kanban board built on `@dnd-kit/core`. Cards can be dragged between columns and reordered within columns. Full keyboard support is included via dnd-kit's keyboard sensor. The card face — what sits on the board and gets dragged — ships a default template (tag, title, description, points/due-date/subtasks meta row), replaceable via `renderCard`. `KanbanCard` ships no built-in edit form: the details popup is entirely bring-your-own. Pass a `renderCardDetails` render function to show arbitrary content in a Modal when a card is clicked or its info button is activated; without it, clicking a card only drags, no popup and no info button appear.

## Installation

```bash
npx dafink-ui add kanban
```

npm dependency: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`


## Components

### KanbanBoard

Root component. Owns drag state and handles cross-column card moves, plus in-place edits and deletes made from a card's details popup. Passes React's `useId()` as `DndContext`'s own `id` prop: dnd-kit's default `aria-describedby` id generation (`utilities.useUniqueId`) uses a module-level counter rather than `useId`, which is not SSR-safe (it drifts between server and client renders across a long-lived server process) and would otherwise cause a hydration mismatch on every card. Also gives multiple `KanbanBoard` instances on the same page distinct ids automatically.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| initialColumns | KanbanColumnData[] | required | Initial column and card data |
| onCardUpdate | (card: KanbanCardData) => void | - | Fired after a card is edited and saved in its details popup, with the updated card |
| onCardDelete | (id: string) => void | - | Fired after a card is deleted from its details popup, with the id of the deleted card |
| renderCardDetails | KanbanCardDetailsRenderer | - | Forwarded to every KanbanCard. When omitted, no card in the board opens a details popup |
| renderCard | KanbanCardFaceRenderer | - | Forwarded to every KanbanCard. When omitted, the default card face template is used |
| className | string | "" | Extra classes on the board container |

### KanbanColumn

A single column with a title, card count badge, and a sortable list of cards. Its card list registers itself as a dnd-kit droppable (`useDroppable({ id: column.id })`) independent of its cards: when a column has cards, each card's own `useSortable` also acts as a drop target, but an empty column has none, so without this the column's own container is the only thing a drag can land on to move a card into it.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| column | KanbanColumnData | required | Column data including title and cards |
| onCardUpdate | (card: KanbanCardData) => void | - | Forwarded to every KanbanCard in the column |
| onCardDelete | (id: string) => void | - | Forwarded to every KanbanCard in the column |
| renderCardDetails | KanbanCardDetailsRenderer | - | Forwarded to every KanbanCard in the column |
| renderCard | KanbanCardFaceRenderer | - | Forwarded to every KanbanCard in the column |
| className | string | "" | Extra classes |

### KanbanCard

An individual draggable card. Rendered by KanbanColumn; use directly for custom layouts. KanbanCard always owns the draggable wrapper — the outer element carrying the drag ref, dnd-kit's `attributes`/`listeners`, the click-to-open handler, and `aria-label` — regardless of whether the face or the details are customized.

**Face** (`renderCard`, optional): what's shown on the board and dragged. Omit it and the default template renders (tag badge, title, description, and a meta row of a points badge / formatted due date / `done total` related-items count, plus the info button described below). Pass a function and it replaces all of that, called with `{ card, isDragging, onViewDetails }`; `onViewDetails` opens the details popup exactly like the default template's info button does, for a custom face that wants its own explicit trigger. Unlike `renderCardDetails`, this is not opt-in — the board always renders *some* face, default or custom.

**Details** (`renderCardDetails`, optional): the details popup is opt-in. When provided, clicking the card body or its info button (part of the default face; a custom face must call `onViewDetails` itself to offer one) opens a Modal wrapping whatever that function returns, called with `{ card, onUpdate, onDelete, onClose }`; `onUpdate`/`onDelete` call the card's own `onUpdate`/`onDelete` prop and then close the popup, `onClose` just closes it (used for a Cancel action). When `renderCardDetails` is omitted, the card is drag-only: no info button renders in the default face, and clicking the card body does nothing but start a drag.

When `isDragging` is true (the drag overlay ghost) the info button and popup are omitted regardless of `renderCardDetails`, but `renderCard` (if provided) is still used so the dragged ghost matches the real card's look. Internally composes `Modal`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| card | KanbanCardData | required | Card data |
| isDragging | boolean | false | True when the card is the active drag overlay |
| onUpdate | (card: KanbanCardData) => void | - | Called with the edited card when the details renderer's `onUpdate` is invoked |
| onDelete | (id: string) => void | - | Called with the card's id when the details renderer's `onDelete` is invoked |
| renderCardDetails | KanbanCardDetailsRenderer | - | Renders the content of the details Modal opened on click; omit to disable the popup entirely |
| renderCard | KanbanCardFaceRenderer | - | Renders the card face shown on the board and dragged; omit to use the default template |
| className | string | "" | Extra classes |

### Writing a renderCard function

```ts
type KanbanCardFaceRenderer = (props: {
  card: KanbanCardData;
  isDragging: boolean;
  onViewDetails: () => void;
}) => ReactNode;
```

Unlike the details renderer, there's no special hook-isolation boundary here — the face re-renders like any normal part of `KanbanCard`, so state inside it (hover, expanded sections, etc.) persists naturally across renders rather than resetting. A minimal example:

```tsx
const renderCard: KanbanCardFaceRenderer = ({ card, onViewDetails }) => (
  <>
    <p className='text-sm font-medium text-text'>{card.title}</p>
    <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
      Details
    </button>
  </>
);

<KanbanBoard initialColumns={columns} renderCard={renderCard} renderCardDetails={renderCardDetails} />
```

`onPointerDown`/`onClick` `stopPropagation()` on a custom trigger button mirrors the default face's info button: without it, the click also reaches the card's own `onClick` (redundant but harmless) and the pointerdown would otherwise be captured by dnd-kit's drag listeners.

### Writing a renderCardDetails function

```ts
type KanbanCardDetailsRenderer = (props: {
  card: KanbanCardData;
  onUpdate: (card: KanbanCardData) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) => ReactNode;
```

`KanbanCard` mounts whatever this returns inside its own `Modal`, in a private component boundary keyed to each open of the popup — so a renderer that calls hooks (e.g. `useState(card.title)` for draft fields) is safe and gets a fresh instance, seeded from the current `card`, every time the popup is freshly opened. Call `onUpdate(updatedCard)` to save and close, `onDelete(card.id)` to delete and close, or `onClose()` to dismiss without saving (e.g. a Cancel button). A minimal example:

```tsx
const renderCardDetails: KanbanCardDetailsRenderer = ({ card, onUpdate, onDelete, onClose }) => {
  const [title, setTitle] = useState(card.title);

  return (
    <>
      <ModalClose />
      <ModalHeader><ModalTitle>Edit card</ModalTitle></ModalHeader>
      <ModalContent>
        <Input label='Title' value={title} onChange={(e) => setTitle(e.target.value)} />
      </ModalContent>
      <ModalFooter>
        <Button variant='destructive' onClick={() => onDelete(card.id)}>Delete</Button>
        <Button variant='secondary' onClick={onClose}>Cancel</Button>
        <Button onClick={() => onUpdate({ ...card, title })}>Save</Button>
      </ModalFooter>
    </>
  );
};

<KanbanBoard initialColumns={columns} renderCardDetails={renderCardDetails} />
```

## Data types

```ts
interface KanbanSubtask {
  id: string;
  label: string;
  done: boolean;
}

interface KanbanCardData {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  dueDate?: string;    // ISO 8601, as produced by DatePicker's onChange via Date#toISOString()
  points?: number;     // Fibonacci-style effort estimate: 1, 2, 3, 5, 8, or 13
  subtasks?: KanbanSubtask[];
}

interface KanbanColumnData {
  id: string;
  title: string;
  cards: KanbanCardData[];
}
```

## Accessibility notes

- `KanbanBoard` has `role="application"` and `aria-label="Kanban board"`
- Each `KanbanCard` has an `aria-label` describing the card and the keyboard activation instruction; the label mentions the info button only when `renderCardDetails` is provided. That wording assumes the default face's info button; a custom `renderCard` that offers its own `onViewDetails` trigger with different wording or placement should be considered when writing that trigger's own accessible name
- Keyboard dragging: Tab to focus a card, Space or Enter to start dragging, arrow keys to move, Space or Enter to drop, Escape to cancel
- dnd-kit's `KeyboardSensor` handles all keyboard interaction automatically
- When `renderCardDetails` is provided: because Space/Enter on the card itself are already claimed by dnd-kit for drag activation, viewing details is a separate, independently focusable info button (`aria-label="View details for {title}"`) rather than overloading the card's own activation keys; its `onPointerDown`/`onClick` call `stopPropagation()` so pressing it never starts a drag. When `renderCardDetails` is omitted, no info button renders and the card is drag-only
- The details Modal follows the standard overlay contract (focus trap, Escape closes, focus returns to trigger) via the shared `Modal` component; this applies to whatever `renderCardDetails` returns. Whatever fields and validation (e.g. disabling Save while a required field is empty) exist are entirely up to the renderer you write
- Whenever `renderCardDetails` is provided, the Modal is wrapped in a `<div className="contents">` with `stopPropagation()` on `onClick`/`onPointerDown`. `Modal` portals its DOM to `document.body`, but React bubbles synthetic events through the *component* tree, not the DOM tree, so without this boundary any click inside it (a Save/Cancel/Delete button in a custom renderer, the backdrop, `ModalClose`) also reaches the card's own `onClick` and immediately reopens the popup right after it closes. `className="contents"` keeps the wrapper out of the layout box model since Modal's real content renders elsewhere via the portal

## When to use

- Project management boards
- Workflow visualisation
- Any multi-column drag-and-drop ordering UI

## Tokens used

`--color-surface`, `--color-surface-hover`, `--color-surface-active`, `--color-surface-border`, `--color-surface-border-hover`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-brand`, `--color-brand-ring`, `--color-danger`
