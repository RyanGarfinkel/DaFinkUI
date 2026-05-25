import Link from 'next/link';

const Home = () => {
  return (
    <div className='flex flex-col gap-14'>

      {/* Hero */}
      <section className='flex flex-col gap-5 pt-2'>
        <h1 className='text-4xl font-semibold tracking-tight text-text'>
          Obi UI
        </h1>
        <p className='text-lg text-text-muted leading-relaxed max-w-2xl'>
          A React component library built around one idea: you should own your
          UI code. Install only what you need, read it, change it, make it yours.
          No black-box packages. No fighting the library.
        </p>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/components/button'
            className='inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-fg transition-colors duration-[var(--duration-fast)] hover:bg-brand-hover active:bg-brand-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
          >
            Browse components
          </Link>
          <Link
            href='/installation'
            className='inline-flex items-center justify-center rounded-md border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover active:bg-surface-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Philosophy */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>Why Obi UI?</h2>
        <div className='flex flex-col gap-4 text-sm text-text-muted leading-relaxed'>
          <p>
            Most component libraries ship as npm packages. You import a
            component, it works, then one day you need it to behave slightly
            differently and you hit a wall — the library doesn&apos;t expose the
            prop you need, the styling system fights your design tokens, or an
            upgrade breaks something three layers deep.
          </p>
          <p>
            Obi UI takes the opposite approach: run a single CLI command and
            the component&apos;s source code is copied directly into your project.
            You own it. You can read every line, edit any behaviour, and never
            worry about a breaking upgrade. Components are not a dependency —
            they&apos;re just code in your repo.
          </p>
          <p>
            The trade-off is intentional: you take on the source, we take on
            making sure that source is clean, accessible, and well-documented so
            it&apos;s a pleasure to own.
          </p>
        </div>
      </section>

      {/* Core pillars */}
      <section className='flex flex-col gap-5'>
        <h2 className='text-xl font-semibold text-text'>What&apos;s inside</h2>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'>
            <h3 className='text-sm font-semibold text-text'>
              Accessible by default
            </h3>
            <p className='text-sm text-text-muted leading-relaxed'>
              Every component ships with correct ARIA roles, keyboard
              navigation, visible focus indicators, and WCAG AA contrast ratios.
              Overlay components (modals, menus, popovers) implement full focus
              management: trap on open, return on close, Escape to dismiss.
              Accessibility is not an afterthought — it&apos;s the baseline.
            </p>
          </div>

          <div className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'>
            <h3 className='text-sm font-semibold text-text'>
              Token-based theming
            </h3>
            <p className='text-sm text-text-muted leading-relaxed'>
              Every color, radius, and timing value in every component resolves
              through a CSS custom property. Swap the tokens, change the look —
              no component modifications required. Dark mode and the three
              sample themes (Zinc, Ocean, Warm) all work this way. Bring your
              own brand by overriding the same tokens.
            </p>
          </div>

          <div className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'>
            <h3 className='text-sm font-semibold text-text'>
              Subtle motion
            </h3>
            <p className='text-sm text-text-muted leading-relaxed'>
              Animations are purposeful and restrained. Overlay components fade
              and scale at 200ms. Interactive elements respond at 150ms. Every
              animation checks{' '}
              <code className='font-mono text-xs'>prefers-reduced-motion</code>{' '}
              — users who prefer less motion get none. Motion is a signal, not
              decoration.
            </p>
          </div>

          <div className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'>
            <h3 className='text-sm font-semibold text-text'>
              AI-native development
            </h3>
            <p className='text-sm text-text-muted leading-relaxed'>
              The built-in{' '}
              <Link
                href='/mcp'
                className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
              >
                MCP server
              </Link>{' '}
              exposes every component spec, token definition, and design pattern
              as a live resource. Connect it to Claude or any MCP-compatible AI
              and it will use the actual docs — not hallucinated APIs — when
              helping you build.
            </p>
          </div>
        </div>
      </section>

      {/* Components overview */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>Components</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          Components across ten categories, with more on the way. The library
          covers the primitives every app needs: inputs, buttons, layout,
          disclosure, feedback, navigation, and data display. Charts wrap
          Recharts with a consistent token-based API and ship separately so you
          don&apos;t pull in Recharts unless you need it.
        </p>
        <div className='flex flex-wrap gap-2'>
          {[
            'Button', 'Input', 'Textarea', 'Checkbox', 'Switch', 'Radio',
            'ToggleGroup', 'CalendarInput', 'Badge', 'Card', 'Table',
            'Skeleton', 'Typography', 'Alert', 'Progress', 'Spinner',
            'Form', 'Accordion', 'Tabs', 'Breadcrumb', 'Sidebar',
            'LineChart', 'BarChart', 'AreaChart', 'DonutChart',
            'Kanban', 'Canvas',
          ].map((name) => (
            <span
              key={name}
              className='inline-flex items-center rounded-md border border-surface-border bg-surface-active px-2.5 py-1 text-xs font-mono text-text-muted'
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Quick start */}
      <section className='flex flex-col gap-4'>
        <h2 className='text-xl font-semibold text-text'>Quick start</h2>
        <p className='text-sm text-text-muted leading-relaxed'>
          Install a component with a single command. The CLI copies the source
          into <code className='font-mono text-xs'>components/ui/</code>, installs
          any npm dependencies, and transitively resolves any other Obi UI
          components it depends on.
        </p>
        <div className='flex flex-col gap-2'>
          <div className='bg-surface-active rounded-lg px-4 py-3 font-mono text-sm text-text flex items-center gap-2'>
            <span className='text-text-subtle select-none'>$</span>
            <span>npx @obi/ui add button</span>
          </div>
          <div className='bg-surface-active rounded-lg px-4 py-3 font-mono text-sm text-text flex items-center gap-2'>
            <span className='text-text-subtle select-none'>$</span>
            <span>npx @obi/ui add modal</span>
            <span className='ml-auto text-xs text-text-subtle font-sans'>installs Button too</span>
          </div>
        </div>
        <p className='text-sm text-text-muted leading-relaxed'>
          See the{' '}
          <Link
            href='/installation'
            className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
          >
            installation guide
          </Link>{' '}
          for full setup instructions.
        </p>
      </section>

    </div>
  );
};

export default Home;
