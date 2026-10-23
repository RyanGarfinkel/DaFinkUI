import { resolveEslintBin, runEslint, LINTABLE_EXTENSIONS } from '../lib/linter.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, relative, extname, dirname, isAbsolute } from 'path';
import { log } from '@clack/prompts';
import pc from 'picocolors';

const SETTINGS_PATH = '.claude/settings.json';
const HOOK_MATCHER = 'Write|Edit|MultiEdit';
const HOOK_MARKER = 'dafink-ui lint --hook';
const ESLINT_CONFIG_CANDIDATES = ['eslint.config.mjs', 'eslint.config.js', 'eslint.config.cjs', 'eslint.config.ts'];

interface HookCommand {
	type:           'command';
	command:        string;
	timeout?:       number;
	statusMessage?: string;
}

interface HookGroup {
	matcher?: string;
	hooks:    HookCommand[];
}

interface ClaudeSettings {
	hooks?: Record<string, HookGroup[]>;
	[key: string]: unknown;
}

interface PostToolUsePayload {
	cwd?:        string;
	tool_input?: { file_path?: string };
}

export function withLintHook(settings: ClaudeSettings, command: string): ClaudeSettings
{
	const withoutDafink = (settings.hooks?.PostToolUse ?? [])
		.map(group => ({ ...group, hooks: group.hooks.filter(hook => !hook.command?.includes(HOOK_MARKER)) }))
		.filter(group => group.hooks.length > 0);

	const dafinkGroup: HookGroup = {
		matcher: HOOK_MATCHER,
		hooks: [{ type: 'command', command, timeout: 60, statusMessage: 'Linting with DaFink UI...' }],
	};

	return { ...settings, hooks: { ...settings.hooks, PostToolUse: [...withoutDafink, dafinkGroup] } };
}

export async function runHookInstall(options: { fix?: boolean }, cwd: string): Promise<void>
{
	const settingsPath = resolve(cwd, SETTINGS_PATH);
	let settings: ClaudeSettings = {};

	if(existsSync(settingsPath))
	{
		try
		{
			settings = JSON.parse(readFileSync(settingsPath, 'utf8')) as ClaudeSettings;
		}
		catch
		{
			log.error(`${SETTINGS_PATH} is not valid JSON. Fix it, then run this again.`);
			process.exit(1);
		}
	}

	const command = `npx --yes ${HOOK_MARKER}${options.fix ? ' --fix' : ''}`;

	mkdirSync(dirname(settingsPath), { recursive: true });
	writeFileSync(settingsPath, JSON.stringify(withLintHook(settings, command), null, '\t') + '\n', 'utf8');

	log.success(`Added a ${pc.bold('PostToolUse')} hook to ${pc.bold(SETTINGS_PATH)}: ${pc.cyan(command)}`);
	log.info(`Claude Code now lints each file it writes or edits and sees any problems. Restart running sessions to pick it up.`);

	if(!ESLINT_CONFIG_CANDIDATES.some(name => existsSync(resolve(cwd, name))) || !resolveEslintBin(cwd))
		log.warn(`No ESLint setup found here, so the hook will skip every file. Run ${pc.cyan('npx dafink-ui lint --init')} first.`);
}

async function readStdin(): Promise<string>
{
	const chunks: Buffer[] = [];

	for await (const chunk of process.stdin)
		chunks.push(chunk as Buffer);

	return Buffer.concat(chunks).toString('utf8');
}

// Claude Code hook exit codes: 0 is silent, 2 feeds stderr back to Claude so it can fix the
// file, and anything else shows stderr to the user only. Every skip path exits 0 so the hook
// never interrupts an edit it has nothing to say about.
export async function runLintHook(fix: boolean): Promise<void>
{
	let payload: PostToolUsePayload;

	try
	{
		payload = JSON.parse(await readStdin()) as PostToolUsePayload;
	}
	catch
	{
		process.exit(0);
	}

	const root = process.env.CLAUDE_PROJECT_DIR ?? payload.cwd ?? process.cwd();
	const file = payload.tool_input?.file_path;

	if(!file || !LINTABLE_EXTENSIONS.includes(extname(file)) || !existsSync(file)) process.exit(0);

	const relativePath = relative(root, file);

	if(relativePath.startsWith('..') || isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes('node_modules')) process.exit(0);

	const bin = resolveEslintBin(root);

	if(!bin) process.exit(0);

	const result = runEslint(bin, ['--no-warn-ignored', ...(fix ? ['--fix'] : []), file], root, true);
	const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();

	if(result.status === 2 || result.error)
	{
		process.stderr.write(`dafink-ui lint could not run ESLint on ${relativePath}:\n${output || result.error?.message}\n`);
		process.exit(1);
	}

	if(!output) process.exit(0);

	process.stderr.write(`ESLint found problems in ${relativePath}. Fix them:\n${output}\n`);
	process.exit(2);
}
