import { getFullBlockRegistry, getBlockRegistryEntry } from './blocks';
import { registry as docsRegistry } from '@/app/_docs/registry/index';
import { getFullRegistry, getRegistryEntry } from './registry';
import { effects } from '@/app/_docs/registry/effects';
import { blocks } from '@/app/_docs/registry/blocks';
import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

const COMPONENTS_DIR = join(process.cwd(), 'src/components');
const BLOCKS_DIR = join(process.cwd(), 'src/blocks');

const directories = (root: string) =>
	readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

const filesRoots = (files: unknown[]) =>
	files.map((f) => String(typeof f === 'string' ? f : (f as { path: string }).path).split('/')[0]);

describe('MCP registry coverage', () =>
{
	it('serves every component and effect from the docs registries', () =>
	{
		const served = getFullRegistry(false).map((e) => e.slug);
		const expected = [...docsRegistry, ...effects].map((e) => e.slug);

		expect(served).toEqual(expected);
		for(const slug of expected) expect(() => getRegistryEntry(slug)).not.toThrow();
	});

	it('serves a registry entry and a spec for every component directory', () =>
	{
		const covered = new Set(getFullRegistry(true).flatMap((e) => filesRoots((e as { files: string[] }).files)));

		for(const dir of directories(COMPONENTS_DIR))
		{
			expect(covered.has(dir), `${dir} has no registry entry`).toBe(true);
			expect(existsSync(join(COMPONENTS_DIR, dir, 'spec.md')), `${dir} has no spec.md`).toBe(true);
		}
	});

	it('serves every block and has an entry for every block directory', () =>
	{
		expect(getFullBlockRegistry(false)).toHaveLength(blocks.length);
		for(const { slug } of blocks) expect(() => getBlockRegistryEntry(slug)).not.toThrow();

		const covered = new Set(blocks.flatMap((b) => filesRoots(b.files)));

		for(const dir of directories(BLOCKS_DIR))
			expect(covered.has(dir), `${dir} has no block registry entry`).toBe(true);
	});
});
