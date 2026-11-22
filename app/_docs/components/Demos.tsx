'use client';

import SidePanel, { SidePanelHeader, SidePanelTitle, SidePanelContent, SidePanelFooter, SidePanelClose, type SidePanelSide } from '@/src/components/SidePanel/SidePanel';
import Drawer, { DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter, DrawerClose, DrawerHandle, type DrawerSide } from '@/src/components/Drawer/Drawer';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose, type ModalSize } from '@/src/components/Modal/Modal';
import Form, { FormControl, FormDescription, FormField, FormLabel, FormMessage, useZodForm } from '@/src/components/Form/Form';
import DataTable, { type ColumnDef, type PaginatorVariant } from '@/src/components/DataTable/DataTable';
import { CommandInput, type CommandOption } from '@/src/components/CommandInput/CommandInput';
import { ToastProvider, useToast, type ToastPosition } from '@/src/components/Toast/Toast';
import { Combobox } from '@/src/components/Combobox/Combobox';
import OTPInput from '@/src/components/OTPInput/OTPInput';
import { Select } from '@/src/components/Select/Select';
import Switch from '@/src/components/Switch/Switch';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import { useState } from 'react';
import { z } from 'zod';

export const OTPInputPreview = () => {
	const [code, setCode] = useState('');
	return (
		<div className='flex flex-col gap-6'>
			<OTPInput label='Verification code' length={6} value={code} onChange={setCode} hint='Enter the 6-digit code from your email.' />
			<OTPInput label='Expired code' length={6} value='123' onChange={() => {}} error='This code has expired.' />
		</div>
	);
};

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

export const ComboboxPreview = () => {
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
};

const COMMANDS: CommandOption[] = [
	{ name: 'compact', description: 'Summarize the conversation to save space' },
	{ name: 'clear',   description: 'Clear all messages' },
	{ name: 'rename',  description: 'Rename this chat' },
];

export const CommandInputPreview = () => {
	const [value, setValue] = useState('');
	const [lastCommand, setLastCommand] = useState<string | null>(null);

	return (
		<div className='flex flex-col gap-3 w-full max-w-sm'>
			<CommandInput
				value={value}
				onChange={setValue}
				commands={COMMANDS}
				onCommand={(command) => setLastCommand(command.name)}
				placeholder='Type a message, or / for commands…'
				menuSide='bottom'
			/>
			{lastCommand && (
				<p className='text-sm text-text-muted'>Ran /{lastCommand}</p>
			)}
		</div>
	);
};

interface DemoEmployee {
	id:         number;
	name:       string;
	role:       string;
	department: string;
	status:     string;
	salary:     number;
}

const EMPLOYEES: DemoEmployee[] = [
	{ id: 1,  name: 'Alice Chen',     role: 'Engineer',        department: 'Platform',   status: 'Active',   salary: 145000 },
	{ id: 2,  name: 'Bob Ruiz',       role: 'Designer',        department: 'Product',    status: 'Away',     salary: 130000 },
	{ id: 3,  name: 'Carol Smith',    role: 'Engineering Mgr', department: 'Platform',   status: 'Active',   salary: 165000 },
	{ id: 4,  name: 'Dave Park',      role: 'Data Analyst',    department: 'Analytics',  status: 'Active',   salary: 120000 },
	{ id: 5,  name: 'Eve Torres',     role: 'Designer',        department: 'Product',    status: 'Active',   salary: 128000 },
	{ id: 6,  name: 'Frank Lee',      role: 'Engineer',        department: 'Growth',     status: 'Away',     salary: 140000 },
	{ id: 7,  name: 'Grace Yoon',     role: 'Product Manager', department: 'Product',    status: 'Active',   salary: 155000 },
	{ id: 8,  name: 'Hugo Martins',   role: 'Engineer',        department: 'Growth',     status: 'Active',   salary: 138000 },
	{ id: 9,  name: 'Iris Nakamura',  role: 'Recruiter',       department: 'People',     status: 'Active',   salary: 115000 },
	{ id: 10, name: 'James Okafor',   role: 'Engineer',        department: 'Platform',   status: 'Inactive', salary: 148000 },
	{ id: 11, name: 'Kira Walsh',     role: 'Marketing Lead',  department: 'Growth',     status: 'Active',   salary: 125000 },
	{ id: 12, name: 'Leo Fernandez',  role: 'Data Scientist',  department: 'Analytics',  status: 'Active',   salary: 155000 },
];

const STATUS_COLORS: Record<string, string> = {
	Active:   'bg-success-bg text-success border border-success-border',
	Away:     'bg-warning-bg text-warning border border-warning-border',
	Inactive: 'bg-surface-active text-text-muted border border-surface-border',
};

const VARIANTS: { value: PaginatorVariant; label: string }[] = [
	{ value: 'default',  label: 'Default'  },
	{ value: 'numbered', label: 'Numbered' },
	{ value: 'compact',  label: 'Compact'  },
	{ value: 'minimal',  label: 'Minimal'  },
];

export const DataTablePreview = () => {
	const [selected, setSelected] = useState<DemoEmployee[]>([]);
	const [variant,  setVariant]  = useState<PaginatorVariant>('default');
	const [remote, setRemote] = useState<Record<number, boolean>>({});

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
		{
			key: 'salary',
			header: 'Salary',
			sortable: true,
			render: (val) => `$${Number(val).toLocaleString()}`,
		},
		{
			key: 'id',
			header: 'Work type',
			sortable: false,
			render: (_val, row) => (
				<Switch
					id={`remote-${row.id}`}
					checked={remote[row.id] ?? true}
					onCheckedChange={(v) => setRemote(prev => ({ ...prev, [row.id]: v }))}
					label={(remote[row.id] ?? true) ? 'Remote' : 'Office'}
				/>
			),
		},
	];

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
};

export const ModalPreview = () => {
	const [open, setOpen] = useState(false);
	const [size, setSize] = useState<ModalSize>('md');

	const openWith = (s: ModalSize) => {
		setSize(s);
		setOpen(true);
	};

	return (
		<div className='flex flex-wrap gap-2 justify-center'>
			<Button variant='secondary' onClick={() => openWith('sm')}>Small</Button>
			<Button variant='secondary' onClick={() => openWith('md')}>Medium</Button>
			<Button variant='secondary' onClick={() => openWith('lg')}>Large</Button>

			<Modal open={open} onOpenChange={setOpen} size={size}>
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
		</div>
	);
};

export const DrawerPreview = () => {
	const [open, setOpen] = useState(false);
	const [side, setSide] = useState<DrawerSide>('right');

	const openFrom = (s: DrawerSide) => {
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
				{side === 'bottom' && <DrawerHandle />}
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

export const SidePanelPreview = () => {
	const [open, setOpen] = useState(false);
	const [side, setSide] = useState<SidePanelSide>('right');

	const openFrom = (s: SidePanelSide) => {
		setSide(s);
		setOpen(true);
	};

	return (
		<div className='flex flex-wrap gap-2 justify-center'>
			<Button variant='secondary' onClick={() => openFrom('left')}>Left</Button>
			<Button variant='secondary' onClick={() => openFrom('right')}>Right</Button>
			<Button variant='secondary' onClick={() => openFrom('top')}>Top</Button>
			<Button variant='secondary' onClick={() => openFrom('bottom')}>Bottom</Button>

			<SidePanel open={open} onOpenChange={setOpen} side={side}>
				<SidePanelClose />
				<SidePanelHeader>
					<SidePanelTitle>Quick preview</SidePanelTitle>
				</SidePanelHeader>
				<SidePanelContent>
					A floating panel, inset from every edge it does not anchor to.
				</SidePanelContent>
				<SidePanelFooter>
					<Button variant='secondary' onClick={() => setOpen(false)}>Close</Button>
				</SidePanelFooter>
			</SidePanel>
		</div>
	);
};

const FRAMEWORK_OPTIONS = [
	{ value: 'next',      label: 'Next.js'   },
	{ value: 'remix',     label: 'Remix'     },
	{ value: 'astro',     label: 'Astro'     },
	{ value: 'sveltekit', label: 'SvelteKit' },
	{ value: 'nuxt',      label: 'Nuxt'      },
];

export const SelectDemo = () => {
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

const zodFormSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters.'),
	email: z.email('Enter a valid email address.'),
});

type ZodFormValues = z.infer<typeof zodFormSchema>;

export const FormDemo = () => {
	const form = useZodForm(zodFormSchema, { mode: 'onTouched' });

	const onSubmit = (values: ZodFormValues) => {
		console.log(values);
	};

	return (
		<Form className='w-full max-w-sm' onSubmit={form.handleSubmit(onSubmit)}>
			<FormField>
				<FormLabel htmlFor='name' required>Name</FormLabel>
				<FormControl>
					<Input id='name' placeholder='Jane Smith' aria-required='true' aria-invalid={!!form.formState.errors.name} aria-describedby={form.formState.errors.name ? 'name-error' : undefined} {...form.register('name')} />
				</FormControl>
				<FormMessage id='name-error'>{form.formState.errors.name?.message}</FormMessage>
			</FormField>
			<FormField>
				<FormLabel htmlFor='email' required>Email</FormLabel>
				<FormControl>
					<Input id='email' type='email' placeholder='you@example.com' aria-required='true' aria-invalid={!!form.formState.errors.email} aria-describedby={form.formState.errors.email ? 'email-error' : undefined} {...form.register('email')} />
				</FormControl>
				<FormDescription>We will never share your email.</FormDescription>
				<FormMessage id='email-error'>{form.formState.errors.email?.message}</FormMessage>
			</FormField>
			<Button type='submit'>Save changes</Button>
		</Form>
	);
};

const PILL = 'px-2.5 py-1 rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';
const PILL_ACTIVE = `${PILL} bg-surface-active text-text`;
const PILL_INACTIVE = `${PILL} text-text-muted hover:bg-surface-hover hover:text-text`;
const TOAST_BUTTON = 'rounded-md border border-surface-border bg-surface px-3 py-1.5 text-sm text-text hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring';

const ToastButtons = () => {
	const { toast } = useToast();

	return (
		<div className='flex flex-wrap gap-2 justify-center'>
			<button type='button' className={TOAST_BUTTON} onClick={() => toast({ title: 'Heads up', description: 'This is a default notification.' })}>Default</button>
			<button type='button' className={TOAST_BUTTON} onClick={() => toast({ title: 'Saved', description: 'Your changes were saved.', variant: 'success' })}>Success</button>
			<button type='button' className={TOAST_BUTTON} onClick={() => toast({ title: 'Warning', description: 'Please review before continuing.', variant: 'warning' })}>Warning</button>
			<button type='button' className={TOAST_BUTTON} onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'danger' })}>Danger</button>
			<button type='button' className={TOAST_BUTTON} onClick={() => toast({ title: 'Deleted', description: 'Item was removed.', variant: 'danger', action: { label: 'Undo', onClick: () => {} } })}>With action</button>
		</div>
	);
};

export const ToastDemo = () => {
	const [position, setPosition] = useState<ToastPosition>('bottom-right');

	const isTop    = position.startsWith('top');
	const isLeft   = position.endsWith('left');
	const isCenter = position.endsWith('center');
	const isRight  = position.endsWith('right');

	const setVertical = (vertical: 'top' | 'bottom') => {
		const horizontal = isLeft ? 'left' : isCenter ? 'center' : 'right';
		setPosition(`${vertical}-${horizontal}` as ToastPosition);
	};

	const setHorizontal = (horizontal: 'left' | 'center' | 'right') => {
		const vertical = isTop ? 'top' : 'bottom';
		setPosition(`${vertical}-${horizontal}` as ToastPosition);
	};

	const indicatorStyle: React.CSSProperties = {
		position:  'absolute',
		top:       isTop    ? 28    : undefined,
		bottom:    isTop    ? undefined : 6,
		left:      isLeft   ? 6     : isCenter ? '50%' : undefined,
		right:     isRight  ? 6     : undefined,
		transform: isCenter ? 'translateX(-50%)' : undefined,
	};

	return (
		<ToastProvider position={position}>
			<div className='flex flex-col items-center gap-6 w-full'>
				<div className='flex flex-col items-center gap-2'>
					<div
						className='relative rounded-lg border-2 border-surface-border bg-surface-hover/40'
						style={{ width: 180, height: 112 }}
						role='img'
						aria-label={`Toast position: ${position}`}
					>
						<div className='absolute top-0 left-0 right-0 h-5 rounded-t-md border-b border-surface-border bg-surface flex items-center px-2 gap-1'>
							<span className='w-1.5 h-1.5 rounded-full bg-surface-border' aria-hidden='true' />
							<span className='w-1.5 h-1.5 rounded-full bg-surface-border' aria-hidden='true' />
							<span className='w-1.5 h-1.5 rounded-full bg-surface-border' aria-hidden='true' />
						</div>
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

				<div className='flex flex-col items-center gap-2'>
					<div className='flex items-center gap-1 rounded-lg border border-surface-border bg-surface p-1' role='group' aria-label='Vertical position'>
						<button type='button' className={isTop  ? PILL_ACTIVE : PILL_INACTIVE} onClick={() => setVertical('top')}>Top</button>
						<button type='button' className={!isTop ? PILL_ACTIVE : PILL_INACTIVE} onClick={() => setVertical('bottom')}>Bottom</button>
					</div>
					<div className='flex items-center gap-1 rounded-lg border border-surface-border bg-surface p-1' role='group' aria-label='Horizontal position'>
						<button type='button' className={isLeft   ? PILL_ACTIVE : PILL_INACTIVE} onClick={() => setHorizontal('left')}>Left</button>
						<button type='button' className={isCenter ? PILL_ACTIVE : PILL_INACTIVE} onClick={() => setHorizontal('center')}>Center</button>
						<button type='button' className={isRight  ? PILL_ACTIVE : PILL_INACTIVE} onClick={() => setHorizontal('right')}>Right</button>
					</div>
				</div>

				<ToastButtons />
			</div>
		</ToastProvider>
	);
};
