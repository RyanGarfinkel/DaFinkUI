'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { HTMLAttributes, ReactNode, useId, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import Modal from '../Modal/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KanbanSubtask {
  id: string;
  label: string;
  done: boolean;
}

export interface KanbanCardData {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  dueDate?: string;
  points?: number;
  subtasks?: KanbanSubtask[];
}

export interface KanbanColumnData {
  id: string;
  title: string;
  cards: KanbanCardData[];
}

// ─── KanbanCard ───────────────────────────────────────────────────────────────

const InfoIcon = () => (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 16v-5' />
    <path d='M12 8h.01' />
  </svg>
);

const CalendarIcon = () => (
  <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <rect x='3' y='4' width='18' height='18' rx='2' />
    <path d='M16 2v4M8 2v4M3 10h18' />
  </svg>
);

const ChecklistIcon = () => (
  <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d='m3 7 2 2 4-4' />
    <path d='M11 6h10' />
    <path d='m3 15 2 2 4-4' />
    <path d='M11 18h10' />
  </svg>
);

const formatDueDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// ─── KanbanCard ───────────────────────────────────────────────────────────────
// The details popup is bring-your-own: KanbanCard has no built-in edit form. Pass
// a `renderCardDetails` function to render whatever content you want inside the
// Modal that opens on click; omit it and the card is drag-only, no popup at all.

export interface KanbanCardDetailsRenderProps {
  card: KanbanCardData;
  onUpdate: (card: KanbanCardData) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export type KanbanCardDetailsRenderer = (props: KanbanCardDetailsRenderProps) => ReactNode;

// A real component boundary around the render-prop call, so any hooks a custom
// renderer uses get their own fiber: keyed by openKey in KanbanCard so each
// fresh open of the popup remounts it, reseeding draft state from the live card
// instead of carrying over a previous session's edits.
const KanbanCardDetailsHost = ({ render, ...props }: { render: KanbanCardDetailsRenderer } & KanbanCardDetailsRenderProps) => <>{render(props)}</>;

// The card face — what sits on the board and gets dragged — ships a default
// template (tag, title, description, points/due-date/subtasks meta row) but can
// be fully replaced via `renderCard`. Unlike `renderCardDetails`, this always
// renders something: the default is the out-of-the-box look, not an opt-in.
// KanbanCard still owns the draggable wrapper (ref, drag listeners, click-to-open,
// aria-label) either way — a custom renderCard only replaces what's inside it.
export interface KanbanCardFaceRenderProps {
  card: KanbanCardData;
  isDragging: boolean;
  onViewDetails: () => void;
}

export type KanbanCardFaceRenderer = (props: KanbanCardFaceRenderProps) => ReactNode;

export interface KanbanCardProps {
  card: KanbanCardData;
  isDragging?: boolean;
  className?: string;
  onUpdate?: (card: KanbanCardData) => void;
  onDelete?: (id: string) => void;
  renderCardDetails?: KanbanCardDetailsRenderer;
  renderCard?: KanbanCardFaceRenderer;
}

export const KanbanCard = ({ card, isDragging = false, className = '', onUpdate, onDelete, renderCardDetails, renderCard }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [openKey, setOpenKey] = useState(0);
  const hasDetails = Boolean(renderCardDetails);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const openDetails = () => {
    setOpenKey((k) => k + 1);
    setDetailsOpen(true);
  };
  const closeDetails = () => setDetailsOpen(false);

  const handleUpdate = (updated: KanbanCardData) => {
    onUpdate?.(updated);
    closeDetails();
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    closeDetails();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...(hasDetails ? { onClick: openDetails } : {})}
      aria-label={hasDetails
        ? `Card: ${card.title}. Press space to start dragging, or activate the info button to view details.`
        : `Card: ${card.title}. Press space to start dragging.`}
      className={[
        'group rounded-[var(--radius-lg)] border-[length:var(--border-width)] bg-surface-panel p-3 shadow-[var(--shadow-sm)] cursor-grab active:cursor-grabbing',
        'transition-all duration-[var(--duration-fast)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
        'hover:border-surface-border-hover hover:shadow-[var(--shadow)]',
        isSortableDragging || isDragging
          ? 'opacity-40 border-surface-border-hover'
          : 'border-surface-border',
        className,
      ].join(' ')}
    >
      {renderCard ? renderCard({ card, isDragging, onViewDetails: openDetails }) : (
        <>
          <div className='mb-2 flex items-center gap-2'>
            {card.tag && (
              <span className='inline-block min-w-0 shrink truncate rounded-full px-2 py-0.5 text-[10px] font-medium bg-brand/10 text-brand'>
                {card.tag}
              </span>
            )}
            {hasDetails && !isDragging && (
              <button
                type='button'
                aria-label={`View details for ${card.title}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); openDetails(); }}
                className='ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-subtle transition-colors duration-[var(--duration-fast)] hover:bg-surface-active hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
              >
                <InfoIcon />
              </button>
            )}
          </div>
          <p className='text-sm font-medium text-text leading-snug'>{card.title}</p>
          {card.description && (
            <p className='mt-1 text-xs text-text-muted leading-relaxed'>{card.description}</p>
          )}

          {(card.points !== undefined || card.dueDate || (card.subtasks && card.subtasks.length > 0)) && (
            <div className='mt-2 flex flex-wrap items-center gap-2.5 text-[11px] text-text-muted'>
              {card.points !== undefined && (
                <span className='inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-active px-1 font-medium text-text'>
                  {card.points}
                </span>
              )}
              {card.dueDate && (
                <span className='flex items-center gap-1'>
                  <CalendarIcon />
                  {formatDueDate(card.dueDate)}
                </span>
              )}
              {card.subtasks && card.subtasks.length > 0 && (
                <span className='flex items-center gap-1'>
                  <ChecklistIcon />
                  {card.subtasks.filter((s) => s.done).length}/{card.subtasks.length}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {hasDetails && !isDragging && (
        // Modal portals its content to document.body, but React still bubbles synthetic
        // events through the *component* tree, not the DOM tree: without this boundary,
        // clicking anything inside (Save, Cancel, Delete, the backdrop, ModalClose) would
        // also reach this card's own onClick above and immediately reopen the popup.
        <div className='contents' onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <Modal open={detailsOpen} onOpenChange={setDetailsOpen}>
            <KanbanCardDetailsHost
              key={openKey}
              render={renderCardDetails!}
              card={card}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onClose={closeDetails}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

export interface KanbanColumnProps extends HTMLAttributes<HTMLDivElement> {
  column: KanbanColumnData;
  className?: string;
  onCardUpdate?: (card: KanbanCardData) => void;
  onCardDelete?: (id: string) => void;
  renderCardDetails?: KanbanCardDetailsRenderer;
  renderCard?: KanbanCardFaceRenderer;
}

export const KanbanColumn = ({ column, className = '', onCardUpdate, onCardDelete, renderCardDetails, renderCard, ...props }: KanbanColumnProps) => {
  // A column's cards each register their own droppable area via useSortable, but
  // an empty column has no cards to provide one — without this, there is nothing
  // in an empty column for dnd-kit to detect a drop onto.
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-hover p-3 min-w-[240px] w-[240px]',
        className,
      ].join(' ')}
      {...props}
    >
      <div className='flex items-center justify-between px-1'>
        <h3 className='text-xs font-semibold text-text uppercase tracking-wide'>
          {column.title}
        </h3>
        <span className='text-xs text-text-subtle tabular-nums'>
          {column.cards.length}
        </span>
      </div>

      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className='flex flex-col gap-2 min-h-[60px]'>
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} onUpdate={onCardUpdate} onDelete={onCardDelete} renderCardDetails={renderCardDetails} renderCard={renderCard} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// ─── KanbanBoard ──────────────────────────────────────────────────────────────

export interface KanbanBoardProps {
  initialColumns: KanbanColumnData[];
  className?: string;
  onCardUpdate?: (card: KanbanCardData) => void;
  onCardDelete?: (id: string) => void;
  renderCardDetails?: KanbanCardDetailsRenderer;
  renderCard?: KanbanCardFaceRenderer;
}

export const KanbanBoard = ({ initialColumns, className = '', onCardUpdate, onCardDelete, renderCardDetails, renderCard }: KanbanBoardProps) => {
  const [columns, setColumns] = useState<KanbanColumnData[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  // dnd-kit's own aria-describedby id is a module-level counter (not React's
  // useId), so it drifts between server and client renders across a long-lived
  // process — passing our own SSR-safe id sidesteps that hydration mismatch.
  const dndContextId = useId();

  const handleCardUpdate = (updated: KanbanCardData) => {
    setColumns((cols) => cols.map((col) => ({
      ...col,
      cards: col.cards.map((c) => c.id === updated.id ? updated : c),
    })));
    onCardUpdate?.(updated);
  };

  const handleCardDelete = (id: string) => {
    setColumns((cols) => cols.map((col) => ({
      ...col,
      cards: col.cards.filter((c) => c.id !== id),
    })));
    onCardDelete?.(id);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findColumnByCardId = (cardId: string) => {
    return columns.find((col) => col.cards.some((c) => c.id === cardId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const card = columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCol = findColumnByCardId(active.id as string);
    // `over` could be a card id or a column id
    const overCol =
      columns.find((col) => col.id === over.id) ??
      findColumnByCardId(over.id as string);

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    setColumns((cols) => {
      const card = activeCol.cards.find((c) => c.id === active.id)!;
      return cols.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
        }
        if (col.id === overCol.id) {
          // Insert before the over card if it exists, otherwise append
          const overIndex = col.cards.findIndex((c) => c.id === over.id);
          const newCards = [...col.cards];
          if (overIndex >= 0) {
            newCards.splice(overIndex, 0, card);
          } else {
            newCards.push(card);
          }
          return { ...col, cards: newCards };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over || active.id === over.id) return;

    const activeCol = findColumnByCardId(active.id as string);
    const overCol = findColumnByCardId(over.id as string);

    if (!activeCol || !overCol || activeCol.id !== overCol.id) return;

    setColumns((cols) =>
      cols.map((col) => {
        if (col.id !== activeCol.id) return col;
        const oldIndex = col.cards.findIndex((c) => c.id === active.id);
        const newIndex = col.cards.findIndex((c) => c.id === over.id);
        return { ...col, cards: arrayMove(col.cards, oldIndex, newIndex) };
      }),
    );
  };

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        role='application'
        aria-label='Kanban board'
        className={['flex gap-4 overflow-x-auto pb-2', className].join(' ')}
      >
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} onCardUpdate={handleCardUpdate} onCardDelete={handleCardDelete} renderCardDetails={renderCardDetails} renderCard={renderCard} />
        ))}
      </div>

      <DragOverlay>
        {activeCard && (
          <KanbanCard card={activeCard} isDragging renderCard={renderCard} className='rotate-1 shadow-[var(--shadow-lg)] opacity-95' />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
