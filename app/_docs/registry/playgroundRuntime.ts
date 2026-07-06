import * as Babel from '@babel/standalone';
import loopProtect from 'loop-protect';
import * as React from 'react';

const LOOP_TIMEOUT_MS = 150;

let loopProtectionRegistered = false;

const ensureLoopProtectionRegistered = (): void => {
	if (loopProtectionRegistered) return;
	Babel.registerPlugin('loopProtection', loopProtect(LOOP_TIMEOUT_MS));
	loopProtectionRegistered = true;
};

/**
 * Transpiles a component function body (statements ending in a `return (...)`) and evaluates it
 * against a fixed scope. No imports are needed — every name in `scope` is a free variable the
 * code can reference directly.
 *
 * Hardening against pathological or malicious input:
 * - `for`/`while`/`do` loops are rewritten (via `loop-protect`, the library JS Bin uses for the
 *   same purpose) to break out on their own after ~150ms, so a runaway or infinite loop can't
 *   freeze the tab — execution continues with whatever ran before the break.
 * - Any transpile or synchronous runtime error is thrown as a plain `Error` with a readable
 *   message; callers are expected to catch it (this function never swallows errors itself).
 * - This does NOT sandbox the code — it runs with full access to the page's `window`/`document`,
 *   the same as the user's own browser console. That's an accepted tradeoff for a code
 *   playground embedded directly in the docs site (no iframe boundary), not an oversight.
 */
export const evaluateBody = (body: string, scope: Record<string, unknown>): React.ReactNode => {
	ensureLoopProtectionRegistered();

	// Babel parses this as a standalone program, where a top-level `return` is always a syntax
	// error — so only the function declaration goes through it. The call that actually produces
	// a value is appended to the transpiled output afterwards, never re-parsed by Babel, and
	// `new Function(...)` (which treats its body like a real function body, not a full program)
	// is perfectly happy with a `return` there.
	const wrapped = `function Example() {\n${body}\n}`;

	const result = Babel.transform(wrapped, {
		presets: [['react', { runtime: 'classic' }]],
		plugins: ['loopProtection'],
		filename: 'playground.tsx',
	});

	if (!result.code) throw new Error('Nothing to render.');

	const runnable = `${result.code}\nreturn Example();`;
	const scopeEntries = Object.entries(scope);
	const run = new Function('React', ...scopeEntries.map(([key]) => key), runnable);
	return run(React, ...scopeEntries.map(([, value]) => value));
};

/** True when `code` has no top-level `return` — lets the editor accept a bare JSX expression
 * (the common case) without the user having to think about wrapping it themselves. */
export const ensureReturn = (code: string): string => {
	if (/\breturn\b/.test(code)) return code;
	const trimmed = code.trim();
	if (trimmed === '') return code;
	return `return (\n${code}\n);`;
};
