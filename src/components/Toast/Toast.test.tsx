'use client';

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './Toast';
import { describe, it, expect, vi } from 'vitest';
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

	it('sets role="status" and aria-live="polite" on the toast', async () =>
	{
		await act(async () => { renderWithProvider({ title: 'Hi' }); });
		const toastEl = screen.getAllByRole('status')[0];
		expect(toastEl.getAttribute('aria-live')).toBe('polite');
	});

	it('sets aria-atomic="true" on the toast', async () =>
	{
		await act(async () => { renderWithProvider({ title: 'Hi' }); });
		const toastEl = screen.getAllByRole('status')[0];
		expect(toastEl.getAttribute('aria-atomic')).toBe('true');
	});

	it('renders dismiss button', async () =>
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

describe('Toast interactions', () =>
{
	it('removes the toast when dismiss is clicked', async () =>
	{
		await act(async () => { renderWithProvider({ title: 'Saved' }); });
		expect(screen.getByText('Saved')).toBeDefined();

		await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

		await waitFor(() => expect(screen.queryByText('Saved')).toBeNull());
	});

	it('calls action onClick when action button is clicked', async () =>
	{
		const onClick = vi.fn();
		await act(async () =>
		{
			renderWithProvider({ title: 'Update', action: { label: 'Undo', onClick } });
		});

		await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

		expect(onClick).toHaveBeenCalledOnce();
	});

	it('removes the toast after the action button is clicked', async () =>
	{
		await act(async () =>
		{
			renderWithProvider({ title: 'Update', action: { label: 'Undo', onClick: () => {} } });
		});

		await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

		await waitFor(() => expect(screen.queryByText('Update')).toBeNull());
	});
});
