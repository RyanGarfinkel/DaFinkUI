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
import { DropdownMenu } from '@/src/components/DropdownMenu/DropdownMenu';
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
        <DropdownMenu items={PERIODS.map((label) => ({ label, onSelect: () => setPeriod(label) }))} trigger={period} />
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
		registryDependencies: ['mosaic', 'dropdown-menu', 'charts', 'badge', 'avatar', 'data-table', 'count-up'],
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
import { useState } from 'react';

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
		registryDependencies: ['card', 'form', 'toggle-group', 'checkbox', 'otp-input', 'progress', 'button', 'badge', 'input'],
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
import { useState } from 'react';

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
import { useState } from 'react';

export default function CheckoutForm() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canPay = !!email && !!fullName && (paymentMethod !== 'card' || (!!cardNumber && !!expiry && !!cvc));

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
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
		registryDependencies: ['card', 'form', 'radio', 'button', 'input'],
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
		registryDependencies: ['accordion', 'toggle-group', 'card', 'button', 'badge'],
		files: ['PricingSection/PricingSection.tsx'],
	},
	{
		slug: 'notifications-panel',
		name: 'Notifications panel',
		category: 'Feedback',
		description: 'A scrollable notifications feed with unread indicators (dot + weight, never color alone) and a mark-all-as-read action.',
		usage: `'use client';

import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import ScrollFade from '@/src/components/ScrollFade/ScrollFade';
import Avatar from '@/src/components/Avatar/Avatar';
import Button from '@/src/components/Button/Button';
import { useState } from 'react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, name: 'Alex Kim', message: 'Alex Kim commented on your PR', time: '2m ago', read: false },
  { id: 2, name: 'Sam Chen', message: 'Sam Chen assigned you a task', time: '18m ago', read: false },
  { id: 3, name: 'Jordan Park', message: 'Jordan Park mentioned you in a doc', time: '42m ago', read: false },
  { id: 4, name: 'Riley Yu', message: 'Riley Yu approved your request', time: '1h ago', read: true },
  { id: 5, name: 'Morgan Lee', message: 'Morgan Lee left a review', time: '3h ago', read: true },
  { id: 6, name: 'Taylor Cruz', message: 'Taylor Cruz shared a file with you', time: '5h ago', read: true },
  { id: 7, name: 'Casey Diaz', message: 'Casey Diaz replied to your comment', time: '1d ago', read: true },
  { id: 8, name: 'Drew Nolan', message: 'Drew Nolan invited you to a project', time: '2d ago', read: true },
];

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={markAllAsRead}>Mark all as read</Button>
      </CardHeader>
      <CardContent>
        <ScrollFade direction="vertical" className="max-h-80">
          <div className="flex flex-col divide-y divide-surface-border">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={n.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className={n.read ? 'text-sm text-text-muted' : 'text-sm font-medium text-text'}>{n.message}</p>
                  <p className="text-xs text-text-muted mt-0.5">{n.time}</p>
                </div>
                {!n.read && (
                  <span className="flex items-center gap-1.5 mt-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-brand" aria-hidden="true" />
                    <span className="sr-only">Unread</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </ScrollFade>
      </CardContent>
    </Card>
  );
}`,
		dependencies: [],
		registryDependencies: ['card', 'scroll-fade', 'avatar', 'button'],
		files: ['NotificationsPanel/NotificationsPanel.tsx'],
	},
	{
		slug: 'team-grid',
		name: 'Team grid',
		category: 'Display',
		description: 'A responsive "meet the team" grid of member cards with avatar, role, and department badge.',
		usage: `'use client';

import Badge from '@/src/components/Badge/Badge';
import { Card, CardContent } from '@/src/components/Card/Card';
import Avatar from '@/src/components/Avatar/Avatar';

const TEAM_MEMBERS = [
  { name: 'Ava Thompson', role: 'Design Lead', department: 'Design', variant: 'default' },
  { name: 'Noah Martinez', role: 'Senior Engineer', department: 'Engineering', variant: 'success' },
  { name: 'Priya Sharma', role: 'Product Manager', department: 'Product', variant: 'warning' },
  { name: 'Liam Chen', role: 'Frontend Engineer', department: 'Engineering', variant: 'success' },
  { name: 'Sofia Rossi', role: 'UX Designer', department: 'Design', variant: 'default' },
  { name: 'Ethan Brooks', role: 'Growth Marketing', department: 'Marketing', variant: 'outline' },
];

export default function TeamGrid() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-text">Meet the team</h2>
        <p className="text-sm text-text-muted">The people designing and building the product every day.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM_MEMBERS.map((member) => (
          <Card key={member.name}>
            <CardContent className="flex flex-col items-center gap-2 text-center">
              <Avatar name={member.name} size="lg" />
              <p className="text-sm font-medium text-text">{member.name}</p>
              <p className="text-xs text-text-muted">{member.role}</p>
              <Badge variant={member.variant}>{member.department}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}`,
		dependencies: [],
		registryDependencies: ['badge', 'card', 'avatar'],
		files: ['TeamGrid/TeamGrid.tsx'],
	},
	{
		slug: 'chart-card',
		name: 'Chart card',
		category: 'Dashboards',
		description: 'A single, self-contained stat card with an embedded trend chart: the kind of card you drop into any dashboard grid.',
		usage: `'use client';

import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import { AreaChart } from '@/src/components/Charts/Charts';
import CountUp from '@/src/components/CountUp/CountUp';
import Badge from '@/src/components/Badge/Badge';

const MAU_DATA = [
  { month: 'Jan', users: 18200 },
  { month: 'Feb', users: 19100 },
  { month: 'Mar', users: 20400 },
  { month: 'Apr', users: 21800 },
  { month: 'May', users: 23300 },
  { month: 'Jun', users: 24800 },
];

export default function ChartCard() {
  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <p className="text-xs text-text-muted">Monthly active users</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-semibold text-text">
            <CountUp value={24800} separator="," duration={1400} />
          </p>
          <Badge variant="success">+12.4%</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={MAU_DATA}
          xKey="month"
          series={[{ key: 'users', label: 'Monthly active users' }]}
          height={140}
          showLegend={false}
        />
      </CardContent>
    </Card>
  );
}`,
		dependencies: [],
		registryDependencies: ['card', 'charts', 'count-up', 'badge'],
		files: ['ChartCard/ChartCard.tsx'],
	},
	{
		slug: 'ai-chat',
		name: 'AI chat',
		category: 'AI',
		description: 'A full ChatGPT-style chat app: a chat-history sidebar (new chat, inline rename, delete, search threads) on the left, and a conversation panel on the right where sent messages render as bubbles, assistant replies render as plain bubble-less text, and a floating composer bar (attach, message, send) sits below the thread. Any message — sent or received — can spawn a reply thread, a forked side conversation seeded from the history up to that message; an open thread renders as a persistent third column (never an overlay or Drawer) with its own composer and independent streaming state, while a message that already has a thread shows an always-visible reply-count badge and a command palette lets you search every thread across every chat and jump straight to one. The main chat pane and the thread panel sit inside a Resizable split (drag the handle between them, or focus it and use the arrow keys) so a reader can widen the thread panel for a long side conversation; the chat-history sidebar itself stays a fixed-width column, not resizable. Seeded with a fake, predefined conversation, canned streamed replies, and a couple of sample threads. No real model calls, and thread content is fetched from local sample data with a simulated delay, not a real endpoint. Installing it copies a folder, not a single file: AiChat.tsx (the orchestrator), ChatMarkdown.tsx, StreamingMessage.tsx, and ThreadPanel.tsx (the thread side panel), plus ToolCallTrace (the collapsible thought/tool-call summary above a reply) and Questionnaire (the structured question widget shown inside a reply), installed as standalone registry dependencies with their own docs pages at /components/tool-call-trace and /components/questionnaire. Live replies in the demo come from a real (docs-site-only) API route rather than being simulated inline.',
		usage: `'use client';

import StreamingMessage, { type ChartSpec, type StackableChartSpec, type DonutSpec, type ImageSpec, type AudioSpec, type TableSpec } from '@/src/blocks/AiChat/StreamingMessage';
import Modal, { ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '@/src/components/Modal/Modal';
import ToolCallTrace, { type ToolCallEntry, type ToolCallLink } from '@/src/components/ToolCallTrace/ToolCallTrace';
import CommandPalette, { CommandGroup, CommandItem } from '@/src/components/CommandPalette/CommandPalette';
import { Sidebar, SidebarButton, SidebarHeader, SidebarSection } from '@/src/components/Sidebar/Sidebar';
import { ChangeEvent, FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { Resizable, ResizablePanel, ResizableHandle } from '@/src/components/Resizable/Resizable';
import Questionnaire, { type QuestionStep } from '@/src/components/Questionnaire/Questionnaire';
import CommandInput, { type CommandOption } from '@/src/components/CommandInput/CommandInput';
import { Skeleton, SkeletonImage } from '@/src/components/Skeleton/Skeleton';
import ScrollFade from '@/src/components/ScrollFade/ScrollFade';
import Attachment from '@/src/components/Attachment/Attachment';
import Message from '@/src/components/Message/Message';
import Tooltip from '@/src/components/Tooltip/Tooltip';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import Input from '@/src/components/Input/Input';
import ThreadPanel from '@/src/blocks/AiChat/ThreadPanel';

interface MessageAttachment {
	name: string;
	size: string;
}

export interface ChatTextMessage {
	id:                 number;
	kind:               'message';
	sender:             'user' | 'ai';
	text:               string;
	animate?:           boolean;
	generating?:        'image' | 'audio';
	attachment?:        MessageAttachment;
	toolCalls?:         ToolCallEntry[];
	questionnaire?:     QuestionStep;
	questionnaireAnswer?: string;
}

interface ChatCheckpoint {
	id:    number;
	kind:  'checkpoint';
	label: string;
}

export type ChatMessage = ChatTextMessage | ChatCheckpoint;

export interface ThreadRef {
	id:            string;
	rootMessageId: number;
	snippet:       string;
	createdAt:     string;
	replyCount:    number;
}

interface ChatEntry {
	id:         string;
	title:      string;
	messages:   ChatMessage[];
	threadRefs: ThreadRef[];
}

export interface AiChatHistoryMessage {
	role: 'user' | 'assistant';
	text: string;
}

export interface AiChatReply {
	text:       string;
	toolCalls?: ToolCallEntry[];
}

const HOME_PRICE_DATA: Record<string, string | number>[] = [
	{ year: 2019, price: 313000 },
	{ year: 2020, price: 329000 },
	{ year: 2021, price: 375000 },
	{ year: 2022, price: 395000 },
	{ year: 2023, price: 410000 },
	{ year: 2024, price: 426000 },
];

const HOME_PRICE_LINEPLOT: ChartSpec = {
	xKey:   'year',
	series: [{ key: 'price', label: 'Median home price' }],
	data:   HOME_PRICE_DATA,
};

const DOWNLOADS_BARCHART: StackableChartSpec = {
	xKey:   'month',
	series: [{ key: 'downloads', label: 'npm downloads' }],
	data: [
		{ month: 'Apr', downloads: 1200 },
		{ month: 'May', downloads: 1850 },
		{ month: 'Jun', downloads: 2400 },
		{ month: 'Jul', downloads: 3100 },
	],
};

const READING_PACE_AREACHART: StackableChartSpec = {
	xKey:   'week',
	series: [{ key: 'pages', label: 'Pages read' }],
	data: [
		{ week: 'Week 1', pages: 120 },
		{ week: 'Week 2', pages: 260 },
		{ week: 'Week 3', pages: 410 },
		{ week: 'Week 4', pages: 590 },
	],
};

const WORKOUT_SPLIT_DONUTCHART: DonutSpec = {
	data: [
		{ label: 'Push', value: 2 },
		{ label: 'Pull', value: 2 },
		{ label: 'Legs', value: 1 },
		{ label: 'Rest', value: 2 },
	],
};

const FITNESS_RADARCHART: ChartSpec = {
	xKey:   'category',
	series: [{ key: 'score', label: 'This month' }],
	data: [
		{ category: 'Strength',    score: 8 },
		{ category: 'Endurance',   score: 6 },
		{ category: 'Flexibility', score: 4 },
		{ category: 'Balance',     score: 5 },
		{ category: 'Speed',       score: 7 },
	],
};

const SAMPLE_EQUATIONS = ['x^2 - 2', 'sin(x)', '0.5*x + 3'];

const SAMPLE_IMAGE: ImageSpec = {
	url: 'https://picsum.photos/seed/dafink-aichat/480/320',
	alt: 'A generated illustration',
};

const SAMPLE_AUDIO: AudioSpec = {
	src:   'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
	title: 'Generated audio clip',
};

const PASTA_TABLE: TableSpec = {
	columns: [
		{ key: 'ingredient', label: 'Ingredient' },
		{ key: 'amount',     label: 'Amount' },
	],
	rows: [
		{ ingredient: 'Spaghetti',     amount: '200g' },
		{ ingredient: 'Garlic',        amount: '4 cloves, sliced' },
		{ ingredient: 'Olive oil',     amount: '60ml' },
		{ ingredient: 'Chili flakes',  amount: '1 tsp' },
		{ ingredient: 'Parsley',       amount: '2 tbsp, chopped' },
	],
};

const BENCH_PRESS_LINEPLOT: ChartSpec = {
	xKey:   'week',
	series: [{ key: 'weight', label: 'Bench press (lb)' }],
	data: [
		{ week: 1,  weight: 135 },
		{ week: 3,  weight: 145 },
		{ week: 5,  weight: 150 },
		{ week: 7,  weight: 160 },
		{ week: 9,  weight: 165 },
		{ week: 11, weight: 175 },
	],
};

const WORKOUT_SPLIT_TABLE: TableSpec = {
	columns: [
		{ key: 'day',   label: 'Day' },
		{ key: 'focus', label: 'Focus' },
	],
	rows: [
		{ day: 'Monday',    focus: 'Push (chest, shoulders, triceps)' },
		{ day: 'Tuesday',   focus: 'Pull (back, biceps)' },
		{ day: 'Wednesday', focus: 'Legs' },
		{ day: 'Thursday',  focus: 'Rest' },
		{ day: 'Friday',    focus: 'Full body' },
		{ day: 'Saturday',  focus: 'Optional cardio' },
		{ day: 'Sunday',    focus: 'Rest' },
	],
};

const READING_LIST_TABLE: TableSpec = {
	columns: [
		{ key: 'title', label: 'Title' },
		{ key: 'genre', label: 'Genre' },
		{ key: 'pages', label: 'Pages' },
	],
	rows: [
		{ title: 'Klara and the Sun',  genre: 'Literary fiction', pages: 303 },
		{ title: 'Project Hail Mary',  genre: 'Sci-fi',           pages: 496 },
		{ title: 'Atomic Habits',      genre: 'Non-fiction',      pages: 320 },
	],
};

const INSTALL_SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'Installation — DaFink UI Docs', url: 'https://ui.ryangarfinkel.dev/installation' },
	{ title: 'dafink-ui — npm',                url: 'https://www.npmjs.com/package/dafink-ui' },
	{ title: 'DaFink UI CLI source — GitHub',  url: 'https://github.com/RyanGarfinkel/DaFinkUI/tree/main/packages/cli' },
];

const PASTA_SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'Spaghetti Aglio e Olio Recipe',   url: 'https://www.seriouseats.com/spaghetti-aglio-e-olio-recipe' },
	{ title: 'Aglio e Olio — Bon Appétit',      url: 'https://www.bonappetit.com/recipe/spaghetti-aglio-e-olio' },
	{ title: 'Classic Aglio e Olio — NYT Cooking', url: 'https://cooking.nytimes.com/recipes/1017256-spaghetti-aglio-e-olio' },
];

const WORKOUT_SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'Push Pull Legs: The Complete Guide', url: 'https://www.strongerbyscience.com/push-pull-legs/' },
	{ title: 'PPL Split for Beginners — r/Fitness Wiki', url: 'https://thefitness.wiki/routines/push-pull-legs/' },
	{ title: 'Push/Pull/Legs Split — Bodybuilding.com', url: 'https://www.bodybuilding.com/content/push-pull-legs-split.html' },
];

const READING_SEARCH_LINKS: ToolCallLink[] = [
	{ title: 'The Best Reviewed Books of 2025', url: 'https://www.goodreads.com/list/show/best-books-2025' },
	{ title: '2025 in Books — The New York Times', url: 'https://www.nytimes.com/2025/books/best-books-2025.html' },
	{ title: "NPR's Book Picks for 2025",       url: 'https://www.npr.org/2025/books-we-love' },
];

const INSTALL_MESSAGES: ChatMessage[] = [
	{ id: 1, kind: 'message', sender: 'ai',   text: 'Hi! I’m the DaFink UI assistant. Ask me anything about installing or using components.' },
	{ id: 2, kind: 'message', sender: 'user', text: 'How do I install a component?' },
	{
		id: 3, kind: 'message', sender: 'ai',
		text: 'Run this in your project root — it copies the component source straight into your repo:\\n\\n\`\`\`bash\\nnpx dafink-ui add button\\n\`\`\`',
		toolCalls: [
			{ id: 't1', kind: 'thought', title: 'Thinking',   detail: 'The user wants the install command — check the CLI docs for the exact syntax before answering.' },
			{ id: 't2', kind: 'search',  title: 'Web search', detail: '"dafink-ui cli install command"', links: INSTALL_SEARCH_LINKS },
			{ id: 't3', kind: 'tool',    title: 'Read file',  detail: 'packages/cli/src/commands/add.ts', result: 'Found the add command implementation' },
		],
	},
	{ id: 4, kind: 'message', sender: 'user', text: 'Does it work with dark mode out of the box?' },
	{ id: 5, kind: 'message', sender: 'ai',   text: 'Yes — every component is built on [design tokens](https://ui.ryangarfinkel.dev/theme), so it adapts automatically to your theme’s light and dark palettes.' },
];

const PASTA_MESSAGES: ChatMessage[] = [
	{ id: 6, kind: 'message', sender: 'user', text: 'What’s a good pasta recipe for a weeknight?' },
	{
		id: 7, kind: 'message', sender: 'ai',
		text: \`Here's a quick weeknight pasta you can have on the table in 20 minutes:\\n\\n\\\`\\\`\\\`table\\n\${JSON.stringify(PASTA_TABLE)}\\n\\\`\\\`\\\`\`,
		toolCalls: [
			{ id: 'p1', kind: 'search', title: 'Web search', detail: '"quick pasta aglio e olio recipe"', links: PASTA_SEARCH_LINKS },
		],
	},
];

const WORKOUT_MESSAGES: ChatMessage[] = [
	{ id: 8, kind: 'message', sender: 'user', text: 'Can you put together a push day routine for me?' },
	{
		id: 9, kind: 'message', sender: 'ai',
		text: \`A simple push/pull/legs split spread across the week looks like this:\\n\\n\\\`\\\`\\\`table\\n\${JSON.stringify(WORKOUT_SPLIT_TABLE)}\\n\\\`\\\`\\\`\`,
		toolCalls: [
			{ id: 'w1', kind: 'search', title: 'Web search', detail: '"balanced push pull legs split for beginners"', links: WORKOUT_SEARCH_LINKS },
		],
	},
	{ id: 10, kind: 'message', sender: 'user', text: 'What should my bench press progress look like over the next few months?' },
	{
		id: 11, kind: 'message', sender: 'ai',
		text: \`Here's what a realistic bench press progression over a few months could look like:\\n\\n\\\`\\\`\\\`lineplot\\n\${JSON.stringify(BENCH_PRESS_LINEPLOT)}\\n\\\`\\\`\\\`\`,
		toolCalls: [
			{ id: 'w2', kind: 'thought', title: 'Thinking', detail: 'No existing log was shared — build an illustrative progression instead of guessing at real numbers.' },
		],
	},
	{ id: 16, kind: 'message', sender: 'user', text: 'Quick one — how do I calculate my BMI?' },
	{
		id: 17, kind: 'message', sender: 'ai',
		text: 'Body Mass Index is your weight divided by your height squared:\\n\\n$$BMI = \\\\frac{weight_{kg}}{height_m^2}$$\\n\\nFor example, at 80 kg and 1.8 m, that\\'s $80 / 1.8^2 \\\\approx 24.7$ — solidly in the "normal weight" range (18.5–24.9). It\\'s a rough screening number, not a fitness metric — it doesn\\'t account for muscle mass.',
	},
];

const READING_MESSAGES: ChatMessage[] = [
	{ id: 12, kind: 'message', sender: 'user', text: 'Any book recommendations for this fall?' },
	{
		id: 13, kind: 'message', sender: 'ai',
		text: \`A few worth picking up next:\\n\\n\\\`\\\`\\\`table\\n\${JSON.stringify(READING_LIST_TABLE)}\\n\\\`\\\`\\\`\`,
		toolCalls: [
			{ id: 'rd1', kind: 'search', title: 'Web search', detail: '"best-reviewed books 2025"', links: READING_SEARCH_LINKS },
		],
	},
];

const PLANNING_MESSAGES: ChatMessage[] = [
	{ id: 14, kind: 'message', sender: 'user', text: 'Can you help me plan something new to try this week?' },
	{
		id: 15, kind: 'message', sender: 'ai',
		text: 'Happy to help — first, what should we focus on?',
		questionnaire: {
			type:        'radio',
			question:    'What should we focus on?',
			description: 'Pick a direction, or describe something else.',
			options: [
				{ id: 'cooking', label: 'Cooking', description: 'A new recipe to try this week' },
				{ id: 'gym',     label: 'Fitness',  description: 'A workout plan to follow' },
				{ id: 'reading', label: 'Reading',  description: 'Something new to read' },
			],
			otherPlaceholder: 'Describe something else…',
		},
	},
];

const INSTALL_THREAD_REFS: ThreadRef[] = [
	{ id: 'thread-install-1', rootMessageId: 3, snippet: 'Run this in your project root — it copies…', createdAt: '2 days ago', replyCount: 2 },
	{ id: 'thread-install-2', rootMessageId: 5, snippet: 'Yes — every component is built on design t…', createdAt: '1 day ago', replyCount: 2 },
];

const WORKOUT_THREAD_REFS: ThreadRef[] = [
	{ id: 'thread-workout-1', rootMessageId: 9, snippet: 'A simple push/pull/legs split spread across…', createdAt: '3 hours ago', replyCount: 3 },
];

const THREAD_MESSAGES: Record<string, ChatMessage[]> = {
	'thread-install-1': [
		{ id: 201, kind: 'message', sender: 'user', text: 'Does the CLI work with pnpm or yarn too, or only npm?' },
		{ id: 202, kind: 'message', sender: 'ai',   text: 'Yep — \`npx\` is just npm’s package runner; pnpm and yarn both ship an equivalent (\`pnpm dlx dafink-ui add button\`, \`yarn dlx dafink-ui add button\`), so pick whichever your project already uses.' },
	],
	'thread-install-2': [
		{ id: 203, kind: 'message', sender: 'user', text: 'Can I swap the accent color without touching every component?' },
		{ id: 204, kind: 'message', sender: 'ai',   text: 'Yes — change the \`--color-brand\` token in your \`globals.css\` and every component using \`bg-brand\`/\`text-brand\` picks it up automatically, no per-component edits needed.' },
	],
	'thread-workout-1': [
		{ id: 205, kind: 'message', sender: 'user', text: 'How long should I rest between sets on push day?' },
		{ id: 206, kind: 'message', sender: 'ai',   text: 'For compound lifts (bench, overhead press) aim for 2–3 minutes; for isolation work (lateral raises, triceps pushdowns) 60–90 seconds is plenty.' },
		{ id: 207, kind: 'message', sender: 'user', text: 'Good to know, thanks.' },
	],
};

const THREAD_FETCH_DELAY_MS = 600;

const fetchThread = (threadId: string): Promise<ChatMessage[]> =>
	new Promise((resolve) => {
		setTimeout(() => resolve(THREAD_MESSAGES[threadId] ?? []), THREAD_FETCH_DELAY_MS);
	});

const INITIAL_CHATS: ChatEntry[] = [
	{ id: '1', title: 'Installing components',   messages: INSTALL_MESSAGES,  threadRefs: INSTALL_THREAD_REFS },
	{ id: '2', title: 'Weeknight pasta ideas',   messages: PASTA_MESSAGES,    threadRefs: [] },
	{ id: '3', title: 'Push day workout plan',   messages: WORKOUT_MESSAGES,  threadRefs: WORKOUT_THREAD_REFS },
	{ id: '4', title: 'Books to read this fall', messages: READING_MESSAGES,  threadRefs: [] },
	{ id: '5', title: 'Something new this week', messages: PLANNING_MESSAGES, threadRefs: [] },
];

const COMMANDS: CommandOption[] = [
	{ name: 'compact',    description: 'Summarize this conversation to save space' },
	{ name: 'clear',      description: 'Clear all messages in this chat' },
	{ name: 'rename',     description: 'Rename this chat' },
	{ name: 'plot',       description: 'Show a sample line chart: median home prices over the years' },
	{ name: 'barchart',   description: 'Show a sample bar chart: npm downloads by month' },
	{ name: 'areachart',  description: 'Show a sample area chart: pages read per week' },
	{ name: 'donutchart', description: 'Show a sample donut chart: workout split breakdown' },
	{ name: 'radarchart', description: 'Show a sample radar chart: fitness category scores' },
	{ name: 'math',       description: 'Show a sample math block: plot a few equations' },
	{ name: 'formula',    description: 'Show a sample math formula: the quadratic formula' },
	{ name: 'image',      description: 'Generate a sample image (shows a loading skeleton first)' },
	{ name: 'audio',      description: 'Generate a sample audio clip (shows a loading skeleton first)' },
];

const PlusIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M12 5v14M5 12h14' />
	</svg>
);

const PencilIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
	</svg>
);

const TrashIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6' />
	</svg>
);

const PaperclipIcon = () => (
	<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='m21.44 11.05-9.19 9.19a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L9.41 17.41a1.5 1.5 0 0 1-2.12-2.12l8.49-8.49' />
	</svg>
);

const SendIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		aria-hidden='true'
		className='motion-safe:transition-transform motion-safe:duration-[var(--duration-fast)] group-hover:-rotate-12'
	>
		<path d='m22 2-7 20-4-9-9-4Z' />
		<path d='M22 2 11 13' />
	</svg>
);

const StopIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
		<rect x='6' y='6' width='12' height='12' rx='2' />
	</svg>
);

const CloseIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<path d='M18 6 6 18M6 6l12 12' />
	</svg>
);

const ReplyIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='9 14 4 9 9 4' />
		<path d='M20 20v-7a4 4 0 0 0-4-4H4' />
	</svg>
);

const CopyIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
		<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
	</svg>
);

const CheckIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
);

const SearchIcon = () => (
	<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
		<circle cx='11' cy='11' r='8' />
		<path d='m21 21-4.35-4.35' />
	</svg>
);

// Calls your own API route (or a direct call to your model provider) with the user's
// message and the conversation history, and returns the assistant's reply. Everything
// downstream (typing indicator, streaming reveal, tool-call trace, table/chart rendering)
// keeps working unchanged as long as this keeps returning { text, toolCalls? }.
const sendMessage = async (message: string, history: AiChatHistoryMessage[]): Promise<AiChatReply> => {
	const res = await fetch('/api/ai-chat', {
		method:  'POST',
		headers: { 'Content-Type': 'application/json' },
		body:    JSON.stringify({ message, history }),
	});
	if(!res.ok) throw new Error('Failed to fetch AI reply');
	return res.json();
};

const buildHistory = (messages: ChatMessage[]): AiChatHistoryMessage[] =>
	messages
		.filter((m): m is ChatTextMessage => m.kind === 'message')
		.map((m) => ({ role: m.sender === 'user' ? 'user' as const : 'assistant' as const, text: m.text }));

const NEAR_BOTTOM_THRESHOLD_PX = 80;

const Divider = ({ label }: { label: string }) => (
	<div className='flex items-center gap-3'>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
		<span className='shrink-0 text-xs font-medium text-text-muted'>{label}</span>
		<div className='h-0 flex-1 border-t border-dashed border-surface-border' />
	</div>
);

interface ThreadIndicatorProps {
	align:      'start' | 'end';
	messageId:  number;
	text:       string;
	threadRef:  ThreadRef | undefined;
	replyCount: number;
	loading:    boolean;
	onReply:    () => void;
}

const HOVER_ACTION_BUTTON_CLASSES = 'flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted opacity-0 motion-safe:transition-opacity motion-safe:duration-[var(--duration-fast)] group-hover:opacity-100 focus-visible:opacity-100 hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring';

// Hover/focus-revealed, same reveal behavior as the reply trigger next to it regardless of
// whether a thread exists yet — copying is a lightweight secondary action, not something
// that needs to stay pinned open like the reply-count badge does.
const CopyMessageButton = ({ text }: { text: string }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try
		{
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
		catch
		{
			// clipboard unavailable, silently ignore
		}
	};

	return (
		<Tooltip content={copied ? 'Copied' : 'Copy'}>
			<button
				type='button'
				aria-label={copied ? 'Copied' : 'Copy message'}
				onClick={handleCopy}
				className={HOVER_ACTION_BUTTON_CLASSES}
			>
				{copied ? <CheckIcon /> : <CopyIcon />}
			</button>
		</Tooltip>
	);
};

// Hover/focus-revealed reply trigger on a message with no thread yet; an always-visible
// reply-count badge once one exists. The trigger stays in the tab order (opacity-0, not
// hidden), so it's reachable and reveals itself on its own focus-visible even though the
// row wasn't hovered. Identified by a plain DOM id (not a ref) so closing a thread can
// hand focus back with a simple document.getElementById lookup — the same approach
// CommandPalette already uses for its active-option scroll-into-view.
// The hover-only copy button always sits on the outside (away from the bubble), with the
// reply control (badge or hover icon) flush against the bubble edge — otherwise the copy
// button's reserved layout space (it's opacity-0, not hidden, to stay keyboard-reachable)
// would push the reply control away from that edge whenever the row isn't hovered.
const ThreadIndicator = ({ align, messageId, text, threadRef, replyCount, loading, onReply }: ThreadIndicatorProps) => {
	const copyButton = <CopyMessageButton text={text} />;

	// A thread with zero replies (just started, nobody's answered yet) has nothing worth
	// badging — fall back to the same hover-revealed trigger a message with no thread gets.
	const replyControl = threadRef && (loading || replyCount > 0) ? (
		<button
			id={\`thread-trigger-\${messageId}\`}
			type='button'
			onClick={onReply}
			className='inline-flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
		>
			<Badge variant='outline' className='gap-1 text-text-muted motion-safe:transition-colors motion-safe:duration-[var(--duration-fast)] hover:border-surface-border-hover hover:text-text'>
				<ReplyIcon />
				{loading ? 'Loading…' : \`\${replyCount} message\${replyCount === 1 ? '' : 's'}\`}
			</Badge>
		</button>
	) : (
		<button
			id={\`thread-trigger-\${messageId}\`}
			type='button'
			aria-label='Reply in thread'
			onClick={onReply}
			className={HOVER_ACTION_BUTTON_CLASSES}
		>
			<ReplyIcon />
		</button>
	);

	return (
		<div className={['flex w-full items-center gap-1', align === 'end' ? 'justify-end' : 'justify-start'].join(' ')}>
			{align === 'end' ? (
				<>
					{copyButton}
					{replyControl}
				</>
			) : (
				<>
					{replyControl}
					{copyButton}
				</>
			)}
		</div>
	);
};

interface ChatMessageRowProps {
	message:               ChatMessage;
	onStreamComplete:      (messageId: number) => void;
	onQuestionnaireAnswer: (messageId: number, value: string) => void;
	renderTrailing?:       (m: ChatTextMessage) => ReactNode;
}

// Shared by the main pane and ThreadPanel: a thread is just another list of the same
// ChatMessage shape, so the bubble/tool-call/questionnaire/streaming rendering only
// needs to live once. The streaming-complete guard (is this still the active streaming
// message?) lives in each pane's own onStreamComplete, since the main pane and an open
// thread stream independently of each other. \`renderTrailing\` is only supplied by the
// main pane, to slot the reply-in-thread trigger under each row.
const ChatMessageRow = ({ message: m, onStreamComplete, onQuestionnaireAnswer, renderTrailing }: ChatMessageRowProps) => {
	if(m.kind === 'checkpoint') return <Divider label={m.label} />;

	if(m.sender === 'user') {
		return (
			<div className='group flex flex-col items-end gap-1.5'>
				{m.attachment && <Attachment name={m.attachment.name} size={m.attachment.size} />}
				{m.text && <Message variant='sent'>{m.text}</Message>}
				{renderTrailing?.(m)}
			</div>
		);
	}

	return (
		<div className='group flex flex-col gap-1.5'>
			{m.toolCalls && <ToolCallTrace toolCalls={m.toolCalls} />}
			<Message variant='received' bubble={false}>
				{m.generating === 'image' ? (
					<SkeletonImage aspectRatio='4/3' className='w-full max-w-xs' />
				) : m.generating === 'audio' ? (
					<div className='flex w-56 items-center gap-2'>
						<Skeleton className='h-9 w-9 shrink-0 rounded-full' />
						<Skeleton className='h-2 flex-1 rounded-full' />
					</div>
				) : (
					<StreamingMessage
						text={m.text}
						streaming={!!m.animate}
						onComplete={() => onStreamComplete(m.id)}
					/>
				)}
			</Message>
			{m.questionnaire && (
				<Questionnaire
					step={m.questionnaire}
					answer={m.questionnaireAnswer}
					onAnswer={(value) => onQuestionnaireAnswer(m.id, value)}
				/>
			)}
			{renderTrailing?.(m)}
		</div>
	);
};

export const AiChat = () => {
	const [chats, setChats] = useState<ChatEntry[]>(INITIAL_CHATS);
	const [activeId, setActiveId] = useState<string | null>(INITIAL_CHATS[0].id);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draftTitle, setDraftTitle] = useState('');
	const [draft, setDraft] = useState('');
	const [attachedFile, setAttachedFile] = useState<File | null>(null);
	const [typingChatId, setTypingChatId] = useState<string | null>(null);
	const [streamingChatId, setStreamingChatId] = useState<string | null>(null);
	const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
	const [chatPendingDeletion, setChatPendingDeletion] = useState<ChatEntry | null>(null);
	const [threadMessages, setThreadMessages] = useState<Record<string, ChatMessage[]>>({});
	const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
	const [activeThread, setActiveThread] = useState<{ chatId: string; threadId: string; rootMessageId: number } | null>(null);
	const [threadDraft, setThreadDraft] = useState('');
	const [threadTypingId, setThreadTypingId] = useState<string | null>(null);
	const [threadStreamingId, setThreadStreamingId] = useState<string | null>(null);
	const [threadStreamingMessageId, setThreadStreamingMessageId] = useState<number | null>(null);
	const [threadSearchOpen, setThreadSearchOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const nextChatId = useRef(INITIAL_CHATS.length + 1);
	const nextThreadId = useRef(1);
	const nextMessageId = useRef(
		INSTALL_MESSAGES.length + PASTA_MESSAGES.length + WORKOUT_MESSAGES.length + READING_MESSAGES.length + PLANNING_MESSAGES.length + 1
	);
	const pendingReplyRef = useRef(0);
	const pendingThreadReplyRef = useRef(0);
	// True as long as the user hasn't scrolled away from the bottom. Auto-scroll (below)
	// only acts while this is true, so reading back through history — including while a
	// reply is still streaming in — never gets yanked back down. Reset to true whenever
	// the user does something that should re-anchor the view (send a message, switch chats).
	const shouldAutoScrollRef = useRef(true);

	const activeChat = chats.find((c) => c.id === activeId) ?? null;
	const isTyping = typingChatId === activeId;
	const isGenerating = isTyping || streamingChatId === activeId;
	const isThreadGenerating = activeThread !== null && (threadTypingId === activeThread.threadId || threadStreamingId === activeThread.threadId);
	const isThreadTyping = activeThread !== null && threadTypingId === activeThread.threadId;

	useEffect(() => {
		const container = containerRef.current;
		const content   = contentRef.current;
		if(!container || !content) return;

		const handleScroll = () => {
			const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
			shouldAutoScrollRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
		};
		container.addEventListener('scroll', handleScroll, { passive: true });

		const scrollToBottom = () => {
			if(shouldAutoScrollRef.current) container.scrollTop = container.scrollHeight;
		};
		scrollToBottom();

		// Content keeps growing for as long as a reply streams in (typewriter reveal, table
		// rows appending, favicon images loading), so this stays observing for the effect's
		// whole lifetime rather than a fixed window — safe to leave running indefinitely
		// since scrollToBottom above already no-ops once the user has scrolled away.
		const observer = new ResizeObserver(scrollToBottom);
		observer.observe(content);

		return () => {
			container.removeEventListener('scroll', handleScroll);
			observer.disconnect();
		};
	}, [chats, isTyping, activeId]);

	useEffect(() => {
		return () => { pendingReplyRef.current++; pendingThreadReplyRef.current++; };
	}, []);

	const handleNewChat = () => {
		const chat: ChatEntry = { id: String(nextChatId.current++), title: 'New chat', messages: [], threadRefs: [] };
		shouldAutoScrollRef.current = true;
		setChats((prev) => [chat, ...prev]);
		setActiveId(chat.id);
		setDraft('');
		setAttachedFile(null);
	};

	const handleSelectChat = (id: string) => {
		shouldAutoScrollRef.current = true;
		setActiveId(id);
		setDraft('');
		setAttachedFile(null);
	};

	const handleStartEdit = (chat: ChatEntry) => {
		setEditingId(chat.id);
		setDraftTitle(chat.title);
	};

	const handleCommitEdit = () => {
		const title = draftTitle.trim();
		if(title) setChats((prev) => prev.map((c) => (c.id === editingId ? { ...c, title } : c)));
		setEditingId(null);
	};

	const handleCancelEdit = () => setEditingId(null);

	const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if(e.key === 'Enter') { e.preventDefault(); handleCommitEdit(); }
		if(e.key === 'Escape') { e.preventDefault(); handleCancelEdit(); }
	};

	const handleDelete = (id: string) => {
		setChats((prev) => {
			const next = prev.filter((c) => c.id !== id);
			if(activeId === id) setActiveId(next[0]?.id ?? null);
			return next;
		});
		if(editingId === id) setEditingId(null);
	};

	const handleDeleteOpenChange = (open: boolean) => {
		if(!open) setChatPendingDeletion(null);
	};

	const handleConfirmDelete = () => {
		if(!chatPendingDeletion) return;
		handleDelete(chatPendingDeletion.id);
		setChatPendingDeletion(null);
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if(file) setAttachedFile(file);
		e.target.value = '';
	};

	const queueAiReply = (chatId: string, message: string, history: AiChatHistoryMessage[]) => {
		setTypingChatId(chatId);
		const requestId = ++pendingReplyRef.current;

		sendMessage(message, history)
			.then((reply) => {
				if(pendingReplyRef.current !== requestId) return;
				setTypingChatId((prev) => (prev === chatId ? null : prev));
				const aiMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: reply.text, animate: true, toolCalls: reply.toolCalls };
				setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, aiMessage] } : c)));
				setStreamingChatId(chatId);
				setStreamingMessageId(aiMessage.id);
			})
			.catch(() => {
				if(pendingReplyRef.current !== requestId) return;
				setTypingChatId((prev) => (prev === chatId ? null : prev));
				const errorMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: 'Something went wrong — try sending that again.' };
				setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, errorMessage] } : c)));
			});
	};

	const handleStop = () => {
		if(typingChatId)
		{
			pendingReplyRef.current++;
			setTypingChatId(null);
			return;
		}
		if(streamingChatId && streamingMessageId !== null)
		{
			const chatId    = streamingChatId;
			const messageId = streamingMessageId;
			setChats((prev) => prev.map((c) => (c.id !== chatId ? c : {
				...c,
				messages: c.messages.map((m) => (m.kind === 'message' && m.id === messageId
					? { ...m, animate: false }
					: m
				)),
			})));
			setStreamingChatId(null);
			setStreamingMessageId(null);
		}
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if(!activeChat || isGenerating) return;
		const text = draft.trim();
		if(!text && !attachedFile) return;

		const chatId = activeChat.id;
		const attachment: MessageAttachment | undefined = attachedFile
			? { name: attachedFile.name, size: \`\${Math.max(1, Math.round(attachedFile.size / 1024))} KB\` }
			: undefined;
		const history = buildHistory(activeChat.messages);
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text, attachment };
		shouldAutoScrollRef.current = true;
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, userMessage] } : c)));
		setDraft('');
		setAttachedFile(null);
		queueAiReply(chatId, text, history);
	};

	const handleQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeChat || !value.trim()) return;
		const chatId = activeChat.id;
		const history = buildHistory(activeChat.messages);
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text: value };
		shouldAutoScrollRef.current = true;
		setChats((prev) => prev.map((c) => {
			if(c.id !== chatId) return c;
			const updated = c.messages.map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, questionnaireAnswer: value } : m));
			return { ...c, messages: [...updated, userMessage] };
		}));
		queueAiReply(chatId, value, history);
	};

	const handleMainStreamComplete = (messageId: number) => {
		if(messageId !== streamingMessageId) return;
		setChats((prev) => prev.map((c) => (c.id !== streamingChatId ? c : {
			...c,
			messages: c.messages.map((msg) => (msg.kind === 'message' && msg.id === messageId ? { ...msg, animate: false } : msg)),
		})));
		setStreamingChatId(null);
		setStreamingMessageId(null);
	};

	const getThreadRootHistory = (chatId: string, rootMessageId: number): ChatMessage[] => {
		const chat = chats.find((c) => c.id === chatId);
		if(!chat) return [];
		const rootIndex = chat.messages.findIndex((m) => m.id === rootMessageId);
		return rootIndex === -1 ? chat.messages : chat.messages.slice(0, rootIndex + 1);
	};

	// Display-only: the thread panel shows just the message the thread branched from, not
	// the whole conversation up to that point. Reply generation still needs the full history
	// (getThreadRootHistory above) so the assistant keeps that context.
	const getThreadRootMessage = (chatId: string, rootMessageId: number): ChatMessage[] => {
		const chat = chats.find((c) => c.id === chatId);
		const rootMessage = chat?.messages.find((m) => m.id === rootMessageId);
		return rootMessage ? [rootMessage] : [];
	};

	const handleOpenThread = (chatId: string, threadId: string, rootMessageId: number) => {
		setActiveThread({ chatId, threadId, rootMessageId });
		if(activeId !== chatId) setActiveId(chatId);
		setThreadDraft('');
		setThreadSearchOpen(false);
		if(threadMessages[threadId]) return;
		setLoadingThreadId(threadId);
		fetchThread(threadId).then((messages) => {
			setThreadMessages((prev) => ({ ...prev, [threadId]: messages }));
			setLoadingThreadId((prev) => (prev === threadId ? null : prev));
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
		setActiveThread({ chatId, threadId, rootMessageId });
		setThreadDraft('');
	};

	const handleCloseThread = () => {
		const rootMessageId = activeThread?.rootMessageId;
		setActiveThread(null);
		if(rootMessageId !== undefined) document.getElementById(\`thread-trigger-\${rootMessageId}\`)?.focus();
	};

	const queueThreadReply = (threadId: string, message: string, history: AiChatHistoryMessage[]) => {
		setThreadTypingId(threadId);
		const requestId = ++pendingThreadReplyRef.current;

		sendMessage(message, history)
			.then((reply) => {
				if(pendingThreadReplyRef.current !== requestId) return;
				setThreadTypingId((prev) => (prev === threadId ? null : prev));
				const aiMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: reply.text, animate: true, toolCalls: reply.toolCalls };
				setThreadMessages((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), aiMessage] }));
				setThreadStreamingId(threadId);
				setThreadStreamingMessageId(aiMessage.id);
			})
			.catch(() => {
				if(pendingThreadReplyRef.current !== requestId) return;
				setThreadTypingId((prev) => (prev === threadId ? null : prev));
				const errorMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text: 'Something went wrong — try sending that again.' };
				setThreadMessages((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), errorMessage] }));
			});
	};

	const handleThreadStop = () => {
		if(!activeThread) return;
		const { threadId } = activeThread;
		if(threadTypingId === threadId)
		{
			pendingThreadReplyRef.current++;
			setThreadTypingId(null);
			return;
		}
		if(threadStreamingId === threadId && threadStreamingMessageId !== null)
		{
			const messageId = threadStreamingMessageId;
			setThreadMessages((prev) => ({
				...prev,
				[threadId]: (prev[threadId] ?? []).map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, animate: false } : m)),
			}));
			setThreadStreamingId(null);
			setThreadStreamingMessageId(null);
		}
	};

	const handleThreadSubmit = (e: FormEvent) => {
		e.preventDefault();
		if(!activeThread || isThreadGenerating) return;
		const text = threadDraft.trim();
		if(!text) return;

		const { chatId, threadId, rootMessageId } = activeThread;
		const rootHistory = getThreadRootHistory(chatId, rootMessageId);
		const history = [...buildHistory(rootHistory), ...buildHistory(threadMessages[threadId] ?? [])];
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text };
		setThreadMessages((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), userMessage] }));
		setThreadDraft('');
		queueThreadReply(threadId, text, history);
	};

	const handleThreadStreamComplete = (messageId: number) => {
		if(!activeThread || messageId !== threadStreamingMessageId) return;
		const threadId = activeThread.threadId;
		setThreadMessages((prev) => ({
			...prev,
			[threadId]: (prev[threadId] ?? []).map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, animate: false } : m)),
		}));
		setThreadStreamingId(null);
		setThreadStreamingMessageId(null);
	};

	const handleThreadQuestionnaireAnswer = (messageId: number, value: string) => {
		if(!activeThread || !value.trim()) return;
		const { chatId, threadId, rootMessageId } = activeThread;
		const rootHistory = getThreadRootHistory(chatId, rootMessageId);
		const existing = threadMessages[threadId] ?? [];
		const history = [...buildHistory(rootHistory), ...buildHistory(existing)];
		const userMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text: value };
		setThreadMessages((prev) => {
			const current = prev[threadId] ?? [];
			const updated = current.map((m) => (m.kind === 'message' && m.id === messageId ? { ...m, questionnaireAnswer: value } : m));
			return { ...prev, [threadId]: [...updated, userMessage] };
		});
		queueThreadReply(threadId, value, history);
	};

	const pushAiMessage = (chatId: string, text: string) => {
		const message: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'ai', text };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, message] } : c)));
	};

	const pushGeneratingMessage = (chatId: string, generating: 'image' | 'audio', text: string, delay: number) => {
		const id = nextMessageId.current++;
		const message: ChatMessage = { id, kind: 'message', sender: 'ai', text: '', generating };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, message] } : c)));

		setTimeout(() => {
			setChats((prev) => prev.map((c) => (
				c.id !== chatId ? c : {
					...c,
					messages: c.messages.map((m) => (m.kind === 'message' && m.id === id ? { ...m, generating: undefined, text } : m)),
				}
			)));
		}, delay);
	};

	const handleCommand = (command: CommandOption) => {
		if(!activeChat) return;
		const chatId = activeChat.id;

		const commandMessage: ChatMessage = { id: nextMessageId.current++, kind: 'message', sender: 'user', text: \`/\${command.name}\` };
		setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, commandMessage] } : c)));

		switch(command.name)
		{
			case 'compact': {
				const count = activeChat.messages.length;
				if(count === 0) return;
				const checkpoint: ChatMessage = {
					id:    nextMessageId.current++,
					kind:  'checkpoint',
					label: \`Compacted · \${count} message\${count === 1 ? '' : 's'} summarized\`,
				};
				setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, checkpoint] } : c)));
				break;
			}

			case 'clear':
				setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: [] } : c)));
				break;

			case 'rename':
				handleStartEdit(activeChat);
				break;

			case 'plot':
				pushAiMessage(chatId, \`Here's the trend in median home prices over the last several years:\\n\\n\\\`\\\`\\\`lineplot\\n\${JSON.stringify(HOME_PRICE_LINEPLOT)}\\n\\\`\\\`\\\`\`);
				break;

			case 'barchart':
				pushAiMessage(chatId, \`Here's npm downloads by month:\\n\\n\\\`\\\`\\\`barchart\\n\${JSON.stringify(DOWNLOADS_BARCHART)}\\n\\\`\\\`\\\`\`);
				break;

			case 'areachart':
				pushAiMessage(chatId, \`Here's pages read per week:\\n\\n\\\`\\\`\\\`areachart\\n\${JSON.stringify(READING_PACE_AREACHART)}\\n\\\`\\\`\\\`\`);
				break;

			case 'donutchart':
				pushAiMessage(chatId, \`Here's how a weekly workout split breaks down:\\n\\n\\\`\\\`\\\`donutchart\\n\${JSON.stringify(WORKOUT_SPLIT_DONUTCHART)}\\n\\\`\\\`\\\`\`);
				break;

			case 'radarchart':
				pushAiMessage(chatId, \`Here's a fitness category breakdown for this month:\\n\\n\\\`\\\`\\\`radarchart\\n\${JSON.stringify(FITNESS_RADARCHART)}\\n\\\`\\\`\\\`\`);
				break;

			case 'math':
				pushAiMessage(chatId, \`Here are a few equations plotted together:\\n\\n\\\`\\\`\\\`math\\n\${JSON.stringify({ equations: SAMPLE_EQUATIONS })}\\n\\\`\\\`\\\`\`);
				break;

			case 'formula':
				pushAiMessage(chatId, 'The quadratic formula, for solving $ax^2 + bx + c = 0$:\\n\\n$$x = \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}$$');
				break;

			case 'image':
				pushGeneratingMessage(
					chatId,
					'image',
					\`Here's the image:\\n\\n\\\`\\\`\\\`image\\n\${JSON.stringify(SAMPLE_IMAGE)}\\n\\\`\\\`\\\`\`,
					1800
				);
				break;

			case 'audio':
				pushGeneratingMessage(
					chatId,
					'audio',
					\`Here's the audio clip:\\n\\n\\\`\\\`\\\`audio\\n\${JSON.stringify(SAMPLE_AUDIO)}\\n\\\`\\\`\\\`\`,
					1800
				);
				break;
		}
	};

	const renderThreadMessage = (m: ChatMessage) => (
		<ChatMessageRow
			key={m.id}
			message={m}
			onStreamComplete={handleThreadStreamComplete}
			onQuestionnaireAnswer={handleThreadQuestionnaireAnswer}
		/>
	);

	return (
		<div>
			<div className='flex h-[32rem] w-full max-w-6xl overflow-hidden rounded-[var(--radius)] border-[length:var(--border-width)] border-surface-border'>
				<Sidebar width='w-64' height='h-full'>
					<SidebarHeader>
						<div className='flex w-full gap-1.5'>
							<Button variant='outlined' size='sm' className='flex-1 justify-center gap-1.5' onClick={handleNewChat}>
								<PlusIcon />
								New chat
							</Button>
							<Button variant='outlined' size='icon' aria-label='Search threads' onClick={() => setThreadSearchOpen(true)}>
								<SearchIcon />
							</Button>
						</div>
					</SidebarHeader>
					<SidebarSection label='Chats'>
						{chats.map((chat) => (
							editingId === chat.id ? (
								<Input
									key={chat.id}
									autoFocus
									value={draftTitle}
									onChange={(e) => setDraftTitle(e.target.value)}
									onBlur={handleCommitEdit}
									onKeyDown={handleEditKeyDown}
									aria-label='Chat title'
								/>
							) : (
								<SidebarButton
									key={chat.id}
									isActive={activeId === chat.id}
									onClick={() => handleSelectChat(chat.id)}
									actionGutter='pr-16'
									action={
										<div className='flex items-center gap-0.5'>
											<button
												type='button'
												aria-label={\`Rename \${chat.title}\`}
												onClick={() => handleStartEdit(chat)}
												className='flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
											>
												<PencilIcon />
											</button>
											<button
												type='button'
												aria-label={\`Delete \${chat.title}\`}
												onClick={() => setChatPendingDeletion(chat)}
												className='flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring'
											>
												<TrashIcon />
											</button>
										</div>
									}
								>
									{chat.title}
								</SidebarButton>
							)
						))}
						{chats.length === 0 && (
							<p className='px-3 py-2 text-xs text-text-muted'>No chats yet.</p>
						)}
					</SidebarSection>
				</Sidebar>

				<Resizable direction='horizontal' className='flex-1 min-w-0'>
					<ResizablePanel minSize={280} className='flex'>
						<div className='flex flex-1 flex-col'>
							{activeChat ? (
								<>
									<div className='border-b-[length:var(--border-width)] border-surface-border px-4 py-3'>
										<h3 className='text-base font-semibold text-text'>{activeChat.title}</h3>
									</div>
									<div className='relative flex min-h-0 flex-1 flex-col'>
										<ScrollFade ref={containerRef} direction='vertical' className='h-full' wrapperClassName='min-h-0 flex-1'>
											<div ref={contentRef} className='flex min-h-full shrink-0 flex-col gap-4 p-5 pb-28'>
												{activeChat.messages.length === 0 ? (
													<div className='flex flex-1 flex-col items-center justify-center gap-1.5 text-center'>
														<p className='font-serif text-2xl italic text-text'>Welcome back</p>
														<p className='text-sm text-text-muted'>Send a message to start the conversation.</p>
													</div>
												) : (
													<>
														<Divider label='Conversation starts here' />
														{activeChat.messages.map((m) => (
															<ChatMessageRow
																key={m.id}
																message={m}
																onStreamComplete={handleMainStreamComplete}
																onQuestionnaireAnswer={handleQuestionnaireAnswer}
																renderTrailing={(msg) => {
																	const threadRef = activeChat.threadRefs.find((t) => t.rootMessageId === msg.id);
																	return (
																		<ThreadIndicator
																			align={msg.sender === 'user' ? 'end' : 'start'}
																			messageId={msg.id}
																			text={msg.text}
																			threadRef={threadRef}
																			replyCount={threadRef ? (threadMessages[threadRef.id]?.length ?? threadRef.replyCount) : 0}
																			loading={threadRef ? loadingThreadId === threadRef.id : false}
																			onReply={() => (threadRef
																				? handleOpenThread(activeChat.id, threadRef.id, msg.id)
																				: handleStartThread(activeChat.id, msg.id)
																			)}
																		/>
																	);
																}}
															/>
														))}
													</>
												)}
												{isTyping && (
													<p className='text-xs text-text-muted'>Assistant is typing…</p>
												)}
											</div>
										</ScrollFade>
										<div className='absolute inset-x-0 bottom-0 p-4'>
											<form onSubmit={handleSubmit} className='flex w-full flex-col items-center gap-2'>
												{attachedFile && (
													<div className='flex w-full max-w-md items-center gap-2'>
														<Attachment name={attachedFile.name} size={\`\${Math.max(1, Math.round(attachedFile.size / 1024))} KB\`} />
														<Button type='button' variant='ghost' size='icon-sm' aria-label='Remove attachment' onClick={() => setAttachedFile(null)}>
															<CloseIcon />
														</Button>
													</div>
												)}
												<div className='flex w-full max-w-md items-center gap-1.5 rounded-[var(--radius-lg)] border-[length:var(--border-width)] border-surface-border bg-surface-panel p-1.5 shadow-[var(--shadow-lg)]'>
													<input
														ref={fileInputRef}
														type='file'
														onChange={handleFileChange}
														className='hidden'
														tabIndex={-1}
														aria-hidden='true'
													/>
													<Button type='button' variant='ghost' size='icon' aria-label='Attach file' disabled={isGenerating} onClick={() => fileInputRef.current?.click()}>
														<PaperclipIcon />
													</Button>
													<CommandInput
														className='min-w-0 flex-1'
														value={draft}
														onChange={setDraft}
														commands={COMMANDS}
														onCommand={handleCommand}
														placeholder='Message… (try /compact)'
														aria-label='Message'
														disabled={isGenerating}
													/>
													{isGenerating ? (
														<Button type='button' size='icon' aria-label='Stop generating' onClick={handleStop}>
															<StopIcon />
														</Button>
													) : (
														<Button type='submit' size='icon' className='group' aria-label='Send message' disabled={!draft.trim() && !attachedFile}>
															<SendIcon />
														</Button>
													)}
												</div>
											</form>
										</div>
									</div>
								</>
							) : (
								<div className='flex flex-1 items-center justify-center p-6 text-center'>
									<p className='text-sm text-text-muted'>Select or start a chat to begin.</p>
								</div>
							)}
						</div>
					</ResizablePanel>

				{activeThread && activeChat && (
					<>
						<ResizableHandle aria-label='Resize thread panel' />
						<ResizablePanel defaultSize={320} minSize={240} maxSize={480} className='flex'>
							<ThreadPanel
								title={activeChat.title}
								rootMessages={getThreadRootMessage(activeThread.chatId, activeThread.rootMessageId)}
								threadMessages={threadMessages[activeThread.threadId] ?? []}
								loading={loadingThreadId === activeThread.threadId}
								draft={threadDraft}
								onDraftChange={setThreadDraft}
								onSubmit={handleThreadSubmit}
								isGenerating={isThreadGenerating}
								isTyping={isThreadTyping}
								onStop={handleThreadStop}
								renderMessage={renderThreadMessage}
								onClose={handleCloseThread}
							/>
						</ResizablePanel>
					</>
				)}
				</Resizable>
			</div>

			<Modal open={chatPendingDeletion !== null} onOpenChange={handleDeleteOpenChange}>
				<ModalClose />
				<ModalHeader>
					<ModalTitle>Delete chat</ModalTitle>
				</ModalHeader>
				<ModalContent>
					{\`Delete "\${chatPendingDeletion?.title}"? This can't be undone.\`}
				</ModalContent>
				<ModalFooter>
					<Button variant='secondary' onClick={() => setChatPendingDeletion(null)}>Cancel</Button>
					<Button variant='destructive' onClick={handleConfirmDelete}>Delete</Button>
				</ModalFooter>
			</Modal>

			<CommandPalette open={threadSearchOpen} onClose={() => setThreadSearchOpen(false)} placeholder='Search threads…'>
				{chats.filter((c) => c.threadRefs.length > 0).map((chat) => (
					<CommandGroup key={chat.id} label={chat.title}>
						{chat.threadRefs.map((ref) => (
							<CommandItem
								key={ref.id}
								value={ref.snippet}
								icon={<ReplyIcon />}
								onSelect={() => handleOpenThread(chat.id, ref.id, ref.rootMessageId)}
							>
								{\`\${ref.snippet} · \${ref.createdAt}\`}
							</CommandItem>
						))}
					</CommandGroup>
				))}
			</CommandPalette>
		</div>
	);
};

export default AiChat;
`,
		dependencies: ['react-markdown', 'remark-gfm', 'remark-math'],
		registryDependencies: ['sidebar', 'scroll-fade', 'message', 'typewriter', 'attachment', 'button', 'input', 'command-input', 'command-palette', 'badge', 'tooltip', 'collapsible', 'timeline', 'modal', 'charts', 'function-plotter', 'table', 'date-picker', 'slider', 'formula', 'code-block', 'audioplayer', 'skeleton', 'questionnaire', 'tool-call-trace', 'resizable'],
		files: ['AiChat/AiChat.tsx', 'AiChat/ChatMarkdown.tsx', 'AiChat/StreamingMessage.tsx', 'AiChat/ThreadPanel.tsx'],
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
		registryDependencies: ['modal', 'kanban', 'sidebar', 'badge', 'avatar', 'text-shimmer', 'typewriter', 'breadcrumb', 'card', 'progress', 'count-up', 'button', 'input'],
		files: ['ProjectHub/ProjectHub.tsx'],
	},
	{
		slug: 'job-application-tracker',
		name: 'Job application tracker',
		category: 'Dashboards',
		description: 'A job search tracker with a Board / Table toggle — the table doubles as an editable grid (role, company, stage, work type, location, applied date, and salary all edit in place, no need to open the board). The header carries two search-wide actions next to the title: View CV opens a base resume in a new tab, and Tailor resume is a disabled placeholder for a future AI-assisted rewrite (marked "Coming soon" — no AI is wired up). The board groups applications into five drag-and-drop stages — Wishlist, Applied, Interviewing, Offer, Rejected — using a neutral, bespoke card (company avatar and role/company on the left, the work-type badge stacked over the applied date in the top-right corner, then location/salary/a resume indicator/the details button along the bottom, and a notes preview underneath) and a wide, three-column details modal (role, company, stage, work type, location, salary, applied date, contact, job posting URL, an uploadable per-application resume attachment, and notes) built specifically for this block, independent of the generic Kanban block’s card and popup. Installing it copies a folder, not a single file: JobApplicationTracker.tsx (the orchestrator, including the board’s drag-and-drop, its droppable columns, and the table’s inline-editable cells) plus two sibling pieces it imports directly, ApplicationCard.tsx (the draggable card face) and ApplicationDetailsModal.tsx (the shared modal used by both views for the fields that don’t fit inline, like notes and the resume).',
		usage: `'use client';

import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCorners, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import ApplicationCard, { type ApplicationStage, type ApplicationStatus, type JobApplication, STAGES } from '@/src/blocks/JobApplicationTracker/ApplicationCard';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ToggleGroup, ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';
import DataTable, { type ColumnDef } from '@/src/components/DataTable/DataTable';
import ApplicationDetailsModal from '@/src/blocks/JobApplicationTracker/ApplicationDetailsModal';
import { Select } from '@/src/components/Select/Select';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import Input from '@/src/components/Input/Input';
import { useRef, useState } from 'react';

// A single base CV shared across the whole search — distinct from the
// per-application resume attached in each card's details modal.
const MASTER_CV = {
	name: 'Resume_MasterCopy.pdf',
	url:  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
};

const INITIAL_APPLICATIONS: JobApplication[] = [
	{
		id: 'job-1',
		role: 'Frontend Engineer',
		company: 'Notion',
		status: 'wishlist',
		workType: 'Remote',
		location: 'Remote (US)',
		notes: 'Referred by a former teammate — reaching out before applying.',
	},
	{
		id: 'job-2',
		role: 'Product Designer',
		company: 'Linear',
		status: 'wishlist',
		workType: 'Remote',
		location: 'Remote (US)',
		notes: 'Strong portfolio fit, role posted this week.',
	},
	{
		id: 'job-3',
		role: 'Senior Frontend Engineer',
		company: 'Stripe',
		status: 'applied',
		workType: 'Hybrid',
		location: 'San Francisco, CA',
		salary: '$170k–$210k',
		appliedDate: '2026-08-15T00:00:00.000Z',
		url: 'https://stripe.com/jobs',
		contact: 'Jamie Lin (referral)',
		notes: 'Applied through a referral.',
		resume: { name: 'Resume_SFE_Stripe.pdf', size: '214 KB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
	},
	{
		id: 'job-4',
		role: 'Full Stack Engineer',
		company: 'Vercel',
		status: 'applied',
		workType: 'Remote',
		location: 'Remote (US)',
		appliedDate: '2026-08-20T00:00:00.000Z',
		notes: 'Applied via the careers page.',
	},
	{
		id: 'job-5',
		role: 'Frontend Engineer',
		company: 'Figma',
		status: 'interviewing',
		workType: 'Onsite',
		location: 'San Francisco, CA',
		salary: '$160k–$195k',
		appliedDate: '2026-08-05T00:00:00.000Z',
		contact: 'Priya Shah (recruiter)',
		notes: 'Onsite loop scheduled after two strong screens.',
		resume: { name: 'Resume_FE_Figma.pdf', size: '198 KB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
	},
	{
		id: 'job-6',
		role: 'Product Engineer',
		company: 'Ramp',
		status: 'offer',
		workType: 'Hybrid',
		location: 'New York, NY',
		salary: '$185k + equity',
		appliedDate: '2026-07-28T00:00:00.000Z',
		notes: 'Offer received, negotiating start date and equity.',
	},
	{
		id: 'job-7',
		role: 'Frontend Engineer',
		company: 'Airbnb',
		status: 'rejected',
		workType: 'Onsite',
		location: 'San Francisco, CA',
		appliedDate: '2026-07-10T00:00:00.000Z',
		notes: 'Passed after the final round — asked for feedback.',
	},
];

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

interface InlineDateFieldProps
{
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

interface BoardColumnProps
{
	stage:        ApplicationStage;
	applications: JobApplication[];
	onOpen:       (application: JobApplication) => void;
}

const BoardColumn = ({ stage, applications, onOpen }: BoardColumnProps) =>
{
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

export const JobApplicationTracker = () =>
{
	const [applications, setApplications] = useState<JobApplication[]>(INITIAL_APPLICATIONS);
	const [view, setView]                 = useState<TrackerView>('board');
	const [selectedId, setSelectedId]     = useState<string | null>(null);
	const [pendingNewId, setPendingNewId] = useState<string | null>(null);
	const [activeId, setActiveId]         = useState<string | null>(null);
	const newApplicationCounter           = useRef(0);

	const selectedApplication = applications.find((a) => a.id === selectedId) ?? null;
	const activeApplication   = applications.find((a) => a.id === activeId) ?? null;

	const openDetails = (application: JobApplication) => setSelectedId(application.id);

	const handleViewCv = () => window.open(MASTER_CV.url, '_blank', 'noopener,noreferrer');

	const updateApplication = (id: string, patch: Partial<JobApplication>) =>
	{
		setApplications((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
	};

	const handleAddApplication = () =>
	{
		newApplicationCounter.current += 1;
		const id = \`job-new-\${newApplicationCounter.current}\`;
		setApplications((prev) => [...prev, { id, role: '', company: '', status: 'wishlist', workType: 'Remote' }]);
		setPendingNewId(id);
		setSelectedId(id);
	};

	const handleModalOpenChange = (open: boolean) =>
	{
		if(open) return;
		if(pendingNewId)
		{
			setApplications((prev) => prev.filter((a) => a.id !== pendingNewId));
			setPendingNewId(null);
		}
		setSelectedId(null);
	};

	const handleSaveApplication = (updated: JobApplication) =>
	{
		setApplications((prev) => prev.map((a) => a.id === updated.id ? updated : a));
		setPendingNewId(null);
	};

	const handleDeleteApplication = (id: string) =>
	{
		setApplications((prev) => prev.filter((a) => a.id !== id));
		if(pendingNewId === id) setPendingNewId(null);
	};

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

	const handleDragOver = (event: DragOverEvent) =>
	{
		const { active, over } = event;
		if(!over) return;

		const activeApp = applications.find((a) => a.id === active.id);
		if(!activeApp) return;

		const overApp    = applications.find((a) => a.id === over.id);
		const overStatus = overApp ? overApp.status : STAGES.some((s) => s.id === over.id) ? (over.id as ApplicationStatus) : null;
		if(!overStatus || overStatus === activeApp.status) return;

		setApplications((prev) => prev.map((a) => a.id === active.id ? { ...a, status: overStatus } : a));
	};

	const handleDragEnd = (event: DragEndEvent) =>
	{
		const { active, over } = event;
		setActiveId(null);
		if(!over || active.id === over.id) return;

		const activeApp = applications.find((a) => a.id === active.id);
		const overApp   = applications.find((a) => a.id === over.id);
		if(!activeApp || !overApp || activeApp.status !== overApp.status) return;

		setApplications((prev) =>
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
		<div className='flex flex-col gap-5 w-full'>
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
						<Badge variant='default'>{activeCount} active</Badge>
						<Badge variant='warning'>{interviewingCount} interviewing</Badge>
						<Badge variant='success'>{offerCount} offer{offerCount === 1 ? '' : 's'}</Badge>
					</div>

					<div className='flex items-center gap-2'>
						<ToggleGroup type='single' value={view} onValueChange={(value) => setView(value as TrackerView)} size='sm' aria-label='Board or table view'>
							<ToggleGroupItem value='board'>Board</ToggleGroupItem>
							<ToggleGroupItem value='table'>Table</ToggleGroupItem>
						</ToggleGroup>
						<Button size='sm' variant='secondary' onClick={handleAddApplication}>+ Add application</Button>
					</div>
				</div>
			</div>

			{view === 'board' ? (
				<DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
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
			)}

			<ApplicationDetailsModal
				open={selectedId !== null}
				application={selectedApplication}
				onOpenChange={handleModalOpenChange}
				onSave={handleSaveApplication}
				onDelete={handleDeleteApplication}
			/>
		</div>
	);
};

export default JobApplicationTracker;`,
		dependencies: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
		registryDependencies: ['modal', 'select', 'date-picker', 'textarea', 'attachment', 'separator', 'input', 'button', 'avatar', 'badge', 'toggle-group', 'data-table'],
		files: ['JobApplicationTracker/JobApplicationTracker.tsx', 'JobApplicationTracker/ApplicationCard.tsx', 'JobApplicationTracker/ApplicationDetailsModal.tsx'],
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
		dependencies: [],
		registryDependencies: ['card', 'form', 'button', 'badge', 'input'],
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
		dependencies: [],
		registryDependencies: ['card', 'form', 'button', 'input'],
		files: ['AuthFormMagicLink/AuthFormMagicLink.tsx'],
		hidden: true,
	},
	{
		slug: 'chart-card-radar',
		name: 'Team skill radar',
		category: 'Dashboards',
		description: 'Same card shell, a RadarChart instead: comparing team scores against target benchmarks across skill areas.',
		usage: `'use client';

import { Card, CardContent, CardHeader, RadarChart, CountUp, Badge } from '@components/ui';

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

export default function ChartCardRadarExample() {
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
		dependencies: [],
		registryDependencies: ['card', 'charts', 'count-up', 'badge'],
		files: ['ChartCardRadar/ChartCardRadar.tsx'],
		hidden: true,
	},
	{
		slug: 'chart-card-bar',
		name: 'Top products',
		category: 'Dashboards',
		description: 'A ranking variant of the same card shell: a BarChart totaling revenue across a product lineup.',
		usage: `'use client';

import { Card, CardContent, CardHeader, BarChart, CountUp, Badge } from '@components/ui';

const PRODUCT_DATA = [
  { product: 'Core', revenue: 42500 },
  { product: 'Analytics', revenue: 31200 },
  { product: 'Sync', revenue: 24800 },
  { product: 'Mobile', revenue: 18100 },
  { product: 'API', revenue: 12400 },
];

const TOTAL_REVENUE = PRODUCT_DATA.reduce((sum, p) => sum + p.revenue, 0);

export default function ChartCardBarExample() {
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
		dependencies: [],
		registryDependencies: ['card', 'charts', 'count-up', 'badge'],
		files: ['ChartCardBar/ChartCardBar.tsx'],
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
		slug: 'notifications-panel-actionable',
		name: 'Filterable with actions',
		category: 'Feedback',
		description: 'An All/Unread filter plus per-notification mark-as-read and dismiss actions, with type icons and an empty state.',
		usage: `'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardHeader, ScrollFade, Button, Badge } from '@components/ui';
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

export default function Example() {
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
		dependencies: [],
		registryDependencies: ['tabs', 'card', 'scroll-fade', 'button', 'badge'],
		files: ['NotificationsPanelActionable/NotificationsPanelActionable.tsx'],
		hidden: true,
	},
];

export const getBlock = (slug: string): BlockEntry | undefined => blocks.find((b) => b.slug === slug);
