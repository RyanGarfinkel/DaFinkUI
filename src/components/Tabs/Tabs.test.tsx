import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

const renderTabs = (active = 'one', onValueChange = vi.fn()) => {
	return render(
		<Tabs value={active} onValueChange={onValueChange}>
			<TabsList>
				<TabsTrigger value='one'>One</TabsTrigger>
				<TabsTrigger value='two'>Two</TabsTrigger>
				<TabsTrigger value='three' disabled>Three</TabsTrigger>
			</TabsList>
			<TabsContent value='one'>Content One</TabsContent>
			<TabsContent value='two'>Content Two</TabsContent>
			<TabsContent value='three'>Content Three</TabsContent>
		</Tabs>
	);
};

describe('Tabs', () =>
{
	it('renders without errors', () =>
	{
		renderTabs();
		expect(screen.getByRole('tablist')).toBeDefined();
	});

	it('shows correct tab content when tab is active', () =>
	{
		renderTabs('one');
		expect(screen.getByText('Content One')).toBeDefined();
	});

	it('hides inactive tab content', () =>
	{
		renderTabs('one');
		expect(screen.queryByText('Content Two')).toBeNull();
		expect(screen.queryByText('Content Three')).toBeNull();
	});

	it('calls onValueChange when a tab is clicked', async () =>
	{
		const onValueChange = vi.fn();
		renderTabs('one', onValueChange);

		await userEvent.click(screen.getByRole('tab', { name: 'Two' }));
		expect(onValueChange).toHaveBeenCalledWith('two');
	});

	it('does not call onValueChange when a disabled tab is clicked', async () =>
	{
		const onValueChange = vi.fn();
		renderTabs('one', onValueChange);

		await userEvent.click(screen.getByRole('tab', { name: 'Three' }));
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('active tab has aria-selected=true', () =>
	{
		renderTabs('two');
		const activeTab = screen.getByRole('tab', { name: 'Two' });
		expect(activeTab.getAttribute('aria-selected')).toBe('true');
	});

	it('inactive tabs have aria-selected=false', () =>
	{
		renderTabs('two');
		const inactiveTab = screen.getByRole('tab', { name: 'One' });
		expect(inactiveTab.getAttribute('aria-selected')).toBe('false');
	});

	it('active tab has correct active state classes', () =>
	{
		renderTabs('one');
		const trigger = screen.getByRole('tab', { name: 'One' });
		expect(trigger.className).toContain('bg-surface');
		expect(trigger.className).toContain('text-text');
		expect(trigger.className).toContain('font-medium');
	});

	it('inactive tab has muted text class', () =>
	{
		renderTabs('one');
		const trigger = screen.getByRole('tab', { name: 'Two' });
		expect(trigger.className).toContain('text-text-muted');
	});

	it('focus-visible ring classes are present on trigger', () =>
	{
		renderTabs();
		const trigger = screen.getByRole('tab', { name: 'One' });
		expect(trigger.className).toContain('focus-visible:ring-2');
		expect(trigger.className).toContain('focus-visible:ring-offset-2');
		expect(trigger.className).toContain('focus-visible:ring-brand-ring');
	});

	it('disabled tab has disabled attribute and opacity class', () =>
	{
		renderTabs();
		const trigger = screen.getByRole('tab', { name: 'Three' });
		expect(trigger).toHaveProperty('disabled', true);
		expect(trigger.className).toContain('disabled:opacity-40');
		expect(trigger.className).toContain('disabled:pointer-events-none');
	});

	it('tab content is associated with its trigger via aria attributes', () =>
	{
		renderTabs('one');
		const panel = screen.getByRole('tabpanel');
		expect(panel.getAttribute('aria-labelledby')).toBe('trigger-one');
		expect(panel.getAttribute('id')).toBe('panel-one');
	});
});
