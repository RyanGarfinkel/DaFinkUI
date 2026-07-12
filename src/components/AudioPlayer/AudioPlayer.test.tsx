'use client';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AudioPlayer from './AudioPlayer';

beforeEach(() =>
{
	Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
		configurable: true,
		value: vi.fn().mockResolvedValue(undefined),
	});
	Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
		configurable: true,
		value: vi.fn(),
	});
	Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
		configurable: true,
		value: vi.fn(),
	});
});

describe('AudioPlayer', () =>
{
	it('renders landmark region with correct label', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		expect(screen.getByRole('region', { name: 'Audio player' })).toBeInTheDocument();
	});

	it('includes title and artist in region label when title provided', () =>
	{
		render(<AudioPlayer src='/test.mp3' title='Song Title' subtitle='Artist Name' />);
		expect(screen.getByRole('region', { name: 'Audio player: Song Title' })).toBeInTheDocument();
		expect(screen.getByText('Song Title')).toBeInTheDocument();
		expect(screen.getByText('Artist Name')).toBeInTheDocument();
	});

	it('renders play button with correct initial label', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
	});

	it('renders skip back and skip forward buttons', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		expect(screen.getByRole('button', { name: 'Skip back 10 seconds' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Skip forward 10 seconds' })).toBeInTheDocument();
	});

	it('renders seek and volume sliders', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		expect(screen.getByRole('slider', { name: 'Seek' })).toBeInTheDocument();
		expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
	});

	it('renders speed button at default 1× speed', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		expect(screen.getByRole('button', { name: /1×/ })).toBeInTheDocument();
	});

	it('calls audio.play() when play button is clicked', async () =>
	{
		const user = userEvent.setup();
		render(<AudioPlayer src='/test.mp3' />);
		await user.click(screen.getByRole('button', { name: 'Play' }));
		expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
	});

	it('cycling speed button advances through speed values', async () =>
	{
		const user = userEvent.setup();
		render(<AudioPlayer src='/test.mp3' />);
		const speedBtn = screen.getByRole('button', { name: /1×/ });
		await user.click(speedBtn);
		expect(screen.getByRole('button', { name: /1.25×/ })).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: /1.25×/ }));
		expect(screen.getByRole('button', { name: /1.5×/ })).toBeInTheDocument();
	});

	it('mute button toggles aria-label', async () =>
	{
		const user = userEvent.setup();
		render(<AudioPlayer src='/test.mp3' />);
		const muteBtn = screen.getByRole('button', { name: 'Mute' });
		await user.click(muteBtn);
		expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument();
	});

	it('mute button toggles back to Mute on second click', async () =>
	{
		const user = userEvent.setup();
		render(<AudioPlayer src='/test.mp3' />);
		const muteBtn = screen.getByRole('button', { name: 'Mute' });
		await user.click(muteBtn);
		await user.click(screen.getByRole('button', { name: 'Unmute' }));
		expect(screen.getByRole('button', { name: 'Mute' })).toBeInTheDocument();
	});

	it('forwards className to the container', () =>
	{
		render(<AudioPlayer src='/test.mp3' className='my-class' />);
		expect(screen.getByRole('region').className).toContain('my-class');
	});

	it('applies a chromeless flex row for size="compact": no padding, border, or background', () =>
	{
		render(<AudioPlayer src='/test.mp3' size='compact' />);
		const region = screen.getByRole('region');
		expect(region.className).toContain('items-center');
		expect(region.className).not.toContain('p-2.5');
		expect(region.className).not.toContain('bg-surface-panel');
		expect(region.className).not.toContain('border');
		expect(screen.getByRole('button', { name: 'Play' }).className).toContain('h-7');
	});

	it('defaults to the full card chrome for the default size', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		const region = screen.getByRole('region');
		expect(region.className).toContain('p-4');
		expect(region.className).toContain('bg-surface-panel');
		expect(screen.getByRole('button', { name: 'Play' }).className).toContain('h-9');
	});

	it('hides title/subtitle in compact size even when provided', () =>
	{
		render(<AudioPlayer src='/test.mp3' size='compact' title='Voice message' subtitle='0:42' />);
		expect(screen.queryByText('Voice message')).not.toBeInTheDocument();
		expect(screen.queryByText('0:42')).not.toBeInTheDocument();
	});

	it('uses the on-color Button variant and current-tone Slider in compact size, so it adapts to a colored parent background', () =>
	{
		render(<AudioPlayer src='/test.mp3' size='compact' />);
		const playButton = screen.getByRole('button', { name: 'Play' });
		expect(playButton.className).toContain('bg-current/15');
		expect(playButton.className).not.toContain('bg-brand');

		const seekSlider = screen.getByRole('slider', { name: 'Seek' });
		expect(seekSlider.style.accentColor).toBe('currentcolor');
	});

	it('renders only play and seek in compact size, omitting skip/volume/speed', () =>
	{
		render(<AudioPlayer src='/test.mp3' size='compact' />);
		expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
		expect(screen.getByRole('slider', { name: 'Seek' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Skip back 10 seconds' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Skip forward 10 seconds' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Mute' })).not.toBeInTheDocument();
		expect(screen.queryByRole('slider', { name: 'Volume' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /1×/ })).not.toBeInTheDocument();
	});

	it('shows all controls in default size', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		expect(screen.getByRole('button', { name: 'Skip back 10 seconds' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Skip forward 10 seconds' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Mute' })).toBeInTheDocument();
		expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /1×/ })).toBeInTheDocument();
	});

	it('renders the play button as a circular Button (shape=circle)', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		expect(screen.getByRole('button', { name: 'Play' }).className).toContain('rounded-full');
	});

	it('sets aria-valuetext on the seek slider with formatted timestamps', () =>
	{
		render(<AudioPlayer src='/test.mp3' />);
		expect(screen.getByRole('slider', { name: 'Seek' }).getAttribute('aria-valuetext')).toBe('0:00 of 0:00');
	});
});
