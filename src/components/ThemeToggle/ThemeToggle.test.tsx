import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

const stubMatchMedia = (matches: boolean) =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
		matches,
		addEventListener:    vi.fn(),
		removeEventListener: vi.fn(),
	}));
};

beforeEach(() =>
{
	document.documentElement.classList.remove('dark');
	localStorage.clear();
	stubMatchMedia(false);
});

afterEach(() =>
{
	vi.unstubAllGlobals();
});

describe('ThemeToggle', () =>
{
	it('renders without errors', () =>
	{
		render(<ThemeToggle />);
		expect(screen.getByRole('button')).toBeDefined();
	});

	it('reads a light system preference on mount and sets aria-label to switch to dark mode', () =>
	{
		render(<ThemeToggle />);
		expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Switch to dark mode');
		expect(document.documentElement.classList.contains('dark')).toBe(false);
	});

	it('reads a dark system preference on mount and adds the dark class', () =>
	{
		stubMatchMedia(true);
		render(<ThemeToggle />);
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Switch to light mode');
	});

	it('toggles the dark class on the html element when clicked', () =>
	{
		render(<ThemeToggle />);
		const button = screen.getByRole('button');

		expect(document.documentElement.classList.contains('dark')).toBe(false);
		fireEvent.click(button);
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		fireEvent.click(button);
		expect(document.documentElement.classList.contains('dark')).toBe(false);
	});

	it('flips the aria-label between light and dark mode on click', () =>
	{
		render(<ThemeToggle />);
		const button = screen.getByRole('button');

		expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
		fireEvent.click(button);
		expect(button.getAttribute('aria-label')).toBe('Switch to light mode');
		fireEvent.click(button);
		expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
	});

	it('persists the chosen theme to localStorage', () =>
	{
		render(<ThemeToggle />);
		fireEvent.click(screen.getByRole('button'));
		expect(localStorage.getItem('theme')).toBe('dark');
	});

	it('adds the theme-transition class on click', () =>
	{
		render(<ThemeToggle />);
		fireEvent.click(screen.getByRole('button'));
		expect(document.documentElement.classList.contains('theme-transition')).toBe(true);
	});

	it('has focus-visible ring classes', () =>
	{
		render(<ThemeToggle />);
		const button = screen.getByRole('button');
		expect(button.className).toContain('focus-visible:ring-2');
		expect(button.className).toContain('focus-visible:ring-offset-2');
		expect(button.className).toContain('focus-visible:ring-brand-ring');
	});

	it('forwards className and native HTML attributes', () =>
	{
		render(<ThemeToggle className='extra-class' id='my-toggle' data-testid='toggle' />);
		const button = screen.getByTestId('toggle');
		expect(button.className).toContain('extra-class');
		expect(button.id).toBe('my-toggle');
	});
});
