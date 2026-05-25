import Accordion, { AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

const renderAccordion = (props: Partial<React.ComponentProps<typeof Accordion>> = {}) => {
	return render(
		<Accordion type='single' collapsible {...props}>
			<AccordionItem value='one'>
				<AccordionTrigger>Item One</AccordionTrigger>
				<AccordionContent>Content One</AccordionContent>
			</AccordionItem>
			<AccordionItem value='two'>
				<AccordionTrigger>Item Two</AccordionTrigger>
				<AccordionContent>Content Two</AccordionContent>
			</AccordionItem>
			<AccordionItem value='three'>
				<AccordionTrigger disabled>Item Three</AccordionTrigger>
				<AccordionContent>Content Three</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};

describe('Accordion', () =>
{
	it('renders without errors', () =>
	{
		renderAccordion();
		expect(screen.getByText('Item One')).toBeDefined();
		expect(screen.getByText('Item Two')).toBeDefined();
	});

	it('content is hidden by default when no defaultValue is set', () =>
	{
		renderAccordion();
		const regions = screen.getAllByRole('region', { hidden: true });
		expect(regions.every(r => r.getAttribute('aria-hidden') === 'true')).toBe(true);
	});

	it('opens an item when its trigger is clicked', async () =>
	{
		renderAccordion();
		await userEvent.click(screen.getByRole('button', { name: /Item One/i }));
		const region = screen.getAllByRole('region', { hidden: false })[0];
		expect(region.getAttribute('aria-hidden')).toBe('false');
	});

	it('closes an open item when clicked again (collapsible)', async () =>
	{
		renderAccordion({ collapsible: true });
		const trigger = screen.getByRole('button', { name: /Item One/i });
		await userEvent.click(trigger);
		await userEvent.click(trigger);
		const regions = screen.getAllByRole('region', { hidden: true });
		expect(regions.some(r => r.getAttribute('aria-hidden') === 'true')).toBe(true);
	});

	it('closes the previous item when a new one opens (type=single)', async () =>
	{
		renderAccordion({ collapsible: false });
		await userEvent.click(screen.getByRole('button', { name: /Item One/i }));
		await userEvent.click(screen.getByRole('button', { name: /Item Two/i }));

		const triggerOne = screen.getByRole('button', { name: /Item One/i });
		const triggerTwo = screen.getByRole('button', { name: /Item Two/i });
		expect(triggerOne.getAttribute('aria-expanded')).toBe('false');
		expect(triggerTwo.getAttribute('aria-expanded')).toBe('true');
	});

	it('allows multiple items open when type=multiple', async () =>
	{
		render(
			<Accordion type='multiple'>
				<AccordionItem value='a'>
					<AccordionTrigger>A</AccordionTrigger>
					<AccordionContent>Content A</AccordionContent>
				</AccordionItem>
				<AccordionItem value='b'>
					<AccordionTrigger>B</AccordionTrigger>
					<AccordionContent>Content B</AccordionContent>
				</AccordionItem>
			</Accordion>
		);

		await userEvent.click(screen.getByRole('button', { name: 'A' }));
		await userEvent.click(screen.getByRole('button', { name: 'B' }));

		expect(screen.getByRole('button', { name: 'A' }).getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByRole('button', { name: 'B' }).getAttribute('aria-expanded')).toBe('true');
	});

	it('opens with defaultValue', () =>
	{
		renderAccordion({ defaultValue: 'one' });
		expect(screen.getByRole('button', { name: /Item One/i }).getAttribute('aria-expanded')).toBe('true');
	});

	it('trigger has aria-expanded=false when closed', () =>
	{
		renderAccordion();
		expect(screen.getByRole('button', { name: /Item One/i }).getAttribute('aria-expanded')).toBe('false');
	});

	it('trigger has focus-visible ring classes', () =>
	{
		renderAccordion();
		const trigger = screen.getByRole('button', { name: /Item One/i });
		expect(trigger.className).toContain('focus-visible:ring-2');
		expect(trigger.className).toContain('focus-visible:ring-offset-2');
		expect(trigger.className).toContain('focus-visible:ring-brand-ring');
	});

	it('disabled trigger has disabled attribute and pointer-events-none class', () =>
	{
		renderAccordion();
		const trigger = screen.getByRole('button', { name: /Item Three/i });
		expect(trigger).toHaveProperty('disabled', true);
		expect(trigger.className).toContain('disabled:pointer-events-none');
		expect(trigger.className).toContain('disabled:opacity-40');
	});

	it('does not open a disabled item on click', async () =>
	{
		renderAccordion();
		const trigger = screen.getByRole('button', { name: /Item Three/i });
		await userEvent.click(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('content region is associated with role=region', () =>
	{
		renderAccordion({ defaultValue: 'one' });
		const regions = screen.getAllByRole('region');
		expect(regions.length).toBeGreaterThan(0);
	});
});
