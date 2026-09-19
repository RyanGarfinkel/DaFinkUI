'use client';

import KanbanBoard, { type KanbanCardFaceRenderer, type KanbanCardDetailsRenderer } from '@/src/components/Kanban/Kanban';
import { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/src/components/Modal/Modal';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import { useState } from 'react';

const ChevronRightIcon = () => (
	<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='m9 6 6 6-6 6' />
	</svg>
);

const TAG_ACCENTS: Record<string, string> = {
	Engineering: 'bg-brand',
	Design:      'bg-warning',
	Research:    'bg-success',
};

const renderCard: KanbanCardFaceRenderer = ({ card, onViewDetails }) => (
	<div className='flex items-center gap-2.5'>
		<span className={`h-2.5 w-2.5 shrink-0 rounded-full ${card.tag ? TAG_ACCENTS[card.tag] ?? 'bg-text-subtle' : 'bg-text-subtle'}`} aria-hidden='true' />
		<span className='min-w-0 flex-1 truncate text-sm font-medium text-text'>{card.title}</span>
		<button
			type='button'
			aria-label={`View details for ${card.title}`}
			onPointerDown={(e) => e.stopPropagation()}
			onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
			className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-subtle transition-colors duration-[var(--duration-fast)] hover:bg-surface-active hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
		>
			<ChevronRightIcon />
		</button>
	</div>
);

const CardDetails: KanbanCardDetailsRenderer = ({ card, onClose, onUpdate }) => {
	const [title, setTitle] = useState(card.title);

	return (
		<>
			<ModalClose />
			<ModalHeader>
				<ModalTitle>Edit card</ModalTitle>
			</ModalHeader>
			<ModalContent>
				<Input label='Title' value={title} onChange={(e) => setTitle(e.target.value)} />
			</ModalContent>
			<ModalFooter>
				<Button variant='secondary' size='sm' onClick={onClose}>Cancel</Button>
				<Button size='sm' onClick={() => onUpdate({ ...card, title })} disabled={!title.trim()}>Save</Button>
			</ModalFooter>
		</>
	);
};

const columns = [
	{
		id:    'backlog',
		title: 'Backlog',
		cards: [
			{ id: 'compact-1', title: 'Set up CI pipeline', tag: 'Engineering' },
			{ id: 'compact-2', title: 'Draft onboarding copy', tag: 'Design' },
		],
	},
	{
		id:    'active',
		title: 'Active',
		cards: [
			{ id: 'compact-3', title: 'Survey churned users', tag: 'Research' },
		],
	},
	{
		id:    'shipped',
		title: 'Shipped',
		cards: [
			{ id: 'compact-4', title: 'Launch referral program', tag: 'Engineering' },
		],
	},
];

export const KanbanCustomFaceDemo = () => (
	<KanbanBoard initialColumns={columns} renderCard={renderCard} renderCardDetails={CardDetails} />
);
