'use client';

import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import { ToastProvider, useToast } from '@/src/components/Toast/Toast';
import { Typewriter } from '@/src/components/Typewriter/Typewriter';
import Badge, { BadgeVariant } from '@/src/components/Badge/Badge';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import Graph, { GraphNode } from '@/src/components/Graph/Graph';
import Button from '@/src/components/Button/Button';
import { useState, useEffect, useRef } from 'react';

// ─── Example 1: Deploy pipeline ────────────────────────────────────────────────

const PIPELINE_STEPS = [
	{ title: 'Clone repository',       log: 'main @ a1b2c3d · 0.4s',          failLog: 'fatal: repository not found'            },
	{ title: 'Install dependencies',   log: '847 packages installed · 4.2s',  failLog: 'npm ERR! 404 package not found'         },
	{ title: 'Run test suite',         log: '47 tests passed · 1.1s',          failLog: '3 tests failed — see output above'      },
	{ title: 'Build for production',   log: 'Bundle 142 kb gzipped · 8.3s',   failLog: 'error TS2322: Type mismatch'            },
	{ title: 'Deploy to edge network', log: 'Live at myapp.vercel.app · 2.0s', failLog: 'error: deployment quota exceeded'      },
];

type DeployStatus = 'idle' | 'running' | 'success' | 'failed';

const STATUS_BADGE: Record<DeployStatus, BadgeVariant> = {
	idle:    'outline',
	running: 'warning',
	success: 'success',
	failed:  'danger',
};

const DEPLOY_CODE = `'use client';

import { useState, useEffect } from 'react';
import { ToastProvider, useToast } from '@/src/components/Toast/Toast';
import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import Badge, { BadgeVariant } from '@/src/components/Badge/Badge';
import Button from '@/src/components/Button/Button';

type Status = 'idle' | 'running' | 'success' | 'failed';

const STEPS = [
  { title: 'Clone repository',       log: 'main @ a1b2c3d · 0.4s'          },
  { title: 'Install dependencies',   log: '847 packages installed · 4.2s'  },
  { title: 'Run test suite',         log: '47 tests passed · 1.1s'          },
  { title: 'Build for production',   log: 'Bundle 142 kb gzipped · 8.3s'   },
  { title: 'Deploy to edge network', log: 'Live at myapp.vercel.app · 2.0s' },
];

const STATUS_BADGE: Record<Status, BadgeVariant> = {
  idle: 'outline', running: 'warning', success: 'success', failed: 'danger',
};

function Pipeline() {
  const { toast }  = useToast();
  const [count,    setCount]    = useState(0);
  const [status,   setStatus]   = useState<Status>('idle');
  const [newIndex, setNewIndex] = useState<number | null>(null);

  const start = () => { setCount(1); setStatus('running'); setNewIndex(0); };
  const reset = () => { setCount(0); setStatus('idle'); setNewIndex(null); };

  useEffect(() => {
    if (status !== 'running') return;
    if (count >= STEPS.length) return;
    const id = setTimeout(() => {
      const next = count + 1;
      setNewIndex(count);
      setCount(next);
      if (next >= STEPS.length) {
        setStatus('success');
        toast({ title: 'Deployed', description: 'Live at myapp.vercel.app', variant: 'success' });
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [status, count, toast]);

  useEffect(() => {
    if (newIndex === null) return;
    const id = setTimeout(() => setNewIndex(null), 500);
    return () => clearTimeout(id);
  }, [newIndex]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text">Production deploy</p>
            <p className="text-xs text-text-muted font-mono">git push origin main</p>
          </div>
          <Badge variant={STATUS_BADGE[status]}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-5">
          {status === 'idle'    && <Button size="sm" onClick={start}>Deploy</Button>}
          {status === 'running' && <Button size="sm" variant="outlined" disabled>Running…</Button>}
          {status === 'success' && <Button size="sm" variant="outlined" onClick={reset}>Replay</Button>}
        </div>
        {count > 0 && (
          <Timeline animate="none">
            {STEPS.slice(0, count).map((step, i) => (
              <TimelineItem key={step.title} title={step.title}
                className={i === newIndex ? 'step-enter dot-pop' : ''}>
                <span className="text-text-muted text-xs">{step.log}</span>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </CardContent>
    </Card>
  );
}

export default function DeployPipeline() {
  return <ToastProvider><Pipeline /></ToastProvider>;
}`;

const PipelineInner = () =>
{
	const { toast }    = useToast();
	const delaysRef    = useRef<number[]>([]);
	const failAtRef    = useRef<number | null>(null);

	const [count,      setCount]      = useState(0);
	const [status,     setStatus]     = useState<DeployStatus>('idle');
	const [newIndex,   setNewIndex]   = useState<number | null>(null);
	const [failedStep, setFailedStep] = useState<number | null>(null);

	const start = () =>
	{
		delaysRef.current = PIPELINE_STEPS.map(() => 400 + Math.floor(Math.random() * 1100));
		failAtRef.current = Math.random() < 0.35
			? 1 + Math.floor(Math.random() * (PIPELINE_STEPS.length - 1))
			: null;
		setCount(1);
		setStatus('running');
		setNewIndex(0);
		setFailedStep(null);
	};

	const reset = () => { setCount(0); setStatus('idle'); setNewIndex(null); setFailedStep(null); };

	useEffect(() =>
	{
		if(status !== 'running') return;
		if(count >= PIPELINE_STEPS.length) return;

		const delay = delaysRef.current[count - 1] ?? 800;

		const id = setTimeout(() =>
		{
			if(failAtRef.current === count)
			{
				setFailedStep(count);
				setNewIndex(count);
				setCount((c) => c + 1);
				setStatus('failed');
				toast({ title: 'Deploy failed', description: PIPELINE_STEPS[count].failLog, variant: 'danger' });
				return;
			}

			const next = count + 1;
			setNewIndex(count);
			setCount(next);
			if(next >= PIPELINE_STEPS.length)
			{
				setStatus('success');
				toast({ title: 'Deployed', description: 'Live at myapp.vercel.app', variant: 'success' });
			}
		}, delay);

		return () => clearTimeout(id);
	}, [status, count, toast]);

	useEffect(() =>
	{
		if(newIndex === null) return;
		const id = setTimeout(() => setNewIndex(null), 500);
		return () => clearTimeout(id);
	}, [newIndex]);

	return (
		<>
			<style>{`
				@keyframes stepIn {
					from { opacity: 0; transform: translateY(8px); }
					to   { opacity: 1; transform: translateY(0);   }
				}
				.step-enter { animation: stepIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
				@keyframes dotPop {
					0%   { transform: scale(1);    }
					40%  { transform: scale(1.35); }
					100% { transform: scale(1);    }
				}
				.dot-pop > div:first-child > div:first-child { animation: dotPop 0.4s ease-out; }
			`}</style>

			<Card className='w-full max-w-sm'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm font-semibold text-text'>Production deploy</p>
							<p className='text-xs text-text-muted font-mono'>git push origin main</p>
						</div>
						<Badge variant={STATUS_BADGE[status]}>{status}</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className='flex gap-2 mb-5'>
						{status === 'idle'                           && <Button size='sm' onClick={start}>Deploy</Button>}
						{status === 'running'                        && <Button size='sm' variant='outlined' disabled>Running…</Button>}
						{(status === 'success' || status === 'failed') && <Button size='sm' variant='outlined' onClick={reset}>Replay</Button>}
					</div>
					{count > 0 && (
						<Timeline animate='none'>
							{PIPELINE_STEPS.slice(0, count).map((step, i) =>
							{
								const isFailed = failedStep === i;
								return (
									<TimelineItem
										key={step.title}
										title={step.title}
										className={i === newIndex ? 'step-enter dot-pop' : ''}
									>
										<span className={isFailed ? 'text-danger text-xs font-mono' : 'text-text-muted text-xs'}>
											{isFailed ? step.failLog : step.log}
										</span>
									</TimelineItem>
								);
							})}
						</Timeline>
					)}
				</CardContent>
			</Card>
		</>
	);
};

const DeployPreview = () => (
	<ToastProvider>
		<PipelineInner />
	</ToastProvider>
);

// ─── Example 2: Terminal typewriter ───────────────────────────────────────────

const TERMINAL_LINES = [
	{ prompt: '$', text: 'git clone https://github.com/org/project' },
	{ prompt: '$', text: 'cd project && npm install'                 },
	{ prompt: '$', text: 'npm run build'                             },
	{ prompt: '✓', text: 'Build complete — ready to deploy'         },
];

const TYPEWRITER_CODE = `'use client';

import { useState } from 'react';
import { Typewriter } from '@/src/components/Typewriter/Typewriter';
import Button from '@/src/components/Button/Button';

const LINES = [
  { prompt: '$', text: 'git clone https://github.com/org/project' },
  { prompt: '$', text: 'cd project && npm install'                 },
  { prompt: '$', text: 'npm run build'                             },
  { prompt: '✓', text: 'Build complete — ready to deploy'         },
];

export default function Terminal() {
  const [active, setActive] = useState(0);
  const [epoch,  setEpoch]  = useState(0);
  const done = active >= LINES.length;

  const replay = () => { setActive(0); setEpoch(e => e + 1); };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <div key={epoch} className="rounded-lg overflow-hidden border border-white/10"
        style={{ backgroundColor: '#0d1117' }}>
        <div className="flex gap-1.5 px-4 py-3 border-b border-white/5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }} />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27c93f' }} />
        </div>
        <div className="p-4 font-mono text-sm flex flex-col gap-1.5">
          {LINES.slice(0, Math.min(active + 1, LINES.length)).map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="select-none"
                style={{ color: i === LINES.length - 1 ? '#3fb950' : '#8b949e' }}>
                {line.prompt}
              </span>
              {i < active ? (
                <span style={{ color: '#e6edf3' }}>{line.text}</span>
              ) : (
                <Typewriter text={line.text} speed={35}
                  cursor={!done} cursorPersist={i === LINES.length - 1}
                  style={{ color: '#e6edf3' }}
                  onComplete={() => setActive(a => a + 1)} />
              )}
            </div>
          ))}
        </div>
      </div>
      {done && (
        <div className="flex justify-end">
          <Button size="sm" variant="outlined" onClick={replay}>Replay</Button>
        </div>
      )}
    </div>
  );
}`;

const TerminalPreview = () =>
{
	const [active, setActive] = useState(0);
	const [epoch,  setEpoch]  = useState(0);
	const done = active >= TERMINAL_LINES.length;

	const replay = () => { setActive(0); setEpoch((e) => e + 1); };

	return (
		<div className='flex flex-col gap-3 w-full max-w-md'>
			<div
				key={epoch}
				className='rounded-lg overflow-hidden border border-white/10'
				style={{ backgroundColor: '#0d1117' }}
			>
				<div className='flex gap-1.5 px-4 py-3 border-b border-white/5'>
					<span className='w-3 h-3 rounded-full' style={{ backgroundColor: '#ff5f56' }} />
					<span className='w-3 h-3 rounded-full' style={{ backgroundColor: '#ffbd2e' }} />
					<span className='w-3 h-3 rounded-full' style={{ backgroundColor: '#27c93f' }} />
				</div>
				<div className='p-4 font-mono text-sm flex flex-col gap-1.5'>
					{TERMINAL_LINES.slice(0, Math.min(active + 1, TERMINAL_LINES.length)).map((line, i) => (
						<div key={i} className='flex items-start gap-2'>
							<span
								className='select-none'
								style={{ color: i === TERMINAL_LINES.length - 1 ? '#3fb950' : '#8b949e' }}
							>
								{line.prompt}
							</span>
							{i < active ? (
								<span style={{ color: '#e6edf3' }}>{line.text}</span>
							) : (
								<Typewriter
									text={line.text}
									speed={35}
									cursor={!done}
									cursorPersist={i === TERMINAL_LINES.length - 1}
									style={{ color: '#e6edf3' }}
									onComplete={() => setActive((a) => a + 1)}
								/>
							)}
						</div>
					))}
				</div>
			</div>
			{done && (
				<div className='flex justify-end'>
					<Button size='sm' variant='outlined' onClick={replay}>Replay</Button>
				</div>
			)}
		</div>
	);
};

// ─── Example 3: Service mesh graph ────────────────────────────────────────────

const GRAPH_NODES = [
	{ id: 'browser', label: 'Browser'  },
	{ id: 'gateway', label: 'Gateway'  },
	{ id: 'auth',    label: 'Auth'     },
	{ id: 'api',     label: 'API'      },
	{ id: 'db',      label: 'Database' },
	{ id: 'cache',   label: 'Cache'    },
	{ id: 'queue',   label: 'Queue'    },
];

const GRAPH_EDGES = [
	{ source: 'browser', target: 'gateway' },
	{ source: 'gateway', target: 'auth'    },
	{ source: 'gateway', target: 'api'     },
	{ source: 'auth',    target: 'db'      },
	{ source: 'api',     target: 'db'      },
	{ source: 'api',     target: 'cache'   },
	{ source: 'api',     target: 'queue'   },
	{ source: 'queue',   target: 'db'      },
];

const GRAPH_CODE = `'use client';

import { useState } from 'react';
import Graph, { GraphNode } from '@/src/components/Graph/Graph';

const nodes = [
  { id: 'browser', label: 'Browser'  },
  { id: 'gateway', label: 'Gateway'  },
  { id: 'auth',    label: 'Auth'     },
  { id: 'api',     label: 'API'      },
  { id: 'db',      label: 'Database' },
  { id: 'cache',   label: 'Cache'    },
  { id: 'queue',   label: 'Queue'    },
];

const edges = [
  { source: 'browser', target: 'gateway' },
  { source: 'gateway', target: 'auth'    },
  { source: 'gateway', target: 'api'     },
  { source: 'auth',    target: 'db'      },
  { source: 'api',     target: 'db'      },
  { source: 'api',     target: 'cache'   },
  { source: 'api',     target: 'queue'   },
  { source: 'queue',   target: 'db'      },
];

export default function ServiceMesh() {
  const [selected, setSelected] = useState<GraphNode | null>(null);

  return (
    <div className="flex flex-col gap-3 w-full">
      <Graph nodes={nodes} edges={edges} width={600} height={320}
        onNodeSelect={setSelected} />
      <p className="text-sm text-center text-text-muted min-h-5">
        {selected
          ? <>Selected: <span className="text-text font-medium">{selected.label}</span></>
          : 'Click or arrow-key a node to select it'}
      </p>
    </div>
  );
}`;

const GRAPH_ADJACENCY = GRAPH_EDGES.reduce<Record<string, string[]>>((acc, e) =>
{
	(acc[e.source] ??= []).push(e.target);
	(acc[e.target] ??= []).push(e.source);
	return acc;
}, {});

const GraphPreview = () =>
{
	const [selected, setSelected] = useState<GraphNode | null>(null);

	const connectedNodes = selected
		? (GRAPH_ADJACENCY[selected.id] ?? []).map((id) => GRAPH_NODES.find((n) => n.id === id)!).filter(Boolean)
		: [];

	return (
		<div className='flex flex-col gap-3 w-full'>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-sm font-semibold text-text'>Request flow</p>
					<p className='text-xs text-text-muted'>{GRAPH_NODES.length} services · {GRAPH_EDGES.length} connections</p>
				</div>
				<p className='text-xs text-text-muted hidden sm:block'>Pan · scroll to zoom · click to select</p>
			</div>

			<Graph
				nodes={GRAPH_NODES}
				edges={GRAPH_EDGES}
				width={600}
				height={300}
				onNodeSelect={setSelected}
			/>

			<div className={[
				'rounded-lg border p-3 transition-colors duration-150 min-h-[3.5rem] flex items-center',
				selected ? 'border-brand/30 bg-brand/5' : 'border-dashed border-surface-border',
			].join(' ')}>
				{selected ? (
					<div className='flex items-start gap-8 w-full'>
						<div>
							<p className='text-[11px] font-medium text-text-muted uppercase tracking-wider'>Node</p>
							<p className='text-sm font-semibold text-text mt-0.5'>{selected.label}</p>
						</div>
						<div>
							<p className='text-[11px] font-medium text-text-muted uppercase tracking-wider'>Edges</p>
							<p className='text-sm font-semibold text-text mt-0.5'>{connectedNodes.length}</p>
						</div>
						<div>
							<p className='text-[11px] font-medium text-text-muted uppercase tracking-wider'>Connected to</p>
							<div className='flex flex-wrap gap-1 mt-0.5'>
								{connectedNodes.map((n) => (
									<Badge key={n.id} variant='outline'>{n.label}</Badge>
								))}
							</div>
						</div>
					</div>
				) : (
					<p className='text-xs text-text-muted w-full text-center'>
						Click or arrow-key a node to inspect its connections
					</p>
				)}
			</div>
		</div>
	);
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const ExamplesPage = () =>
{
	return (
		<div className='flex flex-col gap-12'>
			<div className='flex flex-col gap-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-text'>Examples</h1>
				<p className='text-base text-text-muted leading-relaxed'>
					Real patterns assembled from DaFink UI components. Copy the code and drop it straight into your project.
				</p>
			</div>

			<section className='flex flex-col gap-2'>
				<h2 className='text-lg font-semibold text-text'>Deploy pipeline</h2>
				<p className='text-sm text-text-muted'>
					A CI/CD pipeline that auto-advances one step per second, with a live status Badge and a success Toast on completion. Hit Deploy and watch it run.
				</p>
				<CodeBlock variant='example' label='deploy' code={DEPLOY_CODE} minHeight='360px'>
					<DeployPreview />
				</CodeBlock>
			</section>

			<section className='flex flex-col gap-2'>
				<h2 className='text-lg font-semibold text-text'>Terminal</h2>
				<p className='text-sm text-text-muted'>
					Chained Typewriter lines that each start when the previous finishes, creating a realistic terminal playback effect.
				</p>
				<CodeBlock variant='example' label='terminal' code={TYPEWRITER_CODE} minHeight='260px'>
					<TerminalPreview />
				</CodeBlock>
			</section>

			<section className='flex flex-col gap-2'>
				<h2 className='text-lg font-semibold text-text'>Service mesh</h2>
				<p className='text-sm text-text-muted'>
					Force-directed graph visualising request flow through a web service architecture. Pan, zoom, and select nodes by click or keyboard.
				</p>
				<CodeBlock variant='example' label='graph' code={GRAPH_CODE} minHeight='400px'>
					<GraphPreview />
				</CodeBlock>
			</section>
		</div>
	);
};

export default ExamplesPage;
