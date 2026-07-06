import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Tree, { TreeItem } from './Tree';

const BasicTree = () => {
	return (
		<Tree>
			<TreeItem label='src' defaultOpen>
				<TreeItem label='components'>
					<TreeItem label='Button.tsx' />
					<TreeItem label='Input.tsx' />
				</TreeItem>
			</TreeItem>
			<TreeItem label='package.json' />
		</Tree>
	);
};

describe('Tree', () =>
{
	it('renders without errors', () =>
	{
		render(<BasicTree />);
		expect(screen.getByRole('tree')).toBeDefined();
	});

	it('displays label text', () =>
	{
		render(<BasicTree />);
		expect(screen.getByText('src')).toBeDefined();
		expect(screen.getByText('package.json')).toBeDefined();
	});

	it('shows children of open branch nodes', () =>
	{
		render(<BasicTree />);
		expect(screen.getByText('components')).toBeDefined();
	});

	it('hides children of closed branch nodes', () =>
	{
		render(
			<Tree>
				<TreeItem label='src'>
					<TreeItem label='hidden-child' />
				</TreeItem>
			</Tree>
		);
		const hiddenChild = screen.getByText('hidden-child');
		const group = hiddenChild.closest('[role="group"]') as HTMLElement;
		const wrapper = group?.parentElement as HTMLElement;
		expect(wrapper.style.gridTemplateRows).toBe('0fr');
	});

	it('toggles branch open and closed on click', () =>
	{
		render(
			<Tree>
				<TreeItem label='folder'>
					<TreeItem label='child-item' />
				</TreeItem>
			</Tree>
		);

		const folderItem = screen.getByText('folder').closest('[tabindex]') as HTMLElement;
		const group = screen.getByText('child-item').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;

		expect(wrapper.style.gridTemplateRows).toBe('0fr');
		fireEvent.click(folderItem);
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
		fireEvent.click(folderItem);
		expect(wrapper.style.gridTemplateRows).toBe('0fr');
	});

	it('does not toggle on click when disabled', () =>
	{
		render(
			<Tree>
				<TreeItem label='locked' disabled>
					<TreeItem label='locked-child' />
				</TreeItem>
			</Tree>
		);

		const group = screen.getByText('locked-child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;
		expect(wrapper.style.gridTemplateRows).toBe('0fr');

		const lockedRow = screen.getByText('locked').closest('[tabindex]') as HTMLElement;
		fireEvent.click(lockedRow);
		expect(wrapper.style.gridTemplateRows).toBe('0fr');
	});

	it('toggles branch with Enter key', () =>
	{
		render(
			<Tree>
				<TreeItem label='folder'>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);

		const folderRow = screen.getByText('folder').closest('[tabindex]') as HTMLElement;
		const group = screen.getByText('child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;

		expect(wrapper.style.gridTemplateRows).toBe('0fr');
		fireEvent.keyDown(folderRow, { key: 'Enter' });
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
	});

	it('toggles branch with Space key', () =>
	{
		render(
			<Tree>
				<TreeItem label='folder'>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);

		const folderRow = screen.getByText('folder').closest('[tabindex]') as HTMLElement;
		const group = screen.getByText('child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;

		fireEvent.keyDown(folderRow, { key: ' ' });
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
	});

	it('expands a closed branch with ArrowRight', () =>
	{
		render(
			<Tree>
				<TreeItem label='folder'>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);

		const folderRow = screen.getByText('folder').closest('[tabindex]') as HTMLElement;
		const group = screen.getByText('child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;

		fireEvent.keyDown(folderRow, { key: 'ArrowRight' });
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
	});

	it('collapses an open branch with ArrowLeft', () =>
	{
		render(
			<Tree>
				<TreeItem label='folder' defaultOpen>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);

		const folderRow = screen.getByText('folder').closest('[tabindex]') as HTMLElement;
		const group = screen.getByText('child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;

		expect(wrapper.style.gridTemplateRows).toBe('1fr');
		fireEvent.keyDown(folderRow, { key: 'ArrowLeft' });
		expect(wrapper.style.gridTemplateRows).toBe('0fr');
	});

	it('has role="tree" on the root element', () =>
	{
		render(<Tree><TreeItem label='item' /></Tree>);
		expect(screen.getByRole('tree')).toBeDefined();
	});

	it('has role="treeitem" on each item', () =>
	{
		render(
			<Tree>
				<TreeItem label='one' />
				<TreeItem label='two' />
			</Tree>
		);
		const items = screen.getAllByRole('treeitem');
		expect(items.length).toBe(2);
	});

	it('sets aria-expanded on branch nodes', () =>
	{
		render(
			<Tree>
				<TreeItem label='branch'>
					<TreeItem label='leaf' />
				</TreeItem>
			</Tree>
		);

		const branchItem = screen.getAllByRole('treeitem')[0];
		expect(branchItem.getAttribute('aria-expanded')).toBe('false');

		const branchRow = screen.getByText('branch').closest('[tabindex]') as HTMLElement;
		fireEvent.click(branchRow);
		expect(branchItem.getAttribute('aria-expanded')).toBe('true');
	});

	it('does not set aria-expanded on leaf nodes', () =>
	{
		render(<Tree><TreeItem label='leaf' /></Tree>);
		const leafItem = screen.getByRole('treeitem');
		expect(leafItem.getAttribute('aria-expanded')).toBeNull();
	});

	it('sets aria-disabled on disabled items', () =>
	{
		render(<Tree><TreeItem label='locked' disabled /></Tree>);
		const item = screen.getByRole('treeitem');
		expect(item.getAttribute('aria-disabled')).toBe('true');
	});

	it('renders children in a role="group" element', () =>
	{
		render(
			<Tree>
				<TreeItem label='parent' defaultOpen>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		expect(screen.getByRole('group')).toBeDefined();
	});

	it('renders custom icon when provided', () =>
	{
		render(
			<Tree>
				<TreeItem label='custom' icon={<span data-testid='custom-icon' />} />
			</Tree>
		);
		expect(screen.getByTestId('custom-icon')).toBeDefined();
	});

	it('accepts and applies className to items', () =>
	{
		render(
			<Tree>
				<TreeItem label='styled' className='my-custom-class' />
			</Tree>
		);
		const row = screen.getByText('styled').closest('.my-custom-class');
		expect(row).toBeDefined();
	});

	it('defaultOpen starts branch expanded', () =>
	{
		render(
			<Tree>
				<TreeItem label='open-folder' defaultOpen>
					<TreeItem label='visible-child' />
				</TreeItem>
			</Tree>
		);
		const group = screen.getByText('visible-child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
	});

	it('renders children of a collapsible={false} branch without defaultOpen', () =>
	{
		render(
			<Tree>
				<TreeItem label='always-open' collapsible={false}>
					<TreeItem label='always-visible-child' />
				</TreeItem>
			</Tree>
		);
		const group = screen.getByText('always-visible-child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
	});

	it('renders no chevron toggle for a collapsible={false} branch', () =>
	{
		render(
			<Tree>
				<TreeItem label='no-chevron' collapsible={false}>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		const row = screen.getByText('no-chevron').closest('[tabindex]') as HTMLElement;
		expect(row.querySelector('svg')).toBeNull();
	});

	it('does not collapse a collapsible={false} branch on click', () =>
	{
		render(
			<Tree>
				<TreeItem label='locked-open' collapsible={false}>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		const row = screen.getByText('locked-open').closest('[tabindex]') as HTMLElement;
		const group = screen.getByText('child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;

		fireEvent.click(row);
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
	});

	it('does not collapse a collapsible={false} branch on Enter', () =>
	{
		render(
			<Tree>
				<TreeItem label='locked-open' collapsible={false}>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		const row = screen.getByText('locked-open').closest('[tabindex]') as HTMLElement;
		const group = screen.getByText('child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;

		fireEvent.keyDown(row, { key: 'Enter' });
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
	});

	it('does not collapse a collapsible={false} branch on ArrowLeft', () =>
	{
		render(
			<Tree>
				<TreeItem label='locked-open' collapsible={false}>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		const row = screen.getByText('locked-open').closest('[tabindex]') as HTMLElement;
		const group = screen.getByText('child').closest('[role="group"]') as HTMLElement;
		const wrapper = group.parentElement as HTMLElement;

		fireEvent.keyDown(row, { key: 'ArrowLeft' });
		expect(wrapper.style.gridTemplateRows).toBe('1fr');
	});

	it('reports aria-expanded="true" on a collapsible={false} branch', () =>
	{
		render(
			<Tree>
				<TreeItem label='always-expanded' collapsible={false}>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		const branchItem = screen.getAllByRole('treeitem')[0];
		expect(branchItem.getAttribute('aria-expanded')).toBe('true');
	});

	it('sets tabIndex to -1 on a collapsible={false} branch', () =>
	{
		render(
			<Tree>
				<TreeItem label='inert-branch' collapsible={false}>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		const row = screen.getByText('inert-branch').closest('[tabindex]') as HTMLElement;
		expect(row.getAttribute('tabindex')).toBe('-1');
	});

	it('sets tabIndex to -1 on a collapsible={false} leaf', () =>
	{
		render(<Tree><TreeItem label='inert-leaf' collapsible={false} /></Tree>);
		const row = screen.getByText('inert-leaf').closest('[tabindex]') as HTMLElement;
		expect(row.getAttribute('tabindex')).toBe('-1');
	});

	it('does not apply hover, focus-visible, or active classes to a collapsible={false} item', () =>
	{
		render(<Tree><TreeItem label='no-affordance' collapsible={false} /></Tree>);
		const row = screen.getByText('no-affordance').closest('[tabindex]') as HTMLElement;
		expect(row.className).not.toContain('hover:bg-surface-hover');
		expect(row.className).not.toContain('focus-visible:ring-2');
		expect(row.className).not.toContain('active:bg-surface-active');
	});

	it('still applies hover and focus-visible classes to a default collapsible item', () =>
	{
		render(<Tree><TreeItem label='affordance' /></Tree>);
		const row = screen.getByText('affordance').closest('[tabindex]') as HTMLElement;
		expect(row.className).toContain('hover:bg-surface-hover');
		expect(row.className).toContain('focus-visible:ring-2');
	});

	it('excludes a collapsible={false} item from arrow-key roving focus', () =>
	{
		render(
			<Tree>
				<TreeItem label='first' />
				<TreeItem label='inert' collapsible={false} />
				<TreeItem label='last' />
			</Tree>
		);

		const first = screen.getByText('first').closest('[tabindex]') as HTMLElement;
		const last = screen.getByText('last').closest('[tabindex]') as HTMLElement;

		first.focus();
		fireEvent.keyDown(first, { key: 'ArrowDown' });
		expect(document.activeElement).toBe(last);
	});

	it('renders no icon on a leaf by default', () =>
	{
		render(<Tree><TreeItem label='plain-leaf' /></Tree>);
		const row = screen.getByText('plain-leaf').closest('[tabindex]') as HTMLElement;
		expect(row.querySelector('svg')).toBeNull();
	});

	it('renders terminalIcon on a leaf when Tree provides one', () =>
	{
		render(
			<Tree terminalIcon={<span data-testid='terminal-icon' />}>
				<TreeItem label='leaf' />
			</Tree>
		);
		expect(screen.getByTestId('terminal-icon')).toBeDefined();
	});

	it('renders nonTerminalIcon on a collapsible={false} branch when Tree provides one', () =>
	{
		render(
			<Tree nonTerminalIcon={<span data-testid='nonterminal-icon' />}>
				<TreeItem label='branch' collapsible={false}>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		expect(screen.getByTestId('nonterminal-icon')).toBeDefined();
	});

	it('renders no icon on a collapsible={false} branch when Tree has no nonTerminalIcon', () =>
	{
		render(
			<Tree>
				<TreeItem label='branch' collapsible={false}>
					<TreeItem label='child' />
				</TreeItem>
			</Tree>
		);
		const row = screen.getByText('branch').closest('[tabindex]') as HTMLElement;
		expect(row.querySelector('svg')).toBeNull();
	});

	it('per-item icon overrides both terminalIcon and nonTerminalIcon', () =>
	{
		render(
			<Tree terminalIcon={<span data-testid='terminal-icon' />} nonTerminalIcon={<span data-testid='nonterminal-icon' />}>
				<TreeItem label='leaf' icon={<span data-testid='item-icon' />} />
			</Tree>
		);
		expect(screen.getByTestId('item-icon')).toBeDefined();
		expect(screen.queryByTestId('terminal-icon')).toBeNull();
		expect(screen.queryByTestId('nonterminal-icon')).toBeNull();
	});
});
