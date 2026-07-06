import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface DaFinkConfig
{
	style: 'minimal' | 'neumorph' | 'brutalist';
	palette: 'zinc' | 'ocean' | 'ember' | 'forest' | 'noir' | 'plum';
	componentsDir: string;
	blocksDir: string;
	cssFile: string;
}

const CONFIG_FILE = 'dafink.config.json';

export function readConfig(cwd: string): DaFinkConfig
{
	const configPath = resolve(cwd, CONFIG_FILE);

	if(!existsSync(configPath))
		throw new Error(`No dafink.config.json found in ${cwd}. Run \`npx dafink-ui init\` first.`);

	const parsed = JSON.parse(readFileSync(configPath, 'utf8')) as Partial<DaFinkConfig>;

	return { blocksDir: 'src/blocks', ...parsed } as DaFinkConfig;
}

export function writeConfig(cwd: string, config: DaFinkConfig): void
{
	const configPath = resolve(cwd, CONFIG_FILE);
	writeFileSync(configPath, JSON.stringify(config, null, '\t') + '\n', 'utf8');
}
