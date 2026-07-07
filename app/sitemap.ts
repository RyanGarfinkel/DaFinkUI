import { registry } from '@/app/_docs/registry/index';
import { blocks } from '@/app/_docs/registry/blocks';
import type { MetadataRoute } from 'next';

const BASE = 'https://ui.ryangarfinkel.dev';

export default function sitemap(): MetadataRoute.Sitemap
{
	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: BASE,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
		{ url: `${BASE}/installation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
		{ url: `${BASE}/theme`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
		{ url: `${BASE}/typography`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
		{ url: `${BASE}/mcp`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
		{ url: `${BASE}/skill`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
		{ url: `${BASE}/reliability`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
		{ url: `${BASE}/playground`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
		{ url: `${BASE}/blocks`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
		{ url: `${BASE}/changelog`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
	];

	const componentRoutes: MetadataRoute.Sitemap = registry.map(entry => ({
		url:             `${BASE}/components/${entry.slug}`,
		lastModified:    new Date(),
		changeFrequency: 'monthly',
		priority:        0.8,
	}));

	const blockRoutes: MetadataRoute.Sitemap = blocks.map(entry => ({
		url:             `${BASE}/blocks/${entry.slug}`,
		lastModified:    new Date(),
		changeFrequency: 'monthly',
		priority:        0.7,
	}));

	return [...staticRoutes, ...componentRoutes, ...blockRoutes];
}
