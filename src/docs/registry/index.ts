export interface PropRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface ComponentEntry {
  slug: string;
  name: string;
  category: string;
  description: string;
  usage: string;
  props: PropRow[];
  dependencies: string[];
  registryDependencies: string[];
  files: string[];
}

export const registry: ComponentEntry[] = [
  {
    slug: 'button',
    name: 'Button',
    category: 'Actions',
    description: 'A clickable control that triggers an action, supporting six visual variants and three sizes.',
    usage: `import Button from '@/src/components/Button/Button';

export default function Example() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  );
}`,
    props: [
      {
        name: 'variant',
        type: '"primary" | "secondary" | "outlined" | "ghost" | "link" | "destructive"',
        default: '"primary"',
        description: 'Visual style of the button.',
      },
      {
        name: 'size',
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: 'Height and padding of the button.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the button and suppresses all pointer and focus interaction.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the button element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Button/Button.tsx'],
  },
  {
    slug: 'input',
    name: 'Input',
    category: 'Inputs',
    description: 'A single-line text input with optional label, hint, and error messaging.',
    usage: `import Input from '@/src/components/Input/Input';

export default function Example() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input label="Email" placeholder="you@example.com" hint="We will never share your email." />
      <Input label="Username" placeholder="johndoe" error="This username is already taken." />
      <Input label="Disabled" placeholder="Cannot edit" disabled />
    </div>
  );
}`,
    props: [
      {
        name: 'label',
        type: 'string',
        default: '—',
        description: 'Visible label rendered above the input; also used to derive the input id.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: '—',
        description: 'Placeholder text shown when the input is empty.',
      },
      {
        name: 'hint',
        type: 'string',
        default: '—',
        description: 'Helper text rendered below the input when there is no error.',
      },
      {
        name: 'error',
        type: 'string',
        default: '—',
        description: 'Error message; switches the input to error state and sets aria-invalid.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the input.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Input/Input.tsx'],
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    category: 'Inputs',
    description: 'A multi-line text input with optional label, hint, and error messaging.',
    usage: `import Textarea from '@/src/components/Textarea/Textarea';

export default function Example() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Textarea label="Message" placeholder="Write your message here…" hint="Maximum 500 characters." />
      <Textarea label="Feedback" placeholder="Something went wrong…" error="This field is required." />
    </div>
  );
}`,
    props: [
      {
        name: 'label',
        type: 'string',
        default: '—',
        description: 'Visible label rendered above the textarea.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: '—',
        description: 'Placeholder text shown when the textarea is empty.',
      },
      {
        name: 'hint',
        type: 'string',
        default: '—',
        description: 'Helper text rendered below the textarea when there is no error.',
      },
      {
        name: 'error',
        type: 'string',
        default: '—',
        description: 'Error message; switches the textarea to error state.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the textarea.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes merged onto the textarea element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Textarea/Textarea.tsx'],
  },
  {
    slug: 'radio',
    name: 'Radio',
    category: 'Inputs',
    description: 'A controlled radio group with accessible markup, custom visual styling, and support for hints and disabled states.',
    usage: `'use client';

import { useState } from 'react';
import { RadioGroup, RadioItem } from '@/src/components/Radio/Radio';

export default function Example() {
  const [plan, setPlan] = useState('pro');

  return (
    <RadioGroup name="plan" value={plan} onValueChange={setPlan}>
      <RadioItem value="free" label="Free" hint="Up to 3 projects" />
      <RadioItem value="pro" label="Pro" hint="Unlimited projects" />
      <RadioItem value="enterprise" label="Enterprise" hint="Custom limits" />
    </RadioGroup>
  );
}`,
    props: [
      {
        name: 'name',
        type: 'string',
        default: '—',
        description: 'Shared name attribute applied to all radio inputs in the group.',
      },
      {
        name: 'value',
        type: 'string',
        default: '—',
        description: 'Currently selected value (controlled).',
      },
      {
        name: 'onValueChange',
        type: '(v: string) => void',
        default: '—',
        description: 'Callback fired when the user selects a new option.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes on the group wrapper.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Radio/Radio.tsx'],
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'Inputs',
    description: 'A toggle switch for boolean values, rendered as an accessible button with role="switch".',
    usage: `'use client';

import { useState } from 'react';
import Switch from '@/src/components/Switch/Switch';

export default function Example() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
        label="Email notifications"
        hint="Receive updates about your account activity."
      />
      <Switch checked={true} onCheckedChange={() => {}} label="Always on" />
      <Switch checked={false} onCheckedChange={() => {}} label="Disabled" disabled />
    </div>
  );
}`,
    props: [
      {
        name: 'checked',
        type: 'boolean',
        default: '—',
        description: 'Controlled checked state.',
      },
      {
        name: 'onCheckedChange',
        type: '(checked: boolean) => void',
        default: '—',
        description: 'Callback fired when the switch is toggled.',
      },
      {
        name: 'label',
        type: 'string',
        default: '—',
        description: 'Visible label rendered beside the switch.',
      },
      {
        name: 'hint',
        type: 'string',
        default: '—',
        description: 'Helper text rendered below the label.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the switch.',
      },
      {
        name: 'id',
        type: 'string',
        default: 'auto',
        description: 'HTML id for the switch button; auto-derived from label if omitted.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Switch/Switch.tsx'],
  },
  {
    slug: 'toggle-group',
    name: 'ToggleGroup',
    category: 'Inputs',
    description: 'A segmented group of toggle buttons where one item (single mode) or many items (multiple mode) can be active at once.',
    usage: `'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';

export default function Example() {
  const [align, setAlign] = useState('left');

  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup type="single" value={align} onValueChange={setAlign}>
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}`,
    props: [
      {
        name: 'type',
        type: '"single" | "multiple"',
        default: '—',
        description: 'Controls whether one or many items can be active at once.',
      },
      {
        name: 'value',
        type: 'string | string[]',
        default: '—',
        description: 'Controlled value. String for single mode, string[] for multiple.',
      },
      {
        name: 'onValueChange',
        type: '(value: string | string[]) => void',
        default: '—',
        description: 'Called with the new value when selection changes.',
      },
      {
        name: 'size',
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: 'Controls height and padding of all items.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables all items in the group.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['ToggleGroup/ToggleGroup.tsx'],
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'Display',
    description: 'Inline label for status, category, or count.',
    usage: `import { Badge } from '@/src/components/Badge/Badge';

<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="outline">Outline</Badge>`,
    props: [
      { name: 'variant',   type: "'default' | 'success' | 'warning' | 'danger' | 'outline'", default: "'default'", description: 'Visual style of the badge.' },
      { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['src/components/Badge/Badge.tsx'],
  },
  {
    slug: 'card',
    name: 'Card',
    category: 'Display',
    description: 'A flexible container component for grouping related content into a distinct visual surface, composed with CardHeader, CardContent, and CardFooter.',
    usage: `import { Card, CardHeader, CardContent, CardFooter } from '@/src/components/Card/Card';
import Button from '@/src/components/Button/Button';

export default function Example() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Card>
        <CardHeader>
          <p className="text-base font-semibold text-text">Default Card</p>
          <p className="text-sm text-text-muted">Grouped content with a clear boundary.</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text">Card body content goes here.</p>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm">Cancel</Button>
          <Button size="sm">Save</Button>
        </CardFooter>
      </Card>
      <Card variant="elevated">
        <CardContent>
          <p className="text-sm text-text">Elevated — floats above the page surface.</p>
        </CardContent>
      </Card>
      <Card variant="outline">
        <CardContent>
          <p className="text-sm text-text">Outline — transparent background with a strong border.</p>
        </CardContent>
      </Card>
    </div>
  );
}`,
    props: [
      {
        name: 'variant',
        type: '"default" | "elevated" | "outline"',
        default: '"default"',
        description: 'Visual style of the card surface.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the root div.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Card/Card.tsx'],
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'Inputs',
    description: 'Single-value dropdown with arrow-key navigation, typeahead, and subtle open/close animation.',
    usage: `'use client';

import { useState } from 'react';
import { Select } from '@/src/components/Select/Select';

const FRAMEWORKS = [
  { value: 'next',    label: 'Next.js'  },
  { value: 'remix',   label: 'Remix'    },
  { value: 'astro',   label: 'Astro'    },
  { value: 'sveltekit', label: 'SvelteKit' },
];

export default function Example() {
  const [value, setValue] = useState('');

  return (
    <Select
      label="Framework"
      placeholder="Choose a framework…"
      options={FRAMEWORKS}
      value={value}
      onChange={setValue}
      hint="The framework your project uses."
    />
  );
}`,
    props: [
      { name: 'options',     type: 'SelectOption[]',             default: '—',          description: 'Array of { value, label } objects.' },
      { name: 'value',       type: 'string',                     default: 'undefined',  description: 'Controlled selected value.' },
      { name: 'onChange',    type: '(value: string) => void',    default: 'undefined',  description: 'Called when a selection is made.' },
      { name: 'placeholder', type: 'string',                     default: "'Select…'",  description: 'Shown when no value is selected.' },
      { name: 'label',       type: 'string',                     default: 'undefined',  description: 'Visible label above the trigger.' },
      { name: 'hint',        type: 'string',                     default: 'undefined',  description: 'Helper text (hidden when error is set).' },
      { name: 'error',       type: 'string',                     default: 'undefined',  description: 'Error message; switches trigger to error state.' },
      { name: 'size',        type: "'sm' | 'md'",                default: "'md'",       description: 'Trigger height and text size.' },
      { name: 'disabled',    type: 'boolean',                    default: 'false',      description: 'Prevents interaction.' },
      { name: 'className',   type: 'string',                     default: "''",         description: 'Additional classes on the root wrapper.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['src/components/Select/Select.tsx'],
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'Inputs',
    description: 'Controlled or uncontrolled checkbox with optional label.',
    usage: `import { Checkbox } from '@/src/components/Checkbox/Checkbox';

<Checkbox label="Accept terms" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Disabled" disabled />`,
    props: [
      { name: 'label',    type: 'string',  default: 'undefined', description: 'Text label rendered next to the checkbox.' },
      { name: 'id',       type: 'string',  default: 'undefined', description: 'HTML id, links label to input.' },
      { name: 'checked',  type: 'boolean', default: 'undefined', description: 'Controlled checked state.' },
      { name: 'disabled', type: 'boolean', default: 'false',     description: 'Disables the checkbox.' },
      { name: 'onChange', type: 'ChangeEventHandler<HTMLInputElement>', default: 'undefined', description: 'Change event handler.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['src/components/Checkbox/Checkbox.tsx'],
  },
  {
    slug: 'table',
    name: 'Table',
    category: 'Display',
    description: 'A set of composable table subcomponents for displaying structured, tabular data with sortable columns, row striping, and hover highlights.',
    usage: `import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '@/src/components/Table/Table';

export default function Example() {
  return (
    <Table>
      <TableHead>
        <TableRow header>
          <TableHeader>Name</TableHeader>
          <TableHeader>Role</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Alice Chen</TableCell>
          <TableCell>Engineer</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob Ruiz</TableCell>
          <TableCell>Designer</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Carol Smith</TableCell>
          <TableCell>Manager</TableCell>
          <TableCell>Away</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}`,
    props: [
      {
        name: 'striped',
        type: 'boolean',
        default: 'false',
        description: 'Alternates odd/even row background colors in the body.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes merged onto the table element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Table/Table.tsx'],
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    category: 'Display',
    description: 'A set of loading placeholder components that mimic content shapes while data is being fetched.',
    usage: `import {
  Skeleton,
  SkeletonCard,
  SkeletonInput,
  SkeletonTableRow,
} from '@/src/components/Skeleton/Skeleton';

export default function Example() {
  return (
    <div className="flex flex-col gap-6 max-w-sm">
      {/* Avatar + text row */}
      <div className="flex items-center gap-3">
        <Skeleton width="40px" height="40px" className="rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton height="14px" className="w-2/5" />
          <Skeleton height="12px" className="w-3/5" />
        </div>
      </div>

      {/* Card */}
      <SkeletonCard lines={3} />

      {/* Input */}
      <SkeletonInput label />

      {/* Table rows */}
      <div className="flex flex-col gap-2">
        <SkeletonTableRow columns={3} />
        <SkeletonTableRow columns={3} />
        <SkeletonTableRow columns={3} />
      </div>
    </div>
  );
}`,
    props: [
      {
        name: 'width',
        type: 'string',
        default: '—',
        description: 'CSS width applied inline on the base Skeleton block.',
      },
      {
        name: 'height',
        type: 'string',
        default: '—',
        description: 'CSS height applied inline on the base Skeleton block.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes for sizing and shaping (all variants).',
      },
      {
        name: 'lines',
        type: 'number',
        default: '3',
        description: 'SkeletonCard — number of body text lines to render.',
      },
      {
        name: 'label',
        type: 'boolean',
        default: 'false',
        description: 'SkeletonInput — whether to show a label placeholder above the input.',
      },
      {
        name: 'fields',
        type: 'number',
        default: '3',
        description: 'SkeletonForm — number of labelled input fields to render.',
      },
      {
        name: 'columns',
        type: 'number',
        default: '4',
        description: 'SkeletonTableRow — number of equal-width column blocks per row.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Skeleton/Skeleton.tsx'],
  },
  {
    slug: 'typography',
    name: 'Typography',
    category: 'Display',
    description: 'A single component that renders the full typographic scale — headings, body text, code, blockquote, and muted variants — using semantic design tokens.',
    usage: `import Typography from '@/src/components/Typography/Typography';

export default function Example() {
  return (
    <div className="flex flex-col gap-3">
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="lead">Lead paragraph text</Typography>
      <Typography variant="p">Body paragraph with normal line height.</Typography>
      <Typography variant="muted">Muted helper text</Typography>
      <Typography variant="small">Small caption text</Typography>
      <Typography variant="code">const x = 42;</Typography>
      <Typography variant="blockquote">A quoted passage from a source.</Typography>
    </div>
  );
}`,
    props: [
      {
        name: 'variant',
        type: '"h1" | "h2" | "h3" | "h4" | "p" | "lead" | "muted" | "small" | "code" | "blockquote"',
        default: '—',
        description: 'The typographic style to render.',
      },
      {
        name: 'as',
        type: 'ElementType',
        default: 'derived from variant',
        description: 'Override the rendered HTML element while keeping the variant styles.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes merged onto the element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Typography/Typography.tsx'],
  },
  {
    slug: 'form',
    name: 'Form',
    category: 'Forms',
    description: 'A set of composable layout primitives for building forms — handling spacing, labeling, error display, and section grouping without owning form state.',
    usage: `import {
  Form,
  FormSection,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/src/components/Form/Form';
import Input from '@/src/components/Input/Input';
import Button from '@/src/components/Button/Button';

export default function Example() {
  return (
    <Form className="max-w-sm">
      <FormSection title="Account details" description="Update your login information.">
        <FormField>
          <FormLabel htmlFor="email" required>Email</FormLabel>
          <FormControl>
            <Input id="email" type="email" placeholder="you@example.com" aria-required="true" />
          </FormControl>
          <FormDescription>We will never share your email.</FormDescription>
          <FormMessage>{''}</FormMessage>
        </FormField>
        <FormField>
          <FormLabel htmlFor="username">Username</FormLabel>
          <FormControl>
            <Input id="username" placeholder="johndoe" />
          </FormControl>
        </FormField>
      </FormSection>
      <Button type="submit">Save changes</Button>
    </Form>
  );
}`,
    props: [
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes merged onto the form element.',
      },
    ],
    dependencies: [],
    registryDependencies: ['input', 'button'],
    files: ['Form/Form.tsx'],
  },
  {
    slug: 'alert',
    name: 'Alert',
    category: 'Feedback',
    description: 'Contextual feedback banner for success, warning, danger, or info.',
    usage: `import { Alert } from '@/src/components/Alert/Alert';

<Alert title="Heads up">This is a default alert.</Alert>
<Alert variant="success" title="Success">Your changes were saved.</Alert>
<Alert variant="warning" title="Warning">Review before continuing.</Alert>
<Alert variant="danger" title="Error">Something went wrong.</Alert>`,
    props: [
      { name: 'variant',   type: "'default' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Alert color and icon.' },
      { name: 'title',     type: 'string',    default: 'undefined', description: 'Bold heading text.' },
      { name: 'children',  type: 'ReactNode', default: 'undefined', description: 'Body content.' },
      { name: 'className', type: 'string',    default: "''",        description: 'Additional CSS classes.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['src/components/Alert/Alert.tsx'],
  },
  {
    slug: 'accordion',
    name: 'Accordion',
    category: 'Disclosure',
    description: 'A compound component for showing and hiding sections of content, supporting single-item and multi-item expansion modes.',
    usage: `import Accordion, {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/src/components/Accordion/Accordion';

export default function Example() {
  return (
    <div className="max-w-sm">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is Obi UI?</AccordionTrigger>
          <AccordionContent>
            Obi UI is a token-based component library for React, built on Tailwind v4.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I install it?</AccordionTrigger>
          <AccordionContent>
            Run npx @obi/ui add [component] to copy any component into your project.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Does it support dark mode?</AccordionTrigger>
          <AccordionContent>
            Yes — all components use semantic tokens that respond to the .dark class on the root element.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}`,
    props: [
      {
        name: 'type',
        type: '"single" | "multiple"',
        default: '"single"',
        description: 'Whether one or many items can be open at once.',
      },
      {
        name: 'defaultValue',
        type: 'string | string[]',
        default: '—',
        description: 'Item value(s) open on initial render.',
      },
      {
        name: 'collapsible',
        type: 'boolean',
        default: 'false',
        description: 'When type is single, whether the open item can be collapsed by clicking again.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes on the root div.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Accordion/Accordion.tsx'],
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    description: 'A compound component for switching between related panels of content, with a sliding active-tab indicator.',
    usage: `'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/Tabs/Tabs';

export default function Example() {
  const [tab, setTab] = useState('overview');

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-text">Overview content goes here.</p>
      </TabsContent>
      <TabsContent value="details">
        <p className="text-sm text-text">Details content goes here.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-text">Settings content goes here.</p>
      </TabsContent>
    </Tabs>
  );
}`,
    props: [
      {
        name: 'value',
        type: 'string',
        default: '—',
        description: 'The currently active tab value (controlled).',
      },
      {
        name: 'onValueChange',
        type: '(v: string) => void',
        default: '—',
        description: 'Called when the user activates a different tab.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes on the root wrapper div.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Tabs/Tabs.tsx'],
  },
  {
    slug: 'sidebar',
    name: 'Sidebar',
    category: 'Navigation',
    description: 'Vertical navigation sidebar with sections, links, and dividers.',
    usage: `import { Sidebar, SidebarSection, SidebarLink, SidebarDivider } from '@/src/components/Sidebar/Sidebar';

<Sidebar>
  <SidebarSection>
    <SidebarLink href="/" isActive>Home</SidebarLink>
    <SidebarLink href="/docs">Documentation</SidebarLink>
    <SidebarLink href="/examples">Examples</SidebarLink>
  </SidebarSection>
  <SidebarDivider />
  <SidebarSection label="Components">
    <SidebarLink href="/components/button">Button</SidebarLink>
    <SidebarLink href="/components/input">Input</SidebarLink>
  </SidebarSection>
</Sidebar>`,
    props: [
      { name: 'width',     type: 'string',    default: "'w-56'",    description: 'Tailwind width class for the sidebar.' },
      { name: 'className', type: 'string',    default: "''",        description: 'Additional CSS classes.' },
      { name: 'children',  type: 'ReactNode', default: 'undefined', description: 'Sidebar content (sections, links, dividers).' },
    ],
    dependencies:         ['next/link'],
    registryDependencies: [],
    files:                ['Sidebar/Sidebar.tsx'],
  },
  {
    slug: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigation',
    description: 'A navigational landmark that shows the user\'s current location within a site hierarchy.',
    usage: `import Breadcrumb from '@/src/components/Breadcrumb/Breadcrumb';

export default function Example() {
  return (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Components', href: '/components' },
        { label: 'Breadcrumb' },
      ]}
    />
  );
}`,
    props: [
      {
        name: 'items',
        type: 'Array<{ label: string; href?: string }>',
        default: '—',
        description: 'Ordered list of crumbs. The last item is the current page and should have no href.',
      },
      {
        name: 'separator',
        type: 'ReactNode',
        default: '"/"',
        description: 'Rendered between each item. Accepts strings or any React element.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes applied to the wrapping nav element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Breadcrumb/Breadcrumb.tsx'],
  },

  // ─── Charts ──────────────────────────────────────────────────────────────
  {
    slug: 'line-chart',
    name: 'LineChart',
    category: 'Charts',
    description: 'A line chart for visualising trends over time, supporting multiple series.',
    usage: `import { LineChart } from '@/src/components/Charts/Charts';

const data = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 5000, expenses: 2800 },
  { month: 'Apr', revenue: 4780, expenses: 3908 },
  { month: 'May', revenue: 5890, expenses: 4800 },
  { month: 'Jun', revenue: 4390, expenses: 3800 },
];

export default function Example() {
  return (
    <LineChart
      data={data}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue' },
        { key: 'expenses', label: 'Expenses' },
      ]}
    />
  );
}`,
    props: [
      { name: 'data', type: 'ChartDataPoint[]', default: '—', description: 'Array of data objects.' },
      { name: 'xKey', type: 'string', default: '—', description: 'Key in each data object to use as the x-axis label.' },
      { name: 'series', type: 'ChartSeries[]', default: '—', description: 'Lines to render. Each entry has key, label, and optional color.' },
      { name: 'height', type: 'number', default: '240', description: 'Chart height in px.' },
      { name: 'showLegend', type: 'boolean', default: 'true', description: 'Whether to show the legend.' },
      { name: 'showGrid', type: 'boolean', default: 'true', description: 'Whether to show the background grid.' },
      { name: 'className', type: 'string', default: '""', description: 'Extra classes applied to the container.' },
    ],
    dependencies: ['recharts'],
    registryDependencies: [],
    files: ['Charts/Charts.tsx'],
  },
  {
    slug: 'bar-chart',
    name: 'BarChart',
    category: 'Charts',
    description: 'A vertical bar chart for comparing values across categories, with optional stacking.',
    usage: `import { BarChart } from '@/src/components/Charts/Charts';

const data = [
  { quarter: 'Q1', sales: 4000, returns: 400 },
  { quarter: 'Q2', sales: 3000, returns: 300 },
  { quarter: 'Q3', sales: 5000, returns: 200 },
  { quarter: 'Q4', sales: 4780, returns: 180 },
];

export default function Example() {
  return (
    <BarChart
      data={data}
      xKey="quarter"
      series={[
        { key: 'sales', label: 'Sales' },
        { key: 'returns', label: 'Returns' },
      ]}
    />
  );
}`,
    props: [
      { name: 'data', type: 'ChartDataPoint[]', default: '—', description: 'Array of data objects.' },
      { name: 'xKey', type: 'string', default: '—', description: 'Key to use as the x-axis label.' },
      { name: 'series', type: 'ChartSeries[]', default: '—', description: 'Bar groups to render.' },
      { name: 'stacked', type: 'boolean', default: 'false', description: 'Stack series on top of each other.' },
      { name: 'height', type: 'number', default: '240', description: 'Chart height in px.' },
      { name: 'showLegend', type: 'boolean', default: 'true', description: 'Whether to show the legend.' },
      { name: 'showGrid', type: 'boolean', default: 'true', description: 'Whether to show the background grid.' },
      { name: 'className', type: 'string', default: '""', description: 'Extra classes applied to the container.' },
    ],
    dependencies: ['recharts'],
    registryDependencies: [],
    files: ['Charts/Charts.tsx'],
  },
  {
    slug: 'area-chart',
    name: 'AreaChart',
    category: 'Charts',
    description: 'A filled area chart for emphasising volume and cumulative values over time.',
    usage: `import { AreaChart } from '@/src/components/Charts/Charts';

const data = [
  { month: 'Jan', users: 800, sessions: 1200 },
  { month: 'Feb', users: 1200, sessions: 1800 },
  { month: 'Mar', users: 1000, sessions: 1500 },
  { month: 'Apr', users: 1400, sessions: 2100 },
  { month: 'May', users: 1800, sessions: 2700 },
  { month: 'Jun', users: 2200, sessions: 3300 },
];

export default function Example() {
  return (
    <AreaChart
      data={data}
      xKey="month"
      series={[
        { key: 'users', label: 'Users' },
        { key: 'sessions', label: 'Sessions' },
      ]}
    />
  );
}`,
    props: [
      { name: 'data', type: 'ChartDataPoint[]', default: '—', description: 'Array of data objects.' },
      { name: 'xKey', type: 'string', default: '—', description: 'Key to use as the x-axis label.' },
      { name: 'series', type: 'ChartSeries[]', default: '—', description: 'Areas to render.' },
      { name: 'stacked', type: 'boolean', default: 'false', description: 'Stack areas on top of each other.' },
      { name: 'height', type: 'number', default: '240', description: 'Chart height in px.' },
      { name: 'showLegend', type: 'boolean', default: 'true', description: 'Whether to show the legend.' },
      { name: 'showGrid', type: 'boolean', default: 'true', description: 'Whether to show the background grid.' },
      { name: 'className', type: 'string', default: '""', description: 'Extra classes applied to the container.' },
    ],
    dependencies: ['recharts'],
    registryDependencies: [],
    files: ['Charts/Charts.tsx'],
  },
  {
    slug: 'donut-chart',
    name: 'DonutChart',
    category: 'Charts',
    description: 'A donut (or pie) chart for part-to-whole proportions across named slices.',
    usage: `import { DonutChart } from '@/src/components/Charts/Charts';

export default function Example() {
  return (
    <DonutChart
      data={[
        { label: 'Direct', value: 400 },
        { label: 'Referral', value: 300 },
        { label: 'Organic', value: 200 },
        { label: 'Social', value: 100 },
      ]}
    />
  );
}`,
    props: [
      { name: 'data', type: 'DonutSlice[]', default: '—', description: 'Array of { label, value, color? } slices.' },
      { name: 'innerRadius', type: 'number', default: '0.65', description: 'Inner radius as a fraction of outer. 0 = pie chart.' },
      { name: 'height', type: 'number', default: '240', description: 'Chart height in px.' },
      { name: 'showLegend', type: 'boolean', default: 'true', description: 'Whether to show the legend.' },
      { name: 'className', type: 'string', default: '""', description: 'Extra classes applied to the container.' },
    ],
    dependencies: ['recharts'],
    registryDependencies: [],
    files: ['Charts/Charts.tsx'],
  },
  {
    slug: 'kanban',
    name: 'KanbanBoard',
    category: 'Drag & Drop',
    description: 'A drag-and-drop Kanban board with keyboard support. Cards can be dragged between columns and reordered within columns.',
    usage: `import { KanbanBoard } from '@/src/components/Kanban/Kanban';

const initialColumns = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: '1', title: 'Research competitors', tag: 'Research' },
      { id: '2', title: 'Write spec', description: 'Define requirements for v2.' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: '3', title: 'Build prototype', tag: 'Engineering' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: '4', title: 'Kick-off meeting', description: 'Align on goals and timeline.' },
    ],
  },
];

export default function Example() {
  return <KanbanBoard initialColumns={initialColumns} />;
}`,
    props: [
      { name: 'initialColumns', type: 'KanbanColumnData[]', default: '—', description: 'Initial column and card data. Column and card state is managed internally.' },
      { name: 'className', type: 'string', default: '""', description: 'Extra classes on the board container.' },
    ],
    dependencies: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
    registryDependencies: [],
    files: ['Kanban/Kanban.tsx'],
  },
  {
    slug: 'progress',
    name: 'Progress',
    category: 'Feedback',
    description: 'Horizontal bar indicating task completion.',
    usage: `import { Progress } from '@/src/components/Progress/Progress';

<Progress value={40} />
<Progress value={70} showLabel />
<Progress value={90} size="lg" showLabel />`,
    props: [
      { name: 'value',     type: 'number',              default: '—',    description: 'Current value (0–max).' },
      { name: 'max',       type: 'number',              default: '100',  description: 'Maximum value.' },
      { name: 'showLabel', type: 'boolean',             default: 'false', description: 'Show "Progress X%" label row.' },
      { name: 'size',      type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Track height.' },
      { name: 'className', type: 'string',              default: "''",   description: 'Additional CSS classes.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['src/components/Progress/Progress.tsx'],
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    category: 'Feedback',
    description: 'Animated loading indicator.',
    usage: `import { Spinner } from '@/src/components/Spinner/Spinner';

<Spinner />
<Spinner size="sm" />
<Spinner size="lg" label="Saving…" />`,
    props: [
      { name: 'size',      type: "'sm' | 'md' | 'lg'", default: "'md'",      description: 'Size of the spinner.' },
      { name: 'label',     type: 'string',              default: "'Loading…'", description: 'Screen reader label.' },
      { name: 'className', type: 'string',              default: "''",        description: 'Additional CSS classes.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['src/components/Spinner/Spinner.tsx'],
  },
  {
    slug:        'toast',
    name:        'Toast',
    category:    'Feedback',
    description: 'Ephemeral notification toasts with auto-dismiss, variants, and optional actions.',
    usage: `import { ToastProvider, useToast } from '@/src/components/Toast/Toast';

// 1. Wrap your app (or layout) with ToastProvider
export default function Layout({ children }) {
  return (
    <ToastProvider position="bottom-right">
      {children}
    </ToastProvider>
  );
}

// 2. Call useToast() anywhere inside the tree
function MyComponent() {
  const { toast } = useToast();

  return (
    <button
      onClick={() => toast({
        title:       'Saved',
        description: 'Your changes were saved.',
        variant:     'success',
        duration:    4000,
      })}
    >
      Save
    </button>
  );
}`,
    props: [
      { name: 'position',    type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'", default: "'bottom-right'", description: 'Where toasts appear on screen.' },
      { name: 'title',       type: 'string',                                       default: 'undefined',  description: 'Bold heading text.' },
      { name: 'description', type: 'string',                                       default: 'undefined',  description: 'Body message.' },
      { name: 'variant',     type: "'default' | 'success' | 'warning' | 'danger'", default: "'default'",  description: 'Color and icon style.' },
      { name: 'duration',    type: 'number',                                       default: '4000',       description: 'Auto-dismiss delay in ms.' },
      { name: 'action',      type: '{ label: string; onClick: () => void }',       default: 'undefined',  description: 'Optional action button.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['src/components/Toast/Toast.tsx'],
  },
  {
    slug: 'canvas',
    name: 'Canvas',
    category: 'Canvas',
    description: 'A freehand drawing surface with pen and eraser tools, color palette, variable stroke widths, undo/redo, and PNG download.',
    usage: `import { Canvas } from '@/src/components/Canvas/Canvas';

export default function Example() {
  return (
    <Canvas
      height={400}
      defaultColor="#18181b"
      defaultStrokeWidth={4}
    />
  );
}`,
    props: [
      { name: 'width', type: 'number', default: 'container width', description: 'Canvas width in px. Defaults to responsive container width.' },
      { name: 'height', type: 'number', default: '400', description: 'Canvas height in px.' },
      { name: 'defaultColor', type: 'string', default: "'#18181b'", description: 'Initial stroke color.' },
      { name: 'defaultStrokeWidth', type: 'number', default: '4', description: 'Initial stroke width in px.' },
      { name: 'showToolbar', type: 'boolean', default: 'true', description: 'Whether to render the built-in toolbar.' },
      { name: 'className', type: 'string', default: '""', description: 'Extra classes on the wrapper div.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Canvas/Canvas.tsx'],
  },
  {
    slug: 'tree',
    name: 'Tree',
    category: 'Display',
    description: 'A collapsible, keyboard-navigable tree view for hierarchical data — file trees, org charts, and nested navigation.',
    usage: `import Tree, { TreeItem } from '@/src/components/Tree/Tree';

export default function Example() {
  return (
    <Tree>
      <TreeItem label="src" defaultOpen>
        <TreeItem label="components">
          <TreeItem label="Button.tsx" />
          <TreeItem label="Input.tsx" />
        </TreeItem>
        <TreeItem label="app">
          <TreeItem label="page.tsx" />
          <TreeItem label="layout.tsx" />
        </TreeItem>
      </TreeItem>
      <TreeItem label="package.json" />
      <TreeItem label="tsconfig.json" />
    </Tree>
  );
}`,
    props: [
      {
        name: 'label',
        type: 'ReactNode',
        default: '—',
        description: 'The text or content displayed for the node. (TreeItem)',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '—',
        description: 'Nested TreeItem elements. Presence makes this a branch node. (TreeItem)',
      },
      {
        name: 'defaultOpen',
        type: 'boolean',
        default: 'false',
        description: 'Whether a branch starts expanded on initial render. (TreeItem)',
      },
      {
        name: 'icon',
        type: 'ReactNode',
        default: '—',
        description: 'Custom icon overriding the default chevron or file icon. (TreeItem)',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables interaction. Item is visible but not clickable or focusable. (TreeItem)',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes on the item row or tree root element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Tree/Tree.tsx'],
  },
  {
    slug: 'timeline',
    name: 'Timeline',
    category: 'Display',
    description: 'A vertical step list with numbered indicators and connector lines, for ordered sequences like setup guides, onboarding flows, and activity feeds.',
    usage: `import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';

export default function Example() {
  return (
    <Timeline>
      <TimelineItem title="Install the CLI">
        Run <code>npx @obi/ui init</code> in your project root.
      </TimelineItem>
      <TimelineItem title="Add components">
        Use <code>npx @obi/ui add button input</code> to copy components into your project.
      </TimelineItem>
      <TimelineItem title="Import and use">
        Import from <code>@/components/ui</code> and start building.
      </TimelineItem>
    </Timeline>
  );
}`,
    props: [
      {
        name: 'animate',
        type: '"stagger" | "none"',
        default: '"stagger"',
        description: 'Mount animation. stagger fades and slides each item in with a cascading delay — the container holds its full size from the start so there is no layout shift. Use none when adding items dynamically over time and animating them yourself.',
      },
      {
        name: 'direction',
        type: '"vertical" | "horizontal"',
        default: '"vertical"',
        description: 'Layout direction. vertical stacks items top-to-bottom; horizontal places them in a row with the connector line across the top.',
      },
      {
        name: 'variant',
        type: '"brand" | "muted"',
        default: '"brand"',
        description: 'Controls the indicator dot style. brand = filled brand color; muted = outlined neutral.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes on the wrapper div.',
      },
      {
        name: 'children',
        type: 'React.ReactNode',
        default: '—',
        description: 'One or more TimelineItem elements.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Timeline/Timeline.tsx'],
  },

  {
    slug: 'command-palette',
    name: 'CommandPalette',
    category: 'Overlay',
    description: 'A modal command palette overlay with fuzzy search, grouped results, match highlighting, keyboard navigation, and focus trap.',
    usage: `'use client';

import { useState } from 'react';
import { CommandPalette, CommandGroup, CommandItem } from '@/src/components/CommandPalette/CommandPalette';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open palette</button>
      <CommandPalette open={open} onClose={() => setOpen(false)}>
        <CommandGroup label="Navigation">
          <CommandItem value="Dashboard" onSelect={() => setOpen(false)} shortcut="G D">Dashboard</CommandItem>
          <CommandItem value="Settings" onSelect={() => setOpen(false)} shortcut="G S">Settings</CommandItem>
        </CommandGroup>
        <CommandGroup label="Actions">
          <CommandItem value="New document" onSelect={() => setOpen(false)}>New document</CommandItem>
          <CommandItem value="Export PDF" onSelect={() => setOpen(false)}>Export PDF</CommandItem>
        </CommandGroup>
      </CommandPalette>
    </>
  );
}`,
    props: [
      { name: 'open',        type: 'boolean',          default: '—',                   description: 'Whether the palette is visible.' },
      { name: 'onClose',     type: '() => void',        default: '—',                   description: 'Called when the user presses Escape, clicks the backdrop, or activates an item.' },
      { name: 'placeholder', type: 'string',            default: "'Search commands…'",  description: 'Placeholder text in the search input.' },
      { name: 'children',    type: 'ReactNode',         default: '—',                   description: 'CommandGroup and CommandItem elements.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['CommandPalette/CommandPalette.tsx'],
  },
  {
    slug: 'combobox',
    name: 'Combobox',
    category: 'Inputs',
    description: 'A searchable dropdown that filters options as the user types, with single-select and multi-select (pill chip) modes.',
    usage: `'use client';

import { useState } from 'react';
import { Combobox } from '@/src/components/Combobox/Combobox';

const LANGUAGES = [
  { value: 'ts',  label: 'TypeScript' },
  { value: 'js',  label: 'JavaScript' },
  { value: 'py',  label: 'Python'     },
  { value: 'rs',  label: 'Rust'       },
  { value: 'go',  label: 'Go'         },
];

export default function Example() {
  const [value, setValue] = useState('');
  const [multi, setMulti] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-6 max-w-sm">
      <Combobox
        label="Language"
        placeholder="Search languages…"
        options={LANGUAGES}
        value={value}
        onChange={setValue}
      />
      <Combobox
        label="Languages (multi)"
        placeholder="Search languages…"
        options={LANGUAGES}
        multiple
        value={multi}
        onChange={setMulti}
      />
    </div>
  );
}`,
    props: [
      { name: 'options',     type: 'ComboboxOption[]',               default: '—',         description: 'Array of { value, label, disabled? } objects.' },
      { name: 'value',       type: 'string | string[]',              default: 'undefined', description: 'Controlled selected value.' },
      { name: 'onChange',    type: '(value: string | string[]) => void', default: 'undefined', description: 'Called when selection changes.' },
      { name: 'multiple',    type: 'boolean',                        default: 'false',     description: 'Enables multi-select mode with pill chips.' },
      { name: 'placeholder', type: 'string',                         default: "'Search…'", description: 'Placeholder shown in the input.' },
      { name: 'label',       type: 'string',                         default: 'undefined', description: 'Visible label above the input.' },
      { name: 'hint',        type: 'string',                         default: 'undefined', description: 'Helper text below the input.' },
      { name: 'error',       type: 'string',                         default: 'undefined', description: 'Error message; switches input to error state.' },
      { name: 'size',        type: "'sm' | 'md'",                    default: "'md'",      description: 'Input size.' },
      { name: 'disabled',    type: 'boolean',                        default: 'false',     description: 'Prevents all interaction.' },
      { name: 'className',   type: 'string',                         default: "''",        description: 'Additional classes on the root wrapper.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Combobox/Combobox.tsx'],
  },
  {
    slug: 'date-picker',
    name: 'DatePicker',
    category: 'Inputs',
    description: 'A trigger button that opens a calendar popup for selecting a single date, with full keyboard navigation, min/max bounds, and no external date library.',
    usage: `'use client';

import { useState } from 'react';
import { DatePicker } from '@/src/components/DatePicker/DatePicker';

export default function Example() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div className="max-w-xs flex flex-col gap-4">
      <DatePicker
        label="Appointment date"
        placeholder="Pick a date"
        value={date}
        onChange={setDate}
        hint="Arrow keys navigate the calendar grid."
      />
      <DatePicker
        label="Disabled"
        value={null}
        onChange={() => {}}
        disabled
      />
    </div>
  );
}`,
    props: [
      { name: 'value',       type: 'Date | null',       default: 'undefined', description: 'The currently selected date (controlled).' },
      { name: 'onChange',    type: '(date: Date) => void', default: 'undefined', description: 'Called when the user selects a day.' },
      { name: 'placeholder', type: 'string',             default: "'Pick a date'", description: 'Text shown when no date is selected.' },
      { name: 'min',         type: 'Date',               default: 'undefined', description: 'Earliest selectable date.' },
      { name: 'max',         type: 'Date',               default: 'undefined', description: 'Latest selectable date.' },
      { name: 'disabled',    type: 'boolean',            default: 'false',     description: 'Disables the trigger.' },
      { name: 'label',       type: 'string',             default: 'undefined', description: 'Visible label above the trigger.' },
      { name: 'hint',        type: 'string',             default: 'undefined', description: 'Helper text below the trigger.' },
      { name: 'error',       type: 'string',             default: 'undefined', description: 'Error message; applies error border styling.' },
      { name: 'className',   type: 'string',             default: "''",        description: 'Additional classes on the root wrapper.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['DatePicker/DatePicker.tsx'],
  },
  {
    slug: 'data-table',
    name: 'DataTable',
    category: 'Display',
    description: 'A full-featured, column-definition driven data table with client-side sorting, row selection with indeterminate header checkbox, and pagination.',
    usage: `'use client';

import { useState } from 'react';
import DataTable, { type ColumnDef } from '@/src/components/DataTable/DataTable';

interface Person { id: number; name: string; role: string; status: string; }

const COLUMNS: ColumnDef<Person>[] = [
  { key: 'name',   header: 'Name',   sortable: true },
  { key: 'role',   header: 'Role',   sortable: true },
  { key: 'status', header: 'Status', sortable: false },
];

const DATA: Person[] = [
  { id: 1, name: 'Alice Chen',  role: 'Engineer', status: 'Active' },
  { id: 2, name: 'Bob Ruiz',    role: 'Designer', status: 'Away'   },
  { id: 3, name: 'Carol Smith', role: 'Manager',  status: 'Active' },
];

export default function Example() {
  const [selected, setSelected] = useState<Person[]>([]);
  return (
    <DataTable<Person>
      data={DATA}
      columns={COLUMNS}
      keyField="id"
      selectable
      onSelectionChange={setSelected}
      pageSize={5}
    />
  );
}`,
    props: [
      { name: 'data',              type: 'T[]',                    default: '—',       description: 'Array of data objects to display.' },
      { name: 'columns',           type: 'ColumnDef<T>[]',         default: '—',       description: 'Column definitions controlling headers, keys, sorting, and cell rendering.' },
      { name: 'keyField',          type: 'keyof T & string',       default: '—',       description: 'Property key used as a unique row identifier.' },
      { name: 'selectable',        type: 'boolean',                default: 'false',   description: 'Prepends a checkbox column for row selection.' },
      { name: 'onSelectionChange', type: '(selected: T[]) => void', default: 'undefined', description: 'Called with selected rows whenever selection changes.' },
      { name: 'pageSize',          type: 'number',                 default: '10',      description: 'Rows per page. Set to 0 to show all rows.' },
      { name: 'emptyMessage',      type: 'string',                 default: "'No data'", description: 'Text shown when data is empty.' },
      { name: 'className',         type: 'string',                 default: "''",      description: 'Additional classes on the root wrapper.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['DataTable/DataTable.tsx'],
  },
  {
    slug: 'function-plotter',
    name: 'FunctionPlotter',
    category: 'Display',
    description: 'An interactive 2D function plotter with pan, zoom, and support for multiple equations. Enter expressions like x^2 or 2*x+1 and see them graphed in real time.',
    usage: `import { FunctionPlotter } from '@/src/components/FunctionPlotter/FunctionPlotter';

export default function Example() {
  return (
    <FunctionPlotter
      initialEquations={['x^2', '2*x + 1', 'Math.sin(x) * 5']}
    />
  );
}`,
    props: [
      { name: 'initialEquations', type: 'string[]',  default: "['2*x + 1', 'x^2']", description: 'Equations to plot on mount. Supports +, -, *, /, ^, and Math.* functions.' },
      { name: 'height',           type: 'number',    default: '400',                 description: 'Canvas height in pixels. Width fills the container.' },
      { name: 'className',        type: 'string',    default: "''",                  description: 'Additional classes on the root wrapper.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['FunctionPlotter/FunctionPlotter.tsx'],
  },
  {
    slug: 'carousel',
    name: 'Carousel',
    category: 'Display',
    description: 'A compound component for cycling through a series of slides with keyboard navigation, dot indicators, and optional auto-play.',
    usage: `import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from '@/src/components/Carousel/Carousel';

const slides = [1, 2, 3, 4, 5];

export default function Example() {
  return (
    <Carousel aria-label="Number slides" className="w-full max-w-lg">
      <CarouselContent>
        {slides.map(n => (
          <CarouselItem key={n} className="flex items-center justify-center h-48 rounded-lg bg-surface-active select-none">
            <span className="text-6xl font-bold text-text-muted">{n}</span>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots className="mt-3" />
    </Carousel>
  );
}`,
    props: [
      { name: 'loop',       type: 'boolean', default: 'false',  description: 'Wraps from the last slide back to the first (and vice versa).' },
      { name: 'autoPlay',   type: 'boolean', default: 'false',  description: 'Automatically advances slides at the specified interval.' },
      { name: 'interval',   type: 'number',  default: '4000',   description: 'Milliseconds between auto-advances when autoPlay is enabled.' },
      { name: 'aria-label', type: 'string',  default: '"Carousel"', description: 'Accessible name for the carousel region landmark. Override with a descriptive value.' },
      { name: 'className',  type: 'string',  default: '""',     description: 'Additional classes on the root element.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Carousel/Carousel.tsx'],
  },
];

export const getComponent = (slug: string) => {
  return registry.find(c => c.slug === slug);
};
