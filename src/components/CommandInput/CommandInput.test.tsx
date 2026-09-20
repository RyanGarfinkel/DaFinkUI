import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandInput, type CommandOption } from './CommandInput';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';

const COMMANDS: CommandOption[] = [
	{ name: 'compact', description: 'Summarize the conversation' },
	{ name: 'clear',   description: 'Clear all messages' },
	{ name: 'rename',  description: 'Rename this chat' },
];

const Harness = (
	{ initialValue = '', onCommand = vi.fn() }: { initialValue?: string; onCommand?: (c: CommandOption) => void }
) => {
	const [value, setValue] = useState(initialValue);
	return (
		<CommandInput
			value={value}
			onChange={setValue}
			commands={COMMANDS}
			onCommand={onCommand}
			placeholder='Message…'
		/>
	);
};

describe('CommandInput: rendering', () =>
{
	it('renders the input with placeholder', () =>
	{
		render(<Harness />);
		expect(screen.getByPlaceholderText('Message…')).toBeInTheDocument();
	});

	it('does not render the listbox when the value does not start with the trigger', () =>
	{
		render(<Harness initialValue='hello' />);
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});
});

describe('CommandInput: open/close', () =>
{
	it('opens the listbox when the value starts with the trigger character', () =>
	{
		render(<Harness />);
		fireEvent.change(screen.getByRole('combobox'), { target: { value: '/' } });
		expect(screen.getByRole('listbox')).toBeInTheDocument();
	});

	it('sets aria-expanded to true when open and false when closed', () =>
	{
		render(<Harness />);
		const input = screen.getByRole('combobox');
		expect(input).toHaveAttribute('aria-expanded', 'false');
		fireEvent.change(input, { target: { value: '/' } });
		expect(input).toHaveAttribute('aria-expanded', 'true');
	});

	it('closes the listbox on Escape and returns focus to the input', async () =>
	{
		render(<Harness />);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/' } });
		expect(screen.getByRole('listbox')).toBeInTheDocument();
		fireEvent.keyDown(input, { key: 'Escape' });
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
		expect(input).toHaveFocus();
	});

	it('closes the listbox on outside pointerdown', async () =>
	{
		render(
			<div>
				<Harness />
				<button type='button'>outside</button>
			</div>
		);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/' } });
		expect(screen.getByRole('listbox')).toBeInTheDocument();
		fireEvent.pointerDown(screen.getByText('outside'));
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
	});
});

describe('CommandInput: filtering', () =>
{
	it('filters commands by case-insensitive prefix match', () =>
	{
		render(<Harness />);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/comp' } });
		const opts = screen.getAllByRole('option');
		expect(opts).toHaveLength(1);
		expect(opts[0]).toHaveTextContent('compact');
	});

	it('shows "No matching commands" when nothing matches', () =>
	{
		render(<Harness />);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/zzz' } });
		expect(screen.getByText('No matching commands')).toBeInTheDocument();
		expect(screen.queryByRole('option')).not.toBeInTheDocument();
	});
});

describe('CommandInput: keyboard behavior', () =>
{
	it('ArrowDown moves aria-activedescendant to the next option', () =>
	{
		render(<Harness />);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/' } });
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		const opts = screen.getAllByRole('option');
		expect(input.getAttribute('aria-activedescendant')).toBe(opts[1].id);
	});

	it('Tab completes the active command into the input without calling onCommand', () =>
	{
		const onCommand = vi.fn();
		render(<Harness onCommand={onCommand} />);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/comp' } });
		fireEvent.keyDown(input, { key: 'Tab' });
		expect(input).toHaveValue('/compact');
		expect(onCommand).not.toHaveBeenCalled();
		expect(screen.getByRole('listbox')).toBeInTheDocument();
	});

	it('Enter calls onCommand with the active command and clears the input', () =>
	{
		const onCommand = vi.fn();
		render(<Harness onCommand={onCommand} />);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/comp' } });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onCommand).toHaveBeenCalledWith({ name: 'compact', description: 'Summarize the conversation' });
		expect(input).toHaveValue('');
	});

	it('Enter with no matches does not call onCommand', () =>
	{
		const onCommand = vi.fn();
		render(<Harness onCommand={onCommand} />);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/zzz' } });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onCommand).not.toHaveBeenCalled();
	});
});

describe('CommandInput: pointer selection', () =>
{
	it('calls onCommand and clears the input when an option is pointer-selected', () =>
	{
		const onCommand = vi.fn();
		render(<Harness onCommand={onCommand} />);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: '/' } });
		fireEvent.pointerDown(screen.getByRole('option', { name: /clear/i }));
		expect(onCommand).toHaveBeenCalledWith({ name: 'clear', description: 'Clear all messages' });
		expect(input).toHaveValue('');
	});
});

describe('CommandInput: ARIA', () =>
{
	it('input has role="combobox"', () =>
	{
		render(<Harness />);
		expect(screen.getByRole('combobox')).toBeInTheDocument();
	});

	it('input has aria-autocomplete="list"', () =>
	{
		render(<Harness />);
		expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
	});

	it('input has aria-controls pointing to the listbox id', () =>
	{
		render(<Harness />);
		const input  = screen.getByRole('combobox');
		const ctrlId = input.getAttribute('aria-controls');
		fireEvent.change(input, { target: { value: '/' } });
		expect(screen.getByRole('listbox').id).toBe(ctrlId);
	});

	it('aria-activedescendant is absent when the listbox is closed', () =>
	{
		render(<Harness />);
		expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant');
	});
});

describe('CommandInput: disabled and forwarded props', () =>
{
	it('applies disabled state to the input', () =>
	{
		render(
			<CommandInput
				value=''
				onChange={() => {}}
				commands={COMMANDS}
				onCommand={() => {}}
				disabled
			/>
		);
		expect(screen.getByRole('combobox')).toBeDisabled();
	});

	it('forwards native input attributes such as name', () =>
	{
		render(
			<CommandInput
				value=''
				onChange={() => {}}
				commands={COMMANDS}
				onCommand={() => {}}
				name='message'
			/>
		);
		expect(screen.getByRole('combobox')).toHaveAttribute('name', 'message');
	});
});
