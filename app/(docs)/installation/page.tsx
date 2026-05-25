'use client';;
import { Timeline, TimelineItem } from '@/src/components/Timeline/Timeline';
import { CodeBlock } from '@/src/docs/components/CodeBlock';
import { useState } from 'react';

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

const PmToggle = ({ active, onChange }: { active: PM; onChange: (pm: PM) => void }) => {
  return (
    <div
      role='tablist'
      aria-label='Package manager'
      className='inline-flex items-center gap-0.5 rounded-lg border border-surface-border bg-surface-hover p-1'
    >
      {TABS.map((pm) => (
        <button
          key={pm}
          type='button'
          role='tab'
          aria-selected={active === pm}
          onClick={() => onChange(pm)}
          className={[
            'px-3 py-1 rounded-md text-xs font-medium transition-colors duration-[var(--duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand-ring',
            active === pm
              ? 'bg-surface text-text shadow-sm'
              : 'text-text-muted hover:text-text',
          ].join(' ')}
        >
          {pm}
        </button>
      ))}
    </div>
  );
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
          Obi UI is a copy-paste component library. There is no runtime package to
          install — the CLI copies source files directly into your project so you own
          the code entirely.
        </p>
      </div>

      {/* Package manager toggle — shared across all steps */}
      <div className='flex flex-col gap-2'>
        <p className='text-sm text-text-muted'>Choose your package manager</p>
        <PmToggle active={pm} onChange={setPm} />
      </div>

      {/* Steps */}
      <Timeline>
        <TimelineItem title='Create a Next.js project (skip if you have one)'>
          <div className='flex flex-col gap-3'>
            <CodeBlock code={pmCommand(pm, 'dlx', 'create-next-app@latest my-app --typescript --tailwind --eslint')} />
            <p>
              Obi UI requires <InlineCode>React 18+</InlineCode> and <InlineCode>Tailwind CSS v4</InlineCode>.
              Any React framework works — Next.js is not required.
            </p>
          </div>
        </TimelineItem>

        <TimelineItem title='Install Tailwind CSS (if not already installed)'>
          <CodeBlock code={pmCommand(pm, 'install', 'tailwindcss @tailwindcss/postcss postcss')} />
        </TimelineItem>

        <TimelineItem title='Run the Obi UI initialiser'>
          <div className='flex flex-col gap-3'>
            <CodeBlock code={pmCommand(pm, 'dlx', '@obi/ui init')} />
            <p>
              This copies <InlineCode>globals.css</InlineCode> (with all design tokens) into your project
              and writes a minimal <InlineCode>obi.config.json</InlineCode> in your root.
            </p>
          </div>
        </TimelineItem>

        <TimelineItem title='Add components'>
          <div className='flex flex-col gap-3'>
            <CodeBlock code={pmCommand(pm, 'dlx', '@obi/ui add button')} />
            <p>
              Each <InlineCode>add</InlineCode> command copies the component source into{' '}
              <InlineCode>src/components/ui/</InlineCode> and installs any required npm
              dependencies automatically. You can add multiple at once:
            </p>
            <CodeBlock code={pmCommand(pm, 'dlx', '@obi/ui add button input card form')} />
          </div>
        </TimelineItem>

        <TimelineItem title='Import and use'>
          <CodeBlock code={`import Button from '@/components/ui/Button/Button';

export default function Page() {
  return <Button variant="primary">Get started</Button>;
}`} />
        </TimelineItem>
      </Timeline>

      {/* Manual install section */}
      <div className='flex flex-col gap-4 border-t border-surface-border pt-8'>
        <h2 className='text-lg font-semibold text-text'>Manual installation</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          Prefer not to use the CLI? Copy any component&apos;s source file directly from the
          docs — each component page has a &quot;Copy&quot; button. Then install its peer
          dependencies (listed under &quot;Dependencies&quot; on the same page) by hand:
        </p>
        <CodeBlock code={pmCommand(pm, 'install', '<peer-dependency>')} />
        <p className='text-sm text-text-muted leading-relaxed'>
          The only global requirement is that your project imports{' '}
          <InlineCode>globals.css</InlineCode> (or equivalent CSS with the Obi design
          tokens defined). Without the tokens, the Tailwind utility classes used by
          components won&apos;t resolve to the right values.
        </p>
      </div>

      {/* Requirements callout */}
      <div className='rounded-lg border border-surface-border bg-surface-hover/50 p-5 flex flex-col gap-3'>
        <p className='text-sm font-semibold text-text'>Requirements</p>
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
                <span className='font-medium text-text'>{name}</span> — {ver}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InstallationPage;
