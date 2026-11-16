import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import type { Deck, DeckElement } from './deck';
import DeckEditor from './DeckEditor';
import { createSlide } from './deck';

const box: DeckElement = { id: 'box', label: 'Box', type: 'shape', shape: 'rect', fill: '', radius: 0, x: 100, y: 100, width: 200, height: 100 };

const DECK: Deck = {
	title:  'Pitch',
	theme:  'app',
	slides: [{ ...createSlide([box]), id: 's1' }, { ...createSlide(), id: 's2' }],
};

const setup = (props: Partial<Parameters<typeof DeckEditor>[0]> = {}) => {
	const onChange = vi.fn();
	const utils = render(<DeckEditor deck={DECK} onChange={onChange} {...props} />);
	return { onChange, ...utils };
};

const setEditorWidth = (width: number) =>
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement)
	{
		return this.getAttribute('role') === 'region' ? width : 0;
	});

afterEach(() => vi.restoreAllMocks());

describe('DeckEditor', () =>
{
	it('renders the active slide and a rail entry per slide', () =>
	{
		setup();
		expect(screen.getByRole('region', { name: 'Pitch editor' })).toBeDefined();
		expect(screen.getByRole('group', { name: 'Slide 1 of 2' })).toBeDefined();
		const rail = screen.getByRole('navigation', { name: 'Slides' });
		expect(within(rail).getAllByRole('button', { name: /^Slide \d/ })).toHaveLength(2);
	});

	it('shows the format toolbar for the selected element', () =>
	{
		setup();
		const before = screen.queryAllByRole('toolbar').length;
		fireEvent.focus(screen.getByRole('button', { name: 'Box' }));
		expect(screen.queryAllByRole('toolbar')).toHaveLength(before + 1);
	});

	it('reports edits as the whole next deck', () =>
	{
		const { onChange } = setup();
		fireEvent.click(screen.getByRole('button', { name: 'Table' }));
		const next: Deck = onChange.mock.calls[0][0];
		expect(next.slides[0].elements.map(el => el.type)).toEqual(['shape', 'table']);
		expect(next.slides[1]).toBe(DECK.slides[1]);
	});

	it('routes undo and redo to the host, from buttons and shortcuts', () =>
	{
		const onUndo = vi.fn();
		const onRedo = vi.fn();
		setup({ onUndo, onRedo, canUndo: true, canRedo: false });

		expect((screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement).disabled).toBe(true);
		fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
		const editor = screen.getByRole('region', { name: 'Pitch editor' });
		fireEvent.keyDown(editor, { key: 'z', metaKey: true });
		fireEvent.keyDown(editor, { key: 'z', metaKey: true, shiftKey: true });

		expect(onUndo).toHaveBeenCalledTimes(2);
		expect(onRedo).toHaveBeenCalledTimes(1);
	});

	it('hides undo controls when the host keeps no history', () =>
	{
		setup();
		expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
	});

	it('renders host actions and status', () =>
	{
		setup({ toolbarEnd: <button type='button'>Save</button>, status: 'Saved to cloud' });
		expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
		expect(screen.getAllByRole('status').some(s => s.textContent === 'Saved to cloud')).toBe(true);
	});

	it('marks elements and slides someone else is editing', () =>
	{
		const { container } = setup({ highlightIds: ['box'], highlightLabel: 'Claude' });
		expect(container.querySelector('[data-highlighted]')).not.toBeNull();
		expect(screen.getByText('Claude')).toBeDefined();
		expect(screen.getByRole('button', { name: 'Slide 1, being edited' })).toBeDefined();
	});

	it('follows a controlled active slide and reports slide picks', () =>
	{
		const onActiveSlideChange = vi.fn();
		setup({ activeSlideId: 's2', onActiveSlideChange });
		expect(screen.getByRole('group', { name: 'Slide 2 of 2' })).toBeDefined();
		fireEvent.click(screen.getByRole('button', { name: /^Slide 1/ }));
		expect(onActiveSlideChange).toHaveBeenCalledWith('s1');
	});

	it('opens settings in a drawer when the editor is narrow', () =>
	{
		setEditorWidth(420);
		setup();
		expect(screen.queryByRole('complementary', { name: 'Settings' })).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'Settings sidebar' }));
		// jsdom never really opens a <dialog>, so it stays outside the accessibility tree there.
		expect(screen.getByRole('dialog', { hidden: true }).textContent).toContain('Settings');
	});

	it('uses a sidebar column when the editor is wide', () =>
	{
		setEditorWidth(1200);
		setup();
		expect(screen.getByRole('complementary', { name: 'Settings', hidden: true })).toBeDefined();
	});
});
