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
import { HTMLAttributes, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KanbanCardData {
  id: string;
  title: string;
  description?: string;
  tag?: string;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  cards: KanbanCardData[];
}

// ─── KanbanCard ───────────────────────────────────────────────────────────────

export interface KanbanCardProps {
  card: KanbanCardData;
  isDragging?: boolean;
  className?: string;
}

export const KanbanCard = ({ card, isDragging = false, className = '' }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Card: ${card.title}. Press space to start dragging.`}
      className={[
        'group rounded-lg border bg-surface p-3 shadow-sm cursor-grab active:cursor-grabbing',
        'transition-all duration-[var(--duration-fast)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
        'hover:border-surface-border-hover hover:shadow-md',
        isSortableDragging || isDragging
          ? 'opacity-40 border-surface-border-hover'
          : 'border-surface-border',
        className,
      ].join(' ')}
    >
      {card.tag && (
        <span className='inline-block mb-2 rounded-full px-2 py-0.5 text-[10px] font-medium bg-brand/10 text-brand'>
          {card.tag}
        </span>
      )}
      <p className='text-sm font-medium text-text leading-snug'>{card.title}</p>
      {card.description && (
        <p className='mt-1 text-xs text-text-muted leading-relaxed'>{card.description}</p>
      )}
    </div>
  );
};

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

export interface KanbanColumnProps extends HTMLAttributes<HTMLDivElement> {
  column: KanbanColumnData;
  className?: string;
}

export const KanbanColumn = ({ column, className = '', ...props }: KanbanColumnProps) => {
  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-hover p-3 min-w-[240px] w-[240px]',
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
        <div className='flex flex-col gap-2 min-h-[60px]'>
          {column.cards.map((card) => (
            <KanbanCard key={card.id} card={card} />
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
}

export const KanbanBoard = ({ initialColumns, className = '' }: KanbanBoardProps) => {
  const [columns, setColumns] = useState<KanbanColumnData[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);

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
          <KanbanColumn key={col.id} column={col} />
        ))}
      </div>

      <DragOverlay>
        {activeCard && (
          <KanbanCard card={activeCard} isDragging className='rotate-1 shadow-xl opacity-95' />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
