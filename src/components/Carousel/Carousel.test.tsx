import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
	CarouselDots,
} from './Carousel';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const BasicCarousel = ({ loop = false }: { loop?: boolean }) => (
	<Carousel loop={loop} aria-label='Test carousel'>
		<CarouselContent>
			<CarouselItem>Slide 1</CarouselItem>
			<CarouselItem>Slide 2</CarouselItem>
			<CarouselItem>Slide 3</CarouselItem>
		</CarouselContent>
		<CarouselPrevious />
		<CarouselNext />
		<CarouselDots />
	</Carousel>
);

describe('Carousel', () =>
{
	it('renders without errors', () =>
	{
		render(<BasicCarousel />);
		expect(screen.getByRole('region')).toBeDefined();
	});

	it('shows the live region for screen readers', () =>
	{
		render(<BasicCarousel />);
		expect(screen.getByRole('status')).toBeDefined();
		expect(screen.getByText('Slide 1 of 3')).toBeDefined();
	});

	it('renders slides with correct roles', () =>
	{
		render(<BasicCarousel />);
		const slides = screen.getAllByRole('group');
		expect(slides).toHaveLength(3);
	});

	it('disables previous button on first slide', () =>
	{
		render(<BasicCarousel />);
		expect(screen.getByLabelText('Previous slide')).toBeDisabled();
	});

	it('enables next button on first slide', () =>
	{
		render(<BasicCarousel />);
		expect(screen.getByLabelText('Next slide')).not.toBeDisabled();
	});

	it('advances to next slide on next button click', () =>
	{
		render(<BasicCarousel />);
		fireEvent.click(screen.getByLabelText('Next slide'));
		expect(screen.getByText('Slide 2 of 3')).toBeDefined();
	});

	it('goes back on previous button click after advancing', () =>
	{
		render(<BasicCarousel />);
		fireEvent.click(screen.getByLabelText('Next slide'));
		fireEvent.click(screen.getByLabelText('Previous slide'));
		expect(screen.getByText('Slide 1 of 3')).toBeDefined();
	});

	it('disables next button on last slide', () =>
	{
		render(<BasicCarousel />);
		fireEvent.click(screen.getByLabelText('Next slide'));
		fireEvent.click(screen.getByLabelText('Next slide'));
		expect(screen.getByLabelText('Next slide')).toBeDisabled();
	});

	it('loops from last to first when loop=true', () =>
	{
		render(<BasicCarousel loop />);
		fireEvent.click(screen.getByLabelText('Next slide'));
		fireEvent.click(screen.getByLabelText('Next slide'));
		fireEvent.click(screen.getByLabelText('Next slide'));
		expect(screen.getByText('Slide 1 of 3')).toBeDefined();
	});

	it('responds to ArrowRight key', () =>
	{
		render(<BasicCarousel />);
		fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
		expect(screen.getByText('Slide 2 of 3')).toBeDefined();
	});

	it('responds to ArrowLeft key', () =>
	{
		render(<BasicCarousel />);
		fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
		fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });
		expect(screen.getByText('Slide 1 of 3')).toBeDefined();
	});

	it('renders dot indicators', () =>
	{
		render(<BasicCarousel />);
		const dots = screen.getAllByRole('tab');
		expect(dots).toHaveLength(3);
	});

	it('marks the active dot as selected', () =>
	{
		render(<BasicCarousel />);
		const dots = screen.getAllByRole('tab');
		expect(dots[0].getAttribute('aria-selected')).toBe('true');
		expect(dots[1].getAttribute('aria-selected')).toBe('false');
	});

	it('navigates to a slide when its dot is clicked', () =>
	{
		render(<BasicCarousel />);
		fireEvent.click(screen.getByLabelText('Go to slide 3'));
		expect(screen.getByText('Slide 3 of 3')).toBeDefined();
	});

	it('applies className to the root', () =>
	{
		render(<BasicCarousel />);
		const root = screen.getByRole('region');
		expect(root.className).toContain('relative');
	});

	it('throws when subcomponent used outside Carousel', () =>
	{
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(<CarouselPrevious />)).toThrow();
		spy.mockRestore();
	});

	it('advances to the next slide on a leftward drag past the threshold', () =>
	{
		render(<BasicCarousel />);
		const track = screen.getAllByText('Slide 1')[0].parentElement!;

		fireEvent.pointerDown(track, { pointerId: 1, clientX: 200 });
		fireEvent.pointerMove(track, { pointerId: 1, clientX: 130 });
		fireEvent.pointerUp(track, { pointerId: 1, clientX: 130 });

		expect(screen.getByText('Slide 2 of 3')).toBeDefined();
	});

	it('goes back to the previous slide on a rightward drag past the threshold', () =>
	{
		render(<BasicCarousel />);
		fireEvent.click(screen.getByLabelText('Next slide'));
		const track = screen.getAllByText('Slide 1')[0].parentElement!;

		fireEvent.pointerDown(track, { pointerId: 1, clientX: 100 });
		fireEvent.pointerMove(track, { pointerId: 1, clientX: 170 });
		fireEvent.pointerUp(track, { pointerId: 1, clientX: 170 });

		expect(screen.getByText('Slide 1 of 3')).toBeDefined();
	});

	it('snaps back without changing slide when the drag stays below the threshold', () =>
	{
		render(<BasicCarousel />);
		const track = screen.getAllByText('Slide 1')[0].parentElement!;

		fireEvent.pointerDown(track, { pointerId: 1, clientX: 200 });
		fireEvent.pointerMove(track, { pointerId: 1, clientX: 185 });
		fireEvent.pointerUp(track, { pointerId: 1, clientX: 185 });

		expect(screen.getByText('Slide 1 of 3')).toBeDefined();
	});

	it('does not treat a tiny pointer movement as a drag, so clicks inside a slide still fire', () =>
	{
		const onClick = vi.fn();
		render(
			<Carousel aria-label='Test carousel'>
				<CarouselContent>
					<CarouselItem><button onClick={onClick}>Action</button></CarouselItem>
					<CarouselItem>Slide 2</CarouselItem>
				</CarouselContent>
			</Carousel>
		);
		const button = screen.getByText('Action');
		const track  = button.parentElement!.parentElement!;

		fireEvent.pointerDown(track, { pointerId: 1, clientX: 200 });
		fireEvent.pointerMove(track, { pointerId: 1, clientX: 202 });
		fireEvent.pointerUp(track, { pointerId: 1, clientX: 202 });
		fireEvent.click(button);

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('suppresses the click on interactive content after a real drag', () =>
	{
		const onClick = vi.fn();
		render(
			<Carousel aria-label='Test carousel'>
				<CarouselContent>
					<CarouselItem><button onClick={onClick}>Action</button></CarouselItem>
					<CarouselItem>Slide 2</CarouselItem>
				</CarouselContent>
			</Carousel>
		);
		const button = screen.getByText('Action');
		const track  = button.parentElement!.parentElement!;

		fireEvent.pointerDown(track, { pointerId: 1, clientX: 200 });
		fireEvent.pointerMove(track, { pointerId: 1, clientX: 130 });
		fireEvent.pointerUp(track, { pointerId: 1, clientX: 130 });
		fireEvent.click(button);

		expect(onClick).not.toHaveBeenCalled();
	});

	it('keeps the active dot in sync after a drag advances the slide', () =>
	{
		render(<BasicCarousel />);
		const track = screen.getAllByText('Slide 1')[0].parentElement!;

		fireEvent.pointerDown(track, { pointerId: 1, clientX: 200 });
		fireEvent.pointerMove(track, { pointerId: 1, clientX: 130 });
		fireEvent.pointerUp(track, { pointerId: 1, clientX: 130 });

		const dots = screen.getAllByRole('tab');
		expect(dots[1].getAttribute('aria-selected')).toBe('true');
		expect(dots[0].getAttribute('aria-selected')).toBe('false');
	});

	it('respects loop on a rightward drag from the first slide', () =>
	{
		render(<BasicCarousel loop />);
		const track = screen.getAllByText('Slide 1')[0].parentElement!;

		fireEvent.pointerDown(track, { pointerId: 1, clientX: 100 });
		fireEvent.pointerMove(track, { pointerId: 1, clientX: 170 });
		fireEvent.pointerUp(track, { pointerId: 1, clientX: 170 });

		expect(screen.getByText('Slide 3 of 3')).toBeDefined();
	});
});
