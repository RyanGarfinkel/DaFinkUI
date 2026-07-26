import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: { absolute: 'DaFink UI' },
	description: 'A personal React component library built on Tailwind v4. Own your UI code: install only what you use, then read it, change it, and make it yours. Free and open source on GitHub.',
};

const PRINCIPLES = [
	{
		title: 'Subtle, intentional animations',
		body: 'Animation makes an interface feel alive. I\'d rather see a highlight slide into place than snap there instantly. But it can\'t be everywhere: inject it into every interaction and it stops feeling alive and starts feeling overengineered.',
	},
	{
		title: 'Consistency',
		body: 'Colors and spacing that drift slightly from page to page never feels right. Every value comes from the same set of CSS variables, so the site feels like one continuous experience instead of a collection of one-off pages.',
	},
	{
		title: 'Accessible by default',
		body: 'WCAG AA contrast, keyboard navigation, and screen reader support aren\'t a pass at the end, they\'re part of the plan before any code gets written. If a component can\'t be used with a keyboard alone, it isn\'t finished.',
	},
	{
		title: 'Functionality and style',
		body: 'A component has to work first, but that\'s not where it stops. The best details do both jobs at once: a focus ring that\'s also handsome, a transition that confirms an action and looks good doing it. Function and style aren\'t in tension, they\'re the same job.',
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
					No black-box packages hiding what&apos;s actually happening.
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
						easier for myself first. In undergrad I did a lot of UI work,
						from laying out entire pages to losing hours on individual
						components, like the time I spent a full hour figuring out how
						to style a button correctly in both its hover and selected
						states. That&apos;s where my opinions about how things should look
						and behave came from, and no library I&apos;ve used since had all of
						them built in without hours of overrides.
					</p>
					<p>
						It&apos;s also easier for whatever&apos;s writing the code alongside me.
						I think AI is only going to take on a bigger share of frontend work
						from here, and most component libraries weren&apos;t built with that
						in mind. An agent can&apos;t read a compiled npm package to understand
						how a component actually behaves, and it definitely can&apos;t explain
						why a prop exists.
					</p>
					<p>
						So instead of a package, DaFink UI ships as source you copy directly
						into your project, paired with documentation written so an LLM can
						use it correctly, not just a human skimming a README. The goal is
						an ecosystem of components with enough context that an LLM can treat
						them like Lego blocks: pick the right ones, snap them together, and
						end up with something accessible and good-looking, not just
						functional.
					</p>
					<p>
						I built a Claude Skill and an MCP server so an agent gets that
						context automatically instead of guessing from training data. And
						because I don&apos;t just want to trust that AI-generated UI is
						accessible, I also shipped CI/CD scripts (the same ones this project
						uses on itself) that check the output against real requirements:
						keyboard navigation, contrast, focus states. Something you can
						actually verify, not just hope for.
					</p>
					<p>
						The trade-off is the same one it&apos;s always been: you take on the
						source, I take on making sure it&apos;s clean, accessible, and
						documented well enough that you (or whatever you&apos;re pairing with)
						can actually own it.
					</p>
				</div>
			</section>

			{/* AI-native */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>AI-native</h2>
				<div className='flex flex-col gap-4 text-sm text-text-muted leading-relaxed'>
					<p>
						I&apos;ve seen firsthand how AI tools are getting woven into everyday
						workflows, and how imperfect they still are. They hallucinate, they
						forget style decisions between sessions, and if a rule isn&apos;t in
						the prompt, it&apos;s unlikely to make it into the product. I designed
						DaFink UI to be AI-native from the ground up instead of retrofitted
						after the fact, so every pattern, naming choice, and file structure
						holds up to an agent trying to understand and extend it, not just a
						human reading it.
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
						add that context to your workflow. Connect either to Claude, Cursor,
						or any MCP-compatible tool and the agent reads your actual component
						specs before writing any code, not training data from months ago.
						Each component ships with a{' '}
						<code className='font-mono text-xs'>spec.md</code> file documenting
						exactly how it should look and behave in every state, hover and
						focus included, so you don&apos;t have to re-explain it every session.
					</p>
					<p>
						As engineers we&apos;re still responsible for the code we push, whether
						we wrote it or an agent did. That&apos;s what the{' '}
						<Link
							href='/reliability'
							className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
						>
							reliability check
						</Link>{' '}
						is for: an audit tool built to run in your CI pipeline that checks
						the output against real accessibility requirements instead of just
						trusting good intentions.
					</p>
				</div>
			</section>

			{/* Design philosophy */}
			<section className='flex flex-col gap-6'>
				<div className='flex flex-col gap-2'>
					<h2 className='text-xl font-semibold text-text'>Design philosophy</h2>
					<p className='text-sm text-text-muted leading-relaxed max-w-2xl'>
						Over the last few years, as a frontend developer (and as a person
						who uses the internet) I&apos;ve grown preferences on the details that
						make a website stand out to me. I didn&apos;t pull these from a style
						guide, they&apos;re just what I&apos;ve noticed I like (and don&apos;t like)
						using other people&apos;s websites. These principles shape every
						component here: how it looks, how it moves, and how it behaves.
					</p>
				</div>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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

			{/* Features */}
			<section className='flex flex-col gap-5'>
				<h2 className='text-xl font-semibold text-text'>Features</h2>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<div className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'>
						<h3 className='text-sm font-semibold text-text'>
							Components
						</h3>
						<p className='text-sm text-text-muted leading-relaxed'>
							The building blocks of your interface. The{' '}
							<Link
								href='/components'
								className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
							>
								add command
							</Link>{' '}
							copies the source code directly into your repository, ready to
							edit and make your own.
						</p>
					</div>

					<div className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'>
						<h3 className='text-sm font-semibold text-text'>
							Blocks
						</h3>
						<p className='text-sm text-text-muted leading-relaxed'>
							Premade{' '}
							<Link
								href='/blocks'
								className='text-text underline underline-offset-4 hover:text-text-muted transition-colors'
							>
								layouts
							</Link>{' '}
							you can drop into a project to ship a feature fast. Swap in your
							own data and go.
						</p>
					</div>

					<div className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'>
						<h3 className='text-sm font-semibold text-text'>
							Token-based theming
						</h3>
						<p className='text-sm text-text-muted leading-relaxed'>
							Every color, radius, and timing value in every component resolves
							through a CSS custom property. Swap the tokens, change the look.
							No component modifications required. Dark mode and all six themes
							(Zinc, Ocean, Ember, Forest, Noir, and Plum) work this way. Bring
							your own brand by overriding the same tokens.
						</p>
					</div>

					<div className='flex flex-col gap-2 rounded-lg border border-surface-border bg-surface p-5'>
						<h3 className='text-sm font-semibold text-text'>
							AI-assisted development
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
							requirements, not just hallucinated APIs and good intentions.
						</p>
					</div>
				</div>
			</section>

			{/* Quick start */}
			<section className='flex flex-col gap-4'>
				<h2 className='text-xl font-semibold text-text'>Quick start</h2>
				<p className='text-sm text-text-muted leading-relaxed'>
					Initialize DaFink UI in your project, then add your first component.
					The CLI copies the source into{' '}
					<code className='font-mono text-xs'>components/ui/</code>, installs
					any npm dependencies, and transitively resolves any other DaFink UI
					components it depends on.
				</p>
				<div className='flex flex-col gap-2'>
					<div className='bg-surface-active rounded-lg px-4 py-3 font-mono text-sm text-text flex items-center gap-2'>
						<span className='text-text-subtle select-none'>$</span>
						<span>npx dafink-ui init</span>
					</div>
					<div className='bg-surface-active rounded-lg px-4 py-3 font-mono text-sm text-text flex items-center gap-2'>
						<span className='text-text-subtle select-none'>$</span>
						<span>npx dafink-ui add button</span>
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
						on GitHub. Use it, fork it, contribute back. It&apos;s yours.
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
