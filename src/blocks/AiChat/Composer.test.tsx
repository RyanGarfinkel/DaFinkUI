import { render, screen, fireEvent } from '@testing-library/react';
import { Composer, type ComposerProps } from './Composer';
import { describe, it, expect, vi } from 'vitest';

const baseProps: ComposerProps = {
	draft:         'Plan the launch',
	onDraftChange: () => {},
	onSubmit:      (e) => e.preventDefault(),
	isGenerating:  false,
	onStop:        () => {},
	attachedFiles: [],
	onAttach:      () => {},
	commands:      [],
	onCommand:     () => {},
	placeholder:   'Message…',
	inputLabel:    'Message',
	sendLabel:     'Send message',
};

const setup = (props: Partial<ComposerProps> = {}) => {
	const merged = { ...baseProps, ...props };
	const view = render(<><Composer {...merged} /><button type='button'>Elsewhere</button></>);
	const rerender = (next: Partial<ComposerProps>) => view.rerender(<><Composer {...merged} {...next} /><button type='button'>Elsewhere</button></>);
	return { rerender, input: () => screen.getByRole('combobox') };
};

describe('Composer focus', () =>
{
	it('returns focus to the input when a reply finishes after sending', () =>
	{
		const { rerender, input } = setup();

		input().focus();
		fireEvent.submit(input().closest('form')!);
		rerender({ isGenerating: true });
		input().blur();
		rerender({ isGenerating: false });

		expect(input()).toHaveFocus();
	});

	it('does not take focus back if the user moved it elsewhere while waiting', () =>
	{
		const { rerender, input } = setup();

		input().focus();
		fireEvent.submit(input().closest('form')!);
		rerender({ isGenerating: true });
		screen.getByRole('button', { name: 'Elsewhere' }).focus();
		rerender({ isGenerating: false });

		expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
	});

	it('leaves focus alone when a reply was not started from the composer', () =>
	{
		const { rerender } = setup();

		screen.getByRole('button', { name: 'Elsewhere' }).focus();
		rerender({ isGenerating: true });
		rerender({ isGenerating: false });

		expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
	});

	it('does not claim focus for an empty submit', () =>
	{
		const { rerender, input } = setup({ draft: '' });

		input().focus();
		fireEvent.submit(input().closest('form')!);
		screen.getByRole('button', { name: 'Elsewhere' }).focus();
		rerender({ isGenerating: true });
		rerender({ isGenerating: false });

		expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
	});

	it('returns focus after the stop button ends a reply', () =>
	{
		const onStop = vi.fn();
		const { rerender, input } = setup({ onStop });

		input().focus();
		fireEvent.submit(input().closest('form')!);
		rerender({ isGenerating: true, onStop });
		screen.getByRole('button', { name: 'Stop generating' }).focus();
		screen.getByRole('button', { name: 'Stop generating' }).click();
		rerender({ isGenerating: false, onStop });

		expect(onStop).toHaveBeenCalled();
		expect(input()).toHaveFocus();
	});
});
