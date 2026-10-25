import { intro, select, text, confirm, outro, isCancel, cancel } from '@clack/prompts';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { addComponentsAlias } from '../lib/tsconfig.js';
import type { DaFinkConfig } from '../lib/config.js';
import { resolve, dirname, basename } from 'path';
import { runHookInstall } from './hook.js';
import { installEslint } from './eslint.js';
import { writeConfig } from '../lib/config.js';
import { generateCss } from '../lib/css.js';
import pc from 'picocolors';

const CSS_CANDIDATES = ['app/globals.css', 'src/app/globals.css', 'src/index.css'];

function detectFramework(cwd: string): 'next' | 'react'
{
	try
	{
		const pkg = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf8')) as Record<string, unknown>;
		const deps = { ...(pkg.dependencies as object), ...(pkg.devDependencies as object) };
		return 'next' in deps ? 'next' : 'react';
	}
	catch
	{
		return 'next';
	}
}

function detectCssFile(cwd: string): string | null
{
	for(const candidate of CSS_CANDIDATES)
	{
		if(existsSync(resolve(cwd, candidate)))
			return candidate;
	}
	return null;
}

function prependImport(cssPath: string, importLine: string): void
{
	const existing = readFileSync(cssPath, 'utf8');

	if(existing.includes(importLine))
		return;

	writeFileSync(cssPath, importLine + '\n' + existing, 'utf8');
}

export interface InitOptions
{
	style?: string;
	palette?: string;
	framework?: string;
	componentsDir?: string;
	cssFile?: string;
	eslint?: boolean;
	hook?: boolean;
	hookFix?: boolean;
	yes?: boolean;
}

const STYLES = ['minimal', 'neumorph', 'brutalist'];
const PALETTES = ['zinc', 'ocean', 'ember', 'forest', 'noir', 'plum'];
const FRAMEWORKS = ['next', 'react'];
const DEFAULT_COMPONENTS_DIR = 'src/components/ui';

function assertOneOf(flag: string, value: string | undefined, allowed: string[]): void
{
	if(value === undefined || allowed.includes(value)) return;

	console.error(pc.red(`Invalid ${flag} "${value}". Expected one of: ${allowed.join(', ')}`));
	process.exit(1);
}

function abortIfCancelled<T>(value: T | symbol): T
{
	if(!isCancel(value)) return value as T;

	cancel('Setup cancelled.');
	process.exit(0);
}

export async function runInit(options: InitOptions, cwd: string): Promise<void>
{
	assertOneOf('--style', options.style, STYLES);
	assertOneOf('--palette', options.palette, PALETTES);
	assertOneOf('--framework', options.framework, FRAMEWORKS);

	const interactive = !options.yes && Boolean(process.stdin.isTTY);
	const detectedFramework = detectFramework(cwd);
	const detectedCss = detectCssFile(cwd);

	if(!interactive && !options.cssFile && !detectedCss)
	{
		console.error(pc.red('No CSS file detected. Pass --css-file <path> (e.g. src/index.css).'));
		process.exit(1);
	}

	intro(pc.bold('DaFink UI: Setup wizard'));

	const style = options.style ?? (interactive ? abortIfCancelled(await select({
		message: 'Which style?',
		options: [
			{ value: 'minimal',   label: 'Minimal',   hint: 'clean, sharp, utility-first' },
			{ value: 'neumorph',  label: 'Neumorph',  hint: 'soft shadows, rounded surfaces' },
			{ value: 'brutalist', label: 'Brutalist', hint: 'bold borders, hard offsets' },
		],
	})) : 'minimal');

	const palette = options.palette ?? (interactive ? abortIfCancelled(await select({
		message: 'Which palette?',
		options: [
			{ value: 'zinc',   label: 'Zinc',   hint: 'default neutral' },
			{ value: 'ocean',  label: 'Ocean',  hint: 'sky blue' },
			{ value: 'ember',  label: 'Ember',  hint: 'warm orange' },
			{ value: 'forest', label: 'Forest', hint: 'deep green' },
			{ value: 'noir',   label: 'Noir',   hint: 'slate monochrome' },
			{ value: 'plum',   label: 'Plum',   hint: 'purple violet' },
		],
	})) : 'zinc');

	const framework = options.framework ?? (interactive ? abortIfCancelled(await select({
		message: 'Which framework?',
		options: [
			{ value: 'next',  label: 'Next.js', hint: detectedFramework === 'next' ? 'detected' : undefined },
			{ value: 'react', label: 'React',   hint: detectedFramework === 'react' ? 'detected' : undefined },
		],
		initialValue: detectedFramework,
	})) : detectedFramework);

	const componentsDir = options.componentsDir ?? (interactive ? abortIfCancelled(await text({
		message: 'Components directory?',
		placeholder: DEFAULT_COMPONENTS_DIR,
		defaultValue: DEFAULT_COMPONENTS_DIR,
	})) : DEFAULT_COMPONENTS_DIR);

	const cssFile = options.cssFile ?? detectedCss ?? abortIfCancelled(await text({
		message: 'CSS file path (relative to project root)?',
		placeholder: 'src/index.css',
	}));

	const withHook = Boolean(options.hook || options.hookFix);

	const withEslint = withHook || (options.eslint ?? (interactive ? abortIfCancelled(await confirm({
		message: 'Add the DaFink ESLint rules?',
		initialValue: false,
	})) : false));

	const hookWanted = withHook || (options.hook === undefined && interactive && withEslint && abortIfCancelled(await confirm({
		message: 'Lint every file Claude Code edits (adds a hook to .claude/settings.json)?',
		initialValue: false,
	})));

	const config: DaFinkConfig = {
		style:         style as DaFinkConfig['style'],
		palette:       palette as DaFinkConfig['palette'],
		framework:     framework as DaFinkConfig['framework'],
		componentsDir: componentsDir || DEFAULT_COMPONENTS_DIR,
		blocksDir:     'src/blocks',
		cssFile,
		// Not prompted, same as blocksDir above — most projects never install a block with a
		// kind-tagged file, so asking everyone up front is friction for a setting most people
		// won't touch. Hand-edit dafink.config.json if these defaults aren't right.
		apiDir:           'src/api',
		modelsDir:        'src/models',
		hooksDir:         'src/hooks',
		fileOrganization: 'split',
	};

	writeConfig(cwd, config);

	const cssContent = generateCss(config);
	const cssDir = dirname(resolve(cwd, cssFile));
	const dafinkCssPath = resolve(cssDir, 'dafink-ui.css');

	writeFileSync(dafinkCssPath, cssContent, 'utf8');

	const importLine = `@import './${basename(dafinkCssPath)}';`;
	prependImport(resolve(cwd, cssFile), importLine);

	const aliasResult = addComponentsAlias(cwd, config.componentsDir);

	const aliasLine = aliasResult.updated
		? '  ' + pc.dim(aliasResult.configFile!) + ' updated with ' + pc.dim('@components/ui/*') + ' alias\n'
		: '  ' + pc.yellow(aliasResult.reason ?? 'skipped @components/ui alias setup') + '\n';

	if(withEslint) installEslint(cwd);
	if(hookWanted) await runHookInstall({ fix: options.hookFix }, cwd);

	outro(
		pc.green('Done!') + '\n\n' +
		'  ' + pc.dim('dafink.config.json') + ' written\n' +
		'  ' + pc.dim(dafinkCssPath.replace(cwd + '/', '')) + ' written\n' +
		'  import prepended to ' + pc.dim(cssFile) + '\n' +
		aliasLine + '\n' +
		'Next: ' + pc.cyan('npx dafink-ui add button') + ' to copy your first component.'
	);
}
