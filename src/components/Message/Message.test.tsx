import { Message, MessageReaction, MessageReactions } from './Message';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('Message', () =>
{
	it('renders without errors', () =>
	{
		render(<Message>Hello there</Message>);
		expect(screen.getByText('Hello there')).toBeDefined();
	});

	it('applies received-variant classes by default', () =>
	{
		const { container } = render(<Message>Hi</Message>);
		const row    = container.firstElementChild as HTMLElement;
		const bubble = row.querySelector('.bg-surface-active') as HTMLElement;

		expect(row.className).toContain('flex-row');
		expect(row.className).not.toContain('flex-row-reverse');
		expect(bubble.className).toContain('rounded-bl-[var(--radius-sm)]');
	});

	it('applies sent-variant classes when variant="sent"', () =>
	{
		const { container } = render(<Message variant='sent'>Hi</Message>);
		const row    = container.firstElementChild as HTMLElement;
		const bubble = row.querySelector('.bg-brand') as HTMLElement;

		expect(row.className).toContain('flex-row-reverse');
		expect(bubble.className).toContain('rounded-br-[var(--radius-sm)]');
		expect(bubble.className).toContain('text-brand-fg');
	});

	it('renders an avatar node without disrupting bubble content', () =>
	{
		render(
			<Message avatar={<span data-testid='avatar'>AL</span>}>
				Message body
			</Message>
		);

		expect(screen.getByTestId('avatar')).toBeDefined();
		expect(screen.getByText('Message body')).toBeDefined();
	});

	it('does not render an avatar wrapper when avatar is omitted', () =>
	{
		const { container } = render(<Message>Hi</Message>);
		expect(container.querySelector('[data-testid="avatar"]')).toBeNull();
	});

	it('positions MessageReactions absolutely so it does not shift bubble content', () =>
	{
		const { container } = render(
			<Message>
				Body text
				<MessageReactions>
					<MessageReaction icon='👍' count={2} onClick={() => {}} />
				</MessageReactions>
			</Message>
		);

		const bubble          = container.querySelector('.bg-surface-active') as HTMLElement;
		const reactionsWrapper = screen.getByRole('group').parentElement as HTMLElement;

		expect(bubble.textContent).toBe('Body text');
		expect(reactionsWrapper.className).toContain('absolute');
		expect(reactionsWrapper.className).toContain('-bottom-3');
	});

	it('anchors reactions to the inner edge of the bubble based on variant', () =>
	{
		const reactions = (
			<MessageReactions>
				<MessageReaction icon='👍' count={1} onClick={() => {}} />
			</MessageReactions>
		);

		const { container: receivedContainer } = render(<Message>Hi{reactions}</Message>);
		const receivedWrapper = receivedContainer.querySelector('.absolute.-bottom-3') as HTMLElement;
		expect(receivedWrapper.className).toContain('right-3');

		const { container: sentContainer } = render(<Message variant='sent'>Hi{reactions}</Message>);
		const sentWrapper = sentContainer.querySelector('.absolute.-bottom-3') as HTMLElement;
		expect(sentWrapper.className).toContain('left-3');
	});

	it('forwards native div props such as data-testid', () =>
	{
		render(<Message data-testid='msg-root'>Hi</Message>);
		expect(screen.getByTestId('msg-root')).toBeDefined();
	});

	it('merges a custom className onto the root row', () =>
	{
		const { container } = render(<Message className='custom-msg'>Hi</Message>);
		expect((container.firstElementChild as HTMLElement).className).toContain('custom-msg');
	});
});

describe('MessageReactions', () =>
{
	it('renders as a labeled group', () =>
	{
		render(
			<MessageReactions>
				<MessageReaction icon='👍' count={1} onClick={() => {}} />
			</MessageReactions>
		);

		const group = screen.getByRole('group');
		expect(group.getAttribute('aria-label')).toBe('Reactions');
	});

	it('accepts a custom aria-label for non-chat use cases like citations', () =>
	{
		render(
			<MessageReactions aria-label='Sources'>
				<MessageReaction label='1' href='https://example.com' />
			</MessageReactions>
		);

		expect(screen.getByRole('group').getAttribute('aria-label')).toBe('Sources');
	});

	it('renders multiple reaction chips grouped together', () =>
	{
		render(
			<MessageReactions>
				<MessageReaction icon='👍' count={3} onClick={() => {}} />
				<MessageReaction icon='❤️' count={1} onClick={() => {}} />
			</MessageReactions>
		);

		expect(screen.getAllByRole('button')).toHaveLength(2);
	});

	it('renders every chip and no overflow indicator when max is not exceeded', () =>
	{
		render(
			<MessageReactions max={3}>
				<MessageReaction icon='👍' count={3} onClick={() => {}} />
				<MessageReaction icon='❤️' count={1} onClick={() => {}} />
			</MessageReactions>
		);

		expect(screen.getAllByRole('button')).toHaveLength(2);
		expect(screen.queryByRole('img', { name: /more reaction/ })).toBeNull();
	});

	it('collapses chips beyond max into a "+N" overflow indicator, like AvatarGroup', () =>
	{
		render(
			<MessageReactions max={2}>
				<MessageReaction icon='👍' count={3} onClick={() => {}} />
				<MessageReaction icon='❤️' count={1} onClick={() => {}} />
				<MessageReaction icon='😂' count={2} onClick={() => {}} />
				<MessageReaction icon='🎉' count={1} onClick={() => {}} />
			</MessageReactions>
		);

		expect(screen.getAllByRole('button')).toHaveLength(2);
		const overflow = screen.getByRole('img', { name: '2 more reactions' });
		expect(overflow.textContent).toBe('+2');
	});

	it('uses singular wording for a single overflow chip', () =>
	{
		render(
			<MessageReactions max={2}>
				<MessageReaction icon='👍' count={3} onClick={() => {}} />
				<MessageReaction icon='❤️' count={1} onClick={() => {}} />
				<MessageReaction icon='😂' count={2} onClick={() => {}} />
			</MessageReactions>
		);

		expect(screen.getByRole('img', { name: '1 more reaction' })).toBeTruthy();
	});

	it('overlaps visible chips into a stack with a ring separator when grouped, instead of a wrapped gap row', () =>
	{
		const { container } = render(
			<MessageReactions max={2}>
				<MessageReaction icon='👍' count={3} onClick={() => {}} />
				<MessageReaction icon='❤️' count={1} onClick={() => {}} />
				<MessageReaction icon='😂' count={2} onClick={() => {}} />
			</MessageReactions>
		);

		const group = screen.getByRole('group');
		expect(group.className).toContain('-space-x-2');
		expect(group.className).not.toContain('gap-2');

		const buttons = container.querySelectorAll('button');
		buttons.forEach(button => expect(button.className).toContain('ring-2 ring-surface'));
	});
});

describe('MessageReaction', () =>
{
	it('renders a real button when onClick is provided (no href)', () =>
	{
		render(<MessageReaction icon='👍' count={3} onClick={() => {}} />);
		const button = screen.getByRole('button');
		expect(button.tagName).toBe('BUTTON');
		expect(button.getAttribute('type')).toBe('button');
	});

	it('renders a real link when href is provided', () =>
	{
		render(<MessageReaction label='1' href='https://example.com/source' />);
		const link = screen.getByRole('link');
		expect(link.tagName).toBe('A');
		expect(link.getAttribute('href')).toBe('https://example.com/source');
	});

	it('builds an accessible name communicating the emoji and count, not just the glyph', () =>
	{
		render(<MessageReaction icon='👍' count={3} onClick={() => {}} />);
		const button = screen.getByRole('button');
		expect(button.getAttribute('aria-label')).toBe('👍 3 reactions');
	});

	it('includes "including yours" in the accessible name when active', () =>
	{
		render(<MessageReaction icon='👍' count={3} active onClick={() => {}} />);
		const button = screen.getByRole('button');
		expect(button.getAttribute('aria-label')).toBe('👍 3 reactions, including yours');
	});

	it('uses singular "reaction" when count is 1', () =>
	{
		render(<MessageReaction icon='👍' count={1} onClick={() => {}} />);
		expect(screen.getByRole('button').getAttribute('aria-label')).toBe('👍 1 reaction');
	});

	it('respects an explicit aria-label override', () =>
	{
		render(<MessageReaction icon='👍' count={3} aria-label='Custom label' onClick={() => {}} />);
		expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Custom label');
	});

	it('communicates the active/"yours" state with more than color — a checkmark and border change', () =>
	{
		const { container, rerender } = render(<MessageReaction icon='👍' count={2} onClick={() => {}} />);
		const inactiveButton = screen.getByRole('button');
		expect(inactiveButton.className).not.toContain('bg-brand');
		expect(container.querySelector('svg')).toBeNull();

		rerender(<MessageReaction icon='👍' count={2} active onClick={() => {}} />);
		const activeButton = screen.getByRole('button');
		expect(activeButton.className).toContain('border-brand');
		expect(activeButton.className).toContain('bg-brand');
		expect(container.querySelector('svg')).not.toBeNull();
	});

	it('hides the decorative icon and count text from the accessibility tree when an aria-label is computed', () =>
	{
		render(<MessageReaction icon='👍' count={3} onClick={() => {}} />);
		const button = screen.getByRole('button');
		const spans  = button.querySelectorAll('span[aria-hidden="true"]');
		expect(spans.length).toBeGreaterThan(0);
	});

	it('keeps visible label text in the accessibility tree for non-count citation chips', () =>
	{
		render(<MessageReaction label='1' href='https://example.com' />);
		const link = screen.getByRole('link');
		expect(link.querySelector('span[aria-hidden="true"]')).toBeNull();
		expect(link.textContent).toBe('1');
	});

	it('applies focus-visible ring classes for keyboard accessibility', () =>
	{
		render(<MessageReaction icon='👍' count={1} onClick={() => {}} />);
		const button = screen.getByRole('button');
		expect(button.className).toContain('focus-visible:ring-2');
		expect(button.className).toContain('focus-visible:ring-offset-2');
		expect(button.className).toContain('focus:outline-none');
	});

	it('applies hover classes distinct from the default state', () =>
	{
		render(<MessageReaction icon='👍' count={1} onClick={() => {}} />);
		const button = screen.getByRole('button');
		expect(button.className).toContain('hover:bg-surface-hover');
	});

	it('shows a disabled state without hover or focus affordances firing', () =>
	{
		render(<MessageReaction icon='👍' count={1} onClick={() => {}} disabled />);
		const button = screen.getByRole('button') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
		expect(button.className).toContain('disabled:pointer-events-none');
		expect(button.className).toContain('disabled:opacity-40');
	});

	it('calls the forwarded onClick handler when activated', async () =>
	{
		const user    = userEvent.setup();
		const handler = vi.fn();

		render(<MessageReaction icon='👍' count={1} onClick={handler} />);
		await user.click(screen.getByRole('button'));

		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('is keyboard-activatable with Enter and Space', async () =>
	{
		const user    = userEvent.setup();
		const handler = vi.fn();

		render(<MessageReaction icon='👍' count={1} onClick={handler} />);
		await user.tab();
		expect(screen.getByRole('button')).toHaveFocus();

		await user.keyboard('{Enter}');
		expect(handler).toHaveBeenCalledTimes(1);

		await user.keyboard(' ');
		expect(handler).toHaveBeenCalledTimes(2);
	});

	it('forwards target and rel for citation links', () =>
	{
		render(<MessageReaction label='1' href='https://example.com' target='_blank' rel='noopener noreferrer' />);
		const link = screen.getByRole('link');
		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('renders the visible label or count text next to the icon', () =>
	{
		render(<MessageReaction icon='👍' count={5} onClick={() => {}} />);
		expect(screen.getByText('5')).toBeDefined();
	});
});
