'use client';

import { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/src/components/Modal/Modal';
import { KanbanBoard, type KanbanCardDetailsRenderer } from '@/src/components/Kanban/Kanban';
import Mosaic, { MosaicTile, type MosaicTileLayout } from '@/src/components/Mosaic/Mosaic';
import { AreaChart, BarChart } from '@/src/components/Charts/Charts';
import Textarea from '@/src/components/Textarea/Textarea';
import CountUp from '@/src/components/CountUp/CountUp';
import { Badge } from '@/src/components/Badge/Badge';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import { useState } from 'react';

const REVENUE_TREND = [
	{ month: 'Jan', revenue: 32000 },
	{ month: 'Feb', revenue: 35500 },
	{ month: 'Mar', revenue: 34000 },
	{ month: 'Apr', revenue: 39800 },
	{ month: 'May', revenue: 41200 },
	{ month: 'Jun', revenue: 44000 },
	{ month: 'Jul', revenue: 45800 },
	{ month: 'Aug', revenue: 48500 },
];

const QUARTER_GROWTH = [
	{ quarter: 'Q1', growth: 18 },
	{ quarter: 'Q2', growth: 21 },
	{ quarter: 'Q3', growth: 24 },
];

const INITIAL_DASHBOARD_LAYOUT: MosaicTileLayout[] = [
	{ id: 'revenue', col: 1, row: 1, colSpan: 2, rowSpan: 1 },
	{ id: 'users',   col: 3, row: 1, colSpan: 1, rowSpan: 1 },
	{ id: 'chart',   col: 1, row: 2, colSpan: 3, rowSpan: 2 },
	{ id: 'growth',  col: 4, row: 1, colSpan: 1, rowSpan: 1 },
];

export const MosaicPreview = () => {
	const [layout, setLayout] = useState(INITIAL_DASHBOARD_LAYOUT);

	return (
		<Mosaic
			layout={layout}
			onLayoutChange={setLayout}
			cols={4}
			rowHeight={140}
			gap={12}
			className='w-full'
		>
			<MosaicTile id='revenue' minColSpan={1} maxColSpan={3} minRowSpan={1} maxRowSpan={1}>
				{({ colSpan }) => (
					<div className='h-full flex flex-col justify-between'>
						<span className='text-xs text-text-muted'>Revenue</span>
						{colSpan === 1 ? (
							<span className='text-2xl font-semibold text-text'>
								<CountUp value={48.5} decimals={1} prefix='$' suffix='k' />
							</span>
						) : (
							<div className='flex items-end justify-between'>
								<span className='text-3xl font-semibold text-text'>
									<CountUp value={48.5} decimals={1} prefix='$' suffix='k' />
								</span>
								<div className='flex flex-col items-end gap-1'>
									<Badge variant='success'>+12%</Badge>
									{colSpan >= 3 && (
										<span className='text-xs text-text-muted'>vs last month</span>
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</MosaicTile>

			<MosaicTile id='users' minColSpan={1} maxColSpan={1} minRowSpan={1} maxRowSpan={1}>
				<div className='h-full flex flex-col justify-between'>
					<span className='text-xs text-text-muted'>Active users</span>
					<div className='flex flex-col gap-1.5'>
						<span className='text-2xl font-semibold text-text'>
							<CountUp value={3204} separator=',' />
						</span>
						<Badge variant='success' className='w-fit'>+5.2%</Badge>
					</div>
				</div>
			</MosaicTile>

			<MosaicTile id='chart' minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={3}>
				{({ colSpan, rowSpan }) => (
					<div className='h-full flex flex-col gap-2'>
						<div className='flex items-center justify-between'>
							<span className='text-xs text-text-muted'>Revenue over time</span>
							{colSpan >= 3 && (
								<span className='text-xs text-text-subtle'>Last 8 months</span>
							)}
						</div>
						<AreaChart
							data={REVENUE_TREND}
							xKey='month'
							series={[{ key: 'revenue', label: 'Revenue' }]}
							height={Math.max(70, rowSpan * 140 + (rowSpan - 1) * 12 - 76)}
							showLegend={false}
							showGrid={rowSpan >= 2}
						/>
					</div>
				)}
			</MosaicTile>

			<MosaicTile id='growth' minColSpan={1} maxColSpan={2} minRowSpan={1} maxRowSpan={2}>
				{({ colSpan, rowSpan }) => (
					<div className='h-full flex flex-col justify-between gap-2'>
						<div className='flex flex-col gap-1'>
							<span className='text-xs text-text-muted'>Growth</span>
							<span className={`font-semibold text-brand ${rowSpan >= 2 ? 'text-5xl' : 'text-3xl'}`}>
								<CountUp value={24} prefix='+' suffix='%' />
							</span>
							{(rowSpan >= 2 || colSpan >= 2) && (
								<span className='text-xs text-text-muted'>Quarter over quarter</span>
							)}
						</div>
						{rowSpan >= 2 && (
							<BarChart
								data={QUARTER_GROWTH}
								xKey='quarter'
								series={[{ key: 'growth', label: 'QoQ growth' }]}
								height={90}
								showLegend={false}
								showGrid={false}
							/>
						)}
					</div>
				)}
			</MosaicTile>
		</Mosaic>
	);
};

const KANBAN_COLUMNS = [
	{
		id: 'todo',
		title: 'To Do',
		cards: [
			{ id: 'k1', title: 'Research competitors', tag: 'Research' },
			{ id: 'k2', title: 'Write spec', description: 'Define requirements for v2.' },
		],
	},
	{
		id: 'in-progress',
		title: 'In Progress',
		cards: [
			{ id: 'k3', title: 'Build prototype', tag: 'Engineering' },
			{ id: 'k4', title: 'Design review', description: 'Review mockups with the team.' },
		],
	},
	{
		id: 'done',
		title: 'Done',
		cards: [
			{ id: 'k5', title: 'Kick-off meeting', description: 'Align on goals and timeline.' },
		],
	},
];

// KanbanCard has no built-in form: you own everything shown here, down to which fields exist.
const CardDetails: KanbanCardDetailsRenderer = ({ card, onUpdate, onDelete, onClose }) => {
	const [title, setTitle] = useState(card.title);
	const [tag, setTag] = useState(card.tag ?? '');
	const [description, setDescription] = useState(card.description ?? '');

	return (
		<>
			<ModalClose />
			<ModalHeader>
				<ModalTitle>Edit card</ModalTitle>
			</ModalHeader>
			<ModalContent className='flex flex-col gap-4'>
				<Input label='Title' value={title} onChange={(e) => setTitle(e.target.value)} />
				<Input label='Tag' placeholder='Optional' value={tag} onChange={(e) => setTag(e.target.value)} />
				<Textarea label='Description' placeholder='Optional' rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
			</ModalContent>
			<ModalFooter>
				<Button variant='destructive' size='sm' className='mr-auto' onClick={() => onDelete(card.id)}>Delete</Button>
				<Button variant='secondary' size='sm' onClick={onClose}>Cancel</Button>
				<Button size='sm' onClick={() => onUpdate({ ...card, title, tag: tag || undefined, description: description || undefined })} disabled={!title.trim()}>Save</Button>
			</ModalFooter>
		</>
	);
};

export const KanbanBoardPreview = () => <KanbanBoard initialColumns={KANBAN_COLUMNS} renderCardDetails={CardDetails} />;
