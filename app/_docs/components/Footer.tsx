import Link from 'next/link';

export const Footer = () =>
{
	const year = new Date().getFullYear();

	return (
		<footer className='border-t border-surface-border px-4 py-6 md:px-8'>
			<div className='max-w-6xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-text-subtle'>
				<span>© {year} DaFink UI</span>
				<nav aria-label='Footer navigation' className='flex items-center gap-5'>
					<a
						href='https://github.com/RyanGarfinkel/DaFinkUI'
						target='_blank'
						rel='noopener noreferrer'
						className='hover:text-text-muted transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring rounded-sm'
					>
						GitHub
					</a>
					<a
						href='https://www.npmjs.com/package/dafink-ui'
						target='_blank'
						rel='noopener noreferrer'
						className='hover:text-text-muted transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring rounded-sm'
					>
						npm
					</a>
					<Link
						href='/mcp'
						className='hover:text-text-muted transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring rounded-sm'
					>
						MCP Server
					</Link>
					<Link
						href='/installation'
						className='hover:text-text-muted transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring rounded-sm'
					>
						Installation
					</Link>
				</nav>
			</div>
		</footer>
	);
};
