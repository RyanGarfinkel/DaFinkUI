import {
	Skeleton,
	SkeletonCard,
	SkeletonForm,
	SkeletonImage,
	SkeletonInput,
	SkeletonTableRow,
} from '@/src/components/Skeleton/Skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/src/components/Table/Table';
import { StackedSidePanelDemo } from './StackedSidePanelDemo';

export interface ComponentExample {
	id:           string;
	title:        string;
	description?: string;
	usage:        string;
	preview:      React.ReactNode;
}

export const componentExamples: Record<string, ComponentExample[]> = {
	'side-panel': [
		{
			id:    'stacked',
			title: 'Stacked panels',
			description: 'Opening a second SidePanel on the same side automatically pushes earlier ones toward the center — no wiring required. The pushed-back panel stays visible and interactive, but can\'t be closed until the panel in front of it closes; use useSidePanelBlocked to disable your own close controls accordingly.',
			usage: `function FiltersFooter({ onRefine, onClose }) {
  // Disables while a panel opened by this one is still in front of it.
  const isBlocked = useSidePanelBlocked();

  return (
    <SidePanelFooter>
      <Button variant="secondary" onClick={onRefine}>Refine further</Button>
      <Button variant="secondary" disabled={isBlocked} onClick={onClose}>Close</Button>
    </SidePanelFooter>
  );
}

export default function Example() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button variant="secondary" onClick={() => setFiltersOpen(true)}>Open filters</Button>

      <SidePanel open={filtersOpen} onOpenChange={setFiltersOpen} side="right">
        <SidePanelClose />
        <SidePanelHeader>
          <SidePanelTitle>Filters</SidePanelTitle>
        </SidePanelHeader>
        <SidePanelContent>
          A trigger inside this panel opens a second one on the same side —
          watch this panel automatically shift toward the center, and its own
          close controls disable until Advanced filters closes.
        </SidePanelContent>
        <FiltersFooter
          onRefine={() => setAdvancedOpen(true)}
          onClose={() => setFiltersOpen(false)}
        />
      </SidePanel>

      <SidePanel open={advancedOpen} onOpenChange={setAdvancedOpen} side="right">
        <SidePanelClose />
        <SidePanelHeader>
          <SidePanelTitle>Advanced filters</SidePanelTitle>
        </SidePanelHeader>
        <SidePanelContent>
          Independent panel — closing this one returns the Filters panel to
          its original position. Both panels stay interactive the whole time.
        </SidePanelContent>
        <SidePanelFooter>
          <Button variant="secondary" onClick={() => setAdvancedOpen(false)}>Close</Button>
        </SidePanelFooter>
      </SidePanel>
    </div>
  );
}`,
			preview: <StackedSidePanelDemo />,
		},
	],
	table: [
		{
			id:    'minimal',
			title: 'Minimal variant',
			description: 'A flat, borderless look — no outer card border, no header fill, no zebra striping. Matches the docs site\'s PropsTable.',
			usage: `export default function Example() {
  return (
    <Table variant="minimal">
      <TableHead>
        <TableRow header>
          <TableHeader>Name</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader>Description</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono text-text">label</TableCell>
          <TableCell className="font-mono text-text-muted">string</TableCell>
          <TableCell className="text-text-muted">Visible label above the field.</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-mono text-text">disabled</TableCell>
          <TableCell className="font-mono text-text-muted">boolean</TableCell>
          <TableCell className="text-text-muted">Prevents interaction.</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}`,
			preview: (
				<Table variant='minimal'>
					<TableHead>
						<TableRow header>
							<TableHeader>Name</TableHeader>
							<TableHeader>Type</TableHeader>
							<TableHeader>Description</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell className='font-mono text-text'>label</TableCell>
							<TableCell className='font-mono text-text-muted'>string</TableCell>
							<TableCell className='text-text-muted'>Visible label above the field.</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className='font-mono text-text'>disabled</TableCell>
							<TableCell className='font-mono text-text-muted'>boolean</TableCell>
							<TableCell className='text-text-muted'>Prevents interaction.</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			),
		},
	],
	skeleton: [
		{
			id:    'base',
			title: 'Skeleton',
			description: 'The base block. Compose it freely with width, height, and className to match any shape.',
			usage: `export default function Example() {
  return (
    <div className="flex flex-col gap-3 w-64 max-w-full">
      {/* Heading line */}
      <Skeleton width="55%" height="1.25rem" />

      {/* Body lines */}
      <Skeleton height="0.875rem" />
      <Skeleton width="85%" height="0.875rem" />
      <Skeleton width="70%" height="0.875rem" />

      {/* Avatar */}
      <Skeleton width="2.5rem" height="2.5rem" className="rounded-full" />
    </div>
  );
}`,
			preview: (
				<div className='flex flex-col gap-3 w-64 max-w-full'>
					<Skeleton width='55%' height='1.25rem' />
					<Skeleton height='0.875rem' />
					<Skeleton width='85%' height='0.875rem' />
					<Skeleton width='70%' height='0.875rem' />
					<Skeleton width='2.5rem' height='2.5rem' className='rounded-full' />
				</div>
			),
		},
		{
			id:    'card',
			title: 'SkeletonCard',
			description: 'Mimics a card with a title bar and a configurable number of body lines.',
			usage: `export default function Example() {
  return (
    <div className="flex flex-col gap-4 w-72 max-w-full">
      <SkeletonCard lines={3} />
      <SkeletonCard lines={2} />
    </div>
  );
}`,
			preview: (
				<div className='flex flex-col gap-4 w-72 max-w-full'>
					<SkeletonCard lines={3} />
					<SkeletonCard lines={2} />
				</div>
			),
		},
		{
			id:    'input',
			title: 'SkeletonInput',
			description: 'Mimics a labelled form input. Pass label to include the label placeholder.',
			usage: `export default function Example() {
  return (
    <div className="flex flex-col gap-4 w-72 max-w-full">
      <SkeletonInput label />
      <SkeletonInput />
    </div>
  );
}`,
			preview: (
				<div className='flex flex-col gap-4 w-72 max-w-full'>
					<SkeletonInput label />
					<SkeletonInput />
				</div>
			),
		},
		{
			id:    'form',
			title: 'SkeletonForm',
			description: 'Stacks multiple labelled SkeletonInput fields — useful while a form section loads.',
			usage: `export default function Example() {
  return <SkeletonForm fields={4} className="w-72 max-w-full" />;
}`,
			preview: <SkeletonForm fields={4} className='w-72 max-w-full' />,
		},
		{
			id:    'image',
			title: 'SkeletonImage',
			description: 'Rectangular image placeholder. Height derives from aspectRatio and the element\'s width.',
			usage: `export default function Example() {
  return (
    <div className="flex flex-col gap-4 w-72 max-w-full">
      <SkeletonImage aspectRatio="16/9" />
      <SkeletonImage aspectRatio="4/3" />
      <SkeletonImage aspectRatio="1" className="w-32" />
    </div>
  );
}`,
			preview: (
				<div className='flex flex-col gap-4 w-72 max-w-full'>
					<SkeletonImage aspectRatio='16/9' />
					<SkeletonImage aspectRatio='4/3' />
					<SkeletonImage aspectRatio='1' className='w-32' />
				</div>
			),
		},
		{
			id:    'table-row',
			title: 'SkeletonTableRow',
			description: 'A row of equal-width columns — stack several to simulate a full table body.',
			usage: `export default function Example() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-lg">
      {/* Header row slightly taller */}
      <SkeletonTableRow columns={4} className="[&>*]:h-4" />

      {/* Data rows */}
      <SkeletonTableRow columns={4} />
      <SkeletonTableRow columns={4} />
      <SkeletonTableRow columns={4} />
    </div>
  );
}`,
			preview: (
				<div className='flex flex-col gap-3 w-full max-w-lg'>
					<SkeletonTableRow columns={4} className='[&>*]:h-4' />
					<SkeletonTableRow columns={4} />
					<SkeletonTableRow columns={4} />
					<SkeletonTableRow columns={4} />
				</div>
			),
		},
	],
};
