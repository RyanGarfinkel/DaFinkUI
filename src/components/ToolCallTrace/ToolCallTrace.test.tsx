import ToolCallTrace, { type ToolCallEntry } from './ToolCallTrace';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

const TOOL_CALLS: ToolCallEntry[] = [
	{ id: 't1', kind: 'thought', title: 'Thinking',   detail: 'Check the docs before answering.' },
	{ id: 't2', kind: 'search',  title: 'Web search', detail: '"install command"', links: [
		{ title: 'Docs', url: 'https://example.com/docs' },
	] },
	{ id: 't3', kind: 'tool',    title: 'Read file',  detail: 'add.ts', result: 'Found it' },
];

describe('ToolCallTrace', () =>
{
	it('renders without errors', () =>
	{
		render(<ToolCallTrace toolCalls={TOOL_CALLS} />);
		expect(screen.getByRole('button')).toBeDefined();
	});

	it('renders nothing when toolCalls is empty', () =>
	{
		const { container } = render(<ToolCallTrace toolCalls={[]} />);
		expect(container.firstChild).toBeNull();
	});

	it('summarizes thought, search, and tool counts in the trigger', () =>
	{
		render(<ToolCallTrace toolCalls={TOOL_CALLS} />);
		expect(screen.getByText('Thought, searched the web, used 1 tool')).toBeDefined();
	});

	it('pluralizes tool count in the summary', () =>
	{
		const calls: ToolCallEntry[] = [
			{ id: 'a', kind: 'tool', title: 'A', detail: 'a' },
			{ id: 'b', kind: 'tool', title: 'B', detail: 'b' },
		];
		render(<ToolCallTrace toolCalls={calls} />);
		expect(screen.getByText('used 2 tools')).toBeDefined();
	});

	it('is collapsed by default', () =>
	{
		render(<ToolCallTrace toolCalls={TOOL_CALLS} />);
		expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
	});

	it('expands the timeline on trigger click', () =>
	{
		render(<ToolCallTrace toolCalls={TOOL_CALLS} />);
		fireEvent.click(screen.getByRole('button'));
		expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByText('Read file')).toBeDefined();
	});

	it('renders a result string for entries with a result', () =>
	{
		render(<ToolCallTrace toolCalls={TOOL_CALLS} />);
		fireEvent.click(screen.getByRole('button'));
		expect(screen.getByText('Found it')).toBeDefined();
	});

	it('renders external links for entries with links instead of a result', () =>
	{
		render(<ToolCallTrace toolCalls={TOOL_CALLS} />);
		fireEvent.click(screen.getByRole('button'));
		const link = screen.getByRole('link', { name: /Docs/ });
		expect(link.getAttribute('href')).toBe('https://example.com/docs');
		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('counts an entry with a custom kind as a tool in the summary', () =>
	{
		const calls: ToolCallEntry[] = [
			{ id: 'a', kind: 'memory', title: 'Recall', detail: 'Looked up prior context' },
		];
		render(<ToolCallTrace toolCalls={calls} />);
		expect(screen.getByText('used 1 tool')).toBeDefined();
	});

	it('renders a custom icon for an entry when provided', () =>
	{
		const calls: ToolCallEntry[] = [
			{ id: 'a', kind: 'memory', title: 'Recall', detail: 'Looked up prior context', icon: <span data-testid='custom-icon' /> },
		];
		render(<ToolCallTrace toolCalls={calls} />);
		fireEvent.click(screen.getByRole('button'));
		expect(screen.getByTestId('custom-icon')).toBeDefined();
	});

	it('falls back to the generic tool icon for an unrecognized kind with no custom icon', () =>
	{
		const calls: ToolCallEntry[] = [
			{ id: 'a', kind: 'memory', title: 'Recall', detail: 'Looked up prior context' },
		];
		const { container } = render(<ToolCallTrace toolCalls={calls} />);
		fireEvent.click(screen.getByRole('button'));
		expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
	});
});
