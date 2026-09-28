import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface DaFinkConfig
{
	style: 'minimal' | 'neumorph' | 'brutalist';
	palette: 'zinc' | 'ocean' | 'ember' | 'forest' | 'noir' | 'plum';
	framework: 'next' | 'react';
	componentsDir: string;
	blocksDir: string;
	cssFile: string;
	/** Where a block's `kind`-tagged files (api/model/hook) land when fileOrganization is
	 * 'split', one directory per kind, each namespaced by the block's own slug underneath
	 * (e.g. `<apiDir>/ai-chat/chatApi.ts`) so two blocks' files never collide. */
	apiDir:    string;
	modelsDir: string;
	hooksDir:  string;
	/** 'split' (default): a block's kind-tagged files reroute to apiDir/modelsDir/hooksDir,
	 * with their sibling imports rewritten to match, and a tsconfig alias set up per kind the
	 * first time it's used. 'flat': every file — tagged or not — installs into the block's
	 * own folder, untouched, exactly as blocks without any tagged files always have. `add`'s
	 * `--flat` flag overrides this to 'flat' for a single invocation without changing the
	 * persisted default. */
	fileOrganization: 'split' | 'flat';
}

const CONFIG_FILE = 'dafink.config.json';

const CONFIG_DEFAULTS = {
	blocksDir:        'src/blocks',
	framework:        'next',
	apiDir:           'src/api',
	modelsDir:        'src/models',
	hooksDir:         'src/hooks',
	fileOrganization: 'split',
} as const;

export function readConfig(cwd: string): DaFinkConfig
{
	const configPath = resolve(cwd, CONFIG_FILE);

	if(!existsSync(configPath))
		throw new Error(`No dafink.config.json found in ${cwd}. Run \`npx dafink-ui init\` first.`);

	const parsed = JSON.parse(readFileSync(configPath, 'utf8')) as Partial<DaFinkConfig>;

	// Every field here has a default so a config file written before it existed (or before
	// this one) still reads cleanly — an older project's config never needs migrating by hand.
	return { ...CONFIG_DEFAULTS, ...parsed } as DaFinkConfig;
}

export function writeConfig(cwd: string, config: DaFinkConfig): void
{
	const configPath = resolve(cwd, CONFIG_FILE);
	writeFileSync(configPath, JSON.stringify(config, null, '\t') + '\n', 'utf8');
}
