'use client';

import { MenuBar, MenuBarBrand, MenuBarActions, MenuBarNav, MenuBarNavItem, MenuBarNavMore } from '@/src/components/MenuBar/MenuBar';
import { Resizable, ResizablePanel, ResizableHandle } from '@/src/components/Resizable/Resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/Tabs/Tabs';
import TableOfContents from '@/src/components/TableOfContents/TableOfContents';
import Breadcrumb from '@/src/components/Breadcrumb/Breadcrumb';
import Button from '@/src/components/Button/Button';
import { useState } from 'react';

export const TabsPreview = () => {
	const [value, setValue] = useState('account');

	return (
		<div className='w-full max-w-sm'>
			<Tabs value={value} onValueChange={setValue}>
				<TabsList>
					<TabsTrigger value='account'>Account</TabsTrigger>
					<TabsTrigger value='security'>Security</TabsTrigger>
					<TabsTrigger value='notifications'>Notifications</TabsTrigger>
				</TabsList>
				<TabsContent value='account'>
					<p className='text-base text-text leading-7'>Manage your account settings and preferences.</p>
				</TabsContent>
				<TabsContent value='security'>
					<p className='text-base text-text leading-7'>Update your password and two-factor settings.</p>
				</TabsContent>
				<TabsContent value='notifications'>
					<p className='text-base text-text leading-7'>Choose what notifications you receive and how.</p>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export const MenuBarPreview = () => {
	const [value, setValue] = useState('home');

	return (
		<div className='w-full max-w-2xl overflow-hidden rounded-lg border border-surface-border'>
			<MenuBar className='relative'>
				<MenuBarBrand>
					<span className='font-semibold text-text'>Acme</span>
				</MenuBarBrand>
				<MenuBarNav value={value} onValueChange={setValue} aria-label='Main' className='mx-auto'>
					<MenuBarNavItem value='home'>Home</MenuBarNavItem>
					<MenuBarNavItem value='docs'>Docs</MenuBarNavItem>
					<MenuBarNavItem value='pricing'>Pricing</MenuBarNavItem>
					<MenuBarNavMore
						value='more'
						items={[
							{ label: 'Blog', value: 'blog' },
							{ label: 'Changelog', value: 'changelog' },
							{ label: 'Support', value: 'support' },
						]}
					>
						More
					</MenuBarNavMore>
				</MenuBarNav>
				<MenuBarActions>
					<Button variant='ghost' size='icon' aria-label='Search'>
						<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8' /><path d='m21 21-4.3-4.3' /></svg>
					</Button>
					<Button size='sm'>Sign in</Button>
				</MenuBarActions>
			</MenuBar>
		</div>
	);
};

export const TableOfContentsPreview = () => (
	<div className='flex gap-8 items-start'>
		<div id='toc-demo-content' className='flex flex-col gap-6 max-w-sm'>
			<h2 id='overview'>Overview</h2>
			<p className='text-sm text-text-muted'>A short introduction to the section.</p>
			<h3 id='getting-started'>Getting started</h3>
			<p className='text-sm text-text-muted'>Steps to get up and running.</p>
			<h2 id='advanced-usage'>Advanced usage</h2>
			<p className='text-sm text-text-muted'>Additional configuration options.</p>
		</div>
		<TableOfContents containerId='toc-demo-content' />
	</div>
);

export const BreadcrumbPreview = () => (
	<Breadcrumb
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Components', href: '/components' },
			{ label: 'Breadcrumb' },
		]}
	/>
);

export const ResizablePreview = () => (
	<Resizable direction='horizontal' className='flex h-64 w-full overflow-hidden rounded-[var(--radius)] border border-surface-border'>
		<ResizablePanel defaultSize={160} minSize={120} maxSize={240} className='flex items-center justify-center bg-surface-panel text-sm text-text-muted'>
			Sidebar
		</ResizablePanel>
		<ResizableHandle aria-label='Resize sidebar' />
		<ResizablePanel minSize={200} className='flex'>
			<Resizable direction='vertical' className='flex-1 min-w-0'>
				<ResizablePanel minSize={80} className='flex items-center justify-center bg-surface text-sm text-text-muted'>
					Editor
				</ResizablePanel>
				<ResizableHandle aria-label='Resize terminal panel' />
				<ResizablePanel defaultSize={120} minSize={80} maxSize={200} className='flex items-center justify-center bg-surface-panel text-sm text-text-muted'>
					Terminal
				</ResizablePanel>
			</Resizable>
		</ResizablePanel>
	</Resizable>
);
