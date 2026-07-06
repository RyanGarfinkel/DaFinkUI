import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Slider from './Slider';

describe('Slider', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} />);
		const input = container.querySelector('input[type="range"]');
		expect(input).not.toBeNull();
	});

	it('renders with the correct value', () =>
	{
		const { container } = render(<Slider value={30} onValueChange={() => {}} />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.value).toBe('30');
	});

	it('renders label when provided', () =>
	{
		render(<Slider value={50} onValueChange={() => {}} label='Volume' />);
		expect(screen.getByText('Volume')).toBeDefined();
	});

	it('renders hint when provided', () =>
	{
		render(<Slider value={50} onValueChange={() => {}} hint='Drag to adjust' />);
		expect(screen.getByText('Drag to adjust')).toBeDefined();
	});

	it('shows current value when showValue is true', () =>
	{
		render(<Slider value={75} onValueChange={() => {}} showValue />);
		expect(screen.getByText('75')).toBeDefined();
	});

	it('does not show value display when showValue is false', () =>
	{
		render(<Slider value={75} onValueChange={() => {}} label='Volume' />);
		const spans = screen.queryAllByText('75');
		expect(spans.length).toBe(0);
	});

	it('calls onValueChange with numeric value on change', () =>
	{
		const handler = vi.fn();
		const { container } = render(<Slider value={50} onValueChange={handler} />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		fireEvent.change(input, { target: { value: '80' } });
		expect(handler).toHaveBeenCalledOnce();
		expect(handler).toHaveBeenCalledWith(80);
	});

	it('respects min, max, and step props', () =>
	{
		const { container } = render(
			<Slider value={5} onValueChange={() => {}} min={0} max={10} step={2} />
		);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.min).toBe('0');
		expect(input.max).toBe('10');
		expect(input.step).toBe('2');
	});

	it('disabled input has disabled attribute', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} disabled />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.disabled).toBe(true);
	});

	it('disabled input has opacity and pointer-events classes', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} disabled />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.className).toContain('disabled:opacity-40');
		expect(input.className).toContain('disabled:pointer-events-none');
	});

	it('has focus-visible ring classes', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.className).toContain('focus-visible:ring-2');
		expect(input.className).toContain('focus-visible:ring-offset-2');
		expect(input.className).toContain('focus-visible:ring-brand-ring');
	});

	it('forwards className to the root element', () =>
	{
		const { container } = render(
			<Slider value={50} onValueChange={() => {}} className='my-custom-class' />
		);
		expect(container.firstElementChild?.className).toContain('my-custom-class');
	});

	it('links label to input via htmlFor and id', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} label='Brightness' />);
		const label = screen.getByText('Brightness');
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(label.tagName.toLowerCase()).toBe('label');
		expect(input.id).toBeTruthy();
		expect((label as HTMLLabelElement).htmlFor).toBe(input.id);
	});

	it('sets aria-valuemin, aria-valuemax, aria-valuenow', () =>
	{
		const { container } = render(
			<Slider value={40} onValueChange={() => {}} min={10} max={90} />
		);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input.getAttribute('aria-valuemin')).toBe('10');
		expect(input.getAttribute('aria-valuemax')).toBe('90');
		expect(input.getAttribute('aria-valuenow')).toBe('40');
	});

	it('disabled input has the disabled HTML attribute set', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} disabled />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		expect(input).toHaveProperty('disabled', true);
	});

	it('fill bar has transition classes before any drag interaction', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} />);
		const fill = container.querySelector('input[type="range"]')?.previousElementSibling?.querySelector('div');
		expect(fill?.className).toContain('motion-safe:transition-all');
	});

	it('removes fill bar transition classes while actively dragging', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		const fill  = input.previousElementSibling?.querySelector('div');

		fireEvent.pointerDown(input);

		expect(fill?.className).not.toContain('motion-safe:transition-all');
	});

	it('restores fill bar transition classes after the drag ends', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		const fill  = input.previousElementSibling?.querySelector('div');

		fireEvent.pointerDown(input);
		expect(fill?.className).not.toContain('motion-safe:transition-all');

		fireEvent.pointerUp(input);
		expect(fill?.className).toContain('motion-safe:transition-all');
	});

	it('restores fill bar transition classes when the drag is cancelled', () =>
	{
		const { container } = render(<Slider value={50} onValueChange={() => {}} />);
		const input = container.querySelector('input[type="range"]') as HTMLInputElement;
		const fill  = input.previousElementSibling?.querySelector('div');

		fireEvent.pointerDown(input);
		fireEvent.pointerCancel(input);

		expect(fill?.className).toContain('motion-safe:transition-all');
	});
});
