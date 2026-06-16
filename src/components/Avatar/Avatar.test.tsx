'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import Avatar, { AvatarGroup, getInitials } from './Avatar';
import { describe, it, expect } from 'vitest';

describe('Avatar', () =>
{
	it('renders without errors', () =>
	{
		render(<Avatar name='Ada Lovelace' data-testid='avatar' />);
		expect(screen.getByTestId('avatar')).toBeDefined();
	});

	it('renders an image with src and alt when src is provided', () =>
	{
		render(<Avatar src='/ada.png' alt='Ada Lovelace' />);
		const img = screen.getByRole('img') as HTMLImageElement;
		expect(img.tagName).toBe('IMG');
		expect(img.getAttribute('src')).toBe('/ada.png');
		expect(img.getAttribute('alt')).toBe('Ada Lovelace');
	});

	it('falls back to initials derived from name when src is missing', () =>
	{
		render(<Avatar name='Ada Lovelace' />);
		expect(screen.getByText('AL')).toBeDefined();
	});

	it('derives two letters from a single-word name', () =>
	{
		render(<Avatar name='Ada' />);
		expect(screen.getByText('AD')).toBeDefined();
	});

	it('uses first and last word for multi-word names', () =>
	{
		expect(getInitials('Ada King Lovelace')).toBe('AL');
	});

	it('prefers the explicit fallback prop over derived initials', () =>
	{
		render(<Avatar name='Ada Lovelace' fallback='XY' />);
		expect(screen.getByText('XY')).toBeDefined();
		expect(screen.queryByText('AL')).toBeNull();
	});

	it('falls back to initials when the image fails to load', () =>
	{
		render(<Avatar src='/broken.png' alt='Ada Lovelace' name='Ada Lovelace' />);
		fireEvent.error(screen.getByRole('img'));
		expect(screen.getByText('AL')).toBeDefined();
	});

	it('exposes role img and aria-label on the fallback when a name exists', () =>
	{
		render(<Avatar name='Ada Lovelace' />);
		const root = screen.getByRole('img');
		expect(root.getAttribute('aria-label')).toBe('Ada Lovelace');
	});

	it('marks the fallback initials text as aria-hidden', () =>
	{
		render(<Avatar name='Ada Lovelace' />);
		expect(screen.getByText('AL').getAttribute('aria-hidden')).toBe('true');
	});

	it('hides the avatar from assistive tech when no name, alt, or fallback exists', () =>
	{
		render(<Avatar data-testid='decorative' />);
		const root = screen.getByTestId('decorative');
		expect(root.getAttribute('aria-hidden')).toBe('true');
		expect(screen.queryByRole('img')).toBeNull();
	});

	it('applies size classes for sm, md, and lg', () =>
	{
		const { rerender } = render(<Avatar name='Ada Lovelace' data-testid='avatar' size='sm' />);
		expect(screen.getByTestId('avatar').className).toContain('h-7');

		rerender(<Avatar name='Ada Lovelace' data-testid='avatar' size='md' />);
		expect(screen.getByTestId('avatar').className).toContain('h-9');

		rerender(<Avatar name='Ada Lovelace' data-testid='avatar' size='lg' />);
		expect(screen.getByTestId('avatar').className).toContain('h-12');
	});

	it('defaults to circle shape and supports square', () =>
	{
		const { rerender } = render(<Avatar name='Ada Lovelace' data-testid='avatar' />);
		expect(screen.getByTestId('avatar').className).toContain('rounded-full');

		rerender(<Avatar name='Ada Lovelace' data-testid='avatar' shape='square' />);
		expect(screen.getByTestId('avatar').className).toContain('rounded-[var(--radius)]');
	});

	it('uses token-derived classes for the fallback surface', () =>
	{
		render(<Avatar name='Ada Lovelace' data-testid='avatar' />);
		const className = screen.getByTestId('avatar').className;
		expect(className).toContain('bg-surface-active');
		expect(className).toContain('text-text-muted');
	});

	it('forwards className and native HTML attributes', () =>
	{
		render(<Avatar name='Ada Lovelace' className='extra-class' data-testid='avatar' title='Ada' />);
		const root = screen.getByTestId('avatar');
		expect(root.className).toContain('extra-class');
		expect(root.getAttribute('title')).toBe('Ada');
	});
});

describe('AvatarGroup', () =>
{
	it('renders all children when no max is set', () =>
	{
		render(
			<AvatarGroup>
				<Avatar name='Ada Lovelace' />
				<Avatar name='Grace Hopper' />
				<Avatar name='Alan Turing' />
			</AvatarGroup>
		);
		expect(screen.getByText('AL')).toBeDefined();
		expect(screen.getByText('GH')).toBeDefined();
		expect(screen.getByText('AT')).toBeDefined();
		expect(screen.queryByText(/^\+/)).toBeNull();
	});

	it('collapses overflow into a +N indicator when max is exceeded', () =>
	{
		render(
			<AvatarGroup max={2}>
				<Avatar name='Ada Lovelace' />
				<Avatar name='Grace Hopper' />
				<Avatar name='Alan Turing' />
				<Avatar name='Katherine Johnson' />
			</AvatarGroup>
		);
		expect(screen.getByText('AL')).toBeDefined();
		expect(screen.getByText('GH')).toBeDefined();
		expect(screen.queryByText('AT')).toBeNull();
		expect(screen.getByText('+2')).toBeDefined();
	});

	it('labels the overflow indicator for assistive tech', () =>
	{
		render(
			<AvatarGroup max={1}>
				<Avatar name='Ada Lovelace' />
				<Avatar name='Grace Hopper' />
				<Avatar name='Alan Turing' />
			</AvatarGroup>
		);
		expect(screen.getByLabelText('2 more')).toBeDefined();
		expect(screen.getByText('+2').getAttribute('aria-hidden')).toBe('true');
	});

	it('injects size and shape into child avatars', () =>
	{
		render(
			<AvatarGroup size='lg' shape='square'>
				<Avatar name='Ada Lovelace' data-testid='child' />
			</AvatarGroup>
		);
		const child = screen.getByTestId('child');
		expect(child.className).toContain('h-12');
		expect(child.className).toContain('rounded-[var(--radius)]');
	});

	it('overlaps avatars with negative spacing and a surface ring', () =>
	{
		render(
			<AvatarGroup data-testid='group'>
				<Avatar name='Ada Lovelace' data-testid='child' />
			</AvatarGroup>
		);
		expect(screen.getByTestId('group').className).toContain('-space-x-2');
		expect(screen.getByTestId('child').className).toContain('ring-surface');
	});
});
