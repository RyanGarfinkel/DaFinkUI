import { WorkflowBuilderShowcase } from '@/app/_docs/components/examples/WorkflowBuilderShowcase';
import { AudioPlayerCompactDemo } from '@/app/_docs/components/examples/AudioPlayerCompactDemo';

export interface ExtraSection {
	heading: string;
	description?: React.ReactNode;
	demo: React.ReactNode;
}

export const extraSections: Record<string, ExtraSection[]> = {
	audioplayer: [
		{
			heading: 'Compact size',
			description: (
				<>
					Pass <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>size=&quot;compact&quot;</code> for exactly three elements in one row (play/pause, seek slider, elapsed time) with no card chrome of its own. The play button and slider derive their color from <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>currentColor</code>, so they stay legible when dropped straight into a colored container, like a <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>Message</code> bubble.
				</>
			),
			demo: <AudioPlayerCompactDemo />,
		},
	],
	'workflow-builder': [
		{
			heading: 'Examples',
			demo: <WorkflowBuilderShowcase />,
		},
	],
};
