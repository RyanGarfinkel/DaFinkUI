// This package has no ts-node/tsx loader and no bundler test runner, and we are not allowed
// to add one. Rather than reimplement or duplicate the logic under test in plain JS (which
// would test a copy, not the real thing), these tests import the compiled output that `tsc`
// already produces via `npm run build` (see tsconfig.json outDir: "dist"). This is the most
// robust dependency-free option: it exercises the exact code that ships to consumers, using
// only Node's built-in node:test + node:assert/strict. Run `npm run build` before `node --test`,
// or just use `npm test`, which does both.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteImportSpecifiers } from '../../dist/lib/rewriteImports.js';

test('rewrites a named import specifier', () =>
{
	const input = "import { fetchChats } from './chatApi';";
	const output = rewriteImportSpecifiers(input, { './chatApi': '@api/ai-chat/chatApi' });

	assert.equal(output, "import { fetchChats } from '@api/ai-chat/chatApi';");
});

test('preserves the import type keyword', () =>
{
	const input = "import type { ChatMessage } from './types';";
	const output = rewriteImportSpecifiers(input, { './types': '@api/ai-chat/types' });

	assert.equal(output, "import type { ChatMessage } from '@api/ai-chat/types';");
});

test('preserves mixed named and inline type imports', () =>
{
	const input = "import { Foo, type Bar } from './types';";
	const output = rewriteImportSpecifiers(input, { './types': '@api/ai-chat/types' });

	assert.equal(output, "import { Foo, type Bar } from '@api/ai-chat/types';");
});

test('rewrites a type re-export', () =>
{
	const input = "export type { ChatMessage } from './types';";
	const output = rewriteImportSpecifiers(input, { './types': '@api/ai-chat/types' });

	assert.equal(output, "export type { ChatMessage } from '@api/ai-chat/types';");
});

test('leaves default and named import names untouched', () =>
{
	const input = "import Foo, { Bar } from './x';";
	const output = rewriteImportSpecifiers(input, { './x': '@api/ai-chat/x' });

	assert.equal(output, "import Foo, { Bar } from '@api/ai-chat/x';");
});

test('rewrites a namespace import', () =>
{
	const input = "import * as Foo from './x';";
	const output = rewriteImportSpecifiers(input, { './x': '@api/ai-chat/x' });

	assert.equal(output, "import * as Foo from '@api/ai-chat/x';");
});

test('leaves an unmapped import line byte-for-byte unchanged', () =>
{
	const input = "import { fetchChats } from './chatApi';\nimport { b } from './ThreadPanel';\n";
	const output = rewriteImportSpecifiers(input, { './chatApi': '@api/ai-chat/chatApi' });

	assert.equal(output, "import { fetchChats } from '@api/ai-chat/chatApi';\nimport { b } from './ThreadPanel';\n");
});

test('detects and rewrites a double-quoted specifier while keeping double quotes', () =>
{
	const input = 'import { a } from "./types";';
	const output = rewriteImportSpecifiers(input, { './types': '@api/ai-chat/types' });

	assert.equal(output, 'import { a } from "@api/ai-chat/types";');
});

test('leaves specifiers outside the alias map and lookalike comments untouched', () =>
{
	const input = "import { a } from './other';\n// see ./types for the shape\n";
	const output = rewriteImportSpecifiers(input, { './types': '@api/ai-chat/types' });

	assert.equal(output, input);
});

test('rewrites multiple distinct specifiers in a single pass', () =>
{
	const input = "import type { ChatMessage } from './types';\nimport { fetchChats } from './chatApi';\n";
	const output = rewriteImportSpecifiers(input, {
		'./types': '@api/ai-chat/types',
		'./chatApi': '@api/ai-chat/chatApi',
	});

	assert.equal(output, "import type { ChatMessage } from '@api/ai-chat/types';\nimport { fetchChats } from '@api/ai-chat/chatApi';\n");
});
