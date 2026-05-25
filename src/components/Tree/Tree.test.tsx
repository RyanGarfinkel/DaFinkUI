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
});
