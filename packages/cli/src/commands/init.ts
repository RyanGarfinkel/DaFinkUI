import { intro, select, text, outro, isCancel, cancel } from '@clack/prompts';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { addComponentsAlias } from '../lib/tsconfig.js';
import type { DaFinkConfig } from '../lib/config.js';
import { resolve, dirname, basename } from 'path';
import { writeConfig } from '../lib/config.js';
import { generateCss } from '../lib/css.js';
import pc from 'picocolors';

const CSS_CANDIDATES = ['app/globals.css', 'src/app/globals.css', 'src/index.css'];

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

export async function runInit(cwd: string): Promise<void>
{
	intro(pc.bold('DaFink UI — Setup wizard'));

	const style = await select({
		message: 'Which style?',
		options: [
			{ value: 'minimal',   label: 'Minimal',   hint: 'clean, sharp, utility-first' },
			{ value: 'neumorph',  label: 'Neumorph',  hint: 'soft shadows, rounded surfaces' },
			{ value: 'brutalist', label: 'Brutalist', hint: 'bold borders, hard offsets' },
		],
	});

	if(isCancel(style))
	{
		cancel('Setup cancelled.');
		process.exit(0);
	}

	const palette = await select({
		message: 'Which palette?',
		options: [
			{ value: 'zinc',   label: 'Zinc',   hint: 'default neutral' },
			{ value: 'ocean',  label: 'Ocean',  hint: 'sky blue' },
			{ value: 'ember',  label: 'Ember',  hint: 'warm orange' },
			{ value: 'forest', label: 'Forest', hint: 'deep green' },
			{ value: 'noir',   label: 'Noir',   hint: 'slate monochrome' },
			{ value: 'plum',   label: 'Plum',   hint: 'purple violet' },
		],
	});

	if(isCancel(palette))
	{
		cancel('Setup cancelled.');
		process.exit(0);
	}

	const componentsDir = await text({
		message: 'Components directory?',
		placeholder: 'src/components/ui',
		defaultValue: 'src/components/ui',
	});

	if(isCancel(componentsDir))
	{
		cancel('Setup cancelled.');
		process.exit(0);
	}

	const detected = detectCssFile(cwd);
	let cssFile: string;

	if(detected)
	{
		cssFile = detected;
	}
	else
	{
		const cssInput = await text({
			message: 'CSS file path (relative to project root)?',
			placeholder: 'src/index.css',
		});

		if(isCancel(cssInput))
		{
			cancel('Setup cancelled.');
			process.exit(0);
		}

		cssFile = cssInput as string;
	}

	const config: DaFinkConfig = {
		style: style as DaFinkConfig['style'],
		palette: palette as DaFinkConfig['palette'],
		componentsDir: (componentsDir as string) || 'src/components/ui',
		blocksDir: 'src/blocks',
		cssFile,
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
		? '  ' + pc.dim(aliasResult.configFile!) + ' updated with ' + pc.dim('@components/*') + ' alias\n'
		: '  ' + pc.yellow(aliasResult.reason ?? 'skipped @components alias setup') + '\n';

	outro(
		pc.green('Done!') + '\n\n' +
		'  ' + pc.dim('dafink.config.json') + ' written\n' +
		'  ' + pc.dim(dafinkCssPath.replace(cwd + '/', '')) + ' written\n' +
		'  import prepended to ' + pc.dim(cssFile) + '\n' +
		aliasLine + '\n' +
		'Next: ' + pc.cyan('npx dafink-ui add button') + ' to copy your first component.'
	);
}
