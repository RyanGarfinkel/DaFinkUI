import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from './Modal';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

// ─── jsdom stubs ──────────────────────────────────────────────────────────────

beforeEach(() =>
{
	HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement)
	{
		this.setAttribute('open', '');
	});
	HTMLDialogElement.prototype.close = vi.fn(function(this: HTMLDialogElement)
	{
		this.removeAttribute('open');
	});
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

interface HarnessProps
{
	onOpenChange?: (open: boolean) => void;
	defaultOpen?:  boolean;
}

const ModalHarness = ({ onOpenChange, defaultOpen = false }: HarnessProps) =>
{
	const [open, setOpen] = useState(defaultOpen);

	const handleChange = (next: boolean) =>
	{
		setOpen(next);
		onOpenChange?.(next);
	};

	return (
		<>
			<button type='button' onClick={() => handleChange(true)}>Open modal</button>
			<Modal open={open} onOpenChange={handleChange}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>Example title</ModalTitle>
				</ModalHeader>
				<ModalContent>
					<p>Body text</p>
				</ModalContent>
				<ModalFooter>
					<button type='button'>Cancel</button>
					<button type='button'>Confirm</button>
				</ModalFooter>
			</Modal>
		</>
	);
};

const renderControlled = (open: boolean, onOpenChange = vi.fn()) =>
{
	const result = render(
		<Modal open={open} onOpenChange={onOpenChange}>
			<ModalClose />
			<ModalHeader>
				<ModalTitle>Example title</ModalTitle>
			</ModalHeader>
			<ModalContent>
				<p>Body text</p>
			</ModalContent>
			<ModalFooter>
				<button type='button'>Cancel</button>
				<button type='button'>Confirm</button>
			</ModalFooter>
		</Modal>
	);
	return { ...result, onOpenChange };
};

const waitForFocusInside = async () =>
{
	await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Close')));
};

const getPanel = () => screen.getByRole('dialog').querySelector<HTMLElement>('[data-state]')!;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Modal', () =>
{
	it('does not render when open=false', () =>
	{
		renderControlled(false);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('renders the dialog when open=true', async () =>
	{
		renderControlled(true);
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
	});

	it('has role="dialog" and aria-modal="true"', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			const dialog = screen.getByRole('dialog');
			expect(dialog.getAttribute('aria-modal')).toBe('true');
		});
	});

	it('wires aria-labelledby to the ModalTitle id', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			const dialog  = screen.getByRole('dialog');
			const titleId = dialog.getAttribute('aria-labelledby');
			expect(titleId).toBeTruthy();

			const title = document.getElementById(titleId!);
			expect(title).not.toBeNull();
			expect(title!.textContent).toBe('Example title');
		});
	});

	it('renders header, content, and footer children', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			expect(screen.getByText('Example title')).toBeDefined();
			expect(screen.getByText('Body text')).toBeDefined();
			expect(screen.getByText('Cancel')).toBeDefined();
			expect(screen.getByText('Confirm')).toBeDefined();
		});
	});

	it('moves focus to the first focusable element on open', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			expect(document.activeElement).toBe(screen.getByLabelText('Close'));
		});
	});

	it('traps focus: Tab from the last element wraps to the first', async () =>
	{
		renderControlled(true);
		await waitForFocusInside();

		const confirm = screen.getByText('Confirm');
		confirm.focus();

		await userEvent.tab();

		expect(document.activeElement).toBe(screen.getByLabelText('Close'));
	});

	it('traps focus: Shift+Tab from the first element wraps to the last', async () =>
	{
		renderControlled(true);
		await waitForFocusInside();

		const close = screen.getByLabelText('Close');
		close.focus();

		await userEvent.tab({ shift: true });

		expect(document.activeElement).toBe(screen.getByText('Confirm'));
	});

	it('calls onOpenChange(false) when Escape is pressed', async () =>
	{
		const { onOpenChange } = renderControlled(true);
		await waitForFocusInside();

		await userEvent.keyboard('{Escape}');

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('calls onOpenChange(false) when the backdrop is clicked', async () =>
	{
		const { onOpenChange } = renderControlled(true);
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

		fireEvent.pointerDown(screen.getByRole('dialog'));

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('does not close when clicking inside the panel', async () =>
	{
		const { onOpenChange } = renderControlled(true);
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

		fireEvent.pointerDown(screen.getByText('Body text'));

		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('calls onOpenChange(false) when ModalClose is clicked', async () =>
	{
		const { onOpenChange } = renderControlled(true);
		const close = await screen.findByLabelText('Close');

		await userEvent.click(close);

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('returns focus to the trigger when closed via Escape', async () =>
	{
		render(<ModalHarness />);
		const trigger = screen.getByText('Open modal');

		await userEvent.click(trigger);
		await waitForFocusInside();

		await userEvent.keyboard('{Escape}');

		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('returns focus to the trigger when closed via backdrop click', async () =>
	{
		render(<ModalHarness />);
		const trigger = screen.getByText('Open modal');

		await userEvent.click(trigger);
		await waitForFocusInside();

		fireEvent.pointerDown(screen.getByRole('dialog'));

		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('returns focus to the trigger when closed via the close button', async () =>
	{
		render(<ModalHarness />);
		const trigger = screen.getByText('Open modal');

		await userEvent.click(trigger);
		await waitForFocusInside();

		await userEvent.click(screen.getByLabelText('Close'));

		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('removes the dialog from the DOM after the exit animation', async () =>
	{
		render(<ModalHarness />);

		await userEvent.click(screen.getByText('Open modal'));
		await waitForFocusInside();

		await userEvent.keyboard('{Escape}');

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
	});

	it('close button has visible focus-visible ring classes', async () =>
	{
		renderControlled(true);
		const close = await screen.findByLabelText('Close');

		expect(close.className).toContain('focus-visible:ring-2');
		expect(close.className).toContain('focus-visible:ring-offset-2');
		expect(close.className).toContain('focus:outline-none');
	});

	it('uses motion tokens for enter animation classes', async () =>
	{
		renderControlled(true);

		await waitFor(() =>
		{
			const panel = getPanel();
			expect(panel.getAttribute('data-state')).toBe('open');
			expect(panel.className).toContain('opacity-100');
			expect(panel.className).toContain('scale-100');
			expect(panel.className).toContain('motion-safe:duration-[var(--duration-base)]');
			expect(panel.className).toContain('motion-safe:ease-[var(--ease-enter)]');
		});
	});

	it('merges a custom className onto the panel', async () =>
	{
		render(
			<Modal open onOpenChange={() => {}} className='custom-class'>
				<ModalTitle>Title</ModalTitle>
			</Modal>
		);

		await waitFor(() =>
		{
			expect(getPanel().className).toContain('custom-class');
		});
	});

	it('spreads native props onto the panel element', async () =>
	{
		render(
			<Modal open onOpenChange={() => {}} id='my-modal'>
				<ModalTitle>Title</ModalTitle>
			</Modal>
		);

		await waitFor(() =>
		{
			expect(screen.getByRole('dialog').id).toBe('my-modal');
		});
	});

	it('focuses the panel itself when it contains no focusable elements', async () =>
	{
		render(
			<Modal open onOpenChange={() => {}}>
				<ModalContent>No buttons here</ModalContent>
			</Modal>
		);

		await waitFor(() =>
		{
			expect(document.activeElement).toBe(getPanel());
		});
	});

	it('throws when subcomponents are used outside <Modal>', () =>
	{
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(<ModalTitle>Orphan</ModalTitle>)).toThrow();
		spy.mockRestore();
	});
});
