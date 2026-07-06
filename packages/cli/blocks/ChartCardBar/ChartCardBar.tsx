'use client';

import { Card, CardContent, CardHeader } from '../../components/Card/Card';
import { BarChart } from '../../components/Charts/Charts';
import CountUp from '../../components/CountUp/CountUp';
import Badge from '../../components/Badge/Badge';

const PRODUCT_DATA = [
	{ product: 'Core',      revenue: 42500 },
	{ product: 'Analytics', revenue: 31200 },
	{ product: 'Sync',      revenue: 24800 },
	{ product: 'Mobile',    revenue: 18100 },
	{ product: 'API',       revenue: 12400 },
];

const TOTAL_REVENUE = PRODUCT_DATA.reduce((sum, p) => sum + p.revenue, 0);

export const ChartCardBar = () => {
	return (
		<Card className='max-w-sm w-full'>
			<CardHeader>
				<p className='text-xs text-text-muted'>Top products by revenue</p>
				<div className='flex items-baseline gap-2 mt-1'>
					<p className='text-2xl font-semibold text-text'>
						<CountUp value={TOTAL_REVENUE} prefix='$' separator=',' duration={1400} />
					</p>
					<Badge variant='success'>+8.2%</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<BarChart
					data={PRODUCT_DATA}
					xKey='product'
					series={[{ key: 'revenue', label: 'Revenue' }]}
					height={160}
					showLegend={false}
				/>
			</CardContent>
		</Card>
	);
};

export default ChartCardBar;
