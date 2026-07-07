import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Separator from './Separator';

describe('Separator', () =>
{
	it('renders a native hr for the default horizontal, no-label case', () =>
	{
		const { container } = render(<Separator />);
		expect(container.querySelector('hr')).not.toBeNull();
	});

	it('applies horizontal line classes to the hr', () =>
	{
		const { container } = render(<Separator />);
		const hr = container.querySelector('hr') as HTMLElement;
		expect(hr.className).toContain('border-t-[length:var(--border-width)]');
		expect(hr.className).toContain('border-surface-border');
	});

	it('renders a div with role="separator" and aria-orientation="vertical" for orientation="vertical"', () =>
	{
		render(<Separator orientation='vertical' />);
		const el = screen.getByRole('separator');
		expect(el.tagName).toBe('DIV');
		expect(el.getAttribute('aria-orientation')).toBe('vertical');
	});

	it('applies a left border for the vertical line', () =>
	{
		render(<Separator orientation='vertical' />);
		expect(screen.getByRole('separator').className).toContain('border-l-[length:var(--border-width)]');
	});

	it('renders children as a labeled break in the line', () =>
	{
		render(<Separator>OR</Separator>);
		expect(screen.getByText('OR')).toBeInTheDocument();
		expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal');
	});

	it('renders line segments on both sides when labelPosition="center" (default)', () =>
	{
		const { container } = render(<Separator>OR</Separator>);
		const lines = container.querySelectorAll('[aria-hidden="true"]');
		expect(lines).toHaveLength(2);
	});

	it('renders only a trailing line when labelPosition="start"', () =>
	{
		const { container } = render(<Separator labelPosition='start'>OR</Separator>);
		const lines = container.querySelectorAll('[aria-hidden="true"]');
		expect(lines).toHaveLength(1);

		const label = screen.getByText('OR');
		expect(label.nextElementSibling).not.toBeNull();
		expect(label.previousElementSibling).toBeNull();
	});

	it('renders only a leading line when labelPosition="end"', () =>
	{
		const { container } = render(<Separator labelPosition='end'>OR</Separator>);
		const lines = container.querySelectorAll('[aria-hidden="true"]');
		expect(lines).toHaveLength(1);

		const label = screen.getByText('OR');
		expect(label.previousElementSibling).not.toBeNull();
		expect(label.nextElementSibling).toBeNull();
	});

	it('renders a labeled break for orientation="vertical"', () =>
	{
		render(<Separator orientation='vertical'>OR</Separator>);
		const el = screen.getByRole('separator');
		expect(screen.getByText('OR')).toBeInTheDocument();
		expect(el.getAttribute('aria-orientation')).toBe('vertical');
		expect(el.className).toContain('flex-col');
	});

	it('uses a vertical (left-border) line for a labeled vertical separator', () =>
	{
		const { container } = render(<Separator orientation='vertical'>OR</Separator>);
		const lines = container.querySelectorAll('[aria-hidden="true"]');
		expect(lines).toHaveLength(2);
		lines.forEach(line => expect(line.className).toContain('border-l-[length:var(--border-width)]'));
	});

	it('respects labelPosition for a vertical separator', () =>
	{
		const { container } = render(<Separator orientation='vertical' labelPosition='start'>OR</Separator>);
		const lines = container.querySelectorAll('[aria-hidden="true"]');
		expect(lines).toHaveLength(1);

		const label = screen.getByText('OR');
		expect(label.nextElementSibling).not.toBeNull();
		expect(label.previousElementSibling).toBeNull();
	});

	it('forwards className to the root hr for the plain case', () =>
	{
		const { container } = render(<Separator className='my-class' />);
		expect((container.querySelector('hr') as HTMLElement).className).toContain('my-class');
	});

	it('forwards className to the root div for the labeled case', () =>
	{
		const { container } = render(<Separator className='label-class'>OR</Separator>);
		expect((container.querySelector('[role="separator"]') as HTMLElement).className).toContain('label-class');
	});

	it('forwards native attributes such as data-testid', () =>
	{
		render(<Separator data-testid='sep' />);
		expect(screen.getByTestId('sep')).toBeInTheDocument();
	});
});
