import { resolveEslintBin, runEslint } from '../lib/linter.js';
import { readConfig } from '../lib/config.js';
import { installEslint } from './eslint.js';
import { runLintHook } from './hook.js';
import { log } from '@clack/prompts';
import { existsSync } from 'fs';
import { resolve } from 'path';
import pc from 'picocolors';

interface LintOptions {
	init?: boolean;
	fix?:  boolean;
	hook?: boolean;
}

function defaultTargets(cwd: string): string[]
{
	try
	{
		const config = readConfig(cwd);
		return [config.componentsDir, config.blocksDir].filter(dir => existsSync(resolve(cwd, dir)));
	}
	catch(err)
	{
		log.error((err as Error).message);
		process.exit(1);
	}
}

export async function runLint(files: string[], options: LintOptions, cwd: string): Promise<void>
{
	if(options.init)
	{
		installEslint(cwd);
		log.info(`Run ${pc.cyan('npx dafink-ui lint')} to lint your components, or add ${pc.cyan('--fix')} to autofix.`);
		return;
	}

	if(options.hook)
	{
		await runLintHook(options.fix ?? false);
		return;
	}

	const bin = resolveEslintBin(cwd);

	if(!bin)
	{
		log.error(`ESLint is not installed in this project. Run ${pc.cyan('npx dafink-ui lint --init')} first.`);
		process.exit(1);
	}

	const targets = files.length > 0 ? files : defaultTargets(cwd);

	if(targets.length === 0)
	{
		log.warn('Nothing to lint: your components and blocks directories don\'t exist yet.');
		return;
	}

	log.info(`Linting ${targets.map(target => pc.bold(target)).join(', ')}`);

	const result = runEslint(bin, [...(options.fix ? ['--fix'] : []), ...targets], cwd, false);

	if(result.status === 0) log.success('No lint errors.');

	process.exit(result.status ?? 1);
}
