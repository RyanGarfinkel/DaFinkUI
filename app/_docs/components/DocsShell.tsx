'use client';

import { TableOfContents } from '@/app/_docs/components/TableOfContents';
import { DocsSidebar } from '@/app/_docs/components/DocsSidebar';
import { PageNav } from '@/app/_docs/components/PageNav';
import { Footer } from '@/app/_docs/components/Footer';
import { TopNav } from '@/app/_docs/components/TopNav';
import { useState } from 'react';

interface DocsShellProps
{
	children: React.ReactNode;
}

export const DocsShell = ({ children }: DocsShellProps) => {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<>
			<TopNav collapsed={collapsed} />
			<DocsSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
			<div
				className={[
					'flex min-h-screen flex-col pt-14',
					'motion-safe:transition-[margin-left] motion-safe:duration-200 motion-safe:ease-[var(--ease-standard)]',
					collapsed ? 'md:ml-16' : 'md:ml-56',
				].join(' ')}
			>
				<div className='flex-1 min-w-0 w-full px-4 pt-6 pb-8 md:px-8 md:pt-8 md:pb-10 max-w-[92rem] mx-auto xl:flex xl:items-start xl:gap-8'>
					<main className='min-w-0 max-w-6xl mx-auto xl:mx-0 xl:flex-1'>
						<div id='docs-content'>
							{children}
						</div>
						<PageNav />
					</main>
					<TableOfContents />
				</div>
				<Footer />
			</div>
		</>
	);
};
