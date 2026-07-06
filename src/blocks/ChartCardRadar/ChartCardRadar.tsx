'use client';

import { Card, CardContent, CardHeader } from '../../components/Card/Card';
import { RadarChart } from '../../components/Charts/Charts';
import CountUp from '../../components/CountUp/CountUp';
import Badge from '../../components/Badge/Badge';

const SKILL_DATA = [
	{ skill: 'Frontend', team: 88, target: 80 },
	{ skill: 'Backend',  team: 84, target: 80 },
	{ skill: 'Design',   team: 90, target: 75 },
	{ skill: 'Testing',  team: 68, target: 80 },
	{ skill: 'DevOps',   team: 78, target: 75 },
	{ skill: 'Docs',     team: 64, target: 70 },
];

const SKILL_SERIES = [
	{ key: 'team', label: 'Team' },
	{ key: 'target', label: 'Target' },
];

export const ChartCardRadar = () => {
	return (
		<Card className='max-w-sm w-full'>
			<CardHeader>
				<p className='text-xs text-text-muted'>Team skill coverage</p>
				<div className='flex items-baseline gap-2 mt-1'>
					<p className='text-2xl font-semibold text-text'>
						<CountUp value={79} suffix='%' duration={1400} />
					</p>
					<Badge variant='warning'>2 gaps</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<RadarChart data={SKILL_DATA} xKey='skill' series={SKILL_SERIES} height={200} />
			</CardContent>
		</Card>
	);
};

export default ChartCardRadar;
