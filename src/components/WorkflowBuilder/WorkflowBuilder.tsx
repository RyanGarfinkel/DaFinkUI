'use client';

import { ReactFlow, Background, Controls, Handle, Panel, Position, addEdge, useNodesState, useEdgesState, useReactFlow, getSmoothStepPath, getStraightPath, BaseEdge } from '@xyflow/react';
import type { Node, Edge, NodeProps, Connection, EdgeProps, ReactFlowInstance } from '@xyflow/react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ToggleGroup, { ToggleGroupItem } from '../ToggleGroup/ToggleGroup';
import '@xyflow/react/dist/style.css';

const CONTROLS_STYLE = {
	'--xy-controls-button-background-color':       'var(--color-surface)',
	'--xy-controls-button-background-color-hover': 'var(--color-surface-hover)',
	'--xy-controls-button-color':                   'var(--color-text)',
	'--xy-controls-button-color-hover':             'var(--color-text)',
	'--xy-controls-button-border-color':            'var(--color-surface-border)',
	'--xy-controls-box-shadow':                     'var(--shadow-sm)',
} as React.CSSProperties;

export type WorkflowDirection = 'horizontal' | 'vertical';

export interface WorkflowPort {
	id:    string;
	label: string;
}

export interface WorkflowGraph {
	nodes: {
		id:           string;
		label:        string;
		description?: string;
		inputs:       WorkflowPort[];
		outputs:      WorkflowPort[];
		position:     { x: number; y: number };
	}[];
	edges: { id: string; source: string; target: string; sourceHandle: string; targetHandle: string }[];
}

export interface WorkflowBuilderProps {
	defaultGraph?:     WorkflowGraph;
	onChange?:         (graph: WorkflowGraph) => void;
	height?:           number;
	className?:        string;
	defaultDirection?: WorkflowDirection;
	readOnly?:         boolean;
}

type WFData = { label: string; description: string; inputs: WorkflowPort[]; outputs: WorkflowPort[] };
type WFNode = Node<WFData>;
type WFEdge = Edge;
type PortKind = 'inputs' | 'outputs';

type NodeRunState = 'idle' | 'active' | 'completed';
type RunPhase     = 'idle' | 'running' | 'complete';

interface RunContextValue {
	runPhase:             RunPhase;
	nodeRunStates:        Map<string, NodeRunState>;
	animatingEdgeIds:     Set<string>;
	completedEdgeIds:     Set<string>;
	prefersReducedMotion: boolean;
	direction:            WorkflowDirection;
	readOnly:             boolean;
}

const RunContext = createContext<RunContextValue>({
	runPhase:             'idle',
	nodeRunStates:        new Map(),
	animatingEdgeIds:     new Set(),
	completedEdgeIds:     new Set(),
	prefersReducedMotion: false,
	direction:            'horizontal',
	readOnly:             false,
});

// A node with zero inputs is an entry point; a node with zero outputs is terminal.
// n2 (2 outputs) and n5 (2 inputs) demonstrate branching/merging via real multi-port nodes.

const DEMO_NODES: WFNode[] = [
	{ id: 'n1', type: 'workflow', position: { x: 0,   y: 90  }, data: { label: 'Form submitted',      description: 'A user submits the onboarding form.',           inputs: [],                                            outputs: [{ id: 'out', label: 'out' }] } },
	{ id: 'n2', type: 'workflow', position: { x: 260, y: 90  }, data: { label: 'Score check',          description: 'Branches on whether the score clears the bar.', inputs: [{ id: 'in', label: 'in' }],                   outputs: [{ id: 'pass', label: 'pass' }, { id: 'fail', label: 'fail' }] } },
	{ id: 'n3', type: 'workflow', position: { x: 560, y: 0   }, data: { label: 'Send approval email',  description: '',                                              inputs: [{ id: 'in', label: 'in' }],                   outputs: [{ id: 'out', label: 'out' }] } },
	{ id: 'n4', type: 'workflow', position: { x: 560, y: 200 }, data: { label: 'Format rejection msg', description: '',                                              inputs: [{ id: 'in', label: 'in' }],                   outputs: [{ id: 'out', label: 'out' }] } },
	{ id: 'n5', type: 'workflow', position: { x: 860, y: 90  }, data: { label: 'Return result',        description: '',                                              inputs: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }], outputs: [] } },
];

const DEMO_EDGES: WFEdge[] = [
	{ id: 'e1', type: 'animated', source: 'n1', target: 'n2', sourceHandle: 'out',  targetHandle: 'in' },
	{ id: 'e2', type: 'animated', source: 'n2', target: 'n3', sourceHandle: 'pass', targetHandle: 'in' },
	{ id: 'e3', type: 'animated', source: 'n2', target: 'n4', sourceHandle: 'fail', targetHandle: 'in' },
	{ id: 'e4', type: 'animated', source: 'n3', target: 'n5', sourceHandle: 'out',  targetHandle: 'a' },
	{ id: 'e5', type: 'animated', source: 'n4', target: 'n5', sourceHandle: 'out',  targetHandle: 'b' },
];

// Named so AnimatedEdge's travel duration always matches the wave delay in
// runAnimation below — they must stay in lockstep, not just visually similar.

const TRIGGER_DWELL_MS       = 250; // beat before the first wave starts
const EDGE_TRAVEL_MS         = 450; // time the pulse takes to cross one edge
const NODE_DWELL_MS          = 200; // active-node hold before advancing to the next wave
const COMPLETE_HOLD_MS       = 900; // "complete" hold before auto-reset
const REDUCED_MOTION_HOLD_MS = 400; // reduced-motion equivalent of COMPLETE_HOLD_MS

const ALIGN_TOLERANCE = 4;

const AnimatedEdge = ({
	id, sourceX, sourceY, targetX, targetY,
	sourcePosition, targetPosition, markerEnd, style,
}: EdgeProps) => {
	const { animatingEdgeIds, completedEdgeIds, prefersReducedMotion } = useContext(RunContext);
	const isAnimating = animatingEdgeIds.has(id);
	const isCompleted = completedEdgeIds.has(id);

	// getSmoothStepPath inserts an unnecessary little jog even when the two handles
	// are perfectly aligned (straight down or straight across) — fall back to a
	// true straight line in that case rather than a step path with nothing to step around.
	const isAligned =
		(sourcePosition === Position.Bottom && targetPosition === Position.Top  && Math.abs(sourceX - targetX) < ALIGN_TOLERANCE) ||
		(sourcePosition === Position.Right  && targetPosition === Position.Left && Math.abs(sourceY - targetY) < ALIGN_TOLERANCE);

	const [edgePath] = isAligned
		? getStraightPath(sourcePosition === Position.Right
			? { sourceX, sourceY: (sourceY + targetY) / 2, targetX, targetY: (sourceY + targetY) / 2 }
			: { sourceX: (sourceX + targetX) / 2, sourceY, targetX: (sourceX + targetX) / 2, targetY })
		: getSmoothStepPath({
			sourceX, sourceY, sourcePosition,
			targetX, targetY, targetPosition,
			borderRadius: 8,
		});

	// Completed edges stay lit in flat brand color at low opacity.
	// Animating edges switch to full-strength brand color to show the "wire is live" —
	// no blur/glow on either state, kept flat to match the minimal card look.
	const edgeStyle = isAnimating
		? { stroke: 'var(--color-brand)', strokeWidth: 2 }
		: isCompleted
		? { stroke: 'var(--color-brand)', strokeWidth: 2, opacity: 0.35 }
		: style;

	return (
		<>
			<BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={edgeStyle} />

			{/* A single flat pulse travels the edge once per wave — no glow, no trail.
			    Its duration matches EDGE_TRAVEL_MS exactly, and it unmounts the instant
			    isAnimating goes false, so it never lingers past its wave. */}
			{/* cx/cy anchor the dot at the path's own start point (not the SVG origin)
			    for the frame before animateMotion takes over — without them the dot
			    briefly renders at (0,0), i.e. the canvas's top-left corner. */}
			{isAnimating && !prefersReducedMotion && (
				<circle r={4} cx={sourceX} cy={sourceY} fill='var(--color-brand)'>
					<animateMotion dur={`${EDGE_TRAVEL_MS}ms`} repeatCount='1' path={edgePath} />
				</circle>
			)}
		</>
	);
};

const EDGE_TYPES = { animated: AnimatedEdge };

// Idle wires stay lightly tinted with the brand color (rather than flat gray)
// so the graph reads as "alive" even before Run is clicked.
const EDGE_IDLE_STYLE = {
	stroke:      'color-mix(in srgb, var(--color-brand) 45%, var(--color-surface-border-hover))',
	strokeWidth: 1.5,
};

const HANDLE_STYLE = {
	background: 'var(--color-surface)',
	border:     '1.5px solid var(--color-surface-border-hover)',
	width:      10,
	height:     10,
};

// Dragged nodes snap to this spacing, matching the dot Background's gap so the
// grid you see is the grid nodes actually snap to.
const GRID_SIZE = 20;

// Every node is the same shape: some inputs, a title + optional description
// ("the logic"), and some outputs. A node with no inputs is an entry point;
// one with no outputs is terminal. All editing happens in the inspector panel
// (rendered by WorkflowBuilder) — nodes here are display + drag + select + delete only.

const WorkflowNode = ({ id, data, selected }: NodeProps<WFNode>) => {
	const { setNodes, setEdges }                           = useReactFlow();
	const { runPhase, nodeRunStates, direction, readOnly } = useContext(RunContext);
	const { label, description, inputs, outputs }          = data;

	const isHorizontal = direction === 'horizontal';

	const [hovered, setHovered] = useState(false);

	const nodeRunState = nodeRunStates.get(id) ?? 'idle';
	const isRunActive  = nodeRunState === 'active';
	const isRunDone    = nodeRunState === 'completed';

	const deleteNode = () => {
		setNodes(ns => ns.filter(n => n.id !== id));
		setEdges(es => es.filter(edge => edge.source !== id && edge.target !== id));
	};

	const showDelete = !readOnly && runPhase === 'idle' && (selected || hovered);

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

	const activeRingStyle = isRunActive ? { boxShadow: '0 0 0 2px var(--color-brand)' } : undefined;

	const renderPort = (port: WorkflowPort, kind: 'input' | 'output') => {
		const isInput     = kind === 'input';
		const handleType  = isInput ? 'target' : 'source';
		const position    = isHorizontal
			? (isInput ? Position.Left : Position.Right)
			: (isInput ? Position.Top  : Position.Bottom);
		const handleStyle = isHorizontal
			? { ...HANDLE_STYLE, ...(isInput ? { left: -5 } : { right: -5 }) }
			: { ...HANDLE_STYLE, ...(isInput ? { top: -5 }  : { bottom: -5 }) };

		return (
			<div
				key={port.id}
				className={isHorizontal ? 'relative h-5' : 'relative w-5'}
				title={port.label}
			>
				<Handle type={handleType} id={port.id} position={position} style={handleStyle} />
			</div>
		);
	};

	const inputPorts  = inputs.map(p => renderPort(p, 'input'));
	const outputPorts = outputs.map(p => renderPort(p, 'output'));

	const body = (
		<div className='flex-1 min-w-0 px-2.5 py-1.5'>
			<p className='text-xs font-medium text-text truncate'>
				{label || <span className='text-text-subtle italic'>Untitled node</span>}
			</p>
			{description && (
				<p className='text-[10px] text-text-muted leading-snug line-clamp-2 mt-0.5'>{description}</p>
			)}
		</div>
	);

	return (
		<div
			className={[
				'relative bg-surface border border-surface-border shadow-[var(--shadow)] rounded-[var(--radius)] w-[200px]',
				selected  ? 'ring-2 ring-offset-1 ring-brand-ring' : '',
				isRunDone ? 'opacity-60' : '',
			].join(' ')}
			style={activeRingStyle}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			aria-label={`Node: ${label}${description ? `, ${description}` : ''}`}
		>
			{isRunDone && (
				<div className='absolute top-1.5 right-1.5 text-success text-[11px] font-bold pointer-events-none' aria-hidden='true'>
					✓
				</div>
			)}

			{deleteBtn}

			{isHorizontal ? (
				<div className='flex min-h-[58px]'>
					{inputPorts.length > 0 && <div className='flex flex-col justify-center gap-1.5 py-1.5 pl-1'>{inputPorts}</div>}
					{body}
					{outputPorts.length > 0 && <div className='flex flex-col justify-center gap-1.5 py-1.5 pr-1'>{outputPorts}</div>}
				</div>
			) : (
				<div className='flex flex-col'>
					{inputPorts.length > 0 && <div className='flex justify-center gap-3 pt-1'>{inputPorts}</div>}
					{body}
					{outputPorts.length > 0 && <div className='flex justify-center gap-3 pb-1'>{outputPorts}</div>}
				</div>
			)}
		</div>
	);
};

const NODE_TYPES = { workflow: WorkflowNode };

const toRFNodes = (nodes: WorkflowGraph['nodes']): WFNode[] =>
	nodes.map(n => ({
		id:       n.id,
		type:     'workflow' as const,
		position: n.position,
		data:     { label: n.label, description: n.description ?? '', inputs: n.inputs, outputs: n.outputs },
	}));

const toRFEdges = (edges: WorkflowGraph['edges']): WFEdge[] =>
	edges.map(e => ({ id: e.id, type: 'animated', source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle }));

const toWorkflowGraph = (nodes: WFNode[], edges: WFEdge[]): WorkflowGraph => ({
	nodes: nodes.map(n => ({
		id:          n.id,
		label:       n.data.label,
		description: n.data.description,
		inputs:      n.data.inputs,
		outputs:     n.data.outputs,
		position:    n.position,
	})),
	edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle ?? '', targetHandle: e.targetHandle ?? '' })),
});

// Arranges nodes into levels via BFS from entry nodes (nodes with no inputs — or,
// failing that, nodes with no incoming edges), then lays levels out along the flow
// axis and spreads siblings across the cross axis. Used on direction toggle so
// switching orientation always yields a sane graph.

const LEVEL_SPACING   = 260;
const SIBLING_SPACING = 220;

const computeLayeredLayout = (nds: WFNode[], eds: WFEdge[], direction: WorkflowDirection): WFNode[] => {
	const outgoing = new Map<string, string[]>();
	eds.forEach(e =>
	{
		if(!outgoing.has(e.source)) outgoing.set(e.source, []);
		outgoing.get(e.source)!.push(e.target);
	});

	const hasIncoming = new Set(eds.map(e => e.target));
	const entryIds    = nds.filter(n => n.data.inputs.length === 0).map(n => n.id);
	const rootIds     = entryIds.length > 0 ? entryIds : nds.filter(n => !hasIncoming.has(n.id)).map(n => n.id);

	const level = new Map<string, number>();
	let frontier = rootIds.length > 0 ? rootIds : nds.slice(0, 1).map(n => n.id);
	frontier.forEach(id => level.set(id, 0));

	let depth = 0;
	while(frontier.length > 0)
	{
		const next: string[] = [];
		frontier.forEach(id =>
		{
			(outgoing.get(id) ?? []).forEach(targetId =>
			{
				if(!level.has(targetId))
				{
					level.set(targetId, depth + 1);
					next.push(targetId);
				}
			});
		});
		frontier = next;
		depth++;
	}

	let maxLevel = Math.max(0, ...level.values());
	nds.forEach(n => { if(!level.has(n.id)) level.set(n.id, ++maxLevel); });

	const byLevel = new Map<number, string[]>();
	nds.forEach(n =>
	{
		const lv = level.get(n.id)!;
		if(!byLevel.has(lv)) byLevel.set(lv, []);
		byLevel.get(lv)!.push(n.id);
	});

	const maxCount  = Math.max(...[...byLevel.values()].map(ids => ids.length));
	const positions = new Map<string, { x: number; y: number }>();

	byLevel.forEach((ids, lv) =>
	{
		const crossOffset = Math.round(((maxCount - ids.length) * SIBLING_SPACING) / 2 / GRID_SIZE) * GRID_SIZE;
		ids.forEach((id, i) =>
		{
			const main  = lv * LEVEL_SPACING;
			const cross = crossOffset + i * SIBLING_SPACING;
			positions.set(id, direction === 'horizontal' ? { x: main, y: cross } : { x: cross, y: main });
		});
	});

	return nds.map(n => ({ ...n, position: positions.get(n.id) ?? n.position }));
};

const WorkflowBuilder = ({ defaultGraph, onChange, height = 500, className = '', defaultDirection, readOnly = false }: WorkflowBuilderProps) => {
	const initialDirection: WorkflowDirection = defaultDirection ?? 'horizontal';

	const initialNodes = defaultGraph
		? toRFNodes(defaultGraph.nodes)
		: initialDirection === 'vertical'
			? computeLayeredLayout(DEMO_NODES, DEMO_EDGES, 'vertical')
			: DEMO_NODES;
	const initialEdges = defaultGraph ? toRFEdges(defaultGraph.edges) : DEMO_EDGES;

	const [nodes, setNodes, onNodesChange] = useNodesState<WFNode>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState<WFEdge>(initialEdges);
	const [direction, setDirection]        = useState<WorkflowDirection>(initialDirection);

	const [runPhase,         setRunPhase]        = useState<RunPhase>('idle');
	const [nodeRunStates,    setNodeRunStates]    = useState<Map<string, NodeRunState>>(new Map());
	const [animatingEdgeIds, setAnimatingEdgeIds] = useState<Set<string>>(new Set());
	const [completedEdgeIds, setCompletedEdgeIds] = useState<Set<string>>(new Set());

	const onChangeRef  = useRef(onChange);
	const nodeCounter  = useRef(200);
	const portCounter  = useRef(200);
	const runGenRef    = useRef(0);
	const rfInstance   = useRef<ReactFlowInstance<WFNode, WFEdge> | null>(null);

	const prefersReducedMotion = typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const selectedNode = nodes.find(n => n.selected) ?? null;

	useEffect(() => { onChangeRef.current = onChange; });

	useEffect(() =>
	{
		onChangeRef.current?.(toWorkflowGraph(nodes, edges));
	}, [nodes, edges]);

	const onConnect = useCallback((params: Connection) =>
	{
		setEdges(eds => addEdge({ ...params, id: `e-${Date.now()}`, type: 'animated' }, eds));
	}, [setEdges]);

	const addNode = () => {
		const id       = `n${++nodeCounter.current}`;
		const inputId  = `p${++portCounter.current}`;
		const outputId = `p${++portCounter.current}`;
		setNodes(nds => [
			...nds,
			{
				id,
				type:     'workflow',
				position: {
					x: Math.round((180 + Math.random() * 160) / GRID_SIZE) * GRID_SIZE,
					y: Math.round((100 + Math.random() * 200) / GRID_SIZE) * GRID_SIZE,
				},
				data:     {
					label:       'Untitled node',
					description: '',
					inputs:      [{ id: inputId, label: 'in' }],
					outputs:     [{ id: outputId, label: 'out' }],
				},
			},
		]);
	};

	const deselectAll = () => {
		setNodes(nds => nds.map(n => n.selected ? { ...n, selected: false } : n));
	};

	const updateSelectedNode = (patch: Partial<WFData>) => {
		if(!selectedNode) return;
		const nodeId = selectedNode.id;
		setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n));
	};

	const addPort = (kind: PortKind) => {
		if(!selectedNode) return;
		const newPort: WorkflowPort = { id: `p${++portCounter.current}`, label: kind === 'inputs' ? 'in' : 'out' };

		if(kind === 'inputs') updateSelectedNode({ inputs: [...selectedNode.data.inputs, newPort] });
		else                  updateSelectedNode({ outputs: [...selectedNode.data.outputs, newPort] });
	};

	const renamePort = (kind: PortKind, portId: string, label: string) => {
		if(!selectedNode) return;

		if(kind === 'inputs') updateSelectedNode({ inputs: selectedNode.data.inputs.map(p => p.id === portId ? { ...p, label } : p) });
		else                  updateSelectedNode({ outputs: selectedNode.data.outputs.map(p => p.id === portId ? { ...p, label } : p) });
	};

	const removePort = (kind: PortKind, portId: string) => {
		if(!selectedNode) return;
		const nodeId = selectedNode.id;

		if(kind === 'inputs')
		{
			updateSelectedNode({ inputs: selectedNode.data.inputs.filter(p => p.id !== portId) });
			setEdges(eds => eds.filter(e => !(e.target === nodeId && e.targetHandle === portId)));
		}
		else
		{
			updateSelectedNode({ outputs: selectedNode.data.outputs.filter(p => p.id !== portId) });
			setEdges(eds => eds.filter(e => !(e.source === nodeId && e.sourceHandle === portId)));
		}
	};

	const handleDirectionChange = (next: WorkflowDirection) => {
		if(next === direction || runPhase !== 'idle') return;

		setDirection(next);
		setNodes(nds => computeLayeredLayout(nds, edges, next));

		requestAnimationFrame(() =>
		{
			rfInstance.current?.fitView({ padding: 0.3, duration: prefersReducedMotion ? 0 : 300 });
		});
	};

	const resetAnimation = () => {
		runGenRef.current++;
		setRunPhase('idle');
		setNodeRunStates(new Map());
		setAnimatingEdgeIds(new Set());
		setCompletedEdgeIds(new Set());
	};

	const runAnimation = async () => {
		if(runPhase !== 'idle') return;

		const gen   = ++runGenRef.current;
		const alive = () => runGenRef.current === gen;
		const go    = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

		const currNodes = nodes;
		const currEdges = edges;

		// outgoingEdges: what fires out of a node once it completes.
		// incomingEdges: everything that must have completed before a node may fire —
		// a node with 2+ connected inputs only activates once ALL of them have arrived,
		// not on the first one. doneEdges is plain runtime bookkeeping (not React state):
		// concurrent branches read/write it synchronously, so it can't wait for a render.
		const outgoingEdges = new Map<string, { edgeId: string; targetId: string }[]>();
		const incomingEdges = new Map<string, string[]>();
		currEdges.forEach(e =>
		{
			if(!outgoingEdges.has(e.source)) outgoingEdges.set(e.source, []);
			outgoingEdges.get(e.source)!.push({ edgeId: e.id, targetId: e.target });

			if(!incomingEdges.has(e.target)) incomingEdges.set(e.target, []);
			incomingEdges.get(e.target)!.push(e.id);
		});

		const entryIds = currNodes
			.filter(n => n.data.inputs.length === 0)
			.map(n => n.id);

		if(entryIds.length === 0) return;

		setRunPhase('running');
		setNodeRunStates(new Map(entryIds.map(id => [id, 'active' as NodeRunState])));

		const doneEdges = new Set<string>();
		const claimed   = new Set<string>(entryIds);

		const activateNode = async (nodeId: string, dwellMs: number): Promise<void> => {
			if(!prefersReducedMotion) await go(dwellMs);
			if(!alive()) return;

			const myOutgoing = outgoingEdges.get(nodeId) ?? [];

			if(myOutgoing.length === 0)
			{
				setNodeRunStates(prev => new Map(prev).set(nodeId, 'completed'));
				return;
			}

			if(!prefersReducedMotion)
			{
				const edgeIds = myOutgoing.map(e => e.edgeId);
				setAnimatingEdgeIds(prev => new Set([...prev, ...edgeIds]));
				await go(EDGE_TRAVEL_MS);
				if(!alive()) return;
				setAnimatingEdgeIds(prev =>
				{
					const next = new Set(prev);
					edgeIds.forEach(id => next.delete(id));
					return next;
				});
				// Edges that just animated stay lit as "completed"
				setCompletedEdgeIds(prev => new Set([...prev, ...edgeIds]));
			}

			myOutgoing.forEach(e => doneEdges.add(e.edgeId));
			setNodeRunStates(prev => new Map(prev).set(nodeId, 'completed'));

			// Each downstream target only activates once every edge feeding it has
			// arrived. Whichever branch delivers the LAST required edge is the one
			// that wins the race and fires it — earlier arrivals just no-op here.
			await Promise.all(myOutgoing.map(async ({ targetId }) =>
			{
				const required = incomingEdges.get(targetId) ?? [];
				const isReady  = required.every(id => doneEdges.has(id));
				if(!isReady || claimed.has(targetId)) return;

				claimed.add(targetId);
				setNodeRunStates(prev => new Map(prev).set(targetId, 'active'));
				await activateNode(targetId, NODE_DWELL_MS);
			}));
		};

		await Promise.all(entryIds.map(id => activateNode(id, TRIGGER_DWELL_MS)));
		if(!alive()) return;

		setRunPhase('complete');

		await go(prefersReducedMotion ? REDUCED_MOTION_HOLD_MS : COMPLETE_HOLD_MS);
		if(!alive()) return;

		resetAnimation();
	};

	const TOOLBAR_BTN = [
		'flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-text text-left',
		'rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-fast)]',
		'hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
	].join(' ');

	const RUN_BTN_BASE = [
		'flex items-center justify-center gap-1.5 w-full h-8 mt-0.5 text-xs font-medium',
		'rounded-[var(--radius-sm)] border transition-colors duration-[var(--duration-fast)]',
		'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
		'disabled:opacity-70',
	].join(' ');

	const RUN_BTN_STATE: Record<RunPhase, string> = {
		idle:     'bg-brand text-brand-fg border-transparent hover:bg-brand-hover active:bg-brand-active focus-visible:ring-brand-ring',
		running:  'bg-danger/10 text-danger border-danger/20 hover:bg-danger/15 focus-visible:ring-danger-ring',
		complete: 'bg-success-bg text-success border-success-border focus-visible:ring-brand-ring',
	};

	const runBtnLabel = runPhase === 'running' ? '◼ Stop' : runPhase === 'complete' ? '✓ Done' : '▶ Run';

	const FIELD_INPUT = 'text-xs text-text bg-surface border border-input-border rounded-[var(--radius-sm)] px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';
	const FIELD_LABEL = 'text-[10px] font-medium text-text-subtle uppercase tracking-wider';
	const ICON_BTN     = 'shrink-0 w-[18px] h-[18px] flex items-center justify-center rounded-full text-text-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';

	const runCtxValue: RunContextValue = {
		runPhase,
		nodeRunStates,
		animatingEdgeIds,
		completedEdgeIds,
		prefersReducedMotion,
		direction,
		readOnly,
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
					nodesDraggable={!readOnly}
					nodesConnectable={!readOnly}
					elementsSelectable={!readOnly}
					deleteKeyCode={readOnly ? [] : ['Delete', 'Backspace']}
					onInit={instance => { rfInstance.current = instance; }}
					defaultEdgeOptions={{ style: EDGE_IDLE_STYLE }}
					connectionLineStyle={{ stroke: 'var(--color-brand)', strokeWidth: 2 }}
					proOptions={{ hideAttribution: true }}
					snapToGrid
					snapGrid={[GRID_SIZE, GRID_SIZE]}
				>
					<Background color='var(--color-surface-border)' gap={GRID_SIZE} />
					<Controls style={CONTROLS_STYLE} />

					{!readOnly && (
						<Panel position='top-left'>
							<div
								className='flex flex-col gap-0.5 p-2 bg-surface border border-surface-border rounded-[var(--radius)] shadow-[var(--shadow-sm)]'
								role='toolbar'
								aria-label='Workflow controls'
							>
								<button
									type='button'
									onClick={addNode}
									disabled={runPhase !== 'idle'}
									className={[
										TOOLBAR_BTN,
										runPhase !== 'idle' ? 'opacity-40 pointer-events-none' : '',
									].join(' ')}
									aria-label='Add node'
								>
									<span aria-hidden='true'>+</span>
									Add node
								</button>

								<div className='border-t border-surface-border my-1' aria-hidden='true' />

								<span className='text-[10px] font-semibold text-text-subtle uppercase tracking-wider px-1 pb-1'>
									Layout
								</span>
								<ToggleGroup
									type='single'
									size='sm'
									value={direction}
									onValueChange={value => handleDirectionChange(value as WorkflowDirection)}
									disabled={runPhase !== 'idle'}
									aria-label='Workflow layout direction'
									className='w-full'
								>
									<ToggleGroupItem value='horizontal' className='flex-1'>Horizontal</ToggleGroupItem>
									<ToggleGroupItem value='vertical' className='flex-1'>Vertical</ToggleGroupItem>
								</ToggleGroup>

								<div className='border-t border-surface-border my-1' aria-hidden='true' />

								<button
									type='button'
									onClick={runPhase === 'running' ? resetAnimation : runAnimation}
									disabled={runPhase === 'complete'}
									className={[RUN_BTN_BASE, RUN_BTN_STATE[runPhase]].join(' ')}
									aria-label={runPhase === 'running' ? 'Stop animation' : 'Run workflow animation'}
								>
									{runBtnLabel}
								</button>
							</div>
						</Panel>
					)}

					{!readOnly && selectedNode && (
						<Panel position='top-right' style={{ margin: 0, top: 0, right: 0, bottom: 0 }}>
							<aside
								className='w-72 max-w-[85vw] h-full flex flex-col bg-surface border-l-[length:var(--border-width)] border-surface-border shadow-[var(--shadow-sm)] overflow-y-auto scrollbar-thin'
								aria-label='Node inspector'
							>
								<div className='flex items-start justify-between gap-2 px-3 pt-3 pb-2 border-b border-surface-border'>
									<div className='min-w-0'>
										<p className={FIELD_LABEL}>Node</p>
										<p className='text-[10px] text-text-subtle font-mono truncate' title={selectedNode.id}>
											{selectedNode.id}
										</p>
									</div>
									<button
										type='button'
										onClick={deselectAll}
										className={`${ICON_BTN} hover:bg-surface-hover hover:text-text`}
										aria-label='Close node inspector'
									>
										×
									</button>
								</div>

								<div className='flex flex-col gap-3 px-3 py-3'>
									<label className='flex flex-col gap-1'>
										<span className={FIELD_LABEL}>Title</span>
										<input
											value={selectedNode.data.label}
											onChange={e => updateSelectedNode({ label: e.target.value })}
											className={FIELD_INPUT}
										/>
									</label>

									<label className='flex flex-col gap-1'>
										<span className={FIELD_LABEL}>Description</span>
										<textarea
											value={selectedNode.data.description}
											onChange={e => updateSelectedNode({ description: e.target.value })}
											rows={3}
											className={`${FIELD_INPUT} resize-none`}
										/>
									</label>

									{(['inputs', 'outputs'] as const).map(kind => (
										<div key={kind}>
											<span className={FIELD_LABEL}>{kind === 'inputs' ? 'Inputs' : 'Outputs'}</span>
											<div className='flex flex-col gap-1.5 mt-1.5'>
												{selectedNode.data[kind].map(port => (
													<div key={port.id} className='flex items-center gap-1.5'>
														<input
															value={port.label}
															onChange={e => renamePort(kind, port.id, e.target.value)}
															aria-label={`${kind === 'inputs' ? 'Input' : 'Output'} port label`}
															className={`flex-1 min-w-0 ${FIELD_INPUT}`}
														/>
														<button
															type='button'
															onClick={() => removePort(kind, port.id)}
															aria-label={`Remove ${kind === 'inputs' ? 'input' : 'output'} ${port.label || ''}`}
															className={`${ICON_BTN} hover:bg-danger/20 hover:text-danger`}
														>
															×
														</button>
													</div>
												))}
											</div>
											<button
												type='button'
												onClick={() => addPort(kind)}
												className='mt-1.5 text-[11px] text-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring rounded-sm'
											>
												+ Add {kind === 'inputs' ? 'input' : 'output'}
											</button>
										</div>
									))}
								</div>
							</aside>
						</Panel>
					)}
				</ReactFlow>
			</div>
		</RunContext.Provider>
	);
};

export default WorkflowBuilder;
