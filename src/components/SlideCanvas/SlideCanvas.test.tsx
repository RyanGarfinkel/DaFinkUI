import type { SlideElement, SlideElementState } from './SlideCanvas';
import { render, screen, fireEvent } from '@testing-library/react';
import { moveRect, resizeRect, snapToGuides } from './geometry';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import SlideCanvas from './SlideCanvas';
import { useState } from 'react';

const BOUNDS = { width: 1280, height: 720 };

interface TestElement extends SlideElement {
	text?: string;
}

const renderElement = (el: TestElement, state: SlideElementState) => (
	<span data-editing={state.editing}>{el.text}</span>
);

const ELEMENTS: TestElement[] = [
	{ id: 'title', label: 'Title', x: 100, y: 100, width: 400, height: 80, text: 'Hello' },
	{ id: 'box', label: 'Box', x: 600, y: 300, width: 200, height: 200 },
];

describe('geometry', () =>
{
	it('moves within the slide bounds', () =>
	{
		expect(moveRect({ x: 10, y: 10, width: 100, height: 100 }, -50, 5, BOUNDS)).toEqual({ x: 0, y: 15, width: 100, height: 100 });
		expect(moveRect({ x: 1100, y: 0, width: 100, height: 100 }, 500, 0, BOUNDS).x).toBe(1180);
	});

	it('snaps moves to the grid', () =>
	{
		expect(moveRect({ x: 0, y: 0, width: 10, height: 10 }, 13, 3, BOUNDS, 8)).toEqual({ x: 16, y: 0, width: 10, height: 10 });
	});

	it('resizes from a corner, pinning the opposite corner', () =>
	{
		expect(resizeRect({ x: 100, y: 100, width: 200, height: 100 }, 'nw', 50, 20, BOUNDS)).toEqual({ x: 150, y: 120, width: 150, height: 80 });
		expect(resizeRect({ x: 100, y: 100, width: 200, height: 100 }, 'se', 30, 40, BOUNDS)).toEqual({ x: 100, y: 100, width: 230, height: 140 });
	});

	it('never shrinks below the minimum size or grows past the slide', () =>
	{
		const shrunk = resizeRect({ x: 100, y: 100, width: 50, height: 50 }, 'se', -500, -500, BOUNDS);
		expect(shrunk.width).toBe(16);
		expect(shrunk.height).toBe(16);
		expect(resizeRect({ x: 1200, y: 0, width: 50, height: 50 }, 'ne', 500, 0, BOUNDS).width).toBe(80);
	});
});

describe('snapToGuides', () =>
{
	const other = { x: 400, y: 200, width: 200, height: 100 };

	it('snaps a moved rect\'s nearest line to another element and reports the guide', () =>
	{
		const { rect, guides } = snapToGuides({ x: 403, y: 50, width: 100, height: 50 }, 'move', [other], BOUNDS, 6);
		expect(rect.x).toBe(400);
		expect(guides.x).toEqual([400]);
		expect(guides.y).toEqual([]);
	});

	it('snaps centers to the slide center', () =>
	{
		const { rect, guides } = snapToGuides({ x: 588, y: 10, width: 100, height: 50 }, 'move', [], BOUNDS, 6);
		expect(rect.x).toBe(590);
		expect(guides.x).toEqual([640]);
	});

	it('leaves rects outside the threshold alone', () =>
	{
		const { rect, guides } = snapToGuides({ x: 300, y: 50, width: 50, height: 50 }, 'move', [other], BOUNDS, 6);
		expect(rect).toEqual({ x: 300, y: 50, width: 50, height: 50 });
		expect(guides).toEqual({ x: [], y: [] });
	});

	it('resizing only snaps the dragged edges', () =>
	{
		const { rect } = snapToGuides({ x: 100, y: 100, width: 296, height: 97 }, 'se', [other], BOUNDS, 6);
		expect(rect).toEqual({ x: 100, y: 100, width: 300, height: 100 });
	});
});

describe('SlideCanvas', () =>
{
	beforeAll(() =>
	{
		HTMLElement.prototype.setPointerCapture = () => {};
		HTMLElement.prototype.hasPointerCapture = () => true;
	});

	it('renders elements as labelled buttons inside a slide group', () =>
	{
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} />);
		expect(screen.getByRole('group', { name: 'Slide' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Title' })).toBeDefined();
		expect(screen.getByText('Hello')).toBeDefined();
	});

	it('positions elements in logical px', () =>
	{
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} />);
		const box = screen.getByRole('button', { name: 'Box' });
		expect(box.style.left).toBe('600px');
		expect(box.style.width).toBe('200px');
	});

	it('selects on focus and shows resize handles', () =>
	{
		const onSelectedIdChange = vi.fn();
		const { container } = render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} onSelectedIdChange={onSelectedIdChange} />);
		const title = screen.getByRole('button', { name: 'Title' });
		fireEvent.focus(title);
		expect(onSelectedIdChange).toHaveBeenCalledWith('title');
		expect(title.getAttribute('aria-pressed')).toBe('true');
		expect(title.className).toContain('outline-brand');
		expect(container.querySelectorAll('[data-corner]')).toHaveLength(4);
	});

	it('respects controlled selection', () =>
	{
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} selectedId='box' />);
		expect(screen.getByRole('button', { name: 'Box' }).getAttribute('aria-pressed')).toBe('true');
		expect(screen.getByRole('button', { name: 'Title' }).getAttribute('aria-pressed')).toBe('false');
	});

	it('arrow keys nudge by 1, shift by 10, and announce the position', () =>
	{
		const onElementsChange = vi.fn();
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={onElementsChange} />);
		const title = screen.getByRole('button', { name: 'Title' });

		fireEvent.keyDown(title, { key: 'ArrowRight' });
		expect(onElementsChange.mock.calls[0][0][0]).toMatchObject({ x: 101, y: 100 });

		fireEvent.keyDown(title, { key: 'ArrowDown', shiftKey: true });
		expect(onElementsChange.mock.calls[1][0][0]).toMatchObject({ x: 100, y: 110 });
		expect(screen.getByRole('status').textContent).toBe('Title: x 100, y 110, 400 by 80');
	});

	it('alt + arrow keys resize', () =>
	{
		const onElementsChange = vi.fn();
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={onElementsChange} />);
		fireEvent.keyDown(screen.getByRole('button', { name: 'Title' }), { key: 'ArrowRight', altKey: true, shiftKey: true });
		expect(onElementsChange.mock.calls[0][0][0]).toMatchObject({ x: 100, width: 410 });
	});

	it('delete removes the focused element', () =>
	{
		const onElementsChange = vi.fn();
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={onElementsChange} />);
		fireEvent.keyDown(screen.getByRole('button', { name: 'Box' }), { key: 'Delete' });
		expect(onElementsChange).toHaveBeenCalledWith([ELEMENTS[0]]);
	});

	it('escape clears the selection', () =>
	{
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} />);
		const title = screen.getByRole('button', { name: 'Title' });
		fireEvent.focus(title);
		fireEvent.keyDown(title, { key: 'Escape' });
		expect(title.getAttribute('aria-pressed')).toBe('false');
	});

	it('has hover and focus-visible classes on elements', () =>
	{
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} />);
		const box = screen.getByRole('button', { name: 'Box' });
		expect(box.className).toContain('hover:outline-input-border-hover');
		expect(box.className).toContain('focus-visible:ring-2');
	});

	it('readOnly removes elements from tab order and ignores keys', () =>
	{
		const onElementsChange = vi.fn();
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={onElementsChange} readOnly />);
		const title = screen.getByRole('button', { name: 'Title' });
		expect(title.getAttribute('tabindex')).toBe('-1');
		expect(title.className).not.toContain('cursor-move');
		fireEvent.keyDown(title, { key: 'ArrowRight' });
		fireEvent.keyDown(title, { key: 'Delete' });
		expect(onElementsChange).not.toHaveBeenCalled();
	});

	it('announces the final rect after a pointer resize, not the pre-drag rect', () =>
	{
		const { container } = render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} selectedId='box' />);
		const handle = container.querySelector('[data-corner="se"]') as HTMLElement;

		fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
		fireEvent.pointerMove(handle, { pointerId: 1, clientX: 40, clientY: 20 });
		fireEvent.pointerUp(handle, { pointerId: 1 });

		expect(screen.getByRole('status').textContent).toBe('Box: x 600, y 300, 240 by 220');
	});

	it('enters editing on double-click or Enter only for editable elements', () =>
	{
		const onEditingIdChange = vi.fn();
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} canEdit={el => el.id === 'title'} onEditingIdChange={onEditingIdChange} />);

		fireEvent.doubleClick(screen.getByRole('button', { name: 'Box' }));
		expect(onEditingIdChange).not.toHaveBeenCalled();

		fireEvent.keyDown(screen.getByRole('button', { name: 'Title' }), { key: 'Enter' });
		expect(onEditingIdChange).toHaveBeenCalledWith('title');
		expect(screen.getByText('Hello').getAttribute('data-editing')).toBe('true');
	});

	it('while editing, keys go to the content and Escape exits', () =>
	{
		const onElementsChange = vi.fn();
		const { container } = render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={onElementsChange} canEdit={() => true} editingId='title' selectedId='title' />);
		const title = screen.getByRole('group', { name: 'Title' });

		fireEvent.keyDown(title, { key: 'Backspace' });
		fireEvent.keyDown(title, { key: 'ArrowRight' });
		expect(onElementsChange).not.toHaveBeenCalled();
		expect(container.querySelectorAll('[data-corner]')).toHaveLength(0);
		expect(title.querySelector('.pointer-events-none')).toBeNull();
	});

	it('Escape while editing returns to selection', () =>
	{
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} canEdit={() => true} />);
		const title = screen.getByRole('button', { name: 'Title' });
		fireEvent.doubleClick(title);
		fireEvent.keyDown(screen.getByRole('group', { name: 'Title' }), { key: 'Escape' });
		expect(screen.getByRole('button', { name: 'Title' }).getAttribute('aria-pressed')).toBe('true');
	});

	it('does not clip element content, so overflowing text can never be scrolled out of view inside its box', () =>
	{
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} canEdit={() => true} editingId='title' />);
		const wrapper = screen.getByText('Hello').parentElement as HTMLElement;
		expect(wrapper.className).not.toContain('overflow-hidden');
	});

	it('shows a guide while a drag snaps to another element, and clears it on release', () =>
	{
		const Controlled = () => {
			const [els, setEls] = useState(ELEMENTS);
			return <SlideCanvas renderElement={renderElement} elements={els} onElementsChange={setEls} />;
		};
		const { container } = render(<Controlled />);
		const box = screen.getByRole('button', { name: 'Box' });

		fireEvent.pointerDown(box, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
		fireEvent.pointerMove(box, { pointerId: 1, clientX: -97, clientY: 0 });
		expect(box.style.left).toBe('500px');
		expect(container.querySelectorAll('[data-guide="x"]')).toHaveLength(1);

		fireEvent.pointerUp(box, { pointerId: 1 });
		expect(container.querySelectorAll('[data-guide]')).toHaveLength(0);
	});

	it('holding Alt bypasses element snapping', () =>
	{
		const onElementsChange = vi.fn();
		render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={onElementsChange} />);
		const box = screen.getByRole('button', { name: 'Box' });
		fireEvent.pointerDown(box, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
		fireEvent.pointerMove(box, { pointerId: 1, clientX: -97, clientY: 0, altKey: true });
		expect(onElementsChange.mock.calls[0][0][1].x).toBe(503);
	});

	it('renders the floating toolbar for the selected element only', () =>
	{
		const renderToolbar = (el: TestElement) => <button type='button'>Format {el.label}</button>;
		const { rerender } = render(<SlideCanvas renderElement={renderElement} renderToolbar={renderToolbar} elements={ELEMENTS} onElementsChange={() => {}} selectedId={null} />);
		expect(screen.queryByText(/Format/)).toBeNull();

		rerender(<SlideCanvas renderElement={renderElement} renderToolbar={renderToolbar} elements={ELEMENTS} onElementsChange={() => {}} selectedId='box' />);
		expect(screen.getByRole('button', { name: 'Format Box' })).toBeDefined();
	});

	it('Alt+F10 moves focus into the toolbar and Escape returns it to the element', () =>
	{
		const renderToolbar = () => <button type='button'>Bold</button>;
		render(<SlideCanvas renderElement={renderElement} renderToolbar={renderToolbar} elements={ELEMENTS} onElementsChange={() => {}} selectedId='title' />);
		const title = screen.getByRole('button', { name: 'Title' });
		const bold = screen.getByRole('button', { name: 'Bold' });

		fireEvent.keyDown(title, { key: 'F10', altKey: true });
		expect(document.activeElement).toBe(bold);

		fireEvent.keyDown(bold, { key: 'Escape' });
		expect(document.activeElement).toBe(title);
	});

	it('a fixed scale sizes the frame and is reported back', () =>
	{
		const onScaleChange = vi.fn();
		render(<SlideCanvas renderElement={renderElement} elements={[]} onElementsChange={() => {}} scale={0.5} onScaleChange={onScaleChange} data-testid='slide' />);
		expect(screen.getByTestId('slide').style.width).toBe('640px');
		expect(onScaleChange).toHaveBeenCalledWith(0.5);
	});

	it('draw mode: a drag on the stage reports grid-snapped points and never moves elements', () =>
	{
		const onDraw = vi.fn();
		const onElementsChange = vi.fn();
		const { container } = render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={onElementsChange} drawing onDraw={onDraw} gridSize={8} />);
		const stage = container.querySelector('[data-slide-stage]') as HTMLElement;
		const box = screen.getByRole('button', { name: 'Box' });

		fireEvent.pointerDown(box, { button: 0, pointerId: 1, clientX: 610, clientY: 305 });
		fireEvent.pointerMove(stage, { pointerId: 1, clientX: 803, clientY: 401 });
		expect(container.querySelector('[data-draft]')).not.toBeNull();
		fireEvent.pointerUp(stage, { pointerId: 1 });

		expect(onDraw).toHaveBeenCalledWith({ x: 608, y: 304 }, { x: 800, y: 400 });
		expect(onElementsChange).not.toHaveBeenCalled();
		expect(container.querySelector('[data-draft]')).toBeNull();
		expect(stage.className).toContain('cursor-crosshair');
	});

	it('renders a backdrop behind the elements, hidden from assistive tech and click-through', () =>
	{
		const { container } = render(<SlideCanvas renderElement={renderElement} elements={ELEMENTS} onElementsChange={() => {}} backdrop={<span>stars</span>} />);
		const backdrop = container.querySelector('[data-slide-backdrop]') as HTMLElement;
		expect(backdrop.textContent).toBe('stars');
		expect(backdrop.getAttribute('aria-hidden')).toBe('true');
		expect(backdrop.className).toContain('pointer-events-none');
		expect(backdrop.nextElementSibling?.getAttribute('data-slide-element')).toBe('title');
	});

	it('applies stageStyle to the stage only, so theme variables never reach the floating toolbar', () =>
	{
		const { container } = render(
			<SlideCanvas
				renderElement={renderElement}
				renderToolbar={() => <button type='button'>Bold</button>}
				elements={ELEMENTS}
				onElementsChange={() => {}}
				selectedId='title'
				stageStyle={{ ['--color-text' as string]: '#123456', width: 1 }}
			/>
		);
		const stage = container.querySelector('[data-slide-stage]') as HTMLElement;
		expect(stage.style.getPropertyValue('--color-text')).toBe('#123456');
		expect(stage.style.width).toBe('1280px');
		expect((screen.getByRole('button', { name: 'Bold' }).closest('[class*="z-20"]') as HTMLElement).style.getPropertyValue('--color-text')).toBe('');
	});

	it('applies a custom stage background', () =>
	{
		const { container } = render(<SlideCanvas renderElement={renderElement} elements={[]} onElementsChange={() => {}} background='rgb(1, 2, 3)' />);
		expect((container.querySelector('.origin-top-left') as HTMLElement).style.background).toBe('rgb(1, 2, 3)');
	});

	it('sizes the frame to the slide aspect ratio and forwards props', () =>
	{
		render(<SlideCanvas renderElement={renderElement} elements={[]} onElementsChange={() => {}} width={1000} height={500} data-testid='slide' className='max-w-lg' />);
		const frame = screen.getByTestId('slide');
		expect(frame.style.aspectRatio).toBe('1000 / 500');
		expect(frame.className).toContain('max-w-lg');
	});
});
