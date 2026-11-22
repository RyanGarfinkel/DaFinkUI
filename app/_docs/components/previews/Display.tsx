'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from '@/src/components/Carousel/Carousel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/Table/Table';
import { AreaChart, BarChart, DonutChart, LineChart, RadarChart } from '@/src/components/Charts/Charts';
import { Message, MessageReactions, MessageReaction } from '@/src/components/Message/Message';
import { Skeleton, SkeletonCard, SkeletonImage } from '@/src/components/Skeleton/Skeleton';
import Graph, { type GraphNode, type GraphEdge } from '@/src/components/Graph/Graph';
import { Attachment, AttachmentGroup } from '@/src/components/Attachment/Attachment';
import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import Avatar, { AvatarGroup } from '@/src/components/Avatar/Avatar';
import AudioPlayer from '@/src/components/AudioPlayer/AudioPlayer';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import { Progress } from '@/src/components/Progress/Progress';
import Separator from '@/src/components/Separator/Separator';
import Tree, { TreeItem } from '@/src/components/Tree/Tree';
import { Spinner } from '@/src/components/Spinner/Spinner';
import { Heatmap } from '@/src/components/Heatmap/Heatmap';
import Formula from '@/src/components/Formula/Formula';
import { Alert } from '@/src/components/Alert/Alert';
import { Badge } from '@/src/components/Badge/Badge';
import Button from '@/src/components/Button/Button';
import Tilt from '@/src/components/Tilt/Tilt';

const CODE_SNIPPET = 'import Button from \'@/src/components/Button/Button\';\n\nexport default function Example() {\n  return <Button>Click me</Button>;\n}';

export const CodeBlockPreview = () => (
	<div className='flex flex-col gap-6 w-full max-w-2xl'>
		<CodeBlock code={CODE_SNIPPET} />
		<CodeBlock variant='example' code={CODE_SNIPPET} label='button-example' minHeight='120px'>
			<Button>Click me</Button>
		</CodeBlock>
	</div>
);

export const FormulaPreview = () => (
	<div className='flex flex-col gap-4 items-center'>
		<Formula expression='x^2 + y^2 = r^2' size='lg' />
		<Formula display='block' expression='\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}' size='lg' />
		<Formula expression='\sum_{i=1}^{n} x_i' />
	</div>
);

export const CardPreview = () => (
	<div className='w-full max-w-sm'>
		<Card>
			<CardHeader>
				<h3 className='text-2xl font-semibold tracking-tight text-text'>Project summary</h3>
			</CardHeader>
			<CardContent>
				<p className='text-base text-text leading-7'>
					Everything is on track for the Q3 launch. Three tasks remain open.
				</p>
			</CardContent>
		</Card>
	</div>
);

export const TablePreview = () => (
	<div className='w-full'>
		<Table>
			<TableHead>
				<TableRow>
					<TableHeader>Name</TableHeader>
					<TableHeader>Role</TableHeader>
					<TableHeader>Status</TableHeader>
				</TableRow>
			</TableHead>
			<TableBody>
				<TableRow><TableCell>Alice Kim</TableCell><TableCell>Designer</TableCell><TableCell>Active</TableCell></TableRow>
				<TableRow><TableCell>Ben Torres</TableCell><TableCell>Engineer</TableCell><TableCell>Active</TableCell></TableRow>
				<TableRow><TableCell>Clara Patel</TableCell><TableCell>PM</TableCell><TableCell>On leave</TableCell></TableRow>
			</TableBody>
		</Table>
	</div>
);

export const SkeletonPreview = () => (
	<div className='w-full max-w-sm flex flex-col gap-6'>
		<SkeletonImage aspectRatio='16/9' />
		<div className='flex items-center gap-3'>
			<Skeleton width='40px' height='40px' className='rounded-full shrink-0' />
			<div className='flex flex-col gap-2 flex-1'>
				<Skeleton height='14px' className='w-2/5' />
				<Skeleton height='12px' className='w-3/5' />
			</div>
		</div>
		<SkeletonCard lines={3} />
	</div>
);

export const TypographyPreview = () => (
	<div className='w-full flex flex-col gap-3'>
		<h1 className='text-4xl font-bold tracking-tight text-text'>Heading 1</h1>
		<h2 className='text-3xl font-semibold tracking-tight text-text'>Heading 2</h2>
		<h3 className='text-2xl font-semibold tracking-tight text-text'>Heading 3</h3>
		<h4 className='text-xl font-semibold text-text'>Heading 4</h4>
		<p className='text-xl text-text-muted leading-7'>Lead paragraph text that introduces the section.</p>
		<p className='text-base text-text leading-7'>Body paragraph with regular weight and line-height.</p>
		<p className='text-sm text-text-muted'>Muted helper text for supporting detail.</p>
		<blockquote className='border-l-2 border-surface-border pl-4 italic text-text-muted'>A quoted passage from a source.</blockquote>
		<p className='text-base text-text leading-7'>Inline <code className='text-sm font-mono bg-surface-active px-1.5 py-0.5 rounded text-text'>code snippet</code> example.</p>
		<p className='text-xs text-text-muted'>Small caption text</p>
	</div>
);

export const BadgePreview = () => (
	<div className='flex flex-wrap items-center gap-2'>
		<Badge>Default</Badge>
		<Badge variant='success'>Success</Badge>
		<Badge variant='warning'>Warning</Badge>
		<Badge variant='danger'>Danger</Badge>
		<Badge variant='outline'>Outline</Badge>
	</div>
);

export const AlertPreview = () => (
	<div className='flex flex-col gap-3 w-full max-w-md'>
		<Alert title='Heads up'>This is a default alert.</Alert>
		<Alert variant='success' title='Success'>Your changes were saved.</Alert>
		<Alert variant='warning' title='Warning'>Review before continuing.</Alert>
		<Alert variant='danger' title='Error'>Something went wrong.</Alert>
	</div>
);

export const ProgressPreview = () => (
	<div className='flex flex-col gap-4 w-full max-w-sm'>
		<Progress value={40} />
		<Progress value={70} showLabel />
		<Progress value={90} size='lg' showLabel />
	</div>
);

export const SpinnerPreview = () => (
	<div className='flex items-center gap-6'>
		<Spinner size='sm' />
		<Spinner />
		<Spinner size='lg' />
	</div>
);

export const TreePreview = () => (
	<div className='w-full max-w-xs'>
		<Tree>
			<TreeItem label='src' defaultOpen>
				<TreeItem label='components' defaultOpen>
					<TreeItem label='Button.tsx' />
					<TreeItem label='Input.tsx' />
				</TreeItem>
				<TreeItem label='app'>
					<TreeItem label='page.tsx' />
					<TreeItem label='layout.tsx' />
				</TreeItem>
			</TreeItem>
			<TreeItem label='package.json' />
			<TreeItem label='tsconfig.json' />
		</Tree>
	</div>
);

export const TimelinePreview = () => (
	<div className='w-full max-w-sm'>
		<Timeline>
			<TimelineItem title='Install the CLI'>
				Run <code className='font-mono text-xs'>npx dafink-ui init</code> in your project root.
			</TimelineItem>
			<TimelineItem title='Add components'>
				Use <code className='font-mono text-xs'>npx dafink-ui add button</code> to copy components into your project.
			</TimelineItem>
			<TimelineItem title='Import and use'>
				Import from <code className='font-mono text-xs'>@/components/ui</code> and start building.
			</TimelineItem>
		</Timeline>
	</div>
);

export const CarouselPreview = () => (
	<Carousel aria-label='Number slides' loop className='w-full max-w-sm'>
		<CarouselContent>
			{[1, 2, 3, 4, 5].map(n => (
				<CarouselItem key={n} className='flex items-center justify-center h-48 rounded-lg bg-surface-active select-none'>
					<span className='text-8xl font-bold text-text-subtle'>{n}</span>
				</CarouselItem>
			))}
		</CarouselContent>
		<CarouselPrevious />
		<CarouselNext />
		<CarouselDots className='mt-3' />
	</Carousel>
);

export const AvatarPreview = () => (
	<div className='flex flex-col items-center gap-6'>
		<div className='flex items-end gap-4'>
			<Avatar name='Ada Lovelace' size='sm' />
			<Avatar name='Grace Hopper' size='md' />
			<Avatar name='Alan Turing' size='lg' />
			<Avatar name='Katherine Johnson' shape='square' size='lg' />
		</div>
		<AvatarGroup max={3}>
			<Avatar name='Ada Lovelace' />
			<Avatar name='Grace Hopper' />
			<Avatar name='Alan Turing' />
			<Avatar name='Katherine Johnson' />
			<Avatar name='Margaret Hamilton' />
		</AvatarGroup>
	</div>
);

const openPlaceholder = (event: { preventDefault: () => void }) => {
	event.preventDefault();
	window.open('#', '_blank');
};

export const AttachmentPreview = () => (
	<AttachmentGroup>
		<Attachment name='Q3-financials.pdf' href='#' type='PDF' size='1.2 MB' onClick={openPlaceholder} />
		<Attachment name='hero-shot.png' size='840 KB' onClick={openPlaceholder} />
		<Attachment name='archive.zip' href='#' size='14.6 MB' />
		<Attachment compact name='notes.txt' onRemove={() => {}} />
	</AttachmentGroup>
);

export const MessagePreview = () => (
	<div className='flex flex-col gap-3 w-full max-w-sm'>
		<Message variant='received'>
			Hey, are we still on for 3pm?
			<MessageReactions max={2}>
				<MessageReaction icon='👍' count={3} active onClick={() => {}} />
				<MessageReaction icon='❤️' count={1} onClick={() => {}} />
				<MessageReaction icon='😂' count={2} onClick={() => {}} />
			</MessageReactions>
		</Message>
		<Message variant='sent'>Yep, see you then!</Message>

		<Message variant='received'>
			The Eiffel Tower is 330 meters tall, including antennas.
		</Message>
		<MessageReactions aria-label='Sources'>
			<MessageReaction label='1' href='https://en.wikipedia.org/wiki/Eiffel_Tower' aria-label='Source 1: wikipedia.org' />
			<MessageReaction label='2' href='https://www.toureiffel.paris' aria-label='Source 2: toureiffel.paris' />
		</MessageReactions>
	</div>
);

const GRAPH_NODES: GraphNode[] = [
	{ id: 'auth',      label: 'Auth',          group: 'core'    },
	{ id: 'users',     label: 'Users',         group: 'core'    },
	{ id: 'posts',     label: 'Posts',         group: 'content' },
	{ id: 'comments',  label: 'Comments',      group: 'content' },
	{ id: 'tags',      label: 'Tags',          group: 'content' },
	{ id: 'media',     label: 'Media',         group: 'content' },
	{ id: 'notifs',    label: 'Notifications', group: 'core'    },
	{ id: 'search',    label: 'Search',        group: 'infra'   },
	{ id: 'cache',     label: 'Cache',         group: 'infra'   },
	{ id: 'email',     label: 'Email',         group: 'infra'   },
];

const GRAPH_EDGES: GraphEdge[] = [
	{ source: 'auth',     target: 'users'    },
	{ source: 'auth',     target: 'notifs'   },
	{ source: 'users',    target: 'posts'    },
	{ source: 'users',    target: 'comments' },
	{ source: 'users',    target: 'notifs'   },
	{ source: 'posts',    target: 'comments' },
	{ source: 'posts',    target: 'tags'     },
	{ source: 'posts',    target: 'media'    },
	{ source: 'posts',    target: 'search'   },
	{ source: 'comments', target: 'notifs'   },
	{ source: 'search',   target: 'cache'    },
	{ source: 'notifs',   target: 'email'    },
];

export const GraphPreview = () => (
	<div className='w-full flex items-center justify-center'>
		<Graph nodes={GRAPH_NODES} edges={GRAPH_EDGES} width={580} height={380} />
	</div>
);

export const AudioPlayerPreview = () => (
	<div className='max-w-md mx-auto w-full'>
		<AudioPlayer
			src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
			title='SoundHelix Song 1'
			subtitle='SoundHelix'
		/>
	</div>
);

export const TiltPreview = () => (
	<div className='flex gap-4 items-center justify-center'>
		<Tilt className='w-fit rounded-xl'>
			<div className='rounded-xl bg-surface border border-surface-border p-8 w-40 h-28 flex items-center justify-center text-sm font-medium text-text'>
				Hover me
			</div>
		</Tilt>
		<Tilt max={20} scale={1.08} className='w-fit rounded-xl'>
			<div className='rounded-xl bg-brand/10 border border-brand/20 p-8 w-40 h-28 flex items-center justify-center text-sm font-medium text-brand'>
				max=20
			</div>
		</Tilt>
	</div>
);

export const SeparatorPreview = () => (
	<div className='flex flex-col gap-6 w-full max-w-sm'>
		<Separator />
		<Separator variant='dashed' />
		<Separator variant='dotted' />
		<Separator>OR</Separator>
		<div className='flex h-16 items-center gap-3'>
			<span className='text-sm text-text'>Item</span>
			<Separator orientation='vertical'>OR</Separator>
			<span className='text-sm text-text'>Item</span>
		</div>
	</div>
);

const MONTHLY_REVENUE = [
	{ month: 'Jan', revenue: 4000, expenses: 2400 },
	{ month: 'Feb', revenue: 3000, expenses: 1398 },
	{ month: 'Mar', revenue: 5000, expenses: 2800 },
	{ month: 'Apr', revenue: 4780, expenses: 3908 },
	{ month: 'May', revenue: 5890, expenses: 4800 },
	{ month: 'Jun', revenue: 4390, expenses: 3800 },
];

const REVENUE_SERIES = [{ key: 'revenue', label: 'Revenue' }, { key: 'expenses', label: 'Expenses' }];

export const ChartsPreview = () => (
	<div className='w-full flex flex-col gap-3'>
		<p className='text-sm text-text-muted'>
			This is the shared module behind LineChart, BarChart, AreaChart, DonutChart, and RadarChart — see those pages for the full set.
		</p>
		<LineChart data={MONTHLY_REVENUE.slice(0, 3)} xKey='month' series={REVENUE_SERIES} />
	</div>
);

export const LineChartPreview = () => (
	<div className='w-full'>
		<LineChart data={MONTHLY_REVENUE} xKey='month' series={REVENUE_SERIES} />
	</div>
);

const QUARTERLY_SALES = [
	{ quarter: 'Q1', sales: 4000, returns: 400 },
	{ quarter: 'Q2', sales: 3000, returns: 300 },
	{ quarter: 'Q3', sales: 5000, returns: 200 },
	{ quarter: 'Q4', sales: 4780, returns: 180 },
];

export const BarChartPreview = () => (
	<div className='w-full'>
		<BarChart
			data={QUARTERLY_SALES}
			xKey='quarter'
			series={[{ key: 'sales', label: 'Sales' }, { key: 'returns', label: 'Returns' }]}
		/>
	</div>
);

const MONTHLY_TRAFFIC = [
	{ month: 'Jan', users: 800, sessions: 1200 },
	{ month: 'Feb', users: 1200, sessions: 1800 },
	{ month: 'Mar', users: 1000, sessions: 1500 },
	{ month: 'Apr', users: 1400, sessions: 2100 },
	{ month: 'May', users: 1800, sessions: 2700 },
	{ month: 'Jun', users: 2200, sessions: 3300 },
];

export const AreaChartPreview = () => (
	<div className='w-full'>
		<AreaChart
			data={MONTHLY_TRAFFIC}
			xKey='month'
			series={[{ key: 'users', label: 'Users' }, { key: 'sessions', label: 'Sessions' }]}
		/>
	</div>
);

export const DonutChartPreview = () => (
	<div className='w-full max-w-xs mx-auto'>
		<DonutChart
			data={[
				{ label: 'Direct', value: 400 },
				{ label: 'Referral', value: 300 },
				{ label: 'Organic', value: 200 },
				{ label: 'Social', value: 100 },
			]}
		/>
	</div>
);

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIMES = ['9am', '11am', '1pm', '3pm', '5pm'];
const COMMITS = [
	[2, 8, 5, 9, 3],
	[4, 10, 6, 12, 2],
	[3, 7, null, 8, 4],
	[5, 11, 9, 14, 6],
	[1, 6, 4, 7, 2],
];

export const HeatmapPreview = () => (
	<div className='flex flex-col gap-6'>
		<Heatmap label='Commits by day and time' data={COMMITS} rowLabels={WEEKDAYS} columnLabels={TIMES} />
		<Heatmap label='Commits by day and time, with values' data={COMMITS} rowLabels={WEEKDAYS} columnLabels={TIMES} showValues />
	</div>
);

const VEHICLE_SCORES = [
	{ metric: 'Speed', modelX: 90, modelY: 70 },
	{ metric: 'Reliability', modelX: 80, modelY: 95 },
	{ metric: 'Comfort', modelX: 70, modelY: 85 },
	{ metric: 'Safety', modelX: 95, modelY: 90 },
	{ metric: 'Efficiency', modelX: 60, modelY: 80 },
	{ metric: 'Design', modelX: 85, modelY: 75 },
];

export const RadarChartPreview = () => (
	<div className='w-full'>
		<RadarChart
			data={VEHICLE_SCORES}
			xKey='metric'
			series={[{ key: 'modelX', label: 'Model X' }, { key: 'modelY', label: 'Model Y' }]}
		/>
	</div>
);
