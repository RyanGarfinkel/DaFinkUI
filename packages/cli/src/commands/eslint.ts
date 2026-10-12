import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { detectPackageManager, devInstallCmd } from '../lib/packages.js';
import { execSync } from 'child_process';
import { log } from '@clack/prompts';
import { resolve } from 'path';
import pc from 'picocolors';

const CONFIG_FILENAME = 'eslint.dafink.mjs';
const RULES_DIR = 'eslint-rules';
const ESLINT_CONFIG_CANDIDATES = ['eslint.config.mjs', 'eslint.config.js', 'eslint.config.cjs', 'eslint.config.ts'];

function packagePath(relative: string): string
{
	return new URL(`../../${relative}`, import.meta.url).pathname;
}

export function installEslint(cwd: string): void
{
	const rulesSrc = packagePath('assets/eslint-rules');

	if(!existsSync(rulesSrc))
	{
		log.error('Could not find the ESLint rules in this package install.');
		process.exit(1);
	}

	const rulesDest = resolve(cwd, RULES_DIR);
	mkdirSync(rulesDest, { recursive: true });

	for(const file of readdirSync(rulesSrc))
		copyFileSync(resolve(rulesSrc, file), resolve(rulesDest, file));

	copyFileSync(packagePath(`templates/eslint/${CONFIG_FILENAME}`), resolve(cwd, CONFIG_FILENAME));
	log.success(`Wrote ${pc.bold(`${RULES_DIR}/`)} and ${pc.bold(CONFIG_FILENAME)}`);

	const existingConfig = ESLINT_CONFIG_CANDIDATES.find(name => existsSync(resolve(cwd, name)));
	const needsEslint = !existingConfig;

	if(existingConfig)
	{
		log.info(
			`Found ${pc.bold(existingConfig)}. Spread the DaFink rules into it:\n\n` +
			`  ${pc.cyan(`import dafinkConfig from './${CONFIG_FILENAME}';`)}\n` +
			`  ${pc.cyan('export default [...yourConfig, ...dafinkConfig];')}`
		);
	}
	else
	{
		copyFileSync(packagePath('templates/eslint/eslint.config.mjs'), resolve(cwd, 'eslint.config.mjs'));
		log.success(`Wrote ${pc.bold('eslint.config.mjs')}`);
	}

	const deps = needsEslint ? ['eslint', 'eslint-plugin-perfectionist'] : ['eslint-plugin-perfectionist'];
	const cmd = devInstallCmd(detectPackageManager(cwd), deps);

	log.info(`Installing dev dependencies: ${pc.cyan(cmd)}`);
	execSync(cmd, { cwd, stdio: 'inherit' });
	log.success('Dev dependencies installed.');
}

export async function runEslint(cwd: string): Promise<void>
{
	installEslint(cwd);

	log.info(`Run ${pc.cyan('npx eslint .')} to lint your project, or add ${pc.cyan('--fix')} to autofix.`);
}
