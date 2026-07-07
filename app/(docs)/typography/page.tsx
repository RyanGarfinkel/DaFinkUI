import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Typography',
	description: 'CSS typographic scale for standard HTML elements.',
};

const FONT_SNIPPET = `/* layout.tsx — import the font */
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono';

/* globals.css — apply to body; the scale inherits it */
body {
  font-family: 'Inter Variable', system-ui, sans-serif;
}

code, pre, kbd {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}`;

const CSS_SNIPPET = `@layer base {
  h1         { @apply text-4xl font-bold tracking-tight text-text; }
  h2         { @apply text-3xl font-semibold tracking-tight text-text; }
  h3         { @apply text-2xl font-semibold tracking-tight text-text; }
  h4         { @apply text-xl font-semibold text-text; }
  p          { @apply text-base text-text leading-7; }
  blockquote { @apply border-l-2 border-surface-border pl-4 italic text-text-muted; }
  code       { @apply text-sm font-mono bg-surface-active px-1.5 py-0.5 rounded text-text; }
  small      { @apply text-xs text-text-muted; }
}`;

const TypographyPage = () =>
{
	return (
		<div className='flex flex-col gap-10'>

			<div className='flex flex-col gap-3'>
				<h1 className='text-4xl font-bold tracking-tight text-text'>Typography</h1>
				<p className='text-base text-text leading-7 max-w-2xl'>
					Add these styles to your <code className='text-sm font-mono bg-surface-active px-1.5 py-0.5 rounded text-text'>globals.css</code> to apply the typographic scale to standard HTML elements. No component import required — use native HTML tags directly.
				</p>
			</div>

			<section className='flex flex-col gap-8'>
				<div className='flex flex-col gap-3'>
					<h2 className='text-2xl font-semibold tracking-tight text-text'>Choosing fonts</h2>
					<p className='text-base text-text leading-7 max-w-2xl'>
						Typography is often the first thing users perceive — before they read a word. A bad font
						breaks trust instantly. A good one disappears into the reading experience and lets the
						content do the work. Font choices affect readability, personality, and performance.
						DaFink UI doesn&apos;t bundle a font; we give you the scale and you supply the voice.
					</p>
				</div>

				<div className='flex flex-col gap-6 max-w-2xl'>
					<h3 className='text-lg font-semibold tracking-tight text-text'>Font roles</h3>

					<div className='flex flex-col gap-5'>
						<div className='flex flex-col gap-1.5 pl-4 border-l-2 border-surface-border'>
							<p className='text-sm font-semibold text-text'>Display</p>
							<p className='text-sm text-text-muted leading-6'>
								Hero headings and large feature text only — never body copy. Highly expressive at
								big sizes, unreadable small. If you use a display face, constrain it to h1 on
								marketing pages and nowhere else. The scale applies{' '}
								<code className='text-xs font-mono bg-surface-active px-1 py-0.5 rounded text-text'>tracking-tight</code>{' '}
								to headings — pick a font that looks intentional at tight tracking, not squeezed.
							</p>
						</div>

						<div className='flex flex-col gap-1.5 pl-4 border-l-2 border-surface-border'>
							<p className='text-sm font-semibold text-text'>Heading</p>
							<p className='text-sm text-text-muted leading-6'>
								Section titles, card headers, labels. Needs strong weight contrast from body so
								hierarchy is immediately clear. Sans-serifs with clear geometry work well — they
								read crisply at h2–h4 sizes and feel authoritative without shouting.
							</p>
						</div>

						<div className='flex flex-col gap-1.5 pl-4 border-l-2 border-surface-border'>
							<p className='text-sm font-semibold text-text'>Body</p>
							<p className='text-sm text-text-muted leading-6'>
								The workhorse. Must be legible at 16–20px with good line spacing (~1.5).
								Neutral sans-serifs like Inter and Lato are standard because they never compete
								with the UI around them. Hard floor: <strong className='text-text font-medium'>16px minimum.</strong>{' '}
								Below that, mobile browsers auto-zoom on focus and disorient users.
								Avoid condensed or display fonts at body size — they look striking in a specimen
								and exhausting in a product.
							</p>
						</div>

						<div className='flex flex-col gap-1.5 pl-4 border-l-2 border-surface-border'>
							<p className='text-sm font-semibold text-text'>Monospace</p>
							<p className='text-sm text-text-muted leading-6'>
								Code blocks, terminal output, technical values. Always use monospace when showing
								code — the fixed-width columns signal &ldquo;this is structured data&rdquo; in a
								way no proportional font can replicate. IBM Plex Mono, JetBrains Mono, and Fira
								Code are top choices. Ligature support (→, =&gt;, ≥) is useful but not worth
								sacrificing legibility.
							</p>
						</div>
					</div>
				</div>

				<div className='flex flex-col gap-4 max-w-2xl'>
					<h3 className='text-lg font-semibold tracking-tight text-text'>Pairing rules</h3>
					<ul className='flex flex-col gap-2.5 text-sm text-text-muted leading-6'>
						<li className='flex gap-2'><span className='text-text-subtle select-none mt-0.5'>—</span><span>Two fonts maximum for most UIs (heading + body), three if you need a mono face for code. Beyond that you&apos;re just adding noise.</span></li>
						<li className='flex gap-2'><span className='text-text-subtle select-none mt-0.5'>—</span><span><strong className='text-text font-medium'>Contrast is the key rule.</strong> Heading and body need to feel different enough to create hierarchy and similar enough to feel unified. Avoid two fonts of the same style at the same weight.</span></li>
						<li className='flex gap-2'><span className='text-text-subtle select-none mt-0.5'>—</span><span>The most reliable pairing: geometric or display heading + humanist sans-serif body. The geometry reads as structure; the humanism reads as warmth.</span></li>
						<li className='flex gap-2'><span className='text-text-subtle select-none mt-0.5'>—</span><span><strong className='text-text font-medium'>Variable fonts are worth it in 2026.</strong> One file covers every weight you need — no more loading separate 400/600/700 files. The performance win is real and the DX is better.</span></li>
					</ul>
				</div>

				<div className='flex flex-col gap-4 max-w-2xl'>
					<h3 className='text-lg font-semibold tracking-tight text-text'>Performance</h3>
					<ul className='flex flex-col gap-2.5 text-sm text-text-muted leading-6'>
						<li className='flex gap-2'><span className='text-text-subtle select-none mt-0.5'>—</span><span><strong className='text-text font-medium'>System font stacks load instantly</strong> — no network request, no layout shift. Use them when brand consistency isn&apos;t critical: internal tools, dashboards, admin UIs.</span></li>
						<li className='flex gap-2'><span className='text-text-subtle select-none mt-0.5'>—</span><span>When loading custom fonts: subset to the character ranges you actually use, serve as WOFF2, and set <code className='text-xs font-mono bg-surface-active px-1 py-0.5 rounded text-text'>font-display: swap</code> so text is visible immediately with a fallback while the custom font loads.</span></li>
					</ul>
				</div>

				<div className='flex flex-col gap-3 max-w-2xl'>
					<h3 className='text-lg font-semibold tracking-tight text-text'>Line length</h3>
					<p className='text-sm text-text-muted leading-6'>
						Keep body text at 50–75 characters per line. Around 66 is the sweet spot — enough
						to read in rhythm, short enough that the eye can find the next line without effort.
						Wider than that and reading flow breaks down; narrower and the constant line-breaking
						feels choppy. The <code className='text-xs font-mono bg-surface-active px-1 py-0.5 rounded text-text'>max-w-2xl</code> constraint on
						this page is intentional.
					</p>
				</div>

				<div className='flex flex-col gap-4'>
					<h3 className='text-lg font-semibold tracking-tight text-text'>Recommended pairings</h3>
					<p className='text-sm text-text-muted leading-6 max-w-2xl'>
						These combinations are tested against DaFink UI&apos;s token set across light and dark
						surfaces. Any of them drops in with no adjustments to the scale.
					</p>

					<div className='flex flex-col gap-4'>

						<div className='rounded-lg border border-surface-border p-5 flex flex-col gap-3'>
							<div className='flex items-center gap-2'>
								<span className='text-sm font-semibold text-text'>Inter + JetBrains Mono</span>
								<span className='text-xs text-text-muted bg-surface-active px-2 py-0.5 rounded-full'>Safe default</span>
							</div>
							<p className='text-sm text-text-muted leading-6'>
								The neutral choice — works with every visual style. Inter&apos;s high x-height
								reads cleanly at 12px and looks authoritative at 48px. Available as a variable
								font via Fontsource. If you can&apos;t decide, start here.
							</p>
							<code className='text-xs font-mono text-text-muted'>npm install @fontsource-variable/inter @fontsource/jetbrains-mono</code>
						</div>

						<div className='rounded-lg border border-surface-border p-5 flex flex-col gap-3'>
							<div className='flex items-center gap-2'>
								<span className='text-sm font-semibold text-text'>Plus Jakarta Sans + JetBrains Mono</span>
								<span className='text-xs text-text-muted bg-surface-active px-2 py-0.5 rounded-full'>More personality</span>
							</div>
							<p className='text-sm text-text-muted leading-6'>
								Rounder and friendlier than Inter without going cute. Works well for
								consumer-facing products. Variable weight axis from 200–800 in a single file.
							</p>
							<code className='text-xs font-mono text-text-muted'>npm install @fontsource-variable/plus-jakarta-sans @fontsource/jetbrains-mono</code>
						</div>

						<div className='rounded-lg border border-surface-border p-5 flex flex-col gap-3'>
							<div className='flex items-center gap-2'>
								<span className='text-sm font-semibold text-text'>Geist + Geist Mono</span>
								<span className='text-xs text-text-muted bg-surface-active px-2 py-0.5 rounded-full'>Matched system</span>
							</div>
							<p className='text-sm text-text-muted leading-6'>
								Designed together — display, body, and mono share optical metrics and feel like
								a single voice. Slightly more condensed than Inter; good for dense UIs.
							</p>
							<code className='text-xs font-mono text-text-muted'>npm install geist</code>
						</div>

					</div>
				</div>

				<div className='flex flex-col gap-4'>
					<h3 className='text-lg font-semibold tracking-tight text-text'>Wiring it up</h3>
					<p className='text-sm text-text-muted leading-6 max-w-2xl'>
						Import the font in your root layout, then set{' '}
						<code className='text-xs font-mono bg-surface-active px-1 py-0.5 rounded text-text'>font-family</code> on{' '}
						<code className='text-xs font-mono bg-surface-active px-1 py-0.5 rounded text-text'>body</code> in{' '}
						<code className='text-xs font-mono bg-surface-active px-1 py-0.5 rounded text-text'>globals.css</code>.
						The type scale inherits it automatically.
					</p>
					<CodeBlock code={FONT_SNIPPET} />
				</div>

			</section>

			<section className='flex flex-col gap-4'>
				<h2 className='text-2xl font-semibold tracking-tight text-text'>CSS snippet</h2>
				<CodeBlock code={CSS_SNIPPET} />
			</section>

			<section className='flex flex-col gap-8'>
				<h2 className='text-2xl font-semibold tracking-tight text-text'>Live preview</h2>

				<div data-toc-exclude='' className='flex flex-col gap-6 rounded-lg border border-surface-border bg-surface-hover/30 p-8'>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>h1</p>
						<h1 className='text-4xl font-bold tracking-tight text-text'>The quick brown fox</h1>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>h2</p>
						<h2 className='text-3xl font-semibold tracking-tight text-text'>The quick brown fox</h2>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>h3</p>
						<h3 className='text-2xl font-semibold tracking-tight text-text'>The quick brown fox</h3>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>h4</p>
						<h4 className='text-xl font-semibold text-text'>The quick brown fox</h4>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>p (lead) — text-xl text-text-muted leading-7</p>
						<p className='text-xl text-text-muted leading-7'>A lead paragraph introduces a section with slightly larger, muted text to ease the reader in before the main body.</p>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>p</p>
						<p className='text-base text-text leading-7'>Body text sits at the base size with a comfortable line-height. It is the default reading style for paragraphs and prose content across your UI.</p>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>blockquote</p>
						<blockquote className='border-l-2 border-surface-border pl-4 italic text-text-muted'>
							Good design is as little design as possible.
						</blockquote>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>code</p>
						<p className='text-base text-text leading-7'>
							Inline code like <code className='text-sm font-mono bg-surface-active px-1.5 py-0.5 rounded text-text'>const x = 42</code> appears inline within body text.
						</p>
					</div>

					<div className='flex flex-col gap-1'>
						<p className='text-xs text-text-muted font-mono mb-2'>small</p>
						<small className='text-xs text-text-muted'>Caption or helper text rendered at the smallest size in the scale.</small>
					</div>

				</div>
			</section>

		</div>
	);
};

export default TypographyPage;
