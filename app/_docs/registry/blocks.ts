export interface BlockEntry {
	slug: string;                    // URL segment, e.g. "dashboard"
	name: string;                    // Display name, e.g. "Dashboard"
	category: string;                // One of the block categories
	description: string;             // One paragraph description
	usage: string;                   // Complete, runnable code example (the string shown in the Code tab)
	dependencies: string[];          // npm packages this block requires, e.g. ["recharts"]
	registryDependencies: string[];  // Components from the component registry this block requires
	files: string[];                 // Source files to copy, relative to src/blocks/
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
		description: 'A combined sign-in / sign-up card with a mode toggle — sign-in runs a three-step credentials → OTP verification → success flow, sign-up is a single-step account creation form with live password-match validation.',
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
          <p className="text-sm text-text-muted text-center py-2">Account created — check your email to verify.</p>
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
		description: 'A general-purpose account settings form — profile fields, a timezone select, and notification toggles — grouped into sections with a save action.',
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
    answer: 'Yes — upgrade or downgrade at any time. Changes are prorated so you only pay for what you use.' },
  { value: 'billing-cycle', question: "What's the difference between monthly and yearly billing?",
    answer: 'Yearly billing is paid upfront for the year and works out to about 20% cheaper than paying monthly.' },
  { value: 'cancel', question: 'Can I cancel anytime?',
    answer: "Yes, there's no lock-in contract. Cancel from your billing settings and you won't be charged again." },
  { value: 'payment-methods', question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards, plus PayPal for monthly and yearly plans.' },
  { value: 'enterprise', question: 'Do you offer custom Enterprise pricing?',
    answer: 'Yes — contact our sales team for volume discounts, custom contracts, and dedicated onboarding.' },
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
		registryDependencies: ['accordion', 'toggle-group', 'card', 'button', 'badge', 'slider'],
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
		registryDependencies: ['card', 'scroll-fade', 'avatar', 'button', 'tabs', 'badge'],
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
		description: 'A single, self-contained stat card with an embedded trend chart — the kind of card you drop into any dashboard grid.',
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
		category: 'Chat',
		description: 'A chat interface with an AI assistant — seeded with a fake, predefined conversation and canned streamed replies. No real model calls.',
		usage: `'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/Card/Card';
import ScrollFade from '@/src/components/ScrollFade/ScrollFade';
import Typewriter from '@/src/components/Typewriter/Typewriter';
import Message from '@/src/components/Message/Message';
import Avatar from '@/src/components/Avatar/Avatar';
import Button from '@/src/components/Button/Button';
import Badge from '@/src/components/Badge/Badge';
import Input from '@/src/components/Input/Input';
import { useEffect, useRef, useState } from 'react';

const INITIAL_MESSAGES = [
  { id: 1, sender: 'ai', text: "Hi! I'm the DaFink UI assistant — ask me anything about installing or using components." },
  { id: 2, sender: 'user', text: 'How do I install a component?' },
  { id: 3, sender: 'ai', text: 'Run npx @dafink/ui add button in your project root — it copies the component source straight into your repo.' },
  { id: 4, sender: 'user', text: 'Does it work with dark mode out of the box?' },
  { id: 5, sender: 'ai', text: "Yes — every component is built on design tokens, so it adapts automatically to your theme's light and dark palettes." },
];

const CANNED_REPLIES = [
  "Good question — check the component's spec.md for full prop details and accessibility notes.",
  'You can customize that with design tokens instead of hardcoded colors — see rules/tokens.md.',
  "That's supported out of the box. Try it live in the playground on the component's docs page.",
  "Most components ship with keyboard navigation and focus states built in, so you shouldn't need extra work there.",
];

export default function AiChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef(null);
  const nextId = useRef(INITIAL_MESSAGES.length + 1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: nextId.current++, sender: 'user', text }]);
    setDraft('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: nextId.current++, sender: 'ai', text: reply, animate: true }]);
    }, 600 + Math.random() * 300);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text">Assistant</h3>
        <Badge variant="success">Online</Badge>
      </CardHeader>
      <CardContent>
        <ScrollFade ref={containerRef} direction="vertical" className="max-h-96">
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <Message key={m.id} variant={m.sender === 'user' ? 'sent' : 'received'}
                avatar={<Avatar name={m.sender === 'user' ? 'You' : 'AI'} size="sm" />}>
                {m.animate ? <Typewriter text={m.text} speed={18} /> : m.text}
              </Message>
            ))}
            {isTyping && <p className="text-xs text-text-muted pl-9">Assistant is typing…</p>}
          </div>
        </ScrollFade>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask a question…"
            aria-label="Message" className="flex-1" />
          <Button type="submit" disabled={!draft.trim()}>Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
}`,
		dependencies: [],
		registryDependencies: ['card', 'scroll-fade', 'message', 'avatar', 'button', 'badge', 'input'],
		files: ['AiChat/AiChat.tsx'],
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
];

export const getBlock = (slug: string): BlockEntry | undefined => blocks.find((b) => b.slug === slug);
