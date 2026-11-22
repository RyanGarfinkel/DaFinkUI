import { PricingSectionUsage } from '@/src/blocks/PricingSectionUsage/PricingSectionUsage';
import { AuthFormMagicLink } from '@/src/blocks/AuthFormMagicLink/AuthFormMagicLink';
import { AuthFormSocial } from '@/src/blocks/AuthFormSocial/AuthFormSocial';

export interface BlockExample {
	id:           string;
	title:        string;
	description?: string;
	usage:        string;
	preview:      React.ReactNode;
	slug:         string; // Matching hidden entry in blocks.ts, so this variant can be shown its own CLI install command
}

export const blockExamples: Record<string, BlockExample[]> = {
	'auth-form': [
		{
			id:    'social',
			title: 'Social login',
			description: 'Sign in with Google or GitHub, or fall back to a standard email and password form.',
			usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader, FormField, FormLabel, Button, Badge, Input } from '@components';
import { useState } from 'react';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 12h-7" />
  </svg>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.94.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function AuthFormSocialExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const busy = loading || socialLoading !== null;

  const handleSocial = (provider) => {
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
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col gap-1">
        {success ? (
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-text">You're in</h3>
            <Badge variant="success">Verified</Badge>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-text">Sign in</h3>
            <p className="text-sm text-text-muted">Choose a provider or use your email.</p>
          </>
        )}
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
              <CheckIcon />
            </div>
            <p className="text-sm text-text-muted text-center">Welcome back, {email || 'friend'}.</p>
            <Button variant="outlined" size="sm" onClick={reset}>Start over</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Button variant="secondary" className="w-full" loading={socialLoading === 'google'} disabled={busy} onClick={() => handleSocial('google')}>
                <GoogleIcon />
                Continue with Google
              </Button>
              <Button variant="secondary" className="w-full" loading={socialLoading === 'github'} disabled={busy} onClick={() => handleSocial('github')}>
                <GithubIcon />
                Continue with GitHub
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex-1 border-t border-surface-border" aria-hidden="true" />
              <span className="text-xs text-text-muted">or continue with email</span>
              <span className="flex-1 border-t border-surface-border" aria-hidden="true" />
            </div>

            <FormField>
              <FormLabel required>Email</FormLabel>
              <Input type="email" autoComplete="email" placeholder="you@example.com" value={email} disabled={busy} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField>
              <FormLabel required>Password</FormLabel>
              <Input type="password" autoComplete="current-password" placeholder="••••••••" value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} />
            </FormField>
            <Button className="w-full" loading={loading} disabled={busy || !email || !password} onClick={handleSubmit}>
              Sign in
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-center gap-1.5">
        <span className="text-sm text-text-muted">Don't have an account?</span>
        <Button variant="link" size="sm">Sign up</Button>
      </CardFooter>
    </Card>
  );
}`,
			preview: <AuthFormSocial />,
			slug:    'auth-form-social',
		},
		{
			id:    'magic-link',
			title: 'Magic link',
			description: 'Passwordless sign-in: email a one-time link instead of asking for a password.',
			usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader, FormField, FormLabel, Button, Input } from '@components';
import { useEffect, useState } from 'react';

const RESEND_COOLDOWN = 30;

const MailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

export default function AuthFormMagicLinkExample() {
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
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-text">{sent ? 'Check your inbox' : 'Sign in'}</h3>
        <p className="text-sm text-text-muted">
          {sent ? 'We sent a magic link to your email.' : "Enter your email and we'll send you a link to sign in; no password needed."}
        </p>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-brand/15 flex items-center justify-center">
              <MailIcon />
            </div>
            <p className="text-sm text-text">
              Sent to <strong>{email}</strong>
            </p>
            <p className="text-xs text-text-muted">
              Click the link in the email to finish signing in. It may take a minute to arrive.
            </p>
            <Button variant="ghost" size="sm" disabled={cooldown > 0} onClick={handleResend}>
              {cooldown > 0 ? \`Resend in \${cooldown}s\` : 'Resend link'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <FormField>
              <FormLabel required>Email</FormLabel>
              <Input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <Button className="w-full" loading={loading} disabled={!email} onClick={handleSend}>
              Send magic link
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-center gap-1.5">
        {sent ? (
          <Button variant="link" size="sm" onClick={reset}>Use a different email</Button>
        ) : (
          <span className="text-sm text-text-muted">We'll never ask for a password.</span>
        )}
      </CardFooter>
    </Card>
  );
}`,
			preview: <AuthFormMagicLink />,
			slug:    'auth-form-magic-link',
		},
	],
	'pricing-section': [
		{
			id:    'usage',
			title: 'Usage-based pricing',
			description: 'A metered pricing card: drag the slider to estimate a monthly bill from a base fee plus a per-unit rate.',
			usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader, Slider, Button, Badge } from '@components';
import { useState } from 'react';

const BASE_FEE = 19;
const INCLUDED_CALLS = 10;
const RATE_PER_1K = 0.4;

export default function Example() {
  const [calls, setCalls] = useState(50);

  const billableCalls = Math.max(0, calls - INCLUDED_CALLS);
  const estimate = BASE_FEE + billableCalls * RATE_PER_1K;

  return (
    <Card variant="elevated" className="w-full max-w-md">
      <CardHeader className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-text">Usage-based pricing</h3>
        <p className="text-sm text-text-muted">Pay only for the API calls you make; no seats, no tiers.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-text">\${estimate.toFixed(2)}</span>
            <span className="text-sm text-text-muted">/mo</span>
          </div>
          <Badge variant="default">Estimate</Badge>
        </div>

        <Slider
          label="Monthly API calls"
          value={calls}
          onValueChange={setCalls}
          min={10}
          max={500}
          step={10}
          hint={\`\${(calls * 1000).toLocaleString()} calls per month, first \${(INCLUDED_CALLS * 1000).toLocaleString()} are always free\`}
        />

        <p className="text-xs text-text-muted">
          \${BASE_FEE} base fee + \${RATE_PER_1K.toFixed(2)} per 1,000 calls beyond the free tier.
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-text-muted">Billed monthly</span>
        <Button>Start free trial</Button>
      </CardFooter>
    </Card>
  );
}`,
			preview: <PricingSectionUsage />,
			slug:    'pricing-section-usage',
		},
	],
};
