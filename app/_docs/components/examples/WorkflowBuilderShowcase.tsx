'use client';

import type { WorkflowGraph } from '@/src/components/WorkflowBuilder/WorkflowBuilder';
import WorkflowBuilder from '@/src/components/WorkflowBuilder/WorkflowBuilder';
import { useState } from 'react';

const ONBOARDING_GRAPH: WorkflowGraph = {
	nodes: [
		{ id: 'a1', label: 'User signs up',         description: '',                              inputs: [],                                             outputs: [{ id: 'out', label: 'out' }],                  position: { x: 0,   y: 80  } },
		{ id: 'a2', label: 'Has referral code?',    description: 'Branches the onboarding flow.',  inputs: [{ id: 'in', label: 'in' }],                    outputs: [{ id: 'yes', label: 'yes' }, { id: 'no', label: 'no' }], position: { x: 220, y: 50  } },
		{ id: 'a3', label: 'Apply referral credit', description: '',                              inputs: [{ id: 'in', label: 'in' }],                    outputs: [{ id: 'out', label: 'out' }],                  position: { x: 440, y: 0   } },
		{ id: 'a4', label: 'Build welcome payload', description: '',                              inputs: [{ id: 'in', label: 'in' }],                    outputs: [{ id: 'out', label: 'out' }],                  position: { x: 440, y: 160 } },
		{ id: 'a5', label: 'Send welcome email',    description: '',                              inputs: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }], outputs: [{ id: 'out', label: 'out' }],             position: { x: 660, y: 80  } },
		{ id: 'a6', label: 'Onboarding complete',   description: '',                              inputs: [{ id: 'in', label: 'in' }],                    outputs: [],                                             position: { x: 880, y: 80  } },
	],
	edges: [
		{ id: 'ea1', source: 'a1', target: 'a2', sourceHandle: 'out', targetHandle: 'in'  },
		{ id: 'ea2', source: 'a2', target: 'a3', sourceHandle: 'yes', targetHandle: 'in'  },
		{ id: 'ea3', source: 'a2', target: 'a4', sourceHandle: 'no',  targetHandle: 'in'  },
		{ id: 'ea4', source: 'a3', target: 'a5', sourceHandle: 'out', targetHandle: 'a'   },
		{ id: 'ea5', source: 'a4', target: 'a5', sourceHandle: 'out', targetHandle: 'b'   },
		{ id: 'ea6', source: 'a5', target: 'a6', sourceHandle: 'out', targetHandle: 'in'  },
	],
};

export const WorkflowBuilderShowcase = () => {
	const [graph, setGraph] = useState<WorkflowGraph | null>(null);

	return (
		<div className='flex flex-col gap-6'>

			{/* Default: demo graph */}
			<section className='flex flex-col gap-1'>
				<h3 className='text-sm font-semibold text-text font-mono'>WorkflowBuilder</h3>
				<p className='text-sm text-text-muted mb-3'>
					Drag nodes to reposition. Drag from an output handle to an input handle to connect them. Click a node to select it and open its inspector panel on the right — edit its title, description, and add/remove/rename its input and output ports there. Hover a node and click × (or press Delete/Backspace) to remove it. Click <strong>▶ Run</strong> in the toolbar to animate execution: a pulse travels each edge, nodes ring when active and dim with ✓ when complete, starting from every node with no inputs. Nodes with multiple outputs fire all of them simultaneously. Click <strong>◼ Stop</strong> to cancel mid-run.
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
