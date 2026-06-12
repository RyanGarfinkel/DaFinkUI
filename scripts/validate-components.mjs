/**
 * Validates that every component is complete and consistent.
 *
 * Checks:
 *  1. Every component directory has: ComponentName.tsx, ComponentName.test.tsx, spec.md
 *  2. Every component source file appears in at least one registry entry's files array
 *  3. Every registry entry's files all exist on disk
 *  4. Every registry entry has a matching case in ComponentLivePreview.tsx
 *  5. Every registry entry's usage code contains the component as JSX (<ComponentName)
 *  6. The ComponentLivePreview case block also uses the component as JSX (<ComponentName)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = resolve(__dirname, '..');
const COMP_DIR   = join(ROOT, 'src/components');
const REGISTRY   = join(ROOT, 'app/_docs/registry/index.ts');
const PREVIEW    = join(ROOT, 'app/_docs/components/ComponentLivePreview.tsx');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const errors   = [];
const warnings = [];

const fail = (msg) => errors.push(`  ✗ ${msg}`);
const warn = (msg) => warnings.push(`  ⚠ ${msg}`);

// ─── Parse registry ──────────────────────────────────────────────────────────

const registryText = readFileSync(REGISTRY, 'utf8');

// Properties in registry entries are indented with 4 spaces. Props inside
// the props array are deeper (8+), so anchoring to exactly 4 spaces prevents
// false matches from nested objects.
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

const entries = slugs.map((slug, i) => ({ slug, name: names[i], files: filesBlocks[i] }));

// ─── Parse ComponentLivePreview ───────────────────────────────────────────────

const previewText = readFileSync(PREVIEW, 'utf8');

const caseSlugSet = new Set(
	[...previewText.matchAll(/case\s+'([^']+)':/g)].map(m => m[1])
);

const getCaseBlock = (slug) =>
{
	const start = previewText.indexOf(`case '${slug}':`);
	if(start === -1) return null;

	// Walk forward to the next case keyword or the end of the switch block.
	const rest  = previewText.slice(start);
	const endMatch = rest.match(/\n\s+case\s+'|\n\s+default:/);
	return endMatch ? rest.slice(0, endMatch.index) : rest;
}

// ─── Extract per-entry text regions from registry ────────────────────────────

// Rather than parsing template literals (which breaks on escaped backticks),
// slice the registry text between each entry's slug line and the next one.
// This gives us the full text of each entry to search for JSX usage.
const buildEntryRegions = () =>
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
}

const entryRegions = buildEntryRegions();

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

// ─── Check 2: Every component source file appears in the registry ─────────────

console.log('Checking registry coverage…');

const allRegistryFiles = new Set(entries.flatMap(e => e.files));

for(const dir of compDirs)
{
	const relPath = `${dir}/${dir}.tsx`;
	if(!allRegistryFiles.has(relPath))
		fail(`${dir}/${dir}.tsx not listed in any registry entry's files array`);
}

// ─── Check 3: Every registry file exists on disk ──────────────────────────────

console.log('Checking registry file paths…');

for(const entry of entries)
{
	for(const file of entry.files)
	{
		const abs = join(COMP_DIR, file);
		if(!existsSync(abs))
			fail(`Registry '${entry.slug}': file '${file}' does not exist`);
	}
}

// ─── Check 4: Every registry entry has a live preview case ───────────────────

console.log('Checking live preview coverage…');

for(const entry of entries)
{
	if(!caseSlugSet.has(entry.slug))
		fail(`Registry '${entry.slug}' has no case in ComponentLivePreview.tsx`);
}

// ─── Check 5: Usage code contains the component as JSX ───────────────────────

console.log('Checking usage code contains JSX…');

for(const entry of entries)
{
	const region = entryRegions[entry.slug];
	if(!region)
	{
		warn(`Could not locate entry region for '${entry.slug}' — skipping JSX check`);
		continue;
	}

	if(!region.includes(`<${entry.name}`))
		fail(`Registry '${entry.slug}': usage code missing <${entry.name} JSX`);
}

// ─── Check 6: Preview case uses the same component ───────────────────────────

console.log('Checking preview/usage alignment…');

for(const entry of entries)
{
	const block = getCaseBlock(entry.slug);
	if(!block) continue; // already caught in check 4

	if(!block.includes(`<${entry.name}`))
		fail(`ComponentLivePreview case '${entry.slug}' missing <${entry.name} — preview and usage are out of sync`);
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

console.log(`✓ All ${entries.length} registry entries and ${compDirs.length} component directories are valid.\n`);
