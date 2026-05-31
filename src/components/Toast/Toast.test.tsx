'use client';

import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';
import { describe, it, expect } from 'vitest';
import { useEffect } from 'react';

const Trigger = ({ opts }: { opts: Parameters<ReturnType<typeof useToast>['toast']>[0] }) =>
{
	const { toast } = useToast();
	useEffect(() => { toast(opts); }, []);
	return null;
};

const renderWithProvider = (opts: Parameters<ReturnType<typeof useToast>['toast']>[0]) =>
{
	return render(
		<ToastProvider>
			<Trigger opts={opts} />
		</ToastProvider>
	);
};

describe('ToastProvider', () =>
{
	it('renders without errors', () =>
	{
		render(<ToastProvider><div /></ToastProvider>);
	});

	it('renders children', () =>
	{
		render(
			<ToastProvider>
				<span data-testid='child'>hello</span>
			</ToastProvider>
		);
		expect(screen.getByTestId('child')).toBeDefined();
	});

	it('renders the notifications container with aria-label', () =>
	{
		render(<ToastProvider><div /></ToastProvider>);
		expect(screen.getByLabelText('Notifications')).toBeDefined();
	});
});

describe('useToast', () =>
{
	it('throws when used outside ToastProvider', () =>
	{
		const Bad = () =>
		{
			useToast();
			return null;
		};
		expect(() => render(<Bad />)).toThrow('useToast must be used within <ToastProvider>');
	});
});

describe('Toast rendering', () =>
{
	it('displays a toast with title', async () =>
	{
		await act(async () => { renderWithProvider({ title: 'Done!' }); });
		expect(screen.getByText('Done!')).toBeDefined();
	});

	it('displays a toast with description', async () =>
	{
		await act(async () => { renderWithProvider({ description: 'Your file was saved.' }); });
		expect(screen.getByText('Your file was saved.')).toBeDefined();
	});

	it('sets role="status" and aria-live="polite" on the toast card', async () =>
	{
		await act(async () => { renderWithProvider({ title: 'Hi' }); });
		const toastEl = screen.getAllByRole('status')[0];
		expect(toastEl.getAttribute('aria-live')).toBe('polite');
	});

	it('sets aria-atomic="true" on the toast card', async () =>
	{
		await act(async () => { renderWithProvider({ title: 'Hi' }); });
		const toastEl = screen.getAllByRole('status')[0];
		expect(toastEl.getAttribute('aria-atomic')).toBe('true');
	});

	it('renders dismiss button with aria-label="Dismiss"', async () =>
	{
		await act(async () => { renderWithProvider({ title: 'Check' }); });
		expect(screen.getByRole('button', { name: 'Dismiss' })).toBeDefined();
	});

	it('renders an action button when action is provided', async () =>
	{
		await act(async () =>
		{
			renderWithProvider({ title: 'Update', action: { label: 'Undo', onClick: () => {} } });
		});
		expect(screen.getByRole('button', { name: 'Undo' })).toBeDefined();
	});
});
