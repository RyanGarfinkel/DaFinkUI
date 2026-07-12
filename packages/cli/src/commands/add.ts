import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { resolveBlock, type BlockRegistryEntry } from '../lib/blocksRegistry.js';
import { REGISTRY, resolve as resolveEntry } from '../lib/registry.js';
import type { RegistryEntry } from '../lib/registry.js';
import { generateBarrel } from '../lib/barrel.js';
import { spinner, log } from '@clack/prompts';
import { readConfig } from '../lib/config.js';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import pc from 'picocolors';

function detectPackageManager(cwd: string): 'pnpm' | 'yarn' | 'npm'
{
	if(existsSync(resolve(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
	if(existsSync(resolve(cwd, 'yarn.lock'))) return 'yarn';
	return 'npm';
}

function installCmd(pm: 'pnpm' | 'yarn' | 'npm', deps: string[]): string
{
	const pkgs = deps.join(' ');
	if(pm === 'pnpm') return `pnpm add ${pkgs}`;
	if(pm === 'yarn') return `yarn add ${pkgs}`;
	return `npm install ${pkgs}`;
}

function transformForReact(content: string, file: string): string
{
	let result = content.replace(/^'use client';\n\n?/m, '');

	const nextImports = [...result.matchAll(/from ['"]next\//g)];
	if(nextImports.length > 0)
		log.warn(pc.yellow(`${file} has Next.js imports; review and replace manually`));

	return result;
}

function copyFile(file: string, registryDir: URL, targetDir: string, stripNextjs: boolean): void
{
	const srcPath = new URL(file, registryDir).pathname;
	const destPath = resolve(targetDir, file);

	mkdirSync(dirname(destPath), { recursive: true });

	if(stripNextjs)
	{
		const content = readFileSync(srcPath, 'utf8');
		writeFileSync(destPath, transformForReact(content, file), 'utf8');
	}
	else
	{
		copyFileSync(srcPath, destPath);
	}

	log.info(pc.dim('copied ') + pc.cyan(file) + pc.dim(` → ${destPath}`));
}

function copyEntry(entry: { files: string[] }, registryDir: URL, targetDir: string, stripNextjs: boolean, withTests: boolean): void
{
	for(const file of entry.files)
	{
		copyFile(file, registryDir, targetDir, stripNextjs);

		if(!withTests) continue;

		const testFile = file.replace(/\.tsx$/, '.test.tsx');
		const testSrcPath = new URL(testFile, registryDir).pathname;

		if(existsSync(testSrcPath))
			copyFile(testFile, registryDir, targetDir, stripNextjs);
	}
}

/** Walks `registryDependencies` to a fixed point, so e.g. requesting a block
 * that depends on Form also pulls in Form's own dependencies (Input, Button). */
function resolveComponentsTransitive(initialSlugs: string[]): RegistryEntry[]
{
	const resolved = new Map<string, RegistryEntry>();
	const queue = [...initialSlugs];

	while(queue.length > 0)
	{
		const slug = queue.shift()!;
		if(resolved.has(slug)) continue;

		const entry = REGISTRY.find(e => e.slug === slug);
		if(!entry) continue;

		resolved.set(slug, entry);
		queue.push(...entry.registryDependencies);
	}

	return [...resolved.values()];
}

export async function runAdd(inputs: string[], options: { all?: boolean; withTests?: boolean }, cwd: string): Promise<void>
{
	const config = readConfig(cwd);
	const componentsTargetDir = resolve(cwd, config.componentsDir);
	const blocksTargetDir = resolve(cwd, config.blocksDir);
	const pm = detectPackageManager(cwd);

	// import.meta.url here is dist/commands/add.js. registry/ and blocks/ are
	// siblings of dist/ at the package root, so this needs two levels up, not one.
	const componentsRegistryDir = new URL('../../registry/', import.meta.url);
	const blocksRegistryDir = new URL('../../blocks/', import.meta.url);

	const blockEntries: BlockRegistryEntry[] = [];
	const requestedComponentSlugs: string[] = [];

	if(options.all)
	{
		requestedComponentSlugs.push(...REGISTRY.map(e => e.slug));
	}
	else
	{
		if(inputs.length === 0)
		{
			log.error('Specify component/block name(s) or use --all');
			process.exit(1);
		}

		for(const input of inputs)
		{
			const componentEntry = resolveEntry(input);

			if(componentEntry)
			{
				requestedComponentSlugs.push(componentEntry.slug);
				continue;
			}

			const blockEntry = resolveBlock(input);

			if(blockEntry)
			{
				blockEntries.push(blockEntry);
				requestedComponentSlugs.push(...blockEntry.registryDependencies);
				continue;
			}

			log.warn(pc.yellow(`Unknown component or block: ${input}`) + ', skipping');
		}
	}

	const componentEntries = resolveComponentsTransitive(requestedComponentSlugs);

	if(blockEntries.length === 0 && componentEntries.length === 0)
	{
		log.error('No valid components or blocks to add.');
		process.exit(1);
	}

	const stripNextjs = config.framework === 'react';
	const withTests = options.withTests ?? false;

	const s = spinner();
	s.start(`Copying ${blockEntries.length + componentEntries.length} item(s)...`);

	const allDeps = new Set<string>();

	for(const entry of blockEntries)
	{
		copyEntry(entry, blocksRegistryDir, blocksTargetDir, stripNextjs, withTests);
		entry.deps.forEach(d => allDeps.add(d));
	}

	for(const entry of componentEntries)
	{
		copyEntry(entry, componentsRegistryDir, componentsTargetDir, stripNextjs, withTests);
		entry.deps.forEach(d => allDeps.add(d));
	}

	s.stop('Files copied.');

	if(componentEntries.length > 0)
		generateBarrel(componentsTargetDir);

	if(allDeps.size > 0)
	{
		const deps = [...allDeps];
		const cmd = installCmd(pm, deps);

		log.info(`Installing dependencies: ${pc.cyan(cmd)}`);

		execSync(cmd, { cwd, stdio: 'inherit' });

		log.success('Dependencies installed.');
	}

	const addedNames = [...blockEntries, ...componentEntries].map(e => pc.bold(e.name)).join(', ');

	log.success(
		`Added ${addedNames} to ${pc.dim(config.blocksDir)} / ${pc.dim(config.componentsDir)}`
	);

	if(withTests)
	{
		log.info(
			'Test files copied alongside their components. They assume Vitest + ' +
			pc.cyan('@testing-library/react') + '. Install and configure those in your project for the tests to run.'
		);
	}
}
