/**
 * Validates that every component is complete and consistent.
 *
 * Runs against two catalogs — the component registry (index.ts +
 * ComponentLivePreview.tsx) and the effect registry (effects.ts +
 * EffectLivePreview.tsx) — since effects are real components that just live
 * in their own docs registry/gallery. See rules/docs-site.md -> "Effect
 * Registry".
 *
 * Checks:
 *  1. Every component directory has: ComponentName.tsx, ComponentName.test.tsx, spec.md
 *  2. Every component source file appears in at least one registry entry's files array (either catalog)
 *  3. Every registry entry's files all exist on disk
 *  4. Every registry entry has a matching case in its catalog's live preview file
 *  5. Every registry entry's usage code contains the component as JSX (<ComponentName)
 *  6. The live preview case block also uses the component as JSX (<ComponentName)
 *  7. Every component directory has a CLI registry entry (across registry.ts + blocksRegistry.ts's component-shaped entries)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = resolve(__dirname, '..');
const COMP_DIR   = join(ROOT, 'src/components');

const CATALOGS = [
	{
		label:      'component',
		registry:   join(ROOT, 'app/_docs/registry/index.ts'),
		preview:    join(ROOT, 'app/_docs/components/ComponentLivePreview.tsx'),
	},
	{
		label:      'effect',
		registry:   join(ROOT, 'app/_docs/registry/effects.ts'),
		preview:    join(ROOT, 'app/_docs/components/EffectLivePreview.tsx'),
	},
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const errors   = [];
const warnings = [];

const fail = (msg) => errors.push(`  ✗ ${msg}`);
const warn = (msg) => warnings.push(`  ⚠ ${msg}`);

// Properties in registry entries are indented with 4 spaces. Props inside
// the props array are deeper (8+), so anchoring to exactly 4 spaces prevents
// false matches from nested objects.
const parseRegistry = (registryText) =>
{
	const slugs       = [...registryText.matchAll(/^ {4}slug:\s*'([^']+)'/gm)].map(m => m[1]);
	const names       = [...registryText.matchAll(/^ {4}name:\s*'([^']+)'/gm)].map(m => m[1]);
	const filesBlocks = [...registryText.matchAll(/^ {4}files:\s*\[([^\]]*)\]/gm)].map(m =>
		[...m[1].matchAll(/'([^']+)'/g)].map(f => f[1])
	);

	if(slugs.length !== names.length || slugs.length !== filesBlocks.length)
	{
		console.error('Registry parse error: unequal counts of slug/name/files entries.');
		console.error(`  slugs=${slugs.length}  names=${names.length}  files=${filesBlocks.length}`);
		process.exit(1);
	}

	return slugs.map((slug, i) => ({ slug, name: names[i], files: filesBlocks[i] }));
};

// Rather than parsing template literals (which breaks on escaped backticks),
// slice the registry text between each entry's slug line and the next one.
// This gives us the full text of each entry to search for JSX usage.
const buildEntryRegions = (registryText) =>
{
	const regions = {};
	const slugPositions = [...registryText.matchAll(/^ {4}slug:\s*'([^']+)'/gm)];

	for(let i = 0; i < slugPositions.length; i++)
	{
		const slug  = slugPositions[i][1];
		const start = slugPositions[i].index;
		const end   = i + 1 < slugPositions.length ? slugPositions[i + 1].index : registryText.length;
		regions[slug] = registryText.slice(start, end);
	}

	return regions;
};

const getCaseBlock = (previewText, slug) =>
{
	const start = previewText.indexOf(`case '${slug}':`);
	if(start === -1) return null;

	// Walk forward to the next case keyword or the end of the switch block.
	const rest  = previewText.slice(start);
	const endMatch = rest.match(/\n\s+case\s+'|\n\s+default:/);
	return endMatch ? rest.slice(0, endMatch.index) : rest;
};

// ─── Parse both catalogs ───────────────────────────────────────────────────

for(const catalog of CATALOGS)
{
	catalog.registryText  = readFileSync(catalog.registry, 'utf8');
	catalog.previewText   = readFileSync(catalog.preview, 'utf8');
	catalog.entries       = parseRegistry(catalog.registryText);
	catalog.entryRegions  = buildEntryRegions(catalog.registryText);
	catalog.caseSlugSet   = new Set(
		[...catalog.previewText.matchAll(/case\s+'([^']+)':/g)].map(m => m[1])
	);

	// Hidden entries (e.g. "charts") back other entries' registryDependencies
	// without a catalog page of their own, so they don't necessarily render as
	// their own named JSX; checks 5 and 6 skip them for that reason.
	catalog.hiddenSlugs = new Set(
		Object.entries(catalog.entryRegions)
			.filter(([, region]) => /^ {4}hidden:\s*true/m.test(region))
			.map(([slug]) => slug)
	);
}

const allEntries = CATALOGS.flatMap(c => c.entries);

// ─── Collect component directories ───────────────────────────────────────────

const compDirs = readdirSync(COMP_DIR).filter(name =>
	statSync(join(COMP_DIR, name)).isDirectory()
);

// ─── Check 1: Required files in each component directory ─────────────────────

console.log('\nChecking required files…');

for(const dir of compDirs)
{
	const base = join(COMP_DIR, dir);

	if(!existsSync(join(base, `${dir}.tsx`)))
		fail(`${dir}/ missing ${dir}.tsx`);

	if(!existsSync(join(base, `${dir}.test.tsx`)))
		fail(`${dir}/ missing ${dir}.test.tsx`);

	if(!existsSync(join(base, 'spec.md')))
		fail(`${dir}/ missing spec.md`);
}

// ─── Check 2: Every component source file appears in a registry ──────────────

console.log('Checking registry coverage…');

const allRegistryFiles = new Set(allEntries.flatMap(e => e.files));

for(const dir of compDirs)
{
	const relPath = `${dir}/${dir}.tsx`;
	if(!allRegistryFiles.has(relPath))
		fail(`${dir}/${dir}.tsx not listed in any registry entry's files array`);
}

// ─── Check 3: Every registry file exists on disk ──────────────────────────────

console.log('Checking registry file paths…');

for(const entry of allEntries)
{
	for(const file of entry.files)
	{
		const abs = join(COMP_DIR, file);
		if(!existsSync(abs))
			fail(`Registry '${entry.slug}': file '${file}' does not exist`);
	}
}

// ─── Checks 4-6: per-catalog live preview coverage and JSX alignment ─────────

console.log('Checking live preview coverage…');
console.log('Checking usage code contains JSX…');
console.log('Checking preview/usage alignment…');

for(const catalog of CATALOGS)
{
	for(const entry of catalog.entries)
	{
		if(!catalog.caseSlugSet.has(entry.slug))
			fail(`Registry '${entry.slug}' has no case in ${catalog.label} live preview`);
	}

	for(const entry of catalog.entries)
	{
		if(catalog.hiddenSlugs.has(entry.slug)) continue;

		const region = catalog.entryRegions[entry.slug];
		if(!region)
		{
			warn(`Could not locate entry region for '${entry.slug}', skipping JSX check`);
			continue;
		}

		if(!region.includes(`<${entry.name}`))
			fail(`Registry '${entry.slug}': usage code missing <${entry.name} JSX`);
	}

	for(const entry of catalog.entries)
	{
		if(catalog.hiddenSlugs.has(entry.slug)) continue;

		const block = getCaseBlock(catalog.previewText, entry.slug);
		if(!block) continue; // already caught above

		if(!block.includes(`<${entry.name}`))
			fail(`${catalog.label} live preview case '${entry.slug}' missing <${entry.name}: preview and usage are out of sync`);
	}
}

// ─── Check 7: Every component directory has a CLI registry entry ──────────────

console.log('Checking CLI registry coverage…');

const CLI_REGISTRY_FILE = join(ROOT, 'packages/cli/src/lib/registry.ts');
const cliText  = readFileSync(CLI_REGISTRY_FILE, 'utf8');

// Matched against `files:` (not `name:`) for the same reason as check 2: a
// directory's primary export name (e.g. KanbanBoard in Kanban/) doesn't
// always match its folder name, but its file path always does.
const cliFiles = new Set(
	[...cliText.matchAll(/'([^']+\.tsx)'/g)].map(m => m[1])
);

for(const dir of compDirs)
{
	if(!cliFiles.has(`${dir}/${dir}.tsx`))
		fail(`${dir}/${dir}.tsx is missing from packages/cli/src/lib/registry.ts`);
}

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('');

if(warnings.length > 0)
{
	console.warn('Warnings:');
	warnings.forEach(w => console.warn(w));
	console.log('');
}

if(errors.length > 0)
{
	console.error(`Component validation failed with ${errors.length} error(s):\n`);
	errors.forEach(e => console.error(e));
	console.error('');
	process.exit(1);
}

console.log(`✓ All ${allEntries.length} registry entries and ${compDirs.length} component directories are valid.\n`);
