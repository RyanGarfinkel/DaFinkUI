'use client';

import ToggleGroup, { ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';
import { ColorPicker } from '@/src/components/ColorPicker/ColorPicker';
import { RadioGroup, RadioItem } from '@/src/components/Radio/Radio';
import { DatePicker } from '@/src/components/DatePicker/DatePicker';
import { Checkbox } from '@/src/components/Checkbox/Checkbox';
import Switch from '@/src/components/Switch/Switch';
import Slider from '@/src/components/Slider/Slider';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import { useState } from 'react';

const SvgIcon = ({ children }: { children: React.ReactNode }) => (
	<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>{children}</svg>
);

export const ButtonPreview = () => (
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
				<SvgIcon><circle cx='11' cy='11' r='8' /><path d='m21 21-4.3-4.3' /></SvgIcon>
			</Button>
			<Button size='icon' variant='secondary' aria-label='Add'>
				<SvgIcon><path d='M5 12h14M12 5v14' /></SvgIcon>
			</Button>
			<Button size='icon' variant='destructive' aria-label='Delete'>
				<SvgIcon><path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' /></SvgIcon>
			</Button>
		</div>
	</div>
);

export const InputPreview = () => (
	<div className='w-full max-w-sm flex flex-col gap-4'>
		<Input label='Email' placeholder='you@example.com' hint='We will never share your email.' />
		<Input label='Password' type='password' placeholder='••••••••' hint='At least 8 characters.' />
		<Input label='Floating label' variant='floating' />
		<Input label='Disabled' placeholder='Cannot edit' disabled />
	</div>
);

export const RadioPreview = () => {
	const [value, setValue] = useState('option-1');

	return (
		<RadioGroup value={value} onValueChange={setValue} name='plan'>
			<RadioItem value='option-1' label='Starter' hint='Up to 5 users' />
			<RadioItem value='option-2' label='Pro' hint='Up to 50 users' />
			<RadioItem value='option-3' label='Enterprise' hint='Unlimited users' />
		</RadioGroup>
	);
};

export const SwitchPreview = () => {
	const [checked, setChecked] = useState(false);

	return (
		<div className='flex flex-col gap-4'>
			<Switch
				checked={checked}
				onCheckedChange={setChecked}
				label='Email notifications'
				hint='Receive updates about your account.'
			/>
			<Switch checked={true} onCheckedChange={() => {}} label='Dark mode' />
			<Switch checked={false} onCheckedChange={() => {}} label='Analytics' disabled />
		</div>
	);
};

export const SliderPreview = () => {
	const [value, setValue] = useState(40);

	return (
		<div className='w-full max-w-sm flex flex-col gap-6'>
			<Slider
				label='Volume'
				showValue
				value={value}
				onValueChange={setValue}
				hint='Drag or use arrow keys to adjust.'
			/>
			<Slider label='Disabled' value={60} onValueChange={() => {}} disabled />
		</div>
	);
};

export const ToggleGroupPreview = () => {
	const [value, setValue] = useState<string | string[]>('left');

	return (
		<div className='flex flex-col gap-4 items-center'>
			<ToggleGroup type='single' value={value as string} onValueChange={setValue}>
				<ToggleGroupItem value='left'>Left</ToggleGroupItem>
				<ToggleGroupItem value='center'>Center</ToggleGroupItem>
				<ToggleGroupItem value='right'>Right</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
};

export const CheckboxPreview = () => (
	<div className='flex flex-col gap-3'>
		<Checkbox id='cb1' label='Accept terms' />
		<Checkbox id='cb2' label='Checked' defaultChecked />
		<Checkbox id='cb3' label='Disabled' disabled />
	</div>
);

export const ColorPickerPreview = () => {
	const [value, setValue] = useState('#3b82f6');

	return (
		<ColorPicker
			label='Accent color'
			value={value}
			onValueChange={setValue}
			swatches={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']}
		/>
	);
};

const SelectedDate = ({ children }: { children: string }) => (
	<p className='text-sm text-text-muted'>
		Selected:{' '}
		<span className='font-medium text-text'>{children}</span>
	</p>
);

export const DatePickerPreview = () => {
	const [date, setDate] = useState<Date | null>(null);
	const [time, setTime] = useState<Date | null>(null);
	const [dateTime, setDateTime] = useState<Date | null>(null);

	return (
		<div className='w-full max-w-xs flex flex-col gap-3'>
			<DatePicker
				label='Appointment date'
				placeholder='Pick a date'
				value={date}
				onChange={setDate}
				hint='Arrow keys navigate the calendar grid.'
			/>
			{date && <SelectedDate>{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</SelectedDate>}
			<DatePicker
				label='Appointment date & time'
				granularity='datetime'
				value={dateTime}
				onChange={setDateTime}
				hint='Type digits or use arrow keys on the time segments.'
			/>
			{dateTime && <SelectedDate>{dateTime.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' })}</SelectedDate>}
			<DatePicker
				label='Reminder time'
				granularity='time'
				value={time}
				onChange={setTime}
				hint='Time-only picker, no calendar grid.'
			/>
			{time && <SelectedDate>{time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</SelectedDate>}
			<DatePicker
				label='Disabled'
				value={null}
				onChange={() => {}}
				disabled
			/>
		</div>
	);
};
