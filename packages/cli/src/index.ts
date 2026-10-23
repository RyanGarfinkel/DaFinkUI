#!/usr/bin/env node
import { runHookInstall } from './commands/hook.js';
import { runEslint } from './commands/eslint.js';
import { runAudit } from './commands/audit.js';
import { runSkill } from './commands/skill.js';
import { runLint } from './commands/lint.js';
import { runInit } from './commands/init.js';
import { runAdd } from './commands/add.js';
import { Command } from 'commander';

const program = new Command();

program
	.name('dafink-ui')
	.description('Add DaFink UI components to your project')
	.version('0.1.0');

program
	.command('init')
	.description('Interactive setup wizard, writes dafink.config.json and token CSS')
	.action(async () =>
	{
		await runInit(process.cwd());
	});

program
	.command('add [components...]')
	.description('Copy component files into your project')
	.option('--all', 'Copy every component')
	.option('--with-tests', 'Also copy each component\'s .test.tsx file', false)
	.option('--flat', 'Dump every file into the block\'s own folder, ignoring api/model/hook tags and your fileOrganization default')
	.action(async (components: string[], options: { all?: boolean; withTests?: boolean; flat?: boolean }) =>
	{
		await runAdd(components, options, process.cwd());
	});

program
	.command('skill [path]')
	.description('Download the dafink-ui.skill design skill file')
	.action(async (path: string | undefined) =>
	{
		await runSkill(path, process.cwd());
	});

program
	.command('audit')
	.description('Copy static accessibility checks + CI workflow into your project')
	.option('--no-workflow', 'Skip writing the CI workflow file')
	.option('--provider <name>', 'CI provider for the generated workflow: github or gitlab', 'github')
	.action(async (options: { workflow: boolean; provider: string }) =>
	{
		await runAudit(options, process.cwd());
	});

program
	.command('eslint')
	.description('Copy the DaFink ESLint rules + config into your project and install their dependencies')
	.action(async () =>
	{
		await runEslint(process.cwd());
	});

program
	.command('lint [files...]')
	.description('Run ESLint with the DaFink rules on your components and blocks (or the given files)')
	.option('--init', 'Write the DaFink ESLint config into your project and install its dependencies')
	.option('--fix', 'Autofix problems where possible')
	.option('--hook', 'Read a Claude Code PostToolUse payload from stdin and lint only the edited file')
	.action(async (files: string[], options: { init?: boolean; fix?: boolean; hook?: boolean }) =>
	{
		await runLint(files, options, process.cwd());
	});

program
	.command('hook')
	.description('Manage the Claude Code lint hook')
	.command('install')
	.description('Add a PostToolUse hook to .claude/settings.json that lints every file Claude Code edits')
	.option('--fix', 'Have the hook autofix problems before reporting the rest')
	.action(async (options: { fix?: boolean }) =>
	{
		await runHookInstall(options, process.cwd());
	});

program.parse();
