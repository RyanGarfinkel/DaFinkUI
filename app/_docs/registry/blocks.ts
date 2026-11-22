// A block file is either an untagged path (installs into the block's own folder, same as
// always) or tagged with a `kind` — a file the CLI reroutes to the consumer's configured
// per-kind directory (e.g. `api` -> their apiDir) when they've opted into split-file
// organization, rewriting that file's own sibling imports to match. See CLAUDE.md in
// src/blocks/AiChat/ for the first real usage of this.
export type BlockFileKind  = 'api' | 'model' | 'hook';
export type BlockFileEntry = string | { path: string; kind: BlockFileKind };

export interface BlockEntry {
	slug: string;                    // URL segment, e.g. "dashboard"
	name: string;                    // Display name, e.g. "Dashboard"
	category: string;                // One of the block categories
	description: string;             // One paragraph description
	usage: string;                   // Complete, runnable code example (the string shown in the Code tab)
	dependencies: string[];          // npm packages this block requires, e.g. ["recharts"]
	registryDependencies: string[];  // Components from the component registry this block requires
	files: BlockFileEntry[];         // Source files to copy, relative to src/blocks/. Untagged = block folder; tagged = see BlockFileEntry above.
	hidden?: boolean;                // Installable via the CLI and directly linkable, but omitted from the /blocks gallery and index. Used for blockExamples.tsx variants: they're surfaced only through their parent block's Demos section, not as their own gallery entry.
	promptSnippet?: string;          // Optional copy-paste system-prompt text a consumer adds to their own LLM call to make a real model emit content this block knows how to render (e.g. the ```lineplot fence convention). Docs-only; never touched by the CLI.
}

export const blocks: BlockEntry[] = [
	{
		slug: 'dashboard',
		name: 'Dashboard',
		category: 'Dashboards',
		description: 'A drag-and-drop analytics overview with resizable stat, chart, and radar tiles plus a live team activity feed.',
		usage: `'use client';

import Mosaic, { MosaicTile, type MosaicTileLayout } from '@/src/components/Mosaic/Mosaic';
import DataTable, { type ColumnDef } from '@/src/components/DataTable/DataTable';
import { Menu } from '@/src/components/Menu/Menu';
import Badge, { type BadgeVariant } from '@/src/components/Badge/Badge';
import { AreaChart, RadarChart } from '@/src/components/Charts/Charts';
import CountUp from '@/src/components/CountUp/CountUp';
import Avatar from '@/src/components/Avatar/Avatar';
import { useState } from 'react';

interface ActivityRow {
  id: number;
  user: string;
  action: string;
  status: string;
  time: string;
}

const ACTIVITY_DATA: ActivityRow[] = [
  { id: 1, user: 'Alex Kim', action: 'Deployed to production', status: 'success', time: '2m ago' },
  { id: 2, user: 'Sam Chen', action: 'Merged pull request', status: 'success', time: '18m ago' },
  { id: 3, user: 'Jordan Park', action: 'Build failed', status: 'danger', time: '42m ago' },
  { id: 4, user: 'Riley Yu', action: 'Tests passed', status: 'success', time: '1h ago' },
  { id: 5, user: 'Morgan Lee', action: 'Deploy queued', status: 'warning', time: '2h ago' },
];

const AREA_DATA = [
  { month: 'Jan', revenue: 12400, users: 3200 },
  { month: 'Feb', revenue: 18200, users: 4100 },
  { month: 'Mar', revenue: 15800, users: 3800 },
  { month: 'Apr', revenue: 22100, users: 5200 },
  { month: 'May', revenue: 19600, users: 4700 },
  { month: 'Jun', revenue: 26800, users: 6100 },
];

const RADAR_DATA = [
  { metric: 'Revenue', thisPeriod: 88, lastPeriod: 74 },
  { metric: 'Users', thisPeriod: 82, lastPeriod: 70 },
  { metric: 'Conversion', thisPeriod: 68, lastPeriod: 60 },
  { metric: 'Retention', thisPeriod: 75, lastPeriod: 71 },
  { metric: 'Engagement', thisPeriod: 90, lastPeriod: 78 },
  { metric: 'Support', thisPeriod: 65, lastPeriod: 68 },
];

const RADAR_SERIES = [
  { key: 'thisPeriod', label: 'This period' },
  { key: 'lastPeriod', label: 'Last period' },
];

const STATS = [
  { id: 'revenue', label: 'Revenue', num: 114.9, prefix: '$', suffix: 'k', decimals: 1, delta: '+18%', variant: 'success' as BadgeVariant },
  { id: 'users', label: 'Active users', num: 27.1, prefix: '', suffix: 'k', decimals: 1, delta: '+12%', variant: 'success' as BadgeVariant },
  { id: 'conversion', label: 'Conversion', num: 3.4, prefix: '', suffix: '%', decimals: 1, delta: '+0.6%', variant: 'success' as BadgeVariant },
  { id: 'session', label: 'Avg session', num: 4.2, prefix: '', suffix: 'm', decimals: 1, delta: '−3%', variant: 'danger' as BadgeVariant },
];

const ACTIVITY_COLUMNS: ColumnDef<ActivityRow>[] = [
  {
    key: 'user',
    header: 'Team member',
    render: (v) => (
      <div className="flex items-center gap-2">
        <Avatar name={v as string} size="sm" />
        <span className="text-sm text-text">{v as string}</span>
      </div>
    ),
  },
  { key: 'action', header: 'Action' },
  { key: 'status', header: 'Status', render: (v) => <Badge variant={v as BadgeVariant}>{v as string}</Badge> },
  { key: 'time', header: 'Time' },
];

const PERIODS = ['Last 7 days', 'Last 30 days', 'Last 90 days'];

const ROW_HEIGHT = 140;
const GAP = 12;

const INITIAL_LAYOUT: MosaicTileLayout[] = [
  { id: 'revenue', col: 1, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 'users', col: 2, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 'conversion', col: 3, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 'session', col: 4, row: 1, colSpan: 1, rowSpan: 1 },
  { id: 'chart', col: 1, row: 2, colSpan: 2, rowSpan: 2 },
  { id: 'radar', col: 3, row: 2, colSpan: 2, rowSpan: 2 },
  { id: 'activity', col: 1, row: 4, colSpan: 4, rowSpan: 2 },
];

export default function Dashboard() {
  const [period, setPeriod] = useState('Last 30 days');
  const [layout, setLayout] = useState<MosaicTileLayout[]>(INITIAL_LAYOUT);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Team activity</h2>
        <Menu items={PERIODS.map((label) => ({ label, onSelect: () => setPeriod(label) }))} trigger={period} />
      </div>

      <Mosaic layout={layout} onLayoutChange={setLayout} cols={4} rowHeight={ROW_HEIGHT} gap={GAP} className="w-full">
        {STATS.map((s) => (
          <MosaicTile key={s.id} id={s.id} minColSpan={1} maxColSpan={2} minRowSpan={1} maxRowSpan={2}>
            <div className="h-full flex flex-col justify-between">
              <span className="text-xs text-text-muted">{s.label}</span>
              <div className="flex flex-col gap-1.5">
                <span className="text-2xl font-semibold text-text">
                  <CountUp value={s.num} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} duration={1400} separator="," />
                </span>
                <Badge variant={s.variant} className="w-fit">{s.delta}</Badge>
              </div>
            </div>
          </MosaicTile>
        ))}

        <MosaicTile id="chart" minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={3}>
          {({ rowSpan }) => (
            <div className="h-full flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Revenue vs users</span>
                <span className="text-xs text-text-subtle">{period}</span>
              </div>
              <AreaChart
                data={AREA_DATA}
                xKey="month"
                series={[{ key: 'revenue', label: 'Revenue' }, { key: 'users', label: 'Users' }]}
                height={Math.max(70, rowSpan * ROW_HEIGHT + (rowSpan - 1) * GAP - 76)}
              />
            </div>
          )}
        </MosaicTile>

        <MosaicTile id="radar" minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={3}>
          {({ rowSpan }) => (
            <div className="h-full flex flex-col gap-2">
              <span className="text-xs text-text-muted">This period vs last period</span>
              <RadarChart
                data={RADAR_DATA}
                xKey="metric"
                series={RADAR_SERIES}
                height={Math.max(70, rowSpan * ROW_HEIGHT + (rowSpan - 1) * GAP - 76)}
              />
            </div>
          )}
        </MosaicTile>

        <MosaicTile id="activity" minColSpan={2} maxColSpan={4} minRowSpan={1} maxRowSpan={4}>
          <div className="h-full flex flex-col gap-2">
            <span className="text-xs text-text-muted">Recent activity</span>
            <DataTable data={ACTIVITY_DATA} columns={ACTIVITY_COLUMNS} keyField="id" pageSize={5} />
          </div>
        </MosaicTile>
      </Mosaic>
    </div>
  );
}`,
		dependencies: ['recharts'],
		registryDependencies: ['mosaic', 'menu', 'charts', 'badge', 'avatar', 'data-table', 'count-up'],
		files: ['Dashboard/Dashboard.tsx'],
	},
	{
		slug: 'auth-form',
		name: 'Auth form',
		category: 'Authentication',
		description: 'A combined sign-in / sign-up card with a mode toggle: sign-in runs a three-step credentials → OTP verification → success flow, sign-up is a single-step account creation form with live password-match validation.',
		usage: `'use client';

import { ToggleGroup, ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';
import { FormField, FormLabel, FormMessage } from '@/src/components/Form/Form';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import Checkbox from '@/src/components/Checkbox/Checkbox';
import OTPInput from '@/src/components/OTPInput/OTPInput';
import Progress from '@/src/components/Progress/Progress';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import Input from '@/src/components/Input/Input';
import { useEffect, useRef, useState } from 'react';

export default function AuthForm() {
  const [mode, setMode] = useState('signin');
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

  const switchMode = (next) => {
    if (!next || next === mode) return;
    setMode(next);
    setStep(0);
    setLoading(false);
    setSuccess(false);
  };

  const signupTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const passwordsMismatch = confirmPassword !== '' && confirmPassword !== signupPassword;
  const canSignup = !!name && !!signupEmail && !!signupPassword && !!confirmPassword && !passwordsMismatch && agreed;

  useEffect(() => () => clearTimeout(signupTimerRef.current), []);

  const handleSignup = () => {
    setLoading(true);
    clearTimeout(signupTimerRef.current);
    signupTimerRef.current = setTimeout(() => {
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
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-col gap-4">
        <ToggleGroup type="single" value={mode} onValueChange={switchMode} size="sm" aria-label="Auth mode">
          <ToggleGroupItem value="signin">Sign in</ToggleGroupItem>
          <ToggleGroupItem value="signup">Create account</ToggleGroupItem>
        </ToggleGroup>

        {mode === 'signin' ? (
          <>
            <Progress value={[33, 66, 100][step]} />
            {step === 0 && (
              <>
                <h3 className="text-xl font-semibold text-text">Sign in</h3>
                <p className="text-sm text-text-muted">Enter your credentials to continue.</p>
              </>
            )}
            {step === 1 && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-text">Verify identity</h3>
                  <Badge variant="warning">2FA</Badge>
                </div>
                <p className="text-sm text-text-muted">We sent a 6-digit code to <strong>{email}</strong>.</p>
              </div>
            )}
            {step === 2 && (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-text">You're in</h3>
                  <Badge variant="success">Verified</Badge>
                </div>
                <p className="text-sm text-text-muted">Welcome back, {email}.</p>
              </>
            )}
          </>
        ) : (
          <>
            <Progress value={success ? 100 : canSignup ? 66 : 33} />
            {success ? (
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-text">You're all set</h3>
                <Badge variant="success">Verified</Badge>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-text">Create account</h3>
                <p className="text-sm text-text-muted">Sign up to get started in seconds.</p>
              </>
            )}
          </>
        )}
      </CardHeader>
      <CardContent>
        {mode === 'signin' ? (
          <>
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <FormField>
                  <FormLabel required>Email</FormLabel>
                  <Input type="email" autoComplete="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                </FormField>
                <FormField>
                  <FormLabel required>Password</FormLabel>
                  <Input type="password" autoComplete="current-password" placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                </FormField>
                <Button className="w-full" onClick={() => setStep(1)} disabled={!email || !password}>
                  Continue
                </Button>
              </div>
            )}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <OTPInput length={6} value={otp} onChange={setOtp} />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setStep(0); setOtp(''); }}>Back</Button>
                  <Button className="flex-1" onClick={() => setStep(2)} disabled={otp.length < 6}>Verify</Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-col items-center gap-4 py-2">
                <p className="text-sm text-text-muted text-center">Authentication complete. Redirecting…</p>
                <Button variant="outlined" size="sm" onClick={resetSignin}>Start over</Button>
              </div>
            )}
          </>
        ) : success ? (
          <p className="text-sm text-text-muted text-center py-2">Account created. Check your email to verify.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <FormField>
              <FormLabel required>Full name</FormLabel>
              <Input autoComplete="name" placeholder="Jordan Park" value={name}
                onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField>
              <FormLabel required>Email</FormLabel>
              <Input type="email" autoComplete="email" placeholder="you@example.com" value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)} />
            </FormField>
            <FormField>
              <FormLabel required>Password</FormLabel>
              <Input type="password" autoComplete="new-password" placeholder="••••••••" value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)} />
            </FormField>
            <FormField>
              <FormLabel required>Confirm password</FormLabel>
              <Input type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={passwordsMismatch ? 'Passwords do not match' : undefined} />
              <FormMessage>{passwordsMismatch ? 'Passwords do not match' : ''}</FormMessage>
            </FormField>
            <Checkbox label="I agree to the Terms of Service and Privacy Policy" checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)} />
            <Button className="w-full" loading={loading} disabled={!canSignup} onClick={handleSignup}>
              Create account
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-center gap-1.5">
        {mode === 'signin' ? (
          <>
            <span className="text-sm text-text-muted">Don't have an account?</span>
            <Button variant="link" size="sm" onClick={() => switchMode('signup')}>Sign up</Button>
          </>
        ) : (
          <>
            <span className="text-sm text-text-muted">Already have an account?</span>
            <Button variant="link" size="sm" onClick={() => switchMode('signin')}>Sign in</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}`,
		dependencies: [],
		registryDependencies: ['card', 'form', 'toggle-group', 'checkbox', 'otp-input', 'progress', 'button', 'badge', 'icons', 'input'],
		files: ['AuthForm/AuthForm.tsx'],
	},
	{
		slug: 'settings-form',
		name: 'Settings form',
		category: 'Forms',
		description: 'A general-purpose account settings form (profile fields, a timezone select, and notification toggles) grouped into sections with a save action.',
		usage: `'use client';

import { FormSection, FormField, FormLabel, FormDescription } from '@/src/components/Form/Form';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import { Select, type SelectOption } from '@/src/components/Select/Select';
import Textarea from '@/src/components/Textarea/Textarea';
import Button from '@/src/components/Button/Button';
import Switch from '@/src/components/Switch/Switch';
import Input from '@/src/components/Input/Input';
import Badge from '@/src/components/Badge/Badge';
import { useEffect, useRef, useState } from 'react';

const TIMEZONES: SelectOption[] = [
  { value: 'utc-8', label: 'Pacific Time (UTC-8)' },
  { value: 'utc-5', label: 'Eastern Time (UTC-5)' },
  { value: 'utc+0', label: 'UTC' },
  { value: 'utc+1', label: 'Central European (UTC+1)' },
];

export default function SettingsForm() {
  const [name, setName] = useState('Jordan Park');
  const [email, setEmail] = useState('jordan@example.com');
  const [bio, setBio] = useState('Product designer working on the design system team.');
  const [timezone, setTimezone] = useState('utc-8');
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [productNews, setProductNews] = useState(false);
  const [saved, setSaved] = useState(false);

  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(savedTimerRef.current), []);

  const handleSave = () => {
    setSaved(true);
    clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <h3 className="text-xl font-semibold text-text">Account settings</h3>
        <p className="text-sm text-text-muted">Update your profile and notification preferences.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormSection title="Profile">
          <FormField>
            <FormLabel required>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField>
            <FormLabel required>Email</FormLabel>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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

        <FormSection title="Notifications">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-text">Email updates</span>
              <span className="text-xs text-text-muted">Get notified about activity on your account.</span>
            </div>
            <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} label="Email updates" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-text">Product news</span>
              <span className="text-xs text-text-muted">Occasional updates about new features.</span>
            </div>
            <Switch checked={productNews} onCheckedChange={setProductNews} label="Product news" />
          </div>
        </FormSection>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        {saved ? <Badge variant="success">Saved</Badge> : <span />}
        <Button onClick={handleSave}>Save changes</Button>
      </CardFooter>
    </Card>
  );
}`,
		dependencies: [],
		registryDependencies: ['card', 'form', 'input', 'textarea', 'switch', 'select', 'button', 'badge'],
		files: ['SettingsForm/SettingsForm.tsx'],
	},
	{
		slug: 'onboarding-checklist',
		name: 'Onboarding checklist',
		category: 'Onboarding',
		description: 'A "getting started" checklist card with a progress bar that tracks completed setup tasks.',
		usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import Checkbox from '@/src/components/Checkbox/Checkbox';
import Progress from '@/src/components/Progress/Progress';
import Button from '@/src/components/Button/Button';
import { useState } from 'react';

interface OnboardingTask {
  id: string;
  label: string;
  done: boolean;
}

const INITIAL_TASKS: OnboardingTask[] = [
  { id: 'create-project', label: 'Create your first project', done: false },
  { id: 'invite-teammate', label: 'Invite a teammate', done: false },
  { id: 'connect-github', label: 'Connect your GitHub repo', done: false },
  { id: 'customize-theme', label: 'Customize your theme', done: false },
  { id: 'install-cli', label: 'Install the CLI', done: false },
];

export default function OnboardingChecklist() {
  const [tasks, setTasks] = useState<OnboardingTask[]>(INITIAL_TASKS);

  const completedCount = tasks.filter((task) => task.done).length;
  const allComplete = completedCount === tasks.length;

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h3 className="text-xl font-semibold text-text">Get started with DaFink UI</h3>
        <p className="text-sm text-text-muted">Finish these steps to set up your workspace.</p>
        <Progress value={completedCount} max={tasks.length} className="mt-4" />
        <p className="mt-1.5 text-xs text-text-muted">{completedCount} of {tasks.length} complete</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2.5">
            <Checkbox id={task.id} checked={task.done} onChange={() => toggleTask(task.id)} />
            <label htmlFor={task.id}
              className={\`text-sm cursor-pointer select-none \${task.done ? 'line-through text-text-muted' : 'text-text'}\`}>
              {task.label}
            </label>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{completedCount} of {tasks.length} complete</span>
        <Button disabled={!allComplete}>Continue</Button>
      </CardFooter>
    </Card>
  );
}`,
		dependencies: [],
		registryDependencies: ['card', 'checkbox', 'progress', 'button'],
		files: ['OnboardingChecklist/OnboardingChecklist.tsx'],
	},
	{
		slug: 'checkout-form',
		name: 'Checkout form',
		category: 'Billing',
		description: 'A checkout form with contact fields, a card/PayPal payment method switch, and a loading-to-success payment flow.',
		usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import { FormSection, FormField, FormLabel } from '@/src/components/Form/Form';
import { RadioGroup, RadioItem } from '@/src/components/Radio/Radio';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import { useEffect, useRef, useState } from 'react';

export default function CheckoutForm() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const payTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const canPay = !!email && !!fullName && (paymentMethod !== 'card' || (!!cardNumber && !!expiry && !!cvc));

  useEffect(() => () => clearTimeout(payTimerRef.current), []);

  const handlePay = () => {
    setLoading(true);
    clearTimeout(payTimerRef.current);
    payTimerRef.current = setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 900);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <h3 className="text-xl font-semibold text-text">Checkout</h3>
        <p className="text-sm text-text-muted">Complete your purchase.</p>
      </CardHeader>
      {success ? (
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <p className="text-sm text-text-muted text-center">Payment complete. A receipt has been sent to {email}.</p>
        </CardContent>
      ) : (
        <>
          <CardContent className="flex flex-col gap-6">
            <FormSection title="Contact">
              <FormField>
                <FormLabel required>Email</FormLabel>
                <Input type="email" autoComplete="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </FormField>
              <FormField>
                <FormLabel required>Full name</FormLabel>
                <Input autoComplete="name" placeholder="Jordan Park" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} />
              </FormField>
            </FormSection>

            <FormSection title="Payment method">
              <RadioGroup name="payment-method" value={paymentMethod} onValueChange={setPaymentMethod}>
                <RadioItem value="card" label="Credit or debit card" />
                <RadioItem value="paypal" label="PayPal" />
              </RadioGroup>

              {paymentMethod === 'card' ? (
                <div className="flex flex-col gap-4">
                  <FormField>
                    <FormLabel required>Card number</FormLabel>
                    <Input inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242"
                      value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                  </FormField>
                  <div className="flex gap-4">
                    <FormField className="flex-1">
                      <FormLabel required>Expiry (MM/YY)</FormLabel>
                      <Input autoComplete="cc-exp" placeholder="MM/YY" value={expiry}
                        onChange={(e) => setExpiry(e.target.value)} />
                    </FormField>
                    <FormField className="flex-1">
                      <FormLabel required>CVC</FormLabel>
                      <Input inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={cvc}
                        onChange={(e) => setCvc(e.target.value)} />
                    </FormField>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted">You'll be redirected to PayPal to complete your payment.</p>
              )}
            </FormSection>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Total: $49.00</span>
            <Button onClick={handlePay} loading={loading} disabled={!canPay}>
              Pay $49.00
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}`,
		dependencies: [],
		registryDependencies: ['card', 'form', 'radio', 'button', 'icons', 'input'],
		files: ['CheckoutForm/CheckoutForm.tsx'],
	},
	{
		slug: 'pricing-section',
		name: 'Pricing section',
		category: 'Marketing',
		description: 'A 3-tier pricing section with a monthly/yearly billing toggle and a highlighted recommended plan, plus a pricing FAQ accordion beneath it.',
		usage: `'use client';

import Accordion, { AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/Accordion/Accordion';
import { ToggleGroup, ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import { useState } from 'react';

const TIERS = [
  { name: 'Starter', description: 'For individuals getting started.', monthly: 9, yearly: 86,
    features: ['1 project', 'Community support', 'Basic analytics', '1 GB storage'], recommended: false },
  { name: 'Pro', description: 'For growing teams that need more power.', monthly: 29, yearly: 278,
    features: ['Unlimited projects', 'Priority support', 'Advanced analytics', '50 GB storage', 'Team collaboration'], recommended: true },
  { name: 'Enterprise', description: 'For large organizations with custom needs.', monthly: 99, yearly: 950,
    features: ['Unlimited everything', 'Dedicated support', 'Custom integrations', 'SSO & audit logs', '99.9% uptime SLA'], recommended: false },
];

const FAQS = [
  { value: 'switch-plans', question: 'Can I switch plans later?',
    answer: 'Yes, upgrade or downgrade at any time. Changes are prorated so you only pay for what you use.' },
  { value: 'billing-cycle', question: "What's the difference between monthly and yearly billing?",
    answer: 'Yearly billing is paid upfront for the year and works out to about 20% cheaper than paying monthly.' },
  { value: 'cancel', question: 'Can I cancel anytime?',
    answer: "Yes, there's no lock-in contract. Cancel from your billing settings and you won't be charged again." },
  { value: 'payment-methods', question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards, plus PayPal for monthly and yearly plans.' },
  { value: 'enterprise', question: 'Do you offer custom Enterprise pricing?',
    answer: 'Yes, contact our sales team for volume discounts, custom contracts, and dedicated onboarding.' },
];

export default function PricingSection() {
  const [period, setPeriod] = useState('monthly');

  return (
    <div className="flex flex-col gap-16 w-full">
      <div className="flex flex-col gap-8 w-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold text-text">Simple, transparent pricing</h2>
          <p className="text-sm text-text-muted max-w-md">Choose the plan that fits your team. Switch to yearly billing and save 20%.</p>
          <ToggleGroup type="single" value={period} onValueChange={(v) => setPeriod(v)} size="md" aria-label="Billing period">
            <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const price = period === 'monthly' ? tier.monthly : tier.yearly;
            return (
              <Card key={tier.name} variant={tier.recommended ? 'elevated' : 'default'}
                className={tier.recommended ? 'border-2 border-brand' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-text">{tier.name}</h3>
                    {tier.recommended && <Badge variant="default">Most popular</Badge>}
                  </div>
                  <p className="text-sm text-text-muted mt-1">{tier.description}</p>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl font-semibold text-text">\${price}</span>
                    <span className="text-sm text-text-muted">{period === 'monthly' ? '/mo' : '/yr'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-text">{feature}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant={tier.recommended ? 'primary' : 'outlined'} className="w-full">
                    {tier.recommended ? 'Start free trial' : 'Get started'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text">Pricing questions</h2>
            <p className="text-sm text-text-muted">Common questions about plans and billing.</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {FAQS.map((faq) => (
                <AccordionItem key={faq.value} value={faq.value}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`,
		dependencies: [],
		registryDependencies: ['accordion', 'toggle-group', 'card', 'button', 'badge', 'icons'],
		files: ['PricingSection/PricingSection.tsx'],
	},
	{
		slug: 'ai-chat',
		name: 'AI chat',
		category: 'AI',
		description: 'A chat app with a history sidebar (new-chat button, rename, delete, and a footer profile card that opens a settings modal), streaming replies, and forkable reply threads in a resizable side panel. A reply can also edit a slide deck live in a slides panel (the DeckEditor component, with downloads), so you and an agent work on the same deck, or edit a spreadsheet the same way in a sheet panel (the SheetEditor component, with formulas). Installs as a folder with ToolCallTrace and Questionnaire as dependencies. Works with a real API: chats, threads, replies, and search all load from API routes, so point them at your own backend.',
		usage: `'use client';

import { describeAttachments, buildHistory, buildPrompt, collectArtifacts, findLastUserMessageId, hasPrecedingUserMessage, slideReference, DRAFT_TITLE_MAX_LENGTH } from '@/src/blocks/AiChat/messageHelpers';
import { Sidebar, SidebarFooter, SidebarHeader } from '@/src/components/Sidebar/Sidebar';
import { MenuIcon, FileIcon } from '@/src/blocks/AiChat/icons';
import { DeleteChatModal } from '@/src/blocks/AiChat/DeleteChatModal';
import { MessageActionsRow, ChatMessageRow, buildVersionNav, Divider, DeckCard, ArtifactCard } from '@/src/blocks/AiChat/MessageRow';
import type { ChatTextMessage, ChatMessage, ThreadRef, ChatEntry, ChatSettings, SearchHit, MessageAttachment } from '@/src/blocks/AiChat/types';
import { ChatSearch } from '@/src/blocks/AiChat/ChatSearch';
import { APP_NAME, COMMANDS, MODEL_OPTIONS, EFFORT_OPTIONS, SLIDES_PROMPT } from '@/src/blocks/AiChat/constants';
import { Resizable, ResizablePanel } from '@/src/components/Resizable/Resizable';
import { DesktopPanel, MobilePanel } from '@/src/blocks/AiChat/PanelSlot';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { fetchChats, fetchThread } from '@/src/blocks/AiChat/chatApi';
import { deckBefore, deckDocKey, resolveDeckEdit, useLiveDeck } from '@/src/blocks/AiChat/useLiveDeck';
import { type CommandOption } from '@/src/components/CommandInput/CommandInput';
import type { DeckAskContext } from '@/src/components/DeckEditor/askcontext';
import Drawer from '@/src/components/Drawer/Drawer';
import ScrollFade from '@/src/components/ScrollFade/ScrollFade';
import { Greeting, TypingPhrase, USER_NAME } from '@/src/blocks/AiChat/Phrases';
import Spinner from '@/src/components/Spinner/Spinner';
import { useStickToBottom } from '@/src/blocks/AiChat/useStickToBottom';
import { useConversation } from '@/src/blocks/AiChat/useConversation';
import Button from '@/src/components/Button/Button';
import { SettingsModal } from '@/src/blocks/AiChat/SettingsModal';
import { SidebarTools } from '@/src/blocks/AiChat/SidebarTools';
import { ProfileCard } from '@/src/blocks/AiChat/ProfileCard';
import { resolveSheetChart } from '@/src/blocks/AiChat/chartSource';
import { ChatList } from '@/src/blocks/AiChat/ChatList';
import { useSheetPanel } from '@/src/blocks/AiChat/useSheetPanel';
import ArtifactsPanel from '@/src/blocks/AiChat/ArtifactsPanel';
import type { ArtifactEntry } from '@/src/blocks/AiChat/types';
import { useIsMobile } from '@/src/blocks/AiChat/useIsMobile';
import ThreadPanel from '@/src/blocks/AiChat/ThreadPanel';
import DeckPanel from '@/src/blocks/AiChat/DeckPanel';
import Composer from '@/src/blocks/AiChat/Composer';

export type { ChatTextMessage, ChatMessage, ThreadRef, ChatEntry, AiChatHistoryMessage, AiChatReply, SearchCorpusEntry, SearchHit, MessageAttachment, ChatDeck, DeckEdit, DeckEditStep, ChatSheet, SheetEdit, SheetEditStep, ChatArtifact, ArtifactKind } from '@/src/blocks/AiChat/types';


const MAIN_COMPOSER_ID = 'main-composer';

const THREAD_SIZE = { initial: 320, min: 240, max: 480 };

const DECK_SIZE = { initial: 560, min: 360, max: 900 };

const SHEET_SIZE = { initial: 620, min: 360, max: 900 };

const ARTIFACTS_SIZE = { initial: 480, min: 320, max: 900 };

const DRAWER_EXIT_MS = 250;

const COPY_NOTICE_MS = 2000;

interface SidebarSlotProps {
	mobile:       boolean;
	open:         boolean;
	onOpenChange: (open: boolean) => void;
	children:     ReactNode;
}

const SidebarSlot = ({ mobile, open, onOpenChange, children }: SidebarSlotProps) => {
	if(!mobile) return <>{children}</>;
	return <Drawer open={open} onOpenChange={onOpenChange} side='left' aria-label='Chats'>{children}</Drawer>;
};

export const AiChat = () => {
	const [chats, setChats] = useState<ChatEntry[]>([]);
	const [chatsStatus, setChatsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
	const [activeId, setActiveId] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draft, setDraft] = useState('');
	const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
	// Slide elements the user pointed at with Ask AI, sent with the next message like attachments.
	const [slideRefs, setSlideRefs] = useState<MessageAttachment[]>([]);
	const [threadAttachedFiles, setThreadAttachedFiles] = useState<File[]>([]);
	const [chatPendingDeletion, setChatPendingDeletion] = useState<ChatEntry | null>(null);
	const [threadMessages, setThreadMessages] = useState<Record<string, ChatMessage[]>>({});
	const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
	const [activeThread, setActiveThread] = useState<{ chatId: string; threadId: string; rootMessageId: number } | null>(null);
	const [threadDraft, setThreadDraft] = useState('');
	const [copyNoticeVisible, setCopyNoticeVisible] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [settings, setSettings] = useState<ChatSettings>({
		displayName:       USER_NAME,
		model:             MODEL_OPTIONS[1].value,
		effort:            EFFORT_OPTIONS[1].value,
		enabledConnectors: [],
		autoTitleEnabled:  true,
	});
	const { displayName, model, effort, autoTitleEnabled } = settings;
	const [searchOpen, setSearchOpen] = useState(false);
	const [pendingScrollMessageId, setPendingScrollMessageId] = useState<number | null>(null);
	const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
	const [editDraft, setEditDraft] = useState('');
	// The slides panel shares the thread panel's column; opening one closes the other.
	// \`messageId\` is the card that opened it, which gets focus back on close.
	const [deckView, setDeckView] = useState<{ chatId: string; deckId: string; messageId: number } | null>(null);
	// The artifacts panel shares the same column too. \`key\` is the open artifact (null shows the list);
	// \`triggerId\` is the element that opened it, which gets focus back on close.
	const [artifactView, setArtifactView] = useState<{ chatId: string; key: string | null; triggerId: string } | null>(null);
	// Which side panel (if any) has taken the full width, hiding the chat column.
	const [expandedKey, setExpandedKey] = useState<string | null>(null);
	const isMobile = useIsMobile();
	const railCollapsed = !isMobile && sidebarCollapsed;
	const liveDeck = useLiveDeck();
	const sheetPanel = useSheetPanel({
		chats,
		activeChatId: activeId,
		isMobile,
		closeOthers:  () =>
		{
			setActiveThread(null);
			setArtifactView(null);
			setDeckView(null);
		},
		onReference:  (reference) =>
		{
			setSlideRefs((prev) => (prev.some((r) => r.detail === reference.detail) ? prev : [...prev, reference]));
			window.setTimeout(() => document.getElementById(MAIN_COMPOSER_ID)?.querySelector('input')?.focus(), isMobile ? DRAWER_EXIT_MS : 0);
		},
	});
	const { containerRef, contentRef, follow, scrollIfFollowing } = useStickToBottom();
	const searchTriggerRef = useRef<HTMLButtonElement>(null);
	const copyNoticeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const mountedRef = useRef(true);
	const nextChatId = useRef(1);
	const nextThreadId = useRef(1);
	const nextMessageIdRef = useRef(1);

	const getThreadRootHistory = (chatId: string, rootMessageId: number): ChatMessage[] => {
		const chat = chats.find((c) => c.id === chatId);
		if(!chat) return [];
		const rootIndex = chat.messages.findIndex((m) => m.id === rootMessageId);
		return rootIndex === -1 ? chat.messages : chat.messages.slice(0, rootIndex + 1);
	};

	const mainConversation = useConversation({
		getMessages:    (chatId) => chats.find((c) => c.id === chatId)?.messages ?? [],
		updateMessages: (chatId, updater) => setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: updater(c.messages) } : c))),
		nextMessageIdRef,
		// The AI edits from your current version of each deck in this chat.
		getDecks: (chatId) => Object.entries(liveDeck.docs)
			.filter(([key]) => key.startsWith(\`\${chatId}:\`))
			.map(([key, deck]) => ({ deckId: key.slice(chatId.length + 1), deck })),
		getSheets: sheetPanel.getSheets,
		// A reply that edits slides lands live in the slides panel, opened without moving focus.
		onReply: (chatId, message, previous) => {
			sheetPanel.onReply(chatId, message, previous);
			const edit = message.deckEdit;
			if(!edit) return;
			const docKey = deckDocKey(chatId, edit.deckId);
			if(!edit.base && !liveDeck.docs[docKey])
			{
				const start = deckBefore(edit, previous);
				if(!start) return;
				liveDeck.open(docKey, start);
			}
			liveDeck.apply(docKey, message.id, edit);
			setActiveThread(null);
			setArtifactView(null);
			sheetPanel.hide();
			setDeckView({ chatId, deckId: edit.deckId, messageId: message.id });
		},
	});

	const threadConversation = useConversation({
		getMessages:    (threadId) => threadMessages[threadId] ?? [],
		updateMessages: (threadId, updater) => setThreadMessages((prev) => ({ ...prev, [threadId]: updater(prev[threadId] ?? []) })),
		nextMessageIdRef,
		// A thread's root context isn't known from its own id alone — look it up from
		// whichever chat's threadRefs claims it, not from \`activeThread\` (which may have
		// already moved on to a different thread by the time an in-flight reply resolves).
		historyPrefix: (threadId) => {
			for(const chat of chats)
			{
				const ref = chat.threadRefs.find((r) => r.id === threadId);
				if(ref) return buildHistory(getThreadRootHistory(chat.id, ref.rootMessageId));
			}
			return [];
		},
	});

	const activeChat = chats.find((c) => c.id === activeId) ?? null;
	const modelLabel = MODEL_OPTIONS.find((o) => o.value === model)?.label ?? MODEL_OPTIONS[0].label;
	const modelPicker = {
		model,
		effort,
		onModelChange:  (next: string) => setSettings((prev) => ({ ...prev, model: next })),
		onEffortChange: (next: string) => setSettings((prev) => ({ ...prev, effort: next })),
	};
	const isTyping = activeId !== null && mainConversation.typingId === activeId;
	const isGenerating = isTyping || (activeId !== null && mainConversation.streamingId === activeId);
	const isThreadTyping = activeThread !== null && threadConversation.typingId === activeThread.threadId;
	const isThreadGenerating = activeThread !== null && (threadConversation.typingId === activeThread.threadId || threadConversation.streamingId === activeThread.threadId);
	const lastUserMessageId = activeChat ? findLastUserMessageId(activeChat.messages) : null;

	useEffect(() => {
		let cancelled = false;

		fetchChats()
			.then((loaded) => {
				if(cancelled) return;
				nextChatId.current = loaded.length + 1;
				nextMessageIdRef.current = Math.max(0, ...loaded.flatMap((c) => c.messages.map((m) => m.id))) + 1;
				setChats(loaded);
				// Land on a fresh, unsaved chat rather than the most recent one — it only
				// joins \`chats\` (and the sidebar) once its first message is sent.
				setActiveId(null);
				setChatsStatus('ready');
			})
			.catch(() => {
				if(!cancelled) setChatsStatus('error');
			});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		scrollIfFollowing();
	}, [scrollIfFollowing, chats, isTyping, activeId]);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			clearTimeout(copyNoticeTimerRef.current);
		};
	}, []);

	useEffect(() => {
		if(pendingScrollMessageId === null) return;
		const target = document.querySelector(\`[data-message-id="\${pendingScrollMessageId}"]\`);
		if(!target) return;
		target.scrollIntoView({ block: 'center', behavior: 'smooth' });
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPendingScrollMessageId(null);
	}, [pendingScrollMessageId, activeId, activeThread, threadMessages]);

	const handleSelectHit = (hit: SearchHit) => {
		follow(false);
		setPendingScrollMessageId(hit.messageId);
		if(hit.threadId !== undefined && hit.rootMessageId !== undefined)
		{
			handleOpenThread(hit.chatId, hit.threadId, hit.rootMessageId);
			return;
		}
		if(activeThread?.chatId !== hit.chatId) setActiveThread(null);
		setActiveId(hit.chatId);
		setSidebarOpen(false);
	};

	// Doesn't touch \`chats\` — the draft only becomes a real, sidebar-visible chat once its
	// first message is sent (see handleSubmit).
	const handleNewChat = () => {
		follow(true);
		setActiveId(null);
		setDraft('');
		setAttachedFiles([]);
		setSlideRefs([]);
		setSidebarOpen(false);
	};

	const handleSelectChat = (id: string) => {
		follow(true);
		setActiveId(id);
		setDraft('');
		setAttachedFiles([]);
		setSlideRefs([]);
		setSidebarOpen(false);
	};

	const handleRename = (id: string, title: string) => setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));

	const handleDelete = (id: string) => {
		setChats((prev) => {
			const next = prev.filter((c) => c.id !== id);
			if(activeId === id) setActiveId(next[0]?.id ?? null);
			return next;
		});
		if(editingId === id) setEditingId(null);
	};

	const handleConfirmDelete = (chat: ChatEntry) => {
		handleDelete(chat.id);
		setChatPendingDeletion(null);
	};

	const handleStop = () => {
		if(activeChat) mainConversation.stop(activeChat.id);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		sendText(draft.trim(), [...slideRefs, ...attachedFiles.map((file) => ({ name: file.name }))]);
	};

	const sendText = (text: string, attachments: MessageAttachment[]) => {
		if(chatsStatus !== 'ready' || isGenerating) return;
		if(!text && attachments.length === 0) return;

		if(activeChat)
		{
			mainConversation.submit(activeChat.id, text, attachments);
		}
		else
		{
			// A draft has no \`chats\` entry to append to, so its first message creates the chat.
			const chatId = String(nextChatId.current++);
			const userMessage: ChatMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'user', text, attachments };
			const rawTitle = text || describeAttachments(attachments);
			const title = autoTitleEnabled && rawTitle
				? rawTitle.length > DRAFT_TITLE_MAX_LENGTH ? \`\${rawTitle.slice(0, DRAFT_TITLE_MAX_LENGTH).trimEnd()}…\` : rawTitle
				: 'New chat';
			setChats((prev) => [{ id: chatId, title, messages: [userMessage], threadRefs: [] }, ...prev]);
			setActiveId(chatId);
			mainConversation.queueReply(chatId, buildPrompt(text, attachments), []);
		}

		follow(true);
		setDraft('');
		setAttachedFiles([]);
		setSlideRefs([]);
	};

	const handleQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeChat) return;
		follow(true);
		mainConversation.questionnaireAnswer(activeChat.id, messageId, value);
	};

	const handleMainStreamComplete = (messageId: number) => {
		if(activeChat) mainConversation.streamComplete(activeChat.id, messageId);
	};

	const setMessageVersionIndex = (chatId: string, messageId: number, index: number) => mainConversation.setVersionIndex(chatId, messageId, index);

	const regenerateMessage = (chatId: string, messageId: number) => mainConversation.regenerate(chatId, messageId);

	const handleStartEditMessage = (m: ChatTextMessage) => {
		setEditingMessageId(m.id);
		setEditDraft(m.text);
	};

	const handleCancelEditMessage = () => {
		setEditingMessageId(null);
		setEditDraft('');
	};

	const handleResendEdit = (chatId: string, messageId: number) => {
		const text = editDraft.trim();
		if(!text) return;
		mainConversation.resendEdit(chatId, messageId, text);
		setEditingMessageId(null);
		setEditDraft('');
	};

	// Display-only: the thread panel shows just the message the thread branched from, not
	// the whole conversation up to that point. Reply generation still needs the full history
	// (getThreadRootHistory above) so the assistant keeps that context.
	const getThreadRootMessage = (chatId: string, rootMessageId: number): ChatMessage[] => {
		const chat = chats.find((c) => c.id === chatId);
		const rootMessage = chat?.messages.find((m) => m.id === rootMessageId);
		return rootMessage ? [rootMessage] : [];
	};

	// The chat's latest version of a deck, rebuilt from its edit history (before anyone has opened it live).
	const latestDeck = (chatId: string, deckId: string) => {
		const messages = chats.find((c) => c.id === chatId)?.messages ?? [];
		try
		{
			return deckBefore({ deckId, title: '', steps: [] }, messages);
		}
		catch
		{
			return null;
		}
	};

	// Every card for a deck opens the same live document, not a snapshot of that reply.
	const handleOpenDeck = (chatId: string, message: ChatTextMessage) => {
		const edit = message.deckEdit;
		if(!edit) return;
		const docKey = deckDocKey(chatId, edit.deckId);
		if(!liveDeck.docs[docKey])
		{
			const deck = latestDeck(chatId, edit.deckId);
			if(!deck) return;
			liveDeck.open(docKey, deck);
		}
		setActiveThread(null);
		setArtifactView(null);
		sheetPanel.hide();
		setDeckView({ chatId, deckId: edit.deckId, messageId: message.id });
	};

	const openDocKey = deckView && deckView.chatId === activeChat?.id ? deckDocKey(deckView.chatId, deckView.deckId) : null;
	const openDeck = openDocKey ? liveDeck.docs[openDocKey] : undefined;
	const deckActivity = liveDeck.activity?.docKey === openDocKey ? liveDeck.activity : null;
	const lastDeckReply = activeChat?.messages.findLast((m): m is ChatTextMessage => m.kind === 'message' && m.deckEdit?.deckId === deckView?.deckId);
	const skippedLast = lastDeckReply ? liveDeck.skipped(lastDeckReply.id) : 0;
	const deckNote = skippedLast ? \`\${skippedLast} change\${skippedLast === 1 ? '' : 's'} skipped: you’d already removed what \${skippedLast === 1 ? 'it' : 'they'} would edit.\` : '';

	const artifactEntries = collectArtifacts(activeChat?.messages ?? []);
	const openArtifacts = artifactView && artifactView.chatId === activeChat?.id ? artifactView : null;

	const sideKey = activeThread && activeChat ? \`thread:\${activeThread.threadId}\`
		: openDocKey && openDeck ? \`deck:\${openDocKey}\`
			: sheetPanel.sideKey ?? (openArtifacts ? \`artifacts:\${openArtifacts.chatId}\` : null);
	const expanded = !isMobile && sideKey !== null && expandedKey === sideKey;

	const handleToggleExpand = () => setExpandedKey(expanded ? null : sideKey);

	const handleSnapExpand = () => {
		setExpandedKey(sideKey);
		requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-expand-toggle]')?.focus());
	};

	// The chat column is display:none while expanded, so a trigger inside it can only take focus after the re-render.
	const focusAfterClose = (id: string) => {
		setExpandedKey(null);
		if(expanded) requestAnimationFrame(() => document.getElementById(id)?.focus());
		else document.getElementById(id)?.focus();
	};

	const handleCloseDeck = () => {
		const messageId = deckView?.messageId;
		setDeckView(null);
		if(messageId !== undefined) focusAfterClose(\`deck-open-\${messageId}\`);
	};

	// On desktop the chat sits beside the slides, so the panel stays open; on mobile the sheet closes to land on the chat.
	const handleAskAboutSlide = (context: DeckAskContext) => {
		if(!deckView || !openDeck) return;
		const reference = slideReference(context, { deckId: deckView.deckId, title: openDeck.title });
		setSlideRefs((prev) => (prev.some((r) => r.detail === reference.detail) ? prev : [...prev, reference]));
		if(isMobile) setDeckView(null);
		window.setTimeout(() => document.getElementById(MAIN_COMPOSER_ID)?.querySelector('input')?.focus(), isMobile ? DRAWER_EXIT_MS : 0);
	};

	const handleOpenArtifacts = (chatId: string, key: string | null, triggerId: string) => {
		setActiveThread(null);
		setDeckView(null);
		sheetPanel.hide();
		setArtifactView({ chatId, key, triggerId });
	};

	const handleCloseArtifacts = () => {
		const triggerId = artifactView?.triggerId;
		setArtifactView(null);
		if(triggerId) focusAfterClose(triggerId);
	};

	const handleCloseSheet = () => {
		const messageId = sheetPanel.messageId;
		sheetPanel.hide();
		if(messageId !== undefined) focusAfterClose(\`sheet-open-\${messageId}\`);
	};

	const handleOpenDocumentEntry = (entry: ArtifactEntry) => {
		if(entry.kind === 'sheet')
		{
			sheetPanel.openEntry(entry);
			return;
		}
		const message = activeChat?.messages.find((m): m is ChatTextMessage => m.kind === 'message' && m.id === entry.messageId);
		if(activeChat && message) handleOpenDeck(activeChat.id, message);
	};

	const renderDeckCard = (chatId: string, message: ChatTextMessage, previous: ChatMessage[]) => {
		const edit = message.deckEdit;
		if(!edit) return null;
		const deck = liveDeck.docs[deckDocKey(chatId, edit.deckId)] ?? resolveDeckEdit(edit, previous)?.final;
		const slides = deck?.slides.length ?? 0;
		const skipped = liveDeck.skipped(message.id);
		const detail = liveDeck.activity?.messageId === message.id ? \`\${liveDeck.activity.label}…\`
			: !deck ? 'Couldn’t apply these edits'
				: \`\${slides} slide\${slides === 1 ? '' : 's'}\${skipped ? \` · \${skipped} change\${skipped === 1 ? '' : 's'} skipped\` : ''}\`;

		return (
			<DeckCard
				messageId={message.id}
				title={deck?.title || edit.title}
				detail={detail}
				onOpen={() => handleOpenDeck(chatId, message)}
			/>
		);
	};

	const handleOpenThread = (chatId: string, threadId: string, rootMessageId: number) => {
		setDeckView(null);
		sheetPanel.hide();
		setArtifactView(null);
		setActiveThread({ chatId, threadId, rootMessageId });
		if(activeId !== chatId) setActiveId(chatId);
		setThreadDraft('');
		setThreadAttachedFiles([]);
		if(threadMessages[threadId]) return;
		setLoadingThreadId(threadId);
		fetchThread(threadId)
			.then((messages) =>
			{
				if(mountedRef.current) setThreadMessages((prev) => ({ ...prev, [threadId]: messages }));
			})
			.catch(() => undefined)
			.finally(() =>
			{
				if(mountedRef.current) setLoadingThreadId((prev) => (prev === threadId ? null : prev));
			});
	};

	const handleStartThread = (chatId: string, rootMessageId: number) => {
		const chat = chats.find((c) => c.id === chatId);
		const rootMessage = chat?.messages.find((m) => m.id === rootMessageId);
		const snippet = rootMessage && rootMessage.kind === 'message' ? rootMessage.text.replace(/\\s+/g, ' ').trim().slice(0, 60) : 'New thread';
		const threadId = \`thread-new-\${nextThreadId.current++}\`;
		const threadRef: ThreadRef = { id: threadId, rootMessageId, snippet, createdAt: 'Just now', replyCount: 0 };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, threadRefs: [...c.threadRefs, threadRef] } : c)));
		setThreadMessages((prev) => ({ ...prev, [threadId]: [] }));
		setDeckView(null);
		sheetPanel.hide();
		setArtifactView(null);
		setActiveThread({ chatId, threadId, rootMessageId });
		setThreadDraft('');
		setThreadAttachedFiles([]);
	};

	const handleCloseThread = () => {
		const rootMessageId = activeThread?.rootMessageId;
		setActiveThread(null);
		if(rootMessageId !== undefined) focusAfterClose(\`thread-trigger-\${rootMessageId}\`);
	};

	const handleThreadStop = () => {
		if(activeThread) threadConversation.stop(activeThread.threadId);
	};

	const handleThreadSubmit = (e: FormEvent) => {
		e.preventDefault();
		if(!activeThread || isThreadGenerating) return;
		const text = threadDraft.trim();
		if(!text && threadAttachedFiles.length === 0) return;

		const attachments: MessageAttachment[] = threadAttachedFiles.map((file) => ({ name: file.name }));
		threadConversation.submit(activeThread.threadId, text, attachments);

		setThreadDraft('');
		setThreadAttachedFiles([]);
	};

	const handleThreadStreamComplete = (messageId: number) => {
		if(activeThread) threadConversation.streamComplete(activeThread.threadId, messageId);
	};

	const handleThreadQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeThread) return;
		threadConversation.questionnaireAnswer(activeThread.threadId, messageId, value);
	};

	const setThreadVersionIndex = (threadId: string, messageId: number, index: number) => threadConversation.setVersionIndex(threadId, messageId, index);

	const regenerateThreadMessage = (messageId: number, promptOverride?: string) => {
		if(activeThread) threadConversation.regenerate(activeThread.threadId, messageId, promptOverride);
	};

	const handleResendThreadEdit = (messageId: number) => {
		const text = editDraft.trim();
		if(!text || !activeThread) return;
		threadConversation.resendEdit(activeThread.threadId, messageId, text);
		setEditingMessageId(null);
		setEditDraft('');
	};

	const handleCopyReply = async (text: string) => {
		try
		{
			await navigator.clipboard.writeText(text);
		}
		catch
		{
			return;
		}
		if(!mountedRef.current) return;
		setCopyNoticeVisible(true);
		clearTimeout(copyNoticeTimerRef.current);
		copyNoticeTimerRef.current = setTimeout(() => setCopyNoticeVisible(false), COPY_NOTICE_MS);
	};

	const handleCommand = (command: CommandOption) => {
		if(command.name === 'new')
		{
			handleNewChat();
			return;
		}

		if(command.name === 'slides')
		{
			setDraft('');
			sendText(SLIDES_PROMPT, []);
			return;
		}

		if(!activeChat) return;
		const chatId = activeChat.id;

		if(command.name === 'rename')
		{
			setEditingId(activeChat.id);
			return;
		}

		if(command.name === 'delete')
		{
			setChatPendingDeletion(activeChat);
			return;
		}

		if(command.name === 'edit')
		{
			const latestUserMessage = activeChat.messages.find((m): m is ChatTextMessage => m.kind === 'message' && m.id === lastUserMessageId);
			if(latestUserMessage) handleStartEditMessage(latestUserMessage);
			return;
		}

		if(command.name === 'copy' || command.name === 'retry')
		{
			const latestReply = [...activeChat.messages].reverse().find((m): m is ChatTextMessage => m.kind === 'message' && m.sender === 'ai');
			if(!latestReply) return;

			if(command.name === 'copy')
			{
				handleCopyReply(latestReply.text);
				return;
			}

			const hasThread = activeChat.threadRefs.some((t) => t.rootMessageId === latestReply.id);
			const canRegenerate = !hasThread && hasPrecedingUserMessage(activeChat.messages, activeChat.messages.indexOf(latestReply));
			if(canRegenerate) regenerateMessage(chatId, latestReply.id);
			return;
		}

		if(command.name === 'thread')
		{
			const latest = [...activeChat.messages].reverse().find((m) => m.kind === 'message');
			if(!latest) return;
			const threadRef = activeChat.threadRefs.find((t) => t.rootMessageId === latest.id);
			if(threadRef) handleOpenThread(chatId, threadRef.id, latest.id);
			else handleStartThread(chatId, latest.id);
			return;
		}

		const commandMessage: ChatMessage = { id: nextMessageIdRef.current++, kind: 'message', sender: 'user', text: \`/\${command.name}\` };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, commandMessage] } : c)));

		if(command.name === 'compact')
		{
			const count = activeChat.messages.length;
			if(count === 0) return;
			const checkpoint: ChatMessage = {
				id:    nextMessageIdRef.current++,
				kind:  'checkpoint',
				label: \`Compacted · \${count} message\${count === 1 ? '' : 's'} summarized\`,
			};
			setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, checkpoint] } : c)));
			return;
		}

		if(command.name === 'clear') setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [] } : c)));
	};

	const renderThreadTrailing = (msg: ChatTextMessage, index: number) => {
		if(!activeThread) return null;
		const { threadId } = activeThread;
		const messages = threadMessages[threadId] ?? [];
		const isAi = msg.sender === 'ai';

		return (
			<MessageActionsRow
				align={msg.sender === 'user' ? 'end' : 'start'}
				messageId={msg.id}
				text={msg.text}
				showReplyTrigger={false}
				onReply={() => {}}
				showEdit={msg.sender === 'user' && msg.id === findLastUserMessageId(messages) && !isThreadGenerating}
				onEdit={() => handleStartEditMessage(msg)}
				showRefresh={isAi && !isThreadGenerating && hasPrecedingUserMessage(messages, index)}
				regenerating={threadConversation.regeneratingMessageId === msg.id}
				onRefresh={() => regenerateThreadMessage(msg.id)}
				versionNav={buildVersionNav(msg, (i) => setThreadVersionIndex(threadId, msg.id, i))}
			/>
		);
	};

	const renderRootMessage = (m: ChatMessage) => (
		<ChatMessageRow
			key={m.id}
			message={m}
			onStreamComplete={handleMainStreamComplete}
			onQuestionnaireAnswer={handleQuestionnaireAnswer}
			renderTrailing={(msg) => (
				<MessageActionsRow
					align={msg.sender === 'user' ? 'end' : 'start'}
					messageId={msg.id}
					text={msg.text}
					showReplyTrigger={false}
					onReply={() => {}}
					showEdit={false}
					onEdit={() => {}}
					showRefresh={false}
					regenerating={false}
					onRefresh={() => {}}
				/>
			)}
		/>
	);

	const renderReplyMessage = (m: ChatMessage, index: number) => (
		<ChatMessageRow
			key={m.id}
			message={m}
			onStreamComplete={handleThreadStreamComplete}
			onQuestionnaireAnswer={handleThreadQuestionnaireAnswer}
			editing={editingMessageId === m.id}
			editDraft={editDraft}
			onEditDraftChange={setEditDraft}
			onCancelEdit={handleCancelEditMessage}
			onSubmitEdit={() => handleResendThreadEdit(m.id)}
			renderTrailing={(msg) => renderThreadTrailing(msg, index)}
		/>
	);

	const threadPanel = activeThread && activeChat ? (
		<ThreadPanel
			inDrawer={isMobile}
			title={activeChat.title}
			rootMessages={getThreadRootMessage(activeThread.chatId, activeThread.rootMessageId)}
			threadMessages={threadMessages[activeThread.threadId] ?? []}
			loading={loadingThreadId === activeThread.threadId}
			isTyping={isThreadTyping}
			composer={{
				draft:         threadDraft,
				onDraftChange: setThreadDraft,
				onSubmit:      handleThreadSubmit,
				isGenerating:  isThreadGenerating,
				onStop:        handleThreadStop,
				attachedFiles: threadAttachedFiles,
				onAttach:      setThreadAttachedFiles,
				commands:      [],
				onCommand:     () => {},
				placeholder:   'Reply in thread…',
				inputLabel:    'Thread reply',
				sendLabel:     'Send reply',
				modelPicker,
			}}
			renderRoot={renderRootMessage}
			renderReply={renderReplyMessage}
			expanded={expanded}
			onToggleExpand={handleToggleExpand}
			onClose={handleCloseThread}
		/>
	) : null;

	const chatSheets = openDocKey && openDeck ? sheetPanel.sheetsOf(activeChat?.id) : null;

	const deckPanel = chatSheets && openDocKey && openDeck ? (
		<DeckPanel
			inDrawer={isMobile}
			key={openDocKey}
			deck={openDeck}
			activity={deckActivity}
			note={deckNote}
			onChange={(next, coalesceKey) => liveDeck.change(openDocKey, next, coalesceKey)}
			history={{ undo: () => liveDeck.undo(openDocKey), redo: () => liveDeck.redo(openDocKey), canUndo: liveDeck.canUndo(openDocKey), canRedo: liveDeck.canRedo(openDocKey) }}
			expanded={expanded}
			onToggleExpand={handleToggleExpand}
			onClose={handleCloseDeck}
			onAsk={handleAskAboutSlide}
			chartData={{
				sheets:  Array.from(chatSheets, ([id, sheet]) => ({ id, title: sheet.title })),
				resolve: source => resolveSheetChart(chatSheets, source),
			}}
		/>
	) : null;

	const sheetPanelNode = sheetPanel.renderPanel({ expanded, onToggleExpand: handleToggleExpand, onClose: handleCloseSheet });

	const artifactsPanel = openArtifacts ? (
		<ArtifactsPanel
			inDrawer={isMobile}
			entries={artifactEntries}
			openKey={openArtifacts.key}
			onSelect={(key) => setArtifactView({ ...openArtifacts, key })}
			onOpenDocument={handleOpenDocumentEntry}
			expanded={expanded}
			onToggleExpand={handleToggleExpand}
			onClose={handleCloseArtifacts}
		/>
	) : null;

	return (
		<div className='w-full'>
			<div className='flex h-[32rem] w-full max-w-6xl overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border'>
				<SidebarSlot mobile={isMobile} open={sidebarOpen} onOpenChange={setSidebarOpen}>
				<Sidebar
					width={isMobile ? 'w-full' : 'w-64'}
					height='h-full'
					headerHeight='h-16'
					collapsible={!isMobile}
					collapsed={railCollapsed}
					onCollapsedChange={setSidebarCollapsed}
				>
					<SidebarHeader>
						<span className='truncate px-1 text-sm font-semibold text-text'>{APP_NAME}</span>
					</SidebarHeader>
					<SidebarTools collapsed={railCollapsed} searchRef={searchTriggerRef} onSearch={() => setSearchOpen(true)} onNewChat={handleNewChat} />
					<ChatList chats={chats} status={chatsStatus} activeId={activeId} editingId={editingId} onEditingChange={setEditingId} onSelect={handleSelectChat} onRename={handleRename} onDelete={setChatPendingDeletion} />
					<SidebarFooter>
						<ProfileCard name={displayName} modelLabel={modelLabel} collapsed={railCollapsed} onOpen={() => setSettingsOpen(true)} />
					</SidebarFooter>
				</Sidebar>
				</SidebarSlot>

				<Resizable direction='horizontal' className='flex-1 min-w-0'>
					<ResizablePanel minSize={280} className={expanded ? 'hidden' : 'flex'}>
						<div className='flex min-w-0 flex-1 flex-col'>
							{chatsStatus === 'ready' ? (
								<>
									<div className='flex h-16 items-center gap-2 border-b-[length:var(--border-width)] border-surface-border px-4'>
										{isMobile && (
											<Button variant='ghost' size='icon-sm' aria-label='Open chats' aria-haspopup='dialog' onClick={() => setSidebarOpen(true)}>
												<MenuIcon />
											</Button>
										)}
										<div className='min-w-0'>
											<h3 className='truncate text-base font-semibold text-text'>{activeChat?.title ?? 'New chat'}</h3>
											<p className='text-xs text-text-muted'>{modelLabel} model</p>
										</div>
										{activeChat && artifactEntries.length > 0 && (
											<Button
												id='artifacts-trigger'
												variant='ghost'
												size='sm'
												className='ml-auto shrink-0 gap-1.5'
												aria-haspopup='dialog'
												aria-label={\`Artifacts, \${artifactEntries.length}\`}
												onClick={() => handleOpenArtifacts(activeChat.id, null, 'artifacts-trigger')}
											>
												<FileIcon />
												<span aria-hidden='true'>{artifactEntries.length}</span>
											</Button>
										)}
									</div>
									<div className='relative flex min-h-0 flex-1 flex-col'>
										<ScrollFade ref={containerRef} direction='vertical' className='h-full' wrapperClassName='min-h-0 flex-1'>
											<div ref={contentRef} role='log' aria-label='Conversation' aria-busy={isGenerating} className='flex min-h-full shrink-0 flex-col gap-4 p-5 pb-28'>
												{!activeChat || activeChat.messages.length === 0 ? (
													<div className='flex flex-1 flex-col items-center justify-center gap-1.5 text-center'>
														<Greeting />
														<p className='text-sm text-text-muted'>Send a message to start the conversation.</p>
													</div>
												) : (
													<>
														<Divider label='Conversation starts here' />
														{activeChat.messages.map((m, index) => (
															<ChatMessageRow
																key={m.id}
																message={m}
																onStreamComplete={handleMainStreamComplete}
																onQuestionnaireAnswer={handleQuestionnaireAnswer}
																editing={editingMessageId === m.id}
																editDraft={editDraft}
																onEditDraftChange={setEditDraft}
																onCancelEdit={handleCancelEditMessage}
																onSubmitEdit={() => handleResendEdit(activeChat.id, m.id)}
																renderArtifact={(msg) => (
																<>
																	{renderDeckCard(activeChat.id, msg, activeChat.messages.slice(0, index))}
																	{sheetPanel.renderCard(activeChat.id, msg, activeChat.messages.slice(0, index))}
																	{msg.artifacts?.map((artifact) => (
																		<ArtifactCard
																			key={artifact.id}
																			artifact={artifact}
																			onOpen={() => handleOpenArtifacts(activeChat.id, artifact.id, \`artifact-open-\${artifact.id}\`)}
																		/>
																	))}
																</>
															)}
																renderTrailing={(msg) => {
																	const threadRef    = activeChat.threadRefs.find((t) => t.rootMessageId === msg.id);
																	const replyCount    = threadRef ? (threadMessages[threadRef.id]?.length ?? threadRef.replyCount) : 0;
																	const threadLoading = threadRef ? loadingThreadId === threadRef.id : false;
																	const hasThreadPill = !!threadRef && (threadLoading || replyCount > 0);
																	const isAi          = msg.sender === 'ai';
																	const isLatestUser  = msg.sender === 'user' && msg.id === lastUserMessageId;
																	const versionNav    = buildVersionNav(msg, (i) => setMessageVersionIndex(activeChat.id, msg.id, i));
																	const onReply = () => (threadRef
																		? handleOpenThread(activeChat.id, threadRef.id, msg.id)
																		: handleStartThread(activeChat.id, msg.id)
																	);

																	return (
																		<MessageActionsRow
																			align={msg.sender === 'user' ? 'end' : 'start'}
																			messageId={msg.id}
																			text={msg.text}
																			showReplyTrigger={isAi && !hasThreadPill}
																			onReply={onReply}
																			showEdit={isLatestUser && !isGenerating}
																			onEdit={() => handleStartEditMessage(msg)}
																			showRefresh={isAi && !isGenerating && !threadRef && hasPrecedingUserMessage(activeChat.messages, index)}
																			regenerating={mainConversation.regeneratingMessageId === msg.id}
																			onRefresh={() => regenerateMessage(activeChat.id, msg.id)}
																			versionNav={versionNav}
																			threadPill={hasThreadPill ? { replyCount, loading: threadLoading } : undefined}
																		/>
																	);
																}}
															/>
														))}
													</>
												)}
												{isTyping && <TypingPhrase />}
											</div>
										</ScrollFade>
										<div className='absolute inset-x-0 bottom-0 p-4'>
											<div role='status' className='empty:hidden'>
												{copyNoticeVisible && <p className='pb-1.5 text-center text-xs text-text-muted'>Copied latest reply</p>}
											</div>
											<Composer
												draft={draft}
												onDraftChange={setDraft}
												onSubmit={handleSubmit}
												isGenerating={isGenerating}
												onStop={handleStop}
												attachedFiles={attachedFiles}
												onAttach={setAttachedFiles}
												commands={COMMANDS}
												onCommand={handleCommand}
												placeholder='Message… (try /compact)'
												inputLabel='Message'
												sendLabel='Send message'
											references={slideRefs}
											onRemoveReference={(index) => setSlideRefs((prev) => prev.filter((_, i) => i !== index))}
											id={MAIN_COMPOSER_ID}
												modelPicker={modelPicker}
											/>
										</div>
									</div>
								</>
							) : (
								<div className='flex flex-1 items-center justify-center p-6 text-center'>
									{chatsStatus === 'loading' ? (
										<Spinner size='sm' />
									) : (
										<p className='text-sm text-text-muted'>Couldn’t load chats. Refresh to try again.</p>
									)}
								</div>
							)}
						</div>
					</ResizablePanel>

				{!isMobile && activeThread && activeChat && (
					<DesktopPanel label='Thread' size={THREAD_SIZE} expanded={expanded} onSnap={handleSnapExpand}>{threadPanel}</DesktopPanel>
				)}

				{!isMobile && openDocKey && openDeck && (
					<DesktopPanel label='Slides' size={DECK_SIZE} expanded={expanded} onSnap={handleSnapExpand}>{deckPanel}</DesktopPanel>
				)}

				{!isMobile && sheetPanel.isOpen && (
					<DesktopPanel label='Sheet' size={SHEET_SIZE} expanded={expanded} onSnap={handleSnapExpand}>{sheetPanelNode}</DesktopPanel>
				)}

				{!isMobile && openArtifacts && (
					<DesktopPanel label='Artifacts' size={ARTIFACTS_SIZE} expanded={expanded} onSnap={handleSnapExpand}>{artifactsPanel}</DesktopPanel>
				)}
				</Resizable>
			</div>

			{isMobile && (
				<>
					<MobilePanel label='Thread' side='right' open={Boolean(activeThread && activeChat)} onClose={handleCloseThread}>{threadPanel}</MobilePanel>
					<MobilePanel label='Slides' open={Boolean(openDocKey && openDeck)} onClose={handleCloseDeck}>{deckPanel}</MobilePanel>
					<MobilePanel label='Sheet' open={sheetPanel.isOpen} onClose={handleCloseSheet}>{sheetPanelNode}</MobilePanel>
					<MobilePanel label='Artifacts' open={Boolean(openArtifacts)} onClose={handleCloseArtifacts}>{artifactsPanel}</MobilePanel>
				</>
			)}

			<DeleteChatModal chat={chatPendingDeletion} onCancel={() => setChatPendingDeletion(null)} onConfirm={handleConfirmDelete} />

			<SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onChange={setSettings} />

			<ChatSearch
				open={searchOpen}
				onOpenChange={setSearchOpen}
				chats={chats}
				threadMessages={threadMessages}
				onSelectHit={handleSelectHit}
				returnFocusRef={searchTriggerRef}
			/>
		</div>
	);
};

export default AiChat;
`,
		dependencies: ['react-markdown', 'remark-gfm', 'remark-math'],
		registryDependencies: ['sidebar', 'scroll-fade', 'message', 'typewriter', 'attachment', 'button', 'icons', 'input', 'textarea', 'command-input', 'command-palette', 'badge', 'tooltip', 'spinner', 'collapsible', 'timeline', 'modal', 'charts', 'function-plotter', 'table', 'date-picker', 'slider', 'formula', 'code-block', 'audioplayer', 'skeleton', 'questionnaire', 'tool-call-trace', 'resizable', 'workflow-builder', 'avatar', 'select', 'switch', 'menu', 'deck-editor', 'sheet-editor', 'drawer'],
		files: [
			'AiChat/AiChat.tsx', 'AiChat/ChatMarkdown.tsx', 'AiChat/StreamingMessage.tsx', 'AiChat/ThreadPanel.tsx', 'AiChat/DeckPanel.tsx', 'AiChat/SheetPanel.tsx',
			'AiChat/ArtifactsPanel.tsx', 'AiChat/ArtifactViewer.tsx', 'AiChat/artifactKinds.tsx',
			'AiChat/Composer.tsx', 'AiChat/ModelPicker.tsx', 'AiChat/Phrases.tsx', 'AiChat/icons.tsx', 'AiChat/constants.ts', 'AiChat/messageHelpers.ts', 'AiChat/MessageRow.tsx',
			{ path: 'AiChat/types.ts', kind: 'model' },
			{ path: 'AiChat/chatApi.ts', kind: 'api' },
			{ path: 'AiChat/useConversation.ts', kind: 'hook' },
			{ path: 'AiChat/liveDocs.ts', kind: 'hook' },
			{ path: 'AiChat/useLiveDeck.ts', kind: 'hook' },
			{ path: 'AiChat/useLiveSheet.ts', kind: 'hook' },
			{ path: 'AiChat/useSheetPanel.tsx', kind: 'hook' },
			'AiChat/SettingsModal.tsx',
			'AiChat/DeleteChatModal.tsx',
			'AiChat/ChatSearch.tsx',
			'AiChat/SidebarTools.tsx',
			'AiChat/ProfileCard.tsx',
			'AiChat/ChatList.tsx',
			'AiChat/PanelSlot.tsx',
			{ path: 'AiChat/chartSource.ts', kind: 'hook' },
			{ path: 'AiChat/useIsMobile.ts', kind: 'hook' },
			{ path: 'AiChat/useStickToBottom.ts', kind: 'hook' },
			'AiChat/CLAUDE.md',
		],
		promptSnippet: `Most of your reply can just be normal GitHub-flavored markdown — the chat already
renders it: **bold**/*italic*, [links](https://example.com), \`inline code\`, fenced code blocks
(\`\`\`js ... \`\`\`, any language), bullet/numbered lists, and pipe tables all render with this
app's real UI components, not raw text. None of that needs special instructions; it's what
you already produce for any markdown-aware client.

Two things are NOT standard markdown and must be explained in the system prompt if you want
the model to use them:

1. Math formulas — inline with single dollars, block with double dollars, standard LaTeX:
   Inline: The area is $\\pi r^2$.
   Block:  $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

2. Charts — markdown has no chart syntax, so these stay a fenced code block convention.
   When a visual would genuinely help (a trend, a comparison, a breakdown) — for a quick
   fact, prefer prose or a markdown table instead — use a fenced block in one of these
   languages, containing JSON in the exact shape shown. If the request needs real data you
   don't already have, use a search or data tool first rather than inventing numbers:

   - "lineplot"   — a trend over a continuous axis (time, distance, ...)
     { "xKey": string, "series": [{ "key": string, "label": string }], "data": [{ ...one object per point, with an xKey field and a field per series key... }] }

   - "barchart"   — comparing discrete categories. Same shape as lineplot, plus an optional "stacked": true to stack series instead of grouping them
     { "xKey": string, "series": [...], "data": [...], "stacked"?: boolean }

   - "areachart"  — volume or a cumulative total over time. Same shape as barchart (including optional "stacked")
     { "xKey": string, "series": [...], "data": [...], "stacked"?: boolean }

   - "radarchart" — comparing several categories against one another, optionally across more than one series. Same shape as lineplot
     { "xKey": string, "series": [...], "data": [...] }

   - "donutchart" — a simple part-to-whole breakdown. No xKey/series — just labeled slices
     { "data": [{ "label": string, "value": number }] }

   - "math"       — plotting one or more mathematical functions of x as a graph (not a formula — use $$...$$ for that)
     { "equations": string[] }   // e.g. ["x^2 - 2", "sin(x)"] — plain math expressions in x, evaluated with mathjs syntax, no "y =" prefix

3. Media — a generated image or audio clip also has no markdown syntax, so these are fenced
   too. Only emit one once you actually have a real URL for it (e.g. after a generation
   tool call resolves) — while that's in flight, the consuming app is expected to show its
   own loading state, not you.

   - "image" — a generated or fetched image
     { "url": string, "alt": string }

   - "audio" — a generated or fetched audio clip
     { "src": string, "title"?: string }

4. Workflows — a node-based diagram of a process (an automation, a pipeline, a decision
   flow). Renders as a static, horizontal box-and-wire diagram — no toolbar, no run/simulate
   control, not draggable or editable — it's for showing the shape of a process, not
   executing or changing it. Each node has zero or more named input ports and zero or more
   named output ports; a node with no inputs is an entry point, one with no outputs is
   terminal, and a node with 2+ outputs is a branch (give each output a distinct id/label,
   e.g. "pass"/"fail"):

   - "workflow"
     {
       "nodes": [{ "id": string, "label": string, "description"?: string,
                   "inputs": [{ "id": string, "label": string }],
                   "outputs": [{ "id": string, "label": string }],
                   "position": { "x": number, "y": number } }],
       "edges": [{ "id": string, "source": string, "target": string,
                   "sourceHandle": string, "targetHandle": string }]
     }
     Space nodes left-to-right in the order they run (roughly 260px per step is readable);
     "sourceHandle"/"targetHandle" must match an id from that node's own outputs/inputs.

Example:

User: How has the median home price changed over the last few years?
Assistant: Here's the trend in median home prices over the last several years:

\`\`\`lineplot
{"xKey":"year","series":[{"key":"price","label":"Median home price"}],"data":[{"year":2019,"price":313000},{"year":2020,"price":329000},{"year":2021,"price":375000},{"year":2022,"price":395000},{"year":2023,"price":410000},{"year":2024,"price":426000}]}
\`\`\`

The chart/media fence conventions and the $...$/$$...$$ math delimiters aren't something
the model already knows to use unprompted — this block must be included in the system
prompt on every request, not just the first turn. Everything else above it is included
for completeness, not because it needs teaching.`,
	},
	{
		slug: 'team-management',
		name: 'Team management',
		category: 'Display',
		description: 'An interactive team-members admin panel with an invite Modal and a per-member remove-confirmation Modal.',
		usage: `'use client';

import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/src/components/Modal/Modal';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import { Select } from '@/src/components/Select/Select';
import Badge from '@/src/components/Badge/Badge';
import Avatar from '@/src/components/Avatar/Avatar';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import { useState } from 'react';

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Member', label: 'Member' },
  { value: 'Viewer', label: 'Viewer' },
];

const ROLE_BADGE_VARIANT = { Admin: 'default', Member: 'success', Viewer: 'outline' };

const INITIAL_MEMBERS = [
  { id: 1, name: 'Ava Thompson', email: 'ava.thompson@company.com', role: 'Admin' },
  { id: 2, name: 'Noah Martinez', email: 'noah.martinez@company.com', role: 'Member' },
  { id: 3, name: 'Priya Sharma', email: 'priya.sharma@company.com', role: 'Member' },
  { id: 4, name: 'Liam Chen', email: 'liam.chen@company.com', role: 'Viewer' },
  { id: 5, name: 'Sofia Rossi', email: 'sofia.rossi@company.com', role: 'Viewer' },
];

export default function TeamManagement() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [memberPendingRemoval, setMemberPendingRemoval] = useState(null);

  const handleInviteOpenChange = (open) => {
    setInviteOpen(open);
    if (!open) {
      setInviteEmail('');
      setInviteRole('Member');
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    setMembers((prev) => [...prev, { id: Date.now(), name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole }]);
    handleInviteOpenChange(false);
  };

  const handleConfirmRemove = () => {
    if (!memberPendingRemoval) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberPendingRemoval.id));
    setMemberPendingRemoval(null);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-text">Team members</h3>
          <p className="text-sm text-text-muted">Manage who has access to this workspace.</p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>Invite member</Button>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col divide-y divide-surface-border">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar name={member.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{member.name}</p>
                <p className="text-xs text-text-muted truncate">{member.email}</p>
              </div>
              <Badge variant={ROLE_BADGE_VARIANT[member.role]}>{member.role}</Badge>
              <Button variant="ghost" size="icon" aria-label={\`Remove \${member.name}\`}
                onClick={() => setMemberPendingRemoval(member)} className="text-text-muted hover:text-danger">
                {/* trash icon */}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <Modal open={inviteOpen} onOpenChange={handleInviteOpenChange}>
        <ModalClose />
        <ModalHeader><ModalTitle>Invite member</ModalTitle></ModalHeader>
        <ModalContent className="flex flex-col gap-4">
          <Input type="email" label="Email" placeholder="name@company.com" value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)} />
          <Select label="Role" options={ROLE_OPTIONS} value={inviteRole} onChange={setInviteRole} />
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => handleInviteOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSendInvite}>Send invite</Button>
        </ModalFooter>
      </Modal>

      <Modal open={memberPendingRemoval !== null} onOpenChange={(open) => !open && setMemberPendingRemoval(null)}>
        <ModalClose />
        <ModalHeader><ModalTitle>Remove member</ModalTitle></ModalHeader>
        <ModalContent>{\`Remove \${memberPendingRemoval?.name} from the team? This can't be undone.\`}</ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setMemberPendingRemoval(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirmRemove}>Remove</Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
}`,
		dependencies: [],
		registryDependencies: ['modal', 'card', 'select', 'badge', 'avatar', 'button', 'input'],
		files: ['TeamManagement/TeamManagement.tsx'],
	},
	{
		slug: 'project-hub',
		name: 'Project hub',
		category: 'Dashboards',
		description: 'A projects workspace with an AiChat-style layout: a left sidebar (new-project button, an Overview link, and the project list) next to a main panel that shows either a portfolio-wide Overview (stats plus a pooled "All tasks" board across every project) or a selected project’s page, reached by clicking it in the sidebar or via its "Projects / {name}" breadcrumb: editable members and related links, plus the project’s own Kanban board, where clicking a card opens a Jira-style popup to edit its title, tag, and description, or delete it, persisted back onto the project. Includes an AI task drafter that turns a plain-language prompt into a suggested card, shown with a typewriter reveal, for you to review before it lands on the board. Simulated locally, no real model calls.',
		usage: `'use client';

import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/src/components/Modal/Modal';
import KanbanBoard, { type KanbanColumnData, type KanbanCardData } from '@/src/components/Kanban/Kanban';
import { Sidebar, SidebarButton, SidebarHeader, SidebarSection } from '@/src/components/Sidebar/Sidebar';
import { Select } from '@/src/components/Select/Select';
import TextShimmer from '@/src/components/TextShimmer/TextShimmer';
import Typewriter from '@/src/components/Typewriter/Typewriter';
import DatePicker from '@/src/components/DatePicker/DatePicker';
import Breadcrumb from '@/src/components/Breadcrumb/Breadcrumb';
import Textarea from '@/src/components/Textarea/Textarea';
import Checkbox from '@/src/components/Checkbox/Checkbox';
import { Card, CardContent } from '@/src/components/Card/Card';
import Progress from '@/src/components/Progress/Progress';
import CountUp from '@/src/components/CountUp/CountUp';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import { useMemo, useRef, useState } from 'react';
import Avatar from '@/src/components/Avatar/Avatar';
import Input from '@/src/components/Input/Input';

type Accent = 'brand' | 'success' | 'warning' | 'danger';

interface ProjectLink {
  id: string;
  label: string;
  url: string;
}

interface ProjectData {
  id: string;
  name: string;
  description: string;
  accent: Accent;
  members: string[];
  dueDate: string;
  links: ProjectLink[];
  columns: KanbanColumnData[];
}

type AiStatus = 'idle' | 'thinking' | 'ready';

interface AiSuggestion {
  title: string;
  description: string;
  tag: string;
}

const ACCENTS: Accent[] = ['brand', 'success', 'warning', 'danger'];

const ACCENT_DOT: Record<Accent, string> = {
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const ACCENT_RING: Record<Accent, string> = {
  brand: 'ring-brand',
  success: 'ring-success',
  warning: 'ring-warning',
  danger: 'ring-danger',
};

const ACCENT_LABEL: Record<Accent, string> = {
  brand: 'Blue',
  success: 'Green',
  warning: 'Amber',
  danger: 'Red',
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const SparkleIcon = ({ className = '' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2.5c.4 3.6 1.1 6 2.2 7.3 1.2 1.2 3.7 2 7.3 2.2-3.6.4-6 1.1-7.3 2.2-1.2 1.2-2 3.7-2.2 7.3-.4-3.6-1.1-6-2.2-7.3C8.5 12.9 6 12.1 2.5 12c3.6-.4 6-1.1 7.3-2.2C10.9 8.5 11.6 6 12 2.5Z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

// KanbanCard ships no built-in edit form; this is this block's own, hand-rolled
// for the fields its cards actually use (tag, description, due date, effort
// points, and a subtask checklist).
const POINTS_OPTIONS = [
  { value: '', label: 'No estimate' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '8', label: '8' },
];

const ProjectCardDetails = ({ card, onUpdate, onDelete, onClose }) => {
  const [draftTitle, setDraftTitle] = useState(card.title);
  const [draftTag, setDraftTag] = useState(card.tag ?? '');
  const [draftDescription, setDraftDescription] = useState(card.description ?? '');
  const [draftDueDate, setDraftDueDate] = useState(card.dueDate ?? '');
  const [draftPoints, setDraftPoints] = useState(card.points !== undefined ? String(card.points) : '');
  const [draftSubtasks, setDraftSubtasks] = useState(card.subtasks ?? []);
  const [newSubtaskLabel, setNewSubtaskLabel] = useState('');
  const subtaskCounterRef = useRef(0);

  const handleAddSubtask = () => {
    const label = newSubtaskLabel.trim();
    if (!label) return;
    subtaskCounterRef.current += 1;
    setDraftSubtasks((prev) => [...prev, { id: \`subtask-\${subtaskCounterRef.current}\`, label, done: false }]);
    setNewSubtaskLabel('');
  };

  const toggleSubtask = (id) => {
    setDraftSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, done: !s.done } : s));
  };

  const removeSubtask = (id) => {
    setDraftSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    const title = draftTitle.trim();
    if (!title) return;
    onUpdate({
      ...card,
      title,
      tag: draftTag.trim() || undefined,
      description: draftDescription.trim() || undefined,
      dueDate: draftDueDate || undefined,
      points: draftPoints ? Number(draftPoints) : undefined,
      subtasks: draftSubtasks.length > 0 ? draftSubtasks : undefined,
    });
  };

  return (
    <>
      <ModalClose />
      <ModalHeader>
        <ModalTitle>Edit card</ModalTitle>
      </ModalHeader>
      <ModalContent className="flex flex-col gap-4">
        <Input
          label="Title"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
        />
        <Input label="Tag" placeholder="Optional" value={draftTag} onChange={(e) => setDraftTag(e.target.value)} />
        <Textarea
          label="Description"
          placeholder="Optional"
          rows={4}
          value={draftDescription}
          onChange={(e) => setDraftDescription(e.target.value)}
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <DatePicker
              label="Due date"
              value={draftDueDate ? new Date(draftDueDate) : null}
              onChange={(date) => setDraftDueDate(date.toISOString())}
            />
            {draftDueDate && (
              <button
                type="button"
                onClick={() => setDraftDueDate('')}
                className="self-start text-xs text-text-muted hover:text-text focus:outline-none focus-visible:underline"
              >
                Clear due date
              </button>
            )}
          </div>
          <Select label="Points" options={POINTS_OPTIONS} value={draftPoints} onChange={setDraftPoints} className="flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text">Related items</span>

          {draftSubtasks.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {draftSubtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center gap-2">
                  <Checkbox checked={subtask.done} onChange={() => toggleSubtask(subtask.id)} aria-label={subtask.label} />
                  <span className={\`flex-1 text-sm \${subtask.done ? 'text-text-muted line-through' : 'text-text'}\`}>
                    {subtask.label}
                  </span>
                  <button
                    type="button"
                    aria-label={\`Remove \${subtask.label}\`}
                    onClick={() => removeSubtask(subtask.id)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-muted hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring"
                  >
                    <CloseIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-1.5">
            <Input
              value={newSubtaskLabel}
              onChange={(e) => setNewSubtaskLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
              placeholder="Add a related item"
              aria-label="Add a related item"
              className="flex-1"
            />
            <Button size="icon-sm" variant="secondary" aria-label="Add related item" onClick={handleAddSubtask} disabled={!newSubtaskLabel.trim()}>
              <PlusIcon />
            </Button>
          </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="destructive" size="sm" className="mr-auto" onClick={() => onDelete(card.id)}>Delete</Button>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={!draftTitle.trim()}>Save</Button>
      </ModalFooter>
    </>
  );
};

const TAG_KEYWORDS = [
  { keywords: ['bug', 'fix', 'broken', 'crash'], tag: 'Bug' },
  { keywords: ['design', 'ui', 'ux', 'layout'], tag: 'Design' },
  { keywords: ['test', 'qa', 'coverage'], tag: 'QA' },
  { keywords: ['doc', 'write', 'copy', 'content'], tag: 'Docs' },
  { keywords: ['api', 'backend', 'server', 'database'], tag: 'Engineering' },
];

const pickTag = (prompt) => {
  const lower = prompt.toLowerCase();
  const match = TAG_KEYWORDS.find(({ keywords }) => keywords.some((word) => lower.includes(word)));
  return match?.tag ?? 'Task';
};

const draftTaskFromPrompt = (prompt) => {
  const trimmed = prompt.trim().replace(/[.?!]+$/, '');
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const title = capitalized.length > 72 ? \`\${capitalized.slice(0, 69)}...\` : capitalized;

  return {
    title,
    description: \`Drafted from your prompt: "\${prompt.trim()}". Review scope and assign before starting.\`,
    tag: pickTag(prompt),
  };
};

const getDefaultColumns = () => [
  { id: 'todo', title: 'To do', cards: [] },
  { id: 'in-progress', title: 'In progress', cards: [] },
  { id: 'review', title: 'Review', cards: [] },
  { id: 'done', title: 'Done', cards: [] },
];

const INITIAL_PROJECTS = [
  {
    id: 'marketing-site',
    name: 'Marketing site redesign',
    description: 'Refresh the public marketing site with the new brand system and a faster page-build pipeline.',
    accent: 'brand',
    members: ['Ava Thompson', 'Noah Martinez', 'Priya Sharma'],
    dueDate: 'Sep 12',
    links: [
      { id: 'ms-link-1', label: 'Design file', url: 'https://www.figma.com' },
      { id: 'ms-link-2', label: 'Staging site', url: 'https://vercel.com' },
    ],
    columns: [
      { id: 'todo', title: 'To do', cards: [
        { id: 'ms-1', title: 'Rewrite homepage hero copy', tag: 'Copy' },
        { id: 'ms-2', title: 'Audit third-party scripts for perf', tag: 'Engineering' },
      ] },
      { id: 'in-progress', title: 'In progress', cards: [
        {
          id: 'ms-3', title: 'Build new pricing page layout', description: 'Match the updated tier structure from the pricing block.', tag: 'Design',
          points: 5, dueDate: '2026-09-10T12:00:00.000Z',
          subtasks: [
            { id: 'ms-3-sub-1', label: 'Wire up new tier cards', done: true },
            { id: 'ms-3-sub-2', label: 'Connect billing toggle', done: false },
            { id: 'ms-3-sub-3', label: 'QA responsive breakpoints', done: false },
          ],
        },
      ] },
      { id: 'review', title: 'Review', cards: [
        { id: 'ms-4', title: 'Dark mode pass on the docs shell', tag: 'Design', points: 3 },
      ] },
      { id: 'done', title: 'Done', cards: [
        { id: 'ms-5', title: 'Migrate blog to the new CMS', tag: 'Engineering' },
        { id: 'ms-6', title: 'Ship updated favicon & OG images', tag: 'Design' },
      ] },
    ],
  },
  {
    id: 'mobile-app-v2',
    name: 'Mobile app v2',
    description: 'Native rebuild of the mobile app with offline support and a redesigned onboarding flow.',
    accent: 'success',
    members: ['Liam Chen', 'Sofia Rossi', 'Ethan Brooks', 'Maya Patel'],
    dueDate: 'Aug 30',
    links: [
      { id: 'mv-link-1', label: 'Repo', url: 'https://github.com' },
      { id: 'mv-link-2', label: 'Design file', url: 'https://www.figma.com' },
    ],
    columns: [
      { id: 'todo', title: 'To do', cards: [
        { id: 'mv-1', title: 'Wire up push notification opt-in', tag: 'Engineering' },
      ] },
      { id: 'in-progress', title: 'In progress', cards: [
        {
          id: 'mv-2', title: 'Offline sync for saved items', description: 'Cache last-known state and reconcile on reconnect.', tag: 'Engineering',
          points: 8, dueDate: '2026-08-29T12:00:00.000Z',
          subtasks: [
            { id: 'mv-2-sub-1', label: 'Local cache write-through', done: true },
            { id: 'mv-2-sub-2', label: 'Conflict resolution on reconnect', done: true },
            { id: 'mv-2-sub-3', label: 'Offline banner UI', done: false },
          ],
        },
      ] },
      { id: 'review', title: 'Review', cards: [
        { id: 'mv-3', title: 'New onboarding carousel', tag: 'Design' },
      ] },
      { id: 'done', title: 'Done', cards: [
        { id: 'mv-4', title: 'Biometric login', tag: 'Engineering' },
        { id: 'mv-5', title: 'Redesign tab bar icons', tag: 'Design' },
        { id: 'mv-6', title: 'App store screenshots refresh', tag: 'Marketing' },
      ] },
    ],
  },
  {
    id: 'q3-sprint',
    name: 'Q3 growth sprint',
    description: 'A focused two-week sprint to test onboarding and pricing experiments before the Q3 close.',
    accent: 'warning',
    members: ['Jordan Park', 'Riley Yu'],
    dueDate: 'in 4 days',
    links: [
      { id: 'q3-link-1', label: 'Experiment doc', url: 'https://www.notion.so' },
    ],
    columns: [
      { id: 'todo', title: 'To do', cards: [
        { id: 'q3-1', title: 'Set up A/B test for signup flow', tag: 'Engineering' },
        { id: 'q3-2', title: 'Draft experiment brief', tag: 'Docs' },
        { id: 'q3-3', title: 'Segment churn-risk cohort', tag: 'Research' },
      ] },
      { id: 'in-progress', title: 'In progress', cards: [
        { id: 'q3-4', title: 'Build referral incentive banner', tag: 'Design', points: 2, dueDate: '2026-08-30T12:00:00.000Z' },
      ] },
      { id: 'review', title: 'Review', cards: [] },
      { id: 'done', title: 'Done', cards: [
        { id: 'q3-5', title: 'Instrument funnel analytics', tag: 'Engineering' },
      ] },
    ],
  },
  {
    id: 'api-migration',
    name: 'API v3 migration',
    description: 'Move all internal services off the deprecated v2 API before it sunsets at the end of the quarter.',
    accent: 'danger',
    members: ['Casey Diaz', 'Drew Nolan'],
    dueDate: 'Overdue',
    links: [
      { id: 'am-link-1', label: 'Repo', url: 'https://github.com' },
      { id: 'am-link-2', label: 'Runbook', url: 'https://www.notion.so' },
    ],
    columns: [
      { id: 'todo', title: 'To do', cards: [
        { id: 'am-1', title: 'Migrate billing service', tag: 'Bug' },
        { id: 'am-2', title: 'Update webhook signature verification', tag: 'Bug' },
      ] },
      { id: 'in-progress', title: 'In progress', cards: [
        {
          id: 'am-3', title: 'Rewrite rate-limit middleware', tag: 'Engineering',
          points: 13, dueDate: '2026-09-01T12:00:00.000Z',
          subtasks: [
            { id: 'am-3-sub-1', label: 'Design token-bucket algorithm', done: true },
            { id: 'am-3-sub-2', label: 'Migrate existing callers', done: false },
          ],
        },
      ] },
      { id: 'review', title: 'Review', cards: [
        { id: 'am-4', title: 'Deprecation notice for partner docs', tag: 'Docs' },
      ] },
      { id: 'done', title: 'Done', cards: [] },
    ],
  },
];

const getProjectStats = (project) => {
  const totalTasks = project.columns.reduce((sum, col) => sum + col.cards.length, 0);
  const doneTasks = project.columns.find((col) => col.id === 'done')?.cards.length ?? 0;
  return { totalTasks, doneTasks };
};

const BOARD_COLUMN_DEFS = [
  { id: 'todo', title: 'To do' },
  { id: 'in-progress', title: 'In progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

function StatTile({ label, value, suffix = '', progress }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="text-2xl font-semibold text-text">
          <CountUp value={value} suffix={suffix} duration={900} />
        </span>
        {progress !== undefined && <Progress value={progress} max={100} size="sm" />}
      </CardContent>
    </Card>
  );
}

export default function ProjectHub() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [boardKey, setBoardKey] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAccent, setNewProjectAccent] = useState('brand');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStatus, setAiStatus] = useState('idle');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiTitleRevealed, setAiTitleRevealed] = useState(false);
  const aiTimeoutRef = useRef(null);

  const [newMemberName, setNewMemberName] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const idCounterRef = useRef(0);
  const nextId = (prefix) => {
    idCounterRef.current += 1;
    return \`\${prefix}-\${idCounterRef.current}\`;
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  const overallStats = useMemo(() => {
    const totalTasks = projects.reduce((sum, p) => sum + p.columns.reduce((s, col) => s + col.cards.length, 0), 0);
    const doneTasks = projects.reduce((sum, p) => sum + (p.columns.find((col) => col.id === 'done')?.cards.length ?? 0), 0);
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    return { totalTasks, doneTasks, completionRate };
  }, [projects]);

  const allTasksColumns = useMemo(() => (
    BOARD_COLUMN_DEFS.map(({ id, title }) => ({
      id,
      title,
      // Cross-project view: swap each card's tag for its project name so it's
      // clear at a glance which project a task belongs to once tasks are pooled.
      cards: projects.flatMap((project) => {
        const column = project.columns.find((col) => col.id === id);
        return (column?.cards ?? []).map((card) => ({ ...card, tag: project.name }));
      }),
    }))
  ), [projects]);

  const resetAiComposer = () => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    setAiPrompt('');
    setAiStatus('idle');
    setAiSuggestion(null);
    setAiTitleRevealed(false);
  };

  const resetProjectEditors = () => {
    setNewMemberName('');
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const openProject = (id) => {
    setActiveProjectId(id);
    setBoardKey((k) => k + 1);
    resetAiComposer();
    resetProjectEditors();
  };

  const backToOverview = () => {
    setActiveProjectId(null);
    resetAiComposer();
    resetProjectEditors();
  };

  const updateActiveProject = (updater) => {
    if (!activeProjectId) return;
    setProjects((prev) => prev.map((p) => p.id === activeProjectId ? updater(p) : p));
  };

  const handleAddMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    updateActiveProject((p) => p.members.includes(name) ? p : { ...p, members: [...p.members, name] });
    setNewMemberName('');
  };

  const handleRemoveMember = (name) => {
    updateActiveProject((p) => ({ ...p, members: p.members.filter((m) => m !== name) }));
  };

  const handleAddLink = () => {
    const label = newLinkLabel.trim();
    const url = newLinkUrl.trim();
    if (!label || !url) return;
    updateActiveProject((p) => ({ ...p, links: [...p.links, { id: nextId('link'), label, url }] }));
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (id) => {
    updateActiveProject((p) => ({ ...p, links: p.links.filter((l) => l.id !== id) }));
  };

  const handleCreateOpenChange = (open) => {
    setCreateOpen(open);
    if (!open) {
      setNewProjectName('');
      setNewProjectAccent('brand');
    }
  };

  const handleCreateProject = () => {
    const name = newProjectName.trim();
    if (!name) return;

    const project = {
      id: nextId('project'),
      name,
      description: 'A freshly created project. Add a description and start planning.',
      accent: newProjectAccent,
      members: [],
      dueDate: 'No due date yet',
      links: [],
      columns: getDefaultColumns(),
    };

    setProjects((prev) => [project, ...prev]);
    setBoardKey((k) => k + 1);
    handleCreateOpenChange(false);
  };

  const handleGenerateTask = () => {
    const prompt = aiPrompt.trim();
    if (!prompt || aiStatus === 'thinking') return;

    setAiStatus('thinking');
    setAiSuggestion(null);
    setAiTitleRevealed(false);

    aiTimeoutRef.current = setTimeout(() => {
      aiTimeoutRef.current = null;
      setAiSuggestion(draftTaskFromPrompt(prompt));
      setAiStatus('ready');
    }, 1100);
  };

  const handleAddSuggestion = () => {
    const targetProjectId = activeProjectId;
    if (!aiSuggestion || !targetProjectId) return;

    const card = { id: nextId('ai'), title: aiSuggestion.title, description: aiSuggestion.description, tag: aiSuggestion.tag };

    setProjects((prev) => prev.map((p) => {
      if (p.id !== targetProjectId) return p;
      return { ...p, columns: p.columns.map((col, index) => index === 0 ? { ...col, cards: [card, ...col.cards] } : col) };
    }));

    // KanbanBoard owns its drag state internally once mounted; bumping the key
    // remounts it with the updated columns so the new card actually appears.
    setBoardKey((k) => k + 1);
    resetAiComposer();
  };

  let mainContent;

  if (activeProject) {
    const { totalTasks, doneTasks } = getProjectStats(activeProject);

    mainContent = (
      <div className="flex flex-col gap-6 w-full">
        <Breadcrumb items={[{ label: 'Projects', onClick: backToOverview }, { label: activeProject.name }]} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className={\`h-2.5 w-2.5 shrink-0 rounded-full \${ACCENT_DOT[activeProject.accent]}\`} aria-hidden="true" />
              <h2 className="text-xl font-semibold text-text truncate">{activeProject.name}</h2>
            </div>
            <p className="text-sm text-text-muted max-w-lg">{activeProject.description}</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end shrink-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
              {activeProject.members.map((name) => (
                <span key={name} className="inline-flex items-center gap-1.5 rounded-full border-[length:var(--border-width)] border-surface-border bg-surface-hover py-1 pl-1 pr-1.5">
                  <Avatar name={name} size="sm" />
                  <span className="text-xs text-text">{name}</span>
                  <button type="button" aria-label={\`Remove \${name}\`} onClick={() => handleRemoveMember(name)}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring">
                    <CloseIcon />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <Input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
                placeholder="Add member" aria-label="Add a team member" className="w-32" />
              <Button size="icon-sm" variant="secondary" aria-label="Add member" onClick={handleAddMember} disabled={!newMemberName.trim()}>
                <PlusIcon />
              </Button>
            </div>

            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <CalendarIcon />
              Due {activeProject.dueDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Progress value={doneTasks} max={Math.max(totalTasks, 1)} size="sm" className="max-w-xs" />
          <span className="text-xs text-text-muted whitespace-nowrap">{doneTasks} of {totalTasks} done</span>
        </div>

        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-4">
          <h3 className="text-sm font-semibold text-text">Related links</h3>

          {activeProject.links.length > 0 && (
            <ul className="flex flex-col gap-2">
              {activeProject.links.map((link) => (
                <li key={link.id} className="flex items-center justify-between gap-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-2 text-sm text-brand hover:underline focus:outline-none focus-visible:underline">
                    <LinkIcon />
                    <span className="truncate">{link.label}</span>
                  </a>
                  <button type="button" aria-label={\`Remove link \${link.label}\`} onClick={() => handleRemoveLink(link.id)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring">
                    <CloseIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
              placeholder="Label, e.g. Figma file" aria-label="Link label" className="sm:flex-1" />
            <Input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
              placeholder="https://…" aria-label="Link URL" className="sm:flex-1" />
            <Button size="sm" variant="secondary" onClick={handleAddLink} disabled={!newLinkLabel.trim() || !newLinkUrl.trim()}>
              <PlusIcon />
              Add
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-brand/25 bg-brand/5 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/15 text-brand">
              <SparkleIcon />
            </span>
            <h3 className="text-sm font-semibold text-text">Draft a task with AI</h3>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateTask(); } }}
              placeholder='Describe a task, e.g. "add empty states to the billing page"'
              aria-label="Describe a task for AI to draft" disabled={aiStatus === 'thinking'} className="flex-1" />
            <Button size="sm" onClick={handleGenerateTask} loading={aiStatus === 'thinking'} disabled={!aiPrompt.trim() || aiStatus === 'thinking'}>
              <SparkleIcon />
              Generate task
            </Button>
          </div>

          {aiStatus === 'thinking' && (
            <div className="flex items-center gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface-panel px-3 py-2.5">
              <span className="text-brand motion-safe:animate-pulse">
                <SparkleIcon />
              </span>
              <TextShimmer className="text-sm">Drafting a task from your prompt…</TextShimmer>
            </div>
          )}

          {aiStatus === 'ready' && aiSuggestion && (
            <div className="flex flex-col gap-2 rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{aiSuggestion.tag}</Badge>
                <span className="text-xs text-text-muted">AI suggestion, adds to To do</span>
              </div>
              <p className="text-sm font-medium text-text">
                <Typewriter text={aiSuggestion.title} speed={16} onComplete={() => setAiTitleRevealed(true)} />
              </p>
              <p className={\`text-xs text-text-muted motion-safe:transition-opacity motion-safe:duration-[var(--duration-base)] \${aiTitleRevealed ? 'opacity-100' : 'opacity-0'}\`}>
                {aiSuggestion.description}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" onClick={handleAddSuggestion}>Add to board</Button>
                <Button size="sm" variant="ghost" onClick={resetAiComposer}>Discard</Button>
              </div>
            </div>
          )}

          <p className="text-[11px] text-text-subtle">Simulated locally, wire this up to your own model call.</p>
        </div>

        <KanbanBoard
          key={boardKey}
          initialColumns={activeProject.columns}
          renderCardDetails={ProjectCardDetails}
          onCardUpdate={(updated) => updateActiveProject((p) => ({
            ...p,
            columns: p.columns.map((col) => ({ ...col, cards: col.cards.map((c) => c.id === updated.id ? updated : c) })),
          }))}
          onCardDelete={(id) => updateActiveProject((p) => ({
            ...p,
            columns: p.columns.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== id) })),
          }))}
        />
      </div>
    );
  } else {
    mainContent = (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-text">Overview</h2>
          <p className="text-sm text-text-muted">A snapshot across every project.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Active projects" value={projects.length} />
          <StatTile label="Total tasks" value={overallStats.totalTasks} />
          <StatTile label="Completed" value={overallStats.doneTasks} />
          <StatTile label="Completion" value={overallStats.completionRate} suffix="%" progress={overallStats.completionRate} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-text uppercase tracking-wide">All tasks</h3>
            <p className="text-xs text-text-muted">Every task across every project, tagged by project.</p>
          </div>
          <KanbanBoard key={\`all-\${boardKey}\`} initialColumns={allTasksColumns} renderCardDetails={ProjectCardDetails} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border">
      <Sidebar width="w-64" height="h-full">
        <SidebarHeader>
          <Button variant="outlined" size="sm" className="w-full justify-center gap-1.5" onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New project
          </Button>
        </SidebarHeader>

        <SidebarSection label="Workspace">
          <SidebarButton isActive={!activeProject} onClick={backToOverview} icon={<GridIcon />}>
            Overview
          </SidebarButton>
        </SidebarSection>

        <SidebarSection label="Projects">
          {projects.map((project) => (
            <SidebarButton key={project.id} isActive={project.id === activeProjectId} onClick={() => openProject(project.id)}
              icon={<span className={\`h-2.5 w-2.5 rounded-full \${ACCENT_DOT[project.accent]}\`} />}>
              {project.name}
            </SidebarButton>
          ))}
        </SidebarSection>
      </Sidebar>

      <div className="min-w-0 flex-1 p-6">
        {mainContent}
      </div>

      <Modal open={createOpen} onOpenChange={handleCreateOpenChange}>
        <ModalClose />
        <ModalHeader><ModalTitle>New project</ModalTitle></ModalHeader>
        <ModalContent className="flex flex-col gap-4">
          <Input label="Name" placeholder="Q3 marketing site" value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateProject(); } }} />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text">Accent color</span>
            <div className="flex items-center gap-2">
              {ACCENTS.map((accent) => (
                <button key={accent} type="button" aria-label={\`\${ACCENT_LABEL[accent]} accent\`} aria-pressed={newProjectAccent === accent}
                  onClick={() => setNewProjectAccent(accent)}
                  className={[
                    'h-6 w-6 rounded-full motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)]',
                    ACCENT_DOT[accent],
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring',
                    newProjectAccent === accent ? \`scale-110 ring-2 ring-offset-2 \${ACCENT_RING[accent]}\` : 'hover:scale-105',
                  ].join(' ')} />
              ))}
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => handleCreateOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>Create project</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}`,
		dependencies: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
		registryDependencies: ['modal', 'kanban', 'sidebar', 'badge', 'avatar', 'text-shimmer', 'typewriter', 'breadcrumb', 'card', 'progress', 'count-up', 'button', 'icons', 'input'],
		files: ['ProjectHub/ProjectHub.tsx'],
	},
	{
		slug: 'job-application-tracker',
		name: 'Job application tracker',
		category: 'Dashboards',
		description: 'A job search tracker with a Board / Table toggle — the table doubles as an editable grid (role, company, stage, work type, location, applied date, and salary all edit in place, no need to open the board). The header carries two search-wide actions next to the title: View CV opens a base resume in a new tab, and Tailor resume is a disabled placeholder for a future AI-assisted rewrite (marked "Coming soon" — no AI is wired up). The board groups applications into five drag-and-drop stages — Wishlist, Applied, Interviewing, Offer, Rejected — using a neutral, bespoke card (company avatar and role/company on the left, the work-type badge stacked over the applied date in the top-right corner, then location/salary/a resume indicator/the details button along the bottom, and a notes preview underneath) and a wide, three-column details modal (role, company, stage, work type, location, salary, applied date, contact, job posting URL, an uploadable per-application resume attachment, and notes) built specifically for this block, independent of the generic Kanban block’s card and popup. Applications are API-driven: on mount the block fetches them from GET /api/jobs (via jobsApi.ts), shows a board- or table-shaped skeleton while the request is in flight, and falls back to an error alert with a Try again button if it fails. Every change is optimistic and synced in the background by the useApplications hook: adds POST /api/jobs, edits and drag-between-stage moves PATCH /api/jobs/[id] (text edits are debounced and sent as a diff), and deletes DELETE /api/jobs/[id]. If a write fails the UI rolls that change back and shows a dismissible alert. Reordering cards within a column is local only. Point jobsApi.ts at your own backend and keep the response shapes. Installing it copies a folder, not a single file: JobApplicationTracker.tsx (the orchestrator, including the fetch, the board’s drag-and-drop, its droppable columns, and the table’s inline-editable cells) plus the sibling pieces it imports directly: ApplicationCard.tsx (the draggable card face), ApplicationDetailsModal.tsx (the shared modal used by both views for the fields that don’t fit inline, like notes and the resume), TrackerSkeleton.tsx (the loading placeholder), useApplications.ts (list state, optimistic updates, and background sync), and jobsApi.ts (the fetch calls).',
		usage: `'use client';

import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCorners, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import ApplicationCard, { type ApplicationStage, type ApplicationStatus, type JobApplication, STAGES } from '@/src/blocks/JobApplicationTracker/ApplicationCard';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ToggleGroup, ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';
import DataTable, { type ColumnDef } from '@/src/components/DataTable/DataTable';
import ApplicationDetailsModal from '@/src/blocks/JobApplicationTracker/ApplicationDetailsModal';
import { Skeleton } from '@/src/components/Skeleton/Skeleton';
import { Select } from '@/src/components/Select/Select';
import { Alert } from '@/src/components/Alert/Alert';
import Button from '@/src/components/Button/Button';
import { useApplications } from '@/src/blocks/JobApplicationTracker/useApplications';
import Badge from '@/src/components/Badge/Badge';
import Input from '@/src/components/Input/Input';
import TrackerSkeleton from '@/src/blocks/JobApplicationTracker/TrackerSkeleton';
import { useState } from 'react';

// A single base CV shared across the whole search — distinct from the
// per-application resume attached in each card's details modal.
const MASTER_CV = {
	name: 'Resume_MasterCopy.pdf',
	url:  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
};

type TrackerView = 'board' | 'table';

const WORK_TYPE_OPTIONS = [
	{ value: 'Remote', label: 'Remote' },
	{ value: 'Hybrid', label: 'Hybrid' },
	{ value: 'Onsite', label: 'Onsite' },
];

const STAGE_OPTIONS = STAGES.map((stage) => ({ value: stage.id, label: stage.title }));

// The table doubles as an editable grid using the same Input/Select components as
// the details modal — no need to open the modal just to fix a role, stage, or
// salary. At rest a cell reads as plain text; hovering or focusing it reveals the
// component's normal bordered, editable look. The \`:not(:hover):not(:focus)\`
// scoping (rather than fighting Input/Select's own hover/focus classes with more
// \`!important\`) means those default styles apply completely untouched the moment
// either state is true — no cascade tug-of-war with the component's own classes.
const CLEAN_FIELD_CLASS = '!px-1.5 !py-1 [&:not(:hover):not(:focus)]:!border-transparent [&:not(:hover):not(:focus)]:!bg-transparent [&:not(:hover):not(:focus)]:!shadow-none';

// Applied date is the one exception: there's no headless-friendly (no visible
// label required) date component in the library yet, so it falls back to a
// native date input — fully accessible on its own, styled to match the same
// text-until-hover look via ordinary (non-important) Tailwind variants, since
// there's no competing component style here to override.

interface InlineDateFieldProps {
	value:     string | undefined;
	onChange:  (value: string | undefined) => void;
	ariaLabel: string;
}

const InlineDateField = ({ value, onChange, ariaLabel }: InlineDateFieldProps) => (
	<input
		type='date'
		value={value ? value.slice(0, 10) : ''}
		aria-label={ariaLabel}
		onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
		className='w-full rounded-[var(--radius-sm)] border-[length:var(--border-width)] border-transparent bg-transparent px-1.5 py-1 text-sm text-text shadow-none transition-colors duration-[var(--duration-fast)] hover:border-input-border hover:bg-surface hover:shadow-[var(--inner-shadow)] focus:border-input-border focus:bg-surface focus:outline-none focus-visible:shadow-[var(--input-focus-shadow)]'
	/>
);

const FileIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' />
		<path d='M14 2v4a2 2 0 0 0 2 2h4' />
	</svg>
);

const SparkleIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
		<path d='M9.94 15.5a2 2 0 0 0-1.44-1.44l-6.13-1.58a.5.5 0 0 1 0-.96l6.13-1.58A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0Z' />
	</svg>
);

// Its own droppable region (not just a SortableContext) so a column that's been
// dragged empty can still be dropped back into.

interface BoardColumnProps {
	stage:        ApplicationStage;
	applications: JobApplication[];
	onOpen:       (application: JobApplication) => void;
}

const BoardColumn = ({ stage, applications, onOpen }: BoardColumnProps) => {
	const { setNodeRef } = useDroppable({ id: stage.id });

	return (
		<div
			ref={setNodeRef}
			className='flex flex-col gap-3 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-hover p-3 min-w-[240px] w-[240px]'
		>
			<div className='flex items-center justify-between px-1'>
				<h3 className='text-xs font-semibold text-text uppercase tracking-wide'>{stage.title}</h3>
				<Badge variant={stage.badgeVariant} className='text-[10px]'>{applications.length}</Badge>
			</div>

			<SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
				<div className='flex flex-col gap-2 min-h-[60px]'>
					{applications.map((application) => (
						<ApplicationCard key={application.id} application={application} onOpen={onOpen} />
					))}
				</div>
			</SortableContext>
		</div>
	);
};

export const JobApplicationTracker = () => {
	const { applications, status, retry, syncError, dismissSyncError, addDraft, discardDraft, save, update, remove, setLocalApplications } = useApplications();
	const [view, setView]                 = useState<TrackerView>('board');
	const [selectedId, setSelectedId]     = useState<string | null>(null);
	const [activeId, setActiveId]         = useState<string | null>(null);

	const selectedApplication = applications.find((a) => a.id === selectedId) ?? null;
	const activeApplication   = applications.find((a) => a.id === activeId) ?? null;

	const openDetails = (application: JobApplication) => setSelectedId(application.id);

	const handleViewCv = () => window.open(MASTER_CV.url, '_blank', 'noopener,noreferrer');

	const updateApplication = (id: string, patch: Partial<JobApplication>) => update(id, patch);

	const handleAddApplication = () => setSelectedId(addDraft());

	const handleModalOpenChange = (open: boolean) => {
		if(open) return;
		discardDraft();
		setSelectedId(null);
	};

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if(!over) return;

		const activeApp = applications.find((a) => a.id === active.id);
		if(!activeApp) return;

		const overApp    = applications.find((a) => a.id === over.id);
		const overStatus = overApp ? overApp.status : STAGES.some((s) => s.id === over.id) ? (over.id as ApplicationStatus) : null;
		if(!overStatus || overStatus === activeApp.status) return;

		setLocalApplications((prev) => prev.map((a) => a.id === active.id ? { ...a, status: overStatus } : a));
	};

	const syncDraggedStatus = (id: string) => {
		const dragged = applications.find((a) => a.id === id);
		if(dragged) update(id, { status: dragged.status }, true);
	};

	const handleDragCancel = () => {
		if(activeId) syncDraggedStatus(activeId);
		setActiveId(null);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		syncDraggedStatus(active.id as string);
		if(!over || active.id === over.id) return;

		const activeApp = applications.find((a) => a.id === active.id);
		const overApp   = applications.find((a) => a.id === over.id);
		if(!activeApp || !overApp || activeApp.status !== overApp.status) return;

		setLocalApplications((prev) =>
		{
			const oldIndex = prev.findIndex((a) => a.id === active.id);
			const newIndex = prev.findIndex((a) => a.id === over.id);
			return arrayMove(prev, oldIndex, newIndex);
		});
	};

	const activeCount        = applications.filter((a) => a.status === 'applied' || a.status === 'interviewing' || a.status === 'offer').length;
	const interviewingCount  = applications.filter((a) => a.status === 'interviewing').length;
	const offerCount         = applications.filter((a) => a.status === 'offer').length;

	const tableColumns: ColumnDef<JobApplication>[] = [
		{
			key: 'role',
			header: 'Role',
			sortable: true,
			width: '170px',
			render: (value, row) => <Input value={value as string} aria-label={\`Role for \${row.company || 'this application'}\`} onChange={(e) => updateApplication(row.id, { role: e.target.value })} className={CLEAN_FIELD_CLASS} />,
		},
		{
			key: 'company',
			header: 'Company',
			sortable: true,
			width: '150px',
			render: (value, row) => <Input value={value as string} aria-label={\`Company for \${row.role || 'this application'}\`} onChange={(e) => updateApplication(row.id, { company: e.target.value })} className={CLEAN_FIELD_CLASS} />,
		},
		{
			key: 'status',
			header: 'Stage',
			sortable: true,
			width: '140px',
			render: (value, row) => (
				<Select
					options={STAGE_OPTIONS}
					value={value as string}
					size='sm'
					aria-label={\`Stage for \${row.role || 'this application'}\`}
					onChange={(v) => updateApplication(row.id, { status: v as ApplicationStatus })}
					triggerClassName={CLEAN_FIELD_CLASS}
				/>
			),
		},
		{
			key: 'workType',
			header: 'Work type',
			width: '120px',
			render: (value, row) => (
				<Select
					options={WORK_TYPE_OPTIONS}
					value={value as string}
					size='sm'
					aria-label={\`Work type for \${row.role || 'this application'}\`}
					onChange={(v) => updateApplication(row.id, { workType: v as JobApplication['workType'] })}
					triggerClassName={CLEAN_FIELD_CLASS}
				/>
			),
		},
		{
			key: 'location',
			header: 'Location',
			width: '150px',
			render: (value, row) => <Input value={(value as string) ?? ''} placeholder='Optional' aria-label={\`Location for \${row.role || 'this application'}\`} onChange={(e) => updateApplication(row.id, { location: e.target.value })} className={CLEAN_FIELD_CLASS} />,
		},
		{
			key: 'appliedDate',
			header: 'Applied',
			sortable: true,
			width: '140px',
			render: (value, row) => <InlineDateField value={value as string | undefined} ariaLabel={\`Applied date for \${row.role || 'this application'}\`} onChange={(v) => updateApplication(row.id, { appliedDate: v })} />,
		},
		{
			key: 'salary',
			header: 'Salary',
			width: '130px',
			render: (value, row) => <Input value={(value as string) ?? ''} placeholder='Optional' aria-label={\`Salary for \${row.role || 'this application'}\`} onChange={(e) => updateApplication(row.id, { salary: e.target.value })} className={CLEAN_FIELD_CLASS} />,
		},
		{
			key: 'id',
			header: '',
			width: '84px',
			render: (_value, row) => <Button variant='ghost' size='sm' onClick={() => openDetails(row)}>Details</Button>,
		},
	];

	return (
		<div className='flex flex-col gap-5 w-full' aria-busy={status === 'loading'}>
			<div className='flex flex-col gap-3'>
				<div className='flex flex-col gap-1'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<h2 className='text-2xl font-semibold text-text'>Job search tracker</h2>
						<div className='flex items-center gap-2'>
							<Button size='sm' variant='outlined' onClick={handleViewCv}>
								<FileIcon />
								View CV
							</Button>
							<Button size='sm' variant='outlined' disabled>
								<SparkleIcon />
								Tailor resume
								<Badge variant='outline' className='ml-1 text-[10px]'>Coming soon</Badge>
							</Button>
						</div>
					</div>
					<p className='text-sm text-text-muted'>Drag cards on the board, or edit properties directly in the table — both stay in sync.</p>
				</div>

				<div className='flex flex-wrap items-center justify-between gap-3'>
					<div className='flex items-center gap-2'>
						{status === 'ready' ? (
							<>
								<Badge variant='default'>{activeCount} active</Badge>
								<Badge variant='warning'>{interviewingCount} interviewing</Badge>
								<Badge variant='success'>{offerCount} offer{offerCount === 1 ? '' : 's'}</Badge>
							</>
						) : (
							<Skeleton width='15rem' height='1.5rem' aria-hidden='true' />
						)}
					</div>

					<div className='flex items-center gap-2'>
						<ToggleGroup type='single' value={view} onValueChange={(value) => setView(value as TrackerView)} size='sm' aria-label='Board or table view'>
							<ToggleGroupItem value='board'>Board</ToggleGroupItem>
							<ToggleGroupItem value='table'>Table</ToggleGroupItem>
						</ToggleGroup>
						<Button size='sm' variant='secondary' disabled={status !== 'ready'} onClick={handleAddApplication}>+ Add application</Button>
					</div>
				</div>
			</div>

			{syncError && (
				<Alert variant='danger' title='Sync failed'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<span>{syncError}</span>
						<Button size='sm' variant='outlined' onClick={dismissSyncError}>Dismiss</Button>
					</div>
				</Alert>
			)}

			{status === 'loading' && (
				<>
					<span role='status' className='sr-only'>Loading applications…</span>
					<TrackerSkeleton view={view} />
				</>
			)}

			{status === 'error' && (
				<Alert variant='danger' title='Could not load applications'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<span>Something went wrong fetching your applications.</span>
						<Button size='sm' variant='outlined' onClick={retry}>Try again</Button>
					</div>
				</Alert>
			)}

			{status === 'ready' && (view === 'board' ? (
				<DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
					<div role='application' aria-label='Job application board' className='flex gap-4 overflow-x-auto pb-2'>
						{STAGES.map((stage) => (
							<BoardColumn key={stage.id} stage={stage} applications={applications.filter((a) => a.status === stage.id)} onOpen={openDetails} />
						))}
					</div>

					<DragOverlay>
						{activeApplication && (
							<ApplicationCard application={activeApplication} isDragging className='rotate-1 shadow-[var(--shadow-lg)] opacity-95' />
						)}
					</DragOverlay>
				</DndContext>
			) : (
				<DataTable data={applications} columns={tableColumns} keyField='id' pageSize={10} emptyMessage='No applications yet.' />
			))}

			<ApplicationDetailsModal
				open={selectedId !== null}
				application={selectedApplication}
				onOpenChange={handleModalOpenChange}
				onSave={save}
				onDelete={remove}
			/>
		</div>
	);
};

export default JobApplicationTracker;`,
		dependencies: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
		registryDependencies: ['modal', 'select', 'date-picker', 'textarea', 'attachment', 'separator', 'input', 'button', 'avatar', 'badge', 'toggle-group', 'data-table', 'alert', 'icons', 'skeleton'],
		files: [
			'JobApplicationTracker/JobApplicationTracker.tsx', 'JobApplicationTracker/ApplicationCard.tsx', 'JobApplicationTracker/ApplicationDetailsModal.tsx', 'JobApplicationTracker/TrackerSkeleton.tsx',
			{ path: 'JobApplicationTracker/jobsApi.ts', kind: 'api' },
			{ path: 'JobApplicationTracker/useApplications.ts', kind: 'hook' },
		],
	},

	// Registered so they're individually installable via the CLI and directly
	// linkable at /blocks/{slug}, but `hidden: true` keeps them off the /blocks
	// gallery: each is a variant of its parent block, not its own distinct block.
	{
		slug: 'auth-form-social',
		name: 'Social login',
		category: 'Authentication',
		description: 'Sign in with Google or GitHub, or fall back to a standard email and password form.',
		usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader, FormField, FormLabel, Button, Badge, Input } from '@components/ui';
import { useEffect, useRef, useState } from 'react';

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

  const timerRef = useRef(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleSocial = (provider) => {
    setSocialLoading(provider);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSocialLoading(null);
      setSuccess(true);
    }, 900);
  };

  const handleSubmit = () => {
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
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
		dependencies: [],
		registryDependencies: ['card', 'form', 'button', 'badge', 'icons', 'input'],
		files: ['AuthFormSocial/AuthFormSocial.tsx'],
		hidden: true,
	},
	{
		slug: 'auth-form-magic-link',
		name: 'Magic link',
		category: 'Authentication',
		description: 'Passwordless sign-in: email a one-time link instead of asking for a password.',
		usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader, FormField, FormLabel, Button, Input } from '@components/ui';
import { useEffect, useRef, useState } from 'react';

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

  const sendTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(sendTimerRef.current), []);

  const handleSend = () => {
    setLoading(true);
    clearTimeout(sendTimerRef.current);
    sendTimerRef.current = setTimeout(() => {
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
		dependencies: [],
		registryDependencies: ['card', 'form', 'button', 'input'],
		files: ['AuthFormMagicLink/AuthFormMagicLink.tsx'],
		hidden: true,
	},
	{
		slug: 'pricing-section-usage',
		name: 'Usage-based pricing',
		category: 'Marketing',
		description: 'A metered pricing card: drag the slider to estimate a monthly bill from a base fee plus a per-unit rate.',
		usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader, Slider, Button, Badge } from '@components/ui';
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
		dependencies: [],
		registryDependencies: ['card', 'slider', 'button', 'badge'],
		files: ['PricingSectionUsage/PricingSectionUsage.tsx'],
		hidden: true,
	},
	{
		slug: 'terminal',
		name: 'Terminal',
		category: 'Dashboards',
		description: 'A code editor workspace: an activity bar that switches a resizable sidebar between the file explorer and source control, and a configurable Run view, open files as tabs (each with a close button that appears on hover), a scrollable editable code surface with a Run button, a closable terminal panel, a settings modal, and a status bar. The file tree, file contents, git status, and command output all load from API routes (the demo answers commands with mocked replies and executes nothing), so point them at your own backend. Installs as a folder with the API client in terminalApi.ts.',
		usage: `'use client';

import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/src/components/Modal/Modal';
import { FileIcon, CloseIcon, FilesIcon, GitIcon, PlayIcon, SettingsIcon, TerminalIcon } from '@/src/blocks/Terminal/icons';
import { Resizable, ResizablePanel, ResizableHandle } from '@/src/components/Resizable/Resizable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/Tabs/Tabs';
import { RunPanel, FILE_PLACEHOLDER, canRunScript } from '@/src/blocks/Terminal/RunPanel';
import { fetchTree, fetchFile, fetchGitStatus } from '@/src/blocks/Terminal/terminalApi';
import type { GitStatus, TerminalFile, TerminalNode } from '@/src/blocks/Terminal/types';
import CodeEditor from '@/src/components/CodeEditor/CodeEditor';
import { Skeleton } from '@/src/components/Skeleton/Skeleton';
import Tree, { TreeItem } from '@/src/components/Tree/Tree';
import Spinner from '@/src/components/Spinner/Spinner';
import Switch from '@/src/components/Switch/Switch';
import Button from '@/src/components/Button/Button';
import { useEffect, useState } from 'react';
import { useShell } from '@/src/blocks/Terminal/useShell';
import { GitPanel } from '@/src/blocks/Terminal/GitPanel';
import { Shell } from '@/src/blocks/Terminal/Shell';

type LoadStatus = 'loading' | 'ready' | 'error';
type SidebarView = 'files' | 'git' | 'run';

const SIDEBAR_TITLES: Record<SidebarView, string> = { files: 'Explorer', git: 'Source control', run: 'Run' };

const fileName = (path: string) => path.split('/').pop() ?? path;

const renderNodes = (nodes: TerminalNode[], activeId: string | null, onOpen: (id: string) => void) =>
	nodes.map((node) =>
	{
		if(node.type === 'folder')
		{
			return (
				<TreeItem key={node.id} label={node.name} defaultOpen>
					{renderNodes(node.children ?? [], activeId, onOpen)}
				</TreeItem>
			);
		}

		return (
			<TreeItem
				key={node.id}
				label={node.name}
				icon={<FileIcon />}
				className={activeId === node.id ? 'bg-surface-active' : ''}
				onSelect={() => onOpen(node.id)}
			/>
		);
	});

export const Terminal = () => {
	const [tree, setTree] = useState<TerminalNode[]>([]);
	const [treeStatus, setTreeStatus] = useState<LoadStatus>('loading');
	const [git, setGit] = useState<GitStatus | null>(null);
	const [gitStatus, setGitStatus] = useState<LoadStatus>('loading');
	const [files, setFiles] = useState<Record<string, TerminalFile>>({});
	const [openIds, setOpenIds] = useState<string[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [fileError, setFileError] = useState(false);
	const [view, setView] = useState<SidebarView>('files');
	const [shellOpen, setShellOpen] = useState(true);
	const [runScript, setRunScript] = useState('npm run dev');
	const [openOnRun, setOpenOnRun] = useState(true);
	const [clearOnRun, setClearOnRun] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const shell = useShell();

	useEffect(() =>
	{
		fetchTree()
			.then((nodes) =>
			{
				setTree(nodes);
				setTreeStatus('ready');
			})
			.catch(() => setTreeStatus('error'));

		fetchGitStatus()
			.then((status) =>
			{
				setGit(status);
				setGitStatus('ready');
			})
			.catch(() => setGitStatus('error'));
	}, []);

	const openFile = async (id: string) => {
		setFileError(false);
		setActiveId(id);
		setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
		if(files[id]) return;

		setLoadingId(id);
		try
		{
			const file = await fetchFile(id);
			setFiles((prev) => ({ ...prev, [id]: file }));
		}
		catch
		{
			setFileError(true);
		}
		finally
		{
			setLoadingId((current) => (current === id ? null : current));
		}
	};

	const closeFile = (id: string) => {
		const remaining = openIds.filter((openId) => openId !== id);
		setOpenIds(remaining);
		setFileError(false);
		if(activeId !== id) return;

		const closedIndex = openIds.indexOf(id);
		setActiveId(remaining[Math.min(closedIndex, remaining.length - 1)] ?? null);
	};

	const editFile = (id: string, content: string) => setFiles((prev) => ({ ...prev, [id]: { ...prev[id], content } }));

	const activeFile = activeId ? files[activeId] : undefined;
	const isLoadingActive = activeId !== null && loadingId === activeId;
	const changeCount = git?.changes.length ?? 0;
	const runnable = canRunScript(runScript, activeId, shell.running);

	const handleRun = () => {
		if(!runnable) return;
		if(openOnRun) setShellOpen(true);
		if(clearOnRun) shell.clear();
		shell.run(runScript.replaceAll(FILE_PLACEHOLDER, activeId ?? '').trim());
	};

	const activityButtonClass = (active: boolean) => (active ? 'bg-surface-active text-text' : 'text-text-muted');

	return (
		<div className='flex h-[600px] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface'>
			<div className='flex min-h-0 flex-1'>
				<div className='flex w-11 shrink-0 flex-col items-center gap-1 border-r-[length:var(--border-width)] border-surface-border py-2'>
					<Button
						variant='ghost'
						size='icon'
						aria-label='Explorer'
						aria-pressed={view === 'files'}
						onClick={() => setView('files')}
						className={activityButtonClass(view === 'files')}
					>
						<FilesIcon />
					</Button>

					<Button
						variant='ghost'
						size='icon'
						aria-label={changeCount > 0 ? \`Source control, \${changeCount} changes\` : 'Source control'}
						aria-pressed={view === 'git'}
						onClick={() => setView('git')}
						className={activityButtonClass(view === 'git')}
					>
						<GitIcon />
					</Button>

					<Button
						variant='ghost'
						size='icon'
						aria-label='Run'
						aria-pressed={view === 'run'}
						onClick={() => setView('run')}
						className={activityButtonClass(view === 'run')}
					>
						<PlayIcon />
					</Button>

					<Button
						variant='ghost'
						size='icon'
						aria-label='Settings'
						onClick={() => setSettingsOpen(true)}
						className='mt-auto text-text-muted'
					>
						<SettingsIcon />
					</Button>
				</div>

				<Resizable direction='horizontal' className='min-h-0 min-w-0 flex-1'>
					<ResizablePanel defaultSize={240} minSize={160} maxSize={400} className='flex flex-col border-r-[length:var(--border-width)] border-surface-border'>
						<div className='flex h-10 shrink-0 items-center px-3 text-xs font-semibold uppercase tracking-wide text-text-muted'>
							{SIDEBAR_TITLES[view]}
						</div>

						<div className='min-h-0 flex-1 overflow-y-auto px-1 pb-2'>
							{view === 'git' && <GitPanel git={git} status={gitStatus} onOpen={openFile} />}

							{view === 'run' && (
								<RunPanel script={runScript} activeId={activeId} running={shell.running} onChange={setRunScript} onRun={handleRun} />
							)}

							{view === 'files' && treeStatus === 'loading' && (
								<div className='flex flex-col gap-2 p-2'>
									<Skeleton height='16px' width='70%' />
									<Skeleton height='16px' width='50%' />
									<Skeleton height='16px' width='60%' />
									<Skeleton height='16px' width='40%' />
								</div>
							)}

							{view === 'files' && treeStatus === 'error' && (
								<p role='alert' className='p-3 text-sm text-danger'>Couldn’t load files. Check your connection and refresh.</p>
							)}

							{view === 'files' && treeStatus === 'ready' && (
								<Tree>
									{renderNodes(tree, activeId, openFile)}
								</Tree>
							)}
						</div>
					</ResizablePanel>

					<ResizableHandle aria-label='Resize sidebar' />

					<ResizablePanel className='flex min-w-0 flex-col'>
						<Resizable direction='vertical' className='min-h-0 flex-1'>
							<ResizablePanel className='flex flex-col'>
								{activeId === null ? (
									<div className='flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center'>
										<p className='text-sm font-medium text-text'>No file open</p>
										<p className='text-sm text-text-muted'>Pick a file from the explorer to start editing.</p>
									</div>
								) : (
									<Tabs value={activeId} onValueChange={setActiveId} className='flex min-h-0 flex-1 flex-col'>
										<div className='flex shrink-0'>
											<TabsList className='min-w-0 flex-1 overflow-x-auto'>
												{openIds.map((id) => (
													<TabsTrigger
														key={id}
														value={id}
														className='group inline-flex shrink-0 items-center gap-2'
														onKeyDown={(e) =>
														{
															if(e.key !== 'Delete') return;
															e.preventDefault();
															closeFile(id);
														}}
													>
														{fileName(id)}
														<span
															aria-hidden='true'
															onClick={(e) =>
															{
																e.stopPropagation();
																closeFile(id);
															}}
															className='flex h-4 w-4 items-center justify-center rounded-[var(--radius)] opacity-0 transition-opacity hover:bg-surface-hover group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
														>
															<CloseIcon />
														</span>
													</TabsTrigger>
												))}
											</TabsList>

											{runScript.trim() !== '' && (
												<div className='flex shrink-0 items-center border-b-[length:var(--border-width)] border-surface-border px-2'>
													<Button size='sm' onClick={handleRun} disabled={!runnable}>
														<PlayIcon />
														Run
													</Button>
												</div>
											)}
										</div>

										<TabsContent value={activeId} className='min-h-0 flex-1 overflow-auto pt-0'>
											{isLoadingActive && (
												<div className='flex h-full items-center justify-center'>
													<Spinner label={\`Loading \${fileName(activeId)}\`} />
												</div>
											)}

											{fileError && !isLoadingActive && !activeFile && (
												<p role='alert' className='p-4 text-sm text-danger'>Couldn’t load {fileName(activeId)}.</p>
											)}

											{activeFile && (
												<CodeEditor
													key={activeFile.id}
													value={activeFile.content}
													onChange={(content) => editFile(activeFile.id, content)}
													aria-label={\`Editing \${activeFile.path}\`}
													className='min-h-full rounded-none border-0'
												/>
											)}
										</TabsContent>
									</Tabs>
								)}
							</ResizablePanel>

							{shellOpen && (
								<>
									<ResizableHandle aria-label='Resize terminal' />
									<ResizablePanel defaultSize={180} minSize={96} className='border-t-[length:var(--border-width)] border-surface-border'>
										<Shell
											entries={shell.entries}
											running={shell.running}
											onRun={shell.run}
											onClear={shell.clear}
											onClose={() => setShellOpen(false)}
										/>
									</ResizablePanel>
								</>
							)}
						</Resizable>
					</ResizablePanel>
				</Resizable>
			</div>

			<div className='flex h-7 shrink-0 items-center justify-between border-t-[length:var(--border-width)] border-surface-border bg-surface-active px-3 text-xs text-text-muted'>
				<span>{activeFile ? activeFile.path : 'Ready'}</span>

				<div className='flex items-center gap-3'>
					<span>{activeFile ? activeFile.language : ''}</span>

					<Button
						variant='ghost'
						size='sm'
						aria-pressed={shellOpen}
						onClick={() => setShellOpen((open) => !open)}
						className='h-5 gap-1 px-1.5 text-xs'
					>
						<TerminalIcon />
						Terminal
					</Button>
				</div>
			</div>

			<Modal open={settingsOpen} onOpenChange={setSettingsOpen}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>Settings</ModalTitle>
				</ModalHeader>
				<ModalContent>
					<div className='flex flex-col gap-4'>
						<Switch
							checked={openOnRun}
							onCheckedChange={setOpenOnRun}
							label='Open terminal on run'
							hint='Shows the terminal panel whenever a script starts.'
						/>
						<Switch
							checked={clearOnRun}
							onCheckedChange={setClearOnRun}
							label='Clear terminal before run'
							hint='Wipes earlier output so each run starts fresh.'
						/>
					</div>
				</ModalContent>
				<ModalFooter>
					<Button variant='secondary' onClick={() => setSettingsOpen(false)}>Done</Button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default Terminal;`,
		dependencies: [],
		registryDependencies: ['resizable', 'tabs', 'code-editor', 'tree', 'skeleton', 'spinner', 'button', 'badge', 'modal', 'switch', 'input'],
		files: [
			'Terminal/Terminal.tsx', 'Terminal/GitPanel.tsx', 'Terminal/Shell.tsx', 'Terminal/RunPanel.tsx', 'Terminal/icons.tsx',
			{ path: 'Terminal/useShell.ts', kind: 'hook' },
			{ path: 'Terminal/types.ts', kind: 'model' },
			{ path: 'Terminal/terminalApi.ts', kind: 'api' },
			'Terminal/CLAUDE.md',
		],
	},
	{
		slug: 'slide-editor',
		name: 'Slide Editor',
		category: 'Editors',
		description: 'A slide deck editor with a reorderable slide rail, free-positioned text, images, icons, shapes, tables, and charts, rich-text editing, an inspector, undo/redo, speaker notes, and a fullscreen presenter.',
		usage: `'use client';

import { DeckEditor, TOOLBAR_BUTTON } from '@/src/components/DeckEditor/DeckEditor';
import { exportJson } from '@/src/components/DeckEditor/exporters';
import { Skeleton } from '@/src/components/Skeleton/Skeleton';
import type { DeckDocument } from '@/src/blocks/SlideEditor/useDeckDocument';
import Button from '@/src/components/Button/Button';
import { useDeckDocument } from '@/src/blocks/SlideEditor/useDeckDocument';
import { SaveIndicator } from '@/src/blocks/SlideEditor/SaveIndicator';
import { DeckMenu } from '@/src/blocks/SlideEditor/DeckMenu';
import { useState } from 'react';

const FRAME = 'flex h-[760px] max-h-[100dvh] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel';

/** The editor for one loaded deck: undo history, autosave, and the deck menu around DeckEditor (which has its own Download menu). */
const LoadedDeck = ({ doc }: { doc: DeckDocument }) => {
	const { history, dispatch } = doc;
	const deck = history.present;
	const [status, setStatus] = useState('');

	const runExportJson = () => {
		exportJson(deck);
		setStatus('Deck file downloaded.');
		setTimeout(() => setStatus(''), 4000);
	};

	return (
		<DeckEditor
			deck={deck}
			onChange={(next, coalesceKey) => dispatch({ type: 'change', deck: next, coalesceKey })}
			history={{
				undo:    () => dispatch({ type: 'undo' }),
				redo:    () => dispatch({ type: 'redo' }),
				canUndo: history.past.length > 0,
				canRedo: history.future.length > 0,
			}}
			status={status}
			toolbarEnd={(
				<>
					<SaveIndicator state={doc.saveState} onRetry={doc.retrySave} />
					<DeckMenu
						doc={doc}
						title={deck.title}
						onRename={title => dispatch({ type: 'change', deck: { ...deck, title } })}
						onExportJson={runExportJson}
						onStatus={setStatus}
						buttonClass={TOOLBAR_BUTTON}
					/>
				</>
			)}
			className='h-[760px] max-h-[100dvh]'
		/>
	);
};

export const SlideEditor = () => {
	const doc = useDeckDocument();

	// Keyed by deck id, so opening another deck starts fresh (slide, selection, zoom).
	if(doc.load.kind === 'ready' && doc.deckId) return <LoadedDeck key={doc.deckId} doc={doc} />;

	return (
		<div className={FRAME}>
			{doc.load.kind === 'loading' ? (
				<div role='status' aria-label='Loading deck' className='flex flex-1 flex-col gap-4 bg-surface-active p-6'>
					<Skeleton className='mx-auto aspect-video w-full max-w-3xl' />
					<div className='flex gap-3'>
						{[0, 1, 2].map(i => <Skeleton key={i} className='aspect-video w-36' />)}
					</div>
				</div>
			) : (
				<div role='alert' className='flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center'>
					<p className='text-sm text-text'>Couldn&apos;t load the deck.</p>
					<p className='max-w-md text-sm text-text-muted'>{doc.load.kind === 'error' ? doc.load.message : ''}</p>
					<Button variant='outlined' size='sm' onClick={doc.retry}>Try again</Button>
				</div>
			)}
		</div>
	);
};

export default SlideEditor;
`,
		dependencies: [],
		registryDependencies: ['button', 'deck-editor', 'input', 'menu', 'modal', 'skeleton'],
		files: [
			'SlideEditor/SlideEditor.tsx',
			'SlideEditor/DeckMenu.tsx',
			'SlideEditor/SaveIndicator.tsx',
			'SlideEditor/deck.ts',
			'SlideEditor/deckApi.ts',
			'SlideEditor/templates.ts',
			'SlideEditor/useDeckDocument.ts',
			'SlideEditor/CLAUDE.md',
		],
	},
];

export const getBlock = (slug: string): BlockEntry | undefined => blocks.find((b) => b.slug === slug);
