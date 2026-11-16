import { contrastRatio, hexToHsv, hsvToHex, normalizeHex } from './color';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ColorPicker from './ColorPicker';
import { useState } from 'react';

const SWATCHES = ['#ef4444', '#22c55e', '#3b82f6'];

describe('color helpers', () =>
{
	it('normalizes short and unprefixed hex', () =>
	{
		expect(normalizeHex('ABC')).toBe('#aabbcc');
		expect(normalizeHex('#3B82F6')).toBe('#3b82f6');
		expect(normalizeHex('#12')).toBeNull();
	});

	it('round-trips hex through hsv', () =>
	{
		for(const hex of ['#000000', '#ffffff', '#3b82f6', '#ef4444', '#808080'])
			expect(hsvToHex(hexToHsv(hex)!)).toBe(hex);
	});
});

describe('contrastRatio', () =>
{
	it('matches the WCAG reference values', () =>
	{
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
		expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
		expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
		expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 1);
	});

	it('returns null for non-hex input', () =>
	{
		expect(contrastRatio('var(--x)', '#ffffff')).toBeNull();
	});
});

describe('ColorPicker', () =>
{
	it('renders without errors', () =>
	{
		render(<ColorPicker value='#3b82f6' onValueChange={() => {}} />);
		expect(screen.getByRole('group', { name: 'Color picker' })).toBeDefined();
	});

	it('labels the group with the visible label', () =>
	{
		render(<ColorPicker label='Accent' value='#3b82f6' onValueChange={() => {}} />);
		expect(screen.getByRole('group', { name: 'Accent' })).toBeDefined();
	});

	it('exposes area and hue as sliders with value text', () =>
	{
		render(<ColorPicker value='#ff0000' onValueChange={() => {}} />);
		const area = screen.getByRole('slider', { name: 'Saturation and brightness' });
		const hue = screen.getByRole('slider', { name: 'Hue' });
		expect(area.getAttribute('aria-valuetext')).toBe('Saturation 100%, brightness 100%');
		expect(hue.getAttribute('aria-valuenow')).toBe('0');
		expect(hue.getAttribute('aria-valuemax')).toBe('360');
	});

	it('arrow keys on the area adjust saturation and brightness', () =>
	{
		const onValueChange = vi.fn();
		render(<ColorPicker value='#ff0000' onValueChange={onValueChange} />);
		fireEvent.keyDown(screen.getByRole('slider', { name: 'Saturation and brightness' }), { key: 'ArrowDown', shiftKey: true });
		expect(onValueChange).toHaveBeenCalledWith('#e60000');
	});

	it('arrow keys on the hue slider rotate the hue', () =>
	{
		const onValueChange = vi.fn();
		render(<ColorPicker value='#ff0000' onValueChange={onValueChange} />);
		fireEvent.keyDown(screen.getByRole('slider', { name: 'Hue' }), { key: 'ArrowRight', shiftKey: true });
		expect(onValueChange).toHaveBeenCalledWith('#ff2a00');
	});

	it('commits a typed 6-digit hex', () =>
	{
		const onValueChange = vi.fn();
		render(<ColorPicker value='#000000' onValueChange={onValueChange} />);
		fireEvent.change(screen.getByLabelText('Hex color'), { target: { value: '#22c55e' } });
		expect(onValueChange).toHaveBeenCalledWith('#22c55e');
	});

	it('does not commit a partial hex while typing, and reverts invalid input on blur', () =>
	{
		const onValueChange = vi.fn();
		render(<ColorPicker value='#000000' onValueChange={onValueChange} />);
		const input = screen.getByLabelText('Hex color') as HTMLInputElement;
		fireEvent.change(input, { target: { value: '#abc' } });
		expect(onValueChange).not.toHaveBeenCalled();
		fireEvent.change(input, { target: { value: '#zz' } });
		fireEvent.blur(input);
		expect(input.value).toBe('#000000');
	});

	it('expands a 3-digit hex on blur', () =>
	{
		const onValueChange = vi.fn();
		render(<ColorPicker value='#000000' onValueChange={onValueChange} />);
		const input = screen.getByLabelText('Hex color');
		fireEvent.change(input, { target: { value: 'abc' } });
		fireEvent.blur(input);
		expect(onValueChange).toHaveBeenCalledWith('#aabbcc');
	});

	it('hides the hex input when showInput is false', () =>
	{
		render(<ColorPicker value='#000000' onValueChange={() => {}} showInput={false} />);
		expect(screen.queryByLabelText('Hex color')).toBeNull();
	});

	it('renders swatches as a radio group with the matching one checked', () =>
	{
		render(<ColorPicker value='#22C55E' onValueChange={() => {}} swatches={SWATCHES} />);
		const radios = screen.getAllByRole('radio');
		expect(radios).toHaveLength(3);
		expect(radios[1].getAttribute('aria-checked')).toBe('true');
		expect(radios[1].getAttribute('tabindex')).toBe('0');
		expect(radios[0].getAttribute('tabindex')).toBe('-1');
		expect(radios[1].className).toContain('ring-offset-2');
	});

	it('swatch arrow keys move focus without selecting, click selects', () =>
	{
		const onValueChange = vi.fn();
		render(<ColorPicker value='#000000' onValueChange={onValueChange} swatches={SWATCHES} />);
		const radios = screen.getAllByRole('radio');
		radios[0].focus();
		fireEvent.keyDown(radios[0], { key: 'ArrowLeft' });
		expect(document.activeElement).toBe(radios[2]);
		expect(onValueChange).not.toHaveBeenCalled();
		fireEvent.click(radios[2]);
		expect(onValueChange).toHaveBeenCalledWith('#3b82f6');
	});

	it('has focus-visible ring classes on interactive parts', () =>
	{
		render(<ColorPicker value='#000000' onValueChange={() => {}} swatches={SWATCHES} />);
		for(const el of [...screen.getAllByRole('slider'), ...screen.getAllByRole('radio')])
			expect(el.className).toContain('focus-visible:ring-2');
	});

	it('disabled removes sliders from tab order and ignores keys', () =>
	{
		const onValueChange = vi.fn();
		render(<ColorPicker value='#ff0000' onValueChange={onValueChange} disabled swatches={SWATCHES} />);
		const hue = screen.getByRole('slider', { name: 'Hue' });
		expect(hue.getAttribute('tabindex')).toBe('-1');
		expect(hue.getAttribute('aria-disabled')).toBe('true');
		expect(hue.className).toContain('pointer-events-none');
		expect((screen.getByLabelText('Hex color') as HTMLInputElement).disabled).toBe(true);
		expect((screen.getAllByRole('radio')[0] as HTMLButtonElement).disabled).toBe(true);
	});

	it('keeps hue when a controlled value is dragged down to black', () =>
	{
		const Controlled = () => {
			const [color, setColor] = useState('#3b82f6');
			return <ColorPicker value={color} onValueChange={setColor} />;
		};

		render(<Controlled />);
		const hue = screen.getByRole('slider', { name: 'Hue' });
		const area = screen.getByRole('slider', { name: 'Saturation and brightness' });
		const before = hue.getAttribute('aria-valuenow');

		for(let i = 0; i < 10; i++) fireEvent.keyDown(area, { key: 'ArrowDown', shiftKey: true });

		expect((screen.getByLabelText('Hex color') as HTMLInputElement).value).toBe('#000000');
		expect(hue.getAttribute('aria-valuenow')).toBe(before);
	});

	it('forwards native div props', () =>
	{
		render(<ColorPicker value='#000000' onValueChange={() => {}} data-testid='picker' className='w-80' />);
		expect(screen.getByTestId('picker').className).toContain('w-80');
	});
});
