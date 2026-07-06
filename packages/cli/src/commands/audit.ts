import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { detectIndent } from '../lib/tsconfig.js';
import { log } from '@clack/prompts';
import pc from 'picocolors';

const SCRIPT_FILENAME = 'dafink-audit.mjs';
const GITHUB_WORKFLOW_FILENAME = 'dafink-audit.yml';
const GITLAB_TEMPLATE_FILENAME = 'dafink-audit.gitlab-ci.yml';
const GITLAB_JOB_NAME = 'dafink-audit:';

function readTemplate(templateName: string): string
{
	const assetPath = new URL(`../../templates/audit/${templateName}`, import.meta.url).pathname;

	if(!existsSync(assetPath))
	{
		log.error(`Could not find ${templateName} in this package install.`);
		process.exit(1);
	}

	return readFileSync(assetPath, 'utf8');
}

function copyTemplate(templateName: string, destPath: string): void
{
	const assetPath = new URL(`../../templates/audit/${templateName}`, import.meta.url).pathname;

	if(!existsSync(assetPath))
	{
		log.error(`Could not find ${templateName} in this package install.`);
		process.exit(1);
	}

	mkdirSync(dirname(destPath), { recursive: true });
	copyFileSync(assetPath, destPath);
}

/** GitLab keeps all CI config in a single root `.gitlab-ci.yml`, unlike GitHub's
 * one-file-per-workflow directory — so an existing file must be appended to,
 * never overwritten, or a consumer's other jobs would be destroyed. */
function writeGitlabWorkflow(cwd: string): 'created' | 'appended' | 'skipped'
{
	const destPath = resolve(cwd, '.gitlab-ci.yml');
	const jobBlock = readTemplate(GITLAB_TEMPLATE_FILENAME);

	if(!existsSync(destPath))
	{
		writeFileSync(destPath, jobBlock, 'utf8');
		return 'created';
	}

	const existing = readFileSync(destPath, 'utf8');

	if(existing.includes(GITLAB_JOB_NAME))
		return 'skipped';

	const separator = existing.endsWith('\n') ? '\n' : '\n\n';
	writeFileSync(destPath, existing + separator + jobBlock, 'utf8');
	return 'appended';
}

function addAuditScript(cwd: string): boolean
{
	const pkgPath = resolve(cwd, 'package.json');

	if(!existsSync(pkgPath)) return false;

	const raw = readFileSync(pkgPath, 'utf8');
	const parsed = JSON.parse(raw) as { scripts?: Record<string, string>; [key: string]: unknown };

	if(parsed.scripts?.['dafink-audit']) return true;

	parsed.scripts ??= {};
	parsed.scripts['dafink-audit'] = 'node scripts/dafink-audit.mjs';

	const indent = detectIndent(raw);
	writeFileSync(pkgPath, JSON.stringify(parsed, null, indent) + '\n', 'utf8');

	return true;
}

export async function runAudit(options: { workflow: boolean; provider: string }, cwd: string): Promise<void>
{
	if(options.provider !== 'github' && options.provider !== 'gitlab')
	{
		log.error(`Unknown provider "${options.provider}" — expected "github" or "gitlab".`);
		process.exit(1);
	}

	const scriptDestPath = resolve(cwd, 'scripts', SCRIPT_FILENAME);
	copyTemplate(SCRIPT_FILENAME, scriptDestPath);
	log.success(`Wrote ${pc.bold(`scripts/${SCRIPT_FILENAME}`)}`);

	let workflowLine = '';

	if(options.workflow !== false)
	{
		if(options.provider === 'github')
		{
			const workflowDestPath = resolve(cwd, '.github/workflows', GITHUB_WORKFLOW_FILENAME);
			copyTemplate(GITHUB_WORKFLOW_FILENAME, workflowDestPath);
			log.success(`Wrote ${pc.bold(`.github/workflows/${GITHUB_WORKFLOW_FILENAME}`)}`);
			workflowLine = '\n\n  Pushing or opening a PR will now also run it automatically via the copied workflow.';
		}
		else
		{
			const result = writeGitlabWorkflow(cwd);

			if(result === 'created')
			{
				log.success(`Wrote ${pc.bold('.gitlab-ci.yml')}`);
				workflowLine = '\n\n  Pushing or opening a merge request will now also run it automatically via the new pipeline job.';
			}
			else if(result === 'appended')
			{
				log.success(`Added the ${pc.bold('dafink-audit')} job to your existing ${pc.bold('.gitlab-ci.yml')}`);
				workflowLine = '\n\n  Pushing or opening a merge request will now also run it automatically via the new pipeline job.';
			}
			else
			{
				log.info(`${pc.bold('.gitlab-ci.yml')} already has a ${pc.bold('dafink-audit')} job — left it untouched.`);
			}
		}
	}

	const scriptAdded = addAuditScript(cwd);

	const runLine = scriptAdded
		? pc.cyan('npm run dafink-audit')
		: pc.cyan('node scripts/dafink-audit.mjs');

	log.info(
		pc.bold('Next steps:') + '\n\n' +
		`  Run ${runLine} to check your project locally.` +
		workflowLine
	);
}
