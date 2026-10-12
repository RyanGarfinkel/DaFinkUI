import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CodeBlock } from './CodeBlock';

const CODE = 'const x = 42;';

describe('CodeBlock', () =>
{
	describe('variant="code" (default)', () =>
	{
		it('renders the code content', () =>
		{
			render(<CodeBlock code={CODE} />);
			expect(screen.getByText(CODE)).toBeTruthy();
		});

		it('renders the copy button', () =>
		{
			render(<CodeBlock code={CODE} />);
			expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeTruthy();
		});

		it('copy button changes label after click', async () =>
		{
			const writeText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(navigator, 'clipboard', {
				value: { writeText },
				configurable: true,
			});

			render(<CodeBlock code={CODE} />);
			const btn = screen.getByRole('button', { name: 'Copy to clipboard' });
			fireEvent.click(btn);

			await waitFor(() =>
			{
				expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
			});
		});

		it('applies additional className to root wrapper', () =>
		{
			const { container } = render(<CodeBlock code={CODE} className='my-custom' />);
			expect(container.firstChild).toHaveClass('my-custom');
		});
	});

	describe('variant="example"', () =>
	{
		it('renders a ToggleGroup with Preview and Code items', () =>
		{
			render(<CodeBlock variant='example' code={CODE}><span>live preview</span></CodeBlock>);
			expect(screen.getByRole('button', { name: 'Preview' })).toBeTruthy();
			expect(screen.getByRole('button', { name: 'Code' })).toBeTruthy();
		});

		it('shows children in preview tab by default', () =>
		{
			render(<CodeBlock variant='example' code={CODE}><span>live preview</span></CodeBlock>);
			expect(screen.getByText('live preview')).toBeTruthy();
		});

		it('shows the code panel after clicking Code tab', () =>
		{
			render(<CodeBlock variant='example' code={CODE}><span>live preview</span></CodeBlock>);

			const codeTab = screen.getByRole('button', { name: 'Code' });
			fireEvent.click(codeTab);

			expect(screen.getByText(CODE)).toBeTruthy();
		});

		it('hides children when Code tab is active', () =>
		{
			render(<CodeBlock variant='example' code={CODE}><span>live preview</span></CodeBlock>);

			const codeTab = screen.getByRole('button', { name: 'Code' });
			fireEvent.click(codeTab);

			expect(screen.queryByText('live preview')).toBeNull();
		});

		it('renders the copy button when Code tab is active', () =>
		{
			render(<CodeBlock variant='example' code={CODE}><span>live preview</span></CodeBlock>);

			fireEvent.click(screen.getByRole('button', { name: 'Code' }));

			expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeTruthy();
		});

		it('uses the label prop as the ToggleGroup aria-label', () =>
		{
			render(
				<CodeBlock variant='example' code={CODE} label='button-example'>
					<span>preview</span>
				</CodeBlock>
			);
			expect(screen.getByRole('group', { name: 'button-example' })).toBeTruthy();
		});

		it('applies minHeight to the preview pane', () =>
		{
			render(
				<CodeBlock variant='example' code={CODE} minHeight='300px'>
					<span>preview</span>
				</CodeBlock>
			);
			const panel = screen.getByRole('tabpanel', { name: 'Preview' });
			expect(panel).toHaveStyle({ minHeight: '300px' });
		});

		it('applies align="start" class to preview pane', () =>
		{
			render(
				<CodeBlock variant='example' code={CODE} align='start'>
					<span>preview</span>
				</CodeBlock>
			);
			const panel = screen.getByRole('tabpanel', { name: 'Preview' });
			expect(panel.className).toContain('items-start');
			expect(panel.className).toContain('justify-start');
		});
	});

	describe('editable', () =>
	{
		it('renders a textarea when editable=true', () =>
		{
			render(<CodeBlock code={CODE} editable />);
			expect(screen.getByRole('textbox')).toBeTruthy();
		});

		it('textarea has the initial code as its value', () =>
		{
			render(<CodeBlock code={CODE} editable />);
			const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
			expect(textarea.value).toBe(CODE);
		});

		it('does not render a pre element when editable=true', () =>
		{
			const { container } = render(<CodeBlock code={CODE} editable />);
			expect(container.querySelector('pre')).toBeNull();
		});

		it('calls onCodeChange when the user types', () =>
		{
			const onCodeChange = vi.fn();
			render(<CodeBlock code={CODE} editable onCodeChange={onCodeChange} />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'const y = 99;' } });

			expect(onCodeChange).toHaveBeenCalledWith('const y = 99;');
		});

		it('copy button copies the edited textarea value', async () =>
		{
			const writeText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(navigator, 'clipboard', {
				value: { writeText },
				configurable: true,
			});

			render(<CodeBlock code={CODE} editable />);

			const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
			fireEvent.change(textarea, { target: { value: 'const edited = true;' } });

			fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

			await waitFor(() =>
			{
				expect(writeText).toHaveBeenCalledWith('const edited = true;');
			});
		});

		it('Tab key inserts two spaces and does not blur', () =>
		{
			render(<CodeBlock code='abc' editable />);

			const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
			textarea.setSelectionRange(3, 3);

			fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab', bubbles: true });

			expect(textarea.value).toBe('abc  ');
		});

		it('renders a textarea in the Code tab when variant="example" and editable=true', () =>
		{
			render(
				<CodeBlock variant='example' code={CODE} editable>
					<span>preview</span>
				</CodeBlock>
			);

			fireEvent.click(screen.getByRole('button', { name: 'Code' }));

			expect(screen.getByRole('textbox')).toBeTruthy();
		});

		it('onCodeChange fires from within the example variant Code tab', () =>
		{
			const onCodeChange = vi.fn();
			render(
				<CodeBlock variant='example' code={CODE} editable onCodeChange={onCodeChange}>
					<span>preview</span>
				</CodeBlock>
			);

			fireEvent.click(screen.getByRole('button', { name: 'Code' }));

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'const z = 0;' } });

			expect(onCodeChange).toHaveBeenCalledWith('const z = 0;');
		});
	});

	describe('copied reset timer', () =>
	{
		it('clears the pending reset timer when unmounted', async () =>
		{
			vi.useFakeTimers();

			try
			{
				Object.defineProperty(navigator, 'clipboard', {
					value: { writeText: vi.fn().mockResolvedValue(undefined) },
					configurable: true,
				});
				const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
				const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

				const { unmount } = render(<CodeBlock code={CODE} />);
				await act(async () =>
				{
					fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));
				});

				const resetCallIndex = setTimeoutSpy.mock.calls.findIndex(([, ms]) => ms === 2000);
				const resetTimerId = setTimeoutSpy.mock.results[resetCallIndex].value;
				clearTimeoutSpy.mockClear();
				unmount();

				expect(clearTimeoutSpy).toHaveBeenCalledWith(resetTimerId);
			}
			finally
			{
				vi.restoreAllMocks();
				vi.useRealTimers();
			}
		});
	});
});
