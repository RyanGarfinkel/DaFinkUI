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
    description: 'A single-line text input with optional label, hint, and error messaging. Supports a floating label variant where the label animates inside the field.',
    usage: `import Input from '@/src/components/Input/Input';

export default function Example() {
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Input label="Email" placeholder="you@example.com" hint="We will never share your email." />
      <Input label="Password" type="password" placeholder="••••••••" hint="At least 8 characters." />
      <Input label="Floating label" variant="floating" />
      <Input label="Disabled" placeholder="Cannot edit" disabled />
    </div>
  );
}`,
    props: [
      {
        name: 'label',
        type: 'string',
        default: '—',
        description: 'Visible label rendered above the input (default) or animated inside it (floating); also used to derive the input id.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: '—',
        description: 'Placeholder text shown when the input is empty (default variant only).',
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
        name: 'variant',
        type: "'default' | 'floating'",
        default: "'default'",
        description: 'floating animates the label inside the input field, acting as a placeholder until the field is focused or has a value.',
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
    slug: 'otp-input',
    name: 'OTPInput',
    category: 'Inputs',
    description: 'A one-time password input composed of individual single-character cells. Supports keyboard navigation, auto-advance, and paste.',
    usage: `'use client';

import { useState } from 'react';
import OTPInput from '@/src/components/OTPInput/OTPInput';

export default function Example() {
  const [code, setCode] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <OTPInput label="Verification code" length={6} value={code} onChange={setCode} hint="Enter the 6-digit code from your email." />
      <OTPInput label="Invalid code" length={6} value="123" onChange={() => {}} error="This code has expired." />
    </div>
  );
}`,
    props: [
      {
        name: 'length',
        type: 'number',
        default: '6',
        description: 'Number of cells.',
      },
      {
        name: 'value',
        type: 'string',
        default: "''",
        description: 'Controlled value. Each character maps to a cell by index.',
      },
      {
        name: 'onChange',
        type: '(value: string) => void',
        default: '—',
        description: 'Called with the full updated string on any change.',
      },
      {
        name: 'label',
        type: 'string',
        default: '—',
        description: 'Visible label above the cells.',
      },
      {
        name: 'error',
        type: 'string',
        default: '—',
        description: 'Error message; all cells enter the error state.',
      },
      {
        name: 'hint',
        type: 'string',
        default: '—',
        description: 'Helper text shown below the cells.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables all cells.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['OTPInput/OTPInput.tsx'],
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
    files:                ['Badge/Badge.tsx'],
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
    files:                ['Select/Select.tsx'],
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
    files:                ['Checkbox/Checkbox.tsx'],
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
    files:                ['Alert/Alert.tsx'],
  },
  {
    slug: 'collapsible',
    name: 'Collapsible',
    category: 'Disclosure',
    description: 'A single-item show/hide component. Simpler than Accordion — use it for one expandable section like a filter panel, "show more" block, or settings group.',
    usage: `'use client';

import { useState } from 'react';
import Collapsible, {
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/Collapsible/Collapsible';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-sm rounded-lg border border-surface-border px-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger>Project details</CollapsibleTrigger>
        <CollapsibleContent>
          This project uses React 18, Tailwind v4, and Next.js 15. Components are
          copied directly into your repo — no runtime dependency required.
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}`,
    props: [
      {
        name: 'open',
        type: 'boolean',
        default: '—',
        description: 'Controlled open state. When provided the component is controlled.',
      },
      {
        name: 'defaultOpen',
        type: 'boolean',
        default: 'false',
        description: 'Uncontrolled initial open state.',
      },
      {
        name: 'onOpenChange',
        type: '(open: boolean) => void',
        default: '—',
        description: 'Called when the open state changes. Receives the new boolean value.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the trigger and prevents toggling.',
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
    files: ['Collapsible/Collapsible.tsx'],
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
    slug: 'mosaic',
    name: 'Mosaic',
    category: 'Drag & Drop',
    description: 'A drag-and-drop grid for metric tiles. Users reposition tiles by dragging and resize them by dragging edge handles. Tile content adapts to its current size via a render prop.',
    usage: `'use client';

import { useState } from 'react';
import Mosaic, {
  MosaicTile,
  type MosaicTileLayout,
} from '@/components/ui/Mosaic/Mosaic';

const INITIAL_LAYOUT: MosaicTileLayout[] = [
  { id: 'revenue', col: 1, row: 1, colSpan: 2, rowSpan: 1 },
  { id: 'users',   col: 3, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 'chart',   col: 1, row: 2, colSpan: 3, rowSpan: 2 },
  { id: 'growth',  col: 4, row: 1, colSpan: 1, rowSpan: 1 },
];

export default function Example() {
  const [layout, setLayout] = useState<MosaicTileLayout[]>(INITIAL_LAYOUT);

  return (
    <Mosaic
      layout={layout}
      onLayoutChange={setLayout}
      cols={4}
      rowHeight={140}
      gap={12}
    >
      <MosaicTile id="revenue" minColSpan={1} maxColSpan={3} minRowSpan={1} maxRowSpan={1}>
        {({ colSpan }) => (
          <div className="h-full flex flex-col justify-between">
            <span className="text-xs text-text-muted">Revenue</span>
            {colSpan === 1 ? (
              <span className="text-2xl font-semibold text-text">$48.5k</span>
            ) : (
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold text-text">$48.5k</span>
                <span className="text-xs text-brand font-medium">+12%</span>
              </div>
            )}
          </div>
        )}
      </MosaicTile>

      <MosaicTile id="users" minColSpan={1} maxColSpan={1} minRowSpan={1} maxRowSpan={1}>
        <div className="h-full flex flex-col justify-between">
          <span className="text-xs text-text-muted">Active users</span>
          <span className="text-2xl font-semibold text-text">3,204</span>
        </div>
      </MosaicTile>

      <MosaicTile id="chart" minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={3}>
        {({ rowSpan }) => (
          <div className="h-full flex flex-col gap-2">
            <span className="text-xs text-text-muted">Revenue over time</span>
            <div className="flex-1 flex items-end gap-1">
              {[40, 65, 50, 80, 60, 90, 75, 85].map((h, i) => (
                <div key={i} className="flex-1 relative rounded-sm overflow-hidden bg-brand/10"
                  style={{ height: rowSpan >= 2 ? '80%' : '60%' }}>
                  <div className="absolute bottom-0 w-full bg-brand/70 rounded-sm"
                    style={{ height: \`\${h}%\` }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </MosaicTile>

      <MosaicTile id="growth" minColSpan={1} maxColSpan={2} minRowSpan={1} maxRowSpan={2}>
        {({ rowSpan }) => (
          <div className="h-full flex flex-col justify-between">
            <span className="text-xs text-text-muted">Growth</span>
            <span className={\`font-semibold text-brand \${rowSpan >= 2 ? 'text-5xl' : 'text-3xl'}\`}>+24%</span>
          </div>
        )}
      </MosaicTile>
    </Mosaic>
  );
}`,
    props: [
      {
        name: 'layout',
        type: 'MosaicTileLayout[]',
        default: '—',
        description: 'Required. Array of tile layout entries. Each entry has id, col, row, colSpan, and rowSpan. col and row are 1-based grid positions.',
      },
      {
        name: 'onLayoutChange',
        type: '(layout: MosaicTileLayout[]) => void',
        default: '—',
        description: 'Required. Called when tiles are reordered or resized.',
      },
      {
        name: 'cols',
        type: 'number',
        default: '12',
        description: 'Number of grid columns.',
      },
      {
        name: 'rowHeight',
        type: 'number',
        default: '160',
        description: 'Base row height in pixels.',
      },
      {
        name: 'gap',
        type: 'number',
        default: '16',
        description: 'Gap between tiles in pixels.',
      },
      {
        name: 'minColSpan',
        type: 'number',
        default: '2',
        description: 'Minimum column span a tile can shrink to.',
      },
      {
        name: 'minRowSpan',
        type: 'number',
        default: '1',
        description: 'Minimum row span a tile can shrink to.',
      },
      {
        name: 'maxColSpan',
        type: 'number',
        default: 'cols',
        description: 'Maximum column span. Defaults to the full grid width.',
      },
      {
        name: 'maxRowSpan',
        type: 'number',
        default: '4',
        description: 'Maximum row span.',
      },
    ],
    dependencies: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
    registryDependencies: [],
    files: ['Mosaic/Mosaic.tsx'],
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
    files:                ['Progress/Progress.tsx'],
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
    files:                ['Spinner/Spinner.tsx'],
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
    files:                ['Toast/Toast.tsx'],
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
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'Overlay',
    description: 'A small floating text label that appears next to its trigger on hover or keyboard focus. Never contains interactive content.',
    usage: `import Tooltip from '@/src/components/Tooltip/Tooltip';
import Button from '@/src/components/Button/Button';

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Tooltip content="Appears above" side="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>
      <Tooltip content="Appears below" side="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>
      <Tooltip content="Appears left" side="left">
        <Button variant="secondary">Left</Button>
      </Tooltip>
      <Tooltip content="Appears right" side="right">
        <Button variant="secondary">Right</Button>
      </Tooltip>
      <Tooltip content="Opens instantly" delay={0}>
        <Button variant="secondary">No delay</Button>
      </Tooltip>
    </div>
  );
}`,
    props: [
      { name: 'content',   type: 'ReactNode',                          default: '—',      description: 'The tooltip text. Must be non-interactive content only.' },
      { name: 'children',  type: 'ReactElement',                       default: '—',      description: 'A single trigger element; receives hover/focus handlers and aria-describedby automatically.' },
      { name: 'side',      type: "'top' | 'right' | 'bottom' | 'left'", default: "'top'", description: 'Which side of the trigger the tooltip appears on.' },
      { name: 'delay',     type: 'number',                             default: '300',    description: 'Open delay in milliseconds for hover. Keyboard focus shows the tooltip immediately.' },
      { name: 'className', type: 'string',                             default: "''",     description: 'Additional classes on the wrapper span.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Tooltip/Tooltip.tsx'],
  },
  {
    slug: 'popover',
    name: 'Popover',
    category: 'Overlay',
    description: 'A click-triggered, non-modal floating panel anchored to its trigger. Focus moves in on open but is never trapped; Escape and outside clicks close it.',
    usage: `import Popover from '@/src/components/Popover/Popover';

export default function Example() {
  return (
    <Popover trigger="Open popover" label="Share settings" side="bottom" align="center">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-text">Share this page</p>
        <p className="text-xs text-text-muted">Anyone with the link can view.</p>
        <button className="self-start rounded-md bg-brand px-3 py-1.5 text-xs text-brand-fg hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring">
          Copy link
        </button>
      </div>
    </Popover>
  );
}`,
    props: [
      { name: 'trigger',          type: 'ReactNode',                           default: '—',          description: 'Content of the built-in trigger button.' },
      { name: 'children',         type: 'ReactNode',                           default: '—',          description: 'Panel content. May contain interactive elements.' },
      { name: 'side',             type: "'top' | 'right' | 'bottom' | 'left'", default: "'bottom'",   description: 'Which side of the trigger the panel appears on.' },
      { name: 'align',            type: "'start' | 'center' | 'end'",          default: "'center'",   description: 'Alignment along the chosen side.' },
      { name: 'label',            type: 'string',                              default: 'undefined',  description: 'Accessible name for the panel (aria-label).' },
      { name: 'onOpenChange',     type: '(open: boolean) => void',             default: 'undefined',  description: 'Called whenever the popover opens or closes.' },
      { name: 'disabled',         type: 'boolean',                             default: 'false',      description: 'Disables the trigger.' },
      { name: 'className',        type: 'string',                              default: "''",         description: 'Additional classes on the panel.' },
      { name: 'triggerClassName', type: 'string',                              default: "''",         description: 'Additional classes on the trigger button.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Popover/Popover.tsx'],
  },
  {
    slug: 'dropdown-menu',
    name: 'DropdownMenu',
    category: 'Overlay',
    description: 'A trigger button that opens a floating menu of actions with arrow-key navigation, typeahead, separators, and disabled items.',
    usage: `import DropdownMenu from '@/src/components/DropdownMenu/DropdownMenu';

export default function Example() {
  return (
    <DropdownMenu
      trigger="Actions"
      items={[
        { label: 'Edit',      onSelect: () => console.log('edit')      },
        { label: 'Duplicate', onSelect: () => console.log('duplicate') },
        { separator: true },
        { label: 'Archive', disabled: true },
        { label: 'Delete',    onSelect: () => console.log('delete')    },
      ]}
    />
  );
}`,
    props: [
      { name: 'items',            type: 'DropdownMenuEntry[]',                 default: '—',          description: 'Array of items ({ label, onSelect?, disabled? }) and separators ({ separator: true }).' },
      { name: 'trigger',          type: 'ReactNode',                           default: '—',          description: 'Content of the built-in trigger button.' },
      { name: 'side',             type: "'top' | 'right' | 'bottom' | 'left'", default: "'bottom'",   description: 'Which side of the trigger the menu appears on.' },
      { name: 'align',            type: "'start' | 'center' | 'end'",          default: "'start'",    description: 'Alignment along the chosen side.' },
      { name: 'onSelect',         type: '(item: DropdownMenuItem) => void',    default: 'undefined',  description: "Called with the activated item, in addition to the item's own onSelect." },
      { name: 'disabled',         type: 'boolean',                             default: 'false',      description: 'Disables the trigger.' },
      { name: 'className',        type: 'string',                              default: "''",         description: 'Additional classes on the menu list.' },
      { name: 'triggerClassName', type: 'string',                              default: "''",         description: 'Additional classes on the trigger button.' },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['DropdownMenu/DropdownMenu.tsx'],
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
  {
    slug: 'slider',
    name: 'Slider',
    category: 'Inputs',
    description: 'A styled range input for selecting a numeric value within a defined range, with optional label, hint, and current value display.',
    usage: `'use client';

import { useState } from 'react';
import Slider from '@/src/components/Slider/Slider';

export default function Example() {
  const [volume, setVolume] = useState(40);

  return (
    <div className="flex flex-col gap-6 max-w-sm">
      <Slider
        label="Volume"
        showValue
        value={volume}
        onValueChange={setVolume}
        hint="Drag or use arrow keys to adjust."
      />
      <Slider label="Disabled" value={60} onValueChange={() => {}} disabled />
    </div>
  );
}`,
    props: [
      {
        name: 'value',
        type: 'number',
        default: '—',
        description: 'Controlled current value.',
      },
      {
        name: 'onValueChange',
        type: '(value: number) => void',
        default: '—',
        description: 'Called with the new numeric value on change.',
      },
      {
        name: 'min',
        type: 'number',
        default: '0',
        description: 'Minimum value.',
      },
      {
        name: 'max',
        type: 'number',
        default: '100',
        description: 'Maximum value.',
      },
      {
        name: 'step',
        type: 'number',
        default: '1',
        description: 'Increment between selectable values.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disables the slider.',
      },
      {
        name: 'label',
        type: 'string',
        default: '—',
        description: 'Visible label above the track; links to the input via id.',
      },
      {
        name: 'hint',
        type: 'string',
        default: '—',
        description: 'Helper text below the track.',
      },
      {
        name: 'showValue',
        type: 'boolean',
        default: 'false',
        description: 'Shows the current numeric value next to the label.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes merged onto the root wrapper.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Slider/Slider.tsx'],
  },
  {
    slug: 'code-block',
    name: 'CodeBlock',
    category: 'Display',
    description: 'A styled code block with a copy button, and an optional tabbed Preview/Code switcher for live component examples.',
    usage: `'use client';

import { useState } from 'react';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';

const SNIPPET = \`import Button from '@/src/components/Button/Button';

export default function Example() {
  return <Button>Click me</Button>;
}\`;

export default function Example() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Standalone code block */}
      <CodeBlock code={SNIPPET} />

      {/* Live example with Preview / Code tabs */}
      <CodeBlock
        variant="example"
        code={SNIPPET}
        label="button-example"
        minHeight="160px"
      >
        <button className="px-4 py-2 rounded-md bg-brand text-brand-fg text-sm font-medium">
          Click me
        </button>
      </CodeBlock>
    </div>
  );
}`,
    props: [
      {
        name: 'code',
        type: 'string',
        default: '—',
        description: 'Required. The raw source code rendered in the code panel.',
      },
      {
        name: 'variant',
        type: '"code" | "example"',
        default: '"code"',
        description: '"code" renders the block alone. "example" adds a Preview/Code ToggleGroup above the panel.',
      },
      {
        name: 'children',
        type: 'React.ReactNode',
        default: '—',
        description: 'Required when variant="example". Rendered in the Preview tab.',
      },
      {
        name: 'label',
        type: 'string',
        default: '"example"',
        description: 'Accessible label for the ToggleGroup tab strip (example variant only).',
      },
      {
        name: 'minHeight',
        type: 'string',
        default: '"200px"',
        description: 'CSS min-height on the preview pane (example variant only).',
      },
      {
        name: 'align',
        type: '"center" | "start"',
        default: '"center"',
        description: 'Flex alignment of content in the preview pane (example variant only).',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the root wrapper.',
      },
    ],
    dependencies: [],
    registryDependencies: ['toggle-group'],
    files: ['CodeBlock/CodeBlock.tsx'],
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    category: 'Display',
    description: 'User or entity image with graceful fallback to initials, plus an overlapping AvatarGroup with a +N overflow indicator.',
    usage: `import Avatar, { AvatarGroup } from '@/src/components/Avatar/Avatar';

export default function Example() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-end gap-4">
        <Avatar name="Ada Lovelace" size="sm" />
        <Avatar name="Grace Hopper" size="md" />
        <Avatar name="Alan Turing" size="lg" />
        <Avatar name="Katherine Johnson" shape="square" size="lg" />
      </div>
      <AvatarGroup max={3}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" />
        <Avatar name="Margaret Hamilton" />
      </AvatarGroup>
    </div>
  );
}`,
    props: [
      {
        name: 'src',
        type: 'string',
        default: '—',
        description: 'Image URL. When set, alt is required (enforced by the prop types).',
      },
      {
        name: 'alt',
        type: 'string',
        default: '—',
        description: 'Accessible description of the person — required with src, optional otherwise.',
      },
      {
        name: 'name',
        type: 'string',
        default: '—',
        description: 'Full name used to derive fallback initials ("Ada Lovelace" → "AL") and the fallback accessible label.',
      },
      {
        name: 'fallback',
        type: 'string',
        default: '—',
        description: 'Explicit fallback text; overrides initials derived from name.',
      },
      {
        name: 'size',
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        description: 'Avatar dimensions: 28px / 36px / 48px.',
      },
      {
        name: 'shape',
        type: '"circle" | "square"',
        default: '"circle"',
        description: 'circle is rounded-full; square is rounded-md.',
      },
      {
        name: 'max (AvatarGroup)',
        type: 'number',
        default: '—',
        description: 'Maximum avatars shown before collapsing the rest into a "+N" indicator.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the root element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Avatar/Avatar.tsx'],
  },
  {
    slug: 'reveal',
    name: 'Reveal',
    category: 'Effects',
    description: 'Scroll-triggered entrance animation driven by IntersectionObserver, with a RevealGroup for staggered cascades. Content stays visible without JS and under reduced motion.',
    usage: `import Reveal, { RevealGroup } from '@/src/components/Reveal/Reveal';

export default function Example() {
  return (
    <RevealGroup stagger={120} effect="slide-up" className="flex flex-col gap-3 w-full max-w-sm">
      <Reveal>
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">Scroll-triggered entrance</div>
      </Reveal>
      <Reveal>
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">Staggered by 120ms</div>
      </Reveal>
      <Reveal effect="scale">
        <div className="rounded-lg border border-surface-border bg-surface px-4 py-3 text-sm text-text">With its own effect</div>
      </Reveal>
    </RevealGroup>
  );
}`,
    props: [
      {
        name: 'effect',
        type: '"fade" | "slide-up" | "slide-left" | "slide-right" | "scale"',
        default: '"fade"',
        description: 'Entrance effect applied when the element scrolls into view.',
      },
      {
        name: 'delay',
        type: 'number',
        default: '0',
        description: 'Delay in milliseconds before the entrance transition starts.',
      },
      {
        name: 'once',
        type: 'boolean',
        default: 'true',
        description: 'Reveal only on first entry. When false, content re-hides on exit and re-reveals on re-entry.',
      },
      {
        name: 'stagger (RevealGroup)',
        type: 'number',
        default: '100',
        description: 'Milliseconds added to each successive child Reveal’s delay.',
      },
      {
        name: 'delay (RevealGroup)',
        type: 'number',
        default: '0',
        description: 'Base delay applied to the first child of the group.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the wrapper element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Reveal/Reveal.tsx'],
  },
  {
    slug: 'count-up',
    name: 'CountUp',
    category: 'Effects',
    description: 'Animates a number from a start value to its final value when scrolled into view. Screen readers always get the real value; reduced motion renders it immediately.',
    usage: `import CountUp from '@/src/components/CountUp/CountUp';

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <div className="flex flex-col items-center gap-1">
        <CountUp value={12480} separator="," className="text-3xl font-semibold tracking-tight text-text" />
        <span className="text-xs text-text-muted">Daily downloads</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <CountUp value={99.98} decimals={2} suffix="%" className="text-3xl font-semibold tracking-tight text-text" />
        <span className="text-xs text-text-muted">Uptime</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <CountUp value={1200000} prefix="$" separator="," duration={1500} className="text-3xl font-semibold tracking-tight text-text" />
        <span className="text-xs text-text-muted">ARR</span>
      </div>
    </div>
  );
}`,
    props: [
      {
        name: 'value',
        type: 'number',
        default: '—',
        description: 'Required. Final value to count up to.',
      },
      {
        name: 'start',
        type: 'number',
        default: '0',
        description: 'Value the animation starts from.',
      },
      {
        name: 'duration',
        type: 'number',
        default: '1000',
        description: 'Animation duration in milliseconds, eased with the --ease-standard token curve.',
      },
      {
        name: 'decimals',
        type: 'number',
        default: '0',
        description: 'Number of decimal places rendered.',
      },
      {
        name: 'prefix',
        type: 'string',
        default: '""',
        description: 'String prepended to the number (e.g. "$").',
      },
      {
        name: 'suffix',
        type: 'string',
        default: '""',
        description: 'String appended to the number (e.g. "%").',
      },
      {
        name: 'separator',
        type: 'string',
        default: '""',
        description: 'Thousands separator (e.g. ",").',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the root span.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['CountUp/CountUp.tsx'],
  },
  {
    slug: 'text-shimmer',
    name: 'TextShimmer',
    category: 'Effects',
    description: 'Text with a looping gradient shimmer sweeping across it via background-clip: text. Token-driven colors keep AA contrast; reduced motion renders static text.',
    usage: `import TextShimmer from '@/src/components/TextShimmer/TextShimmer';

export default function Example() {
  return (
    <div className="flex flex-col items-center gap-4">
      <TextShimmer className="text-2xl font-semibold tracking-tight">Generating your report…</TextShimmer>
      <TextShimmer duration={1600} className="text-sm font-medium">Thinking…</TextShimmer>
    </div>
  );
}`,
    props: [
      {
        name: 'duration',
        type: 'number',
        default: 'calc(var(--duration-slow) * 8)',
        description: 'Duration of one shimmer sweep in milliseconds. Defaults to a token-derived 2400ms.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '—',
        description: 'Required. The text to shimmer.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional Tailwind classes merged onto the text element.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['TextShimmer/TextShimmer.tsx'],
  },
  {
    slug: 'modal',
    name: 'Modal',
    category: 'Overlay',
    description: 'A blocking overlay dialog with focus trap, scroll lock, Escape-to-close, backdrop dismissal, and focus return — composed from Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, and ModalClose.',
    usage: `'use client';

import { useState } from 'react';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalClose,
} from '@/src/components/Modal/Modal';
import Button from '@/src/components/Button/Button';

export default function Example() {
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
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>Delete</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}`,
    props: [
      {
        name: 'open',
        type: 'boolean',
        default: '—',
        description: 'Controls whether the modal is rendered and visible (controlled).',
      },
      {
        name: 'onOpenChange',
        type: '(open: boolean) => void',
        default: '—',
        description: 'Called with false when the user dismisses via Escape, backdrop click, or ModalClose.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes merged onto the dialog panel element.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '—',
        description: 'Modal subcomponents (ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose) and arbitrary content.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Modal/Modal.tsx'],
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    category: 'Overlay',
    description: 'A blocking side-panel overlay that slides in from an edge of the screen, with the full modal accessibility contract — focus trap, scroll lock, Escape-to-close, backdrop dismissal, and focus return.',
    usage: `'use client';

import { useState } from 'react';
import Drawer, {
  DrawerHeader,
  DrawerTitle,
  DrawerContent,
  DrawerFooter,
  DrawerClose,
  type DrawerSide,
} from '@/src/components/Drawer/Drawer';
import Button from '@/src/components/Button/Button';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<DrawerSide>('right');

  const openFrom = (s: DrawerSide) => {
    setSide(s);
    setOpen(true);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button variant="secondary" onClick={() => openFrom('left')}>Left</Button>
      <Button variant="secondary" onClick={() => openFrom('right')}>Right</Button>
      <Button variant="secondary" onClick={() => openFrom('top')}>Top</Button>
      <Button variant="secondary" onClick={() => openFrom('bottom')}>Bottom</Button>

      <Drawer open={open} onOpenChange={setOpen} side={side}>
        <DrawerClose />
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>
        <DrawerContent>
          You have no unread notifications.
        </DrawerContent>
        <DrawerFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}`,
    props: [
      {
        name: 'open',
        type: 'boolean',
        default: '—',
        description: 'Controls whether the drawer is rendered and visible (controlled).',
      },
      {
        name: 'onOpenChange',
        type: '(open: boolean) => void',
        default: '—',
        description: 'Called with false when the user dismisses via Escape, backdrop click, or DrawerClose.',
      },
      {
        name: 'side',
        type: '"left" | "right" | "top" | "bottom"',
        default: '"right"',
        description: 'Which edge of the screen the drawer slides in from.',
      },
      {
        name: 'className',
        type: 'string',
        default: '""',
        description: 'Additional classes merged onto the drawer panel element.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        default: '—',
        description: 'Drawer subcomponents (DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose) and arbitrary content.',
      },
    ],
    dependencies: [],
    registryDependencies: [],
    files: ['Drawer/Drawer.tsx'],
  },
];

export const getComponent = (slug: string) => {
  return registry.find(c => c.slug === slug);
};
