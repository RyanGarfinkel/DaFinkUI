'use client';

import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import { FormField, FormLabel } from '../../components/Form/Form';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import Input from '../../components/Input/Input';
import { useState } from 'react';

type Provider = 'google' | 'github';

const GoogleIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M20 12a8 8 0 1 1-2.34-5.66' />
		<path d='M20 12h-7' />
	</svg>
);

const GithubIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
		<path d='M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.94.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z' />
	</svg>
);

const CheckIcon = () => (
	<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className='text-success' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

export const AuthFormSocial = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [socialLoading, setSocialLoading] = useState<Provider | null>(null);

	const busy = loading || socialLoading !== null;

	const handleSocial = (provider: Provider) => {
		setSocialLoading(provider);
		setTimeout(() => {
			setSocialLoading(null);
			setSuccess(true);
		}, 900);
	};

	const handleSubmit = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setSuccess(true);
		}, 800);
	};

	const reset = () => {
		setSuccess(false);
		setEmail('');
		setPassword('');
	};

	return (
		<Card className='w-full max-w-sm'>
			<CardHeader className='flex flex-col gap-1'>
				{success ? (
					<div className='flex items-center gap-2'>
						<h3 className='text-xl font-semibold text-text'>You&apos;re in</h3>
						<Badge variant='success'>Verified</Badge>
					</div>
				) : (
					<>
						<h3 className='text-xl font-semibold text-text'>Sign in</h3>
						<p className='text-sm text-text-muted'>Choose a provider or use your email.</p>
					</>
				)}
			</CardHeader>
			<CardContent>
				{success ? (
					<div className='flex flex-col items-center gap-4 py-2'>
						<div className='w-14 h-14 rounded-full bg-success/15 flex items-center justify-center'>
							<CheckIcon />
						</div>
						<p className='text-sm text-text-muted text-center'>Welcome back, {email || 'friend'}.</p>
						<Button variant='outlined' size='sm' onClick={reset}>Start over</Button>
					</div>
				) : (
					<div className='flex flex-col gap-4'>
						<div className='flex flex-col gap-2'>
							<Button variant='secondary' className='w-full' loading={socialLoading === 'google'} disabled={busy} onClick={() => handleSocial('google')}>
								<GoogleIcon />
								Continue with Google
							</Button>
							<Button variant='secondary' className='w-full' loading={socialLoading === 'github'} disabled={busy} onClick={() => handleSocial('github')}>
								<GithubIcon />
								Continue with GitHub
							</Button>
						</div>

						<div className='flex items-center gap-3'>
							<span className='flex-1 border-t border-surface-border' aria-hidden='true' />
							<span className='text-xs text-text-muted'>or continue with email</span>
							<span className='flex-1 border-t border-surface-border' aria-hidden='true' />
						</div>

						<FormField>
							<FormLabel required>Email</FormLabel>
							<Input type='email' autoComplete='email' placeholder='you@example.com' value={email} disabled={busy} onChange={(e) => setEmail(e.target.value)} />
						</FormField>
						<FormField>
							<FormLabel required>Password</FormLabel>
							<Input type='password' autoComplete='current-password' placeholder='••••••••' value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} />
						</FormField>
						<Button className='w-full' loading={loading} disabled={busy || !email || !password} onClick={handleSubmit}>
							Sign in
						</Button>
					</div>
				)}
			</CardContent>
			<CardFooter className='flex items-center justify-center gap-1.5'>
				<span className='text-sm text-text-muted'>Don&apos;t have an account?</span>
				<Button variant='link' size='sm'>Sign up</Button>
			</CardFooter>
		</Card>
	);
};

export default AuthFormSocial;
