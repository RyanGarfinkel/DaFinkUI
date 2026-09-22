'use client';

import { Resizable, ResizableHandle, ResizablePanel } from './Resizable';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

const renderGroup = () =>
	render(
		<Resizable direction='horizontal' data-testid='group'>
			<ResizablePanel defaultSize={200} minSize={120} maxSize={320} data-testid='sidebar'>
				Sidebar
			</ResizablePanel>
			<ResizableHandle aria-label='Resize sidebar' />
			<ResizablePanel data-testid='main'>Main</ResizablePanel>
		</Resizable>
	);

describe('Resizable', () =>
{
	it('renders panels and a handle', () =>
	{
		renderGroup();
		expect(screen.getByText('Sidebar')).toBeDefined();
		expect(screen.getByText('Main')).toBeDefined();
		expect(screen.getByRole('separator')).toBeDefined();
	});

	it('sets role and aria-orientation on the handle', () =>
	{
		renderGroup();
		const handle = screen.getByRole('separator');
		expect(handle.getAttribute('aria-orientation')).toBe('horizontal');
		expect(handle.getAttribute('aria-label')).toBe('Resize sidebar');
	});

	it('defaults the aria-label when none is passed', () =>
	{
		render(
			<Resizable direction='horizontal'>
				<ResizablePanel defaultSize={200}>Sidebar</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>Main</ResizablePanel>
			</Resizable>
		);
		expect(screen.getByRole('separator').getAttribute('aria-label')).toBe('Resize panel');
	});

	it('is keyboard-reachable via Tab order', () =>
	{
		renderGroup();
		const handle = screen.getByRole('separator');
		expect(handle.getAttribute('tabindex')).toBe('0');
	});

	it('grows the sized panel on ArrowRight and shrinks it on ArrowLeft', () =>
	{
		renderGroup();
		const handle  = screen.getByRole('separator');
		const sidebar = screen.getByTestId('sidebar');

		handle.focus();
		fireEvent.keyDown(handle, { key: 'ArrowRight' });
		expect(sidebar.style.width).toBe('216px');

		fireEvent.keyDown(handle, { key: 'ArrowLeft' });
		fireEvent.keyDown(handle, { key: 'ArrowLeft' });
		expect(sidebar.style.width).toBe('184px');
	});

	it('takes a bigger step with Shift held', () =>
	{
		renderGroup();
		const handle  = screen.getByRole('separator');
		const sidebar = screen.getByTestId('sidebar');

		fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
		expect(sidebar.style.width).toBe('264px');
	});

	it('clamps to minSize on Home and does not go below it', () =>
	{
		renderGroup();
		const handle  = screen.getByRole('separator');
		const sidebar = screen.getByTestId('sidebar');

		fireEvent.keyDown(handle, { key: 'Home' });
		expect(sidebar.style.width).toBe('120px');

		fireEvent.keyDown(handle, { key: 'ArrowLeft' });
		expect(sidebar.style.width).toBe('120px');
	});

	it('clamps to maxSize on End and does not go above it', () =>
	{
		renderGroup();
		const handle  = screen.getByRole('separator');
		const sidebar = screen.getByTestId('sidebar');

		fireEvent.keyDown(handle, { key: 'End' });
		expect(sidebar.style.width).toBe('320px');

		fireEvent.keyDown(handle, { key: 'ArrowRight' });
		expect(sidebar.style.width).toBe('320px');
	});

	it('reflects the clamped size in aria-valuenow, aria-valuemin, and aria-valuemax', () =>
	{
		renderGroup();
		const handle = screen.getByRole('separator');

		fireEvent.keyDown(handle, { key: 'End' });
		expect(handle.getAttribute('aria-valuenow')).toBe('320');
		expect(handle.getAttribute('aria-valuemin')).toBe('120');
		expect(handle.getAttribute('aria-valuemax')).toBe('320');
	});

	it('never resizes the flexible panel — only the sized one', () =>
	{
		renderGroup();
		const handle = screen.getByRole('separator');
		const main   = screen.getByTestId('main');

		fireEvent.keyDown(handle, { key: 'ArrowRight' });
		expect(main.style.width).toBe('');
	});

	it('merges a custom className onto the handle', () =>
	{
		render(
			<Resizable direction='horizontal'>
				<ResizablePanel defaultSize={200}>Sidebar</ResizablePanel>
				<ResizableHandle className='custom-handle' />
				<ResizablePanel>Main</ResizablePanel>
			</Resizable>
		);
		expect(screen.getByRole('separator').className).toContain('custom-handle');
	});

	it('lays out panels in a column for a vertical group', () =>
	{
		render(
			<Resizable direction='vertical' data-testid='vertical-group'>
				<ResizablePanel defaultSize={150}>Top</ResizablePanel>
				<ResizableHandle aria-label='Resize top panel' />
				<ResizablePanel>Bottom</ResizablePanel>
			</Resizable>
		);
		expect(screen.getByTestId('vertical-group').className).toContain('flex-col');
		expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
	});
});
