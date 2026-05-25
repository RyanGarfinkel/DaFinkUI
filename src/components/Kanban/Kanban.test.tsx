import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KanbanBoard } from './Kanban';

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
    cards: [{ id: 'card-3', title: 'Build Button component', description: 'Primary + variants' }],
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
    expect(screen.getByText('2')).toBeTruthy(); // To Do
    expect(screen.getByText('1')).toBeTruthy(); // In Progress
  });

  it('renders card tags', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getByText('Design')).toBeTruthy();
  });

  it('renders card descriptions', () => {
    render(<KanbanBoard initialColumns={columns} />);
    expect(screen.getByText('Primary + variants')).toBeTruthy();
  });
});
