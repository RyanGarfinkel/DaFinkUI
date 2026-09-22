/**
 * Scaffolds a new component or block, wiring every place the rules require.
 *
 *   npm run new:component -- Rating --category Inputs [--slug rating] [--description "..."]
 *   npm run new:block     -- PricingTable --category Marketing [--slug pricing-table] [--description "..."]
 *
 * Component: src/components/Name/{Name.tsx, Name.test.tsx, spec.md}, a registry
 * entry in app/_docs/registry/index.ts, a live preview case in
 * ComponentLivePreview.tsx, and an export in src/index.ts.
 *
 * Block: src/blocks/Name/Name.tsx, an entry in app/_docs/registry/blocks.ts,
 * and a preview in blockPreviews.tsx.
 *
 * Effects are not scaffolded; they live in their own registry (see
 * rules/docs-site.md -> "Effect Registry").
 *
 * Afterwards it runs eslint --fix on the touched files and `npm run
 * sync-registry`. Pass --no-lint / --no-sync to skip either. SCAFFOLD_ROOT
 * overrides the repo root (used to test against a scratch copy).
 *
 * Keep the templates below in step with rules/new-component.md and
 * rules/new-block.md.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = process.env.SCAFFOLD_ROOT ? resolve(process.env.SCAFFOLD_ROOT) : resolve(__dirname, '..');

const PATHS = {
	components:       join(ROOT, 'src/components'),
	blocks:           join(ROOT, 'src/blocks'),
	barrel:           join(ROOT, 'src/index.ts'),
	componentSlugs:   join(ROOT, 'app/_docs/registry/index.ts'),
	componentPreview: join(ROOT, 'app/_docs/components/ComponentLivePreview.tsx'),
	componentCats:    join(ROOT, 'app/_docs/registry/categories.ts'),
	blockRegistry:    join(ROOT, 'app/_docs/registry/blocks.ts'),
	blockPreviews:    join(ROOT, 'app/_docs/registry/blockPreviews.tsx'),
	blockCats:        join(ROOT, 'app/_docs/registry/blockCategories.ts'),
};

const die = (msg) => {
	console.error(`\n✗ ${msg}\n`);
	process.exit(1);
};

const toKebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const toDisplay = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

const escapeTemplate = (text) => text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const readCategories = (file) => {
	const text = readFileSync(file, 'utf8');
	return [...text.matchAll(/^\t'([^']+)',$/gm)].map(m => m[1]);
};

const write = (file, content, touched) => {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, content);
	touched.push(file);
};

// Inserts `insertion` immediately before the array's closing `\n];`. Usage
// strings inside entries are template literals that can contain their own
// `\n];` lines, so a candidate only counts when it sits outside every literal
// (an even number of unescaped backticks precedes it).
const insertBeforeArrayEnd = (text, anchor, insertion, label) => {
	const start = text.indexOf(anchor);
	if(start === -1) die(`Could not find ${label} (${anchor}).`);

	let end = text.indexOf('\n];', start);
	while(end !== -1)
	{
		const backticks = text.slice(start, end).match(/(?<!\\)`/g)?.length ?? 0;
		if(backticks % 2 === 0) break;

		end = text.indexOf('\n];', end + 1);
	}

	if(end === -1) die(`Could not find the end of ${label}.`);

	return `${text.slice(0, end + 1)}${insertion}${text.slice(end + 1)}`;
};

const insertAfterUseClient = (text, importLine) => {
	const marker = "'use client';\n\n";
	if(!text.startsWith(marker)) die("Expected the file to start with 'use client'; then a blank line.");

	return `${marker}${importLine}\n${text.slice(marker.length)}`;
};

const componentSource = (name) => `'use client';

import { HTMLAttributes } from 'react';

export type ${name}Props = HTMLAttributes<HTMLDivElement>;

export const ${name} = ({ className = '', children, ...props }: ${name}Props) => {
	return (
		<div {...props} className={className}>
			{children}
		</div>
	);
};

export default ${name};
`;

const componentTest = (name) => `'use client';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ${name} from './${name}';

describe('${name}', () =>
{
	it('renders without errors', () =>
	{
		render(<${name}>Content</${name}>);
		expect(screen.getByText('Content')).toBeDefined();
	});

	it('merges a custom className', () =>
	{
		render(<${name} className='custom-class'>Content</${name}>);
		expect(screen.getByText('Content').className).toContain('custom-class');
	});

	it('forwards native props', () =>
	{
		render(<${name} data-testid='root' aria-label='${toDisplay(name)}'>Content</${name}>);
		expect(screen.getByTestId('root').getAttribute('aria-label')).toBe('${toDisplay(name)}');
	});
});
`;

const componentSpec = (name, slug, description) => `# ${name}

${description}

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | \`string\` | \`''\` | Additional CSS classes. |
| children | \`ReactNode\` | None | Content of the component. |

Extends all native \`<div>\` HTML attributes.

## Variants

TODO: add a variants table, or delete this section if the component has none.

## Interactive States

TODO: describe hover, focus-visible, and disabled behavior, or state that the component is non-interactive.

## Accessibility

TODO: ARIA roles, keyboard behavior, focus management. For overlays, document focus entry, focus trap, Escape, Tab, and arrow key behavior.

## When to Use

TODO: guidance on when to use this component and when to use something else.

## Tokens Used

TODO: list the design tokens this component uses.

## Installation

\`\`\`bash
npx dafink-ui add ${slug}
\`\`\`

npm dependencies: none
No registry dependencies.
`;

const componentUsage = (name) => `import { ${name} } from '@components/ui';

export default function Example() {
  return <${name}>${toDisplay(name)}</${name}>;
}`;

const componentRegistryEntry = ({ name, slug, category, description }) => `  {
    slug: '${slug}',
    name: '${name}',
    category: '${category}',
    description: '${description.replace(/'/g, "\\'")}',
    usage: \`${escapeTemplate(componentUsage(name))}\`,
    props: [
      { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes.' },
    ],
    dependencies:         [],
    registryDependencies: [],
    files:                ['${name}/${name}.tsx'],
  },
`;

const componentPreviewCase = ({ name, slug }) => `    case '${slug}':
      return <${name}>${toDisplay(name)}</${name}>;

`;

const blockSource = (name, importPrefix) => `'use client';

import { Card, CardContent, CardHeader } from '${importPrefix}/Card/Card';
import Button from '${importPrefix}/Button/Button';

export const ${name} = () => {
	return (
		<Card>
			<CardHeader>
				<p className='text-base font-semibold text-text'>${toDisplay(name)}</p>
			</CardHeader>
			<CardContent>
				<Button>Action</Button>
			</CardContent>
		</Card>
	);
};

export default ${name};
`;

const blockRegistryEntry = ({ name, slug, category, description }) => `	{
		slug: '${slug}',
		name: '${toDisplay(name)}',
		category: '${category}',
		description: '${description.replace(/'/g, "\\'")}',
		usage: \`${escapeTemplate(blockSource(name, '@/src/components'))}\`,
		dependencies: [],
		registryDependencies: ['card', 'button'],
		files: ['${name}/${name}.tsx'],
	},
`;

const scaffoldComponent = ({ name, slug, category, description }, touched) => {
	const dir = join(PATHS.components, name);
	if(existsSync(dir)) die(`src/components/${name} already exists.`);

	const registryText = readFileSync(PATHS.componentSlugs, 'utf8');
	if(new RegExp(`^ {4}slug:\\s*'${slug}'`, 'm').test(registryText)) die(`Registry already has a component with slug '${slug}'.`);

	const categories = readCategories(PATHS.componentCats);
	if(!categories.includes(category)) die(`Unknown category '${category}'. Choose one of: ${categories.join(', ')}.`);

	const previewText = readFileSync(PATHS.componentPreview, 'utf8');
	const defaultMatch = previewText.search(/ {4}default:\n\s+return \(\n\s+<div className='text-sm text-text-muted'>\n\s+No preview available/);
	if(defaultMatch === -1) die('Could not find the default case in ComponentLivePreview.tsx.');

	write(join(dir, `${name}.tsx`), componentSource(name), touched);
	write(join(dir, `${name}.test.tsx`), componentTest(name), touched);
	write(join(dir, 'spec.md'), componentSpec(name, slug, description), touched);

	const entry = { name, slug, category, description };
	write(
		PATHS.componentSlugs,
		insertBeforeArrayEnd(registryText, 'export const registry: ComponentEntry[] = [', componentRegistryEntry(entry), 'the component registry array'),
		touched,
	);

	const withCase   = `${previewText.slice(0, defaultMatch)}${componentPreviewCase(entry)}${previewText.slice(defaultMatch)}`;
	const withImport = insertAfterUseClient(withCase, `import { ${name} } from '@/src/components/${name}/${name}';`);
	write(PATHS.componentPreview, withImport, touched);

	const barrel = readFileSync(PATHS.barrel, 'utf8').trimEnd();
	write(
		PATHS.barrel,
		`${barrel}\n\nexport { ${name} } from './components/${name}/${name}';\nexport type { ${name}Props } from './components/${name}/${name}';\n`,
		touched,
	);
};

const scaffoldBlock = ({ name, slug, category, description }, touched) => {
	const dir = join(PATHS.blocks, name);
	if(existsSync(dir)) die(`src/blocks/${name} already exists.`);

	const registryText = readFileSync(PATHS.blockRegistry, 'utf8');
	if(new RegExp(`^\\t\\tslug:\\s*'${slug}'`, 'm').test(registryText)) die(`Block registry already has slug '${slug}'.`);

	const categories = readCategories(PATHS.blockCats);
	if(!categories.includes(category)) die(`Unknown category '${category}'. Choose one of: ${categories.join(', ')}.`);

	const previewText = readFileSync(PATHS.blockPreviews, 'utf8');
	const mapStart    = previewText.indexOf('export const blockPreviews: Record<string, React.ReactNode> = {');
	if(mapStart === -1) die('Could not find blockPreviews in blockPreviews.tsx.');

	const mapEnd = previewText.indexOf('\n};', mapStart);
	if(mapEnd === -1) die('Could not find the end of blockPreviews.');

	write(join(dir, `${name}.tsx`), blockSource(name, '../../components'), touched);

	write(
		PATHS.blockRegistry,
		insertBeforeArrayEnd(registryText, 'export const blocks: BlockEntry[] = [', blockRegistryEntry({ name, slug, category, description }), 'the block registry array'),
		touched,
	);

	const withEntry  = `${previewText.slice(0, mapEnd + 1)}\t'${slug}': <${name} />,\n${previewText.slice(mapEnd + 1)}`;
	const importLine = `import { ${name} } from '@/src/blocks/${name}/${name}';\n`;
	write(PATHS.blockPreviews, `${importLine}${withEntry}`, touched);
};

const [kind, name, ...rest] = process.argv.slice(2);

if(kind !== 'component' && kind !== 'block') die('Usage: scaffold.mjs <component|block> <PascalCaseName> --category <Category> [--slug s] [--description "..."]');
if(!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) die(`Name must be PascalCase (got '${name ?? ''}').`);

const flags = {};
for(let i = 0; i < rest.length; i++)
{
	if(!rest[i].startsWith('--')) die(`Unexpected argument '${rest[i]}'.`);

	const key = rest[i].slice(2);
	if(key === 'no-lint' || key === 'no-sync')
	{
		flags[key] = true;
		continue;
	}

	if(rest[i + 1] === undefined || rest[i + 1].startsWith('--')) die(`--${key} needs a value.`);
	flags[key] = rest[++i];
}

if(!flags.category)
{
	const options = readCategories(kind === 'component' ? PATHS.componentCats : PATHS.blockCats);
	die(`--category is required. Choose one of: ${options.join(', ')}.`);
}

const options = {
	name,
	slug:        flags.slug ?? toKebab(name),
	category:    flags.category,
	description: flags.description ?? `TODO: describe ${toDisplay(name)}.`,
};

const touched = [];

if(kind === 'component') scaffoldComponent(options, touched);
else scaffoldBlock(options, touched);

console.log(`\nCreated ${kind} ${name} (slug: ${options.slug}). Files written:`);
for(const file of touched) console.log(`  ${file.replace(`${ROOT}/`, '')}`);

if(!flags['no-lint'])
{
	const quoted = touched.filter(f => /\.(tsx?|mjs)$/.test(f)).map(f => `"${f}"`).join(' ');
	try
	{
		execSync(`npx eslint --fix ${quoted}`, { cwd: ROOT, stdio: 'inherit' });
	}
	catch
	{
		console.warn('\n⚠ eslint reported problems in the generated files; fix them before committing.');
	}
}

if(!flags['no-sync']) execSync('npm run sync-registry', { cwd: ROOT, stdio: 'inherit' });

console.log(`
Next steps:
  1. Implement ${name} and replace the placeholder registry props, usage, and preview so they match.
  2. Fill in every TODO in ${kind === 'component' ? 'spec.md and the registry description' : 'the registry description'}.
  3. Run: npm test && node scripts/validate-components.mjs
`);
