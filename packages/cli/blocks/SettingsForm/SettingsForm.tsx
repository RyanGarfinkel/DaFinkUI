'use client';

import { FormSection, FormField, FormLabel, FormDescription } from '../../components/Form/Form';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import { Select, type SelectOption } from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import Button from '../../components/Button/Button';
import Switch from '../../components/Switch/Switch';
import Input from '../../components/Input/Input';
import Badge from '../../components/Badge/Badge';
import { useState } from 'react';

const TIMEZONES: SelectOption[] = [
	{ value: 'utc-8', label: 'Pacific Time (UTC-8)'  },
	{ value: 'utc-5', label: 'Eastern Time (UTC-5)'  },
	{ value: 'utc+0', label: 'UTC'                   },
	{ value: 'utc+1', label: 'Central European (UTC+1)' },
];

export const SettingsForm = () => {
	const [name,          setName]          = useState('Jordan Park');
	const [email,         setEmail]         = useState('jordan@example.com');
	const [bio,           setBio]           = useState('Product designer working on the design system team.');
	const [timezone,      setTimezone]      = useState('utc-8');
	const [emailUpdates,  setEmailUpdates]  = useState(true);
	const [productNews,   setProductNews]   = useState(false);
	const [saved,         setSaved]         = useState(false);

	const handleSave = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	return (
		<Card className='w-full max-w-lg'>
			<CardHeader>
				<h3 className='text-xl font-semibold text-text'>Account settings</h3>
				<p className='text-sm text-text-muted'>Update your profile and notification preferences.</p>
			</CardHeader>
			<CardContent className='flex flex-col gap-6'>
				<FormSection title='Profile'>
					<FormField>
						<FormLabel required>Name</FormLabel>
						<Input value={name} onChange={(e) => setName(e.target.value)} />
					</FormField>
					<FormField>
						<FormLabel required>Email</FormLabel>
						<Input type='email' autoComplete='email' value={email} onChange={(e) => setEmail(e.target.value)} />
					</FormField>
					<FormField>
						<FormLabel>Bio</FormLabel>
						<Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
						<FormDescription>Shown on your public profile.</FormDescription>
					</FormField>
					<FormField>
						<FormLabel>Timezone</FormLabel>
						<Select options={TIMEZONES} value={timezone} onChange={setTimezone} />
					</FormField>
				</FormSection>

				<FormSection title='Notifications'>
					<div className='flex items-center justify-between'>
						<div className='flex flex-col'>
							<span className='text-sm text-text'>Email updates</span>
							<span className='text-xs text-text-muted'>Get notified about activity on your account.</span>
						</div>
						<Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} label='Email updates' />
					</div>
					<div className='flex items-center justify-between'>
						<div className='flex flex-col'>
							<span className='text-sm text-text'>Product news</span>
							<span className='text-xs text-text-muted'>Occasional updates about new features.</span>
						</div>
						<Switch checked={productNews} onCheckedChange={setProductNews} label='Product news' />
					</div>
				</FormSection>
			</CardContent>
			<CardFooter className='flex items-center justify-between'>
				{saved ? <Badge variant='success'>Saved</Badge> : <span />}
				<Button onClick={handleSave}>Save changes</Button>
			</CardFooter>
		</Card>
	);
};

export default SettingsForm;
