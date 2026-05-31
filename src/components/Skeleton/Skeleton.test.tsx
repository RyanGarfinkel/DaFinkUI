import { Skeleton, SkeletonInput, SkeletonCard, SkeletonTableRow, SkeletonForm } from './Skeleton';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Skeleton', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<Skeleton />);
		expect(container.firstElementChild).toBeDefined();
	});

	it('sets aria-hidden="true"', () =>
	{
		const { container } = render(<Skeleton />);
		expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
	});

	it('applies animate-pulse class', () =>
	{
		const { container } = render(<Skeleton />);
		expect(container.firstElementChild?.className).toContain('animate-pulse');
	});

	it('applies provided width and height via inline style', () =>
	{
		const { container } = render(<Skeleton width='200px' height='40px' />);
		const el = container.firstElementChild as HTMLElement;
		expect(el.style.width).toBe('200px');
		expect(el.style.height).toBe('40px');
	});

	it('forwards className prop', () =>
	{
		const { container } = render(<Skeleton className='extra-class' />);
		expect(container.firstElementChild?.className).toContain('extra-class');
	});
});

describe('SkeletonInput', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<SkeletonInput />);
		expect(container.firstElementChild).toBeDefined();
	});

	it('sets aria-hidden="true" on wrapper', () =>
	{
		const { container } = render(<SkeletonInput />);
		expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders label skeleton when label is true', () =>
	{
		const { container } = render(<SkeletonInput label />);
		const skeletons = container.querySelectorAll('[aria-hidden="true"]');
		expect(skeletons.length).toBeGreaterThan(1);
	});

	it('does not render extra skeleton when label is false', () =>
	{
		const { container } = render(<SkeletonInput label={false} />);
		const inner = container.firstElementChild?.querySelectorAll('.animate-pulse');
		expect(inner?.length).toBe(1);
	});
});

describe('SkeletonCard', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<SkeletonCard />);
		expect(container.firstElementChild).toBeDefined();
	});

	it('sets aria-hidden="true" on wrapper', () =>
	{
		const { container } = render(<SkeletonCard />);
		expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders the correct number of line skeletons', () =>
	{
		const { container } = render(<SkeletonCard lines={5} />);
		const lines = container.querySelectorAll('.animate-pulse');
		expect(lines.length).toBe(6);
	});
});

describe('SkeletonTableRow', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<SkeletonTableRow />);
		expect(container.firstElementChild).toBeDefined();
	});

	it('sets aria-hidden="true" on wrapper', () =>
	{
		const { container } = render(<SkeletonTableRow />);
		expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders the correct number of column skeletons', () =>
	{
		const { container } = render(<SkeletonTableRow columns={3} />);
		const cells = container.querySelectorAll('.animate-pulse');
		expect(cells.length).toBe(3);
	});
});

describe('SkeletonForm', () =>
{
	it('renders without errors', () =>
	{
		const { container } = render(<SkeletonForm />);
		expect(container.firstElementChild).toBeDefined();
	});

	it('sets aria-hidden="true" on wrapper', () =>
	{
		const { container } = render(<SkeletonForm />);
		expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
	});

	it('renders the correct number of field skeletons', () =>
	{
		const { container } = render(<SkeletonForm fields={2} />);
		const inputs = container.querySelectorAll('.animate-pulse');
		expect(inputs.length).toBeGreaterThanOrEqual(2);
	});
});
