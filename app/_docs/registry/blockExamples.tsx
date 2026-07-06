import { NotificationsPanelActionable } from '@/src/blocks/NotificationsPanelActionable/NotificationsPanelActionable';
import { PricingSectionUsage } from '@/src/blocks/PricingSectionUsage/PricingSectionUsage';
import { AuthFormMagicLink } from '@/src/blocks/AuthFormMagicLink/AuthFormMagicLink';
import { ChartCardRadar } from '@/src/blocks/ChartCardRadar/ChartCardRadar';
import { AuthFormSocial } from '@/src/blocks/AuthFormSocial/AuthFormSocial';
import { ChartCardBar } from '@/src/blocks/ChartCardBar/ChartCardBar';

export interface BlockExample {
	id:           string;
	title:        string;
	description?: string;
	usage:        string;
	preview:      React.ReactNode;
}

export const blockExamples: Record<string, BlockExample[]> = {
	'auth-form': [
		{
			id:    'social',
			title: 'Social login',
			description: 'Sign in with Google or GitHub, or fall back to a standard email and password form.',
			usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import { FormField, FormLabel } from '@/src/components/Form/Form';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import Input from '@/src/components/Input/Input';
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

export default function AuthFormSocial() {
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
		},
		{
			id:    'magic-link',
			title: 'Magic link',
			description: 'Passwordless sign-in — email a one-time link instead of asking for a password.',
			usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import { FormField, FormLabel } from '@/src/components/Form/Form';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import { useEffect, useState } from 'react';

const RESEND_COOLDOWN = 30;

const MailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

export default function AuthFormMagicLink() {
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
          {sent ? 'We sent a magic link to your email.' : "Enter your email and we'll send you a link to sign in — no password needed."}
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
		},
	],
	'chart-card': [
		{
			id:    'radar',
			title: 'Team skill radar',
			description: 'Same card shell, a RadarChart instead — comparing team scores against target benchmarks across skill areas.',
			usage: `'use client';

import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import { RadarChart } from '@/src/components/Charts/Charts';
import CountUp from '@/src/components/CountUp/CountUp';
import Badge from '@/src/components/Badge/Badge';

const SKILL_DATA = [
  { skill: 'Frontend', team: 88, target: 80 },
  { skill: 'Backend', team: 84, target: 80 },
  { skill: 'Design', team: 90, target: 75 },
  { skill: 'Testing', team: 68, target: 80 },
  { skill: 'DevOps', team: 78, target: 75 },
  { skill: 'Docs', team: 64, target: 70 },
];

const SKILL_SERIES = [
  { key: 'team', label: 'Team' },
  { key: 'target', label: 'Target' },
];

export default function ChartCardRadar() {
  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <p className="text-xs text-text-muted">Team skill coverage</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-semibold text-text">
            <CountUp value={79} suffix="%" duration={1400} />
          </p>
          <Badge variant="warning">2 gaps</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <RadarChart data={SKILL_DATA} xKey="skill" series={SKILL_SERIES} height={200} />
      </CardContent>
    </Card>
  );
}`,
			preview: <ChartCardRadar />,
		},
		{
			id:    'bar',
			title: 'Top products',
			description: 'A ranking variant of the same card shell — a BarChart totaling revenue across a product lineup.',
			usage: `'use client';

import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import { BarChart } from '@/src/components/Charts/Charts';
import CountUp from '@/src/components/CountUp/CountUp';
import Badge from '@/src/components/Badge/Badge';

const PRODUCT_DATA = [
  { product: 'Core', revenue: 42500 },
  { product: 'Analytics', revenue: 31200 },
  { product: 'Sync', revenue: 24800 },
  { product: 'Mobile', revenue: 18100 },
  { product: 'API', revenue: 12400 },
];

const TOTAL_REVENUE = PRODUCT_DATA.reduce((sum, p) => sum + p.revenue, 0);

export default function ChartCardBar() {
  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <p className="text-xs text-text-muted">Top products by revenue</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-semibold text-text">
            <CountUp value={TOTAL_REVENUE} prefix="$" separator="," duration={1400} />
          </p>
          <Badge variant="success">+8.2%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <BarChart
          data={PRODUCT_DATA}
          xKey="product"
          series={[{ key: 'revenue', label: 'Revenue' }]}
          height={160}
          showLegend={false}
        />
      </CardContent>
    </Card>
  );
}`,
			preview: <ChartCardBar />,
		},
	],
	'pricing-section': [
		{
			id:    'usage',
			title: 'Usage-based pricing',
			description: 'A metered pricing card — drag the slider to estimate a monthly bill from a base fee plus a per-unit rate.',
			usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import Slider from '@/src/components/Slider/Slider';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import { useState } from 'react';

const BASE_FEE = 19;
const INCLUDED_CALLS = 10;
const RATE_PER_1K = 0.4;

export default function PricingSectionUsage() {
  const [calls, setCalls] = useState(50);

  const billableCalls = Math.max(0, calls - INCLUDED_CALLS);
  const estimate = BASE_FEE + billableCalls * RATE_PER_1K;

  return (
    <Card variant="elevated" className="w-full max-w-md">
      <CardHeader className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-text">Usage-based pricing</h3>
        <p className="text-sm text-text-muted">Pay only for the API calls you make — no seats, no tiers.</p>
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
          hint={\`\${(calls * 1000).toLocaleString()} calls per month — first \${(INCLUDED_CALLS * 1000).toLocaleString()} are always free\`}
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
		},
	],
	'notifications-panel': [
		{
			id:    'actionable',
			title: 'Filterable with actions',
			description: 'An All/Unread filter plus per-notification mark-as-read and dismiss actions, with type icons and an empty state.',
			usage: `'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/Tabs/Tabs';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import ScrollFade from '@/src/components/ScrollFade/ScrollFade';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import { useState } from 'react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'mention', message: 'Alex Kim mentioned you in "Q3 roadmap"', time: '2m ago', read: false },
  { id: 2, type: 'task', message: 'Design review assigned to you', time: '18m ago', read: false },
  { id: 3, type: 'system', message: 'Your weekly usage report is ready', time: '1h ago', read: false },
  { id: 4, type: 'mention', message: 'Sam Chen replied to your comment', time: '3h ago', read: true },
  { id: 5, type: 'task', message: 'Deploy checklist marked complete', time: '5h ago', read: true },
  { id: 6, type: 'system', message: 'New login from a Chrome browser', time: '1d ago', read: true },
];

const MentionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const TaskIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const SystemIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const CaughtUpIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="m8 12 3 3 5-6" />
  </svg>
);

const TYPE_ICON = {
  mention: <MentionIcon />,
  task: <TaskIcon />,
  system: <SystemIcon />,
};

const TYPE_STYLE = {
  mention: 'bg-brand/15 text-brand',
  task: 'bg-success-bg text-success',
  system: 'bg-warning-bg text-warning',
};

export default function NotificationsPanelActionable() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const renderList = (items) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CaughtUpIcon />
          <p className="text-sm text-text-muted">You're all caught up.</p>
        </div>
      );
    }

    return (
      <ScrollFade direction="vertical" className="max-h-72">
        <div className="flex flex-col divide-y divide-surface-border">
          {items.map((n) => (
            <div key={n.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={\`flex items-center justify-center w-7 h-7 rounded-full shrink-0 \${TYPE_STYLE[n.type]}\`}>
                {TYPE_ICON[n.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className={n.read ? 'text-sm text-text-muted' : 'text-sm font-medium text-text'}>{n.message}</p>
                <p className="text-xs text-text-muted mt-0.5">{n.time}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={\`Mark as read: \${n.message}\`} onClick={() => markAsRead(n.id)}>
                    <CheckIcon />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-danger" aria-label={\`Dismiss: \${n.message}\`} onClick={() => dismiss(n.id)}>
                  <CloseIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollFade>
    );
  };

  return (
    <Tabs value={filter} onValueChange={setFilter}>
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text">Notifications</h3>
            {unreadCount > 0 && <Badge variant="default">{unreadCount} new</Badge>}
          </div>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="all" className="pt-0">{renderList(notifications)}</TabsContent>
          <TabsContent value="unread" className="pt-0">{renderList(notifications.filter((n) => !n.read))}</TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}`,
			preview: <NotificationsPanelActionable />,
		},
	],
};
