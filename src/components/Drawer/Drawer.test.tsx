import Drawer, { DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose, DrawerSide } from './Drawer';
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
	side?:         DrawerSide;
}

const DrawerHarness = ({ onOpenChange, side }: HarnessProps) =>
{
	const [open, setOpen] = useState(false);

	const handleChange = (next: boolean) =>
	{
		setOpen(next);
		onOpenChange?.(next);
	};

	return (
		<>
			<button type='button' onClick={() => handleChange(true)}>Open drawer</button>
			<Drawer open={open} onOpenChange={handleChange} side={side}>
				<DrawerClose />
				<DrawerHeader>
					<DrawerTitle>Drawer title</DrawerTitle>
				</DrawerHeader>
				<DrawerContent>
					<p>Drawer body</p>
				</DrawerContent>
				<DrawerFooter>
					<button type='button'>Cancel</button>
					<button type='button'>Save</button>
				</DrawerFooter>
			</Drawer>
		</>
	);
};

const renderControlled = (open: boolean, side?: DrawerSide, onOpenChange = vi.fn()) =>
{
	const result = render(
		<Drawer open={open} onOpenChange={onOpenChange} side={side}>
			<DrawerClose />
			<DrawerHeader>
				<DrawerTitle>Drawer title</DrawerTitle>
			</DrawerHeader>
			<DrawerContent>
				<p>Drawer body</p>
			</DrawerContent>
			<DrawerFooter>
				<button type='button'>Cancel</button>
				<button type='button'>Save</button>
			</DrawerFooter>
		</Drawer>
	);
	return { ...result, onOpenChange };
};

const waitForFocusInside = async () =>
{
	await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Close')));
};

const getPanel = () => screen.getByRole('dialog').querySelector<HTMLElement>('[data-state]')!;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Drawer', () =>
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

	it('wires aria-labelledby to the DrawerTitle id', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			const dialog  = screen.getByRole('dialog');
			const titleId = dialog.getAttribute('aria-labelledby');
			expect(titleId).toBeTruthy();

			const title = document.getElementById(titleId!);
			expect(title).not.toBeNull();
			expect(title!.textContent).toBe('Drawer title');
		});
	});

	it('defaults to the right side', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			const panel = getPanel();
			expect(panel.getAttribute('data-side')).toBe('right');
			expect(panel.className).toContain('right-0');
			expect(panel.className).toContain('border-l');
		});
	});

	it.each([
		['left',   'left-0',   'border-r', '-translate-x-full'],
		['right',  'right-0',  'border-l', 'translate-x-full'],
		['top',    'top-0',    'border-b', '-translate-y-full'],
		['bottom', 'bottom-0', 'border-t', 'translate-y-full'],
	] as [DrawerSide, string, string, string][])(
		'side="%s" applies the correct position classes',
		async (side, positionClass, borderClass) =>
		{
			renderControlled(true, side);
			await waitFor(() =>
			{
				const panel = getPanel();
				expect(panel.getAttribute('data-side')).toBe(side);
				expect(panel.className).toContain(positionClass);
				expect(panel.className).toContain(borderClass);
			});
		}
	);

	it('uses a translate transform for the hidden state', () =>
	{
		const { rerender } = render(
			<Drawer open={false} onOpenChange={() => {}} side='left'>
				<DrawerTitle>Drawer title</DrawerTitle>
			</Drawer>
		);

		rerender(
			<Drawer open onOpenChange={() => {}} side='left'>
				<DrawerTitle>Drawer title</DrawerTitle>
			</Drawer>
		);

		const dialog = screen.getByRole('dialog', { hidden: true });
		const panel  = dialog.querySelector<HTMLElement>('[data-state]')!;
		expect(panel.getAttribute('data-state')).toBe('closed');
		expect(panel.className).toContain('-translate-x-full');
		expect(panel.className).toContain('motion-safe:transition-transform');
	});

	it('uses motion tokens for the enter animation', async () =>
	{
		renderControlled(true);

		await waitFor(() =>
		{
			const panel = getPanel();
			expect(panel.getAttribute('data-state')).toBe('open');
			expect(panel.className).toContain('translate-x-0');
			expect(panel.className).toContain('motion-safe:duration-[var(--duration-base)]');
			expect(panel.className).toContain('motion-safe:ease-[var(--ease-enter)]');
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

		const save = screen.getByText('Save');
		save.focus();

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

		expect(document.activeElement).toBe(screen.getByText('Save'));
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

		fireEvent.pointerDown(screen.getByText('Drawer body'));

		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('calls onOpenChange(false) when DrawerClose is clicked', async () =>
	{
		const { onOpenChange } = renderControlled(true);
		const close = await screen.findByLabelText('Close');

		await userEvent.click(close);

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('returns focus to the trigger when closed via Escape', async () =>
	{
		render(<DrawerHarness />);
		const trigger = screen.getByText('Open drawer');

		await userEvent.click(trigger);
		await waitForFocusInside();

		await userEvent.keyboard('{Escape}');

		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('returns focus to the trigger when closed via backdrop click', async () =>
	{
		render(<DrawerHarness />);
		const trigger = screen.getByText('Open drawer');

		await userEvent.click(trigger);
		await waitForFocusInside();

		fireEvent.pointerDown(screen.getByRole('dialog'));

		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('returns focus to the trigger when closed via the close button', async () =>
	{
		render(<DrawerHarness />);
		const trigger = screen.getByText('Open drawer');

		await userEvent.click(trigger);
		await waitForFocusInside();

		await userEvent.click(screen.getByLabelText('Close'));

		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('removes the dialog from the DOM after the exit animation', async () =>
	{
		render(<DrawerHarness />);

		await userEvent.click(screen.getByText('Open drawer'));
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

	it('merges a custom className onto the panel', async () =>
	{
		render(
			<Drawer open onOpenChange={() => {}} className='custom-class'>
				<DrawerTitle>Title</DrawerTitle>
			</Drawer>
		);

		await waitFor(() =>
		{
			expect(getPanel().className).toContain('custom-class');
		});
	});

	it('spreads native props onto the panel element', async () =>
	{
		render(
			<Drawer open onOpenChange={() => {}} id='my-drawer'>
				<DrawerTitle>Title</DrawerTitle>
			</Drawer>
		);

		await waitFor(() =>
		{
			expect(screen.getByRole('dialog').id).toBe('my-drawer');
		});
	});

	it('focuses the panel itself when it contains no focusable elements', async () =>
	{
		render(
			<Drawer open onOpenChange={() => {}}>
				<DrawerContent>No buttons here</DrawerContent>
			</Drawer>
		);

		await waitFor(() =>
		{
			expect(document.activeElement).toBe(getPanel());
		});
	});

	it('throws when subcomponents are used outside <Drawer>', () =>
	{
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(<DrawerTitle>Orphan</DrawerTitle>)).toThrow();
		spy.mockRestore();
	});
});
