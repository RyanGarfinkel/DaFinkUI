import { changelog } from '@/app/_docs/registry/changelog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Changelog',
	description: 'Version history for the dafink-ui package.',
};

const formatDate = (date: string | null) =>
{
	if(!date) return null;

	return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
		year:  'numeric',
		month: 'long',
		day:   'numeric',
	});
}

const formatVersion = (version: string) => version === 'Unreleased' ? version : `v${version}`;

const ChangelogPage = () =>
{
	return (
		<div className='flex flex-col gap-10'>
			<div className='flex flex-col gap-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-text'>Changelog</h1>
				<p className='text-base text-text-muted leading-relaxed'>
					Version history for the <code className='font-mono text-xs bg-surface-active rounded px-1.5 py-0.5'>dafink-ui</code> package, generated from commit history.
				</p>
			</div>

			<div className='flex flex-col gap-10'>
				{changelog.map((entry, index) => (
					<section key={entry.version} className='flex flex-col gap-5 border-t border-surface-border pt-8 first:border-t-0 first:pt-0'>
						<div className='flex flex-wrap items-baseline gap-3'>
							<h2 className='text-2xl font-semibold tracking-tight text-text'>{formatVersion(entry.version)}</h2>
							{entry.version === 'Unreleased'
								? <span className='text-sm font-medium text-text-subtle'>Unreleased</span>
								: index === (changelog[0]?.version === 'Unreleased' ? 1 : 0) && (
									<span className='text-sm font-medium text-brand'>Latest</span>
								)}
							{formatDate(entry.date) && (
								<span className='text-sm text-text-subtle'>{formatDate(entry.date)}</span>
							)}
						</div>

						<div className='flex flex-col gap-5'>
							{entry.sections.map((section) => (
								<div key={section.label} className='flex flex-col gap-2'>
									<span className='text-sm font-semibold text-text uppercase tracking-wide'>
										{section.label}
									</span>
									<ul className='flex flex-col gap-1.5 pl-4 text-sm text-text-muted list-none'>
										{section.changes.map((change) => (
											<li key={change} className='flex items-baseline gap-2'>
												<span className='inline-block w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1' />
												<span>{change}</span>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}

export default ChangelogPage;
