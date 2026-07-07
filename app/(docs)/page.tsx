import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: { absolute: 'DaFink UI — Copy-paste React components' },
	description: 'Browse accessible, copy-paste React components built on Tailwind v4. Own your UI code — no black-box packages, no fighting the library. Free and open source on GitHub.',
};

const PRINCIPLES = [
	{
		title: 'Subtle over loud',
		body: 'Restraint is a feature. Hover states, transitions, and shadows should be noticeable without demanding attention. If a visual element isn\'t communicating something, it shouldn\'t be there.',
	},
	{
		title: 'Consistent over clever',
		body: 'Prefer the established pattern. Deviations require justification. A predictable interface lets users focus on their task — not on figuring out how something works.',
	},
	{
		title: 'Functional and decorative',
		body: 'A detail doesn\'t have to justify itself with a function to earn its place — sometimes it\'s just nice to look at. But most color, motion, and emphasis should be doing double duty: communicating state while also making the interface pleasant to be in.',
	},
	{
		title: 'Motion with purpose',
		body: 'Every animation must earn its place. A transition that orients the user or confirms an action is welcome. One that exists because it looks nice is noise.',
	},
	{
		title: 'Lively, not static',
		body: 'A well-built interface feels alive. Every hover, focus change, and state transition responds with a visible but subtle cue. Micro-animations on interactive elements are the baseline expectation, not a finishing touch.',
	},
	{
		title: 'Accessible by default',
		body: 'WCAG AA contrast, keyboard navigation, and screen reader support are built in from the first line of code — not retrofitted. If a component can\'t be used with a keyboard alone, it isn\'t finished.',
	},
];

const Home = () =>
{
	return (
		<div className='flex flex-col gap-14'>

			{/* Hero */}
			<section className='flex flex-col gap-5 pt-2'>
				<h1 className='text-4xl font-semibold tracking-tight text-text'>
					DaFink UI
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

			{/* Why I built this */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Why I built this</h2>
				<div className='flex flex-col gap-4 text-sm text-text-muted leading-relaxed'>
					<p>
						I built DaFink UI because I wanted frontend development to be
						easier — for me, and for whatever&apos;s writing the code alongside me.
						I think AI is only going to take on a bigger share of frontend work
						from here, and most component libraries weren&apos;t built with that
						in mind. An agent can&apos;t read a compiled npm package to understand
						how a component actually behaves, and it definitely can&apos;t explain
						why a prop exists.
					</p>
					<p>
						So instead of a package, DaFink UI ships as source you copy directly
						into your project, paired with documentation written so an LLM can
						use it correctly — not just a human skimming a README. The goal is
						an ecosystem of components with enough context that an LLM can treat
						them like Lego blocks: pick the right ones, snap them together, and
						end up with something accessible and good-looking, not just
						functional.
					</p>
					<p>
						I built a Claude Skill and an MCP server so an agent gets that
						context automatically instead of guessing from training data. And
						because I don&apos;t just want to trust that AI-generated UI is
						accessible, I also shipped CI/CD scripts — the same ones this project
						uses on itself — that check the output against real requirements:
						keyboard navigation, contrast, focus states. Something you can
						actually verify, not just hope for.
					</p>
					<p>
						The trade-off is the same one it&apos;s always been: you take on the
						source, I take on making sure it&apos;s clean, accessible, and
						documented well enough that you — or whatever you&apos;re pairing with —
						can actually own it.
					</p>
				</div>
			</section>

			{/* AI in the loop */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>AI in the loop</h2>
				<div className='flex flex-col gap-4 text-sm text-text-muted leading-relaxed'>
					<p>
						I designed DaFink UI to be AI-native from the ground up, not
						retrofitted after the fact. Every pattern, naming choice, and file
						structure is built to hold up to an agent trying to understand and
						extend it — not just a human reading it. Owned source code beats a
						compiled dependency here: an agent can read a component and modify
						it directly instead of guessing at a black box.
					</p>
					<p>
						The{' '}
						<Link
							href='/mcp'
							className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
						>
							MCP server
						</Link>{' '}
						and the{' '}
						<Link
							href='/skill'
							className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
						>
							Claude Skill
						</Link>{' '}
						close the loop. Connect either to Claude, Cursor, or any
						MCP-compatible tool and the agent reads your actual component
						specs before writing any code — not training data from months ago.
						It gets the real props, the correct variants, and the accessibility
						requirements for the component it&apos;s about to use, then can run
						the{' '}
						<Link
							href='/reliability'
							className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
						>
							reliability check
						</Link>{' '}
						afterward to check its own work.
					</p>
				</div>
			</section>

			{/* Design philosophy */}
			<section className='flex flex-col gap-6'>
				<div className='flex flex-col gap-2'>
					<h2 className='text-xl font-semibold text-text'>Design philosophy</h2>
					<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
						I didn&apos;t pull these from a style guide — they&apos;re just what I&apos;ve
						noticed I like (and don&apos;t like) using other people&apos;s websites. Clean,
						consistent layouts. Animation that means something instead of just
						moving. A hover or focus state on anything you can click. These
						principles shape every component here: how it looks, how it moves,
						and how it behaves.
					</p>
				</div>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{PRINCIPLES.map((p) => (
						<div
							key={p.title}
							className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'
						>
							<h3 className='text-sm font-semibold text-text'>{p.title}</h3>
							<p className='text-sm text-text-muted leading-relaxed'>{p.body}</p>
						</div>
					))}
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
							no component modifications required. Dark mode and all six themes
							(Zinc, Ocean, Ember, Forest, Noir, and Plum) work this way. Bring
							your own brand by overriding the same tokens.
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
							and{' '}
							<Link
								href='/skill'
								className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
							>
								Claude Skill
							</Link>{' '}
							expose every component spec, token, and design pattern as a live
							resource, and the{' '}
							<Link
								href='/reliability'
								className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
							>
								reliability check
							</Link>{' '}
							checks whatever gets built against real accessibility
							requirements — not just hallucinated APIs and good intentions.
						</p>
					</div>
				</div>
			</section>

			{/* Quick start */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Quick start</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					Install a component with a single command. The CLI copies the source
					into <code className='font-mono text-xs'>components/ui/</code>, installs
					any npm dependencies, and transitively resolves any other DaFink UI
					components it depends on.
				</p>
				<div className='flex flex-col gap-2'>
					<div className='bg-surface-active rounded-lg px-4 py-3 font-mono text-sm text-text flex items-center gap-2'>
						<span className='text-text-subtle select-none'>$</span>
						<span>npx @dafink/ui add button</span>
					</div>
					<div className='bg-surface-active rounded-lg px-4 py-3 font-mono text-sm text-text flex items-center gap-2'>
						<span className='text-text-subtle select-none'>$</span>
						<span>npx @dafink/ui add modal</span>
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

			{/* Open source */}
			<section className='flex flex-col gap-4 border-t border-surface-border pt-10'>
				<div className='flex flex-col gap-2'>
					<h2 className='text-xl font-semibold text-text'>Open source</h2>
					<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
						DaFink UI is free and open source. The code, the docs, and the CLI are all
						on GitHub. Use it, fork it, contribute back — it&apos;s yours.
					</p>
				</div>
				<div className='flex flex-wrap gap-3'>
					<a
						href='https://github.com/RyanGarfinkel/DaFinkUI'
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-2 rounded-md border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover active:bg-surface-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
					>
						<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
							<path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z' />
						</svg>
						View on GitHub
					</a>
					<a
						href='https://github.com/RyanGarfinkel/DaFinkUI/blob/main/CONTRIBUTING.md'
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-2 rounded-md border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover active:bg-surface-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring'
					>
						Contribute
					</a>
				</div>
			</section>

			{/* Creator */}
			<section className='flex items-center gap-1.5 text-sm text-text-muted pb-2'>
				<span>Created by</span>
				<a
					href='https://ryangarfinkel.dev'
					target='_blank'
					rel='noopener noreferrer'
					className='font-medium text-text underline underline-offset-4 hover:text-text-muted transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring rounded-sm'
				>
					Ryan Garfinkel
				</a>
			</section>

		</div>
	);
};

export default Home;
