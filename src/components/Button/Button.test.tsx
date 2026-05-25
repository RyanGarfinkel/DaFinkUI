import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () =>
{
	it('renders without errors', () =>
	{
		render(<Button>Click me</Button>);
		expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined();
	});

	it('applies primary variant classes by default', () =>
	{
		render(<Button>Click me</Button>);
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('bg-brand');
		expect(btn.className).toContain('text-brand-fg');
		expect(btn.className).toContain('hover:bg-brand-hover');
		expect(btn.className).toContain('active:bg-brand-active');
	});

	it('applies correct classes for each variant', () =>
	{
		const cases = [
			{ variant: 'primary',     contains: 'bg-brand' },
			{ variant: 'secondary',   contains: 'bg-surface' },
			{ variant: 'outlined',    contains: 'border-brand' },
			{ variant: 'ghost',       contains: 'text-text' },
			{ variant: 'link',        contains: 'hover:underline' },
			{ variant: 'destructive', contains: 'bg-danger' },
		] as const;

		for(const { variant, contains } of cases)
		{
			const { unmount } = render(<Button variant={variant}>btn</Button>);
			expect(screen.getByRole('button').className).toContain(contains);
			unmount();
		}
	});

	it('applies shadow to primary, secondary, and destructive variants', () =>
	{
		const shadowVariants = ['primary', 'secondary', 'destructive'] as const;

		for(const variant of shadowVariants)
		{
			const { unmount } = render(<Button variant={variant}>btn</Button>);
			expect(screen.getByRole('button').className).toContain('shadow-sm');
			unmount();
		}
	});

	it('does not apply shadow to outlined, ghost, or link variants', () =>
	{
		for(const variant of ['outlined', 'ghost', 'link'] as const)
		{
			const { unmount } = render(<Button variant={variant}>btn</Button>);
			expect(screen.getByRole('button').className).not.toContain('shadow-sm');
			unmount();
		}
	});

	it('applies focus-visible ring classes', () =>
	{
		render(<Button>Click me</Button>);
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('focus-visible:ring-2');
		expect(btn.className).toContain('focus-visible:ring-offset-2');
		expect(btn.className).toContain('focus-visible:ring-brand-ring');
	});

	it('suppresses default focus outline', () =>
	{
		render(<Button>Click me</Button>);
		expect(screen.getByRole('button').className).toContain('focus:outline-none');
	});

	it('applies active scale class', () =>
	{
		render(<Button>Click me</Button>);
		expect(screen.getByRole('button').className).toContain('active:scale-[0.98]');
	});

	it('applies disabled classes when disabled', () =>
	{
		render(<Button disabled>Click me</Button>);
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('disabled:opacity-40');
		expect(btn.className).toContain('disabled:pointer-events-none');
		expect(btn).toHaveProperty('disabled', true);
	});

	it('applies correct size classes', () =>
	{
		const cases = [
			{ size: 'sm', contains: 'h-8' },
			{ size: 'md', contains: 'h-9' },
			{ size: 'lg', contains: 'h-11' },
		] as const;

		for(const { size, contains } of cases)
		{
			const { unmount } = render(<Button size={size}>btn</Button>);
			expect(screen.getByRole('button').className).toContain(contains);
			unmount();
		}
	});

	it('forwards native button props', () =>
	{
		render(<Button type='submit' aria-label='submit form'>Submit</Button>);
		const btn = screen.getByRole('button');
		expect(btn.getAttribute('type')).toBe('submit');
		expect(btn.getAttribute('aria-label')).toBe('submit form');
	});

	it('merges custom className', () =>
	{
		render(<Button className='custom-class'>Click me</Button>);
		expect(screen.getByRole('button').className).toContain('custom-class');
	});
});
