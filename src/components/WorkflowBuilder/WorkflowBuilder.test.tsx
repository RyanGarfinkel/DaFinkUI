import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import WorkflowBuilder, { type WorkflowGraph } from './WorkflowBuilder';
import { render, screen, fireEvent } from '@testing-library/react';

// React Flow relies on ResizeObserver, SVG measurements, and complex DOM APIs
// that are unavailable in jsdom. We mock the library so we can test the
// WorkflowBuilder's own logic without involving React Flow internals.
//
// The mock reimplements just enough of node selection to test the inspector
// panel: clicking a node's wrapper dispatches a 'select' NodeChange (selecting
// that node, deselecting the rest) through onNodesChange, and the mock's
// useNodesState applies it — mirroring what real @xyflow/react does.

vi.mock('@xyflow/react/dist/style.css', () => ({}));

type MockPort = { id: string; label: string };
type MockNodeData = { label?: string; description?: string; inputs?: MockPort[]; outputs?: MockPort[] };
type MockNode = { id: string; type?: string; data?: MockNodeData; position?: { x: number; y: number }; selected?: boolean };
type MockEdge = { id: string; source?: string; target?: string };
type MockNodeComponent = React.ComponentType<{ id: string; data: MockNodeData; selected: boolean }>;
type MockNodeChange = { type: 'select'; id: string; selected: boolean };

vi.mock('@xyflow/react', async () =>
{
	const { useState } = await vi.importActual<typeof import('react')>('react');

	const ReactFlow = ({ children, nodes, edges, nodeTypes, onNodesChange }: {
		children?: React.ReactNode;
		nodes?: MockNode[];
		edges?: MockEdge[];
		onConnect?: (connection: unknown) => void;
		onNodesChange?: (changes: MockNodeChange[]) => void;
		nodeTypes?: Record<string, MockNodeComponent>;
	}) => {
		const WorkflowNode = nodeTypes?.workflow;
		return (
			<div data-testid='react-flow'>
				{nodes?.map((n: MockNode) => (
					<div
						key={n.id}
						data-testid={`node-wrapper-${n.id}`}
						onClick={() => onNodesChange?.(nodes.map(other => ({ type: 'select', id: other.id, selected: other.id === n.id })))}
					>
						{WorkflowNode
							? <WorkflowNode id={n.id} data={n.data ?? {}} selected={n.selected ?? false} />
							: <div data-node-id={n.id}>{n.data?.label}</div>}
					</div>
				))}
				{edges?.map((e: MockEdge) => <div key={e.id} data-edge-id={e.id} />)}
				{children}
			</div>
		);
	};

	const Panel = ({ children }: { children?: React.ReactNode }) => <div data-testid='rf-panel'>{children}</div>;
	const Background = () => null;
	const Controls   = () => null;
	const Handle     = ({ type, id }: { type: string; id?: string }) => <div data-testid={`handle-${type}`} data-handle-id={id} />;
	const Position   = { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' };
	const addEdge    = (params: MockEdge, edges: MockEdge[]) => [...edges, { ...params, id: params.id ?? 'new-edge' }];

	const useNodesState = (initial: MockNode[]) => {
		const [nodes, setNodes] = useState(initial);
		const onNodesChange = (changes: MockNodeChange[]) => {
			setNodes(nds => nds.map(n =>
			{
				const change = changes.find(c => c.id === n.id);
				return change ? { ...n, selected: change.selected } : n;
			}));
		};
		return [nodes, setNodes, onNodesChange] as const;
	};

	const useEdgesState = (initial: MockEdge[]) => {
		const [edges, setEdges] = useState(initial);
		return [edges, setEdges, () => {}] as const;
	};

	const useReactFlow = () => ({ updateNodeData: vi.fn() });

	return { ReactFlow, Panel, Background, Controls, Handle, Position, addEdge, useNodesState, useEdgesState, useReactFlow };
});

beforeEach(() =>
{
	vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
		matches:             false,
		addEventListener:    vi.fn(),
		removeEventListener: vi.fn(),
	}));
});

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
		expect(screen.getByText('Form submitted')).toBeTruthy();
		expect(screen.getByText('Score check')).toBeTruthy();
		expect(screen.getByText('Send approval email')).toBeTruthy();
		expect(screen.getByText('Format rejection msg')).toBeTruthy();
		expect(screen.getByText('Return result')).toBeTruthy();
	});

	it('renders a custom defaultGraph when provided', () =>
	{
		const graph: WorkflowGraph = {
			nodes: [
				{ id: 'a', label: 'Custom entry',    inputs: [],                          outputs: [{ id: 'out', label: 'out' }], position: { x: 0, y: 0 } },
				{ id: 'b', label: 'Custom terminal', inputs: [{ id: 'in', label: 'in' }], outputs: [],                            position: { x: 200, y: 0 } },
			],
			edges: [{ id: 'e1', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in' }],
		};
		render(<WorkflowBuilder defaultGraph={graph} />);
		expect(screen.getByText('Custom entry')).toBeTruthy();
		expect(screen.getByText('Custom terminal')).toBeTruthy();
	});

	it('shows a single generic Add node button in the toolbar', () =>
	{
		render(<WorkflowBuilder />);
		expect(screen.getByRole('toolbar', { name: /workflow controls/i })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Add node' })).toBeTruthy();
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

		fireEvent.click(screen.getByRole('button', { name: 'Add node' }));

		expect(onChange).toHaveBeenCalledTimes(1);
		const graph: WorkflowGraph = onChange.mock.calls[0][0];
		expect(graph.nodes).toHaveLength(6);
		const added = graph.nodes.find(n => n.label === 'Untitled node');
		expect(added?.inputs).toHaveLength(1);
		expect(added?.outputs).toHaveLength(1);
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

describe('WorkflowNode ports', () =>
{
	it('renders one target handle per input port and one source handle per output port', () =>
	{
		render(<WorkflowBuilder />);
		// Demo graph totals: 0+1+1+1+2 = 5 inputs, 1+2+1+1+0 = 5 outputs.
		expect(screen.getAllByTestId('handle-target').length).toBe(5);
		expect(screen.getAllByTestId('handle-source').length).toBe(5);
	});

	it('renders no delete-editing affordance on the node label itself', () =>
	{
		render(<WorkflowBuilder />);
		expect(screen.queryByRole('button', { name: /edit label/i })).toBeNull();
	});
});

describe('WorkflowBuilder node inspector panel', () =>
{
	it('is hidden until a node is selected', () =>
	{
		render(<WorkflowBuilder />);
		expect(screen.queryByRole('textbox', { name: 'Title' })).toBeNull();
	});

	it('shows a Title field pre-filled with the selected node\'s label', () =>
	{
		render(<WorkflowBuilder />);
		fireEvent.click(screen.getByTestId('node-wrapper-n1'));

		const title = screen.getByRole('textbox', { name: 'Title' }) as HTMLInputElement;
		expect(title.value).toBe('Form submitted');
	});

	it('updates the graph when the Title field is edited', () =>
	{
		const onChange = vi.fn();
		render(<WorkflowBuilder onChange={onChange} />);
		fireEvent.click(screen.getByTestId('node-wrapper-n1'));
		onChange.mockClear();

		fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: 'Renamed node' } });

		const graph: WorkflowGraph = onChange.mock.calls.at(-1)![0];
		expect(graph.nodes.find(n => n.id === 'n1')?.label).toBe('Renamed node');
	});

	it('closes when the close button is clicked', () =>
	{
		render(<WorkflowBuilder />);
		fireEvent.click(screen.getByTestId('node-wrapper-n1'));
		expect(screen.getByRole('textbox', { name: 'Title' })).toBeTruthy();

		fireEvent.click(screen.getByRole('button', { name: 'Close node inspector' }));

		expect(screen.queryByRole('textbox', { name: 'Title' })).toBeNull();
	});

	it('adds an input port via "+ Add input" and removes it via its × button', () =>
	{
		const onChange = vi.fn();
		render(<WorkflowBuilder onChange={onChange} />);
		fireEvent.click(screen.getByTestId('node-wrapper-n1')); // n1 starts with 0 inputs

		fireEvent.click(screen.getByRole('button', { name: '+ Add input' }));

		let graph: WorkflowGraph = onChange.mock.calls.at(-1)![0];
		expect(graph.nodes.find(n => n.id === 'n1')?.inputs).toHaveLength(1);

		fireEvent.click(screen.getByRole('button', { name: /remove input/i }));

		graph = onChange.mock.calls.at(-1)![0];
		expect(graph.nodes.find(n => n.id === 'n1')?.inputs).toHaveLength(0);
	});

	it('removing an output port also removes edges connected to it', () =>
	{
		const onChange = vi.fn();
		render(<WorkflowBuilder onChange={onChange} />);
		fireEvent.click(screen.getByTestId('node-wrapper-n1')); // n1's single output ('out') feeds edge e1

		fireEvent.click(screen.getByRole('button', { name: /remove output/i }));

		const graph: WorkflowGraph = onChange.mock.calls.at(-1)![0];
		expect(graph.nodes.find(n => n.id === 'n1')?.outputs).toHaveLength(0);
		expect(graph.edges.find(e => e.id === 'e1')).toBeUndefined();
	});
});

describe('WorkflowBuilder layout direction', () =>
{
	it('shows a Horizontal/Vertical layout toggle with Horizontal active by default', () =>
	{
		render(<WorkflowBuilder />);
		const horizontal = screen.getByRole('button', { name: 'Horizontal' });
		const vertical    = screen.getByRole('button', { name: 'Vertical' });
		expect(horizontal.getAttribute('aria-pressed')).toBe('true');
		expect(vertical.getAttribute('aria-pressed')).toBe('false');
	});

	it('switches the active toggle item when Vertical is clicked', () =>
	{
		render(<WorkflowBuilder />);
		fireEvent.click(screen.getByRole('button', { name: 'Vertical' }));

		expect(screen.getByRole('button', { name: 'Vertical' }).getAttribute('aria-pressed')).toBe('true');
		expect(screen.getByRole('button', { name: 'Horizontal' }).getAttribute('aria-pressed')).toBe('false');
	});

	it('honors defaultDirection="vertical" on initial render', () =>
	{
		render(<WorkflowBuilder defaultDirection='vertical' />);
		expect(screen.getByRole('button', { name: 'Vertical' }).getAttribute('aria-pressed')).toBe('true');
	});

	it('disables the layout toggle while the run animation is in progress', () =>
	{
		render(<WorkflowBuilder />);
		fireEvent.click(screen.getByRole('button', { name: 'Run workflow animation' }));

		expect((screen.getByRole('button', { name: 'Horizontal' }) as HTMLButtonElement).disabled).toBe(true);
		expect((screen.getByRole('button', { name: 'Vertical' }) as HTMLButtonElement).disabled).toBe(true);
	});
});

// Regression coverage: a node with multiple connected inputs must wait for ALL of
// them, not activate as soon as the first one arrives. This graph has a fast
// 1-hop branch and a slow 2-hop branch both feeding "merge" — under the old
// first-edge-wins logic, merge would (incorrectly) finish shortly after the fast
// branch alone arrived, well before the slow branch actually got there.

describe('WorkflowBuilder run animation dependency gating', () =>
{
	beforeEach(() => { vi.useFakeTimers(); });
	afterEach(() => { vi.useRealTimers(); });

	it('does not mark a merge node completed until every incoming branch has arrived', async () =>
	{
		const graph: WorkflowGraph = {
			nodes: [
				{ id: 'entry', label: 'Entry', inputs: [], outputs: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }], position: { x: 0, y: 0 } },
				{ id: 'fast',  label: 'Fast branch',   inputs: [{ id: 'in', label: 'in' }], outputs: [{ id: 'out', label: 'out' }], position: { x: 0, y: 0 } },
				{ id: 'slow1', label: 'Slow branch 1', inputs: [{ id: 'in', label: 'in' }], outputs: [{ id: 'out', label: 'out' }], position: { x: 0, y: 0 } },
				{ id: 'slow2', label: 'Slow branch 2', inputs: [{ id: 'in', label: 'in' }], outputs: [{ id: 'out', label: 'out' }], position: { x: 0, y: 0 } },
				{ id: 'merge', label: 'Merge',         inputs: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }], outputs: [], position: { x: 0, y: 0 } },
			],
			edges: [
				{ id: 'e1', source: 'entry', target: 'fast',  sourceHandle: 'a', targetHandle: 'in' },
				{ id: 'e2', source: 'entry', target: 'slow1', sourceHandle: 'b', targetHandle: 'in' },
				{ id: 'e3', source: 'slow1', target: 'slow2', sourceHandle: 'out', targetHandle: 'in' },
				{ id: 'e4', source: 'fast',  target: 'merge', sourceHandle: 'out', targetHandle: 'a' },
				{ id: 'e5', source: 'slow2', target: 'merge', sourceHandle: 'out', targetHandle: 'b' },
			],
		};

		render(<WorkflowBuilder defaultGraph={graph} />);
		fireEvent.click(screen.getByRole('button', { name: 'Run workflow animation' }));

		const mergeIsCompleted = () => screen.getByLabelText('Node: Merge').className.includes('opacity-60');

		// Timeline (TRIGGER_DWELL 250 + EDGE_TRAVEL 450 + NODE_DWELL 200 + EDGE_TRAVEL 450 = 1350ms)
		// is when the fast branch alone has reached merge. The old first-edge-wins logic
		// would already have completed merge shortly after this; the fix must not have.
		await vi.advanceTimersByTimeAsync(1600);
		expect(mergeIsCompleted()).toBe(false);

		// The slow branch needs one more hop's worth of time (NODE_DWELL + EDGE_TRAVEL) to
		// arrive, plus merge's own final NODE_DWELL before it completes (no outgoing edges).
		await vi.advanceTimersByTimeAsync(900);
		expect(mergeIsCompleted()).toBe(true);
	});
});
