import { createSandbox, networkGuardPlugin } from './playgroundGuard';
import * as Babel from '@babel/standalone';
import loopProtect from 'loop-protect';
import * as React from 'react';

const LOOP_TIMEOUT_MS = 150;

let loopProtectionRegistered = false;

const ensureLoopProtectionRegistered = (): void => {
	if (loopProtectionRegistered) return;
	Babel.registerPlugin('loopProtection', loopProtect(LOOP_TIMEOUT_MS) as never);
	Babel.registerPlugin('networkGuard', networkGuardPlugin as never);
	loopProtectionRegistered = true;
};

/**
 * Transpiles a component function body (statements ending in a `return (...)`) and evaluates it
 * against a fixed scope. No imports are needed; every name in `scope` is a free variable the
 * code can reference directly.
 *
 * Hardening against pathological or malicious input:
 * - `for`/`while`/`do` loops are rewritten (via `loop-protect`, the library JS Bin uses for the
 *   same purpose) to break out on their own after ~150ms, so a runaway or infinite loop can't
 *   freeze the tab; execution continues with whatever ran before the break.
 * - Any transpile or synchronous runtime error is thrown as a plain `Error` with a readable
 *   message; callers are expected to catch it (this function never swallows errors itself).
 * - No network access: free names resolve only against `scope` and a short list of safe
 *   builtins (see `playgroundGuard`), so `window`, `fetch`, `XMLHttpRequest`, `WebSocket` and
 *   `globalThis` are unreachable, and a Babel pass rejects remote URLs, resource-loading
 *   elements and `constructor`/`__proto__` access. This is a guard, not an iframe boundary.
 */
export const evaluateBody = (body: string, scope: Record<string, unknown>): React.ReactNode => {
	ensureLoopProtectionRegistered();

	// Babel parses a standalone program, where a top-level `return` is a syntax error, so only the declaration goes through it; the call is appended afterwards for `new Function`.
	const wrapped = `function Example() {\n${body}\n}`;

	const result = Babel.transform(wrapped, {
		presets: [['react', { runtime: 'classic' }]],
		plugins: ['networkGuard', 'loopProtection'],
		filename: 'playground.tsx',
	});

	if (!result?.code) throw new Error('Nothing to render.');

	const run = new Function('__sandbox', `with (__sandbox) {\n${result.code}\nreturn Example();\n}`);
	return run(createSandbox(scope, React));
};

/** True when `code` has no top-level `return`; lets the editor accept a bare JSX expression
 * (the common case) without the user having to think about wrapping it themselves. */
export const ensureReturn = (code: string): string => {
	if (/\breturn\b/.test(code)) return code;
	const trimmed = code.trim();
	if (trimmed === '') return code;
	return `return (\n${code}\n);`;
};
