import { CodeBlock } from '@/src/components/CodeBlock/CodeBlock';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Typography',
	description: 'CSS typographic scale for standard HTML elements.',
};

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
