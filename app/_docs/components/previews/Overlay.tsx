'use client';

import ToolCallTrace, { type ToolCallEntry, type ToolCallLink } from '@/src/components/ToolCallTrace/ToolCallTrace';
import Accordion, { AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/Accordion/Accordion';
import Collapsible, { CollapsibleTrigger, CollapsibleContent } from '@/src/components/Collapsible/Collapsible';
import { CommandPalette, CommandGroup, CommandItem } from '@/src/components/CommandPalette/CommandPalette';
import { ContextMenu } from '@/src/components/ContextMenu/ContextMenu';
import { Message } from '@/src/components/Message/Message';
import Popover from '@/src/components/Popover/Popover';
import Tooltip from '@/src/components/Tooltip/Tooltip';
import Button from '@/src/components/Button/Button';
import Menu from '@/src/components/Menu/Menu';
import { useState } from 'react';

export const CollapsiblePreview = () => (
	<div className='w-full max-w-sm rounded-lg border border-surface-border px-4'>
		<Collapsible>
			<CollapsibleTrigger>Project details</CollapsibleTrigger>
			<CollapsibleContent>
				This project uses React 18, Tailwind v4, and Next.js 15. Components are
				copied directly into your repo, no runtime dependency required.
			</CollapsibleContent>
		</Collapsible>
	</div>
);

export const AccordionPreview = () => (
	<div className='w-full max-w-sm'>
		<Accordion type='single' collapsible defaultValue='item-1'>
			<AccordionItem value='item-1'>
				<AccordionTrigger>What is DaFink UI?</AccordionTrigger>
				<AccordionContent>
					A React component library you install source into, not a runtime package.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-2'>
				<AccordionTrigger>How do I install a component?</AccordionTrigger>
				<AccordionContent>
					Run <code className='font-mono text-xs'>npx dafink-ui add button</code> and the component is copied into your project.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value='item-3'>
				<AccordionTrigger>Do I need to install all components at once?</AccordionTrigger>
				<AccordionContent>
					No, each component is installed individually. Install only what your project needs.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	</div>
);

const SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'Installation — DaFink UI Docs', url: 'https://ui.ryangarfinkel.dev/installation' },
	{ title: 'dafink-ui — npm', url: 'https://www.npmjs.com/package/dafink-ui' },
	{ title: 'DaFink UI CLI source — GitHub', url: 'https://github.com/RyanGarfinkel/DaFinkUI/tree/main/packages/cli' },
];

const TOOL_CALLS: ToolCallEntry[] = [
	{ id: 't1', kind: 'thought', title: 'Thinking', detail: 'The user wants the install command — check the CLI docs for the exact syntax before answering.' },
	{ id: 't2', kind: 'search', title: 'Web search', detail: '"dafink-ui cli install command"', links: SEARCH_LINKS },
	{ id: 't3', kind: 'tool', title: 'Read file', detail: 'packages/cli/src/commands/add.ts', result: 'Found the add command implementation' },
];

export const ToolCallTracePreview = () => (
	<div className='flex w-full max-w-md flex-col gap-1.5'>
		<ToolCallTrace toolCalls={TOOL_CALLS} />
		<Message variant='received' bubble={false}>
			Run npx dafink-ui add button in your project root; it copies the component source straight into your repo.
		</Message>
	</div>
);

export const CommandPalettePreview = () => {
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<div className='flex flex-col items-center gap-4'>
			<Button onClick={() => setOpen(true)}>
				Open Command Palette
			</Button>
			<p className='text-xs text-text-muted'>Press Esc to close</p>
			<CommandPalette open={open} onClose={close} placeholder='Search commands…'>
				<CommandGroup label='Navigation'>
					<CommandItem value='Dashboard' onSelect={close} shortcut='G D'>Dashboard</CommandItem>
					<CommandItem value='Settings' onSelect={close} shortcut='G S'>Settings</CommandItem>
					<CommandItem value='Profile' onSelect={close}>Profile</CommandItem>
				</CommandGroup>
				<CommandGroup label='Actions'>
					<CommandItem value='New document' onSelect={close} shortcut='⌘N'>New document</CommandItem>
					<CommandItem value='Export PDF' onSelect={close}>Export as PDF</CommandItem>
					<CommandItem value='Invite team member' onSelect={close}>Invite team member</CommandItem>
				</CommandGroup>
				<CommandGroup label='Disabled'>
					<CommandItem value='Admin panel' onSelect={close} disabled>Admin panel</CommandItem>
				</CommandGroup>
			</CommandPalette>
		</div>
	);
};

export const TooltipPreview = () => (
	<div className='flex flex-wrap items-center gap-4'>
		<Tooltip content='Appears above' side='top'>
			<Button variant='secondary'>Top</Button>
		</Tooltip>
		<Tooltip content='Appears below' side='bottom'>
			<Button variant='secondary'>Bottom</Button>
		</Tooltip>
		<Tooltip content='Appears left' side='left'>
			<Button variant='secondary'>Left</Button>
		</Tooltip>
		<Tooltip content='Appears right' side='right'>
			<Button variant='secondary'>Right</Button>
		</Tooltip>
		<Tooltip content='Opens instantly' delay={0}>
			<Button variant='secondary'>No delay</Button>
		</Tooltip>
	</div>
);

export const PopoverPreview = () => (
	<Popover trigger='Open popover' label='Share settings' side='bottom' align='center'>
		<div className='flex flex-col gap-2'>
			<p className='text-sm font-medium text-text'>Share this page</p>
			<p className='text-xs text-text-muted'>Anyone with the link can view.</p>
			<button className='self-start rounded-md bg-brand px-3 py-1.5 text-xs text-brand-fg hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'>
				Copy link
			</button>
		</div>
	</Popover>
);

export const MenuPreview = () => (
	<Menu
		trigger='Actions'
		items={[
			{ label: 'Edit',      onSelect: () => console.log('edit')      },
			{ label: 'Duplicate', onSelect: () => console.log('duplicate') },
			{
				label: 'Share',
				submenu: [
					{ label: 'Copy link', onSelect: () => console.log('copy link') },
					{ label: 'Email',     onSelect: () => console.log('email')     },
				],
			},
			{ separator: true },
			{ label: 'Archive', disabled: true },
			{ label: 'Delete',    onSelect: () => console.log('delete')    },
		]}
	/>
);

export const ContextMenuPreview = () => {
	const [action, setAction] = useState('none');

	return (
		<div className='flex flex-col items-center gap-3'>
			<ContextMenu
				label='File actions'
				items={[
					{ label: 'Open', onSelect: () => setAction('Open') },
					{ label: 'Rename', onSelect: () => setAction('Rename') },
					{ label: 'Duplicate', onSelect: () => setAction('Duplicate') },
					{ separator: true },
					{ label: 'Delete', onSelect: () => setAction('Delete') },
				]}
			>
				<button
					type='button'
					className='flex h-32 w-64 items-center justify-center rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-dashed border-input-border text-sm text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
				>
					Right-click, or focus and press Shift+F10
				</button>
			</ContextMenu>
			<p className='text-sm text-text-muted'>Last action: {action}</p>
		</div>
	);
};
