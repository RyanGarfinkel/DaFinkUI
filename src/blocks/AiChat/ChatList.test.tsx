import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ChatList, type ChatListProps } from './ChatList';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { ChatEntry } from './types';

const CHATS: ChatEntry[] = [
	{ id: '1', title: 'Budget review', messages: [], threadRefs: [] },
	{ id: '2', title: 'Launch plan', messages: [], threadRefs: [] },
];

const setup = (overrides: Partial<ChatListProps> = {}) => {
	const props: ChatListProps = {
		chats:           CHATS,
		status:          'ready',
		activeId:        '1',
		editingId:       null,
		onEditingChange: vi.fn(),
		onSelect:        vi.fn(),
		onRename:        vi.fn(),
		onDelete:        vi.fn(),
		...overrides,
	};

	render(<Sidebar><ChatList {...props} /></Sidebar>);
	return props;
};

describe('ChatList', () =>
{
	it('lists every chat as a button', () =>
	{
		setup();

		expect(screen.getByRole('button', { name: 'Budget review' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Launch plan' })).toBeInTheDocument();
	});

	it('names the rename and delete buttons after their chat', () =>
	{
		setup();

		expect(screen.getByRole('button', { name: 'Rename Launch plan' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Delete Launch plan' })).toBeInTheDocument();
	});

	it('selects a chat on click', async () =>
	{
		const props = setup();

		await userEvent.click(screen.getByRole('button', { name: 'Launch plan' }));

		expect(props.onSelect).toHaveBeenCalledWith('2');
	});

	it('asks to edit and to delete from the row buttons', async () =>
	{
		const props = setup();

		await userEvent.click(screen.getByRole('button', { name: 'Rename Launch plan' }));
		await userEvent.click(screen.getByRole('button', { name: 'Delete Budget review' }));

		expect(props.onEditingChange).toHaveBeenCalledWith('2');
		expect(props.onDelete).toHaveBeenCalledWith(CHATS[0]);
	});

	it('shows a labelled field with the current title while renaming', () =>
	{
		setup({ editingId: '1' });

		expect(screen.getByRole('textbox', { name: 'Chat title' })).toHaveValue('Budget review');
	});

	it('commits the trimmed title on Enter and leaves edit mode', async () =>
	{
		const props = setup({ editingId: '1' });
		const field = screen.getByRole('textbox', { name: 'Chat title' });

		await userEvent.clear(field);
		await userEvent.type(field, '  Q3 budget {Enter}');

		expect(props.onRename).toHaveBeenCalledWith('1', 'Q3 budget');
		expect(props.onEditingChange).toHaveBeenCalledWith(null);
	});

	it('cancels on Escape without renaming', async () =>
	{
		const props = setup({ editingId: '1' });

		await userEvent.type(screen.getByRole('textbox', { name: 'Chat title' }), 'x{Escape}');

		expect(props.onRename).not.toHaveBeenCalled();
		expect(props.onEditingChange).toHaveBeenCalledWith(null);
	});

	it('does not rename to an empty title', async () =>
	{
		const props = setup({ editingId: '1' });

		await userEvent.clear(screen.getByRole('textbox', { name: 'Chat title' }));
		await userEvent.keyboard('{Enter}');

		expect(props.onRename).not.toHaveBeenCalled();
	});

	it('explains an empty list and a failed load', () =>
	{
		setup({ chats: [], status: 'ready' });
		expect(screen.getByText('No chats yet.')).toBeInTheDocument();
	});

	it('reports a load failure in text', () =>
	{
		setup({ chats: [], status: 'error' });
		expect(screen.getByText(/Couldn’t load chats/)).toBeInTheDocument();
	});
});
