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

export function addComponentsAlias(cwd: string, componentsDir: string): AliasResult
{
	const configFile = CONFIG_CANDIDATES.find(name => existsSync(resolve(cwd, name)));

	if(!configFile)
		return { updated: false, configFile: null, reason: 'No tsconfig.json found — skipping @components alias setup, you can add components normally' };

	const configPath = resolve(cwd, configFile);
	const raw = readFileSync(configPath, 'utf8');

	let parsed: TsConfigLike;

	try
	{
		parsed = JSON.parse(raw) as TsConfigLike;
	}
	catch
	{
		return { updated: false, configFile, reason: `Could not parse ${configFile} — skipping @components alias setup` };
	}

	parsed.compilerOptions ??= {};
	parsed.compilerOptions.paths ??= {};
	parsed.compilerOptions.paths['@components/*'] = [`./${componentsDir}/*`];

	const indent = detectIndent(raw);
	writeFileSync(configPath, JSON.stringify(parsed, null, indent) + '\n', 'utf8');

	return { updated: true, configFile };
}
