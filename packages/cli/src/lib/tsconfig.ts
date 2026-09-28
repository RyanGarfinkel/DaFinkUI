import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface TsConfigLike
{
	compilerOptions?: {
		paths?: Record<string, string[]>;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export interface AliasResult
{
	updated: boolean;
	configFile: string | null;
	reason?: string;
}

const CONFIG_CANDIDATES = ['tsconfig.json', 'jsconfig.json'];

export function detectIndent(raw: string): string
{
	const match = raw.match(/\n([ \t]+)\S/);
	return match ? match[1] : '\t';
}

// Shared by addComponentsAlias and addKindAlias below: same detection, same defensive
// bail-outs (no tsconfig/jsconfig found, or it doesn't parse), same indent-preserving write —
// only the alias key and the directory it points at differ per caller.
function writeAlias(cwd: string, aliasKey: string, targetDir: string, label: string): AliasResult
{
	const configFile = CONFIG_CANDIDATES.find(name => existsSync(resolve(cwd, name)));

	if(!configFile)
		return { updated: false, configFile: null, reason: `No tsconfig.json found, skipping ${label} alias setup, you can add ${label.replace(/^@/, '')} files normally` };

	const configPath = resolve(cwd, configFile);
	const raw = readFileSync(configPath, 'utf8');

	let parsed: TsConfigLike;

	try
	{
		parsed = JSON.parse(raw) as TsConfigLike;
	}
	catch
	{
		return { updated: false, configFile, reason: `Could not parse ${configFile}, skipping ${label} alias setup` };
	}

	parsed.compilerOptions ??= {};
	parsed.compilerOptions.paths ??= {};
	parsed.compilerOptions.paths[aliasKey] = [`./${targetDir}/*`];

	const indent = detectIndent(raw);
	writeFileSync(configPath, JSON.stringify(parsed, null, indent) + '\n', 'utf8');

	return { updated: true, configFile };
}

export function addComponentsAlias(cwd: string, componentsDir: string): AliasResult
{
	return writeAlias(cwd, '@components/ui/*', componentsDir, '@components/ui');
}

export type BlockFileAliasKind = 'api' | 'model' | 'hook';

const KIND_ALIAS: Record<BlockFileAliasKind, string> = {
	api:   '@api/*',
	model: '@models/*',
	hook:  '@hooks/*',
};

/** Called once per kind actually present in what's being installed (see add.ts), the first
 * time a block ships a file of that kind — not eagerly for every kind at init, since most
 * projects never install a block that needs one. */
export function addKindAlias(cwd: string, kind: BlockFileAliasKind, targetDir: string): AliasResult
{
	return writeAlias(cwd, KIND_ALIAS[kind], targetDir, KIND_ALIAS[kind].replace(/\/\*$/, ''));
}
