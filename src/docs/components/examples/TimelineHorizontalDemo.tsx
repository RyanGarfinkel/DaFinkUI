'use client';

import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';

const PHASES = [
	{ title: 'Discovery',   body: 'Research & requirements' },
	{ title: 'Design',      body: 'Wireframes & prototypes'  },
	{ title: 'Build',       body: 'Development & testing'    },
	{ title: 'Launch',      body: 'Deploy & monitor'         },
];

export const TimelineHorizontalDemo = () => {
	return (
		<div className='w-full'>
			<Timeline direction='horizontal'>
				{PHASES.map((phase) => (
					<TimelineItem key={phase.title} title={phase.title}>
						{phase.body}
					</TimelineItem>
				))}
			</Timeline>
		</div>
	);
};
