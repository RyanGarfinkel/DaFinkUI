'use client';;
import { FormDescription, FormField, FormLabel } from '@/src/components/Form/Form';
import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import { ExampleBlock } from '@/src/docs/components/ExampleBlock';
import Typography from '@/src/components/Typography/Typography';
import { AreaChart } from '@/src/components/Charts/Charts';
import Button from '@/src/components/Button/Button';
import Input from '@/src/components/Input/Input';
import { useState, useEffect } from 'react';

// ─── Example 1: Login form ─────────────────────────────────────────────────────

const LOGIN_CODE = `'use client';

import { useState } from 'react';
import Button from '@/src/components/Button/Button';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import { FormField, FormLabel, FormDescription } from '@/src/components/Form/Form';
import Input from '@/src/components/Input/Input';
import Typography from '@/src/components/Typography/Typography';

export default function LoginForm() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Typography variant="h3">Sign in</Typography>
        <Typography variant="muted">
          Enter your email and password to continue.
        </Typography>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          <FormField>
            <FormLabel required>Email</FormLabel>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField>
            <FormLabel required>Password</FormLabel>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormDescription>
              <a href="/reset" className="text-brand hover:underline">
                Forgot password?
              </a>
            </FormDescription>
          </FormField>
          <Button type="submit" className="w-full mt-1">Sign in</Button>
          <p className="text-center text-xs text-text-muted">
            No account?{' '}
            <a href="/signup" className="text-brand hover:underline">Create one</a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}`;

const LoginPreview = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  return (
    <Card className='w-full max-w-sm'>
      <CardHeader>
        <Typography variant='h3'>Sign in</Typography>
        <Typography variant='muted'>Enter your email and password to continue.</Typography>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className='flex flex-col gap-4'>
          <FormField>
            <FormLabel required>Email</FormLabel>
            <Input
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField>
            <FormLabel required>Password</FormLabel>
            <Input
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormDescription>
              <a href='#' className='text-brand hover:underline'>Forgot password?</a>
            </FormDescription>
          </FormField>
          <Button type='submit' className='w-full mt-1'>Sign in</Button>
          <p className='text-center text-xs text-text-muted'>
            No account?{' '}
            <a href='#' className='text-brand hover:underline'>Create one</a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

// ─── Example 2: Dashboard ──────────────────────────────────────────────────────

const DASHBOARD_CODE = `import { AreaChart } from '@/src/components/Charts/Charts';
import { Card, CardContent, CardHeader } from '@/src/components/Card/Card';
import Typography from '@/src/components/Typography/Typography';

const data  = [
  { month: 'Jan', revenue: 12400, users: 3200 },
  { month: 'Feb', revenue: 18200, users: 4100 },
  { month: 'Mar', revenue: 15800, users: 3800 },
  { month: 'Apr', revenue: 22100, users: 5200 },
  { month: 'May', revenue: 19600, users: 4700 },
  { month: 'Jun', revenue: 26800, users: 6100 },
];

const stats = [
  { label: 'Total revenue', value: '$114.9k', delta: '+18%',  positive: true  },
  { label: 'Active users',  value: '27.1k',   delta: '+12%',  positive: true  },
  { label: 'Conversion',    value: '3.4%',    delta: '+0.6%', positive: true  },
  { label: 'Avg. session',  value: '4m 12s',  delta: '-3%',   positive: false },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className="text-2xl font-semibold text-text mt-1">{s.value}</p>
              <p className={s.positive ? 'text-xs text-success mt-0.5' : 'text-xs text-danger mt-0.5'}>
                {s.delta} vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Typography variant="h3">Revenue &amp; users</Typography>
          <Typography variant="muted">6-month trend</Typography>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={data}
            xKey="month"
            series={[
              { key: 'revenue', label: 'Revenue' },
              { key: 'users',   label: 'Users'   },
            ]}
            height={220}
          />
        </CardContent>
      </Card>
    </div>
  );
}`;

const AREA_DATA = [
  { month: 'Jan', revenue: 12400, users: 3200 },
  { month: 'Feb', revenue: 18200, users: 4100 },
  { month: 'Mar', revenue: 15800, users: 3800 },
  { month: 'Apr', revenue: 22100, users: 5200 },
  { month: 'May', revenue: 19600, users: 4700 },
  { month: 'Jun', revenue: 26800, users: 6100 },
];

const STATS = [
  { label: 'Total revenue', value: '$114.9k', delta: '+18%',  positive: true  },
  { label: 'Active users',  value: '27.1k',   delta: '+12%',  positive: true  },
  { label: 'Conversion',    value: '3.4%',    delta: '+0.6%', positive: true  },
  { label: 'Avg. session',  value: '4m 12s',  delta: '-3%',   positive: false },
];

const DashboardPreview = () => {
  return (
    <div className='flex flex-col gap-5 w-full'>
      <div className='grid grid-cols-2 gap-3'>
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className='pt-4 pb-4'>
              <p className='text-xs text-text-muted'>{s.label}</p>
              <p className='text-xl font-semibold text-text mt-1'>{s.value}</p>
              <p className={s.positive ? 'text-xs text-success mt-0.5' : 'text-xs text-danger mt-0.5'}>
                {s.delta} vs last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Typography variant='h3'>Revenue &amp; users</Typography>
          <Typography variant='muted'>6-month trend</Typography>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={AREA_DATA}
            xKey='month'
            series={[
              { key: 'revenue', label: 'Revenue' },
              { key: 'users',   label: 'Users'   },
            ]}
            height={200}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Example 3: Deploy log ─────────────────────────────────────────────────────

const DEPLOY_STEPS = [
  { title: 'Clone repository',       body: 'main @ a1b2c3d · 0.4s'          },
  { title: 'Install dependencies',   body: '847 packages installed · 4.2s'  },
  { title: 'Run test suite',         body: '47 tests passed · 1.1s'          },
  { title: 'Build for production',   body: 'Bundle 142 kb gzipped · 8.3s'   },
  { title: 'Deploy to edge network', body: 'Live at myapp.vercel.app · 2.0s' },
];

const DEPLOY_CODE = `'use client';

import { useState, useEffect } from 'react';
import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import Button from '@/src/components/Button/Button';

const STEPS = [
  { title: 'Clone repository',       body: 'main @ a1b2c3d · 0.4s'          },
  { title: 'Install dependencies',   body: '847 packages installed · 4.2s'  },
  { title: 'Run test suite',         body: '47 tests passed · 1.1s'          },
  { title: 'Build for production',   body: 'Bundle 142 kb gzipped · 8.3s'   },
  { title: 'Deploy to edge network', body: 'Live at myapp.vercel.app · 2.0s' },
];

export default function DeployLog() {
  const [count,    setCount]    = useState(1);
  const [newIndex, setNewIndex] = useState<number | null>(null);

  function runNextStep() {
    if (count >= STEPS.length) return;
    setNewIndex(count);
    setCount(c => c + 1);
  }

  useEffect(() => {
    if (newIndex === null) return;
    const id = setTimeout(() => setNewIndex(null), 500);
    return () => clearTimeout(id);
  }, [newIndex]);

  const done = count >= STEPS.length;

  return (
    <>
      <style>{\`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .step-enter { animation: stepIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes dotPop {
          0%   { transform: scale(1);    }
          40%  { transform: scale(1.35); }
          100% { transform: scale(1);    }
        }
        .dot-pop > div:first-child > div:first-child { animation: dotPop 0.4s ease-out; }
      \`}</style>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text">
            {done ? 'Deployment complete' : \`Step \${count} of \${STEPS.length}\`}
          </p>
          {done ? (
            <Button size="sm" variant="outlined" onClick={() => { setCount(1); setNewIndex(null); }}>
              Reset
            </Button>
          ) : (
            <Button size="sm" onClick={runNextStep}>Run next step</Button>
          )}
        </div>
        <Timeline animate="none">
          {STEPS.slice(0, count).map((step, i) => (
            <TimelineItem
              key={step.title}
              title={step.title}
              className={i === newIndex ? 'step-enter dot-pop' : ''}
            >
              {step.body}
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </>
  );
}`;

const DeployPreview = () => {
  const [count,    setCount]    = useState(1);
  const [newIndex, setNewIndex] = useState<number | null>(null);

  const runNextStep = () => {
    if (count >= DEPLOY_STEPS.length) return;
    setNewIndex(count);
    setCount((c) => c + 1);
  };

  useEffect(() => {
    if (newIndex === null) return;
    const id = setTimeout(() => setNewIndex(null), 500);
    return () => clearTimeout(id);
  }, [newIndex]);

  const done = count >= DEPLOY_STEPS.length;

  return (
    <>
      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .step-enter { animation: stepIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes dotPop {
          0%   { transform: scale(1);    }
          40%  { transform: scale(1.35); }
          100% { transform: scale(1);    }
        }
        .dot-pop > div:first-child > div:first-child { animation: dotPop 0.4s ease-out; }
      `}</style>

      <div className='flex flex-col gap-6 w-full max-w-sm'>
        <div className='flex items-center justify-between'>
          <p className='text-sm font-medium text-text'>
            {done ? 'Deployment complete' : `Step ${count} of ${DEPLOY_STEPS.length}`}
          </p>
          {done ? (
            <Button size='sm' variant='outlined' onClick={() => { setCount(1); setNewIndex(null); }}>
              Reset
            </Button>
          ) : (
            <Button size='sm' onClick={runNextStep}>Run next step</Button>
          )}
        </div>
        <Timeline animate='none'>
          {DEPLOY_STEPS.slice(0, count).map((step, i) => (
            <TimelineItem
              key={step.title}
              title={step.title}
              className={i === newIndex ? 'step-enter dot-pop' : ''}
            >
              <span className='text-text-muted text-xs'>{step.body}</span>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </>
  );
};

const ExamplesPage = () => {
  return (
    <div className='flex flex-col gap-12'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-semibold tracking-tight text-text'>Examples</h1>
        <p className='text-base text-text-muted leading-relaxed'>
          Real patterns assembled from Obi UI components. Copy the code and
          drop it straight into your project.
        </p>
      </div>

      <section className='flex flex-col gap-2'>
        <h2 className='text-lg font-semibold text-text'>Login form</h2>
        <p className='text-sm text-text-muted'>
          A card-wrapped sign-in form using Input, Button, and Form primitives.
        </p>
        <ExampleBlock label='login' code={LOGIN_CODE} minHeight='320px'>
          <LoginPreview />
        </ExampleBlock>
      </section>

      <section className='flex flex-col gap-2'>
        <h2 className='text-lg font-semibold text-text'>Dashboard</h2>
        <p className='text-sm text-text-muted'>
          Stat cards and an area chart for a typical analytics overview.
        </p>
        <ExampleBlock label='dashboard' code={DASHBOARD_CODE} minHeight='320px'>
          <DashboardPreview />
        </ExampleBlock>
      </section>

      <section className='flex flex-col gap-2'>
        <h2 className='text-lg font-semibold text-text'>Deploy log</h2>
        <p className='text-sm text-text-muted'>
          An interactive Timeline that grows one step at a time, with a slide-in and dot-pop animation on each new entry.
        </p>
        <ExampleBlock label='deploy' code={DEPLOY_CODE} minHeight='320px'>
          <DeployPreview />
        </ExampleBlock>
      </section>
    </div>
  );
};

export default ExamplesPage;
