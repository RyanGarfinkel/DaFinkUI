import { KanbanBoard, type KanbanCardDetailsRenderer, type KanbanCardFaceRenderer } from './Kanban';
import { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../Modal/Modal';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Checkbox from '../Checkbox/Checkbox';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { useState } from 'react';

// A minimal, hand-rolled details renderer standing in for what a consumer would
// write themselves: KanbanCard has no built-in details form, so these tests
// exercise the render-prop contract against a small bespoke one.
const CardDetails: KanbanCardDetailsRenderer = ({ card, onUpdate, onDelete, onClose }) => {
  const [title, setTitle] = useState(card.title);
  const [tag, setTag] = useState(card.tag ?? '');
  const [description, setDescription] = useState(card.description ?? '');
  const [subtasks, setSubtasks] = useState(card.subtasks ?? []);
  const [newSubtaskLabel, setNewSubtaskLabel] = useState('');

  const handleSave = () => {
    if(!title.trim()) return;
    onUpdate({ ...card, title, tag: tag || undefined, description: description || undefined, subtasks });
  };

  return (
    <>
      <ModalClose />
      <ModalHeader>
        <ModalTitle>Edit card</ModalTitle>
      </ModalHeader>
      <ModalContent className='flex flex-col gap-4'>
        <Input label='Title' value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label='Tag' value={tag} onChange={(e) => setTag(e.target.value)} />
        <Input label='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
        {subtasks.map((subtask) => (
          <div key={subtask.id} className='flex items-center gap-2'>
            <Checkbox
              checked={subtask.done}
              onChange={() => setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? { ...s, done: !s.done } : s))}
              aria-label={subtask.label}
            />
            <span>{subtask.label}</span>
          </div>
        ))}
        <Input
          value={newSubtaskLabel}
          onChange={(e) => setNewSubtaskLabel(e.target.value)}
          aria-label='Add a related item'
        />
        <Button
          aria-label='Add related item'
          onClick={() => {
            if(!newSubtaskLabel.trim()) return;
            setSubtasks((prev) => [...prev, { id: `sub-${prev.length}`, label: newSubtaskLabel, done: false }]);
            setNewSubtaskLabel('');
          }}
        >
          Add related item
        </Button>
      </ModalContent>
      <ModalFooter>
        <Button variant='destructive' onClick={() => onDelete(card.id)}>Delete</Button>
        <Button variant='secondary' onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </ModalFooter>
    </>
  );
};

// ─── jsdom stubs ──────────────────────────────────────────────────────────────
// jsdom doesn't implement <dialog>.showModal()/close(), which the Modal used by
// the card details popup relies on.

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function(this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

// dnd-kit measures every draggable/droppable via getBoundingClientRect to run
// collision detection; jsdom's default (all zeros) can't distinguish targets.
const mockRect = (element: Element, rect: { top: number; left: number; width: number; height: number }) => {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => rect,
  });
};

const columns = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'card-1', title: 'Design system audit', tag: 'Design' },
      { id: 'card-2', title: 'Write component specs' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: 'card-3', title: 'Build Button component', description: 'Primary + variants' },
      {
        id: 'card-4',
        title: 'Ship release notes',
        points: 5,
        dueDate: '2026-09-12T12:00:00.000Z',
        subtasks: [
          { id: 'sub-1', label: 'Draft changelog', done: true },
          { id: 'sub-2', label: 'Get sign-off', done: false },
        ],
      },
    ],
  },
  { id: 'done', title: 'Done', cards: [] },
];

describe('KanbanBoard', () => {
  it('renders without errors', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getByRole('application', { name: /kanban board/i })).toBeTruthy();
  });

  it('renders all column titles', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getByText('To Do')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('renders all card titles', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getByText('Design system audit')).toBeTruthy();
    expect(screen.getByText('Write component specs')).toBeTruthy();
    expect(screen.getByText('Build Button component')).toBeTruthy();
  });

  it('shows card counts per column', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getAllByText('2')[0]).toBeTruthy(); // To Do
  });

  it('renders card tags', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getByText('Design')).toBeTruthy();
  });

  it('renders card descriptions', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getByText('Primary + variants')).toBeTruthy();
  });

  it('does not open a popup or show an info button when renderCardDetails is not provided', () => {
    render(<KanbanBoard initialColumns={columns} />);

    fireEvent.click(screen.getByText('Build Button component'));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('button', { name: /view details for/i })).toBeNull();
  });

  it('opens a details popup pre-filled with the card title and description when clicked', async () => {
    render(<KanbanBoard initialColumns={columns} renderCardDetails={CardDetails} />);

    fireEvent.click(screen.getByText('Build Button component'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    expect(screen.getByLabelText('Title')).toHaveValue('Build Button component');
    expect(screen.getByLabelText('Description')).toHaveValue('Primary + variants');
  });

  it('opens the details popup via the info button, pre-filled with the tag and an empty description', async () => {
    render(<KanbanBoard initialColumns={columns} renderCardDetails={CardDetails} />);

    fireEvent.click(screen.getByRole('button', { name: /view details for design system audit/i }));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    expect(screen.getByLabelText('Tag')).toHaveValue('Design');
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });

  it('saves an edited title back onto the board', async () => {
    render(<KanbanBoard initialColumns={columns} renderCardDetails={CardDetails} />);

    fireEvent.click(screen.getByText('Write component specs'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Write component specs v2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Write component specs v2')).toBeTruthy();
    expect(screen.queryByText('Write component specs')).toBeNull();
  });

  it('closes and discards edits when cancelled', async () => {
    render(<KanbanBoard initialColumns={columns} renderCardDetails={CardDetails} />);

    fireEvent.click(screen.getByText('Write component specs'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Discarded edit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Write component specs')).toBeTruthy();
    expect(screen.queryByText('Discarded edit')).toBeNull();
  });

  it('shows points, due date, and subtask progress on the card face when present', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('Sep 12')).toBeTruthy();
    expect(screen.getByText('1/2')).toBeTruthy();
  });

  it('adds and completes a related item, and reflects the new progress count after saving', async () => {
    render(<KanbanBoard initialColumns={columns} renderCardDetails={CardDetails} />);

    fireEvent.click(screen.getByText('Ship release notes'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByLabelText('Get sign-off'));

    fireEvent.change(screen.getByLabelText('Add a related item'), { target: { value: 'Notify support' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add related item' }));
    expect(screen.getByText('Notify support')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('2/3')).toBeTruthy();
  });

  it('removes a card from the board when deleted', async () => {
    render(<KanbanBoard initialColumns={columns} renderCardDetails={CardDetails} />);

    fireEvent.click(screen.getByText('Write component specs'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByText('Write component specs')).toBeNull();
  });

  it('allows dragging a card into an empty column', async () => {
    const { container } = render(<KanbanBoard initialColumns={columns} />);

    const card = screen.getByRole('button', { name: /design system audit/i });
    mockRect(card, { top: 0, left: 0, width: 200, height: 40 });

    // Each column's card list is the only element carrying this class; 'Done'
    // (empty) is the third column in the fixture.
    const dropZones = container.querySelectorAll('[class*="min-h-"]');
    const doneDropZone = dropZones[2] as HTMLElement;
    mockRect(doneDropZone, { top: 400, left: 0, width: 200, height: 100 });

    fireEvent.pointerDown(card, { pointerId: 1, isPrimary: true, button: 0, clientX: 10, clientY: 20 });
    fireEvent.pointerMove(document, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 30 });
    fireEvent.pointerMove(document, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 460 });
    fireEvent.pointerUp(document, { pointerId: 1, isPrimary: true, clientX: 10, clientY: 460 });

    expect(within(doneDropZone).getByText('Design system audit')).toBeTruthy();

    // dnd-kit suppresses the synthetic click that follows a drag by attaching a
    // capture-phase `click` listener on `document`, removed 50ms after drag end
    // (see AbstractPointerSensor#detach in @dnd-kit/core). Waiting it out here
    // stops it from swallowing the next test's own click in capture phase.
    await new Promise((resolve) => setTimeout(resolve, 60));
  });

  it('renders the default card face when renderCard is not provided', () => {
    render(<KanbanBoard initialColumns={columns} renderCardDetails={CardDetails} />);

    expect(screen.getByText('Design')).toBeTruthy();
    expect(screen.getByRole('button', { name: /view details for design system audit/i })).toBeTruthy();
  });

  it('replaces the card face with a custom renderCard, while drag and click-to-open still work', async () => {
    const customRenderCard: KanbanCardFaceRenderer = ({ card, onViewDetails }) => (
      <>
        <span>{card.title.toUpperCase()}</span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
        >
          Custom details trigger
        </button>
      </>
    );

    render(<KanbanBoard initialColumns={columns} renderCard={customRenderCard} renderCardDetails={CardDetails} />);

    // The default template (tag badge, info button) never renders when renderCard is provided
    expect(screen.getByText('DESIGN SYSTEM AUDIT')).toBeTruthy();
    expect(screen.queryByText('Design')).toBeNull();
    expect(screen.queryByRole('button', { name: /view details for/i })).toBeNull();

    // The draggable wrapper (ref, aria-label, drag listeners) still comes from KanbanCard
    expect(screen.getByRole('button', { name: /design system audit/i })).toBeTruthy();

    const triggers = screen.getAllByRole('button', { name: 'Custom details trigger' });
    fireEvent.click(triggers[0]);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
  });
});
