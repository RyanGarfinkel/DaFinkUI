'use client';

import Mosaic, { MosaicTile, type MosaicTileLayout } from '../../components/Mosaic/Mosaic';
import DataTable, { type ColumnDef } from '../../components/DataTable/DataTable';
import { DropdownMenu } from '../../components/DropdownMenu/DropdownMenu';
import Badge, { type BadgeVariant } from '../../components/Badge/Badge';
import { AreaChart, RadarChart } from '../../components/Charts/Charts';
import CountUp from '../../components/CountUp/CountUp';
import Avatar from '../../components/Avatar/Avatar';
import { useState } from 'react';

interface ActivityRow
{
	id:     number;
	user:   string;
	action: string;
	status: string;
	time:   string;
}

const ACTIVITY_DATA: ActivityRow[] = [
	{ id: 1, user: 'Alex Kim',    action: 'Deployed to production', status: 'success', time: '2m ago'  },
	{ id: 2, user: 'Sam Chen',    action: 'Merged pull request',    status: 'success', time: '18m ago' },
	{ id: 3, user: 'Jordan Park', action: 'Build failed',           status: 'danger',  time: '42m ago' },
	{ id: 4, user: 'Riley Yu',    action: 'Tests passed',           status: 'success', time: '1h ago'  },
	{ id: 5, user: 'Morgan Lee',  action: 'Deploy queued',          status: 'warning', time: '2h ago'  },
];

const AREA_DATA = [
	{ month: 'Jan', revenue: 12400, users: 3200 },
	{ month: 'Feb', revenue: 18200, users: 4100 },
	{ month: 'Mar', revenue: 15800, users: 3800 },
	{ month: 'Apr', revenue: 22100, users: 5200 },
	{ month: 'May', revenue: 19600, users: 4700 },
	{ month: 'Jun', revenue: 26800, users: 6100 },
];

const RADAR_DATA = [
	{ metric: 'Revenue',    thisPeriod: 88, lastPeriod: 74 },
	{ metric: 'Users',      thisPeriod: 82, lastPeriod: 70 },
	{ metric: 'Conversion', thisPeriod: 68, lastPeriod: 60 },
	{ metric: 'Retention',  thisPeriod: 75, lastPeriod: 71 },
	{ metric: 'Engagement', thisPeriod: 90, lastPeriod: 78 },
	{ metric: 'Support',    thisPeriod: 65, lastPeriod: 68 },
];

const RADAR_SERIES = [
	{ key: 'thisPeriod', label: 'This period' },
	{ key: 'lastPeriod', label: 'Last period'  },
];

const STATS = [
	{ id: 'revenue',    label: 'Revenue',      num: 114.9, prefix: '$', suffix: 'k', decimals: 1, delta: '+18%',  variant: 'success' as BadgeVariant },
	{ id: 'users',      label: 'Active users', num: 27.1,  prefix: '',  suffix: 'k', decimals: 1, delta: '+12%',  variant: 'success' as BadgeVariant },
	{ id: 'conversion', label: 'Conversion',   num: 3.4,   prefix: '',  suffix: '%', decimals: 1, delta: '+0.6%', variant: 'success' as BadgeVariant },
	{ id: 'session',    label: 'Avg session',  num: 4.2,   prefix: '',  suffix: 'm', decimals: 1, delta: '−3%',   variant: 'danger'  as BadgeVariant },
];

const ACTIVITY_COLUMNS: ColumnDef<ActivityRow>[] = [
	{
		key:    'user',
		header: 'Team member',
		render: (v) => (
			<div className='flex items-center gap-2'>
				<Avatar name={v as string} size='sm' />
				<span className='text-sm text-text'>{v as string}</span>
			</div>
		),
	},
	{ key: 'action', header: 'Action' },
	{
		key:    'status',
		header: 'Status',
		render: (v) => <Badge variant={v as BadgeVariant}>{v as string}</Badge>,
	},
	{ key: 'time', header: 'Time' },
];

const PERIODS = ['Last 7 days', 'Last 30 days', 'Last 90 days'];

const ROW_HEIGHT = 140;
const GAP        = 12;

const INITIAL_LAYOUT: MosaicTileLayout[] = [
	{ id: 'revenue',    col: 1, row: 1, colSpan: 1, rowSpan: 1 },
	{ id: 'users',      col: 2, row: 1, colSpan: 1, rowSpan: 1 },
	{ id: 'conversion', col: 3, row: 1, colSpan: 1, rowSpan: 1 },
	{ id: 'session',    col: 4, row: 1, colSpan: 1, rowSpan: 1 },
	{ id: 'chart',      col: 1, row: 2, colSpan: 2, rowSpan: 2 },
	{ id: 'radar',      col: 3, row: 2, colSpan: 2, rowSpan: 2 },
	{ id: 'activity',   col: 1, row: 4, colSpan: 4, rowSpan: 2 },
];

export const Dashboard = () => {
	const [period, setPeriod] = useState('Last 30 days');
	const [layout, setLayout] = useState<MosaicTileLayout[]>(INITIAL_LAYOUT);

	return (
		<div className='flex flex-col gap-5 w-full'>
			<div className='flex items-center justify-between'>
				<h2 className='text-lg font-semibold text-text'>Team activity</h2>
				<DropdownMenu
					items={PERIODS.map((label) => ({ label, onSelect: () => setPeriod(label) }))}
					trigger={period}
				/>
			</div>

			<Mosaic
				layout={layout}
				onLayoutChange={setLayout}
				cols={4}
				rowHeight={ROW_HEIGHT}
				gap={GAP}
				className='w-full'
			>
				{STATS.map((s) => (
					<MosaicTile key={s.id} id={s.id} minColSpan={1} maxColSpan={2} minRowSpan={1} maxRowSpan={2}>
						<div className='h-full flex flex-col justify-between'>
							<span className='text-xs text-text-muted'>{s.label}</span>
							<div className='flex flex-col gap-1.5'>
								<span className='text-2xl font-semibold text-text'>
									<CountUp value={s.num} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} duration={1400} separator=',' />
								</span>
								<Badge variant={s.variant} className='w-fit'>{s.delta}</Badge>
							</div>
						</div>
					</MosaicTile>
				))}

				<MosaicTile id='chart' minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={3}>
					{({ rowSpan }) => (
						<div className='h-full flex flex-col gap-2'>
							<div className='flex items-center justify-between'>
								<span className='text-xs text-text-muted'>Revenue vs users</span>
								<span className='text-xs text-text-subtle'>{period}</span>
							</div>
							<AreaChart
								data={AREA_DATA}
								xKey='month'
								series={[
									{ key: 'revenue', label: 'Revenue' },
									{ key: 'users',   label: 'Users'   },
								]}
								height={Math.max(70, rowSpan * ROW_HEIGHT + (rowSpan - 1) * GAP - 76)}
							/>
						</div>
					)}
				</MosaicTile>

				<MosaicTile id='radar' minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={3}>
					{({ rowSpan }) => (
						<div className='h-full flex flex-col gap-2'>
							<span className='text-xs text-text-muted'>This period vs last period</span>
							<RadarChart
								data={RADAR_DATA}
								xKey='metric'
								series={RADAR_SERIES}
								height={Math.max(70, rowSpan * ROW_HEIGHT + (rowSpan - 1) * GAP - 76)}
							/>
						</div>
					)}
				</MosaicTile>

				<MosaicTile id='activity' minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={4}>
					<div className='h-full flex flex-col gap-2'>
						<span className='text-xs text-text-muted'>Recent activity</span>
						<DataTable data={ACTIVITY_DATA} columns={ACTIVITY_COLUMNS} keyField='id' pageSize={5} />
					</div>
				</MosaicTile>
			</Mosaic>
		</div>
	);
};

export default Dashboard;
