'use client';

import { Card, CardContent, CardHeader } from '../../components/Card/Card';
import { AreaChart } from '../../components/Charts/Charts';
import CountUp from '../../components/CountUp/CountUp';
import Badge from '../../components/Badge/Badge';

const MAU_DATA = [
	{ month: 'Jan', users: 18200 },
	{ month: 'Feb', users: 19100 },
	{ month: 'Mar', users: 20400 },
	{ month: 'Apr', users: 21800 },
	{ month: 'May', users: 23300 },
	{ month: 'Jun', users: 24800 },
];

export const ChartCard = () => {
	return (
		<Card className='max-w-sm w-full'>
			<CardHeader>
				<p className='text-xs text-text-muted'>Monthly active users</p>
				<div className='flex items-baseline gap-2 mt-1'>
					<p className='text-2xl font-semibold text-text'>
						<CountUp value={24800} separator=',' duration={1400} />
					</p>
					<Badge variant='success'>+12.4%</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<AreaChart
					data={MAU_DATA}
					xKey='month'
					series={[{ key: 'users', label: 'Monthly active users' }]}
					height={140}
					showLegend={false}
				/>
			</CardContent>
		</Card>
	);
};

export default ChartCard;
