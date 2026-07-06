import { WorkflowBuilderShowcase } from '@/app/_docs/components/examples/WorkflowBuilderShowcase';
import { TimelineHorizontalDemo } from '@/app/_docs/components/examples/TimelineHorizontalDemo';
import { TimelineDeployDemo } from '@/app/_docs/components/examples/TimelineDeployDemo';

export interface ExtraSection {
	heading: string;
	description?: React.ReactNode;
	demo: React.ReactNode;
}

export const extraSections: Record<string, ExtraSection[]> = {
	'workflow-builder': [
		{
			heading: 'Examples',
			demo: <WorkflowBuilderShowcase />,
		},
	],
	timeline: [
		{
			heading: 'Horizontal variant',
			description: (
				<>
					Pass <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>direction=&quot;horizontal&quot;</code> to lay steps out in a row with a connecting line across the top.
				</>
			),
			demo: <TimelineHorizontalDemo />,
		},
		{
			heading: 'Interactive example',
			description: 'Click the button to append steps one at a time. Each new entry slides in and the indicator dot pops.',
			demo: <TimelineDeployDemo />,
		},
	],
};
