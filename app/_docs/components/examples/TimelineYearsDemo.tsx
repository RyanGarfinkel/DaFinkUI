'use client';

import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';

const MILESTONES = [
	{ year: '2000', title: 'Company founded',   body: 'Started as a two-person design studio.' },
	{ year: '2004', title: 'First product',     body: 'Shipped our first component library, v1.'  },
	{ year: '2015', title: 'Series A',          body: 'Raised funding to grow the platform team.'  },
	{ year: '2020', title: 'Remote-first',      body: 'Moved to a fully distributed team.'         },
	{ year: '2026', title: 'DaFink UI launch',  body: 'Open-sourced our internal design system.'   },
];

export const TimelineYearsDemo = () => {
	return (
		<div className='w-full'>
			<Timeline>
				{MILESTONES.map((milestone) => (
					<TimelineItem key={milestone.year} title={milestone.title} indicator={milestone.year}>
						{milestone.body}
					</TimelineItem>
				))}
			</Timeline>
		</div>
	);
};
