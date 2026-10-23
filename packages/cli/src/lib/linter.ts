import { spawnSync, type SpawnSyncReturns } from 'child_process';
import { resolve, dirname } from 'path';
import { createRequire } from 'module';

export const LINTABLE_EXTENSIONS = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'];

export function resolveEslintBin(cwd: string): string | null
{
	try
	{
		const require = createRequire(resolve(cwd, 'package.json'));
		const pkgPath = require.resolve('eslint/package.json');
		const { bin } = require(pkgPath) as { bin: string | Record<string, string> };
		const binPath = typeof bin === 'string' ? bin : bin.eslint;

		return resolve(dirname(pkgPath), binPath);
	}
	catch
	{
		return null;
	}
}

export function runEslint(bin: string, args: string[], cwd: string, capture: boolean): SpawnSyncReturns<string>
{
	return spawnSync(process.execPath, [bin, ...args], {
		cwd,
		encoding: 'utf8',
		stdio: capture ? 'pipe' : 'inherit',
	});
}
