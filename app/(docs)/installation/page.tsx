'use client';
import { ToggleGroup, ToggleGroupItem } from '@/src/components/ToggleGroup/ToggleGroup';
import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import { Alert } from '@/src/components/Alert/Alert';
import { useState } from 'react';
import Link from 'next/link';

type PM = 'npm' | 'yarn' | 'pnpm' | 'bun';

const TABS: PM[] = ['npm', 'yarn', 'pnpm', 'bun'];

const pmCommand = (pm: PM, command: 'install' | 'add' | 'dlx', pkg: string) => {
  if (command === 'dlx') {
    if (pm === 'npm')  return `npx ${pkg}`;
    if (pm === 'yarn') return `yarn dlx ${pkg}`;
    if (pm === 'pnpm') return `pnpm dlx ${pkg}`;
    if (pm === 'bun')  return `bunx ${pkg}`;
  }
  if (command === 'install') {
    if (pm === 'npm')  return `npm install ${pkg}`;
    if (pm === 'yarn') return `yarn add ${pkg}`;
    if (pm === 'pnpm') return `pnpm add ${pkg}`;
    if (pm === 'bun')  return `bun add ${pkg}`;
  }
  // add (same as install for our purposes)
  if (pm === 'npm')  return `npm install ${pkg}`;
  if (pm === 'yarn') return `yarn add ${pkg}`;
  if (pm === 'pnpm') return `pnpm add ${pkg}`;
  return `bun add ${pkg}`;
};

const InlineCode = ({ children }: { children: string }) => {
  return (
    <code className='font-mono text-sm text-text bg-surface-active rounded px-1.5 py-0.5'>
      {children}
    </code>
  );
};

const InstallationPage = () => {
  const [pm, setPm] = useState<PM>('npm');

  return (
    <div className='flex flex-col gap-10'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-semibold tracking-tight text-text'>Installation</h1>
        <p className='text-base text-text-muted leading-relaxed'>
          DaFink UI ships as source, not a package. There is no runtime dependency to
          install: the CLI copies source files directly into your project so you own
          the code entirely.
        </p>
      </div>

      {/* Requirements */}
      <div className='flex flex-col gap-2'>
        <h2 className='text-lg font-semibold text-text'>Requirements</h2>
        <ul className='flex flex-col gap-1.5 text-sm text-text-muted list-none'>
          {[
            ['React', '18 or later'],
            ['TypeScript', '5 or later (recommended)'],
            ['Tailwind CSS', 'v4'],
            ['Node.js', '18 or later (for the CLI)'],
          ].map(([name, ver]) => (
            <li key={name} className='flex items-baseline gap-2'>
              <span className='inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1' />
              <span>
                <span className='font-medium text-text'>{name}</span>: {ver}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className='flex flex-col gap-4 border-t border-surface-border pt-8'>
        <h2 className='text-lg font-semibold text-text'>Steps</h2>

        <div className='flex flex-col gap-2'>
          <p className='text-sm text-text-muted'>Choose your package manager</p>
          <ToggleGroup
            type='single'
            value={pm}
            onValueChange={(v) => setPm(v as PM)}
            size='sm'
            aria-label='Package manager'
            className='self-start'
          >
            {TABS.map((tab) => (
              <ToggleGroupItem key={tab} value={tab}>{tab}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Timeline>
          <TimelineItem title='Create a Next.js project (skip if you have one)'>
            <div className='flex flex-col gap-3'>
              <CodeBlock code={pmCommand(pm, 'dlx', 'create-next-app@latest my-app --typescript --tailwind --eslint')} />
              <p>
                DaFink UI requires <InlineCode>React 18+</InlineCode> and <InlineCode>Tailwind CSS v4</InlineCode>.
                Any React framework works; Next.js is not required.
              </p>
            </div>
          </TimelineItem>

          <TimelineItem title='Install Tailwind CSS (if not already installed)'>
            <CodeBlock code={pmCommand(pm, 'install', 'tailwindcss @tailwindcss/postcss postcss')} />
          </TimelineItem>

          <TimelineItem title='Run the DaFink UI initialiser'>
            <div className='flex flex-col gap-3'>
              <CodeBlock code={pmCommand(pm, 'dlx', 'dafink-ui init')} />
              <p>
                This writes <InlineCode>dafink.config.json</InlineCode> and generates{' '}
                <InlineCode>dafink-ui.css</InlineCode> with your chosen design tokens, then
                imports it into your CSS file. It also adds a{' '}
                <InlineCode>@components/*</InlineCode> path alias to your{' '}
                <InlineCode>tsconfig.json</InlineCode> (or <InlineCode>jsconfig.json</InlineCode>),
                pointing at wherever your components directory is configured, so example
                imports work the same regardless of that setting.
              </p>
            </div>
          </TimelineItem>

          <TimelineItem title='Add components'>
            <div className='flex flex-col gap-3'>
              <CodeBlock code={pmCommand(pm, 'dlx', 'dafink-ui add button')} />
              <p>
                Each <InlineCode>add</InlineCode> command copies the component source into{' '}
                <InlineCode>src/components/ui/</InlineCode> and installs any required npm
                dependencies automatically. You can add multiple at once:
              </p>
              <CodeBlock code={pmCommand(pm, 'dlx', 'dafink-ui add button input card form')} />
            </div>
          </TimelineItem>

          <TimelineItem title='Import and use'>
            <div className='flex flex-col gap-3'>
              <CodeBlock code={`import { Button } from '@components';

export default function Page() {
  return <Button variant="primary">Get started</Button>;
}`} />
              <p>
                Every component example in these docs imports from{' '}
                <InlineCode>@components</InlineCode>, the barrel file{' '}
                <InlineCode>dafink-ui add</InlineCode> regenerates on every run, pointing at
                the alias <InlineCode>dafink-ui init</InlineCode> configured in the previous step.
              </p>
            </div>
          </TimelineItem>
        </Timeline>
      </div>

      {/* Upgrading section */}
      <div className='flex flex-col gap-4 border-t border-surface-border pt-8'>
        <h2 className='text-lg font-semibold text-text'>Upgrading</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          DaFink UI has no runtime dependency to bump, since the CLI copies source
          straight into your project. Upgrading means pulling fresh copies of the
          files you want updated, not running an install command.
        </p>

        <Timeline variant='muted'>
          <TimelineItem title='Check the changelog'>
            <p>
              Components aren&apos;t individually versioned, so the{' '}
              <Link href='/changelog' className='text-brand underline underline-offset-4 hover:text-brand-hover'>
                changelog
              </Link>{' '}
              is the only source of truth for what changed and whether it&apos;s breaking.
            </p>
          </TimelineItem>

          <TimelineItem title='Re-add a component to update it'>
            <div className='flex flex-col gap-3'>
              <CodeBlock code={pmCommand(pm, 'dlx', 'dafink-ui add button')} />
              <p>
                Running <InlineCode>add</InlineCode> again copies the latest source over
                the existing file at that path.
              </p>
            </div>
          </TimelineItem>

          <TimelineItem title='Refresh tokens and config'>
            <div className='flex flex-col gap-3'>
              <CodeBlock code={pmCommand(pm, 'dlx', 'dafink-ui init')} />
              <p>
                Re-running <InlineCode>init</InlineCode> regenerates{' '}
                <InlineCode>dafink-ui.css</InlineCode> and{' '}
                <InlineCode>dafink.config.json</InlineCode> from whatever style and
                palette you choose, picking up any new design tokens.
              </p>
            </div>
          </TimelineItem>
        </Timeline>

        <Alert variant='warning' title='Both commands overwrite existing files'>
          <InlineCode>add</InlineCode> and <InlineCode>init</InlineCode> write over
          whatever is already at the destination path, with no merge or diff step.
          Commit or stash local changes first so you can review and reapply any
          customizations after upgrading.
        </Alert>
      </div>
    </div>
  );
};

export default InstallationPage;
