import { render, screen } from '@testing-library/react';
import { Timeline, TimelineItem } from './Timeline';
import { describe, it, expect } from 'vitest';

describe('Timeline', () =>
{
	// ── basic rendering ──────────────────────────────────────────────────────

	it('renders without errors', () =>
	{
		render(
			<Timeline>
				<TimelineItem title='Step one' />
				<TimelineItem title='Step two' />
			</Timeline>
		);
		expect(screen.getByText('Step one')).toBeDefined();
		expect(screen.getByText('Step two')).toBeDefined();
	});

	it('auto-numbers items starting from 1', () =>
	{
		render(
			<Timeline>
				<TimelineItem title='A' />
				<TimelineItem title='B' />
				<TimelineItem title='C' />
			</Timeline>
		);
		expect(screen.getByText('1')).toBeDefined();
		expect(screen.getByText('2')).toBeDefined();
		expect(screen.getByText('3')).toBeDefined();
	});

	it('renders a custom indicator when provided', () =>
	{
		render(
			<Timeline>
				<TimelineItem title='Custom' indicator={<span>★</span>} />
			</Timeline>
		);
		expect(screen.getByText('★')).toBeDefined();
	});

	it('renders children content inside each item', () =>
	{
		render(
			<Timeline>
				<TimelineItem title='Step'>
					<p>Some description</p>
				</TimelineItem>
			</Timeline>
		);
		expect(screen.getByText('Some description')).toBeDefined();
	});

	it('renders titles as visible text', () =>
	{
		render(
			<Timeline>
				<TimelineItem title='Install dependencies' />
			</Timeline>
		);
		expect(screen.getByText('Install dependencies')).toBeDefined();
	});

	// ── connector lines ───────────────────────────────────────────────────────

	it('renders a connector for every item except the last (vertical)', () =>
	{
		const { container } = render(
			<Timeline animate='none'>
				<TimelineItem title='First' />
				<TimelineItem title='Middle' />
				<TimelineItem title='Last' />
			</Timeline>
		);
		const connectors = container.querySelectorAll('.w-px.flex-1.bg-surface-border');
		expect(connectors.length).toBe(2);
	});

	it('renders a horizontal connector for every item except the last', () =>
	{
		const { container } = render(
			<Timeline direction='horizontal' animate='none'>
				<TimelineItem title='A' />
				<TimelineItem title='B' />
				<TimelineItem title='C' />
			</Timeline>
		);
		// horizontal connectors use h-px, not w-px
		const connectors = container.querySelectorAll('.h-px.flex-1.bg-surface-border');
		expect(connectors.length).toBe(2);
	});

	// ── variant ───────────────────────────────────────────────────────────────

	it('applies brand variant classes by default', () =>
	{
		const { container } = render(
			<Timeline animate='none'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		expect(container.querySelector('.bg-brand')).not.toBeNull();
	});

	it('applies muted variant classes when variant="muted"', () =>
	{
		const { container } = render(
			<Timeline variant='muted' animate='none'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		expect(container.querySelector('.bg-surface-active')).not.toBeNull();
	});

	// ── direction ─────────────────────────────────────────────────────────────

	it('renders as flex-col by default (vertical)', () =>
	{
		const { container } = render(
			<Timeline animate='none'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		const wrapper = container.querySelector('.flex-col');
		expect(wrapper).not.toBeNull();
	});

	it('renders as flex-row when direction="horizontal"', () =>
	{
		const { container } = render(
			<Timeline direction='horizontal' animate='none'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		const wrapper = container.querySelector('.flex-row');
		expect(wrapper).not.toBeNull();
	});

	// ── animate ───────────────────────────────────────────────────────────────

	it('renders a <style> tag when animate="stagger"', () =>
	{
		const { container } = render(
			<Timeline animate='stagger'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		expect(container.querySelector('style')).not.toBeNull();
	});

	it('does not render a <style> tag when animate="none"', () =>
	{
		const { container } = render(
			<Timeline animate='none'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		expect(container.querySelector('style')).toBeNull();
	});

	it('applies an animation inline style to items when animate="stagger"', () =>
	{
		const { container } = render(
			<Timeline animate='stagger'>
				<TimelineItem title='First' />
				<TimelineItem title='Second' />
			</Timeline>
		);
		// Both item wrappers should have an animation style
		const items = container.querySelectorAll<HTMLElement>('.flex.gap-4');
		expect(items.length).toBe(2);
		items.forEach((el) =>
		{
			expect(el.style.animation).toContain('tl-in');
		});
	});

	it('applies cascading delays to staggered items', () =>
	{
		const { container } = render(
			<Timeline animate='stagger'>
				<TimelineItem title='A' />
				<TimelineItem title='B' />
				<TimelineItem title='C' />
			</Timeline>
		);
		const items = container.querySelectorAll<HTMLElement>('.flex.gap-4');
		expect(items[0].style.animation).toContain('0ms');
		expect(items[1].style.animation).toContain('90ms');
		expect(items[2].style.animation).toContain('180ms');
	});

	it('does not apply animation inline style when animate="none"', () =>
	{
		const { container } = render(
			<Timeline animate='none'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		const item = container.querySelector<HTMLElement>('.flex.gap-4');
		expect(item?.style.animation ?? '').toBe('');
	});

	// ── className forwarding ──────────────────────────────────────────────────

	it('forwards className to the wrapper div', () =>
	{
		const { container } = render(
			<Timeline className='custom-class' animate='none'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		// With animate="none" there is no <style> tag, so the div is the first child
		const wrapper = container.querySelector('.custom-class');
		expect(wrapper).not.toBeNull();
	});

	it('forwards className to the wrapper div even with animate="stagger"', () =>
	{
		const { container } = render(
			<Timeline className='custom-class' animate='stagger'>
				<TimelineItem title='Step' />
			</Timeline>
		);
		// querySelector searches the whole tree, so the <style> sibling does not interfere
		const wrapper = container.querySelector('.custom-class');
		expect(wrapper).not.toBeNull();
	});
});
