'use client';

import Form, {
	FormSection,
	FormField,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
} from '@/src/components/Form/Form';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import Textarea from '@/src/components/Textarea/Textarea';
import { Select } from '@/src/components/Select/Select';
import Switch from '@/src/components/Switch/Switch';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';

export const ManualFormDemo = () => {
	const [team, setTeam] = useState('');
	const [submitted, setSubmitted] = useState(false);

	const error = submitted && team.trim() === '' ? 'Team name is required.' : undefined;

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
	};

	return (
		<Form className='w-full max-w-sm' onSubmit={handleSubmit}>
			<FormField>
				<FormLabel htmlFor='team' required>Team name</FormLabel>
				<FormControl>
					<Input
						id='team'
						value={team}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setTeam(e.target.value)}
						aria-required='true'
						aria-invalid={Boolean(error)}
					/>
				</FormControl>
				<FormMessage>{error}</FormMessage>
			</FormField>
			<Button type='submit'>Create team</Button>
		</Form>
	);
};

const FREQUENCY_OPTIONS = [
	{ value: 'realtime', label: 'Real-time' },
	{ value: 'daily',    label: 'Daily digest' },
	{ value: 'weekly',   label: 'Weekly digest' },
];

export const FieldTypesFormDemo = () => {
	const [notifyByEmail, setNotifyByEmail] = useState(true);
	const [frequency, setFrequency] = useState('daily');
	const [notes, setNotes] = useState('');

	return (
		<Form className='w-full max-w-sm' onSubmit={(e: FormEvent) => e.preventDefault()}>
			<FormSection
				title='Notification preferences'
				description='Controls how often we email you about account activity.'
			>
				<FormField>
					<Switch
						checked={notifyByEmail}
						onCheckedChange={setNotifyByEmail}
						label='Email notifications'
					/>
				</FormField>
				<FormField>
					<Select
						label='Frequency'
						options={FREQUENCY_OPTIONS}
						value={frequency}
						onChange={setFrequency}
						disabled={!notifyByEmail}
					/>
				</FormField>
				<FormField>
					<FormLabel htmlFor='notes'>
						Additional notes <span className='font-normal text-text-subtle'>(optional)</span>
					</FormLabel>
					<FormControl>
						<Textarea
							id='notes'
							value={notes}
							onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
						/>
					</FormControl>
				</FormField>
			</FormSection>
			<Button type='submit'>Save preferences</Button>
		</Form>
	);
};

export const ReadOnlyFormDemo = () => {
	return (
		<Form className='w-full max-w-sm'>
			<FormSection title='Account'>
				<FormField>
					<FormLabel htmlFor='plan'>Plan</FormLabel>
					<FormControl>
						<Input id='plan' value='Team — 12 seats' disabled />
					</FormControl>
					<FormDescription>Contact sales to change your plan.</FormDescription>
				</FormField>
				<FormField>
					<FormLabel htmlFor='billing-email'>Billing email</FormLabel>
					<FormControl>
						<Input id='billing-email' value='billing@acme.co' disabled />
					</FormControl>
				</FormField>
			</FormSection>
		</Form>
	);
};
