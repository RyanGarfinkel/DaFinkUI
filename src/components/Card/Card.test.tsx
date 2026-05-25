import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Card', () =>
{
	it('renders without errors', () =>
	{
		render(<Card>content</Card>);
		expect(screen.getByText('content')).toBeDefined();
	});

	it('applies default variant classes when no variant is provided', () =>
	{
		const { container } = render(<Card>content</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain('bg-surface');
		expect(card.className).toContain('border');
		expect(card.className).toContain('border-surface-border');
		expect(card.className).toContain('rounded-lg');
	});

	it('applies elevated variant classes', () =>
	{
		const { container } = render(<Card variant='elevated'>content</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain('bg-surface');
		expect(card.className).toContain('shadow-md');
		expect(card.className).toContain('rounded-lg');
		expect(card.className).not.toContain('border-surface-border');
	});

	it('applies outline variant classes', () =>
	{
		const { container } = render(<Card variant='outline'>content</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card.className).toContain('bg-transparent');
		expect(card.className).toContain('border-2');
		expect(card.className).toContain('border-surface-border');
		expect(card.className).toContain('rounded-lg');
	});

	it('merges custom className on Card', () =>
	{
		const { container } = render(<Card className='custom-card'>content</Card>);
		expect((container.firstChild as HTMLElement).className).toContain('custom-card');
	});

	it('forwards native div props', () =>
	{
		const { container } = render(<Card aria-label='my card' data-testid='card-root'>content</Card>);
		const card = container.firstChild as HTMLElement;
		expect(card.getAttribute('aria-label')).toBe('my card');
		expect(card.getAttribute('data-testid')).toBe('card-root');
	});
});

describe('CardHeader', () =>
{
	it('renders children', () =>
	{
		render(<CardHeader>Header text</CardHeader>);
		expect(screen.getByText('Header text')).toBeDefined();
	});

	it('merges custom className', () =>
	{
		const { container } = render(<CardHeader className='custom-header'>H</CardHeader>);
		expect((container.firstChild as HTMLElement).className).toContain('custom-header');
	});
});

describe('CardContent', () =>
{
	it('renders children', () =>
	{
		render(<CardContent>Body text</CardContent>);
		expect(screen.getByText('Body text')).toBeDefined();
	});

	it('merges custom className', () =>
	{
		const { container } = render(<CardContent className='custom-content'>C</CardContent>);
		expect((container.firstChild as HTMLElement).className).toContain('custom-content');
	});
});

describe('CardFooter', () =>
{
	it('renders children', () =>
	{
		render(<CardFooter>Footer action</CardFooter>);
		expect(screen.getByText('Footer action')).toBeDefined();
	});

	it('applies right-aligned flex layout', () =>
	{
		const { container } = render(<CardFooter>action</CardFooter>);
		const footer = container.firstChild as HTMLElement;
		expect(footer.className).toContain('flex');
		expect(footer.className).toContain('justify-end');
	});

	it('merges custom className', () =>
	{
		const { container } = render(<CardFooter className='custom-footer'>F</CardFooter>);
		expect((container.firstChild as HTMLElement).className).toContain('custom-footer');
	});
});

describe('Card composition', () =>
{
	it('renders all subcomponents together', () =>
	{
		render(
			<Card>
				<CardHeader>The header</CardHeader>
				<CardContent>The content</CardContent>
				<CardFooter>The footer</CardFooter>
			</Card>
		);
		expect(screen.getByText('The header')).toBeDefined();
		expect(screen.getByText('The content')).toBeDefined();
		expect(screen.getByText('The footer')).toBeDefined();
	});
});
