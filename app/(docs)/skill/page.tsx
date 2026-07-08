import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Skill',
  description: 'Download the DaFink UI design skill — holistic UI/UX guidance for AI agents covering style, palette, layout, motion, and accessibility decisions.',
};

const SECTIONS: { title: string; desc: string }[] = [
  { title: '1. Choosing a Style', desc: 'When to reach for Minimal, Neumorph, or Brutalist, and what each signals to users.' },
  { title: '2. Choosing a Palette', desc: 'Guidance on all six palettes — Zinc, Ocean, Ember, Forest, Noir, and Plum.' },
  { title: '3. Style + Palette Combinations', desc: 'Pairings that work well together and combinations to avoid.' },
  { title: '4. Component Layout Patterns', desc: 'Page structure, card composition, forms, data display, and dashboard layouts.' },
  { title: '5. Button and Action Hierarchy', desc: 'When to use primary, secondary, ghost, and destructive button variants.' },
  { title: '6. Feedback and Notification Hierarchy', desc: 'Choosing between Toast, Alert, Modal, and Drawer for different states.' },
  { title: '7. Loading and Skeleton States', desc: 'When to show a Skeleton, Spinner, or nothing at all.' },
  { title: '8. Animation and Motion Effects', desc: 'Using TextShimmer, Typewriter, CountUp, Reveal, Carousel, and Progress with purpose.' },
  { title: '9. Content Hierarchy and Typography', desc: 'Establishing visual hierarchy through type scale and weight.' },
  { title: '10. Spacing and Layout', desc: 'Consistent spacing rhythm across sections and components.' },
  { title: '11. Responsive Design', desc: 'Mobile-first rules and breakpoint behavior.' },
  { title: '12. Color Usage Rules', desc: 'When color communicates state, and what must accompany it.' },
  { title: '13. Accessibility Non-Negotiables', desc: 'The five rules that apply to every component, no exceptions.' },
  { title: '14. Common Pitfalls', desc: 'Mistakes agents commonly make when composing DaFink UI components.' },
];

const SkillPage = () =>
{
  return (
    <div className='flex flex-col gap-12'>

      {/* Header */}
      <section className='flex flex-col gap-5'>
        <h1 className='text-3xl font-semibold tracking-tight text-text'>
          Design Skill
        </h1>
        <p className='text-base text-text-muted leading-relaxed max-w-2xl'>
          A holistic UI/UX skill for AI agents working with DaFink UI. It
          covers design judgment — how to compose components into layouts,
          which style and palette to choose, when to use motion and loading
          effects, and how to avoid common mistakes. It does not duplicate
          component API reference; pair it with the{' '}
          <a
            href='/mcp'
            className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
          >
            MCP server
          </a>{' '}
          for prop tables and live specs.
        </p>
        <div className='flex flex-wrap gap-3'>
          <a
            href='/dafink-ui.md'
            download
            className='inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-fg transition-colors duration-[var(--duration-fast)] hover:bg-brand-hover active:bg-brand-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
              <polyline points='7 10 12 15 17 10' />
              <line x1='12' y1='15' x2='12' y2='3' />
            </svg>
            Download dafink-ui.md
          </a>
        </div>
      </section>

      {/* Install */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>Installing the skill</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          Via the CLI, in your project root:
        </p>
        <CodeBlock code='npx dafink-ui skill' />
        <p className='text-sm text-text-muted leading-relaxed'>
          Or download the file above and drop it into your skills directory —{' '}
          <code className='font-mono text-xs'>.claude/skills/</code> for
          Claude Code, or the equivalent directory for your tool. The skill is
          a single <code className='font-mono text-xs'>.md</code> file; no
          build step or extraction required.
        </p>
      </section>

      {/* Sections */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>What&apos;s inside</h2>
        <p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
          The skill is organized into 14 sections, grounded entirely in this
          codebase&apos;s actual design tokens, component specs, and pattern
          documents.
        </p>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className='rounded-lg border border-surface-border bg-surface p-4 flex flex-col gap-1.5'
            >
              <p className='text-sm font-semibold text-text'>{s.title}</p>
              <p className='text-sm text-text-muted leading-relaxed'>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it differs from MCP */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>Skill vs. MCP server</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          The{' '}
          <a
            href='/mcp'
            className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
          >
            MCP server
          </a>{' '}
          gives an agent live, queryable access to component specs and
          tokens — the exact prop tables and variants that exist right now.
          The skill is the opposite kind of knowledge: judgment that doesn&apos;t
          change request to request — when to pick Brutalist over Minimal,
          when a Toast beats a Modal, when motion helps versus when it&apos;s
          noise. Install both for the best results; the skill makes the
          decisions, the MCP server supplies the facts.
        </p>
      </section>

    </div>
  );
};

export default SkillPage;
