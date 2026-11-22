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

	it('keeps the insert tools and the actions as two separate bars when there is room', () =>
	{
		setEditorWidth(900);
		setup();
		expect(screen.getByRole('toolbar', { name: 'Insert' }).className).toContain('border-surface-border');
		expect(screen.getByRole('button', { name: 'Present' }).parentElement!.className).toContain('border-surface-border');
	});

	it('merges the insert tools and the actions into one bar when the editor is narrow', () =>
	{
		setEditorWidth(400);
		setup();
		const insert = screen.getByRole('toolbar', { name: 'Insert' });
		const actions = screen.getByRole('button', { name: 'Present' }).parentElement!;
		expect(insert.className).not.toContain('border-surface-border');
		expect(actions.className).not.toContain('border-surface-border');
		expect(insert.parentElement).toBe(actions.parentElement);
		expect(insert.parentElement!.className).toContain('border-surface-border');
	});

	it('opens the settings panel from the toolbar\'s More button and hides the toolbar while it is open', () =>
	{
		setEditorWidth(900);
		setup();
		fireEvent.focus(screen.getByRole('button', { name: 'Box' }));
		const toolbar = screen.getByRole('toolbar', { name: 'Shape formatting' });
		expect(screen.getByRole('button', { name: 'Settings sidebar' }).getAttribute('aria-expanded')).toBe('false');

		fireEvent.click(within(toolbar).getByRole('button', { name: 'More options' }));

		expect(screen.getByRole('button', { name: 'Settings sidebar' }).getAttribute('aria-expanded')).toBe('true');
		expect(screen.queryByRole('toolbar', { name: 'Shape formatting' })).toBeNull();
	});

	it('lets dropdowns overflow an open settings section, and clips it again once collapsed', () =>
	{
		setEditorWidth(900);
		setup();
		fireEvent.click(screen.getByRole('button', { name: 'Settings sidebar' }));
		fireEvent.focus(screen.getByRole('button', { name: 'Box' }));

		const trigger = screen.getByRole('button', { name: 'Shape' });
		const clipper = () => document.getElementById(trigger.getAttribute('aria-controls')!)!.firstElementChild!;
		expect(clipper().className).not.toContain('overflow-hidden');

		fireEvent.click(trigger);
		expect(clipper().className).toContain('overflow-hidden');
	});

	it('shows the selected element in the settings panel when it is already open', () =>
	{
		setEditorWidth(900);
		setup();
		fireEvent.click(screen.getByRole('button', { name: 'Settings sidebar' }));
		expect(screen.queryByRole('heading', { name: 'Element' })).toBeNull();

		fireEvent.focus(screen.getByRole('button', { name: 'Box' }));

		expect(screen.getByRole('heading', { name: 'Element' })).toBeDefined();
		expect(screen.getByRole('heading', { name: 'Shape' })).toBeDefined();
	});

	it('puts Ask AI in the format bar, and keeps it on its own while the settings panel hides the bar', () =>
	{
		setEditorWidth(900);
		const onAsk = vi.fn();
		setup({ onAsk });
		fireEvent.focus(screen.getByRole('button', { name: 'Box' }));
		const toolbar = screen.getByRole('toolbar', { name: 'Shape formatting' });
		expect(within(toolbar).getByRole('button', { name: 'Ask AI' })).toBeDefined();

		fireEvent.click(screen.getByRole('button', { name: 'Settings sidebar' }));
		expect(screen.queryByRole('toolbar', { name: 'Shape formatting' })).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));

		expect(onAsk).toHaveBeenCalledTimes(1);
		expect(onAsk.mock.calls[0][0]).toMatchObject({ elementId: 'box', slideNumber: 1 });
	});

	it('places a text box\'s text where its valign says', () =>
	{
		const text = (id: string, valign?: 'top' | 'middle' | 'bottom'): DeckElement => ({ id, label: id, type: 'text', html: '<p>Hi</p>', fontSize: 24, color: '', x: 0, y: 0, width: 300, height: 200, valign });
		const deck: Deck = { ...DECK, slides: [{ ...createSlide([text('plain'), text('mid', 'middle'), text('low', 'bottom')]), id: 's1' }] };
		setup({ deck });

		const wrapperOf = (label: string) => screen.getByRole('button', { name: label }).querySelector('.tiptap')!.closest('.flex-col')!;
		expect(wrapperOf('plain').className).toContain('justify-start');
		expect(wrapperOf('mid').className).toContain('justify-center');
		expect(wrapperOf('low').className).toContain('justify-end');
	});

	it('has no Ask AI button unless the host passes onAsk', () =>
	{
		setup();
		fireEvent.focus(screen.getByRole('button', { name: 'Box' }));
		expect(screen.queryByRole('button', { name: 'Ask AI' })).toBeNull();
	});

	it('reports the selected element when Ask AI is pressed', () =>
	{
		const onAsk = vi.fn();
		setup({ onAsk });
		fireEvent.focus(screen.getByRole('button', { name: 'Box' }));
		fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
		expect(onAsk).toHaveBeenCalledWith({
			slideId: 's1', slideNumber: 1, slideCount: 2,
			elementId: 'box', elementLabel: 'Box', elementType: 'shape',
			text: '', selectedText: false,
		});
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
		const undo = vi.fn();
		const redo = vi.fn();
		setup({ history: { undo, redo, canUndo: true, canRedo: false } });

		expect((screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement).disabled).toBe(true);
		fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
		const editor = screen.getByRole('region', { name: 'Pitch editor' });
		fireEvent.keyDown(editor, { key: 'z', metaKey: true });
		fireEvent.keyDown(editor, { key: 'z', metaKey: true, shiftKey: true });

		expect(undo).toHaveBeenCalledTimes(2);
		expect(redo).toHaveBeenCalledTimes(1);
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

	it('slides settings in over the right edge, not in a drawer, when the editor is narrow', () =>
	{
		setEditorWidth(420);
		setup();
		const settings = () => screen.getByRole('complementary', { name: 'Settings', hidden: true });
		expect(settings().className).toContain('translate-x-full');
		expect(settings().hasAttribute('inert')).toBe(true);

		fireEvent.click(screen.getByRole('button', { name: 'Settings sidebar' }));

		expect(screen.queryByRole('dialog', { hidden: true })).toBeNull();
		expect(settings().className).toContain('translate-x-0');
		expect(settings().hasAttribute('inert')).toBe(false);
	});

	it('uses a sidebar column when the editor is wide', () =>
	{
		setEditorWidth(1200);
		setup();
		expect(screen.getByRole('complementary', { name: 'Settings', hidden: true }).className).toContain('border-l');
	});

	it('resizes a table from its Rows and Columns settings, keeping the cells that remain', () =>
	{
		const table: DeckElement = { id: 'grid', label: 'Plan', type: 'table', header: true, fontSize: 24, rows: [['a', 'b'], ['c', 'd']], x: 100, y: 100, width: 400, height: 200 };
		setEditorWidth(900);
		const { onChange } = setup({ deck: { ...DECK, slides: [{ ...createSlide([table]), id: 's1' }] } });
		fireEvent.click(screen.getByRole('button', { name: 'Settings sidebar' }));
		fireEvent.focus(screen.getByRole('button', { name: 'Plan' }));

		fireEvent.change(screen.getByLabelText('Rows'), { target: { value: '3' } });
		const grown = onChange.mock.calls.at(-1)![0] as Deck;
		expect((grown.slides[0].elements[0] as Extract<DeckElement, { type: 'table' }>).rows).toEqual([['a', 'b'], ['c', 'd'], ['', '']]);

		fireEvent.change(screen.getByLabelText('Columns'), { target: { value: '1' } });
		const narrowed = onChange.mock.calls.at(-1)![0] as Deck;
		expect((narrowed.slides[0].elements[0] as Extract<DeckElement, { type: 'table' }>).rows).toEqual([['a'], ['c']]);
	});

	describe('charts linked to a sheet', () =>
	{
		const chart: DeckElement = { id: 'chart', label: 'Sales', type: 'chart', chart: 'bar', seriesLabel: 'Typed', data: [{ label: 'Typed', value: 1 }], x: 100, y: 100, width: 400, height: 300 };
		const chartData = {
			sheets:  [{ id: 'sheet1', title: 'Revenue' }],
			resolve: () => ({ seriesLabel: 'Revenue', data: [{ label: 'Jan', value: 10 }, { label: 'Feb', value: 20 }] }),
		};
		const chartDeck = (source?: { sheetId: string; range: string }): Deck => ({ ...DECK, slides: [{ ...createSlide([{ ...chart, source } as DeckElement]), id: 's1' }] });

		const openChartSettings = (deck: Deck, props: Partial<Parameters<typeof DeckEditor>[0]> = {}) => {
			setEditorWidth(900);
			const utils = setup({ deck, chartData, ...props });
			fireEvent.click(screen.getByRole('button', { name: 'Settings sidebar' }));
			fireEvent.focus(screen.getByRole('button', { name: 'Sales' }));
			return utils;
		};

		it('offers no data source choice unless the host provides sheets', () =>
		{
			openChartSettings(chartDeck(), { chartData: undefined });
			expect(screen.queryByText('Data')).toBeNull();
			expect(screen.getByLabelText('Series name')).toBeDefined();
		});

		it('links a chart by choosing a sheet in the Data menu', () =>
		{
			const { onChange } = openChartSettings(chartDeck());
			fireEvent.click(screen.getByRole('button', { name: /^Data/ }));
			fireEvent.pointerDown(screen.getByRole('option', { name: 'Revenue' }));
			const next = onChange.mock.calls.at(-1)![0] as Deck;
			expect((next.slides[0].elements[0] as Extract<DeckElement, { type: 'chart' }>).source).toEqual({ sheetId: 'sheet1', range: 'A1:B5' });
		});

		it('shows the range and hides the typed-in rows once linked', () =>
		{
			openChartSettings(chartDeck({ sheetId: 'sheet1', range: 'A1:B3' }));
			expect((screen.getByLabelText('Range') as HTMLInputElement).value).toBe('A1:B3');
			expect(screen.queryByLabelText('Series name')).toBeNull();
			expect(screen.queryByRole('button', { name: 'Add data point' })).toBeNull();
		});

		it('keeps the typed data when the source can\'t be read', () =>
		{
			openChartSettings(chartDeck({ sheetId: 'sheet1', range: 'A1:B3' }), { chartData: { ...chartData, resolve: () => null } });
			expect(screen.getByText('Can’t read that range.')).toBeDefined();
		});

		it('goes back to typed-in data from the Data menu', () =>
		{
			const { onChange } = openChartSettings(chartDeck({ sheetId: 'sheet1', range: 'A1:B3' }));
			fireEvent.click(screen.getByRole('button', { name: /^Data/ }));
			fireEvent.pointerDown(screen.getByRole('option', { name: 'Typed in' }));
			const next = onChange.mock.calls.at(-1)![0] as Deck;
			expect((next.slides[0].elements[0] as Extract<DeckElement, { type: 'chart' }>).source).toBeUndefined();
		});
	});
});
