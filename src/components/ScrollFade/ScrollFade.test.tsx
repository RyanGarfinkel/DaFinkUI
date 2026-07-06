import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScrollFade } from './ScrollFade';
import { createRef } from 'react';

const setScrollMetrics = (
	el: HTMLElement,
	{ scrollTop = 0, scrollLeft = 0, scrollHeight = 100, scrollWidth = 100, clientHeight = 100, clientWidth = 100 }: Partial<Record<'scrollTop' | 'scrollLeft' | 'scrollHeight' | 'scrollWidth' | 'clientHeight' | 'clientWidth', number>>
) =>
{
	Object.defineProperty(el, 'scrollTop',    { configurable: true, value: scrollTop });
	Object.defineProperty(el, 'scrollLeft',   { configurable: true, value: scrollLeft });
	Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scrollHeight });
	Object.defineProperty(el, 'scrollWidth',  { configurable: true, value: scrollWidth });
	Object.defineProperty(el, 'clientHeight', { configurable: true, value: clientHeight });
	Object.defineProperty(el, 'clientWidth',  { configurable: true, value: clientWidth });
};

describe('ScrollFade', () =>
{
	it('renders children inside the scrollable region', () =>
	{
		render(<ScrollFade><p>content</p></ScrollFade>);
		expect(screen.getByText('content')).toBeTruthy();
	});

	it('applies overflow-y-auto by default (vertical direction)', () =>
	{
		const { container } = render(<ScrollFade><p>content</p></ScrollFade>);
		const scrollRegion = container.querySelector('[class*="overflow-y-auto"]');
		expect(scrollRegion).toBeTruthy();
	});

	it('applies overflow-x-auto when direction="horizontal"', () =>
	{
		const { container } = render(<ScrollFade direction='horizontal'><p>content</p></ScrollFade>);
		const scrollRegion = container.querySelector('[class*="overflow-x-auto"]');
		expect(scrollRegion).toBeTruthy();
	});

	it('merges additional className onto the scrollable region', () =>
	{
		const { container } = render(<ScrollFade className='custom-class'><p>content</p></ScrollFade>);
		const scrollRegion = container.querySelector('.custom-class');
		expect(scrollRegion).toBeTruthy();
	});

	it('merges wrapperClassName onto the outer positioning wrapper, not the scrollable region', () =>
	{
		const { container } = render(<ScrollFade wrapperClassName='flex-1 min-h-0'><p>content</p></ScrollFade>);
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.className).toContain('flex-1 min-h-0');
		expect(wrapper.className).not.toContain('overflow-y-auto');
	});

	it('hides both fades when content does not overflow', () =>
	{
		const { container } = render(<ScrollFade><p>content</p></ScrollFade>);
		const fades = container.querySelectorAll('[aria-hidden="true"]');
		expect(fades).toHaveLength(2);
		fades.forEach(fade => expect(fade.className).toContain('opacity-0'));
	});

	it('shows the start fade once scrolled away from the top, hides the end fade at the bottom', () =>
	{
		const { container } = render(<ScrollFade><p>content</p></ScrollFade>);
		const scrollRegion = container.querySelector('[class*="overflow-y-auto"]') as HTMLElement;

		setScrollMetrics(scrollRegion, { scrollTop: 50, scrollHeight: 150, clientHeight: 100 });
		fireEvent.scroll(scrollRegion);

		const [startFade, endFade] = container.querySelectorAll('[aria-hidden="true"]');
		expect(startFade.className).toContain('opacity-100');
		expect(endFade.className).toContain('opacity-0');
	});

	it('shows the end fade while there is more content below', () =>
	{
		const { container } = render(<ScrollFade><p>content</p></ScrollFade>);
		const scrollRegion = container.querySelector('[class*="overflow-y-auto"]') as HTMLElement;

		setScrollMetrics(scrollRegion, { scrollTop: 0, scrollHeight: 150, clientHeight: 100 });
		fireEvent.scroll(scrollRegion);

		const [startFade, endFade] = container.querySelectorAll('[aria-hidden="true"]');
		expect(startFade.className).toContain('opacity-0');
		expect(endFade.className).toContain('opacity-100');
	});

	it('uses the horizontal scroll axis when direction="horizontal"', () =>
	{
		const { container } = render(<ScrollFade direction='horizontal'><p>content</p></ScrollFade>);
		const scrollRegion = container.querySelector('[class*="overflow-x-auto"]') as HTMLElement;

		setScrollMetrics(scrollRegion, { scrollLeft: 20, scrollWidth: 200, clientWidth: 100 });
		fireEvent.scroll(scrollRegion);

		const [startFade, endFade] = container.querySelectorAll('[aria-hidden="true"]');
		expect(startFade.className).toContain('opacity-100');
		expect(endFade.className).toContain('opacity-100');
	});

	it('fade overlays are non-interactive', () =>
	{
		const { container } = render(<ScrollFade><p>content</p></ScrollFade>);
		const fades = container.querySelectorAll('[aria-hidden="true"]');
		fades.forEach(fade => expect(fade.className).toContain('pointer-events-none'));
	});

	it('forwards a ref to the scrollable element', () =>
	{
		const ref = createRef<HTMLDivElement>();
		render(<ScrollFade ref={ref}><p>content</p></ScrollFade>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current?.className).toContain('overflow-y-auto');
	});

	it('still calls a passed-in onScroll handler', () =>
	{
		let called = false;
		const { container } = render(<ScrollFade onScroll={() => { called = true; }}><p>content</p></ScrollFade>);
		const scrollRegion = container.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
		fireEvent.scroll(scrollRegion);
		expect(called).toBe(true);
	});

	it('accepts a custom fadeFrom token to match a non-default background', () =>
	{
		const { container } = render(<ScrollFade fadeFrom='from-surface-active'><p>content</p></ScrollFade>);
		const fades = container.querySelectorAll('[aria-hidden="true"]');
		fades.forEach(fade => expect(fade.className).toContain('from-surface-active'));
	});
});
