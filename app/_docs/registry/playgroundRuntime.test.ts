'use client';

import { evaluateBody, ensureReturn } from './playgroundRuntime';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';

describe('evaluateBody', () =>
{
	it('renders a valid function body against the given scope', () =>
	{
		const Fake = ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'fake' }, children);
		const node = evaluateBody('return (<Fake>Hello</Fake>);', { Fake });

		render(node as React.ReactElement);
		expect(screen.getByTestId('fake').textContent).toBe('Hello');
	});

	it('throws a catchable error on malformed JSX instead of crashing', () =>
	{
		expect(() => evaluateBody('return (<div>;', {})).toThrow();
	});

	it('throws a catchable error when referencing an undefined variable', () =>
	{
		expect(() => evaluateBody('return SomeUndefinedThing.doStuff();', {})).toThrow();
	});

	it('throws a catchable error when the scope is missing a referenced component', () =>
	{
		expect(() => evaluateBody('return (<NotInScope />);', {})).toThrow();
	});

	it('does not hang on an infinite while loop; loop-protect breaks it and execution continues', () =>
	{
		const start = Date.now();
		const node = evaluateBody(
			'let n = 0;\nwhile (true) { n++; }\nreturn (<div data-testid="done">{n > 0 ? "ran" : "skipped"}</div>);',
			{}
		);
		const elapsed = Date.now() - start;

		render(node as React.ReactElement);
		expect(screen.getByTestId('done').textContent).toBe('ran');
		expect(elapsed).toBeLessThan(2000);
	});

	it('does not hang on an infinite for loop', () =>
	{
		const start = Date.now();
		const node = evaluateBody(
			'for (;;) { /* spin */ }\nreturn (<div data-testid="done">ok</div>);',
			{}
		);
		const elapsed = Date.now() - start;

		render(node as React.ReactElement);
		expect(screen.getByTestId('done').textContent).toBe('ok');
		expect(elapsed).toBeLessThan(2000);
	});

	it('still completes a short, legitimate loop without cutting it off early', () =>
	{
		const node = evaluateBody(
			'let total = 0;\nfor (let i = 0; i < 5; i++) { total += i; }\nreturn (<div data-testid="sum">{total}</div>);',
			{}
		);

		render(node as React.ReactElement);
		expect(screen.getByTestId('sum').textContent).toBe('10');
	});

	it('does not expose ambient globals such as window', () =>
	{
		expect(() => evaluateBody('return (<div>{typeof window}</div>);', {})).toThrow(/not available/);
	});
});

describe('evaluateBody network guard', () =>
{
	const blocked = [
		['fetch', 'fetch("/api"); return <div />;'],
		['window.fetch', 'window.fetch("/api"); return <div />;'],
		['globalThis', 'globalThis.fetch("/api"); return <div />;'],
		['self', 'self.fetch("/api"); return <div />;'],
		['this', 'this.fetch("/api"); return <div />;'],
		['XMLHttpRequest', 'new XMLHttpRequest(); return <div />;'],
		['WebSocket', 'new WebSocket("ws://x"); return <div />;'],
		['navigator.sendBeacon', 'navigator.sendBeacon("/x"); return <div />;'],
		['eval', 'eval("fetch(1)"); return <div />;'],
		['Function', 'Function("return fetch")(); return <div />;'],
		['.constructor', 'const F = (() => {}).constructor; return <div />;'],
		['computed constructor', 'const k = "constr" + "uctor"; const F = (() => {})[k]; return <div />;'],
		['getOwnPropertyDescriptor', 'Object.getOwnPropertyDescriptor(Object, "x"); return <div />;'],
		['string timer', 'setTimeout("fetch(1)", 0); return <div />;'],
		['dynamic import', 'import("https://x.dev/a.js"); return <div />;'],
		['remote url', 'const u = "https://example.com"; return <div />;'],
		['protocol-relative url', 'const u = "//example.com/a.js"; return <div />;'],
		['css url()', 'return <div style={{ background: "url(/a.png)" }} />;'],
		['img element', 'return <img alt="" />;'],
		['iframe element', 'return <iframe />;'],
		['src attribute', 'return <Avatar src="/a.png" />;'],
		['dynamic src', 'const s = "x"; return <Avatar src={s} />;'],
	];

	it.each(blocked)('rejects %s', (_name, code) =>
	{
		expect(() => evaluateBody(code, { Avatar: () => null })).toThrow();
	});

	it('allows an inline data: src', () =>
	{
		expect(() => evaluateBody('return <Avatar src="data:image/png;base64,AAAA" />;', { Avatar: () => null })).not.toThrow();
	});

	it('still supports ordinary code: builtins, hooks-style callbacks and computed indexing', () =>
	{
		const node = evaluateBody(
			'const items = [1, 2, 3];\nconst total = items.reduce((a, b) => a + b, 0);\nconst key = "a";\nconst o = { [key]: Math.max(...items) };\nreturn (<div data-testid="ok">{total}-{o[key]}-{items[1]}-{JSON.stringify(Object.keys(o))}</div>);',
			{}
		);

		render(node as React.ReactElement);
		expect(screen.getByTestId('ok').textContent).toBe('6-3-2-["a"]');
	});

	it('does not touch the real fetch', () =>
	{
		const original = globalThis.fetch;
		const spy = vi.fn();
		globalThis.fetch = spy as never;

		try
		{
			expect(() => evaluateBody('fetch("/api"); return <div />;', {})).toThrow();
			expect(spy).not.toHaveBeenCalled();
		}
		finally
		{
			globalThis.fetch = original;
		}
	});
});

describe('ensureReturn', () =>
{
	it('leaves code with an explicit return untouched', () =>
	{
		const code = 'const x = 1;\nreturn (<div>{x}</div>);';
		expect(ensureReturn(code)).toBe(code);
	});

	it('wraps a bare JSX expression in a return statement', () =>
	{
		expect(ensureReturn('<div>Hello</div>')).toBe('return (\n<div>Hello</div>\n);');
	});

	it('leaves empty input untouched', () =>
	{
		expect(ensureReturn('')).toBe('');
	});
});
