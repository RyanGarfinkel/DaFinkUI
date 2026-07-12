'use client';

import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import { FormField, FormLabel } from '../../components/Form/Form';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useEffect, useState } from 'react';

const RESEND_COOLDOWN = 30;

const MailIcon = () => (
	<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-brand' aria-hidden='true'>
		<rect x='2' y='4' width='20' height='16' rx='2' />
		<path d='m22 6-10 7L2 6' />
	</svg>
);

export const AuthFormMagicLink = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown === 0) return;
		const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

	const handleSend = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setSent(true);
			setCooldown(RESEND_COOLDOWN);
		}, 800);
	};

	const handleResend = () => {
		setCooldown(RESEND_COOLDOWN);
	};

	const reset = () => {
		setSent(false);
		setEmail('');
		setCooldown(0);
	};

	return (
		<Card className='w-full max-w-sm'>
			<CardHeader className='flex flex-col gap-1'>
				<h3 className='text-xl font-semibold text-text'>{sent ? 'Check your inbox' : 'Sign in'}</h3>
				<p className='text-sm text-text-muted'>
					{sent ? 'We sent a magic link to your email.' : "Enter your email and we'll send you a link to sign in, no password needed."}
				</p>
			</CardHeader>
			<CardContent>
				{sent ? (
					<div className='flex flex-col items-center gap-4 py-2 text-center'>
						<div className='w-14 h-14 rounded-full bg-brand/15 flex items-center justify-center'>
							<MailIcon />
						</div>
						<p className='text-sm text-text'>
							Sent to <strong>{email}</strong>
						</p>
						<p className='text-xs text-text-muted'>
							Click the link in the email to finish signing in. It may take a minute to arrive.
						</p>
						<Button variant='ghost' size='sm' disabled={cooldown > 0} onClick={handleResend}>
							{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
						</Button>
					</div>
				) : (
					<div className='flex flex-col gap-4'>
						<FormField>
							<FormLabel required>Email</FormLabel>
							<Input type='email' autoComplete='email' placeholder='you@example.com' value={email} onChange={(e) => setEmail(e.target.value)} />
						</FormField>
						<Button className='w-full' loading={loading} disabled={!email} onClick={handleSend}>
							Send magic link
						</Button>
					</div>
				)}
			</CardContent>
			<CardFooter className='flex items-center justify-center gap-1.5'>
				{sent ? (
					<Button variant='link' size='sm' onClick={reset}>Use a different email</Button>
				) : (
					<span className='text-sm text-text-muted'>We&apos;ll never ask for a password.</span>
				)}
			</CardFooter>
		</Card>
	);
};

export default AuthFormMagicLink;
