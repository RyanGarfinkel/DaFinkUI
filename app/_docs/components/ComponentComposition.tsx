'use client';

import Tree, { TreeItem } from '@/src/components/Tree/Tree';
import type { CompositionNode } from '@/app/_docs/registry';
import type { ReactElement } from 'react';

interface ComponentCompositionProps {
	composition: CompositionNode;
}

const renderLabel = (node: CompositionNode, isBranch: boolean) => {
	return (
		<span className='truncate font-mono'>
			{'<'}{node.name}{isBranch ? '' : ' /'}{'>'}
			{node.description && (
				<span className='ml-2 text-text-subtle'>{`/* ${node.description} */`}</span>
			)}
		</span>
	);
};

const renderClosingTag = (name: string) => (
	<TreeItem
		key={`${name}-close`}
		label={<span className='truncate font-mono'>{'</'}{name}{'>'}</span>}
		collapsible={false}
	/>
);

// Returns [opening, closing] as siblings — not [opening[closing as a child]] —
// so a branch's closing tag sits at the same depth as its own opening tag,
// the way a real closing tag lines up under its opener rather than its children.
const renderNode = (node: CompositionNode): ReactElement[] => {
	const children = node.children?.length ? node.children : undefined;

	const opening = (
		<TreeItem key={node.name} label={renderLabel(node, Boolean(children))} collapsible={false}>
			{children?.flatMap(renderNode)}
		</TreeItem>
	);

	return children ? [opening, renderClosingTag(node.name)] : [opening];
};

export const ComponentComposition = ({ composition }: ComponentCompositionProps) => {
	return (
		<Tree selectable>
			{renderNode(composition)}
		</Tree>
	);
};
