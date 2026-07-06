import { DocsShell } from '@/app/_docs/components/DocsShell';
import Link from 'next/link';

const BUTTON_BASE = 'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium tracking-tight h-9 px-4 text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring active:scale-[0.98]';
const BUTTON_PRIMARY = 'bg-brand text-brand-fg shadow-[var(--shadow-sm)] hover:bg-brand-hover hover:shadow-[var(--shadow)] active:bg-brand-active';
const BUTTON_SECONDARY = 'bg-surface text-text border-[length:var(--border-width)] border-surface-border shadow-[var(--shadow-sm)] hover:bg-surface-hover hover:border-surface-border-hover active:bg-surface-active focus-visible:border-transparent';

const NotFound = () => {
	return (
		<DocsShell>
			<div className='flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center'>
				<svg width='40' height='40' viewBox='0 0 22 22' fill='currentColor' aria-hidden='true' className='text-text-subtle'>
					<path
						fillRule='evenodd'
						clipRule='evenodd'
						d='M5.5 0h11A5.5 5.5 0 0 1 22 5.5v11A5.5 5.5 0 0 1 16.5 22h-11A5.5 5.5 0 0 1 0 16.5v-11A5.5 5.5 0 0 1 5.5 0zm5.5 5.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 1 0 0-11z'
					/>
				</svg>

				<p className='font-mono text-sm text-text-subtle tracking-wide'>
					{'<Error status={404} />'}
				</p>

				<div className='flex flex-col gap-2'>
					<h1 className='text-4xl font-semibold tracking-tight text-text'>
						Page not found
					</h1>
					<p className='max-w-sm text-base text-text-muted leading-relaxed'>
						This page doesn&apos;t exist, or it moved. Try searching for a component,
						or head back to the homepage.
					</p>
				</div>

				<div className='flex flex-wrap items-center justify-center gap-3'>
					<Link href='/' className={`${BUTTON_BASE} ${BUTTON_PRIMARY}`}>
						Back to home
					</Link>
					<Link href='/components' className={`${BUTTON_BASE} ${BUTTON_SECONDARY}`}>
						Browse components
					</Link>
				</div>

				<p className='text-xs text-text-subtle'>
					Tip: press <kbd className='rounded border border-surface-border px-1.5 py-0.5 font-mono'>/</kbd> to search.
				</p>
			</div>
		</DocsShell>
	);
};

export default NotFound;
