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

const HOOK_LAYERS: { title: string; when: string; desc: string }[] = [
	{ title: 'While code is written', when: 'Claude Code PostToolUse', desc: 'Lints the one file just written or edited and sends problems straight back, so they are fixed in the same turn. Seconds.' },
	{ title: 'When you commit', when: 'Git pre-commit and commit-msg', desc: 'Lints only the staged files and checks the commit message. Keep it under about ten seconds, or people will skip it.' },
	{ title: 'When you push, and in CI', when: 'Git pre-push, then your CI workflow', desc: 'Runs typecheck, the audit and the full test suite. CI repeats all of it and is the one layer that cannot be skipped.' },
];

const STOP_HOOK = `{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "npm run typecheck && npm test", "timeout": 300 }
        ]
      }
    ]
  }
}`;

const PRE_COMMIT_HOOK = 'npx lint-staged';

const LINT_STAGED_CONFIG = `{
  "lint-staged": {
    "*.{ts,tsx,mjs}": "eslint --fix"
  }
}`;

const COMMIT_MSG_HOOK = 'npx --no -- commitlint --edit $1';

const PRE_PUSH_HOOK = `node scripts/dafink-audit.mjs
npm run typecheck
npm test`;

const ReliabilityPage = () => {
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
					DaFink UI ships its own ESLint rules: single quotes, import ordering,
					brace placement, <code className='font-mono text-xs'>&apos;use client&apos;</code>{' '}
					spacing, and no banner comments. <code className='font-mono text-xs'>npx dafink-ui init</code>{' '}
					offers them as an option. To add them to an existing project:
				</p>
				<CodeBlock code='npx dafink-ui eslint' />
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					This writes <code className='font-mono text-xs'>eslint-rules/</code> and{' '}
					<code className='font-mono text-xs'>eslint.dafink.mjs</code>, installs{' '}
					<code className='font-mono text-xs'>eslint-plugin-perfectionist</code> as a
					dev dependency, and creates an{' '}
					<code className='font-mono text-xs'>eslint.config.mjs</code> if you don&apos;t
					have one. If you do, spread{' '}
					<code className='font-mono text-xs'>dafinkConfig</code> from{' '}
					<code className='font-mono text-xs'>eslint.dafink.mjs</code> into your
					existing config. The rules are style opinions, so drop any you
					disagree with from <code className='font-mono text-xs'>eslint.dafink.mjs</code>.
				</p>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					None of the above renders a component or asserts on its behavior.
					That&apos;s what UI testing is for. Pass{' '}
					<code className='font-mono text-xs'>--with-tests</code> to{' '}
					<code className='font-mono text-xs'>dafink-ui add</code> and each
					component&apos;s own <code className='font-mono text-xs'>.test.tsx</code>{' '}
					is copied in alongside it, giving you a real starting point instead of
					an empty file. Components install as a single file (<code className='font-mono text-xs'>Button.tsx</code>)
					by default; with the flag, each gets its own folder
					(<code className='font-mono text-xs'>Button/Button.tsx</code> and{' '}
					<code className='font-mono text-xs'>Button/Button.test.tsx</code>):
				</p>
				<CodeBlock code='npx dafink-ui add button --with-tests' />
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					Off by default since it assumes Vitest and{' '}
					<code className='font-mono text-xs'>@testing-library/react</code>. If
					your project uses a different test runner, skip the flag and treat the
					component&apos;s test file on its docs page as a reference instead.
				</p>
			</section>

			{/* Hooks */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Hooks</h2>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					CI catches a violation after the push. Hooks catch it earlier, at the
					moment the code is written or committed, so the feedback arrives while
					the change is still small. Use all three layers, each doing only what
					is cheap enough for its moment:
				</p>
				<div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
					{HOOK_LAYERS.map((layer) => (
						<div
							key={layer.title}
							className='rounded-lg border border-surface-border bg-surface p-4 flex flex-col gap-1.5'
						>
							<p className='text-sm font-semibold text-text'>{layer.title}</p>
							<p className='text-xs text-text-subtle'>{layer.when}</p>
							<p className='text-sm text-text-muted leading-relaxed'>{layer.desc}</p>
						</div>
					))}
				</div>

				<h3 className='text-base font-semibold text-text'>Claude Code lint hook</h3>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					A <code className='font-mono text-xs'>PostToolUse</code> hook that runs
					ESLint with the DaFink rules on every file Claude Code writes or edits,
					and shows Claude any problems straight away so it fixes them in the same
					turn instead of leaving them for review. It lints only the edited file,
					so it stays fast.
				</p>
				<CodeBlock code='npx dafink-ui hook install' />
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					This adds the hook to <code className='font-mono text-xs'>.claude/settings.json</code>.
					Pass <code className='font-mono text-xs'>--fix</code> to have it autofix
					what it can before reporting the rest, or set it up during setup with{' '}
					<code className='font-mono text-xs'>npx dafink-ui init --hook</code>. It
					needs the ESLint setup from <code className='font-mono text-xs'>npx dafink-ui lint --init</code>;
					without one it skips every file. Restart any running Claude Code session
					to pick it up.
				</p>
				<ul className='flex max-w-2xl list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-text-muted'>
					<li>
						Keep it to the one edited file. Anything slow, like a typecheck or the
						test suite, belongs in a <code className='font-mono text-xs'>Stop</code> hook
						that runs once when Claude finishes, not after every edit.
					</li>
					<li>
						Exit with code 2 to send the problems back to Claude. Any other
						non-zero exit only shows them to you.
					</li>
					<li>
						Skip generated and vendored paths such as{' '}
						<code className='font-mono text-xs'>node_modules</code>,{' '}
						<code className='font-mono text-xs'>.next</code> and installed registry copies,
						so Claude never fixes files you will overwrite.
					</li>
					<li>
						Commit <code className='font-mono text-xs'>.claude/settings.json</code> so
						the whole team gets the same hooks, and keep personal permissions in{' '}
						<code className='font-mono text-xs'>.claude/settings.local.json</code>.
					</li>
				</ul>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					A <code className='font-mono text-xs'>Stop</code> hook that runs the heavier checks once per turn:
				</p>
				<CodeBlock code={STOP_HOOK} />
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					If the command fails and exits with code 2, Claude keeps working instead of
					stopping, so make sure it can pass. The hook input includes{' '}
					<code className='font-mono text-xs'>stop_hook_active</code>; a script can read it
					to avoid blocking twice in a row.
				</p>

				<h3 className='text-base font-semibold text-text'>Git hooks</h3>
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					With{' '}
					<a
						href='https://typicode.github.io/husky'
						target='_blank'
						rel='noopener noreferrer'
						className='text-brand underline underline-offset-4 hover:text-brand-hover'
					>
						Husky
					</a>{' '}
					and <code className='font-mono text-xs'>lint-staged</code>, the commit stays fast
					because only the files you changed are checked. In{' '}
					<code className='font-mono text-xs'>.husky/pre-commit</code>:
				</p>
				<CodeBlock code={PRE_COMMIT_HOOK} />
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					and in <code className='font-mono text-xs'>package.json</code>:
				</p>
				<CodeBlock code={LINT_STAGED_CONFIG} />
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					Check the commit message in <code className='font-mono text-xs'>.husky/commit-msg</code> with{' '}
					<code className='font-mono text-xs'>commitlint</code>, so history stays readable and
					changelogs can be generated from it:
				</p>
				<CodeBlock code={COMMIT_MSG_HOOK} />
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					Put the slower checks, which are the audit, the typecheck and the tests, in{' '}
					<code className='font-mono text-xs'>.husky/pre-push</code>:
				</p>
				<CodeBlock code={PRE_PUSH_HOOK} />
				<ul className='flex max-w-2xl list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-text-muted'>
					<li>
						Add <code className='font-mono text-xs'>&quot;prepare&quot;: &quot;husky&quot;</code> to
						your scripts so the hooks install on every{' '}
						<code className='font-mono text-xs'>npm install</code>. Hooks that need a manual
						step are hooks nobody has.
					</li>
					<li>
						Run the same commands in hooks and in CI. When they differ, a commit passes
						locally and fails in review.
					</li>
					<li>
						Don&apos;t put autofixers that rewrite files outside the staged set in a hook.{' '}
						<code className='font-mono text-xs'>lint-staged</code> re-stages what it fixes;
						a bare <code className='font-mono text-xs'>eslint --fix .</code> does not.
					</li>
					<li>
						Hooks run on your machine and can be skipped with{' '}
						<code className='font-mono text-xs'>--no-verify</code>, so they are a convenience,
						not a guarantee. Keep the CI workflow above as the check that can&apos;t be bypassed,
						and protect the main branch so it has to pass.
					</li>
				</ul>
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
				<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
					You can run the same engine, <code className='font-mono text-xs'>axe-core</code>,
					inside your unit tests too. Render a component, run axe on the result, and fail on
					any violation. That catches missing names, bad ARIA and invalid roles per component,
					on every <code className='font-mono text-xs'>npm test</code>, long before a page
					exists to audit. jsdom has no layout, so leave contrast to Lighthouse.
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
