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
import { MessageMediaDemo } from '@/app/_docs/components/examples/MessageMediaDemo';
import { ManualFormDemo, FieldTypesFormDemo, ReadOnlyFormDemo } from './FormDemos';
import { StackedSidePanelDemo } from './StackedSidePanelDemo';
import Button from '@/src/components/Button/Button';

export interface ComponentExample {
	id:           string;
	title:        string;
	description?: string;
	usage:        string;
	preview:      React.ReactNode;
}

export const componentExamples: Record<string, ComponentExample[]> = {
	button: [
		{
			id:          'arrow-buttons',
			title:       'Arrow buttons',
			description: 'Use the arrowleft and arrowright variants to build prev/next controls. The arrow is injected automatically — just pass the label as children.',
			usage: `export default function Example() {
  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto">
      <Button variant="arrowleft">Previous</Button>
      <Button variant="arrowright">Next</Button>
    </div>
  );
}`,
			preview: (
				<div className='flex items-center justify-between w-full max-w-sm mx-auto'>
					<Button variant='arrowleft'>Previous</Button>
					<Button variant='arrowright'>Next</Button>
				</div>
			),
		},
	],
	message: [
		{
			id:          'media',
			title:       'Media messages',
			description: 'Message renders whatever you pass as children. A compact AudioPlayer drops straight into the default bubble — its controls pick up the bubble\'s own text color automatically, no extra props needed. For content with its own visual chrome, like an image, pass bubble={false} so it isn\'t nested inside a second colored box.',
			usage: `export default function Example() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Message variant="received" bubble={false}>
        <img
          src="https://picsum.photos/seed/dafink-message/320/200"
          alt="Photo shared in the conversation"
          className="w-full max-w-[220px] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]"
        />
      </Message>

      <Message variant="received">Just got back from the trip — here's the view!</Message>

      <Message variant="sent">
        <AudioPlayer
          size="compact"
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
          className="w-44"
        />
      </Message>
    </div>
  );
}`,
			preview: <MessageMediaDemo />,
		},
	],
	form: [
		{
			id:          'manual',
			title:       'Manual state, no validation',
			description: 'useZodForm is optional — the layout primitives work with plain useState just as well, for a one-off field that doesn\'t need a schema.',
			usage: `export default function Example() {
  const [team, setTeam] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const error = submitted && team.trim() === '' ? 'Team name is required.' : undefined;

  return (
    <Form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
      <FormField>
        <FormLabel htmlFor="team" required>Team name</FormLabel>
        <FormControl>
          <Input
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            aria-required="true"
            aria-invalid={Boolean(error)}
          />
        </FormControl>
        <FormMessage>{error}</FormMessage>
      </FormField>
      <Button type="submit">Create team</Button>
    </Form>
  );
}`,
			preview: <ManualFormDemo />,
		},
		{
			id:          'field-types',
			title:       'Mixed field types',
			description: 'Select and Switch already render their own label — wrap them in FormField for spacing and FormSection for grouping. For the optional Textarea, FormLabel adds a muted "(optional)" suffix instead of a hint below the field.',
			usage: `export default function Example() {
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [frequency, setFrequency] = useState('daily');
  const [notes, setNotes] = useState('');

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormSection
        title="Notification preferences"
        description="Controls how often we email you about account activity."
      >
        <FormField>
          <Switch
            checked={notifyByEmail}
            onCheckedChange={setNotifyByEmail}
            label="Email notifications"
          />
        </FormField>
        <FormField>
          <Select
            label="Frequency"
            options={[
              { value: 'realtime', label: 'Real-time' },
              { value: 'daily',    label: 'Daily digest' },
              { value: 'weekly',   label: 'Weekly digest' },
            ]}
            value={frequency}
            onChange={setFrequency}
            disabled={!notifyByEmail}
          />
        </FormField>
        <FormField>
          <FormLabel htmlFor="notes">
            Additional notes <span className="font-normal text-text-subtle">(optional)</span>
          </FormLabel>
          <FormControl>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormControl>
        </FormField>
      </FormSection>
      <Button type="submit">Save preferences</Button>
    </Form>
  );
}`,
			preview: <FieldTypesFormDemo />,
		},
		{
			id:          'read-only',
			title:       'Disabled fields',
			description: 'FormDescription doubles as an explanation for why a field is locked — pair it with disabled instead of just hiding the reason.',
			usage: `export default function Example() {
  return (
    <Form>
      <FormSection title="Account">
        <FormField>
          <FormLabel htmlFor="plan">Plan</FormLabel>
          <FormControl>
            <Input id="plan" value="Team — 12 seats" disabled />
          </FormControl>
          <FormDescription>Contact sales to change your plan.</FormDescription>
        </FormField>
        <FormField>
          <FormLabel htmlFor="billing-email">Billing email</FormLabel>
          <FormControl>
            <Input id="billing-email" value="billing@acme.co" disabled />
          </FormControl>
        </FormField>
      </FormSection>
    </Form>
  );
}`,
			preview: <ReadOnlyFormDemo />,
		},
	],
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
