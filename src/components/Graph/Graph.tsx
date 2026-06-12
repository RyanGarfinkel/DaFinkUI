'use client';

import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface GraphNode
{
	id:     string;
	label:  string;
	group?: string;
}

export interface GraphEdge
{
	source: string;
	target: string;
}

export interface GraphProps
{
	nodes:           GraphNode[];
	edges:           GraphEdge[];
	width?:          number;
	height?:         number;
	className?:      string;
	onNodeSelect?:   (node: GraphNode) => void;
}

interface NodePos
{
	id: string;
	x:  number;
	y:  number;
}

interface Transform
{
	x:     number;
	y:     number;
	scale: number;
}

const PAN_STEP   = 20;
const ZOOM_STEP  = 0.15;
const MIN_SCALE  = 0.2;
const MAX_SCALE  = 4;
const TICK_COUNT = 300;

interface SimNode extends SimulationNodeDatum
{
	id: string;
}

const buildPositions = (nodes: GraphNode[], edges: GraphEdge[], w: number, h: number): NodePos[] =>
{
	if(nodes.length === 0) return [];

	const simNodes: SimNode[] = nodes.map(n => ({ id: n.id, x: w / 2, y: h / 2 }));
	const simLinks: SimulationLinkDatum<SimNode>[] = edges.map(e => ({ source: e.source, target: e.target }));

	const sim = forceSimulation<SimNode>(simNodes)
		.force('center',   forceCenter(w / 2, h / 2))
		.force('charge',   forceManyBody<SimNode>().strength(-120))
		.force('link',     forceLink<SimNode, SimulationLinkDatum<SimNode>>(simLinks).id(d => d.id).distance(80))
		.force('collide',  forceCollide<SimNode>(20))
		.stop();

	for(let i = 0; i < TICK_COUNT; i++) sim.tick();

	return simNodes.map(n => ({ id: n.id, x: n.x ?? w / 2, y: n.y ?? h / 2 }));
};

const Graph = ({ nodes, edges, width = 600, height = 400, className, onNodeSelect }: GraphProps) =>
{
	const [positions,    setPositions]    = useState<NodePos[]>([]);
	const [hoveredId,    setHoveredId]    = useState<string | null>(null);
	const [selectedId,   setSelectedId]   = useState<string | null>(null);
	const [transform,    setTransform]    = useState<Transform>({ x: 0, y: 0, scale: 1 });
	const [isPanning,    setIsPanning]    = useState(false);
	const [announcement, setAnnouncement] = useState('');

	const dragRef    = useRef<{ nodeId: string; startX: number; startY: number } | null>(null);
	const panRef     = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
	const svgRef     = useRef<SVGSVGElement>(null);
	const nodeRefs   = useRef<Map<string, SVGGElement>>(new Map());

	useEffect(() =>
	{
		const pos = buildPositions(nodes, edges, width, height);
		const count = `Graph has ${nodes.length} node${nodes.length !== 1 ? 's' : ''} and ${edges.length} edge${edges.length !== 1 ? 's' : ''}.`;
		const id = setTimeout(() =>
		{
			setPositions(pos);
			setAnnouncement(count);
		}, 0);
		return () => clearTimeout(id);
	}, [nodes, edges, width, height]);

	const getPos = useCallback((id: string) => positions.find(p => p.id === id), [positions]);

	const connectedEdges = hoveredId
		? edges.filter(e => e.source === hoveredId || e.target === hoveredId)
		: [];
	const connectedIds = new Set(connectedEdges.flatMap(e => [e.source, e.target]));

	const showLabels = nodes.length <= 50;

	const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) =>
	{
		e.stopPropagation();
		(e.target as Element).setPointerCapture(e.pointerId);
		dragRef.current = { nodeId, startX: e.clientX, startY: e.clientY };
	};

	const handlePointerMove = (e: React.PointerEvent) =>
	{
		if(dragRef.current)
		{
			const { nodeId } = dragRef.current;
			const dx = e.movementX / transform.scale;
			const dy = e.movementY / transform.scale;
			setPositions(prev => prev.map(p => p.id === nodeId ? { ...p, x: p.x + dx, y: p.y + dy } : p));
			return;
		}

		if(panRef.current)
		{
			const { startX, startY, origX, origY } = panRef.current;
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			setTransform(prev => ({ ...prev, x: origX + dx, y: origY + dy }));
		}
	};

	const handlePointerUp = () =>
	{
		dragRef.current = null;
		panRef.current  = null;
		setIsPanning(false);
	};

	const handleSvgPointerDown = (e: React.PointerEvent) =>
	{
		if((e.target as Element).closest('[data-node]')) return;
		panRef.current = { startX: e.clientX, startY: e.clientY, origX: transform.x, origY: transform.y };
		setIsPanning(true);
	};

	const handleWheel = (e: React.WheelEvent) =>
	{
		e.preventDefault();
		const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
		setTransform(prev => ({ ...prev, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale + delta)) }));
	};

	const selectNode = (node: GraphNode) =>
	{
		setSelectedId(node.id);
		setAnnouncement(`Selected: ${node.label}`);
		onNodeSelect?.(node);
	};

	const handleNodeKeyDown = (e: React.KeyboardEvent, node: GraphNode) =>
	{
		if(e.key === 'Enter' || e.key === ' ')
		{
			e.preventDefault();
			selectNode(node);
		}
		if(e.key === 'Escape')
		{
			e.preventDefault();
			setSelectedId(null);
			svgRef.current?.focus();
		}
	};

	const handleSvgKeyDown = (e: React.KeyboardEvent) =>
	{
		if(nodes.length === 0) return;

		if(e.key === 'ArrowRight' || e.key === 'ArrowDown')
		{
			e.preventDefault();
			const idx = selectedId ? nodes.findIndex(n => n.id === selectedId) : -1;
			const next = nodes[(idx + 1) % nodes.length];
			setSelectedId(next.id);
			nodeRefs.current.get(next.id)?.focus();
			return;
		}

		if(e.key === 'ArrowLeft' || e.key === 'ArrowUp')
		{
			e.preventDefault();
			const idx = selectedId ? nodes.findIndex(n => n.id === selectedId) : 0;
			const prev = nodes[(idx - 1 + nodes.length) % nodes.length];
			setSelectedId(prev.id);
			nodeRefs.current.get(prev.id)?.focus();
			return;
		}

		if(e.key === '+' || e.key === '=')
		{
			e.preventDefault();
			setTransform(prev => ({ ...prev, scale: Math.min(MAX_SCALE, prev.scale + ZOOM_STEP) }));
			return;
		}

		if(e.key === '-')
		{
			e.preventDefault();
			setTransform(prev => ({ ...prev, scale: Math.max(MIN_SCALE, prev.scale - ZOOM_STEP) }));
			return;
		}

		if(e.key === '0')
		{
			e.preventDefault();
			setTransform({ x: 0, y: 0, scale: 1 });
			return;
		}

		if(e.key === 'ArrowRight') setTransform(prev => ({ ...prev, x: prev.x - PAN_STEP }));
		if(e.key === 'ArrowLeft')  setTransform(prev => ({ ...prev, x: prev.x + PAN_STEP }));
		if(e.key === 'ArrowDown')  setTransform(prev => ({ ...prev, y: prev.y - PAN_STEP }));
		if(e.key === 'ArrowUp')    setTransform(prev => ({ ...prev, y: prev.y + PAN_STEP }));
	};

	const edgeDim = (e: GraphEdge) =>
	{
		if(!hoveredId) return false;
		return !connectedEdges.includes(e);
	};

	return (
		<div className={className} style={{ position: 'relative', width, height }}>
			<svg
				ref={svgRef}
				width={width}
				height={height}
				tabIndex={0}
				role='application'
				aria-label='Graph'
				className='block rounded-md border border-surface-border bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
				onPointerDown={handleSvgPointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onWheel={handleWheel}
				onKeyDown={handleSvgKeyDown}
				style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
			>
				<g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
					<g aria-hidden='true'>
						{edges.map((edge, i) =>
						{
							const src  = getPos(edge.source);
							const tgt  = getPos(edge.target);
							if(!src || !tgt) return null;
							const dim      = edgeDim(edge);
							const isActive = connectedEdges.includes(edge);
							return (
								<line
									key={i}
									x1={src.x}
									y1={src.y}
									x2={tgt.x}
									y2={tgt.y}
									stroke={isActive ? 'var(--color-brand)' : 'var(--color-surface-border)'}
									strokeWidth={isActive ? 2 : 1.5}
									opacity={dim ? 0.2 : 1}
								/>
							);
						})}
					</g>

					<g role='list' aria-label='Nodes'>
						{nodes.map(node =>
						{
							const pos        = getPos(node.id);
							if(!pos) return null;
							const isSelected = selectedId === node.id;
							const isHovered  = hoveredId  === node.id;
							const fill       = isSelected
								? 'var(--color-brand-active)'
								: isHovered
									? 'var(--color-brand-hover)'
									: 'var(--color-brand)';

							return (
								<g
									key={node.id}
									data-node={node.id}
									role='listitem'
									aria-label={node.label}
									aria-pressed={isSelected}
									tabIndex={isSelected ? 0 : -1}
									ref={el => { if(el) nodeRefs.current.set(node.id, el); else nodeRefs.current.delete(node.id); }}
									transform={`translate(${pos.x},${pos.y})`}
									style={{ cursor: 'pointer', outline: 'none' }}
									onPointerDown={e => handleNodePointerDown(e, node.id)}
									onPointerEnter={() => setHoveredId(node.id)}
									onPointerLeave={() => setHoveredId(null)}
									onClick={() => selectNode(node)}
									onKeyDown={e => handleNodeKeyDown(e, node)}
									onFocus={() => setSelectedId(node.id)}
								>
									<circle
										r={8}
										fill={fill}
										stroke='var(--color-surface-border)'
										strokeWidth={1.5}
									/>
									{isSelected && (
										<circle
											r={12}
											fill='none'
											stroke='var(--color-brand-ring)'
											strokeWidth={2}
											opacity={0.6}
										/>
									)}
									{showLabels && (
										<text
											y={20}
											fontSize={11}
											fill='var(--color-text-muted)'
											textAnchor='middle'
											style={{ userSelect: 'none', pointerEvents: 'none' }}
										>
											{node.label}
										</text>
									)}
								</g>
							);
						})}
					</g>
				</g>
			</svg>

			<div
				role='status'
				aria-live='polite'
				aria-atomic='true'
				style={{
					position: 'absolute',
					width:    1,
					height:   1,
					padding:  0,
					margin:   -1,
					overflow: 'hidden',
					clip:     'rect(0,0,0,0)',
					border:   0,
				}}
			>
				{announcement}
			</div>
		</div>
	);
};

export default Graph;
