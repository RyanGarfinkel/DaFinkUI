// Imports the compiled output; see rewriteImports.test.mjs for why. Run via `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withLintHook } from '../../dist/commands/hook.js';

const COMMAND = 'npx --yes dafink-ui lint --hook';

test('adds a PostToolUse hook to empty settings', () =>
{
	const settings = withLintHook({}, COMMAND);

	assert.equal(settings.hooks.PostToolUse.length, 1);
	assert.equal(settings.hooks.PostToolUse[0].matcher, 'Write|Edit|MultiEdit');
	assert.equal(settings.hooks.PostToolUse[0].hooks[0].command, COMMAND);
});

test('keeps unrelated settings and hooks', () =>
{
	const existing = {
		permissions: { allow: ['Bash(npm test)'] },
		hooks: {
			PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'guard.sh' }] }],
			PostToolUse: [{ matcher: 'Write', hooks: [{ type: 'command', command: 'prettier.sh' }] }],
		},
	};

	const settings = withLintHook(existing, COMMAND);

	assert.deepEqual(settings.permissions, existing.permissions);
	assert.deepEqual(settings.hooks.PreToolUse, existing.hooks.PreToolUse);
	assert.equal(settings.hooks.PostToolUse.length, 2);
	assert.equal(settings.hooks.PostToolUse[0].hooks[0].command, 'prettier.sh');
});

test('replaces a previously installed DaFink hook instead of duplicating it', () =>
{
	const once = withLintHook({}, COMMAND);
	const twice = withLintHook(once, `${COMMAND} --fix`);

	assert.equal(twice.hooks.PostToolUse.length, 1);
	assert.equal(twice.hooks.PostToolUse[0].hooks[0].command, `${COMMAND} --fix`);
});
