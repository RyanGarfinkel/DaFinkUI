import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Canvas } from './Canvas';

describe('Canvas', () => {
  it('renders without errors', () => {
    render(<Canvas />);
    expect(screen.getByRole('img', { name: /drawing canvas/i })).toBeTruthy();
  });

  it('renders the toolbar by default', () => {
    render(<Canvas />);
    expect(screen.getByRole('group', { name: /drawing tool/i })).toBeTruthy();
    expect(screen.getByLabelText('Pen')).toBeTruthy();
    expect(screen.getByLabelText('Eraser')).toBeTruthy();
  });

  it('hides toolbar when showToolbar is false', () => {
    render(<Canvas showToolbar={false} />);
    expect(screen.queryByRole('group', { name: /drawing tool/i })).toBeNull();
  });

  it('renders color palette', () => {
    render(<Canvas />);
    expect(screen.getByRole('radiogroup', { name: /color/i })).toBeTruthy();
    expect(screen.getByLabelText('Blue')).toBeTruthy();
  });

  it('renders undo and redo buttons', () => {
    render(<Canvas />);
    expect(screen.getByLabelText('Undo')).toBeTruthy();
    expect(screen.getByLabelText('Redo')).toBeTruthy();
  });

  it('undo is disabled when no strokes', () => {
    render(<Canvas />);
    expect(screen.getByLabelText('Undo')).toHaveProperty('disabled', true);
  });
});
