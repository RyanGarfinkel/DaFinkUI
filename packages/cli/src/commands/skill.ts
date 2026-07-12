import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { log } from '@clack/prompts';
import pc from 'picocolors';

const SKILL_FILENAME = 'dafink-ui.skill';

export async function runSkill(targetPath: string | undefined, cwd: string): Promise<void>
{
	const assetPath = new URL(`../../assets/${SKILL_FILENAME}`, import.meta.url).pathname;

	if(!existsSync(assetPath))
	{
		log.error(`Could not find ${SKILL_FILENAME} in this package install.`);
		process.exit(1);
	}

	const destPath = resolve(cwd, targetPath ?? SKILL_FILENAME);

	mkdirSync(dirname(destPath), { recursive: true });
	copyFileSync(assetPath, destPath);

	log.success(`Downloaded ${pc.bold(SKILL_FILENAME)} to ${pc.dim(destPath)}`);

	log.info(
		pc.bold('Next steps:') + '\n\n' +
		'  Claude Code: drop the file into ' + pc.cyan('.claude/skills/') + ' in your home or\n' +
		'  project directory, it picks up the bundled ' + pc.cyan('SKILL.md') + ' automatically.\n\n' +
		'  Cowork: upload ' + pc.cyan(SKILL_FILENAME) + ' from the Skills settings page.\n\n' +
		'  This skill covers design judgment: style, palette, layout, and motion choices.\n' +
		'  Pair it with the MCP server at ' + pc.cyan('https://ui.ryangarfinkel.dev/api/mcp') + ' for\n' +
		'  live component specs and prop tables.'
	);
}
