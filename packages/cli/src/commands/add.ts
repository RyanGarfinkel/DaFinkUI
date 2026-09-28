import { resolveBlock, type BlockRegistryEntry, type BlockFileEntry, type BlockFileKind } from '../lib/blocksRegistry.js';
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { REGISTRY, resolve as resolveEntry } from '../lib/registry.js';
import { rewriteImportSpecifiers } from '../lib/rewriteImports.js';
import type { RegistryEntry } from '../lib/registry.js';
import { readConfig, type DaFinkConfig } from '../lib/config.js';
import { generateBarrel } from '../lib/barrel.js';
import { addKindAlias } from '../lib/tsconfig.js';
import { spinner, log } from '@clack/prompts';
import { execSync } from 'child_process';
import { resolve, dirname, basename, relative, sep } from 'path';
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

const NEXT_LINK_WITH_PROPS_RE = /^import Link, \{ (\w+) \} from ['"]next\/link['"];\n/m;
const NEXT_LINK_BARE_RE = /^import Link from ['"]next\/link['"];\n/m;
const NEXT_USE_PATHNAME_RE = /^import \{ usePathname \} from ['"]next\/navigation['"];\n/m;
const REACT_NAMED_IMPORT_RE = /^import \{([^}]+)\} from 'react';/m;

function replaceLinkTag(content: string): string
{
	return content.replace(/<Link\b/g, '<a').replace(/<\/Link>/g, '</a>');
}

function addNamedReactImport(content: string, name: string): string
{
	const match = content.match(REACT_NAMED_IMPORT_RE);

	if(!match)
		return `import { ${name} } from 'react';\n${content}`;

	const names = match[1].split(',').map(n => n.trim()).filter(Boolean);
	if(names.includes(name)) return content;

	names.push(name);
	return content.replace(REACT_NAMED_IMPORT_RE, `import { ${names.join(', ')} } from 'react';`);
}

/** next/link and next/navigation are the only Next-only APIs the registry currently
 * uses (Link, LinkProps, usePathname); everything else in the registry is already
 * framework-agnostic. Anything outside those three still falls through to the warning
 * below rather than being silently left broken. */
function transformForReact(content: string, file: string): string
{
	let result = content.replace(/^'use client';\n\n?/m, '');

	const linkPropsMatch = result.match(NEXT_LINK_WITH_PROPS_RE);

	if(linkPropsMatch)
	{
		const typeName = linkPropsMatch[1];
		result = result.replace(NEXT_LINK_WITH_PROPS_RE, '');
		result = result.replace(new RegExp(`\\b${typeName}\\b`, 'g'), 'AnchorHTMLAttributes<HTMLAnchorElement>');
		result = addNamedReactImport(result, 'AnchorHTMLAttributes');
		result = replaceLinkTag(result);
	}
	else if(NEXT_LINK_BARE_RE.test(result))
	{
		result = result.replace(NEXT_LINK_BARE_RE, '');
		result = replaceLinkTag(result);
	}

	if(NEXT_USE_PATHNAME_RE.test(result))
	{
		result = result.replace(NEXT_USE_PATHNAME_RE, '');
		result = result.replace(/usePathname\(\)/g, "(typeof window !== 'undefined' ? window.location.pathname : '')");
	}

	const remainingNextImports = [...result.matchAll(/from ['"]next\//g)];
	if(remainingNextImports.length > 0)
		log.warn(pc.yellow(`${file} has Next.js imports; review and replace manually`));

	return result;
}

/** Each kind's config field (`modelsDir`/`hooksDir` are plural, `apiDir` isn't — this map
 * exists so nothing has to derive one from the other by string-munging). */
const KIND_DIR_FIELD: Record<BlockFileKind, keyof DaFinkConfig> = {
	api:   'apiDir',
	model: 'modelsDir',
	hook:  'hooksDir',
};

const KIND_ALIAS_PREFIX: Record<BlockFileKind, string> = {
	api:   '@api',
	model: '@models',
	hook:  '@hooks',
};

interface BlockRouting
{
	cwd:        string;
	blockSlug:  string;
	config:     DaFinkConfig;
	files:      BlockFileEntry[];
	blockDir:   string; // absolute path to this block's own folder (where untagged files land)
}

/** A block's kind-tagged files land in the consumer's configured directory for that kind
 * (namespaced by the block's own slug, so two blocks' files never collide) whenever `routing`
 * is passed — the caller decides once, for the whole entry, whether that's the case (i.e.
 * fileOrganization is 'split') rather than this being re-checked per file. Everything else —
 * untagged files, or every file when routing is omitted — installs into the block's own
 * folder exactly as it always has. */
function resolveFileDest(file: BlockFileEntry, routing: BlockRouting): { path: string; destPath: string; destDir: string }
{
	const path = typeof file === 'string' ? file : file.path;

	if(typeof file === 'string')
		return { path, destPath: resolve(routing.blockDir, basename(path)), destDir: routing.blockDir };

	const destDir = resolve(routing.cwd, routing.config[KIND_DIR_FIELD[file.kind]] as string, routing.blockSlug);
	return { path, destPath: resolve(destDir, basename(path)), destDir };
}

/** The alias map for *this specific file*, since it depends on where the file being written
 * itself ends up, not just on the entry as a whole:
 * - every tagged sibling's `./name` always rewrites to its alias (`@api/<slug>/name`, etc.) —
 *   true regardless of which file is asking, tagged or not, since alias resolution doesn't
 *   care where the importer physically lives.
 * - an untagged sibling's `./name` only needs rewriting when *this* file is itself moving
 *   (tagged): its relative path back to the block's own folder (where untagged files stay)
 *   changes because this file's own directory changed, even though the untagged sibling
 *   didn't move at all. A file that isn't moving needs no such correction — its relative
 *   paths to other stay-put siblings are already correct.
 */
function buildAliasMapForFile(file: BlockFileEntry, files: BlockFileEntry[], blockSlug: string, destDir: string, blockDir: string): Record<string, string>
{
	const map: Record<string, string> = {};
	const thisFileIsMoving = typeof file !== 'string';

	for(const sibling of files)
	{
		if(typeof sibling === 'string')
		{
			if(!thisFileIsMoving) continue; // stay-put file referencing another stay-put file: already correct
			const name = basename(sibling).replace(/\.tsx?$/, '');
			const rel = relative(destDir, blockDir).split(sep).join('/') || '.';
			map[`./${name}`] = `${rel}/${name}`;
		}
		else
		{
			const name = basename(sibling.path).replace(/\.tsx?$/, '');
			map[`./${name}`] = `${KIND_ALIAS_PREFIX[sibling.kind]}/${blockSlug}/${name}`;
		}
	}

	return map;
}

function copyFile(file: BlockFileEntry, registryDir: URL, targetDir: string, stripNextjs: boolean, routing?: BlockRouting): void
{
	const { path, destPath, destDir } = routing ? resolveFileDest(file, routing) : { path: file as string, destPath: resolve(targetDir, file as string), destDir: targetDir };

	mkdirSync(dirname(destPath), { recursive: true });

	const aliasMap = routing ? buildAliasMapForFile(file, routing.files, routing.blockSlug, destDir, routing.blockDir) : {};
	const needsRewrite = Object.keys(aliasMap).length > 0;

	if(stripNextjs || needsRewrite)
	{
		let content = readFileSync(new URL(path, registryDir).pathname, 'utf8');
		if(stripNextjs) content = transformForReact(content, path);
		if(needsRewrite) content = rewriteImportSpecifiers(content, aliasMap);
		writeFileSync(destPath, content, 'utf8');
	}
	else
	{
		copyFileSync(new URL(path, registryDir).pathname, destPath);
	}

	log.info(pc.dim('copied ') + pc.cyan(path) + pc.dim(` → ${destPath}`));
}

function copyEntry(entry: { files: BlockFileEntry[] }, registryDir: URL, targetDir: string, stripNextjs: boolean, withTests: boolean, routing?: BlockRouting): void
{
	for(const file of entry.files)
	{
		copyFile(file, registryDir, targetDir, stripNextjs, routing);

		if(!withTests) continue;

		const path = typeof file === 'string' ? file : file.path;
		const testFile = path.replace(/\.tsx$/, '.test.tsx');
		const testSrcPath = new URL(testFile, registryDir).pathname;

		if(existsSync(testSrcPath))
			copyFile(testFile, registryDir, targetDir, stripNextjs, routing);
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

export async function runAdd(inputs: string[], options: { all?: boolean; withTests?: boolean; flat?: boolean }, cwd: string): Promise<void>
{
	const config = readConfig(cwd);
	// The --flat flag overrides the persisted default for this one invocation only; it never
	// rewrites dafink.config.json.
	const split = !options.flat && config.fileOrganization !== 'flat';
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
	const aliasedKinds = new Set<BlockFileKind>();

	for(const entry of blockEntries)
	{
		const taggedKinds = entry.files.filter((f): f is Exclude<BlockFileEntry, string> => typeof f !== 'string').map(f => f.kind);
		// Every file in an entry shares one source folder (e.g. all of 'AiChat/*.ts(x)') —
		// that's also where an untagged file installs, so it doubles as blockDir.
		const blockFolder = dirname(typeof entry.files[0] === 'string' ? entry.files[0] : entry.files[0].path);
		const routing: BlockRouting | undefined = split && taggedKinds.length > 0
			? { cwd, blockSlug: entry.slug, config, files: entry.files, blockDir: resolve(blocksTargetDir, blockFolder) }
			: undefined;

		if(routing)
		{
			for(const kind of new Set(taggedKinds))
			{
				if(aliasedKinds.has(kind)) continue;
				aliasedKinds.add(kind);

				const aliasResult = addKindAlias(cwd, kind, config[KIND_DIR_FIELD[kind]] as string);
				if(aliasResult.updated)
					log.info(pc.dim(aliasResult.configFile!) + pc.dim(` updated with @${KIND_ALIAS_PREFIX[kind].slice(1)}/* alias`));
				else
					log.warn(pc.yellow(aliasResult.reason ?? `skipped ${kind} alias setup`));
			}
		}

		copyEntry(entry, blocksRegistryDir, blocksTargetDir, stripNextjs, withTests, routing);
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
