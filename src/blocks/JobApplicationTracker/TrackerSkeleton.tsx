import { Skeleton, SkeletonTableRow } from '../../components/Skeleton/Skeleton';
import { STAGES } from './ApplicationCard';

const CARDS_PER_COLUMN = [2, 2, 1, 1, 1];

const SkeletonApplicationCard = () => (
	<div className='flex flex-col gap-3 rounded-[var(--radius-md)] border-[length:var(--border-width)] border-surface-border bg-surface p-3'>
		<div className='flex items-start gap-2.5'>
			<Skeleton width='2rem' height='2rem' className='rounded-full' />
			<div className='flex flex-1 flex-col gap-1.5'>
				<Skeleton width='70%' height='0.875rem' />
				<Skeleton width='45%' height='0.75rem' />
			</div>
		</div>
		<Skeleton width='85%' height='0.75rem' />
	</div>
);

export interface TrackerSkeletonProps {
	view: 'board' | 'table';
}

export const TrackerSkeleton = ({ view }: TrackerSkeletonProps) => {
	if(view === 'table')
	{
		return (
			<div className='flex flex-col gap-4 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border p-4' aria-hidden='true'>
				<SkeletonTableRow columns={7} />
				{Array.from({ length: 6 }, (_, i) => (
					<SkeletonTableRow key={i} columns={7} />
				))}
			</div>
		);
	}

	return (
		<div className='flex gap-4 overflow-x-auto pb-2' aria-hidden='true'>
			{STAGES.map((stage, i) => (
				<div
					key={stage.id}
					className='flex flex-col gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-hover p-3 min-w-[240px] w-[240px]'
				>
					<div className='flex items-center justify-between px-1'>
						<h3 className='text-xs font-semibold text-text uppercase tracking-wide'>{stage.title}</h3>
						<Skeleton width='1.5rem' height='1rem' />
					</div>
					<div className='flex flex-col gap-2'>
						{Array.from({ length: CARDS_PER_COLUMN[i] ?? 1 }, (_, j) => (
							<SkeletonApplicationCard key={j} />
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default TrackerSkeleton;
