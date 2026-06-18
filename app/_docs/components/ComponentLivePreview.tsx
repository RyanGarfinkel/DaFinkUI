'use client';

import Drawer, { DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose, type DrawerSide } from '@/src/components/Drawer/Drawer';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from '@/src/components/Carousel/Carousel';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/src/components/Modal/Modal';
import Accordion, { AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/Accordion/Accordion';
import Collapsible, { CollapsibleTrigger, CollapsibleContent } from '@/src/components/Collapsible/Collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/Table/Table';
import { CommandPalette, CommandGroup, CommandItem } from '@/src/components/CommandPalette/CommandPalette';
import { Sidebar, SidebarSection, SidebarLink, SidebarDivider } from '@/src/components/Sidebar/Sidebar';
import DataTable, { type ColumnDef, type PaginatorVariant } from '@/src/components/DataTable/DataTable';
import { FormDescription, FormField, FormLabel, FormSection } from '@/src/components/Form/Form';
import { AreaChart, BarChart, DonutChart, LineChart } from '@/src/components/Charts/Charts';
import Mosaic, { MosaicTile, type MosaicTileLayout } from '@/src/components/Mosaic/Mosaic';
import { Skeleton, SkeletonCard, SkeletonImage } from '@/src/components/Skeleton/Skeleton';
import ToggleGroup, { ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/Tabs/Tabs';
import Graph, { type GraphNode, type GraphEdge } from '@/src/components/Graph/Graph';
import FunctionPlotter from '@/src/components/FunctionPlotter/FunctionPlotter';
import WorkflowBuilder from '@/src/components/WorkflowBuilder/WorkflowBuilder';
import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import { ToastProvider, useToast } from '@/src/components/Toast/Toast';
import DropdownMenu from '@/src/components/DropdownMenu/DropdownMenu';
import Avatar, { AvatarGroup } from '@/src/components/Avatar/Avatar';
import Reveal, { RevealGroup } from '@/src/components/Reveal/Reveal';
import { RadioGroup, RadioItem } from '@/src/components/Radio/Radio';
import { DatePicker } from '@/src/components/DatePicker/DatePicker';
import TextShimmer from '@/src/components/TextShimmer/TextShimmer';
import AudioPlayer from '@/src/components/AudioPlayer/AudioPlayer';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import Typewriter from '@/src/components/Typewriter/Typewriter';
import Breadcrumb from '@/src/components/Breadcrumb/Breadcrumb';
import { Combobox } from '@/src/components/Combobox/Combobox';
import { Progress } from '@/src/components/Progress/Progress';
import { Checkbox } from '@/src/components/Checkbox/Checkbox';
import { KanbanBoard } from '@/src/components/Kanban/Kanban';
import Tree, { TreeItem } from '@/src/components/Tree/Tree';
import { Spinner } from '@/src/components/Spinner/Spinner';
import Textarea from '@/src/components/Textarea/Textarea';
import OTPInput from '@/src/components/OTPInput/OTPInput';
import { Select } from '@/src/components/Select/Select';
import { Canvas } from '@/src/components/Canvas/Canvas';
import Popover from '@/src/components/Popover/Popover';
import Tooltip from '@/src/components/Tooltip/Tooltip';
import CountUp from '@/src/components/CountUp/CountUp';
import { Alert } from '@/src/components/Alert/Alert';
import { Badge } from '@/src/components/Badge/Badge';
import Switch from '@/src/components/Switch/Switch';
import Slider from '@/src/components/Slider/Slider';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import Tilt from '@/src/components/Tilt/Tilt';
import { useState } from 'react';

interface ComponentLivePreviewProps {
  slug: string;
}

export const ComponentLivePreview = ({ slug }: ComponentLivePreviewProps) => {
  const [dashboardLayout, setDashboardLayout] = useState<MosaicTileLayout[]>([
    { id: 'revenue', col: 1, row: 1, colSpan: 2, rowSpan: 1 },
    { id: 'users',   col: 3, row: 1, colSpan: 1, rowSpan: 1 },
    { id: 'chart',   col: 1, row: 2, colSpan: 3, rowSpan: 2 },
    { id: 'growth',  col: 4, row: 1, colSpan: 1, rowSpan: 1 },
  ]);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [sliderValue, setSliderValue]     = useState(40);
  const [radioValue, setRadioValue] = useState('option-1');
  const [toggleValue, setToggleValue] = useState<string | string[]>('left');
  const [tabValue, setTabValue] = useState('account');
  const [pickerDate, setPickerDate] = useState<Date | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  switch (slug) {
    case 'button':
      return (
        <div className='flex flex-col gap-4 items-center'>
          <div className='flex flex-wrap gap-3 items-center justify-center'>
            <Button>Primary</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='outlined'>Outlined</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='link'>Link</Button>
            <Button variant='destructive'>Destructive</Button>
          </div>
          <div className='flex gap-2 items-center'>
            <Button size='icon' variant='ghost' aria-label='Search'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/></svg>
            </Button>
            <Button size='icon' variant='secondary' aria-label='Add'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M5 12h14M12 5v14'/></svg>
            </Button>
            <Button size='icon' variant='destructive' aria-label='Delete'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg>
            </Button>
          </div>
        </div>
      );

    case 'input':
      return (
        <div className='w-full max-w-sm flex flex-col gap-4'>
          <Input label='Email' placeholder='you@example.com' hint='We will never share your email.' />
          <Input label='Password' type='password' placeholder='••••••••' hint='At least 8 characters.' />
          <Input label='Floating label' variant='floating' />
          <Input label='Disabled' placeholder='Cannot edit' disabled />
        </div>
      );

    case 'otp-input': {
      const OTPPreview = () =>
      {
        const [code, setCode] = useState('');
        return (
          <div className='flex flex-col gap-6'>
            <OTPInput label='Verification code' length={6} value={code} onChange={setCode} hint='Enter the 6-digit code from your email.' />
            <OTPInput label='Expired code' length={6} value='123' onChange={() => {}} error='This code has expired.' />
          </div>
        );
      };
      return <OTPPreview />;
    }

    case 'textarea':
      return (
        <div className='w-full max-w-sm'>
          <Textarea label='Message' placeholder='Write your message here…' hint='Max 500 characters.' rows={4} />
        </div>
      );

    case 'radio':
      return (
        <RadioGroup value={radioValue} onValueChange={setRadioValue} name='plan'>
          <RadioItem value='option-1' label='Starter' hint='Up to 5 users' />
          <RadioItem value='option-2' label='Pro' hint='Up to 50 users' />
          <RadioItem value='option-3' label='Enterprise' hint='Unlimited users' />
        </RadioGroup>
      );

    case 'switch':
      return (
        <div className='flex flex-col gap-4'>
          <Switch
            checked={switchChecked}
            onCheckedChange={setSwitchChecked}
            label='Email notifications'
            hint='Receive updates about your account.'
          />
          <Switch checked={true} onCheckedChange={() => {}} label='Dark mode' />
          <Switch checked={false} onCheckedChange={() => {}} label='Analytics' disabled />
        </div>
      );

    case 'slider':
      return (
        <div className='w-full max-w-sm flex flex-col gap-6'>
          <Slider
            label='Volume'
            showValue
            value={sliderValue}
            onValueChange={setSliderValue}
            hint='Drag or use arrow keys to adjust.'
          />
          <Slider label='Disabled' value={60} onValueChange={() => {}} disabled />
        </div>
      );

    case 'toggle-group':
      return (
        <div className='flex flex-col gap-4 items-center'>
          <ToggleGroup type='single' value={toggleValue as string} onValueChange={setToggleValue}>
            <ToggleGroupItem value='left'>Left</ToggleGroupItem>
            <ToggleGroupItem value='center'>Center</ToggleGroupItem>
            <ToggleGroupItem value='right'>Right</ToggleGroupItem>
          </ToggleGroup>
        </div>
      );

    case 'code-block': {
      const snippet = 'import Button from \'@/src/components/Button/Button\';\n\nexport default function Example() {\n  return <Button>Click me</Button>;\n}';
      return (
        <div className='flex flex-col gap-6 w-full max-w-2xl'>
          <CodeBlock code={snippet} />
          <CodeBlock variant='example' code={snippet} label='button-example' minHeight='120px'>
            <Button>Click me</Button>
          </CodeBlock>
        </div>
      );
    }

    case 'card':
      return (
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

    case 'table':
      return (
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

    case 'skeleton':
      return (
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

    case 'typography':
      return (
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

    case 'form':
      return (
        <div className='w-full max-w-sm'>
          <FormSection title='Personal information' description='Update your basic profile details.'>
            <FormField>
              <FormLabel required>Full name</FormLabel>
              <Input placeholder='Jane Smith' />
              <FormDescription>This is how your name will appear publicly.</FormDescription>
            </FormField>
            <FormField>
              <FormLabel>Bio</FormLabel>
              <Textarea placeholder='Tell us a bit about yourself.' rows={3} />
            </FormField>
          </FormSection>
        </div>
      );

    case 'collapsible':
      return (
        <div className='w-full max-w-sm rounded-lg border border-surface-border px-4'>
          <Collapsible>
            <CollapsibleTrigger>Project details</CollapsibleTrigger>
            <CollapsibleContent>
              This project uses React 18, Tailwind v4, and Next.js 15. Components are
              copied directly into your repo — no runtime dependency required.
            </CollapsibleContent>
          </Collapsible>
        </div>
      );

    case 'accordion':
      return (
        <div className='w-full max-w-sm'>
          <Accordion type='single' collapsible defaultValue='item-1'>
            <AccordionItem value='item-1'>
              <AccordionTrigger>What is DaFink UI?</AccordionTrigger>
              <AccordionContent>
                A copy-paste design system for React — install only what you need.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
              <AccordionTrigger>How do I install a component?</AccordionTrigger>
              <AccordionContent>
                Run <code className='font-mono text-xs'>npx @dafink/ui add button</code> and the component is copied into your project.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3'>
              <AccordionTrigger>Do I need to install all components at once?</AccordionTrigger>
              <AccordionContent>
                No — each component is installed individually. Install only what your project needs.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      );

    case 'tabs':
      return (
        <div className='w-full max-w-sm'>
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              <TabsTrigger value='account'>Account</TabsTrigger>
              <TabsTrigger value='security'>Security</TabsTrigger>
              <TabsTrigger value='notifications'>Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value='account'>
              <p className='text-base text-text leading-7'>Manage your account settings and preferences.</p>
            </TabsContent>
            <TabsContent value='security'>
              <p className='text-base text-text leading-7'>Update your password and two-factor authentication settings.</p>
            </TabsContent>
            <TabsContent value='notifications'>
              <p className='text-base text-text leading-7'>Choose what notifications you receive and how.</p>
            </TabsContent>
          </Tabs>
        </div>
      );

    case 'sidebar':
      return (
        <div className='h-64 w-56 border border-surface-border rounded-lg overflow-hidden'>
          <Sidebar width='w-full'>
            <SidebarSection>
              <SidebarLink href='#' isActive>Home</SidebarLink>
              <SidebarLink href='#'>Documentation</SidebarLink>
              <SidebarLink href='#'>Examples</SidebarLink>
            </SidebarSection>
            <SidebarDivider />
            <SidebarSection label='Components'>
              <SidebarLink href='#'>Button</SidebarLink>
              <SidebarLink href='#'>Input</SidebarLink>
            </SidebarSection>
          </Sidebar>
        </div>
      );

    case 'breadcrumb':
      return (
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Components', href: '/components' },
            { label: 'Breadcrumb' },
          ]}
        />
      );

    case 'line-chart': {
      const data = [
        { month: 'Jan', revenue: 4000, expenses: 2400 },
        { month: 'Feb', revenue: 3000, expenses: 1398 },
        { month: 'Mar', revenue: 5000, expenses: 2800 },
        { month: 'Apr', revenue: 4780, expenses: 3908 },
        { month: 'May', revenue: 5890, expenses: 4800 },
        { month: 'Jun', revenue: 4390, expenses: 3800 },
      ];
      return (
        <div className='w-full'>
          <LineChart
            data={data}
            xKey='month'
            series={[
              { key: 'revenue', label: 'Revenue' },
              { key: 'expenses', label: 'Expenses' },
            ]}
          />
        </div>
      );
    }

    case 'bar-chart': {
      const data = [
        { quarter: 'Q1', sales: 4000, returns: 400 },
        { quarter: 'Q2', sales: 3000, returns: 300 },
        { quarter: 'Q3', sales: 5000, returns: 200 },
        { quarter: 'Q4', sales: 4780, returns: 180 },
      ];
      return (
        <div className='w-full'>
          <BarChart
            data={data}
            xKey='quarter'
            series={[
              { key: 'sales', label: 'Sales' },
              { key: 'returns', label: 'Returns' },
            ]}
          />
        </div>
      );
    }

    case 'area-chart': {
      const data = [
        { month: 'Jan', users: 800, sessions: 1200 },
        { month: 'Feb', users: 1200, sessions: 1800 },
        { month: 'Mar', users: 1000, sessions: 1500 },
        { month: 'Apr', users: 1400, sessions: 2100 },
        { month: 'May', users: 1800, sessions: 2700 },
        { month: 'Jun', users: 2200, sessions: 3300 },
      ];
      return (
        <div className='w-full'>
          <AreaChart
            data={data}
            xKey='month'
            series={[
              { key: 'users', label: 'Users' },
              { key: 'sessions', label: 'Sessions' },
            ]}
          />
        </div>
      );
    }

    case 'donut-chart':
      return (
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

    case 'mosaic':
      return (
        <Mosaic
          layout={dashboardLayout}
          onLayoutChange={setDashboardLayout}
          cols={4}
          rowHeight={140}
          gap={12}
          className='w-full'
        >
          <MosaicTile id='revenue' minColSpan={1} maxColSpan={3} minRowSpan={1} maxRowSpan={1}>
            {({ colSpan }) => (
              <div className='h-full flex flex-col justify-between'>
                <span className='text-xs text-text-muted'>Revenue</span>
                {colSpan === 1 ? (
                  <span className='text-2xl font-semibold text-text'>$48.5k</span>
                ) : (
                  <div className='flex items-end justify-between'>
                    <span className='text-3xl font-semibold text-text'>$48.5k</span>
                    <div className='flex flex-col items-end gap-1'>
                      <span className='text-xs text-brand font-medium'>+12%</span>
                      {colSpan >= 3 && (
                        <span className='text-xs text-text-muted'>vs last month</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </MosaicTile>

          <MosaicTile id='users' minColSpan={1} maxColSpan={1} minRowSpan={1} maxRowSpan={1}>
            <div className='h-full flex flex-col justify-between'>
              <span className='text-xs text-text-muted'>Active users</span>
              <span className='text-2xl font-semibold text-text'>3,204</span>
            </div>
          </MosaicTile>

          <MosaicTile id='chart' minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={3}>
            {({ colSpan, rowSpan }) => (
              <div className='h-full flex flex-col gap-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-text-muted'>Revenue over time</span>
                  {colSpan >= 3 && (
                    <span className='text-xs text-text-subtle'>Last 8 months</span>
                  )}
                </div>
                <div className='flex-1 flex items-end gap-1'>
                  {[40, 65, 50, 80, 60, 90, 75, 85].map((h, i) => (
                    <div key={i} className='flex-1 flex flex-col justify-end gap-0.5'>
                      {rowSpan >= 2 && (
                        <span className='text-[9px] text-text-subtle text-center tabular-nums'>{h}</span>
                      )}
                      <div className='relative rounded-sm overflow-hidden bg-brand/10' style={{ height: rowSpan >= 2 ? '80%' : '60%' }}>
                        <div className='absolute bottom-0 w-full bg-brand/70 rounded-sm motion-safe:transition-all motion-safe:duration-300' style={{ height: `${h}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </MosaicTile>

          <MosaicTile id='growth' minColSpan={1} maxColSpan={2} minRowSpan={1} maxRowSpan={2}>
            {({ colSpan, rowSpan }) => (
              <div className='h-full flex flex-col justify-between'>
                <span className='text-xs text-text-muted'>Growth</span>
                <div className='flex flex-col gap-1'>
                  <span className={`font-semibold text-brand ${rowSpan >= 2 ? 'text-5xl' : 'text-3xl'}`}>+24%</span>
                  {(rowSpan >= 2 || colSpan >= 2) && (
                    <span className='text-xs text-text-muted'>Quarter over quarter</span>
                  )}
                  {rowSpan >= 2 && (
                    <div className='mt-2 flex gap-2 text-xs text-text-muted'>
                      <span>Q1 <span className='text-text font-medium'>+18%</span></span>
                      <span>Q2 <span className='text-text font-medium'>+21%</span></span>
                      <span>Q3 <span className='text-brand font-medium'>+24%</span></span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </MosaicTile>
        </Mosaic>
      );

    case 'kanban': {
      const columns = [
        {
          id: 'todo',
          title: 'To Do',
          cards: [
            { id: 'k1', title: 'Research competitors', tag: 'Research' },
            { id: 'k2', title: 'Write spec', description: 'Define requirements for v2.' },
          ],
        },
        {
          id: 'in-progress',
          title: 'In Progress',
          cards: [
            { id: 'k3', title: 'Build prototype', tag: 'Engineering' },
            { id: 'k4', title: 'Design review', description: 'Review mockups with the team.' },
          ],
        },
        {
          id: 'done',
          title: 'Done',
          cards: [
            { id: 'k5', title: 'Kick-off meeting', description: 'Align on goals and timeline.' },
          ],
        },
      ];
      return <KanbanBoard initialColumns={columns} />;
    }

    case 'timeline':
      return (
        <div className='w-full max-w-sm'>
          <Timeline>
            <TimelineItem title='Install the CLI'>
              Run <code className='font-mono text-xs'>npx @dafink/ui init</code> in your project root.
            </TimelineItem>
            <TimelineItem title='Add components'>
              Use <code className='font-mono text-xs'>npx @dafink/ui add button</code> to copy components into your project.
            </TimelineItem>
            <TimelineItem title='Import and use'>
              Import from <code className='font-mono text-xs'>@/components/ui</code> and start building.
            </TimelineItem>
          </Timeline>
        </div>
      );

    case 'canvas':
      return (
        <div className='w-full'>
          <Canvas height={320} />
        </div>
      );

    case 'badge':
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <Badge>Default</Badge>
          <Badge variant='success'>Success</Badge>
          <Badge variant='warning'>Warning</Badge>
          <Badge variant='danger'>Danger</Badge>
          <Badge variant='outline'>Outline</Badge>
        </div>
      );

    case 'select':
      return <SelectDemo />;

    case 'checkbox':
      return (
        <div className='flex flex-col gap-3'>
          <Checkbox id='cb1' label='Accept terms' />
          <Checkbox id='cb2' label='Checked' defaultChecked />
          <Checkbox id='cb3' label='Disabled' disabled />
        </div>
      );

    case 'alert':
      return (
        <div className='flex flex-col gap-3 w-full max-w-md'>
          <Alert title='Heads up'>This is a default alert.</Alert>
          <Alert variant='success' title='Success'>Your changes were saved.</Alert>
          <Alert variant='warning' title='Warning'>Review before continuing.</Alert>
          <Alert variant='danger' title='Error'>Something went wrong.</Alert>
        </div>
      );

    case 'progress':
      return (
        <div className='flex flex-col gap-4 w-full max-w-sm'>
          <Progress value={40} />
          <Progress value={70} showLabel />
          <Progress value={90} size='lg' showLabel />
        </div>
      );

    case 'spinner':
      return (
        <div className='flex items-center gap-6'>
          <Spinner size='sm' />
          <Spinner />
          <Spinner size='lg' />
        </div>
      );

    case 'toast':
      return <ToastDemo />;

    case 'tree':
      return (
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

    case 'carousel':
      return (
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

    case 'function-plotter':
      return <FunctionPlotter initialEquations={['x^2 - 2', 'sin(x)', '0.5*x + 3']} readOnly />;

    case 'command-palette':
      return (
        <div className='flex flex-col items-center gap-4'>
          <Button onClick={() => setPaletteOpen(true)}>
            Open Command Palette
          </Button>
          <p className='text-xs text-text-muted'>Press Esc to close</p>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} placeholder='Search commands…'>
            <CommandGroup label='Navigation'>
              <CommandItem value='Dashboard' onSelect={() => setPaletteOpen(false)} shortcut='G D'>Dashboard</CommandItem>
              <CommandItem value='Settings' onSelect={() => setPaletteOpen(false)} shortcut='G S'>Settings</CommandItem>
              <CommandItem value='Profile' onSelect={() => setPaletteOpen(false)}>Profile</CommandItem>
            </CommandGroup>
            <CommandGroup label='Actions'>
              <CommandItem value='New document' onSelect={() => setPaletteOpen(false)} shortcut='⌘N'>New document</CommandItem>
              <CommandItem value='Export PDF' onSelect={() => setPaletteOpen(false)}>Export as PDF</CommandItem>
              <CommandItem value='Invite team member' onSelect={() => setPaletteOpen(false)}>Invite team member</CommandItem>
            </CommandGroup>
            <CommandGroup label='Disabled'>
              <CommandItem value='Admin panel' onSelect={() => setPaletteOpen(false)} disabled>Admin panel</CommandItem>
            </CommandGroup>
          </CommandPalette>
        </div>
      );

    case 'tooltip':
      return (
        <div className='flex flex-wrap items-center gap-4'>
          <Tooltip content='Appears above' side='top'>
            <Button variant='secondary'>Top</Button>
          </Tooltip>
          <Tooltip content='Appears below' side='bottom'>
            <Button variant='secondary'>Bottom</Button>
          </Tooltip>
          <Tooltip content='Appears left' side='left'>
            <Button variant='secondary'>Left</Button>
          </Tooltip>
          <Tooltip content='Appears right' side='right'>
            <Button variant='secondary'>Right</Button>
          </Tooltip>
          <Tooltip content='Opens instantly' delay={0}>
            <Button variant='secondary'>No delay</Button>
          </Tooltip>
        </div>
      );

    case 'popover':
      return (
        <Popover trigger='Open popover' label='Share settings' side='bottom' align='center'>
          <div className='flex flex-col gap-2'>
            <p className='text-sm font-medium text-text'>Share this page</p>
            <p className='text-xs text-text-muted'>Anyone with the link can view.</p>
            <button className='self-start rounded-md bg-brand px-3 py-1.5 text-xs text-brand-fg hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'>
              Copy link
            </button>
          </div>
        </Popover>
      );

    case 'dropdown-menu':
      return (
        <DropdownMenu
          trigger='Actions'
          items={[
            { label: 'Edit',      onSelect: () => console.log('edit')      },
            { label: 'Duplicate', onSelect: () => console.log('duplicate') },
            { separator: true },
            { label: 'Archive', disabled: true },
            { label: 'Delete',    onSelect: () => console.log('delete')    },
          ]}
        />
      );

    case 'combobox': {
      const LANG_OPTIONS = [
        { value: 'ts',      label: 'TypeScript' },
        { value: 'js',      label: 'JavaScript' },
        { value: 'py',      label: 'Python'     },
        { value: 'rs',      label: 'Rust'       },
        { value: 'go',      label: 'Go'         },
        { value: 'rb',      label: 'Ruby'       },
        { value: 'swift',   label: 'Swift'      },
        { value: 'kotlin',  label: 'Kotlin', disabled: true },
        { value: 'elixir',  label: 'Elixir'     },
        { value: 'haskell', label: 'Haskell'    },
      ];

      const ComboboxPreview = () =>
      {
        const [single, setSingle] = useState('');
        const [multi, setMulti]   = useState<string[]>(['ts', 'py']);
        return (
          <div className='flex flex-col gap-6 w-full max-w-sm'>
            <Combobox
              label='Language (single)'
              placeholder='Search languages…'
              options={LANG_OPTIONS}
              value={single}
              onChange={setSingle}
              hint='Type to filter. Kotlin is disabled.'
            />
            <Combobox
              label='Languages (multi)'
              placeholder='Search languages…'
              options={LANG_OPTIONS}
              multiple
              value={multi}
              onChange={setMulti}
              hint='Backspace on empty input removes the last chip.'
            />
          </div>
        );
      }

      return <ComboboxPreview />;
    }

    case 'date-picker':
      return (
        <div className='w-full max-w-xs flex flex-col gap-3'>
          <DatePicker
            label='Select a date'
            placeholder='Pick a date'
            value={pickerDate}
            onChange={setPickerDate}
            hint='Arrow keys navigate the calendar grid.'
          />
          {pickerDate && (
            <p className='text-sm text-text-muted'>
              Selected:{' '}
              <span className='font-medium text-text'>
                {pickerDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </p>
          )}
        </div>
      );

    case 'data-table': {
      interface DemoEmployee {
        id:         number;
        name:       string;
        role:       string;
        department: string;
        status:     string;
        joined:     string;
        salary:     number;
      }

      const EMPLOYEES: DemoEmployee[] = [
        { id: 1,  name: 'Alice Chen',     role: 'Engineer',        department: 'Platform',   status: 'Active',   joined: '2022-03-14', salary: 145000 },
        { id: 2,  name: 'Bob Ruiz',       role: 'Designer',        department: 'Product',    status: 'Away',     joined: '2021-07-01', salary: 130000 },
        { id: 3,  name: 'Carol Smith',    role: 'Engineering Mgr', department: 'Platform',   status: 'Active',   joined: '2020-01-20', salary: 165000 },
        { id: 4,  name: 'Dave Park',      role: 'Data Analyst',    department: 'Analytics',  status: 'Active',   joined: '2023-05-10', salary: 120000 },
        { id: 5,  name: 'Eve Torres',     role: 'Designer',        department: 'Product',    status: 'Active',   joined: '2022-11-03', salary: 128000 },
        { id: 6,  name: 'Frank Lee',      role: 'Engineer',        department: 'Growth',     status: 'Away',     joined: '2021-09-15', salary: 140000 },
        { id: 7,  name: 'Grace Yoon',     role: 'Product Manager', department: 'Product',    status: 'Active',   joined: '2020-06-22', salary: 155000 },
        { id: 8,  name: 'Hugo Martins',   role: 'Engineer',        department: 'Growth',     status: 'Active',   joined: '2023-02-28', salary: 138000 },
        { id: 9,  name: 'Iris Nakamura',  role: 'Recruiter',       department: 'People',     status: 'Active',   joined: '2021-04-05', salary: 115000 },
        { id: 10, name: 'James Okafor',   role: 'Engineer',        department: 'Platform',   status: 'Inactive', joined: '2019-11-18', salary: 148000 },
        { id: 11, name: 'Kira Walsh',     role: 'Marketing Lead',  department: 'Growth',     status: 'Active',   joined: '2022-08-30', salary: 125000 },
        { id: 12, name: 'Leo Fernandez',  role: 'Data Scientist',  department: 'Analytics',  status: 'Active',   joined: '2023-01-09', salary: 155000 },
      ];

      const STATUS_COLORS: Record<string, string> = {
        Active:   'bg-success-bg text-success border border-success-border',
        Away:     'bg-warning-bg text-warning border border-warning-border',
        Inactive: 'bg-surface-active text-text-muted border border-surface-border',
      };

      const EMP_COLUMNS: ColumnDef<DemoEmployee>[] = [
        { key: 'name',       header: 'Name',       sortable: true  },
        { key: 'role',       header: 'Role',       sortable: true  },
        { key: 'department', header: 'Department', sortable: true  },
        {
          key: 'status',
          header: 'Status',
          sortable: false,
          render: (val) => (
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[String(val)] ?? ''}`}>
              {String(val)}
            </span>
          ),
        },
        { key: 'joined', header: 'Joined',  sortable: true },
        {
          key: 'salary',
          header: 'Salary',
          sortable: true,
          render: (val) => `$${Number(val).toLocaleString()}`,
        },
      ];

      const VARIANTS: { value: PaginatorVariant; label: string }[] = [
        { value: 'default',  label: 'Default'  },
        { value: 'numbered', label: 'Numbered' },
        { value: 'compact',  label: 'Compact'  },
        { value: 'minimal',  label: 'Minimal'  },
      ];

      const DataTablePreview = () =>
      {
        const [selected, setSelected] = useState<DemoEmployee[]>([]);
        const [variant,  setVariant]  = useState<PaginatorVariant>('default');
        return (
          <div className='flex flex-col gap-3 w-full'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-xs text-text-muted'>Paginator:</span>
              {VARIANTS.map(v => (
                <button
                  key={v.value}
                  type='button'
                  onClick={() => setVariant(v.value)}
                  className={[
                    'px-2.5 py-1 rounded-md text-xs font-medium',
                    'transition-colors duration-[var(--duration-fast)]',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring',
                    variant === v.value
                      ? 'bg-surface-active text-text'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text',
                  ].join(' ')}
                >
                  {v.label}
                </button>
              ))}
              {selected.length > 0 && (
                <span className='ml-auto text-xs text-text-muted'>
                  {selected.length} selected
                </span>
              )}
            </div>
            <DataTable<DemoEmployee>
              data={EMPLOYEES}
              columns={EMP_COLUMNS}
              keyField='id'
              selectable
              onSelectionChange={setSelected}
              pageSize={5}
              paginatorVariant={variant}
            />
          </div>
        );
      }

      return <DataTablePreview />;
    }

    case 'avatar':
      return (
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

    case 'reveal':
      return (
        <RevealGroup stagger={120} effect='slide-up' className='flex flex-col gap-3 w-full max-w-sm'>
          <Reveal>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>Scroll-triggered entrance</div>
          </Reveal>
          <Reveal>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>Staggered by 120ms</div>
          </Reveal>
          <Reveal effect='scale'>
            <div className='rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text'>With its own effect</div>
          </Reveal>
        </RevealGroup>
      );

    case 'count-up':
      return (
        <div className='flex flex-wrap items-center justify-center gap-10'>
          <div className='flex flex-col items-center gap-1'>
            <CountUp value={12480} separator=',' className='text-3xl font-semibold tracking-tight text-text' />
            <span className='text-xs text-text-muted'>Daily downloads</span>
          </div>
          <div className='flex flex-col items-center gap-1'>
            <CountUp value={99.98} decimals={2} suffix='%' className='text-3xl font-semibold tracking-tight text-text' />
            <span className='text-xs text-text-muted'>Uptime</span>
          </div>
          <div className='flex flex-col items-center gap-1'>
            <CountUp value={1200000} prefix='$' separator=',' duration={1500} className='text-3xl font-semibold tracking-tight text-text' />
            <span className='text-xs text-text-muted'>ARR</span>
          </div>
        </div>
      );

    case 'text-shimmer':
      return (
        <div className='flex flex-col items-center gap-4'>
          <TextShimmer className='text-2xl font-semibold tracking-tight'>Generating your report…</TextShimmer>
          <TextShimmer duration={1600} className='text-sm font-medium'>Thinking…</TextShimmer>
        </div>
      );

    case 'typewriter':
      return (
        <div className='flex flex-col items-start gap-6'>
          <h2 className='text-3xl font-bold tracking-tight text-text'>
            <Typewriter text='Hello, world.' />
          </h2>
          <p className='text-base font-mono text-text-muted'>
            <Typewriter text='System ready. Awaiting input…' speed={60} delay={400} cursorPersist />
          </p>
        </div>
      );

    case 'modal': {
      const ModalPreview = () =>
      {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Button onClick={() => setOpen(true)}>Open modal</Button>

            <Modal open={open} onOpenChange={setOpen}>
              <ModalClose />
              <ModalHeader>
                <ModalTitle>Delete project</ModalTitle>
              </ModalHeader>
              <ModalContent>
                This action cannot be undone. The project and all of its data will be
                permanently removed.
              </ModalContent>
              <ModalFooter>
                <Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant='destructive' onClick={() => setOpen(false)}>Delete</Button>
              </ModalFooter>
            </Modal>
          </>
        );
      };
      return <ModalPreview />;
    }

    case 'drawer': {
      const DrawerPreview = () =>
      {
        const [open, setOpen] = useState(false);
        const [side, setSide] = useState<DrawerSide>('right');

        const openFrom = (s: DrawerSide) =>
        {
          setSide(s);
          setOpen(true);
        };

        return (
          <div className='flex flex-wrap gap-2 justify-center'>
            <Button variant='secondary' onClick={() => openFrom('left')}>Left</Button>
            <Button variant='secondary' onClick={() => openFrom('right')}>Right</Button>
            <Button variant='secondary' onClick={() => openFrom('top')}>Top</Button>
            <Button variant='secondary' onClick={() => openFrom('bottom')}>Bottom</Button>

            <Drawer open={open} onOpenChange={setOpen} side={side}>
              <DrawerClose />
              <DrawerHeader>
                <DrawerTitle>Notifications</DrawerTitle>
              </DrawerHeader>
              <DrawerContent>
                You have no unread notifications.
              </DrawerContent>
              <DrawerFooter>
                <Button variant='secondary' onClick={() => setOpen(false)}>Close</Button>
              </DrawerFooter>
            </Drawer>
          </div>
        );
      };
      return <DrawerPreview />;
    }

    case 'graph': {
      const GRAPH_NODES: GraphNode[] = [
        { id: 'auth',      label: 'Auth',         group: 'core'    },
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
      return (
        <div className='w-full flex items-center justify-center'>
          <Graph
            nodes={GRAPH_NODES}
            edges={GRAPH_EDGES}
            width={580}
            height={380}
          />
        </div>
      );
    }

    case 'audioplayer':
      return (
        <div className='max-w-md mx-auto w-full'>
          <AudioPlayer
            src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            title='SoundHelix Song 1'
            subtitle='SoundHelix'
          />
        </div>
      );

    case 'tilt':
      return (
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

    case 'workflow-builder':
      return (
        <div className='w-full'>
          <WorkflowBuilder height={420} />
        </div>
      );

    default:
      return (
        <div className='text-sm text-text-muted'>
          No preview available for this component.
        </div>
      );
  }
};


const FRAMEWORK_OPTIONS = [
  { value: 'next',      label: 'Next.js'   },
  { value: 'remix',     label: 'Remix'     },
  { value: 'astro',     label: 'Astro'     },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt',      label: 'Nuxt'      },
];

const SelectDemo = () => {
  const [value, setValue] = useState('');

  return (
    <div className='flex flex-col gap-6 w-full max-w-xs'>
      <Select
        label='Framework'
        placeholder='Choose a framework…'
        options={FRAMEWORK_OPTIONS}
        value={value}
        onChange={setValue}
        hint='The framework your project uses.'
      />
      <Select
        label='Disabled'
        options={FRAMEWORK_OPTIONS}
        value='next'
        disabled
      />
      <Select
        label='Error state'
        options={FRAMEWORK_OPTIONS}
        value=''
        placeholder='Pick one'
        error='This field is required.'
      />
    </div>
  );
};

const ToastDemo = () => {
  const [position, setPosition] = useState<import('@/src/components/Toast/Toast').ToastPosition>('bottom-right');

  const isTop    = position.startsWith('top');
  const isLeft   = position.endsWith('left');
  const isCenter = position.endsWith('center');
  const isRight  = position.endsWith('right');

  const setV = (v: 'top' | 'bottom') => {
    const h = isLeft ? 'left' : isCenter ? 'center' : 'right';
    setPosition(`${v}-${h}` as import('@/src/components/Toast/Toast').ToastPosition);
  };

  const setH = (h: 'left' | 'center' | 'right') => {
    const v = isTop ? 'top' : 'bottom';
    setPosition(`${v}-${h}` as import('@/src/components/Toast/Toast').ToastPosition);
  };

  const indicatorStyle: React.CSSProperties = {
    position:  'absolute',
    top:       isTop    ? 28    : undefined,
    bottom:    isTop    ? undefined : 6,
    left:      isLeft   ? 6     : isCenter ? '50%' : undefined,
    right:     isRight  ? 6     : undefined,
    transform: isCenter ? 'translateX(-50%)' : undefined,
  };

  const PILL = 'px-2.5 py-1 rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';
  const active   = `${PILL} bg-surface-active text-text`;
  const inactive = `${PILL} text-text-muted hover:bg-surface-hover hover:text-text`;

  return (
    <ToastProvider position={position}>
      <div className='flex flex-col items-center gap-6 w-full'>

        {/* Diagram */}
        <div className='flex flex-col items-center gap-2'>
          <div
            className='relative rounded-lg border-2 border-surface-border bg-surface-hover/40'
            style={{ width: 180, height: 112 }}
            role='img'
            aria-label={`Toast position: ${position}`}
          >
            {/* Topbar */}
            <div className='absolute top-0 left-0 right-0 h-5 rounded-t-md border-b border-surface-border bg-surface flex items-center px-2 gap-1'>
              <span className='w-1.5 h-1.5 rounded-full bg-surface-border' aria-hidden='true' />
              <span className='w-1.5 h-1.5 rounded-full bg-surface-border' aria-hidden='true' />
              <span className='w-1.5 h-1.5 rounded-full bg-surface-border' aria-hidden='true' />
            </div>
            {/* Toast stack indicator */}
            <div style={indicatorStyle} aria-hidden='true'>
              <div className='flex flex-col gap-1'>
                <div className='w-20 h-3.5 rounded bg-brand/25 border border-brand/50' />
                <div className='w-20 h-3.5 rounded bg-brand/12 border border-brand/30' />
              </div>
            </div>
          </div>
          <p className='text-xs text-text-muted'>
            {position.replace('-', ' ')} · stacks {isTop ? 'downward' : 'upward'}
          </p>
        </div>

        {/* Position controls */}
        <div className='flex flex-col items-center gap-2'>
          <div
            className='flex items-center gap-1 rounded-lg border border-surface-border bg-surface p-1'
            role='group'
            aria-label='Vertical position'
          >
            <button type='button' className={isTop  ? active : inactive} onClick={() => setV('top')}>Top</button>
            <button type='button' className={!isTop ? active : inactive} onClick={() => setV('bottom')}>Bottom</button>
          </div>
          <div
            className='flex items-center gap-1 rounded-lg border border-surface-border bg-surface p-1'
            role='group'
            aria-label='Horizontal position'
          >
            <button type='button' className={isLeft   ? active : inactive} onClick={() => setH('left')}>Left</button>
            <button type='button' className={isCenter ? active : inactive} onClick={() => setH('center')}>Center</button>
            <button type='button' className={isRight  ? active : inactive} onClick={() => setH('right')}>Right</button>
          </div>
        </div>

        {/* Variant triggers */}
        <ToastButtons />
      </div>
    </ToastProvider>
  );
};

const ToastButtons = () => {
  const { toast } = useToast();
  const BTN = 'rounded-md border border-surface-border bg-surface px-3 py-1.5 text-sm text-text hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';

  return (
    <div className='flex flex-wrap gap-2 justify-center'>
      <button type='button' className={BTN} onClick={() => toast({ title: 'Heads up', description: 'This is a default notification.' })}>Default</button>
      <button type='button' className={BTN} onClick={() => toast({ title: 'Saved', description: 'Your changes were saved.', variant: 'success' })}>Success</button>
      <button type='button' className={BTN} onClick={() => toast({ title: 'Warning', description: 'Please review before continuing.', variant: 'warning' })}>Warning</button>
      <button type='button' className={BTN} onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'danger' })}>Danger</button>
      <button type='button' className={BTN} onClick={() => toast({ title: 'Deleted', description: 'Item was removed.', variant: 'danger', action: { label: 'Undo', onClick: () => {} } })}>With action</button>
    </div>
  );
};
