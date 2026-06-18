'use client';

import { ReactFlow, Background, Controls, Handle, Panel, Position, addEdge, useNodesState, useEdgesState, useReactFlow, getBezierPath, BaseEdge } from '@xyflow/react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Node, Edge, NodeProps, Connection, EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Public types ──────────────────────────────────────────────────────────────

export type WorkflowNodeType = 'trigger' | 'condition' | 'action' | 'transform' | 'output';

export interface WorkflowGraph
{
	nodes: { id: string; type: WorkflowNodeType; label: string; position: { x: number; y: number } }[];
	edges: { id: string; source: string; target: string }[];
}

export interface WorkflowBuilderProps
{
	defaultGraph?: WorkflowGraph;
	onChange?:     (graph: WorkflowGraph) => void;
	height?:       number;
	className?:    string;
}

// ─── Internal RF types ─────────────────────────────────────────────────────────

type WFData = { nodeType: WorkflowNodeType; label: string };
type WFNode = Node<WFData>;
type WFEdge = Edge;

// ─── Node type metadata ────────────────────────────────────────────────────────

const ICONS: Record<WorkflowNodeType, string> = {
	trigger:   '⚡',
	condition: '◇',
	action:    '▶',
	transform: '⇄',
	output:    '◼',
};

const TYPE_LABELS: Record<WorkflowNodeType, string> = {
	trigger:   'Trigger',
	condition: 'Condition',
	action:    'Action',
	transform: 'Transform',
	output:    'Output',
};

const DEFAULT_LABELS: Record<WorkflowNodeType, string> = {
	trigger:   'When this happens',
	condition: 'If condition is met',
	action:    'Do something',
	transform: 'Transform data',
	output:    'Return result',
};

const ACCENT_COLORS: Record<WorkflowNodeType, string> = {
	trigger:   'var(--color-brand)',
	condition: 'var(--color-warning)',
	action:    'var(--color-success)',
	transform: 'var(--color-text-muted)',
	output:    'var(--color-danger)',
};

const SHAPE_STYLES: Record<WorkflowNodeType, { borderRadius?: string }> = {
	trigger:   { borderRadius: '9999px' },
	condition: {},
	action:    { borderRadius: 'var(--radius)' },
	transform: { borderRadius: '4px 12px 12px 4px' },
	output:    { borderRadius: '4px 4px 14px 14px' },
};

const BAR_RADIUS: Record<WorkflowNodeType, string | null> = {
	trigger:   null,
	condition: null,
	action:    'var(--radius) 0 0 var(--radius)',
	transform: '4px 0 0 4px',
	output:    '4px 0 0 14px',
};

const ALL_NODE_TYPES: WorkflowNodeType[] = ['trigger', 'condition', 'action', 'transform', 'output'];

// ─── Run animation context ─────────────────────────────────────────────────────

type NodeRunState = 'idle' | 'active' | 'completed';
type RunPhase     = 'idle' | 'running' | 'complete';

interface RunContextValue
{
	runPhase:             RunPhase;
	nodeRunStates:        Map<string, NodeRunState>;
	animatingEdgeIds:     Set<string>;
	completedEdgeIds:     Set<string>;
	prefersReducedMotion: boolean;
}

const RunContext = createContext<RunContextValue>({
	runPhase:             'idle',
	nodeRunStates:        new Map(),
	animatingEdgeIds:     new Set(),
	completedEdgeIds:     new Set(),
	prefersReducedMotion: false,
});

// ─── Built-in demo graph ───────────────────────────────────────────────────────

const DEMO_NODES: WFNode[] = [
	{ id: 'n1', type: 'workflow', position: { x: 0,   y: 70  }, data: { nodeType: 'trigger',   label: 'User submits form'    } },
	{ id: 'n2', type: 'workflow', position: { x: 230, y: 40  }, data: { nodeType: 'condition',  label: 'Score > 80?'          } },
	{ id: 'n3', type: 'workflow', position: { x: 430, y: 0   }, data: { nodeType: 'action',     label: 'Send approval email'  } },
	{ id: 'n4', type: 'workflow', position: { x: 430, y: 150 }, data: { nodeType: 'transform',  label: 'Format rejection msg' } },
	{ id: 'n5', type: 'workflow', position: { x: 640, y: 70  }, data: { nodeType: 'output',     label: 'Return result'        } },
];

const DEMO_EDGES: WFEdge[] = [
	{ id: 'e1', type: 'animated', source: 'n1', target: 'n2' },
	{ id: 'e2', type: 'animated', source: 'n2', target: 'n3' },
	{ id: 'e3', type: 'animated', source: 'n2', target: 'n4' },
	{ id: 'e4', type: 'animated', source: 'n3', target: 'n5' },
	{ id: 'e5', type: 'animated', source: 'n4', target: 'n5' },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

const pause = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// Staggered particle stream: 3 dots loop every 400ms, evenly spaced at 133ms intervals.
// While isAnimating, there are always ~3 dots visible on the path simultaneously.
const PARTICLE_STREAM = [
	{ begin: '0s',     r: 5, opacity: 0.95 },
	{ begin: '0.133s', r: 4, opacity: 0.75 },
	{ begin: '0.267s', r: 3, opacity: 0.55 },
] as const;

// ─── AnimatedEdge ─────────────────────────────────────────────────────────────

const AnimatedEdge = ({
	id, sourceX, sourceY, targetX, targetY,
	sourcePosition, targetPosition, markerEnd, style,
}: EdgeProps) =>
{
	const { animatingEdgeIds, completedEdgeIds, prefersReducedMotion } = useContext(RunContext);
	const isAnimating = animatingEdgeIds.has(id);
	const isCompleted = completedEdgeIds.has(id);

	const [edgePath] = getBezierPath({
		sourceX, sourceY, sourcePosition,
		targetX, targetY, targetPosition,
	});

	// Completed edges stay lit in brand color at low opacity.
	// Animating edges become full brand color to show the "wire is live".
	const edgeStyle = isAnimating
		? { stroke: 'var(--color-brand)', strokeWidth: 2 }
		: isCompleted
		? { stroke: 'var(--color-brand)', strokeWidth: 2, opacity: 0.35,
			filter: 'drop-shadow(0 0 2px var(--color-brand))' }
		: style;

	return (
		<>
			<BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={edgeStyle} />

			{isAnimating && !prefersReducedMotion && (
				<>
					{/* Sweep fill: a bright stroke that draws itself from source to target.
					    pathLength="1" normalises the path so dasharray/dashoffset values
					    are 0-1 fractions — no need to measure actual path length. */}
					<path
						d={edgePath}
						fill='none'
						stroke='var(--color-brand)'
						strokeWidth={4}
						strokeLinecap='round'
						pathLength={1}
						strokeDasharray={1}
						style={{
							strokeDashoffset: 1,
							animation: 'wf-dash-fill 0.6s linear forwards',
							filter: 'drop-shadow(0 0 4px var(--color-brand)) drop-shadow(0 0 10px var(--color-brand)) drop-shadow(0 0 20px var(--color-brand))',
						}}
					/>

					{/* Particle stream: dots loop at 400ms, staggered so ~3 are visible
					    simultaneously at any point during the 600ms animation window. */}
					{PARTICLE_STREAM.map(({ begin, r, opacity }) => (
						<circle key={begin} r={r} fill='var(--color-brand)' opacity={opacity}
							style={{ filter: 'drop-shadow(0 0 3px var(--color-brand)) drop-shadow(0 0 6px var(--color-brand))' }}
						>
							<animateMotion dur='0.4s' repeatCount='indefinite' begin={begin} fill='freeze' path={edgePath} />
						</circle>
					))}
				</>
			)}
		</>
	);
};

const EDGE_TYPES = { animated: AnimatedEdge };

const HANDLE_STYLE = {
	background: 'var(--color-surface)',
	border:     '1.5px solid var(--color-surface-border-hover)',
	width:      10,
	height:     10,
};

// ─── WorkflowNode ──────────────────────────────────────────────────────────────

const WorkflowNode = ({ id, data, selected }: NodeProps<WFNode>) =>
{
	const { setNodes, setEdges, updateNodeData } = useReactFlow();
	const { runPhase, nodeRunStates }             = useContext(RunContext);
	const nodeType = data.nodeType;
	const label    = data.label;

	const [editing, setEditing] = useState(false);
	const [draft,   setDraft]   = useState(label);
	const [hovered, setHovered] = useState(false);

	const nodeRunState = nodeRunStates.get(id) ?? 'idle';
	const isRunActive  = nodeRunState === 'active';
	const isRunDone    = nodeRunState === 'completed';

	const commitEdit = () =>
	{
		updateNodeData(id, { label: draft });
		setEditing(false);
	};

	const startEdit = () =>
	{
		setDraft(label);
		setEditing(true);
	};

	const deleteNode = () =>
	{
		setNodes(ns => ns.filter(n => n.id !== id));
		setEdges(es => es.filter(edge => edge.source !== id && edge.target !== id));
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
	{
		if(e.key === 'Enter')  { e.preventDefault(); commitEdit(); }
		if(e.key === 'Escape') { setDraft(label); setEditing(false); }
	};

	const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLParagraphElement>) =>
	{
		if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEdit(); }
	};

	const showDelete = runPhase === 'idle' && (selected || hovered);

	const deleteBtn = showDelete ? (
		<button
			type='button'
			className='nodrag absolute top-1.5 right-1.5 w-[18px] h-[18px] flex items-center justify-center rounded-full bg-surface-hover text-text-muted text-[11px] hover:bg-danger/20 hover:text-danger transition-colors z-10'
			onClick={e => { e.stopPropagation(); deleteNode(); }}
			aria-label='Delete node'
		>
			×
		</button>
	) : null;

	// ── Condition: diamond shape ─────────────────────────────────────────────────

	if(nodeType === 'condition')
	{
		const glowStyle = isRunActive
			? { boxShadow: '0 0 0 2px var(--color-warning), 0 0 14px 4px color-mix(in srgb, var(--color-warning) 40%, transparent)' }
			: undefined;

		return (
			<div
				className={['relative', isRunDone ? 'opacity-60' : ''].join(' ')}
				style={{ width: 120, height: 120 }}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				aria-label={`Condition node: ${label}`}
			>
				<div
					className='absolute bg-surface border border-surface-border shadow-[var(--shadow)]'
					style={{
						width: 80, height: 80,
						top: 20, left: 20,
						borderRadius: 6,
						transform: 'rotate(45deg)',
						...glowStyle,
					}}
				/>

				{selected && (
					<div
						className='absolute pointer-events-none'
						style={{
							width: 88, height: 88,
							top: 16, left: 16,
							borderRadius: 8,
							border: '2px solid var(--color-brand-ring)',
							transform: 'rotate(45deg)',
						}}
					/>
				)}

				<div className='absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center'>
					<span aria-hidden='true' className='text-xs leading-none' style={{ color: ACCENT_COLORS.condition }}>
						{ICONS.condition}
					</span>
					<span className='text-[9px] font-semibold uppercase tracking-widest text-text-subtle'>
						{TYPE_LABELS.condition}
					</span>
					{editing ? (
						<input
							autoFocus
							value={draft}
							onChange={e => setDraft(e.target.value)}
							onBlur={commitEdit}
							onKeyDown={handleInputKeyDown}
							className='text-[10px] text-center text-text bg-transparent border-b border-brand-ring outline-none w-16 mt-0.5'
							aria-label='Edit label for Condition node'
						/>
					) : (
						<p
							role='button'
							tabIndex={0}
							className='text-[10px] text-text leading-tight cursor-text focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-ring rounded-sm max-w-[72px] line-clamp-2 mt-0.5'
							onClick={startEdit}
							onKeyDown={handleLabelKeyDown}
							aria-label={`${label || 'Empty label'}. Click to edit.`}
						>
							{label || <span className='text-text-subtle italic'>Edit</span>}
						</p>
					)}
				</div>

				{isRunDone && (
					<div className='absolute top-2 right-3 text-success text-[11px] font-bold pointer-events-none' aria-hidden='true'>
						✓
					</div>
				)}

				{deleteBtn}

				<Handle type='target' position={Position.Left}  style={{ ...HANDLE_STYLE, left:  -5 }} />
				<Handle type='source' position={Position.Right} style={{ ...HANDLE_STYLE, right: -5 }} />
			</div>
		);
	}

	// ── All other node types ─────────────────────────────────────────────────────

	const barRadius = BAR_RADIUS[nodeType];
	const glowStyle = isRunActive
		? { boxShadow: `0 0 0 2px ${ACCENT_COLORS[nodeType]}, 0 0 14px 4px color-mix(in srgb, ${ACCENT_COLORS[nodeType]} 40%, transparent)` }
		: {};

	return (
		<div
			className={[
				'relative bg-surface border border-surface-border shadow-[var(--shadow)] w-44',
				selected  ? 'ring-2 ring-offset-1 ring-brand-ring' : '',
				isRunDone ? 'opacity-60' : '',
			].join(' ')}
			style={{ ...SHAPE_STYLES[nodeType], ...glowStyle }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			aria-label={`${TYPE_LABELS[nodeType]} node: ${label}`}
		>
			{barRadius && (
				<div
					className='absolute left-0 top-0 bottom-0 w-[3px]'
					style={{ backgroundColor: ACCENT_COLORS[nodeType], borderRadius: barRadius }}
					aria-hidden='true'
				/>
			)}

			{isRunDone && (
				<div className='absolute top-1.5 right-1.5 text-success text-[11px] font-bold pointer-events-none' aria-hidden='true'>
					✓
				</div>
			)}

			{deleteBtn}

			<Handle type='target' position={Position.Left}  style={{ ...HANDLE_STYLE, left:  -5 }} />
			<Handle type='source' position={Position.Right} style={{ ...HANDLE_STYLE, right: -5 }} />

			<div className='pl-4 pr-5 py-2.5'>
				<div className='flex items-center gap-1.5 mb-1.5'>
					<span aria-hidden='true' className='text-xs leading-none' style={{ color: ACCENT_COLORS[nodeType] }}>
						{ICONS[nodeType]}
					</span>
					<span className='text-[10px] font-semibold uppercase tracking-widest text-text-subtle'>
						{TYPE_LABELS[nodeType]}
					</span>
				</div>

				{editing ? (
					<input
						autoFocus
						value={draft}
						onChange={e => setDraft(e.target.value)}
						onBlur={commitEdit}
						onKeyDown={handleInputKeyDown}
						className='text-xs text-text bg-transparent w-full border-b border-brand-ring outline-none py-0.5'
						aria-label={`Edit label for ${TYPE_LABELS[nodeType]} node`}
					/>
				) : (
					<p
						role='button'
						tabIndex={0}
						className='text-xs text-text leading-snug cursor-text focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-ring rounded-sm'
						onClick={startEdit}
						onKeyDown={handleLabelKeyDown}
						aria-label={`${label || 'Empty label'}. Click to edit.`}
					>
						{label || <span className='text-text-subtle italic'>Click to edit</span>}
					</p>
				)}
			</div>
		</div>
	);
};

const NODE_TYPES = { workflow: WorkflowNode };

// ─── Graph conversion helpers ──────────────────────────────────────────────────

const toRFNodes = (nodes: WorkflowGraph['nodes']): WFNode[] =>
	nodes.map(n => ({
		id:       n.id,
		type:     'workflow' as const,
		position: n.position,
		data:     { nodeType: n.type, label: n.label },
	}));

const toRFEdges = (edges: WorkflowGraph['edges']): WFEdge[] =>
	edges.map(e => ({ id: e.id, type: 'animated', source: e.source, target: e.target }));

const toWorkflowGraph = (nodes: WFNode[], edges: WFEdge[]): WorkflowGraph => ({
	nodes: nodes.map(n => ({
		id:       n.id,
		type:     n.data.nodeType,
		label:    n.data.label,
		position: n.position,
	})),
	edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
});

// ─── WorkflowBuilder ──────────────────────────────────────────────────────────

const WorkflowBuilder = ({ defaultGraph, onChange, height = 500, className = '' }: WorkflowBuilderProps) =>
{
	const initialNodes = defaultGraph ? toRFNodes(defaultGraph.nodes) : DEMO_NODES;
	const initialEdges = defaultGraph ? toRFEdges(defaultGraph.edges) : DEMO_EDGES;

	const [nodes, setNodes, onNodesChange] = useNodesState<WFNode>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState<WFEdge>(initialEdges);

	const [runPhase,         setRunPhase]        = useState<RunPhase>('idle');
	const [nodeRunStates,    setNodeRunStates]    = useState<Map<string, NodeRunState>>(new Map());
	const [animatingEdgeIds, setAnimatingEdgeIds] = useState<Set<string>>(new Set());
	const [completedEdgeIds, setCompletedEdgeIds] = useState<Set<string>>(new Set());

	const onChangeRef  = useRef(onChange);
	const nodeCounter  = useRef(200);
	const runGenRef    = useRef(0);

	const prefersReducedMotion = typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	useEffect(() => { onChangeRef.current = onChange; });

	useEffect(() =>
	{
		onChangeRef.current?.(toWorkflowGraph(nodes, edges));
	}, [nodes, edges]);

	const onConnect = useCallback((params: Connection) =>
	{
		setEdges(eds => addEdge({ ...params, id: `e-${Date.now()}`, type: 'animated' }, eds));
	}, [setEdges]);

	const addNode = (type: WorkflowNodeType) =>
	{
		const id = `n${++nodeCounter.current}`;
		setNodes(nds => [
			...nds,
			{
				id,
				type:     'workflow',
				position: { x: 180 + Math.random() * 160, y: 100 + Math.random() * 200 },
				data:     { nodeType: type, label: DEFAULT_LABELS[type] },
			},
		]);
	};

	const resetAnimation = () =>
	{
		runGenRef.current++;
		setRunPhase('idle');
		setNodeRunStates(new Map());
		setAnimatingEdgeIds(new Set());
		setCompletedEdgeIds(new Set());
	};

	const runAnimation = async () =>
	{
		if(runPhase !== 'idle') return;

		const gen   = ++runGenRef.current;
		const alive = () => runGenRef.current === gen;
		const go    = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

		const currNodes = nodes;
		const currEdges = edges;

		const outgoing = new Map<string, { edgeId: string; targetId: string }[]>();
		currEdges.forEach(e =>
		{
			if(!outgoing.has(e.source)) outgoing.set(e.source, []);
			outgoing.get(e.source)!.push({ edgeId: e.id, targetId: e.target });
		});

		const triggerIds = currNodes
			.filter(n => n.data.nodeType === 'trigger')
			.map(n => n.id);

		if(triggerIds.length === 0) return;

		setRunPhase('running');
		setNodeRunStates(new Map(triggerIds.map(id => [id, 'active' as NodeRunState])));

		const visited = new Set<string>(triggerIds);
		let wave = triggerIds;

		if(!prefersReducedMotion) await go(300);
		if(!alive()) return;

		while(wave.length > 0)
		{
			const edgesThisWave = wave.flatMap(id => outgoing.get(id) ?? []);

			if(edgesThisWave.length === 0)
			{
				setNodeRunStates(prev =>
				{
					const m = new Map(prev);
					wave.forEach(id => m.set(id, 'completed'));
					return m;
				});
				break;
			}

			if(!prefersReducedMotion)
			{
				setAnimatingEdgeIds(new Set(edgesThisWave.map(e => e.edgeId)));
				await go(600);
				if(!alive()) return;
				setAnimatingEdgeIds(new Set());
				// Edges that just animated stay lit as "completed"
				setCompletedEdgeIds(prev => new Set([...prev, ...edgesThisWave.map(e => e.edgeId)]));
			}

			const nextWave = [
				...new Set(edgesThisWave.map(e => e.targetId).filter(id => !visited.has(id))),
			];
			nextWave.forEach(id => visited.add(id));

			setNodeRunStates(prev =>
			{
				const m = new Map(prev);
				wave.forEach(id => m.set(id, 'completed'));
				nextWave.forEach(id => m.set(id, 'active'));
				return m;
			});

			if(!prefersReducedMotion) await go(300);
			if(!alive()) return;

			wave = nextWave;
		}

		if(!alive()) return;

		setRunPhase('complete');

		await go(prefersReducedMotion ? 600 : 1500);
		if(!alive()) return;

		resetAnimation();
	};

	const TOOLBAR_BTN = [
		'flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-text text-left',
		'rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-fast)]',
		'hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
	].join(' ');

	const runBtnLabel = runPhase === 'running' ? '◼ Stop' : runPhase === 'complete' ? '✓ Done' : '▶ Run';
	const runBtnColor = runPhase === 'running' ? 'text-danger' : runPhase === 'complete' ? 'text-success' : '';

	const runCtxValue: RunContextValue = {
		runPhase,
		nodeRunStates,
		animatingEdgeIds,
		completedEdgeIds,
		prefersReducedMotion,
	};

	return (
		<RunContext.Provider value={runCtxValue}>
			<div
				className={`relative rounded-[var(--radius-lg)] border border-surface-border overflow-hidden ${className}`}
				style={{ height }}
			>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					nodeTypes={NODE_TYPES}
					edgeTypes={EDGE_TYPES}
					fitView
					fitViewOptions={{ padding: 0.3 }}
					deleteKeyCode={['Delete', 'Backspace']}
					defaultEdgeOptions={{
						style: { stroke: 'var(--color-surface-border-hover)', strokeWidth: 2 },
					}}
					connectionLineStyle={{ stroke: 'var(--color-brand)', strokeWidth: 2 }}
					proOptions={{ hideAttribution: true }}
				>
					<Background color='var(--color-surface-border)' gap={20} />
					<Controls />

					<Panel position='top-left'>
						<div
							className='flex flex-col gap-0.5 p-2 bg-surface border border-surface-border rounded-[var(--radius)] shadow-[var(--shadow-sm)]'
							role='toolbar'
							aria-label='Workflow controls'
						>
							<span className='text-[10px] font-semibold text-text-subtle uppercase tracking-wider px-1 pb-1'>
								Add node
							</span>
							{ALL_NODE_TYPES.map(type => (
								<button
									key={type}
									type='button'
									onClick={() => addNode(type)}
									disabled={runPhase !== 'idle'}
									className={[
										TOOLBAR_BTN,
										runPhase !== 'idle' ? 'opacity-40 pointer-events-none' : '',
									].join(' ')}
									aria-label={`Add ${TYPE_LABELS[type]} node`}
								>
									<span aria-hidden='true' style={{ color: ACCENT_COLORS[type] }}>
										{ICONS[type]}
									</span>
									{TYPE_LABELS[type]}
								</button>
							))}

							<div className='border-t border-surface-border my-1' aria-hidden='true' />

							<button
								type='button'
								onClick={runPhase === 'running' ? resetAnimation : runAnimation}
								className={[TOOLBAR_BTN, 'font-medium', runBtnColor].join(' ')}
								aria-label={runPhase === 'running' ? 'Stop animation' : 'Run workflow animation'}
							>
								{runBtnLabel}
							</button>
						</div>
					</Panel>
				</ReactFlow>
			</div>
		</RunContext.Provider>
	);
};

export default WorkflowBuilder;
