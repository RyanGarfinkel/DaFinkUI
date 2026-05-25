import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

const OPTIONS = [
	{ value: 'apple',  label: 'Apple'  },
	{ value: 'banana', label: 'Banana' },
	{ value: 'cherry', label: 'Cherry' },
];

describe('Select', () =>
{
	it('renders placeholder when no value is set', () =>
	{
		render(<Select options={OPTIONS} placeholder='Pick one' />);
		expect(screen.getByRole('button')).toHaveTextContent('Pick one');
	});

	it('renders selected label when value matches an option', () =>
	{
		render(<Select options={OPTIONS} value='banana' />);
		expect(screen.getByRole('button')).toHaveTextContent('Banana');
	});

	it('renders a label element when label prop is provided', () =>
	{
		render(<Select options={OPTIONS} label='Fruit' />);
		expect(screen.getByText('Fruit')).toBeInTheDocument();
	});

	it('opens the listbox on trigger click', () =>
	{
		render(<Select options={OPTIONS} />);
		fireEvent.click(screen.getByRole('button'));
		expect(screen.getByRole('listbox')).toBeInTheDocument();
	});

	it('calls onChange with the selected value', () =>
	{
		const onChange = vi.fn();
		render(<Select options={OPTIONS} onChange={onChange} />);
		fireEvent.click(screen.getByRole('button'));
		fireEvent.pointerDown(screen.getByRole('option', { name: 'Cherry' }));
		expect(onChange).toHaveBeenCalledWith('cherry');
	});

	it('marks the selected option with aria-selected', () =>
	{
		render(<Select options={OPTIONS} value='apple' />);
		fireEvent.click(screen.getByRole('button'));
		const option = screen.getByRole('option', { name: /apple/i });
		expect(option).toHaveAttribute('aria-selected', 'true');
	});

	it('does not open when disabled', () =>
	{
		render(<Select options={OPTIONS} disabled />);
		fireEvent.click(screen.getByRole('button'));
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});

	it('renders error text and applies error border', () =>
	{
		render(<Select options={OPTIONS} error='Required field' />);
		expect(screen.getByText('Required field')).toBeInTheDocument();
		expect(screen.getByRole('button').className).toContain('border-danger');
	});

	it('renders hint text when no error', () =>
	{
		render(<Select options={OPTIONS} hint='Choose wisely' />);
		expect(screen.getByText('Choose wisely')).toBeInTheDocument();
	});

	it('trigger has correct aria attributes', () =>
	{
		render(<Select options={OPTIONS} />);
		const btn = screen.getByRole('button');
		expect(btn).toHaveAttribute('aria-haspopup', 'listbox');
		expect(btn).toHaveAttribute('aria-expanded', 'false');
	});

	it('trigger aria-expanded is true when open', () =>
	{
		render(<Select options={OPTIONS} />);
		fireEvent.click(screen.getByRole('button'));
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
	});
});
