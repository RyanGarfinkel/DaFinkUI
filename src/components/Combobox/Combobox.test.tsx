import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Combobox } from './Combobox';

const OPTIONS = [
	{ value: 'ts',     label: 'TypeScript'  },
	{ value: 'js',     label: 'JavaScript'  },
	{ value: 'py',     label: 'Python'      },
	{ value: 'rs',     label: 'Rust'        },
	{ value: 'go',     label: 'Go',  disabled: true },
];

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('Combobox: rendering', () =>
{
	it('renders the input with placeholder', () =>
	{
		render(<Combobox options={OPTIONS} placeholder='Pick a language' />);
		expect(screen.getByPlaceholderText('Pick a language')).toBeInTheDocument();
	});

	it('renders a label element when label prop is provided', () =>
	{
		render(<Combobox options={OPTIONS} label='Language' />);
		expect(screen.getByText('Language')).toBeInTheDocument();
	});

	it('renders hint text when no error is set', () =>
	{
		render(<Combobox options={OPTIONS} hint='Type to search' />);
		expect(screen.getByText('Type to search')).toBeInTheDocument();
	});

	it('renders error text and applies border-danger class when error prop is set', () =>
	{
		render(<Combobox options={OPTIONS} error='Required' />);
		expect(screen.getByText('Required')).toBeInTheDocument();
		expect(screen.getByRole('combobox').className).toContain('border-danger');
	});

	it('does not render hint when error is also set', () =>
	{
		render(<Combobox options={OPTIONS} hint='A hint' error='An error' />);
		expect(screen.queryByText('A hint')).not.toBeInTheDocument();
		expect(screen.getByText('An error')).toBeInTheDocument();
	});
});

// ─── Dropdown open / close ────────────────────────────────────────────────────

describe('Combobox: dropdown open/close', () =>
{
	it('opens the listbox when input receives focus', () =>
	{
		render(<Combobox options={OPTIONS} />);
		fireEvent.focus(screen.getByRole('combobox'));
		expect(screen.getByRole('listbox')).toBeInTheDocument();
	});

	it('sets aria-expanded to true when open and false when closed', () =>
	{
		render(<Combobox options={OPTIONS} />);
		const input = screen.getByRole('combobox');
		expect(input).toHaveAttribute('aria-expanded', 'false');
		fireEvent.focus(input);
		expect(input).toHaveAttribute('aria-expanded', 'true');
	});

	it('closes the dropdown and returns focus on Escape', async () =>
	{
		render(<Combobox options={OPTIONS} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		expect(screen.getByRole('listbox')).toBeInTheDocument();
		fireEvent.keyDown(input, { key: 'Escape' });
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
	});
});

// ─── Filtering ────────────────────────────────────────────────────────────────

describe('Combobox: filtering', () =>
{
	it('filters options by typed query (case-insensitive substring)', () =>
	{
		render(<Combobox options={OPTIONS} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: 'script' } });
		const opts = screen.getAllByRole('option');
		expect(opts).toHaveLength(2);
		expect(opts[0]).toHaveTextContent('TypeScript');
		expect(opts[1]).toHaveTextContent('JavaScript');
	});

	it('shows "No options" when query matches nothing', () =>
	{
		render(<Combobox options={OPTIONS} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: 'zzz' } });
		expect(screen.getByRole('option', { name: 'No options' })).toBeInTheDocument();
	});
});

// ─── Single select ────────────────────────────────────────────────────────────

describe('Combobox: single select', () =>
{
	it('calls onChange with the selected value when an option is clicked', () =>
	{
		const onChange = vi.fn();
		render(<Combobox options={OPTIONS} onChange={onChange} />);
		fireEvent.focus(screen.getByRole('combobox'));
		fireEvent.pointerDown(screen.getByRole('option', { name: /TypeScript/i }));
		expect(onChange).toHaveBeenCalledWith('ts');
	});

	it('marks the matched option with aria-selected=true', () =>
	{
		render(<Combobox options={OPTIONS} value='py' />);
		fireEvent.focus(screen.getByRole('combobox'));
		const pythonOpt = screen.getByRole('option', { name: /Python/i });
		expect(pythonOpt).toHaveAttribute('aria-selected', 'true');
	});

	it('marks non-selected options with aria-selected=false', () =>
	{
		render(<Combobox options={OPTIONS} value='py' />);
		fireEvent.focus(screen.getByRole('combobox'));
		const tsOpt = screen.getByRole('option', { name: /TypeScript/i });
		expect(tsOpt).toHaveAttribute('aria-selected', 'false');
	});
});

// ─── Multi select ─────────────────────────────────────────────────────────────

describe('Combobox: multi select', () =>
{
	it('renders pills for each selected value', () =>
	{
		render(
			<Combobox
				options={OPTIONS}
				multiple
				value={['ts', 'py']}
				onChange={() => {}}
			/>
		);
		const pillContainer = screen.getByLabelText('Selected options');
		expect(within(pillContainer).getByText('TypeScript')).toBeInTheDocument();
		expect(within(pillContainer).getByText('Python')).toBeInTheDocument();
	});

	it('calls onChange with updated array when an option is selected', () =>
	{
		const onChange = vi.fn();
		render(
			<Combobox
				options={OPTIONS}
				multiple
				value={['ts']}
				onChange={onChange}
			/>
		);
		fireEvent.focus(screen.getByRole('combobox'));
		fireEvent.pointerDown(screen.getByRole('option', { name: /JavaScript/i }));
		expect(onChange).toHaveBeenCalledWith(['ts', 'js']);
	});

	it('calls onChange without removed value when × pill button is clicked', () =>
	{
		const onChange = vi.fn();
		render(
			<Combobox
				options={OPTIONS}
				multiple
				value={['ts', 'py']}
				onChange={onChange}
			/>
		);
		fireEvent.click(screen.getByLabelText('Remove Python'));
		expect(onChange).toHaveBeenCalledWith(['ts']);
	});

	it('removes last pill on Backspace when input is empty', () =>
	{
		const onChange = vi.fn();
		render(
			<Combobox
				options={OPTIONS}
				multiple
				value={['ts', 'py']}
				onChange={onChange}
			/>
		);
		const input = screen.getByRole('combobox');
		fireEvent.keyDown(input, { key: 'Backspace' });
		expect(onChange).toHaveBeenCalledWith(['ts']);
	});

	it('does not remove last pill on Backspace when input has text', () =>
	{
		const onChange = vi.fn();
		render(
			<Combobox
				options={OPTIONS}
				multiple
				value={['ts']}
				onChange={onChange}
			/>
		);
		const input = screen.getByRole('combobox');
		fireEvent.change(input, { target: { value: 'py' } });
		fireEvent.keyDown(input, { key: 'Backspace' });
		expect(onChange).not.toHaveBeenCalled();
	});
});

// ─── Keyboard navigation ──────────────────────────────────────────────────────

describe('Combobox: keyboard navigation', () =>
{
	it('ArrowDown moves active option to the next enabled option', () =>
	{
		render(<Combobox options={OPTIONS} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		const opts = screen.getAllByRole('option');
		expect(opts[1]).toHaveAttribute('id', input.getAttribute('aria-activedescendant') ?? '');
	});

	it('ArrowUp from the first option wraps to the last enabled option', () =>
	{
		const onChange = vi.fn();
		render(<Combobox options={OPTIONS} onChange={onChange} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		fireEvent.keyDown(input, { key: 'ArrowUp' });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onChange).toHaveBeenCalledWith('rs');
	});

	it('Enter selects the currently focused option', () =>
	{
		const onChange = vi.fn();
		render(<Combobox options={OPTIONS} onChange={onChange} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onChange).toHaveBeenCalledWith('ts');
	});

	it('Home moves to the first enabled option', () =>
	{
		const onChange = vi.fn();
		render(<Combobox options={OPTIONS} onChange={onChange} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		fireEvent.keyDown(input, { key: 'Home' });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onChange).toHaveBeenCalledWith('ts');
	});

	it('End moves to the last enabled option, skipping disabled', () =>
	{
		const onChange = vi.fn();
		render(<Combobox options={OPTIONS} onChange={onChange} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: 'End' });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect(onChange).toHaveBeenCalledWith('rs');
	});
});

// ─── Disabled options ─────────────────────────────────────────────────────────

describe('Combobox: disabled options', () =>
{
	it('renders disabled options with aria-disabled=true', () =>
	{
		render(<Combobox options={OPTIONS} />);
		fireEvent.focus(screen.getByRole('combobox'));
		const goOpt = screen.getByRole('option', { name: /Go/i });
		expect(goOpt).toHaveAttribute('aria-disabled', 'true');
	});

	it('does not call onChange when a disabled option is clicked', () =>
	{
		const onChange = vi.fn();
		render(<Combobox options={OPTIONS} onChange={onChange} />);
		fireEvent.focus(screen.getByRole('combobox'));
		fireEvent.pointerDown(screen.getByRole('option', { name: /Go/i }));
		expect(onChange).not.toHaveBeenCalled();
	});
});

// ─── Disabled component ───────────────────────────────────────────────────────

describe('Combobox: disabled component', () =>
{
	it('does not open when disabled', () =>
	{
		render(<Combobox options={OPTIONS} disabled />);
		fireEvent.focus(screen.getByRole('combobox'));
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});

	it('applies opacity-50 class when disabled', () =>
	{
		render(<Combobox options={OPTIONS} disabled />);
		expect(screen.getByRole('combobox').className).toContain('opacity-50');
	});
});

// ─── ARIA ─────────────────────────────────────────────────────────────────────

describe('Combobox: ARIA', () =>
{
	it('input has role="combobox"', () =>
	{
		render(<Combobox options={OPTIONS} />);
		expect(screen.getByRole('combobox')).toBeInTheDocument();
	});

	it('input has aria-autocomplete="list"', () =>
	{
		render(<Combobox options={OPTIONS} />);
		expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
	});

	it('input has aria-controls pointing to the listbox id', () =>
	{
		render(<Combobox options={OPTIONS} />);
		const input   = screen.getByRole('combobox');
		const ctrlId  = input.getAttribute('aria-controls');
		fireEvent.focus(input);
		expect(screen.getByRole('listbox').id).toBe(ctrlId);
	});

	it('aria-activedescendant is absent when no option is focused', () =>
	{
		render(<Combobox options={OPTIONS} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		expect(input).not.toHaveAttribute('aria-activedescendant');
	});

	it('aria-activedescendant updates after ArrowDown', () =>
	{
		render(<Combobox options={OPTIONS} />);
		const input = screen.getByRole('combobox');
		fireEvent.focus(input);
		fireEvent.keyDown(input, { key: 'ArrowDown' });
		expect(input.getAttribute('aria-activedescendant')).not.toBeNull();
	});

	it('remove pill buttons have descriptive aria-label', () =>
	{
		render(
			<Combobox
				options={OPTIONS}
				multiple
				value={['ts']}
				onChange={() => {}}
			/>
		);
		expect(screen.getByLabelText('Remove TypeScript')).toBeInTheDocument();
	});
});
