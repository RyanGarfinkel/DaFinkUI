'use client';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { createSheet, type Sheet } from './sheet';
import { describe, it, expect, vi } from 'vitest';
import SheetEditor from './SheetEditor';
import { useState } from 'react';

const SEED: Sheet = {
	...createSheet(30, 6, 'Budget'),
	cells: { A1: { value: '10' }, A2: { value: '20' }, B1: { value: '=SUM(A1:A2)' } },
};

const Harness = ({ onUndo, initial = SEED }: { onUndo?: () => void; initial?: Sheet }) => {
	const [sheet, setSheet] = useState(initial);
	return <SheetEditor sheet={sheet} onChange={setSheet} onUndo={onUndo} />;
};

const grid = () => screen.getByRole('grid', { name: 'Budget grid' });

const cellText = (r: number, c: number) => {
	const cell = grid().querySelector(`[data-r="${r}"][data-c="${c}"]`);
	return cell?.textContent ?? null;
};

const press = (key: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(grid(), { key, ...init });

describe('SheetEditor', () =>
{
	it('renders a named region, a grid with headers, and computed values', () =>
	{
		render(<Harness />);
		expect(screen.getByRole('region', { name: 'Budget editor' })).toBeDefined();
		expect(within(grid()).getByRole('columnheader', { name: 'A' })).toBeDefined();
		expect(cellText(0, 1)).toBe('30');
	});

	it('types into the active cell and commits with Enter, moving down', () =>
	{
		render(<Harness />);
		press('5');
		const input = screen.getByLabelText('Cell contents');
		fireEvent.change(input, { target: { value: '50' } });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(cellText(0, 0)).toBe('50');
		expect(cellText(0, 1)).toBe('70');
		expect((screen.getByLabelText('Formula bar') as HTMLInputElement).value).toBe('20');
	});

	it('points at cells with the arrow keys while typing a formula', () =>
	{
		render(<Harness />);
		press('ArrowRight');
		press('ArrowRight');
		press('ArrowRight');
		press('ArrowRight');
		press('ArrowDown');
		press('=');
		const input = screen.getByLabelText('Cell contents') as HTMLInputElement;
		fireEvent.keyDown(input, { key: 'ArrowUp' });
		expect(input.value).toBe('=E1');
		fireEvent.keyDown(input, { key: 'ArrowLeft' });
		expect(input.value).toBe('=D1');
		fireEvent.keyDown(input, { key: 'ArrowDown', shiftKey: true });
		expect(input.value).toBe('=D1:D2');
	});

	it('suggests functions while typing a formula and completes one with Tab', () =>
	{
		render(<Harness />);
		press('=');
		const input = screen.getByLabelText('Cell contents') as HTMLInputElement;
		fireEvent.change(input, { target: { value: '=mean' } });
		expect(screen.getByRole('option', { name: /AVERAGE\(range/ })).toBeDefined();
		fireEvent.keyDown(input, { key: 'Tab' });
		expect(input.value).toBe('=AVERAGE(');
		expect(screen.queryByRole('listbox')).toBeNull();
	});

	it('moves the caret normally when no reference is expected', () =>
	{
		render(<Harness />);
		press('=');
		const input = screen.getByLabelText('Cell contents') as HTMLInputElement;
		fireEvent.change(input, { target: { value: '=A1' } });
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(input.value).toBe('=A1');
	});

	it('Escape cancels an edit', () =>
	{
		render(<Harness />);
		press('Enter');
		const input = screen.getByLabelText('Cell contents');
		fireEvent.change(input, { target: { value: '999' } });
		fireEvent.keyDown(input, { key: 'Escape' });
		expect(screen.queryByLabelText('Cell contents')).toBeNull();
		expect(cellText(0, 0)).toBe('10');
	});

	it('shows the raw formula in the formula bar for the active cell', () =>
	{
		render(<Harness />);
		press('ArrowRight');
		expect((screen.getByLabelText('Formula bar') as HTMLInputElement).value).toBe('=SUM(A1:A2)');
	});

	it('extends the selection with Shift+Arrow and shows its stats', () =>
	{
		render(<Harness />);
		press('ArrowDown', { shiftKey: true });
		expect(screen.getByText('Sum: 30')).toBeDefined();
		expect(screen.getByText('Average: 15')).toBeDefined();
	});

	it('Delete clears the selected cells', () =>
	{
		render(<Harness />);
		press('ArrowDown', { shiftKey: true });
		press('Delete');
		expect(cellText(0, 0)).toBe('');
		expect(cellText(0, 1)).toBe('0');
	});

	it('pastes tab-separated text at the active cell', () =>
	{
		render(<Harness />);
		fireEvent.paste(grid(), { clipboardData: { getData: () => '1\t2\n3\t4' } });
		expect(cellText(0, 0)).toBe('1');
		expect(cellText(1, 1)).toBe('4');
	});

	it('copies the selection as tab-separated text', () =>
	{
		render(<Harness />);
		press('ArrowDown', { shiftKey: true });
		const setData = vi.fn();
		fireEvent.copy(grid(), { clipboardData: { setData } });
		expect(setData).toHaveBeenCalledWith('text/plain', '10\n20');
	});

	it('bolds the selection with the keyboard and reflects it in the toolbar', () =>
	{
		render(<Harness />);
		press('b', { metaKey: true });
		expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true');
	});

	it('aligns the selection vertically from the toolbar', () =>
	{
		render(<Harness />);
		fireEvent.click(screen.getByRole('button', { name: 'Align bottom' }));
		expect(screen.getByRole('button', { name: 'Align bottom' }).getAttribute('aria-pressed')).toBe('true');
		expect(screen.getByRole('button', { name: 'Align top' }).getAttribute('aria-pressed')).toBe('false');
	});

	it('calls onUndo for Cmd+Z', () =>
	{
		const onUndo = vi.fn();
		render(<Harness onUndo={onUndo} />);
		press('z', { metaKey: true });
		expect(onUndo).toHaveBeenCalledOnce();
	});

	it('hides the undo controls without onUndo or onRedo', () =>
	{
		render(<SheetEditor sheet={SEED} onChange={() => undefined} />);
		expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
	});

	it('marks the active descendant and selected cells for assistive tech', () =>
	{
		render(<Harness />);
		const active = grid().getAttribute('aria-activedescendant')!;
		expect(document.getElementById(active)?.getAttribute('aria-selected')).toBe('true');
		expect(grid().getAttribute('aria-rowcount')).toBe('31');
	});

	it('shows an error code as text', () =>
	{
		render(<Harness initial={{ ...SEED, cells: { A1: { value: '=1/0' } } }} />);
		expect(cellText(0, 0)).toBe('#DIV/0!');
	});

	it('shows Ask AI only when onAsk is passed, and reports the selection', () =>
	{
		const { unmount } = render(<SheetEditor sheet={SEED} onChange={() => undefined} />);
		expect(screen.queryByRole('button', { name: 'Ask AI' })).toBeNull();
		unmount();

		const onAsk = vi.fn();
		render(<SheetEditor sheet={SEED} onChange={() => undefined} onAsk={onAsk} />);
		press('ArrowDown', { shiftKey: true });
		fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
		expect(onAsk).toHaveBeenCalledWith({ range: 'A1:A2', activeCell: 'A1', rows: 2, cols: 1, text: '10\n20', truncated: false });
	});

	it('tags the highlighted range and outlines its cells', () =>
	{
		render(<Harness />);
		expect(screen.queryByText('AI')).toBeNull();
		render(<SheetEditor sheet={SEED} onChange={() => undefined} highlight='B1:B2' highlightLabel='Agent' />);
		expect(screen.getByText('Agent')).toBeDefined();
		const outlined = document.querySelectorAll('[role="gridcell"].ring-brand');
		expect(outlined).toHaveLength(2);
	});

	it('ignores a highlight that is not a valid range', () =>
	{
		render(<SheetEditor sheet={SEED} onChange={() => undefined} highlight='nonsense' />);
		expect(screen.queryByText('AI')).toBeNull();
	});

	it('merges a custom className and forwards native props', () =>
	{
		render(<SheetEditor sheet={SEED} onChange={() => undefined} className='custom-class' data-testid='root' />);
		expect(screen.getByTestId('root').className).toContain('custom-class');
	});
});
