import { existsSync } from 'fs';
import { resolve } from 'path';

export type PackageManager = 'pnpm' | 'yarn' | 'npm';

export function detectPackageManager(cwd: string): PackageManager
{
	if(existsSync(resolve(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
	if(existsSync(resolve(cwd, 'yarn.lock'))) return 'yarn';
	return 'npm';
}

export function installCmd(pm: PackageManager, deps: string[]): string
{
	const pkgs = deps.join(' ');
	if(pm === 'pnpm') return `pnpm add ${pkgs}`;
	if(pm === 'yarn') return `yarn add ${pkgs}`;
	return `npm install ${pkgs}`;
}

export function devInstallCmd(pm: PackageManager, deps: string[]): string
{
	const pkgs = deps.join(' ');
	if(pm === 'pnpm') return `pnpm add -D ${pkgs}`;
	if(pm === 'yarn') return `yarn add -D ${pkgs}`;
	return `npm install -D ${pkgs}`;
}
