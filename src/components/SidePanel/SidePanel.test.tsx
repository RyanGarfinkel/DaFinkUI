import SidePanel, { SidePanelHeader, SidePanelTitle, SidePanelContent, SidePanelFooter, SidePanelClose, SidePanelSide } from './SidePanel';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

interface HarnessProps
{
	onOpenChange?: (open: boolean) => void;
	side?:         SidePanelSide;
}

const SidePanelHarness = ({ onOpenChange, side }: HarnessProps) =>
{
	const [open, setOpen] = useState(false);

	const handleChange = (next: boolean) =>
	{
		setOpen(next);
		onOpenChange?.(next);
	};

	return (
		<>
			<button type='button' onClick={() => handleChange(true)}>Open panel</button>
			<SidePanel open={open} onOpenChange={handleChange} side={side}>
				<SidePanelClose />
				<SidePanelHeader>
					<SidePanelTitle>Panel title</SidePanelTitle>
				</SidePanelHeader>
				<SidePanelContent>
					<p>Panel body</p>
				</SidePanelContent>
				<SidePanelFooter>
					<button type='button'>Cancel</button>
					<button type='button'>Save</button>
				</SidePanelFooter>
			</SidePanel>
		</>
	);
};

const renderControlled = (open: boolean, side?: SidePanelSide, onOpenChange = vi.fn()) =>
{
	const result = render(
		<SidePanel open={open} onOpenChange={onOpenChange} side={side}>
			<SidePanelClose />
			<SidePanelHeader>
				<SidePanelTitle>Panel title</SidePanelTitle>
			</SidePanelHeader>
			<SidePanelContent>
				<p>Panel body</p>
			</SidePanelContent>
			<SidePanelFooter>
				<button type='button'>Cancel</button>
				<button type='button'>Save</button>
			</SidePanelFooter>
		</SidePanel>
	);
	return { ...result, onOpenChange };
};

const waitForFocusInside = async () =>
{
	await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Close')));
};

const getPanel = () => screen.getByRole('dialog');
const getPanelCard = () => getPanel().firstElementChild as HTMLElement;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SidePanel', () =>
{
	it('does not render when open=false', () =>
	{
		renderControlled(false);
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('renders the panel when open=true', async () =>
	{
		renderControlled(true);
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
	});

	it('does not set aria-modal: SidePanel never inerts the rest of the page', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			const panel = screen.getByRole('dialog');
			expect(panel.hasAttribute('aria-modal')).toBe(false);
		});
	});

	it('wires aria-labelledby to the SidePanelTitle id', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			const panel  = screen.getByRole('dialog');
			const titleId = panel.getAttribute('aria-labelledby');
			expect(titleId).toBeTruthy();

			const title = document.getElementById(titleId!);
			expect(title).not.toBeNull();
			expect(title!.textContent).toBe('Panel title');
		});
	});

	it('defaults to the right side, floating with inset margin, and a rounded elevated Card surface', async () =>
	{
		renderControlled(true);
		await waitFor(() =>
		{
			const panel = getPanel();
			expect(panel.getAttribute('data-side')).toBe('right');
			expect(panel.className).toContain('right-4');
			expect(panel.className).toContain('inset-y-4');
			// The visual surface (rounded corners, shadow, background) comes from the
			// real Card component nested inside: not duplicated on the position div.
			expect(getPanelCard().className).toContain('rounded-[var(--radius)]');
			expect(getPanelCard().className).toContain('shadow-[var(--shadow-lg)]');
		});
	});

	it.each([
		['left',   'left-4',   'inset-y-4', '-translate-x-full'],
		['right',  'right-4',  'inset-y-4', 'translate-x-full'],
		['top',    'top-4',    'inset-x-4', '-translate-y-full'],
		['bottom', 'bottom-4', 'inset-x-4', 'translate-y-full'],
	] as [SidePanelSide, string, string, string][])(
		'side="%s" applies the correct floating position classes',
		async (side, positionClass, insetClass) =>
		{
			renderControlled(true, side);
			await waitFor(() =>
			{
				const panel = getPanel();
				expect(panel.getAttribute('data-side')).toBe(side);
				expect(panel.className).toContain(positionClass);
				expect(panel.className).toContain(insetClass);
				expect(getPanelCard().className).toContain('rounded-[var(--radius)]');
			});
		}
	);

	it('does not span the full width or height like an edge-flush drawer', async () =>
	{
		renderControlled(true, 'right');
		await waitFor(() =>
		{
			const panel = getPanel();
			expect(panel.className).not.toContain('w-full');
			expect(panel.className).not.toContain('h-full');
			expect(panel.className).not.toContain('inset-y-0');
			expect(panel.className).not.toContain('right-0');
		});
	});

	it('uses a translate transform for the hidden state', () =>
	{
		const { rerender } = render(
			<SidePanel open={false} onOpenChange={() => {}} side='left'>
				<SidePanelTitle>Panel title</SidePanelTitle>
			</SidePanel>
		);

		rerender(
			<SidePanel open onOpenChange={() => {}} side='left'>
				<SidePanelTitle>Panel title</SidePanelTitle>
			</SidePanel>
		);

		const panel = screen.getByRole('dialog', { hidden: true });
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

	it('does not trap focus: Tab from the last element moves focus out of the panel', async () =>
	{
		render(<SidePanelHarness />);
		await userEvent.click(screen.getByText('Open panel'));
		await waitForFocusInside();

		const save = screen.getByText('Save');
		save.focus();

		await userEvent.tab();

		expect(document.activeElement).not.toBe(screen.getByLabelText('Close'));
	});

	it('calls onOpenChange(false) when Escape is pressed', async () =>
	{
		const { onOpenChange } = renderControlled(true);
		await waitForFocusInside();

		await userEvent.keyboard('{Escape}');

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('does not close when clicking outside the panel: panels stay open independently', async () =>
	{
		const { onOpenChange } = renderControlled(true);
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

		fireEvent.pointerDown(document.body);

		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('calls onOpenChange(false) when SidePanelClose is clicked', async () =>
	{
		const { onOpenChange } = renderControlled(true);
		const close = await screen.findByLabelText('Close');

		await userEvent.click(close);

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('returns focus to the trigger when closed via Escape', async () =>
	{
		render(<SidePanelHarness />);
		const trigger = screen.getByText('Open panel');

		await userEvent.click(trigger);
		await waitForFocusInside();

		await userEvent.keyboard('{Escape}');

		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('returns focus to the trigger when closed via the close button', async () =>
	{
		render(<SidePanelHarness />);
		const trigger = screen.getByText('Open panel');

		await userEvent.click(trigger);
		await waitForFocusInside();

		await userEvent.click(screen.getByLabelText('Close'));

		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('removes the panel from the DOM after the exit animation', async () =>
	{
		render(<SidePanelHarness />);

		await userEvent.click(screen.getByText('Open panel'));
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

	it('merges a custom className onto the panel Card', async () =>
	{
		render(
			<SidePanel open onOpenChange={() => {}} className='custom-class'>
				<SidePanelTitle>Title</SidePanelTitle>
			</SidePanel>
		);

		await waitFor(() =>
		{
			expect(getPanelCard().className).toContain('custom-class');
		});
	});

	it('spreads native props onto the panel element', async () =>
	{
		render(
			<SidePanel open onOpenChange={() => {}} id='my-side-panel'>
				<SidePanelTitle>Title</SidePanelTitle>
			</SidePanel>
		);

		await waitFor(() =>
		{
			expect(screen.getByRole('dialog').id).toBe('my-side-panel');
		});
	});

	it('focuses the panel itself when it contains no focusable elements', async () =>
	{
		render(
			<SidePanel open onOpenChange={() => {}}>
				<SidePanelContent>No buttons here</SidePanelContent>
			</SidePanel>
		);

		await waitFor(() =>
		{
			expect(document.activeElement).toBe(getPanel());
		});
	});

	it('throws when subcomponents are used outside <SidePanel>', () =>
	{
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(<SidePanelTitle>Orphan</SidePanelTitle>)).toThrow();
		spy.mockRestore();
	});

	it('does not lock body scroll: the rest of the page stays interactive', async () =>
	{
		document.body.style.overflow = '';

		renderControlled(true);
		await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());

		expect(document.body.style.overflow).toBe('');
	});

	it('allows two independent panels to be open at the same time', async () =>
	{
		const onOpenChangeA = vi.fn();
		const onOpenChangeB = vi.fn();

		render(
			<>
				<SidePanel open onOpenChange={onOpenChangeA} side='left'>
					<SidePanelTitle>Panel A</SidePanelTitle>
				</SidePanel>
				<SidePanel open onOpenChange={onOpenChangeB} side='right'>
					<SidePanelTitle>Panel B</SidePanelTitle>
				</SidePanel>
			</>
		);

		await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(2));

		expect(onOpenChangeA).not.toHaveBeenCalled();
		expect(onOpenChangeB).not.toHaveBeenCalled();
	});

	it('shifts an earlier panel on the same side toward the center when a second one opens', async () =>
	{
		const StackHarness = () =>
		{
			const [first, setFirst] = useState(false);
			const [second, setSecond] = useState(false);

			return (
				<>
					<button type='button' onClick={() => setFirst(true)}>Open first</button>
					<button type='button' onClick={() => setSecond(true)}>Open second</button>
					<SidePanel open={first} onOpenChange={setFirst} side='right'>
						<SidePanelTitle>First</SidePanelTitle>
					</SidePanel>
					<SidePanel open={second} onOpenChange={setSecond} side='right'>
						<SidePanelTitle>Second</SidePanelTitle>
					</SidePanel>
				</>
			);
		};

		render(<StackHarness />);

		await userEvent.click(screen.getByText('Open first'));
		const [firstPanel] = await screen.findAllByRole('dialog');

		await waitFor(() => expect(firstPanel.style.transform).toBe(''));

		await userEvent.click(screen.getByText('Open second'));

		await waitFor(() => expect(firstPanel.style.transform).toContain('translateX'));
	});

	it('does not shift panels on opposite sides: stacking is per-side', async () =>
	{
		render(
			<>
				<SidePanel open onOpenChange={() => {}} side='left'>
					<SidePanelTitle>Left</SidePanelTitle>
				</SidePanel>
				<SidePanel open onOpenChange={() => {}} side='right'>
					<SidePanelTitle>Right</SidePanelTitle>
				</SidePanel>
			</>
		);

		await waitFor(() =>
		{
			const [left, right] = screen.getAllByRole('dialog');
			expect(left.style.transform).toBe('');
			expect(right.style.transform).toBe('');
		});
	});

	it('un-shifts the earlier panel once the panel in front of it closes', async () =>
	{
		const onOpenChangeB = vi.fn();

		const StackHarness = () =>
		{
			const [second, setSecond] = useState(true);

			return (
				<>
					<SidePanel open onOpenChange={() => {}} side='right'>
						<SidePanelTitle>First</SidePanelTitle>
					</SidePanel>
					<SidePanel
						open={second}
						onOpenChange={(next) => { setSecond(next); onOpenChangeB(next); }}
						side='right'
					>
						<SidePanelClose />
						<SidePanelTitle>Second</SidePanelTitle>
					</SidePanel>
				</>
			);
		};

		render(<StackHarness />);

		const [firstPanel] = await screen.findAllByRole('dialog');
		await waitFor(() => expect(firstPanel.style.transform).toContain('translateX'));

		await userEvent.click(screen.getAllByLabelText('Close')[0]);

		await waitFor(() => expect(firstPanel.style.transform).toBe(''));
	});

	it('disables SidePanelClose and ignores Escape on a panel blocked by a panel in front of it', async () =>
	{
		const onOpenChangeA = vi.fn();

		const StackHarness = () =>
		{
			const [first, setFirst]   = useState(true);
			const [second, setSecond] = useState(true);

			return (
				<>
					<SidePanel
						open={first}
						onOpenChange={(next) => { setFirst(next); onOpenChangeA(next); }}
						side='right'
					>
						<SidePanelClose />
						<SidePanelTitle>First</SidePanelTitle>
					</SidePanel>
					<SidePanel open={second} onOpenChange={setSecond} side='right'>
						<SidePanelClose />
						<SidePanelTitle>Second</SidePanelTitle>
					</SidePanel>
				</>
			);
		};

		render(<StackHarness />);

		const closeButtons = await screen.findAllByLabelText('Close');
		await waitFor(() => expect(closeButtons[0]).toBeDisabled());
		expect(closeButtons[1]).not.toBeDisabled();

		await userEvent.click(closeButtons[0]);
		expect(onOpenChangeA).not.toHaveBeenCalled();

		closeButtons[0].focus();
		await userEvent.keyboard('{Escape}');
		expect(onOpenChangeA).not.toHaveBeenCalled();
	});

	it('re-enables the earlier panel\'s SidePanelClose once the panel in front of it closes', async () =>
	{
		const StackHarness = () =>
		{
			const [first, setFirst]   = useState(true);
			const [second, setSecond] = useState(true);

			return (
				<>
					<SidePanel open={first} onOpenChange={setFirst} side='right'>
						<SidePanelClose />
						<SidePanelTitle>First</SidePanelTitle>
					</SidePanel>
					<SidePanel open={second} onOpenChange={setSecond} side='right'>
						<SidePanelClose />
						<SidePanelTitle>Second</SidePanelTitle>
					</SidePanel>
				</>
			);
		};

		render(<StackHarness />);

		const closeButtons = await screen.findAllByLabelText('Close');
		await waitFor(() => expect(closeButtons[0]).toBeDisabled());

		await userEvent.click(closeButtons[1]);

		await waitFor(async () =>
		{
			const remaining = screen.getAllByLabelText('Close');
			expect(remaining).toHaveLength(1);
			expect(remaining[0]).not.toBeDisabled();
		});
	});
});
