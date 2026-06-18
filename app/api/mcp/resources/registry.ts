import { registry, ComponentEntry } from '@/app/_docs/registry/index';

export const getFullRegistry = () =>
{
	return registry;
};

export const getRegistryEntry = (name: string): string =>
{
	const lower = name.toLowerCase();
	const entry = registry.find(
		(e) => e.slug.toLowerCase() === lower || e.name.toLowerCase() === lower
	);

	if(!entry)
	{
		const slugs = registry.map((e) => e.slug);
		throw new Error(`No registry entry found for: ${name}. Available: ${slugs.join(', ')}`);
	}

	return JSON.stringify(entry);
};

export const listByCategory = (category?: string): string =>
{
	if(category)
	{
		const lower = category.toLowerCase();
		const matches = registry.filter((e) => e.category.toLowerCase() === lower);
		return JSON.stringify(matches);
	}

	const grouped = registry.reduce<Record<string, ComponentEntry[]>>((acc, entry) =>
	{
		if(!acc[entry.category]) acc[entry.category] = [];
		acc[entry.category].push(entry);
		return acc;
	}, {});

	return JSON.stringify(grouped);
};

export const searchComponents = (query: string): string =>
{
	const lower = query.toLowerCase();

	const nameMatches: ComponentEntry[] = [];
	const descMatches: ComponentEntry[] = [];

	for(const entry of registry)
	{
		const nameHit =
			entry.name.toLowerCase().includes(lower) ||
			entry.slug.toLowerCase().includes(lower) ||
			entry.category.toLowerCase().includes(lower);

		if(nameHit)
		{
			nameMatches.push(entry);
			continue;
		}

		if(entry.description.toLowerCase().includes(lower))
			descMatches.push(entry);
	}

	const results = [...nameMatches, ...descMatches];

	if(results.length === 0)
	{
		const allNames = registry.map((e) => e.name).join(', ');
		return `No components found matching "${query}". Available components: ${allNames}`;
	}

	return JSON.stringify(results);
};
