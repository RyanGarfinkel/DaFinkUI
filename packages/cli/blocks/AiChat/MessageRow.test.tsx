import { ChatMessageRow, buildVersionNav, MessageActionsRow } from './MessageRow';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ChatTextMessage } from './types';

const noop = () => {};

const USER: ChatTextMessage = { id: 1, kind: 'message', sender: 'user', text: 'Plan the launch' };
const AI: ChatTextMessage = { id: 2, kind: 'message', sender: 'ai', text: 'Here is a plan.' };

const row = (message: ChatTextMessage) => render(<ChatMessageRow message={message} onStreamComplete={noop} onQuestionnaireAnswer={noop} />);

describe('ChatMessageRow', () =>
{
	it('tells screen readers who sent a message, not just by alignment', () =>
	{
		row(USER);

		expect(screen.getByText('You:')).toHaveClass('sr-only');
	});

	it('labels the assistant reply', () =>
	{
		row(AI);

		expect(screen.getByText('Assistant:')).toHaveClass('sr-only');
	});
});

describe('version navigation', () =>
{
	const versioned: ChatTextMessage = { ...AI, versions: ['one', 'two', 'three'], versionIndex: 1 };

	it('only exists when a message has more than one version', () =>
	{
		expect(buildVersionNav(AI, noop)).toBeUndefined();
		expect(buildVersionNav(versioned, noop)).toMatchObject({ index: 1, count: 3 });
	});

	it('announces the position in words in a polite status region', () =>
	{
		const versionNav = buildVersionNav(versioned, noop);
		render(<MessageActionsRow align='start' messageId={2} text='x' showReplyTrigger={false} onReply={noop} showEdit={false} onEdit={noop} showRefresh={false} regenerating={false} onRefresh={noop} versionNav={versionNav} />);

		expect(screen.getByRole('group', { name: 'Message versions' })).toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('Version 2 of 3');
	});

	it('steps through versions with named buttons', () =>
	{
		const onChange = vi.fn();
		const versionNav = buildVersionNav(versioned, onChange);
		render(<MessageActionsRow align='start' messageId={2} text='x' showReplyTrigger={false} onReply={noop} showEdit={false} onEdit={noop} showRefresh={false} regenerating={false} onRefresh={noop} versionNav={versionNav} />);

		screen.getByRole('button', { name: 'Next version' }).click();
		screen.getByRole('button', { name: 'Previous version' }).click();

		expect(onChange).toHaveBeenNthCalledWith(1, 2);
		expect(onChange).toHaveBeenNthCalledWith(2, 0);
	});
});
