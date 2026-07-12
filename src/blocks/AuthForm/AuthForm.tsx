'use client';

import { ToggleGroup, ToggleGroupItem } from '../../components/ToggleGroup/ToggleGroup';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/Card/Card';
import { FormField, FormLabel, FormMessage } from '../../components/Form/Form';
import Checkbox from '../../components/Checkbox/Checkbox';
import OTPInput from '../../components/OTPInput/OTPInput';
import Progress from '../../components/Progress/Progress';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import Input from '../../components/Input/Input';
import { useState } from 'react';

type Mode = 'signin' | 'signup';

const CheckIcon = () => (
	<svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className='text-success' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

export const AuthForm = () => {
	const [mode, setMode] = useState<Mode>('signin');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	// sign-in state
	const [step, setStep] = useState(0);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [otp, setOtp] = useState('');

	// sign-up state
	const [name, setName] = useState('');
	const [signupEmail, setSignupEmail] = useState('');
	const [signupPassword, setSignupPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [agreed, setAgreed] = useState(false);

	const switchMode = (next: Mode | '') => {
		if (!next || next === mode) return;
		setMode(next);
		setStep(0);
		setLoading(false);
		setSuccess(false);
	};

	const passwordsMismatch = confirmPassword !== '' && confirmPassword !== signupPassword;
	const canSignup = !!name && !!signupEmail && !!signupPassword && !!confirmPassword && !passwordsMismatch && agreed;

	const handleSignup = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setSuccess(true);
		}, 800);
	};

	const resetSignin = () => {
		setStep(0);
		setEmail('');
		setPassword('');
		setOtp('');
	};

	return (
		<Card className='w-full max-w-sm'>
			<CardHeader className='flex flex-col gap-4'>
				<ToggleGroup type='single' value={mode} onValueChange={(v) => switchMode(v as Mode | '')} size='sm' aria-label='Auth mode'>
					<ToggleGroupItem value='signin'>Sign in</ToggleGroupItem>
					<ToggleGroupItem value='signup'>Create account</ToggleGroupItem>
				</ToggleGroup>

				{mode === 'signin' ? (
					<>
						<Progress value={[33, 66, 100][step]} />
						{step === 0 && (
							<>
								<h3 className='text-xl font-semibold text-text'>Sign in</h3>
								<p className='text-sm text-text-muted'>Enter your credentials to continue.</p>
							</>
						)}
						{step === 1 && (
							<div className='flex flex-col gap-1'>
								<div className='flex items-center gap-2'>
									<h3 className='text-xl font-semibold text-text'>Verify identity</h3>
									<Badge variant='warning'>2FA</Badge>
								</div>
								<p className='text-sm text-text-muted'>
									We sent a 6-digit code to <strong>{email || 'your email'}</strong>.
								</p>
							</div>
						)}
						{step === 2 && (
							<>
								<div className='flex items-center gap-2'>
									<h3 className='text-xl font-semibold text-text'>You&apos;re in</h3>
									<Badge variant='success'>Verified</Badge>
								</div>
								<p className='text-sm text-text-muted'>Welcome back, {email || 'user'}.</p>
							</>
						)}
					</>
				) : (
					<>
						<Progress value={success ? 100 : canSignup ? 66 : 33} />
						{success ? (
							<div className='flex items-center gap-2'>
								<h3 className='text-xl font-semibold text-text'>You&apos;re all set</h3>
								<Badge variant='success'>Verified</Badge>
							</div>
						) : (
							<>
								<h3 className='text-xl font-semibold text-text'>Create account</h3>
								<p className='text-sm text-text-muted'>Sign up to get started in seconds.</p>
							</>
						)}
					</>
				)}
			</CardHeader>
			<CardContent>
				{mode === 'signin' ? (
					<>
						{step === 0 && (
							<div className='flex flex-col gap-4'>
								<FormField>
									<FormLabel required>Email</FormLabel>
									<Input type='email' autoComplete='email' placeholder='you@example.com' value={email} onChange={(e) => setEmail(e.target.value)} />
								</FormField>
								<FormField>
									<FormLabel required>Password</FormLabel>
									<Input type='password' autoComplete='current-password' placeholder='••••••••' value={password} onChange={(e) => setPassword(e.target.value)} />
								</FormField>
								<Button className='w-full' onClick={() => setStep(1)} disabled={!email || !password}>
									Continue
								</Button>
							</div>
						)}
						{step === 1 && (
							<div className='flex flex-col gap-5'>
								<OTPInput length={6} value={otp} onChange={setOtp} />
								<div className='flex gap-2'>
									<Button variant='ghost' size='sm' onClick={() => { setStep(0); setOtp(''); }}>
										Back
									</Button>
									<Button className='flex-1' onClick={() => setStep(2)} disabled={otp.length < 6}>
										Verify
									</Button>
								</div>
							</div>
						)}
						{step === 2 && (
							<div className='flex flex-col items-center gap-4 py-2'>
								<div className='w-14 h-14 rounded-full bg-success/15 flex items-center justify-center'>
									<CheckIcon />
								</div>
								<p className='text-sm text-text-muted text-center'>Authentication complete. Redirecting…</p>
								<Button variant='outlined' size='sm' onClick={resetSignin}>Start over</Button>
							</div>
						)}
					</>
				) : success ? (
					<div className='flex flex-col items-center gap-4 py-2'>
						<div className='w-14 h-14 rounded-full bg-success/15 flex items-center justify-center'>
							<CheckIcon />
						</div>
						<p className='text-sm text-text-muted text-center'>Account created. Check your email to verify.</p>
					</div>
				) : (
					<div className='flex flex-col gap-4'>
						<FormField>
							<FormLabel required>Full name</FormLabel>
							<Input autoComplete='name' placeholder='Jordan Park' value={name} onChange={(e) => setName(e.target.value)} />
						</FormField>
						<FormField>
							<FormLabel required>Email</FormLabel>
							<Input type='email' autoComplete='email' placeholder='you@example.com' value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
						</FormField>
						<FormField>
							<FormLabel required>Password</FormLabel>
							<Input type='password' autoComplete='new-password' placeholder='••••••••' value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
						</FormField>
						<FormField>
							<FormLabel required>Confirm password</FormLabel>
							<Input
								type='password'
								autoComplete='new-password'
								placeholder='••••••••'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								error={passwordsMismatch ? 'Passwords do not match' : undefined}
							/>
							<FormMessage>{passwordsMismatch ? 'Passwords do not match' : ''}</FormMessage>
						</FormField>
						<Checkbox
							label='I agree to the Terms of Service and Privacy Policy'
							checked={agreed}
							onChange={(e) => setAgreed(e.target.checked)}
						/>
						<Button className='w-full' loading={loading} disabled={!canSignup} onClick={handleSignup}>
							Create account
						</Button>
					</div>
				)}
			</CardContent>
			<CardFooter className='flex items-center justify-center gap-1.5'>
				{mode === 'signin' ? (
					<>
						<span className='text-sm text-text-muted'>Don&apos;t have an account?</span>
						<Button variant='link' size='sm' onClick={() => switchMode('signup')}>Sign up</Button>
					</>
				) : (
					<>
						<span className='text-sm text-text-muted'>Already have an account?</span>
						<Button variant='link' size='sm' onClick={() => switchMode('signin')}>Sign in</Button>
					</>
				)}
			</CardFooter>
		</Card>
	);
};

export default AuthForm;
