import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, DownloadIcon, ItalicIcon, ListIcon, OrderedListIcon, QuoteIcon, RedoIcon, StrikeIcon, UnderlineIcon, UndoIcon } from './Icons';
import { CheckIcon, CloseIcon, MinusIcon, PlusIcon, SearchIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

const ICONS = { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, DownloadIcon, ItalicIcon, ListIcon, OrderedListIcon, QuoteIcon, RedoIcon, StrikeIcon, UnderlineIcon, UndoIcon, CheckIcon, CloseIcon, MinusIcon, PlusIcon, SearchIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon };

describe('Icons', () =>
{
	it.each(Object.entries(ICONS))('%s is decorative by default', (_name, Icon) =>
	{
		const { container } = render(<Icon />);
		const svg = container.querySelector('svg');

		expect(svg).toHaveAttribute('aria-hidden', 'true');
		expect(svg).toHaveAttribute('width', '16');
		expect(svg).toHaveAttribute('stroke', 'currentColor');
	});

	it('takes a size and stroke width', () =>
	{
		const { container } = render(<CheckIcon size={28} strokeWidth={2.5} />);
		const svg = container.querySelector('svg');

		expect(svg).toHaveAttribute('width', '28');
		expect(svg).toHaveAttribute('height', '28');
		expect(svg).toHaveAttribute('stroke-width', '2.5');
	});

	it('passes className through so callers can color and rotate it', () =>
	{
		const { container } = render(<ChevronDownIcon className='text-brand rotate-180' />);

		expect(container.querySelector('svg')).toHaveClass('text-brand', 'rotate-180');
	});

	it('can be given an accessible name by the caller', () =>
	{
		const { getByRole } = render(<SearchIcon role='img' aria-label='Search' aria-hidden={undefined} />);

		expect(getByRole('img', { name: 'Search' })).toBeInTheDocument();
	});
});
