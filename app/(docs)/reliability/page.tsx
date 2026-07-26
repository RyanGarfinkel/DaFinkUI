import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Reliability',
	description: 'A static, automated CLI check that scans a consumer project for accessibility and design-token regressions in CI.',
};

const CHECKS: { title: string; desc: string }[] = [
	{ title: 'Missing accessible names', desc: '<img> elements without alt, and icon-only buttons or links without an aria-label or aria-labelledby.' },
	{ title: 'Unreachable interactive elements', desc: 'A div or span with an onClick handler but no role and no tabIndex, invisible to keyboard users.' },
	{ title: 'Hardcoded colors', desc: 'Raw hex or rgb() values, or arbitrary Tailwind color utilities, that bypass token classes and skip contrast checking.' },
];

const GITHUB_WORKFLOW_YAML = `name: DaFink UI Audit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: node scripts/dafink-audit.mjs
      # - run: npm run lint    # optional, add if your project has a lint script
      # - run: npm test        # optional, add if your project has a test script`;

const GITLAB_WORKFLOW_YAML = `dafink-audit:
  stage: test
  image: node:20
  script:
    - npm ci
    - node scripts/dafink-audit.mjs
    # - npm run lint  # optional, add if your project has a lint script
    # - npm test      # optional, add if your project has a test script
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'`;

const ReliabilityPage = () =>
{
	return (
		<div className='flex flex-col gap-12'>

			{/* Header */}
			<section className='flex flex-col gap-5'>
				<h1 className='text-3xl font-semibold tracking-tight text-text'>
					Reliability
				</h1>
				<p className='text-base text-text-muted leading-relaxed max-w-2xl'>
					A set of static, automated checks the CLI installs into your project
					to catch accessibility and design-token regressions in CI. It is not
					a replacement for manual review. It&apos;s a floor that never slips,
					running the same way on every pull request.
				</p>
			</section>

			{/* Why formal checks */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Don&apos;t rely on AI</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					AI-assisted and human-reviewed code both drift. A reviewer, human or
					model, can miss a missing <code className='font-mono text-xs'>alt</code>{' '}
					or a stray <code className='font-mono text-xs'>bg-red-500</code> in a
					large diff, especially in AI-generated output where volume is high
					and review is skimmed. A small, deterministic, mechanically-run check
					doesn&apos;t get tired or skim. It either finds the violation or it
					doesn&apos;t.
				</p>
				<p className='text-sm text-text-muted leading-relaxed'>
					The point isn&apos;t &quot;don&apos;t trust AI-written UI code.&quot; It&apos;s that
					trusting review alone, whether the code came from a person or a
					model, isn&apos;t a substitute for a check that runs the same way every
					time in CI. This design system&apos;s own token-contrast gate
					(<code className='font-mono text-xs'>scripts/check-contrast.ts</code>) is
					the same idea applied to design tokens; this CLI command is that idea
					made portable so any consumer project can adopt it, not just this one.
				</p>
			</section>

			{/* DaFink UI Audit */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>DaFink UI Audit</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					Via the CLI, in your project root:
				</p>
				<CodeBlock code='npx dafink-ui audit' />
				<p className='text-sm text-text-muted leading-relaxed'>
					This writes <code className='font-mono text-xs'>scripts/dafink-audit.mjs</code>,
					a CI workflow file for the target provider (skippable entirely with{' '}
					<code className='font-mono text-xs'>--no-workflow</code>), and wires an{' '}
					<code className='font-mono text-xs'>npm run dafink-audit</code> script into{' '}
					<code className='font-mono text-xs'>package.json</code>.
				</p>
				<p className='text-sm text-text-muted leading-relaxed'>
					GitHub Actions and GitLab CI use incompatible config formats, so the CLI
					generates one or the other based on <code className='font-mono text-xs'>--provider</code>{' '}
					(it defaults to <code className='font-mono text-xs'>github</code>). To target
					GitLab instead:
				</p>
				<CodeBlock code='npx dafink-ui audit --provider gitlab' />
				<p className='text-sm text-text-muted leading-relaxed'>
					If your project already has a <code className='font-mono text-xs'>.gitlab-ci.yml</code>,
					the CLI appends a <code className='font-mono text-xs'>dafink-audit</code> job to it
					rather than overwriting your existing pipeline, so running the command again is a
					no-op if that job is already present. Need both providers configured (e.g. a repo
					mirrored to both hosts)? Run the command twice, once per provider. Each writes to
					its own file, so neither run interferes with the other.
				</p>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					The script is zero-dependency and statically scans your project&apos;s
					own <code className='font-mono text-xs'>.tsx</code>/<code className='font-mono text-xs'>.jsx</code> files
					for three categories of violation. It exits with code 1 if it finds
					any, so it fails the CI job.
				</p>
				<div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
					{CHECKS.map((c) => (
						<div
							key={c.title}
							className='rounded-lg border border-surface-border bg-surface p-4 flex flex-col gap-1.5'
						>
							<p className='text-sm font-semibold text-text'>{c.title}</p>
							<p className='text-sm text-text-muted leading-relaxed'>{c.desc}</p>
						</div>
					))}
				</div>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					This is a static source-code scan, not a runtime audit. It catches
					what it catches by pattern-matching your files, nothing more.
				</p>
			</section>

			{/* ESLint */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>ESLint</h2>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					<code className='font-mono text-xs'>dafink-audit</code> is scoped
					narrowly: accessible names, keyboard reachability, and hardcoded
					colors, nothing more. It is not a general-purpose linter and isn&apos;t
					meant to replace one. Unused variables, hook dependency violations,
					unreachable code, and dozens of other correctness issues are ESLint&apos;s
					job, not this script&apos;s.
				</p>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					If your project already runs ESLint in CI, no extra setup is needed.
					<code className='font-mono text-xs'> dafink-audit</code> is designed
					to run alongside it, not in place of it. If it doesn&apos;t yet, add it;
					the two checks catch different failure modes and neither substitutes
					for the other.
				</p>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					None of the above renders a component or asserts on its behavior.
					That&apos;s what UI testing is for. Pass{' '}
					<code className='font-mono text-xs'>--with-tests</code> to{' '}
					<code className='font-mono text-xs'>dafink-ui add</code> and each
					component&apos;s own <code className='font-mono text-xs'>.test.tsx</code>{' '}
					is copied in alongside it, giving you a real starting point instead of
					an empty file:
				</p>
				<CodeBlock code='npx dafink-ui add button --with-tests' />
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					Off by default since it assumes Vitest and{' '}
					<code className='font-mono text-xs'>@testing-library/react</code>. If
					your project uses a different test runner, skip the flag and treat the
					component&apos;s test file on its docs page as a reference instead.
				</p>
			</section>

			{/* Google Lighthouse */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Google Lighthouse</h2>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					Both <code className='font-mono text-xs'>dafink-audit</code> and
					ESLint operate on source files. Neither ever renders your app.
					Running{' '}
					<a
						href='https://developer.chrome.com/docs/lighthouse/overview'
						target='_blank'
						rel='noopener noreferrer'
						className='text-brand underline underline-offset-4 hover:text-brand-hover'
					>
						Google Lighthouse
					</a>{' '}
					against the rendered page is the complement: it audits the actual
					DOM in a real browser, so it also catches contrast failures,
					malformed ARIA, and performance/SEO issues neither static tool
					looks for at all.
				</p>
			</section>

			{/* CI workflow */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>CI workflow</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					Either provider&apos;s config runs the check on every pull/merge request
					and on every push to <code className='font-mono text-xs'>main</code>,
					failing the job if any violation is found. The lint and test steps
					below are commented out. Uncomment whichever your project actually
					has; they aren&apos;t required for <code className='font-mono text-xs'>dafink-audit</code>{' '}
					itself to run.
				</p>
				<p className='text-sm font-medium text-text'>
					GitHub Actions: <code className='font-mono text-xs font-normal'>.github/workflows/dafink-audit.yml</code>
				</p>
				<CodeBlock code={GITHUB_WORKFLOW_YAML} />
				<p className='text-sm font-medium text-text'>
					GitLab CI: <code className='font-mono text-xs font-normal'>.gitlab-ci.yml</code>
				</p>
				<CodeBlock code={GITLAB_WORKFLOW_YAML} />
			</section>

		</div>
	);
};

export default ReliabilityPage;
