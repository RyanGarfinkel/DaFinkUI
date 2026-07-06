import { registry } from '@/app/_docs/registry/index';
import type { MetadataRoute } from 'next';

const BASE = 'https://ui.ryangarfinkel.dev';

export default function sitemap(): MetadataRoute.Sitemap
{
	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: BASE,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
		{ url: `${BASE}/installation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
		{ url: `${BASE}/theme`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
		{ url: `${BASE}/typography`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
		{ url: `${BASE}/mcp`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
		{ url: `${BASE}/examples`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
	];

	const componentRoutes: MetadataRoute.Sitemap = registry.map(entry => ({
		url:             `${BASE}/components/${entry.slug}`,
		lastModified:    new Date(),
		changeFrequency: 'monthly',
		priority:        0.8,
	}));

	return [...staticRoutes, ...componentRoutes];
}
