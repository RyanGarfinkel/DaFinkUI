import WorkflowBuilder, { type WorkflowGraph } from './WorkflowBuilder';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// ─── Mock @xyflow/react ────────────────────────────────────────────────────────
// React Flow relies on ResizeObserver, SVG measurements, and complex DOM APIs
// that are unavailable in jsdom. We mock the library so we can test the
// WorkflowBuilder's own logic without involving React Flow internals.

vi.mock('@xyflow/react/dist/style.css', () => ({}));

type MockNode = { id: string; type?: string; data?: { label?: string }; position?: { x: number; y: number } };
type MockEdge = { id: string; source?: string; target?: string };
type MockNodeComponent = React.ComponentType<{ id: string; data: { label?: string }; selected: boolean }>;

vi.mock('@xyflow/react', async () =>
{
	const { useState } = await vi.importActual<typeof import('react')>('react');

	const ReactFlow = ({ children, nodes, edges, nodeTypes }: {
		children?: React.ReactNode;
		nodes?: MockNode[];
		edges?: MockEdge[];
		onConnect?: (connection: unknown) => void;
		nodeTypes?: Record<string, MockNodeComponent>;
	}) =>
	{
		const WorkflowNode = nodeTypes?.workflow;
		return (
			<div data-testid='react-flow'>
				{nodes?.map((n: MockNode) =>
					WorkflowNode
						? <WorkflowNode key={n.id} id={n.id} data={n.data ?? {}} selected={false} />
						: <div key={n.id} data-node-id={n.id}>{n.data?.label}</div>
				)}
				{edges?.map((e: MockEdge) => <div key={e.id} data-edge-id={e.id} />)}
				{children}
			</div>
		);
	};

	const Panel = ({ children }: { children?: React.ReactNode }) => <div data-testid='rf-panel'>{children}</div>;
	const Background = () => null;
	const Controls   = () => null;
	const Handle     = ({ type }: { type: string }) => <div data-testid={`handle-${type}`} />;
	const Position   = { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' };
	const addEdge    = (params: MockEdge, edges: MockEdge[]) => [...edges, { ...params, id: params.id ?? 'new-edge' }];

	const useNodesState = (initial: MockNode[]) =>
	{
		const [nodes, setNodes] = useState(initial);
		return [nodes, setNodes, () => {}] as const;
	};

	const useEdgesState = (initial: MockEdge[]) =>
	{
		const [edges, setEdges] = useState(initial);
		return [edges, setEdges, () => {}] as const;
	};

	const useReactFlow = () => ({ updateNodeData: vi.fn() });

	return { ReactFlow, Panel, Background, Controls, Handle, Position, addEdge, useNodesState, useEdgesState, useReactFlow };
});

// ─── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
		matches:             false,
		addEventListener:    vi.fn(),
		removeEventListener: vi.fn(),
	}));
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('WorkflowBuilder', () =>
{
	it('renders without errors', () =>
	{
		render(<WorkflowBuilder />);
		expect(screen.getByTestId('react-flow')).toBeTruthy();
	});

	it('renders the demo graph by default (5 nodes)', () =>
	{
		render(<WorkflowBuilder />);
		expect(screen.getByText('User submits form')).toBeTruthy();
		expect(screen.getByText('Score > 80?')).toBeTruthy();
		expect(screen.getByText('Send approval email')).toBeTruthy();
		expect(screen.getByText('Format rejection msg')).toBeTruthy();
		expect(screen.getByText('Return result')).toBeTruthy();
	});

	it('renders a custom defaultGraph when provided', () =>
	{
		const graph: WorkflowGraph = {
			nodes: [
				{ id: 'a', type: 'trigger', label: 'Custom trigger', position: { x: 0, y: 0 } },
				{ id: 'b', type: 'output',  label: 'Custom output',  position: { x: 200, y: 0 } },
			],
			edges: [{ id: 'e1', source: 'a', target: 'b' }],
		};
		render(<WorkflowBuilder defaultGraph={graph} />);
		expect(screen.getByText('Custom trigger')).toBeTruthy();
		expect(screen.getByText('Custom output')).toBeTruthy();
	});

	it('shows the Add node toolbar with all five node types', () =>
	{
		render(<WorkflowBuilder />);
		expect(screen.getByRole('toolbar', { name: /workflow controls/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: /add trigger/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: /add condition/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: /add action/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: /add transform/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: /add output/i })).toBeTruthy();
	});

	it('fires onChange with the current graph on mount', () =>
	{
		const onChange = vi.fn();
		render(<WorkflowBuilder onChange={onChange} />);
		expect(onChange).toHaveBeenCalledTimes(1);
		const graph: WorkflowGraph = onChange.mock.calls[0][0];
		expect(graph.nodes).toHaveLength(5);
		expect(graph.edges).toHaveLength(5);
	});

	it('calls onChange with updated graph when a node is added via toolbar', () =>
	{
		const onChange = vi.fn();
		render(<WorkflowBuilder onChange={onChange} />);
		onChange.mockClear();

		fireEvent.click(screen.getByRole('button', { name: /add trigger/i }));

		expect(onChange).toHaveBeenCalledTimes(1);
		const graph: WorkflowGraph = onChange.mock.calls[0][0];
		expect(graph.nodes).toHaveLength(6);
		expect(graph.nodes.some(n => n.type === 'trigger')).toBe(true);
	});

	it('applies custom className', () =>
	{
		const { container } = render(<WorkflowBuilder className='my-custom-class' />);
		expect(container.firstChild).toBeTruthy();
		expect((container.firstChild as HTMLElement).className).toContain('my-custom-class');
	});

	it('applies custom height via inline style', () =>
	{
		const { container } = render(<WorkflowBuilder height={600} />);
		expect((container.firstChild as HTMLElement).style.height).toBe('600px');
	});
});

// ─── WorkflowNode label editing ───────────────────────────────────────────────

describe('WorkflowNode label editing', () =>
{
	beforeEach(() =>
	{
		vi.clearAllMocks();
	});

	it('shows the node label as a clickable element', () =>
	{
		render(<WorkflowBuilder />);
		const labelEl = screen.getByRole('button', { name: /User submits form/i });
		expect(labelEl).toBeTruthy();
	});

	it('switches to an input when the label is clicked', () =>
	{
		render(<WorkflowBuilder />);
		const labelEl = screen.getByRole('button', { name: /User submits form/i });
		fireEvent.click(labelEl);

		const input = screen.getByRole('textbox', { name: /edit label for trigger/i });
		expect(input).toBeTruthy();
		expect((input as HTMLInputElement).value).toBe('User submits form');
	});

	it('shows node type labels', () =>
	{
		render(<WorkflowBuilder />);
		expect(screen.getAllByText('Trigger').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Condition').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Action').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Transform').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Output').length).toBeGreaterThan(0);
	});

	it('renders source and target handles for each node', () =>
	{
		render(<WorkflowBuilder />);
		const targets = screen.getAllByTestId('handle-target');
		const sources = screen.getAllByTestId('handle-source');
		expect(targets.length).toBe(5);
		expect(sources.length).toBe(5);
	});
});
