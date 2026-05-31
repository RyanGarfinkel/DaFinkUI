import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Progress from './Progress';

describe('Progress', () =>
{
	it('renders without errors', () =>
	{
		render(<Progress value={50} />);
		expect(screen.getByRole('progressbar')).toBeDefined();
	});

	it('sets aria-valuenow to the provided value', () =>
	{
		render(<Progress value={40} />);
		expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('40');
	});

	it('sets aria-valuemin to 0', () =>
	{
		render(<Progress value={0} />);
		expect(screen.getByRole('progressbar').getAttribute('aria-valuemin')).toBe('0');
	});

	it('sets aria-valuemax to the provided max', () =>
	{
		render(<Progress value={5} max={10} />);
		expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe('10');
	});

	it('defaults aria-valuemax to 100', () =>
	{
		render(<Progress value={50} />);
		expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe('100');
	});

	it('renders label when showLabel is true', () =>
	{
		render(<Progress value={75} showLabel />);
		expect(screen.getByText('75%')).toBeDefined();
	});

	it('does not render label by default', () =>
	{
		render(<Progress value={75} />);
		expect(screen.queryByText('75%')).toBeNull();
	});

	it('clamps value above max to 100%', () =>
	{
		render(<Progress value={150} showLabel />);
		expect(screen.getByText('100%')).toBeDefined();
	});

	it('clamps negative values to 0%', () =>
	{
		render(<Progress value={-10} showLabel />);
		expect(screen.getByText('0%')).toBeDefined();
	});

	it('applies sm size class', () =>
	{
		render(<Progress value={50} size='sm' />);
		expect(screen.getByRole('progressbar').className).toContain('h-1');
	});

	it('applies lg size class', () =>
	{
		render(<Progress value={50} size='lg' />);
		expect(screen.getByRole('progressbar').className).toContain('h-3');
	});

	it('forwards className to wrapper', () =>
	{
		const { container } = render(<Progress value={50} className='custom-class' />);
		expect(container.firstElementChild?.className).toContain('custom-class');
	});
});
