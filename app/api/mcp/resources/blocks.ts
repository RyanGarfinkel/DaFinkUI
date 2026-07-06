import { blocks, BlockEntry } from '@/app/_docs/registry/blocks';

export const getFullBlockRegistry = () =>
{
	return blocks;
};

export const getBlockRegistryEntry = (name: string): string =>
{
	const lower = name.toLowerCase();
	const entry = blocks.find(
		(e) => e.slug.toLowerCase() === lower || e.name.toLowerCase() === lower
	);

	if(!entry)
	{
		const slugs = blocks.map((e) => e.slug);
		throw new Error(`No block registry entry found for: ${name}. Available: ${slugs.join(', ')}`);
	}

	return JSON.stringify(entry);
};

export const listBlocksByCategory = (category?: string): string =>
{
	if(category)
	{
		const lower = category.toLowerCase();
		const matches = blocks.filter((e) => e.category.toLowerCase() === lower);
		return JSON.stringify(matches);
	}

	const grouped = blocks.reduce<Record<string, BlockEntry[]>>((acc, entry) =>
	{
		if(!acc[entry.category]) acc[entry.category] = [];
		acc[entry.category].push(entry);
		return acc;
	}, {});

	return JSON.stringify(grouped);
};

export const searchBlocks = (query: string): string =>
{
	const lower = query.toLowerCase();

	const nameMatches: BlockEntry[] = [];
	const descMatches: BlockEntry[] = [];

	for(const entry of blocks)
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
		const allNames = blocks.map((e) => e.name).join(', ');
		return `No blocks found matching "${query}". Available blocks: ${allNames}`;
	}

	return JSON.stringify(results);
};
