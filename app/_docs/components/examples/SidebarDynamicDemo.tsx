import { Sidebar, SidebarSection, SidebarSkeleton } from '@/src/components/Sidebar/Sidebar';

export const SidebarDynamicDemo = () => (
	<div className='flex h-64 w-full max-w-md overflow-hidden rounded-lg border border-surface-border'>
		<Sidebar width='w-44' height='h-full'>
			<SidebarSection label='Projects'>
				<SidebarSkeleton count={5} aria-label='Loading projects' />
			</SidebarSection>
		</Sidebar>
		<div className='flex flex-1 items-center justify-center p-4 text-center text-sm text-text-muted'>
			Loading projects…
		</div>
	</div>
);
