'use client';

import type { WorkflowGraph } from '@/src/components/WorkflowBuilder/WorkflowBuilder';
import WorkflowBuilder from '@/src/components/WorkflowBuilder/WorkflowBuilder';
import { useState } from 'react';

const ONBOARDING_GRAPH: WorkflowGraph = {
	nodes: [
		{ id: 'a1', type: 'trigger',   label: 'User signs up',         position: { x: 0,   y: 80  } },
		{ id: 'a2', type: 'condition',  label: 'Has referral code?',    position: { x: 220, y: 50  } },
		{ id: 'a3', type: 'action',     label: 'Apply referral credit', position: { x: 440, y: 0   } },
		{ id: 'a4', type: 'transform',  label: 'Build welcome payload', position: { x: 440, y: 160 } },
		{ id: 'a5', type: 'action',     label: 'Send welcome email',    position: { x: 660, y: 80  } },
		{ id: 'a6', type: 'output',     label: 'Onboarding complete',   position: { x: 880, y: 80  } },
	],
	edges: [
		{ id: 'ea1', source: 'a1', target: 'a2' },
		{ id: 'ea2', source: 'a2', target: 'a3' },
		{ id: 'ea3', source: 'a2', target: 'a4' },
		{ id: 'ea4', source: 'a3', target: 'a5' },
		{ id: 'ea5', source: 'a4', target: 'a5' },
		{ id: 'ea6', source: 'a5', target: 'a6' },
	],
};

export const WorkflowBuilderShowcase = () =>
{
	const [graph, setGraph] = useState<WorkflowGraph | null>(null);

	return (
		<div className='flex flex-col gap-6'>

			{/* Default — demo graph */}
			<section className='flex flex-col gap-1'>
				<h3 className='text-sm font-semibold text-text font-mono'>WorkflowBuilder</h3>
				<p className='text-sm text-text-muted mb-3'>
					Drag nodes to reposition. Drag from a right handle to a left handle to connect. Click a label to edit inline. Hover a node and click × (or press Delete/Backspace) to remove it. Click <strong>▶ Run</strong> in the toolbar to animate execution: a pulse dot travels each edge, nodes glow when active and dim with ✓ when complete. At condition nodes both branches fire simultaneously. Click <strong>◼ Stop</strong> to cancel mid-run.
				</p>
				<WorkflowBuilder height={460} onChange={setGraph} />
			</section>

			{/* Pre-built example graph */}
			<section className='flex flex-col gap-1'>
				<h3 className='text-sm font-semibold text-text font-mono'>Pre-built graph via defaultGraph</h3>
				<p className='text-sm text-text-muted mb-3'>
					Pass a <code className='font-mono text-xs'>WorkflowGraph</code> to <code className='font-mono text-xs'>defaultGraph</code> to pre-populate the canvas.
				</p>
				<WorkflowBuilder height={420} defaultGraph={ONBOARDING_GRAPH} />
			</section>

			{/* Live onChange output */}
			{graph && (
				<section className='flex flex-col gap-2'>
					<h3 className='text-sm font-semibold text-text font-mono'>onChange output (live)</h3>
					<p className='text-sm text-text-muted'>
						The serialized graph from the first builder above updates in real time.
					</p>
					<pre className='bg-surface-active rounded-[var(--radius)] border border-surface-border p-4 text-xs text-text font-mono overflow-x-auto scrollbar-thin'>
						{JSON.stringify(graph, null, 2)}
					</pre>
				</section>
			)}
		</div>
	);
};
