import { CATEGORIES } from '@/app/_docs/registry/categories';
import { blocks } from '@/app/_docs/registry/blocks';
import { registry } from '@/app/_docs/registry';

export interface PageOrderEntry
{
	href:  string;
	label: string;
}

export const TOP_NAV_PAGES: PageOrderEntry[] = [
	{ href: '/',             label: 'Home' },
	{ href: '/installation', label: 'Installation' },
	{ href: '/components',   label: 'Components' },
	{ href: '/theme',        label: 'Theme' },
	{ href: '/typography',   label: 'Typography' },
	{ href: '/mcp',          label: 'MCP Server' },
	{ href: '/skill',        label: 'Design Skill' },
	{ href: '/reliability',  label: 'Reliability' },
	{ href: '/playground',   label: 'Playground' },
	{ href: '/blocks',       label: 'Blocks' },
	{ href: '/changelog',    label: 'Changelog' },
];

export const getComponentsByCategory = () => CATEGORIES.reduce<Record<string, typeof registry>>((acc, category) =>
{
	const entries = registry.filter((entry) => entry.category === category);
	if(entries.length > 0) acc[category] = entries;
	return acc;
}, {});

export const getPageOrder = (): PageOrderEntry[] =>
{
	const byCategory = getComponentsByCategory();

	const componentPages = CATEGORIES.filter((category) => byCategory[category]).flatMap((category) =>
		byCategory[category].map((entry) => ({ href: `/components/${entry.slug}`, label: entry.name }))
	);

	const blockPages = blocks.map((entry) => ({ href: `/blocks/${entry.slug}`, label: entry.name }));

	return [
		...TOP_NAV_PAGES,
		...componentPages,
		...blockPages,
	];
};
